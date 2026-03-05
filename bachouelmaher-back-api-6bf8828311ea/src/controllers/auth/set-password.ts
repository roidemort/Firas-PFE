import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { findUserByEmail, saveUser } from "@/services/user.service";
import { MoreThan } from "typeorm";

export const setInitialPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { email, token, newPassword } = req.body;

    try {
        if (!email || !token || !newPassword) {
            return res.customSuccess(400, 'Email, token, and newPassword are required.', {}, false);
        }

        // Find user by email with valid setup token
        const user = await findUserByEmail(email);

        if (!user || user.setupToken !== token || !user.setupTokenExpires || user.setupTokenExpires.getTime() < Date.now()) {
            return res.customSuccess(400, 'Invalid or expired link.', {}, false);
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user: save password, activate, destroy token
        user.password = hashedPassword;
        user.status = 1; // active
        user.setupToken = undefined as any;
        user.setupTokenExpires = undefined as any;
        await saveUser(user);

        return res.customSuccess(200, 'Password set successfully. You can now log in.', {}, true);
    } catch (err) {
        console.error('Error setting initial password:', err);
        return res.customSuccess(200, 'Error setting password.', {}, false);
    }
};
