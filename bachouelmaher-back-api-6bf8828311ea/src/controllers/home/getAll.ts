
import { NextFunction, Request, Response } from 'express';
import { organize } from "@/utils/organize"
import { queryAdvertisements } from "@/services/advertisement.service"
import { queryTrends } from '@/services/trend.service';
import { queryPartners } from '@/services/partner.service';

export const getHomeData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const status = req.query.status as string || '1';

        const trendParams = organize({ status }, { relations: 'image', take: 20 });
        const partnerParams = organize({ status }, { relations: 'logo', take: 20 });
        const advertisementParams = organize({ status }, { relations: 'image', take: 20 });

        const [trends, partners, advertisements] = await Promise.all([
            queryTrends(trendParams),
            queryPartners(partnerParams),
            queryAdvertisements(advertisementParams)
        ]);

        return res.customSuccess(200, 'Home data fetched successfully.', {
            trends,
            partners,
            advertisements
        }, true);
    } catch (err) {
        console.error(err);
        return res.customSuccess(500, 'Error while fetching home data.', {}, false);
    }
};

