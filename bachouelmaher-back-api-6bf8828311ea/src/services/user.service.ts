import { Equal, FindOptionsWhere, Like } from "typeorm"

import { AppDataSource } from "@/orm/data-source";
import { UserEntity } from "@/orm/entities/user.entity";
import { IQuery } from "@/interfaces/IOptions"
import { findPackageById } from "@/services/package.service"
import { createSubscription } from "@/services/subscription.service"
import { EnrollCourseEntity } from "@/orm/entities/enroll-course.entity"

const userRepository = AppDataSource.getRepository(UserEntity);
const enrollCourseRepository = AppDataSource.getRepository(EnrollCourseEntity);

export const createUser = async (input: Partial<UserEntity>) => {
  return await userRepository.save(userRepository.create(input));
};
export const saveUser = async (user: UserEntity) => {
  return await userRepository.save(user);
};
export const findUserByEmail = async (email: string) => {
  return await userRepository.findOneBy({
    email,
  } as FindOptionsWhere<UserEntity>);
};
export const findUserById = async (userId: string, relations = {}, select: any = {}) => {
  return await userRepository.findOne({
    select: select,
    where: { id: Equal(userId) },
    relations: relations,
  });
};
export const findUser = async (query: any, relations: any[] = []) => {
  return await userRepository.findOne({
    where: query,
    relations: relations,
  });
};

