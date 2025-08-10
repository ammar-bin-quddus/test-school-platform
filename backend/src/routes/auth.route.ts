import { Router } from 'express';
import { login, register, verifyOtp, resendOtp } from '../controllers/auth.controller';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);

export default router;
