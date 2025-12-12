import { Request, Response, NextFunction } from 'express';
import { emailBullMq } from "@/queues/email.queue"
import process from "process"
import path from 'path';
import fs from 'fs';

export const sendMail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { firstName, lastName, email, phoneNumber, message } = req.body;

  try {

    const templatePath = path.join(process.cwd(), 'public', 'contact.pug');

    if (!fs.existsSync(templatePath)) {
      console.error("❌ Erreur : Le fichier du template n'existe pas !");
    }

    await emailBullMq.add('contact-us', {
      from: process.env.SMTP_USERNAME,
      type: 'template',
      to: process.env.MAIL_RECEPTION,
      subject: 'Galiocare - Formulaire de contact',
      template: path.join(process.cwd(), 'public', 'contact.pug'),
      templateData: {
        firstName,
        lastName,
        email,
        phoneNumber,
        message
      }
    });
    return res.customSuccess(200, 'Email sent successfully.', {}, true);
  } catch (err) {
    console.error(err);
    return res.customSuccess(200, 'Error', {}, false);
  }
};


