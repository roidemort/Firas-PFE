import { getHomeData } from '@/controllers/home/getAll';
import { Router } from 'express';


const router = Router();

router.get('/home-data', [], getHomeData);

export default router;
