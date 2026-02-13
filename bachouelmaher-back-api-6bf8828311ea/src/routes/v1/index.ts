import { Router } from 'express';

import admin from './admin';
import auth from './auth';
import user from './users';
import categories from './categories';
import keys from './keys';
import partners from './partners';
import packages from './packages';
import seo from './seo';
import notifications from './notifications';
import providers from './providers';
import trainers from './trainers';
import pharmacies from './pharmacies';
import courses from './courses';
import categoriesCapsules from "./categories-capsules"
import capsules from "./capsules"
import advertisements from "./advertisements"
import subscriptions from "./subscriptions"
import ratings from "./ratings"
import conversation from "./conversation"
import trends from "./trends"
import contact from "./contact"
import home from "./home"
import payment from './payment';

const router = Router();

router.use('/auth', auth);
router.use('/user', user);
router.use('/keys', keys);
router.use('/admin', admin);
router.use('/categories', categories);
router.use('/categories-capsules', categoriesCapsules);
router.use('/partners', partners);
router.use('/seo', seo);
router.use('/packages', packages);
router.use('/notifications', notifications);
router.use('/providers', providers);
router.use('/trainers', trainers);
router.use('/pharmacies', pharmacies);
router.use('/courses', courses);
router.use('/capsules', capsules);
router.use('/advertisements', advertisements);
router.use('/subscriptions', subscriptions);
router.use('/ratings', ratings);
router.use('/conversation', conversation);
router.use('/trends', trends);
router.use('/contact', contact);
router.use('/home', home);
router.use('/payment', payment);

export default router;
