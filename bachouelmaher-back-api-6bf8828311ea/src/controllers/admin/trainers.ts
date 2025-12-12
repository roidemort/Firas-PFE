import { NextFunction, Request, Response } from "express"
import RedisService from "@/services/redis.service"
import { createTrainer, findTrainerById, saveTrainer } from "@/services/trainer.service"
import { findProviders } from "@/services/provider.service"
import { Equal, In } from "typeorm"
import { MulterFile } from "@/interfaces/IMulterFile"
import { findImage } from "@/services/image.service"

export const addTrainer = async (req: Request & { file: MulterFile }, res: Response, next: NextFunction) => {
  const { name, description, email, twitter, job, status, image, providers } = req.body;
  try {
    let newStatus = status ? 1 : 0;

    let selectedProviders = await findProviders({ id: In(providers)})

    let Image = null
    if(image) Image = await findImage({ id: Equal(image) })

    const trainer = await createTrainer({
      name, description, email, twitter, job, status: newStatus, providers: selectedProviders, image: Image
    });
    await RedisService.incCreateIfNotExist('trainers', 1)
    return res.customSuccess( 200, 'Trainer successfully created.', { trainer }, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
export const updateTrainer = async (req: Request & { file: MulterFile }, res: Response, next: NextFunction) => {
  const { name, description, email, twitter, job, status, image, providers } = req.body;
  const trainerId = req.params.id;

  try {
    const Trainer = await findTrainerById(trainerId)

    if (!Trainer) {
      return  res.customSuccess(200, 'Error', {}, false);
    }

    if (name) Trainer.name = name;
    if (description) Trainer.description = description;
    if (email) Trainer.email = email;
    if (twitter) Trainer.twitter = twitter;
    if (job) Trainer.job = job;
    if(providers) {
      Trainer.providers = await findProviders({ id: In(providers) });
    }
    if(image) {
      Trainer.image = await findImage({ id: Equal(image) });
    }
    Trainer.status = status ? 1 : 0
    Trainer.updatedAt = new Date();

    await saveTrainer(Trainer);

    return  res.customSuccess( 200, 'Trainer successfully changed.', { trainer: Trainer }, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};