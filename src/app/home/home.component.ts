import { Component, ElementRef, Type, ViewChild, ViewContainerRef } from "@angular/core";
import { MatMenu, MatMenuTrigger } from "@angular/material/menu";
import { MatTabGroup } from "@angular/material/tabs";
import { SessionState, Tool, ToolComponent, ToolRegistry } from "../tools";
import { TestTool1Component } from "../tools/test-tool-1.component";
import { v4 as uuid } from 'uuid';
import { Session, SessionService } from "../session-service";
import { MatDialog } from "@angular/material/dialog";
import { ManageSessionsComponent } from "../manage-sessions/manage-sessions.component";
import { ManageSessionComponent } from "../manage-session/manage-session.component";
import { Subscription } from "rxjs";
import { ToolLabelPipe } from "../tools/tool-label.pipe";
import { SessionLabelPipe } from "../session-label.pipe";

export interface RemoteTool {
    tool : Tool;
    session : Session;
}

@Component({
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
    constructor(
        private viewContainerRef : ViewContainerRef,
        public toolRegistry : ToolRegistry,
        private elementRef : ElementRef<HTMLElement>,
        private sessionService : SessionService,
        private matDialog : MatDialog
    ) {
    }

    toolLabeller = new ToolLabelPipe(this.toolRegistry);
    sessionLabeller = new SessionLabelPipe(this.sessionService);

    @ViewChild('tabMenu')
    tabMenu : MatMenu;

    @ViewChild('tabMenuTrigger')
    tabMenuTrigger : MatMenuTrigger;

    contextMenuPosition : { x : string, y : string } = { x: '0px', y: '0px' };

    tools : Tool[] = [];

    contextMenuTool : Tool;

    @ViewChild('tabs')
    tabs : MatTabGroup;


    get session() {
        return this.sessionService.currentSession;
    }

    get sessions() {
        return this.sessionService.activeSessions;
    }

    get currentSessionLabel() {
        return this.sessionService.currentSession?.state?.label;
    }

    private subs : Subscription;
    activeTool : Tool;

    async ngAfterViewInit() {
        this.subs = new Subscription();

        let loading = false;

        this.sessionService.remoteSessionStateChanged.subscribe(async session => {
            this.remoteTools = [].concat(
                ...this.sessionService.allSessions
                    .map(s => (s.state?.tools || [])
                        .map(t => (<RemoteTool>{ tool: t, session: s }))
                    )
            );
        });

        this.sessionService.currentSessionStateChanged.subscribe(async session => {
            loading = true;
            try {
                this.tools = session?.state?.tools || [];
                await Promise.all(this.tools.map(x => x.ready));
            } finally {
                loading = false;
            }
            
            console.log(`[HOME] Loaded ${this.tools.length} tools`);

            if (session.state.activeToolId) {
                let tool = this.tools.find(x => x.id === session.state.activeToolId);
                if (tool) {
                    console.log(`Switching to tool '${session.state.activeToolId}'`);
                    this.switchToTool(tool);
                } else {
                    console.log(`Cannot switch to tool '${session.state.activeToolId}': No tool with that ID`);
                    console.dir(this.tools);
                }
            }
        });

        this.tabs.selectedTabChange.subscribe(ev => {
            if (loading)
                return;
            
            let oldTool = this.activeTool || this.tools[0];
            let newTool = this.tools[ev.index];

            if (oldTool?.component)
                oldTool.component.visibilityChanged.next(false);
            if (newTool?.component)
                newTool.component.visibilityChanged.next(true);
            this.activeTool = newTool;
            this.sessionService.currentSession.state.activeToolId = this.activeTool?.id;
            this.sessionService.saveState();
        });

        await this.sessionService.init();
        await this.loadTools();

        // let el = this.elementRef.nativeElement;
        // el.querySelector('mat-tab-group#main-tabs .mat-tab-labels').appendChild(el.querySelector('header#nav'));

        //this.manageSessions();
    }

    ngOnDestroy() {
        this.subs.unsubscribe();
    }

    handleRightClick(event : MouseEvent) {
        let element = <HTMLElement> event.target;
        let selector = `mat-tab-header .mat-tab-label`;

        if (!element.matches(`${selector}, ${selector} *`)) {
            return;
        }

        this.contextMenuPosition.x = event.clientX + 'px';
        this.contextMenuPosition.y = event.clientY + 'px';

        event.stopPropagation();
        event.preventDefault();

        this.tabMenuTrigger.openMenu();
        let labelElement = element.closest(selector);
        let index = Array.from(labelElement.parentElement.children).indexOf(labelElement);
        this.contextMenuTool = this.tools[index];
    }

    renameTool(tool : Tool) {
        let newName = prompt(`New name for tool?`, tool.label || tool.component?.label);
        if (newName) {
            this.sessionService.setToolLabel(tool, newName);
        }
    }

    removeTool(tool : Tool) {
        this.sessionService.removeTool(tool);
    }

    addTestTool1() {
        this.addAndSwitchToTool(TestTool1Component);
    }

    async addAndSwitchToTool(toolClass : string | Type<ToolComponent>, label? : string, state? : any) {
        let tool = await this.sessionService.addTool(toolClass, label, state);
        await this.switchToTool(tool);
    }

    async switchToTool(tool : Tool) {
        if (!this.tools.includes(tool))
            return;
        this.tabs.selectedIndex = this.tools.indexOf(tool);
    }

    async loadTools() {
        this.sessionService.loadState();
    }

    getToolLabel(tool: Tool): string {
        if (!tool)
            return '';
        return tool['label'];
    }

    private _createdTool;
    get createdTool() {
        return this._createdTool;
    }

    set createdTool(value) {
        if (typeof value === 'function') {
            this.addAndSwitchToTool(value);
            
            setTimeout(() => this._createdTool = '');
            return;
        } else if (typeof value === 'object') {
            let tool : Tool = value;
            this.addAndSwitchToTool(tool.toolId, tool.label, tool.state);
        }

        this._createdTool = value;
    }

    get filteredRemoteTools() {
        if (!this._createdTool)
            return this.remoteTools;
        return this.remoteTools
            .filter(x => 
                this.toolLabeller.transform(x.tool).toLowerCase().includes(this._createdTool)
                || this.sessionLabeller.transform(x.session).toLowerCase().includes(this._createdTool)
            );
    }

    get filteredTools() {
        if (!this._createdTool)
            return this.toolRegistry.tools;
        
        return this.toolRegistry.tools.filter(x => x['label'].toLowerCase().includes(this._createdTool));
    }

    renameSession() {
        let newLabel = prompt(`New label for session:`, this.sessionService.currentSession.state?.label);
        if (newLabel)
            this.sessionService.setSessionLabel(this.sessionService.currentSession, newLabel);
    }

    manageSessions() {
        this.matDialog.open(ManageSessionsComponent);
    }

    manageSession(session : Session) {
        this.matDialog.open(ManageSessionComponent, {
            data: { session }
        });
    }

    closeSession(session : Session) {
        this.sessionService.closeSession(session.id);
    }

    remoteTools : RemoteTool[];
}