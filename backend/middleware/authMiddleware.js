// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

// ✅ Middleware to verify token
export const protect = (req, res, next) => {
  let token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  // Remove "Bearer " prefix if included
  if (token.startsWith('Bearer ')) {
    token = token.split(' ')[1];
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach decoded user info to request
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
