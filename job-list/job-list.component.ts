import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from '@angular/router';
import { ControlContainer } from "@angular/forms";

import { Observable } from 'rxjs/Observable';

import { ToastsManager } from 'ng2-toastr/ng2-toastr';
import { GridOptions, IDatasource, IGetRowsParams, RowNode, ColDef } from "ag-grid";

import { EnumExtension } from "../../../shared/enum-extension"
import { JobService } from "../../services/job.service";
import { MessageBoxService } from '../../services/message-box.service';
import { DictionariesDataService } from "../../services/dictionaries/dictionaries.service";
import { SecurityService } from '../../services/security.service';
import { UsersDataService } from "../../services/dictionaries/users-data.service";
import { LinkComponent } from './link-component.component';
import { JobCodeComponent } from './job-code-component.component';
import { AgGridPipeComponent } from '../shared/ag-grid-pipe/ag-grid-pipe.component';
import {
    JobViewModel,
    JobFilterViewModel,
    OrderByViewModel,
    TerritoryViewModel,
    LineOfServiceViewModel,
    BusinessUnitViewModel,
    OfficeViewModel,
    FinancialYearViewModel,
    OperationUnitViewModel,
    IndustryViewModel,
    UserDictionaryViewModel,
    TeamRoleViewModel,
    ContextDictionatyRequestViewModel,
    JobNotificationViewModel,
    JobNotificationByFilterViewModel,
    JobFilterExceptIdsViewModel,
    Result
} from '../../../view-models/view-models';
import { DictionaryRequestViewModel, ResultCode, SystemActionViewModel, SystemObjectViewModel } from '../../../view-models/view-models';
import { SelectionService } from "../../services/selection.service";
import { SelectAllHeader } from "../shared/select-all-header/select-all-header.component";

class JobFilters {
    territories: TerritoryViewModel[];
    linesOS: LineOfServiceViewModel[];
    businessUnits: BusinessUnitViewModel[];
    allOffices: OfficeViewModel[];
    financialyears: FinancialYearViewModel[];
    industries: IndustryViewModel[];
    roles: TeamRoleViewModel[];
    operationUnits: OperationUnitViewModel[];
}

interface Warnings { [key: string]: number }

@Component({
    selector: "job-list",
    template: require("./job-list.component.html"),
    styles: [require("./job-list.component.css")]
})
export class JobListComponent implements OnInit {
    public key: string = "jobList";
    private columnWidths: any = {};
    private gridOptions: GridOptions;
    private datasource: IDatasource
    private _territory: TerritoryViewModel = null;
    private _lineOfService: LineOfServiceViewModel = null;
    public canEdit: boolean = false;
    public allocating: boolean = false;

    constructor(
        private toastr: ToastsManager,
        private jobService: JobService,
        private dictionariesDataService: DictionariesDataService,
        private usersDataService: UsersDataService,
        private messageBoxService: MessageBoxService,
        private securityService: SecurityService,
        private selectionService: SelectionService
    ) { }

    filters: JobFilters = new JobFilters();
    get offices(): OfficeViewModel[] {
        if (!this.Territory || !this.filters.allOffices) return [];
        return this.filters.allOffices.filter(office => office.TerritoryId == this.Territory.TerritoryId);
    }

    get businessUnits(): BusinessUnitViewModel[] {
        if (!this.LineOfService || !this.Territory || !this.filters.businessUnits) return [];
        return this.filters.businessUnits.filter(businessUnit => businessUnit.LineOfServiceId == this.LineOfService.LineOfServiceId && businessUnit.TerritoryId == this.Territory.TerritoryId)
    }

    get operationUnits(): OperationUnitViewModel[] {
        if (!this.BusinessUnit || !this.Territory || !this.filters.operationUnits) return [];
        return this.filters.operationUnits.filter(operationUnit => operationUnit.BusinessUnitId == this.BusinessUnit.BusinessUnitId && operationUnit.TerritoryId == this.Territory.TerritoryId)
    }

    get Territory(): TerritoryViewModel {
        return this._territory;
    }
    set Territory(value: TerritoryViewModel) {
        this._territory = value;
        this.Office = null;
        this.BusinessUnit = null;
    }

    get LineOfService(): LineOfServiceViewModel {
        return this._lineOfService;
    }
    set LineOfService(value: LineOfServiceViewModel) {
        this._lineOfService = value;
        this.BusinessUnit = null;
    }

