import { NextFunction, Request, Response } from 'express';
import {
  countCategoryCapsule,
  findCategoriesCapsules,
  findCategoriesCapsulesTree
} from "@/services/category-capsule.service"
import { IsNull, Not } from "typeorm"

export const getAllTreeCategoriesCapsules = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await findCategoriesCapsulesTree();
    const count = await countCategoryCapsule({});
    const listCategories = { categories, count }
    return res.customSuccess(200, 'List of categories.', listCategories, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
export const getAllWithProviders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = { status: 1, parent: IsNull() }
    const categories = await findCategoriesCapsules(query, ['capsules', 'capsules.provider'], { id: true, name: true, capsules: true });
    const count = await countCategoryCapsule(query);
    const returnedCategories = []
    await Promise.all(categories.map(async category => {
      let newCategory = { id: category.id, name: category.name, providers: []}
      category.capsules.map(async capsule => {
        if(capsule.status == 1) newCategory.providers.push({ id: capsule.provider.id, name: capsule.provider.name })
      });
      returnedCategories.push(newCategory)
    }))
    const listCategories = { categories: returnedCategories, count }
    return res.customSuccess(200, 'List of categories.', listCategories, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
