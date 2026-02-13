// routes/payment.ts
import { Router } from 'express';

import { checkJwt } from "@/middleware/checkJwt";
import { createSubscriptionWithPayment, getSubscriptionPaymentStatus, handlePaymentNotification } from '@/controllers/payment/inedx';

const router = Router();

// Public endpoint - called by Tunisie Monétique bank
router.post('/notification', handlePaymentNotification);
// Protected endpoints - require authentication
router.post('/create', [checkJwt], createSubscriptionWithPayment);
router.get('/status/:subscriptionId', [checkJwt], getSubscriptionPaymentStatus);

export default router;