    get emptyUser(): UserDictionaryViewModel {
        return {
            UserId: 0,
            Name: ''
        };
    }

    public Name: string = null;
    public JobCode: string = null;
    public FinancialYear: FinancialYearViewModel = null;
    public BusinessUnit: BusinessUnitViewModel = null;
    public OperationsUnit: OperationUnitViewModel = null;
    public Office: OfficeViewModel = null;
    public Industry: IndustryViewModel = null;
    public Role: TeamRoleViewModel = null;
    public ClientName: string = null;
    public ClientCode: string = null;
    public UltimateHeadClient: string = null;
    public MinFeeOnLocalCurrency: number = null;
    public MaxFeeOnLocalCurrency: number = null;
    public MinTotalEngagementHours: number = null;
    public MaxTotalEngagementHours: number = null;
    public MinTotalAuditHours: number = null;
    public MaxTotalAuditHours: number = null;
    public Unallocated: boolean = null;
    public Hidden: boolean = null;
    public HasNonAddressedComments: boolean = null;
    public Employee: UserDictionaryViewModel = this.emptyUser;

    private lastfilter: JobFilterViewModel;

    private sortModel: any = [{ colId: "JobName", sort: "asc" }];

    public getJobsFilterViewModel(aggridSortModel: any[], startRow: number): JobFilterViewModel {
        var result = new JobFilterViewModel();
        result.BusinessUnitId = this.BusinessUnit ? this.BusinessUnit.BusinessUnitId : null;
        result.ClientCode = this.ClientCode;
        result.ClientName = this.ClientName;
        result.FinancialYearId = this.FinancialYear ? this.FinancialYear.FinancialYearId : null;
        result.HasNonAddressedComments = this.HasNonAddressedComments;
        result.UltimateHeadClient = this.UltimateHeadClient;
        result.Hidden = this.Unallocated ? this.Hidden : false;
        result.IndustryId = this.Industry ? this.Industry.IndustryId : null;
        result.JobCode = this.JobCode;
        result.LineOfServiceId = this.LineOfService ? this.LineOfService.LineOfServiceId : null;
        result.MaxFeeInLocalCurrency = this.MaxFeeOnLocalCurrency;
        result.MaxTotalAuditHours = this.MaxTotalAuditHours;
        result.MaxTotalEngagementHours = this.MaxTotalEngagementHours;
        result.MinFeeInLocalCurrency = this.MinFeeOnLocalCurrency;
        result.MinTotalAuditHours = this.MinTotalAuditHours;
        result.MinTotalEngagementHours = this.MinTotalEngagementHours;
        result.Name = this.Name;
        result.OfficeId = this.Office ? this.Office.OfficeId : null;
        result.OperationUnitId = this.OperationsUnit ? this.OperationsUnit.OperationUnitId : null;
        result.AllocatedTeamRoleId = this.Employee && this.Employee.UserId > 0 && this.Role ? this.Role.TeamRoleId : null;
        result.TerritoryId = this.Territory ? this.Territory.TerritoryId : null;
        result.Unallocated = this.Unallocated;
        result.AllocatedEmployeeId = this.Employee && this.Employee.UserId > 0 ? this.Employee.UserId : null;

        if (aggridSortModel.length > 0) {
            result.OrderBy = new Array<OrderByViewModel>();
            aggridSortModel.forEach(srt => {
                result.OrderBy.push({ Name: srt.colId, Ascending: srt.sort == 'asc' });
            })
        }

        result.Take = this.gridOptions.paginationPageSize;
        result.Skip = startRow;

        return result;
    }

    subscription: any;
    selectAll: boolean = false;
    selectionExceptions: JobViewModel[] = [];

    SetSelectAll(value: boolean) {
        this.selectAll = value;
        this.selectionExceptions = [];
        if (value)
            this.gridOptions.api.selectAll();
        else
            this.gridOptions.api.deselectAll();
    }

