import { NextFunction, Request, Response } from 'express';
import pick from "@/utils/pick"
import { IOptions } from "@/interfaces/IOptions"
import { organize } from "@/utils/organize"
import {
  countNotifications,
  findNotifications,
  queryNotifications,
  saveNotification
} from "@/services/notification.service"
import { Equal } from "typeorm"

export const getMine = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.jwtPayload;
  try {
    const filter = pick(req.query, ['type', 'status']);
    const options: IOptions = pick(req.query, ['orderBy', 'select', 'relations', 'take', 'page']);
    let params = organize(filter, options)
    if(params.query && params.query.length) {
      params.query.map((value, key) => {
        value.receiver = Equal(id)
      })
    } else {
      params.query.receiver = Equal(id)
    }
    params.relations = ['sender']
    params.select = {
      id: true,
      content: true,
      createdAt: true,
      status: true,
      title: true,
      type: true,
      updatedAt: true,
      sender: {
        id: true,
      },
    }
    const notifications = await queryNotifications(params);
    const count = await countNotifications(params.query);
    // const updatedNotifications = await findNotifications(params.query);
    // await Promise.all(
    //   updatedNotifications.map(async (notification) => {
    //     notification.status = 0
    //     await saveNotification(notification)
    //   })
    // )
    const listNotification = { notifications, count }
    return res.customSuccess(200, 'List of notifications.', listNotification, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
export const countMine = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.jwtPayload;
  try {
    const query = {
      receiver: Equal(id),
      status: 1
    }
    const count = await countNotifications(query);

    return res.customSuccess(200, 'Count of notifications.', count, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
