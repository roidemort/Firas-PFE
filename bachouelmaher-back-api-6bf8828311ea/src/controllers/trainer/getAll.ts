import { NextFunction, Request, Response } from 'express';
import { countTrainer, queryTrainers } from "@/services/trainer.service"
import pick from "@/utils/pick"
import { IOptions } from "@/interfaces/IOptions"
import { organize } from "@/utils/organize"
import { Equal } from "typeorm"

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter = pick(req.query, ['providers', 'text', 'status']);
    const options: IOptions = pick(req.query, ['orderBy', 'select', 'relations', 'take', 'page']);
    let params = organize(filter, options)
    if(params.query.providers) params.query.providers = {id :Equal(params.query.providers)}
    const trainers = await queryTrainers(params);
    const count = await countTrainer(params.query);
    const listTrainers = { trainers, count }
    return res.customSuccess(200, 'List of trainers.', listTrainers, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
