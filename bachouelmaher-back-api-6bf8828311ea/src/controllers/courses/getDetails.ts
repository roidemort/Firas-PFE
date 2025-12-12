import { NextFunction, Request, Response } from 'express';
import { findCourse } from "@/services/course.service"
import { Equal, Like } from "typeorm"

export const getDetails = async (req: Request, res: Response, next: NextFunction) => {
  const courseId = req.params.id;
  const { role } = req.jwtPayload

  try {
    const course = await findCourse({ id: Equal(courseId), status: 1, roles: Like(`%${role}%`) }, ['category','preview','provider','provider.logo','sections','trainers','trainers.image','requirements','faqs','includes','objectives','sections.quiz','sections.lessons'])
    if (!course) {
      return  res.customSuccess(200, 'Error', {}, false);
    }
    return res.customSuccess( 200, 'Details of course.', course, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
