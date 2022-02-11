//#region Angular
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
//#endregion

//#region Component
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
//#endregion

//#region guard
import { AuthLoginGuard } from './core/guards/auth-login/auth-login.guard';
import { AuthGuard } from './core/guards/auth/auth.guard';
import { ChatComponent } from './pages/chat/chat.component';
import { CallsComponent } from './pages/calls/calls.component';
import { NotificationComponent } from './pages/notification/notification.component';
import { AdminComponent } from './pages/admin/admin.component';
import { TicketComponent } from './pages/ticket/ticket.component';
import { TelComponent } from './pages/tel/tel.component';
import { AgentComponent } from './pages/agent/agent.component';
import { Page403Component } from './pages/page403/page403.component';
//#endregion

const routes: Routes = [
  { path: '', redirectTo: '/chat', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [AuthLoginGuard] },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'chat', component: ChatComponent, canActivate: [AuthGuard] },
  { path: 'calls', component: CallsComponent, canActivate: [AuthGuard] },
  { path: 'notification', component: NotificationComponent, canActivate: [AuthGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [AuthGuard] },
  { path: 'ticket/:id', component: TicketComponent, canActivate: [AuthGuard] },
  { path: 'tel', component: TelComponent, canActivate: [AuthGuard] },
  { path: 'agent', component: AgentComponent, canActivate: [AuthGuard] },
  { path: '403', component: Page403Component, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})

export class AppRoutingModule { }