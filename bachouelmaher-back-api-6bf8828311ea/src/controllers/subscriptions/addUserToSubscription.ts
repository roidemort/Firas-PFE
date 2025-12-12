import { NextFunction, Request, Response } from "express"
import {
  findSubscription,
  saveSubscription,
  verifyActiveSubscription
} from "@/services/subscription.service"
import { findUser } from "@/services/user.service"
import { And, Equal, LessThan, Not } from "typeorm"
import { MoreThan } from "typeorm/find-options/operator/MoreThan"
import { createNotification } from "@/services/notification.service"

// export const addUserToSubscription = async (req: Request, res: Response, next: NextFunction) => {
//     const { userId, subscribeId } = req.body;
//     const { id } = req.jwtPayload;
//     try {
//       const currentDate = new Date()
//       const user = await findUser({ id: Equal(id), status: 1 }, ['key', 'key.pharmacy']);
//       if(!user) return res.customSuccess(200, 'Error', {}, false);
//       const query = {id: Equal(userId), role: And(Not('PHARMACIST_HOLDER'), Not('SUPER_ADMIN')), status: 1,key: { pharmacy :{ id : Equal(user.key.pharmacy.id) }}}
//       const Subscription = await findSubscription( {id: Equal(subscribeId), buyer: { id: Equal(id)}, status: 1, endedAt: MoreThan(currentDate), package: { id : Not('4e9a6ca3-96d5-44b0-b33b-ead4a15fe9e2')}} , ['users'])
//       if(!Subscription) return res.customSuccess(200, 'Error', {}, false);
//       if(Subscription.users.length + 1 > Subscription.usersNumber) return res.customSuccess(200, 'Error', {}, false);
//       const selectedUser = await findUser(query)
//       if(!selectedUser) return res.customSuccess(200, 'Error', {}, false);
//       const verifyUser = await verifyActiveSubscription(selectedUser.id)
//       if(verifyUser) return res.customSuccess(200, 'Error', {}, false);
//       const exist = Subscription.users.find(user => user.id === selectedUser.id)
//       if(exist) return res.customSuccess(200, 'Error', {}, false);
//       Subscription.users.push(selectedUser)
//       await saveSubscription(Subscription)
//       return res.customSuccess(200, "User added to subscription successfully", {}, true);
//     } catch (err) {
//       return res.customSuccess(200, 'Error', {}, false);
//     }
// }

export const addUsersToSubscription = async (req: Request, res: Response, next: NextFunction) => {
  const { users, subscribeId } = req.body; // Recevoir un tableau d'IDs utilisateur
  const { id } = req.jwtPayload;
  
  try {
    const currentDate = new Date();
    const user = await findUser({ id: Equal(id), status: 1 }, ['key', 'key.pharmacy']);
    if (!user) return res.customSuccess(200, 'Error', { err: res }, false);

    const Subscription = await findSubscription(
      {
        id: Equal(subscribeId),
        buyer: { id: Equal(id) },
        status: 1,
        endedAt: MoreThan(currentDate),
        package: { id: Not('4e9a6ca3-96d5-44b0-b33b-ead4a15fe9e2') },
      },
      ['users', 'package']
    );
    if (!Subscription) return res.customSuccess(200, 'Error', { err: res }, false);

    const results = [];
    
    for (const userId of users) {
      // Vérifiez que la souscription n'est pas pleine
      if (Subscription.users.length > Subscription.usersNumber) {
        results.push({ userId, status: false, message: 'Limite atteinte' });
        continue;
      }

      // Vérifiez l'utilisateur sélectionné
      const query = {
        id: Equal(userId),
        role: And(Not('PHARMACIST_HOLDER'), Not('SUPER_ADMIN')),
        status: 1,
        key: { pharmacy: { id: Equal(user.key.pharmacy.id) } },
      };
      const selectedUser = await findUser(query);
      if (!selectedUser) {
        results.push({ userId, status: false, message: 'Utilisateur invalide' });
        continue;
      }

      // Vérifiez si l'utilisateur a déjà une souscription active
      const verifyUser = await verifyActiveSubscription(selectedUser.id);
      if (verifyUser) {
        results.push({ userId, status: false, message: 'Souscription active' });
        continue;
      }

      // Vérifiez si l'utilisateur est déjà ajouté
      const exist = Subscription.users.find((user) => user.id === selectedUser.id);
      if (exist) {
        results.push({ userId, status: false, message: 'Utilisateur déjà ajouté' });
        continue;
      }

      // Ajouter l'utilisateur à la souscription
      Subscription.users.push(selectedUser);
      results.push({ userId, status: true, message: 'Utilisateur ajouté' });

      await createNotification({
        type: 'notification',
        receiver: selectedUser,
        title: `Bienvenue dans le package ${Subscription.package.name}`,
        content: `Félicitations ! Vous avez été ajouté au package ${Subscription.package.name}. Profitez des avantages dès maintenant.`,
        status: 1,
      });
    }

    // Sauvegarder la souscription
    await saveSubscription(Subscription);

    // Retourner les résultats pour chaque utilisateur
    return res.customSuccess(200, 'Users processed successfully', { results }, true);
  } catch (err) {
    return res.customSuccess(200, 'Error', { error: err }, false);
  }
};
