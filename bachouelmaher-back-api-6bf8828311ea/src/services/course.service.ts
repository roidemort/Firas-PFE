import {Equal, FindOptionsWhere, In, IsNull, Not} from "typeorm"

import { AppDataSource } from "@/orm/data-source";
import {
  CourseEntity,
  FAQEntity,
  IncludeEntity,
  ObjectiveEntity,
  RequirementEntity
} from "@/orm/entities/course.entity"
import { IQuery } from "@/interfaces/IOptions"
import { SectionEntity } from "@/orm/entities/section.entity"
import { QuizEntity } from "@/orm/entities/quiz.entity"
import { LessonEntity } from "@/orm/entities/lesson.entity"
import {MIN_QUESTION_QUIZ} from "@/core/config";
import {countQuestions} from "@/services/question.service";

const courseRepository = AppDataSource.getRepository(CourseEntity);

const requirementRepository = AppDataSource.getRepository(RequirementEntity);
const faqRepository = AppDataSource.getRepository(FAQEntity);
const includeRepository = AppDataSource.getRepository(IncludeEntity);
const objectiveRepository = AppDataSource.getRepository(ObjectiveEntity);

const sectionRepository = AppDataSource.getRepository(SectionEntity);
const quizRepository = AppDataSource.getRepository(QuizEntity);
const lessonRepository = AppDataSource.getRepository(LessonEntity);

export const createCourse = async (input: Partial<CourseEntity>) => {
  return await courseRepository.save(courseRepository.create(input));
};
export const saveCourse = async (course: CourseEntity) => {
  return await courseRepository.save(course);
};

export const createRequirement = async (input: Partial<RequirementEntity>) => {
  return await requirementRepository.save(requirementRepository.create(input));
};
export const saveRequirement = async (requirement: RequirementEntity) => {
  return await requirementRepository.save(requirement);
};

export const createFaq = async (input: Partial<FAQEntity>) => {
  return await faqRepository.save(faqRepository.create(input));
};
export const saveFaq = async (faq: FAQEntity) => {
  return await faqRepository.save(faq);
};

export const createInclude = async (input: Partial<IncludeEntity>) => {
  return await includeRepository.save(includeRepository.create(input));
};
export const saveInclude = async (include: IncludeEntity) => {
  return await includeRepository.save(include);
};

export const createObjective = async (input: Partial<ObjectiveEntity>) => {
  return await objectiveRepository.save(objectiveRepository.create(input));
};
export const saveObjective = async (objective: ObjectiveEntity) => {
  return await objectiveRepository.save(objective);
};

export const createSection= async (input: Partial<SectionEntity>) => {
  return await sectionRepository.save(sectionRepository.create(input));
};
export const saveSection = async (section: SectionEntity) => {
  return await sectionRepository.save(section);
};

export const createQuiz = async (input: Partial<QuizEntity>) => {
  return await quizRepository.save(quizRepository.create(input));
};
export const saveQuiz = async (quiz: QuizEntity) => {
  return await quizRepository.save(quiz);
};

export const createLesson = async (input: Partial<LessonEntity>) => {
  return await lessonRepository.save(lessonRepository.create(input));
};
export const saveLesson = async (lesson: LessonEntity) => {
  return await lessonRepository.save(lesson);
};
export const findFaqById = async (faqId: number, relations: any[] = []) => {
  return await faqRepository.findOne({
    where: { id: Equal(faqId) },
    relations: relations,
  });
};
export const findObjectiveById = async (objectiveId: number, relations: any[] = []) => {
  return await objectiveRepository.findOne({
    where: { id: Equal(objectiveId) },
    relations: relations,
  });
};
export const findIncludeById = async (includeId: number, relations: any[] = []) => {
  return await includeRepository.findOne({
    where: { id: Equal(includeId) },
    relations: relations,
  });
};
export const findRequirementById = async (requirementId: number, relations: any[] = []) => {
  return await requirementRepository.findOne({
    where: { id: Equal(requirementId) },
    relations: relations,
  });
};

export const findCourseById = async (courseId: string, relations: any[] = []) => {
  return await courseRepository.findOne({
    where: { id: Equal(courseId) },
    relations: relations,
  });
};
export const findSectionById = async (sectionId: string, relations: any[] = []) => {
  return await sectionRepository.findOne({
    where: { id: Equal(sectionId) },
    relations: relations,
  });
};

export const findCourse = async (query: any, relations: any[] = []) => {
  return await courseRepository.findOne({
    where: query,
    relations: relations,
  });
};

export const findSections = async (query: any, relations: any[] = []) => {
  return await sectionRepository.find({
    where: query,
    relations: relations,
  });
};

export const queryCourses = async (params: IQuery) => {
  return await courseRepository.find({
    where: params.query,
    select: params.select,
    relations: params.relations,
    skip: params.skip,
    take: params.take,
    order: params.order
  });
}

export const findCourses = async (query: any, relations: any[] = [], select: any = {}) => {
  return await courseRepository.find({
    select: select,
    where: query,
    relations: relations,
  });
};
export const deleteCourse = async (courseId: string) => {
  return await courseRepository.delete({ id: Equal(courseId) });
};

