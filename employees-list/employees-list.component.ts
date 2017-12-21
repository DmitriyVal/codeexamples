import { DatePipe } from '@angular/common';
import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router, ActivatedRoute } from '@angular/router';

import * as moment from "moment";

import { GridOptions, IDatasource, IGetRowsParams, ColDef, GetMainMenuItemsParams, MenuItemDef, RowNode } from "ag-grid";
import { INgxMyDpOptions, IMyDateModel } from 'ngx-mydatepicker';

import { MyDatepickerExtension } from '../../../shared/my-datepicker-extension'
import { EnumExtension } from "../../../shared/enum-extension"

import { EmployeesListLinkComponent } from './employees-list.link-component.component';
import { SelectAllHeader } from "../shared/select-all-header/select-all-header.component";

import { UserService } from "../../services/user.service";
import { DictionariesDataService } from "../../services/dictionaries/dictionaries.service";
import { SecurityService } from "../../services/security.service";
import { SelectionService } from "../../services/selection.service";


import { DictionaryRequestViewModel, ResultCode, SystemActionViewModel, SystemObjectViewModel, Result } from '../../../view-models/view-models';
import {
    UserViewModel,
    UserFilterViewModel,
    OrderByViewModel,
    GradeViewModel,
    TerritoryViewModel,
    LineOfServiceViewModel,
    BusinessUnitViewModel,
    OfficeViewModel,
    SystemRoleViewModel,
    AuditLicenseViewModel,
    UserStatusViewModel,
    ContextDictionatyRequestViewModel
} from '../../../view-models/view-models';

class EmployeesFilters {
    grades: GradeViewModel[];
    territories: TerritoryViewModel[];
    linesOS: LineOfServiceViewModel[];
    businessUnits: BusinessUnitViewModel[];
    allOffices: OfficeViewModel[];
    systemRoles: SystemRoleViewModel[];
    auditLicenses: AuditLicenseViewModel[];
    statuses: UserStatusViewModel[];
}

@Component({
    selector: "employees-list",
    template: require("./employees-list.component.html"),
    styles: [require('./employees-list.component.css')]
})
export class EmployeesListComponent implements OnInit, OnDestroy {

    public datePickerOptions: INgxMyDpOptions;

    public key: string = "employeesList";
    private columnWidths: any = {};

    private gridOptions: GridOptions;
    private datasource: IDatasource
    private _territory: TerritoryViewModel = null;
    private _lineOfService: LineOfServiceViewModel = null;
    private _roleAssignTerritory: TerritoryViewModel = null;

    constructor(
        private userService: UserService,
        private dictionariesDataService: DictionariesDataService,
        private datePipe: DatePipe,
        private securityService: SecurityService,
        private selectionService: SelectionService
    ) { }
    CanAddEmployee: boolean = false;
    filters: EmployeesFilters = new EmployeesFilters();
    get offices(): OfficeViewModel[] {
        if (!this.Territory || !this.filters.allOffices) return [];
        return this.filters.allOffices.filter(office => office.TerritoryId == this.Territory.TerritoryId);
    }

    get businessUnits(): BusinessUnitViewModel[] {
        if (!this.LineOfService || !this.Territory || !this.filters.businessUnits) return [];
        return this.filters.businessUnits.filter(businessUnit => businessUnit.LineOfServiceId == this.LineOfService.LineOfServiceId && businessUnit.TerritoryId == this.Territory.TerritoryId)
    }

    get roleAssignBusinessUnits(): BusinessUnitViewModel[] {
        if (!this.RoleAssignTerritory || !this.filters.businessUnits) return [];
        return this.filters.businessUnits.filter(businessUnit => businessUnit.TerritoryId == this.RoleAssignTerritory.TerritoryId)
    }

    get auditLicenses(): AuditLicenseViewModel[] {
        if (!this.filters.auditLicenses) return [];
        return this.filters.auditLicenses.filter(license => license.TerritoryId == null || (this.Territory && license.TerritoryId == this.Territory.TerritoryId));
    }

    get RoleAssignTerritory() {
        return this._roleAssignTerritory;
    }

    set RoleAssignTerritory(value: TerritoryViewModel) {
        this._roleAssignTerritory = value;
        this.RoleAssignBusinessUnit = null;
    }

    get Territory(): TerritoryViewModel {
        return this._territory;
    }
    set Territory(value: TerritoryViewModel) {
        this._territory = value;
        this.Office = null;
        this.BusinessUnit = null;
        this.AuditLicenses = [];
    }

    get LineOfService(): LineOfServiceViewModel {
        return this._lineOfService;
    }
    set LineOfService(value: LineOfServiceViewModel) {
        this._lineOfService = value;
        this.BusinessUnit = null;
    }

