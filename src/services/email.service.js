const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendVerificationEmail = async (user, verificationToken) => {
  const verificationUrl = `${process.env.BASE_URL}/api/auth/verify-email/${verificationToken}`;
  
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Email Doğrulama',
    html: `
      <h1>Email Adresinizi Doğrulayın</h1>
      <p>Merhaba ${user.username},</p>
      <p>Hesabınızı doğrulamak için aşağıdaki linke tıklayın:</p>
      <a href="${verificationUrl}">Email Doğrula</a>
      <p>Bu link 1 saat geçerlidir.</p>
    `
  });
};

exports.sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.BASE_URL}/api/auth/reset-password/${resetToken}`;
  
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Şifre Sıfırlama',
    html: `
      <h1>Şifre Sıfırlama</h1>
      <p>Merhaba ${user.username},</p>
      <p>Şifrenizi sıfırlamak için aşağıdaki linke tıklayın:</p>
      <a href="${resetUrl}">Şifremi Sıfırla</a>
      <p>Bu link 1 saat geçerlidir.</p>
      <p>Eğer bu isteği siz yapmadıysanız, bu emaili görmezden gelin.</p>
    `
  });
}; 