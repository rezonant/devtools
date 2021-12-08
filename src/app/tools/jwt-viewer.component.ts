import { Component } from "@angular/core";
import { ToolComponent } from "./tool-component";

@Component({
    template: `
        
    `,
    styles: ['']
})
export class JwtViewerComponent extends ToolComponent {
    override label = 'JWT Viewer';
    static override label = 'JWT Viewer';
    static override id = 'jwt-viewer';
}