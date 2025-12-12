import { Equal, FindOptionsWhere } from 'typeorm';

import { AppDataSource } from "@/orm/data-source";
import { PackageEntity } from "@/orm/entities/package.entity"
import { IQuery } from "@/interfaces/IOptions"

const packageRepository = AppDataSource.getRepository(PackageEntity);

export const createPackage = async (input: Partial<PackageEntity>) => {
  return await packageRepository.save(packageRepository.create(input));
};

export const savePackage = async (pack: PackageEntity) => {
  return await packageRepository.save(pack);
};

export const findPackageById = async (packageId: string, relations: any[] = []) => {
  return await packageRepository.findOne({
    where: { id: Equal(packageId) },
    relations: relations,
  });
};

export const findPackage = async (query: any, relations: any[] = []) => {
  return await packageRepository.findOne({
    where: query,
    relations: relations,
  });
};

export const findPackages = async (query: any, relations: any[] = [], select: any = {}) => {
  return await packageRepository.find({
    select: select,
    where: query,
    relations: relations,
  });
};

export const queryPackages = async (params: IQuery) => {
  return await packageRepository.find({
    where: params.query,
    select: params.select,
    relations: params.relations,
    skip: params.skip,
    take: params.take,
    order: params.order
  });
}

export const countPackages = async (query: any) => {
  return await packageRepository.countBy(query as FindOptionsWhere<PackageEntity>);
};
export const deletePackage = async (packageId: string) => {
  await packageRepository.delete({ id: Equal(packageId) });
};
