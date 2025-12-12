import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import { findUserByEmail, saveUser } from "@/services/user.service";
import { generateToken } from "@/utils/common";
import { emailBullMq } from "@/queues/email.queue"
import process from "process"
import path from 'path';

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const email = req.body.email;

  try {
    const user = await findUserByEmail(email);

    if (!user) {
      return res.customSuccess(200, 'Error', {}, false);
    }
    if (user.status === 3) {
      return res.customSuccess(200, 'Error', {}, false);
    }

    const token = generateToken(5);
    user.token = token.trim();
    await saveUser(user);

    const templatePath = path.join(process.cwd(), 'public', 'code.pug');

    if (!fs.existsSync(templatePath)) {
      console.error("❌ Erreur : Le fichier du template n'existe pas !");
    }

    await emailBullMq.add('forgot-password', {
      from: process.env.SMTP_USERNAME,
      type: 'template',
      to: email,
      subject: 'Galiocare - Code de réinitialisation du mot de passe',
      template: path.join(process.cwd(), 'public', 'code.pug'),
      token: user.token,
      frontUrl: process.env.FRONT_URL
    })
    return res.customSuccess(200, 'Email send successfully.', {}, true);
  } catch (err) {
    return res.customSuccess(200, 'Error', {}, false);
  }
};
