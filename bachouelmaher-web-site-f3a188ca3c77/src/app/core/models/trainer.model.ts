import {Image} from "./image.model";
import {Provider} from "./provider.model";

export interface Trainer {
  id: string;
  name: string;
  description: string;
  email: string;
  twitter: string;
  job: string;
  image?: Image
  status: number;
  createdAt: string;
  updatedAt: string;
  providers?: Provider[]
}
