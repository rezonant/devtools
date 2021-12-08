import { NgModule, Type } from "@angular/core";
import { Base64Component } from "./base64.component";
import { TestTool1Component } from "./test-tool-1.component";
import { ToolHostComponent } from "./tool-host.component";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HtmlViewComponent, HtmlViewerComponent, JsonViewComponent, JsonViewerComponent, ToolComponent } from ".";
import { MonacoEditorModule } from "ngx-monaco-editor";
import { HtmlEntitiesReferenceComponent } from "./html-entities-reference.component";
import { UrlEncodingReferenceComponent } from "./url-encoding-reference.component";
import { JwtViewerComponent } from "./jwt-viewer.component";

const COMPONENTS = [
    Base64Component,
    JsonViewerComponent,
    HtmlViewerComponent,
    HtmlEntitiesReferenceComponent,
    UrlEncodingReferenceComponent,
    JwtViewerComponent
]

export class ToolRegistry {
    constructor(readonly tools : Type<ToolComponent>[]) {
    }
}

@NgModule({
    declarations: [
        ToolHostComponent,
        JsonViewComponent,
        HtmlViewComponent,
        TestTool1Component,
        ...COMPONENTS
    ],
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatTabsModule,
        MonacoEditorModule
    ],
    exports: [
        ToolHostComponent
    ],
    providers: [
        { provide: ToolRegistry, useValue: new ToolRegistry(COMPONENTS) }
    ]
})
export class ToolsModule {

}