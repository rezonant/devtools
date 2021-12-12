import { Component, Input, ViewContainerRef } from "@angular/core";
import { Tool } from "./tool";

@Component({
    selector: 'rdt-tool-host',
    template: '',
    styles: [``]
})
export class ToolHostComponent {
    constructor(private vcr : ViewContainerRef) {

    }

    _tool : Tool;

    @Input()
    get tool() {
        return this._tool;
    }

    set tool(value) {
        this._tool = value;
        if (this._tool.component)
            return;

        let compRef = this.vcr.createComponent(this._tool.componentClass);

        setTimeout(() => {
            this._tool.componentRef = compRef;
            this._tool.component = compRef.instance;
            this._tool.component.tool = this._tool;
            this._tool.state = this._tool.state || {};
            this._tool.component.state = this._tool.state;

            if (this._tool.markReady)
                this._tool.markReady();

            this._tool.component.afterToolInit();
        });
    }
}