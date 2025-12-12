import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

import { ConstsUser } from "@/consts/ConstsUser";
import { ErrorValidation } from "@/utils/response/custom-error/types";

export const validatorResetPassword = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { password, token } = req.body;
  const errorsValidation: ErrorValidation[] = [];

  password = !password ? '' : password;
  token = !token ? '' : token;

  if (!validator.isLength(password, { min: ConstsUser.PASSWORD_MIN_CHAR })) {
    errorsValidation.push({
      password: `Password must be at least ${ConstsUser.PASSWORD_MIN_CHAR} characters`,
    });
  }

  if (validator.isEmpty(password)) {
    errorsValidation.push({ password: 'Password is required' });
  }

  if (validator.isEmpty(token)) {
    errorsValidation.push({ token: 'Token is invalid' });
  }

  if (errorsValidation.length !== 0) {
    return res.customSuccess(200, 'Validation', {errorsValidation}, false);
  }
  return next();
};
