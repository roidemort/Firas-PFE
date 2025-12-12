import { Equal, FindOptionsWhere } from "typeorm"

import { AppDataSource } from "@/orm/data-source";
import { NotificationEntity } from "@/orm/entities/notification.entity";
import { IQuery } from "@/interfaces/IOptions"

const notificationRepository = AppDataSource.getRepository(NotificationEntity);

export const createNotification = async (input: Partial<NotificationEntity>) => {
  return await notificationRepository.save(notificationRepository.create(input));
};
export const saveNotification = async (notification: NotificationEntity) => {
  return await notificationRepository.save(notification);
};

export const findNotificationById = async (notificationId: string, relations: any[] = []) => {
  return await notificationRepository.findOne({
    where: { id: Equal(notificationId) },
    relations: relations,
  });
};

export const findNotification = async (query: any, relations: any[] = [], select: any = {}) => {
  return await notificationRepository.findOne({
    where: query,
    relations: relations,
    select: select
  });
};

export const queryNotifications = async (params: IQuery) => {
  return await notificationRepository.find({
    where: params.query,
    select: params.select,
    relations: params.relations,
    skip: params.skip,
    take: params.take,
    order: params.order
  });
}

export const findNotifications = async (query: any, relations: any[] = [], select: any = {}) => {
  return await notificationRepository.find({
    select: select,
    where: query,
    relations: relations,
  });
};
export const deleteNotification = async (notificationId: string) => {
  return await notificationRepository.delete({ id: Equal(notificationId) });
};

export const countNotifications = async (query: any) => {
  return await notificationRepository.countBy(query as FindOptionsWhere<NotificationEntity>);
};