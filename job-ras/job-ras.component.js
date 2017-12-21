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
var forms_1 = require("@angular/forms");
var router_1 = require("@angular/router");
require("rxjs/add/operator/switchMap");
var Rx_1 = require("rxjs/Rx");
var message_box_service_1 = require("../../services/message-box.service");
var job_service_1 = require("../../services/job.service");
var entities_service_1 = require("../../services/entities.service");
var dictionaries_service_1 = require("../../services/dictionaries/dictionaries.service");
var user_service_1 = require("../../services/user.service");
var security_service_1 = require("../../services/security.service");
var ng2_toastr_1 = require("ng2-toastr/ng2-toastr");
var view_models_1 = require("../../../view-models/view-models");
var view_models_2 = require("../../../view-models/view-models");
var Dictionaries = (function () {
    function Dictionaries() {
        this.financialYears = [];
        this.roles = [];
    }
    return Dictionaries;
}());
var JobRasComponent = (function () {
    function JobRasComponent(route, router, messageBoxService, jobService, userService, entitiesService, UserService, securityService, dictionariesDataService, toastr) {
        this.route = route;
        this.router = router;
        this.messageBoxService = messageBoxService;
        this.jobService = jobService;
        this.userService = userService;
        this.entitiesService = entitiesService;
        this.UserService = UserService;
        this.securityService = securityService;
        this.dictionariesDataService = dictionariesDataService;
        this.toastr = toastr;
        this.dictionaries = new Dictionaries();
        this.datePipeFormat = "dd/MM/yyyy";
        this.dateTimePipeFormat = "dd/MM/yyyy HH:mm";
        this.currentAuthentity = null;
        this.EmptyMember = { Name: "", UserId: null };
        this.isInSaving = false;
    }
    JobRasComponent.prototype.hasNotChanged = function () {
        var hasNotInitialized = !this.ras || !this.formControl;
        return hasNotInitialized || this.formControl.untouched;
    };
    JobRasComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.refresh();
        this.securityService.getCurrentUser().then(function (x) {
            _this.currentAuthentity = x.Object;
            _this.userService.getUser(x.Object.UserId).then(function (u) {
                _this.currentUser = u.Object;
            });
        });
        this.getAllLists();
    };
    JobRasComponent.prototype.usersForAllocationSource = function (keyword) {
        var location = "ras";
        var promise = this.entitiesService.GetRasTlsMembers(location, keyword);
        return Rx_1.Observable.fromPromise(promise.then(function (result) { return result.Object; }));
    };
    JobRasComponent.prototype.selectUser = function (data, userType, control) {
        var _this = this;
        var methodsDictionary = {
            'partner': {
                setId: function (id) { _this.ras.PartnerMember.UserId = id; },
                setReadOnly: function (readOnly) { _this.ras.PartnerMember.ReadOnly = readOnly; },
                setLastWorkFY: function (value) { _this.ras.PartnerMember.LastWorkedFinancialYearId = value; },
                setWorkedYears: function (value) { _this.ras.PartnerMember.WorkedYears = value; },
                setTempModel: function (value) { _this.rasPartner = value; },
                MemberType: view_models_1.SystemObjectViewModel.RAS,
                UserType: view_models_1.RasTlsMemberTypeViewModel.Partner
            },
            'manager': {
                setId: function (id) { _this.ras.ManagerMember.UserId = id; },
                setReadOnly: function (readOnly) { _this.ras.ManagerMember.ReadOnly = readOnly; },
                setLastWorkFY: function (value) { _this.ras.ManagerMember.LastWorkedFinancialYearId = value; },
                setWorkedYears: function (value) { _this.ras.ManagerMember.WorkedYears = value; },
                setTempModel: function (value) { _this.rasManager = value; },
                MemberType: view_models_1.SystemObjectViewModel.RAS,
                UserType: view_models_1.RasTlsMemberTypeViewModel.Manager
            },
        };
        var methods = methodsDictionary[userType];
        if (data && methods) {
            methods.setId(data.UserId);
            var workedYearsRequest = {
                JobId: this.ras.JobId,
                UserId: data.UserId,
                RasTlsMemberType: methods.MemberType,
                RasTlsUserType: methods.UserType
            };
            this.jobService.getRasTlsAllocation(workedYearsRequest).then(function (result) {
                var years = result.Object;
                methods.setLastWorkFY(years.LastWorkedFinancialYearId > 0 ? years.LastWorkedFinancialYearId : null);
                methods.setWorkedYears(years.WorkedYears);
                methods.setReadOnly(years.ReadOnly);
            }, function (reason) {
                methods.setLastWorkFY(null);
                methods.setWorkedYears(0);
                methods.setReadOnly(false);
            });
        }
    };
    JobRasComponent.prototype.getAllLists = function () {
        var _this = this;
        var dictionaryRequest = new view_models_2.ContextDictionatyRequestViewModel();
        dictionaryRequest.Request = view_models_1.DictionaryRequestViewModel.FinancialYear | view_models_1.DictionaryRequestViewModel.TeamRole;
        dictionaryRequest.SystemAction = view_models_1.SystemActionViewModel.Edit;
        dictionaryRequest.SystemObject = view_models_1.SystemObjectViewModel.RAS;
        this.dictionariesDataService.getAll(dictionaryRequest)
            .then(function (response) {
            _this.dictionaries.financialYears = response["FinancialYear"];
            _this.dictionaries.roles = response["TeamRole"];
        }).catch(function (reason) { });
    };
    JobRasComponent.prototype.refresh = function () {
        var _this = this;
        var jobId = +this.route.snapshot.parent.params['id'];
        this.jobService.getRas(jobId).then(function (result) {
            _this.ras = result.Object;
            if (!_this.ras.ManagerMember)
                _this.ras.ManagerMember = new view_models_2.RasTlsMemberViewModel();
            var managerId = _this.ras.ManagerMember.UserId;
            if (managerId && managerId > 0) {
                _this.rasManager = { UserId: _this.ras.ManagerMember.UserId, Name: _this.ras.ManagerMember.UserName };
            }
            else
                _this.rasManager = null;
            if (!_this.ras.PartnerMember)
                _this.ras.PartnerMember = new view_models_2.RasTlsMemberViewModel();
            var partnerId = _this.ras.PartnerMember.UserId;
            if (partnerId && partnerId > 0)
                _this.rasPartner = { UserId: _this.ras.PartnerMember.UserId, Name: _this.ras.PartnerMember.UserName };
            else
                _this.rasPartner = null;
        }, function (reason) {
            _this.messageBoxService.PopupErrorMessage('Error loading RAS', reason.json());
        });
    };
    JobRasComponent.prototype.clearManager = function () {
        this.rasManager = null;
        this.ras.ManagerMember.UserId = 0;
        this.ras.ManagerMember.UserName = "";
        this.ras.ManagerMember.LastWorkedFinancialYearId = null;
        this.ras.ManagerMember.WorkedYears = null;
    };
    JobRasComponent.prototype.clearPartner = function () {
        this.rasPartner = null;
        this.ras.PartnerMember.UserId = 0;
        this.ras.PartnerMember.UserName = "";
        this.ras.PartnerMember.LastWorkedFinancialYearId = null;
        this.ras.PartnerMember.WorkedYears = null;
    };
    JobRasComponent.prototype.save = function () {
        var _this = this;
        var rasToSave = null;
        if (!this.ras.Required)
            rasToSave = { Required: false, JobId: this.ras.JobId, ManagerMemberId: this.ras.ManagerMember.RasTlsMemberId, PartnerMemberId: this.ras.PartnerMember.RasTlsMemberId };
        else if (this.formControl.valid) {
            rasToSave = this.ras;
        }
        if (rasToSave) {
            this.isInSaving = true;
            this.jobService.saveRas(rasToSave)
                .then(function (result) {
                if (result.Code == view_models_1.ResultCode.Success) {
                    _this.isInSaving = false;
                    _this.formControl.form.markAsPristine();
                    _this.formControl.form.markAsUntouched();
                    _this.toastr.success('RAS has been saved');
                    return _this.refresh();
                }
                else {
                    _this.isInSaving = false;
                }
            })
                .catch(function (reason) {
                _this.messageBoxService.PopupErrorMessage('Error saving RAS', reason.json());
                _this.isInSaving = false;
            });
        }
    };
    JobRasComponent.prototype.redirectTojobList = function () {
        return this.router.navigate(["/job-list"]);
    };
    JobRasComponent.prototype.cancel = function () {
        var _this = this;
        if (this.formControl.form.dirty) {
            this.messageBoxService.Popup({
                message: 'Are you sure, you want to cancel?',
                title: 'Confirmation',
                okButtons: ['Yes'],
                rejectButtons: ['No']
            })
                .then(function () {
                _this.formControl.form.markAsPristine();
                _this.refresh();
            });
        }
        ;
    };
    return JobRasComponent;
}());
__decorate([
    core_1.HostListener('window:beforeunload'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Object)
], JobRasComponent.prototype, "hasNotChanged", null);
__decorate([
    core_1.ViewChild('rasForm'),
    __metadata("design:type", forms_1.NgForm)
], JobRasComponent.prototype, "formControl", void 0);
JobRasComponent = __decorate([
    core_1.Component({
        template: require('./job-ras.component.html'),
        styles: [require('./job-ras.component.css')]
    }),
    __metadata("design:paramtypes", [router_1.ActivatedRoute,
        router_1.Router,
        message_box_service_1.MessageBoxService,
        job_service_1.JobService,
        user_service_1.UserService,
        entities_service_1.EntitysService,
        user_service_1.UserService,
        security_service_1.SecurityService,
        dictionaries_service_1.DictionariesDataService,
        ng2_toastr_1.ToastsManager])
], JobRasComponent);
exports.JobRasComponent = JobRasComponent;
//# sourceMappingURL=job-ras.component.js.map