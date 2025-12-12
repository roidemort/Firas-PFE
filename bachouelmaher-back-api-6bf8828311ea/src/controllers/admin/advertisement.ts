import { NextFunction, Request, Response } from "express"
import RedisService from "@/services/redis.service"
import { createAdvertisement, findAdvertisementById, saveAdvertisement } from "@/services/advertisement.service"
import { findImage } from "@/services/image.service"
import { Equal } from "typeorm"

export const addAdvertisement = async (req: Request, res: Response, next: NextFunction) => {
  const { title, position, type, status, image, video, details, permalink } = req.body;
  try {
    let newStatus = status ? 1 : 0;
    let Image = null
    if(image) Image = await findImage({ id: Equal(image) })
    const advertisement = await createAdvertisement({
      title, position, type, status: newStatus, image: Image, video, details, permalink
    });
    await RedisService.incCreateIfNotExist('advertisements', 1)
    return res.customSuccess( 200, 'Advertisement successfully created.', { advertisement }, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
export const updateAdvertisement = async (req: Request, res: Response, next: NextFunction) => {
  const { title, position, type, status, image, video, details, permalink } = req.body;
  const advertisementId = req.params.id;

  try {
    const Advertisement = await findAdvertisementById(advertisementId)

    if (!Advertisement) {
      return  res.customSuccess(200, 'Error', {}, false);
    }

    Advertisement.title = title;
    Advertisement.details = details;
    Advertisement.position = position;
    Advertisement.type = type;
    Advertisement.permalink = permalink;

    if(type == 'image') {
      Advertisement.video = null;
      Advertisement.image = await findImage({ id: Equal(image) });
    } else {
      Advertisement.video = video;
      Advertisement.image = null;
    }
    Advertisement.status = status == 1 ? 1 : 0
    Advertisement.updatedAt = new Date();

    await saveAdvertisement(Advertisement);

    return  res.customSuccess( 200, 'Advertisement successfully changed.', { advertisement: Advertisement }, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
export const updateAdvertisementStatus = async (req: Request, res: Response, next: NextFunction) => {
  const { status } = req.body;
  const advertisementId = req.params.id;

  try {
    const Advertisement = await findAdvertisementById(advertisementId)

    if (!Advertisement) {
      return  res.customSuccess(200, 'Error', {}, false);
    }

    Advertisement.status = status == 1 ? 1 : 0

    Advertisement.updatedAt = new Date();

    await saveAdvertisement(Advertisement);

    return  res.customSuccess( 200, 'Advertisement successfully changed.', { advertisement: Advertisement }, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};