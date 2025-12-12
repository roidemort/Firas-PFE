import { NextFunction, Request, Response } from 'express';
import pick from "@/utils/pick"
import { IOptions } from "@/interfaces/IOptions"
import { organize } from "@/utils/organize"
import {
  countConversations, createConversation,
  findConversations,
  queryConversations,
  saveConversation
} from "@/services/conversation.service"
import { Equal } from "typeorm"
import { createUser, findUser, findUserById } from "@/services/user.service"
import { findCourseById } from "@/services/course.service"
import { findEnrollCourse } from "@/services/enroll-course.service"
import { createNotification } from "@/services/notification.service"

export const addConversation = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.jwtPayload;
  const { courseId, content } = req.body;
  try {
    const senderUser = await findUserById(id);
    const receiverUser = await findUser({ role: 'SUPER_ADMIN'});
    const course = await findCourseById(courseId)

    let EnrollCourse = await findEnrollCourse({ course: { id: Equal(courseId) }, user: { id: Equal(id) } })

    if (!senderUser || !receiverUser || !course || !EnrollCourse) {
      return  res.customSuccess(200, 'Error', {}, false);
    }

    await createConversation({
      sender: senderUser,
      receiver: receiverUser,
      course: course,
      content
    })
    const msg = `"${senderUser.firstName} ${senderUser.lastName}" vous envoie un message concernant la formation "${course.title}".${course.id}`
    await createNotification({
      type: 'message',
      receiver: receiverUser,
      sender: senderUser,
      title: `Vous recevez un nouveau message`,
      content: msg,
      status: 1,
    })

    return res.customSuccess(200, 'Conversation successfully created.', true, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
