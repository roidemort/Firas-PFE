import { Equal, FindOptionsWhere } from 'typeorm';

import { AppDataSource } from "@/orm/data-source";
import { TrainerEntity } from "@/orm/entities/trainer.entity"
import { IQuery } from "@/interfaces/IOptions"

const trainerRepository = AppDataSource.getRepository(TrainerEntity);

export const createTrainer = async (input: Partial<TrainerEntity>) => {
  return await trainerRepository.save(trainerRepository.create(input));
};

export const saveTrainer = async (trainer: TrainerEntity) => {
  return await trainerRepository.save(trainer);
};


export const findTrainerById = async (trainerId: string, relations: any[] = []) => {
  return await trainerRepository.findOne({
    where: { id: Equal(trainerId) },
    relations: relations,
  });
};

export const findTrainer = async (query: any, relations: any[] = []) => {
  return await trainerRepository.findOne({
    where: query,
    relations: relations,
  });
};

export const findTrainers = async (query: any, relations: any[] = [], select: any = {}) => {
  return await trainerRepository.find({
    select: select,
    where: query,
    relations: relations,
  });
};

export const queryTrainers = async (params: IQuery) => {
  return await trainerRepository.find({
    where: params.query,
    select: params.select,
    relations: params.relations,
    skip: params.skip,
    take: params.take,
    order: params.order,
  });
}

export const countTrainer = async (query: any) => {
  return await trainerRepository.countBy(query as FindOptionsWhere<TrainerEntity>);
};
export const deleteTrainer = async (trainerId: string) => {
  await trainerRepository.delete({ id: Equal(trainerId) });
};
