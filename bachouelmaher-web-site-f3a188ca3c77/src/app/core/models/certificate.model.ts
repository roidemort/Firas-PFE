import {Image} from "./image.model";

export interface Certificate {
  id: string;
  name: string;
  title: string;
  sub_title?: string;
  description?: string;
  positionTitle?: any;
  positionSubTitle?: any;
  positionDescription?: any;
  positionSignature?: any;
  status: number;
  createdAt: string;
  updatedAt: string;
  background?: Image
  signature?: Image
}
