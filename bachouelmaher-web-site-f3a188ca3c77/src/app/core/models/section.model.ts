import {Quiz} from "./quiz.model";
import {Lesson} from "./lesson.model";
import {Course} from "./course.entity";

export interface Section {
  id?: string;
  title: string;
  details: string;
  position?: number;
  status?: number;
  createdAt?: string;
  updatedAt?: string;
  quiz: Quiz | string
  lessons: Lesson[]
  quizId?: string;
  course?: Course
}
