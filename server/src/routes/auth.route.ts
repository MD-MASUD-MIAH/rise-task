import { Router } from 'express';
import { register, login, getMe } from '../controllers/auth.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

/**
 * POST /api/auth/register
 * Body: { name, email?, phone?, password, role? }
 */
router.post('/register', (req, res) => { void register(req, res); });

/**
 * POST /api/auth/login
 * Body: { email?, phone?, password }
 */
router.post('/login', (req, res) => { void login(req, res); });

/**
 * GET /api/auth/me     — protected
 * Returns the currently authenticated user's profile.
 */
router.get('/me', verifyToken, (req, res) => { void getMe(req, res); });

export default router;
