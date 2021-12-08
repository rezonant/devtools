import { Component } from "@angular/core";
import { HTML_ENTITIES } from "../references/html-entities";
import { ToolComponent } from "./tool-component";

@Component({
    template: `
        <mat-form-field appearance="outline">
            <span matPrefix>
                <mat-icon>search</mat-icon>
            </span>
            <input 
                type="text" 
                matInput 
                [(ngModel)]="search"
                />
        </mat-form-field>

        <div class="entity-list">
            <div class="entity" *ngFor="let entity of filteredEntities" [title]="entity.name">
                <i>{{entity.character}}</i>
                <span>{{entity.entity || ' '}}</span>
                <span>{{entity.unicode || ' '}}</span>
                <span>{{entity.hex || ' '}}</span>
                <span>{{entity.dec || ' '}}</span>
                <span>{{entity.css || ' '}}</span>
            </div>
        </div>
    `,
    styles: [`
        :host {
            display: flex;
            flex-direction: column;
        }

        .entity-list {
            display: flex;
            flex-wrap: wrap;
            gap: 1em;
            margin: 0 auto;
            justify-content: center;
        }

        div.entity {
            border: 1px solid #555;
            border-radius: 5px;
            padding: 0.5em;
            display: flex;
            flex-direction: column;
            
            i {
                flex-grow: 1;
                width: 92px;
                height: 92px;
                font-size: 52px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-style: normal;
            }

            span {
                font-size: 11px;
                display: block;
                text-align: center;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 92px;
                color: #999;
            }

            @media (max-width: 400px) {
                i {
                    width: 125px;
                }

                span {
                    max-width: 125px;
                }
            }
        }
    `]
})
export class HtmlEntitiesReferenceComponent extends ToolComponent {
    override label = 'HTML Entities';
    static override label = 'HTML Entities';
    static override id = 'html-entities';

    entities = HTML_ENTITIES;
    search : string;

    get filteredEntities() {
        if (!this.search)
            return this.entities;
        return this.entities.filter(x =>
            x.name.includes(this.search)
            || x.character.includes(this.search)
            || x.entity.includes(this.search)
            || x.unicode.includes(this.search)
            || x.hex.includes(this.search)
            || x.dec.includes(this.search)
            || x.css.includes(this.search)
        );
    }
}