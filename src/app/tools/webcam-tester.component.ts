import { Component } from "@angular/core";
import { ToolComponent } from "./tool-component";

export interface WebcamTesterState {
    deviceId : string;
}

@Component({
    template: `
        @if (missingPermission) {
          <h1>Need Permission</h1>
          <p>This tool shows device information and a preview for your HTML5-compatible
          webcams.</p>
          <button mat-raised-button (click)="requestPermission()">Allow</button>
        } @else {
          <header>
            <mat-form-field appearance="outline" floatLabel="always">
              <mat-label>Device</mat-label>
              <mat-select name="deviceId" [(ngModel)]="deviceId">
                @for (device of devices; track device) {
                  <mat-option [value]="device.deviceId">
                    {{device.label}}
                  </mat-option>
                }
              </mat-select>
            </mat-form-field>
          </header>
          <!-- <pre>{{devices | json}}</pre> -->
          @if (device) {
            <h1>Device</h1>
            <div>
              Device ID: <code>{{deviceId}}</code>
            </div>
            <div>
              Group ID: <code>{{device.groupId}}</code>
            </div>
            <pre>{{device | json}}</pre>
            <div class="tracks">
              @for (track of tracks; track track) {
                <div class="track">
                  <h2>Track</h2>
                  <div>
                    ID: <code>{{track.id}}</code>
                  </div>
                  <div>
                    Kind: <code>{{track.kind}}</code>
                  </div>
                  <div>
                    Label: <code>{{track.label}}</code>
                  </div>
                  <div>
                    Muted: <code>{{track.muted}}</code>
                  </div>
                  <div>
                    Content Hint: <code>{{track.contentHint}}</code>
                  </div>
                  <div>
                    Enabled: <code>{{track.enabled}}</code>
                  </div>
                </div>
              }
            </div>
            <br/>
            <h2>Preview</h2>
            @if (stream) {
              <video [srcObject]="stream" autoplay></video>
            }
          }
        }
        `,
    styles: [`
        :host {
            display: flex;
            flex-direction: column;
        }

        header {
            display: flex;
            mat-form-field {
                flex-grow: 1;
            }
        }
    `]
})
export class WebcamTesterComponent extends ToolComponent<WebcamTesterState> {
    override label = 'Webcam';
    static override label = 'Webcam';
    static override id = 'Webcam';

    missingPermission = false;

    get deviceId() {
        return this.state?.deviceId;
    }

    set deviceId(value) {
        this.state.deviceId = value;
        setTimeout(() => this.saveState());
        this.startCamera();
    }

    override async afterToolInit() {
        await this.refreshDevices();
        if (this.deviceId) {
            if (this.missingPermission)
                console.log(`Cannot start camera: Missing permission`);
            else
                this.startCamera();
        }
    }

    devices : MediaDeviceInfo[];

    get device() {
        if (!this.devices)
            return undefined;
        return this.devices.find(x => x.deviceId === this.deviceId);
    }

    async refreshDevices() {
        this.devices = await navigator.mediaDevices.enumerateDevices();
        this.devices = this.devices.filter(x => x.kind === 'videoinput');
        this.missingPermission = (this.devices.length === 0 || (this.devices.length === 1 && this.devices[0].deviceId === ''));
    }
    
    stream : MediaStream;
    tracks : MediaStreamTrack[];

    async startCamera() {
        console.log(`Starting camera ${this.deviceId}`);
        this.stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: this.deviceId }});
        this.tracks = this.stream.getTracks();
    }

    async requestPermission() {
        await navigator.mediaDevices.getUserMedia({ video: true });
        this.refreshDevices();
    }
}