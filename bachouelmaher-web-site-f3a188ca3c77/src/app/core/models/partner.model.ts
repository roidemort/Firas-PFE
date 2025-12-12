import {Image} from "./image.model";

export interface Partner {
  id: string;
  name: string;
  status: number;
  createdAt: string;
  updatedAt: string;
  position: number;
  logo?: Image
}
