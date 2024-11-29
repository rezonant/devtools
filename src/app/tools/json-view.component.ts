import { Component, Input } from "@angular/core";

@Component({
    selector: 'rdt-json-view',
    template: `
        @if (type === 'object') {
            @for (key of keys; track key) {
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
                @if (!collapsed && typeOf(object[key]) === 'object') {
                    <div class="children">
                        <rdt-json-view [object]="object[key]"></rdt-json-view>
                    </div>
                }
            }
        }
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
    `],
    standalone: false
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
            this.keys = value ? Object.keys(value) : [];
        });
    }

    type : string;
    keys : string[] = [];

    typeOf(value) {
        return typeof value;
    }

    getValueDisplay(value) {
        if (Array.isArray(value)) {
            return `Array (${value.length} items)`;
        }

        if (typeof value === 'object') {
            return `Object (${Object.keys(value).length} keys)`;
        }

        return JSON.stringify(value);
    }
}