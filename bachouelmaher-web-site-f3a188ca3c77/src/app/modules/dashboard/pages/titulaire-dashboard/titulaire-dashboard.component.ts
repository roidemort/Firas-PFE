import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TitulaireService } from '../../../../services/titulaire/titulaire.service';

@Component({
  selector: 'app-titulaire-dashboard',
  templateUrl: './titulaire-dashboard.component.html',
  styleUrls: ['./titulaire-dashboard.component.css']
})
export class TitulaireDashboardComponent implements OnInit {

  stats: any = {
    maxPharmaciens: 0,
    currentPharmaciens: 0,
    maxPreparateurs: 0,
    currentPreparateurs: 0
  };
  addStaffForm: FormGroup;

  constructor(
    private titulaireService: TitulaireService,
    private fb: FormBuilder
  ) {
    this.addStaffForm = this.fb.group({
      Nom: ['', Validators.required],
      Email: ['', [Validators.required, Validators.email]],
      Role: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.titulaireService.getStaffStats().subscribe((data: any) => {
      this.stats = data;
    });
  }

  get pharmacienPercent(): number {
    if (!this.stats.maxPharmaciens) {
      return 0;
    }
    return (this.stats.currentPharmaciens / this.stats.maxPharmaciens) * 100;
  }

  get preparateurPercent(): number {
    if (!this.stats.maxPreparateurs) {
      return 0;
    }
    return (this.stats.currentPreparateurs / this.stats.maxPreparateurs) * 100;
  }

  isQuotaReached(): boolean {
    const role = this.addStaffForm.get('Role')?.value;
    if (role === 'pharmacien' && this.stats.currentPharmaciens >= this.stats.maxPharmaciens) {
      return true;
    }
    if (role === 'preparateur' && this.stats.currentPreparateurs >= this.stats.maxPreparateurs) {
      return true;
    }
    return false;
  }

  onSubmit(): void {
    if (this.addStaffForm.valid && !this.isQuotaReached()) {
      this.titulaireService.addStaffMember(this.addStaffForm.value).subscribe(() => {
        // Refresh stats after adding a member
        this.titulaireService.getStaffStats().subscribe((data: any) => {
          this.stats = data;
        });
      });
    }
  }
}
