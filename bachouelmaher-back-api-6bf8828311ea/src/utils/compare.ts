import { CategoryEntity } from "@/orm/entities/category.entity"

export const compare = ( a: CategoryEntity, b: CategoryEntity ) => {
  if ( a.position < b.position ){
    return -1;
  }
  if ( a.position > b.position ){
    return 1;
  }
  return 0;
}