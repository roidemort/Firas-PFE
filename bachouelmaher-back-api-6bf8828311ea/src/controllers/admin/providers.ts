import { NextFunction, Request, Response } from "express"
import { findImage } from "@/services/image.service"
import { Equal, Like } from "typeorm"
import slugify from "slugify"
import { countProvider, createProvider, deleteProvider, findProvider, saveProvider } from "@/services/provider.service"
import RedisService from "@/services/redis.service"
import { createMeta, createSeo, findSeo, removeMetaBySeo, removeSeoById, saveSeo } from "@/services/seo.service"
import { MetaEntity } from "@/orm/entities/seo.entity"

export const addProvider = async (req: Request, res: Response, next: NextFunction) => {
  const { name, position, is_searchable, status, logo } = req.body;
  try {
    let newStatus = status ? 1 : 0;
    let newIs_searchable = is_searchable ? 1 : 0;

    let Logo = null
    if(logo) Logo = await findImage({ id: Equal(logo) })

    let slug = slugify(name,
      {
        replacement: '-',
        remove: undefined,
        lower: true,
        strict: false,
        locale: 'fr',
        trim: true
      })
    const providerBySlug = await findProvider({ slug: Equal(slug) })

    if (providerBySlug) {
      const countProviderBySlug = await countProvider({ slug: Like(`%${slug}%`) })
      slug = slugify(providerBySlug.slug + '-' + countProviderBySlug)
    }

    const provider = await createProvider({
      name, position, is_searchable: newIs_searchable, status: newStatus, logo: Logo, slug
    });
    await RedisService.incCreateIfNotExist('providers', 1)
    return res.customSuccess( 200, 'Provider successfully created.', { provider }, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
export const removeProvider = async (req: Request, res: Response, next: NextFunction) => {
  const providerId = req.params.id;
  try {
    const provider = await findProvider({ id: Equal(providerId) });

    if (!provider) {
      return  res.customSuccess(200, 'Error', {}, false);
    }

    await deleteProvider(providerId);
    await RedisService.incCreateIfNotExist('providers', -1)
    return res.customSuccess( 200, 'Provider successfully deleted.', true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
export const updateProvider = async (req: Request, res: Response, next: NextFunction) => {
  const { name, position, is_searchable, status, logo } = req.body;
  const providerId = req.params.id;

  try {
    const Provider = await findProvider({ id: Equal(providerId) })

    if (!Provider) {
      return  res.customSuccess(200, 'Error', {}, false);
    }

    if (name) Provider.name = name;
    if (position) Provider.position = position;
    Provider.is_searchable = is_searchable ? 1 : 0
    Provider.status = status ? 1 : 0

    if(logo) {
      Provider.logo = await findImage({ id: Equal(logo) });
    }

    Provider.updatedAt = new Date();

    await saveProvider(Provider);

    return  res.customSuccess( 200, 'Provider successfully changed.', { provider: Provider }, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};