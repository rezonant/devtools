import { Type } from "@angular/core";
import { ToolComponent } from "./tool-component";

export class ToolRegistry {
    constructor(tools : Type<ToolComponent>[]) {
        this._tools = tools.sort((a, b) => (a['label'] as string).localeCompare(b['label']));
    }

    private _tools : Type<ToolComponent>[];
    get tools() {
        return this._tools;
    }
}
