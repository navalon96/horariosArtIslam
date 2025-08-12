import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { scheduleService } from '../../services/schedule';
import { UserService } from '../../services/user';

@Component({
    selector: 'main-root',
    templateUrl: './main.html',
    styleUrls: ['./main.sass'],
    imports: [
        CommonModule
    ]
})
export default class MainComponent implements OnInit {

    public userService: UserService = inject(UserService);
    public scheduleService: scheduleService = inject(scheduleService);

    ngOnInit() {
        this.scheduleService.getData();
        this.userService.getUserData();
    }

    addToWork(placementId: string, placementName: string, schedule): void {
        this.scheduleService.addToWork({
            id_trabajo: placementId,
            horario: schedule
        }).then(() => {
            this.scheduleService.getData();
        });
    }

    removeToWork(): void {
        this.scheduleService.removeToWork().then(() => {
            this.scheduleService.getData();
        });
    }
}
