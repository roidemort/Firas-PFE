export interface SeoMeta {
  id: string
  content?: string
  name?: string
  property?: string
}
export interface Seo {
  id: string;
  permalink: string
  status: number
  title: string
  robots: string
  metaTags : SeoMeta[]
  createdAt: string;
  updatedAt: string;
}
