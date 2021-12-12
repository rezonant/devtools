import { Pipe } from "@angular/core";
import { ToolRegistry } from "./tool-registry";
import { Tool } from "./tool";

@Pipe({
    name: 'toolLabel',
    pure: false
})
export class ToolLabelPipe {
    constructor(
        private toolRegistry : ToolRegistry
    ) {
    }

    transform(tool : Tool) {
        let toolClass = this.toolRegistry.tools.find(x => x['id'] === tool.toolId);
        return tool.label || tool.component?.label || toolClass['label'];
    }
}