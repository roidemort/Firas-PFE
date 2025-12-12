import { Equal, FindOptionsWhere } from "typeorm"

import { AppDataSource } from "@/orm/data-source";
import { ConversationEntity } from "@/orm/entities/conversation.entity";
import { IQuery } from "@/interfaces/IOptions"

const conversationRepository = AppDataSource.getRepository(ConversationEntity);

export const createConversation = async (input: Partial<ConversationEntity>) => {
  return await conversationRepository.save(conversationRepository.create(input));
};
export const saveConversation = async (conversation: ConversationEntity) => {
  return await conversationRepository.save(conversation);
};

export const findConversationById = async (conversationId: string, relations: any[] = []) => {
  return await conversationRepository.findOne({
    where: { id: Equal(conversationId) },
    relations: relations,
  });
};

export const findConversation = async (query: any, relations: any[] = []) => {
  return await conversationRepository.findOne({
    where: query,
    relations: relations,
  });
};

export const queryConversations = async (params: IQuery) => {
  return await conversationRepository.find({
    where: params.query,
    select: params.select,
    relations: params.relations,
    skip: params.skip,
    take: params.take,
    order: params.order
  });
}

export const findConversations = async (query: any, relations: any[] = [], select: any = {}) => {
  return await conversationRepository.find({
    select: select,
    where: query,
    relations: relations,
  });
};
export const deleteConversation = async (conversationId: string) => {
  return await conversationRepository.delete({ id: Equal(conversationId) });
};

export const countConversations = async (query: any) => {
  return await conversationRepository.countBy(query as FindOptionsWhere<ConversationEntity>);
};