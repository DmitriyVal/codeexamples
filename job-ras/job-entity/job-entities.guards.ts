import { Injectable } from '@angular/core';
import {
    Router,
    Resolve,
    RouterStateSnapshot,
    ActivatedRouteSnapshot,
    Params,
    CanActivate,
    CanDeactivate
} from '@angular/router';
import 'rxjs/add/operator/switchMap';
import { Observable } from 'rxjs/Observable';


import { JobService } from '../../services/job.service';
import { JobViewModel } from '../../../view-models/view-models';
import { EntityFilterViewModel } from '../../../view-models/view-models';
import { EntitysService } from '../../services/entities.service';
import { EntityViewModel } from '../../../view-models/view-models';
import { EntityRouteParametersViewModel } from './job-entity.route-parameters';

@Injectable()
export class JobEntitiesGuardsService {
    constructor(
        private entitiesService: EntitysService,
        private jobService: JobService,
    ) { }

    loadJobAndEntities(jobId: number, route: ActivatedRouteSnapshot): Promise<EntityRouteParametersViewModel> {
        let result = new EntityRouteParametersViewModel();
        return this.jobService.getJob(jobId).then(
            job => {
                if (job && job.Object) {
                    result.Job = job.Object;
                    return this.entitiesService.getEntitiesByJobId(job.Object.JobId);
                }
                return null;
            }).then(jobEntitiesResult => {
                result.JobEntities = jobEntitiesResult ? jobEntitiesResult.Object || [] : [];
                for (let entity of result.JobEntities)
                    this.preprocessEntity(entity);
                return result;
            });
    }

    preprocessEntity(entity: EntityViewModel): void {
        for (let role of entity.EntityMembers) {
            if (!role.UserId || role.UserId <= 0)
                role.UserName = "";
        }
    }
}

@Injectable()
export class JobEntitiesRedirectGuard implements CanActivate {
    constructor(
        private jobEntitiesGuardsService: JobEntitiesGuardsService,
        private router: Router
    ) { }

    redirectToChildNodeIfNeeded(route: ActivatedRouteSnapshot, entities: EntityViewModel[]): void {
        var urlSegments = [route.url[0].path, entities.length > 0 ? entities[0].EntityId : "add"];
        var parentRoute = route.parent;
        while (parentRoute) {
            for (let urlSegment of parentRoute.url.reverse())
                urlSegments.unshift(urlSegment.path);
            parentRoute = parentRoute.parent;
        }
        this.router.navigate(urlSegments);
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> | boolean {
        if (route.children && route.children.length > 0)
            return true;
        let jobId = +route.parent.params['id'];
        return this.jobEntitiesGuardsService.loadJobAndEntities(jobId, route).then(models => {
            if (!models.Job || !models.JobEntities)
                this.router.navigate(["/"]);
            else
                this.redirectToChildNodeIfNeeded(route, models.JobEntities);
            return false;
        });
    }
}

@Injectable()
export class JobEntityOnAddResolver implements Resolve<EntityRouteParametersViewModel> {
    constructor(
        private entitiesService: EntitysService,
        private jobEntitiesGuardsService: JobEntitiesGuardsService, ) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<EntityRouteParametersViewModel> {
        let jobId = +route.parent.parent.params['id'];
        return this.jobEntitiesGuardsService.loadJobAndEntities(jobId, route).then(models => {
            return this.entitiesService.addEntity(models.Job.JobId).then(result => {
                models.Entity = result.Object;
                this.jobEntitiesGuardsService.preprocessEntity(models.Entity);
                models.JobEntities.push(result.Object);
                return models;
            });
        });
    }
}

@Injectable()
export class JobEntityExistingResolver implements Resolve<EntityRouteParametersViewModel> {
    constructor(
        private jobEntitiesGuardsService: JobEntitiesGuardsService, ) { }

    private entityIdParamName = 'entityId';  // URL to web API

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<EntityRouteParametersViewModel> {
        let jobId = +route.parent.parent.params['id'];
        let id = +route.params[this.entityIdParamName];
        return this.jobEntitiesGuardsService.loadJobAndEntities(jobId, route).then(models => {
            models.Entity = models.JobEntities.find(e => e.EntityId == id);
            return models;
        });
    }
}