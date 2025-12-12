import { Request, Response, NextFunction } from 'express';

import { Provider, Role } from "@/orm/entities/types";
import { findUser } from "@/services/user.service";
import { JwtPayload } from "@/types/JwtPayload";
import { createJwtToken } from "@/utils/createJwtToken";

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  try {
    const user = await findUser({ email: email });

    if (!user) {
      return res.customSuccess(200, 'Incorrect email or password', {}, false);
    }

    if (!user.checkIfPasswordMatch(password)) {
      return res.customSuccess(200, 'Incorrect email or password', {}, false);
    }

    if(user.role != "SUPER_ADMIN") {
      return res.customSuccess(200, 'Incorrect email or password', {}, false);
    }

    if(user.status != 1) {
      return res.customSuccess(203, 'Blocking', {}, false);
    }

    const jwtPayload: JwtPayload = {
      issuer: '/api/v1/auth/login',
      provider: user.provider as Provider,
      id: user.id,
      role: user.role as Role,
    };

    try {
      const token = createJwtToken(jwtPayload);
      return res.customSuccess(
        200,
        'Token successfully created.',
        { token: `Bearer ${token}`, user: user },
        true
      );
    } catch (err) {
      return res.customSuccess(200, 'Error', {}, false);
    }
  } catch (err) {
    return res.customSuccess(200, 'Error', {}, false);
  }
};
