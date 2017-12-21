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
var base_http_get_service_1 = require("./base-http-get.service");
require("rxjs/add/operator/toPromise");
var EntitysService = (function (_super) {
    __extends(EntitysService, _super);
    function EntitysService(http) {
        var _this = _super.call(this) || this;
        _this.http = http;
        _this.EntityUrl = "/api/entity";
        return _this;
    }
    EntitysService.prototype.getEntitys = function () {
        return this.http.get(this.EntityUrl, { headers: this.createJsonContentTypeHeaders() })
            .toPromise()
            .then(function (response) { return response.json(); });
    };
    EntitysService.prototype.getEntitiesByJobId = function (jobId) {
        return this.http.get(this.EntityUrl + "/by-job-id/" + jobId, { headers: this.createJsonContentTypeHeaders() })
            .toPromise()
            .then(function (response) { return response.json(); });
    };
    EntitysService.prototype.filterEntitys = function (filter) {
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http.post("/api/entity/filter", JSON.stringify(filter), { headers: this.createJsonContentTypeHeaders() })
            .toPromise()
            .then(function (response) { return response.json(); });
    };
    EntitysService.prototype.filterEntitysCount = function (filter) {
        var headers = new http_1.Headers();
        headers.append('Content-Type', 'application/json');
        return this.http.post("/api/entity/filter-count", JSON.stringify(filter), { headers: headers })
            .toPromise()
            .then(function (response) { return response.json(); });
    };
    //getEntityName(): Promise<any> {
    //    return this.http.get(this.currentUserUrl + "/current-user")
    //        .toPromise()
    //        .then(response => response.json());
    //}
    EntitysService.prototype.saveEntity = function (model) {
        return this.http.post(this.EntityUrl + "/save", model).toPromise()
            .then(function (response) { return response.json(); });
    };
    //saveManyEntity(entities: EntityViewModel[]): Promise<ResultT<EntityViewModel>> {
    //    return this.http.post(this.EntityUrl + "/save-many", entities).toPromise()
    //        .then(response => response.json());
    //}
    EntitysService.prototype.saveEntities = function (entities) {
        return this.http.post(this.EntityUrl + "/save-many", entities).toPromise()
            .then(function (response) { return response.json(); });
    };
    EntitysService.prototype.addEntity = function (jobId) {
        return this.http.get(this.EntityUrl + "/add/" + jobId, { headers: this.createJsonContentTypeHeaders() }).toPromise()
            .then(function (response) { return response.json(); });
    };
    EntitysService.prototype.deleteEntity = function (entityId) {
        return this.http.post(this.EntityUrl + "/delete/" + entityId, entityId).toPromise()
            .then(function (response) { return response.json(); });
    };
    EntitysService.prototype.getEntity = function (id) {
        return this.http.get(this.EntityUrl + "/" + id, { headers: this.createJsonContentTypeHeaders() }).toPromise()
            .then(function (response) { return response.json(); });
    };
    //getAllocatedUsers(): Promise<ResultT<UserViewModel[]>> {
    //    return this.http.get(this.EntityUrl + "/allocated-users", { headers: this.createJsonContentTypeHeaders() })
    //        .toPromise()
    //        .then(response => response.json() as ResultT<UserViewModel[]>);
    //}
    EntitysService.prototype.getEntityAllocation = function (entityMember) {
        return this.http.post(this.EntityUrl + "/allocation", entityMember)
            .toPromise()
            .then(function (response) { return response.json(); });
    };
    EntitysService.prototype.rotationRuleCheck = function (entityMember) {
        return this.http.post(this.EntityUrl + "/rotation-rule-check", entityMember)
            .toPromise()
            .then(function (response) { return response.json(); });
    };
    EntitysService.prototype.getUsersForAllocation = function (entityId, filterTerm) {
        var filter = {
            EntityId: entityId,
            Filter: filterTerm,
            OrderBy: [{ Name: 'Name', Ascending: true }],
            Skip: 0,
            Take: 15
        };
        return this.http.post(this.EntityUrl + "/users-for-allocation", filter)
            .toPromise()
            .then(function (response) { return response.json(); });
    };
    EntitysService.prototype.GetRasTlsMembers = function (location, filterTerm) {
        var filter = {
            Location: location,
            Filter: filterTerm,
            OrderBy: [{ Name: 'Name', Ascending: true }],
            Skip: 0,
            Take: 15
        };
        return this.http.post("/api/user/ras-tls-members", filter)
            .toPromise()
            .then(function (response) { return response.json(); });
    };
    return EntitysService;
}(base_http_get_service_1.BaseHttpGetService));
EntitysService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [http_1.Http])
], EntitysService);
exports.EntitysService = EntitysService;
//# sourceMappingURL=entities.service.js.map