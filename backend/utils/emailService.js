import nodemailer from 'nodemailer';

export const sendOTPEmail = async (email, otp) => {
  try {
    console.log('🔧 Attempting to send email to:', email);
    console.log('📧 Using sender:', process.env.EMAIL_USER);
    
    // Check if email credentials are provided
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error('❌ Email credentials missing');
      logOTPToConsole(email, otp);
      return false;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      // Additional settings for better reliability
      pool: true,
      maxConnections: 1,
      rateDelta: 20000,
      rateLimit: 5
    });

    // Verify the connection
    console.log('🔍 Verifying email configuration...');
    await transporter.verify();
    console.log('✅ Email configuration verified');

    const mailOptions = {
      from: {
        name: 'HKS Foods Ltd',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: 'HKS Foods Ltd - Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #E7D8B8, #8B7355); padding: 20px; text-align: center;">
            <h1 style="color: #1F293B; margin: 0;">HKS Foods Ltd</h1>
            <p style="color: #1F293B; margin: 5px 0 0 0;">Warehouse Management System</p>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #1F293B;">Password Reset Request</h2>
            <p>You requested a password reset for your HKS Foods account.</p>
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #E7D8B8; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #666;">Your One-Time Password (OTP) is:</p>
              <h1 style="color: #1F293B; font-size: 32px; letter-spacing: 8px; margin: 10px 0; text-align: center;">
                ${otp}
              </h1>
              <p style="margin: 0; font-size: 12px; color: #999;">This OTP will expire in 10 minutes</p>
            </div>
            <p style="color: #666; font-size: 14px;">
              If you didn't request this reset, please ignore this email.
            </p>
          </div>
          <div style="background: #1F293B; padding: 20px; text-align: center; color: white;">
            <p style="margin: 0; font-size: 12px;">&copy; 2025 HKS Foods Ltd. All rights reserved.</p>
          </div>
        </div>
      `,
      // Text version for email clients that don't support HTML
      text: `Your HKS Foods password reset OTP is: ${otp}. This OTP will expire in 10 minutes.`
    };

    console.log('📤 Sending email...');
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('📨 Message ID:', result.messageId);
    console.log('👤 Recipient:', email);
    
    return true;
    
  } catch (error) {
    console.error('❌ Email sending failed:');
    console.error('🔍 Error name:', error.name);
    console.error('🔍 Error message:', error.message);
    console.error('🔍 Error code:', error.code);
    
    // Specific error handling
    if (error.code === 'EAUTH') {
      console.error('💡 Solution: Invalid email credentials - Use App Password instead of regular password');
      console.error('💡 How to fix:');
      console.error('   1. Enable 2-Factor Authentication on your Google account');
      console.error('   2. Generate an App Password from Google Account settings');
      console.error('   3. Replace EMAIL_PASSWORD in .env with the 16-character App Password');
    } else if (error.code === 'EENVELOPE') {
      console.error('💡 Solution: Invalid recipient email address');
    } else if (error.code === 'ECONNECTION') {
      console.error('💡 Solution: Network connection issue');
    }
    
    // Fallback to console logging
    // console.log('🔄 Falling back to console OTP display');
    // logOTPToConsole(email, otp);
    
    return false;
  }
};

export const logOTPToConsole = (email, otp) => {
  console.log('='.repeat(60));
  console.log('📧 DEVELOPMENT MODE - OTP NOTIFICATION');
  console.log('='.repeat(60));
  console.log(`👤 Recipient: ${email}`);
  console.log(`🔐 OTP Code: ${otp}`);
  console.log(`⏰ Expires: 10 minutes`);
  console.log('='.repeat(60));
  console.log('⚠️  In production, this would be sent via email');
  console.log('='.repeat(60));
};
