const nodemailer = require('nodemailer');
require('dotenv').config();

// Test Email Configuration
async function testEmailConfiguration() {
  console.log('🔍 Testing Email Configuration...\n');

  // Check environment variables
  console.log('📋 Checking Environment Variables:');
  console.log('  EMAIL_SERVICE:', process.env.EMAIL_SERVICE || '❌ Not set');
  console.log('  EMAIL_USER:', process.env.EMAIL_USER || '❌ Not set');
  console.log('  EMAIL_FROM:', process.env.EMAIL_FROM || '❌ Not set');
  console.log('  FRONTEND_URL:', process.env.FRONTEND_URL || '❌ Not set\n');

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ EMAIL_USER or EMAIL_PASS not configured in .env');
    process.exit(1);
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Verify connection
  console.log('🔌 Verifying SMTP Connection...');
  try {
    await transporter.verify();
    console.log('✅ SMTP Connection Verified!\n');
  } catch (error) {
    console.error('❌ SMTP Connection Failed:');
    console.error('  Error:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('  - Verify EMAIL_USER and EMAIL_PASS in .env');
    console.error('  - For Gmail: Use App Password (not regular password)');
    console.error('  - Enable 2FA: https://myaccount.google.com/security');
    console.error('  - Generate App Password: https://myaccount.google.com/apppasswords');
    process.exit(1);
  }

  // Send test email
  console.log('📧 Sending Test Email...');
  const testEmail = process.env.EMAIL_USER;

  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: testEmail,
    subject: '🎉 FreshFarm Email Configuration Test',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Email Configuration Test</h2>
        <p>This is a test email to verify that the FreshFarm email configuration is working correctly.</p>
        
        <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>Configuration Details:</h3>
          <ul>
            <li><strong>Service:</strong> ${process.env.EMAIL_SERVICE}</li>
            <li><strong>From:</strong> ${process.env.EMAIL_FROM || process.env.EMAIL_USER}</li>
            <li><strong>Timestamp:</strong> ${new Date().toLocaleString()}</li>
          </ul>
        </div>
        
        <p style="color: #666;">If you received this email, your email configuration is working correctly!</p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 12px; color: #999;">FreshFarm Email Service Test</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Test Email Sent Successfully!');
    console.log('  Message ID:', info.messageID);
    console.log('\n📬 Check your inbox at:', testEmail);
    console.log('\n✨ Email configuration is working correctly!\n');
  } catch (error) {
    console.error('❌ Failed to Send Test Email:');
    console.error('  Error:', error.message);
    console.error('\n💡 Troubleshooting:');
    if (error.message.includes('Invalid login')) {
      console.error('  - Incorrect email or password');
      console.error('  - For Gmail: Use 16-character App Password');
    }
    if (error.message.includes('ECONNREFUSED')) {
      console.error('  - SMTP server connection refused');
      console.error('  - Check internet connection');
    }
    process.exit(1);
  }
}

// Run test
testEmailConfiguration().catch(error => {
  console.error('🔴 Test Failed:', error);
  process.exit(1);
});
