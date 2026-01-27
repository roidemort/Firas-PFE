import {Component, OnInit, signal, ViewChild, ViewContainerRef} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {PharmaciesService} from "../../../../../core/services/pharmacies.service";
import {toast} from "ngx-sonner";
import {ToastrService} from "ngx-toastr";
import {SvgIconComponent} from "angular-svg-icon";
import {TableActionComponent} from "../../../components/tables/table-keys/table-action/table-action.component";
import {TableFooterComponent} from "../../../components/tables/table-keys/table-footer/table-footer.component";
import {TableHeaderComponent} from "../../../components/tables/table-keys/table-header/table-header.component";
import {TableRowComponent} from "../../../components/tables/table-keys/table-row/table-row.component";
import {DatePipe, NgClass, NgIf} from "@angular/common";
import {Key} from "../../../../../core/models/pharmacy.model";
import {SortConfig} from "../../../../../core/models/config.model";
import {LoaderComponent} from "../../../../../shared/components/loader/loader.component";
import {AddKeyDialogComponent} from "../../../components/dialog/add-key-dialog/add-key-dialog.component";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
// Add Editor imports for email editor
import {Editor, NgxEditorModule, Toolbar, toHTML} from 'ngx-editor';
import { schema } from 'ngx-editor/schema'; // ADD THIS IMPORT
import { GenerateMultipleKeysDialogComponent } from '../../../components/dialog/generate-multiple-keys-dialog/generate-multiple-keys-dialog.component';

@Component({
  selector: 'app-details-pharmacy',
  standalone: true,
    imports: [
        SvgIconComponent,
        TableActionComponent,
        TableFooterComponent,
        TableHeaderComponent,
        TableRowComponent,
        NgIf,
        DatePipe,
        NgClass,
        LoaderComponent,
        ReactiveFormsModule, // ADD THIS
        NgxEditorModule
    ],
  templateUrl: './details-pharmacy.component.html',
  styleUrl: './details-pharmacy.component.scss'
})
export class DetailsPharmacyComponent implements OnInit {
  @ViewChild('actions', { static: true, read: ViewContainerRef })
  actions!: ViewContainerRef;
  pharmacyId?: string | null;
  isLoading = false
  pharmacyDetails: any
  sortConfig = {} as SortConfig;

  allKeys = signal<Key[]>([]);

  allKeysCount : number = 0
  selectedStatus: string = ""
  searchText: string = ""
  itemsPerPage: number = 10;
  currentPage: number = 1;



