import { NextFunction, Request, Response } from "express"
import { Equal } from "typeorm"
import {
  countEnrollQuiz,
  createEnrollQuiz,
  findEnrollCourse, findEnrollQuiz, findEnrollSection, saveEnrollCourse, saveEnrollQuiz
} from "@/services/enroll-course.service"
import { findUser } from "@/services/user.service"
import { createResponseQuestion, getRandomQuestionFromQuiz } from "@/services/question.service"
import { getPercentage } from "@/utils/common"


export const regenerateQuestionEnrollCourse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.jwtPayload;
    const enrollCourseId = req.params.id;
    const { quizEnrollId, quizId } = req.body;

    const User = await findUser({ id: Equal(id), status: 1 });
    if(!User) return res.customSuccess(200, 'Error', {}, false);

    const enrollCourse = await findEnrollCourse({ id: Equal(enrollCourseId), user: { id: Equal(id), status: 1 }})
    if(!enrollCourse) return res.customSuccess(200, 'Error', {}, false);

    const enrollQuiz = await findEnrollQuiz({ id: Equal(quizEnrollId), quiz: { id: quizId } }, ['section', 'quiz', 'questions'])
    if(!enrollQuiz || enrollQuiz.status == 2) return res.customSuccess(200, 'Error', {}, false);

    const enrollSection = await findEnrollSection({
      id: Equal(enrollQuiz.section.id), status: 1
    })
    if(!enrollSection) return res.customSuccess(200, 'Error', {}, false);

    const questions = await getRandomQuestionFromQuiz(enrollQuiz.quiz.id)

    enrollQuiz.status = 2
    enrollCourse.quizNumber = enrollCourse.quizNumber + 1
    await saveEnrollCourse(enrollCourse)
    const newEnrollQuiz = await createEnrollQuiz({ section: enrollSection, quiz: enrollQuiz.quiz, status: 1 })

    let allMaxPoints = 0
    await Promise.all(
      questions.map(async (question) => {
        allMaxPoints = allMaxPoints + question.points
        await createResponseQuestion({ question: question, quiz: newEnrollQuiz})
      })
    )

    const nbrQuizTried = await countEnrollQuiz({ section : { id: Equal(enrollSection.id) }})

    let maxPointToEarned = 0

    if(nbrQuizTried == 1 ) maxPointToEarned = getPercentage(allMaxPoints, 100);
    else if(nbrQuizTried == 2 ) maxPointToEarned = getPercentage(allMaxPoints, 80);
    else if(nbrQuizTried == 3 ) maxPointToEarned = getPercentage(allMaxPoints, 60);
    else maxPointToEarned = getPercentage(allMaxPoints, 50);

    newEnrollQuiz.totalPoints = maxPointToEarned

    await saveEnrollQuiz(newEnrollQuiz)

    return res.customSuccess(200, 'list of questions.', { newEnrollQuiz, questions }, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};