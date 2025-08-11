import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class UserService {

    data$ = new Subject();
    user!: { email: string; name: string };

    public supabase: SupabaseClient = createClient(environment.supabase.supabase_url, environment.supabase.supabase_service_role_key);

    public getData(destroyed$: Subject<void>): void {
        console.log('Clau is environments', environment);
        this.supabase.from('horarios').select('*, usuarios(*), trabajos(*)').then(({ data }) => {
            if (data) {
                const groups = data.reduce((acc, item) => {
                    const puesto = item.trabajos.nombre;
                    const hora = item.horario.substring(0, 5);
                    const nombreUsuario = `${item.usuarios.nombre} ${item.usuarios.apellido1 || ''} ${item.usuarios.apellido2 || ''}`;
                    const emailUsuario = item.usuarios.email;

                    if (!acc.has(puesto)) {
                        acc.set(puesto, {
                            puesto: puesto,
                            jornadas: []
                        });
                    }

                    const grupo = acc.get(puesto);
                    let jornada = (grupo.jornadas as { id: string, trackId: string, horaInicio: string, gente: any[] }[] ).find(({ horaInicio }) => horaInicio === hora);

                    if (!jornada) {
                        jornada = {
                            id: item.id,
                            trackId: `${item.trabajos.id}-${item.id}`,
                            horaInicio: hora,
                            gente: []
                        };
                        grupo.jornadas.push(jornada);
                    }

                    // Añadir la persona a la 'gente'
                    jornada.gente.push({
                        id: item.usuarios.id,
                        trackId: `${item.trabajos.id}-${item.id}-${item.usuarios.id}`,
                        nombre: nombreUsuario,
                        email: emailUsuario
                    });

                    return acc;
                }, new Map());

                this.data$.next(Array.from(groups.values()))
            }
        });
    }
}
