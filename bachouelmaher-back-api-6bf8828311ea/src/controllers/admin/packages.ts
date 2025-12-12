import { NextFunction, Request, Response } from "express"
import RedisService from "@/services/redis.service"
import { createPackage, deletePackage, findPackageById, savePackage } from "@/services/package.service"

export const addPackage = async (req: Request, res: Response, next: NextFunction) => {
  const { name, description, duration, price, type, position, status } = req.body;
  try {
    let newStatus = status ? 1 : 0;

    const pack = await createPackage({
      name, description, duration, price, type, position, status: newStatus,
    });
    await RedisService.incCreateIfNotExist('packages', 1)
    return res.customSuccess( 200, 'Package successfully created.', { package: pack }, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
export const updatePackage = async (req: Request, res: Response, next: NextFunction) => {
  const { name, description, duration, price, type, position, status } = req.body;
  const packageId = req.params.id;

  try {
    const Package = await findPackageById(packageId)

    if (!Package) {
      return  res.customSuccess(200, 'Error', {}, false);
    }

    if (name) Package.name = name;
    if (description) Package.description = description;
    if (duration) Package.duration = duration;
    if (position) Package.position = position;
    if (price) Package.price = price;
    if (type) Package.type = type;
    if (position) Package.position = position;
    if (status) {
      Package.status = status == 1 ? 1 : 0
    }

    Package.updatedAt = new Date();

    await savePackage(Package);

    return  res.customSuccess( 200, 'Package successfully changed.', { package: Package }, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
export const removePackage = async (req: Request, res: Response, next: NextFunction) => {
  const packageId = req.params.id;
  try {
    const Package = await findPackageById(packageId);

    if (!Package) {
      return  res.customSuccess(200, 'Error', {}, false);
    }

    await deletePackage(packageId);
    await RedisService.incCreateIfNotExist('packages', -1)
    return res.customSuccess( 200, 'Package successfully deleted.', true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};