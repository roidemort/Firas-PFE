import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

import { ErrorValidation } from "@/utils/response/custom-error/types";

export const validatorForgotPassword = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { email } = req.body;
  const errorsValidation: ErrorValidation[] = [];

  email = !email ? '' : email;

  if (!validator.isEmail(email)) {
    errorsValidation.push({ email: 'Email is invalid' });
  }

  if (validator.isEmpty(email)) {
    errorsValidation.push({ email: 'Email field is required' });
  }

  if (errorsValidation.length !== 0) {
    return res.customSuccess(200, 'Validation', {errorsValidation}, false);
  }
  return next();
};
