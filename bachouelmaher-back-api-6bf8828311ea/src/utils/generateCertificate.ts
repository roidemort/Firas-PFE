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

export const generateCertificate = async (id: string, courseId: string) => {
  try {
    const user = await findUser({ id: Equal(id), status: 1 });
    if(!user) return new Error('Error')

    const course = await findCourseById(courseId, ['certificate', 'provider', 'provider.logo', 'certificate.background', 'certificate.signature'])
    if(!course) return new Error('Error')

    const enrollCourse = await findEnrollCourse({ course: { id: Equal(courseId) }, user: { id: Equal(id) }, status: 2})
    if(!enrollCourse) return new Error('Error')

    const compiledFunction = pug.compileFile(process.cwd() + '/public/certificate.pug');
    const params = {
      student_name: user.firstName + ' ' + user.lastName,
      course_name: course.title,
      date: moment(enrollCourse.endedAt).format('YYYY-MM-DD'),
    };
    const description = replacePlaceholders(course.certificate.description, params)
    const title = replacePlaceholders(course.certificate.title, params)
    const subTitle = replacePlaceholders(course.certificate.sub_title, params)

    const certificateHTML = compiledFunction({
      title: title ,
      subTitle: subTitle,
      description: description,
      background: course.certificate.background.secure_url,
      backgroundWidth: course.certificate.background.width+'px',
      backgroundHeight: course.certificate.background.height+'px',
      titleTranslateX: course.certificate.positionTitle['x']+'px',
      titleTranslateY: course.certificate.positionTitle['y']+'px',
      subTitleTranslateX: course.certificate.positionSubTitle['x']+'px',
      subTitleTranslateY: course.certificate.positionSubTitle['y']+'px',
      descriptionTranslateX: course.certificate.positionDescription['x']+'px',
      descriptionTranslateY: course.certificate.positionDescription['y']+'px',
      signatureTranslateX: course.certificate.positionSignature['x']+'px',
      signatureTranslateY: course.certificate.positionSignature['y']+'px',
      signature: course.certificate.signature?.secure_url || ''
    });

    const linkToCertificate = `/upload/certificates/${id}-${courseId}.pdf`
    const fullLink = process.cwd() + linkToCertificate

    await generatePDFfromHTML(certificateHTML, fullLink)

    const attachments = [{
      filename: `${user.firstName}-${user.lastName}.pdf`,
      path:fullLink
    }]

    const templatePath = path.join(process.cwd(), 'public', 'emailCertificate.pug');

    if (!fs.existsSync(templatePath)) {
      console.error("❌ Erreur : Le fichier du template n'existe pas !");
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

    return linkToCertificate
  } catch (err) {
    return new Error('Error')
  }
}