import { Subject } from "rxjs";
import { Tool } from "./tool";

export abstract class ToolComponent<ToolStateT = any> {
    label = 'Unnamed Tool';
    static label = 'Unnamed Tool';
    static id = 'unnamed';
    visibilityChanged = new Subject<boolean>();
    tool : Tool;
    state : ToolStateT;
}