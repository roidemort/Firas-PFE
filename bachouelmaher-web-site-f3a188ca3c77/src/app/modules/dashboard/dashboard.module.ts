import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { UsersComponent } from './pages/users/users.component';
import { MainComponent } from './pages/main/main.component';
import { PharmaciesComponent } from './pages/pharmacies/pharmacies.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { DetailsPharmacyComponent } from './pages/details/details-pharmacy/details-pharmacy.component';
import { DetailsUserComponent } from './pages/details/details-user/details-user.component';
import { MediaComponent } from './pages/media/media.component';
import { PartnersComponent } from './pages/partners/partners.component';
import { ManageUserComponent } from './pages/manage/manage-user/manage-user.component';
import { ManagePharmacyComponent } from './pages/manage/manage-pharmacy/manage-pharmacy.component';
import { ManagePartnerComponent } from './pages/manage/manage-partner/manage-partner.component';
import { SeoComponent } from './pages/seo/seo.component';
import { ManageSeoComponent } from './pages/manage/manage-seo/manage-seo.component';
import { PackagesComponent } from './pages/packages/packages.component';
import { ManagePackageComponent } from './pages/manage/manage-package/manage-package.component';
import { ManageCategoryComponent } from './pages/manage/manage-category/manage-category.component';
import { CategoriesComponent } from './pages/categories/categories.component';
import { ManageProviderComponent } from './pages/manage/manage-provider/manage-provider.component';
import { ProvidersComponent } from './pages/providers/providers.component';
import { CoursesComponent } from './pages/courses/courses.component';
import { ManageTrainerComponent } from './pages/manage/manage-trainer/manage-trainer.component';
import { TrainersComponent } from './pages/trainers/trainers.component';
import { ManageCourseComponent } from './pages/manage/manage-course/manage-course.component';
import { ManageLessonComponent } from './pages/manage/manage-lesson/manage-lesson.component';
import { LessonsComponent } from './pages/lessons/lessons.component';
import { ManageCertificateComponent } from './pages/manage/manage-certificate/manage-certificate.component';
import { CertificatesComponent } from './pages/certificates/certificates.component';
import { QuestionsComponent } from './pages/questions/questions.component';
import { ManageQuestionComponent } from './pages/manage/manage-question/manage-question.component';
import { QuizComponent } from './pages/quiz/quiz.component';
import { ManageQuizComponent } from './pages/manage/manage-quiz/manage-quiz.component';
import { DetailsQuizComponent } from './pages/details/details-quiz/details-quiz.component';
import { ManageSectionComponent } from './pages/manage/manage-section/manage-section.component';
import { ListComponent } from './pages/capsules/list/list.component';
import { CategoriesCapsuleComponent } from './pages/capsules/categories/categories.component';
import { ManageCapsuleComponent } from './pages/manage/capsule/manage-capsule/manage-capsule.component';
import { ManageCategoryCapsuleComponent } from './pages/manage/capsule/manage-category/manage-category.component';
import { SubscriptionsComponent } from './pages/subscriptions/subscriptions.component';
import { ManageSubscriptionComponent } from './pages/manage/manage-subscription/manage-subscription.component';
import { DetailsSubscriptionComponent } from './pages/details/details-subscription/details-subscription.component';
import { DetailsCourseComponent } from './pages/details/details-course/details-course.component';
import { TrendsComponent } from './pages/trends/trends.component';
import { ManageTrendComponent } from './pages/manage/manage-trend/manage-trend.component';
import { ManageAdvertisementComponent } from './pages/manage/manage-advertisement/manage-advertisement.component';
import { AdvertisementsComponent } from './pages/advertisements/advertisements.component';
import { RegistrationRequestsComponent } from './pages/registration-requests/registration-requests.component';
import { TitulaireDashboardComponent } from './pages/titulaire-dashboard/titulaire-dashboard.component';
import { TitulaireService } from '../../services/titulaire/titulaire.service';

@NgModule({
  declarations: [
    TitulaireDashboardComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    DashboardComponent,
    UsersComponent,
    MainComponent,
    PharmaciesComponent,
    SettingsComponent,
    ProfileComponent,
    DetailsPharmacyComponent,
    DetailsUserComponent,
    MediaComponent,
    PartnersComponent,
    ManageUserComponent,
    ManagePharmacyComponent,
    ManagePartnerComponent,
    SeoComponent,
    ManageSeoComponent,
    PackagesComponent,
    ManagePackageComponent,
    ManageCategoryComponent,
    CategoriesComponent,
    ManageProviderComponent,
    ProvidersComponent,
    CoursesComponent,
    ManageTrainerComponent,
    TrainersComponent,
    ManageCourseComponent,
    ManageLessonComponent,
    LessonsComponent,
    ManageCertificateComponent,
    CertificatesComponent,
    QuestionsComponent,
    ManageQuestionComponent,
    QuizComponent,
    ManageQuizComponent,
    DetailsQuizComponent,
    ManageSectionComponent,
    ListComponent,
    CategoriesCapsuleComponent,
    ManageCapsuleComponent,
    ManageCategoryCapsuleComponent,
    SubscriptionsComponent,
    ManageSubscriptionComponent,
    DetailsSubscriptionComponent,
    DetailsCourseComponent,
    TrendsComponent,
    ManageTrendComponent,
    ManageAdvertisementComponent,
    AdvertisementsComponent,
    RegistrationRequestsComponent
  ]
})
export class DashboardModule {
}
