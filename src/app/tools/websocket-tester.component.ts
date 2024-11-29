import { Component } from "@angular/core";
import { ToolComponent } from "./tool-component";

export interface WebSocketMessage {
    timestamp : number;
    message : string;
    dir : 'sent' | 'received';
}

export interface WebSocketState {
    url : string;
    history : WebSocketMessage[];
    errorMessage : string;
    pendingMessage : string;
}

@Component({
    template: `
        @if (state) {
          <header>
            <form (submit)="connect()">
              <mat-form-field appearance="outline" floatLabel="always">
                <mat-label>URL</mat-label>
                <input type="text" matInput [(ngModel)]="state.url" (ngModelChange)="saveState()" name="url" placeholder="ws://..." />
                <span matSuffix>
                  <span class="status">
                    {{connectionStatus || 'Closed'}}
                  </span>
                </span>
              </mat-form-field>
              @if (!isConnected) {
                <button mat-icon-button (click)="connect()" matTooltip="Connect to Server">
                  <mat-icon>send</mat-icon>
                </button>
              }
            </form>
            @if (isConnected) {
              <button mat-button (click)="disconnect()">
                <mat-icon>close</mat-icon>
                Disconnect
              </button>
            }
            <button mat-button (click)="clear()" [disabled]="!state.history?.length">
              <mat-icon>clear_all</mat-icon>
              Clear
            </button>
          </header>
          @if (state.history) {
            @for (message of state.history; track message) {
              <div class="message">
                @if (message.dir === 'received') {
                  <mat-icon>arrow_downward</mat-icon>
                }
                @if (message.dir === 'sent') {
                  <mat-icon>arrow_upward</mat-icon>
                }
                <pre>{{formatJson(message.message)}}</pre>
                <time>{{message.timestamp | date : 'short' }}</time>
              </div>
            }
          }
          <footer>
            <h2>Respond</h2>
            <ngx-monaco-editor
              #monaco
              [options]="monacoOptions"
              [(ngModel)]="state.pendingMessage"
              (ngModelChange)="saveState()"
            ></ngx-monaco-editor>
            <div style="text-align: right;">
              <button mat-raised-button color="primary" (click)="sendMessage()">
                <mat-icon>send</mat-icon>
                Send
              </button>
            </div>
          </footer>
        }
        `,
    styles: [`
        .connect-form {
            width: 100%;
            max-width: 500px;
            margin: 0 auto;
        }

        form {
            display: flex;
            align-items: baseline;
            gap: 1em;

            mat-form-field {
                flex-grow: 1;
            }
        }

        .message {
            display: flex;
            align-items: flex-start;
            border: 1px solid #6d6d6d;
            border-radius: 3px;
            margin: 0.5em 0;
            padding: 0.5em;
            gap: 0.5em;

            pre {
                /* overflow: hidden;
                text-overflow: ellipsis; */
                white-space: pre-wrap;
                word-break: break-word;
                margin: 0;
                flex-grow: 1;
            }

            time {
                color: #5c5c5c;
            }
        }

        header {
            display: flex;
            align-items: baseline;
            margin: 0.5em 0;
            border-radius: 3px;
            min-height: 2.5em;
            gap: 1em;

            .status {
                margin: 0 0.5em;
                background: #1e1e1e;
                color: #0af9b7;
                padding: 0 5px;
                border-radius: 3px;
                text-transform: uppercase;
                font-size: 10px;
                position: relative;
                top: -5px;
            }

            form {
                flex-grow: 1;
            }
        }

        footer {
            display: flex;
            flex-direction: column;
            gap: 1em;
        }

        @media (max-width: 400px) {
            header {
                flex-direction: column;
                align-items: center;
            }
        }
    `]
})
export class WebSocketTesterComponent extends ToolComponent<WebSocketState> {
    override label = 'WebSocket';
    static override label = 'WebSocket';
    static override id = 'websocket';

    monacoOptions = {
        theme: 'vs-dark', 
        language: 'json',
        automaticLayout: true
    };

    socket : WebSocket;
    connectionStatus : 'closed' | 'closing' | 'connecting' | 'open';

    disconnect() {
        this.socket.close();
    }

    get isEmpty() {
        if (!this.state?.history)
            return true;
        return this.state.history.length === 0 && !this.socket;
    }

    get isConnected() {
        return this.connectionStatus === 'open';
    }

    formatJson(str : string) {
        if (str === null)
            return 'null';
        if (str === undefined)
            return '';
        
        try {
            return JSON.stringify(JSON.parse(str), undefined, 2);
        } catch (e) {
            return str;
        }
    }

    clear() {
        this.state.history = [];
        this.saveState();
    }

    connect() {
        if (!this.state)
            return;

        if (!this.state.history)
            this.state.history = [];
        try {
            this.state.errorMessage = null;
            this.connectionStatus = 'connecting';
            this.socket = new WebSocket(this.state.url);
            this.socket.addEventListener('open', ev => this.connectionStatus = 'open');
            this.socket.addEventListener('close', ev => this.connectionStatus = 'closed');
            this.socket.addEventListener('message', ev => {
                this.state.history.push({
                    timestamp: Date.now(),
                    message: ev.data,
                    dir: 'received'
                });
                this.saveState();
            });
            this.socket.addEventListener('error', ev => {
                this.state.errorMessage = (ev as ErrorEvent).message;
            });
        } catch (e) {
            this.connectionStatus = 'closed';
            this.state.errorMessage = e.message;
        }
    }

    sendMessage() {
        if (!this.state)
            return;
        this.socket.send(this.state.pendingMessage);
        this.state.history.push({
            timestamp: Date.now(),
            message: this.state.pendingMessage,
            dir: 'sent'
        });
    }
}