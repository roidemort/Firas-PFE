import {Component, ElementRef, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {CdkDrag} from "@angular/cdk/drag-drop";
import {
  MatAutocomplete,
  MatAutocompleteModule,
  MatAutocompleteTrigger,
  MatOption
} from "@angular/material/autocomplete";
import {MatCheckbox} from "@angular/material/checkbox";
import {MatIconButton} from "@angular/material/button";
import {MatFormField, MatInput, MatInputModule} from "@angular/material/input";
import {MatTree, MatTreeNode, MatTreeNodeDef, MatTreeNodePadding, MatTreeNodeToggle} from "@angular/material/tree";
import {AsyncPipe, DatePipe, NgClass, NgForOf, NgIf, NgStyle} from "@angular/common";
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {SvgIconComponent} from "angular-svg-icon";
import {LoaderComponent} from "../../../../../shared/components/loader/loader.component";
import {ToastrService} from "ngx-toastr";
import {ActivatedRoute, Router} from "@angular/router";
import {Image} from "../../../../../core/models/image.model";
import {MediaDialogComponent} from "../../../components/dialog/media-dialog/media-dialog.component";
import {CertificatesService} from "../../../../../core/services/certificates.service";
import {toast} from "ngx-sonner";
import {lastValueFrom, map, Observable, startWith} from "rxjs";
import {Certificate} from "../../../../../core/models/certificate.model";
import {MatFormFieldModule} from "@angular/material/form-field";

@Component({
  selector: 'app-manage-certificate',
  standalone: true,
  imports: [CdkDrag, MatAutocomplete, MatAutocompleteTrigger, MatCheckbox, MatIconButton, MatInput, MatOption, MatTree, MatTreeNode, MatTreeNodeDef, MatTreeNodePadding, MatTreeNodeToggle, NgForOf, NgIf, ReactiveFormsModule, SvgIconComponent, NgClass, DatePipe, LoaderComponent, NgStyle, AsyncPipe, MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule],
  templateUrl: './manage-certificate.component.html',
  styleUrl: './manage-certificate.component.scss'
})
export class ManageCertificateComponent implements OnInit {
  dragPositionTitle = { x: 0, y: 0 };
  dragPositionSubTitle = { x: 0, y: 0 };
  dragPositionDescription = { x: 0, y: 0 };
  dragPositionSignature = { x: 0, y: 0 };
  filteredAutosTitle!: Observable<string[]>;
  filteredAutosSubTitle!: Observable<string[]>;
  filteredAutosDescription!: Observable<string[]>;
  autos: string[] = ['student_name', 'course_name', 'provider_name', 'date'];
  isMentioning = false;
  allTextTitle = ''
  allTextSub_title = ''
  allTextDescription = ''
  offset: any
  isLoading = false;
  submitted = false
  certificate!: Certificate
  @ViewChild('actions', { static: true, read: ViewContainerRef })
  actions!: ViewContainerRef;
  manageCertificateForm!: FormGroup;
  selectedBackground!: Image | undefined
  selectedSignature!: Image | undefined
  type!: string | null
  certificateId!: string | null
  showTitle = false
  showSubTitle = false
  showDescription = false

  constructor(private fb : FormBuilder, private toastr: ToastrService, private router: Router, private route: ActivatedRoute, private certificatesService: CertificatesService) {
    this.dragPositionTitle = { x: 0, y: 0 };
    this.dragPositionSubTitle = { x: 0, y: 0 };
    this.dragPositionDescription = { x: 0, y: 0 };
    this.dragPositionSignature = { x: 0, y: 0 };
  }

  async ngOnInit() {
    this.selectedBackground = undefined
    this.selectedSignature = undefined
    this.type = this.route.snapshot.queryParamMap.get('type');
    this.certificateId = this.route.snapshot.queryParamMap.get('certificateId');
    this.manageCertificateForm = this.fb.group({
      name: [null, Validators.required],
      title: [null, Validators.required],
      sub_title: [null, null],
      description: [null, null],
    });
    if (this.type == 'edit') {
      this.isLoading = true
      const result$ = this.certificatesService.getCertificateDetails(this.certificateId!)
      const result = await lastValueFrom(result$);
      this.certificate = result.data
      this.manageCertificateForm.patchValue({
        name: this.certificate.name,
        title: this.certificate.title,
        sub_title: this.certificate.sub_title,
        description: this.certificate.description,
      });
      if(this.certificate.positionTitle) {
        this.dragPositionTitle = this.certificate.positionTitle
        this.showTitle = true
      }
      if(this.certificate.positionSubTitle) {
        this.dragPositionSubTitle = this.certificate.positionSubTitle
        this.showSubTitle = true
      }
      if(this.certificate.positionDescription) {
        this.dragPositionDescription = this.certificate.positionDescription
        this.showDescription = true
      }
      if(this.certificate.positionSignature) this.dragPositionSignature = this.certificate.positionSignature

      this.selectedBackground = this.certificate.background
      this.selectedSignature = this.certificate.signature
      this.isLoading = false
    }
    this.filteredAutosTitle = this.manageCertificateForm.controls['title'].valueChanges.pipe(
      startWith(''),
      map(value => this.filterAutos(value || ''))
    );
    this.filteredAutosSubTitle = this.manageCertificateForm.controls['sub_title'].valueChanges.pipe(
      startWith(''),
      map(value => this.filterAutos(value || ''))
    );
    this.filteredAutosDescription = this.manageCertificateForm.controls['description'].valueChanges.pipe(
      startWith(''),
      map(value => this.filterAutos(value || ''))
    );
  }
  // Filter users based on the current input value
  private filterAutos(value: string): string[] {
    const atSymbolIndex = value.lastIndexOf('{');
    if (atSymbolIndex === -1) {
      this.isMentioning = false;
      return [];
    }
    this.isMentioning = true;
    const searchText = value.substring(atSymbolIndex + 1).toLowerCase();
    return this.autos.filter(auto => auto.toLowerCase().includes(searchText));
  }
  saveChange(input : string) {
    if(input == 'title') this.allTextTitle = this.manageCertificateForm.value.title
    if(input == 'sub_title') this.allTextSub_title = this.manageCertificateForm.value.sub_title
    if(input == 'description') this.allTextDescription = this.manageCertificateForm.value.description
  }
  selectUser(input : string) {
    if(input == 'title') {
      const value = this.manageCertificateForm.value.title;
      this.manageCertificateForm.controls['title'].setValue(this.allTextTitle + '{'+value+'}}');
    }
    if(input == 'sub_title') {
      const value = this.manageCertificateForm.value.sub_title;
      this.manageCertificateForm.controls['sub_title'].setValue(this.allTextSub_title + '{'+value+'}}');
    }
    if(input == 'description') {
      const value = this.manageCertificateForm.value.description;
      this.manageCertificateForm.controls['description'].setValue(this.allTextDescription + '{'+value+'}}');
    }

    this.isMentioning = false;
  }

  drop($event: any, type: string) {
    this.offset = { ...(<any>$event.source._dragRef)._passiveTransform };

    if(type == 'title') this.dragPositionTitle = { ...(<any>$event.source._dragRef)._passiveTransform }
    if(type == 'sub_title') this.dragPositionSubTitle = { ...(<any>$event.source._dragRef)._passiveTransform }
    if(type == 'description') this.dragPositionDescription = { ...(<any>$event.source._dragRef)._passiveTransform }
    if(type == 'signature') this.dragPositionSignature = { ...(<any>$event.source._dragRef)._passiveTransform }
  }
  browserMedia(type: string) {
    const mediaDialogComponent = this.actions.createComponent(MediaDialogComponent);
    mediaDialogComponent.instance.closeActions.subscribe((res :any) => {
      if(res != 'cancel') {
        if(type === 'background') this.selectedBackground = res[0]
        if(type === 'signature') this.selectedSignature = res[0]
      }
      mediaDialogComponent.destroy()
    });
  }
  fillInput($event: any, input: string) {
    if($event.target.value) {
      if(input == 'title') this.showTitle = true
      if(input == 'sub_title') this.showSubTitle = true
      if(input == 'description') this.showDescription = true
    } else {
      if(input == 'title') this.showTitle = false
      if(input == 'sub_title') this.showSubTitle = false
      if(input == 'description') this.showDescription = false
    }
  }
  bachToList() {
    this.router.navigate([`/admin985xilinp/dashboard/courses/certificates`]);
  }
  markAllAsTouched() {
    Object.keys(this.manageCertificateForm.controls).forEach((key) => {
      this.manageCertificateForm.get(key)?.markAsTouched();
    });
  }
  manageCertificate(){
    this.submitted = true;
    this.markAllAsTouched();
    if (this.manageCertificateForm.valid && this.selectedBackground) {
      this.isLoading = true

      let data = {
        name: this.manageCertificateForm.value.name,
        title: this.manageCertificateForm.value.title,
        sub_title: this.manageCertificateForm.value.sub_title,
        description: this.manageCertificateForm.value.description,
        background: this.selectedBackground ? this.selectedBackground.id : null,
        signature: this.selectedSignature ? this.selectedSignature.id : null,
        positionTitle: this.dragPositionTitle,
        positionSubTitle: this.dragPositionSubTitle,
        positionDescription: this.dragPositionDescription,
        positionSignature: this.dragPositionSignature,
      }

      if(this.type == 'add') {
        this.certificatesService.addCertificate(data).subscribe({
          next: (result) => {
            if (result.status) {
              this.isLoading = false
              this.toastr.success('Certificat ajouté avec succès', 'Enregistré', { timeOut: 1500 });
              this.router.navigate([`/admin985xilinp/dashboard/courses/certificates`]);
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
        this.certificatesService.updateCertificate(this.certificateId!, data).subscribe({
          next: (result) => {
            if (result.status) {
              this.isLoading = false
              this.toastr.success('Certificat modifié avec succès', 'Enregistré', { timeOut: 1500 });
              this.router.navigate([`/admin985xilinp/dashboard/courses/certificates`]);
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
  }
  private handleRequestError(error: any) {
    const msg = 'An error occurred while fetching users';
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
}
