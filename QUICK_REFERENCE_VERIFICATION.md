# 🎯 Quick Reference Card - Email & Phone Verification

## Getting Started (2 Steps)

### Step 1: Configure Email (.env)
```env
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=app_password_from_gmail
EMAIL_FROM=noreply@freshfarm.com
FRONTEND_URL=http://localhost:3000
```

### Step 2: Start Servers
```bash
cd backend && npm run dev    # Terminal 1
cd frontend && npm start     # Terminal 2
```

Visit http://localhost:3000/register ✅

---

## What's Available

### 📧 Email Verification
- Automatic email sent on registration
- Click link to verify in 24 hours
- Resend capability
- Verification page: `/verify-email?token=...`

### 📱 Phone Verification (OTP)
- 6-digit code sent during registration
- Can skip and verify later
- SMS delivery (if Twilio configured)
- Modal interface

### 📊 Status Dashboard
- Verification widget shows status
- Check email_verified and phone_verified flags
- One-click verification button

---

## API Endpoints

```
POST /api/auth/register
POST /api/auth/send-email-verification  
POST /api/auth/verify-email
POST /api/auth/send-phone-otp
POST /api/auth/verify-phone-otp
GET/POST /api/auth/verification-status
```

---

## Code Snippets

### Add to Dashboard
```jsx
import VerificationStatusWidget from '../components/VerificationStatusWidget';

<VerificationStatusWidget 
  userId={user.id}
  email={user.email}
  phone={user.phone}
/>
```

### Check if Verified
```javascript
const response = await fetch('/api/auth/verification-status', {
  method: 'POST',
  body: JSON.stringify({ user_id: userId })
});
const { data } = await response.json();
console.log(data.is_verified); // true or false
```

---

## Test Commands

```bash
# Test email configuration
node backend/testEmail.js

# Check verification statistics
node backend/testVerificationStatus.js

# Test API endpoint
curl -X POST http://localhost:5000/api/auth/verification-status \
  -H "Content-Type: application/json" \
  -d '{"user_id": "USER_ID"}'
```

---

## Troubleshooting

### Emails Not Sending
```bash
# Diagnose
node backend/testEmail.js

# Fix
1. Check Gmail App Password (not regular password)
2. Enable 2FA on Gmail
3. Verify .env configuration
```

### OTP Not Working
- Check backend console for OTP value
- OTP valid for 10 minutes
- Phone format must include country code

### Link Not Working
- Check FRONTEND_URL in .env
- Token valid for 24 hours
- Clear browser cache

---

## File Locations

```
Backend:
  ✅ Utilities: backend/src/utils/verificationUtils.js
  ✅ User Model: backend/src/models/User.js
  ✅ Controller: backend/src/controllers/authController.js
  ✅ Routes: backend/src/routes/authRoutes.js

Frontend:
  ✅ Pages: frontend/src/pages/VerifyEmailPage.jsx
  ✅ Components: frontend/src/components/PhoneVerificationModal.jsx
  ✅ Components: frontend/src/components/VerificationStatusWidget.jsx
  ✅ Updated: frontend/src/pages/auth/RegisterPage.jsx
  ✅ Updated: frontend/src/App.jsx

Tests:
  ✅ backend/testEmail.js
  ✅ backend/testVerificationStatus.js
```

---

## Documentation Files

| File | Purpose |
|------|---------|
| README_VERIFICATION.md | Main documentation |
| QUICK_START_VERIFICATION.md | 3-step setup |
| VERIFICATION_QUICK_GUIDE.md | Integration guide |
| EMAIL_AND_PHONE_VERIFICATION.md | Complete API docs |
| VERIFICATION_SETUP_CHECKLIST.md | Setup verification |
| FILES_ADDED_AND_MODIFIED.md | All changes listed |

---

## Database Fields Added to User

```javascript
email_verified: Boolean        // true if email verified
phone_verified: Boolean        // true if phone verified
verification_token: String     // email verification token
verification_token_sent_at: Date
phone_otp: String             // 6-digit OTP
phone_otp_timestamp: Date     // when OTP was generated
```

---

## User Flow

### Registration
```
Registration Form → Verification Email Sent → Phone OTP Modal → Dashboard
```

### Email Verification
```
Click Email Link → Verification Page → Marked Verified → Redirected to Login
```

### Phone Verification
```
Request OTP → Get 6-Digit Code → Enter Code → Marked Verified
```

---

## Features

✅ Email verification with 24-hour token  
✅ Phone OTP with 10-minute validity  
✅ SMS via Twilio (optional)  
✅ Email backup delivery  
✅ Dashboard status widget  
✅ Real-time updates  
✅ Resendable verification  
✅ Beautiful UI/UX  
✅ Secure implementation  
✅ Test utilities included  

---

## Configuration Options

### Required
```
EMAIL_SERVICE=gmail
EMAIL_USER=email@gmail.com
EMAIL_PASS=app_password
EMAIL_FROM=noreply@freshfarm.com
FRONTEND_URL=http://localhost:3000
```

### Optional (Twilio SMS)
```
TWILIO_ACCOUNT_SID=sid
TWILIO_AUTH_TOKEN=token
TWILIO_PHONE_NUMBER=+1234567890
```

---

## Common Tasks

### Test Email Configuration
```bash
node backend/testEmail.js
```

### View Verification Stats
```bash
node backend/testVerificationStatus.js
```

### Resend Verification Email
```bash
curl -X POST http://localhost:5000/api/auth/send-email-verification \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

### Get User's Verification Status
```bash
curl -X POST http://localhost:5000/api/auth/verification-status \
  -H "Content-Type: application/json" \
  -d '{"user_id": "user_id_here"}'
```

---

## Next Steps

1. ✅ Configure email in .env
2. ✅ Test with: `node backend/testEmail.js`
3. ✅ Start servers and register user
4. ✅ Add verification widget to dashboards
5. ✅ Deploy to production

---

## Support

**Quick Start:** Read `QUICK_START_VERIFICATION.md`  
**Full API:** Read `EMAIL_AND_PHONE_VERIFICATION.md`  
**Setup Check:** Follow `VERIFICATION_SETUP_CHECKLIST.md`  
**All Changes:** See `FILES_ADDED_AND_MODIFIED.md`  

---

**Questions?** Check the documentation or run test utilities!