    public Grade: GradeViewModel = null;
    public BusinessUnit: BusinessUnitViewModel = null;
    public Office: OfficeViewModel = null;
    public AuditLicenses: AuditLicenseViewModel[] = [];
    public AvailableForAllocation: boolean = null;
    public CanSignAuditOpinion: boolean = null;

    public MinJoiningDate: IMyDateModel = null;
    public MaxJoiningDate: IMyDateModel = null;   
    public MinLeavingDate: IMyDateModel = null;
    public MaxLeavingDate: IMyDateModel = null;
    public MinReturnDate: IMyDateModel = null;
    public MaxReturnDate: IMyDateModel = null;

    public isDateValid(min: IMyDateModel, max: IMyDateModel): boolean {
        if (min && max) {
            let minDate = MyDatepickerExtension.convertMyDateToMoment(min);
            let maxDate = MyDatepickerExtension.convertMyDateToMoment(max);
            return minDate.isSameOrBefore(maxDate);
        }
        return true;
    }
    public dateErrorMessage(min: IMyDateModel, max: IMyDateModel): string {
        return this.isDateValid(min, max) ? "" : "From-date cannot be greater than to-date";
    }
    public get isFilterUnvalid(): boolean {
        let val = false;
        val = val || !this.isDateValid(this.MinJoiningDate, this.MaxJoiningDate);
        val = val || !this.isDateValid(this.MinLeavingDate, this.MaxLeavingDate);
        val = val || !this.isDateValid(this.MinReturnDate, this.MaxReturnDate);
        return val;
    }

    public StaffNumber: string = null;
    public FullName: string = null;
    public Expertise: string = null;
    public UserStatus: UserStatusViewModel = null;
    public OrderBy: string = null;

    public RoleAssignBusinessUnit: BusinessUnitViewModel = null;
    public RoleAssignSystemRole: SystemRoleViewModel = null;

    private lastfilter: UserFilterViewModel;

    private sortModel: any = [{ colId: "FullName", sort: "asc" }];
    
    public getEmployeesFilterViewModel(aggridSortModel: any[], startRow: number): UserFilterViewModel {
        var result = new UserFilterViewModel();
        result.AuditLicenseId = this.AuditLicenses ? this.AuditLicenses.map(l => l.AuditLicenseId) : null;
        result.AvailableForAllocation = this.AvailableForAllocation;
        result.BusinessUnitId = this.BusinessUnit ? this.BusinessUnit.BusinessUnitId : null;
        result.CanSignAuditOpinion = this.CanSignAuditOpinion;
        result.Expertise = this.Expertise;
        result.FullName = this.FullName;
        result.GradeSearchCode = this.Grade ? this.Grade.Code : null;
        result.LineOfServiceId = this.LineOfService ? this.LineOfService.LineOfServiceId : null;
        result.MaxJoiningDate = this.MaxJoiningDate ? MyDatepickerExtension.convertMyDateToMoment(this.MaxJoiningDate).endOf('day') : null;
        result.MaxLeavingDate = this.MaxLeavingDate ? MyDatepickerExtension.convertMyDateToMoment(this.MaxLeavingDate).endOf('day') : null;
        result.MaxReturnDate = this.MaxReturnDate ? MyDatepickerExtension.convertMyDateToMoment(this.MaxReturnDate).endOf('day') : null;
        result.MinJoiningDate = this.MinJoiningDate ? MyDatepickerExtension.convertMyDateToMoment(this.MinJoiningDate).startOf('day') : null;
        result.MinLeavingDate = this.MinLeavingDate ? MyDatepickerExtension.convertMyDateToMoment(this.MinLeavingDate).startOf('day') : null;
        result.MinReturnDate = this.MinReturnDate ? MyDatepickerExtension.convertMyDateToMoment(this.MinReturnDate).startOf('day') : null;
        result.OfficeId = this.Office ? this.Office.OfficeId : null;

        result.StaffNumber = this.StaffNumber;
        if (aggridSortModel.length > 0) {
            result.OrderBy = new Array<OrderByViewModel>();
            aggridSortModel.forEach(srt => {
                result.OrderBy.push({ Name: srt.colId, Ascending: srt.sort == 'asc' });
            })
        }

        result.Take = this.gridOptions.paginationPageSize;
        result.Skip = startRow;

        result.UserStatusId = this.UserStatus ? this.UserStatus.UserStatusId : null;
        result.TerritoryId = this.Territory ? this.Territory.TerritoryId : null;
        return result;
    }

    subscription: any;
    selectAll: boolean = false;
    selectionExceptions: UserViewModel[] = [];

    SetSelectAll(value: boolean) {
        this.selectAll = value;
        this.selectionExceptions = [];
        if (value)
            this.gridOptions.api.selectAll();
        else
            this.gridOptions.api.deselectAll();
    }

