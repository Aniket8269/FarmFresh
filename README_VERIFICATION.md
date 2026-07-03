# 📧 Email and Mobile Phone Verification System

## Overview

A complete email and mobile phone verification system has been implemented in the FreshFarm application. This system ensures users verify their contact information during registration, improving security and enabling reliable communication.

## ✨ Features

### Email Verification
- **Automatic Verification Email** - Sent immediately after registration
- **Verification Token** - Secure token valid for 24 hours
- **Click-to-Verify** - One-click verification from email
- **Resendable** - Users can request new verification email
- **Status Tracking** - Track email verification status

### Phone Verification (OTP)
- **6-Digit OTP** - One-Time Password for verification
- **Dual Delivery** - SMS via Twilio + Email backup
- **Time-Limited** - OTP valid for 10 minutes
- **Resendable** - Easy resend with countdown timer
- **Modal Interface** - Clean, user-friendly modal for verification

### Dashboard Integration
- **Status Widget** - Shows verification status on dashboard
- **Quick Verification** - One-click verification button
- **Real-Time Updates** - Status updates immediately
- **Visual Indicators** - Clear ✅/⚠️ symbols for status

## 🚀 Quick Start

### 1. Configure Email (5 minutes)

Edit `backend/.env`:
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=16_char_app_password
EMAIL_FROM=noreply@freshfarm.com
FRONTEND_URL=http://localhost:3000
```

**Get Gmail App Password:**
1. Go to https://myaccount.google.com/apppasswords
2. Select Mail → Your Device
3. Generate password
4. Copy 16-character password to EMAIL_PASS

### 2. Test Email Configuration

```bash
cd backend
node testEmail.js
```

You should see: ✅ Test Email Sent Successfully!

### 3. Start Using

```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm start
```

Visit http://localhost:3000/register and test registration!

## 📋 What's Included

### Backend Components
```
✅ Verification Utilities (verificationUtils.js)
   - OTP generation
   - Email sending
   - SMS sending (Twilio)
   - Token validation

✅ Updated User Model
   - email_verified flag
   - phone_verified flag
   - OTP storage
   - Token storage

✅ New API Endpoints (5 endpoints)
   - /auth/send-email-verification
   - /auth/verify-email
   - /auth/send-phone-otp
   - /auth/verify-phone-otp
   - /auth/verification-status

✅ Test Utilities
   - testEmail.js (test email config)
   - testVerificationStatus.js (check stats)
```

### Frontend Components
```
✅ Pages
   - VerifyEmailPage.jsx (email verification)

✅ Components
   - PhoneVerificationModal.jsx (OTP verification)
   - VerificationStatusWidget.jsx (status display)

✅ Integration
   - RegisterPage.jsx (shows verification after registration)
   - App.jsx (email verification route)
```

## 📊 API Reference

### Endpoints

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/auth/register` | POST | Register + send email | No |
| `/auth/send-email-verification` | POST | Resend verification email | No |
| `/auth/verify-email` | POST | Verify email with token | No |
| `/auth/send-phone-otp` | POST | Send OTP | No |
| `/auth/verify-phone-otp` | POST | Verify phone with OTP | No |
| `/auth/verification-status` | GET/POST | Get verification status | Optional |

### Example Requests

**Register User**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+919876543210",
    "password": "secure123",
    "user_type": "consumer"
  }'
```

**Send Phone OTP**
```bash
curl -X POST http://localhost:5000/api/auth/send-phone-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+919876543210",
    "email": "john@example.com"
  }'
```

**Verify Phone OTP**
```bash
curl -X POST http://localhost:5000/api/auth/verify-phone-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+919876543210",
    "otp": "123456"
  }'
```

## 🎯 User Flows

### Registration Flow
```
1. User fills registration form
2. Submits registration
3. ✅ Account created
4. 📧 Verification email sent automatically
5. 📱 Phone verification modal appears
   - User can verify now OR skip
6. ✅ Redirected to dashboard
```

### Email Verification Flow
```
1. User receives verification email
2. Clicks "Verify Email" link
3. Frontend validates token
4. ✅ Email marked as verified
5. 📝 Status updated
6. Redirected to login
```

### Phone Verification Flow (from Dashboard)
```
1. User sees verification widget
2. Clicks "Verify Now"
3. Modal opens: "Send OTP"
4. 📱 User gets OTP (SMS + Email)
5. User enters 6-digit code
6. ✅ Phone marked as verified
7. Status updates automatically
```

## 🔧 Configuration

### Required: Email Setup

**Gmail Configuration:**
1. Enable 2-Factor Authentication on Gmail
2. Generate App Password at https://myaccount.google.com/apppasswords
3. Select "Mail" and "Windows Computer"
4. Copy generated 16-character password
5. Add to `.env`:
   ```
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=generated_app_password_here
   ```

**Other Email Services:**
- Change `EMAIL_SERVICE` value
- Consult Nodemailer documentation for config

### Optional: SMS Setup (Twilio)

1. Create account at https://www.twilio.com
2. Get Account SID and Auth Token
3. Purchase phone number
4. Add to `.env` and install:
   ```bash
   npm install twilio
   ```
5. Configure in `.env`:
   ```
   TWILIO_ACCOUNT_SID=your_sid
   TWILIO_AUTH_TOKEN=your_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

