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
var common_1 = require("@angular/common");
var core_1 = require("@angular/core");
var moment = require("moment");
var my_datepicker_extension_1 = require("../../../shared/my-datepicker-extension");
var employees_list_link_component_component_1 = require("./employees-list.link-component.component");
var select_all_header_component_1 = require("../shared/select-all-header/select-all-header.component");
var user_service_1 = require("../../services/user.service");
var dictionaries_service_1 = require("../../services/dictionaries/dictionaries.service");
var security_service_1 = require("../../services/security.service");
var selection_service_1 = require("../../services/selection.service");
var view_models_1 = require("../../../view-models/view-models");
var view_models_2 = require("../../../view-models/view-models");
var EmployeesFilters = (function () {
    function EmployeesFilters() {
    }
    return EmployeesFilters;
}());
var EmployeesListComponent = (function () {
    function EmployeesListComponent(userService, dictionariesDataService, datePipe, securityService, selectionService) {
        this.userService = userService;
        this.dictionariesDataService = dictionariesDataService;
        this.datePipe = datePipe;
        this.securityService = securityService;
        this.selectionService = selectionService;
        this.key = "employeesList";
        this.columnWidths = {};
        this._territory = null;
        this._lineOfService = null;
        this._roleAssignTerritory = null;
        this.CanAddEmployee = false;
        this.filters = new EmployeesFilters();
        this.Grade = null;
        this.BusinessUnit = null;
        this.Office = null;
        this.AuditLicenses = [];
        this.AvailableForAllocation = null;
        this.CanSignAuditOpinion = null;
        this.MinJoiningDate = null;
        this.MaxJoiningDate = null;
        this.MinLeavingDate = null;
        this.MaxLeavingDate = null;
        this.MinReturnDate = null;
        this.MaxReturnDate = null;
        this.StaffNumber = null;
        this.FullName = null;
        this.Expertise = null;
        this.UserStatus = null;
        this.OrderBy = null;
        this.RoleAssignBusinessUnit = null;
        this.RoleAssignSystemRole = null;
        this.sortModel = [{ colId: "FullName", sort: "asc" }];
        this.selectAll = false;
        this.selectionExceptions = [];
        this.Switched = false;
        this.errorBody = [];
        this.messageBody = [];
    }
    Object.defineProperty(EmployeesListComponent.prototype, "offices", {
        get: function () {
            var _this = this;
            if (!this.Territory || !this.filters.allOffices)
                return [];
            return this.filters.allOffices.filter(function (office) { return office.TerritoryId == _this.Territory.TerritoryId; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EmployeesListComponent.prototype, "businessUnits", {
        get: function () {
            var _this = this;
            if (!this.LineOfService || !this.Territory || !this.filters.businessUnits)
                return [];
            return this.filters.businessUnits.filter(function (businessUnit) { return businessUnit.LineOfServiceId == _this.LineOfService.LineOfServiceId && businessUnit.TerritoryId == _this.Territory.TerritoryId; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EmployeesListComponent.prototype, "roleAssignBusinessUnits", {
        get: function () {
            var _this = this;
            if (!this.RoleAssignTerritory || !this.filters.businessUnits)
                return [];
            return this.filters.businessUnits.filter(function (businessUnit) { return businessUnit.TerritoryId == _this.RoleAssignTerritory.TerritoryId; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EmployeesListComponent.prototype, "auditLicenses", {
        get: function () {
            var _this = this;
            if (!this.filters.auditLicenses)
                return [];
            return this.filters.auditLicenses.filter(function (license) { return license.TerritoryId == null || (_this.Territory && license.TerritoryId == _this.Territory.TerritoryId); });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EmployeesListComponent.prototype, "RoleAssignTerritory", {
        get: function () {
            return this._roleAssignTerritory;
        },
        set: function (value) {
            this._roleAssignTerritory = value;
            this.RoleAssignBusinessUnit = null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EmployeesListComponent.prototype, "Territory", {
        get: function () {
            return this._territory;
        },
        set: function (value) {
            this._territory = value;
            this.Office = null;
            this.BusinessUnit = null;
            this.AuditLicenses = [];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EmployeesListComponent.prototype, "LineOfService", {
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
    EmployeesListComponent.prototype.isDateValid = function (min, max) {
        if (min && max) {
            var minDate = my_datepicker_extension_1.MyDatepickerExtension.convertMyDateToMoment(min);
            var maxDate = my_datepicker_extension_1.MyDatepickerExtension.convertMyDateToMoment(max);
            return minDate.isSameOrBefore(maxDate);
        }
        return true;
    };
    EmployeesListComponent.prototype.dateErrorMessage = function (min, max) {
        return this.isDateValid(min, max) ? "" : "From-date cannot be greater than to-date";
    };
    Object.defineProperty(EmployeesListComponent.prototype, "isFilterUnvalid", {
        get: function () {
            var val = false;
            val = val || !this.isDateValid(this.MinJoiningDate, this.MaxJoiningDate);
            val = val || !this.isDateValid(this.MinLeavingDate, this.MaxLeavingDate);
            val = val || !this.isDateValid(this.MinReturnDate, this.MaxReturnDate);
            return val;
        },
        enumerable: true,
        configurable: true
    });
    EmployeesListComponent.prototype.getEmployeesFilterViewModel = function (aggridSortModel, startRow) {
        var result = new view_models_2.UserFilterViewModel();
        result.AuditLicenseId = this.AuditLicenses ? this.AuditLicenses.map(function (l) { return l.AuditLicenseId; }) : null;
        result.AvailableForAllocation = this.AvailableForAllocation;
        result.BusinessUnitId = this.BusinessUnit ? this.BusinessUnit.BusinessUnitId : null;
        result.CanSignAuditOpinion = this.CanSignAuditOpinion;
        result.Expertise = this.Expertise;
        result.FullName = this.FullName;
        result.GradeSearchCode = this.Grade ? this.Grade.Code : null;
        result.LineOfServiceId = this.LineOfService ? this.LineOfService.LineOfServiceId : null;
        result.MaxJoiningDate = this.MaxJoiningDate ? my_datepicker_extension_1.MyDatepickerExtension.convertMyDateToMoment(this.MaxJoiningDate).endOf('day') : null;
        result.MaxLeavingDate = this.MaxLeavingDate ? my_datepicker_extension_1.MyDatepickerExtension.convertMyDateToMoment(this.MaxLeavingDate).endOf('day') : null;
        result.MaxReturnDate = this.MaxReturnDate ? my_datepicker_extension_1.MyDatepickerExtension.convertMyDateToMoment(this.MaxReturnDate).endOf('day') : null;
        result.MinJoiningDate = this.MinJoiningDate ? my_datepicker_extension_1.MyDatepickerExtension.convertMyDateToMoment(this.MinJoiningDate).startOf('day') : null;
        result.MinLeavingDate = this.MinLeavingDate ? my_datepicker_extension_1.MyDatepickerExtension.convertMyDateToMoment(this.MinLeavingDate).startOf('day') : null;
        result.MinReturnDate = this.MinReturnDate ? my_datepicker_extension_1.MyDatepickerExtension.convertMyDateToMoment(this.MinReturnDate).startOf('day') : null;
        result.OfficeId = this.Office ? this.Office.OfficeId : null;
        result.StaffNumber = this.StaffNumber;
        if (aggridSortModel.length > 0) {
            result.OrderBy = new Array();
            aggridSortModel.forEach(function (srt) {
                result.OrderBy.push({ Name: srt.colId, Ascending: srt.sort == 'asc' });
            });
        }
        result.Take = this.gridOptions.paginationPageSize;
        result.Skip = startRow;
        result.UserStatusId = this.UserStatus ? this.UserStatus.UserStatusId : null;
        result.TerritoryId = this.Territory ? this.Territory.TerritoryId : null;
        return result;
    };
    EmployeesListComponent.prototype.SetSelectAll = function (value) {
        this.selectAll = value;
        this.selectionExceptions = [];
        if (value)
            this.gridOptions.api.selectAll();
        else
            this.gridOptions.api.deselectAll();
    };
    EmployeesListComponent.prototype.removeException = function (model) {
        var foundModelIndex = this.selectionExceptions.findIndex(function (x) { return x.UserId == model.UserId; });
        if (foundModelIndex != -1)
            this.selectionExceptions.splice(foundModelIndex, 1);
    };
    EmployeesListComponent.prototype.ngOnDestroy = function () {
        this.subscription.unsubscribe();
    };
    EmployeesListComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.subscription = this.selectionService.getSelectionChangeEmitter().subscribe(function (item) { return _this.SetSelectAll(item); });
        this.securityService.getCurrentUser()
            .then(function (user) {
            _this.CanAddEmployee = user.Object.CanEditUsers;
        });
        this.datePickerOptions = {
            dateFormat: 'dd/mm/yyyy',
            firstDayOfWeek: 'mo'
        };
        var ctrl = this;
        this.gridOptions = {};
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
                field: "FullName",
                width: 250,
                cellRendererFramework: employees_list_link_component_component_1.EmployeesListLinkComponent,
                sort: 'asc',
                sortingOrder: ['asc', 'desc']
            },
            {
                headerName: "Grade",
                field: "GradeName",
                width: 420,
                sortingOrder: ['asc', 'desc']
            },
            {
                headerName: "Staff Number",
                field: "StaffNumber",
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
                headerName: "Avalible for allocation",
                field: "AvailableForAllocation",
                sortingOrder: ['asc', 'desc'],
                cellRenderer: function (p) {
                    return p.value ? 'Yes' : 'No';
                },
                hide: true
            },
            {
                headerName: "Joining date",
                field: 'JoinDate',
                sortingOrder: ['asc', 'desc'],
                cellRenderer: function (p) {
                    return p.value ? ctrl.datePipe.transform(p.value, 'dd/MM/yyyy') : "";
                },
                hide: true
            },
            {
                headerName: "Leaving date",
                field: 'LeaveDate',
                sortingOrder: ['asc', 'desc'],
                cellRenderer: function (p) {
                    return p.value ? ctrl.datePipe.transform(p.value, 'dd/MM/yyyy') : "";
                },
                hide: true
            },
            {
                headerName: "Return from leave date",
                field: 'ReturnDate',
                sortingOrder: ['asc', 'desc'],
                cellRenderer: function (p) {
                    return p.value ? ctrl.datePipe.transform(p.value, 'dd/MM/yyyy') : "";
                },
                hide: true
            },
            {
                headerName: "Audit license",
                field: 'AuditLicenses',
                cellRenderer: function (p) {
                    return p.value.map(function (x) { return x.AuditLicenseName; }).join("; ");
                },
                suppressSorting: true,
                hide: true
            },
            {
                headerName: "Expertise",
                field: 'Expertise',
                sortingOrder: ['asc', 'desc'],
                hide: true
            },
            {
                headerName: "Status",
                field: "UserStatusName",
                sortingOrder: ['asc', 'desc']
            },
            {
                headerName: "Can sign an audit opinion",
                field: 'CanSignAuditOpinion',
                sortingOrder: ['asc', 'desc'],
                cellRenderer: function (p) {
                    return p.value ? 'Yes' : 'No';
                },
                hide: true
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
                ctrl.columnWidths[column.colId] = column.actualWidth;
                localStorage.setItem(_this.key + "_widths", JSON.stringify(ctrl.columnWidths));
            }
        };
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
                ctrl.userService.filterUsers(ctrl.getlastfilter(params.sortModel, params.startRow))
                    .then(function (users) {
                    if (users.Code == view_models_1.ResultCode.Success) {
                        // set selections
                        setTimeout(function () {
                            ctrl.gridOptions.api.forEachNode(function (rowNode) {
                                if (ctrl.selectionExceptions.findIndex(function (x) { return x.UserId == rowNode.data.UserId; }) == -1)
                                    rowNode.setSelected(ctrl.selectAll);
                            });
                        }, 100);
                        params.successCallback(users.Object);
                    }
                    else
                        params.failCallback();
                });
            }
        };
        var dictionaryRequest = new view_models_2.ContextDictionatyRequestViewModel();
        dictionaryRequest.Request = view_models_1.DictionaryRequestViewModel.BusinessUnit
            | view_models_1.DictionaryRequestViewModel.Grade
            | view_models_1.DictionaryRequestViewModel.LineOfService
            | view_models_1.DictionaryRequestViewModel.Territory
            | view_models_1.DictionaryRequestViewModel.Office
            | view_models_1.DictionaryRequestViewModel.SystemRole
            | view_models_1.DictionaryRequestViewModel.AuditLicense
            | view_models_1.DictionaryRequestViewModel.UserStatus;
        dictionaryRequest.SystemAction = view_models_1.SystemActionViewModel.View;
        dictionaryRequest.SystemObject = view_models_1.SystemObjectViewModel.User;
        this.dictionariesDataService.getAll(dictionaryRequest)
            .then(function (response) {
            _this.filters.grades = response["Grade"];
            _this.filters.businessUnits = response["BusinessUnit"];
            _this.filters.linesOS = response["LineOfService"];
            _this.filters.allOffices = response["Office"];
            _this.filters.territories = response["Territory"];
            _this.filters.systemRoles = response["SystemRole"];
            _this.filters.auditLicenses = response["AuditLicense"];
            _this.filters.statuses = response["UserStatus"];
            // restore filters
            var savedFilter = localStorage.getItem("employees-filter");
            if (savedFilter)
                _this.restoreFilter(JSON.parse(savedFilter));
            _this.filter();
        });
    };
    EmployeesListComponent.prototype.restoreFilter = function (filter) {
        var _this = this;
        this.Territory = this.filters.territories.find(function (x) { return x.TerritoryId == filter.TerritoryId; });
        this.LineOfService = this.filters.linesOS.find(function (x) { return x.LineOfServiceId == filter.LineOfServiceId; });
        if (filter.AuditLicenseId && filter.AuditLicenseId.length > 0) {
            filter.AuditLicenseId.forEach(function (x) {
                var au = _this.filters.auditLicenses.find(function (y) { return y.AuditLicenseId == x; });
                if (au)
                    _this.AuditLicenses.push(au);
            });
        }
        this.AvailableForAllocation = filter.AvailableForAllocation;
        this.BusinessUnit = this.filters.businessUnits.find(function (x) { return x.BusinessUnitId == filter.BusinessUnitId; });
        this.CanSignAuditOpinion = filter.CanSignAuditOpinion;
        this.Expertise = filter.Expertise;
        this.FullName = filter.FullName;
        this.Grade = this.filters.grades.find(function (x) { return x.Code == filter.GradeSearchCode; });
        if (filter.MaxJoiningDate)
            this.MaxJoiningDate = my_datepicker_extension_1.MyDatepickerExtension.convertMomentToMyDate(moment(filter.MaxJoiningDate));
        if (filter.MaxLeavingDate)
            this.MaxLeavingDate = my_datepicker_extension_1.MyDatepickerExtension.convertMomentToMyDate(moment(filter.MaxLeavingDate));
        if (filter.MaxReturnDate)
            this.MaxReturnDate = my_datepicker_extension_1.MyDatepickerExtension.convertMomentToMyDate(moment(filter.MaxReturnDate));
        if (filter.MinJoiningDate)
            this.MinJoiningDate = my_datepicker_extension_1.MyDatepickerExtension.convertMomentToMyDate(moment(filter.MinJoiningDate));
        if (filter.MinLeavingDate)
            this.MinLeavingDate = my_datepicker_extension_1.MyDatepickerExtension.convertMomentToMyDate(moment(filter.MinLeavingDate));
        if (filter.MinReturnDate)
            this.MinReturnDate = my_datepicker_extension_1.MyDatepickerExtension.convertMomentToMyDate(moment(filter.MinReturnDate));
        this.Office = this.filters.allOffices.find(function (x) { return x.OfficeId == filter.OfficeId; });
        this.StaffNumber = filter.StaffNumber;
        this.UserStatus = this.filters.statuses.find(function (x) { return x.UserStatusId == filter.UserStatusId; });
    };
    EmployeesListComponent.prototype.filter = function () {
        var _this = this;
        var filter = this.getEmployeesFilterViewModel(this.sortModel, 0);
        localStorage.setItem("employees-filter", JSON.stringify(filter));
        this.userService.filterUsersCount(filter).then(function (x) {
            if (x.Code == view_models_1.ResultCode.Success) {
                // Clear selection
                _this.SetSelectAll(false);
                _this.selectionService.emitSelectionChangeEvent(false);
                _this.datasource.rowCount = x.Object;
                _this.gridOptions.api.setDatasource(_this.datasource);
            }
        });
        this.lastfilter = this.getEmployeesFilterViewModel(this.sortModel, 0);
    };
    EmployeesListComponent.prototype.getlastfilter = function (aggridSortModel, startRow) {
        var currentFilter = this.getEmployeesFilterViewModel(aggridSortModel, startRow);
        if (this.lastfilter)
            this.lastfilter.OrderBy = currentFilter.OrderBy,
                this.lastfilter.Skip = currentFilter.Skip;
        else
            this.lastfilter = currentFilter,
                this.lastfilter.Skip = currentFilter.Skip;
        return this.lastfilter;
    };
    EmployeesListComponent.prototype.clear = function () {
        this.Grade = null;
        this.Territory = null;
        this.LineOfService = null;
        this.BusinessUnit = null;
        this.Office = null;
        this.AuditLicenses = [];
        this.AvailableForAllocation = null;
        this.CanSignAuditOpinion = null;
        this.MinJoiningDate = null;
        this.MaxJoiningDate = null;
        this.MinLeavingDate = null;
        this.MaxLeavingDate = null;
        this.MinReturnDate = null;
        this.MaxReturnDate = null;
        this.StaffNumber = null;
        this.FullName = null;
        this.Expertise = null;
        this.UserStatus = null;
        this.OrderBy = null;
        this.Switched = !this.Switched;
        this.filter();
    };
    EmployeesListComponent.prototype.AssignmentResult = function (x) {
        if (x.Code == view_models_1.ResultCode.Success)
            this.showMessage("Roles have beed successfully assigned");
        else {
            this.closeMessageModal();
            this.addError(x.ErrorMessage);
        }
    };
    EmployeesListComponent.prototype.AssignRole = function () {
        var _this = this;
        this.showMessage("Assigning roles... ");
        var selectedRows = this.selectionExceptions;
        if ((this.selectAll || selectedRows.length > 0) && this.RoleAssignTerritory && this.RoleAssignSystemRole)
            if (this.selectAll) {
                this.userService.assignRoleByFilter(this.getEmployeesFilterViewModel([], 0), selectedRows, this.RoleAssignTerritory, this.RoleAssignSystemRole, this.RoleAssignBusinessUnit)
                    .then(function (x) { return _this.AssignmentResult(x); });
            }
            else
                this.userService.assignRoleByIds(selectedRows, this.RoleAssignTerritory, this.RoleAssignSystemRole, this.RoleAssignBusinessUnit)
                    .then(function (x) { return _this.AssignmentResult(x); });
        else {
            this.errorBody = [];
            if (selectedRows.length == 0)
                this.addError("Users are not selected");
            if (!this.RoleAssignTerritory)
                this.addError("Territory is not selected");
            if (!this.RoleAssignSystemRole)
                this.addError("Role is not selected");
        }
    };
    EmployeesListComponent.prototype.RemoveAssignmentResult = function (x) {
        if (x.Code == view_models_1.ResultCode.Success)
            this.showMessage("Roles have beed successfully removed");
        else {
            this.closeMessageModal();
            this.addError(x.ErrorMessage);
        }
    };
    EmployeesListComponent.prototype.RemoveRole = function () {
        var _this = this;
        this.showMessage("Removing roles... ");
        var selectedRows = this.selectionExceptions;
        if ((this.selectAll || selectedRows.length > 0) && this.RoleAssignTerritory && this.RoleAssignSystemRole)
            if (this.selectAll) {
                this.userService.removeRoleByFilter(this.getEmployeesFilterViewModel([], 0), selectedRows, this.RoleAssignTerritory, this.RoleAssignSystemRole, this.RoleAssignBusinessUnit)
                    .then(function (x) { return _this.RemoveAssignmentResult(x); });
            }
            else
                this.userService.removeRoleByIds(selectedRows, this.RoleAssignTerritory, this.RoleAssignSystemRole, this.RoleAssignBusinessUnit)
                    .then(function (x) { return _this.RemoveAssignmentResult(x); });
        else {
            this.errorBody = [];
            if (!this.selectAll && selectedRows.length == 0)
                this.addError("Users are not selected");
            if (!this.RoleAssignTerritory)
                this.addError("Territory is not selected");
            if (!this.RoleAssignSystemRole)
                this.addError("Role is not selected");
        }
    };
    Object.defineProperty(EmployeesListComponent.prototype, "error", {
        get: function () {
            return this.errorBody && this.errorBody.length > 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EmployeesListComponent.prototype, "message", {
        get: function () {
            return this.messageBody && this.messageBody.length > 0;
        },
        enumerable: true,
        configurable: true
    });
    ;
    EmployeesListComponent.prototype.addError = function (error) {
        this.messageBody = [];
        this.errorBody.push("Error " + (this.errorBody.length + 1) + ": " + error);
    };
    ;
    EmployeesListComponent.prototype.closeErrorModal = function () {
        this.errorBody = [];
    };
    EmployeesListComponent.prototype.showMessage = function (message) {
        this.messageBody = [message];
    };
    ;
    EmployeesListComponent.prototype.closeMessageModal = function () {
        this.messageBody = [];
    };
    return EmployeesListComponent;
}());
EmployeesListComponent = __decorate([
    core_1.Component({
        selector: "employees-list",
        template: require("./employees-list.component.html"),
        styles: [require('./employees-list.component.css')]
    }),
    __metadata("design:paramtypes", [user_service_1.UserService,
        dictionaries_service_1.DictionariesDataService,
        common_1.DatePipe,
        security_service_1.SecurityService,
        selection_service_1.SelectionService])
], EmployeesListComponent);
exports.EmployeesListComponent = EmployeesListComponent;
//# sourceMappingURL=employees-list.component.js.map