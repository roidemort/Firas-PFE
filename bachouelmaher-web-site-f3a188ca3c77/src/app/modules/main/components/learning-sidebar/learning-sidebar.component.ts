import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CoursesEventService } from 'src/app/core/services/courses-event.service';
import { CoursesService } from 'src/app/core/services/courses.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SvgIconComponent } from 'angular-svg-icon';
import { LocalStorageService } from 'src/app/core/services/localstorage.service';
import { LoadingService } from 'src/app/core/services/loading.service';
import { CertificatesService } from 'src/app/core/services/certificates.service';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/core/services/auth.service';
@Component({
  selector: 'app-learning-sidebar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, SvgIconComponent],
  templateUrl: './learning-sidebar.component.html',
  styleUrls: ['./learning-sidebar.component.scss'],
})
export class LearningSidebarComponent implements OnInit {
  @Input() menu!: boolean;
  @Input() mobileMenu!: boolean;
  @Input() cours!: any;
  @Input() currentLesson: any = null; // ADD THIS - to receive current lesson
  @Output() tabSelected = new EventEmitter<string>();

  showContent = true;
  isFeedbackPage = false;
  showModules: { [key: number]: boolean } = {};
  enrollCours: any;

  isMobileView: boolean = false;
  mobileMenuOpen: boolean = false;

  constructor(
    private coursesEventService: CoursesEventService,
    private coursesService: CoursesService,
    private localStorageService: LocalStorageService,
    private loadingService: LoadingService,
    private certificatesService: CertificatesService,
    private authService: AuthService
  ) {
    this.coursesEventService.isSidebarExpanded$.subscribe(status => {
      if (status != null) {
        this.mobileMenu = !status;
        this.menu = status;
        this.showSideBarContent();
      }
    });

    this.coursesEventService.indexSectionToggle$.subscribe(index => {
      if (index != null) {
        this.toggleSection(index);
      }
    });

    this.coursesEventService.enrollCourse$.subscribe(cours => {
      if (cours != null) {
        this.enrollCours = cours;
        this.sortByPosition(this.enrollCours);
        this.sortQuizzesInSectionsByCreationDate(this.enrollCours.sections);
      }
    });

    this.coursesEventService.quizSubject$.subscribe(status => {
      if (status) {
        setTimeout(() => {
          this.getEnrollCourseDetails();
        }, 200);
      }
    });
  }

  ngOnInit(): void {
    this.sortByPosition(this.cours);
    this.sortQuizzesInSectionsByCreationDate(this.cours);
    this.getEnrollCourseDetails();
    this.mobileMenu = false;

    // Initialize mobile view detection
    this.checkMobileView();
    window.addEventListener('resize', () => this.checkMobileView());
  }

  ngOnDestroy(): void {
    document.body.style.overflow = 'auto';
    window.removeEventListener('resize', () => this.checkMobileView());
  }

  // ADD THIS METHOD - Check if mobile view
  checkMobileView(): void {
    this.isMobileView = window.innerWidth < 1024;

    // Auto-open mobile menu on first visit if no lesson selected
    if (this.isMobileView && !this.currentLesson && !this.mobileMenuOpen) {
      setTimeout(() => {
        this.openMobileMenu();
      }, 500);
    }
  }

  // ADD THIS METHOD - Open mobile menu
  openMobileMenu(): void {
    this.mobileMenuOpen = true;
    document.body.style.overflow = 'hidden';
  }

