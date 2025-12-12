import { Equal, FindOptionsWhere } from "typeorm"

import { AppDataSource } from "@/orm/data-source";
import { ImageEntity } from "@/orm/entities/image.entity";
import { IQuery } from "@/interfaces/IOptions"

const imageRepository = AppDataSource.getRepository(ImageEntity);

export const createImage = async (input: Partial<ImageEntity>) => {
  return await imageRepository.save(imageRepository.create(input));
};
export const saveImage = async (image: ImageEntity) => {
  return await imageRepository.save(image);
};

export const findImageById = async (imageId: string, relations: any[] = []) => {
  return await imageRepository.findOne({
    where: { id: Equal(imageId) },
    relations: relations,
  });
};

export const findImage = async (query: any, relations: any[] = []) => {
  return await imageRepository.findOne({
    where: query,
    relations: relations,
  });
};

export const queryImages = async (params: IQuery) => {
  return await imageRepository.find({
    where: params.query,
    select: params.select,
    relations: params.relations,
    skip: params.skip,
    take: params.take,
    order: params.order
  });
}

export const findImages = async (query: any, relations: any[] = [], select: any = {}) => {
  return await imageRepository.find({
    select: select,
    where: query,
    relations: relations,
  });
};
export const deleteImage = async (imageId: string) => {
  return await imageRepository.delete({ id: Equal(imageId) });
};

export const countImages = async (query: any) => {
  return await imageRepository.countBy(query as FindOptionsWhere<ImageEntity>);
};