import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../../environments/environment';
import { CookiesService } from '../../services/cookies';
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
    public supabase: SupabaseClient = createClient(environment.supabase.supabase_url, environment.supabase.supabase_service_role_key);
    private cookiesService: CookiesService = inject(CookiesService);
    // private auth: Auth = inject(Auth);
    private router: Router = inject(Router);
    private userService: UserService = inject(UserService);

    ngOnInit(): void {
        (window as any).handleCredentialResponse = this.handleCredentialResponse.bind(this);
    }

    handleCredentialResponse(response: any) {
        const decodedToken: any = jwtDecode(response.credential);
        console.log(decodedToken);

        // Aquí puedes guardar el token o los datos del usuario en un servicio o localStorage
        // para mantener la sesión
        localStorage.setItem('user', JSON.stringify(decodedToken));

        // Redirigir al usuario
        this.router.navigate(['/main']);
    }

    public loginWithGoogle(): void {
        // signInWithPopup(this.auth, new GoogleAuthProvider()).then(
        //     async (responseLogin) => {
        //         if (responseLogin.user) {
        //             const id = responseLogin.user.uid;
        //             const email = responseLogin.user.email as string;


        //             this.supabase.from('usuarios').select('*').then(usuarios => {
        //                 console.log('Clau is usuarios', usuarios);
        //             });
        //             // this.userService.user = {
        //             //     email: loggedUser?.['email'] as string,
        //             //     name: responseLogin.user.displayName as string
        //             // };

        //             // if (!loggedUser) {
        //             //     this.userService.registerUser(id, email);
        //             // }

        //             this.cookiesService.set();
        //             this.router.navigate(['/main']);
        //         }
        //     }
        // );
    }
}
