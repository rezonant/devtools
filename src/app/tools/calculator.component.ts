import { Component } from "@angular/core";
import { ToolComponent } from "./tool-component";

export interface CalculatorState {
    expression : string;
    value : any;
    errorMessage : string;
    inspect : boolean;
    autoEvaluate : boolean;
}

@Component({
    template: `
        <header>
            <form (submit)="evaluate()">
                <mat-form-field appearance="outline" floatLabel="always">
                    <mat-label>Expression</mat-label>
                    <input name="expression" type="text" matInput [(ngModel)]="expression" />
                </mat-form-field>
                <button mat-icon-button matTooltip="Recalculate">
                    <mat-icon>calculate</mat-icon>
                </button>
            </form>
        </header>

        <div class="options">
            <mat-slide-toggle [(ngModel)]="autoEvaluate">Auto-Evaluate</mat-slide-toggle>
            <mat-slide-toggle [(ngModel)]="inspect">Inspect Result</mat-slide-toggle>
        </div>

        <pre class="error-message" *ngIf="state?.errorMessage">{{state?.errorMessage}}</pre>
        <ng-container *ngIf="!state?.errorMessage">
            <pre *ngIf="inspect">{{state?.value | json}}</pre>
            <pre *ngIf="!inspect">{{state?.value}}</pre>
        </ng-container>
    `,
    styles: [`
        header {
            display: flex;
            form {
                flex-grow: 1;
            }
        }

        .options {
            display: flex;
            gap: 1em;
            flex-wrap: wrap;
        }

        pre.error-message {

        }

        form {
            display: flex;
            gap: 1em;
            align-items: baseline;

            mat-form-field {
                flex-grow: 1;
            }
        }
    `]
})
export class CalculatorComponent extends ToolComponent<CalculatorState> {
    override label = 'Calculator';
    static override label = 'Calculator';
    static override id = 'calculator';

    get expression() { return this.state?.expression; }
    set expression(value) { this.state.expression = value; this.evaluate(); this.saveState(); }

    get inspect() { return this.state?.inspect; }
    set inspect(value) { this.state.inspect = value; this.evaluate(); this.saveState(); }

    get autoEvaluate() { return this.state?.autoEvaluate; }
    set autoEvaluate(value) { this.state.autoEvaluate = value; this.evaluate(); this.saveState(); }

    get inspected() {
        return JSON.stringify(this.state.value, undefined, 2);
    }

    override initState() {
        this.state = {
            autoEvaluate: true,
            errorMessage: null,
            expression: `1 + 1`,
            value: 2,
            inspect: true
        }
    }

    evaluate() {
        try {
            let E = Math.E;
            let LN10 = Math.LN10;
            let LN2 = Math.LN2;
            let LOG2E = Math.LOG2E;
            let LOG10E = Math.LOG10E;
            let PI = Math.PI;
            let SQRT1_2 = Math.SQRT1_2;
            let SQRT2 = Math.SQRT2;
            let abs = (n) => Math.abs(n);
            let acos = (n) => Math.acos(n);
            let asin = (n) => Math.asin(n);
            let atan = (n) => Math.atan(n);
            let atan2 = (y, x) => Math.atan2(y, x);
            let ceil = (n) => Math.ceil(n);
            let cos = (n) => Math.cos(n);
            let exp = (n) => Math.exp(n);
            let floor = (n) => Math.floor(n);
            let log = (n) => Math.log(n);
            let max = (...a) => Math.max(...a);
            let min = (...a) => Math.min(...a);
            let pow = (x, y) => Math.pow(x, y);
            let random = () => Math.random();
            let round = (n) => Math.round(n);
            let sin = (n) => Math.sin(n);
            let sqrt = (n) => Math.sqrt(n);
            let tan = (n) => Math.tan(n);
            let array = (count) => Array(count).fill(0);
            let inclusiveRange = (first, last) => array(last - first + 1).map((_, i) => first + i)
            let exclusiveRange = (first, last) => array(last - first).map((_, i) => first + i)
            let range = inclusiveRange;
            
            this.state.errorMessage = null;
            this.state.value = eval(this.expression);
        } catch (e) {
            this.state.errorMessage = e.message;
        }
    }
}