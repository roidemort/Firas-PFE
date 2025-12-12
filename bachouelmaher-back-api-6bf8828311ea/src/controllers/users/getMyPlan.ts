import { NextFunction, Request, Response } from "express"
import { findUser, findUserById, saveUser } from "@/services/user.service"
import { Equal } from "typeorm"
import { getActiveSubscription } from "@/services/subscription.service"

export const getMyPlan = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.jwtPayload;
  try {
    const user = await findUser({ id: Equal(id), status: 1 });
    if(!user) return res.customSuccess(200, 'Error', {}, false);
    let subscription = await getActiveSubscription(id)
    return res.customSuccess(200, 'User subscription.', { subscription }, true);
  } catch (err) {
    return res.customSuccess(200, 'Error', {}, false);
  }
};