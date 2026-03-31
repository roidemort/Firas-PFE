import { NextFunction, Request, Response } from "express"

import {
  countUsers,
  createUser, findUser,
  findUserByEmail,
  findUserById, getMyUserDetailsQuery,
  linkUserToFreePlan,
  queryUsers,
  saveUser
} from "@/services/user.service"
import pick from "@/utils/pick"
import { IOptions, IQuery } from "@/interfaces/IOptions"
import { organize } from "@/utils/organize"
import RedisService from "@/services/redis.service"
import { And, Equal, In, Like, Not } from "typeorm"
import { emailBullMq } from "@/queues/email.queue"
import { findPharmacyUser, savePharmacyUser } from "@/services/pharmacy.service"
import cloudinary from "@/adapters/cloudinary"
import { countNotifications, createNotification } from "@/services/notification.service"
import { UserEntity } from "@/orm/entities/user.entity"
import { MulterFile } from "@/interfaces/IMulterFile"
import { getActiveSubscription } from "@/services/subscription.service"
import {
  calculateProgress,
  countEnrollCourses,
  findEnrollCourse,
  queryEnrollCourses
} from "@/services/enroll-course.service"
import { findCourseById } from "@/services/course.service"
import {
  countConversations,
  createConversation,
  findConversationById,
  findConversations,
  queryConversations, saveConversation
} from "@/services/conversation.service"

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const filter = pick(req.query, ['text', 'role', 'status', 'gender']);
    const options: IOptions = pick(req.query, ['orderBy', 'select', 'relations', 'take', 'page']);
    let params = organize(filter, options)
    if(params.query && params.query.length) {
      params.query.map((value, key) => {
        if (Object.hasOwn(value, 'role')) {
          value.role = And(Not('SUPER_ADMIN'), value.role)
        } else {
          value.role = Not('SUPER_ADMIN')
        }
      })
    } else {
      if (Object.hasOwn(params.query, 'role')) {
        params.query.role = And(Not('SUPER_ADMIN'), params.query.role)
      } else {
        params.query.role = Not('SUPER_ADMIN')
      }
    }
    const users = await queryUsers(params);
    const count = await countUsers(params.query);
    const listUsers = { users, count }
    return res.customSuccess(200, 'List of users.', listUsers, true);
  } catch (err) {
    return res.customSuccess(200, 'Error', {}, false);
  }
};
export const detailsUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.id;
  try {
    const options: IOptions = pick(req.query, ['relations']);
    let params = organize({}, options)

    let relations = []
    if(params.relations) {
      relations = Object.keys(params.relations)
    }
    relations.push('subscribes', 'subscribes.package')

    const user = await findUserById(userId, relations);

    if (!user) {
      return res.customSuccess(200, 'Error', {}, false);
    }

    let subscription = await getActiveSubscription(userId)

    user['package'] = subscription.package

    return res.customSuccess(200, 'User details.', { user }, true);
  } catch (err) {
    return res.customSuccess(200, 'Error', {}, false);
  }
};

export const addUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { key, firstName, lastName, gender, birthday, tel, email, password, address, city, zipCode } = req.body;
  try {
    const pharmacyUser = await findPharmacyUser({ key: Equal(key) });

    if (!pharmacyUser || pharmacyUser.status != 0) {
      return  res.customSuccess(200, 'Error', {}, false);
    }

    const user = await findUserByEmail(email);

    if (user) {
      return res.customSuccess(
        200,
        `email : Email '${email}' already exists`,
        {},
        false
      );
    }
    const newUser = await createUser({
      email: email.toLowerCase(),
      password,
      birthday,
      tel,
      firstName,
      lastName,
      gender,
      provider: 'EMAIL',
      role: pharmacyUser.role,
      key: pharmacyUser,
      address,
      city,
      zipCode
    });

    pharmacyUser.status = 3
    pharmacyUser.user = newUser;

    await saveUser(newUser);
    await savePharmacyUser(pharmacyUser);
    await RedisService.incCreateIfNotExist('users', 1)
    await linkUserToFreePlan(newUser)
    return res.customSuccess(
      200,
      'User successfully created.',
      { user: newUser },
      true
    );
  } catch (err) {
    return res.customSuccess(200, 'Error', {}, false);
  }
};

