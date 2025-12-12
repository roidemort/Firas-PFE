import { NextFunction, Request, Response } from "express"
import RedisService from "@/services/redis.service"
import {
  countCourses,
  createCourse,
  createFaq,
  createInclude,
  createLesson,
  createObjective,
  createQuiz,
  createRequirement,
  createSection,
  deleteFaq,
  deleteInclude,
  deleteLesson,
  deleteObjective,
  deleteRequirement,
  findCourse,
  findCourseById,
  findFaqById,
  findIncludeById,
  findLessonById,
  findObjectiveById,
  findQuizById,
  findRequirementById,
  findSectionById,
  queryCourses,
  saveCourse,
  saveFaq,
  saveInclude,
  saveLesson,
  saveObjective, saveQuiz,
  saveRequirement,
  saveSection, verifyCourseStatus
} from "@/services/course.service"
import pick from "@/utils/pick"
import { IOptions } from "@/interfaces/IOptions"
import { organize } from "@/utils/organize"
import slugify from "slugify"
import { findCategoryById } from "@/services/category.service"
import { Between, Equal, In, Like, Not } from "typeorm"
import { findProviderById } from "@/services/provider.service"
import { findImageById } from "@/services/image.service"
import { findTrainers } from "@/services/trainer.service"
import { findCertificateById } from "@/services/certificate.service"
import moment from "moment/moment"
import { countUsers, findUser, findUsers } from "@/services/user.service"
import * as _ from "lodash"
import { PER_PAGE_DEFAULT } from "@/core/config"
import { countEnrollCourses, queryEnrollCourses } from "@/services/enroll-course.service"


