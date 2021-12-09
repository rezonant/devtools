import { Component, Type, ViewChild, ViewContainerRef } from "@angular/core";
import { MatMenu, MatMenuTrigger } from "@angular/material/menu";
import { MatTabGroup } from "@angular/material/tabs";
import { Tool, ToolComponent, ToolRegistry } from "../tools";
import { Base64Component } from "../tools/base64.component";
import { TestTool1Component } from "../tools/test-tool-1.component";
import { v4 as uuid } from 'uuid';

export interface SavedToolState {
    activeToolId : string;
    tools: Tool[]
}

@Component({
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
    constructor(
        private viewContainerRef : ViewContainerRef,
        public toolRegistry : ToolRegistry
    ) {
    }

    @ViewChild('tabMenu')
    tabMenu : MatMenu;

    @ViewChild('tabMenuTrigger')
    tabMenuTrigger : MatMenuTrigger;

    contextMenuPosition : { x : string, y : string } = { x: '0px', y: '0px' };

    tools : Tool[] = [];

    contextMenuTool : Tool;

    @ViewChild('tabs')
    tabs : MatTabGroup;

    activeTool : Tool;

    ngAfterViewInit() {
        this.tabs.selectedTabChange.subscribe(ev => {
            let oldTool = this.activeTool || this.tools[0];
            let newTool = this.tools[ev.index];

            if (oldTool)
                oldTool.component.visibilityChanged.next(false);
            if (newTool)
                newTool.component.visibilityChanged.next(true);
            this.activeTool = newTool;
            this.saveTools();
            console.log(`Active tool: ${this.activeTool.component.label}`);
        });

        this.loadTools();
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

    removeTool(tool : Tool) {
        this.tools = this.tools.filter(x => x !== tool);
        this.saveTools();
    }

    addTestTool1() {
        this.addAndSwitchToTool(TestTool1Component);
    }

    async addAndSwitchToTool(toolClass : Type<ToolComponent>) {
        let tool = await this.addTool(toolClass);
        await this.switchToTool(tool);
    }

    async switchToTool(tool : Tool) {
        if (!this.tools.includes(tool))
            return;
        this.tabs.selectedIndex = this.tools.indexOf(tool);
    }

    async loadTools() {
        console.log(`Checking for saved tools...`);
        let savedToolsStr : string = localStorage['rdt:tools:v2'];
        if (savedToolsStr) {
            let toolState : SavedToolState = JSON.parse(savedToolsStr);
            let savedTools = toolState.tools;

            console.log(`Found saved tools. Loading...`);
            savedTools = savedTools.filter(x => x);
            savedTools.forEach(tool => {
                tool.componentClass = this.toolRegistry.tools.find(x => x['id'] === tool.toolId)
                let markReady : () => void;
                let ready = new Promise<void>((resolve) => markReady = resolve);
                tool.ready = ready;
                tool.markReady = markReady;
            });

            console.log(savedTools);
            setTimeout(() => this.tools = savedTools);

            await Promise.all(savedTools.map(x => x.ready));
            this.tools.forEach(t => this.subscribeToTool(t));

            console.log(`All saved tools loaded`);

            if (toolState.activeToolId) {
                let tool = this.tools.find(x => x.id === toolState.activeToolId);
                if (tool) {
                    console.log(`Switching to tool '${toolState.activeToolId}'`);
                    this.switchToTool(tool);
                } else {
                    console.log(`Cannot switch to tool '${toolState.activeToolId}': No tool with that ID`);
                    console.dir(this.tools);
                }
            }

        } else {
            console.log(`No saved tools found.`);
        }
    }

    saveTools() {
        console.log(`Saving tools...`);
        localStorage['rdt:tools:v2'] = JSON.stringify(<SavedToolState>{
            activeToolId: this.activeTool?.id,
            tools: this.tools.map(x => {
                let y = Object.assign({}, x);
                y.componentRef = null;
                y.component = null;
                y.componentClass = null;
                return y;
            })
        });
    }

    async subscribeToTool(tool : Tool) {
        tool.component.stateModified.subscribe(() => {
            this.saveTools();
        });
    }

    async addTool(toolClass : Type<ToolComponent>) {
        let markReady : () => void;
        let ready = new Promise<void>((resolve) => markReady = resolve);
        let tool : Tool = { id: uuid(), toolId: toolClass['id'], componentClass: toolClass, ready, markReady };
        this.tools.push(tool);

        this.subscribeToTool(tool);

        await ready;

        this.saveTools();

        return tool;
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
        }

        this._createdTool = value;
    }

    get filteredTools() {
        if (!this._createdTool)
            return this.toolRegistry.tools;
        
        console.log(`filter: ${this._createdTool}`);
        return this.toolRegistry.tools.filter(x => x['label'].toLowerCase().includes(this._createdTool));
    }
}