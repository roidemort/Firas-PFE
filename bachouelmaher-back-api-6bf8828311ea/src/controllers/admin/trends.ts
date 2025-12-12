import { NextFunction, Request, Response } from "express"
import RedisService from "@/services/redis.service"
import { createTrend, findTrendById, saveTrend } from "@/services/trend.service"
import { findProviders } from "@/services/provider.service"
import { Equal, In } from "typeorm"
import { MulterFile } from "@/interfaces/IMulterFile"
import { findImage } from "@/services/image.service"

export const addTrend = async (req: Request & { file: MulterFile }, res: Response, next: NextFunction) => {
  const { title, position, image, details } = req.body;
  try {

    let Image = null
    if(image) Image = await findImage({ id: Equal(image) })

    const trend = await createTrend({
      title, position, details, image: Image
    });
    await RedisService.incCreateIfNotExist('trends', 1)
    return res.customSuccess( 200, 'Trend successfully created.', { trend }, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
export const updateTrend = async (req: Request & { file: MulterFile }, res: Response, next: NextFunction) => {
  const { title, position, status, image, details } = req.body;
  const trendId = req.params.id;

  try {
    const Trend = await findTrendById(trendId)

    if (!Trend) {
      return  res.customSuccess(200, 'Error', {}, false);
    }

    if (title) Trend.title = title;
    if (position) Trend.position = position;
    if (details) Trend.details = details;
    if(image) {
      Trend.image = await findImage({ id: Equal(image) });
    }

    if(status) Trend.status = +status
    Trend.updatedAt = new Date();

    await saveTrend(Trend);

    return  res.customSuccess( 200, 'Trend successfully changed.', { trend: Trend }, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};