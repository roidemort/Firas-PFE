import { NextFunction, Request, Response } from "express"
import {findSectionById, saveSection, verifyCourseStatus} from "@/services/course.service"

export const getDetailsSection = async (req: Request, res: Response, next: NextFunction) => {
  const sectionId = req.params.id;
  try {
    const section = await findSectionById(sectionId)
    if (!section) {
      return  res.customSuccess(200, 'Error', {}, false);
    }
    return res.customSuccess( 200, 'Details of section.', section, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
export const updateSection = async (req: Request, res: Response, next: NextFunction) => {
  const { title, details  } = req.body;
  const sectionId = req.params.id;

  try {
    const Section = await findSectionById(sectionId ,['course'])

    if (!Section) {
      return  res.customSuccess(200, 'Error', {}, false);
    }

    if (title) Section.title = title;
    if (details) Section.details = details;

    Section.updatedAt = new Date();

    await saveSection(Section);
    await verifyCourseStatus(Section.course.id)
    return  res.customSuccess( 200, 'Section successfully changed.', { section: Section }, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};