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
    standalone: true,
    imports: [CommonModule]
})
export default class LoginComponent implements OnInit {
    public env = environment;
    private supabase = inject(SupabaseService);
    private cookiesService = inject(CookiesService);
    private router = inject(Router);
    private userService = inject(UserService);

    ngOnInit(): void {
        (window as any).handleCredentialResponse = this.handleCredentialResponse.bind(this);
    }

    async handleCredentialResponse(response: any) {
        try {
            const decodedUser: any = jwtDecode(response.credential);
            const { email, name, family_name, given_name } = decodedUser;

            const userResponse = await this.supabase.getData('usuarios')
                .eq('email', email)
                .single();

            if (userResponse.data) {
                await this.goNextStep(email, name);
            } else {
                await this.userService.registerUser(email, given_name, family_name);
                await this.goNextStep(email, name);
            }
        } catch (error) {
            console.error('Login error:', error);
            // Aquí podrías mostrar un mensaje de error al usuario
        }
    }

    private async goNextStep(email: string, name: string): Promise<void> {
        this.userService.user = { email, name };
        this.cookiesService.set();
        await this.router.navigate(['/main']);
    }
}