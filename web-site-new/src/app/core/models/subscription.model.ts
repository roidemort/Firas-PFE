import {User} from "./user.model";
import {Package} from "./package.model";

export interface Subscription {
  id: string;
  status: number;
  usersNumber: number;
  startedAt: string;
  endedAt: string;
  createdAt: string;
  updatedAt: string;
  paymentMethod: string;
  secure_url?: string;
  public_id?: string;
  buyer: User;
  package: Package;
  users: User[];
}
