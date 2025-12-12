import jwt from 'jsonwebtoken';

import { JWT_EXPIRE, JWT_SECRET } from "@/core/config";
import { JwtPayload } from "@/types/JwtPayload";

export const createJwtToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRE,
  });
};