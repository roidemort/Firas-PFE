import { NextFunction, Request, Response } from "express"
import { countUsers, findUser, findUsers } from "@/services/user.service"
import { Equal, Not } from "typeorm"

export const addToTeam = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.jwtPayload;
  try {
    const user = await findUser({ id: Equal(id), status: 1 }, ['key', 'key.pharmacy']);
    if(!user) return res.customSuccess(200, 'Error', {}, false);
    const query = {id: Not(id),key: { pharmacy :{ id : Equal(user.key.pharmacy.id) }}}
    const users = await findUsers(query)
    const count = await countUsers(query);
    const listUsers = { count, users }
    return res.customSuccess(200, 'User Team.', listUsers, true);
  } catch (err) {
    return res.customSuccess(200, 'Error', {}, false);
  }
};