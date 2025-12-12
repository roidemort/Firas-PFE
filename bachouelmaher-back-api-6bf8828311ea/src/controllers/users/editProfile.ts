import { Request, Response, NextFunction } from 'express';

import {
  deleteUser, findUserByEmail,
  findUserById,
  saveUser
} from "@/services/user.service"
import cloudinary from "@/adapters/cloudinary"
import { MulterFile } from "@/interfaces/IMulterFile"

export const editProfile = async (
  req: Request & { file: MulterFile },
  res: Response,
  next: NextFunction
) => {
  const { email, firstName, lastName, gender, tel , birthday, address, city, zipCode } = req.body;
  const { id } = req.jwtPayload;
  try {
    const user = await findUserById(id);

    if (!user) {
      return res.customSuccess(200, 'Error', {}, false);
    }
    if (email) {
      const userExist = await findUserByEmail(email);
      if (userExist && userExist.id != id) {
        return res.customSuccess(
          200,
          `email : Email '${user.email}' already exists`,
          {},
          false
        );
      } else {
        user.email = email;
      }
    }
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (gender) user.gender = gender;
    if (tel) user.tel = tel;
    if (birthday) user.birthday = birthday;
    if (address) user.address = address;
    if (city) user.city = city;
    if (zipCode) user.zipCode = zipCode;
    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

      const fileUpload = await cloudinary.uploader.upload(dataURI, { folder: "pharmacy/users" })

      user.img_link = fileUpload.secure_url;
    }

    await saveUser(user);
    return res.customSuccess(
      200,
      'Profile successfully changed.',
      { user },
      true
    );
  } catch (err) {
    return res.customSuccess(200, 'Error', {}, false);
  }
};
export const deleteProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.jwtPayload;
  try {
    const user = await findUserById(id);

    if (!user) {
      return res.customSuccess(200, 'Error', {}, false);
    }

    await deleteUser(user.id);
    return res.customSuccess(200, 'Profile successfully delete.', {}, true);
  } catch (err) {
    return res.customSuccess(200, 'Error', {}, false);
  }
};
