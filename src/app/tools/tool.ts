import { ComponentRef, Type } from "@angular/core";
import { ToolComponent, ToolHostComponent } from ".";
import { MatTab } from "@angular/material/tabs";

export interface Tool<T extends ToolComponent = ToolComponent> {
    id? : string;
    toolId : string;
    componentClass : Type<T>;
    componentRef? : ComponentRef<T>;
    component? : T;
    tab?: MatTab;
    host?: ToolHostComponent;
    label? : string;
    ready : Promise<void>;
    markReady : () => void;
    state? : any;
}

export interface SessionState {
    activeToolId : string;
    label? : string;
    tools: Tool[];
    createdAt? : number;
    updatedAt? : number;
}
