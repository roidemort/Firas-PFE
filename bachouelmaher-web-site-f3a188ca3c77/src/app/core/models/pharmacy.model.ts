import {User} from "./user.model";

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  city: string;
  zipCode: string;
  email: string;
  status: number;
  tel: string;
  createdAt: string;
  updatedAt: string;
}
export interface Key {
  id: string;
  key: string;
  status: number;
  createdAt: string;
  updatedAt: string;
  user?: User
  pharmacy?: Pharmacy
  role?: string; 
}
