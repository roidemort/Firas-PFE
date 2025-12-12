import { Equal, FindOptionsWhere } from "typeorm"

import { AppDataSource } from "@/orm/data-source";
import { AdvertisementEntity } from "@/orm/entities/advertisement.entity";
import { IQuery } from "@/interfaces/IOptions"

const advertisementRepository = AppDataSource.getRepository(AdvertisementEntity);

export const createAdvertisement = async (input: Partial<AdvertisementEntity>) => {
  return await advertisementRepository.save(advertisementRepository.create(input));
};
export const saveAdvertisement = async (advertisement: AdvertisementEntity) => {
  return await advertisementRepository.save(advertisement);
};

export const findAdvertisementById = async (advertisementId: string, relations: any[] = []) => {
  return await advertisementRepository.findOne({
    where: { id: Equal(advertisementId) },
    relations: relations,
  });
};

export const findAdvertisement = async (query: any, relations: any[] = []) => {
  return await advertisementRepository.findOne({
    where: query,
    relations: relations,
  });
};

export const queryAdvertisements = async (params: IQuery) => {
  return await advertisementRepository.find({
    where: params.query,
    select: params.select,
    relations: params.relations,
    skip: params.skip,
    take: params.take,
    order: params.order
  });
}

export const findAdvertisements = async (query: any, relations: any[] = [], select: any = {}) => {
  return await advertisementRepository.find({
    select: select,
    where: query,
    relations: relations,
  });
};
export const deleteAdvertisement = async (advertisementId: string) => {
  return await advertisementRepository.delete({ id: Equal(advertisementId) });
};

export const countAdvertisements = async (query: any) => {
  return await advertisementRepository.countBy(query as FindOptionsWhere<AdvertisementEntity>);
};