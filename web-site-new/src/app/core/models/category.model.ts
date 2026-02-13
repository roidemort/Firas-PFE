import {Image} from "./image.model";
import {Seo} from "./seo.model";

export interface Category {
  id: string;
  name: string;
  position: number;
  slug: string;
  is_searchable: number;
  status: number;
  createdAt: string;
  updatedAt: string;
  children?: Category[]
  parent?: Category
  banner?: Image
  logo?: Image
  icon?: string
  seo?: Seo
}
