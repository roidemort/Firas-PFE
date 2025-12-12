import {Image} from "./image.model";

export interface Advertisement {
  id: string;
  title?: string;
  position: number;
  type: string;
  image?: Image
  video?: string
  details?: string
  permalink?: string
  status: number;
  createdAt: string;
  updatedAt: string;
}
