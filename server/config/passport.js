const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const { sendWelcomeEmail } = require('../services/emailService');

const buildFallbackAvatar = (name) => {
  const safeName = encodeURIComponent(name || 'User');
  return `https://ui-avatars.com/api/?name=${safeName}&background=4facfe&color=fff&size=256&bold=true`;
};

const getCachedProviderImage = async (providerPhotoUrl) => {
  if (!providerPhotoUrl) {
    return null;
  }

  try {
    const response = await fetch(providerPhotoUrl);
    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    if (!contentType.startsWith('image/')) {
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength > 1024 * 1024) {
      return null;
    }

    const base64 = Buffer.from(arrayBuffer).toString('base64');
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    return null;
  }
};

// Configure Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Extract email from profile
    const email = profile.emails[0].value;
    const adminEmail = (process.env.ADMIN_EMAIL || 'shopfrozendelights@gmail.com').toLowerCase();
    const fallbackAvatar = buildFallbackAvatar(profile.displayName);
    const providerPhoto = profile.photos?.[0]?.value;
    const cachedProviderPhoto = await getCachedProviderImage(providerPhoto);
    
    // Find user by googleId OR email
    let user = await User.findOne({
      $or: [
        { googleId: profile.id },
        { email: email }
      ]
    });

    if (user) {
      if (!user.googleId) {
        user.googleId = profile.id;
      }

      user.authProvider = 'google';
      user.isEmailVerified = true;
      user.name = profile.displayName;
      user.profileImage = cachedProviderPhoto || providerPhoto || user.profileImage || fallbackAvatar;
      if (email.toLowerCase() === adminEmail) {
        user.role = 'admin';
      }

      await user.save();
      return done(null, user);
    }

    // Create new user if not found
    user = new User({
      name: profile.displayName,
      email: email,
      googleId: profile.id,
      authProvider: 'google',
      isEmailVerified: true,
      role: email.toLowerCase() === adminEmail ? 'admin' : 'user',
      profileImage: cachedProviderPhoto || providerPhoto || fallbackAvatar
    });

    await user.save();
    sendWelcomeEmail({
      to: user.email,
      customerName: user.name
    }).catch(() => {});
    return done(null, user);

  } catch (error) {
    return done(error, null);
  }
}));

// Export configured passport
module.exports = passport;
