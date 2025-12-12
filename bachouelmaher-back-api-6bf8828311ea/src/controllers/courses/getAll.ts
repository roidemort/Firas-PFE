import { NextFunction, Request, Response } from 'express';
import pick from "@/utils/pick"
import { IOptions } from "@/interfaces/IOptions"
import { organize } from "@/utils/organize"
import { countCourses, queryCourses } from "@/services/course.service"
import { Equal, Like } from "typeorm"

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role } = req.jwtPayload;
    const filter = pick(req.query, ['provider', 'category', 'paid', 'comingSoon']);
    Object.assign(filter, { status : 1, roles: Like(`%${role}%`) })
    if(req.query.provider) Object.assign(filter, { provider :{ id: Equal(req.query.provider) } })
    if(req.query.category) Object.assign(filter, { category :{ id: Equal(req.query.category) } })
    const options: IOptions = pick(req.query, ['orderBy', 'select', 'relations', 'take', 'page']);
    Object.assign(options, { relations : 'category,preview,provider,provider.logo,sections' })
    let params = organize(filter, options)
    let relations = {}
    if(params.relations) {
      relations = Object.keys(params.relations)
    }
    params.relations = relations
    const courses = await queryCourses(params);
    const count = await countCourses(params.query);
    const listCourses = { count, courses }
    return res.customSuccess(200, 'List of courses.', listCourses, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
