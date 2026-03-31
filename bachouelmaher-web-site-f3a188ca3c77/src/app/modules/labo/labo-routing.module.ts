import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LaboSignInComponent } from './pages/sign-in/sign-in.component';
import { LaboProductsComponent } from './pages/products/products.component';
import { LaboOrdersComponent } from './pages/orders/orders.component';
import { ManageProductComponent } from './pages/manage-product/manage-product.component';
import { LaboCoursesComponent } from './pages/courses/courses.component';
import { LaboCourseDetailsComponent } from './pages/course-details/course-details.component';
import { LaboSuggestionsComponent } from './pages/suggestions/suggestions.component';
import { LaboChatComponent } from './pages/chat/chat.component';
import { checkLaboRole } from '../../core/guards/labo-role-guard';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LaboSignInComponent },
  { path: 'dashboard/courses', component: LaboCoursesComponent, canActivate: [checkLaboRole] },
  { path: 'dashboard/courses/:id', component: LaboCourseDetailsComponent, canActivate: [checkLaboRole] },
  { path: 'dashboard/suggestions', component: LaboSuggestionsComponent, canActivate: [checkLaboRole] },
  { path: 'dashboard/chat', component: LaboChatComponent, canActivate: [checkLaboRole] },
  { path: 'dashboard/products', component: LaboProductsComponent, canActivate: [checkLaboRole] },
  { path: 'dashboard/manage-product', component: ManageProductComponent, canActivate: [checkLaboRole] },
  { path: 'dashboard/orders', component: LaboOrdersComponent, canActivate: [checkLaboRole] },
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LaboRoutingModule {}
