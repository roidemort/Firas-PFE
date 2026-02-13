import { Router } from 'express';

import {
  deleteProfile,
  editProfile,
  forgotPassword,
  resetPassword,
  editPassword,
  getMyPlan,
  getMyTeam, getMyPlanDetails, addToTeam, getMyUserDetails, getProgression, getMyCertificate,
  getRankingByRole,
  getRankingByPharmacy,
  getRankingStats,
  getAllRankings
} from "@/controllers/users"
import { checkJwt } from "@/middleware/checkJwt"
import {
  validatorEditPassword,
  validatorForgotPassword,
  validatorResetPassword
} from "@/middleware/validation/users"
import upload from "@/middleware/ImageConfig"
import { checkRole } from "@/middleware/checkRole"

const router = Router();

router.put('/edit-password', [checkJwt, validatorEditPassword], editPassword);
router.put('/edit-profile', [checkJwt, upload.single('upload')], editProfile);

router.post('/forgot-password', [validatorForgotPassword], forgotPassword);
router.post('/reset-password', [validatorResetPassword], resetPassword);

router.get('/getMyPlan', [checkJwt], getMyPlan);
router.get('/getMyTeam', [checkJwt, checkRole(['PHARMACIST_HOLDER'])], getMyTeam);
router.get('/getMyTeam/:id', [checkJwt], getMyUserDetails);
router.get('/getMyPlanDetails', [checkJwt, checkRole(['PHARMACIST_HOLDER'])], getMyPlanDetails);
router.get('/addToTeam', [checkJwt, checkRole(['PHARMACIST_HOLDER'])], addToTeam);
router.post('/getProgression', [checkJwt], getProgression);
router.get('/getMyCertificate/:id', [checkJwt], getMyCertificate);

router.delete('/profile', [checkJwt], deleteProfile);


router.get('/ranking/role', [checkJwt], getRankingByRole);
router.get('/ranking/pharmacy', [checkJwt], getRankingByPharmacy);
router.get('/ranking/stats', [checkJwt], getRankingStats);
router.get('/ranking/all', [checkJwt], getAllRankings);
export default router;
