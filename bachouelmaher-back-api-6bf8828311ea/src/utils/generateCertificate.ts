// utils/generateCertificate.ts - SAFE VERSION
import { findUser } from "@/services/user.service"
import { Equal } from "typeorm"
import { findCourseById } from "@/services/course.service"
import { findEnrollCourse } from "@/services/enroll-course.service"
import pug from "pug"
import process from "process"
import moment from "moment/moment"
import { replacePlaceholders } from "@/utils/replacePlaceholders"
import { generatePDFfromHTML } from "@/utils/generatePDFfromHTML"
import { emailBullMq } from "@/queues/email.queue"
import path from "path"
import fs from 'fs';
import logger from "@/core/logger"

export const generateCertificate = async (id: string, courseId: string) => {
  try {
    const user = await findUser({ id: Equal(id), status: 1 });
    if(!user) return new Error('Error: User not found')

    const course = await findCourseById(courseId, ['certificate', 'provider', 'provider.logo', 'certificate.background', 'certificate.signature'])
    if(!course) return new Error('Error: Course not found')

    const enrollCourse = await findEnrollCourse({ course: { id: Equal(courseId) }, user: { id: Equal(id) }, status: 2})
    if(!enrollCourse) return new Error('Error: Enrollment not found')

    const compiledFunction = pug.compileFile(process.cwd() + '/public/certificate.pug');
    const params = {
      student_name: user.firstName + ' ' + user.lastName,
      course_name: course.title,
      date: moment(enrollCourse.endedAt).format('YYYY-MM-DD'),
    };
    const description = replacePlaceholders(course.certificate.description, params)
    const title = replacePlaceholders(course.certificate.title, params)
    const subTitle = replacePlaceholders(course.certificate.sub_title, params)

    // SAFE POSITION HANDLING - Won't break production
    const getPosition = (position: any, defaultValue: {x: number, y: number}) => {
      if (!position) return defaultValue;
      try {
        if (typeof position === 'string') {
          return JSON.parse(position);
        }
        return position;
      } catch (e) {
        return defaultValue;
      }
    };

    // Default positions from your database
    const defaultPositions = {
      title: { x: 275, y: 92 },
      subTitle: { x: 116, y: 273 },
      description: { x: -43, y: 516 },
      signature: { x: 309, y: 0 }
    };

    const titlePos = getPosition(course.certificate.positionTitle, defaultPositions.title);
    const subTitlePos = getPosition(course.certificate.positionSubTitle, defaultPositions.subTitle);
    const descriptionPos = getPosition(course.certificate.positionDescription, defaultPositions.description);
    const signaturePos = getPosition(course.certificate.positionSignature, defaultPositions.signature);

    const certificateHTML = compiledFunction({
      title: title,
      subTitle: subTitle,
      description: description,
      background: course.certificate.background?.secure_url || '',
      backgroundWidth: (course.certificate.background?.width || 800) + 'px',
      backgroundHeight: (course.certificate.background?.height || 600) + 'px',
      titleTranslateX: titlePos.x + 'px',
      titleTranslateY: titlePos.y + 'px',
      subTitleTranslateX: subTitlePos.x + 'px',
      subTitleTranslateY: subTitlePos.y + 'px',
      descriptionTranslateX: descriptionPos.x + 'px',
      descriptionTranslateY: descriptionPos.y + 'px',
      signatureTranslateX: signaturePos.x + 'px',
      signatureTranslateY: signaturePos.y + 'px',
      signature: course.certificate.signature?.secure_url || ''
    });

    const linkToCertificate = `/upload/certificates/${id}-${courseId}.pdf`
    const fullLink = process.cwd() + linkToCertificate

    // Ensure upload directory exists (for local development)
    if (!fs.existsSync(path.dirname(fullLink))) {
      fs.mkdirSync(path.dirname(fullLink), { recursive: true });
    }

    await generatePDFfromHTML(certificateHTML, fullLink)

    // Email part (optional for local)
    if (process.env.NODE_ENV === 'production') {
      const attachments = [{
        filename: `${user.firstName}-${user.lastName}.pdf`,
        path: fullLink
      }]

      const templatePath = path.join(process.cwd(), 'public', 'emailCertificate.pug');

      if (!fs.existsSync(templatePath)) {
        logger.error("❌ Erreur : Le fichier du template n'existe pas !");
      }

      await emailBullMq.add('email-certificates', {
        from: process.env.SMTP_USERNAME,
        type:'template',
        to: user.email,
        subject: `Galiocare - Attestation de fin de formation`,
        template: path.join(process.cwd(), 'public', 'emailCertificate.pug'),
        username: user.firstName + ' ' + user.lastName,
        title: course.title,
        attachments: attachments
      })
    }

    return linkToCertificate
  } catch (err) {
    logger.error('Certificate generation error:', err);
    return new Error('Error generating certificate')
  }
}