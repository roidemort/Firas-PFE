import { NextFunction, Request, Response } from 'express';
import { findProvider } from "@/services/provider.service"
import { Equal } from "typeorm"

export const getDetails = async (req: Request, res: Response, next: NextFunction) => {
  const providerId = req.params.id;
  try {
    const provider = await findProvider({ id: Equal(providerId) }, ['logo'])
    if (!provider) {
      return  res.customSuccess(200, 'Error', {}, false);
    }
    return res.customSuccess( 200, 'Details of provider.', provider, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
