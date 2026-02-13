import {Question} from "./question.model";
import {Section} from "./section.model";

export interface Quiz {
  id: string;
  title: string;
  details?: string;
  passingGrade?: number;
  status?: number;
  createdAt?: string;
  updatedAt?: string;
  questions?: Question[]
  section?: Section
}
