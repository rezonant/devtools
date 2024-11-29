import { Component } from "@angular/core";
import { ToolComponent } from "./tool-component";

export interface UnitsState {
    unitType : string;
    aValue : number;
    aUnit : string;
    bValue : number;
    bUnit : string;
}

const UNITS = {
    length: {
        $label: 'Length',
        mm: 0.001,
        cm: 0.01,
        m: 1,
        km: 1000,
        in: 39.37008,
        ft: 3.28084,
        mi: 0.0006213712
    },
    temperature: {
        $label: 'Temperature',
        'F': [F => (F + 459.67) * 5/9, K => K * 9/5 - 459.67],
        'C': [C => C + 273.15, K => K - 273.15],
        'R': [R => R * 5/9, K => K * 9/5],
        'K': 1
    },
    time: {
        $label: 'Time',
        ns:   0.000000001,
        'μs': 0.000001,
        ms:   0.001,
        seconds: 1,
        minutes: 60,
        hours: 60*60,
        days: 60*60*24,
        weeks: 60*60*24*7,
        months: 60*60*24*30.4166666666666,
        years: 60*60*24*365,
        decades: 60*60*24*365*10,
        centuries: 60*60*24*365*100,
        milleniums: 60*60*24*365*1000
    },
    energy: {
        $label: 'Energy',
        'mJ': 0.001,
        'cJ': 0.01,
        'dJ': 0.1,
        'J': 1,
        'daJ': 10,
        'hJ': 100,
        'kJ': 1000,
        'MJ': 1000000,
        'GJ': 1000000000,
        'Wh': [Wh => Wh * 3600000000, J => J / 3600000000],
        'kWh': [kWh => kWh * 3600000, J => J / 3600000],
        'MWh': [MWh => MWh * 3600, J => J / 3600],
        'GWh': [MWh => MWh * 3.6, J => J / 3.6],
        'cal': [cal => cal * 4.184, J => J / 4.184],
        'kcal': [kcal => kcal * 4184, J => J / 4184],
        'BTU': [BTU => BTU * 1055.05585262, J => J / 1055.05585262],
        'eV': [eV => eV * 1.602176565e-19, J => J / 1.602176565e-19],
        'keV': [keV => keV * 1.602176565e-16, J => J / 1.602176565e-16],
        'MeV': [MeV => MeV * 1.602176565e-13, J => J / 1.602176565e-16],
        'GeV': [GeV => GeV * 1.602176565e-10, J => J / 1.602176565e-16],
        'TeV': [TeV => TeV * 1.602176565e-7, J => J / 1.602176565e-7]
    },
    volume: {
        $label: 'Volume',
        'nm³': 0.000000000000000000000000001,
        'μm³': 0.000000000000000001,
        'mm³': 0.000000001,
        'cm³': 0.000001,
        'dm³': 0.001,
        'm³': 1,
        'dam³': 1000,
        'hm³':  1000000,
        'Km³':  1000000000,
        'Mm³':  1000000000000,
        'Gm³':  1000000000000000,
        'Tm³':  1000000000000000000,

        'mL': 0.000001,
        'cL': 0.00001,
        'dL': 0.0001,
        'L': 0.001,
        'KL': 1,
        'ML': 1000,
        'GL': 1000000,
        'TL': 1000000000,
        'PL': 1000000000000,

        'gal': 0.00378541200000013893,
        'q': 0.000946353,
        'pt': 0.0004731765000000173662,
        'c': 0.00024000001369468799495,
        'fl. oz': 0.000029574,
        'Tbsp': 0.000014787,
        'tsp': 0.0000049289
    },
    data: {
        $label: 'Data',
        b: 0.125,
        Kb: 0.125*0.001,
        Mb: 0.125*0.001*0.001,
        Gb: 0.125*0.001*0.001*0.001,
        Tb: 0.125*0.001*0.001*0.001*0.001,
        Pb: 0.125*0.001*0.001*0.001*0.001*0.001,
        Kib: 0.125*0.0009765625,
        Mib: 0.125*0.0009765625*0.0009765625,
        Gib: 0.125*0.0009765625*0.0009765625*0.0009765625,
        Tib: 0.125*0.0009765625*0.0009765625*0.0009765625*0.0009765625,
        Pib: 0.125*0.0009765625*0.0009765625*0.0009765625*0.0009765625*0.0009765625,
        B: 1,
        KB: 1000,
        MB: 1000*1000,
        GB: 1000*1000*1000,
        TB: 1000*1000*1000*1000,
        PB: 1000*1000*1000*1000*1000,
        KiB: 1024,
        MiB: 1024*1024,
        GiB: 1024*1024*1024,
        TiB: 1024*1024*1024*1024,
        PiB: 1024*1024*1024*1024*1024
    }
};

