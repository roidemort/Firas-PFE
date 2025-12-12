import { NextFunction, Request, Response } from 'express';
import { findCapsuleById } from "@/services/capsule.service"

export const getDetailsCapsule = async (req: Request, res: Response, next: NextFunction) => {
  const capsuleId = req.params.id;
  try {
    const capsule = await findCapsuleById(capsuleId, ['category' , 'provider'])
    if (!capsule) {
      return  res.customSuccess(200, 'Error', {}, false);
    }
    return res.customSuccess( 200, 'Details of capsule.', capsule, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
