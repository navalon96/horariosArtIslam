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

    addToWork(scheduleId: string): void {
        this.scheduleService.addToWork(scheduleId).then(() => {
            this.scheduleService.getData();
        });
    }

    removeToWork(): void {
        this.scheduleService.removeFromWork().then(() => {
            this.userService.user.assignmentId = undefined;
            this.userService.user.assignmentPlace = undefined;
            this.userService.user.schedule = undefined;
            this.scheduleService.getData();
        });
    }
}