    removeException(model: UserViewModel): void {
        var foundModelIndex = this.selectionExceptions.findIndex(x => x.UserId == model.UserId);
        if (foundModelIndex != -1)
            this.selectionExceptions.splice(foundModelIndex, 1);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    ngOnInit(): void {
        this.subscription = this.selectionService.getSelectionChangeEmitter().subscribe(item => this.SetSelectAll(item));

        this.securityService.getCurrentUser()
            .then(user => {
                this.CanAddEmployee = user.Object.CanEditUsers;
            });

        this.datePickerOptions = {
            dateFormat: 'dd/mm/yyyy',
            firstDayOfWeek: 'mo'
        };

        var ctrl = this;

        this.gridOptions = {};
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
                field: "FullName",
                width: 250,
                cellRendererFramework: EmployeesListLinkComponent,
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
                    return p.value.map(x => x.AuditLicenseName).join("; ");
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

        this.columnWidths = JSON.parse(localStorage.getItem(`${this.key}_widths`) || "{}");
        (<ColDef[]>this.gridOptions.columnDefs).forEach(x => {
            if (this.columnWidths[x.field])
                x.width = this.columnWidths[x.field];
        });
        this.gridOptions.enableColResize = true;
        this.gridOptions.onColumnResized = (event) => {
            if (event.isFinished()) {
                var column = event.column;
                ctrl.columnWidths[column.colId] = column.actualWidth;
                localStorage.setItem(`${this.key}_widths`, JSON.stringify(ctrl.columnWidths));
            }
        }
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
                ctrl.userService.filterUsers(ctrl.getlastfilter(params.sortModel, params.startRow))
                    .then(users => {
                        if (users.Code == ResultCode.Success) {
                            // set selections
                            setTimeout(() => {
                                ctrl.gridOptions.api.forEachNode((rowNode: RowNode) => {
                                    if (ctrl.selectionExceptions.findIndex(x => x.UserId == rowNode.data.UserId) == -1)
                                        rowNode.setSelected(ctrl.selectAll);
                                })
                            }, 100);
                            params.successCallback(users.Object);
                        }
                        else
                            params.failCallback();
                    });
            }
        }

        var dictionaryRequest = new ContextDictionatyRequestViewModel();
        dictionaryRequest.Request = DictionaryRequestViewModel.BusinessUnit
            | DictionaryRequestViewModel.Grade
            | DictionaryRequestViewModel.LineOfService
            | DictionaryRequestViewModel.Territory
            | DictionaryRequestViewModel.Office
            | DictionaryRequestViewModel.SystemRole
            | DictionaryRequestViewModel.AuditLicense
            | DictionaryRequestViewModel.UserStatus;
        dictionaryRequest.SystemAction = SystemActionViewModel.View;
        dictionaryRequest.SystemObject = SystemObjectViewModel.User;

