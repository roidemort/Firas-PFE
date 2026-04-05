import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { Equal } from 'typeorm';

import { PER_PAGE_DEFAULT } from '@/core/config';
import { findCourseById } from '@/services/course.service';
import {
  countEnrollCourses,
  getCourseChapterFunnel,
  getCourseKpiStats,
} from '@/services/enroll-course.service';
import { findLabCourseAssignment, findLabCourseAssignments } from '@/services/lab-course-assignment.service';
import { generatePDFfromHTML } from '@/utils/generatePDFfromHTML';

const sanitizeFileName = (value: string) => {
  const sanitized = String(value || 'course')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return sanitized || 'course';
};

const escapeCsvCell = (value: string | number) => {
  const asString = String(value ?? '');
  return `"${asString.replace(/"/g, '""')}"`;
};

const escapeHtml = (value: string | number) => {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const buildCourseAnalyticsCsv = (courseTitle: string, kpis: any, chapterFunnel: any[]) => {
  const generatedAt = new Date().toISOString();
  const lines: string[] = [];

  lines.push([escapeCsvCell('Course'), escapeCsvCell(courseTitle)].join(','));
  lines.push([escapeCsvCell('Generated At (UTC)'), escapeCsvCell(generatedAt)].join(','));
  lines.push('');

  lines.push([escapeCsvCell('KPI'), escapeCsvCell('Value')].join(','));
  lines.push([escapeCsvCell('Enrolled'), escapeCsvCell(Number(kpis?.enrolledCount || 0))].join(','));
  lines.push([escapeCsvCell('Completed'), escapeCsvCell(Number(kpis?.completedCount || 0))].join(','));
  lines.push([escapeCsvCell('In Progress'), escapeCsvCell(Number(kpis?.inProgressCount || 0))].join(','));
  lines.push([escapeCsvCell('Completion Rate %'), escapeCsvCell(Number(kpis?.completionRate || 0))].join(','));
  lines.push([escapeCsvCell('Average Quiz Score %'), escapeCsvCell(Number(kpis?.averageQuizScore || 0))].join(','));
  lines.push('');

  lines.push([
    escapeCsvCell('Tendency Metric'),
    escapeCsvCell('Current Month'),
    escapeCsvCell('Previous Month'),
    escapeCsvCell('Delta'),
  ].join(','));
  lines.push([
    escapeCsvCell('Enrolled'),
    escapeCsvCell(Number(kpis?.tendency?.enrolled?.currentMonth || 0)),
    escapeCsvCell(Number(kpis?.tendency?.enrolled?.previousMonth || 0)),
    escapeCsvCell(`${Number(kpis?.tendency?.enrolled?.deltaPercent || 0)}%`),
  ].join(','));
  lines.push([
    escapeCsvCell('Completion'),
    escapeCsvCell(Number(kpis?.tendency?.completion?.currentMonth || 0)),
    escapeCsvCell(Number(kpis?.tendency?.completion?.previousMonth || 0)),
    escapeCsvCell(`${Number(kpis?.tendency?.completion?.deltaPercent || 0)}%`),
  ].join(','));
  lines.push([
    escapeCsvCell('Quiz Score'),
    escapeCsvCell(Number(kpis?.tendency?.quizScore?.currentMonth || 0)),
    escapeCsvCell(Number(kpis?.tendency?.quizScore?.previousMonth || 0)),
    escapeCsvCell(Number(kpis?.tendency?.quizScore?.delta || 0)),
  ].join(','));
  lines.push('');

  lines.push([
    escapeCsvCell('Chapter'),
    escapeCsvCell('Enrolled'),
    escapeCsvCell('Started'),
    escapeCsvCell('Completed'),
    escapeCsvCell('Drop-Off'),
    escapeCsvCell('Drop-Off Rate %'),
  ].join(','));

  chapterFunnel.forEach((row) => {
    lines.push([
      escapeCsvCell(row?.sectionTitle || '-'),
      escapeCsvCell(Number(row?.enrolledCount || 0)),
      escapeCsvCell(Number(row?.startedCount || 0)),
      escapeCsvCell(Number(row?.completedCount || 0)),
      escapeCsvCell(Number(row?.dropOffCount || 0)),
      escapeCsvCell(Number(row?.dropOffRate || 0)),
    ].join(','));
  });

  return lines.join('\n');
};

const buildCourseAnalyticsPdfHtml = (courseTitle: string, kpis: any, chapterFunnel: any[]) => {
  const generatedAt = new Date().toISOString();

  const chapterRows = chapterFunnel
    .map(
      (row) => `
      <tr>
        <td>${escapeHtml(row?.sectionTitle || '-')}</td>
        <td>${escapeHtml(Number(row?.enrolledCount || 0))}</td>
        <td>${escapeHtml(Number(row?.startedCount || 0))}</td>
        <td>${escapeHtml(Number(row?.completedCount || 0))}</td>
        <td>${escapeHtml(Number(row?.dropOffCount || 0))}</td>
        <td>${escapeHtml(`${Number(row?.dropOffRate || 0)}%`)}</td>
      </tr>
    `
    )
    .join('');

  return `
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Course Analytics Report</title>
        <style>
          body { font-family: Arial, sans-serif; color: #111827; padding: 24px; }
          h1 { margin: 0 0 8px; font-size: 24px; }
          .meta { color: #4b5563; margin-bottom: 16px; font-size: 12px; }
          h2 { margin-top: 24px; margin-bottom: 8px; font-size: 16px; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th, td { border: 1px solid #e5e7eb; padding: 8px; font-size: 12px; text-align: left; }
          th { background: #f9fafb; }
          .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
          .card { border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px; }
          .label { font-size: 11px; color: #6b7280; }
          .value { font-size: 18px; font-weight: bold; margin-top: 4px; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(courseTitle)}</h1>
        <div class="meta">Generated at (UTC): ${escapeHtml(generatedAt)}</div>

        <h2>KPIs</h2>
        <div class="grid">
          <div class="card"><div class="label">Enrolled</div><div class="value">${escapeHtml(Number(kpis?.enrolledCount || 0))}</div></div>
          <div class="card"><div class="label">Completed</div><div class="value">${escapeHtml(Number(kpis?.completedCount || 0))}</div></div>
          <div class="card"><div class="label">In Progress</div><div class="value">${escapeHtml(Number(kpis?.inProgressCount || 0))}</div></div>
          <div class="card"><div class="label">Completion Rate</div><div class="value">${escapeHtml(`${Number(kpis?.completionRate || 0)}%`)}</div></div>
          <div class="card"><div class="label">Average Quiz Score</div><div class="value">${escapeHtml(`${Number(kpis?.averageQuizScore || 0)}%`)}</div></div>
        </div>

        <h2>Month-over-Month Tendency</h2>
        <table>
          <thead>
            <tr>
              <th>Metric</th>
              <th>Current Month</th>
              <th>Previous Month</th>
              <th>Delta</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Enrolled</td>
              <td>${escapeHtml(Number(kpis?.tendency?.enrolled?.currentMonth || 0))}</td>
              <td>${escapeHtml(Number(kpis?.tendency?.enrolled?.previousMonth || 0))}</td>
              <td>${escapeHtml(`${Number(kpis?.tendency?.enrolled?.deltaPercent || 0)}%`)}</td>
            </tr>
            <tr>
              <td>Completion</td>
              <td>${escapeHtml(Number(kpis?.tendency?.completion?.currentMonth || 0))}</td>
              <td>${escapeHtml(Number(kpis?.tendency?.completion?.previousMonth || 0))}</td>
              <td>${escapeHtml(`${Number(kpis?.tendency?.completion?.deltaPercent || 0)}%`)}</td>
            </tr>
            <tr>
              <td>Quiz Score</td>
              <td>${escapeHtml(Number(kpis?.tendency?.quizScore?.currentMonth || 0))}</td>
              <td>${escapeHtml(Number(kpis?.tendency?.quizScore?.previousMonth || 0))}</td>
              <td>${escapeHtml(Number(kpis?.tendency?.quizScore?.delta || 0))}</td>
            </tr>
          </tbody>
        </table>

        <h2>Chapter Funnel</h2>
        <table>
          <thead>
            <tr>
              <th>Chapter</th>
              <th>Enrolled</th>
              <th>Started</th>
              <th>Completed</th>
              <th>Drop-Off</th>
              <th>Drop-Off Rate</th>
            </tr>
          </thead>
          <tbody>
            ${chapterRows || '<tr><td colspan="6">No chapter data.</td></tr>'}
          </tbody>
        </table>
      </body>
    </html>
  `;
};

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

export const exportMyCourseAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  const laboId = req.jwtPayload.id;
  const courseId = req.params.id;
  const format = String(req.query.format || 'csv').toLowerCase();

  if (format !== 'csv' && format !== 'pdf') {
    return res.customSuccess(200, 'format : Format must be csv or pdf', {}, false);
  }

  let temporaryPdfPath = '';

  try {
    const assignment = await findLabCourseAssignment({
      labo: { id: Equal(laboId) },
      course: { id: Equal(courseId) },
      status: 1,
    });

    if (!assignment) {
      return res.customSuccess(200, 'Error', {}, false);
    }

    const course = await findCourseById(courseId, []);
    if (!course) {
      return res.customSuccess(200, 'Error', {}, false);
    }

    const [kpis, chapterFunnel] = await Promise.all([
      getCourseKpiStats(courseId),
      getCourseChapterFunnel(courseId),
    ]);

    const dateStamp = new Date().toISOString().slice(0, 10);
    const baseFileName = `${sanitizeFileName(course.title)}-analytics-${dateStamp}`;

    if (format === 'csv') {
      const csvContent = buildCourseAnalyticsCsv(course.title, kpis, chapterFunnel);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${baseFileName}.csv"`);

      return res.status(200).send(csvContent);
    }

    const html = buildCourseAnalyticsPdfHtml(course.title, kpis, chapterFunnel);
    temporaryPdfPath = path.join(os.tmpdir(), `${baseFileName}-${Date.now()}.pdf`);

    await generatePDFfromHTML(html, temporaryPdfPath, {
      format: 'A4',
      landscape: false,
      printBackground: true,
    });

    const pdfBuffer = fs.readFileSync(temporaryPdfPath);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${baseFileName}.pdf"`);

    return res.status(200).send(pdfBuffer);
  } catch (err) {
    return res.customSuccess(200, 'Error', {}, false);
  } finally {
    if (temporaryPdfPath && fs.existsSync(temporaryPdfPath)) {
      fs.unlinkSync(temporaryPdfPath);
    }
  }
};
