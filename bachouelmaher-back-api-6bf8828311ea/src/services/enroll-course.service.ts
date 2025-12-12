import { Equal, FindOptionsWhere } from "typeorm"

import { AppDataSource } from "@/orm/data-source";
import { IQuery } from "@/interfaces/IOptions"
import { EnrollCourseEntity } from "@/orm/entities/enroll-course.entity"
import { EnrollSectionEntity } from "@/orm/entities/enroll-section.entity"
import { EnrollQuizEntity } from "@/orm/entities/enroll-quiz.entity"
import { EnrollLessonEntity } from "@/orm/entities/enroll-lesson.entity"

const enrollCourseRepository = AppDataSource.getRepository(EnrollCourseEntity);
const enrollSectionRepository = AppDataSource.getRepository(EnrollSectionEntity);
const enrollQuizRepository = AppDataSource.getRepository(EnrollQuizEntity);
const enrollLessonRepository = AppDataSource.getRepository(EnrollLessonEntity);

export const createEnrollCourse = async (input: Partial<EnrollCourseEntity>) => {
  return await enrollCourseRepository.save(enrollCourseRepository.create(input));
};
export const saveEnrollCourse = async (enrollCourse: EnrollCourseEntity) => {
  return await enrollCourseRepository.save(enrollCourse);
};

export const createEnrollSection = async (input: Partial<EnrollSectionEntity>) => {
  return await enrollSectionRepository.save(enrollSectionRepository.create(input));
};
export const saveEnrollSection = async (enrollSection: EnrollSectionEntity) => {
  return await enrollSectionRepository.save(enrollSection);
};

export const createEnrollQuiz = async (input: Partial<EnrollQuizEntity>) => {
  return await enrollQuizRepository.save(enrollQuizRepository.create(input));
};
export const saveEnrollQuiz = async (enrollQuiz: EnrollQuizEntity) => {
  return await enrollQuizRepository.save(enrollQuiz);
};

export const createEnrollLesson = async (input: Partial<EnrollLessonEntity>) => {
  return await enrollLessonRepository.save(enrollLessonRepository.create(input));
};
export const saveEnrollLesson = async (enrollLesson: EnrollLessonEntity) => {
  return await enrollLessonRepository.save(enrollLesson);
};

export const findEnrollCourseById = async (enrollCourseId: string, relations: any[] = []) => {
  return await enrollCourseRepository.findOne({
    where: { id: Equal(enrollCourseId) },
    relations: relations,
  });
};

export const findEnrollCourse = async (query: any, relations: any[] = []) => {
  return await enrollCourseRepository.findOne({
    where: query,
    relations: relations,
  });
};

export const getStatsByStatus = async () => {
  return await enrollCourseRepository
    .createQueryBuilder("enrolls")
    .leftJoin('enrolls.course', 'course')
    .select('enrolls.status as status')
    .addSelect('MONTH(enrolls.startedAt)','month')
    .addSelect('COUNT(enrolls.status)','count')
    .groupBy('enrolls.status')
    .addGroupBy('MONTH(enrolls.startedAt)')
    .getRawMany();
}

export const getStatsByCategory = async () => {
  return await enrollCourseRepository
    .createQueryBuilder("enrolls")
    .leftJoin('enrolls.course', 'course')
    .leftJoin('course.category', 'category')
    .select('category.name as name')
    .addSelect('COUNT(enrolls.id)','count')
    .groupBy('category.id')
    .getRawMany();
}

export const getStatsByCourse = async () => {
  return await enrollCourseRepository
    .createQueryBuilder("enrolls")
    .leftJoin('enrolls.course', 'course')
    .select('course.title as title')
    .addSelect('COUNT(enrolls.id)','count')
    .groupBy('course.id')
    .orderBy('count', 'DESC')
    .getRawMany();
}

export const getStatsByType = async () => {
  return await enrollCourseRepository
    .createQueryBuilder("enrolls")
    .leftJoin('enrolls.course', 'course')
    .select('course.paid as paid')
    .addSelect('COUNT(enrolls.id)','count')
    .groupBy('course.paid')
    .getRawMany();
}

export const findEnrollSection = async (query: any, relations: any[] = []) => {
  return await enrollSectionRepository.findOne({
    where: query,
    relations: relations,
  });
};

export const findEnrollLesson = async (query: any, relations: any[] = []) => {
  return await enrollLessonRepository.findOne({
    where: query,
    relations: relations,
  });
};

export const findEnrollQuiz = async (query: any, relations: any[] = []) => {
  return await enrollQuizRepository.findOne({
    where: query,
    relations: relations,
  });
};

export const findEnrollQuizs = async (query: any, relations: any[] = []) => {
  return await enrollQuizRepository.find({
    where: query,
    relations: relations,
  });
};

export const queryEnrollCourses = async (params: IQuery) => {
  return await enrollCourseRepository.find({
    where: params.query,
    select: params.select,
    relations: params.relations,
    skip: params.skip,
    take: params.take,
    order: params.order
  });
}

export const findEnrollCourses = async (query: any, relations: any[] = [], select: any = {}) => {
  return await enrollCourseRepository.find({
    select: select,
    where: query,
    relations: relations,
  });
};
export const deleteEnrollCourse = async (enrollCourseId: string) => {
  return await enrollCourseRepository.delete({ id: Equal(enrollCourseId) });
};

export const countEnrollCourses = async (query: any) => {
  return await enrollCourseRepository.countBy(query as FindOptionsWhere<EnrollCourseEntity>);
};
export const countEnrollSections = async (query: any) => {
  return await enrollSectionRepository.countBy(query as FindOptionsWhere<EnrollSectionEntity>);
};
export const countEnrollQuiz = async (query: any) => {
  return await enrollQuizRepository.countBy(query as FindOptionsWhere<EnrollQuizEntity>);
};
export const evaluateCompletionStatus = (course: EnrollCourseEntity) => {
  // Iterate over each section
  return course.sections.map(section => {
    const sectionComplete = section.status === 2;

    // Check completion status of lessons
    const lessonsStatus = section.lessons.map(lesson => ({
      lessonId: lesson.id,
      title: lesson.lesson.title,
      status: lesson.status === 2 ? "Complete" : "Not Complete"
    }));

    // Check completion status of quizzes
    const quizzesStatus = section.quiz.map(quiz => ({
      quizId: quiz.id,
      title: quiz.quiz.title,
      status: quiz.status === 2 ? "Complete" : "Not Complete"
    }));

    return {
      sectionId: section.id,
      sectionTitle: section.section.title,
      sectionStatus: sectionComplete ? "Complete" : "Not Complete",
      lessonsStatus,
      quizzesStatus
    };
  });
}
export const calculateProgress = (course: EnrollCourseEntity): number => {
  let totalLessons = 0;
  let completedLessons = 0;

  course.sections.forEach(section => {
    const sectionLessons = section.lessons.length;
    const sectionCompletedLessons = section.lessons.filter(lesson => lesson.status === 2).length;
    const hasSuccessfulQuiz = section.quiz.some(q => q.successful);

    // Count lessons progress
    totalLessons += sectionLessons;
    completedLessons += sectionCompletedLessons;

    // Ensure sections are only considered fully complete if they meet both criteria
    if (sectionCompletedLessons === sectionLessons && (section.quiz.length === 0 || hasSuccessfulQuiz)) {
      completedLessons += sectionLessons; // Bonus: Count it again as fully completed
    }
  });

  if (totalLessons === 0) return 0;

  return Math.min(100, (completedLessons / (2 * totalLessons)) * 100); // Prevent >100%
};

