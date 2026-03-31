import { NextFunction, Request, Response } from 'express';
import { Equal, IsNull } from 'typeorm';

import {
  countConversations,
  createConversation,
  findConversation,
  queryConversations,
  saveConversation,
} from '@/services/conversation.service';
import { createNotification } from '@/services/notification.service';
import { findUserById } from '@/services/user.service';

const VALID_TABS = ['unanswered', 'answered', 'all'] as const;
const VALID_VISIBILITIES = ['public', 'private'] as const;

type ChatTab = (typeof VALID_TABS)[number];
type ReplyVisibility = (typeof VALID_VISIBILITIES)[number];

const normalizeTab = (tab: string): ChatTab => {
  if (VALID_TABS.includes(tab as ChatTab)) {
    return tab as ChatTab;
  }

  return 'unanswered';
};

const normalizeVisibility = (visibility: string): ReplyVisibility | null => {
  if (VALID_VISIBILITIES.includes(visibility as ReplyVisibility)) {
    return visibility as ReplyVisibility;
  }

  return null;
};

const buildPharmacistAlias = (senderId?: string | null) => {
  if (!senderId) {
    return 'Pharmacien';
  }

  return `Pharmacien #${senderId.slice(0, 8).toUpperCase()}`;
};

const buildBaseQuestionQuery = (laboId: string, courseId?: string) => {
  const query: any = {
    labo: { id: Equal(laboId) },
    parent: IsNull(),
    isDeleted: false,
  };

  if (courseId) {
    query.course = { id: Equal(courseId) };
  }

  return query;
};

export const getMyChatUnansweredCount = async (req: Request, res: Response, next: NextFunction) => {
  const laboId = req.jwtPayload.id;
  const courseId = req.query.courseId ? String(req.query.courseId) : '';

  try {
    const baseQuery = buildBaseQuestionQuery(laboId, courseId || undefined);
    const count = await countConversations({ ...baseQuery, isAnswered: false });

    return res.customSuccess(200, 'Count of unanswered labo chat questions.', { count }, true);
  } catch (err) {
    return res.customSuccess(200, 'Error', {}, false);
  }
};

export const getMyChatQuestions = async (req: Request, res: Response, next: NextFunction) => {
  const laboId = req.jwtPayload.id;
  const tab = normalizeTab(String(req.query.tab || 'unanswered').toLowerCase());
  const courseId = req.query.courseId ? String(req.query.courseId) : '';

  try {
    const query: any = buildBaseQuestionQuery(laboId, courseId || undefined);

    if (tab === 'unanswered') {
      query.isAnswered = false;
    }

    if (tab === 'answered') {
      query.isAnswered = true;
    }

    const questions = await queryConversations({
      query,
      relations: ['sender', 'course'],
      order: { createdAt: 'DESC' },
    });

    const baseCountQuery = buildBaseQuestionQuery(laboId, courseId || undefined);

    const [unansweredCount, answeredCount, allCount] = await Promise.all([
      countConversations({ ...baseCountQuery, isAnswered: false }),
      countConversations({ ...baseCountQuery, isAnswered: true }),
      countConversations(baseCountQuery),
    ]);

    const formattedQuestions = questions.map((question) => ({
      id: question.id,
      content: question.content,
      isAnswered: question.isAnswered,
      visibility: question.visibility,
      pharmacistAlias: question.pharmacistAlias || buildPharmacistAlias(question.sender?.id),
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
      answeredAt: question.answeredAt,
      course: question.course
        ? {
            id: question.course.id,
            title: question.course.title,
          }
        : null,
    }));

    return res.customSuccess(
      200,
      'List of labo chat questions.',
      {
        tab,
        questions: formattedQuestions,
        counts: {
          unanswered: unansweredCount,
          answered: answeredCount,
          all: allCount,
        },
      },
      true
    );
  } catch (err) {
    return res.customSuccess(200, 'Error', {}, false);
  }
};

export const getMyChatQuestionDetails = async (req: Request, res: Response, next: NextFunction) => {
  const laboId = req.jwtPayload.id;
  const questionId = req.params.id;

  try {
    const question = await findConversation(
      {
        id: Equal(questionId),
        labo: { id: Equal(laboId) },
        parent: IsNull(),
        isDeleted: false,
      },
      ['sender', 'course']
    );

    if (!question) {
      return res.customSuccess(200, 'Error', {}, false);
    }

    const replies = await queryConversations({
      query: [
        {
          parent: { id: Equal(questionId) },
          labo: { id: Equal(laboId) },
          isDeleted: false,
        },
        {
          parent: { id: Equal(questionId) },
          labo: IsNull(),
          isDeleted: false,
        },
      ],
      relations: ['sender', 'receiver'],
      order: { createdAt: 'ASC' },
    });

    return res.customSuccess(
      200,
      'Labo chat question details.',
      {
        question: {
          id: question.id,
          content: question.content,
          isAnswered: question.isAnswered,
          visibility: question.visibility,
          pharmacistAlias: question.pharmacistAlias || buildPharmacistAlias(question.sender?.id),
          createdAt: question.createdAt,
          answeredAt: question.answeredAt,
          course: question.course
            ? {
                id: question.course.id,
                title: question.course.title,
              }
            : null,
        },
        replies: replies.map((reply) => ({
          id: reply.id,
          content: reply.content,
          visibility: reply.visibility,
          createdAt: reply.createdAt,
          isFromLabo: reply.sender?.id === laboId,
          isHidden: reply.isHidden,
        })),
      },
      true
    );
  } catch (err) {
    return res.customSuccess(200, 'Error', {}, false);
  }
};

export const replyToMyChatQuestion = async (req: Request, res: Response, next: NextFunction) => {
  const laboId = req.jwtPayload.id;
  const questionId = req.params.id;
  const content = String(req.body.content || '').trim();
  const visibility = normalizeVisibility(String(req.body.visibility || 'private').toLowerCase());

  try {
    if (!content) {
      return res.customSuccess(200, 'content : Content is required', {}, false);
    }

    if (!visibility) {
      return res.customSuccess(200, 'visibility : Visibility must be public or private', {}, false);
    }

    const labo = await findUserById(laboId);
    if (!labo || labo.role !== 'LABO') {
      return res.customSuccess(200, 'Error', {}, false);
    }

    const question = await findConversation(
      {
        id: Equal(questionId),
        labo: { id: Equal(laboId) },
        parent: IsNull(),
        isDeleted: false,
      },
      ['sender', 'course', 'labo']
    );

    // LABO can only post replies linked to an existing pharmacist question.
    if (!question || !question.sender || !question.course) {
      return res.customSuccess(200, 'Error', {}, false);
    }

    const reply = await createConversation({
      sender: labo,
      receiver: question.sender,
      course: question.course,
      content,
      visibility,
      parent: question,
      labo: question.labo || labo,
      pharmacistAlias: question.pharmacistAlias || buildPharmacistAlias(question.sender.id),
    });

    question.isAnswered = true;
    question.answeredAt = new Date();
    await saveConversation(question);

    await createNotification({
      type: 'message',
      receiver: question.sender,
      sender: labo,
      title: 'Vous recevez une reponse du laboratoire',
      content: `Le laboratoire a repondu a votre question sur la formation "${question.course.title}".`,
      status: 1,
    });

    return res.customSuccess(
      200,
      'Reply successfully created.',
      {
        reply: {
          id: reply.id,
          content: reply.content,
          visibility: reply.visibility,
          createdAt: reply.createdAt,
        },
      },
      true
    );
  } catch (err) {
    return res.customSuccess(200, 'Error', {}, false);
  }
};
