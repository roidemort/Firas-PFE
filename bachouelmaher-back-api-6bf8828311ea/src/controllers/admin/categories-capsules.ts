import { NextFunction, Request, Response } from "express"
import { findImage } from "@/services/image.service"
import { Equal, Like } from "typeorm"
import slugify from "slugify"
import {
  countCategory,
  createCategory,
  deleteCategory,
  findCategory,
  saveCategory
} from "@/services/category.service"
import RedisService from "@/services/redis.service"
import { createMeta, createSeo, findSeo, removeMetaBySeo, removeSeoById, saveSeo } from "@/services/seo.service"
import { MetaEntity } from "@/orm/entities/seo.entity"
import { createCategoryCapsule, findCategoryCapsuleById, saveCategoryCapsule } from "@/services/category-capsule.service"

export const addCategoryCapsule = async (req: Request, res: Response, next: NextFunction) => {
  const { name, position, status, parent } = req.body;
  try {
    let newStatus = status ? 1 : 0;

    let selectedParent = null
    if(parent) {
      const Category = await findCategoryCapsuleById(parent)
      if (!Category) {
        return  res.customSuccess(200, 'Error', {}, false);
      }
      selectedParent = Category
    }

    const category = await createCategoryCapsule({
      name, position, status: newStatus, parent: selectedParent
    });
    await RedisService.incCreateIfNotExist('categories-capsules', 1)
    return res.customSuccess( 200, 'Category successfully created.', { category }, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
export const updateCategoryCapsule = async (req: Request, res: Response, next: NextFunction) => {
  const { name, position, status, parent } = req.body;
  const categoryId = req.params.id;

  try {
    const Category = await findCategoryCapsuleById(categoryId)

    if (!Category) {
      return  res.customSuccess(200, 'Error', {}, false);
    }

    if (name) Category.name = name;
    if (position) Category.position = position;

    if (status) Category.status = status;
    if(parent) {
      const parentCategory = await findCategoryCapsuleById(parent)
      if (!parentCategory) {
        return  res.customSuccess(200, 'Error', {}, false);
      }
      Category.parent = parentCategory
    }

    Category.updatedAt = new Date();

    await saveCategoryCapsule(Category);

    return  res.customSuccess( 200, 'Category successfully changed.', { category: Category }, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};