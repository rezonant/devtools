import { Component } from "@angular/core";
import { ToolComponent } from "./tool-component";
import * as uuid from "uuid";

export interface RandomState {
    type : string;
    count : number;
    min : number;
    max : number;
    minLength : number;
    maxLength : number;
    bias : number;
    items : string[];
    round : boolean;
    characterSet : string;
    trueString : string;
    falseString : string;
}

@Component({
    template: `
        <mat-autocomplete #characterSetsAutocomplete="matAutocomplete">
            <mat-option *ngFor="let characterSet of characterSets" [value]="characterSet.string">
                {{characterSet.name}}
            </mat-option>
        </mat-autocomplete>

        <header>
            <mat-form-field appearance="outline" floatLabel="always" class="type">
                <mat-label>Type</mat-label>
                <mat-select [(ngModel)]="type">
                    <mat-option value="boolean">Boolean</mat-option>
                    <mat-option value="number">Number</mat-option>
                    <mat-option value="string">String</mat-option>
                    <mat-option value="uuid">UUID (v4)</mat-option>
                </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" floatLabel="always" class="type">
                <mat-label>Count</mat-label>
                <input matInput [(ngModel)]="count" type="number" min="1" />
            </mat-form-field>

            <ng-container [ngSwitch]="state?.type">
                <ng-container *ngSwitchCase="'string'">
                    <mat-form-field appearance="outline" floatLabel="always" class="type">
                        <mat-label>Min Length</mat-label>
                        <input matInput [(ngModel)]="minLength" type="number" min="1" />
                    </mat-form-field>
                    <mat-form-field appearance="outline" floatLabel="always" class="type">
                        <mat-label>Max Length</mat-label>
                        <input matInput [(ngModel)]="maxLength" type="number" min="1" />
                    </mat-form-field>
                    <mat-form-field appearance="outline" floatLabel="always" class="character-set">
                        <mat-label>Character Set</mat-label>
                        <input matInput [(ngModel)]="characterSet" type="text" [matAutocomplete]="characterSetsAutocomplete" />
                    </mat-form-field>
                    
                </ng-container>
                <ng-container *ngSwitchCase="'boolean'">
                    <mat-form-field appearance="outline" floatLabel="always" class="type">
                        <mat-label>Bias</mat-label>
                        <input matInput [(ngModel)]="bias" type="number" min="0" step="0.01" max="1" />
                    </mat-form-field>
                    <mat-form-field appearance="outline" floatLabel="always" class="type">
                        <mat-label>True Value</mat-label>
                        <input matInput [(ngModel)]="trueString" type="string" />
                    </mat-form-field>
                    <mat-form-field appearance="outline" floatLabel="always" class="type">
                        <mat-label>False Value</mat-label>
                        <input matInput [(ngModel)]="falseString" type="string" />
                    </mat-form-field>
                </ng-container>
                <ng-container *ngSwitchCase="'number'">
                    <mat-form-field appearance="outline" floatLabel="always" class="type">
                        <mat-label>Min</mat-label>
                        <input matInput [(ngModel)]="min" type="number" min="1" />
                    </mat-form-field>
                    <mat-form-field appearance="outline" floatLabel="always" class="type">
                        <mat-label>Max</mat-label>
                        <input matInput [(ngModel)]="max" type="number" min="1" />
                    </mat-form-field>
                    <mat-form-field appearance="outline" floatLabel="always" class="type">
                        <mat-label>Bias</mat-label>
                        <input matInput [(ngModel)]="bias" type="number" min="0" step="0.01" max="1" />
                    </mat-form-field>

                    <mat-slide-toggle [(ngModel)]="round">Round</mat-slide-toggle>
                </ng-container>
            </ng-container>

            <button mat-icon-button matTooltip="Generate new values" (click)="generate()">
                <mat-icon>autorenew</mat-icon>
            </button>
        </header>

        <div class="items">
            <div class="item" *ngFor="let item of state?.items">
                {{item}}
            </div>
        </div>
    `,
    styles: [`
        header {
            display: flex;
            align-items: baseline;
            gap: 1em;
        }

        mat-form-field.type {
            width: 180px;
        }
        mat-form-field.character-set {
            width: 360px;
        }
        .items {
            .item {
                font-family: monospace;
            }
        }
    `]
})
export class RandomComponent extends ToolComponent<RandomState> {
    override label = 'Random';
    static override label = 'Random';
    static override id = 'random';

    get items() { return this.state?.items; }
    set items(value) { this.state.items = value; this.generate(); this.saveState(); }

    get type() { return this.state?.type; }
    set type(value) { this.state.type = value; this.generate(); this.saveState(); }

    get min() { return this.state?.min; }
    set min(value) { this.state.min = value; this.generate(); this.saveState(); }

    get max() { return this.state?.max; }
    set max(value) { this.state.max = value; this.generate(); this.saveState(); }
    
    get minLength() { return this.state?.minLength; }
    set minLength(value) { this.state.minLength = value; this.generate(); this.saveState(); }

