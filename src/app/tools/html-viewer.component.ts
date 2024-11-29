import { Component } from "@angular/core";
import { ToolComponent } from "./tool-component";

export interface HtmlViewerState {
    html : string;
}

@Component({
    template: `
        <ngx-monaco-editor
            [options]="monacoOptions"
            [(ngModel)]="code" 
            />
        
        @if (errorMessage) {
          <div class="error">
            {{errorMessage}}
          </div>
        }
        @if (!errorMessage) {
          @if (doc?.firstChild) {
            <rdt-html-view
                [node]="doc.firstChild" 
                />
          }
        }
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
    `],
    standalone: false
})
export class HtmlViewerComponent extends ToolComponent<HtmlViewerState> {
    override label = 'HTML Viewer';
    static override label = 'HTML Viewer';
    static override id = 'html-viewer';

    override afterToolInit() {
        this.parse();
    }

    monacoOptions = {
        theme: 'vs-dark', 
        language: 'html', 
        automaticLayout: true
    };

    get code() {
        return this.state?.html;
    }

    set code(value) {
        this.state.html = value;
        setTimeout(() => this.parse())
    }

    parse() {
        try {
            let parser = new DOMParser();

            this.doc = parser.parseFromString(this.state.html, 'text/html');
            this.errorMessage = null;
        } catch (e) {
            this.doc = null;
            this.errorMessage = e.message;
        } finally {
            this.saveState();
        }
    }

    doc : Document;
    errorMessage : string;
}