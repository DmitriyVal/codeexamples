import { Component, OnInit, Input, ViewChild, HostListener } from '@angular/core';
import { FormControl, ControlContainer, NgForm } from "@angular/forms";
import { ActivatedRoute, Router, Params } from '@angular/router';
import 'rxjs/add/operator/switchMap';
import { Observable } from 'rxjs/Rx';

import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { MessageBoxService } from '../../services/message-box.service';
import { ComponentHasUnsavedChanges } from '../shared/Guard/PendingChangesGuard';
import { JobService } from '../../services/job.service';
import { EntitysService } from '../../services/entities.service';
import { DictionariesDataService } from "../../services/dictionaries/dictionaries.service";
import { UserService } from "../../services/user.service";
import { SecurityService } from '../../services/security.service';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

import { DictionaryRequestViewModel, ResultCode, SystemObjectViewModel, SystemActionViewModel, RasTlsMemberTypeViewModel } from '../../../view-models/view-models';
import {
    JobViewModel,
    JobRASViewModel,
    JobCommentViewModel,
    UserViewModel,
    JobFilterViewModel,
    FinancialYearViewModel,
    TerritoryViewModel,
    LineOfServiceViewModel,
    BusinessUnitViewModel,
    OperationUnitViewModel,
    UserDictionaryViewModel,
    OfficeViewModel,
    IndustryViewModel,
    ContextDictionatyRequestViewModel,
    AuthenticationViewModel,
    UserFilterViewModel,
    TeamRoleViewModel,
    RasTlsMemberViewModel,
    ResultT
} from "../../../view-models/view-models";

class Dictionaries {
    financialYears: FinancialYearViewModel[] = [];
    roles: TeamRoleViewModel[] = [];
}


