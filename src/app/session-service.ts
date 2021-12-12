import { Injectable, NgZone, Type } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { v4 as uuid } from 'uuid';
import { SessionState, Tool, ToolComponent, ToolRegistry } from "./tools";

export interface TabIdentity {
    id : string;
}

export interface Session extends TabIdentity {
    state? : SessionState;
    active? : boolean;
}

export interface Message {
    type : string;
}

export interface Broadcast {
    type : string;
}

export interface CloseBroadcast {
    type : 'close';
    sessionId : string;
}

export interface StateBroadcast {
    type : 'state';
    state : SessionState;
}

export interface BroadcastMessage<T extends Broadcast = Broadcast> {
    type : 'broadcast';
    sender : TabIdentity;
    broadcast : T;
}

export interface RequestMessage<T> {
    type : 'request';
    request : T;
    sender : TabIdentity;
}

export interface ResponseMessage<T> {
    type : 'response';
    requestId : string;
    sender : TabIdentity;
    response : T;
}

export interface Request {
    type : string;
}

export interface DiscoverRequest extends Request {
    type : 'discover';
}

export interface Announcement {
    type : 'announce';
}

export interface OpenTab {
    id : string;
    tools : Tool[];
}

@Injectable()
export class SessionService {
    constructor(
        private ngZone : NgZone,
        private toolRegistry : ToolRegistry
    ) {
        window.addEventListener('beforeunload', () => {
            this.sendBroadcast({
                type: 'closed'
            });
        });

        window.addEventListener('storage', () => this.refreshSavedSessions());
        this.refreshSavedSessions();
    }

    currentSession : Session;
    channel : BroadcastChannel;
    peerMap = new Map<string, Session>();
    identity : TabIdentity;
    
    get currentState() {
        return this.currentSession?.state;
    }

    get currentTools() {
        return this.currentState?.tools;
    }

    get currentSessionId() {
        return this.identity?.id;
    }

    private _currentSessionStateChanged = new Subject<Session>();
    private _remoteSessionStateChanged = new Subject<Session>();

    get currentSessionStateChanged() {
        return <Observable<Session>>this._currentSessionStateChanged;
    }

    get remoteSessionStateChanged() {
        return <Observable<Session>>this._remoteSessionStateChanged;
    }

    loadSessionState(id : string): SessionState {
        if (!id)
            return undefined;
        
        try {
            let data = window.localStorage[`${this.storagePrefix}:${id}`];
            if (!data)
                return undefined;
            return JSON.parse(data);
        } catch (e) {
            console.log(`Failed to parse session ${id}: ${e.message}`);

            throw e;
        }
    }

    get storagePrefix() {
        return `rdt:tools:v2`;
    }

    saveSessionState(session : Session) {
        session.state.createdAt ||= Date.now();
        session.state.updatedAt = Date.now();

        window.localStorage[`${this.storagePrefix}:${session.id}`] 
            = JSON.stringify(this.prepareStateForSerialization(session.state));

        this.refreshSavedSessions();
        this.sendSessionState(session);
    }

    private sendSessionState(session : Session) {
        this.sendBroadcast(<StateBroadcast>{
            type: 'state',
            state: this.prepareStateForSerialization(session.state)
        }, { id: session.id });
    }

    get allSessions() {
        let map = new Map<string, Session>();
        this.savedSessions.forEach(s => map.set(s.id, s));
        this.activeSessions.forEach(s => map.set(s.id, s));
        let sessions = Array.from(map.values());
        //console.log(`allSessions(): found ${sessions.length} sessions, ${this.savedSessions.length} saved, ${this.peerSessions.length} active`);
        return sessions;
    }

    refreshSavedSessions() {
        let prefix = /^rdt:tools:v2:/;
        this.savedSessionIds = Object.keys(window.localStorage)
            .filter(x => prefix.test(x))
            .map(x => x.replace(prefix, ''))
        ;
        this.savedSessions = this.savedSessionIds.map(id => (<Session>{
            id,
            state: this.loadSessionState(id),
            active: false
        })).filter(x => x);
    }

    savedSessionIds : string[];
    savedSessions : Session[];

    get activeSessions() {
        return Array.from(this.peerMap.values());
    }

    get inactiveSessions() {
        let active = this.activeSessions;
        let current = this.currentSession;
        return this.savedSessions.filter(x => x.id !== current?.id && !active.some(y => y.id === x.id));
    }

