import { Router } from 'express';
import { addRating, getRatings } from "@/controllers/ratings"
import { checkJwt } from "@/middleware/checkJwt"

const router = Router();

router.post('/addRating', [checkJwt], addRating);
router.post('/getRatings', [checkJwt], getRatings);


export default router;
