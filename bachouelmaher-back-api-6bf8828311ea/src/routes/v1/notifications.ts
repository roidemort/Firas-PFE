import { Router } from 'express';

import { countMine, getDetails, getMine } from "@/controllers/notifications"
import { checkJwt } from "@/middleware/checkJwt"

const router = Router();

router.get('/', [checkJwt], getMine);
router.get('/countMine', [checkJwt], countMine);
router.get('/getDetails/:id', [checkJwt], getDetails);


export default router;
