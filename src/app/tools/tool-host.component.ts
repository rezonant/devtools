import { Component, Input, ViewContainerRef } from "@angular/core";
import { Tool } from "./tool";

@Component({
    selector: 'rdt-tool-host',
    template: '',
    styles: [``],
    standalone: false
})
export class ToolHostComponent {
    constructor(private vcr : ViewContainerRef) {

    }

    private activated = false;

    /**
     * Indicate that this tool host has just become visible (for instance when its tab is selected).
     * This is important to work around the fact that before a tab becomes visible, some 
     * calculations within Angular Material (such as form field icon prefix offsets) will not 
     * be correct before the widget is within a reasonably sized container, and non-visible tabs 
     * will not have reasonably sized containers. (Bug last observed in AM19)
     * @returns 
     */
    wasActivated() {
        if (this.activated)
            return;

        this.activated = true;
        this.reload();
    }

    _tool : Tool;

    @Input()
    get tool() {
        return this._tool;
    }

    set tool(value) {
        this._tool = value;
        this.load();
    }

    reload() {
        this.unload();
        this.load();
    }

    unload() {
        this.vcr.clear();
        this._tool.component = undefined;
    }

    ngOnDestroy() {
        this.unload();
    }

    load() {
        if (this._tool.component) 
            return;

        let compRef = this.vcr.createComponent(this._tool.componentClass);

        setTimeout(() => {
            this._tool.host = this;
            this._tool.componentRef = compRef;
            this._tool.component = compRef.instance;
            this._tool.component.tool = this._tool;
            this._tool.state = this._tool.state;

            if (!this._tool.state) {
                this._tool.state = {};
                this._tool.component.state = this._tool.state;
                this._tool.component.initState();
                this._tool.state = this._tool.component.state;
            } else {
                this._tool.component.state = this._tool.state;
            }

            this._tool.component.afterToolInit();
            
            if (this._tool.markReady)
                this._tool.markReady();
        });
    }
}