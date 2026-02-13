import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SvgIconComponent } from 'angular-svg-icon';
import { CoursesEventService } from 'src/app/core/services/courses-event.service';
import { CoursesService } from 'src/app/core/services/courses.service';
import { QuizService } from 'src/app/core/services/quiz.service';
import { MainLoaderComponent } from "../loader/loader.component";
import { CertificatesService } from 'src/app/core/services/certificates.service';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/core/services/auth.service';

interface Question {
  id: string;
  text: string;
  type: string;
  topic: string;
  a: string;
  b: string;
  c: string;
  d: string;
  details: string | null;
}
@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, SvgIconComponent, MainLoaderComponent],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.scss'
})

export class QuizComponent {
  currentQuestionIndex = 0;
  selectedAnswerNumber = 0;
  userSelections: number[] = []; // To store user selections
  selectedAnswerIndex: number | null = null; // To track the selected answer for the current question
  incorrectAnswers: Question[] = [];
  quizStarted = false
  cours: any
  coursId: any
  quiz: any
  currentQuiz: any
  enrollCourseId: any
  questions: any
  quizData: any
  resulQuiz: any
  allQuestions: any[] = [];
  correctAnswersCount: any
  percentageCorrect: any
  showResult = false
  passed = false
  selectedAnswer: string | null = null;
  currentQuestionId: string | null = null;
  selectedAnswers: string = '';
  selectedAnswerIndexes: Set<number> = new Set();
  isLoading = true
  constructor(private certificatesService: CertificatesService, private route: ActivatedRoute, private coursesService: CoursesService, private quizService: QuizService, private coursesEventService: CoursesEventService,private authService: AuthService ){
    this.coursesEventService.currentQuiz$.subscribe(quiz => {
      if(quiz != null){
        this.currentQuiz = quiz
       // console.log(this.currentQuiz)
      }
    })
  }

  ngOnInit(){
    this.isLoading = false
    this.enrollCourseId = JSON.parse(localStorage.getItem('enrollCourse') || '{}');
  }

  startQuiz() {
    this.coursesEventService.setQuizStatus(true);
    this.quizStarted = true;
    this.quizData = {
      quizEnrollId: this.currentQuiz.quizEnrollId,
      quizId: this.currentQuiz.quizId,
    };

    if (this.currentQuiz.status === 0) {
      this.startNewQuiz();
    } else {
      this.regenerateQuiz();
    }
  }

  startNewQuiz() {
    this.coursesService.questionEnrollCourse(this.enrollCourseId, this.quizData).subscribe({
      next: (result: any) => {
        if (result.status) {
          this.handleNewQuizResponse(result);
        }
      },
      error: (error: any) => console.error(error),
    });
  }


  regenerateQuiz() {
    this.coursesService.regenerateQuestionEnrollCourse(this.enrollCourseId, this.quizData).subscribe({
      next: (result: any) => {
        if (result.status) {
          this.handleRegeneratedQuizResponse(result);
        }
      },
      error: (error: any) => console.error(error),
    });
  }


  handleNewQuizResponse(result: any) {
    this.questions = result.data.map((question: any) => {
        const options: any = {};
        if (question.a) options.a = question.a;
        if (question.b) options.b = question.b;
        if (question.c) options.c = question.c;
        if (question.d) options.d = question.d;

        return {
            id: question.id,
            text: question.text,
            type: question.type,
            topic: question.topic,
            options: options,
            details: question.details,
            image: question.image // <--- ADD THIS LINE
        };
    });
}


  handleRegeneratedQuizResponse(result: any) {
    if (result.data.newEnrollQuiz) {
        this.currentQuiz.quizEnrollId = result.data.newEnrollQuiz.id;
        this.quizData.quizEnrollId = result.data.newEnrollQuiz.id;
    }

    this.questions = result.data.questions.map((question: any) => {
        const options: any = {};
        if (question.a) options.a = question.a;
        if (question.b) options.b = question.b;
        if (question.c) options.c = question.c;
        if (question.d) options.d = question.d;

        return {
            id: question.id,
            text: question.text,
            type: question.type,
            topic: question.topic,
            options: options,
            details: question.details,
            image: question.image // <--- ADD THIS LINE
        };
    });
}

  getOptions(index: number): string[] {
    const question = this.questions[index].options;
    return question ? [question.a, question.b, question.c, question.d] : [];
  }

  getOptionKey(index: number): string {
    const keys = ['a', 'b', 'c', 'd'];
    return keys[index] || '';
  }

  selectAnswer(index: number, optionKey: string, questionId: string): void {
    const questionType = this.questions[this.currentQuestionIndex]?.type;
    this.selectedAnswerIndex = index
    this.currentQuestionId = questionId
    if (questionType === 'CU' || questionType === 'VF') {
      this.selectedAnswers = questionType === 'VF' ? (index === 0 ? 'true' : 'false') : optionKey;
      this.selectedAnswerIndexes.clear();
      this.selectedAnswerIndexes.add(index);
    } else if (questionType === 'CM') {
      if (this.selectedAnswerIndexes.has(index)) {
        this.selectedAnswerIndexes.delete(index);
        this.selectedAnswers = Array.from(this.selectedAnswerIndexes).map(i => this.indexToChar(i).toLowerCase()).join(',');
      } else if (this.selectedAnswerIndexes.size < 4) { // Limit to 2 choices
        this.selectedAnswerIndexes.add(index);
        this.selectedAnswers = Array.from(this.selectedAnswerIndexes).map(i => this.indexToChar(i).toLowerCase()).join(',');
      }
    }
  }

