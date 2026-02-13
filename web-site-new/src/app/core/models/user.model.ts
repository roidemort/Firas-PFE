import {Key} from "./pharmacy.model";
import {Subscription} from "./subscription.model";
import {Package} from "./package.model";
import {Course} from "./course.entity";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: number;
  gender: string;
  tel: string;
  birthday: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  address?: string;
  img_link?: string;
  city?: string;
  zipCode?: string;
  key?: Key;
  subscribe: Subscription
  package?: Package
}
 export interface UserCourse {
  id: string;
  createdAt: string;
  updatedAt: string;
   startedAt: string;
   endedAt: string;
   points: number;
   quizNumber: number;
   quizPoints: number;
   status: number;
   course: Course;
   user: User;
 }
