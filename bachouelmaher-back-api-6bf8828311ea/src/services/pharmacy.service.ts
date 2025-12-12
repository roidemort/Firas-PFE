import { Equal, FindOptionsWhere, Like } from "typeorm"

import { AppDataSource } from "@/orm/data-source";
import { PharmacyEntity } from "@/orm/entities/pharmacy.entity";
import { IQuery } from "@/interfaces/IOptions"
import { PharmacyUserEntity } from "@/orm/entities/pharmacy-user.entity"

const pharmacyRepository = AppDataSource.getRepository(PharmacyEntity);
const pharmacyUserRepository = AppDataSource.getRepository(PharmacyUserEntity);

export const createPharmacy = async (input: Partial<PharmacyEntity>) => {
  return await pharmacyRepository.save(pharmacyRepository.create(input));
};
export const savePharmacy = async (pharmacy: PharmacyEntity) => {
  return await pharmacyRepository.save(pharmacy);
};
export const createPharmacyUser = async (input: Partial<PharmacyUserEntity>) => {
  return await pharmacyUserRepository.save(pharmacyUserRepository.create(input));
};
export const savePharmacyUser = async (pharmacyUser: PharmacyUserEntity) => {
  return await pharmacyUserRepository.save(pharmacyUser);
};
export const findPharmacyById = async (pharmacyId: string, relations = {}, select: any = {}) => {
  return await pharmacyRepository.findOne({
    select: select,
    where: { id: Equal(pharmacyId) },
    relations: relations,
  });
};
export const findUserPharmacyById = async (userPharmacyId: string, relations = {}, select: any = {}) => {
  return await pharmacyUserRepository.findOne({
    select: select,
    where: { id: Equal(userPharmacyId) },
    relations: relations,
  });
};
export const findPharmacy = async (query: any, relations: any[] = []) => {
  return await pharmacyRepository.findOne({
    where: query,
    relations: relations,
  });
};

export const findPharmacyUser = async (query: any, relations: any[] = []) => {
  return await pharmacyUserRepository.findOne({
    where: query,
    relations: relations,
  });
};

export const findPharmacies = async (query: any, relations: any[] = [], select: any = {}, skip = 0, take = 10) => {
  return await pharmacyRepository.find({
    select: select,
    where: query,
    relations: relations,
    skip: skip,
    take: take,
  });
};

export const queryPharmacies = async (params: IQuery) => {
  return await pharmacyRepository.find({
    where: params.query,
    select: params.select,
    relations: params.relations,
    skip: params.skip,
    take: params.take,
    order: params.order
  });
}

export const queryPharmaciesUsers = async (params: IQuery) => {
  return await pharmacyUserRepository.find({
    where: params.query,
    select: params.select,
    relations: params.relations,
    skip: params.skip,
    take: params.take,
    order: params.order
  });
}

export const countPharmacies = async (query: any) => {
  return await pharmacyRepository.countBy(query as FindOptionsWhere<PharmacyEntity>);
};
export const countPharmaciesUsers = async (query: any) => {
  return await pharmacyUserRepository.countBy(query as FindOptionsWhere<PharmacyEntity>);
};
export const deletePharmacy = async (pharmacyId: string) => {
  return await pharmacyRepository.delete({ id: Equal(pharmacyId) });
};
