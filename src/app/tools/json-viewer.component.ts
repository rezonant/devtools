import { Component, ViewChild } from "@angular/core";
import { EditorComponent } from "ngx-monaco-editor";
import { ToolComponent } from "./tool-component";

@Component({
    template: `
        <ngx-monaco-editor 
            #monaco
            [options]="monacoOptions" 
            [(ngModel)]="code"></ngx-monaco-editor>
        
        <ng-container *ngIf="errorMessage">
            <div class="error">
                {{errorMessage}}
            </div>
        </ng-container>
        <ng-container *ngIf="!errorMessage">
            <rdt-json-view [object]="object"></rdt-json-view>
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
export class JsonViewerComponent extends ToolComponent {
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

    _code : string;
    get code() {
        return this._code;
    }

    set code(value) {
        this._code = value;
        setTimeout(() => {
            try {
                this.object = JSON.parse(this._code);
                this.errorMessage = null;
            } catch (e) {
                this.object = null;
                this.errorMessage = e.message;
            }
        })
    }

    object;
    errorMessage : string;
}