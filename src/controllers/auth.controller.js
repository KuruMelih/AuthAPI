const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { validateEmail, validatePassword } = require('../utils/validators');
const AppError = require('../utils/appError');
const crypto = require('crypto');
const emailService = require('../services/email.service');

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 dakika

exports.register = async (req, res, next) => {
  try {
    const { email, password, username } = req.body;

    // Validasyonlar
    if (!validateEmail(email)) {
      throw new AppError('Geçersiz email formatı', 400);
    }
    if (!validatePassword(password)) {
      throw new AppError('Şifre en az 6 karakter olmalı ve en az bir rakam içermeli', 400);
    }

    // Kullanıcı kontrolü
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    if (existingUser) {
      throw new AppError('Email veya kullanıcı adı zaten kullanımda', 400);
    }

    // Yeni kullanıcı oluşturma
    const user = await User.create({
      email,
      password,
      username
    });

    // Token oluşturma
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { 
        expiresIn: '1d',
        algorithm: 'HS256',
        issuer: 'switch-app'
      }
    );

    // Hassas bilgileri çıkar
    user.password = undefined;

    res.status(201).json({
      status: 'success',
      token,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Email ve şifre kontrolü
    if (!email || !password) {
      throw new AppError('Email ve şifre gerekli', 400);
    }

    // Kullanıcıyı bul (password dahil)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError('Geçersiz email veya şifre', 401);
    }

    // Hesap kilitli mi kontrol et
    if (user.accountLocked && user.lockUntil > Date.now()) {
      throw new AppError(`Hesabınız kilitli. ${Math.ceil((user.lockUntil - Date.now()) / 1000 / 60)} dakika sonra tekrar deneyin`, 423);
    }

    // Şifre kontrolü
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      // Başarısız giriş denemesi sayısını artır
      user.failedLoginAttempts += 1;

      if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.accountLocked = true;
        user.lockUntil = Date.now() + LOCK_TIME;
      }

      await user.save();

      throw new AppError('Geçersiz email veya şifre', 401);
    }

    // Başarılı giriş - sayaçları sıfırla
    user.failedLoginAttempts = 0;
    user.accountLocked = false;
    user.lockUntil = null;
    await user.save();

    // Token oluştur
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { 
        expiresIn: '1d',
        algorithm: 'HS256',
        issuer: 'switch-app'
      }
    );

    // Hassas bilgileri çıkar
    const userObject = user.toObject();
    delete userObject.password;

    res.status(200).json({
      status: 'success',
      token,
      data: { 
        user: userObject,
        socialAccounts: {
          google: !!userObject.googleId,
          facebook: !!userObject.facebookId
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.googleLogin = async (req, res, next) => {
  try {
    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET,
      { 
        expiresIn: '1d',
        algorithm: 'HS256',
        issuer: 'switch-app'
      }
    );

    res.status(200).json({
      status: 'success',
      token,
      data: { user: req.user }
    });
  } catch (error) {
    next(error);
  }
};

exports.facebookLogin = async (req, res, next) => {
  try {
    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET,
      { 
        expiresIn: '1d',
        algorithm: 'HS256',
        issuer: 'switch-app'
      }
    );

    res.status(200).json({
      status: 'success',
      token,
      data: { user: req.user }
    });
  } catch (error) {
    next(error);
  }
};

exports.sendVerificationEmail = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new AppError('Kullanıcı bulunamadı', 404);
    }

    if (user.isEmailVerified) {
      throw new AppError('Email zaten doğrulanmış', 400);
    }

    // Verification token oluştur
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = Date.now() + 3600000; // 1 saat
    await user.save();

    // Email gönder
    await emailService.sendVerificationEmail(user, verificationToken);

    res.status(200).json({
      status: 'success',
      message: 'Doğrulama emaili gönderildi'
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new AppError('Geçersiz veya süresi dolmuş token', 400);
    }

    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Email başarıyla doğrulandı'
    });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw new AppError('Bu email adresi ile kayıtlı kullanıcı bulunamadı', 404);
    }

    // Reset token oluştur
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 saat
    await user.save();

    // Email gönder
    await emailService.sendPasswordResetEmail(user, resetToken);

    res.status(200).json({
      status: 'success',
      message: 'Şifre sıfırlama emaili gönderildi'
    });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    }).select('+password');

    if (!user) {
      throw new AppError('Geçersiz veya süresi dolmuş token', 400);
    }

    if (!validatePassword(password)) {
      throw new AppError('Şifre en az 6 karakter olmalı ve en az bir rakam içermeli', 400);
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Şifre başarıyla değiştirildi'
    });
  } catch (error) {
    next(error);
  }
};

exports.linkGoogleAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      throw new AppError('Kullanıcı bulunamadı', 404);
    }

    // Google ID'si zaten bağlı mı kontrol et
    if (user.googleId) {
      throw new AppError('Google hesabı zaten bağlı', 400);
    }

    // Google ID'sini kaydet
    user.googleId = req.body.googleId;
    await user.save();

    const userObject = user.toObject();
    delete userObject.password;

    res.status(200).json({
      status: 'success',
      data: { user: userObject }
    });
  } catch (error) {
    next(error);
  }
};