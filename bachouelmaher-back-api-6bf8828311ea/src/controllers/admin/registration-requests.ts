import { Request, Response, NextFunction } from 'express';
import {
  queryRegistrationRequests,
  countRegistrationRequests,
  findRegistrationRequestById,
  saveRegistrationRequest,
  createRegistrationRequest
} from "@/services/registration-request.service"
import { createPharmacy, createPharmacyUser, findPharmacy } from "@/services/pharmacy.service"
import { createUser, findUserByEmail } from "@/services/user.service"
import { emailBullMq } from "@/queues/email.queue"
import { Equal } from "typeorm"
import pick from "@/utils/pick"
import { IOptions } from "@/interfaces/IOptions"
import { organize } from "@/utils/organize"
import * as crypto from "crypto"

export const getAllRegistrationRequests = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Use a loose type here because our pick helper returns a plain object
    const filter: any = pick(req.query, ['status']);
    const options: IOptions = pick(req.query, ['orderBy', 'select', 'relations', 'take', 'page']);

    // Default to pending requests if no status filter
    if (filter.status === undefined) {
      filter.status = 0; // pending
    }

    let params = organize(filter, options);
    const requests = await queryRegistrationRequests(params);
    const count = await countRegistrationRequests(params.query);

    return res.customSuccess(200, 'List of registration requests.', { requests, count }, true);
  } catch (err) {
    console.error('Error fetching registration requests:', err);
    return res.customSuccess(200, 'Error', {}, false);
  }
};