## 🛠️ Integration Guide

### Add to Dashboard
```jsx
import VerificationStatusWidget from '../components/VerificationStatusWidget';

export default function Dashboard() {
  return (
    <div className="dashboard">
      <VerificationStatusWidget 
        userId={user.id}
        email={user.email}
        phone={user.phone}
      />
    </div>
  );
}
```

### Check Verification Status in Code
```javascript
const response = await fetch('/api/auth/verification-status', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ user_id: userId })
});

const { data } = await response.json();

if (data.is_verified) {
  console.log('User is verified!');
} else {
  console.log('Email verified:', data.email_verified);
  console.log('Phone verified:', data.phone_verified);
}
```

### Require Verification for Features
```javascript
async function requireVerification(userId) {
  const response = await fetch('/api/auth/verification-status', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId })
  });
  
  const { data } = await response.json();
  
  if (!data.is_verified) {
    throw new Error('Please complete verification first');
  }
  
  return data;
}
```

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `QUICK_START_VERIFICATION.md` | Quick setup guide |
| `VERIFICATION_QUICK_GUIDE.md` | Integration guide |
| `EMAIL_AND_PHONE_VERIFICATION.md` | Complete documentation |
| `VERIFICATION_SETUP_CHECKLIST.md` | Setup verification checklist |
| `VERIFICATION_IMPLEMENTATION_SUMMARY.md` | Implementation details |

## 🧪 Testing

### Test Email Configuration
```bash
cd backend
node testEmail.js
```

### Check User Verification Stats
```bash
cd backend
node testVerificationStatus.js
```

### Manual Testing Steps
1. Register a new user at `/register`
2. Check email for verification link
3. Click link to verify email
4. See phone verification modal
5. Request OTP
6. Check backend console or email for OTP
7. Enter OTP to verify phone
8. Check verification status on dashboard

## ⚠️ Troubleshooting

### Emails Not Sending?
- ✅ Check `.env` email configuration
- ✅ Gmail: Used App Password (not regular password)
- ✅ Gmail: 2FA is enabled
- ✅ Run `node backend/testEmail.js` to diagnose
- ✅ Check backend logs

### SMS Not Working?
- Twilio not installed? `npm install twilio`
- Twilio not configured? Add credentials to `.env`
- Check Twilio account has SMS credits
- Phone format: Must include country code (+XX)

### Verification Link Broken?
- Check `FRONTEND_URL` in `.env`
- Token valid for 24 hours only
- Clear browser cache and try again

### Verification Status Not Updating?
- Clear browser cache
- Refresh page or reload widget
- Check backend is running
- Check network requests in browser console

## 🔐 Security Features

- ✅ **Secure Token Generation** - Uses crypto.randomBytes(32)
- ✅ **Password Hashing** - bcryptjs with 10 salt rounds
- ✅ **Time-Based Expiry** - Email: 24 hours, OTP: 10 minutes
- ✅ **Single-Use Tokens** - Deleted after first verification
- ✅ **JWT Protected** - Verification endpoints support JWT
- ✅ **Hashed OTP Storage** - OTP not sent in responses
- ✅ **Input Validation** - All inputs validated server-side

## 📈 Production Considerations

1. **Rate Limiting** - Implement on verification endpoints
2. **Monitoring** - Log all verification attempts
3. **Database Cleanup** - Remove expired tokens regularly
4. **Email Templates** - Customize for branding
5. **Error Handling** - User-friendly error messages
6. **HTTPS Only** - Use HTTPS in production
7. **Backup Methods** - Consider backup verification options
8. **Analytics** - Track verification completion rates

## 🎓 Technology Stack

**Backend:**
- Node.js / Express
- MongoDB / Mongoose
- Nodemailer (email)
- Twilio (SMS - optional)
- bcryptjs (password hashing)
- jsonwebtoken (JWT)

**Frontend:**
- React 18+
- React Router
- Axios / Fetch API
- Lucide Icons
- Tailwind CSS

## 🚀 Performance

- **Email Sending:** Async (non-blocking)
- **OTP Generation:** < 1ms
- **Token Validation:** < 2ms
- **Database Queries:** Indexed fields for fast lookups
- **Frontend:** Modal-based (no page reload)

## 📞 Support

### Documentation
- Check `QUICK_START_VERIFICATION.md` for quick setup
- Check `EMAIL_AND_PHONE_VERIFICATION.md` for full API details
- Check `VERIFICATION_SETUP_CHECKLIST.md` for verification steps

### Utilities
- `node backend/testEmail.js` - Test email configuration
- `node backend/testVerificationStatus.js` - Check user stats

### Common Issues
- Most issues are email configuration related
- Follow Gmail setup steps carefully for 2FA and app passwords
- Check backend console for detailed error messages

## 🎉 What's Next?

**Consider adding:**
1. Email-based multi-factor authentication (2FA)
2. Risk-based verification (trust scores)
3. Verification reminders for inactive users
4. Backup phone number support
5. Verification analytics dashboard
6. Custom email templates per user type

## 📝 License

Part of FreshFarm Platform - All Rights Reserved

---

**Ready to go!** Follow `QUICK_START_VERIFICATION.md` to get started.
