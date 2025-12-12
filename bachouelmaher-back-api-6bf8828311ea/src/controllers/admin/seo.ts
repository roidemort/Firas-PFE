import { NextFunction, Request, Response } from "express"
import pick from "@/utils/pick"
import { IOptions } from "@/interfaces/IOptions"
import { organize } from "@/utils/organize"
import { countSeo, createMeta, createSeo, findSeo, querySeo, removeMetaBySeo, saveSeo } from "@/services/seo.service"
import { MetaEntity } from "@/orm/entities/seo.entity"

export const getAllSeo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter = pick(req.query, ['text', 'status']);
    const options: IOptions = pick(req.query, ['orderBy', 'select', 'relations', 'take', 'page']);
    let params = organize(filter, options)
    const seo = await querySeo(params);
    const count = await countSeo(params.query);
    const keys = { seo, count }

    return res.customSuccess(200, 'List of seo.', keys, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
}

export const addSEO = async (req: Request, res: Response, next: NextFunction) => {
  const { permalink, title, robots, metaTags, status } = req.body;
  try {
    let newStatus = status ? 1 : 0;
    const seo = await createSeo({ permalink, title, robots, status: newStatus, mapping: 'Page' });
    metaTags.map(async (metaTag: Partial<MetaEntity>) => {
      metaTag.seo = seo;
      await createMeta(metaTag)
    })
    return res.customSuccess(200, 'SEO successfully created.', { seo }, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};

export const editSEO = async (req: Request, res: Response, next: NextFunction) => {
  const { permalink, title, robots, metaTags, status } = req.body;
  const seoId = req.params.id;
  try {
    const query = {
      id: seoId
    };
    const seo = await findSeo(query);

    if (!seo) {
      return res.customSuccess( 200, 'SEO not found.', {}, false);
    }
    if (permalink) seo.permalink = permalink;
    if (title) seo.title = title;
    if (robots) seo.robots = robots;
    if (status) seo.status = status;
    if (metaTags) {
      await removeMetaBySeo(seo.id)
      metaTags.map(async (metaTag: Partial<MetaEntity>) => {
        metaTag.seo = seo;
        await createMeta(metaTag)
      })
    };

    await saveSeo(seo);

    return res.customSuccess(200, 'SEO successfully changed.', { seo }, true);
  } catch (err) {
    return res.customSuccess( 200, 'Error.', {}, false);
  }
};

export const getSeoDetails = async (req: Request, res: Response, next: NextFunction) => {
  const seoId = req.params.id;
  try {
    const query = {
      id: seoId
    };
    const seo = await findSeo(query);
    if (!seo) {
      return  res.customSuccess(200, 'Error', {}, false);
    }
    return res.customSuccess( 200, 'Details of seo.', seo, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};