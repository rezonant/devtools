import { Component } from "@angular/core";
import { ToolRegistry } from "../tools";

@Component({
    template: `
        <header>
            <h1>All your dev tooling in one spot</h1>
            <div>
                <code>&#64;rezonant/devtools</code> is the hacker's companion. 
                <a href="https://github.com/rezonant/devtools" target="_blank">Open source</a>. 
                Featuring <span class="count">{{count}}</span> tools!
            </div>
        </header>
    `,
    styles: [
        `
                 header {
                     margin-top: 5em;
                     height: 10em;
                     display: flex;
                     flex-direction: column;
                     align-items: center;
                     justify-content: center;
         
                     h1 {
                         font-size: 40px;
                         font-weight: 100;
                     }
                 }
         
                 .count {
                     font-size: 135%;
                     font-weight: bold;
                     color: #00ffb7;
                     position: relative;
                     top: 2px;
                 }
                 `
    ]
})
export class AboutComponent {
    constructor(private toolRegistry : ToolRegistry) {

    }

    get count() {
        return this.toolRegistry.tools.length;
    }
}