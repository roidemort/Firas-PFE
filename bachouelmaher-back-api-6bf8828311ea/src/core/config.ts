import * as dotenv from "dotenv"

dotenv.config();

export const ENVIRONMENT = process.env.NODE_ENV || 'development';
export const APP_PORT = process.env.PORT || 3000;
export const CLIENT_URL = process.env.CLIENT_URL || `http://localhost:${APP_PORT}/`;
export const IS_PRODUCTION = ENVIRONMENT === 'production';
export const IS_TEST = ENVIRONMENT === 'test';
//export const FRONT_URL = process.env.FRONT_URL || 'http://localhost:4200';
export const FRONT_URL = 'http://localhost:4200';

export const APP_PREFIX_PATH = process.env.APP_PREFIX_PATH || '/api';
export const JWT_SECRET = process.env.JWT_SECRET || 'dev';
export const JWT_EXPIRE = Number(process.env.JWT_EXPIRE) || 86400000;
export const PER_PAGE_DEFAULT = Number(process.env.PER_PAGE_DEFAULT) || 10;
export const MIN_QUESTION_QUIZ = Number(process.env.MIN_QUESTION_QUIZ) || 5;
export const QUESTION_QUIZ = Number(process.env.QUESTION_QUIZ) || 5;