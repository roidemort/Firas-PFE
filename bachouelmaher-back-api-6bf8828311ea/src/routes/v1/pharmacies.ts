import { getAll } from '@/controllers/pharmacies/getAll';
import { Router } from 'express';

const router = Router();

router.get('/', [], getAll);

export default router;