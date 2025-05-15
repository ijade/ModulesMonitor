import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './AuthService';

@Injectable({ providedIn: 'root' })
export class WithoutAuthGuardService implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}
  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
      return false;
    }
    return true;
  }
}