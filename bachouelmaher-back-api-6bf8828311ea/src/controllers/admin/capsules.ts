import { NextFunction, Request, Response } from "express"
import RedisService from "@/services/redis.service"
import { createCapsule, findCapsuleById, saveCapsule } from "@/services/capsule.service"
import { findCategoryCapsuleById } from "@/services/category-capsule.service"
import { findProviderById } from "@/services/provider.service"

export const addCapsule = async (req: Request, res: Response, next: NextFunction) => {
  const { title, details, url, status, category, provider } = req.body;
  try {
    let newStatus = status ? 1 : 0;
    const categoryCapsule = await findCategoryCapsuleById(category)
    const Provider = await findProviderById(provider)

    if(!categoryCapsule || !Provider) return  res.customSuccess(200, 'missing data ', {res}, false);

    const capsule = await createCapsule({
      title, details, url, status: newStatus, category: categoryCapsule, provider: Provider
    });
    await RedisService.incCreateIfNotExist('capsules', 1)
    return res.customSuccess( 200, 'Capsule successfully created.', { capsule }, true);
  } catch (err) {
    return  res.customSuccess(200, err, {err}, false);
  }
};
export const updateCapsule = async (req: Request, res: Response, next: NextFunction) => {
  const { title, details, url, status, category, provider } = req.body;
  const capsuleId = req.params.id;

  try {
    const Capsule = await findCapsuleById(capsuleId)

    if (!Capsule) {
      return  res.customSuccess(200, 'Error', {}, false);
    }

    if (title) Capsule.title = title;
    if (details) Capsule.details = details;
    if (url) Capsule.url = url;
    Capsule.status = status == 1 ? 1 : 0

    if(category) {
      const categoryCapsule = await findCategoryCapsuleById(category)
      if(!categoryCapsule) return  res.customSuccess(200, 'Error', {}, false);
      Capsule.category = categoryCapsule
    }

    if(provider) {
      const Provider = await findProviderById(provider)
      if(!Provider) return  res.customSuccess(200, 'Error', {}, false);
      Capsule.provider = Provider
    }

    Capsule.updatedAt = new Date();

    await saveCapsule(Capsule);

    return  res.customSuccess( 200, 'Capsule successfully changed.', { capsule: Capsule }, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};