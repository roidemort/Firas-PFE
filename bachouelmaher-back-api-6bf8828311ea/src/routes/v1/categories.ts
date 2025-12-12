import { Router } from 'express';

import { getAll, getAllWithProviders, getAllTree, getDetails } from "@/controllers/categories"
import { checkJwt } from "@/middleware/checkJwt"

const router = Router();

router.get('/', [checkJwt], getAll);
router.get('/getAllTree', [checkJwt], getAllTree);
router.get('/getDetails/:id', [checkJwt], getDetails);
router.get('/getAllWithProviders', [checkJwt], getAllWithProviders);


export default router;
