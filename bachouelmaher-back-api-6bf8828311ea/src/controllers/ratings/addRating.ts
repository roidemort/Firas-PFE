import { NextFunction, Request, Response } from "express"
import { findCourse } from "@/services/course.service"
import { findUser } from "@/services/user.service"
import { createRating, findRating } from "@/services/rating.service"
import { Equal } from "typeorm"

export const addRating = async (req: Request, res: Response, next: NextFunction) => {
  const { courseId, rating, comment } = req.body;
  const { id } = req.jwtPayload;
  try {
    const Course = await findCourse({ id: Equal(courseId), status: 1 })
    const User = await findUser({ id: Equal(id), status: 1 });

    if(!Course || !User) return res.customSuccess(200, 'Error', {}, false);

    const exist = await findRating({ user: { id : Equal(id)}, course: { id : Equal(courseId)}})
    if(exist) return res.customSuccess(200, 'Error', {}, false);

    //TODO verify user are complete the course

    const Rating = await createRating({ user: User, course: Course, rating, comment })

    return res.customSuccess(200, 'Rating successfully created.', { rating: Rating }, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};