@Component({
    template: `
        <header>
            @if (state) {
                <mat-form-field appearance="outline" floatLabel="always" class="unit-type">
                <mat-label>Unit Type</mat-label>
                <mat-select name="unitType" [(ngModel)]="state.unitType" (ngModelChange)="saveState()">
                    @for (unitType of unitTypes; track unitType) {
                        <mat-option [value]="unitType">{{unitTypeLabel(unitType)}}</mat-option>
                    }
                </mat-select>
                </mat-form-field>
                <div class="conversion">
                <mat-form-field appearance="outline" floatLabel="always">
                    <mat-label></mat-label>
                    <input matInput name="aValue" type="number" [(ngModel)]="state.aValue" (ngModelChange)="evaluateA()">
                </mat-form-field>
                <mat-form-field class="unit" floatLabel="always">
                    <mat-select name="aUnit" [(ngModel)]="state.aUnit" (ngModelChange)="evaluateA()" placeholder="unit">
                    @for (unit of units; track unit) {
                        <mat-option [value]="unit">{{unit}}</mat-option>
                    }
                    </mat-select>
                </mat-form-field>
                <mat-icon>arrow_forward</mat-icon>
                <mat-form-field appearance="outline" floatLabel="always">
                    <mat-label></mat-label>
                    <input matInput name="aValue" type="number" [(ngModel)]="state.bValue" (ngModelChange)="evaluateB()">
                </mat-form-field>
                <mat-form-field floatLabel="always" class="unit">
                    <mat-label>Unit</mat-label>
                    <mat-select name="aUnit" [(ngModel)]="state.bUnit" (ngModelChange)="saveState()" placeholder="unit" (ngModelChange)="evaluateA()">
                    @for (unit of units; track unit) {
                        <mat-option [value]="unit">{{unit}}</mat-option>
                    }
                    </mat-select>
                </mat-form-field>
                <button mat-button (click)="swap()">
                    <mat-icon>swap_horiz</mat-icon>
                    Swap
                </button>
                </div>
            }
        </header>
        `,
    styles: [`
        :host {
            display: block;
            max-width: 1200px;
            margin: 1em auto;
        }

        mat-form-field {
            width: 180px;

            &.unit-type {
                width: 100%;
            }
        }

        header {
            .conversion {
                display: flex;
                gap: 1em;
                align-items: baseline;

                & > mat-icon {
                    position: relative;
                    top: 8px;
                    margin: 0 1em;
                }
            }
        }

        mat-form-field.unit {
            width: 4em;
        }
    `]
})
export class UnitsComponent extends ToolComponent<UnitsState> {
    override label = 'Units';
    static override label = 'Unit Converter';
    static override id = 'units';

    get unitTypes(): string[] {
        return Object.keys(UNITS);
    }

    get units(): string[] {
        if (!this.state.unitType || UNITS[this.state.unitType])
            return [];
        
        return Object.keys(UNITS[this.state.unitType]).filter(x => !x.startsWith('$'));
    }

    unitLabel(unit : string): string {
        return UNITS[this.state.unitType][unit];
    }

    unitTypeLabel(unit : string): string {
        return UNITS[unit].$label;
    }

    evaluateA() {
        let aUnit = UNITS[this.state.unitType][this.state.aUnit];
        let bUnit = UNITS[this.state.unitType][this.state.bUnit];
        
        let value = this.state.aValue;
        value = Array.isArray(aUnit) ? aUnit[0](value) : value * aUnit;
        value = Array.isArray(bUnit) ? bUnit[1](value) : value / bUnit;
        this.state.bValue = value;

        this.saveState();
    }

    evaluateB() {
        let aUnit = UNITS[this.state.unitType][this.state.aUnit];
        let bUnit = UNITS[this.state.unitType][this.state.bUnit];

        let value = this.state.bValue;
        value = Array.isArray(bUnit) ? bUnit[0](value) : value * bUnit;
        value = Array.isArray(aUnit) ? aUnit[1](value) : value / aUnit;
        this.state.aValue = value;

        this.saveState();
    }

    swap() {
        let { aUnit, aValue } = this.state;

        this.state.aUnit = this.state.bUnit;
        this.state.aValue = this.state.bValue;

        this.state.bUnit = aUnit;
        this.state.bValue = aValue;
    }
}