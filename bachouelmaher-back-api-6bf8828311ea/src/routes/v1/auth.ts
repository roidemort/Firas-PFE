import { Router } from 'express';

import { login, register, submitRegistrationRequest, setInitialPassword } from "@/controllers/auth";
import {
  validatorLogin,
  validatorRegister,
} from "@/middleware/validation/auth";

const router = Router();

router.post('/login', [validatorLogin], login);
router.post('/register', [validatorRegister], register);
router.post('/registration-request', submitRegistrationRequest);
router.post('/set-password', setInitialPassword);

export default router;
