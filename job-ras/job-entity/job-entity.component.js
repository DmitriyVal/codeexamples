"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var forms_1 = require("@angular/forms");
require("rxjs/add/operator/switchMap");
var Rx_1 = require("rxjs/Rx");
var message_box_service_1 = require("../../services/message-box.service");
var user_service_1 = require("../../services/user.service");
var entities_service_1 = require("../../services/entities.service");
var dictionaries_service_1 = require("../../services/dictionaries/dictionaries.service");
var security_service_1 = require("../../services/security.service");
var view_models_1 = require("../../../view-models/view-models");
var view_models_2 = require("../../../view-models/view-models");
var ng2_toastr_1 = require("ng2-toastr/ng2-toastr");
var EntityDictionaries = (function () {
    function EntityDictionaries() {
        // Dictionaries from server
        this.statuses = [];
        this.riskRatings = [];
        this.financialYears = [];
        this.scopes = [];
        this.roles = [];
    }
    return EntityDictionaries;
}());
var EntityPermissions = (function () {
    function EntityPermissions() {
    }
    return EntityPermissions;
}());
var JobEntityComponent = (function () {
    function JobEntityComponent(router, route, entitiesService, dictionariesDataService, securityService, userService, messageBoxService, toastr) {
        this.router = router;
        this.route = route;
        this.entitiesService = entitiesService;
        this.dictionariesDataService = dictionariesDataService;
        this.securityService = securityService;
        this.userService = userService;
        this.messageBoxService = messageBoxService;
        this.toastr = toastr;
        this.entityIdParamName = 'entityId'; // URL to web API
        this.datePipeFormat = "dd/MM/yyyy";
        this.dateTimePipeFormat = "dd/MM/yyyy HH:mm";
        this.currentAuthentity = null;
        this.currentUser = null;
        this.dictionaries = new EntityDictionaries();
        this.isInSaving = false;
        this.datePickerOptions = {
            dateFormat: 'dd/mm/yyyy',
            firstDayOfWeek: 'mo',
        };
        this.permissions = {};
    }
    JobEntityComponent.prototype.hasNotChanged = function () {
        return !this.entityFormChild.dirty;
    };
    JobEntityComponent.prototype.isEntityMemberViewModel = function (data) {
        return data.EntityId !== undefined;
    };
    JobEntityComponent.prototype.usersForAllocationSource = function (keyword) {
        var promise = this.entitiesService.getUsersForAllocation(this.entity.EntityId, keyword);
        return Rx_1.Observable.fromPromise(promise.then(function (result) {
            result.Object.forEach(function (user) { user.UserName = user.Name; });
            return result.Object;
        }));
    };
    JobEntityComponent.prototype.usersForAllocationSelected = function (role, data) {
        var _this = this;
        if (!this.isEntityMemberViewModel(data)) {
            role.UserId = data.UserId;
            role.UserName = data.Name;
            this.entitiesService.getEntityAllocation(role).then(function (allocation) {
                if (allocation.Code === view_models_2.ResultCode.Success) {
                    role.ReadOnly = allocation.Object.ReadOnly;
                    role.Hours = allocation.Object.Hours;
                    role.LastWorkedFinancialYearId = allocation.Object.LastWorkedFinancialYearId;
                    role.RotationRuleViolated = allocation.Object.RotationRuleViolated;
                    role.WorkedYears = allocation.Object.WorkedYears;
                }
            }).catch(function (reason) {
                _this.toastr.error("Can`t get allocation for user " + role.UserName);
            });
        }
    };
    JobEntityComponent.prototype.AddComment = function (collection, commentText) {
        if (!this.currentUser || !commentText || commentText.trim().length == 0)
            return;
        var comment = {
            CreatedOn: Date.now(),
            CreatedById: this.currentUser.UserId,
            CreatedByName: this.currentUser.FullName,
            Text: commentText
        };
        collection.push(comment);
        // Clear comment field
        if (this.plannerCommentValue == commentText)
            this.plannerCommentValue = "";
        if (this.riskCommentValue == commentText)
            this.riskCommentValue = "";
        this.entityFormChild.form.markAsDirty();
    };
    JobEntityComponent.prototype.AddNewScope = function () {
        if (this.newScope && this.newScopeDate) {
            var dpdate = this.newScopeDate.date;
            this.entity.EntityScopes.push({
                EntityScopeId: 0,
                ReportingDeadline: new Date(dpdate.year, dpdate.month - 1, dpdate.day),
                ScopeId: this.newScope.ScopeId,
                ScopeName: this.newScope.Name,
                EntityId: this.entity.EntityId,
                Deliverable: this.newScopeDeliverable
            });
            this.scopesFormChild.form.markAsUntouched();
            this.newScopeDate = null;
            this.entityFormChild.form.markAsDirty();
        }
    };
    JobEntityComponent.prototype.removeScope = function (scope) {
        var _this = this;
        this.messageBoxService.Popup({
            message: 'Are you sure, you want to delete the Scope item?',
            title: 'Confirmation',
            okButtons: ['Delete'],
            rejectButtons: ['Cancel']
        }).then(function () {
            _this.entity.EntityScopes = _this.entity.EntityScopes.filter(function (s) { return s != scope; });
        });
    };
    JobEntityComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.route.data
            .subscribe(function (data) {
            var routeParameters = data.entityRouteParameters;
            _this.job = routeParameters.Job;
            _this.entity = routeParameters.Entity;
            _this.jobEntities = routeParameters.JobEntities;
            var canEditJob = routeParameters.Job && routeParameters.Job.Permission && routeParameters.Job.Permission.Edit;
            _this.isNew = !_this.entity.EntityId || _this.entity.EntityId <= 0;
            _this.permissions = {
                canAdd: canEditJob && !_this.isNew,
                canDelete: !_this.isNew && _this.entity.Permission && _this.entity.Permission.Delete,
                canEdit: !_this.isNew && _this.entity.Permission && _this.entity.Permission.Edit || _this.isNew && canEditJob,
                canAddPlannerComments: _this.entity.Permission && _this.entity.Permission.Edit,
                canViewPlannerComments: _this.entity.Permission && _this.entity.Permission.Edit,
                canAddRiskComments: _this.entity.Permission && _this.entity.Permission.RiskCommentsEdit,
                canAddressRiskComments: _this.entity.Permission && _this.entity.Permission.Edit,
                canEditStatus: _this.entity.Permission && _this.entity.Permission.EntityStatusEdit,
                canEditEntitiesAmountDependingFields: _this.jobEntities.length > 1 && _this.entity.Permission.Edit
            };
            _this.permissions.saveButtonVisible = _this.permissions.canEdit || _this.permissions.canAddPlannerComments || _this.permissions.canAddressRiskComments || _this.permissions.canAddRiskComments;
        });
        this.securityService.getCurrentUser().then(function (x) {
            _this.currentAuthentity = x.Object;
            _this.userService.getUser(x.Object.UserId).then(function (u) {
                _this.currentUser = u.Object;
            });
        });
        this.getAllLists();
    };
    JobEntityComponent.prototype.navigateToEntity = function (entityToGo) {
        if (entityToGo && entityToGo != this.entity) {
            this.navigateToEntityById(entityToGo.EntityId);
        }
    };
    JobEntityComponent.prototype.navigateToEntityById = function (entityId) {
        this.router.navigate(['../', entityId], { relativeTo: this.route });
    };
    JobEntityComponent.prototype.saveEntity = function () {
        var _this = this;
        if (this.entity) {
            this.isInSaving = true;
            this.entitiesService.saveEntity(this.entity)
                .then(function (result) {
                if (result.Code == view_models_2.ResultCode.Success) {
                    _this.isInSaving = false;
                    console.log("Saved entity id");
                    console.log(result.Object.EntityId);
                    _this.entityFormChild.form.markAsPristine();
                    _this.entityFormChild.form.markAsUntouched();
                    //this.entity = result.Object;
                    _this.jobEntities = _this.jobEntities.map(function (e) { return e.EntityId != result.Object.EntityId ? e : result.Object; });
                    _this.navigateToEntityById(result.Object.EntityId);
                    _this.toastr.success('Entity has been saved');
                }
                else {
                    _this.isInSaving = false;
                }
            })
                .catch(function (reason) {
                _this.messageBoxService.PopupErrorMessage('Error saving entity', reason.json());
                _this.isInSaving = false;
            });
        }
    };
    JobEntityComponent.prototype.deleteEntity = function () {
        var _this = this;
        if (this.entity) {
            this.messageBoxService.Popup({
                message: 'Are you sure, you want to delete the Entity?',
                title: 'Confirmation',
                okButtons: ['Delete'],
                rejectButtons: ['Cancel'],
            }).then(function () {
                _this.isInSaving = true;
                _this.entitiesService.deleteEntity(_this.entity.EntityId)
                    .then(function (result) {
                    _this.isInSaving = false;
                    _this.jobEntities = _this.jobEntities.filter(function (e) { return e.EntityId != _this.entity.EntityId; });
                    if (_this.jobEntities.length > 0)
                        _this.navigateToEntityById(_this.jobEntities[0].EntityId);
                })
                    .catch(function (reason) {
                    _this.isInSaving = false;
                });
            });
        }
    };
    JobEntityComponent.prototype.addEntity = function () {
        this.router.navigate(['../add'], { relativeTo: this.route });
    };
    JobEntityComponent.prototype.cancel = function () {
        var _this = this;
        if (!this.entity)
            return;
        if (!this.entity.EntityId || this.entity.EntityId <= 0) {
            this.jobEntities = this.jobEntities.filter(function (e) { return e != _this.entity; });
            this.router.navigate(this.jobEntities.length == 0 ? ['../../'] : ['../', this.jobEntities[0].EntityId], { relativeTo: this.route });
        }
        else {
            this.entitiesService.getEntity(this.entity.EntityId).then(function (result) {
                _this.jobEntities = _this.jobEntities.map(function (e) { return e.EntityId != result.Object.EntityId ? e : result.Object; });
                _this.entity = result.Object;
            });
        }
        this.entityFormChild.form.markAsPristine();
        this.entityFormChild.form.markAsUntouched();
        //});
    };
    JobEntityComponent.prototype.canRemoveEntityMember = function (entityMember) {
        var entityMembersCount = this.entity.EntityMembers.filter(function (em) { return em.RoleId == entityMember.RoleId; }).length;
        var role = this.dictionaries.roles.find(function (role) { return role.TeamRoleId == entityMember.RoleId; });
        return role && role.MinCount < entityMembersCount;
    };
    JobEntityComponent.prototype.removeEntityMember = function (role) {
        var _this = this;
        if (this.canRemoveEntityMember(role))
            this.messageBoxService.Popup({
                message: 'Are you sure, you want to delete the Role?',
                title: 'Confirmation',
                okButtons: ['Delete'],
                rejectButtons: ['Cancel']
            }).then(function () {
                _this.entity.EntityMembers = _this.entity.EntityMembers.filter(function (r) { return r != role; });
            });
    };
    JobEntityComponent.prototype.clearEntityMember = function (role) {
        if (role.UserId) {
            role.UserId = 0;
            role.UserName = "";
        }
    };
    JobEntityComponent.prototype.onQrpRequiredRelatedChange = function (newValue) {
        var e = this.entity;
        if (!e)
            return;
        if (newValue)
            e.QrpRequired = true;
        else if (!(e.RiskRatingId == 1 || e.FirmPie || e.StatutoryPIE || e.Listed || e.Hpc || e.SecRestricted || e.Pcaob))
            e.QrpRequired = false;
    };
    JobEntityComponent.prototype.getAvailableRoles = function () {
        var availableRoles = [];
        for (var _i = 0, _a = this.dictionaries.roles; _i < _a.length; _i++) {
            var role = _a[_i];
            if (this.entity.EntityMembers.filter(function (em) { return em.RoleId == role.TeamRoleId; }).length < role.MaxCount)
                availableRoles.push(role);
        }
        return availableRoles;
    };
    JobEntityComponent.prototype.AddEntityMember = function () {
        if (this.teamRoleToAdd) {
            this.entity.EntityMembers.push({
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
    };
    JobEntityComponent.prototype.getAllLists = function () {
        var _this = this;
        // Get all dictionaries
        var dictionaryRequest = new view_models_1.ContextDictionatyRequestViewModel();
        dictionaryRequest.Request = view_models_2.DictionaryRequestViewModel.EntityStatus
            | view_models_2.DictionaryRequestViewModel.RiskRating
            | view_models_2.DictionaryRequestViewModel.FinancialYear
            | view_models_2.DictionaryRequestViewModel.Scope
            | view_models_2.DictionaryRequestViewModel.TeamRole;
        dictionaryRequest.SystemAction = view_models_2.SystemActionViewModel.Edit;
        dictionaryRequest.SystemObject = view_models_2.SystemObjectViewModel.Entity;
        this.dictionariesDataService.getAll(dictionaryRequest)
            .then(function (response) {
            _this.dictionaries.statuses = response["EntityStatus"];
            _this.dictionaries.riskRatings = response["RiskRating"];
            _this.dictionaries.financialYears = response["FinancialYear"];
            _this.dictionaries.scopes = response["Scope"];
            _this.newScope = _this.dictionaries.scopes.find(function () { return true; });
            _this.dictionaries.roles = response["TeamRole"];
        })
            .catch(function (reason) {
        });
    };
    JobEntityComponent.prototype.WorkedYearsChanged = function (entityMember, event) {
        this.entitiesService.rotationRuleCheck(entityMember).then(function (x) {
            if (x.Code == view_models_2.ResultCode.Success) {
                event.stopPropagation();
                entityMember.RotationRuleViolated = x.Object.RotationRuleViolated;
            }
        });
    };
    return JobEntityComponent;
}());
__decorate([
    core_1.ViewChild('entityForm'),
    __metadata("design:type", forms_1.NgForm)
], JobEntityComponent.prototype, "entityFormChild", void 0);
__decorate([
    core_1.ViewChild('scopesForm'),
    __metadata("design:type", forms_1.NgForm)
], JobEntityComponent.prototype, "scopesFormChild", void 0);
__decorate([
    core_1.HostListener('window:beforeunload'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Boolean)
], JobEntityComponent.prototype, "hasNotChanged", null);
JobEntityComponent = __decorate([
    core_1.Component({
        template: require('./job-entity.component.html'),
        styles: [require('./job-entity.component.css')]
    }),
    __metadata("design:paramtypes", [router_1.Router,
        router_1.ActivatedRoute,
        entities_service_1.EntitysService,
        dictionaries_service_1.DictionariesDataService,
        security_service_1.SecurityService,
        user_service_1.UserService,
        message_box_service_1.MessageBoxService,
        ng2_toastr_1.ToastsManager])
], JobEntityComponent);
exports.JobEntityComponent = JobEntityComponent;
//# sourceMappingURL=job-entity.component.js.map