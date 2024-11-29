import { Component } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { ToolComponent } from "./tool-component";

export interface BrowserState {
    url : string;
}

@Component({
    template: `
        <header>
          <form (submit)="navigate()">
            <mat-form-field appearance="outline" floatLabel="always">
              <mat-label>URL</mat-label>
              <input name="url" matInput type="text" [(ngModel)]="urlEntry" />
            </mat-form-field>
            <button mat-button>Go</button>
          </form>
        </header>
        @if (resourceUrl) {
          <iframe [src]="resourceUrl"></iframe>
        }
        `,
    styles: [`
        :host {
            display: flex;
            flex-direction: column;
        }

        header {
            display: flex;
            align-items: baseline;
            mat-form-field {
                flex-grow: 1;
            }
        }

        form {
            flex-grow: 1;
            display: flex;
            align-items: baseline;
        }

        iframe {
            flex-grow: 1;
            border: 1px solid #666;
        }
    `],
    standalone: false
})
export class BrowserComponent extends ToolComponent {
    constructor(
        private domSanitizer : DomSanitizer
    ) {
        super();
    }

    override label = 'Browser';
    static override label = 'Browser';
    static override id = 'browser';

    get url() {
        return this.state?.url;
    }

    set url(value) {
        this.state.url = value;
        this.urlEntry = value;
    }

    urlEntry : string;

    navigate() {
        this.url = this.urlEntry;
        this.load();
        this.saveState();
    }

    load() {
        this.resourceUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(this.url);
        this.urlEntry = this.url;
    }

    resourceUrl;

    override afterToolInit() {
        if (this.url)
            this.load();
    }
}