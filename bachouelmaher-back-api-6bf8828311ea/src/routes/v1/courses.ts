import { Router } from 'express';
import {
  answerQuestionEnrollCourse, answerQuestionEnrollCourseDetails,
  detailsEnrollCourse,
  enrollCourse,
  getAll,
  getDetails,
  questionEnrollCourse, regenerateQuestionEnrollCourse,
  updateEnrollCourse
} from "@/controllers/courses"
import { checkJwt } from "@/middleware/checkJwt"

const router = Router();

router.get('/', [checkJwt], getAll);
router.get('/getDetails/:id', [checkJwt], getDetails);
router.get('/enrollCourse/:id', [checkJwt], enrollCourse);
router.get('/detailsEnrollCourse/:id', [checkJwt], detailsEnrollCourse);
router.post('/updateEnrollCourse/:id', [checkJwt], updateEnrollCourse);
router.post('/questionEnrollCourse/:id', [checkJwt], questionEnrollCourse);
router.post('/regenerateQuestionEnrollCourse/:id', [checkJwt], regenerateQuestionEnrollCourse);
router.post('/answerQuestionEnrollCourse/:id', [checkJwt], answerQuestionEnrollCourse);
router.post('/answerQuestionEnrollCourseDetails/:id', [checkJwt], answerQuestionEnrollCourseDetails);

export default router;