const nodemailer = require('nodemailer');

const sendVerificationEmail = async (to, token) => {
  try {
    console.log('📧 Sending verification email to:', to);
    console.log('🔧 SMTP Config:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS ? '***SET***' : 'NOT SET'
    });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      debug: true, // Enable debug logs
      logger: true
    });

    // Verify transporter configuration
    await transporter.verify();
    console.log('✅ SMTP transporter verified successfully');

    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;
    console.log('🔗 Verification URL:', verificationUrl);
    
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: to,
      subject: '🍦 Verify your FrozenDelights account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 32px;">🍦 FrozenDelights</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Welcome to the sweetest ice cream shop!</p>
          </div>
          <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">Verify Your Email Address</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Thank you for signing up! Please click the button below to verify your email address and activate your account.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; padding: 15px 40px; text-decoration: none; 
                        border-radius: 50px; font-weight: bold; font-size: 16px; 
                        display: inline-block; box-shadow: 0 4px 15px rgba(102,126,234,0.3);">
                Verify Email Address
              </a>
            </div>
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              This link will expire in <strong>24 hours</strong>. If you didn't create an account, you can safely ignore this email.
            </p>
            <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                © 2024 FrozenDelights. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `
    };

    console.log('📤 Sending email...');
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('❌ Email sending error:', error);
    console.error('❌ Error details:', {
      code: error.code,
      command: error.command,
      response: error.response,
      message: error.message
    });
    return false;
  }
};

const sendPasswordResetEmail = async (to, token) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
    
    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: to,
      subject: '🔑 Reset your FrozenDelights password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 32px;">🍦 FrozenDelights</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Password Reset Request</p>
          </div>
          <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">Reset Your Password</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              We received a request to reset your password. If you didn't make this request, please ignore this email.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); 
                        color: white; padding: 15px 40px; text-decoration: none; 
                        border-radius: 50px; font-weight: bold; font-size: 16px; 
                        display: inline-block; box-shadow: 0 4px 15px rgba(240,147,251,0.3);">
                Reset Password
              </a>
            </div>
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              This link will expire in <strong>15 minutes</strong> for security reasons.
            </p>
            <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                © 2024 FrozenDelights. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

const sendInvoiceEmail = async (to, pdfBuffer, orderId) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const invoiceNumber = `INV-${orderId.slice(-6).toUpperCase()}`;

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: to,
      subject: `Your FrozenDelights Invoice - ${invoiceNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 32px;">🍦 FrozenDelights</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Thank you for your order!</p>
          </div>
          <div style="background: white; padding: 40px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">Order Confirmation</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Your order has been successfully placed! We've attached your invoice to this email.
            </p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #333;"><strong>Invoice Number:</strong> ${invoiceNumber}</p>
              <p style="margin: 5px 0; color: #333;"><strong>Order ID:</strong> ${orderId}</p>
            </div>
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              Please keep this invoice for your records. If you have any questions, feel free to contact our support team.
            </p>
            <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px; text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                © 2024 FrozenDelights. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `invoice-${orderId}.pdf`,
          content: pdfBuffer.toString('base64'),
          encoding: 'base64',
          contentType: 'application/pdf'
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

const sendOrderStatusEmail = async ({ to, customerName, orderId, status, note }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const trackingUrl = `${process.env.CLIENT_URL}/order/${orderId}/track`;

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to,
      subject: `🍦 Order Update: ${status}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">FrozenDelights</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Your order status changed</p>
          </div>
          <div style="background: #fff; padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 10px 10px;">
            <p>Hi ${customerName || 'Customer'},</p>
            <p>Your order <strong>#${String(orderId).slice(-8).toUpperCase()}</strong> is now <strong>${status}</strong>.</p>
            ${note ? `<p style="color:#555;">Note: ${note}</p>` : ''}
            <div style="margin-top: 24px;">
              <a href="${trackingUrl}" style="display:inline-block;background:#0d6efd;color:#fff;text-decoration:none;padding:12px 20px;border-radius:6px;">Track Your Order</a>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Order status email error:', error.message);
    return false;
  }
};

const sendSignInAlertEmail = async ({ to, customerName, provider, userAgent, ipAddress }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const signInTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to,
      subject: '🔐 New Sign-In to your FrozenDelights account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">FrozenDelights</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Security Alert</p>
          </div>
          <div style="background: #fff; padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 10px 10px;">
            <p>Hi ${customerName || 'User'},</p>
            <p>We detected a new sign-in to your account.</p>
            <ul style="line-height: 1.8; color: #333;">
              <li><strong>Method:</strong> ${provider || 'Unknown'}</li>
              <li><strong>Time:</strong> ${signInTime}</li>
              <li><strong>IP:</strong> ${ipAddress || 'N/A'}</li>
              <li><strong>Device:</strong> ${userAgent || 'N/A'}</li>
            </ul>
            <p>If this wasn't you, please reset your password immediately.</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Sign-in alert email error:', error.message);
    return false;
  }
};

const sendWelcomeEmail = async ({ to, customerName }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const menuUrl = `${process.env.CLIENT_URL}/menu`;

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to,
      subject: '🍦 Welcome to FrozenDelights!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Welcome to FrozenDelights</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0;">Your account is now ready 🎉</p>
          </div>
          <div style="background: #fff; padding: 30px; border: 1px solid #eee; border-top: none; border-radius: 0 0 10px 10px;">
            <p>Hi ${customerName || 'there'},</p>
            <p>Thanks for joining FrozenDelights! Start exploring our menu and place your first order.</p>
            <div style="margin-top: 20px;">
              <a href="${menuUrl}" style="display:inline-block;background:#0d6efd;color:#fff;text-decoration:none;padding:12px 20px;border-radius:6px;">Browse Menu</a>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Welcome email error:', error.message);
    return false;
  }
};

module.exports = { 
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendInvoiceEmail,
  sendOrderStatusEmail,
  sendSignInAlertEmail,
  sendWelcomeEmail
};
