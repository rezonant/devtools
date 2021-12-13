import { NgModule, Type } from "@angular/core";
import { Base64Component } from "./base64.component";
import { TestTool1Component } from "./test-tool-1.component";
import { ToolHostComponent } from "./tool-host.component";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';

import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HtmlViewComponent, HtmlViewerComponent, JsonViewComponent, JsonViewerComponent, ToolComponent } from ".";
import { MonacoEditorModule } from "ngx-monaco-editor";
import { HtmlEntitiesReferenceComponent } from "./html-entities-reference.component";
import { UrlEncodingReferenceComponent } from "./url-encoding-reference.component";
import { JwtViewerComponent } from "./jwt-viewer.component";
import { Wikipedia } from "./wikipedia";
import { WikipediaComponent } from "./wikipedia.component";
import { DevtoolsCommonModule } from "../common";
import { WebSocketTesterComponent } from "./websocket-tester.component";
import { ToolLabelPipe } from "./tool-label.pipe";
import { ToolRegistry } from "./tool-registry";
import { MatTooltipModule } from "@angular/material/tooltip";
import { NotepadComponent } from "./notepad.component";
import { WebcamTesterComponent } from "./webcam-tester.component";
import { CrontabComponent } from "./crontab.component";
import { BrowserComponent } from "./browser.component";
import { RegexComponent } from "./regex.component";
import { RandomComponent } from "./random.component";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { CalculatorComponent } from "./calculator.component";
import { UnitsComponent } from "./units.component";

const COMPONENTS = [
    Base64Component,
    JsonViewerComponent,
    HtmlViewerComponent,
    HtmlEntitiesReferenceComponent,
    UrlEncodingReferenceComponent,
    JwtViewerComponent,
    WikipediaComponent,
    WebSocketTesterComponent,
    NotepadComponent,
    WebcamTesterComponent,
    CrontabComponent,
    BrowserComponent,
    RegexComponent,
    RandomComponent,
    CalculatorComponent,
    UnitsComponent
]

@NgModule({
    declarations: [
        ToolHostComponent,
        JsonViewComponent,
        HtmlViewComponent,
        TestTool1Component,
        ToolLabelPipe,
        ...COMPONENTS
    ],
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatSelectModule,
        MatInputModule,
        MatMenuModule,
        MatTabsModule,
        MatDividerModule,
        MatTooltipModule,
        MatSlideToggleModule,
        MatAutocompleteModule,
        MatCheckboxModule,
        TextFieldModule,
        MatProgressSpinnerModule,
        MonacoEditorModule,
        DevtoolsCommonModule
    ],
    exports: [
        ToolHostComponent,
        ToolLabelPipe
    ],
    providers: [
        { provide: ToolRegistry, useValue: new ToolRegistry(COMPONENTS) },
        Wikipedia
    ]
})
export class ToolsModule {

}