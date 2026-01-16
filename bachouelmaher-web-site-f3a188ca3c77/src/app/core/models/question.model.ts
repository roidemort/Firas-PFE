import {Quiz} from "./quiz.model";

export interface Question {
  id: string;
  text: string;
  type: string;
  topic: string;
  answer: string;
  points: number;
  a?: string;
  b?: string;
  c?: string;
  d?: string;
  details: string;
  justification: string;
  status: number;
  createdAt: string;
  updatedAt: string;
  quiz?: Quiz
  image?: {
      id: string;
      secure_url: string;
  } | null;
}
