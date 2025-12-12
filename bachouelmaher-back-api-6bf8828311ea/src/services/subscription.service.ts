import {
  Equal,
  FindOptionsWhere,
  LessThan,
  Not
} from "typeorm"

import { AppDataSource } from "@/orm/data-source";
import { SubscriptionEntity } from "@/orm/entities/subscription.entity"
import { IQuery } from "@/interfaces/IOptions"
import { MoreThan } from "typeorm/find-options/operator/MoreThan"

const subscriptionRepository = AppDataSource.getRepository(SubscriptionEntity);

export const createSubscription = async (input: Partial<SubscriptionEntity>) => {
  return await subscriptionRepository.save(subscriptionRepository.create(input));
};

export const saveSubscription = async (pack: SubscriptionEntity) => {
  return await subscriptionRepository.save(pack);
};

export const findSubscriptionById = async (subscriptionId: string, relations: any[] = []) => {
  return await subscriptionRepository.findOne({
    where: { id: Equal(subscriptionId) },
    relations: relations,
  });
};

export const findSubscription = async (query: any, relations: any[] = []) => {
  return await subscriptionRepository.findOne({
    where: query,
    relations: relations,
  });
};

export const getNbrSubscriptionsByMonth = async () => {
  return await subscriptionRepository
    .createQueryBuilder("sub")
    .select('MONTH(sub.startedAt)','month')
    .addSelect('COUNT(sub.id)', 'count')
    .where("sub.packageId != :packageId", { packageId: '4e9a6ca3-96d5-44b0-b33b-ead4a15fe9e2' })
    .groupBy('MONTH(sub.startedAt)')
    .getRawMany();
}

export const findSubscriptions = async (query: any, relations: any[] = [], select: any = {}) => {
  return await subscriptionRepository.find({
    select: select,
    where: query,
    relations: relations,
  });
};

export const querySubscriptions = async (params: IQuery) => {
  return await subscriptionRepository.find({
    where: params.query,
    select: params.select,
    relations: params.relations,
    skip: params.skip,
    take: params.take,
    order: params.order
  });
}

export const countSubscriptions = async (query: any) => {
  return await subscriptionRepository.countBy(query as FindOptionsWhere<SubscriptionEntity>);
};
export const deleteSubscription = async (subscriptionId: string) => {
  await subscriptionRepository.delete({ id: Equal(subscriptionId) });
};

export const verifyActiveSubscription = async (userId: string, startedAt?: string, endedAt?: string, currentSubscriptionId?: string): Promise<boolean> => {
  const currentDate = new Date()
  let subscription =  await subscriptionRepository.findOne({
    where: { users : { id: Equal(userId) }, status: 1,  startedAt: LessThan(currentDate), endedAt: MoreThan(currentDate), package: { id : Not('4e9a6ca3-96d5-44b0-b33b-ead4a15fe9e2')}},
  });
  if(startedAt && endedAt && !currentSubscriptionId) {
    const startDate = new Date(startedAt)
    const endDate = new Date(endedAt)
    subscription =  await subscriptionRepository.findOne({
      where:
        [
          { users : { id: Equal(userId) }, status: 1,  startedAt: LessThan(startDate), endedAt: MoreThan(startDate), package: { id : Not('4e9a6ca3-96d5-44b0-b33b-ead4a15fe9e2')}},
          { users : { id: Equal(userId) }, status: 1,  startedAt: LessThan(endDate), endedAt: MoreThan(endDate), package: { id : Not('4e9a6ca3-96d5-44b0-b33b-ead4a15fe9e2')}},
          { users : { id: Equal(userId) }, status: 1,  startedAt: MoreThan(startDate), endedAt: LessThan(endDate), package: { id : Not('4e9a6ca3-96d5-44b0-b33b-ead4a15fe9e2')}},
          { users : { id: Equal(userId) }, status: 1,  startedAt: LessThan(startDate), endedAt: MoreThan(endDate), package: { id : Not('4e9a6ca3-96d5-44b0-b33b-ead4a15fe9e2')}},
        ]
    });
  }
  if(startedAt && endedAt && currentSubscriptionId) {
    const startDate = new Date(startedAt)
    const endDate = new Date(endedAt)
    subscription =  await subscriptionRepository.findOne({
      where:
        [
          { id: Not(currentSubscriptionId), status: 1,  startedAt: LessThan(startDate), endedAt: MoreThan(startDate), package: { id : Not('4e9a6ca3-96d5-44b0-b33b-ead4a15fe9e2')}},
          { id: Not(currentSubscriptionId), status: 1,  startedAt: LessThan(endDate), endedAt: MoreThan(endDate), package: { id : Not('4e9a6ca3-96d5-44b0-b33b-ead4a15fe9e2')}},
          { id: Not(currentSubscriptionId), status: 1,  startedAt: MoreThan(startDate), endedAt: LessThan(endDate), package: { id : Not('4e9a6ca3-96d5-44b0-b33b-ead4a15fe9e2')}},
          { id: Not(currentSubscriptionId), status: 1,  startedAt: LessThan(startDate), endedAt: MoreThan(endDate), package: { id : Not('4e9a6ca3-96d5-44b0-b33b-ead4a15fe9e2')}},
        ]
    });
  }
  return !!subscription;
}

export const getPaidSubscription = async (userId: string) => {
  const currentDate = new Date()
  return await subscriptionRepository.findOne({
    where: { users : { id: Equal(userId) }, status: 1,  startedAt: LessThan(currentDate), endedAt: MoreThan(currentDate), package: { id : Not('4e9a6ca3-96d5-44b0-b33b-ead4a15fe9e2')}},
    relations: ['package']
  });
};

export const getActiveSubscription = async (userId: string): Promise<SubscriptionEntity> => {
  const currentDate = new Date()
  let subscription =  await subscriptionRepository.findOne({
    where: { users : { id: Equal(userId) }, status: 1,  startedAt: LessThan(currentDate), endedAt: MoreThan(currentDate), package: { id : Not('4e9a6ca3-96d5-44b0-b33b-ead4a15fe9e2')}},
    relations: ['package']
  });
  if(subscription) return subscription;
  else return await subscriptionRepository.findOne({
      where: { users : { id: Equal(userId) }, status: 1, package: { id : Equal('4e9a6ca3-96d5-44b0-b33b-ead4a15fe9e2')}},
      relations: ['package']
    })
}