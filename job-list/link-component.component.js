"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
// src/app/red-component/red-component.component.ts
var core_1 = require("@angular/core");
var LinkComponent = (function () {
    function LinkComponent() {
    }
    LinkComponent.prototype.agInit = function (params) {
        this.params = params;
    };
    return LinkComponent;
}());
LinkComponent = __decorate([
    core_1.Component({
        selector: 'link-component',
        template: require('./link-component.component.html')
    })
], LinkComponent);
exports.LinkComponent = LinkComponent;
//# sourceMappingURL=link-component.component.js.map