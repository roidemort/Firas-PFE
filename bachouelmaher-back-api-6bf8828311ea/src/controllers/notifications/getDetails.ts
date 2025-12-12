import { NextFunction, Request, Response } from 'express';
import { findNotification, saveNotification } from "@/services/notification.service"
import { Equal } from "typeorm"

export const getDetails = async (req: Request, res: Response, next: NextFunction) => {
  const notificationId = req.params.id;
  const { id } = req.jwtPayload;
  try {
    let query = {
      id: Equal(notificationId),
      receiver: Equal(id)
    }
    const select  = {
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
    const notification = await findNotification(query, ['sender'], select)
    if (!notification) {
      return  res.customSuccess(200, 'Error', {}, false);
    }
    notification.status = 2
    await saveNotification(notification)
    return res.customSuccess( 200, 'Details of notification.', notification, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
