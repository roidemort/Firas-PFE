import { Request, Response, NextFunction } from 'express';
import { MulterError } from 'multer';

import { CustomError } from "@/utils/response/custom-error/CustomError";

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof MulterError) {
    res.status(500).json(err.JSON);
  }
  return res.status(err.HttpStatusCode).json(err.JSON);
};
