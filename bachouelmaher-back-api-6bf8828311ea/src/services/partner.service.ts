import { Equal, FindOptionsWhere } from 'typeorm';

import { AppDataSource } from "@/orm/data-source";
import { PartnerEntity } from "@/orm/entities/partner.entity"
import { IQuery } from "@/interfaces/IOptions"

const partnerRepository = AppDataSource.getRepository(PartnerEntity);

export const createPartner = async (input: Partial<PartnerEntity>) => {
  return await partnerRepository.save(partnerRepository.create(input));
};

export const savePartner = async (partner: PartnerEntity) => {
  return await partnerRepository.save(partner);
};

export const findPartnerById = async (partnerId: string, relations: any[] = []) => {
  return await partnerRepository.findOne({
    where: { id: Equal(partnerId) },
    relations: relations,
  });
};

export const findPartner = async (query: any, relations: any[] = []) => {
  return await partnerRepository.findOne({
    where: query,
    relations: relations,
  });
};

export const findPartners = async (query: any, relations: any[] = [], select: any = {}) => {
  return await partnerRepository.find({
    select: select,
    where: query,
    relations: relations,
  });
};

export const queryPartners = async (params: IQuery) => {
  return await partnerRepository.find({
    where: params.query,
    select: params.select,
    relations: params.relations,
    skip: params.skip,
    take: params.take,
    order: params.order
  });
}

export const countPartners = async (query: any) => {
  return await partnerRepository.countBy(query as FindOptionsWhere<PartnerEntity>);
};
export const deletePartner = async (partnerId: string) => {
  await partnerRepository.delete({ id: Equal(partnerId) });
};
