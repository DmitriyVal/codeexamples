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
require("rxjs/add/operator/switchMap");
var job_service_1 = require("../../services/job.service");
var entities_service_1 = require("../../services/entities.service");
var job_entity_route_parameters_1 = require("./job-entity.route-parameters");
var JobEntitiesGuardsService = (function () {
    function JobEntitiesGuardsService(entitiesService, jobService) {
        this.entitiesService = entitiesService;
        this.jobService = jobService;
    }
    JobEntitiesGuardsService.prototype.loadJobAndEntities = function (jobId, route) {
        var _this = this;
        var result = new job_entity_route_parameters_1.EntityRouteParametersViewModel();
        return this.jobService.getJob(jobId).then(function (job) {
            if (job && job.Object) {
                result.Job = job.Object;
                return _this.entitiesService.getEntitiesByJobId(job.Object.JobId);
            }
            return null;
        }).then(function (jobEntitiesResult) {
            result.JobEntities = jobEntitiesResult ? jobEntitiesResult.Object || [] : [];
            for (var _i = 0, _a = result.JobEntities; _i < _a.length; _i++) {
                var entity = _a[_i];
                _this.preprocessEntity(entity);
            }
            return result;
        });
    };
    JobEntitiesGuardsService.prototype.preprocessEntity = function (entity) {
        for (var _i = 0, _a = entity.EntityMembers; _i < _a.length; _i++) {
            var role = _a[_i];
            if (!role.UserId || role.UserId <= 0)
                role.UserName = "";
        }
    };
    return JobEntitiesGuardsService;
}());
JobEntitiesGuardsService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [entities_service_1.EntitysService,
        job_service_1.JobService])
], JobEntitiesGuardsService);
exports.JobEntitiesGuardsService = JobEntitiesGuardsService;
var JobEntitiesRedirectGuard = (function () {
    function JobEntitiesRedirectGuard(jobEntitiesGuardsService, router) {
        this.jobEntitiesGuardsService = jobEntitiesGuardsService;
        this.router = router;
    }
    JobEntitiesRedirectGuard.prototype.redirectToChildNodeIfNeeded = function (route, entities) {
        var urlSegments = [route.url[0].path, entities.length > 0 ? entities[0].EntityId : "add"];
        var parentRoute = route.parent;
        while (parentRoute) {
            for (var _i = 0, _a = parentRoute.url.reverse(); _i < _a.length; _i++) {
                var urlSegment = _a[_i];
                urlSegments.unshift(urlSegment.path);
            }
            parentRoute = parentRoute.parent;
        }
        this.router.navigate(urlSegments);
    };
    JobEntitiesRedirectGuard.prototype.canActivate = function (route, state) {
        var _this = this;
        if (route.children && route.children.length > 0)
            return true;
        var jobId = +route.parent.params['id'];
        return this.jobEntitiesGuardsService.loadJobAndEntities(jobId, route).then(function (models) {
            if (!models.Job || !models.JobEntities)
                _this.router.navigate(["/"]);
            else
                _this.redirectToChildNodeIfNeeded(route, models.JobEntities);
            return false;
        });
    };
    return JobEntitiesRedirectGuard;
}());
JobEntitiesRedirectGuard = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [JobEntitiesGuardsService,
        router_1.Router])
], JobEntitiesRedirectGuard);
exports.JobEntitiesRedirectGuard = JobEntitiesRedirectGuard;
var JobEntityOnAddResolver = (function () {
    function JobEntityOnAddResolver(entitiesService, jobEntitiesGuardsService) {
        this.entitiesService = entitiesService;
        this.jobEntitiesGuardsService = jobEntitiesGuardsService;
    }
    JobEntityOnAddResolver.prototype.resolve = function (route, state) {
        var _this = this;
        var jobId = +route.parent.parent.params['id'];
        return this.jobEntitiesGuardsService.loadJobAndEntities(jobId, route).then(function (models) {
            return _this.entitiesService.addEntity(models.Job.JobId).then(function (result) {
                models.Entity = result.Object;
                _this.jobEntitiesGuardsService.preprocessEntity(models.Entity);
                models.JobEntities.push(result.Object);
                return models;
            });
        });
    };
    return JobEntityOnAddResolver;
}());
JobEntityOnAddResolver = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [entities_service_1.EntitysService,
        JobEntitiesGuardsService])
], JobEntityOnAddResolver);
exports.JobEntityOnAddResolver = JobEntityOnAddResolver;
var JobEntityExistingResolver = (function () {
    function JobEntityExistingResolver(jobEntitiesGuardsService) {
        this.jobEntitiesGuardsService = jobEntitiesGuardsService;
        this.entityIdParamName = 'entityId'; // URL to web API
    }
    JobEntityExistingResolver.prototype.resolve = function (route, state) {
        var jobId = +route.parent.parent.params['id'];
        var id = +route.params[this.entityIdParamName];
        return this.jobEntitiesGuardsService.loadJobAndEntities(jobId, route).then(function (models) {
            models.Entity = models.JobEntities.find(function (e) { return e.EntityId == id; });
            return models;
        });
    };
    return JobEntityExistingResolver;
}());
JobEntityExistingResolver = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [JobEntitiesGuardsService])
], JobEntityExistingResolver);
exports.JobEntityExistingResolver = JobEntityExistingResolver;
//# sourceMappingURL=job-entities.guards.js.map