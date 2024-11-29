import { Component } from "@angular/core";
import { ToolComponent } from "./tool-component";

export interface LineResult {
    input : string;
    matches : boolean;
}

export interface RegexResult {
    groups : any;
    index : number;
    indices : RegexResult;
    input : string;
    [index : number] : string;
}

export interface RegexState {
    regex : string;
    inputs : string;
    global : boolean;
    caseInsensitive : boolean;
    indices : boolean;
    multiLine : boolean;
    stripR : boolean;
    dotAll : boolean;
    rawResults : boolean;
    unicode : boolean;
    sticky : boolean;
    matches : RegExpMatchArray;
    errorMessage : string;
    lineResults : LineResult[];
}

@Component({
    template: `
        <mat-tab-group>
            <mat-tab label="Tester">
                <mat-form-field appearance="outline" floatLabel="always">
                    <mat-label>Regular Expression</mat-label>
                    <span matPrefix>/</span>
                    <input type="text" matInput name="regex" [(ngModel)]="regex" />
                    <span matSuffix>
                        /@if (indices) {
                        d
                        }@if (global) {
                        g
                        }@if (caseInsensitive) {
                        i
                        }@if (multiLine) {
                        m
                        }@if (dotAll) {
                        s
                        }@if (unicode) {
                        u
                        }@if (sticky) {
                        y
                    }
                    </span>
                </mat-form-field>
                
                <div class="options">
                    <div class="option-set first">
                        <mat-slide-toggle matTooltip="Indices: Generate indices for substring matches." [(ngModel)]="indices">/d</mat-slide-toggle>
                        <mat-slide-toggle matTooltip="Global: Find all matches rather than stopping after the first match." [(ngModel)]="global">/g</mat-slide-toggle>
                        <mat-slide-toggle matTooltip="Ignore Case: If /u flag is also enabled, use Unicode case folding." [(ngModel)]="caseInsensitive">/i</mat-slide-toggle>
                        <mat-slide-toggle matTooltip="Multi-Line: Treat beginning and end characters (^ and $) as working over multiple lines." [(ngModel)]="multiLine">/m</mat-slide-toggle>
                        <mat-slide-toggle matTooltip="Dot-All: Allows . to match newlines" [(ngModel)]="dotAll">/s</mat-slide-toggle>
                        <mat-slide-toggle matTooltip="Unicode: Treat input as a sequence of Unicode code points." [(ngModel)]="unicode">/u</mat-slide-toggle>
                        <mat-slide-toggle matTooltip="Sticky: Matches only from the index indicated by the lastIndex property of this regular expression in the target string. Does not attempt to match from any later indexes." [(ngModel)]="sticky">/y</mat-slide-toggle>
                    </div>
                    <div class="spacer"></div>
                    <div class="option-set second">
                        <mat-slide-toggle [(ngModel)]="stripR">Strip \r</mat-slide-toggle>
                        <mat-slide-toggle [(ngModel)]="rawResults">Raw Results</mat-slide-toggle>
                    </div>
                </div>
                
                <div class="splitter">
                    <div>
                    <h1>Input</h1>
                    <ngx-monaco-editor
                        #monaco
                        [options]="monacoOptions"
                        [(ngModel)]="inputs" 
                        />
                    </div>
                    <div>
                    <h1>Output</h1>
                    @if (state?.errorMessage) {
                        <div>{{state.errorMessage}}</div>
                    }
                
                    @if (state?.lineResults) {
                        <div class="line-results">
                        @for (match of state.lineResults; track match) {
                            <div class="line-result" [class.matches]="match.matches">
                            @if (match.matches) {
                                <mat-icon [inline]="true">done</mat-icon>
                            }
                            @if (!match.matches) {
                                <mat-icon [inline]="true">close</mat-icon>
                            }
                            <span>{{match.input}}</span>
                            </div>
                        }
                        </div>
                    }
                
                    @if (!state?.lineResults) {
                        <rdt-json-view [object]="state?.matches"></rdt-json-view>
                    }
                    </div>
                </div>
            </mat-tab>
            <mat-tab label="Reference (JS)">
            </mat-tab>
            <mat-tab label="PCRE">
            </mat-tab>
            <mat-tab label="POSIX">
            </mat-tab>
        </mat-tab-group>
        
        `,
    styles: [`
        :host {
            display: flex;
            flex-direction: column;
        }

        .splitter {
            margin-top: 1em;
            display: flex;
            gap: 2em;
            flex-grow: 1;

            & > div {
                flex-grow: 1;
                width: 50%;
            }
        }

        /* TODO(mdc-migration): The following rule targets internal classes of tabs that may no longer apply for the MDC version. */
        mat-tab-group {
            flex-grow: 1;
        }

        .options {
            display: flex;
            gap: 1em;
        }

        .option-set {
            display: flex;
            align-items: center;
            gap: 1em;
            flex-wrap: wrap;

            &.second {
                justify-content: flex-end;
            }
        }

        .line-results {
            .line-result {
                color: #c35858;
                display: flex;
                align-items: center;
                gap: 0.5em;

                span {
                    text-decoration: line-through;
                }

                &.matches {
                    color: #0bbb07;
                    span {
                        text-decoration: none;
                    }
                }
            }
        }

        @media (max-width: 800px) {
            .splitter {
                flex-direction: column;

                & > div {
                    width: 100%;
                }
            }

            .options {
                flex-direction: column;
            }
        }
    `]
})
export class RegexComponent extends ToolComponent<RegexState> {
    override label = 'Regex';
    static override label = 'Regular Expressions (Regex)';
    static override id = 'regex';

