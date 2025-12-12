import { NextFunction, Request, Response } from 'express';
import pick from "@/utils/pick"
import { IOptions } from "@/interfaces/IOptions"
import { organize } from "@/utils/organize"
import {
  countConversations, findConversations,
  queryConversations, saveConversation
} from "@/services/conversation.service"
import { Equal } from "typeorm"

export const getMine = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.jwtPayload;
  const courseId = req.params.id;
  try {
    const filter = pick(req.query, ['courseId', 'userId']);
    const options: IOptions = pick(req.query, ['relations', 'take', 'page']);
    let params = organize(filter, options)

    params.order = { "createdAt": "ASC" };
    params.relations = ['receiver', 'sender']
    params.query = [{ receiver: Equal(id), course: Equal(courseId) }, { sender: Equal(id), course: Equal(courseId) }]
    const query = [{ receiver: Equal(id), course: Equal(courseId), status: 1 }]
    const updatedConversations = await findConversations(query);
    await Promise.all(
      updatedConversations.map(async (conversation) => {
        conversation.status = 2
        await saveConversation(conversation)
      })
    )
    const conversations = await queryConversations(params);
    const count = await countConversations(params.query);
    const listConversation = { conversations, count }
    return res.customSuccess(200, 'List of conversations.', listConversation, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
