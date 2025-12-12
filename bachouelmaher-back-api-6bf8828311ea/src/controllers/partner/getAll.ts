import { NextFunction, Request, Response } from 'express';
import { countPartners, queryPartners } from "@/services/partner.service"
import pick from "@/utils/pick"
import { IOptions } from "@/interfaces/IOptions"
import { organize } from "@/utils/organize"

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter = pick(req.query, ['text', 'status']);
    const options: IOptions = pick(req.query, ['orderBy', 'select', 'relations', 'take', 'page']);
    let params = organize(filter, options)
    const partners = await queryPartners(params);
    const count = await countPartners(params.query);
    const listPartners = { partners, count }
    return res.customSuccess(200, 'List of partners.', listPartners, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
