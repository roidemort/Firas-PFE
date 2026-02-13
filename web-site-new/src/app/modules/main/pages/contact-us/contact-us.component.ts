import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { AppPhoneNumberDirective } from 'src/app/shared/directives/app-phone-number.directive';
import { SliderComponent } from "../../components/slider/slider.component";
import { ContactService } from 'src/app/core/services/contact.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AppPhoneNumberDirective, RouterModule, SliderComponent],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.scss'
})
export class ContactUsComponent {
  contactForm: FormGroup
  mailto = 'info@galiocare.com';
  isLogged = false
  isTextVisible: boolean[] = [];

  faqs = [
    { title: "Qu'est-ce que Galiocare ?", content: "Galiocare est une plateforme innovante dédiée à l'apprentissage en ligne." },
    { title: "Combien coûte Galiocare ?", content: "Le coût de Galiocare dépend de l'abonnement choisi par l'utilisateur." },
    { title: "Où puis-je me former ?", content: "Vous pouvez vous former sur Galiocare depuis n'importe quel appareil connecté à Internet." },
    { title: "Comment puis-je annuler mon abonnement ?", content: "L'annulation de votre abonnement Galiocare peut être effectuée à partir de votre espace personnel." },
    { title: "Que puis-je regarder sur Galiocare ?", content: "Sur Galiocare, vous avez accès à une vaste bibliothèque de cours et de formations." },
    { title: "À qui est destiné Galiocare ?", content: "Galiocare est destiné à toute personne souhaitant apprendre et développer de nouvelles compétences." }
  ];

  constructor(private fb: FormBuilder, private authService: AuthService, private contactService: ContactService, private toastr: ToastrService) {

    this.contactForm = this.fb.group({
      firstName: [null, Validators.required],
      lastName: [null, Validators.required],
      email: [null, [Validators.required, Validators.email]],
      phoneNumber: [null, Validators.required],
      message: [null, Validators.required],
    });
  }

  ngOnInit() {
    this.isLogged = this.authService.isAuthenticated()
  }

  markAllAsTouched() {
    Object.keys(this.contactForm.controls).forEach(key => {
      this.contactForm.get(key)?.markAsTouched();
    });
  }

  toggleFAQ(index: number) {
    this.isTextVisible[index] = !this.isTextVisible[index];
  }

  scrollToFAQ() {
  const faqElement = document.getElementById('faq');
  if (faqElement) {
    faqElement.scrollIntoView({ behavior: 'smooth' });
  }
}

  onSubmit() {
    this.markAllAsTouched();
    // stop here if form is invalid
    if (this.contactForm.invalid) {
      return;
    }
    // console.log(this.contactForm.value)

    const { firstName, lastName, email, phoneNumber, message } = this.contactForm.value;
    const data = { firstName, lastName, email, phoneNumber, message };

    this.contactService.sendMail(data).subscribe({
      next: (res) => {
        if (res.status) {
          // console.log(res)
          this.toastr.success('Un email a été envoyé', 'Information', {
            timeOut: 1500
          });
          this.contactForm.reset()
        }
      },
      error: (error) => {
        this.toastr.error('Une erreur est survenue', 'Erreur', {
          timeOut: 1500
        });
        console.error('Erreur:', error);
      }
    });

  }
}
