const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/user.model');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Mevcut kullanıcıyı kontrol et
      let user = await User.findOne({ email: profile.emails[0].value });
      
      if (user) {
        // Eğer kullanıcı varsa ve googleId yoksa ekleyelim
        if (!user.googleId) {
          user.googleId = profile.id;
          await user.save();
        }
        return done(null, user);
      }
      
      // Yeni kullanıcı oluştur
      user = await User.create({
        email: profile.emails[0].value,
        username: `user_${profile.id}`,
        googleId: profile.id,
        isEmailVerified: true
      });
      
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
));

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "/api/auth/facebook/callback",
    profileFields: ['id', 'emails', 'name']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ email: profile.emails[0].value });
      
      if (user) {
        if (!user.facebookId) {
          user.facebookId = profile.id;
          await user.save();
        }
        return done(null, user);
      }
      
      user = await User.create({
        email: profile.emails[0].value,
        username: `user_${profile.id}`,
        facebookId: profile.id,
        isEmailVerified: true
      });
      
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
));

module.exports = passport; 