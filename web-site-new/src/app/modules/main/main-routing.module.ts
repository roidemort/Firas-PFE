import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './main.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { SignInComponent } from './pages/sign-in/sign-in.component';
import { ForgetPasswordComponent } from './pages/forget-password/forget-password.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { checkAuthGuard } from 'src/app/core/guards/auth-guard';
import { PersonalInformationComponent } from './components/personal-information/personal-information.component';
import { MyTeamComponent } from './components/my-team/my-team.component';
import { LearningJourneyComponent } from './components/learning-journey/learning-journey.component';
import { PrivacySecurityComponent } from './components/privacy-security/privacy-security.component';
import { SubscriptionManagementComponent } from './components/subscription-management/subscription-management.component';
import { HelpComponent } from './components/help/help.component';
import { OurPlatformComponent } from './pages/our-platform/our-platform.component';
import { CoursesComponent } from './components/courses/courses.component';
import { ReviewsComponent } from './components/reviews/reviews.component';
import { CourseDetailsComponent } from './components/course-details/course-details.component';
import { CourseComponent } from './pages/course/course.component';




const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
      },
      {
        path: 'a-propos',
        loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent),
      },
      {
        path: 'contactez-nous',
        loadComponent: () => import('./pages/contact-us/contact-us.component').then(m => m.ContactUsComponent),
      },
      {
        path: 'abonnement',
        loadComponent: () => import('./pages/subscription/subscription.component').then(m => m.SubscriptionComponent),
      },
      {
        path: 'conditions-generales-de-vente-et-d-utilisation',
        loadComponent: () => import('./pages/cgv/cgv.component').then(m => m.CgvComponent),
      },
      {
        path: 'politique-de-confidentialite',
        loadComponent: () => import('./pages/cgu/cgu.component').then(m => m.CguComponent),
      },
    ],
  },
  { 
    path: 'profil', component: ProfileComponent,  canActivate: [checkAuthGuard], 
    children: [
       {
        path: 'details',
        component: PersonalInformationComponent
      },
      {
        path: 'mon-equipe',
        component: MyTeamComponent
      },
      {
        path: 'parcours-apprentissage/:id',
        component: LearningJourneyComponent
      },
      {
        path: 'confidentialite-securite',
        component: PrivacySecurityComponent
      },
      {
        path: 'gestion-abonnements',
        component: SubscriptionManagementComponent
      },
      {
        path: 'aide',
        component: HelpComponent
      },
      { path: '', redirectTo: 'details', pathMatch: 'full' },
  ], 
    data: { roles: ['PHARMACIST_HOLDER', 'PHARMACIST', 'PREPARER', 'STUDENT'] } 
  },
  { path: 'inscription', component: SignUpComponent },
  { path: 'connexion', component: SignInComponent },
  { path: 'mot-de-passe-oublier', component: ForgetPasswordComponent },
  { 
    path: 'notre-plateforme', component: OurPlatformComponent,  canActivate: [checkAuthGuard],
    children: [
      {
        path: 'cours',
        component: CoursesComponent
      },
      { path: 'details-cours/:id', component: CourseDetailsComponent },
      { path: 'cours/avis/:id', component: ReviewsComponent },
      { path: 'cours/apprentissage/:id', component: CourseComponent },
      { path: '', redirectTo: 'cours', pathMatch: 'full' },
  ], data: { roles: ['PHARMACIST_HOLDER', 'PHARMACIST', 'PREPARER', 'STUDENT'] } 
  },

];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MainRoutingModule {}
