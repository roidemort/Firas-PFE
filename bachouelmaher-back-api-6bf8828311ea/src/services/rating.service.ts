import { Equal, FindOptionsWhere } from "typeorm"

import { AppDataSource } from "@/orm/data-source";
import { RatingEntity } from "@/orm/entities/rating.entity";
import { IQuery } from "@/interfaces/IOptions"

const ratingRepository = AppDataSource.getRepository(RatingEntity);

export const createRating = async (input: Partial<RatingEntity>) => {
  return await ratingRepository.save(ratingRepository.create(input));
};
export const saveRating = async (rating: RatingEntity) => {
  return await ratingRepository.save(rating);
};

export const findRatingById = async (ratingId: string, relations: any[] = []) => {
  return await ratingRepository.findOne({
    where: { id: Equal(ratingId) },
    relations: relations,
  });
};

export const findRating = async (query: any, relations: any[] = []) => {
  return await ratingRepository.findOne({
    where: query,
    relations: relations,
  });
};

export const queryRatings = async (params: IQuery) => {
  return await ratingRepository.find({
    where: params.query,
    select: params.select,
    relations: params.relations,
    skip: params.skip,
    take: params.take,
    order: params.order
  });
}

export const findRatings = async (query: any, relations: any[] = [], select: any = {}) => {
  return await ratingRepository.find({
    select: select,
    where: query,
    relations: relations,
  });
};
export const deleteRating = async (ratingId: string) => {
  return await ratingRepository.delete({ id: Equal(ratingId) });
};

export const countRatings = async (query: any) => {
  return await ratingRepository.countBy(query as FindOptionsWhere<RatingEntity>);
};

// Get average rating and total reviews
export const getAverageAndTotal = async (courseId: string) => {
  return await ratingRepository
    .createQueryBuilder("rating")
    .select("AVG(rating.rating)", "avg")
    .addSelect("COUNT(rating.id)", "count")
    .where("rating.courseId = :courseId", { courseId: courseId })
    .andWhere("rating.status = :status", { status: 1 })
    .getRawOne();
}

// Get the distribution of ratings
export const getDistribution = async (courseId: string) => {
  return await ratingRepository
    .createQueryBuilder("rating")
    .select("rating.rating", "stars")
    .addSelect("COUNT(rating.id)", "count")
    .where("rating.courseId = :courseId", { courseId: courseId })
    .andWhere("rating.status = :status", { status: 1 })
    .groupBy("rating.rating")
    .orderBy("rating.rating", "ASC")
    .getRawMany();
}