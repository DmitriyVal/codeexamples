"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
var http_1 = require("@angular/http");
require("rxjs/add/operator/catch");
require("rxjs/add/operator/map");
var base_http_get_service_1 = require("./base-http-get.service");
var view_models_1 = require("../../view-models/view-models");
var JobService = (function (_super) {
    __extends(JobService, _super);
    function JobService(http) {
        var _this = _super.call(this) || this;
        _this.http = http;
        _this.jobsUrl = '/api/job'; // URL to web API
        return _this;
    }
    JobService.prototype.getJobs = function () {
        return this.http.get(this.jobsUrl, { headers: this.createJsonContentTypeHeaders() })
            .toPromise()
            .then(function (response) { return response.json(); });
    };
    JobService.prototype.getJob = function (id) {
        var url = this.jobsUrl + '/' + id;
        return this.http.get(url, { headers: this.createJsonContentTypeHeaders() })
            .toPromise()
            .then(function (response) { return response.json(); });
    };
    JobService.prototype.getUnallocatedJobs = function (filter) {
        var url = this.jobsUrl + "/get-unallocated-codes";
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http.post(url, JSON.stringify(filter), { headers: headers })
            .toPromise()
            .then(function (result) { return result.json(); });
    };
    JobService.prototype.getUnallocatedJobsCount = function (filter) {
        var url = this.jobsUrl + "/get-unallocated-codes-count";
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http.post(url, JSON.stringify(filter), { headers: headers })
            .toPromise()
            .then(function (result) { return result.json(); });
    };
    JobService.prototype.save = function (job, allocate) {
        if (allocate === void 0) { allocate = false; }
        var url = allocate ? this.jobsUrl + "/allocate-job" : this.jobsUrl;
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http.post(url, JSON.stringify(job), { headers: headers })
            .toPromise()
            .then(function (response) { return response.json(); });
    };
    JobService.prototype.filter = function (filter) {
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http.post("/api/job/filter", JSON.stringify(filter), { headers: headers })
            .toPromise()
            .then(function (response) { return response.json(); });
    };
    JobService.prototype.filterCount = function (filter) {
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http.post("/api/job/filter-count", JSON.stringify(filter), { headers: headers })
            .toPromise()
            .then(function (response) { return response.json(); });
    };
    JobService.prototype.getNotificationLink = function (notificationModel) {
        var url = this.jobsUrl + "/get-notification-link";
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http.post(url, JSON.stringify(notificationModel), { headers: headers })
            .toPromise()
            .then(function (response) { return response.json(); });
    };
    JobService.prototype.getNotificationLinkByFilter = function (notificationModel) {
        var url = this.jobsUrl + "/get-notification-link-by-filter";
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http.post(url, notificationModel, { headers: headers })
            .toPromise()
            .then(function (response) { return response.json(); });
    };
    //getRasByJobId(jobId: number): Promise<ResultT<JobRASViewModel[]>> {
    //    return this.http.get(`${this.jobsUrl}/by-job-id/${jobId}`, { headers: this.createJsonContentTypeHeaders() })
    //        .toPromise()
    //        .then(response => response.json() as ResultT<JobRASViewModel[]>);
    //}
    JobService.prototype.getRasByJobId = function (id) {
        var url = this.jobsUrl + '/ras/' + id;
        return this.http.get(url, { headers: this.createJsonContentTypeHeaders() })
            .toPromise()
            .then(function (response) { return response.json(); });
    };
    //public GetJobsListExcel(jobs: JobViewModel[]){
    //    var JobIds: number[] = [];
    //    var headers = new Headers();
    //    headers.append('postman-token', 'application/json')
    //    jobs.forEach(x => JobIds.push(x.JobId));
    //    return this.http.post(this.jobsUrl + "/jobs-list-excel",
    //        {
    //            jobIds: JobIds,
    //        })
    //        .toPromise()  
    //        .then(response => console.log(response), err => console.log(err));
    //}
    JobService.prototype.ExportJobs = function (filter, except) {
        var ids = except.map(function (x) { return x.JobId; });
        var params = new http_1.URLSearchParams();
        for (var key in filter) {
            params.set(key, filter[key]);
        }
        var url = this.jobsUrl + "/jobs-list-excel-filter?" + params.toString() + "$" + ids.map(function (id) { return "ExceptIds=" + id; }).join('&');
        window.open(url);
    };
    JobService.prototype.GetJobsListExcel = function (jobs) {
        var JobIds = [];
        jobs.forEach(function (x) { return JobIds.push(x.JobId); });
        var url = "/api/job/jobs-list-excel?" + JobIds.map(function (id) { return "jobIds=" + id; }).join('&');
        window.open(url);
        //return this.http.get(url)
        //.toPromise()
        //.then(response =>
        //    response.text() as string
        //);
    };
    //public GetJobsListExcel(jobs: JobViewModel[]) {
    //    let JobIds: number[] = [];
    //    jobs.forEach(x => JobIds.push(x.JobId));
    //    let body = JSON.stringify({ jobIds: JobIds });
    //    let headers = new Headers({ 'Content-Type': 'application/json' , 'cache-control': 'no-cache' , 'postman-token': '9135e481-df69-b870-4f72-92873c1fd7de' });
    //    let options = new RequestOptions({ headers: headers });
    //    let url = 'http://localhost:32001/api/job/jobs-list-excel';
    //    return this.http.post(url, body, options)
    //        .map(res => res.json().data)
    //        .catch(this.handleError)
    //        .toPromise() 
    //}
    JobService.prototype.ProceedBulkOperationByFilter = function (filter, except, url) {
        var JobIds = [];
        except.forEach(function (x) { return JobIds.push(x.JobId); });
        filter.ExceptIds = JobIds;
        return this.http.post(url, filter)
            .toPromise()
            .then(function (response) { return response.json(); });
    };
    JobService.prototype.ProceedBulkOperationById = function (jobs, url) {
        var JobIds = [];
        jobs.forEach(function (x) { return JobIds.push(x.JobId); });
        var filter = new view_models_1.JobIdsViewModel();
        filter.JobIds = JobIds;
        return this.http.post(url, filter)
            .toPromise()
            .then(function (response) { return response.json(); });
    };
    JobService.prototype.CloneJobToFYByFilter = function (filter, except) {
        return this.ProceedBulkOperationByFilter(filter, except, this.jobsUrl + "/clone-to-fy-by-filter");
    };
    JobService.prototype.CloneJobToFYByIds = function (jobs) {
        return this.ProceedBulkOperationById(jobs, this.jobsUrl + "/clone-to-fy-by-id");
    };
    JobService.prototype.HideJobListByFilter = function (filter, except) {
        return this.ProceedBulkOperationByFilter(filter, except, this.jobsUrl + "/hide-jobs-by-filter");
    };
    JobService.prototype.HideJobListByIds = function (jobs) {
        return this.ProceedBulkOperationById(jobs, this.jobsUrl + "/hide-jobs-by-id");
    };
    JobService.prototype.AllocateJobListByFilter = function (filter, except) {
        return this.ProceedBulkOperationByFilter(filter, except, this.jobsUrl + "/allocate-jobs-by-filter");
    };
    JobService.prototype.AllocateJobListByIds = function (jobs) {
        return this.ProceedBulkOperationById(jobs, this.jobsUrl + "/allocate-jobs-by-id");
    };
    JobService.prototype.Delete = function (jobId) {
        return this.http.delete(this.jobsUrl + "/" + jobId)
            .toPromise()
            .then(function (responce) { return responce.json(); });
    };
    JobService.prototype.DeleteJobs = function (jobs) {
        return this.http.post(this.jobsUrl + "/delete-many", jobs)
            .toPromise()
            .then(function (response) { return response.json(); })
            .catch(function (response) { return Promise.reject(response); });
    };
    JobService.prototype.getTimePhasing = function (jobId) {
        return this.http.get(this.jobsUrl + "/time-phasing/" + jobId, { headers: this.createJsonContentTypeHeaders() })
            .toPromise()
            .then(function (response) { return response.json(); });
    };
    JobService.prototype.saveTimePhasing = function (timePhasing) {
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http.post(this.jobsUrl + "/time-phasing", timePhasing)
            .toPromise()
            .then(function (response) { return response.json(); });
    };
    JobService.prototype.getTls = function (jobId) {
        return this.http.get(this.jobsUrl + "/tls/" + jobId, { headers: this.createJsonContentTypeHeaders() })
            .toPromise()
            .then(function (response) {
            var result = response.json();
            return result;
        });
    };
    JobService.prototype.saveRas = function (ras) {
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http.post(this.jobsUrl + "/ras", ras)
            .toPromise()
            .then(function (response) { return response.json(); });
    };
    JobService.prototype.getRas = function (jobId) {
        return this.http.get(this.jobsUrl + "/ras/" + jobId, { headers: this.createJsonContentTypeHeaders() })
            .toPromise()
            .then(function (response) {
            var result = response.json();
            return result;
        });
    };
    JobService.prototype.saveTls = function (tls) {
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http.post(this.jobsUrl + "/tls", tls)
            .toPromise()
            .then(function (response) { return response.json(); });
    };
    JobService.prototype.getRasTlsAllocation = function (entityMember) {
        return this.http.post(this.jobsUrl + "/allocate", entityMember)
            .toPromise()
            .then(function (response) { return response.json(); });
    };
    return JobService;
}(base_http_get_service_1.BaseHttpGetService));
JobService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [http_1.Http])
], JobService);
exports.JobService = JobService;
//# sourceMappingURL=job.service.js.map