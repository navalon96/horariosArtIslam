import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth';
import { AuthLoginGuard } from './guards/auth-login';

const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./modules/login/login'),
        canActivate: [AuthLoginGuard]
    },
    {
        path: 'main',
        loadComponent: () => import('./modules/main/main'),
        canActivate: [AuthGuard]
    },
    {
        path: '**',
        redirectTo: 'login'
    }
];

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideZonelessChangeDetection(),
        provideRouter(routes)
    ]
};
