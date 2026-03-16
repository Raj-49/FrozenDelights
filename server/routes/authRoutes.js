const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const { register, verifyEmail, login, googleCallback, getMe, forgotPassword, resetPassword, resendVerification } = require('../controllers/authController');

// Public routes
router.post('/register', register);
router.get('/verify-email/:token', verifyEmail);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/resend-verification', resendVerification);

// Protected routes
router.get('/me', verifyToken, getMe);

// Google OAuth routes
router.get('/google', require('passport').authenticate('google', { session: false, scope: ['profile', 'email'] }));
router.get('/google/callback', 
  require('passport').authenticate('google', { 
    session: false, 
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed` 
  }), 
  googleCallback
);

module.exports = router;
