import { NextFunction, Request, Response } from "express"
import RedisService from "@/services/redis.service"
import {
  countSubscriptions,
  createSubscription,
  findSubscriptionById,
  querySubscriptions,
  saveSubscription,
  verifyActiveSubscription
} from "@/services/subscription.service"
import pick from "@/utils/pick"
import { IOptions } from "@/interfaces/IOptions"
import { organize } from "@/utils/organize"
import { findUserById } from "@/services/user.service"
import { findPackageById } from "@/services/package.service"
import { Equal, LessThan, LessThanOrEqual, MoreThanOrEqual, Not } from "typeorm"
import { MoreThan } from "typeorm/find-options/operator/MoreThan"
import { MulterFile } from "@/interfaces/IMulterFile"
import cloudinary from "@/adapters/cloudinary"
import { createNotification } from "@/services/notification.service"

export const getAllSubscriptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter = pick(req.query, ['status', 'date', 'package']);
    const options: IOptions = pick(req.query, ['orderBy', 'select', 'relations', 'take', 'page']);
    Object.assign(options, { relations : 'buyer,package,users' })
    let params = organize(filter, options)
    let relations = {}
    if(params.relations) {
      relations = Object.keys(params.relations)
    }

    if(params.query && params.query.length) {
      params.query.map((value, key) => {
        if (Object.hasOwn(value, 'package')) {
          value.package = { id: Equal(value.package)}
        } else {
          value.package = { id: Not('4e9a6ca3-96d5-44b0-b33b-ead4a15fe9e2')}
        }
      })
    } else {
      if (Object.hasOwn(params.query, 'package')) {
        params.query.package = { id: Equal(params.query.package)}
      } else {
        params.query.package = { id: Not('4e9a6ca3-96d5-44b0-b33b-ead4a15fe9e2')}
      }
    }

    const currentDate = new Date()

    if(params.query.date) {
      if(params.query.date == 1) {
        Object.assign(params.query, { startedAt: LessThanOrEqual(currentDate), endedAt: MoreThanOrEqual(currentDate) });
      }
      if(params.query.date == 2) {
        Object.assign(params.query, { endedAt: LessThan(currentDate) });
      }
      if(params.query.date == 3) {
        Object.assign(params.query, { startedAt: MoreThan(currentDate) });
      }
      delete params.query.date;
    }

    params.relations = relations
    const subscriptions = await querySubscriptions(params);
    const count = await countSubscriptions(params.query);
    const listSubscriptions = { subscriptions, count }
    return res.customSuccess(200, 'List of subscriptions.', listSubscriptions, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
export const getDetailsSubscription = async (req: Request, res: Response, next: NextFunction) => {
  const subscriptionId = req.params.id;
  try {
    const subscription = await findSubscriptionById(subscriptionId, ['buyer' , 'package', 'users'])
    if (!subscription) {
      return  res.customSuccess(200, 'Error', {}, false);
    }
    return res.customSuccess( 200, 'Details of subscription.', subscription, true);
  } catch (err) {
    return  res.customSuccess(200, 'Error', {}, false);
  }
};
export const addSubscription = async (req: Request & { file: MulterFile }, res: Response, next: NextFunction) => {
  const { startedAt, endedAt, usersNumber, buyerId, packageId, paymentMethod } = req.body;
  try {
    const Buyer = await findUserById(buyerId, { subscribes : true })

    const Package = await findPackageById(packageId)

    if(!Buyer || !Package) return res.customSuccess(200, 'Error', {}, false);

    const verify = await verifyActiveSubscription(Buyer.id, startedAt, endedAt)

    if(verify) return res.customSuccess(200, 'Error', {}, false);

    let secure_url= null
    let public_id= null
    if(req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const fileUpload = await cloudinary.uploader.upload(dataURI, { folder: "pharmacy/private" })
      secure_url = fileUpload.secure_url
      public_id = fileUpload.public_id
    }

    const subscription = await createSubscription({
      startedAt, endedAt, paymentMethod, usersNumber: usersNumber, buyer: Buyer, package: Package, users: [Buyer], secure_url, public_id
    });

    await createNotification({
      type: 'notification',
      receiver: Buyer,
      title: `Confirmation de votre abonnement à ${Package.name}`,
      content: `Merci pour votre achat ! Votre abonnement au package ${Package.name} a été activé avec succès. Profitez de tous les avantages dès maintenant.`,
      status: 1,
    });

    await RedisService.incCreateIfNotExist('subscriptions', 1)
    return res.customSuccess( 200, 'Subscription successfully created.', { subscription }, true);
  } catch (err) {
    return res.customSuccess(200, 'Error', {}, false);
  }
};
export const updateSubscription = async (req: Request & { file: MulterFile }, res: Response, next: NextFunction) => {
  const { startedAt, endedAt, usersNumber, packageId, status, paymentMethod} = req.body;
  const subscriptionId = req.params.id;

  try {
    const Subscription = await findSubscriptionById(subscriptionId, ['buyer', 'users', 'package'])

    if (!Subscription) {
      return res.customSuccess(200, 'Error', {}, false);
    }
    if(startedAt && endedAt) {
      const verify = await verifyActiveSubscription(Subscription.buyer.id, startedAt, endedAt, Subscription.id)
      if(verify) return res.customSuccess(200, 'Error', {}, false);
    }
    if(packageId) {
      const Package = await findPackageById(packageId)
      if (!Package) {
        return res.customSuccess(200, 'Error', {}, false);
      }
      Subscription.package = Package;
    }
    if(req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const fileUpload = await cloudinary.uploader.upload(dataURI, { folder: "pharmacy/private" })
      await cloudinary.uploader.destroy(Subscription.public_id)
      Subscription.secure_url = fileUpload.secure_url
      Subscription.public_id = fileUpload.public_id
    }
    if(usersNumber) {
      if(Subscription.users.length > usersNumber) return  res.customSuccess(200, 'Error', {}, false);
      else Subscription.usersNumber = usersNumber
    }
    if (startedAt) Subscription.startedAt = startedAt;
    if (endedAt) Subscription.endedAt = endedAt;
    if (paymentMethod) Subscription.paymentMethod = paymentMethod;
    if (status) Subscription.status = status == 1 ? 1 : 0

    Subscription.updatedAt = new Date();

    await createNotification({
      type: 'notification',
      receiver: Subscription.buyer,
      title: `Modification de votre abonnement ${Subscription.package.name}`,
      content: `Votre abonnement au package ${Subscription.package.name} a été modifié avec succès. Consultez les nouveaux détails dans votre espace personnel.`,
      status: 1,
    });
    await saveSubscription(Subscription);

    return res.customSuccess( 200, 'Subscription successfully changed.', { subscription: Subscription }, true);
  } catch (err) {
    return res.customSuccess(200, 'Error', {}, false);
  }
};