export const approveRegistrationRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestId = req.params.id;

  try {
    const request = await findRegistrationRequestById(requestId);

    if (!request) {
      return res.customSuccess(200, 'Registration request not found', {}, false);
    }

    if (request.status !== 0) {
      return res.customSuccess(200, 'Request already processed', {}, false);
    }

    // Check for duplicate user email
    const existingUser = await findUserByEmail(request.pharmacyEmail.toLowerCase());
    if (existingUser) {
      return res.customSuccess(200, 'Un utilisateur avec cet email existe déjà.', {}, false);
    }

    // Check for duplicate pharmacy email
    const existingPharmacy = await findPharmacy({ email: request.pharmacyEmail.toLowerCase() });
    if (existingPharmacy) {
      return res.customSuccess(200, 'Une pharmacie avec cet email existe déjà.', {}, false);
    }

    // Generate secure 20-byte setup token
    const setupToken = crypto.randomBytes(20).toString('hex');
    const setupTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create pharmacy
    const pharmacy = await createPharmacy({
      name: request.pharmacyName,
      email: request.pharmacyEmail,
      address: request.pharmacyAddress,
      tel: request.pharmacyPhone,
      status: 1, // active
      maxPharmacists: request.nbPharmacien,
      maxPreparers: request.nbPreparatoire,
    });

    // Create user account (no password yet — user will set it via email link)
    const user = await createUser({
      email: request.pharmacyEmail,
      role: 'PHARMACIST_HOLDER',
      status: 0, // approved but not yet active
      firstName: request.ownerFirstName,
      lastName: request.ownerLastName,
      provider: 'local',
      setupToken: setupToken,
      setupTokenExpires: setupTokenExpires,
    });

    // Create pharmacy user key for the titulaire (owner) — links user to pharmacy
    await createPharmacyUser({
      pharmacy: pharmacy,
      role: 'PHARMACIST_HOLDER',
      status: 1,
      userId: user.id,
      user: user,
    });

    // Create pharmacy user keys for pharmacists
    const pharmacyUsers = [];
    for (let i = 0; i < request.nbPharmacien; i++) {
      const pharmacyUser = await createPharmacyUser({
        pharmacy: pharmacy,
        role: 'PHARMACIST',
        status: 1,
      });
      pharmacyUsers.push(pharmacyUser);
    }

    // Create pharmacy user keys for preparateurs
    for (let i = 0; i < request.nbPreparatoire; i++) {
      const pharmacyUser = await createPharmacyUser({
        pharmacy: pharmacy,
        role: 'PREPARER',
        status: 1,
      });
      pharmacyUsers.push(pharmacyUser);
    }

    // Update request status to approved
    request.status = 1; // approved
    await saveRegistrationRequest(request);

    // Send email with set-password link
    const frontUrl = process.env.FRONT_URL || 'http://localhost:4200';
    const setPasswordUrl = `${frontUrl}/set-password?token=${setupToken}&email=${encodeURIComponent(user.email)}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #101E1F; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; }
          .button { display: inline-block; background-color: #101E1F; color: white; padding: 12px 30px; text-decoration: none; border-radius: 40px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .warning { color: #DC2626; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Galiocare - Demande d'inscription approuvée</h1>
          </div>
          <div class="content">
            <p>Bonjour ${request.ownerFirstName} ${request.ownerLastName},</p>
            <p>Votre demande d'inscription pour la pharmacie <strong>${request.pharmacyName}</strong> a été approuvée par l'administrateur.</p>
            <p>Pour activer votre compte, veuillez cliquer sur le bouton ci-dessous pour définir votre mot de passe :</p>
            <p style="text-align: center;">
              <a href="${setPasswordUrl}" class="button">Définir mon mot de passe</a>
            </p>
            <p>Vous pouvez utiliser ce lien pour créer ${request.nbPharmacien + request.nbPreparatoire} compte(s) :</p>
            <ul>
              ${request.nbPharmacien > 0 ? `<li>${request.nbPharmacien} compte(s) Pharmacien</li>` : ''}
              ${request.nbPreparatoire > 0 ? `<li>${request.nbPreparatoire} compte(s) Préparateur</li>` : ''}
            </ul>
            <p class="warning">Ce lien est valide pendant 24 heures.</p>
            <p>Cordialement,<br>L'équipe Galiocare</p>
          </div>
          <div class="footer">
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await emailBullMq.add('registration-approved', {
      from: process.env.SMTP_USERNAME,
      type: 'string',
      to: request.pharmacyEmail,
      subject: 'Galiocare - Votre demande d\'inscription a été approuvée',
      template: emailHtml,
    });

    return res.customSuccess(
      200,
      'Registration request approved successfully. Setup link sent via email.',
      { request },
      true
    );
  } catch (err) {
    console.error('Error approving registration request:', err);
    return res.customSuccess(200, 'Error approving request', {}, false);
  }
};

export const rejectRegistrationRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestId = req.params.id;

  try {
    const request = await findRegistrationRequestById(requestId);

    if (!request) {
      return res.customSuccess(200, 'Registration request not found', {}, false);
    }

    if (request.status !== 0) {
      return res.customSuccess(200, 'Request already processed', {}, false);
    }

    // Update request status to rejected
    request.status = 2; // rejected
    await saveRegistrationRequest(request);

    // Send rejection email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #DC2626; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Galiocare - Demande d'inscription</h1>
          </div>
          <div class="content">
            <p>Bonjour ${request.ownerFirstName} ${request.ownerLastName},</p>
            <p>Nous regrettons de vous informer que votre demande d'inscription pour la pharmacie <strong>${request.pharmacyName}</strong> n'a pas été approuvée.</p>
            <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
            <p>Cordialement,<br>L'équipe Galiocare</p>
          </div>
          <div class="footer">
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await emailBullMq.add('registration-rejected', {
      from: process.env.SMTP_USERNAME,
      type: 'string',
      to: request.pharmacyEmail,
      subject: 'Galiocare - Demande d\'inscription',
      template: emailHtml,
    });

    return res.customSuccess(
      200,
      'Registration request rejected successfully.',
      { request },
      true
    );
  } catch (err) {
    console.error('Error rejecting registration request:', err);
    return res.customSuccess(200, 'Error rejecting request', {}, false);
  }
};
