import { Router } from "express"
import { addUsersToSubscription, deleteUserFromSubscription } from "@/controllers/subscriptions"
import { checkJwt } from "@/middleware/checkJwt"
import { checkRole } from "@/middleware/checkRole"

const router = Router();

router.post('/addUserToSubscription', [checkJwt, checkRole(['PHARMACIST_HOLDER'])], addUsersToSubscription);
router.post('/deleteUserFromSubscription', [checkJwt, checkRole(['PHARMACIST_HOLDER'])], deleteUserFromSubscription);

export default router;