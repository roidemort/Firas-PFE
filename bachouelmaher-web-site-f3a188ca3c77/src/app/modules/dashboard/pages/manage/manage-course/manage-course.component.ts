import {ChangeDetectorRef, Component, HostListener, OnInit, signal, ViewChild, ViewContainerRef} from '@angular/core';

import {
  NavigationEnd,
  Router,
  RouterOutlet,
  Event,
  ActivatedRoute,
  RouterLink,
  RouterLinkActive
} from '@angular/router';
import {FooterComponent} from "../../../../layout/components/footer/footer.component";
import {NavbarComponent} from "../../../../layout/components/navbar/navbar.component";
import {SidebarComponent} from "../../../../layout/components/sidebar/sidebar.component";
import {DatePipe, NgClass, NgForOf, NgIf, NgSwitch, NgSwitchCase, NgTemplateOutlet} from "@angular/common";
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from "@angular/forms";
import {SidebarSubmenuComponent} from "../../../../layout/components/sidebar/sidebar-submenu/sidebar-submenu.component";
import {SvgIconComponent} from "angular-svg-icon";
import {MenuService} from "../../../../layout/services/menu.service";
import {SubMenuItem} from "../../../../../core/models/menu.model";
import {MatOption} from "@angular/material/core";
import {MatFormField, MatSelect} from "@angular/material/select";
import {toast} from "ngx-sonner";
import {CategoriesService} from "../../../../../core/services/categories.service";
import {Category} from "../../../../../core/models/category.model";
import {
  MatNestedTreeNode,
  MatTree,
  MatTreeNode,
  MatTreeNodeDef,
  MatTreeNodeOutlet, MatTreeNodePadding,
  MatTreeNodeToggle
} from "@angular/material/tree";
import {MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MatCheckbox} from "@angular/material/checkbox";
import {SelectionModel} from "@angular/cdk/collections";
import {MatAutocomplete, MatAutocompleteTrigger} from "@angular/material/autocomplete";
import {MatInput} from "@angular/material/input";
import {Image} from "../../../../../core/models/image.model";
import {MediaDialogComponent} from "../../../components/dialog/media-dialog/media-dialog.component";
import {ProvidersService} from "../../../../../core/services/providers.service";
import {Provider} from "../../../../../core/models/provider.model";
import {Trainer} from "../../../../../core/models/trainer.model";
import {ToastrService} from "ngx-toastr";
import {CoursesService} from "../../../../../core/services/courses.service";
import {lastValueFrom} from "rxjs";
import {Partner} from "../../../../../core/models/partner.model";
import {Course} from "../../../../../core/models/course.entity";
import {Section} from "../../../../../core/models/section.model";
import {MatTooltip} from "@angular/material/tooltip";
import {ConfirmDialogComponent} from "../../../components/dialog/confirm-dialog/confirm-dialog.component";
import {TableActionComponent} from "../../../components/tables/table-courses/table-action/table-action.component";
import {TableFooterComponent} from "../../../components/tables/table-courses/table-footer/table-footer.component";
import {Certificate} from "../../../../../core/models/certificate.model";
import {SortConfig} from "../../../../../core/models/config.model";
import {CertificatesService} from "../../../../../core/services/certificates.service";
import {LoaderComponent} from "../../../../../shared/components/loader/loader.component";
import {RatingsService} from "../../../../../core/services/ratings.service";
import {Rating, Star} from "../../../../../core/models/rating.entity";

@Component({
  selector: 'app-layout',
  templateUrl: './manage-course.component.html',
  styleUrls: ['./manage-course.component.scss'],
  standalone: true,
  imports: [RouterOutlet, FooterComponent, NavbarComponent, SidebarComponent, NgForOf, NgIf, ReactiveFormsModule, RouterLink, RouterLinkActive, SidebarSubmenuComponent, SvgIconComponent, NgClass, NgTemplateOutlet, MatOption, MatSelect, NgSwitch, NgSwitchCase, MatTree, MatTreeNode, MatTreeNodeDef, MatNestedTreeNode, MatTreeNodeToggle, MatIconButton, MatIcon, MatTreeNodeOutlet, MatFormField, MatTreeNodePadding, MatCheckbox, MatAutocomplete, MatInput, MatAutocompleteTrigger, FormsModule, MatTooltip, TableActionComponent, TableFooterComponent, LoaderComponent, DatePipe],
})
export class ManageCourseComponent implements OnInit {
  @ViewChild('actions', { static: true, read: ViewContainerRef })
  actions!: ViewContainerRef;
  private mainContent: HTMLElement | null = null;
  type!: string | null
  courseId!: string | null
  title: string = 'general'
  isLoading = false
  menuCourse = [
    {
      icon: 'assets/icons/heroicons/outline/clipboard-document-list.svg',
      label: 'Général',
      route: 'general',
      active: true,
    },
    {
      icon: 'assets/icons/heroicons/outline/bookmark-square.svg',
      label: 'Tarifs',
      route: 'price',
      active: false,
    },
    {
      icon: 'assets/icons/heroicons/outline/numbered-list.svg',
      label: 'Informations supplémentaires',
      route: 'additional',
      active: false,
    },
    {
      icon: 'assets/icons/heroicons/outline/book-open.svg',
      label: 'Fournisseurs & Équipe',
      route: 'providers',
      active: false,
    },
    {
      icon: 'assets/icons/heroicons/outline/calendar-date-range.svg',
      label: 'Certificats',
      route: 'certificates',
      active: false,
    },
    {
      icon: 'assets/icons/heroicons/outline/paper-clip.svg',
      label: 'Coming Soon',
      route: 'coming',
      active: false,
    },
  ]
  showIconsIndex: number | null = null;
  selectedIcons: string[] = [];

