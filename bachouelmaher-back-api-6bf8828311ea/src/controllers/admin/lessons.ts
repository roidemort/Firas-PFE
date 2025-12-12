import { NextFunction, Request, Response } from "express"
import pick from "@/utils/pick"
import { IOptions } from "@/interfaces/IOptions"
import { organize } from "@/utils/organize"
import {
  countLesson, createLesson,
  findLessonById, findSectionById,
  queryLesson,
  saveLesson, verifyCourseStatus
} from "@/services/course.service"
import RedisService from "@/services/redis.service"
import { Equal } from "typeorm"

export const getAllLesson = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter = pick(req.query, ['text', 'status', 'course', 'section']);

    const options: IOptions = pick(req.query, ['orderBy', 'select', 'relations', 'take', 'page']);
    let params = organize(filter, options)
    let relations = {}
    if(params.relations) {
      relations = Object.keys(params.relations)
    }
    params.relations = relations

    if(params.query.section) {
      const sectionId = params.query.section
      delete params.query.section
      Object.assign(params.query, {
        section: {
          id: Equal(sectionId)
        }
      });
      delete params.query.course
    }
    if(params.query.course) {
      Object.assign(params.query, {
        section: {
          course: {
            id: Equal(params.query.course)
          }
        }
      });
      delete params.query.course
    }


    const lesson = await queryLesson(params);
    const count = await countLesson(params.query);
    const listLesson = { lesson, count }

    return res.customSuccess(200, 'List of lesson.', listLesson, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
export const getDetailsLesson = async (req: Request, res: Response, next: NextFunction) => {
  const lessonId = req.params.id;
  try {
    const lesson = await findLessonById(lessonId, ['section', 'section.course'])
    if (!lesson) {
      return  res.customSuccess(200, 'Error', {}, false);
    }
    return res.customSuccess( 200, 'Details of lesson.', lesson, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
export const addLesson = async (req: Request, res: Response, next: NextFunction) => {
  const { title, type, details ,sectionId } = req.body;
  try {
    const Section = await findSectionById(sectionId, ['lessons','course'])
    if (!Section) {
      return res.customSuccess(200, 'Error', {}, false);
    }
    let status = 0
    if (title && type && details) status = 1
    const lesson = await createLesson({
      title: title,
      type: type,
      details: details,
      section: Section,
      position: Section.lessons.length,
      status
    })
    await RedisService.incCreateIfNotExist('lessons', 1)
    await verifyCourseStatus(Section.course.id)
    return res.customSuccess(200, 'Lesson successfully created.', {lesson}, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
}
export const updateLesson = async (req: Request, res: Response, next: NextFunction) => {
  const { title, type, details  } = req.body;
  const lessonId = req.params.id;

  try {
    const Lesson = await findLessonById(lessonId, ['section', 'section.course'])

    if (!Lesson) {
      return  res.customSuccess(200, 'Error', {}, false);
    }

    if (title) Lesson.title = title;
    if (type) Lesson.type = type;
    if (details) Lesson.details = details;

    let status = 0
    if(title && type && details) status = 1
    Lesson.status = status;

    Lesson.updatedAt = new Date();

    await saveLesson(Lesson);
    await verifyCourseStatus(Lesson.section.course.id)

    return  res.customSuccess( 200, 'Lesson successfully changed.', { lesson: Lesson }, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};