import { NextFunction, Request, Response } from 'express';
import RedisService from "@/services/redis.service"
import {
  countQuestions,
  createQuestion,
  findQuestionById,
  queryQuestions, saveQuestion
} from "@/services/question.service"
import pick from "@/utils/pick"
import { IOptions } from "@/interfaces/IOptions"
import { organize } from "@/utils/organize"
import {findOneQuiz, verifyCourseStatus} from "@/services/course.service"
import { Equal } from "typeorm"


export const getAllQuestions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter = pick(req.query, ['text', 'status', 'course', 'section']);
    const options: IOptions = pick(req.query, ['orderBy', 'select', 'relations', 'take', 'page']);
    let params = organize(filter, options)
    if(params.query.section) {
      const sectionId = params.query.section
      delete params.query.section
      Object.assign(params.query, {
        quiz : {
          section: {
            id: Equal(sectionId)
          }
        }
      });
      delete params.query.course
    }
    if(params.query.course) {
      Object.assign(params.query, {
        quiz :{
        section: {
          course: {
            id: Equal(params.query.course)
          }
        }
      }
      });
      delete params.query.course
    }
    const questions = await queryQuestions(params);
    const count = await countQuestions(params.query);
    const listQuestions = { questions, count }

    return res.customSuccess(200, 'List of questions.', listQuestions, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
export const getDetailsQuestion = async (req: Request, res: Response, next: NextFunction) => {
  const questionId = req.params.id;
  try {
    const question = await findQuestionById(questionId, ['quiz', 'quiz.section', 'quiz.section.course'])
    if (!question) {
      return  res.customSuccess(200, 'Error', {}, false);
    }
    return res.customSuccess( 200, 'Details of question.', question, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
export const addQuestion = async (req: Request, res: Response, next: NextFunction) => {
  const { text, type, topic, answer, points, a, b, c, d, details, justification, sectionId } = req.body;
  try {
    const Quiz = await findOneQuiz( { 'section.id': Equal(sectionId)}, ['section', 'section.course'])
    if (!Quiz) {
      return  res.customSuccess(200, 'Error', {}, false);
    }
    let newAnswer = answer
    if(Array.isArray(answer)){ newAnswer = answer.join(',')}
    const question = await createQuestion({
      text, type, topic, answer: newAnswer, points, a, b, c, d, details, justification, quiz: Quiz
    });
    await RedisService.incCreateIfNotExist('questions', 1)
    await verifyCourseStatus(Quiz.section.course.id)
    return res.customSuccess( 200, 'Question successfully created.', { question }, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
export const updateQuestion = async (req: Request, res: Response, next: NextFunction) => {
  const { text, type, topic, answer, points, a, b, c, d, details, status, justification  } = req.body;
  const questionId = req.params.id;

  try {
    const Question = await findQuestionById(questionId, ['quiz', 'quiz.section', 'quiz.section.course'])

    if (!Question) {
      return  res.customSuccess(200, 'Error', {}, false);
    }

    if (text) Question.text = text;
    if (type) Question.type = type;
    if (topic) Question.topic = topic;
    if (justification) Question.justification = justification;
    if (answer) {
      let newAnswer = answer
      if(Array.isArray(answer)){ newAnswer = answer.join(',')}
      Question.answer = newAnswer
    }
    if (points) Question.points = points;
    if (a) Question.a = a;
    if (b) Question.b = b;
    if (c) Question.c = c;
    if (d) Question.d = d;
    if (details) Question.details = details;
    if (status) Question.status = status;

    Question.updatedAt = new Date();

    await saveQuestion(Question);
    await verifyCourseStatus(Question.quiz.section.course.id)
    return  res.customSuccess( 200, 'Question successfully changed.', { question: Question }, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};