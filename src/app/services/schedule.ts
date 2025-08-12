import { inject, Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase';
import { UserService } from './user';

@Injectable({
    providedIn: 'root',
})
export class scheduleService {

    private supabase: SupabaseService = inject(SupabaseService);
    private userService: UserService = inject(UserService);

    public data = signal([]);
    public festivity;

    public getData(): void {
        const today = new Date().toISOString();
        this.supabase.getData('horarios', '*, usuarios(*), trabajos(*), festividad!inner(*)').gt('festividad.fecha_bloqueo', today).then(({ data }) => {
            if (data) {
                this.festivity = data[0].festividad;
                const userData = data.find((item: any) => item.usuarios.email === this.userService.user.email)
                this.userService.user.assignmentPlace = userData?.trabajos?.nombre;
                this.userService.user.assignmentId = userData?.id;
                this.userService.user.schedule = userData?.horario.substring(0, 5);
                const groups = data.reduce((acc, item) => {
                    const puesto = item.trabajos.nombre;
                    const hora = item.horario.substring(0, 5);
                    const nombreUsuario = `${item.usuarios.nombre} ${item.usuarios.apellido}`;
                    const emailUsuario = item.usuarios.email;

                    if (!acc.has(puesto)) {
                        acc.set(puesto, {
                            puesto,
                            id: item.trabajos.id,
                            limite: item.trabajos.limite,
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

                    jornada.gente.push({
                        id: item.usuarios.id,
                        trackId: `${item.trabajos.id}-${item.id}-${item.usuarios.id}`,
                        nombre: nombreUsuario,
                        email: emailUsuario
                    });

                    return acc;
                }, new Map());

                this.data.set(Array.from(groups.values()));
            }
        });
    }

    addToWork(data: { id_trabajo: string, horario: string }): any {
        return this.supabase.insertData('horarios', {
            id_usuario: this.userService.user.id,
            id_festividad: this.festivity.id,
            id_trabajo: data.id_trabajo,
            horario: `${data.horario}:00+00`
        });
    }

    removeToWork(): any {
        return this.supabase.removeData('horarios', this.userService.user.assignmentId);
    }
}
