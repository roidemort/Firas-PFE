import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { JwtPayload } from "@/types/JwtPayload";
import { createJwtToken } from "@/utils/createJwtToken";
import { findUserById } from "@/services/user.service"
import { CustomError } from "@/utils/response/custom-error/CustomError"

import { JWT_SECRET } from '@/core/config';

export const checkJwt = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    return next(new CustomError(401, 'Unauthorized', 'Authorization Required'))
  }

  const token = authHeader.split(' ')[1];
  let jwtPayload: { [key: string]: any };
  try {
    jwtPayload = jwt.verify(token, JWT_SECRET as string) as {
      [key: string]: any;
    };
    ['iat', 'exp'].forEach((keyToRemove) => delete jwtPayload[keyToRemove]);
    req.jwtPayload = jwtPayload as JwtPayload;
  } catch (err) {
    return next(new CustomError(401, 'Unauthorized', 'Authorization Required'))
  }

  try {
    const { id } = req.jwtPayload;
    const user = await findUserById(id, {} , { status : true });
    if(user.status != 1) {
      return next(new CustomError(405, 'Blocking', 'Blocking Api Error'))
    }
  } catch (e) {
    return next(new CustomError(405, 'Blocking', 'Blocking Api Error'))
  }

  try {
    // Refresh and send a new token on every request
    const newToken = createJwtToken(jwtPayload as JwtPayload);
    res.setHeader('token', `Bearer ${newToken}`);
    return next();
  } catch (err) {
    return next(new CustomError(401, 'Unauthorized', 'Authorization Required'))
  }
};
export const checkIsLoggedInUser = (
  req: Request,
  res: Response,
  next: NextFunction
): boolean => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    return false;
  }

  const token = authHeader.split(' ')[1];
  let jwtPayload: { [key: string]: any };
  try {
    jwtPayload = jwt.verify(token, JWT_SECRET as string) as {
      [key: string]: any;
    };
    ['iat', 'exp'].forEach((keyToRemove) => delete jwtPayload[keyToRemove]);
    req.jwtPayload = jwtPayload as JwtPayload;
  } catch (err) {
    return false;
  }
  return true;
};
