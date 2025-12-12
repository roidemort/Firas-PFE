import { Request, Response, NextFunction } from 'express';

import { findUser, saveUser } from "@/services/user.service";

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { password, token } = req.body;

  try {
    const user = await findUser({ token: token });

    if (!user) {
      return res.customSuccess(200, 'Error', {}, false);
    }

    user.password = password;
    user.token = null;
    await user.hashPassword();
    await saveUser(user);
    return res.customSuccess(200, 'Password successfully changed.', {}, true);
  } catch (err) {
    return res.customSuccess(200, 'Error', {}, false);
  }
};
