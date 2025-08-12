import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../../environments/environment';
import { CookiesService } from '../../services/cookies';
import { SupabaseService } from '../../services/supabase';
import { UserService } from '../../services/user';

@Component({
    selector: 'login-root',
    templateUrl: './login.html',
    styleUrls: ['./login.sass'],
    imports: [
        CommonModule
    ]
})
export default class LoginComponent implements  OnInit {

    public env = environment;
    public supabase: SupabaseService = inject(SupabaseService);
    private cookiesService: CookiesService = inject(CookiesService);
    private router: Router = inject(Router);
    private userService: UserService = inject(UserService);

    ngOnInit(): void {
        (window as any).handleCredentialResponse = this.handleCredentialResponse.bind(this);
    }

    handleCredentialResponse(response: any) {
        const decodedUser: any = jwtDecode(response.credential);
        const { email, name, family_name, given_name } = decodedUser;

        this.supabase.getData('usuarios').eq('email', email).single().then(response => {
            if (response.data) {
                this.goNextStep(email, name);
            } else {
                this.userService.registerUser(email, given_name, family_name).then(() => {
                    this.goNextStep(email, name);
                });
            }
        });
    }

    private goNextStep(email: string, name: string): void {
        this.userService.user = { email, name };
        this.cookiesService.set();

        this.router.navigate(['/main']);
    }

}
