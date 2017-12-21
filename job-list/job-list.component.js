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
var Observable_1 = require("rxjs/Observable");
var ng2_toastr_1 = require("ng2-toastr/ng2-toastr");
var job_service_1 = require("../../services/job.service");
var message_box_service_1 = require("../../services/message-box.service");
var dictionaries_service_1 = require("../../services/dictionaries/dictionaries.service");
var security_service_1 = require("../../services/security.service");
var users_data_service_1 = require("../../services/dictionaries/users-data.service");
var link_component_component_1 = require("./link-component.component");
var job_code_component_component_1 = require("./job-code-component.component");
var ag_grid_pipe_component_1 = require("../shared/ag-grid-pipe/ag-grid-pipe.component");
var view_models_1 = require("../../../view-models/view-models");
var view_models_2 = require("../../../view-models/view-models");
var selection_service_1 = require("../../services/selection.service");
var select_all_header_component_1 = require("../shared/select-all-header/select-all-header.component");
var JobFilters = (function () {
    function JobFilters() {
    }
    return JobFilters;
}());
var JobListComponent = (function () {
    function JobListComponent(toastr, jobService, dictionariesDataService, usersDataService, messageBoxService, securityService, selectionService) {
        this.toastr = toastr;
        this.jobService = jobService;
        this.dictionariesDataService = dictionariesDataService;
        this.usersDataService = usersDataService;
        this.messageBoxService = messageBoxService;
        this.securityService = securityService;
        this.selectionService = selectionService;
        this.key = "jobList";
        this.columnWidths = {};
        this._territory = null;
        this._lineOfService = null;
        this.canEdit = false;
        this.allocating = false;
        this.filters = new JobFilters();
        this.Name = null;
        this.JobCode = null;
        this.FinancialYear = null;
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
        this.sortModel = [{ colId: "JobName", sort: "asc" }];
        this.selectAll = false;
        this.selectionExceptions = [];
        this.errorBody = [];
        this.messageBody = [];
    }
    Object.defineProperty(JobListComponent.prototype, "offices", {
        get: function () {
            var _this = this;
            if (!this.Territory || !this.filters.allOffices)
                return [];
            return this.filters.allOffices.filter(function (office) { return office.TerritoryId == _this.Territory.TerritoryId; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(JobListComponent.prototype, "businessUnits", {
        get: function () {
            var _this = this;
            if (!this.LineOfService || !this.Territory || !this.filters.businessUnits)
                return [];
            return this.filters.businessUnits.filter(function (businessUnit) { return businessUnit.LineOfServiceId == _this.LineOfService.LineOfServiceId && businessUnit.TerritoryId == _this.Territory.TerritoryId; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(JobListComponent.prototype, "operationUnits", {
        get: function () {
            var _this = this;
            if (!this.BusinessUnit || !this.Territory || !this.filters.operationUnits)
                return [];
            return this.filters.operationUnits.filter(function (operationUnit) { return operationUnit.BusinessUnitId == _this.BusinessUnit.BusinessUnitId && operationUnit.TerritoryId == _this.Territory.TerritoryId; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(JobListComponent.prototype, "Territory", {
        get: function () {
            return this._territory;
        },
        set: function (value) {
            this._territory = value;
            this.Office = null;
            this.BusinessUnit = null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(JobListComponent.prototype, "LineOfService", {
        get: function () {
            return this._lineOfService;
        },
        set: function (value) {
            this._lineOfService = value;
            this.BusinessUnit = null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(JobListComponent.prototype, "emptyUser", {
        get: function () {
            return {
                UserId: 0,
                Name: ''
            };
        },
        enumerable: true,
        configurable: true
    });
    JobListComponent.prototype.getJobsFilterViewModel = function (aggridSortModel, startRow) {
        var result = new view_models_1.JobFilterViewModel();
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
            result.OrderBy = new Array();
            aggridSortModel.forEach(function (srt) {
                result.OrderBy.push({ Name: srt.colId, Ascending: srt.sort == 'asc' });
            });
        }
        result.Take = this.gridOptions.paginationPageSize;
        result.Skip = startRow;
        return result;
    };
    JobListComponent.prototype.SetSelectAll = function (value) {
        this.selectAll = value;
        this.selectionExceptions = [];
        if (value)
            this.gridOptions.api.selectAll();
        else
            this.gridOptions.api.deselectAll();
    };
    JobListComponent.prototype.removeException = function (model) {
        var foundModelIndex = this.selectionExceptions.findIndex(function (x) { return x.JobId == model.JobId; });
        if (foundModelIndex != -1)
            this.selectionExceptions.splice(foundModelIndex, 1);
    };
    JobListComponent.prototype.ngOnDestroy = function () {
        this.subscription.unsubscribe();
    };
    JobListComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.subscription = this.selectionService.getSelectionChangeEmitter().subscribe(function (item) { return _this.SetSelectAll(item); });
        this.allocating = false;
        this.gridOptions = {};
        this.gridOptions.context = this;
        this.gridOptions.rowSelection = 'multiple';
        this.gridOptions.enableServerSideSorting = true;
        this.gridOptions.columnDefs = [
            {
                headerName: "",
                field: "checked",
                checkboxSelection: true,
                headerComponentFramework: select_all_header_component_1.SelectAllHeader,
                suppressSorting: true,
                width: 54,
                suppressMovable: true,
                suppressResize: true,
            },
            {
                headerName: "Name",
                field: "JobName",
                width: 420,
                cellRendererFramework: link_component_component_1.LinkComponent,
                sort: 'asc',
                sortingOrder: ['asc', 'desc']
            },
            {
                headerName: "Job Code",
                field: "JobCode",
                cellRendererFramework: job_code_component_component_1.JobCodeComponent,
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
                cellRendererFramework: ag_grid_pipe_component_1.AgGridPipeComponent,
                cellStyle: { 'text-align': 'right' }
            },
            {
                headerName: "Total engagement hours",
                field: "TotalEngagementHours",
                sortingOrder: ['asc', 'desc'],
                cellRendererFramework: ag_grid_pipe_component_1.AgGridPipeComponent,
                cellStyle: { 'text-align': 'right' }
            },
            {
                headerName: "Total Audit Hours",
                field: "TotalAuditHours",
                sortingOrder: ['asc', 'desc'],
                cellRendererFramework: ag_grid_pipe_component_1.AgGridPipeComponent,
                cellStyle: { 'text-align': 'right' }
            },
        ];
        this.columnWidths = JSON.parse(localStorage.getItem(this.key + "_widths") || "{}");
        this.gridOptions.columnDefs.forEach(function (x) {
            if (_this.columnWidths[x.field])
                x.width = _this.columnWidths[x.field];
        });
        this.gridOptions.enableColResize = true;
        this.gridOptions.onColumnResized = function (event) {
            if (event.isFinished()) {
                var column = event.column;
                _this.columnWidths[column.colId] = column.actualWidth;
                localStorage.setItem(_this.key + "_widths", JSON.stringify(_this.columnWidths));
            }
        };
        this.gridOptions.enableColResize = true;
        this.gridOptions.rowModelType = "pagination";
        this.gridOptions.paginationPageSize = 20;
        this.gridOptions.suppressRowClickSelection = true;
        this.gridOptions.onRowSelected = function (event) {
            if (_this.selectAll) {
                if (event.node.selected)
                    _this.removeException(event.node.data);
                else
                    _this.selectionExceptions.push(event.node.data);
            }
            else {
                if (event.node.selected)
                    _this.selectionExceptions.push(event.node.data);
                else
                    _this.removeException(event.node.data);
            }
        };
        var ctrl = this;
        this.datasource = {
            getRows: function (params) {
                ctrl.sortModel = params.sortModel;
                ctrl.jobService.filter(ctrl.getlastfilter(params.sortModel, params.startRow))
                    .then(function (jobs) {
                    if (jobs.Code == view_models_2.ResultCode.Success) {
                        // set selections
                        setTimeout(function () {
                            ctrl.gridOptions.api.forEachNode(function (rowNode) {
                                if (ctrl.selectionExceptions.findIndex(function (x) { return x.JobId == rowNode.data.JobId; }) == -1)
                                    rowNode.setSelected(ctrl.selectAll);
                            });
                        }, 100);
                        params.successCallback(jobs.Object);
                    }
                    else
                        params.failCallback();
                });
            }
        };
        var dictionaryRequest = new view_models_1.ContextDictionatyRequestViewModel();
        dictionaryRequest.Request = view_models_2.DictionaryRequestViewModel.BusinessUnit
            | view_models_2.DictionaryRequestViewModel.LineOfService
            | view_models_2.DictionaryRequestViewModel.Territory
            | view_models_2.DictionaryRequestViewModel.Office
            | view_models_2.DictionaryRequestViewModel.FinancialYear
            | view_models_2.DictionaryRequestViewModel.Industry
            | view_models_2.DictionaryRequestViewModel.TeamRole
            | view_models_2.DictionaryRequestViewModel.OperationUnit;
        dictionaryRequest.SystemAction = view_models_2.SystemActionViewModel.View;
        dictionaryRequest.SystemObject = view_models_2.SystemObjectViewModel.Job;
        this.dictionariesDataService.getAll(dictionaryRequest).then(function (response) {
            _this.filters.allOffices = response["Office"];
            _this.filters.businessUnits = response["BusinessUnit"];
            _this.filters.financialyears = response["FinancialYear"];
            _this.filters.industries = response["Industry"];
            _this.filters.linesOS = response["LineOfService"];
            _this.filters.roles = response["TeamRole"];
            _this.filters.territories = response["Territory"];
            _this.filters.operationUnits = response["OperationUnit"];
            var savedFilter = localStorage.getItem("jobs-filter");
            if (savedFilter)
                _this.restoreFilter(JSON.parse(savedFilter));
            else {
                // Let's set default values
                _this.FinancialYear = _this.filters.financialyears.find(function (x) { return x.IsCurrent; });
            }
            _this.filter();
        });
        // get current user id
        this.securityService.getCurrentUser().then(function (x) {
            _this.canEdit = x.Object.CanEditJobs;
        });
    };
    JobListComponent.prototype.restoreFilter = function (filter) {
        this.Territory = this.filters.territories.find(function (x) { return x.TerritoryId == filter.TerritoryId; });
        this.LineOfService = this.filters.linesOS.find(function (x) { return x.LineOfServiceId == filter.LineOfServiceId; });
        this.Name = filter.Name;
        this.BusinessUnit = this.filters.businessUnits.find(function (x) { return x.BusinessUnitId == filter.BusinessUnitId; });
        this.JobCode = filter.JobCode;
        this.FinancialYear = this.filters.financialyears.find(function (x) { return x.FinancialYearId == filter.FinancialYearId; });
        this.OperationsUnit = this.filters.operationUnits.find(function (x) { return x.OperationUnitId == filter.OperationUnitId; });
        this.Office = this.filters.allOffices.find(function (x) { return x.OfficeId == filter.OfficeId; });
        this.Industry = this.filters.industries.find(function (x) { return x.IndustryId == filter.IndustryId; });
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
        this.Employee = { UserId: filter.AllocatedEmployeeId, Name: filter.EmployeeName ? filter.EmployeeName : "" };
        this.Role = this.filters.roles.find(function (x) { return x.TeamRoleId == filter.AllocatedTeamRoleId; });
    };
    JobListComponent.prototype.filter = function () {
        var _this = this;
        var filter = this.getJobsFilterViewModel(this.sortModel, 0);
        filter.EmployeeName = this.Employee ? this.Employee.Name : null;
        localStorage.setItem("jobs-filter", JSON.stringify(filter));
        this.jobService.filterCount(filter).then(function (x) {
            if (x.Code == view_models_2.ResultCode.Success) {
                // Clear selection
                _this.SetSelectAll(false);
                _this.selectionService.emitSelectionChangeEvent(false);
                _this.datasource.rowCount = x.Object;
                _this.gridOptions.api.setDatasource(_this.datasource);
            }
        });
        this.lastfilter = this.getJobsFilterViewModel(this.sortModel, 0);
    };
    JobListComponent.prototype.getlastfilter = function (aggridSortModel, startRow) {
        var currentFilter = this.getJobsFilterViewModel(aggridSortModel, startRow);
        if (this.lastfilter)
            this.lastfilter.OrderBy = currentFilter.OrderBy,
                this.lastfilter.Skip = currentFilter.Skip;
        else
            this.lastfilter = currentFilter,
                this.lastfilter.Skip = currentFilter.Skip;
        return this.lastfilter;
    };
    JobListComponent.prototype.clear = function () {
        this.Name = null;
        this.JobCode = null;
        this.FinancialYear = this.filters.financialyears.find(function (x) { return x.IsCurrent; });
        ;
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
    };
    JobListComponent.prototype.clearEmployee = function () {
        this.Employee = this.emptyUser;
        this.Role = null;
    };
    JobListComponent.prototype.cancel = function () {
        var result = confirm("Are you sure, you want to cancel?");
        console.log(result);
        if (result) {
            if (history.length > 1) {
                history.back();
            }
            else {
                window.close();
            }
        }
    };
    JobListComponent.prototype.Delete = function () {
        var _this = this;
        var selectedRows = this.gridOptions.api.getSelectedRows();
        if (selectedRows && selectedRows.length > 0 && confirm("Are you sure you want to delete " + selectedRows.length + " jobs?")) {
            this.jobService.DeleteJobs(selectedRows)
                .then(function (x) { return _this.filter(); })
                .catch(function (x) {
                var result = JSON.parse(x._body);
                if (result.Code == view_models_2.ResultCode.Error) {
                    _this.errorBody = [];
                    result.Errors.forEach(function (err) {
                        _this.addError(err.Message);
                    });
                }
            });
        }
    };
    JobListComponent.prototype.getRoles = function () {
        var _this = this;
        if (this.filters && this.Employee && this.Employee.UserId > 0)
            this.usersDataService.getUserRoles(this.Employee).then(function (x) { return _this.filters.roles = x.Object; });
    };
    JobListComponent.prototype.getUsers = function (keyword) {
        var _this = this;
        var promise = this.usersDataService.getAll(keyword);
        return Observable_1.Observable.fromPromise(promise.then(function (result) {
            var resultData = result.Object;
            resultData.push(_this.emptyUser);
            return result.Object;
        }));
    };
    JobListComponent.prototype.AllocateJobResultSuccess = function (result) {
        this.allocating = false;
        if (result.Code === view_models_2.ResultCode.Success) {
            this.toastr.info("Jobs has been allocated");
        }
        else {
            var warnings_1 = {};
            result.Errors.forEach(function (error) {
                if (warnings_1[error.Message]) {
                    warnings_1[error.Message] = warnings_1[error.Message] + 1;
                }
                else {
                    warnings_1[error.Message] = 1;
                }
            });
            var message = "";
            for (var m in warnings_1) {
                if (warnings_1.hasOwnProperty(m)) {
                    if (message)
                        message += "<br>";
                    message += warnings_1[m] + " Jobs are not allocated as " + m;
                }
            }
            this.toastr.warning(message);
        }
    };
    JobListComponent.prototype.AllocateJobResultFailed = function (response) {
        this.allocating = false;
        this.messageBoxService.PopupErrorMessage('Error allocating jobs', response.json());
    };
    JobListComponent.prototype.AllocateJobList = function () {
        var _this = this;
        var selectedRows = this.selectionExceptions;
        if (this.selectAll || selectedRows.length > 0)
            if (this.selectAll)
                this.jobService.AllocateJobListByFilter(this.getJobsFilterViewModel([], 0), selectedRows)
                    .then(function (x) { return _this.AllocateJobResultSuccess(x); })
                    .catch(function (x) { return _this.AllocateJobResultFailed(x); });
            else
                this.jobService.AllocateJobListByIds(selectedRows)
                    .then(function (x) { return _this.AllocateJobResultSuccess(x); })
                    .catch(function (x) { return _this.AllocateJobResultFailed(x); });
        else {
            this.errorBody = [];
            if (selectedRows.length == 0)
                this.addError("Jobs are not selected");
        }
    };
    JobListComponent.prototype.HideJobListResult = function (x) {
        var _this = this;
        if (x.Code == view_models_2.ResultCode.Success)
            this.closeMessageModal(),
                this.jobService.filterCount(this.getJobsFilterViewModel(this.sortModel, 0)).then(function (x) {
                    if (x.Code == view_models_2.ResultCode.Success) {
                        _this.datasource.rowCount = x.Object;
                        _this.gridOptions.api.setDatasource(_this.datasource);
                    }
                });
        else {
            this.addError(x.ErrorMessage);
        }
    };
    JobListComponent.prototype.HideJobList = function () {
        var _this = this;
        var selectedRows = this.selectionExceptions;
        if (this.selectAll || selectedRows.length > 0)
            if (this.selectAll)
                this.jobService.HideJobListByFilter(this.getJobsFilterViewModel([], 0), selectedRows)
                    .then(function (x) { return _this.HideJobListResult(x); })
                    .catch(function (x) { return _this.HideJobListResult(x); });
            else
                this.jobService.HideJobListByIds(selectedRows)
                    .then(function (x) { return _this.HideJobListResult(x); })
                    .catch(function (x) { return _this.HideJobListResult(x); });
        else {
            this.errorBody = [];
            if (selectedRows.length == 0)
                this.addError("Jobs are not selected");
        }
    };
    JobListComponent.prototype.GetJobsListExcel = function () {
        var selectedRows = this.selectionExceptions;
        if (this.selectAll || selectedRows.length > 0)
            if (this.selectAll)
                this.jobService.ExportJobs(this.getJobsFilterViewModel([], 0), selectedRows);
            else
                this.jobService.GetJobsListExcel(selectedRows);
        else {
            this.showMessage("Jobs are not selected");
        }
    };
    JobListComponent.prototype.CloneJobToFYResult = function (x) {
        if (x.Code == view_models_2.ResultCode.Success)
            this.showMessage("Jobs have been successfully copied to next FY");
        else {
            this.showMessage("ERROR: " + x.ErrorMessage);
        }
    };
    JobListComponent.prototype.CloneJobToFY = function () {
        var _this = this;
        this.showMessage("Copy Jobs to next FY... ");
        var selectedRows = this.selectionExceptions;
        if (this.selectAll || selectedRows.length > 0)
            if (this.selectAll)
                this.jobService.CloneJobToFYByFilter(this.getJobsFilterViewModel([], 0), selectedRows)
                    .then(function (x) { return _this.CloneJobToFYResult(x); })
                    .catch(function (x) { return _this.CloneJobToFYResult(x); });
            else
                this.jobService.CloneJobToFYByIds(selectedRows)
                    .then(function (x) { return _this.CloneJobToFYResult(x); })
                    .catch(function (x) { return _this.CloneJobToFYResult(x); });
        else {
            this.errorBody = [];
            if (selectedRows.length == 0)
                this.addError("Jobs are not selected");
        }
    };
    Object.defineProperty(JobListComponent.prototype, "error", {
        get: function () {
            return this.errorBody && this.errorBody.length > 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(JobListComponent.prototype, "message", {
        get: function () {
            return this.messageBody && this.messageBody.length > 0;
        },
        enumerable: true,
        configurable: true
    });
    ;
    JobListComponent.prototype.addError = function (error) {
        this.messageBody = [];
        this.errorBody.push("Error " + (this.errorBody.length + 1) + ": " + error);
    };
    ;
    JobListComponent.prototype.closeErrorModal = function () {
        this.errorBody = [];
    };
    JobListComponent.prototype.showMessage = function (message) {
        this.messageBody = [message];
    };
    ;
    JobListComponent.prototype.closeMessageModal = function () {
        this.messageBody = [];
    };
    JobListComponent.prototype.notify = function (teamRoleId) {
        var _this = this;
        var selectedRows = this.selectionExceptions;
        if (this.selectAll || selectedRows.length > 0)
            if (this.selectAll) {
                var filterRequest = this.getJobsFilterViewModel([], 0);
                filterRequest.RoleId = teamRoleId;
                this.jobService.getNotificationLinkByFilter(filterRequest)
                    .then(function (result) {
                    if (result.Code == view_models_2.ResultCode.Success) {
                        window.open(result.Object);
                    }
                });
            }
            else {
                var request = {
                    RoleId: teamRoleId,
                    JobIds: selectedRows.map(function (job) { return job.JobId; })
                };
                this.jobService.getNotificationLink(request).then(function (result) {
                    if (result.Code == view_models_2.ResultCode.Success) {
                        window.open(result.Object);
                    }
                }, function (reason) {
                    _this.messageBoxService.PopupErrorMessage('Error creating notification link', reason.json());
                });
            }
    };
    return JobListComponent;
}());
JobListComponent = __decorate([
    core_1.Component({
        selector: "job-list",
        template: require("./job-list.component.html"),
        styles: [require("./job-list.component.css")]
    }),
    __metadata("design:paramtypes", [ng2_toastr_1.ToastsManager,
        job_service_1.JobService,
        dictionaries_service_1.DictionariesDataService,
        users_data_service_1.UsersDataService,
        message_box_service_1.MessageBoxService,
        security_service_1.SecurityService,
        selection_service_1.SelectionService])
], JobListComponent);
exports.JobListComponent = JobListComponent;
//# sourceMappingURL=job-list.component.js.map