import { NextFunction, Request, Response } from 'express';
import { findTrainerById } from "@/services/trainer.service"

export const getDetails = async (req: Request, res: Response, next: NextFunction) => {
  const trainerId = req.params.id;
  try {
    const trainer = await findTrainerById(trainerId, ['providers'])
    if (!trainer) {
      return  res.customSuccess(200, 'Error', {}, false);
    }
    return res.customSuccess( 200, 'Details of trainer.', trainer, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
