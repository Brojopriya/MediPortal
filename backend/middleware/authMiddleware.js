// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { User } from '../src/models/index.js';
dotenv.config();

const FALLBACK_JWT_SECRET = 'mediportal-temporary-jwt-secret-change-me';
let didWarnMissingJwtSecret = false;

const getJwtSecret = () => {
  const secret = String(process.env.JWT_SECRET || '').trim();
  if (!secret) {
    if (!didWarnMissingJwtSecret) {
      console.warn('⚠️ JWT_SECRET is missing. Using temporary fallback secret for token verification.');
      didWarnMissingJwtSecret = true;
    }
    return FALLBACK_JWT_SECRET;
  }
  return secret;
};

// ✅ Middleware to verify token
export const protect = async (req, res, next) => {
  let token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  // Remove "Bearer " prefix if included
  if (token.startsWith('Bearer ')) {
    token = token.split(' ')[1];
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }
    req.user = {
      id: user.id,
      role: user.role,
      approvalStatus: user.approvalStatus,
      email: user.email,
      name: user.name,
    };
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

// ✅ Optional: Role-based authorization (for doctors, nurses, etc.)
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient privileges.' });
    }
    next();
  };
};
