import { Router } from 'express';
import { checkJwt } from '@/middleware/checkJwt';
import { checkRole } from '@/middleware/checkRole';
import upload from '@/middleware/ImageConfig';
import { laboLogin } from '@/controllers/labo/auth';
import { getMyProducts, addProduct, editProduct, getProductDetails } from '@/controllers/labo/products';
import { getMyOrders, updateOrderStatus } from '@/controllers/labo/orders';
import {
	exportMyCourseAnalytics,
	getMyCourseAnalytics,
	getMyCourseDetails,
	getMyCourseEnrollStats,
	getMyCourses,
} from '@/controllers/labo/courses';
import {
	createSuggestion,
	getMySuggestions,
	getSuggestionDetails,
	updateSuggestion,
} from '@/controllers/labo/suggestions';
import {
	getMyChatUnansweredCount,
  getMyChatQuestionDetails,
  getMyChatQuestions,
  replyToMyChatQuestion,
} from '@/controllers/labo/chat';
import { validatorCreateSuggestion, validatorUpdateSuggestion } from '@/middleware/validation/labo';

const router = Router();

router.post('/auth/login', laboLogin);

const labGuard = [checkJwt, checkRole(['LABO'])];

router.get('/products', labGuard, getMyProducts);
router.post('/products/add', [...labGuard, upload.single('upload')], addProduct);
router.put('/products/edit/:id', [...labGuard, upload.single('upload')], editProduct);
router.get('/products/details/:id', labGuard, getProductDetails);

router.get('/orders', labGuard, getMyOrders);
router.put('/orders/status/:id', labGuard, updateOrderStatus);

router.get('/courses', labGuard, getMyCourses);
router.get('/courses/stats', labGuard, getMyCourseEnrollStats);
router.get('/courses/details/:id', labGuard, getMyCourseDetails);
router.get('/courses/:id/analytics', labGuard, getMyCourseAnalytics);
router.get('/courses/:id/analytics/export', labGuard, exportMyCourseAnalytics);

router.get('/suggestions', labGuard, getMySuggestions);
router.get('/suggestions/:id', labGuard, getSuggestionDetails);
router.post('/suggestions', [...labGuard, validatorCreateSuggestion], createSuggestion);
router.put('/suggestions/:id', [...labGuard, validatorUpdateSuggestion], updateSuggestion);

router.get('/chat/questions', labGuard, getMyChatQuestions);
router.get('/chat/questions/count-unanswered', labGuard, getMyChatUnansweredCount);
router.get('/chat/questions/:id', labGuard, getMyChatQuestionDetails);
router.post('/chat/questions/:id/reply', labGuard, replyToMyChatQuestion);

export default router;
