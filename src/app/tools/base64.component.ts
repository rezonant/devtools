import { Component } from "@angular/core";
import { ToolComponent } from "./tool-component";

@Component({
    template: `
        <div class="splitter">
            <div>
                <mat-form-field appearance="outline" floatLabel="always">
                    <mat-label>Raw</mat-label>
                    <textarea matInput [(ngModel)]="rawStr" (change)="encode()" (keypress)="encode()"></textarea>
                </mat-form-field>
            </div>
            <div>
                <mat-form-field appearance="outline" floatLabel="always">
                    <mat-label>Base64</mat-label>
                    <textarea matInput [(ngModel)]="base64Str" (change)="decode()" (keypress)="decode()"></textarea>
                </mat-form-field>
            </div>
        </div>
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
export class Base64Component extends ToolComponent {
    id = Math.floor(Math.random() * 10000);
    base64Str : string;
    rawStr : string;
    override label = 'Base64';
    static override id = 'base64';
    static override label = 'Base64';

    decode() {
        if (this.base64Str === '') {
            this.rawStr = '';
            return;
        }
        try {
            this.rawStr = atob(this.base64Str);
        } catch (e) {
            this.rawStr = `Error: ${e.message}`;
        }
    }

    encode() {
        if (this.rawStr === '') {
            this.base64Str = '';
            return;
        }
        try {
            this.base64Str = btoa(this.rawStr);
        } catch (e) {
            this.base64Str = `Error: ${e.message}`;
        }
    }
}