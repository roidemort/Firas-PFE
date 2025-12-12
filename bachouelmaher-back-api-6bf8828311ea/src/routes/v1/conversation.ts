import { Router } from 'express';
import { getAll, getDetails } from "@/controllers/partner"
import { getAllCapsules, getDetailsCapsule } from "@/controllers/capsules"
import { checkJwt } from "@/middleware/checkJwt"
import { getMine } from "@/controllers/conversations"
import { addConversation } from "@/controllers/conversations/add"

const router = Router();

router.get('/:id', [checkJwt], getMine);
router.post('/addConversation', [checkJwt], addConversation);

export default router;