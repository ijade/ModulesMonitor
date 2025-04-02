import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './AuthService';

@Injectable({ providedIn: 'root' })
export class AuthGuardService implements CanActivate {
  constructor(private auth: AuthService, private router: Router) { }
  canActivate(): boolean {
    if (!this.auth.isAuthenticated()) {
      this.router.navigateByUrl("/login");
      return false;
    }
    return true;
  }
}