@Component({
    template: require('./job-ras.component.html'),
    styles: [require('./job-ras.component.css')]
})
export class JobRasComponent implements OnInit, ComponentHasUnsavedChanges {
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private messageBoxService: MessageBoxService,
        private jobService: JobService,
        private userService: UserService,
        private entitiesService: EntitysService,
        private UserService: UserService,
        private securityService: SecurityService,
        private dictionariesDataService: DictionariesDataService,
        private toastr: ToastsManager,
    ) {
        this.isInSaving = false;
    }

    @HostListener('window:beforeunload')
    hasNotChanged(): Observable<boolean> | boolean {
        var hasNotInitialized = !this.ras || !this.formControl;
        return hasNotInitialized || this.formControl.untouched;
    }

    dictionaries: Dictionaries = new Dictionaries();
    datePipeFormat: string = "dd/MM/yyyy";
    dateTimePipeFormat: string = "dd/MM/yyyy HH:mm";

    ras: JobRASViewModel;
    user: UserViewModel;

    @ViewChild('rasForm') formControl: NgForm;

    currentUser: UserViewModel;
    currentAuthentity: AuthenticationViewModel = null;
    rasManager: UserDictionaryViewModel;
    rasPartner: UserDictionaryViewModel;

    isInSaving: boolean;
    editPermission: boolean;

    ngOnInit(): void {
        this.refresh();

        this.securityService.getCurrentUser().then(x => {
            this.currentAuthentity = x.Object;
            this.userService.getUser(x.Object.UserId).then(u => {
                this.currentUser = u.Object;
            });
        });
        this.getAllLists();
    }

    private EmptyMember: UserDictionaryViewModel = { Name: "", UserId: null }

    usersForAllocationSource(keyword: any) {

        var location = "ras";

        let promise = this.entitiesService.GetRasTlsMembers(location, keyword);

        return Observable.fromPromise(promise.then(result => result.Object));
    }
    selectUser(data: UserDictionaryViewModel, userType: 'partner' | 'manager', control: any) {
        var methodsDictionary = {
            'partner': {
                setId: (id: number) => { this.ras.PartnerMember.UserId = id },
                setReadOnly: (readOnly: boolean) => { this.ras.PartnerMember.ReadOnly = readOnly },
                setLastWorkFY: (value: number) => { this.ras.PartnerMember.LastWorkedFinancialYearId = value },
                setWorkedYears: (value: number) => { this.ras.PartnerMember.WorkedYears = value },
                setTempModel: (value: UserDictionaryViewModel) => { this.rasPartner = value },
                MemberType: SystemObjectViewModel.RAS,
                UserType: RasTlsMemberTypeViewModel.Partner
            },
            'manager': {
                setId: (id: number) => { this.ras.ManagerMember.UserId = id },
                setReadOnly: (readOnly: boolean) => { this.ras.ManagerMember.ReadOnly = readOnly },
                setLastWorkFY: (value: number) => { this.ras.ManagerMember.LastWorkedFinancialYearId = value },
                setWorkedYears: (value: number) => { this.ras.ManagerMember.WorkedYears = value },
                setTempModel: (value: UserDictionaryViewModel) => { this.rasManager = value },
                MemberType: SystemObjectViewModel.RAS,
                UserType: RasTlsMemberTypeViewModel.Manager
            },
        };
        var methods = methodsDictionary[userType];
        if (data && methods) {
            methods.setId(data.UserId);
            var workedYearsRequest = <RasTlsMemberViewModel>{
                JobId: this.ras.JobId,
                UserId: data.UserId,
                RasTlsMemberType: methods.MemberType,
                RasTlsUserType: methods.UserType
            };
            this.jobService.getRasTlsAllocation(workedYearsRequest).then(result => {
                var years = result.Object;
                methods.setLastWorkFY(years.LastWorkedFinancialYearId > 0 ? years.LastWorkedFinancialYearId : null);
                methods.setWorkedYears(years.WorkedYears);
                methods.setReadOnly(years.ReadOnly);
            },
                reason => {
                    methods.setLastWorkFY(null);
                    methods.setWorkedYears(0);
                    methods.setReadOnly(false);
                }
            );
        }
    }

    private getAllLists() {
        var dictionaryRequest = new ContextDictionatyRequestViewModel();
        dictionaryRequest.Request = DictionaryRequestViewModel.FinancialYear | DictionaryRequestViewModel.TeamRole;
        dictionaryRequest.SystemAction = SystemActionViewModel.Edit;
        dictionaryRequest.SystemObject = SystemObjectViewModel.RAS;

        this.dictionariesDataService.getAll(dictionaryRequest)
            .then(response => {
                this.dictionaries.financialYears = response["FinancialYear"];
                this.dictionaries.roles = response["TeamRole"];
            }).catch(reason => {});
    }

    refresh(): void {
        let jobId = +this.route.snapshot.parent.params['id'];
        this.jobService.getRas(jobId).then(result => {
            this.ras = result.Object;
            if (!this.ras.ManagerMember) this.ras.ManagerMember = new RasTlsMemberViewModel();
            var managerId = this.ras.ManagerMember.UserId
            if (managerId && managerId > 0) {
                this.rasManager = { UserId: this.ras.ManagerMember.UserId, Name: this.ras.ManagerMember.UserName };
            }
            else
                this.rasManager = null;
            if (!this.ras.PartnerMember) this.ras.PartnerMember = new RasTlsMemberViewModel();
            var partnerId = this.ras.PartnerMember.UserId;
            if (partnerId && partnerId > 0)
                this.rasPartner = { UserId: this.ras.PartnerMember.UserId, Name: this.ras.PartnerMember.UserName };
            else
                this.rasPartner = null;
        }, reason => {
            this.messageBoxService.PopupErrorMessage('Error loading RAS', reason.json());
        });
    }

    clearManager(): void {
        this.rasManager = null;
        this.ras.ManagerMember.UserId = 0;
        this.ras.ManagerMember.UserName = "";
        this.ras.ManagerMember.LastWorkedFinancialYearId = null;
        this.ras.ManagerMember.WorkedYears = null;
    }

    clearPartner(): void {
        this.rasPartner = null;
        this.ras.PartnerMember.UserId = 0;
        this.ras.PartnerMember.UserName = "";
        this.ras.PartnerMember.LastWorkedFinancialYearId = null;
        this.ras.PartnerMember.WorkedYears = null;
    }

    save(): void {
        var rasToSave = null;
        if (!this.ras.Required)
            rasToSave = { Required: false, JobId: this.ras.JobId, ManagerMemberId: this.ras.ManagerMember.RasTlsMemberId, PartnerMemberId: this.ras.PartnerMember.RasTlsMemberId };
        else
            if (this.formControl.valid) {
                rasToSave = this.ras;
            }
        if (rasToSave) {
            this.isInSaving = true;
            this.jobService.saveRas(rasToSave)
                .then(result => {
                    if (result.Code == ResultCode.Success) {
                        this.isInSaving = false;
                        this.formControl.form.markAsPristine();
                        this.formControl.form.markAsUntouched();
                        this.toastr.success('RAS has been saved');
                        return this.refresh();
                    }
                    else {
                        this.isInSaving = false;
                    }
                })
                .catch(reason => {
                    this.messageBoxService.PopupErrorMessage('Error saving RAS', reason.json());
                    this.isInSaving = false;
                })
        }
    }

    redirectTojobList(): Promise<boolean> {
        return this.router.navigate(["/job-list"]);
    }


    cancel(): void {
        if (this.formControl.form.dirty) {
            this.messageBoxService.Popup({
                message: 'Are you sure, you want to cancel?',
                title: 'Confirmation',
                okButtons: ['Yes'],
                rejectButtons: ['No']
            })
                .then(() => {
                    this.formControl.form.markAsPristine();
                    this.refresh();
                });
        };
    }
}