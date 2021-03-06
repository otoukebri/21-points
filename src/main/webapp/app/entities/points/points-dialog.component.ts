import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';

import { Observable } from 'rxjs/Rx';
import { NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { JhiEventManager, JhiAlertService } from 'ng-jhipster';

import { Points } from './points.model';
import { PointsPopupService } from './points-popup.service';
import { PointsService } from './points.service';
import { User, UserService } from '../../shared';
import { ResponseWrapper } from '../../shared';

@Component({
    selector: 'jhi-points-dialog',
    templateUrl: './points-dialog.component.html'
})
export class PointsDialogComponent implements OnInit {

    points: Points;
    isSaving: boolean;

    users: User[];
    dateDp: any;

    constructor(
        public activeModal: NgbActiveModal,
        private alertService: JhiAlertService,
        private pointsService: PointsService,
        private userService: UserService,
        private eventManager: JhiEventManager
    ) {
    }

    ngOnInit() {
        this.isSaving = false;
        this.userService.query()
            .subscribe((res: ResponseWrapper) => { this.users = res.json; }, (res: ResponseWrapper) => this.onError(res.json));
    }

    clear() {
        this.activeModal.dismiss('cancel');
    }

    save() {
        this.isSaving = true;

        // convert booleans to ints
        this.points.exercise = (this.points.exercise) ? 1 : 0;
        this.points.meals = (this.points.meals) ? 1 : 0;
        this.points.alcohol = (this.points.alcohol) ? 1 : 0;

        if (this.points.id !== undefined) {
            this.subscribeToSaveResponse(
                this.pointsService.update(this.points));
        } else {
            this.subscribeToSaveResponse(
                this.pointsService.create(this.points));
        }
    }

    private subscribeToSaveResponse(result: Observable<Points>) {
        result.subscribe((res: Points) =>
            this.onSaveSuccess(res), (res: Response) => this.onSaveError(res));
    }

    private onSaveSuccess(result: Points) {
        this.eventManager.broadcast({ name: 'pointsListModification', content: 'OK'});
        this.isSaving = false;
        this.activeModal.dismiss(result);
    }

    private onSaveError(error) {
        try {
            error.json();
        } catch (exception) {
            error.message = error.text();
        }
        this.isSaving = false;
        this.onError(error);
    }

    private onError(error) {
        this.alertService.error(error.message, null, null);
    }

    trackUserById(index: number, item: User) {
        return item.id;
    }
}

@Component({
    selector: 'jhi-points-popup',
    template: ''
})
export class PointsPopupComponent implements OnInit, OnDestroy {

    routeSub: any;

    constructor(
        private route: ActivatedRoute,
        private pointsPopupService: PointsPopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe((params) => {
            if ( params['id'] ) {
                this.pointsPopupService
                    .open(PointsDialogComponent as Component, params['id']);
            } else {
                this.pointsPopupService
                    .open(PointsDialogComponent as Component);
            }
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
