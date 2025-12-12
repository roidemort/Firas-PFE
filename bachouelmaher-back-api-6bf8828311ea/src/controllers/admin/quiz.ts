import { NextFunction, Request, Response } from "express"
import pick from "@/utils/pick"
import { IOptions } from "@/interfaces/IOptions"
import { organize } from "@/utils/organize"
import {
  countQuiz,
  findQuizById,
  queryQuiz,
  saveQuiz, verifyCourseStatus
} from "@/services/course.service"
import { Equal } from "typeorm"

export const getAllQuiz = async (req: Request, res: Response, next: NextFunction) => {
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


    const quiz = await queryQuiz(params);
    const count = await countQuiz(params.query);
    const listQuiz = { quiz, count }

    return res.customSuccess(200, 'List of quiz.', listQuiz, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
export const getDetailsQuiz = async (req: Request, res: Response, next: NextFunction) => {
  const quizId = req.params.id;
  try {
    const quiz = await findQuizById(quizId, ['questions', 'section', 'section.course'])
    if (!quiz) {
      return  res.customSuccess(200, 'Error', {}, false);
    }
    return res.customSuccess( 200, 'Details of quiz.', quiz, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
export const updateQuiz = async (req: Request, res: Response, next: NextFunction) => {
  const { title, details, passingGrade, status  } = req.body;
  const quizId = req.params.id;

  try {
    const Quiz = await findQuizById(quizId, ['section', 'section.course'])

    if (!Quiz) {
      return  res.customSuccess(200, 'Error', {}, false);
    }

    if (title) Quiz.title = title;
    if (passingGrade) Quiz.passingGrade = passingGrade;
    if (details) Quiz.details = details;
    if (status) Quiz.status = status;

    Quiz.updatedAt = new Date();

    await saveQuiz(Quiz);
    await verifyCourseStatus(Quiz.section.course.id)
    return  res.customSuccess( 200, 'Quiz successfully changed.', { quiz: Quiz }, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};