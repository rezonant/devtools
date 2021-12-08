import { Component, Input } from "@angular/core";

@Component({
    selector: 'rdt-html-view',
    template: `
        <ng-container *ngIf="isElement(node)">
            <div class="tag-start" (click)="collapsed = !collapsed">
                &lt;{{asElement(node).localName}}<ng-container 
                    *ngFor="let attr of getAttributes(asElement(node))"
                    > {{attr.name}}="{{attr.value}}"</ng-container>&gt;
            </div>
            <div class="children" *ngIf="!collapsed">
                <rdt-html-view 
                    *ngFor="let child of getChildren(node)" 
                    [node]="child"
                    ></rdt-html-view>
            </div>
            <div class="tag-end" (click)="collapsed = !collapsed">
                &lt;/{{asElement(node).localName}}&gt;
            </div>
        </ng-container>
        <ng-container *ngIf="!isElement(node)">
            "{{node.textContent}}"
        </ng-container>
    `,
    styles: [`
        :host {
            font-family: monospace;
        }

        .tag-start, .tag-end {
            color: #7fa89c;
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
export class HtmlViewComponent {
    _node : Node;
    
    collapsed = false;

    @Input() 
    get node() {
        return this._node;
    }

    set node(value) {
        this._node = value;
        setTimeout(() => {
        });
    }

    asElement(node : Node) {
        return <Element>node;
    }

    getAttributes(element : Element) {
        return Array.from(element.attributes);
    }

    getChildren(node : Node) {
        return Array.from(node.childNodes);
    }

    type : string;
    keys : string[] = [];

    typeOf(value) {
        return typeof value;
    }

    instanceOf(value, type) {
        return value instanceof type;
    }

    isElement(value) {
        return value instanceof Element;
    }
}