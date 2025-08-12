import { inject, Injectable } from '@angular/core';
import { SupabaseService } from './supabase';

@Injectable({
    providedIn: 'root',
})
export class UserService {

    public supabase: SupabaseService = inject(SupabaseService);

    public user!: { id?: string; email: string; name: string, assignmentId?: string; assignmentPlace?: string; schedule?: string };

    public getUserData(): void {
        this.supabase.getData('usuarios').eq('email', this.user.email).single().then(({ data }) => {
            this.user.id = data?.id;
        });
    }

    public registerUser(email: string, name: string, familyName: string): any {
        return this.supabase.insertData('usuarios', {
            email,
            nombre: name,
            apellido: familyName
        });
    }
}
