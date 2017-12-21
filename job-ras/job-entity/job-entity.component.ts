import { Component, OnInit, Input, ViewChild, HostListener } from '@angular/core';
import { ActivatedRoute, Router, Params, NavigationExtras } from '@angular/router';
import { NgForm } from '@angular/forms';
import 'rxjs/add/operator/switchMap';
import { Observable } from 'rxjs/Rx';
import { INgxMyDpOptions, IMyDateModel } from 'ngx-mydatepicker';
import { MessageBoxService } from '../../services/message-box.service';

import { UserService } from "../../services/user.service";
import { EntitysService } from '../../services/entities.service';
import { DictionariesDataService } from '../../services/dictionaries/dictionaries.service';
import { SecurityService } from '../../services/security.service';
import {
    JobViewModel,
    EntityViewModel,
    EntityStatusViewModel,
    RiskRatingViewModel,
    FinancialYearViewModel,
    TeamRoleViewModel,
    ScopeViewModel,
    UserDictionaryViewModel,
    ContextDictionatyRequestViewModel,
    UserFilterViewModel,
    OrderByViewModel,
    EntityMemberViewModel,
    EntityScopeViewModel,
    EntityCommentViewModel,
    AuthenticationViewModel,
    UserViewModel,
    Result
} from '../../../view-models/view-models';
import {
    DictionaryRequestViewModel,
    ResultCode,
    SystemObjectViewModel,
    SystemActionViewModel,
} from '../../../view-models/view-models'

import { EntityRouteParametersViewModel } from './job-entity.route-parameters';
import { ComponentHasUnsavedChanges } from '../shared/Guard/PendingChangesGuard';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

class EntityDictionaries {
    // Dictionaries from server
    statuses: EntityStatusViewModel[] = [];
    riskRatings: RiskRatingViewModel[] = [];
    financialYears: FinancialYearViewModel[] = [];
    scopes: ScopeViewModel[] = [];
    roles: TeamRoleViewModel[] = [];
}

class EntityPermissions {
    canEdit: boolean;
    canDelete: boolean;
    canAdd: boolean;
    canAddPlannerComments: boolean;
    canViewPlannerComments: boolean;
    canAddRiskComments: boolean;
    canAddressRiskComments: boolean;
    canEditStatus: boolean;
    saveButtonVisible: boolean;
    canEditEntitiesAmountDependingFields: boolean;
}

@Component({
    template: require('./job-entity.component.html'),
    styles: [require('./job-entity.component.css')]
})
export class JobEntityComponent implements OnInit, ComponentHasUnsavedChanges {
    @ViewChild('entityForm') entityFormChild: NgForm;
    private entityIdParamName = 'entityId';  // URL to web API
    
    datePipeFormat: string = "dd/MM/yyyy";
    dateTimePipeFormat: string = "dd/MM/yyyy HH:mm";
    currentAuthentity: AuthenticationViewModel = null;
    currentUser: UserViewModel = null;
    dictionaries: EntityDictionaries = new EntityDictionaries();
    isInSaving: boolean = false;
    job: JobViewModel;
    entity: EntityViewModel;
    isNew: boolean;
    jobEntities: EntityViewModel[];

    teamRoleToAdd: TeamRoleViewModel;

    @ViewChild('scopesForm') scopesFormChild: NgForm;
    private datePickerOptions: INgxMyDpOptions = {
        dateFormat: 'dd/mm/yyyy',
        firstDayOfWeek: 'mo',

    };
    // scope
    newScope: ScopeViewModel;
    newScopeDate: IMyDateModel;
    newScopeDeliverable: string;

