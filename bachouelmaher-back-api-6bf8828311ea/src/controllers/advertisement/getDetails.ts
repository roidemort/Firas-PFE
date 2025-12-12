import { NextFunction, Request, Response } from 'express';
import { findAdvertisementById } from "@/services/advertisement.service"

export const getDetailsAdvertisement = async (req: Request, res: Response, next: NextFunction) => {
  const advertisementId = req.params.id;
  try {
    const advertisement = await findAdvertisementById(advertisementId,['image'])
    if (!advertisement) {
      return  res.customSuccess(200, 'Error', {}, false);
    }
    return res.customSuccess( 200, 'Details of advertisement.', advertisement, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
