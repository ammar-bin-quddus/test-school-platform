import { Router } from 'express';
import { downloadCertificate } from '../controllers/certificate.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.get('/:id', authenticateJWT, downloadCertificate);

export default router;
