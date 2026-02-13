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
  constructor(private certificatesService: CertificatesService, private route: ActivatedRoute, private coursesService: CoursesService, private quizService: QuizService, private coursesEventService: CoursesEventService){
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

  getCertifcate() {
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
  }

}
