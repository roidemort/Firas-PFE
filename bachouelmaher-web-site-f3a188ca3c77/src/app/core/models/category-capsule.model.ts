import {Capsule} from "./capsule.model";

export interface CategoryCapsule {
  id: string;
  name: string;
  position: number;
  status: number;
  createdAt: string;
  updatedAt: string;
  children?: CategoryCapsule[]
  parent?: CategoryCapsule
  capsules?: Capsule[]
}