export const deleteRequirement = async (requirementId: number) => {
  return await requirementRepository.delete({ id: Equal(requirementId) });
};
export const deleteRequirements = async (ids: number[], courseId: string) => {
  return await requirementRepository.delete({ id: Not(In(ids)), course: Equal(courseId) });
};
export const deleteFaq = async (faqId: number) => {
  return await faqRepository.delete({ id: Equal(faqId) });
};
export const deleteFaqs = async (ids: number[], courseId: string) => {
  return await faqRepository.delete({ id: Not(In(ids)), course: Equal(courseId) });
};
export const deleteInclude = async (includeId: number) => {
  return await includeRepository.delete({ id: Equal(includeId) });
};
export const deleteIncludes = async (ids: number[], courseId: string)=> {
  return await includeRepository.delete({ id: Not(In(ids)), course: Equal(courseId) });
};
export const deleteObjective = async (objectiveId: number) => {
  return await objectiveRepository.delete({ id: Equal(objectiveId) });
};
export const deleteObjectives = async (ids: number[], courseId: string) => {
  return await objectiveRepository.delete({ id: Not(In(ids)), course: Equal(courseId) });
};
export const deleteLesson = async (lessonId: string) => {
  return await lessonRepository.delete({ id: Equal(lessonId) });
};

export const countCourses = async (query: any) => {
  return await courseRepository.countBy(query as FindOptionsWhere<CourseEntity>);
};

export const countSections = async (query: any) => {
  return await sectionRepository.countBy(query as FindOptionsWhere<SectionEntity>);
};

export const findQuizById = async (quizId: string, relations: any[] = []) => {
  return await quizRepository.findOne({
    where: { id: Equal(quizId) },
    relations: relations,
  });
};
export const findOneQuiz = async (query: any, relations: any[] = []) => {
  return await quizRepository.findOne({
    where: query,
    relations: relations,
  });
};
export const queryQuiz = async (params: IQuery) => {
  return await quizRepository.find({
    where: params.query,
    select: params.select,
    relations: params.relations,
    skip: params.skip,
    take: params.take,
    order: params.order
  });
}
export const countQuiz = async (query: any) => {
  return await quizRepository.countBy(query as FindOptionsWhere<QuizEntity>);
};


export const findLessonById = async (lessonId: string, relations: any[] = []) => {
  return await lessonRepository.findOne({
    where: { id: Equal(lessonId) },
    relations: relations,
  });
};
export const findOneLesson = async (query: any, relations: any[] = []) => {
  return await lessonRepository.findOne({
    where: query,
    relations: relations,
  });
};
export const queryLesson = async (params: IQuery) => {
  return await lessonRepository.find({
    where: params.query,
    select: params.select,
    relations: params.relations,
    skip: params.skip,
    take: params.take,
    order: params.order
  });
}
export const countLesson = async (query: any) => {
  return await lessonRepository.countBy(query as FindOptionsWhere<LessonEntity>);
};
export const verifyCourseStatus = async (courseId: any) => {
  const Course = await findCourseById(courseId, ['preview', 'category', 'provider', 'trainers', 'requirements', 'faqs', 'includes', 'objectives', 'sections' ,'sections.quiz', 'sections.quiz.questions', 'sections.lessons'])
  let verify = true

  if(!Course.requirements.length) verify = false
  if(!Course.faqs.length) verify = false
  if(!Course.includes.length) verify = false
  if(!Course.objectives.length) verify = false

  if(!Course.sections.length) verify = false

  if(Course.sections.length){
    await Promise.all(
      Course.sections.map(async (section) => {
        await verifySectionStatus(section.id)
      })
    )
  }

  const Section = await countSections( { course: Equal(courseId), status: 0 })
  if(Section > 0) verify = false

  if(!verify) {
    Course.status = 0
    await saveCourse(Course);
  } else {
    if(Course.status == 0) {
      Course.status = 1
      await saveCourse(Course);
    }
  }
};
export const verifySectionStatus = async (sectionId: any) => {
  const Section = await findSectionById(sectionId)
  let verify = true

  //Verify Quiz is complete
  const Quiz = await findOneQuiz({ section: Equal(sectionId), passingGrade: Not(IsNull()) })
  if(!Quiz) {
    verify = false
  }
  else {
    //Verify Questions is complete
    const Questions = await countQuestions({ quiz: Equal(Quiz.id), status: 1, type: Not(IsNull()) })
    if(Questions < MIN_QUESTION_QUIZ) {
      verify = false
      Quiz.status = 0
    } else {
      Quiz.status = 1
    }
    await saveQuiz(Quiz)
    //Verify Lessons is complete
    const Lessons = await countLesson({ section: Equal(sectionId), status: 0 })
    if(Lessons > 0) {
      verify = false
    }
  }

  if(!verify) {
    Section.status = 0
    await saveSection(Section);
  }
  else {
    Section.status = 1
    await saveSection(Section);
  }
};