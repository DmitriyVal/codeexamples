// src/app/red-component/red-component.component.ts
import { Component } from "@angular/core";

@Component({
    selector: 'link-component',
    template: require('./employees-list.link-component.component.html')
})
export class EmployeesListLinkComponent {
    private params: any;

    agInit(params: any): void {
        this.params = params;
    }
}