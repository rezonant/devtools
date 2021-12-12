import { Component } from "@angular/core";
import { ToolComponent } from "./tool-component";
import { JWT } from '@astronautlabs/jwt';

export interface JwtViewerState {
    jwt : string;
    claimsString : string;
    headerString : string;
    signature : string;
    signingKey : string;
    errorMessage : string;
    valid : boolean;
}

@Component({
    template: `
    <main>
        <section id="encoded">
            <h1>Encoded</h1>
            <ngx-monaco-editor 
                #monaco
                [options]="encodingMonacoOpts" 
                [(ngModel)]="jwt"></ngx-monaco-editor>
        </section>
        <section id="decoded">
            <h1>Decoded</h1>
            <h2>Header: Algorithm & Token Type</h2>
            <ngx-monaco-editor 
                #monaco
                [options]="monacoOptions" 
                [(ngModel)]="headerString"></ngx-monaco-editor>
            <h2>Payload: Data</h2>
            <ngx-monaco-editor 
                #monaco
                [options]="monacoOptions" 
                [(ngModel)]="claimsString"></ngx-monaco-editor>
            <h2>
                Signature
            
                <div id="validity" [class.valid]="state?.valid">
                    <mat-icon *ngIf="state?.valid">done</mat-icon>
                    <mat-icon *ngIf="!state?.valid">close</mat-icon>
                    {{ state?.valid ? 'Valid' : 'Invalid' }}
                </div>
            </h2>
            
            <pre id="signature">{{signature || ''}}</pre>

            <mat-form-field appearance="outline" floatLabel="always">
                <mat-label>Secret</mat-label>
                <textarea type="text" matInput [(ngModel)]="signingKey" placeholder="ABCDEF"></textarea>
            </mat-form-field>
        </section>
    </main>
    <footer>
        <div id="status">
            {{state?.errorMessage}} &nbsp;
        </div>
    </footer>
    `,
    styles: [`
    
        :host {
            display: flex;
            flex-direction: column;
        }

        main {
            display: flex;
            gap: 2em;
            padding: 1em;
            flex-grow: 1;

            & > * {
            }
        }

        #status {
            padding: 0.5em 1em;
            color: #767373;
        }

        #validity {
            font-size: 24px;
            display: flex;
            align-items: center;

            &.valid {
                color: green;
            }

            &:not(.valid) {
                color: #a14040;
            }
        }

        h2 {
            margin: 0;
            background: #1e1e1e;
            font-weight: normal;
            padding: 0.25em 1em;
        }

        #encoded, #decoded {
            display: flex;
            flex-direction: column;
            overflow: hidden;
            flex-grow: 1;

            ngx-monaco-editor {
                flex-grow: 1;
            }

            textarea {
                height: 100px;
            }
        }

        #decoded {
            max-width: 600px;
        }

        #decoded {
            #signature {
                background: #1e1e1e;
                min-height: 2em;
                border-radius: 3px;
                margin: 0 0 1em 0;
                padding: 1.4em;
            }
        }

        @media (max-width: 1000px) {
            main {
                flex-direction: column;
            }

            #decoded {
                max-width: initial;
            }
        }
    `]
})
export class JwtViewerComponent extends ToolComponent<JwtViewerState> {
    override label = 'JWT Viewer';
    static override label = 'JWT Viewer';
    static override id = 'jwt-viewer';
    encodingMonacoOpts = {
        theme: 'vs-dark',
        language: 'jwt',
        automaticLayout: true,
        wordWrap: 'on',
        fontSize: 28
    }

    monacoOptions = {
        theme: 'vs-dark', 
        language: 'json',
        automaticLayout: true
    };

    claims : any;

    signature : string;

    get jwt() {
        return this.state?.jwt;
    }

    get claimsString() {
        return this.state?.claimsString;
    }

    set claimsString(value) {
        if (this.state.claimsString === value) return;
        this.state.claimsString = value;
        setTimeout(() => this.constructToken());
    }

    get headerString() {
        return this.state?.headerString;
    }

    set headerString(value) {
        if (this.state.headerString === value) return;
        this.state.headerString = value;
        setTimeout(() => this.constructToken());
    }

    get signingKey() {
        return this.state?.signingKey;
    }

    set signingKey(value) {
        if (this.state.signingKey === value) return;
        this.state.signingKey = value;
        setTimeout(() => this.constructToken());
    }

    async checkValidity() {
        let header = JSON.parse(atob(this.state.jwt.split('.')[0]));
        try {
            await JWT.validate(this.state.jwt, { 
                algorithm: header.alg || 'HS256',
                secretOrKey: this.state.signingKey || 'ABCDEF'
            });
            this.state.valid = true;
        } catch (e) {
            this.state.valid = false;
        }
    }

    set jwt(value) {
        if (this.state.jwt === value)
            return;
        
        this.state.jwt = value;
        setTimeout(async () => {

            if (this.state.jwt.split('.').length != 3) {
                this.state.errorMessage = `Malformed JWT: Three sections separated by dots are required.`;
                this.state.claimsString = '{}';
                this.state.headerString = '{}';
                this.saveState();
                return;
            }

            console.log(`parsing token`);
            try {
                let result = await JWT.decodeUntrusted(this.state.jwt);
                
                this.checkValidity();

                this.state.headerString = JSON.stringify(JSON.parse(atob(this.state.jwt.split('.')[0])), undefined, 2);
                this.signature = this.state.jwt.split('.')[2];

                this.claims = result.claims;
                this.state.claimsString = JSON.stringify(this.claims, undefined, 2);
                this.state.errorMessage = null;
            } catch (e) {
                console.error(e);
                this.claims = null;
                this.state.errorMessage = e.message;
            }
            
            this.saveState();
        })
    }

    async constructToken() {
        let header : any, claims : any;
        try {
            header = JSON.parse(this.state.headerString);
        } catch (e) {
            this.state.errorMessage = `Cannot parse header: ${e.message}`;
            return;
        }

        try {
            claims = JSON.parse(this.state.claimsString);
        } catch (e) {
            this.state.errorMessage = `Cannot parse claims: ${e.message}`;
            return;
        }

        let token = await JWT.encode(claims, {
            algorithm: header.alg || 'HS256',
            secretOrKey: this.state.signingKey || 'ABCDEF'
        })

        this.state.jwt = token.string;
        this.state.errorMessage = null;

        this.checkValidity();

        this.saveState();
    }
}