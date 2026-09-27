/**
 * Express Request type augmentation.
 * Adds the `user` property injected by verifyToken middleware.
 */
declare namespace Express {
  interface Request {
    user?: {
      userId: string;
      role: string;
    };
  }
}
