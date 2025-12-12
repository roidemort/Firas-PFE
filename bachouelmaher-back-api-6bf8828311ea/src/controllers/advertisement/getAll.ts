import { NextFunction, Request, Response } from 'express';
import pick from "@/utils/pick"
import { IOptions } from "@/interfaces/IOptions"
import { organize } from "@/utils/organize"
import { countAdvertisements, queryAdvertisements } from "@/services/advertisement.service"

export const getAllAdvertisements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter = pick(req.query, ['text', 'status', 'type']);

    const options: IOptions = pick(req.query, ['orderBy', 'select', 'relations', 'take', 'page']);
    let params = organize(filter, options)
    params.relations = ['image']
    const advertisements = await queryAdvertisements(params);
    const count = await countAdvertisements(params.query);
    const listAdvertisements = { advertisements, count }
    return res.customSuccess(200, 'List of advertisements.', listAdvertisements, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
