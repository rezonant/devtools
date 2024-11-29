import { Component } from "@angular/core";
import { ToolComponent } from "./tool-component";

export interface Base64State {
    base64Str : string;
    rawStr : string;
}

@Component({
    template: `
        @if (state) {
          <div class="splitter">
            <div>
              <mat-form-field class="vertically-sized" appearance="outline" floatLabel="always">
                <mat-label>Raw</mat-label>
                <textarea matInput [(ngModel)]="state.rawStr"
                  (change)="encode()" (keypress)="encode()"
                ></textarea>
              </mat-form-field>
            </div>
            <div>
              <mat-form-field class="vertically-sized" appearance="outline" floatLabel="always">
                <mat-label>Base64</mat-label>
                <textarea matInput [(ngModel)]="state.base64Str"
                (change)="decode()" (keypress)="decode()"></textarea>
              </mat-form-field>
            </div>
          </div>
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

        @media (max-width: 450px) {
            .splitter {
                flex-direction: column;
                max-height: calc(100vh - 12em);
            }
        }
    `],
    standalone: false
})
export class Base64Component extends ToolComponent {
    id = Math.floor(Math.random() * 10000);
    override label = 'Base64';
    static override id = 'base64';
    static override label = 'Base64';

    decode() {
        if (!this.state)
            return;
        
        if (this.state.base64Str === '') {
            this.state.rawStr = '';
            return;
        }
        try {
            this.state.rawStr = atob(this.state.base64Str);
        } catch (e) {
            this.state.rawStr = `Error: ${e.message}`;
        } finally {
            this.saveState();
        }
    }

    encode() {
        if (!this.state)
            return;
        
        if (this.state.rawStr === '') {
            this.state.base64Str = '';
            return;
        }
        try {
            this.state.base64Str = btoa(this.state.rawStr);
        } catch (e) {
            this.state.base64Str = `Error: ${e.message}`;
        } finally {
            this.saveState();
        }
    }
}