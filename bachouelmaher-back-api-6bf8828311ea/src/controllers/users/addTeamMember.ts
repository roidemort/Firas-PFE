import { Request, Response, NextFunction } from 'express';
import { Equal } from 'typeorm';
import { findUser, createUser } from '@/services/user.service';
import { createPharmacyUser, countPharmaciesUsers, findPharmacyUser } from '@/services/pharmacy.service';
import { emailBullMq } from '@/queues/email.queue';
import * as crypto from 'crypto';

export const addTeamMember = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { id } = req.jwtPayload;
    const { email, firstName, lastName, role } = req.body;

    try {
        // Validate input
        if (!email || !firstName || !lastName || !role) {
            return res.customSuccess(200, 'Tous les champs sont requis.', {}, false);
        }

        // Validate role
        if (!['PHARMACIST', 'PREPARER'].includes(role)) {
            return res.customSuccess(200, 'Rôle invalide. Doit être PHARMACIST ou PREPARER.', {}, false);
        }

        // Get the titulaire's pharmacy
        const titulaire = await findUser({ id: Equal(id), status: 1 }, ['key', 'key.pharmacy']);
        if (!titulaire || !titulaire.key || !titulaire.key.pharmacy) {
            return res.customSuccess(200, 'Pharmacie non trouvée.', {}, false);
        }

        const pharmacy = titulaire.key.pharmacy;

        // Check if email is already in use
        const existingUser = await findUser({ email: Equal(email) });
        if (existingUser) {
            return res.customSuccess(200, 'Un utilisateur avec cet email existe déjà.', {}, false);
        }

        // Count current members by role in this pharmacy
        const currentCount = await countPharmaciesUsers({
            pharmacy: { id: Equal(pharmacy.id) },
            role: Equal(role),
        });

        // Check limits
        const maxAllowed = role === 'PHARMACIST' ? pharmacy.maxPharmacists : pharmacy.maxPreparers;
        if (currentCount >= maxAllowed) {
            const roleName = role === 'PHARMACIST' ? 'pharmaciens' : 'préparateurs';
            return res.customSuccess(
                200,
                `Limite atteinte. Vous pouvez avoir au maximum ${maxAllowed} ${roleName}.`,
                { currentCount, maxAllowed },
                false
            );
        }

        // Generate setup token
        const setupToken = crypto.randomBytes(20).toString('hex');
        const setupTokenExpires = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours

        // Create user account (no password)
        const newUser = await createUser({
            email,
            firstName,
            lastName,
            role,
            status: 0, // inactive until password set
            provider: 'local',
            setupToken,
            setupTokenExpires,
        });

        // Create pharmacy user link
        await createPharmacyUser({
            pharmacy,
            role,
            status: 1,
            userId: newUser.id,
            user: newUser,
        });

        // Send setup email
        const frontUrl = process.env.FRONT_URL || 'http://localhost:4200';
        const setPasswordUrl = `${frontUrl}/set-password?token=${setupToken}&email=${encodeURIComponent(email)}`;
        const roleName = role === 'PHARMACIST' ? 'Pharmacien' : 'Préparateur';

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
            <h1>Galiocare - Invitation à rejoindre l'équipe</h1>
          </div>
          <div class="content">
            <p>Bonjour ${firstName} ${lastName},</p>
            <p>Vous avez été ajouté(e) en tant que <strong>${roleName}</strong> à la pharmacie <strong>${pharmacy.name}</strong> sur la plateforme Galiocare.</p>
            <p>Pour activer votre compte, veuillez cliquer sur le bouton ci-dessous pour définir votre mot de passe :</p>
            <p style="text-align: center;">
              <a href="${setPasswordUrl}" class="button">Définir mon mot de passe</a>
            </p>
            <p class="warning">Ce lien est valide pendant 72 heures.</p>
            <p>Cordialement,<br>L'équipe Galiocare</p>
          </div>
          <div class="footer">
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
      </html>
    `;

        await emailBullMq.add('team-member-invite', {
            from: process.env.SMTP_USERNAME,
            type: 'string',
            to: email,
            subject: `Galiocare - Invitation à rejoindre ${pharmacy.name}`,
            template: emailHtml,
        });

        // Calculate remaining slots
        const remaining = maxAllowed - (currentCount + 1);

        return res.customSuccess(
            200,
            'Membre ajouté avec succès. Un email d\'invitation a été envoyé.',
            { user: newUser, remaining },
            true
        );
    } catch (err) {
        console.error('Error adding team member:', err);
        return res.customSuccess(200, 'Erreur lors de l\'ajout du membre.', {}, false);
    }
};

export const getTeamLimits = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { id } = req.jwtPayload;

    try {
        const titulaire = await findUser({ id: Equal(id), status: 1 }, ['key', 'key.pharmacy']);
        if (!titulaire || !titulaire.key || !titulaire.key.pharmacy) {
            return res.customSuccess(200, 'Pharmacie non trouvée.', {}, false);
        }

        const pharmacy = titulaire.key.pharmacy;

        // Count current members by role
        const currentPharmacists = await countPharmaciesUsers({
            pharmacy: { id: Equal(pharmacy.id) },
            role: Equal('PHARMACIST'),
        });

        const currentPreparers = await countPharmaciesUsers({
            pharmacy: { id: Equal(pharmacy.id) },
            role: Equal('PREPARER'),
        });

        return res.customSuccess(200, 'Team limits.', {
            pharmacists: {
                current: currentPharmacists,
                max: pharmacy.maxPharmacists,
                remaining: pharmacy.maxPharmacists - currentPharmacists,
            },
            preparers: {
                current: currentPreparers,
                max: pharmacy.maxPreparers,
                remaining: pharmacy.maxPreparers - currentPreparers,
            },
            pharmacyName: pharmacy.name,
        }, true);
    } catch (err) {
        console.error('Error getting team limits:', err);
        return res.customSuccess(200, 'Error', {}, false);
    }
};
