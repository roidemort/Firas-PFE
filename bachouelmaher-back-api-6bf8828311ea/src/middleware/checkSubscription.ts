import { NextFunction, Request, Response } from "express"
import { Equal, LessThan, Not } from "typeorm"
import { MoreThan } from "typeorm/find-options/operator/MoreThan"
import { AppDataSource } from "@/orm/data-source"
import { SubscriptionEntity } from "@/orm/entities/subscription.entity"

export const checkSubscription = () => {
  const subscriptionRepository = AppDataSource.getRepository(SubscriptionEntity);
  return async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.jwtPayload
    const currentDate = new Date()
    let subscription =  await subscriptionRepository.findOne({
      where: { users : { id: Equal(id) }, status: 1,  startedAt: LessThan(currentDate), endedAt: MoreThan(currentDate), package: { id : Not('4e9a6ca3-96d5-44b0-b33b-ead4a15fe9e2')}}
    });
    if(subscription) return next();
    else return res.customSuccess(200, 'Unauthorized', {}, false);
  };
};