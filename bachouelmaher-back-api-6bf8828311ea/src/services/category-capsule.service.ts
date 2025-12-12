import { Equal, FindOptionsWhere } from 'typeorm';

import { AppDataSource } from "@/orm/data-source";
import { CategoryCapsuleEntity } from "@/orm/entities/category-capsule.entity"
import { IQuery } from "@/interfaces/IOptions"
import { compare } from "@/utils/compare"

const categoryCapsuleRepository = AppDataSource.getRepository(CategoryCapsuleEntity);
const categoryCapsuleRepositoryTree = AppDataSource.manager.getTreeRepository(CategoryCapsuleEntity)

export const createCategoryCapsule = async (input: Partial<CategoryCapsuleEntity>) => {
  return await categoryCapsuleRepository.save(categoryCapsuleRepository.create(input));
};

export const saveCategoryCapsule = async (categoryCapsule: CategoryCapsuleEntity) => {
  return await categoryCapsuleRepository.save(categoryCapsule);
};


export const findCategoryCapsuleById = async (categoryCapsuleId: string, relations: any[] = []) => {
  return await categoryCapsuleRepository.findOne({
    where: { id: Equal(categoryCapsuleId) },
    relations: relations,
  });
};

export const findCategoryCapsule = async (query: any, relations: any[] = []) => {
  return await categoryCapsuleRepository.findOne({
    where: query,
    relations: relations,
  });
};

export const findCategoriesCapsules = async (query: any, relations: any[] = [], select: any = {}) => {
  return await categoryCapsuleRepository.find({
    select: select,
    where: query,
    relations: relations,
    order: {
      position: 'ASC',
    },
  });
};
export const findCategoriesCapsulesTree = async () => {
  return await categoryCapsuleRepositoryTree.findTrees()
};


export const queryCategoriesCapsules = async (params: IQuery) => {
  return await categoryCapsuleRepository.find({
    where: params.query,
    select: params.select,
    relations: params.relations,
    skip: params.skip,
    take: params.take,
    order: params.order,
  });
}

export const countCategoryCapsule = async (query: any) => {
  return await categoryCapsuleRepository.countBy(query as FindOptionsWhere<CategoryCapsuleEntity>);
};
export const deleteCategoryCapsule = async (categoryCapsuleId: string) => {
  await categoryCapsuleRepository.delete({ id: Equal(categoryCapsuleId) });
};
export const deleteCategoryCapsuleChild = async (childId: string) => {
  return categoryCapsuleRepositoryTree.delete({ id: Equal(childId)})
};
