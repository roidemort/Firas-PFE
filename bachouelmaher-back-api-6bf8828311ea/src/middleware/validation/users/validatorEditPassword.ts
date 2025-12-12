import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

import { ConstsUser } from "@/consts/ConstsUser";
import { ErrorValidation } from "@/utils/response/custom-error/types";

export const validatorEditPassword = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { password, newPassword } = req.body;

  const errorsValidation: ErrorValidation[] = [];

  password = !password ? '' : password;
  newPassword = !newPassword ? '' : newPassword;

  if (validator.isEmpty(password)) {
    errorsValidation.push({ password: 'Password is required' });
  }

  if (validator.isEmpty(newPassword)) {
    errorsValidation.push({ newPassword: 'new password is required' });
  }

  if (!validator.isLength(password, { min: ConstsUser.PASSWORD_MIN_CHAR })) {
    errorsValidation.push({
      password: `Password must be at least ${ConstsUser.PASSWORD_MIN_CHAR} characters`,
    });
  }

  if (!validator.isLength(newPassword, { min: ConstsUser.PASSWORD_MIN_CHAR })) {
    errorsValidation.push({
      newPassword: `new password must be at least ${ConstsUser.PASSWORD_MIN_CHAR} characters`,
    });
  }



  if (errorsValidation.length !== 0) {
    return res.customSuccess(200, 'Validation', { errorsValidation }, false);
  }
  return next();
};