export const getMyTeamDetails = async (userId: string, pharmacyId: string, orderBy: { field: string, direction: "ASC" | "DESC"}, monthNumber?: number) => {
  if(monthNumber) {
    return await userRepository
      .createQueryBuilder("user")
      .leftJoin('user.key', 'key')
      .leftJoin('user.enrolls', 'enrolls')
      .select([
        'user.id AS id',
        'user.email AS email',
        'user.socialId AS socialId',
        'user.firstName AS firstName',
        'user.lastName AS lastName',
        'user.status AS status',
        'user.gender AS gender',
        'user.birthday AS birthday',
        'user.tel AS tel',
        'user.role AS role',
        'user.img_link AS img_link',
        'user.address AS address',
        'user.city AS city',
        'user.zipCode AS zipCode',
        'user.createdAt AS createdAt',
        'user.updatedAt AS updatedAt'
      ])
      .where("user.id != :userId", { userId: userId })
      .andWhere("key.pharmacy = :pharmacyId", { pharmacyId: pharmacyId })
      .andWhere("EXTRACT(MONTH FROM enrolls.endedAt) = :monthNumber", { monthNumber: monthNumber })
      .andWhere("enrolls.status = :status", { status: 2 })
      .addSelect("COUNT(enrolls.id)", "numberCourses")
      .addSelect("SUM(enrolls.points)", "totalPoints")
      .addSelect("SUM(enrolls.quizPoints)", "scoreQuiz")
      .addSelect("SUM(enrolls.quizNumber)", "quizNumber")
      .orderBy(orderBy.field, orderBy.direction)
      .getRawMany();
  } else {
    return await userRepository
      .createQueryBuilder("user")
      .leftJoin('user.key', 'key')
      .leftJoin('user.enrolls', 'enrolls')
      .select([
        'user.id AS id',
        'user.email AS email',
        'user.socialId AS socialId',
        'user.firstName AS firstName',
        'user.lastName AS lastName',
        'user.status AS status',
        'user.gender AS gender',
        'user.birthday AS birthday',
        'user.tel AS tel',
        'user.role AS role',
        'user.img_link AS img_link',
        'user.address AS address',
        'user.city AS city',
        'user.zipCode AS zipCode',
        'user.createdAt AS createdAt',
        'user.updatedAt AS updatedAt'
      ])
      .where("user.id != :userId", { userId: userId })
      .andWhere("key.pharmacy = :pharmacyId", { pharmacyId: pharmacyId })
      .andWhere("enrolls.status = :status", { status: 2 })
      .addSelect("COUNT(enrolls.id)", "numberCourses")
      .addSelect("SUM(enrolls.points)", "totalPoints")
      .addSelect("SUM(enrolls.quizPoints)", "scoreQuiz")
      .addSelect("SUM(enrolls.quizNumber)", "quizNumber")
      .orderBy(orderBy.field, orderBy.direction)
      .getRawMany();
  }
}
export const getMyUserDetailsQuery = async (userId: string, pharmacyId: string, orderBy: { field: string, direction: "ASC" | "DESC"}, monthNumber?: number) => {
  if(monthNumber) {
    return await userRepository
      .createQueryBuilder("user")
      .leftJoin('user.key', 'key')
      .leftJoinAndSelect('user.enrolls', 'enrolls')
      .leftJoin('enrolls.course', 'course')
      .addSelect(['course.id', 'course.title'])
      .where("user.id = :userId", { userId: userId })
      .andWhere("key.pharmacy = :pharmacyId", { pharmacyId: pharmacyId })
      .andWhere("EXTRACT(MONTH FROM enrolls.endedAt) = :monthNumber", { monthNumber: monthNumber })
      .orderBy(orderBy.field, orderBy.direction)
      .getOne();
  } else {
    return await userRepository
      .createQueryBuilder("user")
      .leftJoin('user.key', 'key')
      .leftJoinAndSelect('user.enrolls', 'enrolls')
      .leftJoin('enrolls.course', 'course')
      .addSelect(['course.id', 'course.title'])
      .where("user.id = :userId", { userId: userId })
      .andWhere("key.pharmacy = :pharmacyId", { pharmacyId: pharmacyId })
      .orderBy(orderBy.field, orderBy.direction)
      .getOne();
  }
}
export const getMyUserCourseDetails = async (userId: string, orderBy: { field: string, direction: "ASC" | "DESC"}, monthNumber?: number) => {
  if(monthNumber) {
    return await userRepository
      .createQueryBuilder("user")
      .leftJoin('user.key', 'key')
      .leftJoinAndSelect('user.enrolls', 'enrolls')
      .leftJoin('enrolls.course', 'course')
      .addSelect(['course.id', 'course.title'])
      .where("user.id = :userId", { userId: userId })
      .andWhere("EXTRACT(MONTH FROM enrolls.endedAt) = :monthNumber", { monthNumber: monthNumber })
      .orderBy(orderBy.field, orderBy.direction)
      .getOne();
  } else {
    return await userRepository
      .createQueryBuilder("user")
      .leftJoin('user.key', 'key')
      .leftJoinAndSelect('user.enrolls', 'enrolls')
      .leftJoin('enrolls.course', 'course')
      .addSelect(['course.id', 'course.title'])
      .where("user.id = :userId", { userId: userId })
      .orderBy(orderBy.field, orderBy.direction)
      .getOne();
  }
}
export const getMyUserProgression = async (userId: string, pharmacyId: string, courseId: string) => {
  return await enrollCourseRepository
    .createQueryBuilder("enrolls")
    .leftJoin('enrolls.user', 'user')
    .leftJoin('user.key', 'key')
    .leftJoinAndSelect('enrolls.sections', 'section')
    .innerJoin('section.lessons', 'lesson')
    .leftJoinAndSelect('section.quiz', 'quiz')
    .select([
      'enrolls.id AS id',
      'user.id AS userId',
      'enrolls.course AS courseId',
    ])
    .addSelect("COUNT(section.id)", "numberSections")
    .addSelect("SUM(CASE WHEN section.status = 2 then 1 else 0 end)", "numberSectionsNotComplete")
    .addSelect("COUNT(lesson.id)", "numberLessons")
    .addSelect("COUNT(quiz.id)", "numberQuiz")
    .where("user.id = :userId", { userId: userId })
    .where("enrolls.id = :courseId", { courseId: courseId })
    .andWhere("key.pharmacy = :pharmacyId", { pharmacyId: pharmacyId })
    .getRawOne();
}
export const getNbrUsersByMonth = async () => {
  return await userRepository
    .createQueryBuilder("user")
    .select('MONTH(user.createdAt)','month')
    .addSelect('COUNT(user.id)', 'count')
    .groupBy('MONTH(user.createdAt)')
    .where('role != :role', { role: 'SUPER_ADMIN' })
    .getRawMany();
}
export const findUsers = async (query: any, relations: any[] = [], select: any = {}, skip = 0, take = 10, order?: any) => {
  return await userRepository.find({
    select: select,
    where: query,
    relations: relations,
    skip: skip,
    take: take,
    order: order
  })
};

export const queryUsers = async (params: IQuery) => {
  return await userRepository.find({
    where: params.query,
    select: params.select,
    relations: params.relations,
    skip: params.skip,
    take: params.take,
    order: params.order
  });
}

export const countUsers = async (query: any) => {
  return await userRepository.countBy(query as FindOptionsWhere<UserEntity>);
};
export const deleteUser = async (userId: string) => {
  return await userRepository.delete({ id: Equal(userId) });
};
export const linkUserToFreePlan = async (user: UserEntity) => {
  const freePlan = await findPackageById('4e9a6ca3-96d5-44b0-b33b-ead4a15fe9e2')
  return await createSubscription({
    buyer: user,
    package: freePlan,
    status: 1,
    usersNumber: 1,
    startedAt: new Date(),
    users: [user]
  })
}