import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {NgStyle, CurrencyPipe, NgSwitch, NgSwitchCase, NgIf} from '@angular/common';
import {UsersService} from "../../../../../core/services/users.service";
import {ToastrService} from "ngx-toastr";
import {PharmaciesService} from "../../../../../core/services/pharmacies.service";
import {MediasService} from "../../../../../core/services/medias.service";
import {PartnersService} from "../../../../../core/services/partners.service";
import {SeoService} from "../../../../../core/services/seo.service";
import {PackagesService} from "../../../../../core/services/packages.service";
import {ProvidersService} from "../../../../../core/services/providers.service";
import {TrainersService} from "../../../../../core/services/trainers.service";
import {LessonsService} from "../../../../../core/services/lessons.service";
import {QuizService} from "../../../../../core/services/quiz.service";
import {QuestionsService} from "../../../../../core/services/questions.service";
import {CoursesService} from "../../../../../core/services/courses.service";
import {LoaderComponent} from "../../../../../shared/components/loader/loader.component";
import {SubscriptionsService} from "../../../../../core/services/subscription.service";
import {TrendsService} from "../../../../../core/services/trends.service";
import {CapsulesService} from "../../../../../core/services/capsules.service";
import {AdvertisementsService} from "../../../../../core/services/advertisements.service";

@Component({
    selector: '[confirm-dialog]',
    templateUrl: './confirm-dialog.component.html',
    standalone: true,
  imports: [NgStyle, CurrencyPipe, NgSwitch, NgSwitchCase, LoaderComponent, NgIf],
})
export class ConfirmDialogComponent implements OnInit {
  @Output() closeActions = new EventEmitter<any>();

  @Input() itemId!: string
  @Input() type!: string
  @Input() status!: number
  @Input() newStatus!: boolean
  @Input() filesIds!: Array<string>

  isLoading = false;

  constructor(private capsulesService: CapsulesService,private advertisementsService: AdvertisementsService, private trendsService: TrendsService,private subscriptionsService : SubscriptionsService, private seosService: SeoService,private coursesService: CoursesService,private packagesService: PackagesService,private questionsService: QuestionsService,private lessonsService: LessonsService,private quizService: QuizService,private providersService: ProvidersService, private trainersService: TrainersService,private usersService: UsersService, private partnersService: PartnersService, private pharmaciesService: PharmaciesService,private mediasService: MediasService, private toastr: ToastrService) {}

  ngOnInit(): void {}

