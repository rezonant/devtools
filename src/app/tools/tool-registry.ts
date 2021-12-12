import { Type } from "@angular/core";
import { ToolComponent } from "./tool-component";

export class ToolRegistry {
    constructor(readonly tools : Type<ToolComponent>[]) {
    }
}