export const editUser = async (
  req: Request & { file: MulterFile },
  res: Response,
  next: NextFunction
) => {
  const { firstName, lastName, gender, birthday, tel, email, role, status, address, city, zipCode } = req.body;
  const userId = req.params.id;
  try {
    const user = await findUserById(userId);

    if (!user) {
      return res.customSuccess(200, 'Error', {}, false);
    }

    if (email) {
      const userExist = await findUserByEmail(email);
      if (userExist && userExist.id != userId) {
        return res.customSuccess(
          200,
          `email : Email '${email}' already exists`,
          {},
          false
        );
      } else {
        user.email = email;
      }
    }
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (birthday) user.birthday = birthday;
    if (role) user.role = role;
    if (tel) user.tel = tel;
    if (gender) user.gender = gender;
    if (status) user.status = status;
    if (address) user.address = address;
    if (city) user.city = city;
    if (zipCode) user.zipCode = zipCode;
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

      const fileUpload = await cloudinary.uploader.upload(dataURI, { folder: "pharmacy/users" })

      user.img_link = fileUpload.secure_url;
    }

    await saveUser(user);
    return res.customSuccess(
      200,
      'User Profile successfully changed.',
      { user },
      true
    );
  } catch (err) {
    return res.customSuccess(200, 'Error', {}, false);
  }
};

export const sendNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { usersIds, text, subject } = req.body;
  const { id } = req.jwtPayload;
  try {
    const params: IQuery = {
      query: { id: In(usersIds) },
      select: { email: true }
    }
    const users = await queryUsers(params);

    const senderUser = await findUserById(id, {}, { id: true });

    await Promise.all(usersIds.map(async (user: string) => {
      const receiverUser = await findUserById(user, {}, { id: true, email: true });
      await createNotification({
        type: 'email',
        sender: senderUser,
        receiver: receiverUser,
        title: subject,
        content: text,
        status: 1,
      });
      await emailBullMq.add('send-notification', {
        from: process.env.SMTP_USERNAME,
        type:'string',
        to: receiverUser.email,
        subject: subject,
        template: text,
      })
    }))

    return res.customSuccess(
      200,
      'Send Notification successfully.',
      true,
      true
    );
  } catch (err) {
    return res.customSuccess(200, 'Error', {}, false);
  }
};
export const userCourseEnroll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.params.id;
    const filter = pick(req.query, ['status']);
    Object.assign(filter, { user :{ id: Equal(userId) } })
    const options: IOptions = pick(req.query, ['orderBy', 'select', 'relations', 'take', 'page']);

    let params = organize(filter, options)
    if(options.hasOwnProperty('orderBy') && options['orderBy'].includes('course')) {
      params.order = { course: {title: params.order['course'] }}
    }
    const courses = await queryEnrollCourses(params);
    const count = await countEnrollCourses(params.query);
    const listCourses = { courses, count }

    return res.customSuccess(200, 'User Courses.', listCourses, true);
  } catch (err) {
    return res.customSuccess(200, 'Error', {}, false);
  }
};

export const courseEnrollProgression = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { courseId, userId } = req.body;

    const selectedUser = await findUser({ id: Equal(userId) });
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
    }

    return res.customSuccess(200, 'Progression Details.', { course: returnedData }, true);
  } catch (err) {
    return res.customSuccess(200, 'Error', {}, false);
  }
};


export const getConversation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.jwtPayload;
  const { courseId, userId } = req.body;
  try {
    const filter = pick(req.query, ['courseId', 'userId']);
    const options: IOptions = pick(req.query, ['relations', 'take', 'page']);
    let params = organize(filter, options)

    params.order = { "createdAt": "ASC" };
    params.relations = ['receiver', 'sender']
    params.query = [{ receiver: Equal(userId), course: Equal(courseId) }, { sender: Equal(userId), course: Equal(courseId) }]

    const query = [{ receiver: Equal(id), course: Equal(courseId), sender: Equal(userId), status: 1 }]

    const conversations = await queryConversations(params);
    const count = await countConversations(params.query);
    const user = await findUserById(userId);
    const listConversation = { conversations, count, user }
    const updatedConversations = await findConversations(query);
    await Promise.all(
      updatedConversations.map(async (conversation) => {
        conversation.status = 2
        await saveConversation(conversation)
      })
    )
    return res.customSuccess(200, 'List of conversations.', listConversation, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};

export const getChatRepliesModeration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const rawStatus = String(req.query.status || 'ACTIVE').toUpperCase();
  const laboId = req.query.laboId ? String(req.query.laboId) : '';
  const courseId = req.query.courseId ? String(req.query.courseId) : '';
  const text = req.query.text ? String(req.query.text).trim() : '';

  try {
    const options: IOptions = pick(req.query, ['take', 'page']);
    const params = organize({}, options);

    const query: any = {
      sender: { role: Equal('LABO') },
    };

    if (rawStatus === 'ACTIVE') {
      query.isHidden = false;
      query.isDeleted = false;
    } else if (rawStatus === 'HIDDEN') {
      query.isHidden = true;
      query.isDeleted = false;
    } else if (rawStatus === 'DELETED') {
      query.isDeleted = true;
    }

    if (laboId) {
      query.labo = { id: Equal(laboId) };
    }

    if (courseId) {
      query.course = { id: Equal(courseId) };
    }

    if (text) {
      query.content = Like(`%${text}%`);
    }

    params.order = { createdAt: 'DESC' };
    params.relations = ['sender', 'receiver', 'course', 'labo', 'parent', 'moderatedBy'];
    params.query = query;

    const replies = await queryConversations(params);
    const count = await countConversations(query);

    return res.customSuccess(200, 'List of chat replies for moderation.', { replies, count }, true);
  } catch (err) {
    return res.customSuccess(200, 'Error', {}, false);
  }
};