export const getAllCourses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter = pick(req.query, ['text', 'status', 'paid', 'comingSoon']);
    const options: IOptions = pick(req.query, ['orderBy', 'select', 'relations', 'take', 'page']);
    let params = organize(filter, options)
    let relations = {}
    if(params.relations) {
      relations = Object.keys(params.relations)
    }
    params.relations = relations
    const courses = await queryCourses(params);
    const count = await countCourses(params.query);
    const listCourses = { courses, count }

    return res.customSuccess(200, 'List of courses.', listCourses, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
export const getDetailsCourse = async (req: Request, res: Response, next: NextFunction) => {
  const courseId = req.params.id;
  try {
    const course = await findCourseById(courseId, ['certificate', 'preview', 'category', 'provider', 'trainers', 'requirements', 'faqs', 'includes', 'objectives', 'sections' ,'sections.quiz', 'sections.lessons'])
    if (!course) {
      return  res.customSuccess(200, 'Error', {}, false);
    }
    return res.customSuccess( 200, 'Details of course.', course, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
export const addCourse = async (req: Request, res: Response, next: NextFunction) => {
  const { title, details, previewVideo, points, expiration, duration, language, level, roles, paid, price, discountPrice, comingSoon, messageComingSoon, endTimeComingSoon, preview, category, provider, team, objectives, includes, faqs, requirements, sections, certificate } = req.body;
  try {
    let slug = slugify(title,
      {
        replacement: '-',
        remove: undefined,
        lower: true,
        strict: false,
        locale: 'fr',
        trim: true
      })
    let Preview = null
    const courseBySlug = await findCourse({ slug: Equal(slug) })

    if (courseBySlug) {
      const countCourseBySlug = await countCourses({ slug: Like(`%${slug}%`) })
      slug = slugify(courseBySlug.slug + '-' + countCourseBySlug)
    }

    if(preview) Preview = await findImageById(preview)
    const Category = await findCategoryById(category)
    const Provider = await findProviderById(provider)
    const Certificate = await findCertificateById(certificate)
    let Team = await findTrainers({ id: In(team)})

    if(!Category || !Provider || !Certificate || !Team.length) return  res.customSuccess(200, 'Error', {}, false);

    const course = await createCourse({
      title, details, previewVideo, slug, points, expiration, duration, roles, language, level, paid, price, discountPrice, comingSoon, messageComingSoon, endTimeComingSoon, preview: Preview, category: Category, provider: Provider, trainers: Team, certificate: Certificate
    });
    await RedisService.incCreateIfNotExist('courses', 1)
    await Promise.all([
      requirements.map(async (requirement: { value: string; }) => {
        await createRequirement({ value: requirement.value, course: course })
      }),
      faqs.map(async (faq: { title: string; content: string }) => {
        await createFaq({ title: faq.title, content: faq.content, course: course })
      }),
      includes.map(async (include: { icon: string; text: string }) => {
        await createInclude({ icon: include.icon, text: include.text, course: course })
      }),
      objectives.map(async (objective: { value: string; }) => {
        await createObjective({ value: objective.value, course: course })
      }),
      sections.map(async (section: { title: string; details: string, position: number, lessons: [{ title : string, position: number }], quiz: string }) => {
        const Section = await createSection({ title: section.title, details: section.details, course: course, position: section.position })
        Section.quiz = await createQuiz({ title: section.quiz, section: Section })
        await saveSection(Section);
        section.lessons.map(async lesson => {
          await createLesson({ title: lesson.title, section: Section, position: lesson.position })
        })
      }),
    ])
    await verifyCourseStatus(course.id);
    return res.customSuccess( 200, 'Course successfully created.', { course }, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
export const updateCourse = async (req: Request, res: Response, next: NextFunction) => {
  const { title, details, previewVideo, points, expiration, duration, language, level, paid, price, discountPrice, comingSoon, messageComingSoon, endTimeComingSoon, preview, category, provider, team, status, roles, objectives, includes, faqs, requirements, sections, certificate }  = req.body;
  const courseId = req.params.id;

  try {
    const Course = await findCourseById(courseId)

    if (!Course) {
      return  res.customSuccess(200, 'Error', {}, false);
    }

    if (title) Course.title = title;
    if (details) Course.details = details;
    if (previewVideo) Course.previewVideo = previewVideo;
    if (points) Course.points = points;
    if (expiration) Course.expiration = expiration;
    if (duration) Course.duration = duration;
    if (language) Course.language = language;
    if (level) Course.level = level;
    Course.paid = paid || false;

    if (paid && price) Course.price = price;
    else Course.price = null

    if (paid && discountPrice) Course.discountPrice = discountPrice;
    else Course.discountPrice = null

    let Preview = null
    if(preview) Preview = await findImageById(preview)
    const Category = await findCategoryById(category)
    const Provider = await findProviderById(provider)
    const Certificate = await findCertificateById(certificate)
    let Team = await findTrainers({ id: In(team)})

    if(!Category || !Provider || !Certificate || !Team.length) return  res.customSuccess(200, 'Error', {}, false);

    Course.category = Category
    Course.provider = Provider
    Course.certificate = Certificate
    Course.trainers = Team
    Course.preview = Preview

    if (roles) Course.roles = roles;
    Course.comingSoon = comingSoon || false;
    Course.messageComingSoon = messageComingSoon || null;
    Course.endTimeComingSoon = endTimeComingSoon || null;
    if (status) Course.status = status;
    if (certificate) Course.certificate = await findCertificateById(certificate);
    if(faqs && faqs.length) {
      await Promise.all(
        faqs.map(async (faq: { id: number; title: string; content: string }) => {
          if (faq.id) {
            const Faq = await findFaqById(faq.id)
            if (Faq) {
              Faq.title = faq.title
              Faq.content = faq.content
              await saveFaq(Faq)
            }
          } else {
            await createFaq({ title: faq.title, content: faq.content, course: Course })
          }
        })
      )
    }
    if(objectives && objectives.length) {
      await Promise.all(
        objectives.map(async (objective: { id: number; value: string }) => {
          if (objective.id) {
            const Objective = await findObjectiveById(objective.id)
            if (Objective) {
              Objective.value = objective.value
              await saveObjective(Objective)
            }
          } else {
            await createObjective({ value: objective.value, course: Course })
          }
        })
      )
    }
    if(includes && includes.length) {
      await Promise.all(
        includes.map(async (include: { id: number; text: string; icon: string }) => {
          if (include.id) {
            const Include = await findIncludeById(include.id)
            if (Include) {
              Include.text = include.text
              Include.icon = include.icon
              await saveInclude(Include)
            }
          } else {
            await createInclude({ text: include.text, icon: include.icon, course: Course })
          }
        })
      )
    }
    if(requirements && requirements.length) {
      await Promise.all(
        requirements.map(async (requirement: { id: number; value: string }) => {
          if (requirement.id) {
            const Requirement = await findRequirementById(requirement.id)
            if (Requirement) {
              Requirement.value = requirement.value
              await saveRequirement(Requirement)
            }
          } else {
            await createRequirement({ value: requirement.value, course: Course })
          }
        })
      )
    }
    if(sections && sections.length) {
      await Promise.all(
        sections.map(async (section: { id: string; title: string; details: string; quizId: string; quiz: string; lessons: any[]; position: any }) => {
          if (section.id) {
            const Section = await findSectionById(section.id)
            if (Section) {
              Section.title = section.title
              Section.details = section.details
              await saveSection(Section)
              const Quiz = await findQuizById(section.quizId)
              Quiz.title = section.quiz
              await saveQuiz(Quiz)
              section.lessons.map(async (lesson: { id: string; title: string; position: any }) => {
                if(lesson.id) {
                  const Lesson = await findLessonById(lesson.id)
                  if(Lesson){
                    Lesson.title = lesson.title
                    await saveLesson(Lesson)
                  }
                }
                else {
                  await createLesson({ title: lesson.title, section: Section, position: lesson.position })
                }
              })
            }
          } else {
            const Section = await createSection({ title: section.title, details: section.details, course: Course, position: section.position })
            Section.quiz = await createQuiz({ title: section.quiz, section: Section })
            await saveSection(Section);
            section.lessons.map(async (lesson: { title: any; position: any }) => {
              await createLesson({ title: lesson.title, section: Section, position: lesson.position })
            })
          }
        })
      )
    }

    Course.updatedAt = new Date();

    await saveCourse(Course);
    await verifyCourseStatus(Course.id);

    return  res.customSuccess( 200, 'Course successfully changed.', { course: Course }, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};

export const deleteRequirementById = async (req: Request, res: Response, next: NextFunction) => {
  const requirementId = req.params.id;
  try {
    const item = await findRequirementById(Number(req.params.id),['course'])
    await deleteRequirement(Number(requirementId))
    await verifyCourseStatus(item.course.id)
    return  res.customSuccess( 200, 'Requirement successfully deleted.', true, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
export const deleteFaqById = async (req: Request, res: Response, next: NextFunction) => {
  const faqId = req.params.id;
  try {
    const item = await findFaqById(Number(req.params.id),['course'])
    await deleteFaq(Number(faqId))
    await verifyCourseStatus(item.course.id)
    return  res.customSuccess( 200, 'Faq successfully deleted.', true, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
export const deleteIncludeById = async (req: Request, res: Response, next: NextFunction) => {
  const includeId = req.params.id;
  try {
    const item = await findIncludeById(Number(req.params.id),['course'])
    await deleteInclude(Number(includeId))
    await verifyCourseStatus(item.course.id)
    return  res.customSuccess( 200, 'Include successfully deleted.', true, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
export const deleteObjectiveById = async (req: Request, res: Response, next: NextFunction) => {
  const objectiveId = req.params.id;
  try {
    const item = await findObjectiveById(Number(req.params.id),['course'])
    await deleteObjective(Number(objectiveId))
    await verifyCourseStatus(item.course.id)
    return  res.customSuccess( 200, 'Objective successfully deleted.', true, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
export const deleteLessonById = async (req: Request, res: Response, next: NextFunction) => {
  const lessonId = req.params.id;
  try {
    const item = await findLessonById(req.params.id,['section', 'section.course'])
    await deleteLesson(lessonId)
    await verifyCourseStatus(item.section.course.id)
    return  res.customSuccess( 200, 'Lesson successfully deleted.', true, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
export const getEnrollCourse = async (req: Request, res: Response, next: NextFunction) => {
  const courseId = req.params.id;
  try {
    const filter = pick(req.query, ['status', 'pharmacy']);
    Object.assign(filter, { course: { id: Equal(courseId)} })

    const options: IOptions = pick(req.query, ['orderBy', 'select', 'relations', 'take', 'page']);

    let params = organize(filter, options)
    if(options.hasOwnProperty('orderBy') && options['orderBy'].includes('course')) {
      params.order = { course: {title: params.order['course'] }}
    }
    if(options.hasOwnProperty('orderBy') && options['orderBy'].includes('name')) {
      params.order = { user: { firstName: params.order['name'] }}
    }
    if(options.hasOwnProperty('orderBy') && options['orderBy'].includes('pharmacy')) {
      params.order = { user: { key: { pharmacy : { name: params.order["pharmacy"] } }}}
    }
    if(params.query.pharmacy) {
      const pharmacyId = params.query.pharmacy
      delete params.query.pharmacy
      Object.assign(params.query, {
        user: {
          key: { pharmacy : { id: Equal(pharmacyId) } }
        }
      });
      delete params.query.pharmacy
    }
    params.relations = ['user', 'user.key', 'user.key.pharmacy', 'course']
    const users = await queryEnrollCourses(params);
    const count = await countEnrollCourses(params.query);
    const listCourses = { users, count }

    return res.customSuccess(200, 'User Courses.', listCourses, true);
  } catch (err) {
    return res.customSuccess(200, 'Error', {}, false);
  }
};