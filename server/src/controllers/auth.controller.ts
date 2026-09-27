import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { signToken } from '../middleware/auth.middleware';

const BCRYPT_ROUNDS = 12;

// ─── Register ─────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 *
 * Body: { name, email?, phone?, password, role? }
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, password, role } = req.body as {
      name?: string;
      email?: string;
      phone?: string;
      password?: string;
      role?: string;
    };

    // ── Validation ────────────────────────────────────────────────────────────
    if (!name?.trim()) {
      res.status(400).json({ success: false, message: 'Name is required.' });
      return;
    }
    if (!email && !phone) {
      res.status(400).json({ success: false, message: 'Email or phone number is required.' });
      return;
    }
    if (!password || password.length < 8) {
      res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
      return;
    }

    // ── Duplicate check ───────────────────────────────────────────────────────
    const existingQuery = email ? { email } : { phone };
    const existing = await User.findOne(existingQuery);
    if (existing) {
      res.status(409).json({
        success: false,
        message: `An account with this ${email ? 'email' : 'phone number'} already exists.`,
      });
      return;
    }

    // ── Hash + Create ─────────────────────────────────────────────────────────
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = await User.create({
      name: name.trim(),
      email: email?.toLowerCase().trim(),
      phone: phone?.trim(),
      passwordHash,
      role: role ?? 'viewer',
    });

    const token = signToken({ userId: user.id as string, role: user.role });

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/login
 *
 * Body: { email?, phone?, password }
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, phone, password } = req.body as {
      email?: string;
      phone?: string;
      password?: string;
    };

    if (!email && !phone) {
      res.status(400).json({ success: false, message: 'Email or phone number is required.' });
      return;
    }
    if (!password) {
      res.status(400).json({ success: false, message: 'Password is required.' });
      return;
    }

    // ── Find user (select passwordHash back in) ───────────────────────────────
    const query = email ? { email: email.toLowerCase().trim() } : { phone: phone?.trim() };
    const user = await User.findOne(query).select('+passwordHash');

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials.' });
      return;
    }

    const token = signToken({ userId: user.id as string, role: user.role });

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
};

// ─── Get Current User ─────────────────────────────────────────────────────────

/**
 * GET /api/auth/me   (protected)
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }
    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error('GetMe error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch user.' });
  }
};
