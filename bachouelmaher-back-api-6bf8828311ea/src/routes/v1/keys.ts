import { Router } from 'express';

import {
  verifyKey
} from "@/controllers/pharmacies"

const router = Router();

router.post('/verifyKey', [], verifyKey);

export default router;
