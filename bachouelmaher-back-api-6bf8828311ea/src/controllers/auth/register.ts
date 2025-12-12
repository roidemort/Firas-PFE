import { Request, Response, NextFunction } from 'express';

import { Provider, Role } from "@/orm/entities/types";
import {
  countUsers,
  createUser,
  findUserByEmail, linkUserToFreePlan,
  saveUser
} from "@/services/user.service"
import { JwtPayload } from "@/types/JwtPayload";
import { createJwtToken } from "@/utils/createJwtToken";
import RedisService from "@/services/redis.service"
import { findPharmacyUser, savePharmacyUser } from "@/services/pharmacy.service"
import { Equal } from "typeorm"

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { key, firstName, lastName, gender, birthday, tel, email, password } = req.body;

  try {
    const user = await findUserByEmail(email);

    if (user) {
      return res.customSuccess(
        200,
        `email : Email '${user.email}' already exists`,
        {},
        false
      );
    }

    const pharmacyUser = await findPharmacyUser({ key: Equal(key) });

    if (!pharmacyUser) {
      return  res.customSuccess(200, 'Error', {}, false);
    }

    if(pharmacyUser.status != 1) {
      return  res.customSuccess(200, 'Error', {}, false);
    }

    try {
      const newUser = await createUser({
        email: email.toLowerCase(),
        password,
        provider: 'EMAIL',
        role: pharmacyUser.role,
        key: pharmacyUser,
        firstName: firstName,
        lastName: lastName,
        gender: gender,
        birthday: birthday,
        tel: tel,
      });

      pharmacyUser.user = newUser;
      pharmacyUser.status = 3;
      await savePharmacyUser(pharmacyUser);

      await saveUser(newUser);
      await RedisService.incCreateIfNotExist('users', 1)
      await linkUserToFreePlan(newUser)
      const jwtPayload: JwtPayload = {
        issuer: '/api/v1/auth/login',
        provider: newUser.provider as Provider,
        id: newUser.id,
        role: newUser.role as Role,
      };
      try {
        const token = createJwtToken(jwtPayload);
        return res.customSuccess(
          200,
          'User successfully created.',
          { token: `Bearer ${token}`, user: newUser },
          true
        );
      } catch (err) {
        return res.customSuccess(200, "Token can't be created", {}, false);
      }
    } catch (err) {
      return res.customSuccess(
        200,
        `User '${email}' can't be created`,
        {},
        false
      );
    }
  } catch (err) {
    return res.customSuccess(
      200,
      `User '${email}' can't be created`,
      {},
      false
    );
  }
};
