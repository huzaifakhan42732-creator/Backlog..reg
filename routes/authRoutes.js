import express from 'express';
import {
  register,
  login,
  logout,
  getCurrentUser,
  verifyToken,
} from '../controllers/authcontrolier.js';
import authenticateToken from '../middleware/authMidleware.js';

const router = express.Router();

// Public Routes
router.post('/register', register);
router.post('/login', login);
router.post('/verify-token', verifyToken);

// Protected Routes
router.get('/me', authenticateToken, getCurrentUser);
router.post('/logout', logout);

export default router;
