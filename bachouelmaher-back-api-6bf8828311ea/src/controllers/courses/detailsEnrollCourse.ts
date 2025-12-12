import { NextFunction, Request, Response } from "express"
import { findCourse } from "@/services/course.service"
import { Equal, Like } from "typeorm"
import { getPaidSubscription } from "@/services/subscription.service"
import {
  createEnrollCourse, createEnrollLesson,
  createEnrollQuiz,
  createEnrollSection,
  findEnrollCourse, findEnrollCourseById, saveEnrollCourse
} from "@/services/enroll-course.service"
import { findUser } from "@/services/user.service"


export const detailsEnrollCourse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.jwtPayload;
    const enrollCourseId = req.params.id;

    const User = await findUser({ id: Equal(id), status: 1 });
    if(!User) return res.customSuccess(200, 'Error', {}, false);

    const enrollCourse = await findEnrollCourse({ id: Equal(enrollCourseId), user: { id: Equal(id) }}, ['sections', 'sections.section', 'sections.lessons', 'sections.lessons.lesson', 'sections.quiz.quiz'])
    if(!enrollCourse) return res.customSuccess(200, 'Error', {}, false);

    return res.customSuccess(200, 'Enroll of courses.', enrollCourse, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};