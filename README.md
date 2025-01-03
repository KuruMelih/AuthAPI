# Auth API

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)](https://jwt.io/)

Modern ve güvenli bir authentication API sistemi.

</div>

## 📋 İçindekiler

- [Özellikler](#-özellikler)
- [Teknolojiler](#-teknolojiler)
- [Başlangıç](#-başlangıç)
  - [Gereksinimler](#gereksinimler)
  - [Kurulum](#kurulum)
- [Kullanım](#kullanım)
- [API Dokümantasyonu](#api-dokümantasyonu)
- [Güvenlik](#güvenlik)
- [Katkıda Bulunma](#katkıda-bulunma)
- [Lisans](#lisans)

## ✨ Özellikler

- **🔐 Kimlik Doğrulama**
  - JWT tabanlı authentication
  - Google & Facebook OAuth2.0 entegrasyonu
  - Email/şifre ile kayıt ve giriş

- **📧 Email İşlemleri**
  - Email doğrulama sistemi
  - Şifre sıfırlama
  - HTML email şablonları

- **🛡️ Güvenlik**
  - Brute force koruması
  - Rate limiting
  - Password hashleme (bcrypt)
  - CORS & Helmet koruması

## 🚀 Teknolojiler

- **Backend:** Node.js, Express.js
- **Veritabanı:** MongoDB, Mongoose
- **Authentication:** JWT, Passport.js
- **Email:** Nodemailer
- **Güvenlik:** bcrypt, helmet, cors
- **Validasyon:** express-validator

## 🏁 Başlangıç

### Gereksinimler

- Node.js (v14+)
- MongoDB
- npm veya yarn
- Google OAuth2.0 credentials
- SMTP sunucusu

### Kurulum

1. **Repoyu klonlayın**
bash
git clone https://github.com/kurumelih/AuthAPI.git
cd auth-api

2. **Bağımlılıkları yükleyin**
bash
npm install

3. **Development**
npm run dev

4. **Production**
npm start

## 📖 API Dokümantasyonu

Detaylı API dokümantasyonuna `http://localhost:3000` adresinden erişebilirsiniz.

### Temel Endpoints

- `POST /api/auth/register` - Yeni kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi
- `GET /api/auth/google` - Google ile giriş
- `GET /api/auth/facebook` - Facebook ile giriş
- `POST /api/auth/forgot-password` - Şifre sıfırlama
- `POST /api/auth/verify-email` - Email doğrulama

## 🔒 Güvenlik

- JWT token authentication
- Brute force koruması (5 başarısız denemeden sonra hesap kilitleme)
- Rate limiting (15 dakikada 5 giriş denemesi)
- Password hashleme (bcrypt)
- CORS koruması
- Helmet güvenlik başlıkları
- Email doğrulama zorunluluğu

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakınız.

---

<div align="center">
Made with ❤️ by <a href="https://github.com/kurumelih">Melih</a>
</div>
