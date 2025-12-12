import { Equal, FindOptionsWhere } from "typeorm";

import { AppDataSource } from "@/orm/data-source";
import { MetaEntity, SeoEntity } from "@/orm/entities/seo.entity";
import { IQuery } from "@/interfaces/IOptions"

const seoRepository = AppDataSource.getRepository(SeoEntity);
const metaRepository = AppDataSource.getRepository(MetaEntity);

export const createSeo = async (input: Partial<SeoEntity>) => {
  return await seoRepository.save(seoRepository.create(input));
};
export const createMeta = async (input: Partial<MetaEntity>) => {
  return await metaRepository.save(metaRepository.create(input));
};
export const saveSeo = async (seo: SeoEntity) => {
  return await seoRepository.save(seo);
};
export const findSeoById = async (seoId: string, relations = {}, select: any = {}) => {
  return await seoRepository.findOne({
    select: select,
    where: { id: Equal(seoId) },
    relations: relations,
  });
};
export const findSeo = async (query: any, relations = ['metaTags']) => {
  return await seoRepository.findOne(
    {
      where: query,
      relations: relations
    }
  );
};
export const countSeo = async (query: any) => {
  return await seoRepository.countBy(query as FindOptionsWhere<SeoEntity>);
};

export const querySeo = async (params: IQuery) => {
  return await seoRepository.find({
    where: params.query,
    select: params.select,
    relations: params.relations,
    skip: params.skip,
    take: params.take,
    order: params.order
  });
}
export const findSEOs = async (query: any, relations = ['metaTags']) => {
  return await seoRepository.find({
    where: query,
    relations: relations
  });
};
export const removeSeoById = async (seoId: string) => {
  return await seoRepository.delete({ id: Equal(seoId) });
};
export const removeMetaBySeo = async (seoId: string) => {
  return await metaRepository.delete({ seo: Equal(seoId) });
};
