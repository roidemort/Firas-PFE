import { NextFunction, Request, Response } from "express"

import {
  findPharmacyUser,
  savePharmacyUser
} from "@/services/pharmacy.service"
import { Equal } from "typeorm"

export const verifyKey = async (req: Request, res: Response, next: NextFunction) => {
  const { key } = req.body;
  try {
    const pharmacyUser = await findPharmacyUser({ key: Equal(key) });

    if (!pharmacyUser) {
      return  res.customSuccess(200, 'Key is not viable.', { }, false);
    }

    if(pharmacyUser.status != 0) {
      return  res.customSuccess(200, 'Key is not viable.', {}, false);
    } else {
      pharmacyUser.status = 1;
      await savePharmacyUser(pharmacyUser);
      return res.customSuccess(200, 'Key is viable.', { pharmacyUser }, true);
    }
  } catch (err) {
    return  res.customSuccess(200, 'Key is not viable.', {}, false);
  }
}
