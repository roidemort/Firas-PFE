import { Equal, FindOptionsWhere } from 'typeorm';

import { AppDataSource } from "@/orm/data-source";
import { CategoryEntity } from "@/orm/entities/category.entity"
import { IQuery } from "@/interfaces/IOptions"
import { compare } from "@/utils/compare"

const categoryRepository = AppDataSource.getRepository(CategoryEntity);
const categoryRepositoryTree = AppDataSource.manager.getTreeRepository(CategoryEntity)

export const createCategory = async (input: Partial<CategoryEntity>) => {
  return await categoryRepository.save(categoryRepository.create(input));
};

export const saveCategory = async (category: CategoryEntity) => {
  return await categoryRepository.save(category);
};


export const findCategoryById = async (categoryId: string, relations: any[] = []) => {
  return await categoryRepository.findOne({
    where: { id: Equal(categoryId) },
    relations: relations,
  });
};

export const findCategory = async (query: any, relations: any[] = []) => {
  return await categoryRepository.findOne({
    where: query,
    relations: relations,
  });
};

export const findCategories = async (query: any, relations: any[] = [], select: any = {}) => {
  return await categoryRepository.find({
    select: select,
    where: query,
    relations: relations,
    order: {
      position: 'ASC',
    },
  });
};
export const findCategoriesTree = async () => {
  return await categoryRepositoryTree.findTrees().then(tree => {
    return tree.sort( compare )
  })
};


export const queryCategories = async (params: IQuery) => {
  return await categoryRepository.find({
    where: params.query,
    select: params.select,
    relations: params.relations,
    skip: params.skip,
    take: params.take,
    order: params.order,
  });
}

export const countCategory = async (query: any) => {
  return await categoryRepository.countBy(query as FindOptionsWhere<CategoryEntity>);
};
export const deleteCategory = async (categoryId: string) => {
  await categoryRepository.delete({ id: Equal(categoryId) });
};
export const deleteCategoryChild = async (childId: string) => {
  return categoryRepositoryTree.delete({ id: Equal(childId)})
};
