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
var ng_bootstrap_1 = require("@ng-bootstrap/ng-bootstrap");
var ng2_toastr_1 = require("ng2-toastr/ng2-toastr");
var job_service_1 = require("../../services/job.service");
var job_unallocated_component_1 = require("../shared/job-unallocated/job-unallocated.component");
var JobCodeComponent = (function () {
    function JobCodeComponent(toastr, modalService, jobService) {
        this.toastr = toastr;
        this.modalService = modalService;
        this.jobService = jobService;
    }
    JobCodeComponent.prototype.agInit = function (params) {
        this.params = params;
        this.value = params.value;
        this.job = params.data;
    };
    JobCodeComponent.prototype.open = function () {
        var _this = this;
        var modalRef = this.modalService.open(job_unallocated_component_1.JobUnallocatedComponent);
        modalRef.componentInstance.financialYearId = this.params.data.FinancialYearId;
        modalRef.result
            .then(function (job) {
            job.JobId = _this.job.JobId;
            return _this.jobService.save(job, true)
                .then(function (response) {
                _this.toastr.success("Job allocation completed");
                _this.params.context.filter();
            })
                .catch(function (response) {
                _this.params.context.messageBoxService.PopupErrorMessage('Error allocating job', response.json());
            });
        })
            .catch(function (reason) { return console.log(reason); });
    };
    return JobCodeComponent;
}());
JobCodeComponent = __decorate([
    core_1.Component({
        selector: 'job-code-component',
        template: "\n        <span *ngIf=\"value\" class=\"col-sm-1\">{{value}}</span>\n        <a *ngIf=\"!value&&job.Permission.Edit\" class=\"col-sm-1\" href=\"javascript:void(0)\" (click)=\"open()\">Select Job Code</a>\n        "
    }),
    __metadata("design:paramtypes", [ng2_toastr_1.ToastsManager, ng_bootstrap_1.NgbModal, job_service_1.JobService])
], JobCodeComponent);
exports.JobCodeComponent = JobCodeComponent;
//# sourceMappingURL=job-code-component.component.js.map