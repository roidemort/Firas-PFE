import { NextFunction, Request, Response } from "express"
import { Equal } from "typeorm"
import {
  findEnrollCourse, findEnrollQuiz
} from "@/services/enroll-course.service"
import { findUser } from "@/services/user.service"


export const answerQuestionEnrollCourseDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.jwtPayload;
    const enrollCourseId = req.params.id;
    const { quizEnrollId, quizId } = req.body;

    const User = await findUser({ id: Equal(id), status: 1 });
    if(!User) return res.customSuccess(200, 'Error1', {}, false);

    const enrollCourse = await findEnrollCourse({ id: Equal(enrollCourseId), user: { id: Equal(id), status: 1 }})
    if(!enrollCourse) return res.customSuccess(200, 'Error', {}, false);

    const enrollQuiz = await findEnrollQuiz({ id: Equal(quizEnrollId), quiz: { id: quizId }} , ['questions', 'questions.question'])
    if(!enrollQuiz) return res.customSuccess(200, 'Error', {}, false);

    return res.customSuccess(200, 'response question details.', enrollQuiz, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};