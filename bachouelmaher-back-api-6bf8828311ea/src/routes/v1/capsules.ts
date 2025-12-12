import { Router } from 'express';
import { getAll, getDetails } from "@/controllers/partner"
import { getAllCapsules, getDetailsCapsule } from "@/controllers/capsules"
import { checkJwt } from "@/middleware/checkJwt"

const router = Router();

router.get('/', [checkJwt], getAllCapsules);
router.get('/getDetails/:id', [checkJwt], getDetailsCapsule);

export default router;