    permissions: Partial<EntityPermissions> = {};
    plannerCommentValue: string;
    riskCommentValue: string;


    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private entitiesService: EntitysService,
        private dictionariesDataService: DictionariesDataService,
        private securityService: SecurityService,
        private userService: UserService,
        private messageBoxService: MessageBoxService,
        private toastr: ToastsManager,
    ) { }

    @HostListener('window:beforeunload')
    hasNotChanged(): boolean {
        return !this.entityFormChild.dirty;
    }

    isEntityMemberViewModel(data: UserDictionaryViewModel | EntityMemberViewModel): data is EntityMemberViewModel {
        return (<EntityMemberViewModel>data).EntityId !== undefined;
    }

    usersForAllocationSource(keyword: any) {
        let promise = this.entitiesService.getUsersForAllocation(this.entity.EntityId, keyword);

        return Observable.fromPromise(promise.then(result => {
            result.Object.forEach(user => { (<any>user).UserName = user.Name; });
            return result.Object;
        }));
    }
    usersForAllocationSelected(role: EntityMemberViewModel, data: UserDictionaryViewModel | EntityMemberViewModel) {
        if (!this.isEntityMemberViewModel(data)) {
            role.UserId = data.UserId;
            role.UserName = data.Name;
            this.entitiesService.getEntityAllocation(role).then(allocation => {
                if (allocation.Code === ResultCode.Success) {
                    role.ReadOnly = allocation.Object.ReadOnly;
                    role.Hours = allocation.Object.Hours;
                    role.LastWorkedFinancialYearId = allocation.Object.LastWorkedFinancialYearId;
                    role.RotationRuleViolated = allocation.Object.RotationRuleViolated;
                    role.WorkedYears = allocation.Object.WorkedYears;
                }
            }).catch(reason => {
                this.toastr.error("Can`t get allocation for user " + role.UserName);
            });
        }
    }
    
    AddComment(collection: EntityCommentViewModel[], commentText: string): void {
        if (!this.currentUser || !commentText || commentText.trim().length == 0)
            return;
        var comment = <EntityCommentViewModel>{
            CreatedOn: Date.now(),
            CreatedById: this.currentUser.UserId,
            CreatedByName: this.currentUser.FullName,
            Text: commentText
        };
        collection.push(comment);
        // Clear comment field
        if (this.plannerCommentValue == commentText) this.plannerCommentValue = "";
        if (this.riskCommentValue == commentText) this.riskCommentValue = "";
        this.entityFormChild.form.markAsDirty();
    }
    
    AddNewScope(): void {
        if (this.newScope && this.newScopeDate) {
            let dpdate = this.newScopeDate.date;
            this.entity.EntityScopes.push({
                EntityScopeId: 0,
                ReportingDeadline: new Date(dpdate.year, dpdate.month-1, dpdate.day),
                ScopeId: this.newScope.ScopeId,
                ScopeName: this.newScope.Name,
                EntityId: this.entity.EntityId,
                Deliverable: this.newScopeDeliverable
            });
            this.scopesFormChild.form.markAsUntouched();
            this.newScopeDate = null;
            this.entityFormChild.form.markAsDirty();
        }
    }

    removeScope(scope: EntityScopeViewModel) {
        this.messageBoxService.Popup({
            message: 'Are you sure, you want to delete the Scope item?',
            title: 'Confirmation',
            okButtons: ['Delete'],
            rejectButtons: ['Cancel']
        }).then(() => {
            this.entity.EntityScopes = this.entity.EntityScopes.filter(s => s != scope);
        });
    }

    ngOnInit(): void {
        this.route.data
            .subscribe((data: { entityRouteParameters: EntityRouteParametersViewModel }) => {
                var routeParameters = data.entityRouteParameters;
                this.job = routeParameters.Job;
                this.entity = routeParameters.Entity;
                this.jobEntities = routeParameters.JobEntities;
                let canEditJob = routeParameters.Job && routeParameters.Job.Permission && routeParameters.Job.Permission.Edit;
                this.isNew = !this.entity.EntityId || this.entity.EntityId <= 0;
                this.permissions = {
                    canAdd: canEditJob && !this.isNew,
                    canDelete: !this.isNew && this.entity.Permission && this.entity.Permission.Delete,
                    canEdit: !this.isNew && this.entity.Permission && this.entity.Permission.Edit || this.isNew && canEditJob,
                    canAddPlannerComments: this.entity.Permission && this.entity.Permission.Edit,
                    canViewPlannerComments: this.entity.Permission && this.entity.Permission.Edit,
                    canAddRiskComments: this.entity.Permission && this.entity.Permission.RiskCommentsEdit,
                    canAddressRiskComments: this.entity.Permission && this.entity.Permission.Edit,
                    canEditStatus: this.entity.Permission && this.entity.Permission.EntityStatusEdit,
                    canEditEntitiesAmountDependingFields: this.jobEntities.length > 1 && this.entity.Permission.Edit
                };
                this.permissions.saveButtonVisible = this.permissions.canEdit || this.permissions.canAddPlannerComments || this.permissions.canAddressRiskComments || this.permissions.canAddRiskComments;
            });

        this.securityService.getCurrentUser().then(x => {
            this.currentAuthentity = x.Object;
            this.userService.getUser(x.Object.UserId).then(u => {
                this.currentUser = u.Object;
            });
        });
        this.getAllLists();
    }

    navigateToEntity(entityToGo: EntityViewModel): void {
        if (entityToGo && entityToGo != this.entity) {
            this.navigateToEntityById(entityToGo.EntityId);
        }
    }

    private navigateToEntityById(entityId: number) {
        this.router.navigate(['../', entityId], <NavigationExtras>{ relativeTo: this.route });
    }

    saveEntity(): void {
        if (this.entity) {
            this.isInSaving = true;
            this.entitiesService.saveEntity(this.entity)
                .then(result => {
                    if (result.Code == ResultCode.Success) {
                        this.isInSaving = false;
                        console.log("Saved entity id");
                        console.log(result.Object.EntityId);
                        this.entityFormChild.form.markAsPristine();
                        this.entityFormChild.form.markAsUntouched();
                        //this.entity = result.Object;
                        this.jobEntities = this.jobEntities.map(e => e.EntityId != result.Object.EntityId ? e : result.Object);
                        this.navigateToEntityById(result.Object.EntityId);
                        this.toastr.success('Entity has been saved');
                    }
                    else {
                        this.isInSaving = false;
                    }
                })
                .catch(reason => {
                    this.messageBoxService.PopupErrorMessage('Error saving entity', reason.json() as Result);
                    this.isInSaving = false;
                })
        }
    }

    deleteEntity(): void {
        if (this.entity) {
            this.messageBoxService.Popup({
                message: 'Are you sure, you want to delete the Entity?',
                title: 'Confirmation',
                okButtons: ['Delete'],
                rejectButtons: ['Cancel'],
            }).then(() => {
                this.isInSaving = true;
                this.entitiesService.deleteEntity(this.entity.EntityId)
                    .then(result => {
                        this.isInSaving = false;
                        this.jobEntities = this.jobEntities.filter(e => e.EntityId != this.entity.EntityId);
                        if (this.jobEntities.length > 0)
                            this.navigateToEntityById(this.jobEntities[0].EntityId);
                    })
                    .catch(reason => {
                        this.isInSaving = false;
                    })
            });

        }
    }

    addEntity(): void {
        this.router.navigate(['../add'], <NavigationExtras>{ relativeTo: this.route });
    }

    cancel(): void {
        if (!this.entity)
            return;     
        if (!this.entity.EntityId || this.entity.EntityId <= 0) {
            this.jobEntities = this.jobEntities.filter(e => e != this.entity);
            this.router.navigate(this.jobEntities.length == 0 ? ['../../'] : ['../', this.jobEntities[0].EntityId], <NavigationExtras>{ relativeTo: this.route });
        }
        else {
            this.entitiesService.getEntity(this.entity.EntityId).then(result => {
                this.jobEntities = this.jobEntities.map(e => e.EntityId != result.Object.EntityId ? e : result.Object);
                this.entity = result.Object;
            });
        }

        this.entityFormChild.form.markAsPristine();
        this.entityFormChild.form.markAsUntouched();
        //});
    }

    canRemoveEntityMember(entityMember: EntityMemberViewModel): boolean {
        var entityMembersCount = this.entity.EntityMembers.filter(em => em.RoleId == entityMember.RoleId).length;
        var role = this.dictionaries.roles.find(role => role.TeamRoleId == entityMember.RoleId);
        return role && role.MinCount < entityMembersCount;
    }

    removeEntityMember(role: EntityMemberViewModel): void {
        if (this.canRemoveEntityMember(role))
            this.messageBoxService.Popup({
                message: 'Are you sure, you want to delete the Role?',
                title: 'Confirmation',
                okButtons: ['Delete'],
                rejectButtons: ['Cancel']
            }).then(() => {
                this.entity.EntityMembers = this.entity.EntityMembers.filter(r => r != role);
            });
    }

    clearEntityMember(role: EntityMemberViewModel): void {
        if (role.UserId) {
            role.UserId = 0;
            role.UserName = "";
        }
    }

    onQrpRequiredRelatedChange(newValue: boolean): void {
        var e = this.entity;
        if (!e)
            return;
        if (newValue)
            e.QrpRequired = true;
        else
            if (!(e.RiskRatingId == 1 || e.FirmPie || e.StatutoryPIE || e.Listed || e.Hpc || e.SecRestricted || e.Pcaob))
                e.QrpRequired = false;
    }

    getAvailableRoles(): TeamRoleViewModel[] {
        var availableRoles: TeamRoleViewModel[] = [];
        for (var role of this.dictionaries.roles) {
            if (this.entity.EntityMembers.filter(em => em.RoleId == role.TeamRoleId).length < role.MaxCount)
                availableRoles.push(role);
        }
        return availableRoles;
    }

    AddEntityMember(): void {
        if (this.teamRoleToAdd) {
            this.entity.EntityMembers.push(
                <EntityMemberViewModel>{
                    EntityId: this.entity.EntityId,
                    RoleId: this.teamRoleToAdd.TeamRoleId,
                    RoleName: this.teamRoleToAdd.Name,
                    UserName: "",
                    UserId: null,
                    LastWorkedFinancialYearId: null,
                    WorkedYears: 0,                    
                    Hours: 0
                });
        }
    }

    private getAllLists() {
        // Get all dictionaries
        var dictionaryRequest = new ContextDictionatyRequestViewModel();
        dictionaryRequest.Request = DictionaryRequestViewModel.EntityStatus
            | DictionaryRequestViewModel.RiskRating
            | DictionaryRequestViewModel.FinancialYear
            | DictionaryRequestViewModel.Scope
            | DictionaryRequestViewModel.TeamRole;
        dictionaryRequest.SystemAction = SystemActionViewModel.Edit;
        dictionaryRequest.SystemObject = SystemObjectViewModel.Entity;

        this.dictionariesDataService.getAll(dictionaryRequest)
            .then(response => {
                this.dictionaries.statuses = response["EntityStatus"];
                this.dictionaries.riskRatings = response["RiskRating"];
                this.dictionaries.financialYears = response["FinancialYear"];
                this.dictionaries.scopes = response["Scope"];
                this.newScope = this.dictionaries.scopes.find(() => true);
                this.dictionaries.roles = response["TeamRole"];
            })
            .catch(reason => {

            });
    }

    WorkedYearsChanged(entityMember: EntityMemberViewModel, event) {
        this.entitiesService.rotationRuleCheck(entityMember).then(x => {
            if (x.Code == ResultCode.Success) {
                event.stopPropagation();
                entityMember.RotationRuleViolated = x.Object.RotationRuleViolated;
            }
        });
    }
}

