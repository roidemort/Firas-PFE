import { Equal, FindOptionsWhere } from 'typeorm';

import { AppDataSource } from "@/orm/data-source";
import { CertificateEntity } from "@/orm/entities/certificate.entity"
import { IQuery } from "@/interfaces/IOptions"

const certificateRepository = AppDataSource.getRepository(CertificateEntity);

export const createCertificate = async (input: Partial<CertificateEntity>) => {
  return await certificateRepository.save(certificateRepository.create(input));
};

export const saveCertificate = async (certificate: CertificateEntity) => {
  return await certificateRepository.save(certificate);
};

export const findCertificateById = async (certificateId: string, relations: any[] = []) => {
  return await certificateRepository.findOne({
    where: { id: Equal(certificateId) },
    relations: relations,
  });
};

export const findCertificate = async (query: any, relations: any[] = []) => {
  return await certificateRepository.findOne({
    where: query,
    relations: relations,
  });
};

export const findCertificates = async (query: any, relations: any[] = [], select: any = {}) => {
  return await certificateRepository.find({
    select: select,
    where: query,
    relations: relations,
  });
};

export const queryCertificates = async (params: IQuery) => {
  return await certificateRepository.find({
    where: params.query,
    select: params.select,
    relations: params.relations,
    skip: params.skip,
    take: params.take,
    order: params.order
  });
}

export const countCertificates = async (query: any) => {
  return await certificateRepository.countBy(query as FindOptionsWhere<CertificateEntity>);
};
export const deleteCertificate = async (certificateId: string) => {
  await certificateRepository.delete({ id: Equal(certificateId) });
};
