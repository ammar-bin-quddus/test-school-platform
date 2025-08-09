import { Router } from 'express';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.get('/dashboard', authenticateJWT, authorizeRoles('admin'), (req, res) => {
  res.json({ message: 'Welcome Admin to your dashboard' });
});

export default router;
