//#region Angular
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
//#endregion

//#region Others
import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';
import { environment } from 'src/environments/environment';
//#endregion

import { AppRoutingModule } from './app-routing.module';

//#region Components
import { AppComponent } from './index/app.component';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { TokenInterceptorService } from './core/services/tools/token-interceptor/token-interceptor.service';
import { HeaderComponent } from './components/main/header/header.component';
import { UserNavComponent } from './components/main/user-nav/user-nav.component';
import { AdminComponent } from './pages/admin/admin.component';
import { CallsComponent } from './pages/calls/calls.component';
import { ChatComponent } from './pages/chat/chat.component';
import { NotificationComponent } from './pages/notification/notification.component';
import { ChatMessageComponent } from './components/chat-message/chat-message.component';
import { TicketComponent } from './pages/ticket/ticket.component';
import { TelComponent } from './pages/tel/tel.component';
import { AgentComponent } from './pages/agent/agent.component';
import { Page403Component } from './pages/page403/page403.component';
// import { ServiceWorkerModule } from '@angular/service-worker';
//#endregion

const config: SocketIoConfig = { url: environment.api_ws, options: { path: environment.path } };

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    HeaderComponent,
    UserNavComponent,
    AdminComponent,
    CallsComponent,
    ChatComponent,
    NotificationComponent,
    ChatMessageComponent,
    TicketComponent,
    TelComponent,
    AgentComponent,
    Page403Component
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    SocketIoModule.forRoot(config),
    // ServiceWorkerModule.register('ngsw-worker.js', {
    //   enabled: environment.production,
    //   // Register the ServiceWorker as soon as the app is stable
    //   // or after 30 seconds (whichever comes first).
    //   // registrationStrategy: 'registerWhenStable:30000'
    //   registrationStrategy: 'registerImmediately'
    // })
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
