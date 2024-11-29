import { Component, Input } from "@angular/core";

@Component({
    selector: 'rdt-html-view',
    template: `
        @if (isElement(node)) {
          <div class="tag-start" (click)="collapsed = !collapsed">
            &lt;{{asElement(node).localName}}@for (attr of getAttributes(asElement(node)); track attr) {
            {{attr.name}}="{{attr.value}}"
            }&gt;
          </div>
          @if (!collapsed) {
            <div class="children">
              @for (child of getChildren(node); track child) {
                <rdt-html-view
                    [node]="child"
                    />
              }
            </div>
          }
          <div class="tag-end" (click)="collapsed = !collapsed">
            &lt;/{{asElement(node).localName}}&gt;
          </div>
        }
        @if (!isElement(node)) {
          "{{node.textContent}}"
        }
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