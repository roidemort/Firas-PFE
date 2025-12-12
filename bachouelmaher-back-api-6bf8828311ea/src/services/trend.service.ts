import { Equal, FindOptionsWhere } from 'typeorm';

import { AppDataSource } from "@/orm/data-source";
import { TrendEntity } from "@/orm/entities/trend.entity"
import { IQuery } from "@/interfaces/IOptions"

const trendRepository = AppDataSource.getRepository(TrendEntity);

export const createTrend = async (input: Partial<TrendEntity>) => {
  return await trendRepository.save(trendRepository.create(input));
};

export const saveTrend = async (trend: TrendEntity) => {
  return await trendRepository.save(trend);
};

export const findTrendById = async (trendId: string, relations: any[] = []) => {
  return await trendRepository.findOne({
    where: { id: Equal(trendId) },
    relations: relations,
  });
};

export const findTrend = async (query: any, relations: any[] = []) => {
  return await trendRepository.findOne({
    where: query,
    relations: relations,
  });
};

export const findTrends = async (query: any, relations: any[] = [], select: any = {}) => {
  return await trendRepository.find({
    select: select,
    where: query,
    relations: relations,
  });
};

export const queryTrends = async (params: IQuery) => {
  return await trendRepository.find({
    where: params.query,
    select: params.select,
    relations: params.relations,
    skip: params.skip,
    take: params.take,
    order: params.order
  });
}

export const countTrends = async (query: any) => {
  return await trendRepository.countBy(query as FindOptionsWhere<TrendEntity>);
};
export const deleteTrend = async (trendId: string) => {
  await trendRepository.delete({ id: Equal(trendId) });
};
