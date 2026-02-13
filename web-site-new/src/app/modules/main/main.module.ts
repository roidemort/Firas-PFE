import { NgModule } from '@angular/core';

import {MainRoutingModule} from "./main-routing.module";
import {AngularSvgIconModule} from "angular-svg-icon";

@NgModule({
  imports: [MainRoutingModule, AngularSvgIconModule.forRoot()],
})
export class MainModule {
}
