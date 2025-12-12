import { Router } from 'express';

import { getAll, getDetails } from "@/controllers/providers"

const router = Router();

router.get('/', [], getAll);
router.get('/getDetails/:id', [], getDetails);


export default router;
