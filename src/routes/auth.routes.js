const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
require('../config/passport');
const authMiddleware = require('../middlewares/auth.middleware');

// Rate limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 5, // IP başına 5 istek
  message: 'Çok fazla giriş denemesi yaptınız. Lütfen 15 dakika sonra tekrar deneyin.'
});

router.post('/register', authController.register);
router.post('/login', loginLimiter, authController.login);
router.post('/send-verification-email', authMiddleware.protect, authController.sendVerificationEmail);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  authController.googleLogin
);

router.get('/facebook',
  passport.authenticate('facebook', { scope: ['email'] })
);

router.get('/facebook/callback',
  passport.authenticate('facebook', { session: false }),
  authController.facebookLogin
);

router.post(
  '/link-google',
  authMiddleware.protect,  // Kullanıcı giriş yapmış olmalı
  authController.linkGoogleAccount
);

module.exports = router;