import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { UserService } from '../../services/user';

@Component({
    selector: 'main-root',
    templateUrl: './main.html',
    styleUrls: ['./main.sass'],
    imports: [
        CommonModule
    ]
})
export default class MainComponent implements OnInit, OnDestroy {

    public userService: UserService = inject(UserService);
    private destroyed$: Subject<void> = new Subject();

    ngOnInit() {
        this.userService.getData(this.destroyed$);
        this.userService.data$.subscribe(data => {
            console.log('Data received in main component:', data);
        });
    }

    ngOnDestroy(): void {
        this.destroyed$.complete();
    }

    data = [
        {
            puesto: 'montaje',
            jornadas: [{
                horaInicio: '12:00',
                horaFin: '14:00',
                gente: [{
                    nombre: 'Jorge Navalon Ucles',
                    email: 'firi96@gmail.com'
                }]
            }]
        },
        {
            puesto: 'barra',
            jornadas: [{
                horaInicio: '16:00',
                horaFin: '19:00',
                gente: [{
                    nombre: 'Claudio Higón Martínez',
                    email: 'claudiosfero@gmail.com'
                }, {
                    nombre: 'Pepe',
                    email: 'Pepe@gmail.com'
                }]
            }, {
                horaInicio: '19:00',
                horaFin: '22:00',
                gente: [{
                    nombre: 'Pepet',
                    email: 'pepet@gmail.com'
                }, {
                    nombre: 'Aitor',
                    email: 'aitor@gmail.com'
                }, {
                    nombre: 'Andres',
                    email: 'andres@gmail.com'
                }]
            }]
        }
    ]
}
