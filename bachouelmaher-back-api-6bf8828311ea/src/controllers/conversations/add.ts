import { NextFunction, Request, Response } from 'express';
import {
  createConversation,
} from "@/services/conversation.service"
import { Equal } from "typeorm"
import { findUser, findUserById } from "@/services/user.service"
import { findCourseById } from "@/services/course.service"
import { findEnrollCourse } from "@/services/enroll-course.service"
import { createNotification } from "@/services/notification.service"
import { findLabCourseAssignments } from '@/services/lab-course-assignment.service';
import { emailBullMq } from '@/queues/email.queue';

const PHARMACIST_ROLES = ['PHARMACIST', 'PHARMACIST_HOLDER', 'PREPARER'];

const buildPharmacistAlias = (userId: string) => `Pharmacien #${userId.slice(0, 8).toUpperCase()}`;

export const addConversation = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.jwtPayload;
  const { courseId, content } = req.body;
  try {
    const senderUser = await findUserById(id);
    const normalizedContent = String(content || '').trim();

    if (!courseId) {
      return res.customSuccess(200, 'courseId : Course is required', {}, false);
    }

    if (!normalizedContent) {
      return res.customSuccess(200, 'content : Content is required', {}, false);
    }

    if (!senderUser || !PHARMACIST_ROLES.includes(senderUser.role)) {
      return res.customSuccess(200, 'Unauthorized', {}, false);
    }

    const course = await findCourseById(courseId)
    const enrollCourse = await findEnrollCourse({ course: { id: Equal(courseId) }, user: { id: Equal(id) } })

    if (!course || !enrollCourse) {
      return res.customSuccess(200, 'Error', {}, false);
    }

    const assignmentCandidates = await findLabCourseAssignments(
      { course: { id: Equal(courseId) }, status: 1 },
      ['labo']
    );

    const routedLabo = assignmentCandidates.find(
      (item) => item.labo?.role === 'LABO' && item.labo?.status === 1
    )?.labo;

    const adminReceiver = await findUser({ role: 'SUPER_ADMIN' });
    const receiverUser = routedLabo || adminReceiver;

    if (!receiverUser) {
      return res.customSuccess(200, 'Error', {}, false);
    }

    const pharmacistAlias = buildPharmacistAlias(senderUser.id);

    await createConversation({
      sender: senderUser,
      receiver: receiverUser,
      course: course,
      content: normalizedContent,
      labo: routedLabo || null,
      pharmacistAlias,
      visibility: 'private',
    })

    const msg = routedLabo
      ? `${pharmacistAlias || senderUser.firstName} vous envoie une question sur la formation "${course.title}".`
      : `"${senderUser.firstName} ${senderUser.lastName}" vous envoie un message concernant la formation "${course.title}".${course.id}`

    await createNotification({
      type: 'message',
      receiver: receiverUser,
      sender: senderUser,
      title: `Vous recevez un nouveau message`,
      content: msg,
      status: 1,
    })

    const shouldSendLaboEmail =
      Boolean(routedLabo)
      && String(process.env.LABO_CHAT_EMAIL_NOTIFICATIONS || '').toLowerCase() === 'true'
      && Boolean(receiverUser.email);

    // Email is optional and controlled by LABO_CHAT_EMAIL_NOTIFICATIONS.
    if (shouldSendLaboEmail) {
      await emailBullMq.add('send-notification', {
        type: 'html',
        to: receiverUser.email,
        subject: 'Nouvelle question pharmacien',
        html: `<p>Bonjour,</p><p>${pharmacistAlias || 'Un pharmacien'} a pose une nouvelle question sur la formation <b>${course.title}</b>.</p><p>Connectez-vous au dashboard LABO pour y repondre.</p>`,
      });
    }

    return res.customSuccess(200, 'Conversation successfully created.', {
      routedTo: routedLabo ? 'LABO' : 'SUPER_ADMIN',
    }, true);
  } catch (err) {
    return res.customSuccess(200, 'Error', {}, false);
  }
};
