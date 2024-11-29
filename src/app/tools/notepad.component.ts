import { Component } from "@angular/core";
import { ToolComponent } from "./tool-component";

export interface NotepadState {
    text : string;
}

@Component({
    template: `
        <ngx-monaco-editor 
            #monaco
            [options]="monacoOptions" 
            [(ngModel)]="text"
            (ngModelChange)="saveState()"></ngx-monaco-editor>
    `,
    styles: [`
        :host {
            display: flex;
            flex-direction: column;
        }

        ngx-monaco-editor {
            flex-grow: 1;
            margin: 1em;
        }
    `],
    standalone: false
})
export class NotepadComponent extends ToolComponent<NotepadState> {
    override label = 'Notepad';
    static override label = 'Notepad';
    static override id = 'notepad';

    monacoOptions = {
        theme: 'vs-dark', 
        language: 'text',
        automaticLayout: true
    };

    get text() {
        return this.state?.text;
    }

    set text(value) {
        this.state.text = value;
        setTimeout(() => this.saveState());
    }
}