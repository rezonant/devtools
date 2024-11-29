import { Component } from "@angular/core";
import { ToolComponent } from "./tool-component";

@Component({
    template: `Test Tool 1 [{{testId}}]`,
    styles: [''],
    standalone: false
})
export class TestTool1Component extends ToolComponent {
    testId = Math.floor(Math.random() * 10000);
    override label = 'Test Tool 1';
    static override label = 'Test Tool 1';
    static override id = 'test-tool-1';
}