import {CategoryCapsule} from "./category-capsule.model";
import {Provider} from "./provider.model";

export interface Capsule {
  id: string;
  title: string;
  details: string;
  url: string;
  status: number;
  createdAt: string;
  updatedAt: string;
  category: CategoryCapsule
  provider: Provider
}
