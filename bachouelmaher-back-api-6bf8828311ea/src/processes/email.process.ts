import nodemailer from "nodemailer";
import * as pug from "pug"

const emailProcess =  (data: any) => {
    const { type, to, subject, template, token = null, frontUrl = null, username = null, attachments = null, templateData, title } = data;
    // create reusable transporter object using the default SMTP transport

    const transporter = nodemailer.createTransport({
        //service: 'gmail',
        pool: true,
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: true,
        auth: {
            user: process.env.SMTP_USERNAME,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    let emailHTML = template;
    if (type === 'template') {
        try {
            const compiledFunction = pug.compileFile(template);
            if(token) emailHTML = compiledFunction({ token, frontUrl });
            if(username) emailHTML = compiledFunction({ username, title });
            if(templateData) emailHTML = compiledFunction(templateData);

        } catch (error) {
            console.error("Erreur lors de la compilation du template :", error);
        }
    }

    // send mail with defined transport object
    transporter.sendMail({
        from: process.env.SMTP_USERNAME,
        to: to,
        subject: subject,
        html: emailHTML,
        attachments: attachments
    });
};

export default emailProcess;