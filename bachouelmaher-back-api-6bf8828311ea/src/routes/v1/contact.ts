import { sendMail } from '@/controllers/contact/contact';
import { Router } from 'express';

const router = Router();

router.post('/send', [], sendMail);

export default router;