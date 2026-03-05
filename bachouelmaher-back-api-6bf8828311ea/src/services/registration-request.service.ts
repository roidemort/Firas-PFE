import { Equal, FindOptionsWhere } from "typeorm"

import { AppDataSource } from "@/orm/data-source";
import { RegistrationRequestEntity } from "@/orm/entities/registration-request.entity";
import { IQuery, IOptions } from "@/interfaces/IOptions"
import { organize } from "@/utils/organize"
import pick from "@/utils/pick"

const registrationRequestRepository = AppDataSource.getRepository(RegistrationRequestEntity);

export const createRegistrationRequest = async (input: Partial<RegistrationRequestEntity>) => {
  return await registrationRequestRepository.save(registrationRequestRepository.create(input));
};

export const saveRegistrationRequest = async (request: RegistrationRequestEntity) => {
  return await registrationRequestRepository.save(request);
};

export const findRegistrationRequestById = async (id: string, relations = {}, select: any = {}) => {
  return await registrationRequestRepository.findOne({
    select: select,
    where: { id: Equal(id) },
    relations: relations,
  });
};

export const findRegistrationRequest = async (query: any, relations: any[] = []) => {
  return await registrationRequestRepository.findOne({
    where: query,
    relations: relations,
  });
};

export const queryRegistrationRequests = async (params: IQuery) => {
  return await registrationRequestRepository.find({
    where: params.query,
    order: params.order,
    take: params.take,
    skip: params.skip,
    relations: params.relations,
    select: params.select,
  });
};

export const countRegistrationRequests = async (query: FindOptionsWhere<RegistrationRequestEntity> | FindOptionsWhere<RegistrationRequestEntity>[]) => {
  return await registrationRequestRepository.count({
    where: query,
  });
};
