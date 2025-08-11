import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
    RouterStateSnapshot,
    UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { CookiesService } from '../services/cookies';

@Injectable({
    providedIn: 'root',
})
export class AuthLoginGuard implements CanActivate {
    constructor(
        private cookiesService: CookiesService,
        private router: Router,
    ) {}

    canActivate(
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot,
    ):
        | Observable<boolean | UrlTree>
        | Promise<boolean | UrlTree>
        | boolean
        | UrlTree {

        if (!this.cookiesService.get()) {
            return true;
        }

        this.router.navigate(['/main']);

        return false;
    }
}