  onChangeStatus() {
    this.isLoading = true;
    switch(this.type) {
      case "user": {
        let value = (this.newStatus) ? 1 : 3;
        this.usersService.updateUser(this.itemId, { status: value }).subscribe({
          next: (res) => {
            if (res.status) {
              this.closeActions.emit('done');
              this.toastr.success('Utilisateur modifié avec succès', 'Enregistré', { timeOut: 1500 });
              this.isLoading = true
            } else {
              this.closeActions.emit('cancel');
              this.isLoading = false;
              this.toastr.warning('Vérifier vos données', 'Vérification', {
                timeOut: 1500
              })
            }
          }, error: error => {
            this.closeActions.emit('cancel');
            this.isLoading = false;
            this.toastr.error('Erreur interne du serveur', 'Erreur', {
              timeOut: 1500
            })
          }
        })
        break;
      }
      case "course": {
        let value = (this.newStatus) ? 1 : 2
        this.coursesService.updateCourse(this.itemId, { status: value }).subscribe({
          next: (res) => {
            if (res.status) {
              this.closeActions.emit('done');
              this.toastr.success('Formation  modifié avec succès', 'Enregistré', { timeOut: 1500 });
              this.isLoading = true
            } else {
              this.closeActions.emit('cancel');
              this.isLoading = false;
              this.toastr.warning('Vérifier vos données', 'Vérification', {
                timeOut: 1500
              })
            }
          }, error: error => {
            this.closeActions.emit('cancel');
            this.isLoading = false;
            this.toastr.error('Erreur interne du serveur', 'Erreur', {
              timeOut: 1500
            })
          }
        })
        break;
      }
      case "seo": {
        let value = (this.newStatus) ? "0" : "1";
        this.seosService.updateSeo(this.itemId, { status: value }).subscribe({
          next: (res) => {
            if (res.status) {
              this.closeActions.emit('done');
              this.toastr.success('Référencement modifié avec succès', 'Enregistré', { timeOut: 1500 });
              this.isLoading = true
            } else {
              this.closeActions.emit('cancel');
              this.isLoading = false;
              this.toastr.warning('Vérifier vos données', 'Vérification', {
                timeOut: 1500
              })
            }
          }, error: error => {
            this.closeActions.emit('cancel');
            this.isLoading = false;
            this.toastr.error('Erreur interne du serveur', 'Erreur', {
              timeOut: 1500
            })
          }
        })
        break;
      }
      case "package": {
        let value = (this.newStatus) ? "1" : "0";
        this.packagesService.updatePackage(this.itemId, { status: value }).subscribe({
          next: (res) => {
            if (res.status) {
              this.closeActions.emit('done');
              this.toastr.success('Abonnement modifié avec succès', 'Enregistré', { timeOut: 1500 });
              this.isLoading = true
            } else {
              this.closeActions.emit('cancel');
              this.isLoading = false;
              this.toastr.warning('Vérifier vos données', 'Vérification', {
                timeOut: 1500
              })
            }
          }, error: error => {
            this.closeActions.emit('cancel');
            this.isLoading = false;
            this.toastr.error('Erreur interne du serveur', 'Erreur', {
              timeOut: 1500
            })
          }
        })
        break;
      }
      case "advertisement": {
        let value = (this.newStatus) ? "1" : "0";
        this.advertisementsService.updateAdvertisementStatus(this.itemId, { status: value }).subscribe({
          next: (res) => {
            if (res.status) {
              this.closeActions.emit('done');
              this.toastr.success('Publicité modifié avec succès', 'Enregistré', { timeOut: 1500 });
              this.isLoading = true
            } else {
              this.closeActions.emit('cancel');
              this.isLoading = false;
              this.toastr.warning('Vérifier vos données', 'Vérification', {
                timeOut: 1500
              })
            }
          }, error: error => {
            this.closeActions.emit('cancel');
            this.isLoading = false;
            this.toastr.error('Erreur interne du serveur', 'Erreur', {
              timeOut: 1500
            })
          }
        })
        break;
      }
      case "pharmacy": {
        let value = (this.newStatus) ? 1 : 2;
        this.pharmaciesService.updatePharmacy(this.itemId, { status: value }).subscribe({
          next: (res) => {
            if (res.status) {
              this.closeActions.emit('done');
              this.toastr.success('Pharmacie modifié avec succès', 'Enregistré', { timeOut: 1500 });
              this.isLoading = true
            } else {
              this.closeActions.emit('cancel');
              this.isLoading = false;
              this.toastr.warning('Vérifier vos données', 'Vérification', {
                timeOut: 1500
              })
            }
          }, error: error => {
            this.closeActions.emit('cancel');
            this.isLoading = false;
            this.toastr.error('Erreur interne du serveur', 'Erreur', {
              timeOut: 1500
            })
          }
        })
        break;
      }
      case "userPharmacy": {
        let value = (this.newStatus) ? 0 : 1;
        this.pharmaciesService.updateKey(this.itemId, value).subscribe({
          next: (res) => {
            if (res.status) {
              this.closeActions.emit('done');
              this.toastr.success('Clé modifié avec succès', 'Enregistré', { timeOut: 1500 });
              this.isLoading = true
            } else {
              this.closeActions.emit('cancel');
              this.isLoading = false;
              this.toastr.warning('Vérifier vos données', 'Vérification', {
                timeOut: 1500
              })
            }
          }, error: error => {
            this.closeActions.emit('cancel');
            this.isLoading = false;
            this.toastr.error('Erreur interne du serveur', 'Erreur', {
              timeOut: 1500
            })
          }
        })
        break;
      }
      case "removeImages": {
        this.mediasService.removeImages(this.filesIds).subscribe({
          next: (res) => {
            if (res.status) {
              this.toastr.success('Images supprimées avec succès', 'Enregistré', { timeOut: 1500 });
              this.closeActions.emit('done');
              this.isLoading = true
            } else {
              this.closeActions.emit('cancel');
              this.isLoading = false;
              this.toastr.warning('Vérifier vos données', 'Vérification', {
                timeOut: 1500
              })
            }
          }, error: error => {
            this.closeActions.emit('cancel');
            this.isLoading = false;
            this.toastr.error('Erreur interne du serveur', 'Erreur', {
              timeOut: 1500
            })
          }
        })
        break;
      }
      case "partner": {
        let value = (this.newStatus) ? "1" : "0";
        const data = {
          status: value,
        }
        this.partnersService.updatePartner(this.itemId, data).subscribe({
          next: (res) => {
            if (res.status) {
              this.closeActions.emit('done');
              this.toastr.success('Partenaire modifié avec succès', 'Enregistré', { timeOut: 1500 });
              this.isLoading = true
            } else {
              this.closeActions.emit('cancel');
              this.isLoading = false;
              this.toastr.warning('Vérifier vos données', 'Vérification', {
                timeOut: 1500
              })
            }
          }, error: error => {
            this.closeActions.emit('cancel');
            this.isLoading = false;
            this.toastr.error('Erreur interne du serveur', 'Erreur', {
              timeOut: 1500
            })
          }
        })
        break;
      }
      case "provider": {
        let value = (this.newStatus) ? "1" : "0";
        const data = {
          status: value,
        }
        this.providersService.updateProvider(this.itemId, data).subscribe({
          next: (res) => {
            if (res.status) {
              this.closeActions.emit('done');
              this.toastr.success('Fournisseur modifié avec succès', 'Enregistré', { timeOut: 1500 });
              this.isLoading = true
            } else {
              this.closeActions.emit('cancel');
              this.isLoading = false;
              this.toastr.warning('Vérifier vos données', 'Vérification', {
                timeOut: 1500
              })
            }
          }, error: error => {
            this.closeActions.emit('cancel');
            this.isLoading = false;
            this.toastr.error('Erreur interne du serveur', 'Erreur', {
              timeOut: 1500
            })
          }
        })
        break;
      }
      case "trainer": {
        let value = (this.newStatus) ? "1" : "0";
        const data = {
          status: value,
        }
        this.trainersService.updateTrainer(this.itemId, data).subscribe({
          next: (res) => {
            if (res.status) {
              this.closeActions.emit('done');
              this.toastr.success('Formateur modifié avec succès', 'Enregistré', { timeOut: 1500 });
              this.isLoading = true
            } else {
              this.closeActions.emit('cancel');
              this.isLoading = false;
              this.toastr.warning('Vérifier vos données', 'Vérification', {
                timeOut: 1500
              })
            }
          }, error: error => {
            this.closeActions.emit('cancel');
            this.isLoading = false;
            this.toastr.error('Erreur interne du serveur', 'Erreur', {
              timeOut: 1500
            })
          }
        })
        break;
      }
      case "capsule": {
        let value = (this.newStatus) ? "1" : "0";
        const data = {
          status: value,
        }
        this.capsulesService.updateCapsule(this.itemId, data).subscribe({
          next: (res) => {
            if (res.status) {
              this.closeActions.emit('done');
              this.toastr.success('Capsule modifié avec succès', 'Enregistré', { timeOut: 1500 });
              this.isLoading = true
            } else {
              this.closeActions.emit('cancel');
              this.isLoading = false;
              this.toastr.warning('Vérifier vos données', 'Vérification', {
                timeOut: 1500
              })
            }
          }, error: error => {
            this.closeActions.emit('cancel');
            this.isLoading = false;
            this.toastr.error('Erreur interne du serveur', 'Erreur', {
              timeOut: 1500
            })
          }
        })
        break;
      }
      case "trend": {
        let value = (this.newStatus) ? "1" : "0";
        const data = {
          status: value,
        }
        this.trendsService.updateTrend(this.itemId, data).subscribe({
          next: (res) => {
            if (res.status) {
              this.closeActions.emit('done');
              this.toastr.success('Tendance modifié avec succès', 'Enregistré', { timeOut: 1500 });
              this.isLoading = true
            } else {
              this.closeActions.emit('cancel');
              this.isLoading = false;
              this.toastr.warning('Vérifier vos données', 'Vérification', {
                timeOut: 1500
              })
            }
          }, error: error => {
            this.closeActions.emit('cancel');
            this.isLoading = false;
            this.toastr.error('Erreur interne du serveur', 'Erreur', {
              timeOut: 1500
            })
          }
        })
        break;
      }
      case "lesson": {
        let value = (this.newStatus) ? "1" : "0";
        const data = {
          status: value,
        }
        this.lessonsService.updateLesson(this.itemId, data).subscribe({
          next: (res) => {
            if (res.status) {
              this.closeActions.emit('done');
              this.toastr.success('Leçon modifié avec succès', 'Enregistré', { timeOut: 1500 });
              this.isLoading = true
            } else {
              this.closeActions.emit('cancel');
              this.isLoading = false;
              this.toastr.warning('Vérifier vos données', 'Vérification', {
                timeOut: 1500
              })
            }
          }, error: error => {
            this.closeActions.emit('cancel');
            this.isLoading = false;
            this.toastr.error('Erreur interne du serveur', 'Erreur', {
              timeOut: 1500
            })
          }
        })
        break;
      }
      case "quiz": {
        let value = (this.newStatus) ? "1" : "0";
        const data = {
          status: value,
        }
        this.quizService.updateQuiz(this.itemId, data).subscribe({
          next: (res) => {
            if (res.status) {
              this.closeActions.emit('done');
              this.toastr.success('Quiz modifié avec succès', 'Enregistré', { timeOut: 1500 });
              this.isLoading = true
            } else {
              this.closeActions.emit('cancel');
              this.isLoading = false;
              this.toastr.warning('Vérifier vos données', 'Vérification', {
                timeOut: 1500
              })
            }
          }, error: error => {
            this.closeActions.emit('cancel');
            this.isLoading = false;
            this.toastr.error('Erreur interne du serveur', 'Erreur', {
              timeOut: 1500
            })
          }
        })
        break;
      }
      case "question": {
        let value = (this.newStatus) ? "1" : "0";
        const data = {
          status: value,
        }
        this.questionsService.updateQuestion(this.itemId, data).subscribe({
          next: (res) => {
            if (res.status) {
              this.closeActions.emit('done');
              this.toastr.success('Question modifié avec succès', 'Enregistré', { timeOut: 1500 });
              this.isLoading = true
            } else {
              this.closeActions.emit('cancel');
              this.isLoading = false;
              this.toastr.warning('Vérifier vos données', 'Vérification', {
                timeOut: 1500
              })
            }
          }, error: error => {
            this.closeActions.emit('cancel');
            this.isLoading = false;
            this.toastr.error('Erreur interne du serveur', 'Erreur', {
              timeOut: 1500
            })
          }
        })
        break;
      }
      case "subscription": {
        let value = (this.newStatus) ? "1" : "0";
        const data = {
          status: value,
        }
        this.subscriptionsService.updateSubscription(this.itemId, data, null).subscribe({
          next: (res) => {
            if (res.status) {
              this.closeActions.emit('done');
              this.toastr.success('Abonnement modifié avec succès', 'Enregistré', { timeOut: 1500 });
              this.isLoading = true
            } else {
              this.closeActions.emit('cancel');
              this.isLoading = false;
              this.toastr.warning('Vérifier vos données', 'Vérification', {
                timeOut: 1500
              })
            }
          }, error: error => {
            this.closeActions.emit('cancel');
            this.isLoading = false;
            this.toastr.error('Erreur interne du serveur', 'Erreur', {
              timeOut: 1500
            })
          }
        })
        break;
      }
      default: {
        this.closeActions.emit('confirm');
        break;
      }
    }


  }
  onCloseActions() {
    this.closeActions.emit('cancel');
  }
}
