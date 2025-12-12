import { NextFunction, Request, Response } from 'express';
import { findPackageById } from "@/services/package.service"

export const getDetails = async (req: Request, res: Response, next: NextFunction) => {
  const packageId = req.params.id;
  try {
    const pack = await findPackageById(packageId)
    if (!pack) {
      return  res.customSuccess(200, 'Error', {}, false);
    }
    return res.customSuccess( 200, 'Details of package.', pack, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