        this.dictionariesDataService.getAll(dictionaryRequest)
            .then(response => {
                this.filters.grades = response["Grade"];
                this.filters.businessUnits = response["BusinessUnit"];
                this.filters.linesOS = response["LineOfService"];
                this.filters.allOffices = response["Office"];
                this.filters.territories = response["Territory"];
                this.filters.systemRoles = response["SystemRole"];
                this.filters.auditLicenses = response["AuditLicense"];
                this.filters.statuses = response["UserStatus"];

                // restore filters
                var savedFilter = localStorage.getItem("employees-filter");
                if (savedFilter)
                    this.restoreFilter(JSON.parse(savedFilter) as UserFilterViewModel);

                this.filter();
            });
    }

    restoreFilter(filter: UserFilterViewModel): void {
        this.Territory = this.filters.territories.find(x => x.TerritoryId == filter.TerritoryId);
        this.LineOfService = this.filters.linesOS.find(x => x.LineOfServiceId == filter.LineOfServiceId);
        if (filter.AuditLicenseId && filter.AuditLicenseId.length > 0) {
            filter.AuditLicenseId.forEach(x => {
                var au = this.filters.auditLicenses.find(y => y.AuditLicenseId == x)
                if (au)
                    this.AuditLicenses.push(au);
            })
        }
        this.AvailableForAllocation = filter.AvailableForAllocation;
        this.BusinessUnit = this.filters.businessUnits.find(x => x.BusinessUnitId == filter.BusinessUnitId);
        this.CanSignAuditOpinion = filter.CanSignAuditOpinion;
        this.Expertise = filter.Expertise;
        this.FullName = filter.FullName;
        this.Grade = this.filters.grades.find(x => x.Code == filter.GradeSearchCode);
        if (filter.MaxJoiningDate)
            this.MaxJoiningDate = MyDatepickerExtension.convertMomentToMyDate(moment(filter.MaxJoiningDate));
        if (filter.MaxLeavingDate)
            this.MaxLeavingDate = MyDatepickerExtension.convertMomentToMyDate(moment(filter.MaxLeavingDate));
        if (filter.MaxReturnDate)
            this.MaxReturnDate = MyDatepickerExtension.convertMomentToMyDate(moment(filter.MaxReturnDate));
        if (filter.MinJoiningDate)
            this.MinJoiningDate = MyDatepickerExtension.convertMomentToMyDate(moment(filter.MinJoiningDate));
        if (filter.MinLeavingDate)
            this.MinLeavingDate = MyDatepickerExtension.convertMomentToMyDate(moment(filter.MinLeavingDate));
        if (filter.MinReturnDate)
            this.MinReturnDate = MyDatepickerExtension.convertMomentToMyDate(moment(filter.MinReturnDate));
        this.Office = this.filters.allOffices.find(x => x.OfficeId == filter.OfficeId);
        this.StaffNumber = filter.StaffNumber;

        this.UserStatus = this.filters.statuses.find(x => x.UserStatusId == filter.UserStatusId);
    }

    filter(): void {
        let filter = this.getEmployeesFilterViewModel(this.sortModel, 0);
        localStorage.setItem("employees-filter", JSON.stringify(filter));
        this.userService.filterUsersCount(filter).then(x => {
            if (x.Code == ResultCode.Success) {
                // Clear selection
                this.SetSelectAll(false);
                this.selectionService.emitSelectionChangeEvent(false);

                this.datasource.rowCount = x.Object;
                this.gridOptions.api.setDatasource(this.datasource);
            }
        })

        this.lastfilter = this.getEmployeesFilterViewModel(this.sortModel, 0)
    }



    getlastfilter(aggridSortModel: any[], startRow: number) {
        var currentFilter = this.getEmployeesFilterViewModel(aggridSortModel, startRow);
        if (this.lastfilter)
            this.lastfilter.OrderBy = currentFilter.OrderBy,
                this.lastfilter.Skip = currentFilter.Skip;

        else
            this.lastfilter = currentFilter,
                this.lastfilter.Skip = currentFilter.Skip;

        return this.lastfilter;
    }

    Switched: boolean = false;

    clear(): void {
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
    }

    private AssignmentResult(x: Result) {
        if (x.Code == ResultCode.Success)
            this.showMessage("Roles have beed successfully assigned");
        else {
            this.closeMessageModal();
            this.addError(x.ErrorMessage);
        }
    }

    public AssignRole(): any {
        this.showMessage("Assigning roles... ");
        let selectedRows = this.selectionExceptions;
        if ((this.selectAll || selectedRows.length > 0) && this.RoleAssignTerritory && this.RoleAssignSystemRole)
            if (this.selectAll) {
                this.userService.assignRoleByFilter(
                    this.getEmployeesFilterViewModel([], 0),
                    selectedRows,
                    this.RoleAssignTerritory,
                    this.RoleAssignSystemRole,
                    this.RoleAssignBusinessUnit)
                    .then(x => this.AssignmentResult(x))
            }
            else
                this.userService.assignRoleByIds(
                    selectedRows,
                    this.RoleAssignTerritory,
                    this.RoleAssignSystemRole,
                    this.RoleAssignBusinessUnit)
                    .then(x => this.AssignmentResult(x));
        else {
            this.errorBody = [];
            if (selectedRows.length == 0)
                this.addError("Users are not selected");
            if (!this.RoleAssignTerritory)
                this.addError("Territory is not selected");
            if (!this.RoleAssignSystemRole)
                this.addError("Role is not selected")
        }

    }

    private RemoveAssignmentResult(x: Result): void {
        if (x.Code == ResultCode.Success)
            this.showMessage("Roles have beed successfully removed");
        else {
            this.closeMessageModal();
            this.addError(x.ErrorMessage);
        }
    }

    public RemoveRole(): any {
        this.showMessage("Removing roles... ");
        let selectedRows = this.selectionExceptions;
        if ((this.selectAll || selectedRows.length > 0) && this.RoleAssignTerritory && this.RoleAssignSystemRole)
            if (this.selectAll) {
                this.userService.removeRoleByFilter(
                    this.getEmployeesFilterViewModel([], 0),
                    selectedRows,
                    this.RoleAssignTerritory,
                    this.RoleAssignSystemRole,
                    this.RoleAssignBusinessUnit)
                    .then(x => this.RemoveAssignmentResult(x))
            }
            else
                this.userService.removeRoleByIds(
                    selectedRows,
                    this.RoleAssignTerritory,
                    this.RoleAssignSystemRole,
                    this.RoleAssignBusinessUnit)
                    .then(x => this.RemoveAssignmentResult(x));
        else {
            this.errorBody = [];
            if (!this.selectAll && selectedRows.length == 0)
                this.addError("Users are not selected");
            if (!this.RoleAssignTerritory)
                this.addError("Territory is not selected");
            if (!this.RoleAssignSystemRole)
                this.addError("Role is not selected")
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
}