const moderateChatReply = async (
  req: Request,
  res: Response,
  action: 'HIDE' | 'DELETE' | 'RESTORE'
) => {
  const { id: adminId } = req.jwtPayload;
  const replyId = req.params.id;

  try {
    const adminUser = await findUserById(adminId, {}, { id: true });
    const reply = await findConversationById(replyId, ['parent', 'sender', 'labo', 'course']);

    // We only moderate LABO replies, never the root pharmacist question.
    if (!adminUser || !reply || !reply.parent || !reply.sender || reply.sender.role !== 'LABO') {
      return res.customSuccess(200, 'Error', {}, false);
    }

    if (action === 'HIDE') {
      reply.isHidden = true;
      reply.isDeleted = false;
    }

    if (action === 'DELETE') {
      reply.isHidden = true;
      reply.isDeleted = true;
    }

    if (action === 'RESTORE') {
      reply.isHidden = false;
      reply.isDeleted = false;
    }

    reply.moderatedAt = new Date();
    reply.moderatedBy = adminUser as any;

    await saveConversation(reply);

    await createNotification({
      type: 'message',
      receiver: reply.sender,
      sender: adminUser as any,
      title: 'Moderation de reponse',
      content: `Votre reponse sur la formation "${reply.course?.title || ''}" a ete ${
        action === 'HIDE' ? 'masquee' : action === 'DELETE' ? 'supprimee' : 'restauree'
      } par l'administrateur.`,
      status: 1,
    });

    return res.customSuccess(200, 'Reply moderation updated.', { reply }, true);
  } catch (err) {
    return res.customSuccess(200, 'Error', {}, false);
  }
};

export const hideChatReply = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return moderateChatReply(req, res, 'HIDE');
};

export const deleteChatReply = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return moderateChatReply(req, res, 'DELETE');
};

export const restoreChatReply = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return moderateChatReply(req, res, 'RESTORE');
};

export const addConversation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.jwtPayload;
  const { courseId, userId, content } = req.body;
  try {
    const senderUser = await findUserById(id);
    const receiverUser = await findUserById(userId);
    const course = await findCourseById(courseId)

    if (!senderUser || !receiverUser || !course) {
      return  res.customSuccess(200, 'Error', {}, false);
    }

    await createConversation({
      sender: senderUser,
      receiver: receiverUser,
      course: course,
      content
    })
    await createNotification({
      type: 'message',
      receiver: receiverUser,
      title: `Vous recevez un nouveau message`,
      content: `L'administrateur vous envoie un message concernant la formation "${course.title}"`,
      status: 1,
    })
    return res.customSuccess(200, 'Conversation successfully created.', true, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
export const countConversation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.jwtPayload;
  const { courseId, userId } = req.body;
  try {
    const senderUser = await findUserById(id);
    const receiverUser = await findUserById(userId);
    const course = await findCourseById(courseId)

    if (!senderUser || !receiverUser || !course) {
      return  res.customSuccess(200, 'Error', {}, false);
    }
    const query = [{ receiver: Equal(id), course: Equal(courseId), sender: Equal(userId), status: 1 }]
    const count = await countConversations(query);
    return res.customSuccess(200, 'Count of conversations.', count, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
export const countNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.jwtPayload;
  try {
    const query = [{ receiver: Equal(id), status: 1 }]
    const count = await countNotifications(query);
    return res.customSuccess(200, 'Count of conversations.', count, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};