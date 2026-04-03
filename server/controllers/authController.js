const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationEmail, sendPasswordResetEmail, sendSignInAlertEmail, sendWelcomeEmail } = require('../services/emailService');
const RESERVED_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'shopfrozendelights@gmail.com').toLowerCase();
const SEND_SIGNIN_ALERTS = process.env.SEND_SIGNIN_ALERTS !== 'false';

const getImageFromRequest = (req) => {
  if (req.file?.path) {
    return req.file.path;
  }

  if (req.file?.buffer) {
    const mimeType = req.file.mimetype || 'image/jpeg';
    const base64 = req.file.buffer.toString('base64');
    return `data:${mimeType};base64,${base64}`;
  }

  return req.body?.image;
};

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (normalizedEmail === RESERVED_ADMIN_EMAIL) {
      return res.status(403).json({
        success: false,
        message: 'This email is reserved for admin Google Sign-In only. Please use /admin/login.'
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = new User({
      name,
      email: normalizedEmail,
      password,
      authProvider: 'local',
      isEmailVerified: false,
      emailVerificationToken: hashedToken,
      emailVerificationExpires
    });

    await user.save();

    // Send verification email
    await sendVerificationEmail(normalizedEmail, verificationToken);

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

    sendWelcomeEmail({
      to: user.email,
      customerName: user.name
    }).catch(() => {});

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
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (normalizedEmail === RESERVED_ADMIN_EMAIL) {
      return res.status(403).json({
        success: false,
        message: 'This email is reserved for admin. Please use /admin/login and Continue with Google.'
      });
    }

    // Find user with password and isEmailVerified
    const user = await User.findOne({ email: normalizedEmail }).select('+password +isEmailVerified');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin accounts use Google Sign-In only.'
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

    if (SEND_SIGNIN_ALERTS && user.role === 'admin') {
      sendSignInAlertEmail({
        to: user.email,
        customerName: user.name,
        provider: user.authProvider === 'google' ? 'Google' : 'Email/Password',
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip
      }).catch(() => {});
    }

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

    if (SEND_SIGNIN_ALERTS && user.role === 'admin') {
      sendSignInAlertEmail({
        to: user.email,
        customerName: user.name,
        provider: 'Google',
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip
      }).catch(() => {});
    }

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

    user.password = password;
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

const updateProfileImage = async (req, res, next) => {
  try {
    const image = getImageFromRequest(req);

    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'Profile image is required'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profileImage: image },
      { new: true }
    ).select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires');

    res.status(200).json({
      success: true,
      data: user,
      message: 'Profile image updated successfully'
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
  resendVerification,
  updateProfileImage
};
