import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Session, SessionService } from "../session-service";
import { Tool } from "../tools";

@Component({
    templateUrl: './manage-session.component.html',
    styleUrls: ['./manage-session.component.scss']
})
export class ManageSessionComponent {
    constructor(
        @Inject(MAT_DIALOG_DATA)
        private data : { session : Session },
        private sessionService : SessionService
    ) {
    }

    get session() {
        return this.data?.session;
    }

    getLabelForTool(tool : Tool) {
        return this.sessionService.getLabelForTool(tool);
    }
}