    prepareStateForSerialization(state : SessionState): SessionState {
        return {
            activeToolId: state.activeToolId,
            label: state.label,
            createdAt: state.createdAt,
            updatedAt: state.updatedAt,
            tools: state.tools.map(t => (<any>{
                toolId: t.toolId,
                id: t.id,
                label: t.label || t.component?.label || (t.componentClass as any)?.label,
                state: t.state
            }))
        }
    }

    sendState() {
        this.sendSessionState(this.currentSession);
    }

    discover() {
        this.sendBroadcast({
            type: 'discover'
        });
    }

    sendBroadcast(broadcast : Broadcast, identity? : TabIdentity) {
        this.channel.postMessage(JSON.parse(JSON.stringify(<BroadcastMessage>{
            type: 'broadcast',
            sender: identity || this.identity,
            broadcast
        })));
    }

    generateSessionId() {
        let id = uuid();
        return id.split('-')[0];
    }

    closeSession(id : string) {
        this.sendBroadcast(<CloseBroadcast>{
            type: 'close',
            sessionId: id
        })
    }

    async init() {
        if (this.channel)
            return;
        
        this.channel = new BroadcastChannel('sessionCoordinator');
        this.channel.onmessage = ev => {
            this.ngZone.run(() => this.handleMessage(ev.data));
        };

        this.discover();

        await this.delay(1000);
    
        let id = window.location.hash.substr(1);
        if (id) {
            if (this.peerMap.has(id)) {
                // This tab is already open elsewhere, so choose a new ID
                console.log(`This session [${id}] is opened in another tab. Starting a new session...`);
                id = this.generateSessionId();
                window.location.hash = id;
            }
        } else {
            id = this.generateSessionId();
            window.location.hash = id;
        }

        this.identity = { id };
        await this.loadState();
        this.sendState();
    }

    private delay(time : number) {
        return new Promise<void>(resolve => setTimeout(() => resolve(), time));
    }

    private handleMessage(message : Message) {
        if (message.type === 'broadcast') {
            let eventMessage = (message as BroadcastMessage);
            this.handleBroadcast(eventMessage.broadcast, eventMessage.sender);
            return;
        }
    }

    private handleBroadcast(event : Broadcast, sender : TabIdentity) {
        let peer : Session;
        let foundPeer = false;

        console.log(`Received broadcast:`, event);

        if (sender && sender.id !== this.currentSessionId) {
            if (!this.peerMap.has(sender.id)) {
                console.log(`[SessionService] Found peer ${sender.id}`);
                this.peerMap.set(sender.id, peer = sender);
                peer.active = true;
                foundPeer = true;
            } else {
                peer = this.peerMap.get(sender.id);
            }
        }

        if (event.type === 'state') {
            if (this.currentSessionId && sender?.id === this.currentSessionId) {
                let state = (event as StateBroadcast).state;

                console.log(`[SessionService] Local state (${sender.id}) is being updated by remote:`, state);

                let currentState = this.currentSession.state;
                if (!currentState) {
                    console.error(`Cannot update my own state! No state present!`);
                    return;
                }

                currentState.label = state.label;
                currentState.updatedAt = Date.now();
            
                let index = -1;
                for (let tool of state.tools) {
                    index += 1;
                    let existingTool = currentState.tools.find(x => x.id === tool.id);
                    if (!existingTool) {
                        currentState.tools.splice(index, 0, tool);
                    } else {
                        existingTool.state = tool.state;
                    }
                }

                this._currentSessionStateChanged.next(this.currentSession);
            } else if (peer && sender) {
                peer.state = (event as StateBroadcast).state;
                console.log(`[SessionService] Received new state for peer ${peer.id}`, peer.state);
                this._remoteSessionStateChanged.next(peer);
            }
        } else if (event.type === 'discover') {
            console.log(`[SessionService] A peer is discovering. Sending state...`);
            this.sendState();
        } else if (event.type === 'closed') {
            if (peer) {
                this.peerMap.delete(peer.id);
                peer = null;
            }
        } else if (event.type === 'close') {
            let closeBroadcast = event as CloseBroadcast;
            if (closeBroadcast.sessionId === this.currentSessionId) {
                console.log(`Closing session...`);
                window.close();
            }
        }

        if (foundPeer) {
            console.log(`Found peer: `, peer);
        } 

        if (peer)
            this.peerMap.set(peer.id, peer);
    }

