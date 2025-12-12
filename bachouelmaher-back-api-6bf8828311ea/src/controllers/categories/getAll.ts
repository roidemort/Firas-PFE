import { NextFunction, Request, Response } from 'express';
import { countCategory, findCategories, findCategoriesTree, queryCategories } from "@/services/category.service"
import { IsNull, Not } from "typeorm"

export const getAllTree = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await findCategoriesTree();
    const count = await countCategory({});
    const listCategories = { categories, count }
    return res.customSuccess(200, 'List of categories.', listCategories, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await findCategories({}, [], { id: true, name: true });
    const count = await countCategory({});
    const listCategories = { categories, count }
    return res.customSuccess(200, 'List of categories.', listCategories, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
export const getAllWithProviders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.jwtPayload;
    const query = { status: 1, parent: IsNull() }
    const categories = await findCategories(query, ['courses', 'courses.provider'], { id: true, name: true, courses: true });
    const count = await countCategory(query);
    const returnedCategories = []
    await Promise.all(categories.map(async category => {
      let newCategory = { id: category.id, name: category.name, providers: []}
      category.courses.map(async course => {
        if(course.status == 1 && course.roles.includes(role)) newCategory.providers.push({ id: course.provider.id, name: course.provider.name })
      });
      returnedCategories.push(newCategory)
    }))
    const listCategories = { categories: returnedCategories, count }
    return res.customSuccess(200, 'List of categories.', listCategories, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
