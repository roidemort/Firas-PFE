import { NextFunction, Request, Response } from "express";
import { findSeo } from "@/services/seo.service"

export const getDetailsByPath = async (req: Request, res: Response, next: NextFunction) => {
  const { permalink } = req.body;
  try {
    let seo = await findSeo({ permalink, mapping: 'Page' })
    if(!seo) {
      seo = await findSeo( { permalink : 'default' })
    }
    return res.customSuccess(200, 'Details of SEO.', seo, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
}