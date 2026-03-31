import { NextFunction, Request, Response } from 'express';
import { Equal } from 'typeorm';

import { PER_PAGE_DEFAULT } from '@/core/config';
import { findCourseById } from '@/services/course.service';
import {
  countEnrollCourses,
  getCourseChapterFunnel,
  getCourseKpiStats,
} from '@/services/enroll-course.service';
import { findLabCourseAssignment, findLabCourseAssignments } from '@/services/lab-course-assignment.service';

export const getMyCourses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const laboId = req.jwtPayload.id;
    const assignments = await findLabCourseAssignments(
      { labo: { id: Equal(laboId) }, status: 1 },
      ['course', 'course.preview', 'course.category', 'course.provider', 'course.sections']
    );

    const courses = await Promise.all(
      assignments.map(async (assignment) => {
        const totalEnrolls = await countEnrollCourses({ course: { id: Equal(assignment.course.id) } });
        const completedEnrolls = await countEnrollCourses({
          course: { id: Equal(assignment.course.id) },
          status: Equal(2),
        });

        const completionRate = totalEnrolls ? Math.round((completedEnrolls / totalEnrolls) * 100) : 0;

        return {
          id: assignment.course.id,
          title: assignment.course.title,
          preview: assignment.course.preview,
          category: assignment.course.category,
          provider: assignment.course.provider,
          comingSoon: assignment.course.comingSoon,
          createdAt: assignment.course.createdAt,
          duration: assignment.course.duration,
          chaptersCount: assignment.course.sections?.length || 0,
          enrolledCount: totalEnrolls,
          completionRate,
        };
      })
    );

    return res.customSuccess(200, 'List of labo courses.', { courses, count: courses.length }, true);
  } catch (err) {
    return res.customSuccess(200, 'Error', {}, false);
  }
};

export const getMyCourseDetails = async (req: Request, res: Response, next: NextFunction) => {
  const laboId = req.jwtPayload.id;
  const courseId = req.params.id;

  try {
    const assignment = await findLabCourseAssignment({
      labo: { id: Equal(laboId) },
      course: { id: Equal(courseId) },
      status: 1,
    });

    if (!assignment) {
      return res.customSuccess(200, 'Error', {}, false);
    }

    const course = await findCourseById(courseId, [
      'preview',
      'category',
      'provider',
      'trainers',
      'requirements',
      'faqs',
      'includes',
      'objectives',
      'sections',
      'sections.quiz',
      'sections.lessons',
    ]);

    if (!course) {
      return res.customSuccess(200, 'Error', {}, false);
    }

    return res.customSuccess(200, 'Details of labo course.', { course }, true);
  } catch (err) {
    return res.customSuccess(200, 'Error', {}, false);
  }
};

export const getMyCourseEnrollStats = async (req: Request, res: Response, next: NextFunction) => {
  const laboId = req.jwtPayload.id;
  const rawCourseIds = req.query.courseIds as string | undefined;

  try {
    const assignments = await findLabCourseAssignments(
      { labo: { id: Equal(laboId) }, status: 1 },
      ['course']
    );

    const assignedCourseIds = assignments.map((item) => item.course.id);
    if (!assignedCourseIds.length) {
      return res.customSuccess(200, 'Labo courses enroll stats.', { stats: [] }, true);
    }

    const askedCourseIds = rawCourseIds ? rawCourseIds.split(',').filter(Boolean) : [];
    const selectedCourseIds = askedCourseIds.length
      ? askedCourseIds.filter((id) => assignedCourseIds.includes(id))
      : assignedCourseIds;

    const page = Number(req.query.page || 1);
    const take = Number(req.query.take || PER_PAGE_DEFAULT);
    const skip = (page - 1) * take;

    const paginatedIds = selectedCourseIds.slice(skip, skip + take);

    const stats = await Promise.all(
      paginatedIds.map(async (courseId) => {
        const enrolledCount = await countEnrollCourses({ course: { id: Equal(courseId) } });
        const completedCount = await countEnrollCourses({ course: { id: Equal(courseId) }, status: Equal(2) });

        return {
          courseId,
          enrolledCount,
          completionRate: enrolledCount ? Math.round((completedCount / enrolledCount) * 100) : 0,
        };
      })
    );

    return res.customSuccess(200, 'Labo courses enroll stats.', {
      stats,
      count: selectedCourseIds.length,
      page,
      take,
    }, true);
  } catch (err) {
    return res.customSuccess(200, 'Error', {}, false);
  }
};

export const getMyCourseAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  const laboId = req.jwtPayload.id;
  const courseId = req.params.id;

  try {
    const assignment = await findLabCourseAssignment({
      labo: { id: Equal(laboId) },
      course: { id: Equal(courseId) },
      status: 1,
    });

    if (!assignment) {
      return res.customSuccess(200, 'Error', {}, false);
    }

    const [kpis, chapterFunnel] = await Promise.all([
      getCourseKpiStats(courseId),
      getCourseChapterFunnel(courseId),
    ]);

    return res.customSuccess(
      200,
      'Labo course analytics.',
      {
        courseId,
        kpis,
        chapterFunnel,
      },
      true
    );
  } catch (err) {
    return res.customSuccess(200, 'Error', {}, false);
  }
};
