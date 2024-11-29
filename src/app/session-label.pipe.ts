import { Pipe } from "@angular/core";
import { Session, SessionService } from "./session-service";

@Pipe({
    name: 'sessionLabel',
    pure: false,
    standalone: false
})
export class SessionLabelPipe {
    constructor(
        private sessionService : SessionService
    ) {
    }

    transform(tab : Session) {
        return this.sessionService.getLabelForSession(tab);
    }
}