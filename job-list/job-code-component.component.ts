import { Component, OnInit } from "@angular/core";

import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid/main'

import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

import { JobService } from "../../services/job.service";

import { JobUnallocatedComponent } from "../shared/job-unallocated/job-unallocated.component";

import { JobViewModel, ResultT } from "../../../view-models/view-models";

@Component({
    selector: 'job-code-component',
    template: `
        <span *ngIf="value" class="col-sm-1">{{value}}</span>
        <a *ngIf="!value&&job.Permission.Edit" class="col-sm-1" href="javascript:void(0)" (click)="open()">Select Job Code</a>
        `
})


export class JobCodeComponent implements ICellRendererAngularComp {
    private job: JobViewModel;
    private value: string;
    private params: ICellRendererParams;

    constructor(private toastr: ToastsManager, private modalService: NgbModal, private jobService: JobService) { }

    agInit(params: ICellRendererParams): void {
        this.params = params;
        this.value = params.value;
        this.job = params.data;
    }

    open() {
        let modalRef = this.modalService.open(JobUnallocatedComponent);
        modalRef.componentInstance.financialYearId = this.params.data.FinancialYearId;
        modalRef.result
            .then(job => {
                (job as JobViewModel).JobId = this.job.JobId;
                return this.jobService.save(job, true)
                    .then(response => {
                        this.toastr.success(`Job allocation completed`);
                        this.params.context.filter();
                    })
                    .catch(response => {
                        this.params.context.messageBoxService.PopupErrorMessage('Error allocating job', response.json());
                    });
            })
            .catch(reason => console.log(reason));
    }
}