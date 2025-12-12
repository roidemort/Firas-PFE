import { NextFunction, Request, Response } from 'express';
import { findTrendById } from "@/services/trend.service"

export const getDetails = async (req: Request, res: Response, next: NextFunction) => {
  const trendId = req.params.id;
  try {
    const trend = await findTrendById(trendId, ['image'])
    if (!trend) {
      return  res.customSuccess(200, 'Error', {}, false);
    }
    return res.customSuccess( 200, 'Details of trend.', trend, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
