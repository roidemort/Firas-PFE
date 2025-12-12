import { Equal, FindOptionsWhere } from "typeorm"

import { AppDataSource } from "@/orm/data-source";
import { CapsuleEntity } from "@/orm/entities/capsule.entity";
import { IQuery } from "@/interfaces/IOptions"

const capsuleRepository = AppDataSource.getRepository(CapsuleEntity);

export const createCapsule = async (input: Partial<CapsuleEntity>) => {
  return await capsuleRepository.save(capsuleRepository.create(input));
};
export const saveCapsule = async (capsule: CapsuleEntity) => {
  return await capsuleRepository.save(capsule);
};

export const findCapsuleById = async (capsuleId: string, relations: any[] = []) => {
  return await capsuleRepository.findOne({
    where: { id: Equal(capsuleId) },
    relations: relations,
  });
};

export const findCapsule = async (query: any, relations: any[] = []) => {
  return await capsuleRepository.findOne({
    where: query,
    relations: relations,
  });
};

export const queryCapsules = async (params: IQuery) => {
  return await capsuleRepository.find({
    where: params.query,
    select: params.select,
    relations: params.relations,
    skip: params.skip,
    take: params.take,
    order: params.order
  });
}

export const findCapsules = async (query: any, relations: any[] = [], select: any = {}) => {
  return await capsuleRepository.find({
    select: select,
    where: query,
    relations: relations,
  });
};
export const deleteCapsule = async (capsuleId: string) => {
  return await capsuleRepository.delete({ id: Equal(capsuleId) });
};

export const countCapsules = async (query: any) => {
  return await capsuleRepository.countBy(query as FindOptionsWhere<CapsuleEntity>);
};