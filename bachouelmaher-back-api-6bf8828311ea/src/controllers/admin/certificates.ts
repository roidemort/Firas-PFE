import { NextFunction, Request, Response } from 'express';
import RedisService from "@/services/redis.service"
import {
  countCertificates,
  createCertificate,
  findCertificateById,
  queryCertificates, saveCertificate
} from "@/services/certificate.service"
import pick from "@/utils/pick"
import { IOptions } from "@/interfaces/IOptions"
import { organize } from "@/utils/organize"
import { Equal } from "typeorm"
import { findImage } from "@/services/image.service"


export const getAllCertificates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter = pick(req.query, ['text', 'status']);
    const options: IOptions = pick(req.query, ['orderBy', 'select', 'relations', 'take', 'page']);
    let params = organize(filter, options)
    const certificates = await queryCertificates(params);
    const count = await countCertificates(params.query);
    const listCertificates = { certificates, count }

    return res.customSuccess(200, 'List of certificates.', listCertificates, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
export const getDetailsCertificate = async (req: Request, res: Response, next: NextFunction) => {
  const certificateId = req.params.id;
  try {
    const certificate = await findCertificateById(certificateId, ['background', 'signature'])
    if (!certificate) {
      return  res.customSuccess(200, 'Error', {}, false);
    }
    return res.customSuccess( 200, 'Details of certificate.', certificate, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
export const addCertificate = async (req: Request, res: Response, next: NextFunction) => {
  const { name, title, sub_title, description, background, signature, positionTitle, positionSubTitle, positionDescription, positionSignature } = req.body;
  try {
    let Background = null
    let Signature = null
    if(background)  Background = await findImage({ id: Equal(background) })
    if(signature) Signature = await findImage({ id: Equal(signature) })

    const certificate = await createCertificate({
      name, title, sub_title, description, background: Background, signature: Signature, positionTitle, positionSubTitle, positionDescription,positionSignature
    });
    await RedisService.incCreateIfNotExist('certificates', 1)
    return res.customSuccess( 200, 'Certificate successfully created.', { certificate }, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
export const updateCertificate = async (req: Request, res: Response, next: NextFunction) => {
  const { name, title, sub_title, description, background, signature, positionTitle, positionSubTitle, positionDescription, positionSignature, status } = req.body;
  const certificateId = req.params.id;

  try {
    const Certificate = await findCertificateById(certificateId)

    if (!Certificate) {
      return  res.customSuccess(200, 'Error', {}, false);
    }

    if(background)  Certificate.background = await findImage({ id: Equal(background) })
    if(signature) Certificate.signature  = await findImage({ id: Equal(signature) })

    if (name) Certificate.name = name;
    if (title) Certificate.title = title;
    if (sub_title) Certificate.sub_title = sub_title;
    if (description) Certificate.description = description;

    if (positionTitle) Certificate.positionTitle = positionTitle;
    if (positionSubTitle) Certificate.positionSubTitle = positionSubTitle;
    if (positionDescription) Certificate.positionDescription = positionDescription;
    if (positionSignature) Certificate.positionSignature = positionSignature;

    if (status) Certificate.status = status;

    Certificate.updatedAt = new Date();

    await saveCertificate(Certificate);

    return  res.customSuccess( 200, 'Certificate successfully changed.', { certificate: Certificate }, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};