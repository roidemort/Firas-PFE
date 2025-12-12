import { IOptions, IQuery } from "@/interfaces/IOptions"
import { Like } from "typeorm"
import {PER_PAGE_DEFAULT} from "@/core/config";

export const organize = (filter: Record<string, any>, options: IOptions): IQuery => {
  const take = options.take && parseInt(options.take.toString(), 10) > 0 ? parseInt(options.take.toString(), 10) : PER_PAGE_DEFAULT;
  const page = options.page && parseInt(options.page.toString(), 10) > 0 ? parseInt(options.page.toString(), 10) : 1;
  const skip = (page - 1) * take;

  let order = {};
  if (options.orderBy) {
    options.orderBy.split(',').forEach((sortOption: string) => {
      const [key, value] = sortOption.split(':');
      order[key] = value === "desc" ? "DESC" : "ASC"
    });
  } else {
    order = { "createdAt": "DESC" };
  }

  let select = {};
  if (options.select) {
    options.select.split(',').forEach((selectedOption) => {
      select[selectedOption] = true
    });
  }

  let relations = {};
  if (options.relations) {
    options.relations.split(',').forEach((selectedOption) => {
      relations[selectedOption] = true
    });
  }

  let query: { [p: string]: any } = [];
  if(filter) {
    if (filter.hasOwnProperty('text') && filter.text) {
      const [keys, value] = filter.text.split(':');
      keys.split(',').forEach((key: string) => {
        query.push({ [key]: Like(`%${value}%`)})
      })
      delete filter['text'];
      query.forEach((value: any) => {
        Object.assign(value, filter)
      })
    } else {
      query = { ...filter }
    }
  }
  return {
    take,
    skip,
    order,
    select,
    relations,
    query,
  }
}