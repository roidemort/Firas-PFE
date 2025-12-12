import { NextFunction, Request, Response } from 'express';
import { findUserById } from "@/services/user.service";
import { findCategory } from "@/services/category.service"
import { Equal } from "typeorm"

export const getDetails = async (req: Request, res: Response, next: NextFunction) => {
  const categoryId = req.params.id;
  try {
    const category = await findCategory({ id: Equal(categoryId) }, ['parent', 'banner', 'logo', 'seo', 'seo.metaTags'])
    if (!category) {
      return  res.customSuccess(200, 'Error', {}, false);
    }
    return res.customSuccess( 200, 'Details of category.', category, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
