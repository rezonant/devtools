import { Component } from "@angular/core";
import { ToolComponent } from "./tool-component";

export interface UrlEncodingState {
    search : string;
}

export interface EncodedCharacter {
    entity : string;
    character : string;
    hex : string;
    dec : string;
    name : string;
}

@Component({
    template: `
        <ng-container *ngIf="state">
            <mat-form-field appearance="outline">
                <span matPrefix>
                    <mat-icon>search</mat-icon>
                </span>
                <input 
                    type="text" 
                    matInput 
                    [(ngModel)]="state.search"
                    (ngModelChange)="saveState()"
                    />
            </mat-form-field>

            <div class="entity-list">
                <div class="entity" *ngFor="let entity of filteredEntities" [title]="entity.name || ''">
                    <i>{{entity.character}}</i>
                    <span>{{entity.entity || ' '}}</span>
                    <span>hex {{entity.hex || ' '}}</span>
                    <span>dec {{entity.dec || ' '}}</span>
                </div>
            </div>
        </ng-container>
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
                text-decoration: underline;
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
export class UrlEncodingReferenceComponent extends ToolComponent<UrlEncodingState> {
    override label = 'URL Encoding';
    static override label = 'URL Encoding';
    static override id = 'url-encoding';
    entities : EncodedCharacter[] = [];

    zeroPad(v : string, length : number) {
        v = ''+v;
        while (v.length < length)
            v = `0${v}`;
        return v;
    }

    constructor() {
        super();
        for (let i = 0, max = 255; i < max; ++i) {
            let hex = `${this.zeroPad(i.toString(16), 2)}`;
            let entity = `%${hex}`;
            let character : string;
            
            try {
                character = decodeURIComponent(entity);
            } catch (e) {
                //console.log(`Failed to get URI encoding for ${i}: ${e.message}`);
                continue;
            }

            this.entities.push({
                character,
                entity,
                dec: `${i}`,
                hex,
                name: null
            })
        }
    }

    get filteredEntities() {
        if (!this.state?.search)
            return this.entities;

        if (this.state.search === '%')
            return this.entities.filter(x => x.character === '%');
        
        return this.entities.filter(x => x.name?.includes(this.state.search) 
            || x.character?.includes(this.state.search) 
            || x.entity?.includes(this.state.search)
        )
    }
}