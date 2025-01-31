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
import { moveItemInArray, CdkDragDrop } from '@angular/cdk/drag-drop';

export interface RemoteTool {
    tool : Tool;
    session : Session;
}

@Component({
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    standalone: false
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

    reloading = false;

    reload() {
        this.reloading = true;
        setTimeout(() => this.reloading = false, 1);
    }

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

    updateRemoteTools() {
        this.remoteTools = [].concat(
            ...this.sessionService.allSessions
                .map(s => (s.state?.tools || [])
                    .map(t => (<RemoteTool>{ tool: t, session: s }))
                )
        );
    }

    async ngAfterViewInit() {
        this.subs = new Subscription();

        let loading = false;

        this.sessionService.remoteSessionStateChanged.subscribe(async session => {
            this.updateRemoteTools();
        });

        this.updateRemoteTools();

        this.sessionService.currentSessionStateChanged.subscribe(async session => {
            loading = true;
            try {
                this.tools = session?.state?.tools || [];
                await Promise.all(this.tools.map(x => x.ready));
            } finally {
                loading = false;
            }

            if (session.state.activeToolId) {
                let tool = this.tools.find(x => x.id === session.state.activeToolId);
                if (tool) {
                    this.switchToTool(tool);
                } else {
                    console.log(`Cannot switch to tool '${session.state.activeToolId}': No tool with that ID`);
                    console.dir(this.tools);
                }
            }
        });

        let tabSwitchTimeout;
        this.tabs.selectedTabChange.subscribe(ev => {

            // A timeout is needed here because it seems there is a bug, or at least a quirk,
            // in this event. 
            // Setting `selectedIndex = 1` yields two events:
            // 1. selectedTabChange(ev.index === 0)
            // 2. selectedTabChange(ev.index === 1)
            //
            // This will cause an infinite loop, as this event will cause the state to be saved,
            // and then selectedIndex will be set to a different value, which will cause this event,
            // etc etc
            
            clearTimeout(tabSwitchTimeout);
            tabSwitchTimeout = setTimeout(() => {
                if (loading)
                    return;
                
                let oldTool = this.activeTool || this.tools[0];
                let newTool = this.tools[ev.index];

                if (oldTool?.component)
                    oldTool.component.visibilityChanged.next(false);
                if (newTool?.component)
                    newTool.component.visibilityChanged.next(true);
                this.activeTool = newTool;

                if (this.sessionService.currentSession.state.activeToolId !== this.activeTool?.id) {
                    console.log(`Updating active tool in state from ${this.sessionService.currentSession.state.activeToolId} to ${this.activeTool?.id}...`);
                    this.sessionService.currentSession.state.activeToolId = this.activeTool?.id;
                    this.sessionService.saveState();
                }
            })
        });

        await this.sessionService.init();

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
        this.selectedTabIndex = this.tools.indexOf(tool);
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

    newSession() {
        
    }

    manageSessions() {
        this.matDialog.open(ManageSessionsComponent);
    }

    manageSession(session : Session) {
        this.matDialog.open(ManageSessionComponent, {
            data: { session }
        });
    }

    selectedTabIndex: number = 0;

    dropTab(event: CdkDragDrop<string[]>) {
        const prevActive = this.tools[this.selectedTabIndex];
        moveItemInArray(this.tools, event.previousIndex, event.currentIndex);
        this.selectedTabIndex = this.tools.indexOf(prevActive);

        this.sessionService.saveSessionState(this.session);
    }

    remoteTools : RemoteTool[];
}