import { NextFunction, Request, Response } from 'express';
import pick from "@/utils/pick"
import { IOptions } from "@/interfaces/IOptions"
import { organize } from "@/utils/organize"
import { countPharmacies, queryPharmacies } from '@/services/pharmacy.service';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const filter = pick(req.query, ['text', 'status']);
        const options: IOptions = pick(req.query, ['orderBy', 'select', 'relations', 'take', 'page']);
        let params = organize(filter, options)
        const pharmacies = await queryPharmacies(params);
        const count = await countPharmacies(params.query);
        const listPharmacies = { pharmacies, count }
    
        return res.customSuccess(200, 'List of pharmacies.', listPharmacies, true);
      } catch (err) {
        return  res.customSuccess(200, 'Error', {}, false);
      }
};
