import { Subject } from "rxjs";
import { Tool } from "./tool";

export abstract class ToolComponent<ToolStateT = any> {
    label = 'Unnamed Tool';
    static label = 'Unnamed Tool';
    static id = 'unnamed';
    visibilityChanged = new Subject<boolean>();
    stateModified = new Subject<ToolStateT>();
    
    tool : Tool;
    state : ToolStateT;

    saveState() {
        this.stateModified.next(this.state);
    }

    afterToolInit() {
    }

    initState() {
    }
}