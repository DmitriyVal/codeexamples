// src/app/red-component/red-component.component.ts
import { Component } from "@angular/core";

@Component({
    selector: 'link-component',
    template: require('./link-component.component.html')
})
export class LinkComponent {
    private params: any;

    agInit(params: any): void {
        this.params = params;
    }
}