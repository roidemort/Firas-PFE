import { NextFunction, Request, Response } from "express"
import { Equal } from "typeorm"
import { findImage } from "@/services/image.service"
import RedisService from "@/services/redis.service"
import { createPartner, deletePartner, findPartnerById, savePartner } from "@/services/partner.service"

export const addPartner = async (req: Request, res: Response, next: NextFunction) => {
  const { name, position, logo, status } = req.body;
  try {
    let newStatus = status ? 1 : 0;
    const Logo = await findImage({ id: Equal(logo) })
    const partner = await createPartner({
      name, position, logo: Logo, status: newStatus,
    });
    await RedisService.incCreateIfNotExist('partners', 1)
    return res.customSuccess( 200, 'Partner successfully created.', { partner }, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
export const updatePartner = async (req: Request, res: Response, next: NextFunction) => {
  const { name, position, logo, status } = req.body;
  const partnerId = req.params.id;

  try {
    const Partner = await findPartnerById(partnerId)

    if (!Partner) {
      return  res.customSuccess(200, 'Error', {}, false);
    }

    if (name) Partner.name = name;
    if (position) Partner.position = position;
    if (status) {
      Partner.status = status == 1 ? 1 : 0
    }
    if(logo) {
      Partner.logo = await findImage({ id: Equal(logo) });
    }
    Partner.updatedAt = new Date();

    await savePartner(Partner);

    return  res.customSuccess( 200, 'Partner successfully changed.', { partner: Partner }, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
export const removePartner = async (req: Request, res: Response, next: NextFunction) => {
  const partnerId = req.params.id;
  try {
    const Partner = await findPartnerById(partnerId);

    if (!Partner) {
      return  res.customSuccess(200, 'Error', {}, false);
    }

    await deletePartner(partnerId);
    await RedisService.incCreateIfNotExist('partners', -1)
    return res.customSuccess( 200, 'Partner successfully deleted.', true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};