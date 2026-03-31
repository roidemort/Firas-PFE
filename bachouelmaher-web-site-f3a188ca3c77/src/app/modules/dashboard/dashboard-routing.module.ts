import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import {UsersComponent} from "./pages/users/users.component";
import {MainComponent} from "./pages/main/main.component";
import {PharmaciesComponent} from "./pages/pharmacies/pharmacies.component";
import {SettingsComponent} from "./pages/settings/settings.component";
import {ProfileComponent} from "./pages/profile/profile.component";
import {DetailsPharmacyComponent} from "./pages/details/details-pharmacy/details-pharmacy.component";
import {DetailsUserComponent} from "./pages/details/details-user/details-user.component";
import {MediaComponent} from "./pages/media/media.component";
import {PartnersComponent} from "./pages/partners/partners.component";
import {ManageUserComponent} from "./pages/manage/manage-user/manage-user.component";
import {ManagePharmacyComponent} from "./pages/manage/manage-pharmacy/manage-pharmacy.component";
import {ManagePartnerComponent} from "./pages/manage/manage-partner/manage-partner.component";
import {SeoComponent} from "./pages/seo/seo.component";
import {ManageSeoComponent} from "./pages/manage/manage-seo/manage-seo.component";
import {PackagesComponent} from "./pages/packages/packages.component";
import {ManagePackageComponent} from "./pages/manage/manage-package/manage-package.component";
import {ManageCategoryComponent} from "./pages/manage/manage-category/manage-category.component";
import {CategoriesComponent} from "./pages/categories/categories.component";
import {ManageProviderComponent} from "./pages/manage/manage-provider/manage-provider.component";
import {ProvidersComponent} from "./pages/providers/providers.component";
import {CoursesComponent} from "./pages/courses/courses.component";
import {ManageTrainerComponent} from "./pages/manage/manage-trainer/manage-trainer.component";
import {TrainersComponent} from "./pages/trainers/trainers.component";
import {ManageCourseComponent} from "./pages/manage/manage-course/manage-course.component";
import {ManageLessonComponent} from "./pages/manage/manage-lesson/manage-lesson.component";
import {LessonsComponent} from "./pages/lessons/lessons.component";
import {ManageCertificateComponent} from "./pages/manage/manage-certificate/manage-certificate.component";
import {CertificatesComponent} from "./pages/certificates/certificates.component";
import {QuestionsComponent} from "./pages/questions/questions.component";
import {ManageQuestionComponent} from "./pages/manage/manage-question/manage-question.component";
import {QuizComponent} from "./pages/quiz/quiz.component";
import {ManageQuizComponent} from "./pages/manage/manage-quiz/manage-quiz.component";
import {DetailsQuizComponent} from "./pages/details/details-quiz/details-quiz.component";
import {ManageSectionComponent} from "./pages/manage/manage-section/manage-section.component";
import {ListComponent} from "./pages/capsules/list/list.component";
import {CategoriesCapsuleComponent} from "./pages/capsules/categories/categories.component";
import {ManageCapsuleComponent} from "./pages/manage/capsule/manage-capsule/manage-capsule.component";
import {ManageCategoryCapsuleComponent} from "./pages/manage/capsule/manage-category/manage-category.component";
import {SubscriptionsComponent} from "./pages/subscriptions/subscriptions.component";
import {ManageSubscriptionComponent} from "./pages/manage/manage-subscription/manage-subscription.component";
import {DetailsSubscriptionComponent} from "./pages/details/details-subscription/details-subscription.component";
import {DetailsCourseComponent} from "./pages/details/details-course/details-course.component";
import {TrendsComponent} from "./pages/trends/trends.component";
import {ManageTrendComponent} from "./pages/manage/manage-trend/manage-trend.component";
import {ManageAdvertisementComponent} from "./pages/manage/manage-advertisement/manage-advertisement.component";
import {AdvertisementsComponent} from "./pages/advertisements/advertisements.component";
import {LabosComponent} from "./pages/labos/labos.component";
import {ManageLaboComponent} from "./pages/manage/manage-labo/manage-labo.component";
import { LaboSuggestionsComponent } from './pages/labo-suggestions/labo-suggestions.component';
import { ChatModerationComponent } from './pages/chat-moderation/chat-moderation.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      { path: '', redirectTo: 'main', pathMatch: 'full' },
      { path: 'main', component: MainComponent },
      { path: 'users', component: UsersComponent },
      { path: 'pharmacies', component: PharmaciesComponent },
      { path: 'trends', component: TrendsComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'media', component: MediaComponent },
      { path: 'partners', component: PartnersComponent },
      { path: 'advertisements', component: AdvertisementsComponent },
      { path: 'labos', component: LabosComponent },
      { path: 'labo-suggestions', component: LaboSuggestionsComponent },
      { path: 'chat-moderation', component: ChatModerationComponent },
      { path: 'manage-labo', component: ManageLaboComponent },
      { path: 'categories', component: CategoriesComponent },
      { path: 'courses/list', component: CoursesComponent },
      { path: 'trainers', component: TrainersComponent },
      { path: 'seo', component: SeoComponent },
      { path: 'providers', component: ProvidersComponent },
      { path: 'details-pharmacy/:id', component: DetailsPharmacyComponent },
      { path: 'details-subscription/:id', component: DetailsSubscriptionComponent },
      { path: 'details-user/:id', component: DetailsUserComponent },
      { path: 'courses/quiz/details-quiz/:id', component: DetailsQuizComponent },
      { path: 'manage-trend', component: ManageTrendComponent },
      { path: 'manage-pharmacy', component: ManagePharmacyComponent },
      { path: 'manage-user', component: ManageUserComponent },
      { path: 'manage-partner', component: ManagePartnerComponent },
      { path: 'manage-advertisement', component: ManageAdvertisementComponent },
      { path: 'manage-seo', component: ManageSeoComponent },
      { path: 'manage-category', component: ManageCategoryComponent },
      { path: 'manage-provider', component: ManageProviderComponent },
      { path: 'manage-trainer', component: ManageTrainerComponent },
      { path: 'courses/manage-course', component: ManageCourseComponent },
      { path: 'courses/manage-lesson', component: ManageLessonComponent },
      { path: 'courses/manage-section', component: ManageSectionComponent },
      { path: 'courses/lessons', component: LessonsComponent },
      { path: 'courses/manage-certificate', component: ManageCertificateComponent },
      { path: 'courses/certificates', component: CertificatesComponent },
      { path: 'courses/questions/manage-question', component: ManageQuestionComponent },
      { path: 'courses/questions', component: QuestionsComponent },
      { path: 'courses/manage-quiz', component: ManageQuizComponent },
      { path: 'courses/quiz', component: QuizComponent },
      { path: 'courses/details-course/:id', component: DetailsCourseComponent },
      { path: 'capsules/list', component: ListComponent },
      { path: 'capsules/categories', component: CategoriesCapsuleComponent },
      { path: 'capsules/manage-capsule', component: ManageCapsuleComponent },
      { path: 'capsules/manage-categories', component: ManageCategoryCapsuleComponent },
      { path: 'subscriptions/list', component: SubscriptionsComponent },
      { path: 'subscriptions/packages', component: PackagesComponent },
      { path: 'subscriptions/manage-package', component: ManagePackageComponent },
      { path: 'subscriptions/manage-subscription', component: ManageSubscriptionComponent },
      { path: '**', redirectTo: 'errors/404' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
