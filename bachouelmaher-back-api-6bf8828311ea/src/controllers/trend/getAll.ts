import { NextFunction, Request, Response } from 'express';
import { countTrends, queryTrends } from "@/services/trend.service"
import pick from "@/utils/pick"
import { IOptions } from "@/interfaces/IOptions"
import { organize } from "@/utils/organize"
import { Equal } from "typeorm"

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter = pick(req.query, ['providers', 'text', 'status']);
    const options: IOptions = pick(req.query, ['orderBy', 'select', 'relations', 'take', 'page']);
    let params = organize(filter, options)
    const trends = await queryTrends(params);
    const count = await countTrends(params.query);
    const listTrends = { trends, count }
    return res.customSuccess(200, 'List of trends.', listTrends, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
