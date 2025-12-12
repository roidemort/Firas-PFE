import { NextFunction, Request, Response } from "express"
import { Equal } from "typeorm"
import {
  findEnrollCourse,
  findEnrollLesson,
  findEnrollSection,
  saveEnrollLesson,
  saveEnrollSection
} from "@/services/enroll-course.service"
import { findUser } from "@/services/user.service"

export const updateEnrollCourse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.jwtPayload;
    const enrollCourseId = req.params.id;
    const { pause, startedAt, endedAt, position, sectionId, lessonId } = req.body;

    const User = await findUser({ id: Equal(id), status: 1 });
    if(!User) return res.customSuccess(200, 'user not found', {}, false);

    const enrollCourse = await findEnrollCourse({ id: Equal(enrollCourseId), user: { id: Equal(id), status: 1 }})
    if(!enrollCourse) return res.customSuccess(200, 'course not found', {}, false);

    const currentDate = new Date()
    if(startedAt && sectionId && lessonId) {
      const enrollLesson = await findEnrollLesson({
        lesson: { id: Equal(lessonId)},
        section: { course: { id: Equal(enrollCourse.id)} }
      })
      if(!enrollLesson) return res.customSuccess(200, 'error in lecon', {}, false);
      enrollLesson.startedAt = currentDate;
      const enrollSection = await findEnrollSection({
        section: { id: Equal(sectionId)},
        course: { id: Equal(enrollCourse.id)},
      })
      enrollLesson.status = 1;
      enrollSection.status = 1;
      enrollSection.startedAt = currentDate;
      await saveEnrollLesson(enrollLesson)
      await saveEnrollSection(enrollSection)
    }
    if(endedAt && sectionId && lessonId) {
      const enrollLesson = await findEnrollLesson({
        lesson: { id: Equal(lessonId)},
        section: { course: { id: Equal(enrollCourse.id)} }
      })
      if(!enrollLesson) return res.customSuccess(200, 'Error x', {}, false);
      enrollLesson.endedAt = currentDate;
      enrollLesson.status = 2;
      await saveEnrollLesson(enrollLesson)
    }
    if(pause && sectionId && lessonId) {
      const enrollLesson = await findEnrollLesson({
        lesson: { id: Equal(lessonId)},
        section: { course: { id: Equal(enrollCourse.id)} }
      })
      if(!enrollLesson) return res.customSuccess(200, 'Error xx', {}, false);
      enrollLesson.pause = pause;
      await saveEnrollLesson(enrollLesson)
    }

    return res.customSuccess(200, 'Enroll of courses.', true, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error end', {}, false);
  }
};