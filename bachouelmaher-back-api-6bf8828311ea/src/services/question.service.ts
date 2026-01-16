import { Equal, FindOptionsWhere } from "typeorm"

import { AppDataSource } from "@/orm/data-source"
import { QuestionEntity } from "@/orm/entities/question.entity"
import { IQuery } from "@/interfaces/IOptions"
import { QUESTION_QUIZ } from "@/core/config"
import { QuestionResponseEntity } from "@/orm/entities/question-response.entity"

const questionRepository = AppDataSource.getRepository(QuestionEntity);
const questionResponseRepository = AppDataSource.getRepository(QuestionResponseEntity);

export const createQuestion = async (input: Partial<QuestionEntity>) => {
  return await questionRepository.save(questionRepository.create(input));
};
export const saveQuestion = async (question: QuestionEntity) => {
  return await questionRepository.save(question);
};

export const createResponseQuestion = async (input: Partial<QuestionResponseEntity>) => {
  return await questionResponseRepository.save(questionResponseRepository.create(input));
};
export const saveResponseQuestion = async (question: QuestionResponseEntity) => {
  return await questionResponseRepository.save(question);
};

export const findQuestionById = async (questionId: string, relations: any[] = []) => {
  return await questionRepository.findOne({
    where: { id: Equal(questionId) },
    relations: relations,
  });
};

export const findQuestion = async (query: any, relations: any[] = []) => {
  return await questionRepository.findOne({
    where: query,
    relations: relations,
  });
};

export const findQuestionResponse = async (query: any, relations: any[] = []) => {
  return await questionResponseRepository.findOne({
    where: query,
    relations: relations,
  });
};

export const queryQuestions = async (params: IQuery) => {
  return await questionRepository.find({
    where: params.query,
    select: params.select,
    relations: params.relations,
    skip: params.skip,
    take: params.take,
    order: params.order
  });
}

export const findQuestions = async (query: any, relations: any[] = [], select: any = {}) => {
  return await questionRepository.find({
    select: select,
    where: query,
    relations: relations,
  });
};
export const deleteQuestion = async (questionId: string) => {
  return await questionRepository.delete({ id: Equal(questionId) });
};

export const countQuestions = async (query: any) => {
  return await questionRepository.countBy(query as FindOptionsWhere<QuestionEntity>);
};

export const getRandomQuestionFromQuiz = async (quizId: string) => {
  return await questionRepository
    .createQueryBuilder('question')
    // 1. Join the image table
    .leftJoin('question.image', 'image')
    // 2. Update select to include image properties (url and id)
    .select([
        'question.id',
        'question.text',
        'question.points',
        'question.type',
        'question.topic',
        'question.a',
        'question.b',
        'question.c',
        'question.d',
        'question.details',
        'image.secure_url', // <--- We need the URL to show it
        'image.id'          // <--- Good practice to have the ID
    ])
    .where("question.quizId = :quizId", { quizId: quizId })
    .orderBy('RAND()')
    .take(QUESTION_QUIZ)
    .getMany()
}