  selectedCertificate!: Certificate;
  submitted = false

  // Liste complète des icônes
  allIcons = ['play', 'academic-cap','document-text' ,'queue-list', 'banknotes', 'bell', 'bookmark', 'building-library', 'building-storefront', 'camera', 'chart-pie', 'check', 'cog', 'cog-6-tooth', 'cube', 'cursor-click', 'dots-horizontal', 'download', 'ellipsis-vertical', 'exclamation-triangle', 'eye', 'eye-off', 'folder', 'gift', 'information-circle', 'lock-closed', 'logout', 'magnifying-glass', 'megaphone', 'menu', 'moon', 'pencil-square', 'plus', 'presentation-chart-line', 'refresh', 'shield-check', 'shield-exclamation', 'sun', 'trash', 'user-circle', 'user-group', 'users', 'view-grid', 'chevron-double-left', 'chevron-double-right', 'chevron-down', 'chevron-left', 'chevron-right', 'arrow-long-right', 'arrow-sm-right', 'arrow-sm-up', 'x', 'x-mark'];
  searchQuery = '';
  displayedIcons = [...this.allIcons];
  pageSize = 20;
  currentPage = 1;
  totalPages = Math.ceil(this.displayedIcons.length / this.pageSize);
  cachedPaginatedIcons: string[][] = [];
  categories: Category[] = [];
  manageCourseForm!: FormGroup;
  languages = [
    {value: 'fr', viewValue: 'Français'},
    {value: 'en', viewValue: 'Anglais'},
    {value: 'es', viewValue: 'Espagnol'},
    {value: 'de', viewValue: 'Allemand'},
    {value: 'it', viewValue: 'Italien'},
    {value: 'ru', viewValue: 'Russe'},
    {value: 'cn', viewValue: 'Chinois'},
    {value: 'jp', viewValue: 'Japonais'},
    {value: 'kr', viewValue: 'Coréen'},
  ]
  levels = [
    {value: 'beginner', viewValue: 'Débutant'},
    {value: 'intermediate', viewValue: 'Intermédiaire'},
    {value: 'advanced', viewValue: 'Avancé'},
  ]
  showPaid = false
  showFree = false;
  showComingSoon = false
  selectedPreview!: Image | undefined
  providers!: Provider[]
  selectedProvider!: Provider | undefined
  course!: Course
  trainers!: Trainer[]
  childrenAccessor = (node: Category) => node.children ?? [];
  hasChild = (_: number, node: Category) => !!node.children && node.children.length > 0;
  /** The selection for checklist */
  checklistSelection = new SelectionModel<string>();
  checklistCategory = new SelectionModel<Category>();


  certificates: Certificate[] = [];
  ratings: Rating[] = [];
  allCertificatesCount : number = 0
  selectedStatusCertificate: string = ""
  searchTextCertificate: string = ""
  itemsPerPageCertificate: number = 10;
  currentPageCertificate: number = 1;
  sortConfig = {} as SortConfig;

  allRatingsCount : number = 0
  averageRating : number | null | undefined
  selectedStatusRating: string = ""
  itemsPerPageRating: number = 10;
  currentPageRating: number = 1;
  sortConfigRatings = {} as SortConfig;

  oneStar!: Star
  twoStar!: Star
  threeStar!: Star
  fourStar!: Star
  fiveStar!: Star