  // ADD THIS METHOD - Close mobile menu
  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
    document.body.style.overflow = 'auto';
  }

  // ADD THIS METHOD - Calculate course progress
  calculateCourseProgress(): number {
    if (!this.enrollCours?.sections) return 0;

    let totalLessons = 0;
    let completedLessons = 0;

    this.enrollCours.sections.forEach((section: any) => {
      section.lessons.forEach((lesson: any) => {
        totalLessons++;
        if (lesson.status === 2) completedLessons++;
      });
    });

    return totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;
  }

  showSideBarContent() {
    if (this.menu) {
      setTimeout(() => {
        this.showContent = this.menu;
      }, 220);
    } else {
      this.showContent = false;
    }
  }

  getEnrollCourseDetails(): void {
    const enrollCourseId = JSON.parse(localStorage.getItem('enrollCourse') || '{}');
    this.coursesService.getDetailsEnrollCourse(enrollCourseId).subscribe({
      next: (result) => {
        if (result.status) {
          this.enrollCours = result.data;
          const index = this.enrollCours.sections.findLastIndex(
            (section: { status: number }) => section.status === 2
          );
          this.closeAll();

          if (index >= 0) {
            if (this.enrollCours.sections.length - 1 > index) {
              this.showModules[index + 1] = true;
            } else {
              this.showModules[index] = true;
            }
          } else {
            this.showModules[0] = true;
          }

          this.sortByPosition(this.enrollCours);
          this.sortQuizzesInSectionsByCreationDate(this.enrollCours.sections);
        }
      },
      error: (err) => console.error(err)
    });
  }

  toggleSection(index: number): void {
    if (this.canAccessSection(index)) {
      this.loadingService.setMobileSidebarExpanded(true);
      this.changeSections(index);
      this.showModules[index] = !this.showModules[index];
      this.closeAll();
      this.showModules[index] = true;
    } else {
      this.changeSections(0);
    }
  }

  changeSections(index: number) {
    this.isFeedbackPage = false;
    this.coursesEventService.setSectionIndex(index);
    this.tabSelected.emit('course');
  }

  selectLesson(lesson: any, lessonId: string, sectionId: string, sectionIndex: number, lessonIndex: number): void {
    if (this.canAccessLesson(sectionIndex, lessonIndex)) {
      this.loadingService.setMobileSidebarExpanded(true);
      this.coursesEventService.setLesson({ lesson, lessonId, sectionId, sectionIndex, lessonIndex });
      this.tabSelected.emit('course');

      // Close mobile menu after selecting a lesson
      if (this.isMobileView) {
        this.closeMobileMenu();
      }
    }
  }

  goToQuiz(sectionIndex: number): void {
    const section = this.enrollCours.sections[sectionIndex];
    if (this.areAllLessonsComplete(sectionIndex) && section?.quiz?.length) {
      const { passingGrade: passingGrade } = section.quiz[this.enrollCours.sections[sectionIndex].quiz.length - 1].quiz;
      const { id: quizEnrollId, quiz: { id: quizId }, status: status } = section.quiz[this.enrollCours.sections[sectionIndex].quiz.length - 1];

      this.coursesEventService.setQuiz({
        quizEnrollId,
        quizId,
        status,
        passingGrade,
        lastQuiz: this.enrollCours.sections.length - 1 == sectionIndex,
        coursId: this.cours.id
      });

      this.loadingService.setMobileSidebarExpanded(true);
      this.tabSelected.emit('quiz');

      // Close mobile menu when going to quiz
      if (this.isMobileView) {
        this.closeMobileMenu();
      }
    }
  }

  goToFeedback(): void {
    if (this.areAllSectionsComplete()) {
      this.loadingService.setMobileSidebarExpanded(true);
      this.closeAll();
      this.isFeedbackPage = true;
      this.tabSelected.emit('feedback');

      // Close mobile menu when going to feedback
      if (this.isMobileView) {
        this.closeMobileMenu();
      }
    }
  }

  closeAll() {
    for (let key in this.showModules) {
      this.showModules[key] = false;
    }
  }

  canAccessSection(index: number): boolean {
    return index === 0 || this.enrollCours.sections[index - 1]?.status === 2;
  }

  canAccessLesson(sectionIndex: number, lessonIndex: number): boolean {
    return lessonIndex === 0 || this.isLessonComplete(sectionIndex, lessonIndex - 1);
  }

  isLessonComplete(sectionIndex: number, lessonIndex: number): boolean {
    return this.enrollCours.sections[sectionIndex]?.lessons[lessonIndex]?.status === 2;
  }

  isLessonStarted(sectionIndex: number, lessonIndex: number): boolean {
    return this.enrollCours.sections[sectionIndex]?.lessons[lessonIndex]?.status === 1;
  }

  isQuizStarted(sectionIndex: number) {
    return this.enrollCours?.sections[sectionIndex].quiz[this.enrollCours.sections[sectionIndex].quiz.length - 1].status == 1;
  }

  isQuizComlete(sectionIndex: number) {
    return this.enrollCours?.sections[sectionIndex].quiz[this.enrollCours.sections[sectionIndex].quiz.length - 1].status == 2;
  }

  hasQuizWithStatusTwo(sections: Array<{ quiz: { status: number } }>): boolean {
    return sections.some(section => section.quiz?.status === 1);
  }

  areAllLessonsComplete(sectionIndex: number): boolean {
    return this.enrollCours.sections[sectionIndex]?.lessons.every((lesson: any) => lesson.status === 2);
  }

  areAllSectionsComplete(): boolean {
    return this.enrollCours.sections.every((section: any) => section.status === 2);
  }

  lessonStatusClass(sectionIndex: number, lessonIndex: number): string {
    const lessons = this.enrollCours.sections[sectionIndex]?.lessons;
    if (!lessons) return '';

    const isFirstLesson = lessonIndex === 0;
    const firstLessonStatusIsTwo = lessons[0]?.status === 2;
    if (isFirstLesson || firstLessonStatusIsTwo) {
      return 'text-[#23BAC4] border-[#23BAC4]';
    }
    return 'text-[#81ced3] border-[#81ced3]';
  }

  sortByPosition(course: any) {
    course.sections.sort((a: { position: number }, b: { position: number }) => a.position - b.position);
    course.sections.forEach((section: { lessons: { position: number }[] }) => {
      section.lessons.sort((a, b) => a.position - b.position);
    });
  }

  sortQuizzesInSectionsByCreationDate(sections: any[]): any[] {
    if (!Array.isArray(sections)) {
      return [];
    }
    return sections?.map(section => ({
      ...section,
      quiz: section.quiz.sort((a: { createdAt: string | number | Date; }, b: { createdAt: string | number | Date; }) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    }));
  }

  /*getCertifcate() {
    this.certificatesService.getMyCertificate(this.cours.id).subscribe({
      next: (result) => {
        if (result.status) {
          const certificateUrl = `${environment.url}${result.data.link}`;
          window.open(certificateUrl, '_blank');
        }
      },
      error: (err) => console.error(err)
    });
  }*/


    async getCertifcate() {
  try {
    // Show loading state
    //this.loadingService.setLoading(true);
    
    // Get current user info
    const user = this.authService.getUser();
    const userName = user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.email || 'Utilisateur';

    // Get course name
    const courseName = this.cours?.title || 'Formation';

    // Format date
    const today = new Date();
    const formattedDate = today.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).replace(/^0/, '');

    // Prepare HTML with dynamic data
    const htmlContent = `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Attestation de Participation</title>
          <style>
            @page { size: A4 landscape; margin: 0; }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            html, body { width: 100%; height: 100%; margin: 0; padding: 0; font-family: 'Inter', 'Segoe UI', Arial, sans-serif; }
            .certificate-container { width: 100%; height: 100%; padding: 15mm; background: linear-gradient(135deg, #e8f5f5 0%, #f0f9f9 100%); display: flex; align-items: center; justify-content: center; }
            .certificate { position: relative; width: 100%; height: 100%; background: #ffffff; overflow: hidden; border: 4px solid #1aa3a3; box-shadow: 0 8px 32px rgba(26, 163, 163, 0.2), 0 0 0 1px rgba(26, 163, 163, 0.1) inset; border-radius: 4px; }
            .left-panel { position: absolute; top: 0; left: 0; bottom: 0; width: 70mm; display: flex; align-items: center; justify-content: center; background: linear-gradient(165deg, #1aa3a3 0%, #148f8f 45%, #0d7a7a 100%); overflow: hidden; }
            .left-panel::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.25), transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(255,255,255,0.15), transparent 55%), radial-gradient(circle at 50% 50%, rgba(255,255,255,0.08), transparent 70%); }
            .decorative-circles { position: absolute; inset: 0; z-index: 1; }
            .decorative-circles::before { content: ''; position: absolute; width: 200px; height: 200px; border-radius: 50%; border: 3px solid rgba(255,255,255,0.2); top: -70px; left: -70px; }
            .decorative-circles::after { content: ''; position: absolute; width: 160px; height: 160px; border-radius: 50%; border: 3px solid rgba(255,255,255,0.15); bottom: -50px; right: -50px; }
            .extra-circle-1 { position: absolute; width: 120px; height: 120px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.12); top: 30%; left: -40px; z-index: 1; }
            .extra-circle-2 { position: absolute; width: 90px; height: 90px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.1); top: 50%; right: -30px; z-index: 1; }
            .extra-circle-3 { position: absolute; width: 140px; height: 140px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.08); bottom: 20%; left: 50%; transform: translateX(-50%); z-index: 1; }
            .vertical-text { position: relative; transform: rotate(-90deg); font-size: 24pt; color: #ffffff; font-weight: 800; text-align: center; z-index: 2; text-transform: uppercase; text-shadow: 0 3px 12px rgba(0,0,0,0.2); white-space: nowrap; }
            .right-panel { position: absolute; top: 0; left: 70mm; right: 0; bottom: 0; padding: 25mm 40mm 20mm 40mm; background: #ffffff; overflow: hidden; }
            .right-panel::before { content: ''; position: absolute; width: 300px; height: 300px; border-radius: 50%; background: radial-gradient(circle, rgba(26, 163, 163, 0.03), transparent 70%); top: -100px; right: -100px; z-index: 0; }
            .right-panel::after { content: ''; position: absolute; width: 250px; height: 250px; border-radius: 50%; background: radial-gradient(circle, rgba(26, 163, 163, 0.02), transparent 70%); bottom: -80px; left: 30%; z-index: 0; }
            .right-panel > * { position: relative; z-index: 1; }
            .corner-ornament-top { position: absolute; top: 15mm; right: 15mm; width: 40px; height: 40px; border-top: 3px solid rgba(26, 163, 163, 0.2); border-right: 3px solid rgba(26, 163, 163, 0.2); z-index: 0; }
            .corner-ornament-bottom { position: absolute; bottom: 15mm; left: 15mm; width: 40px; height: 40px; border-bottom: 3px solid rgba(26, 163, 163, 0.2); border-left: 3px solid rgba(26, 163, 163, 0.2); z-index: 0; }
            .header-accent { width: 80px; height: 5px; background: linear-gradient(90deg, #1aa3a3, #148f8f, #0d7a7a); margin-bottom: 6mm; border-radius: 3px; box-shadow: 0 2px 8px rgba(26, 163, 163, 0.3); }
            .title { font-size: 15pt; font-weight: 400; color: #555; margin-bottom: 12mm; letter-spacing: 1px; text-transform: uppercase; }
            .section { margin-bottom: 14mm; }
            .label { font-size: 10pt; color: #1aa3a3; margin-bottom: 3mm; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; }
            .value { font-size: 22pt; font-weight: 700; color: #222; line-height: 1.3; }
            .value.course { font-size: 19pt; font-weight: 600; color: #1aa3a3; }
            .underline { width: 100%; height: 2px; background: linear-gradient(90deg, #1aa3a3 0%, rgba(26, 163, 163, 0.3) 50%, transparent 100%); margin-top: 5mm; }
            .footer { position: absolute; bottom: 20mm; left: 40mm; right: 40mm; display: flex; justify-content: space-between; align-items: flex-end; padding-top: 10mm; border-top: 2px solid #e8f5f5; }
            .date-block .label { font-size: 9pt; margin-bottom: 2mm; }
            .date-block .value { font-size: 14pt; font-weight: 600; }
            .logo { text-align: right; }
            .logo img { height: 100px; opacity: 0.95; filter: drop-shadow(0 2px 8px rgba(26, 163, 163, 0.15)); }
            .seal { position: absolute; bottom: 65mm; right: 35mm; width: 85px; height: 85px; border-radius: 50%; border: 4px double #1aa3a3; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle, #ffffff, #f0fafa); opacity: 0.5; box-shadow: 0 4px 16px rgba(26, 163, 163, 0.2); }
            .seal::before { content: ''; width: 60%; height: 60%; border-radius: 50%; border: 2px solid #1aa3a3; opacity: 0.4; }
            .dots-pattern { position: absolute; top: 20mm; right: 20mm; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; opacity: 0.15; z-index: 0; }
            .dots-pattern span { width: 4px; height: 4px; background: #1aa3a3; border-radius: 50%; }
          </style>
        </head>
        <body>
          <div class="certificate-container">
            <div class="certificate">
              <div class="left-panel">
                <div class="decorative-circles"></div>
                <div class="extra-circle-1"></div>
                <div class="extra-circle-2"></div>
                <div class="extra-circle-3"></div>
                <div class="vertical-text">Attestation de Participation</div>
              </div>
              <div class="right-panel">
                <div class="corner-ornament-top"></div>
                <div class="corner-ornament-bottom"></div>
                <div class="dots-pattern">
                  <span></span><span></span><span></span>
                  <span></span><span></span><span></span>
                  <span></span><span></span><span></span>
                </div>
                <div class="header-accent"></div>
                <div class="title">Galiocare certifie que</div>
                <div class="section">
                  <div class="value">${userName}</div>
                  <div class="underline"></div>
                </div>
                <div class="section">
                  <div class="label">A complété avec succès la formation</div>
                  <div class="value course">${courseName}</div>
                  <div class="underline"></div>
                </div>
                <div class="seal"></div>
                <div class="footer">
                  <div class="date-block">
                    <div class="label">Délivré le</div>
                    <div class="value">${formattedDate}</div>
                  </div>
                  <div class="logo">
                    <img src="https://galiocare.com/assets/images/logo.png" alt="Galiocare Logo">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>`;

    // Call apdf.io API
    const response = await fetch('https://apdf.io/api/pdf/file/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer D7888x8HgO4iHkwt29SkAPohnc9HC0AzwySEbYA3031f96a7' // Replace with your actual token
      },
      body: JSON.stringify({
        html: htmlContent,
        options: {
          format: 'A4',
          landscape: true,
          margin: '0mm',
          printBackground: true,
          preferCSSPageSize: true
        }
      })
    });

    const data = await response.json();

    // Hide loading state
    //this.loadingService.setLoading(false);

    if (data && data.url) {
      // Open PDF in new tab
      window.open(data.url, '_blank');
    } else if (data && data.file) {
      window.open(data.file, '_blank');
    } else {
      console.error('Unexpected API response:', data);
      // Fallback to old method if needed
      this.fallbackGetCertificate();
    }

  } catch (error) {
    console.error('Error generating certificate:', error);
    //this.loadingService.setLoading(false);

    // Fallback to old method on error
    this.fallbackGetCertificate();
  }
}

// Add fallback method
private fallbackGetCertificate() {
  this.certificatesService.getMyCertificate(this.cours.id).subscribe({
    next: (result) => {
     // this.loadingService.setLoading(false);
      if (result.status) {
        const certificateUrl = `${environment.url}${result.data.link}`;
        window.open(certificateUrl, '_blank');
      }
    },
    error: (err) => {
      console.error(err);
      //this.loadingService.setLoading(false);
      alert('Erreur lors de la génération du certificat');
    }
  });
}

}

