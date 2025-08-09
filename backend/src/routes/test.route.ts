import { Router } from 'express';
import { submitTestStep, startTestStep } from '../controllers/test.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.post('/submit', authenticateJWT, submitTestStep);
router.post('/start', authenticateJWT, startTestStep);


export default router;