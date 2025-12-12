import { NextFunction, Request, Response } from "express"
import {
  countPharmaciesUsers,
  createPharmacyUser,
  findPharmacyUser,
  queryPharmaciesUsers, savePharmacyUser
} from "@/services/pharmacy.service"
import pick from "@/utils/pick"
import { IOptions } from "@/interfaces/IOptions"
import { organize } from "@/utils/organize"
import { Equal } from "typeorm"

export const getAllKeys = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter = pick(req.query, ['pharmacy','user', 'status']);
    const options: IOptions = pick(req.query, ['orderBy', 'select', 'relations', 'take', 'page']);
    let params = organize(filter, options)
    params.query.pharmacy = Equal(params.query.pharmacy)
    const pharmaciesUsers = await queryPharmaciesUsers(params);
    const count = await countPharmaciesUsers(params.query);
    const keys = { keys: pharmaciesUsers, count }

    return res.customSuccess(200, 'List of keys.', keys, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
}
export const updateKey = async (req: Request, res: Response, next: NextFunction) => {
  const { key, status } = req.body;
  try {
    const pharmacyUser = await findPharmacyUser({ id: Equal(key) });

    if (!pharmacyUser) {
      return  res.customSuccess(200, 'Error', {}, false);
    }

    if(pharmacyUser.status == 3) {
      return  res.customSuccess(200, 'Error', {}, false);
    } else {
      pharmacyUser.status = status;
      await savePharmacyUser(pharmacyUser);
      return res.customSuccess(200, 'Key is viable.', { }, true);
    }
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
}
export const generateNewKey = async (req: Request, res: Response, next: NextFunction) => {
  const { pharmacyId, role } = req.body;
  try {
    const pharmacyUser = await createPharmacyUser({
      pharmacy: pharmacyId,
      role: role
    });
    return res.customSuccess( 200, 'Key successfully created.', { key : pharmacyUser }, true);
  }
  catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
}