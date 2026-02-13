import {Image} from "./image.model";

export interface Trend {
  id: string;
  title: string;
  position: number;
  details: string;
  image?: Image
  status: number;
  createdAt: string;
  updatedAt: string;
}
