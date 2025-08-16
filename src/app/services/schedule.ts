import { inject, Injectable, signal } from '@angular/core';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
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
    public disabled: boolean;

    public getData(): void {
        const today = new Date().toISOString();
        this.supabase.getData('horarios', '*, trabajos(*), festividad!inner(*)').gt('festividad.fecha_bloqueo', today).then(({ data }) => {
            if (data) {
                this.festivity = data[0].festividad;
                this.supabase.getData('asignaciones', '*, usuarios(*), horarios(*)').eq('horarios.id_festividad', this.festivity.id).then(response => {
                    const usersData = response.data;
                    this.setUserScheduleData(data, usersData);

                    this.formatScheduleData(data, usersData);
                });
            }
        });
    }

    public getRealTimeData(): void {
        this.supabase.supabase.channel('public:asignaciones').on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'asignaciones' },
            (payload: RealtimePostgresChangesPayload<any>) => this.handleRealtimePayload(payload)
        ).subscribe();
    }

    private async handleRealtimePayload(payload: RealtimePostgresChangesPayload<any>): Promise<void> {
        switch (payload.eventType) {
            case 'INSERT':
                this.supabase.getData('usuarios', '*').eq('id', payload.new.id_usuario).then(({ data }) => {
                    const user = data[0];
                    this.data.update((currentData) => {
                        return currentData.map(group => {
                            const updatedHorarios = group.horarios.map(schedule => {
                                if (schedule.id === payload.new.id_horario) {
                                    this
                                    const newGente = [
                                        ...schedule.gente,
                                        {
                                            id: user.id,
                                            assignmentId: payload.new.id,
                                            trackId: `${schedule.trackId}-${payload.new.id_usuario}`,
                                            nombre: `${user.nombre} ${user.apellido}`,
                                            email: user.email
                                        }
                                    ];

                                    if (this.userService.user.id === payload.new.id_usuario) {
                                        this.userService.user.assignmentPlace = group.puesto;
                                        this.userService.user.assignmentId = payload.new.id;
                                        this.userService.user.schedule = schedule.horaInicio;
                                    }

                                    return {
                                        ...schedule,
                                        gente: newGente,
                                        bloqueado: newGente.length >= group.limite
                                    };
                                }
                                return schedule;
                            });
                            return {
                                ...group,
                                horarios: updatedHorarios
                            };
                        });
                    });
                });
                break;
            case 'DELETE':
                this.data.update((currentData) => {
                    const auxArray = currentData.map((group) => {
                        group.horarios.forEach((schedule) => {
                            schedule.gente = schedule.gente.filter(user => user.assignmentId !== payload.old['id']);
                            schedule.bloqueado = schedule.gente.length >= group.limite;
                        });
                        return group;
                    });

                    return auxArray;
                });
                break;
        }
        this.disabled = false;
  }

    private formatScheduleData(data: any, assignmentsData: any): void {
        const groups = data.reduce((acc, item) => {
            const puesto = item.trabajos.nombre;
            const hora = item.horario.substring(0, 5);

            const users = assignmentsData.reduce((acc, { usuarios, id, id_horario }) => {
                if (id_horario === item.id) {
                    return [...acc, { ...usuarios, assignmentId: id }];
                }

                return acc;
            }, []);

            if (!acc.has(puesto)) {
                acc.set(puesto, {
                    puesto,
                    id: item.trabajos.id,
                    limite: item.trabajos.limite,
                    horarios: []
                });
            }

            const grupo = acc.get(puesto);
            let jornada = (grupo.horarios as { id: string; trackId: string; horaInicio: string; bloqueado: boolean; gente: any[]; }[]).find(({ horaInicio }) => horaInicio === hora);

            if (!jornada) {
                jornada = {
                    id: item.id,
                    trackId: `${item.trabajos.id}-${item.id}`,
                    horaInicio: hora,
                    bloqueado: item.trabajos.limite <= users.length,
                    gente: []
                };
                grupo.horarios.push(jornada);
            }

            if (users?.length) {
                jornada.gente = users.map(user => {
                    return {
                        id: user.id,
                        assignmentId: user.assignmentId,
                        trackId: `${item.trabajos.id}-${item.id}-${user.id}`,
                        nombre: `${user.nombre} ${user.apellido || ''}`,
                        email: user.email
                    };
                });
            }

            return acc;
        }, new Map());

        const auxArray = Array.from(groups.values());
        auxArray.sort((a, b) => a['puesto'] > b['puesto'] ? 1 : -1);

        auxArray.forEach(group => {
            group['horarios'].sort((a, b) => {
                if (a.horaInicio === '00:00') {
                    return 1;
                } else if (b.horaInicio === '00:00') {
                    return -1;
                }

                return a.horaInicio > b.horaInicio ? 1 : -1;
            });
        });
        this.data.set(auxArray);
    }

    private setUserScheduleData(data: any, assignmentsData: any): void {
        const assignment = assignmentsData.find(({ id_usuario }) => id_usuario === this.userService.user.id);
        const scheduleData = data.find(({ id }) => id === assignment?.id_horario);

        if (scheduleData) {
            this.userService.user.assignmentPlace = scheduleData.trabajos?.nombre;
            this.userService.user.assignmentId = assignment.id;
            this.userService.user.schedule = scheduleData.horario.substring(0, 5);
        }
    }

    addToWork(id_horario: string): any {
        return this.supabase.insertData('asignaciones', {
            id_usuario: this.userService.user.id,
            id_horario
        });
    }

    removeFromWork(): any {
        return this.supabase.removeData('asignaciones', this.userService.user.assignmentId);
    }
}
