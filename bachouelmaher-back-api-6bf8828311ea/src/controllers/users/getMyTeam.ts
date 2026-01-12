import { NextFunction, Request, Response } from "express"
import * as _ from "lodash";

import { countUsers, findUser, findUsers, getMyUserDetailsQuery } from "@/services/user.service"
import moment from "moment"
import { Equal, Not, Between } from "typeorm"
import { calculateProgress, findEnrollCourse } from "@/services/enroll-course.service"
import { findCourseById } from "@/services/course.service"

export const getMyTeam = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.jwtPayload;
  const orderBy: {   field: string;   direction: "asc" | "desc" } =  { field: "createdAt", direction: "desc" };
  if(req.query.orderBy) {
    const splitOrderBy = req.query.orderBy.toString().split(',');
    switch (splitOrderBy[0]) {
      case "name":
        orderBy.field = "firstName";
        break;
      case "course":
        orderBy.field = "numberCourses";
        break;
      case "score":
        orderBy.field = "quizPoints";
        break;
      case "points":
        orderBy.field = "totalPoints";
        break;
    }
    orderBy.direction = splitOrderBy[1] as  "asc" | "desc";
  }
  let month = undefined
  let startOfMonth= undefined
  let endOfMonth= undefined
  if(req.query.month) {
    month = Number(req.query.month) - 1
    startOfMonth = moment().set('month', month).startOf('month').format('YYYY-MM-DD hh:mm');
    endOfMonth   = moment().set('month', month).endOf('month').format('YYYY-MM-DD hh:mm');
  }
  try {
    const user = await findUser({ id: Equal(id), status: 1 }, ['key', 'key.pharmacy']);
    if(!user) return res.customSuccess(200, 'Error', {}, false);

    const query = {
      enrolls: { startedAt: undefined },
      id: Not(id),key: { pharmacy :{ id : Equal(user.key.pharmacy.id) }}
    }
    if(month) query.enrolls = { startedAt: Between(startOfMonth, endOfMonth)}

    const users = await findUsers(query, ['key', 'key.pharmacy', 'enrolls'] , {}, 0, 30)
    let usersData = await Promise.all(
      users.map(async (user) => {
        const totalQuiz = user.enrolls.reduce((prev, curr) => prev + curr.quizPoints, 0)
        const totalQuizCount = user.enrolls.reduce((prev, curr) => prev + curr.quizNumber, 0)
        const scoreQuiz = totalQuiz / totalQuizCount
        return {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          gender: user.gender,
          birthday: user.birthday,
          tel: user.tel,
          img_link: user.img_link,
          address: user.address,
          city: user.city,
          numberCourses: user.enrolls.length,
          totalPoints: user.enrolls.reduce((prev, curr) => prev + curr.points, 0),
          scoreQuiz: scoreQuiz
        }
      })
    )
    usersData = _.orderBy(usersData, [orderBy.field], [orderBy.direction]);
    const count = await countUsers(query);
    const listUsers = { count, users: usersData }
    return res.customSuccess(200, 'User Team.', listUsers, true);
  } catch (err) {
    return res.customSuccess(200, 'Error', {}, false);
  }
};

export const getMyUserDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.jwtPayload;
  const userId = req.params.id;
  const orderBy: {   field: string;   direction: "ASC" | "DESC" } =  { field: "user.createdAt", direction: "DESC" };
  if(req.query.orderBy) {
    const splitOrderBy = req.query.orderBy.toString().split(',');
    switch (splitOrderBy[0]) {
      case "name":
        orderBy.field = "user.firstName";
        break;
      case "course":
        orderBy.field = "numberCourses";
        break;
      case "score":
        orderBy.field = "quizPoints";
        break;
      case "points":
        orderBy.field = "totalPoints";
        break;
    }
    orderBy.field = splitOrderBy[0];
    orderBy.direction = splitOrderBy[1] as  "ASC" | "DESC";
  }
  let month = undefined
  if(req.query.month) {
    month = Number(req.query.month)
  }
  try {
    const user = await findUser({ id: Equal(id), status: 1 }, ['key', 'key.pharmacy']);
    if(!user) return res.customSuccess(200, 'Error', {}, false);
    const query = {id: Not(id),key: { pharmacy :{ id : Equal(user.key.pharmacy.id) }}}

    const users = await getMyUserDetailsQuery(userId, user.key.pharmacy.id, orderBy, month)
    const count = await countUsers(query);
    const listUsers = { count, users }
    return res.customSuccess(200, 'User Team.', listUsers, true);
  } catch (err) {
    return res.customSuccess(200, 'Error', {}, false);
  }
};

export const getProgression = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.jwtPayload;
  const { courseId, userId } = req.body;
  try {
    const user = await findUser({ id: Equal(id), status: 1 }, ['key', 'key.pharmacy']);
    if(!user) return res.customSuccess(200, 'Error', {}, false);

    const selectedUser = await findUser({ id: Equal(userId), status: 1, key: { pharmacy: {id : Equal(user.key.pharmacy.id)}} }, ['key', 'key.pharmacy']);
    if(!selectedUser) return res.customSuccess(200, 'Error', {}, false);
    const enrollCourse = await findEnrollCourse({ id: Equal(courseId), user: { id: Equal(userId) }}, ['course', 'sections', 'sections.section', 'sections.lessons', 'sections.lessons.lesson', 'sections.quiz.quiz'])
    if(!enrollCourse) return res.customSuccess(200, 'Error', {}, false);
    const statusSummary = calculateProgress(enrollCourse);
    const returnedData = {
      course: enrollCourse.course.title,
      courseId: enrollCourse.course.id,
      progression: statusSummary,
      quizPoints: enrollCourse.quizPoints,
      quizNumber: enrollCourse.quizNumber,
      points: enrollCourse.points,
      pharmacy: selectedUser.key.pharmacy.name,
      pharmacyId: selectedUser.key.pharmacy.id,t: enrollCourse
    }
    return res.customSuccess(200, 'Progression Details.', { course: returnedData }, true);
  } catch (err) {
    return res.customSuccess(200, 'Error', {}, false);
  }
};

export const getMyCertificate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.jwtPayload;
  const courseId = req.params.id;
  try {
    const user = await findUser({ id: Equal(id), status: 1 });
    if(!user) return res.customSuccess(200, 'Error', {}, false);

    const course = await findCourseById(courseId, ['certificate', 'provider', 'provider.logo'])
    if (!course) return  res.customSuccess(200, 'Error', {}, false);

    const enrollCourse = await findEnrollCourse({ course: { id: Equal(courseId) }, user: { id: Equal(id) }, status: 2})
    if(!enrollCourse) return res.customSuccess(200, 'Error', {}, false);

    const linkToCertificate = `/upload/certificates/${id}-${courseId}.pdf`
    return res.customSuccess(200, 'Certificate Link.', { link: linkToCertificate }, true);
  } catch (err) {
    return res.customSuccess(200, 'Error 4', {}, false);
  }
};