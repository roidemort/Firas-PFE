import { NextFunction, Request, Response } from "express"
import pick from "@/utils/pick"
import { IOptions } from "@/interfaces/IOptions"
import { organize } from "@/utils/organize"
import { countImages, createImage, deleteImage, findImageById, queryImages } from "@/services/image.service"
import cloudinary from "@/adapters/cloudinary"
import RedisService from "@/services/redis.service"
import { MulterFile } from "@/interfaces/IMulterFile"

export const getAllImages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter = pick(req.query, ['text', 'status']);
    const options: IOptions = pick(req.query, ['orderBy', 'select', 'relations', 'take', 'page']);
    let params = organize(filter, options)
    const images = await queryImages(params);
    const count = await countImages(params.query);
    const listImages = { images, count }
    return res.customSuccess(200, 'List of images.', listImages, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};

export const addImage = async (req: Request & { files: MulterFile[] }, res: Response, next: NextFunction) => {
  try {
    if (Array.isArray(req.files)) {
      for (const file of req.files) {
        const b64 = Buffer.from(file.buffer).toString("base64");
        let dataURI = "data:" + file.mimetype + ";base64," + b64;

        const fileUpload = await cloudinary.uploader.upload(dataURI, { folder: "pharmacy/images" })
        await createImage({
          filename: file.originalname,
          secure_url: fileUpload.secure_url,
          public_id: fileUpload.public_id,
          size: fileUpload.bytes,
          height: fileUpload.height,
          width: fileUpload.width,
          format: fileUpload.format
        })
        await RedisService.incCreateIfNotExist('images', 1)
      }
    } else {
      return  res.customSuccess(200, 'Error', {}, false);
    }

    return res.customSuccess( 200, 'File successfully created.', true, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};

export const removeImage= async (req: Request, res: Response, next: NextFunction) => {
  const { imagesIds } = req.body;
  try {
    await Promise.all(
      imagesIds.map(async (fileId: string) => {
        const image = await findImageById(fileId)
        await deleteImage(fileId)
        await cloudinary.uploader.destroy(image.public_id)
        await RedisService.incCreateIfNotExist('images', -1)
      })
    )
    return res.customSuccess( 200, 'Images successfully deleted.', {}, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};