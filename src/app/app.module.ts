import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';

import { HomeComponent } from './home/home.component';
import { ToolsModule } from './tools';
import { AboutComponent } from './about/about.component';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule } from '@astronautlabs/monaco';
import { SessionService } from './session-service';
import { ManageSessionsComponent } from './manage-sessions/manage-sessions.component';
import { NewSessionComponent } from './new-session/new-session.component';
import { ManageSessionComponent } from './manage-session/manage-session.component';
import { SessionLabelPipe } from './session-label.pipe';
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AboutComponent,
    ManageSessionsComponent,
    NewSessionComponent,
    ManageSessionComponent,
    SessionLabelPipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatDividerModule,
    MatMenuModule,
    MatAutocompleteModule,
    MatDialogModule,
    MatTooltipModule,
    MonacoEditorModule.forRoot({
      baseUrl: './assets'
    }),
    ToolsModule
  ],
  providers: [
    SessionService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { 
}
