import { Router } from 'express';

import { getAllTreeCategoriesCapsules, getDetailsCategoryCapsule, getAllWithProviders } from "@/controllers/categories-capsules"
import { checkJwt } from "@/middleware/checkJwt"

const router = Router();

router.get('/getAllTree', [checkJwt], getAllTreeCategoriesCapsules);
router.get('/getAllWithProviders', [checkJwt], getAllWithProviders);
router.get('/getDetails/:id', [checkJwt], getDetailsCategoryCapsule);


export default router;