    get maxLength() { return this.state?.maxLength; }
    set maxLength(value) { this.state.maxLength = value; this.generate(); this.saveState(); }

    get bias() { return this.state?.bias; }
    set bias(value) { this.state.bias = value; this.generate(); this.saveState(); }

    get count() { return this.state?.count; }
    set count(value) { this.state.count = value; this.generate(); this.saveState(); }

    get round() { return this.state?.round; }
    set round(value) { this.state.round = value; this.generate(); this.saveState(); }

    get characterSet() { return this.state?.characterSet; }
    set characterSet(value) { this.state.characterSet = value; this.generate(); this.saveState(); }

    get trueString() { return this.state?.trueString; }
    set trueString(value) { this.state.trueString = value; this.generate(); this.saveState(); }

    get falseString() { return this.state?.falseString; }
    set falseString(value) { this.state.falseString = value; this.generate(); this.saveState(); }

    hasCrypto = false;

    override afterToolInit() {
        if (typeof crypto !== 'undefined') {
            if (crypto.getRandomValues) {
                this.hasCrypto = true;
            }
        }
    }

    randomFloat() {
        if (this.hasCrypto)
            return this.randomInt() / (2**32);
        else
            return Math.random();
    }

    randomInt() {
        return this.randomInts(1)[0];
    }

    randomInts(count : number): Uint32Array {
        let buf = new Uint32Array(count);

        if (this.hasCrypto) {
            crypto.getRandomValues(buf);
            return buf;
        } else {
            for (let i = 0, max = buf.length; i < max; ++i) {
                buf[i] = Math.round(Math.random() * 2**32);
            }
        }

        return buf;
    }

    generate() {
        this.state.items = null;
        let funcs = {
            boolean: () => {
                let trueString = this.trueString || 'true';
                let falseString = this.falseString || 'false';
                return this.randomFloat() > (this.bias ?? 0.5) ? trueString : falseString;
            },
            number: () => {
                let min = this.min ?? 0;
                let max = this.max ?? 100;
                let num = min + this.randomFloat() * (max - min);

                if (this.round)
                    return Math.round(num);
                else
                    return num;
            },
            string: () => {
                let min = this.minLength || 30;
                let max = this.maxLength || 30;
                let num = min + this.randomFloat() * (max - min);

                let length = min + Math.floor(this.randomFloat() * (max - min));
                let string = '';

                if (!this.characterSet)
                    return '';

                for (let i = 0; i < length; ++i) {
                    string += this.characterSet[Math.floor(this.randomFloat() * this.characterSet.length)]
                }

                return string;
            },
            uuid: () => uuid.v4(),
        }

        this.state.items = Array(this.count).fill(0).map(() => funcs[this.type]()).map(v => ''+v);
    }

    characterSets = [
        { name: 'Base64',                               string: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/' },
        { name: 'Base64 (URL safe)',                    string: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_' },
        { name: 'Base64 (IMAP mailbox)',                string: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+,' },
        { name: 'Base64 (UUEncoding)',                  string: '`!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_' },

        { name: 'Base32',                               string: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567' },
        { name: 'Base32 (z-base-32)',                   string: 'ybndrfg8ejkmcpqxot1uwisza345h769' },
        { name: 'Base32 (Crockford)',                   string: '0123456789ABCDEFGHJKMNPQRSTVWXYZ' },
        { name: 'Base32 (Extended Hex)',                string: '0123456789ABCDEFGHIJKLMNOPQRSTUV' },
        { name: 'Base32 (Geohash)',                     string: '0123456789bcdefghjkmnpqrstuvwxyz' },
        { name: 'Base32 (Word Safe)',                   string: '23456789CFGHJMPQRVWXcfghjmpqrvwx' },

        { name: 'Base36',                               string: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' },
        { name: 'Base36 (Lowercase)',                   string: 'abcdefghijklmnopqrstuvwxyz0123456789' },

        { name: 'Alphabetical / Mixed (A-Z,a-z)',       string: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' },
        { name: 'Alphabetical / Uppercase (A-Z)',       string: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' },
        { name: 'Alphabetical / Lowercase (a-z)',       string: 'abcdefghijklmnopqrstuvwxyz' },
        { name: 'Alphanumeric / Lowercase (a-z,0-9)',   string: 'abcdefghijklmnopqrstuvwxyz0123456789' },
        { name: 'Alphanumeric / Uppercase (a-z,0-9)',   string: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' },
        { name: 'Alphanumeric / Mixed (A-Z,a-z,0-9)',   string: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789' },
        { name: 'Alphasymbolic',                        string: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-=!@#$%^&*()_+[]\\;\',./{}|:"<>?' },

        { name: 'Hexadecimal / Uppercase (A-F,0-9)',    string: 'ABCDEF0123456789' },
        { name: 'Hexadecimal / Lowercase (A-F,0-9)',    string: 'abcdef0123456789' },
        { name: 'Hexadecimal / Mixed (A-F,0-9)',        string: 'ABCDEFabcdef0123456789' },
        { name: 'Octal (0-7)',                          string: '01234567' },
        { name: 'Binary',                               string: '01' },
    ]
}