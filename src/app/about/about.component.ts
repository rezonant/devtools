import { Component } from "@angular/core";

@Component({
    template: `
        <header>
            <h1>All your dev tooling in one spot</h1>
            <div>
                <code>@rezonant/devtools</code> is the hacker's companion. 
                <a href="https://github.com/rezonant/devtools">Open source</a>. 
            </div>
        </header>
    `,
    styles: [
        `
        header {
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
        `
    ]
})
export class AboutComponent {

}