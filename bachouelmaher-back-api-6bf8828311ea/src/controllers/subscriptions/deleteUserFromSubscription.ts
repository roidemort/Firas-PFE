import { NextFunction, Request, Response } from "express"
import { findSubscription, saveSubscription } from "@/services/subscription.service"
import { Equal } from "typeorm"

export const deleteUserFromSubscription = async (req: Request, res: Response, next: NextFunction) => {
    const { userId, subscribeId } = req.body;
    const { id } = req.jwtPayload;
    try {
      if(userId == id) return res.customSuccess(200, 'Error', {}, false);
      const Subscription = await findSubscription( {id: Equal(subscribeId), buyer: { id: Equal(id)}, status: 1} , ['users'])
      if(!Subscription) return res.customSuccess(200, 'Error1', {}, false);
      const exist = Subscription.users.find(user => user.id === userId)
      if(!exist) return res.customSuccess(200, 'Error', {}, false);
      Subscription.users = Subscription.users.filter(user => user.id !== userId)
      await saveSubscription(Subscription)
      return res.customSuccess(200, "User deleted to subscription successfully", {}, true);
    } catch (err) {
      return res.customSuccess(200, 'Error', {}, false);
    }
}