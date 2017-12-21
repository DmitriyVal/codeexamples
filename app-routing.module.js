"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var add_employee_component_1 = require("./components/employee/add-employee.component");
var edit_employee_component_1 = require("./components/employee/edit-employee.component");
var employees_list_component_1 = require("./components/employees-list/employees-list.component");
var job_create_component_1 = require("./components/job/job-create/job-create.component");
var job_component_1 = require("./components/job/job.component");
var job_overview_component_1 = require("./components/job/job-overview/job-overview.component");
var job_entity_component_1 = require("./components/job-entity/job-entity.component");
var RedirectToEntities_1 = require("./components/job/RedirectToEntities");
var job_ras_component_1 = require("./components/job-ras/job-ras.component");
var job_tls_component_1 = require("./components/job-tls/job-tls.component");
var job_time_phasing_component_1 = require("./components/job-time-phasing/job-time-phasing.component");
var job_entities_guards_1 = require("./components/job-entity/job-entities.guards");
var entities_list_component_1 = require("./components/entities-list/entities-list.component");
var job_list_component_1 = require("./components/job-list/job-list.component");
var managers_component_1 = require("./components/portfolio-analysis/managers/managers.component");
var signing_partners_component_1 = require("./components/portfolio-analysis/signing-partners/signing-partners.component");
var workload_by_fy_component_1 = require("./components/workload-by-fy/workload-by-fy.component");
var entity_by_fy_component_1 = require("./components/entity-by-fy/entity-by-fy.component");
var entity_roles_component_1 = require("./components/entity-roles/entity-roles.component");
var scope_component_1 = require("./components/scope/scope.component");
var audit_license_component_1 = require("./components/audit-license/audit-license.component");
var rotation_component_1 = require("./components/rotation/rotation.component");
var configuration_component_1 = require("./components/configuration/configuration.component");
var component_not_found_component_1 = require("./components/component-not-found/component-not-found.component");
var home_component_component_1 = require("./components/home-component/home-component.component");
var PendingChangesGuard_1 = require("./components/shared/Guard/PendingChangesGuard");
var CanActivateGuard_1 = require("./components/shared/Guard/CanActivateGuard");
var view_models_1 = require("../view-models/view-models");
var model_1 = require("../app/model/model");
var appRoutes = [
    {
        path: 'employee', component: add_employee_component_1.AddEmployeeComponent, canDeactivate: [PendingChangesGuard_1.PendingChangesGuard], canActivate: [CanActivateGuard_1.CanActivateGuard], data: { editRequest: model_1.EditRequest.Employee }
    },
    {
        path: 'employee/:id', component: edit_employee_component_1.EditEmployeeComponent, canDeactivate: [PendingChangesGuard_1.PendingChangesGuard], canActivate: [CanActivateGuard_1.CanActivateGuard], data: { clientForm: view_models_1.ClientFormViewModel.Employees }
    },
    {
        path: 'employees-list', component: employees_list_component_1.EmployeesListComponent, canActivate: [CanActivateGuard_1.CanActivateGuard], data: { clientForm: view_models_1.ClientFormViewModel.Employees }
    },
    {
        path: '', component: home_component_component_1.HomeComponent
    },
    {
        path: 'job-list', component: job_list_component_1.JobListComponent, canActivate: [CanActivateGuard_1.CanActivateGuard], data: { clientForm: view_models_1.ClientFormViewModel.JobList }
    },
    {
        path: 'entities-list', component: entities_list_component_1.EntitiesListComponent, canDeactivate: [PendingChangesGuard_1.PendingChangesGuard], canActivate: [CanActivateGuard_1.CanActivateGuard], data: { clientForm: view_models_1.ClientFormViewModel.EntityList }
    },
    {
        path: 'managers', component: managers_component_1.ManagersComponent, canActivate: [CanActivateGuard_1.CanActivateGuard], data: { clientForm: view_models_1.ClientFormViewModel.ManagersPortfolioAnalysis }
    },
    {
        path: 'signing-partners', component: signing_partners_component_1.SigningPartnersComponent, canActivate: [CanActivateGuard_1.CanActivateGuard], data: { clientForm: view_models_1.ClientFormViewModel.SigningPartnersPortfolioAnalysis }
    },
    {
        path: 'workload-by-fy', component: workload_by_fy_component_1.WorkloadByFyComponent
    },
    {
        path: 'entity-by-fy', component: entity_by_fy_component_1.EntityByFyComponent
    },
    {
        path: 'entity-roles', component: entity_roles_component_1.EntityRolesComponent, canDeactivate: [PendingChangesGuard_1.PendingChangesGuard], canActivate: [CanActivateGuard_1.CanActivateGuard], data: { clientForm: view_models_1.ClientFormViewModel.EntityRoles }
    },
    {
        path: 'scope', component: scope_component_1.ScopeComponent, canDeactivate: [PendingChangesGuard_1.PendingChangesGuard], canActivate: [CanActivateGuard_1.CanActivateGuard], data: { clientForm: view_models_1.ClientFormViewModel.Scope }
    },
    {
        path: 'audit-license', component: audit_license_component_1.AuditLicenseComponent, canDeactivate: [PendingChangesGuard_1.PendingChangesGuard], canActivate: [CanActivateGuard_1.CanActivateGuard], data: { clientForm: view_models_1.ClientFormViewModel.AuditLicense }
    },
    {
        path: 'rotation', component: rotation_component_1.RotationComponent, canActivate: [CanActivateGuard_1.CanActivateGuard], data: { clientForm: view_models_1.ClientFormViewModel.Rotaton }
    },
    {
        path: 'configuration', component: configuration_component_1.ConfigurationComponent, canActivate: [CanActivateGuard_1.CanActivateGuard], data: { clientForm: view_models_1.ClientFormViewModel.Configuration }
    },
    {
        path: 'job', component: job_create_component_1.JobCreateComponent, canDeactivate: [PendingChangesGuard_1.PendingChangesGuard], canActivate: [CanActivateGuard_1.CanActivateGuard], data: { editRequest: model_1.EditRequest.Job }
    },
    {
        path: 'job/:id',
        component: job_component_1.JobComponent, canActivate: [CanActivateGuard_1.CanActivateGuard], data: { clientForm: view_models_1.ClientFormViewModel.JobList },
        children: [
            { path: "", redirectTo: "overview", pathMatch: 'full' },
            { path: 'overview', component: job_overview_component_1.JobOverview, canDeactivate: [PendingChangesGuard_1.PendingChangesGuard] },
            { path: 'timephasing', component: job_time_phasing_component_1.JobTimePhasingComponent, canDeactivate: [PendingChangesGuard_1.PendingChangesGuard], canActivate: [CanActivateGuard_1.CanActivateGuard], data: { clientForm: view_models_1.ClientFormViewModel.TimePhasing } },
            { path: 'ras', component: job_ras_component_1.JobRasComponent, canDeactivate: [PendingChangesGuard_1.PendingChangesGuard], canActivate: [CanActivateGuard_1.CanActivateGuard], data: { clientForm: view_models_1.ClientFormViewModel.RAS } },
            { path: 'tls', component: job_tls_component_1.JobTlsComponent, canDeactivate: [PendingChangesGuard_1.PendingChangesGuard], canActivate: [CanActivateGuard_1.CanActivateGuard], data: { clientForm: view_models_1.ClientFormViewModel.TLS } },
            { path: 'allEntities', component: RedirectToEntities_1.RedirectToEntitiesComponent },
            {
                path: 'entities',
                canActivate: [job_entities_guards_1.JobEntitiesRedirectGuard],
                children: [
                    {
                        path: 'add',
                        component: job_entity_component_1.JobEntityComponent,
                        resolve: { entityRouteParameters: job_entities_guards_1.JobEntityOnAddResolver },
                        canDeactivate: [PendingChangesGuard_1.PendingChangesGuard],
                        canActivate: [CanActivateGuard_1.CanActivateGuard],
                        data: { editRequest: model_1.EditRequest.Entity }
                    },
                    {
                        path: ':entityId',
                        component: job_entity_component_1.JobEntityComponent,
                        resolve: { entityRouteParameters: job_entities_guards_1.JobEntityExistingResolver },
                        canDeactivate: [PendingChangesGuard_1.PendingChangesGuard]
                    },
                ]
            },
        ]
    },
    {
        path: '',
        redirectTo: '',
        pathMatch: 'full'
    },
    { path: '**', component: component_not_found_component_1.ComponentNotFoundComponent }
];
var AppRoutingModule = (function () {
    function AppRoutingModule() {
    }
    return AppRoutingModule;
}());
AppRoutingModule = __decorate([
    core_1.NgModule({
        imports: [
            router_1.RouterModule.forRoot(appRoutes, { enableTracing: true })
        ],
        exports: [
            router_1.RouterModule
        ],
        providers: [
            job_entities_guards_1.JobEntitiesRedirectGuard,
            job_entities_guards_1.JobEntityExistingResolver,
            job_entities_guards_1.JobEntityOnAddResolver,
            job_entities_guards_1.JobEntitiesGuardsService,
        ]
    })
], AppRoutingModule);
exports.AppRoutingModule = AppRoutingModule;
//# sourceMappingURL=app-routing.module.js.map