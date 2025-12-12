import { NextFunction, Request, Response } from 'express';
import { findPartnerById } from "@/services/partner.service"

export const getDetails = async (req: Request, res: Response, next: NextFunction) => {
  const partnerId = req.params.id;
  try {
    const partner = await findPartnerById(partnerId, ['logo'])
    if (!partner) {
      return  res.customSuccess(200, 'Error', {}, false);
    }
    return res.customSuccess( 200, 'Details of partner.', partner, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