    monacoOptions = {
        theme: 'vs-dark', 
        language: 'json',
        automaticLayout: true
    };

    get regex() : string {
        return this.state?.regex;
    }

    set regex(value) {
        this.state.regex = value;
        this.evaluate();
        this.saveState();
    }

    get inputs() : string {
        return this.state?.inputs;
    }

    set inputs(value) {
        this.state.inputs = value;
        this.evaluate();
        this.saveState();
    }

    get caseInsensitive() {
        return this.state?.caseInsensitive;
    }

    set caseInsensitive(value) {
        this.state.caseInsensitive = value;
        this.evaluate();
        this.saveState();
    }

    
    get indices() {
        return this.state?.indices;
    }

    set indices(value) {
        this.state.indices = value;
        this.evaluate();
        this.saveState();
    }

    get global() {
        return this.state?.global;
    }

    set global(value) {
        this.state.global = value;
        this.evaluate();
        this.saveState();
    }

    get multiLine() {
        return this.state?.multiLine;
    }

    set multiLine(value) {
        this.state.multiLine = value;
        this.evaluate();
        this.saveState();
    }

    get dotAll() {
        return this.state?.dotAll;
    }

    set dotAll(value) {
        this.state.dotAll = value;
        this.evaluate();
        this.saveState();
    }

    get unicode() {
        return this.state?.unicode;
    }

    set unicode(value) {
        this.state.unicode = value;
        this.evaluate();
        this.saveState();
    }
    get sticky() {
        return this.state?.sticky;
    }

    set sticky(value) {
        this.state.sticky = value;
        this.evaluate();
        this.saveState();
    }
    
    get stripR() {
        return this.state?.stripR;
    }

    set stripR(value) {
        this.state.stripR = value;
        this.evaluate();
        this.saveState();
    }

    get rawResults() {
        return this.state?.rawResults;
    }

    set rawResults(value) {
        this.state.rawResults = value;
        this.evaluate();
        this.saveState();
    }

    evaluate() {
        if (!this.inputs) {
            this.state.matches = null;
            return;
        }

        this.state.errorMessage = null;
        this.state.matches = null;
        let regexp : RegExp;

        let regexStr = this.regex;
        let escapes = {
            n: `\n`,
            r: `\r`
        };

        for (let escape of Object.keys(escapes)) {
            regexStr = regexStr.replace(new RegExp(`\\\\${escape}`, 'g'), escapes[escape]);
        }

        try {
            regexp = new RegExp(
                regexStr, 
                `${this.caseInsensitive? 'i' : ''}` 
                + `${this.global ? 'g' : ''}`
                + `${this.multiLine ? 'm' : ''}`
                + `${this.indices ? 'd' : ''}`
                + `${this.dotAll ? 's' : ''}`
                + `${this.unicode ? 'u' : ''}`
                + `${this.sticky ? 'y' : ''}`
            );
        } catch (e) {
            this.state.errorMessage = e.message;
            return;
        }

        let input = this.inputs;

        if (this.stripR) {
            input = input.replace(/\r/g, '');
        }

        this.state.lineResults = null;
        if (this.rawResults) {
            let matches = input.match(regexp);

            this.state.matches = matches;
        } else {
            this.state.lineResults = this.state.inputs
                    .split(/\n/g)
                    .map(line => ({ input: line, matches: regexp.test(line) }));
        }
    }
}