    removeException(model: JobViewModel): void {
        var foundModelIndex = this.selectionExceptions.findIndex(x => x.JobId == model.JobId);
        if (foundModelIndex != -1)
            this.selectionExceptions.splice(foundModelIndex, 1);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    ngOnInit(): void {
        this.subscription = this.selectionService.getSelectionChangeEmitter().subscribe(item => this.SetSelectAll(item));

        this.allocating = false;
        this.gridOptions = {};
        this.gridOptions.context = this;
        this.gridOptions.rowSelection = 'multiple';
        this.gridOptions.enableServerSideSorting = true;
        this.gridOptions.columnDefs = <ColDef[]>[
            {
                headerName: "",
                field: "checked",
                checkboxSelection: true,
                headerComponentFramework: SelectAllHeader,
                suppressSorting: true,
                width: 54,
                suppressMovable: true,
                suppressResize: true,
            },
            {
                headerName: "Name",
                field: "JobName",
                width: 420,
                cellRendererFramework: LinkComponent,
                sort: 'asc',
                sortingOrder: ['asc', 'desc']
            },
            {
                headerName: "Job Code",
                field: "JobCode",
                cellRendererFramework: JobCodeComponent,
                sortingOrder: ['asc', 'desc']
            },
            {
                headerName: "Territory",
                field: "TerritoryName",
                width: 420,
                sortingOrder: ['asc', 'desc']
            },
            {
                headerName: "Line of Service",
                field: "LineOfServiceName",
                width: 420,
                sortingOrder: ['asc', 'desc']
            },
            {
                headerName: "Business Unit",
                field: "BusinessUnitName",
                width: 420,
                sortingOrder: ['asc', 'desc']
            },
            {
                headerName: "Office",
                field: "OfficeName",
                width: 575,
                sortingOrder: ['asc', 'desc']
            },
            {
                headerName: "Industry",
                field: "IndustryName",
                width: 420,
                sortingOrder: ['asc', 'desc']
            },
            {
                headerName: "Client Name",
                field: "ClientName",
                sortingOrder: ['asc', 'desc']
            },
            {
                headerName: "Client Code",
                field: "ClientCode",
                sortingOrder: ['asc', 'desc']
            },
            {
                headerName: "Ultimate Head Client",
                field: "UltimateHeadClient",
                sortingOrder: ['asc', 'desc']
            },
            {
                headerName: "Fee in local currency",
                field: "FeeInLocalCurrency",
                sortingOrder: ['asc', 'desc'],
                cellRendererFramework: AgGridPipeComponent,
                cellStyle: { 'text-align': 'right' }
            },
            {
                headerName: "Total engagement hours",
                field: "TotalEngagementHours",
                sortingOrder: ['asc', 'desc'],
                cellRendererFramework: AgGridPipeComponent,
                cellStyle: { 'text-align': 'right' }
            },
            {
                headerName: "Total Audit Hours",
                field: "TotalAuditHours",
                sortingOrder: ['asc', 'desc'],
                cellRendererFramework: AgGridPipeComponent,
                cellStyle: { 'text-align': 'right' }
            },
        ];

        this.columnWidths = JSON.parse(localStorage.getItem(`${this.key}_widths`) || "{}");
        (<ColDef[]>this.gridOptions.columnDefs).forEach(x => {
            if (this.columnWidths[x.field])
                x.width = this.columnWidths[x.field];
        });
        this.gridOptions.enableColResize = true;
        this.gridOptions.onColumnResized = (event) => {
            if (event.isFinished()) {
                var column = event.column;
                this.columnWidths[column.colId] = column.actualWidth;
                localStorage.setItem(`${this.key}_widths`, JSON.stringify(this.columnWidths));
            }
        }


        this.gridOptions.enableColResize = true;
        this.gridOptions.rowModelType = "pagination";
        this.gridOptions.paginationPageSize = 20;
        this.gridOptions.suppressRowClickSelection = true;
        this.gridOptions.onRowSelected = (event) => {
            if (this.selectAll) {
                if (event.node.selected)
                    this.removeException(event.node.data);
                else
                    this.selectionExceptions.push(event.node.data);
            }
            else {
                if (event.node.selected)
                    this.selectionExceptions.push(event.node.data);
                else
                    this.removeException(event.node.data);
            }
        }

        var ctrl = this;

        this.datasource = {
            getRows: function (params: IGetRowsParams): void {
                ctrl.sortModel = params.sortModel;
                ctrl.jobService.filter(ctrl.getlastfilter(params.sortModel, params.startRow))
                    .then(jobs => {
                        if (jobs.Code == ResultCode.Success) {
                            // set selections
                            setTimeout(() => {
                                ctrl.gridOptions.api.forEachNode((rowNode: RowNode) => {
                                    if (ctrl.selectionExceptions.findIndex(x => x.JobId == rowNode.data.JobId) == -1)
                                        rowNode.setSelected(ctrl.selectAll);
                                })
                            }, 100);
                            params.successCallback(jobs.Object);
                        }
                        else
                            params.failCallback();
                    });
            }
        }

        var dictionaryRequest = new ContextDictionatyRequestViewModel();
        dictionaryRequest.Request = DictionaryRequestViewModel.BusinessUnit
            | DictionaryRequestViewModel.LineOfService
            | DictionaryRequestViewModel.Territory
            | DictionaryRequestViewModel.Office
            | DictionaryRequestViewModel.FinancialYear
            | DictionaryRequestViewModel.Industry
            | DictionaryRequestViewModel.TeamRole
            | DictionaryRequestViewModel.OperationUnit;
        dictionaryRequest.SystemAction = SystemActionViewModel.View;
        dictionaryRequest.SystemObject = SystemObjectViewModel.Job;

        this.dictionariesDataService.getAll(dictionaryRequest).then(response => {
            this.filters.allOffices = response["Office"];
            this.filters.businessUnits = response["BusinessUnit"];
            this.filters.financialyears = response["FinancialYear"];
            this.filters.industries = response["Industry"];
            this.filters.linesOS = response["LineOfService"];
            this.filters.roles = response["TeamRole"];
            this.filters.territories = response["Territory"];
            this.filters.operationUnits = response["OperationUnit"];

            var savedFilter = localStorage.getItem("jobs-filter");
            if (savedFilter)
                this.restoreFilter(JSON.parse(savedFilter) as JobFilterViewModel);
            else {
                // Let's set default values
                this.FinancialYear = this.filters.financialyears.find(x => x.IsCurrent);
            }
            this.filter();
        });

        // get current user id
        this.securityService.getCurrentUser().then(x => {
            this.canEdit = x.Object.CanEditJobs;
        });
    }

    restoreFilter(filter: JobFilterViewModel): void {
        this.Territory = this.filters.territories.find(x => x.TerritoryId == filter.TerritoryId);
        this.LineOfService = this.filters.linesOS.find(x => x.LineOfServiceId == filter.LineOfServiceId);
        this.Name = filter.Name;
        this.BusinessUnit = this.filters.businessUnits.find(x => x.BusinessUnitId == filter.BusinessUnitId);
        this.JobCode = filter.JobCode;
        this.FinancialYear = this.filters.financialyears.find(x => x.FinancialYearId == filter.FinancialYearId);
        this.OperationsUnit = this.filters.operationUnits.find(x => x.OperationUnitId == filter.OperationUnitId);
        this.Office = this.filters.allOffices.find(x => x.OfficeId == filter.OfficeId);
        this.Industry = this.filters.industries.find(x => x.IndustryId == filter.IndustryId);
        this.HasNonAddressedComments = filter.HasNonAddressedComments;
        this.ClientName = filter.ClientName;
        this.ClientCode = filter.ClientCode;
        this.UltimateHeadClient = filter.UltimateHeadClient;
        this.MinFeeOnLocalCurrency = filter.MinFeeInLocalCurrency;
        this.MaxFeeOnLocalCurrency = filter.MaxFeeInLocalCurrency;
        this.MinTotalEngagementHours = filter.MinTotalEngagementHours;
        this.MaxTotalEngagementHours = filter.MaxTotalEngagementHours;
        this.MinTotalAuditHours = filter.MinTotalAuditHours;
        this.MaxTotalAuditHours = filter.MaxTotalAuditHours;
        this.Unallocated = filter.Unallocated;
        this.Hidden = filter.Hidden;
        this.Employee = <UserDictionaryViewModel>{ UserId: filter.AllocatedEmployeeId, Name: (filter as any).EmployeeName ? (filter as any).EmployeeName : "" };
        this.Role = this.filters.roles.find(x => x.TeamRoleId == filter.AllocatedTeamRoleId);
    }

    filter(): void {
        let filter = this.getJobsFilterViewModel(this.sortModel, 0);
        (filter as any).EmployeeName = this.Employee ? this.Employee.Name : null;
        localStorage.setItem("jobs-filter", JSON.stringify(filter));
        this.jobService.filterCount(filter).then(x => {
            if (x.Code == ResultCode.Success) {
                // Clear selection
                this.SetSelectAll(false);
                this.selectionService.emitSelectionChangeEvent(false);

                this.datasource.rowCount = x.Object;
                this.gridOptions.api.setDatasource(this.datasource);
            }
        })
        this.lastfilter = this.getJobsFilterViewModel(this.sortModel, 0)
    }

    getlastfilter(aggridSortModel: any[], startRow: number) {
        var currentFilter = this.getJobsFilterViewModel(aggridSortModel, startRow);

        if (this.lastfilter)
            this.lastfilter.OrderBy = currentFilter.OrderBy,
                this.lastfilter.Skip = currentFilter.Skip;

        else
            this.lastfilter = currentFilter,
                this.lastfilter.Skip = currentFilter.Skip;

        return this.lastfilter;
    }

    clear(): void {
        this.Name = null;
        this.JobCode = null;
        this.FinancialYear = this.filters.financialyears.find(x => x.IsCurrent);;
        this.Territory = null;
        this.LineOfService = null;
        this.BusinessUnit = null;
        this.OperationsUnit = null;
        this.Office = null;
        this.Industry = null;
        this.Role = null;
        this.ClientName = null;
        this.ClientCode = null;
        this.UltimateHeadClient = null;
        this.MinFeeOnLocalCurrency = null;
        this.MaxFeeOnLocalCurrency = null;
        this.MinTotalEngagementHours = null;
        this.MaxTotalEngagementHours = null;
        this.MinTotalAuditHours = null;
        this.MaxTotalAuditHours = null;
        this.Unallocated = null;
        this.Hidden = null;
        this.HasNonAddressedComments = null;
        this.Employee = this.emptyUser;

        this.filter();
    }

    clearEmployee(): void {
        this.Employee = this.emptyUser;
        this.Role = null;
    }

    cancel(): void {
        let result = confirm("Are you sure, you want to cancel?");
        console.log(result);
        if (result) {
            if (history.length > 1) {
                history.back();
            } else {
                window.close();
            }
        }
    }

    Delete(): void {
        var selectedRows = <JobViewModel[]>this.gridOptions.api.getSelectedRows();
        if (selectedRows && selectedRows.length > 0 && confirm(`Are you sure you want to delete ${selectedRows.length} jobs?`)) {
            this.jobService.DeleteJobs(selectedRows)
                .then(x => this.filter())
                .catch(x => {
                    let result = <Result>JSON.parse(x._body);
                    if (result.Code == ResultCode.Error) {
                        this.errorBody = [];
                        result.Errors.forEach(err => {
                            this.addError(err.Message);
                        })
                    }
                })

        }
    }

    getRoles() {
        if (this.filters && this.Employee && this.Employee.UserId > 0)
            this.usersDataService.getUserRoles(this.Employee).then(x => this.filters.roles = x.Object);
    }

    getUsers(keyword: string): Observable<UserDictionaryViewModel[]> {
        let promise = this.usersDataService.getAll(keyword);
        return Observable.fromPromise(promise.then(result => {
            var resultData = result.Object;
            resultData.push(this.emptyUser);
            return result.Object;
        }));
    }

    private AllocateJobResultSuccess(result: Result) {
        this.allocating = false;
        if (result.Code === ResultCode.Success) {
            this.toastr.info("Jobs has been allocated");
        } else {
            let warnings: Warnings = {};
            result.Errors.forEach(error => {
                if (warnings[error.Message]) {
                    warnings[error.Message] = warnings[error.Message] + 1;
                } else {
                    warnings[error.Message] = 1;
                }
            });
            let message = "";
            for (let m in warnings) {
                if (warnings.hasOwnProperty(m)) {
                    if (message) message += "<br>";
                    message += `${warnings[m]} Jobs are not allocated as ${m}`;
                }
            }
            this.toastr.warning(message);
        }
    }

    private AllocateJobResultFailed(response: any) {
        this.allocating = false;
        this.messageBoxService.PopupErrorMessage('Error allocating jobs', response.json() as Result);
    }

    public AllocateJobList(): void {
        var selectedRows = this.selectionExceptions;
        if (this.selectAll || selectedRows.length > 0)
            if (this.selectAll)
                this.jobService.AllocateJobListByFilter(<JobFilterExceptIdsViewModel>this.getJobsFilterViewModel([], 0), selectedRows)
                    .then(x => this.AllocateJobResultSuccess(x))
                    .catch(x => this.AllocateJobResultFailed(x));
            else
                this.jobService.AllocateJobListByIds(selectedRows)
                    .then(x => this.AllocateJobResultSuccess(x))
                    .catch(x => this.AllocateJobResultFailed(x));
        else
        {
            this.errorBody = [];
            if (selectedRows.length == 0)
                this.addError("Jobs are not selected");
        }
    }

    private HideJobListResult(x: Result) {
        if (x.Code == ResultCode.Success)
            this.closeMessageModal(),
                this.jobService.filterCount(this.getJobsFilterViewModel(this.sortModel, 0)).then(x => {
                    if (x.Code == ResultCode.Success) {
                        this.datasource.rowCount = x.Object;
                        this.gridOptions.api.setDatasource(this.datasource);
                    }
                });
        else {
            this.addError(x.ErrorMessage);
        }
    }

    public HideJobList(): any {
        var selectedRows = this.selectionExceptions;
        if (this.selectAll || selectedRows.length > 0)
            if (this.selectAll)
                this.jobService.HideJobListByFilter(<JobFilterExceptIdsViewModel>this.getJobsFilterViewModel([], 0), selectedRows)
                    .then(x => this.HideJobListResult(x))
                    .catch(x => this.HideJobListResult(x));
            else
                this.jobService.HideJobListByIds(selectedRows)
                    .then(x => this.HideJobListResult(x))
                    .catch(x => this.HideJobListResult(x));
        else {
            this.errorBody = [];
            if (selectedRows.length == 0)
                this.addError("Jobs are not selected");
        }

    }

    public GetJobsListExcel(): any {
        var selectedRows = this.selectionExceptions;
        if (this.selectAll || selectedRows.length > 0)
            if (this.selectAll)
                this.jobService.ExportJobs(this.getJobsFilterViewModel([], 0), selectedRows);
            else
                this.jobService.GetJobsListExcel(selectedRows);
        else {
            this.showMessage("Jobs are not selected");
        }

    }

    private CloneJobToFYResult(x: Result): void {
        if (x.Code == ResultCode.Success)
            this.showMessage("Jobs have been successfully copied to next FY");

        else {
            this.showMessage(`ERROR: ${x.ErrorMessage}`);
        }
    }

    public CloneJobToFY(): any {
        this.showMessage("Copy Jobs to next FY... ");
        var selectedRows = this.selectionExceptions;
        if (this.selectAll || selectedRows.length > 0)
            if (this.selectAll)
                this.jobService.CloneJobToFYByFilter(<JobFilterExceptIdsViewModel>this.getJobsFilterViewModel([], 0), selectedRows)
                    .then(x => this.CloneJobToFYResult(x))
                    .catch(x => this.CloneJobToFYResult(x));
            else
                this.jobService.CloneJobToFYByIds(selectedRows)
                    .then(x => this.CloneJobToFYResult(x))
                    .catch(x => this.CloneJobToFYResult(x));
        else {
            this.errorBody = [];
            if (selectedRows.length == 0)
                this.addError("Jobs are not selected");
        }
    }

    get error(): boolean {
        return this.errorBody && this.errorBody.length > 0;
    }
    errorBody: string[] = [];

    get message(): boolean {
        return this.messageBody && this.messageBody.length > 0;
    };
    messageBody: string[] = [];

    addError(error: string) {
        this.messageBody = [];
        this.errorBody.push("Error " + (this.errorBody.length + 1) + ": " + error);
    };

    closeErrorModal() {
        this.errorBody = [];
    }

    showMessage(message: string) {
        this.messageBody = [message];
    };

    closeMessageModal() {
        this.messageBody = [];
    }
    notify(teamRoleId: number): void {
        var selectedRows = this.selectionExceptions;
        if (this.selectAll || selectedRows.length > 0)
            if (this.selectAll)
            {
                var filterRequest = <JobNotificationByFilterViewModel>this.getJobsFilterViewModel([], 0);
                filterRequest.RoleId = teamRoleId;
                this.jobService.getNotificationLinkByFilter(filterRequest)
                    .then(result => {
                        if (result.Code == ResultCode.Success) {
                            window.open(result.Object);
                        }
                    });
            }
            else {
                var request = <JobNotificationViewModel>{
                    RoleId: teamRoleId,
                    JobIds: selectedRows.map(job => job.JobId)
                };
                this.jobService.getNotificationLink(request).then(result => {
                    if (result.Code == ResultCode.Success) {
                        window.open(result.Object);
                    }
                },
                    reason => {
                        this.messageBoxService.PopupErrorMessage('Error creating notification link', reason.json());
                    });
            }
    }
}