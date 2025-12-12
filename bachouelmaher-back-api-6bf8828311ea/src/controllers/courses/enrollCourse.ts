import { NextFunction, Request, Response } from "express"
import { findCourse } from "@/services/course.service"
import { Equal, Like } from "typeorm"
import { getPaidSubscription } from "@/services/subscription.service"
import {
  createEnrollCourse, createEnrollLesson,
  createEnrollQuiz,
  createEnrollSection,
  findEnrollCourse, saveEnrollCourse
} from "@/services/enroll-course.service"
import { findUser } from "@/services/user.service"
import { createNotification } from "@/services/notification.service"

export const enrollCourse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, role } = req.jwtPayload
    const courseId = req.params.id

    const currentDate = new Date()

    const User = await findUser({ id: Equal(id), status: 1 })
    if (!User) return res.customSuccess(200, "Error", {}, false)

    const Course = await findCourse({
      id: Equal(courseId),
      status: 1,
      roles: Like(`%${role}%`)
    }, ["sections", "sections.quiz", "sections.lessons"])
    if (!Course) return res.customSuccess(200, "Error", {}, false)

    if (Course.paid) {
      let Subscription = await getPaidSubscription(id)
      if (!Subscription) return res.customSuccess(200, "Error", {}, false)
    }

    let EnrollCourse = await findEnrollCourse({ course: { id: Equal(courseId) }, user: { id: Equal(id) } })
    if (!EnrollCourse) {
      EnrollCourse = await createEnrollCourse({ startedAt: currentDate, user: User, course: Course })
      await Promise.all([
        Course.sections.map(async section => {
          const enrollSection = await createEnrollSection({ course: EnrollCourse, section: section, position: section.position })
          await Promise.all([
            section.lessons.map(async lesson => {
              await createEnrollLesson({ section: enrollSection, lesson: lesson, position: lesson.position })
            }),
            EnrollCourse.quizNumber = EnrollCourse.quizNumber + 1,
            await saveEnrollCourse(EnrollCourse),
            await createEnrollQuiz({ section: enrollSection, quiz: section.quiz })
          ])
        }),
        await createNotification({
          type: 'notification',
          receiver: User,
          title: `Inscription réussie à "${Course.title}"`,
          content: `Félicitations ! Vous êtes maintenant inscrit au cours "${Course.title}". Commencez à apprendre dès maintenant et profitez de votre expérience de formation.`,
          status: 1,
        })
      ])
    }
    else {
      if(EnrollCourse.status != 1) return res.customSuccess(200, 'Enroll of courses.', { EnrollCourse: EnrollCourse.id }, true);
      const expirationDate = new Date(EnrollCourse.startedAt)
      expirationDate.setMonth(expirationDate.getMonth() + Course.expiration)
      if(currentDate > expirationDate && Course.expiration > 0) {
        EnrollCourse.status = 3
        await saveEnrollCourse(EnrollCourse)
        return res.customSuccess(200, "Error", {}, false)
      }
    }
    return res.customSuccess(200, 'Enroll of courses.', { EnrollCourse: EnrollCourse.id }, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};