  unusedKeys: Key[] = [];
  manageEmailForm!: FormGroup;
  editor: Editor;
  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];

  constructor(private route: ActivatedRoute, private pharmaciesService: PharmaciesService, private toastr: ToastrService, private fb: FormBuilder){
  this.editor = new Editor({
        content: '',
        plugins: [],
        schema,
        nodeViews: {},
        history: true,
        keyboardShortcuts: true,
        inputRules: true,
      });
  }

  ngOnInit(): void {
    this.pharmacyId = this.route.snapshot.paramMap.get('id');

    this.pharmaciesService.getPharmacyDetails(this.pharmacyId!).subscribe({
      next: (result) => {
        if (result.status) {
          this.isLoading = false
          this.pharmacyDetails = result.data
        } else {
          this.isLoading = false;
          this.toastr.warning('Vérifier vos données', 'Vérification', {
            timeOut: 1500
          })
        }
      },
      error: (error) => this.handleRequestError(error),
    });
    this.getAllKeys()


    this.manageEmailForm = this.fb.group({
      text: [null, Validators.required],
      subject: ['🎉 Vos accès Galiocare sont activés !', Validators.required],
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

  onChangeStatus(value: string){
    this.selectedStatus = value
    this.currentPage = 1
    this.getAllKeys()
  }

  onChangeText(value: string){
    this.searchText = value
    this.currentPage = 1
    this.getAllKeys()
  }

  public sortKeys(sortConfig: any) {
    this.sortConfig = sortConfig
    this.getAllKeys()
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.getAllKeys()
  }

  onChangeItemsPerPage(value: number){
    this.itemsPerPage = value
    this.currentPage = 1
    this.getAllKeys()
  }

  getAllKeys() {
    this.isLoading = true
    this.pharmaciesService.getAllKeys(this.sortConfig, this.pharmacyId!, this.itemsPerPage, this.currentPage ,this.searchText, this.selectedStatus).subscribe({
      next: (result) => {
        this.allKeys.set(result.data.keys)
        this.allKeysCount = result.data.count
        this.unusedKeys = this.getUnusedKeys(); // Update unused keys
        this.isLoading = false
      },
      error: (error) => this.handleRequestError(error),
    });
  }


  generateNewKey() {
    const manageKeyDialogComponent = this.actions.createComponent(AddKeyDialogComponent);
    manageKeyDialogComponent.instance.closeActions.subscribe((res :any) => {
      if(res != 'close') {
        this.pharmaciesService.generateNewKey(this.pharmacyId!, res).subscribe({
          next: (result) => {
            if (result.status) {
              this.toastr.success('Générer une clé avec succès', 'Succès', {
                timeOut: 1500,
              });
              this.getAllKeys()
            }
            else {
              this.toastr.warning('Vérifier vos données', 'Vérification', {
                timeOut: 1500
              })
            }
          },
          error: (error) => this.handleRequestError(error),
        });
      }

      manageKeyDialogComponent.destroy()
    });


  }


  // new mailing methods :
  ngOnDestroy() {
    this.editor.destroy();
  }
  // ADD THIS METHOD - Get unused keys
  getUnusedKeys(): Key[] {
    return this.allKeys().filter(key =>
      key.status === 0 || key.status === 1 // Assuming 0 or 1 means unused
    );
  }

  generateKeysListEmail(): string {
  const unusedKeys = this.getUnusedKeys();

  if (unusedKeys.length === 0) {
    return `<p>Bonjour,</p>
           <p>Il n'y a actuellement aucune clé disponible pour votre pharmacie.</p>
           <p>Cordialement,<br>L'équipe de support</p>`;
  }

  // Group keys by role
  const keysByRole: { [key: string]: Key[] } = {};

  unusedKeys.forEach(key => {
    const keyWithRole = key as any;
    const role = this.getRoleDisplayName(keyWithRole.role) || 'Sans rôle spécifique';
    if (!keysByRole[role]) {
      keysByRole[role] = [];
    }
    keysByRole[role].push(key);
  });

  // Get pharmacy name (remove email domain if present in name)
  const pharmacyName = this.pharmacyDetails?.name || '';
  const displayName = pharmacyName.replace(/@.*$/, ''); // Remove email domain if present

  // Create the email template with dark background
  return `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #111827; color: #f3f4f6;">
  <!-- Header with Logo Image -->


  <!-- Main Content with dark theme -->
  <div style="padding: 40px 30px; background-color: #111827;">
    <!-- Greeting -->
    <h2 style="color: #ffffff; margin-bottom: 25px; font-size: 24px;">Bonjour ${displayName},</h2>

    <!-- Welcome Message - REMOVED border-left: 5px solid #8b5cf6; -->
    <div style="background-color: #374151; padding: 25px; border-radius: 12px; margin-bottom: 35px;">
      <p style="font-size: 18px; color: #D1FA94; margin: 0 0 12px 0; font-weight: bold;">
        🎉 Bonne nouvelle ! Vos accès Galiocare sont activés.
      </p>
      <p style="color: #d1d5db; margin: 0; line-height: 1.7;">
        Vous pouvez désormais accéder à nos formations quand vous voulez, où que vous soyez !
        Partagez ces clés d'activation avec vos collaborateurs pour qu'ils rejoignent l'aventure et
        accèdent eux aussi à la plateforme 🚀
      </p>
    </div>

    <!-- Keys Section -->
    <div style="margin-bottom: 35px;">
      <h3 style="color: #ffffff; border-bottom: 2px solid #D1FA94; padding-bottom: 12px; margin-bottom: 25px; font-size: 20px;">
        Vos clés d'activation par rôle
      </h3>

      ${Object.keys(keysByRole).map(role => {
        const roleKeys = keysByRole[role];
        return `
        <div style="margin-bottom: 30px;">
          <h4 style="color: #e5e7eb; background-color: #374151; padding: 15px; border-radius: 8px; margin: 0 0 18px 0; font-size: 16px; font-weight: 600;">
            ${role.toUpperCase()}
          </h4>
          <div style="display: grid; gap: 12px;">
            ${roleKeys.map((key, index) => `
            <div style="background-color: #1f2937; padding: 18px; border-radius: 8px; border: 1px dashed #4b5563;">
              <div style="font-weight: bold; color: #9ca3af; margin-bottom: 8px; font-size: 14px;">Clé ${index + 1}</div>
              <div style="font-family: 'Courier New', monospace; background-color: #111827; padding: 15px; border-radius: 6px; border: 1px solid #374151; font-size: 14px; word-break: break-all; color: #D1FA94; letter-spacing: 0.5px;">
                ${key.key || 'N/A'}
              </div>
            </div>
            `).join('')}
          </div>
        </div>
        `;
      }).join('')}
    </div>

    <!-- Instructions Section -->
    <div style="background-color: #1f2937; padding: 30px; border-radius: 12px; margin-bottom: 35px; border: 1px solid #374151;">
      <h3 style="color: #ffffff; margin-top: 0; margin-bottom: 25px; font-size: 20px;">📋 Comment s'inscrire ?</h3>

      <div style="display: grid; gap: 18px;">
        <div style="display: flex; align-items: flex-start;">
          <!-- Responsive circle with min-width/max-width -->
          <div style="background-color: #D1FA94; color: #111827; min-width: 28px; width: 28px; max-width: 28px; min-height: 28px; height: 28px; max-height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; font-size: 14px; margin-right: 15px; margin-top: 2px;">1</div>
          <div style="color: #cedddeff; flex: 1;">
            <span style="font-weight: bold; color: #e5e7eb;">Rendez-vous sur</span>
            <a href="https://galiocare.com/inscription" style="color: #D1FA94; text-decoration: none; font-weight: bold; margin-left: 5px;">www.galiocare.com</a>
          </div>
        </div>

        <div style="display: flex; align-items: flex-start;">
          <div style="background-color: #D1FA94; color: #111827; min-width: 28px; width: 28px; max-width: 28px; min-height: 28px; height: 28px; max-height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; font-size: 14px; margin-right: 15px; margin-top: 2px;">2</div>
          <div style="color: #e5e7eb; flex: 1;">Cliquez sur <span style="font-weight: bold; color: #e5e7eb;">"Commencer"</span> depuis la page d'accueil de Galiocare.</div>
        </div>

        <div style="display: flex; align-items: flex-start;">
          <div style="background-color: #D1FA94; color: #111827; min-width: 28px; width: 28px; max-width: 28px; min-height: 28px; height: 28px; max-height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; font-size: 14px; margin-right: 15px; margin-top: 2px;">3</div>
          <div style="color: #e5e7eb; flex: 1;">Puis <span style="font-weight: bold; color: #e5e7eb;">"Inscription"</span></div>
        </div>

        <div style="display: flex; align-items: flex-start;">
          <div style="background-color: #D1FA94; color: #111827; min-width: 28px; width: 28px; max-width: 28px; min-height: 28px; height: 28px; max-height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; font-size: 14px; margin-right: 15px; margin-top: 2px;">4</div>
          <div style="color: #e5e7eb; flex: 1;">Entrez votre clé d'activation pour lier votre profil au compte de votre pharmacie.</div>
        </div>

        <div style="display: flex; align-items: flex-start;">
          <div style="background-color: #D1FA94; color: #111827; min-width: 28px; width: 28px; max-width: 28px; min-height: 28px; height: 28px; max-height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; font-size: 14px; margin-right: 15px; margin-top: 2px;">5</div>
          <div style="color: #e5e7eb; flex: 1;">Complétez vos informations</div>
        </div>

        <div style="display: flex; align-items: flex-start;">
          <div style="background-color: #D1FA94; color: #111827; min-width: 28px; width: 28px; max-width: 28px; min-height: 28px; height: 28px; max-height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; font-size: 14px; margin-right: 15px; margin-top: 2px;">6</div>
          <div style="color: #e5e7eb; flex: 1;">Accédez aux formations et commencez votre parcours à votre rythme.</div>
        </div>

        <div style="display: flex; align-items: flex-start;">
          <div style="background-color: #D1FA94; color: #111827; min-width: 28px; width: 28px; max-width: 28px; min-height: 28px; height: 28px; max-height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; font-size: 14px; margin-right: 15px; margin-top: 2px;">7</div>
          <div style="color: #e5e7eb; flex: 1;">Distribuez le reste des clés d'activation à votre équipe afin que chacun puisse se former à son rythme.</div>
        </div>
      </div>
    </div>

    <!-- CTA Button -->
<div style="text-align: center; margin-bottom: 35px;">
  <a href="https://galiocare.com/inscription" style="background: linear-gradient(135deg, #D1FA94 0%, #0E9CA6 100%); color: #FFFFFF; padding: 18px 45px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 15px rgba(209, 250, 148, 0.3); transition: all 0.3s ease; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);">
    Inscription
  </a>
</div>

    <!-- New Section: Do not reply directly -->
    <div style="background-color: #1f2937; padding: 25px; border-radius: 10px; margin-bottom: 30px; border: 1px solid #374151;">
      <p style="color: #9ca3af; margin: 0; line-height: 1.6; text-align: center; font-size: 14px;">
        Veuillez ne pas répondre directement à cet e-mail. Si vous avez des questions contactez-nous par<br>
        mail: <a href="mailto:info@galiocare.com" style="color: #D1FA94; text-decoration: none;">info@galiocare.com</a> ou rendez-vous sur notre site.
      </p>
    </div>

    <!-- Closing Message -->
    <div style="text-align: center; color: #d1d5db; line-height: 1.7; margin-bottom: 30px;">
      <p style="font-size: 16px; margin: 0 0 12px 0;">
        On vous souhaite une excellente découverte de Galiocare et de belles sessions d'apprentissage.
      </p>
      <p style="font-weight: bold; color: #ffffff; margin: 0; font-size: 17px;">
        L'équipe Galiocare
      </p>
    </div>
  </div>

  <!-- Footer -->
  <div style="background-color: #0f172a; color: white; padding: 40px 20px; text-align: center; border-top: 1px solid #1e293b;">
    <div style="margin-bottom: 25px;">
      <div style="display: flex; justify-content: center; gap: 35px; margin-bottom: 30px; flex-wrap: wrap;">
        <div style="text-align: center;">
          <div style="font-weight: bold; margin-bottom: 8px; color: #D1FA94;">📞 Contactez-nous</div>
          <div style="color: #cbd5e1;">+216 52 519 000</div>
        </div>

        <div style="text-align: center;">
          <div style="font-weight: bold; margin-bottom: 8px; color: #D1FA94;">✉️ Email</div>
          <a href="mailto:info@galiocare.com" style="color: #D1FA94; text-decoration: none;">info@galiocare.com</a>
        </div>

        <div style="text-align: center;">
          <div style="font-weight: bold; margin-bottom: 8px; color: #D1FA94;">📍 Adresse</div>
          <div style="color: #cbd5e1;">50 Rue Platon, 2ème étage,<br>Zone industrielle Kheireddine</div>
        </div>
      </div>
    </div>

    <div style="border-top: 1px solid #334155; padding-top: 25px;">
      <p style="margin: 0; font-size: 13px; color: #94a3b8;">
        © ${new Date().getFullYear()} GALIOCARE. Tous droits réservés.
      </p>
      <p style="margin: 8px 0 0 0; font-size: 12px; color: #64748b;">
        Votre plateforme de formation continue
      </p>
    </div>
  </div>
</div>
`;
}

  // ADD THIS METHOD - Get role display name
  getRoleDisplayName(roleKey: string): string {
  if (!roleKey) return 'Autre rôle';

  const roleMap: { [key: string]: string } = {
    'PHARMACIST_HOLDER': 'PHARMACIEN TITULAIRE',
    'PHARMACIEN_TITULAIRE': 'PHARMACIEN TITULAIRE',
    'PHARMACIST': 'PHARMACIENS',
    'STAGIAIRE': 'STAGIAIRES',
    'PREPARER':'Préparateur en pharmacie'
    // Add other role mappings as needed
  };

  const normalizedKey = roleKey.toUpperCase().trim();
  return roleMap[normalizedKey] || roleKey;
}

  // ADD THIS METHOD - Send email with keys
  sendEmailWithKeys() {
    // Get unused keys
    this.unusedKeys = this.getUnusedKeys();

    if (this.unusedKeys.length === 0) {
      this.toastr.warning('Aucune clé non utilisée disponible', 'Information', {
        timeOut: 2000
      });
      return;
    }

    // Ask for confirmation
    const confirmSend = confirm(`Envoyer un email à ${this.pharmacyDetails?.email} avec ${this.unusedKeys.length} clé(s) non utilisée(s) ?`);

    if (!confirmSend) {
      return;
    }

    // Generate email content
    const emailContent = this.generateKeysListEmail();

    // Set form values
    this.manageEmailForm.patchValue({
      text: { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: emailContent }] }] }
    });

    // Prepare data for API
    const data = {
      pharmacyId: this.pharmacyId,
      html: emailContent,
      subject: this.manageEmailForm.value.subject,
      unusedKeys: this.unusedKeys.map(key => ({
        id: key.id,
        key: key.key,
        role: key.role
      }))
    };

    // Send the email
    this.isLoading = true;
    this.pharmaciesService.sendPharmacyNotification(data).subscribe({
      next: (result) => {
        this.isLoading = false;
        if (result.status) {
          this.toastr.success('Email envoyé avec succès', 'Succès', {
            timeOut: 3000
          });
        } else {
          this.toastr.warning('Vérifier vos données', 'Vérification', {
            timeOut: 1500
          });
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.handleRequestError(error);
      },
    });
  }



  generateMultipleKeys() {
  const dialogRef = this.actions.createComponent(GenerateMultipleKeysDialogComponent);

  dialogRef.instance.closeDialog.subscribe((keysToGenerate: any[] | null) => {
    if (keysToGenerate && keysToGenerate.length > 0) {
      // Confirm with the user
      const confirmGenerate = confirm(`Êtes-vous sûr de vouloir générer ${keysToGenerate.length} clé(s) ?`);

      if (confirmGenerate) {
        // Generate keys one by one (to avoid backend changes)
        this.generateKeysSequentially(keysToGenerate, 0);
      }
    }

    dialogRef.destroy();
  });
}


private generateKeysSequentially(keysToGenerate: any[], index: number) {
  if (index >= keysToGenerate.length) {
    // All keys generated
    this.toastr.success(`${keysToGenerate.length} clé(s) générée(s) avec succès`, 'Succès', {
      timeOut: 3000,
    });
    this.getAllKeys();
    return;
  }

  const keyData = keysToGenerate[index];

  this.pharmaciesService.generateNewKey(this.pharmacyId!, keyData.role).subscribe({
    next: (result) => {
      if (result.status) {
        // Generate next key
        setTimeout(() => {
          this.generateKeysSequentially(keysToGenerate, index + 1);
        }, 300); // Small delay between requests
      } else {
        this.toastr.error(`Erreur lors de la génération de la clé ${index + 1}`, 'Erreur', {
          timeOut: 3000,
        });
      }
    },
    error: (error) => {
      this.toastr.error(`Erreur lors de la génération de la clé ${index + 1}`, 'Erreur', {
        timeOut: 3000,
      });
      // Continue with next key anyway
      setTimeout(() => {
        this.generateKeysSequentially(keysToGenerate, index + 1);
      }, 300);
    },
  });
}


}
