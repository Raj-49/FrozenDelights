const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      authProvider: 'local',
      isEmailVerified: false,
      emailVerificationToken: hashedToken,
      emailVerificationExpires
    });

    await user.save();

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      success: true,
      message: 'Verification email sent. Please check your inbox.'
    });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    const jwtToken = jwt.sign(
      { id: user._id, role: user.role, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
    );

    res.status(200).json({
      success: true,
      data: {
        token: jwtToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user with password and isEmailVerified
    const user = await User.findOne({ email }).select('+password +isEmailVerified');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user uses Google auth
    if (user.authProvider === 'google') {
      return res.status(400).json({
        success: false,
        message: 'This account uses Google Sign-In. Please use Google login.'
      });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check email verification
    if (!user.isEmailVerified) {
      // Resend verification email
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
      const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      user.emailVerificationToken = hashedToken;
      user.emailVerificationExpires = emailVerificationExpires;
      await user.save();

      await sendVerificationEmail(user.email, verificationToken);

      return res.status(403).json({
        success: false,
        message: 'Email not verified. New verification link sent.'
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
    );

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified: user.isEmailVerified
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const googleCallback = async (req, res, next) => {
  try {
    const user = req.user;

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
    );

    res.redirect(`${process.env.CLIENT_URL}/auth/google/success?token=${token}`);
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // If user uses Google auth
    if (user && user.authProvider === 'google') {
      return res.status(400).json({
        success: false,
        message: 'This account uses Google. No password to reset.'
      });
    }

    // Always return success for security (don't reveal if email exists)
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'Password reset link sent to your email.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = passwordResetExpires;
    await user.save();

    await sendPasswordResetEmail(email, resetToken);

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email.'
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now login.'
    });
  } catch (error) {
    next(error);
  }
};

const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is already verified
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Check if user uses Google auth
    if (user.authProvider === 'google') {
      return res.status(400).json({
        success: false,
        message: 'Google accounts do not need email verification'
      });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpires = emailVerificationExpires;
    await user.save();

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    res.status(200).json({
      success: true,
      message: 'Verification email sent. Please check your inbox.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  googleCallback,
  getMe,
  forgotPassword,
  resetPassword,
  resendVerification
};
