import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

import { ErrorValidation } from "@/utils/response/custom-error/types";
import { GENDERS } from "@/consts/ConstsUser"

export const validatorEditProfile = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let { email, firstName, lastName, gender } = req.body;
  const errorsValidation: ErrorValidation[] = [];

  email = !email ? '' : email;
  firstName = !firstName ? '' : firstName;
  lastName = !lastName ? '' : lastName;
  gender = !gender ? '' : gender;

  if (!validator.isEmail(email)) {
    errorsValidation.push({ email: 'email is invalid' });
  }

  if (validator.isEmpty(email)) {
    errorsValidation.push({ email: 'email field is required' });
  }

  if (validator.isEmpty(firstName)) {
    errorsValidation.push({ firstName: 'firstName field is required' });
  }

  if (validator.isEmpty(lastName)) {
    errorsValidation.push({ lastName: 'lastName field is required' });
  }

  if (!validator.isIn(gender, GENDERS)) {
    errorsValidation.push({ gender: 'gender is invalid' });
  }

  if (errorsValidation.length !== 0) {
    return res.customSuccess(200, 'Validation', {errorsValidation}, false);
  }
  return next();
};
