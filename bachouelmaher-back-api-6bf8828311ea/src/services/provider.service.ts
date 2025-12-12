import { Equal, FindOptionsWhere } from 'typeorm';

import { AppDataSource } from "@/orm/data-source";
import { ProviderEntity } from "@/orm/entities/provider.entity"
import { IQuery } from "@/interfaces/IOptions"
import { compare } from "@/utils/compare"

const providerRepository = AppDataSource.getRepository(ProviderEntity);

export const createProvider = async (input: Partial<ProviderEntity>) => {
  return await providerRepository.save(providerRepository.create(input));
};

export const saveProvider = async (provider: ProviderEntity) => {
  return await providerRepository.save(provider);
};


export const findProviderById = async (providerId: string, relations: any[] = []) => {
  return await providerRepository.findOne({
    where: { id: Equal(providerId) },
    relations: relations,
  });
};

export const findProvider = async (query: any, relations: any[] = []) => {
  return await providerRepository.findOne({
    where: query,
    relations: relations,
  });
};

export const findProviders = async (query: any, relations: any[] = [], select: any = {}) => {
  return await providerRepository.find({
    select: select,
    where: query,
    relations: relations,
  });
};

export const queryProviders = async (params: IQuery) => {
  return await providerRepository.find({
    where: params.query,
    select: params.select,
    relations: params.relations,
    skip: params.skip,
    take: params.take,
    order: params.order,
  });
}

export const countProvider = async (query: any) => {
  return await providerRepository.countBy(query as FindOptionsWhere<ProviderEntity>);
};
export const deleteProvider = async (providerId: string) => {
  await providerRepository.delete({ id: Equal(providerId) });
};