    getLabelForTool(tool : Tool) {
        return tool.label 
            || tool.component?.label 
            || (tool.componentClass as any)?.label
            || (this.toolRegistry.tools.find(x => x['id'] === tool.toolId) as any)?.label
        ;
    }

    private isActiveTool(activeId : string, tool : Tool) {
        return tool.id === activeId ? 1 : 0;
    }
    
    private remoteToolLabel(tool : Tool) {
        let toolClass = this.toolRegistry.tools.find(x => x['id'] === tool.toolId);
        return tool.label || (toolClass as any)?.label;
    }

    getLabelForSession(session : Session) {
        if (session.state) {
            let count = session.state.tools.length;
            let toolsStr = `tool${count === 1 ? '' : 's'}`;
            if (session.state.label)
                return `${session.state.label} [${count} ${toolsStr}]`;
            let activeId = session.state.activeToolId;
            let toolSummary = session.state.tools
                .sort((a, b) => this.isActiveTool(activeId, a) - this.isActiveTool(activeId, b))
                .slice(0, 3)
                .map(x => this.remoteToolLabel(x)).join(', ')
            ;

            if (session.state.tools.length > 0)
                return `Unnamed [${count} ${toolsStr}, ${toolSummary}, ${session.id}]`;
            else
                return `Unnamed [${count} ${toolsStr}, ${session.id}]`;
        }

        return `Unknown [${session.id}]`;
    }

    deleteSavedSession(session : Session) {
        this.deleteSavedSessionById(session.id);
    }

    deleteSavedSessionById(sessionId : string) {
        console.log(`Deleting saved session ${sessionId}`);
        delete localStorage[`${this.storagePrefix}:${sessionId}`];
        this.refreshSavedSessions();
    }

    setSessionLabel(session : Session, label : string) {
        session.state.label = label;
        session.state.updatedAt = Date.now();
        this.saveSessionState(session);
    }

    async addTool(toolClass : string | Type<ToolComponent>, label? : string, state? : any) {
        if (typeof toolClass === 'string')
            toolClass = this.toolRegistry.tools.find(x => x['id'] === toolClass);

        let markReady : () => void;
        let ready = new Promise<void>((resolve) => markReady = resolve);
        let tool : Tool = { 
            id: uuid(), 
            toolId: toolClass['id'], 
            componentClass: toolClass, 
            ready, 
            markReady,
            label,
            state
        };
        this.currentSession.state.tools.push(tool);

        await ready;

        this.subscribeToTool(tool);
        this.saveState();

        this._currentSessionStateChanged.next(this.currentSession);

        return tool;
    }

    async subscribeToTool(tool : Tool) {
        tool.component.stateModified.subscribe(() => {
            this.saveState();
        });
    }

    saveState() {
        this.saveSessionState(this.currentSession);
        this._currentSessionStateChanged.next(this.currentSession);
    }

    async loadState() {
        let sessionId = this.currentSessionId;
        let state = this.loadSessionState(sessionId) || <SessionState>{ activeToolId: null };
        state.tools = (state.tools || []).filter(x => x);

        this.currentSession = {
            id: sessionId,
            active: true,
            state: state || <SessionState>{ tools: [] }
        };

        this.currentState.tools ||= [];

        console.log(`Found saved tools. Loading...`);

        this.currentTools.forEach(tool => {
            tool.componentClass = this.toolRegistry.tools.find(x => x['id'] === tool.toolId)
            let markReady : () => void;
            let ready = new Promise<void>((resolve) => markReady = resolve);
            tool.ready = ready;
            tool.markReady = markReady;
        });

        this._currentSessionStateChanged.next(this.currentSession);
        await Promise.all(this.currentTools.map(x => x.ready));
        this.currentSession.state.tools.forEach(t => this.subscribeToTool(t));
        this._currentSessionStateChanged.next(this.currentSession);
        this.sendState();
    }
    
    removeTool(tool : Tool) {
        let session = this.currentSession;
        session.state.tools = session.state.tools.filter(x => x !== tool);
        this.saveState();
    }

    setToolLabel(tool : Tool, label : string) {
        tool.label = label;
        this.saveState();
    }

    removeToolFromSession(session : Session, tool : Tool) {
        let state = session.state;
        state.tools = state.tools.filter(x => x.id !== tool.id);
        this.saveSessionState(session);
    }
}