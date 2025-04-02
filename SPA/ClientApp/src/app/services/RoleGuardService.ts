import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from './AuthService';

@Injectable({ providedIn: 'root' })
export class RoleGuardService implements CanActivate {
    constructor(private router: Router, private authService: AuthService) { }
    canActivate(route: ActivatedRouteSnapshot): boolean {
        const expectedRoles = route.data.expectedRoles;

        let contains = false;
        const role = this.authService.getRole();

        for (let i = 0; i < expectedRoles.length; i++) {
            const expectedRole = expectedRoles[i];
            if(role === expectedRole){
                contains = true;
                break;
            }
        }
        
        if (!contains) {
            this.router.navigateByUrl("/");
        }
        return contains;
    }
}