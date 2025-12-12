import { Router } from 'express';
import { getDetailsByPath } from "@/controllers/seo"

const router = Router();

router.post('/', [], getDetailsByPath);


export default router;
