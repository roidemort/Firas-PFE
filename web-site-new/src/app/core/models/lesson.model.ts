import {Section} from "./section.model";

export interface Lesson {
  id?: string;
  title: string;
  type?: string;
  details?: string;
  status?: number;
  createdAt?: string;
  updatedAt?: string;
  section?: Section
}
