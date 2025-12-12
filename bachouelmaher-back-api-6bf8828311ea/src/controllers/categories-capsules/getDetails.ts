import { NextFunction, Request, Response } from 'express';
import { findCategoryCapsuleById } from "@/services/category-capsule.service"

export const getDetailsCategoryCapsule = async (req: Request, res: Response, next: NextFunction) => {
  const categoryId = req.params.id;
  try {
    const category = await findCategoryCapsuleById(categoryId, ['parent'])
    if (!category) {
      return  res.customSuccess(200, 'Error', {}, false);
    }
    return res.customSuccess( 200, 'Details of category.', category, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
