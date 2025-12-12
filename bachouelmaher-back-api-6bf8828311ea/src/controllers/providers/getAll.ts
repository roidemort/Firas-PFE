import { NextFunction, Request, Response } from 'express';
import { countProvider, queryProviders } from "@/services/provider.service"
import pick from "@/utils/pick"
import { IOptions } from "@/interfaces/IOptions"
import { organize } from "@/utils/organize"

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter = pick(req.query, ['text', 'status']);
    const options: IOptions = pick(req.query, ['orderBy', 'select', 'relations', 'take', 'page']);
    let params = organize(filter, options)
    const providers = await queryProviders(params);
    const count = await countProvider(params.query);
    const listProviders = { providers, count }
    return res.customSuccess(200, 'List of providers.', listProviders, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
