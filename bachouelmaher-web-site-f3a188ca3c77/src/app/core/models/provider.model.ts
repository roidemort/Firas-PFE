import {Image} from "./image.model";
import {Seo} from "./seo.model";
import {Trainer} from "./trainer.model";

export interface Provider {
  id: string;
  name: string;
  slug: string;
  status: number;
  is_searchable: number;
  createdAt: string;
  updatedAt: string;
  position: number;
  logo?: Image
  trainers?: Trainer[]
}
