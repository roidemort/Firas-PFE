import { Router } from 'express';
import { checkJwt } from "@/middleware/checkJwt"
import { getAllAdvertisements, getDetailsAdvertisement } from "@/controllers/advertisement"

const router = Router();

router.get('/', [], getAllAdvertisements);
router.get('/getDetails/:id', [], getDetailsAdvertisement);

export default router;