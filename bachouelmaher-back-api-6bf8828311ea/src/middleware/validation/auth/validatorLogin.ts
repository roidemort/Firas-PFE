import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

import { ErrorValidation } from "@/utils/response/custom-error/types";

export const validatorLogin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { email, password } = req.body;
  const errorsValidation: ErrorValidation[] = [];

  email = !email ? '' : email;
  password = !password ? '' : password;

  if (!validator.isEmail(email)) {
    errorsValidation.push({ email: 'Email is invalid' });
  }

  if (validator.isEmpty(email)) {
    errorsValidation.push({ email: 'Email field is required' });
  }

  if (validator.isEmpty(password)) {
    errorsValidation.push({ password: 'Password field is required' });
  }

  if (errorsValidation.length !== 0) {
    return res.customSuccess(200, 'Validation', { errorsValidation }, false);
  }
  return next();
};