  //  selectAnswer(index: number, optionKey: string, questionId: string): void {
  //   this.selectedAnswerIndex = index;
  //   this.selectedAnswer = optionKey
  //   this.currentQuestionId = questionId
  // }

  nextQuestion(): void {
    this.isLoading = true
    if (this.selectedAnswerIndex !== null && this.selectedAnswers) {
      this.allQuestions.push(this.currentQuestionId)
      this.selectedAnswerNumber = this.selectedAnswerNumber + 1
      const data = {
        quizEnrollId: this.currentQuiz.quizEnrollId,
        quizId: this.currentQuiz.quizId,
        questionId: this.currentQuestionId,
        answer: this.formatSelectedAnswers(this.selectedAnswers),
        questionNumber : this.selectedAnswerNumber
      }
      // console.log(data)
      this.coursesService.answerQuestionEnrollCourse(this.enrollCourseId, data).subscribe({
        next: (result) => {
          if(result.status){
            if (this.currentQuestionIndex < this.questions.length - 1) {
              this.currentQuestionIndex++;
              this.selectedAnswerIndex = null
              this.selectedAnswers = '';
              this.selectedAnswerIndexes.clear();
            } else {
              this.currentQuestionIndex = this.questions.length;
              this.getResultQuiz();
            }
            this.isLoading = false
          }
        },
        error: (error) => console.error(error),
      });
    }
  }

  formatSelectedAnswers(selectedAnswers: string): string {
    if (selectedAnswers.includes(',')) {
      return selectedAnswers
        .split(',')
        .map(answer => answer.trim())
        .sort((a, b) => a.localeCompare(b))
        .join(',');
    }
    return selectedAnswers;
  }

  restartQuiz(): void {
    this.selectedAnswerNumber = 0
    this.currentQuestionIndex = 0;
    this.questions = []
    this.quizStarted = false
    this.resulQuiz = null
    this.allQuestions = []
    this.selectedAnswerIndex = null
    this.correctAnswersCount = null
    this.percentageCorrect = null
    this.showResult = false
    this.currentQuestionId = null
    this.selectedAnswers = '';
    this.selectedAnswerIndexes.clear();
  }

  getResultQuiz() {
    this.coursesService.answerQuestionEnrollCourseDetails(this.enrollCourseId, this.quizData).subscribe({
      next: (result) => {
        if (result.status) {
          this.coursesEventService.setQuizStatus(true)
          // console.log('result quiz',result)
          this.resulQuiz = result.data.questions.filter((question: any) => {
            return this.allQuestions.includes(question.question.id);
          });
          // const totalScore = result.data.questions.reduce((sum: any, question: { score: any; }) => sum + question.score, 0);
          this.passed = result.data.score >= this.currentQuiz.passingGrade
          const correctAnswersCount = this.resulQuiz.filter((question: any) => question.isCorrect).length;
          const percentageCorrect = (correctAnswersCount / this.resulQuiz.length) * 100;
          this.correctAnswersCount = correctAnswersCount;
          this.percentageCorrect = percentageCorrect;
          this.currentQuiz.status = 1
          this.showResult = true
        }
      },
      error: (error) => console.error(error),
    });
  }

  indexToChar(index: number): string {
    return String.fromCharCode(65 + index);
  }

  isSelected(index: number): boolean {
    const questionType = this.questions[this.currentQuestionIndex]?.type;
    if (questionType === 'CM') {
      return this.selectedAnswerIndexes.has(index);
    } else if (questionType === 'CU' || questionType === 'VF') {
      return this.selectedAnswers === (questionType === 'VF' ? index === 0 ? 'true' : 'false' : this.indexToChar(index).toLowerCase());
    }
    return false;
  }

  canProceed(): boolean {
    const questionType = this.questions[this.currentQuestionIndex]?.type;
    if (questionType === 'CM') {
      return this.selectedAnswerIndexes.size > 1; // At least one answer selected
    }
    return this.selectedAnswers !== ''; // Only one answer for CU or VF
  }

  /*getCertifcate() {
    this.certificatesService.getMyCertificate(this.currentQuiz.coursId).subscribe({
      next: (result) => {
        if (result.status) {
          const certificateUrl = `${environment.url}${result.data.link}`;
          // console.log('Certificate URL:', certificateUrl);
          window.open(certificateUrl, '_blank');
        }
      },
      error: (err) => console.error(err)
    });
  }*/


    async getCertifcate() {
  try {
    // Get current user info
    const user = this.authService.getUser();
    const userName = `${user.firstName} ${user.lastName}`;

    // Get course name
    const courseName = this.currentQuiz?.courseName || this.cours?.title || 'Formation';

    // Format date
    const today = new Date();
    const formattedDate = today.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).replace(/^0/, ''); // Remove leading zero

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

    // Show loading state
    this.isLoading = true;

    // Call apdf.io API
    const response = await fetch('https://apdf.io/api/pdf/file/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer D7888x8HgO4iHkwt29SkAPohnc9HC0AzwySEbYA3031f96a7' // You need to add your apdf.io API token
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

    if (data && data.url) {
      // Open PDF in new tab
      window.open(data.url, '_blank');
    } else if (data && data.file) {
      // If API returns base64 or file URL
      window.open(data.file, '_blank');
    }

    this.isLoading = false;

  } catch (error) {
    console.error('Error generating certificate:', error);
    this.isLoading = false;
    // Show error message to user
    alert('Erreur lors de la génération du certificat. Veuillez réessayer.');
  }
}

}
