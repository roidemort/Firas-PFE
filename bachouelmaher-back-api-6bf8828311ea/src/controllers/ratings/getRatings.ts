import { NextFunction, Request, Response } from "express"
import { findCourse } from "@/services/course.service"
import { findUser } from "@/services/user.service"
import { countRatings, getAverageAndTotal, getDistribution, queryRatings } from "@/services/rating.service"
import { Equal } from "typeorm"
import pick from "@/utils/pick"
import { IOptions } from "@/interfaces/IOptions"
import { organize } from "@/utils/organize"

export const getRatings = async (req: Request, res: Response, next: NextFunction) => {
  const { courseId } = req.body;
  const { id } = req.jwtPayload;
  try {
    const Course = await findCourse({ id: Equal(courseId), status: 1 })
    const User = await findUser({ id: Equal(id), status: 1 });

    if(!Course || !User) return res.customSuccess(200, 'Error', {}, false);

    const filter = pick(req.query, []);
    const options: IOptions = pick(req.query, ['orderBy', 'select', 'relations', 'take', 'page']);
    let params = organize(filter, options)
    Object.assign(params.query, { course: { id : Equal(courseId)}, status: 1});
    params.relations = ['user']
    const ratings = await queryRatings(params);
    const { avg, count } = await getAverageAndTotal(courseId)
    const distribution = await getDistribution(courseId)
    // Normalize the distribution to ensure all 1-5 stars are included (even if no reviews exist for a certain star)
    const ratingDistribution = [1, 2, 3, 4, 5].map((star) => {
      const match = distribution.find((d) => parseInt(d.stars) === star);
      return { stars: star, count: match ? parseInt(match.count) : 0 };
    });
    const listRatings = { averageRating: parseFloat(parseFloat(avg).toFixed(1)) , totalReviews: parseInt(count), ...ratingDistribution, ratings };

    return res.customSuccess(200, 'List of ratings.', listRatings, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};