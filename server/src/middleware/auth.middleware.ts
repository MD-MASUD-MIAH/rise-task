import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET ?? 'changeme_secret';

export interface JwtTokenPayload {
  userId: string;
  role: string;
  iat?: number;
  exp?: number;
}

/**
 * Signs a new JWT for a user.
 */
export const signToken = (payload: Omit<JwtTokenPayload, 'iat' | 'exp'>): string =>
  jwt.sign(payload, JWT_SECRET, {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as jwt.SignOptions['expiresIn'],
  });

/**
 * Express middleware — verifies the Bearer JWT in the Authorization header
 * and attaches the decoded payload to `req.user`.
 */
export const verifyToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Authorization token missing or malformed.' });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtTokenPayload;
    req.user = { userId: decoded.userId, role: decoded.role };
    next();
  } catch (err) {
    const isExpired = err instanceof jwt.TokenExpiredError;
    res.status(401).json({
      success: false,
      message: isExpired ? 'Token expired. Please log in again.' : 'Invalid token.',
    });
  }
};

/**
 * Role-guard middleware factory.
 * Usage: router.delete('/...', verifyToken, requireRole('admin'), handler)
 */
export const requireRole =
  (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Insufficient permissions.' });
      return;
    }
    next();
  };
