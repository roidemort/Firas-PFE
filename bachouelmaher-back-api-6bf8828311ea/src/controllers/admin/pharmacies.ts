import { NextFunction, Request, Response } from 'express';
import RedisService from "@/services/redis.service"
import {
  countPharmacies,
  createPharmacy,
  deletePharmacy,
  findPharmacyById,
  queryPharmacies, savePharmacy
} from "@/services/pharmacy.service"
import pick from "@/utils/pick"
import { IOptions } from "@/interfaces/IOptions"
import { organize } from "@/utils/organize"


export const getAllPharmacies = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter = pick(req.query, ['text', 'status']);
    const options: IOptions = pick(req.query, ['orderBy', 'select', 'relations', 'take', 'page']);
    let params = organize(filter, options)
    const pharmacies = await queryPharmacies(params);
    const count = await countPharmacies(params.query);
    const listPharmacies = { pharmacies, count }

    return res.customSuccess(200, 'List of pharmacies.', listPharmacies, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
export const getDetailsPharmacy = async (req: Request, res: Response, next: NextFunction) => {
  const pharmacyId = req.params.id;
  try {
    const pharmacy = await findPharmacyById(pharmacyId)
    if (!pharmacy) {
      return  res.customSuccess(200, 'Error', {}, false);
    }
    return res.customSuccess( 200, 'Details of pharmacy.', pharmacy, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
export const addPharmacy = async (req: Request, res: Response, next: NextFunction) => {
  const { name, address, email, tel, city, zipCode } = req.body;
  try {
    const pharmacy = await createPharmacy({
      name, address, email, tel, city, zipCode
    });
    await RedisService.incCreateIfNotExist('pharmacies', 1)
    return res.customSuccess( 200, 'Pharmacy successfully created.', { pharmacy }, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
export const updatePharmacy = async (req: Request, res: Response, next: NextFunction) => {
  const { name, address, email, tel, status, city, zipCode  } = req.body;
  const pharmacyId = req.params.id;

  try {
    const Pharmacy = await findPharmacyById(pharmacyId)

    if (!Pharmacy) {
      return  res.customSuccess(200, 'Error', {}, false);
    }

    if (name) Pharmacy.name = name;
    if (address) Pharmacy.address = address;
    if (email) Pharmacy.email = email;
    if (tel) Pharmacy.tel = tel;
    if (status) Pharmacy.status = status;
    if (city) Pharmacy.city = city;
    if (zipCode) Pharmacy.zipCode = zipCode;

    Pharmacy.updatedAt = new Date();

    await savePharmacy(Pharmacy);

    return  res.customSuccess( 200, 'Pharmacy successfully changed.', { pharmacy: Pharmacy }, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
export const removePharmacy = async (req: Request, res: Response, next: NextFunction) => {
  const pharmacyId = req.params.id;
  try {
    const pharmacy = await findPharmacyById(pharmacyId);

    if (!pharmacy) {
      return  res.customSuccess(200, 'Error', {}, false);
    }

    await deletePharmacy(pharmacyId);
    await RedisService.incCreateIfNotExist('pharmacies', -1)
    return res.customSuccess( 200, 'Category successfully deleted.', true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};