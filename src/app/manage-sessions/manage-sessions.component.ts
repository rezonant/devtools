import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material/dialog";
import { Session, SessionService } from "../session-service";
import { Tool } from "../tools";

@Component({
    templateUrl: './manage-sessions.component.html',
    styleUrls: ['./manage-sessions.component.scss'],
    standalone: false
})
export class ManageSessionsComponent {
    constructor(
        private sessionService : SessionService,
        private matDialogRef : MatDialogRef<ManageSessionsComponent>
    ) {
    }

    get currentSession() {
        return this.sessionService.currentSession;
    }

    get activeSessions() {
        return this.sessionService.activeSessions;
    }

    get savedSessions() {
        return this.sessionService.inactiveSessions;
    }

    showJsonTool : Tool;

    showJsonForTool(tool : Tool) {
        if (this.showJsonTool === tool)
            this.showJsonTool = null;
        else
            this.showJsonTool = tool;
    }

    isActive(session : Session) {
        return this.currentSession === session || this.activeSessions.includes(session);
    }

    deleteSession(session : Session) {
        if (this.isActive(session))
            return;
        
        this.sessionService.deleteSavedSession(session);
    }

    renameSession(session : Session) {
        let label = prompt('New name for session', session.state.label);
        if (!label)
            return;
        this.sessionService.setSessionLabel(session, label);
    }

    openSessionInNewTab(session : Session) {
        window.open(`${window.location.origin}#${session.id}`, '_blank');
    }

    async moveToCurrentSession(session : Session, tool : Tool) {
        await this.sessionService.addTool(tool.toolId, tool.label, tool.state);
        this.sessionService.removeToolFromSession(session, tool);
        this.matDialogRef.close();
    }

    async copyToCurrentSession(tool : Tool) {
        await this.sessionService.addTool(tool.toolId, tool.label, tool.state);
        this.matDialogRef.close();
    }
}