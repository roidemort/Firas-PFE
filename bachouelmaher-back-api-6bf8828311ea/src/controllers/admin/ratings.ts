import { NextFunction, Request, Response } from "express"
import {
  countRatings,
  findRatingById, getAverageAndTotal, getDistribution,
  queryRatings,
  saveRating
} from "@/services/rating.service"
import pick from "@/utils/pick"
import { IOptions } from "@/interfaces/IOptions"
import { organize } from "@/utils/organize"
import { Equal } from "typeorm"

export const getAllRatings = async (req: Request, res: Response, next: NextFunction) => {
  const courseId = req.params.id;
  try {
    const filter = pick(req.query, ['status']);
    const options: IOptions = pick(req.query, ['orderBy', 'select', 'relations', 'take', 'page']);
    let params = organize(filter, options)
    Object.assign(params.query, { course: { id : Equal(courseId)}});
    let relations = {}
    if(params.relations) {
      relations = Object.keys(params.relations)
    }
    params.relations = relations
    const ratings = await queryRatings(params);
    const countTotalQuery= await countRatings(params.query);
    const { avg, count } = await getAverageAndTotal(courseId)
    const distribution = await getDistribution(courseId)
    // Normalize the distribution to ensure all 1-5 stars are included (even if no reviews exist for a certain star)
    const ratingDistribution = [1, 2, 3, 4, 5].map((star) => {
      const match = distribution.find((d) => parseInt(d.stars) === star);
      return { stars: star, count: match ? parseInt(match.count) : 0 };
    });
    const listRatings = { count: countTotalQuery, averageRating: parseFloat(parseFloat(avg).toFixed(1)) , totalReviews: parseInt(count), ...ratingDistribution, ratings };
    return res.customSuccess(200, 'List of ratings.', listRatings, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};

export const updateRating = async (req: Request, res: Response, next: NextFunction) => {
  const { status } = req.body;
  const ratingId = req.params.id;
  try {
    const Rating = await findRatingById(ratingId)
    if (!Rating) {
      return res.customSuccess(200, 'Error', {}, false);
    }
    if (status) Rating.status = status == 1 ? 1 : 0
    Rating.updatedAt = new Date();
    await saveRating(Rating);
    return res.customSuccess( 200, 'Rating successfully changed.', { rating: Rating }, true);
  } catch (err) {
    return res.customSuccess(200, 'Error', {}, false);
  }
};