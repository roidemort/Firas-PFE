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

export const addCategory = async (req: Request, res: Response, next: NextFunction) => {
  const { name, position, is_searchable, status, parent, banner, logo, icon, seo } = req.body;
  try {
    let newStatus = status ? 1 : 0;
    let newStatusSeo = status ? 0 : 1;
    let Banner = null
    let Logo = null
    if(banner)  Banner = await findImage({ id: Equal(banner) })
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
    const categoryBySlug = await findCategory({ slug: Equal(slug) })

    if (categoryBySlug) {
      const countCategoryBySlug = await countCategory({ slug: Like(`%${slug}%`) })
      slug = slugify(categoryBySlug.slug + '-' + countCategoryBySlug)
    }
    let selectedParent = null
    if(parent) {
      const Category = await findCategory({ id: Equal(parent) })
      if (!Category) {
        return  res.customSuccess(200, 'Error', {}, false);
      }
      selectedParent = Category
    }
    let createdSeo = null
    if(seo) {
      createdSeo = await createSeo({
        permalink: slug,
        title: seo.title,
        robots: seo.robots,
        status: newStatusSeo,
        mapping: "Category"
      })
      seo.metaTags.map(async (metaTag: Partial<MetaEntity>) => {
        metaTag.seo = createdSeo;
        await createMeta(metaTag)
      })
    }

    const category = await createCategory({
      name, position, is_searchable, status: newStatus, parent: selectedParent, icon, banner: Banner, logo: Logo, slug, seo: createdSeo
    });
    await RedisService.incCreateIfNotExist('categories', 1)
    return res.customSuccess( 200, 'Category successfully created.', { category }, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
export const removeCategory = async (req: Request, res: Response, next: NextFunction) => {
  const categoryId = req.params.id;
  try {
    const category = await findCategory({ id: Equal(categoryId) });

    if (!category) {
      return  res.customSuccess(200, 'Error', {}, false);
    }

    await deleteCategory(categoryId);
    await RedisService.incCreateIfNotExist('categories', -1)
    return res.customSuccess( 200, 'Category successfully deleted.', true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  const { name, position, is_searchable, status, parent, banner, logo, icon, seo } = req.body;
  const categoryId = req.params.id;

  try {
    const Category = await findCategory({ id: Equal(categoryId) })

    if (!Category) {
      return  res.customSuccess(200, 'Error', {}, false);
    }

    if (name) Category.name = name;
    if (position) Category.position = position;
    if (is_searchable) Category.is_searchable = is_searchable;
    if (status) Category.status = status;
    if(parent) {
      const parentCategory = await findCategory({ id: Equal(parent) })
      if (!parentCategory) {
        return  res.customSuccess(200, 'Error', {}, false);
      }
      Category.parent = parentCategory
    }
    if (icon) Category.icon = icon;
    let selectedSeo = await findSeo({ permalink: Equal(Category.slug), mapping: 'Category' })
    if (seo) {
      if(!selectedSeo) {
        selectedSeo = await createSeo({ permalink: Category.slug, status: 0, mapping: 'Category', title: seo.title, robots: seo.robots });
      } else {
        selectedSeo.title = seo.title
        selectedSeo.robots = seo.robots
        await saveSeo(selectedSeo);
      }

      if(seo.metaTags && seo.metaTags.length) {
        seo.metaTags.map(async (metaTag: Partial<MetaEntity>) => {
          metaTag.seo = selectedSeo;
          await createMeta(metaTag)
        })
      } else {
        await removeMetaBySeo(selectedSeo.id)
      }
      Category.seo = selectedSeo
    } else {
      Category.seo = null
      if(selectedSeo) {
        await removeMetaBySeo(selectedSeo.id)
        await removeSeoById(selectedSeo.id)
      }
    }
    if(banner) {
      Category.banner = await findImage({ id: Equal(banner) });
    }
    if(logo) {
      Category.logo = await findImage({ id: Equal(logo) });
    }

    Category.updatedAt = new Date();

    await saveCategory(Category);

    return  res.customSuccess( 200, 'Category successfully changed.', { category: Category }, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};