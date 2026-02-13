import {Category} from "./category.model";
import {Image} from "./image.model";
import {Provider} from "./provider.model";
import {Trainer} from "./trainer.model";
import {Section} from "./section.model";
import {Certificate} from "./certificate.model";

export interface Course {
  id: string;
  title: string;
  details: string;
  previewVideo: string;
  status: number;
  points: number;
  expiration: number;
  language: string;
  duration: string;
  level: string;
  paid: boolean;
  roles: string[];
  comingSoon: boolean;
  price?: string;
  discountPrice?: string;
  messageComingSoon?: string;
  endTimeComingSoon?: string;
  createdAt: string;
  updatedAt: string;
  category: Category;
  certificate: Certificate;
  preview?: Image;
  provider: Provider;
  trainers: Trainer[];
  requirements: Requirement[]
  faqs: Faq[]
  includes: Include[]
  objectives: Objective[]
  sections: Section[]
  free: boolean;
}
export interface Requirement {
  id: string;
  value: string;
}
export interface Faq {
  id: string;
  title: string;
  content: string;
}
export interface Include {
  id: string;
  icon: string;
  text: string;
}
export interface Objective {
  id: string;
  value: string;
}
