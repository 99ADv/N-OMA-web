//#region Angular
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
//#endregion

//#region Services
import { UserService } from '../../services/api/user/user.service';
//#endregion

@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private userService: UserService
  ){}

  canActivate(): boolean {
    if(this.userService.LoggedIn()) return true;

    this.router.navigate(['/login']);
    return false;
  }
}