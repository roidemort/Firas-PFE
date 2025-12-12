import { NextFunction, Request, Response } from 'express';
import pick from "@/utils/pick"
import { IOptions } from "@/interfaces/IOptions"
import { organize } from "@/utils/organize"
import { countCapsules, queryCapsules } from "@/services/capsule.service"
import { Equal } from "typeorm"

export const getAllCapsules = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter = pick(req.query, ['text', 'status', 'provider', 'category']);
    if(req.query.provider) Object.assign(filter, { provider :{ id: Equal(req.query.provider) } })
    if(req.query.category) Object.assign(filter, { category :{ id: Equal(req.query.category) } })
    const options: IOptions = pick(req.query, ['orderBy', 'select', 'relations', 'take', 'page']);
    Object.assign(options, { relations : 'category,provider,provider.logo' })
    let params = organize(filter, options)
    let relations = {}
    if(params.relations) {
      relations = Object.keys(params.relations)
    }
    params.relations = relations
    const capsules = await queryCapsules(params);
    const count = await countCapsules(params.query);
    const listCapsules = { capsules, count }
    return res.customSuccess(200, 'List of capsules.', listCapsules, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