  constructor(private ratingsService: RatingsService, private certificatesService: CertificatesService, private toastr: ToastrService, private cdr: ChangeDetectorRef, private providersService: ProvidersService, private categoriesService: CategoriesService, private coursesService: CoursesService,private router: Router, private route: ActivatedRoute, public menuService: MenuService, private fb : FormBuilder) {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        if (this.mainContent) {
          this.mainContent!.scrollTop = 0;
        }
      }
    });
  }
  compare( a: any, b: any ) {
    if ( a.position! < b.position! ){
      return -1;
    }
    if ( a.position! > b.position! ){
      return 1;
    }
    return 0;
  }

  openFree() {
  this.showFree = !this.showFree;
  // The form control already exists, we just need to update its value
  this.manageCourseForm.patchValue({
    free: this.showFree
  });
}
  async ngOnInit() {
    this.isLoading = true
    await this.getCategories()
    await this.getProviders()
    this.updatePaginatedIcons();
    this.getCertificates()
    this.selectedPreview = undefined
    this.type = this.route.snapshot.queryParamMap.get('type');
    this.courseId = this.route.snapshot.queryParamMap.get('courseId');

    this.manageCourseForm = this.fb.group({
      title: [null, Validators.required],
      details: [null, Validators.required],
      previewVideo: [null, Validators.required],
      points: [null, Validators.required],
      expiration: [null, Validators.required],
      language: [null, Validators.required],
      level: [null, Validators.required],
      hours: [null, Validators.required],
      minutes: [null, Validators.required],
      roles: [null, Validators.required],
      paid: [0, Validators.required],
      free: [false],
      category: [null, Validators.required],
      sections: this.fb.array([], Validators.required),
      requirements: this.fb.array([], Validators.required),
      faqs: this.fb.array([], Validators.required),
      includes: this.fb.array([], Validators.required),
      objectives: this.fb.array([], Validators.required),
      provider: [null, Validators.required],
      team: [null, Validators.required],
      comingSoon: [0, Validators.required],
    });
    if (this.type == 'edit') {
      await this.getAllRatings()
      this.menuCourse.push({
        icon: 'assets/icons/heroicons/outline/chat-bubble-left-right.svg',
        label: 'Avis et notes des clients',
        route: 'rating',
        active: true,
      },)
      const result$ = this.coursesService.getCourseDetails(this.courseId!)
      const result = await lastValueFrom(result$);
      this.course = result.data
      const duration = this.course.duration.split(':')
      this.manageCourseForm.patchValue({
        title: this.course.title,
        details: this.course.details,
        previewVideo: this.course.previewVideo,
        points: this.course.points,
        hours: duration[0],
        minutes: duration[1],
        expiration: this.course.expiration,
        roles: this.course.roles,
        paid: this.course.paid,
        free: this.course.free,
        comingSoon: this.course.comingSoon,
        language: this.course.language,
        level: this.course.level,
        category: this.course.category.id,
        provider: this.course.provider.id,
        team: this.course.trainers.map((trainer: Trainer) => trainer.id),
      });

      this.showFree = this.course.free;
      this.selectedCertificate = this.course.certificate
        this.course.requirements.map(_ => {
        this.addRequirement()
      })
      this.course.faqs.map(_ => {
        this.addFaq()
      })
      this.course.includes.map(_ => {
        this.addInclude()
      })
      this.course.objectives.map(_ => {
        this.addObjective()
      })
      const formatSections = this.course.sections.sort( this.compare ).map((section, index) => {
        this.addSection()
        let quizTitle = ''
        let quizId = ''
        if (typeof section.quiz !== 'string'){
          quizTitle = section.quiz.title
          quizId = section.quiz.id
        }
        const data: Section = {
          id: section.id,
          lessons: [],
          title: section.title,
          details: section.details,
          quiz: quizTitle,
          quizId: quizId,
          createdAt: section.createdAt
        }
        section.lessons?.sort( this.compare ).map(lesson => {
          this.addLesson(index)
          data.lessons.push({ title: lesson.title, id: lesson.id })
        })
        return data
      })

      this.manageCourseForm.patchValue({
        requirements: this.course.requirements,
        faqs: this.course.faqs,
        includes: this.course.includes,
        objectives: this.course.objectives,
        sections: formatSections,
      })
      this.selectedProvider = this.providers.find(provider => { return provider.id == this.course.provider.id })
      this.checklistSelection.setSelection(this.course.category.id)
      this.checklistCategory.setSelection(this.course.category)

      if(this.course.paid) {
        this.showPaid = true
        this.manageCourseForm.addControl('price', new FormControl(this.course.price, Validators.required));
        this.manageCourseForm.addControl('discountPrice', new FormControl(this.course.discountPrice, null));
      }
      if(this.course.comingSoon) {
        this.showComingSoon = true
        this.manageCourseForm.addControl('messageComingSoon', new FormControl(this.course.messageComingSoon, Validators.required));
        this.manageCourseForm.addControl('endTimeComingSoon', new FormControl(this.course.endTimeComingSoon, Validators.required));
      }
      this.selectedPreview = this.course.preview
      this.isLoading = false
    } else {
      this.addRequirement()
      this.addFaq()
      this.addInclude()
      this.addObjective()
      this.showFree = false; 
    }
    this.isLoading = false
  }
  async getCategories() {
    this.categoriesService.getAllCategoriesTree().subscribe({
      next: (result) => {
        this.categories = result.data.categories
      },
      error: (error) => this.handleRequestError(error),
    });
  }

  private handleRequestError(error: any) {
    const msg = 'An error occurred while fetching users';
    this.isLoading = false
    toast.error(msg, {
      position: 'bottom-right',
      description: error.message,
      action: {
        label: 'Undo',
        onClick: () => console.log('Action!'),
      },
      actionButtonStyle: 'background-color:#DC2626; color:white;',
    });
  }
  public toggleMenu(subMenu: SubMenuItem) {
    this.menuService.toggleMenu(subMenu);
  }

  onDisplaySection(section: string) {
    this.title = section
  }

  markAllAsTouched() {
    Object.keys(this.manageCourseForm.controls).forEach((key) => {
      this.manageCourseForm.get(key)?.markAsTouched();
    });
    (<FormArray>this.manageCourseForm.get('sections')).controls.forEach((group: any) => {
      (<any>Object).values(group.controls).forEach((control: FormControl) => {
        control.markAsTouched();
      })
    });
    (<FormArray>this.manageCourseForm.get('requirements')).controls.forEach((group: any) => {
      (<any>Object).values(group.controls).forEach((control: FormControl) => {
        control.markAsTouched();
      })
    });
    (<FormArray>this.manageCourseForm.get('faqs')).controls.forEach((group: any) => {
      (<any>Object).values(group.controls).forEach((control: FormControl) => {
        control.markAsTouched();
      })
    });
    (<FormArray>this.manageCourseForm.get('includes')).controls.forEach((group: any) => {
      (<any>Object).values(group.controls).forEach((control: FormControl) => {
        control.markAsTouched();
      })
    });
    (<FormArray>this.manageCourseForm.get('objectives')).controls.forEach((group: any) => {
      (<any>Object).values(group.controls).forEach((control: FormControl) => {
        control.markAsTouched();
      })
    });
    (<FormArray>this.manageCourseForm.get('sections')).controls.forEach((group: any) => {
      (<any>Object).values(group.controls).forEach((control: any) => {
        control.controls?.forEach((ctrl: any) => {
          (<any>Object).values(ctrl.controls).forEach((ct: FormControl) => {
            ct.markAsTouched();
          })
        })
      })
    });
  }

  valueSection(): any {
    return this.fb.group({
      id: this.fb.control('', null),
      title: this.fb.control('', [Validators.required]),
      details: this.fb.control('', null),
      position: this.fb.control(this.manageCourseForm.value.sections.length, null),
      lessons: this.fb.array([], Validators.required),
      quiz: [null, Validators.required],
      quizId: this.fb.control('', null),
    });
  }
  valueLesson(i: number): any {
    const selectedSection = this.sections.controls[i]
    const length = selectedSection.get('lessons').length;

    return this.fb.group({
      id: this.fb.control('', null),
      title: this.fb.control('', [Validators.required]),
      position: this.fb.control(length, null),
    });
  }
  valueRequirements(): any {
    return this.fb.group({
      id: this.fb.control('', null),
      value: this.fb.control('', [Validators.required]),
    });
  }
  valueObjectives(): any {
    return this.fb.group({
      id: this.fb.control('', null),
      value: this.fb.control('', [Validators.required]),
    });
  }
  valueFaqs(): any {
    return this.fb.group({
      id: this.fb.control('', null),
      title: this.fb.control('', [Validators.required]),
      content: this.fb.control('', [Validators.required]),
    });
  }
  valueIncludes(): any {
    return this.fb.group({
      id: this.fb.control('', null),
      icon: this.fb.control('', [Validators.required]),
      text: this.fb.control('', [Validators.required]),
    });
  }
  addSection(): void {
    this.sections.push(this.valueSection());
  }
  addObjective(): void {
    this.objectives.push(this.valueObjectives());
  }
  addInclude(): void {
    this.includes.push(this.valueIncludes());
  }
  addRequirement(): void {
    this.requirements.push(this.valueRequirements());
  }
  addFaq(): void {
    this.faqs.push(this.valueFaqs());
  }
  removeSection(i: number): void {
    this.sections.removeAt(i);
  }
  get sections(): any {
    return this.manageCourseForm.get('sections') as FormArray;
  }
  get includes(): any {
    return this.manageCourseForm.get('includes') as FormArray;
  }
  get objectives(): any {
    return this.manageCourseForm.get('objectives') as FormArray;
  }
  get requirements(): any {
    return this.manageCourseForm.get('requirements') as FormArray;
  }
  get faqs(): any {
    return this.manageCourseForm.get('faqs') as FormArray;
  }

  addLesson(i: number): void {
    const selectedSection = this.sections.controls[i]
    selectedSection.get('lessons').push(this.valueLesson(i));
  }
  get lessons(): any {
    return this.sections.get('lessons') as FormArray;
  }
  getLessonBySection(i: number): any {
    return this.sections.controls[i].get('lessons') as FormArray
  }

  clearFormArray = (formArray: FormArray) => {
    while (formArray.length !== 0) {
      formArray.removeAt(0)
    }
  }
  bachToList() {
    this.router.navigate([`/admin985xilinp/dashboard/courses/list`]);
  }
  manageCourse() {
    this.submitted = true;
    this.markAllAsTouched();
    if (this.manageCourseForm.valid && this.selectedCertificate && this.selectedPreview) {
      this.isLoading = true
      let data = {
        title: this.manageCourseForm.value.title,
        details: this.manageCourseForm.value.details,
        previewVideo: this.manageCourseForm.value.previewVideo,
        points: this.manageCourseForm.value.points,
        expiration: this.manageCourseForm.value.expiration,
        language: this.manageCourseForm.value.language,
        level: this.manageCourseForm.value.level,
        duration: `${this.manageCourseForm.value.hours}:${this.manageCourseForm.value.minutes}`,
        paid: this.manageCourseForm.value.paid,
        free: this.manageCourseForm.value.free,
        price: this.manageCourseForm.value.price,
        roles: this.manageCourseForm.value.roles,
        discountPrice: this.manageCourseForm.value.discountPrice,
        comingSoon: this.manageCourseForm.value.comingSoon,
        messageComingSoon: this.manageCourseForm.value.messageComingSoon,
        endTimeComingSoon: this.manageCourseForm.value.endTimeComingSoon,
        category: this.manageCourseForm.value.category,
        provider: this.manageCourseForm.value.provider,
        preview: this.selectedPreview ? this.selectedPreview.id : null,
        team: this.manageCourseForm.value.team,
        requirements: this.manageCourseForm.value.requirements,
        faqs: this.manageCourseForm.value.faqs,
        includes: this.manageCourseForm.value.includes,
        objectives: this.manageCourseForm.value.objectives,
        sections: this.manageCourseForm.value.sections,
        certificate: this.selectedCertificate? this.selectedCertificate.id : null,
      }

      if(this.type == 'add') {
        this.coursesService.addCourse(data).subscribe({
          next: (result) => {
            if (result.status) {
              this.isLoading = false
              this.toastr.success('Catégorie ajouté avec succès', 'Enregistré', { timeOut: 1500 });
              this.router.navigate([`/admin985xilinp/dashboard/courses/list`]);
            } else {
              this.isLoading = false;
              this.toastr.warning('Vérifier vos données', 'Vérification', {
                timeOut: 1500
              })
            }
          },
          error: (error) => this.handleRequestError(error),
        });
      }
      if(this.type == 'edit') {
        this.coursesService.updateCourse(this.courseId!, data).subscribe({
          next: (result) => {
            if (result.status) {
              this.isLoading = false
              this.toastr.success('Catégorie modifié avec succès', 'Enregistré', { timeOut: 1500 });
              this.router.navigate([`/admin985xilinp/dashboard/courses/list`]);
            } else {
              this.isLoading = false;
              this.toastr.warning('Vérifier vos données', 'Vérification', {
                timeOut: 1500
              })
            }
          },
          error: (error) => this.handleRequestError(error),
        });
      }
    }
    else {
      if(!this.manageCourseForm.value.points ||
        !this.manageCourseForm.value.expiration ||
        !this.manageCourseForm.value.language||
        !this.manageCourseForm.value.level ||
        !this.manageCourseForm.value.hours ||
        !this.manageCourseForm.value.minutes ||
        !this.selectedPreview
      ) {
        this.title = 'general'
      }
      if(this.showPaid && (!this.manageCourseForm.value.price)) {
        this.title = 'price'
      }

      if(this.requirements.errors) this.title = 'additional'
      if(this.faqs.errors) this.title = 'additional'
      if(this.includes.errors) this.title = 'additional'
      if(this.objectives.errors) this.title = 'additional';
      (<FormArray>this.manageCourseForm.get('requirements')).controls.forEach((group: any) => {
        (<any>Object).values(group.controls).forEach((control: FormControl) => {
          if(control.errors) this.title = 'additional'
        })
      });
      (<FormArray>this.manageCourseForm.get('faqs')).controls.forEach((group: any) => {
        (<any>Object).values(group.controls).forEach((control: FormControl) => {
          if(control.errors) this.title = 'additional'
        })
      });
      (<FormArray>this.manageCourseForm.get('includes')).controls.forEach((group: any) => {
        (<any>Object).values(group.controls).forEach((control: FormControl) => {
          if(control.errors) this.title = 'additional'
        })
      });
      (<FormArray>this.manageCourseForm.get('objectives')).controls.forEach((group: any) => {
        (<any>Object).values(group.controls).forEach((control: FormControl) => {
          if(control.errors) this.title = 'additional'
        })
      });

      if(this.manageCourseForm.get('provider')?.errors) this.title = 'providers';
      if(this.manageCourseForm.get('team')?.errors) this.title = 'providers';
      if(this.manageCourseForm.get('roles')?.errors) this.title = 'providers';

      if(!this.selectedCertificate) this.title = 'certificates';

      if(this.showComingSoon && (!this.manageCourseForm.value.messageComingSoon || !this.manageCourseForm.value.endTimeComingSoon)) {
        this.title = 'coming'
      }

    }
  }
  onSelectCategory($event: any, category: Category) {
    if($event.checked) {
      this.checklistSelection.select(category.id)
      this.checklistCategory.select(category)
      this.manageCourseForm.patchValue({
        category: category.id
      })
    } else {
      this.checklistSelection.deselect(category.id)
      this.checklistCategory.deselect(category)
      this.manageCourseForm.patchValue({
        category: null
      })
    }
  }
  getSelectedItem(): string {
    return this.checklistCategory.selected.map(s => s.name).join(",");
  }
  browserMedia(type: string) {
    const mediaDialogComponent = this.actions.createComponent(MediaDialogComponent);
    mediaDialogComponent.instance.closeActions.subscribe((res :any) => {
      if(res != 'cancel') {
        if(type === 'preview') this.selectedPreview = res[0]
      }
      mediaDialogComponent.destroy()
    });
  }
  openPaid() {
    this.showPaid = !this.showPaid;
    if(this.showPaid) {
      this.manageCourseForm.addControl('price', new FormControl('', Validators.required));
      this.manageCourseForm.addControl('discountPrice', new FormControl('', null));
    } else {
      this.manageCourseForm.removeControl('price')
      this.manageCourseForm.removeControl('discountPrice')
    }
  }
  openComingSoon() {
    this.showComingSoon = !this.showComingSoon;
    if(this.showComingSoon) {
      this.manageCourseForm.addControl('messageComingSoon', new FormControl('', Validators.required));
      this.manageCourseForm.addControl('endTimeComingSoon', new FormControl('', Validators.required));
    } else {
      this.manageCourseForm.removeControl('messageComingSoon')
      this.manageCourseForm.removeControl('endTimeComingSoon')
    }
  }
  async getProviders() {
    this.providersService.getAllActiveProviders(1, 'trainers').subscribe({
      next: (result) => {
        this.providers = result.data.providers
      },
      error: (error) => this.handleRequestError(error),
    });
  }
  changeProvider($event: any) {
    this.selectedProvider = this.providers.find(provider => { return provider.id == $event.value })
    this.manageCourseForm.patchValue({
      team: null
    })
  }

  filterIcons() {
    if (this.searchQuery.trim() === '') {
      this.displayedIcons = [...this.allIcons];
    } else {
      this.displayedIcons = this.allIcons.filter(icon =>
        icon.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
    this.totalPages = Math.ceil(this.displayedIcons.length / this.pageSize);
    this.currentPage = 1;
    this.updatePaginatedIcons();
  }

  updatePaginatedIcons() {
    const start = (this.currentPage - 1) * this.pageSize;
    const icons = this.displayedIcons.slice(start, start + this.pageSize);
    this.cachedPaginatedIcons = Array.from({ length: Math.ceil(icons.length / 5) }, (_, i) =>
      icons.slice(i * 5, (i + 1) * 5)
    );
  }

  changePage(step: number) {
    const newPage = this.currentPage + step;
    if (newPage > 0 && newPage <= this.totalPages) {
      this.currentPage = newPage;
      this.updatePaginatedIcons();
    }
  }

  getIconPath(icon: string): string {
    return `assets/icons/heroicons/outline/${icon}.svg`;
  }


  toggleIcons(index: number) {
    this.showIconsIndex = this.showIconsIndex === index ? null : index;
  }

  selectIcon(icon: string, index: number) {
    this.selectedIcons[index] = icon;
    this.includes.at(index).get('icon')?.setValue(this.getIconPath(icon));
    this.showIconsIndex = null;
  }

  resetIcon(){
    this.showIconsIndex = null
    this.searchQuery = ''
    this.filterIcons()
  }
  getIconName(iconPath: string | null): string {
    return iconPath ? iconPath.split('/').pop() || iconPath : '';
  }

  restAllIcones(){
    if (this.includes.length === 0) {
      this.selectedIcons = [];
      this.showIconsIndex = null;
    }
  }
  // Close the icon selector if clicked outside
  @HostListener('document:click', ['$event.target'])
  onClickOutside(targetElement: HTMLElement) {
    const clickedInside = targetElement.closest('.icon-selector, .icons-button');
    if (!clickedInside) {
      this.showIconsIndex = null;
      this.resetIcon()
    }
  }
  gotoPage(id: string, type: string, action: string, i?: number, j?: number) {
    switch (type) {
      case 'requirement':
        if(action == 'delete'){
          if(this.type == 'edit' && id) {
            const confirmDialogComponent = this.actions.createComponent(ConfirmDialogComponent);
            confirmDialogComponent.instance.type = 'remove'
            confirmDialogComponent.instance.closeActions.subscribe(async (res: any) => {
              if (res == 'confirm') {
                this.coursesService.deleteRequirement(id).subscribe({
                  next: (result) => {
                    if (result.status) {
                      this.requirements.removeAt(i);
                      this.isLoading = false
                    } else {
                      this.isLoading = false;
                      this.toastr.warning('Vérifier vos données', 'Vérification', {
                        timeOut: 1500
                      })
                    }
                  },
                  error: (error) => this.handleRequestError(error),
                });

              }
              confirmDialogComponent.destroy()
            });
          }
          else {
            this.requirements.removeAt(i);
          }
        }
        break;
      case 'faq':
        if(action == 'delete'){
          if(this.type == 'edit' && id) {
            const confirmDialogComponent = this.actions.createComponent(ConfirmDialogComponent);
            confirmDialogComponent.instance.type = 'remove'
            confirmDialogComponent.instance.closeActions.subscribe(async (res: any) => {
              if (res == 'confirm') {
                this.coursesService.deleteFaq(id).subscribe({
                  next: (result) => {
                    if (result.status) {
                      this.faqs.removeAt(i);
                      this.isLoading = false
                    } else {
                      this.isLoading = false;
                      this.toastr.warning('Vérifier vos données', 'Vérification', {
                        timeOut: 1500
                      })
                    }
                  },
                  error: (error) => this.handleRequestError(error),
                });

              }
              confirmDialogComponent.destroy()
            });
          }
          else {
            this.requirements.removeAt(i);
          }
        }
        break;
      case 'include':
        if(action == 'delete'){
          if(this.type == 'edit' && id) {
            const confirmDialogComponent = this.actions.createComponent(ConfirmDialogComponent);
            confirmDialogComponent.instance.type = 'remove'
            confirmDialogComponent.instance.closeActions.subscribe(async (res: any) => {
              if (res == 'confirm') {
                this.coursesService.deleteInclude(id).subscribe({
                  next: (result) => {
                    if (result.status) {
                      this.includes.removeAt(i);
                      this.restAllIcones();
                      this.isLoading = false
                    } else {
                      this.isLoading = false;
                      this.toastr.warning('Vérifier vos données', 'Vérification', {
                        timeOut: 1500
                      })
                    }
                  },
                  error: (error) => this.handleRequestError(error),
                });

              }
              confirmDialogComponent.destroy()
            });
          }
          else {
            this.requirements.removeAt(i);
          }
        }
        break;
      case 'objective':
        if(action == 'delete'){
          if(this.type == 'edit' && id) {
            const confirmDialogComponent = this.actions.createComponent(ConfirmDialogComponent);
            confirmDialogComponent.instance.type = 'remove'
            confirmDialogComponent.instance.closeActions.subscribe(async (res: any) => {
              if (res == 'confirm') {
                this.coursesService.deleteObjective(id).subscribe({
                  next: (result) => {
                    if (result.status) {
                      this.objectives.removeAt(i);
                      this.isLoading = false
                    } else {
                      this.isLoading = false;
                      this.toastr.warning('Vérifier vos données', 'Vérification', {
                        timeOut: 1500
                      })
                    }
                  },
                  error: (error) => this.handleRequestError(error),
                });

              }
              confirmDialogComponent.destroy()
            });
          }
          else {
            this.requirements.removeAt(i);
          }
        }
        break;
      case 'section':
        if(action == 'edit'){
          const confirmDialogComponent = this.actions.createComponent(ConfirmDialogComponent);
          confirmDialogComponent.instance.type = 'quit'
          confirmDialogComponent.instance.closeActions.subscribe(async (res: any) => {
            if (res == 'confirm') {
              this.router.navigate([`/admin985xilinp/dashboard/courses/manage-section`], { queryParams: { type: 'edit', sectionId: id },queryParamsHandling: 'merge'  });
            }
            confirmDialogComponent.destroy()
          });
        }
        break;
      case 'lesson':
        if(action == 'delete'){
          if(this.type == 'edit' && id) {
            const confirmDialogComponent = this.actions.createComponent(ConfirmDialogComponent);
            confirmDialogComponent.instance.type = 'remove'
            confirmDialogComponent.instance.closeActions.subscribe(async (res: any) => {
              if (res == 'confirm') {
                this.coursesService.deleteLesson(id).subscribe({
                  next: (result) => {
                    if (result.status) {
                      this.sections.controls[i!].get('lessons').removeAt(j);
                      this.isLoading = false
                    } else {
                      this.isLoading = false;
                      this.toastr.warning('Vérifier vos données', 'Vérification', {
                        timeOut: 1500
                      })
                    }
                  },
                  error: (error) => this.handleRequestError(error),
                });

              }
              confirmDialogComponent.destroy()
            });
          }
          else {
            this.sections.controls[i!].get('lessons').removeAt(j);
          }
        }
        if(action == 'edit'){
          const confirmDialogComponent = this.actions.createComponent(ConfirmDialogComponent);
          confirmDialogComponent.instance.type = 'quit'
          confirmDialogComponent.instance.closeActions.subscribe(async (res: any) => {
            if (res == 'confirm') {
              this.router.navigate([`/admin985xilinp/dashboard/courses/manage-lesson`], { queryParams: { type: 'edit', lessonId: id },queryParamsHandling: 'merge'  });
            }
            confirmDialogComponent.destroy()
          });
        }
        break;
      case 'quiz':
        if(action == 'edit'){
          const confirmDialogComponent = this.actions.createComponent(ConfirmDialogComponent);
          confirmDialogComponent.instance.type = 'quit'
          confirmDialogComponent.instance.closeActions.subscribe(async (res: any) => {
            if (res == 'confirm') {
              this.router.navigate([`/admin985xilinp/dashboard/courses/manage-quiz`], { queryParams: { type: 'edit', quizId: id } });
            }
            confirmDialogComponent.destroy()
          });
        }
        if(action == 'view'){
          const confirmDialogComponent = this.actions.createComponent(ConfirmDialogComponent);
          confirmDialogComponent.instance.type = 'quit'
          confirmDialogComponent.instance.closeActions.subscribe(async (res: any) => {
            if (res == 'confirm') {
              this.router.navigate([`/admin985xilinp/dashboard/courses/quiz/details-quiz/${id}`]);
            }
            confirmDialogComponent.destroy()
          });
        }
        break;
    }
  }

  changeStatus($event: any, certificateId: string, status: number){
    $event.preventDefault();
    const confirmDialogComponent = this.actions.createComponent(ConfirmDialogComponent);
    confirmDialogComponent.instance.itemId = certificateId
    confirmDialogComponent.instance.status = status
    confirmDialogComponent.instance.newStatus = $event.target.checked
    confirmDialogComponent.instance.type = 'certificate'
    confirmDialogComponent.instance.closeActions.subscribe((res :any) => {
      if(res == 'done') {
        $event.target.checked =!$event.target.checked;  // Revert the status back
      }
      confirmDialogComponent.destroy()
    });
  }
  onChangeStatus(value: string){
    this.selectedStatusCertificate = value
    this.currentPage = 1
    this.getCertificates()
  }
  onChangeItemsPerPage(value: number){
    this.itemsPerPageCertificate = value
    this.currentPage = 1
    this.getCertificates()
  }
  onPageChange(page: number): void {
    this.currentPageCertificate = page;
    this.getCertificates()
  }
  onChangeText(value: string){
    this.searchTextCertificate = value
    this.currentPage = 1
    this.getCertificates()
  }
  getCertificates() {
    this.certificatesService.getAllCertificates(this.sortConfig, this.itemsPerPageCertificate, this.currentPage ,this.searchTextCertificate, this.selectedStatusCertificate).subscribe({
      next: (result) => {
        this.certificates = result.data.certificates
        this.allCertificatesCount = result.data.count
      },
      error: (error) => this.handleRequestError(error),
    });
  }
  async getAllRatings() {
    this.ratingsService.getAllRatings(this.courseId!, this.sortConfigRatings, this.itemsPerPageRating, this.currentPageRating , this.selectedStatusRating).subscribe({
      next: (result) => {
        this.ratings = result.data.ratings
        this.allRatingsCount = result.data.totalReviews
        this.averageRating = result.data.averageRating
        this.oneStar = result.data['0']
        this.twoStar = result.data['1']
        this.threeStar = result.data['2']
        this.fourStar = result.data['3']
        this.fiveStar = result.data['4']
      },
      error: (error) => this.handleRequestError(error),
    });
  }
  onChangeSelectedCertificate(certificate: Certificate) {
    this.selectedCertificate = certificate
  }
  goToUserDetails(userId: string | undefined) {
    this.router.navigate([`/admin985xilinp/dashboard/details-user/${userId}`]);
  }
}
