import { NextFunction, Request, Response } from "express"
import { findCourse } from "@/services/course.service"
import { Equal, Like } from "typeorm"
import { getPaidSubscription } from "@/services/subscription.service"
import {
  countEnrollQuiz,
  createEnrollCourse, createEnrollLesson,
  createEnrollQuiz,
  createEnrollSection,
  findEnrollCourse, findEnrollCourseById, findEnrollQuiz, findEnrollSection, saveEnrollCourse, saveEnrollQuiz
} from "@/services/enroll-course.service"
import { findUser } from "@/services/user.service"
import { createResponseQuestion, getRandomQuestionFromQuiz } from "@/services/question.service"
import { getPercentage } from "@/utils/common"


export const questionEnrollCourse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.jwtPayload;
    const enrollCourseId = req.params.id;
    const { quizEnrollId, quizId } = req.body;

    const User = await findUser({ id: Equal(id), status: 1 });
    if(!User) return res.customSuccess(200, 'Error', {}, false);

    const enrollCourse = await findEnrollCourse({ id: Equal(enrollCourseId), user: { id: Equal(id), status: 1 }})
    if(!enrollCourse) return res.customSuccess(200, 'Error', {}, false);

    const enrollQuiz = await findEnrollQuiz({ id: Equal(quizEnrollId), quiz: { id: quizId } }, ['section', 'quiz', 'questions'])
    if(!enrollQuiz || enrollQuiz.status != 0) return res.customSuccess(200, 'Error', {}, false);

    const enrollSection = await findEnrollSection({
      id: Equal(enrollQuiz.section.id), status: 1
    })
    if(!enrollSection) return res.customSuccess(200, 'Error', {}, false);

    const questions = await getRandomQuestionFromQuiz(enrollQuiz.quiz.id)

    enrollQuiz.status = 1

    let allMaxPoints = 0
    await Promise.all(
      questions.map(async (question) => {
        const responseQuestion = await createResponseQuestion({ question: question, quiz: enrollQuiz})
        enrollQuiz.questions.push(responseQuestion)
        allMaxPoints = allMaxPoints + question.points
      })
    )
    const nbrQuizTried = await countEnrollQuiz({ section : { id: Equal(enrollSection.id) }})

    let maxPointToEarned = 0

    if(nbrQuizTried == 1 ) maxPointToEarned = getPercentage(allMaxPoints, 100);
    else if(nbrQuizTried == 2 ) maxPointToEarned = getPercentage(allMaxPoints, 80);
    else if(nbrQuizTried == 3 ) maxPointToEarned = getPercentage(allMaxPoints, 60);
    else maxPointToEarned = getPercentage(allMaxPoints, 50);

    enrollQuiz.totalPoints = maxPointToEarned

    await saveEnrollQuiz(enrollQuiz)

    return res.customSuccess(200, 'list of questions.', questions, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};