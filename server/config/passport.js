const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

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
    
    // Find user by googleId OR email
    let user = await User.findOne({
      $or: [
        { googleId: profile.id },
        { email: email }
      ]
    });

    if (user) {
      // If user exists by email but authProvider is local, link Google account
      if (user.authProvider === 'local' && !user.googleId) {
        user.googleId = profile.id;
        user.authProvider = 'google';
        user.isEmailVerified = true;
        user.profileImage = profile.photos[0]?.value || user.profileImage;
        await user.save();
      }
      return done(null, user);
    }

    // Create new user if not found
    user = new User({
      name: profile.displayName,
      email: email,
      googleId: profile.id,
      authProvider: 'google',
      isEmailVerified: true,
      role: 'user',
      profileImage: profile.photos[0]?.value || null
    });

    await user.save();
    return done(null, user);

  } catch (error) {
    return done(error, null);
  }
}));

// Export configured passport
module.exports = passport;
