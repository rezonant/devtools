import { NgModule } from "@angular/core";
import { TrustedHtmlPipe } from "./trusted-html.pipe";

const DECLS = [
    TrustedHtmlPipe
];

@NgModule({
    declarations: DECLS,
    exports: DECLS
})
export class DevtoolsCommonModule {
}