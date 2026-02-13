import {User} from "./user.model";
import {Course} from "./course.entity";

export interface Rating {
  id?: string;
  rating: number;
  status: number;
  createdAt: string;
  updatedAt: string;
  comment?: string;
  user?: User
  course?: Course
}

export interface Star {
  stars: number;
  count: number;
}
