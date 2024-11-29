import { Component, ViewChild } from "@angular/core";
import { EditorComponent } from "@astronautlabs/monaco";
import { ToolComponent } from "./tool-component";

export interface JsonViewerState {
    json : string;
    object : string;
    errorMessage : string;
}

@Component({
    template: `
        <ngx-monaco-editor
            #monaco
            [options]="monacoOptions"
            [(ngModel)]="code"
            />
        
        @if (state?.errorMessage) {
            <div class="error">
                {{state.errorMessage}}
            </div>
        }
        @if (!state?.errorMessage) {
            <rdt-json-view 
                [object]="state?.object"
                />
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
    `]
})
export class JsonViewerComponent extends ToolComponent<JsonViewerState> {
    override label = 'JSON Viewer';
    static override label = 'JSON Viewer';
    static override id = 'json-viewer';

    monacoOptions = {
        theme: 'vs-dark', 
        language: 'json',
        automaticLayout: true
    };

    @ViewChild('monaco') monaco : EditorComponent;

    ngAfterViewInit() {
        this.visibilityChanged.subscribe(() => {
            
        })
    }

    get code() {
        return this.state?.json;
    }

    set code(value) {
        this.state.json = value;
        setTimeout(() => {
            try {
                this.state.object = JSON.parse(this.state.json);
                this.state.errorMessage = null;
            } catch (e) {
                this.state.object = null;
                this.state.errorMessage = e.message;
            } finally {
                this.saveState();
            }
        })
    }
}