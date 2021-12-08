import { Component, Input } from "@angular/core";

@Component({
    selector: 'rdt-json-view',
    template: `
        <ng-container *ngIf="type === 'object'">
            <ng-container *ngFor="let key of keys">
                <div class="property" (click)="collapsed = !collapsed">
                    <span class="key">
                        <mat-icon [inline]="true" [class.invisible]="typeOf(object[key]) !== 'object'">
                            {{collapsed ? 'remove' : 'add' }}
                        </mat-icon>
                        {{key}}:
                    </span>
                    <span class="value">
                        {{getValueDisplay(object[key])}}
                    </span>
                </div>
                <div class="children" *ngIf="!collapsed && typeOf(object[key]) === 'object'">
                    <rdt-json-view [object]="object[key]"></rdt-json-view>
                </div>
            </ng-container>
        </ng-container>
    `,
    styles: [`
        .property {
            .key {
                color: #7fa89c;
            }
        }

        .children {
            border-left: 2px solid #444;
            padding-left: 1.5em;
        }

        .invisible {
            visibility: hidden;
        }
    `]
})
export class JsonViewComponent {
    _object;
    
    collapsed = false;

    @Input() 
    get object() {
        return this._object;
    }

    set object(value) {
        this._object = value;
        setTimeout(() => {
            this.type = typeof this._object;
            this.keys = Object.keys(value);
        });
    }

    type : string;
    keys : string[] = [];

    typeOf(value) {
        return typeof value;
    }

    getValueDisplay(value) {
        if (typeof value === 'object') {
            return `Object (${Object.keys(value).length} keys)`;
        }

        return JSON.stringify(value);
    }
}