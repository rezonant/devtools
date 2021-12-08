import { Component } from "@angular/core";
import { ToolComponent } from "./tool-component";

@Component({
    template: `
        <ngx-monaco-editor 
            [options]="monacoOptions" 
            [(ngModel)]="code"></ngx-monaco-editor>
        
        <ng-container *ngIf="errorMessage">
            <div class="error">
                {{errorMessage}}
            </div>
        </ng-container>
        <ng-container *ngIf="!errorMessage">
            <rdt-html-view 
                *ngIf="doc?.firstChild" 
                [node]="doc.firstChild"></rdt-html-view>
        </ng-container>
    `,
    styles: [`
        :host {
            display: flex;
            flex-direction: column;
        }

        .splitter {
            display: flex;
            gap: 1em;
            flex-grow: 1;

            & > div {
                flex-grow: 1;
                width: 100%;
                display: flex;
                flex-direction: column;
                mat-form-field {
                    width: 100%;
                    flex-grow: 1;
                    textarea {
                        height: 100%;
                    }
                }
            }
        }
    `]
})
export class HtmlViewerComponent extends ToolComponent {
    override label = 'HTML Viewer';
    static override label = 'HTML Viewer';
    static override id = 'html-viewer';

    monacoOptions = {
        theme: 'vs-dark', 
        language: 'html', 
        automaticLayout: true
    };

    _code : string;
    get code() {
        return this._code;
    }

    set code(value) {
        this._code = value;
        setTimeout(() => {
            try {
                let parser = new DOMParser();

                this.doc = parser.parseFromString(this._code, 'text/html');
                this.errorMessage = null;
            } catch (e) {
                this.doc = null;
                this.errorMessage = e.message;
            }
        })
    }

    doc : Document;
    errorMessage : string;
}