import nodemailer from "nodemailer";
import * as pug from "pug"

const emailProcess = async (data: any) => {
  console.log('Email process data received:', JSON.stringify(data, null, 2));

  const {
    type,
    to,
    subject,
    template,
    html,
    token = null,
    frontUrl = null,
    username = null,
    attachments = null,
    templateData,
    title
  } = data;

  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = port === 465; // true for 465, false for others

  const transporter = nodemailer.createTransport({
    pool: true,
    host: process.env.SMTP_HOST || process.env.SMTP_HOSTNAME,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER || process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASS || process.env.SMTP_PASSWORD,
    },
  });

  let emailHTML = '';

  console.log('Type:', type, 'Has HTML?', !!html, 'Has template?', !!template);

  if (type === 'template') {
    try {
      const compiledFunction = pug.compileFile(template);
      if(token) emailHTML = compiledFunction({ token, frontUrl });
      if(username) emailHTML = compiledFunction({ username, title });
      if(templateData) emailHTML = compiledFunction(templateData);
    } catch (error) {
      console.error("Erreur lors de la compilation du template :", error);
      throw error;
    }
  } else if (html) {
    // If html parameter is provided, use it directly
    emailHTML = html;
    console.log('Using HTML content, length:', emailHTML.length);
  } else if (template) {
    // If template is provided (as string HTML), use it
    emailHTML = template;
  }

  // Add proper headers to ensure HTML is rendered
  const mailOptions: any = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER || process.env.SMTP_USERNAME,
    to: to,
    subject: subject,
    html: emailHTML,
    headers: {
      'Content-Type': 'text/html; charset=UTF-8'
    }
  };

  if (attachments) {
    mailOptions.attachments = attachments;
  }

  console.log('Sending email to:', to);
  console.log('Email subject:', subject);
  console.log('Email HTML preview (first 500 chars):', emailHTML.substring(0, 500));

  // Send email - use promise-based approach so BullMQ can track success/failure
  const info = await transporter.sendMail(mailOptions);
  console.log('Email sent successfully:', info.response);
};

export default emailProcess;