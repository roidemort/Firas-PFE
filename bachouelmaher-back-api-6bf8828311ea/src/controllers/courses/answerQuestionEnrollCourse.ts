import { NextFunction, Request, Response } from "express"
import { Equal, Not } from "typeorm"
import {
  countEnrollQuiz,
  countEnrollSections,
  findEnrollCourse,
  findEnrollQuiz,
  findEnrollQuizs,
  findEnrollSection,
  saveEnrollCourse,
  saveEnrollQuiz,
  saveEnrollSection
} from "@/services/enroll-course.service"
import { findUser } from "@/services/user.service"
import { findQuestion, findQuestionResponse, saveResponseQuestion } from "@/services/question.service"
import { QUESTION_QUIZ } from "@/core/config"
import { createNotification } from "@/services/notification.service"
import { generateCertificate } from "@/utils/generateCertificate"


export const answerQuestionEnrollCourse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.jwtPayload;
    const enrollCourseId = req.params.id;
    const { quizEnrollId, quizId, questionId, answer, questionNumber } = req.body;

    const User = await findUser({ id: Equal(id), status: 1 });
    if(!User) return res.customSuccess(200, 'Error', {}, false);

    const enrollCourse = await findEnrollCourse({ id: Equal(enrollCourseId), user: { id: Equal(id) }}, ['course', 'course.sections'])
    if(!enrollCourse) return res.customSuccess(200, 'Error', {}, false);

    const enrollQuiz = await findEnrollQuiz({ id: Equal(quizEnrollId), quiz: { id: quizId } }, ['section', 'quiz'])
    if(!enrollQuiz) return res.customSuccess(200, 'Error', {}, false);

    const enrollSection = await findEnrollSection({
      id: Equal(enrollQuiz.section.id)
    })
    if(!enrollSection) return res.customSuccess(200, 'Error', {}, false);

    const question = await findQuestion({ id: questionId , status: 1 })
    if(!question) return res.customSuccess(200, 'Error', {}, false);

    const questionResponse = await findQuestionResponse({ question : { id: questionId }, quiz : { id: quizEnrollId }, status: 0 })
    if(!questionResponse) return res.customSuccess(200, 'Error', {}, false);

    questionResponse.response = answer;
    questionResponse.status = 1;
    questionResponse.updatedAt = new Date();
    let newScore = 0
    let newIsCorrect = false
    if(answer == question.answer) {
      newScore = question.points
      newIsCorrect = true
    }
    questionResponse.score = newScore
    questionResponse.isCorrect = newIsCorrect

    if (newIsCorrect) enrollQuiz.nbrQuestionsCorrect++;
    enrollQuiz.score = enrollQuiz.score + newScore

    await saveResponseQuestion(questionResponse)
    await saveEnrollQuiz(enrollQuiz)
    if(questionNumber == QUESTION_QUIZ) {
      if(enrollQuiz.quiz.passingGrade <= enrollQuiz.score) {
        enrollQuiz.status = 2
        enrollQuiz.successful = true
        enrollQuiz.earnedPoints = enrollQuiz.nbrQuestionsCorrect * (enrollQuiz.totalPoints / QUESTION_QUIZ)
        enrollQuiz.updatedAt = new Date();
        enrollSection.status = 2
        enrollSection.updatedAt = new Date();
      }
      await saveEnrollQuiz(enrollQuiz)
      await saveEnrollSection(enrollSection)
      const countSectionNotComplete = await countEnrollSections({
        course: { id :Equal(enrollCourse.id)}, status: Not(2)
      })
      if(countSectionNotComplete == 0) {
        enrollCourse.endedAt = new Date();
        enrollCourse.status = 2;

        const allQuiz = await findEnrollQuizs({section : { course : { id: Equal(enrollCourse.id) }}, successful: true})

        const allNbrQuestionCorrect = allQuiz.map(item => item.nbrQuestionsCorrect).reduce((prev, next) => prev + next);

        enrollCourse.points = allQuiz.map(item => item.earnedPoints).reduce((prev, next) => prev + next);
        enrollCourse.quizPoints = (allNbrQuestionCorrect / (QUESTION_QUIZ * enrollCourse.course.sections.length)) * 100

        await createNotification({
          type: 'notification',
          receiver: User,
          title: `Formation terminée ${enrollCourse.course.title}`,
          content: `Félicitations, vous l'avez terminé la formation ${enrollCourse.course.title}`,
          status: 1,
        })
      }
    }
    await saveEnrollCourse(enrollCourse)
    if(questionNumber == QUESTION_QUIZ) {
      await generateCertificate(id, enrollCourse.course.id)
    }
    return res.customSuccess(200, 'response question.', true, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};