import { Request, Response, NextFunction } from 'express';

import {  findUserById, saveUser } from "@/services/user.service"

export const editPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { password, newPassword } = req.body;
  const { id } = req.jwtPayload;
  try {
    const user = await findUserById(id);
    if (!user || !user.checkIfPasswordMatch(password)) {
      return res.customSuccess(200, 'Error', {}, false);
    }
    user.password = newPassword;
    await user.hashPassword();
    await saveUser(user);
    return res.customSuccess(200, 'Password successfully changed.', {}, true);
  } catch (err) {
    return res.customSuccess(200, 'Error', {}, false);
  }
};
