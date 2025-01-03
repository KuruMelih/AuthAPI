const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const AppError = require('../utils/appError');

exports.protect = async (req, res, next) => {
  try {
    // Token'ı al
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('Lütfen giriş yapın', 401);
    }

    // Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Kullanıcıyı kontrol et
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AppError('Token\'a ait kullanıcı bulunamadı', 401);
    }

    // Kullanıcıyı request'e ekle
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new AppError('Geçersiz token', 401));
    } else if (error.name === 'TokenExpiredError') {
      next(new AppError('Token süresi doldu', 401));
    } else {
      next(error);
    }
  }
};