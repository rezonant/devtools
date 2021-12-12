import { ComponentRef, Type } from "@angular/core";
import { ToolComponent } from ".";

export interface Tool<T extends ToolComponent = ToolComponent> {
    id? : string;
    toolId : string;
    componentClass : Type<T>;
    componentRef? : ComponentRef<T>;
    component? : T;
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
