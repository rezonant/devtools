import { ComponentRef, Type } from "@angular/core";
import { ToolComponent } from ".";

export interface Tool<T extends ToolComponent = ToolComponent> {
    id? : string;
    toolId : string;
    componentClass : Type<T>;
    componentRef? : ComponentRef<T>;
    component? : T;
    ready : Promise<void>;
    markReady : () => void;
    state? : any;
}
