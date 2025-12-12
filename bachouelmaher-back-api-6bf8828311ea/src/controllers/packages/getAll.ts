import { NextFunction, Request, Response } from 'express';
import { countPackages, queryPackages } from "@/services/package.service"
import pick from "@/utils/pick"
import { IOptions } from "@/interfaces/IOptions"
import { organize } from "@/utils/organize"

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter = pick(req.query, ['text', 'status']);
    const options: IOptions = pick(req.query, ['orderBy', 'select', 'relations', 'take', 'page']);
    let params = organize(filter, options)
    const packages = await queryPackages(params);
    const count = await countPackages(params.query);
    const listPackages = { packages, count }
    return res.customSuccess(200, 'List of packages.', listPackages, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
