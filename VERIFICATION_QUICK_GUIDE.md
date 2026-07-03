# Email & Phone Verification - Quick Integration Guide

## What's New

Email and mobile phone verification has been added to the FreshFarm application. Users now need to verify their email and phone number during registration.

## Files Added/Modified

### New Backend Files
- **`backend/src/utils/verificationUtils.js`** - Utility functions for OTP generation, email sending, and verification logic

### Modified Backend Files
- **`backend/src/models/User.js`** - Added email_verified, phone_verified, phone_otp fields
- **`backend/src/controllers/authController.js`** - Added 5 new verification endpoints
- **`backend/src/routes/authRoutes.js`** - Added 5 new verification routes

### New Frontend Files
- **`frontend/src/pages/VerifyEmailPage.jsx`** - Page for verifying email via link
- **`frontend/src/components/PhoneVerificationModal.jsx`** - Modal for phone OTP verification
- **`frontend/src/components/VerificationStatusWidget.jsx`** - Dashboard widget for verification status

### Modified Frontend Files
- **`frontend/src/pages/auth/RegisterPage.jsx`** - Shows phone verification modal after registration
- **`frontend/src/App.jsx`** - Added `/verify-email` route

## Setup Steps

### 1. Backend Setup

#### a. Update Dependencies
Verify these are in `backend/package.json` (already included):
```json
{
  "nodemailer": "^6.9.1",
  "twilio": "^3.x.x"  // Add if needed
}
```

Install if needed:
```bash
cd backend
npm install twilio  # If not already installed
```

#### b. Update .env Configuration
Edit `backend/.env` and ensure email configuration is set:

```env
# Email Configuration (Nodemailer)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password
EMAIL_FROM=noreply@freshfarm.com
FRONTEND_URL=http://localhost:3000

# SMS Configuration (Twilio) - Optional
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX
```

**Gmail Setup:**
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the 16-character password as `EMAIL_PASS`

**Twilio Setup (Optional):**
1. Create account at https://www.twilio.com
2. Get Account SID and Auth Token from Twilio Console
3. Purchase a phone number
4. Add credentials to .env

#### c. Database Migration
No migration needed - User model will automatically create new fields on first save.

#### d. Test Backend Verification
```bash
# Start backend
cd backend
npm run dev

# In another terminal, test registration with verification
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+919876543210",
    "password": "test123",
    "user_type": "consumer"
  }'
```

### 2. Frontend Setup

No additional npm packages needed - uses existing dependencies.

#### a. Ensure Routing is Updated
The `/verify-email` route has been automatically added to `App.jsx`.

#### b. Test Frontend Components
```bash
# Start frontend
cd frontend
npm start

# Navigate to: http://localhost:3000/register
```

## Usage Guide

### For End Users

#### Registration
1. User fills out registration form
2. Submits registration
3. Receives verification email immediately
4. Sees phone verification modal
5. Options to verify phone or skip for now
6. Accesses dashboard

#### Email Verification
1. Check email inbox for "Email Verification - FreshFarm"
2. Click "Verify Email" button or copy the link
3. Frontend automatically verifies and redirects to login
4. Or manually navigate to: `http://localhost:3000/verify-email?token=<token>`

#### Phone Verification
Option 1 - During Registration:
1. See phone verification modal after registration
2. Enter phone number
3. Receive OTP via SMS or email
4. Enter 6-digit OTP
5. Get verified

Option 2 - From Dashboard:
1. Go to Profile/Dashboard
2. VerificationStatusWidget shows status
3. Click "Verify Now" on phone verification
4. Follow same OTP process

### For Developers

#### Integrate VerificationStatusWidget in Dashboard
```jsx
import VerificationStatusWidget from '../components/VerificationStatusWidget';

function MyDashboard() {
  return (
    <div className="dashboard-container">
      <VerificationStatusWidget 
        userId={user.id}
        email={user.email}
        phone={user.phone}
      />
      {/* Other dashboard content */}
    </div>
  );
}
```

#### Check Verification Status in Code
```javascript
// Frontend API call
const response = await fetch('/api/auth/verification-status', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ user_id: userId })
});

const { data } = await response.json();
console.log(data);
// {
//   email_verified: true,
//   phone_verified: false,
//   is_verified: false,
//   email: "user@example.com",
//   phone: "+919876543210"
// }
```

#### Require Verification for Features
```javascript
async function requireVerification(userId) {
  const response = await fetch('/api/auth/verification-status', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId })
  });
  
  const { data } = await response.json();
  
  if (!data.is_verified) {
    throw new Error('Please complete email and phone verification');
  }
  
  return data;
}
```

## API Reference

### New Endpoints

#### 1. Send Email Verification
```
POST /api/auth/send-email-verification
Body: { "email": "user@example.com" }
Response: { "success": true, "message": "..." }
```

#### 2. Verify Email
```
POST /api/auth/verify-email
Body: { "token": "verification_token" }
Response: { "success": true, "message": "Email verified successfully" }
```

#### 3. Send Phone OTP
```
POST /api/auth/send-phone-otp
Body: { "phone": "+91...", "email": "..." }
Response: { "success": true, "sms_sent": true, "email_sent": true }
```

#### 4. Verify Phone OTP
```
POST /api/auth/verify-phone-otp
Body: { "phone": "+91...", "otp": "123456" }
Response: { "success": true, "message": "..." }
```

#### 5. Get Verification Status
```
GET /api/auth/verification-status (requires token)
POST /api/auth/verification-status
Body: { "user_id": "..." }
Response: { "success": true, "data": { ... } }
```

## Troubleshooting

### Emails Not Sending
- [ ] Check `.env` email configuration
- [ ] Gmail: Verify app password is correct (was generated from 2FA)
- [ ] Check backend logs: `npm run dev` output
- [ ] Try sending test email: `node testEmail.js` (optional)

### Phone OTP Not Working
- [ ] If Twilio not configured, OTP appears in backend console
- [ ] Check phone number format (+country_code format)
- [ ] Verify Twilio account has SMS credit
- [ ] OTP valid for 10 minutes only

### Verification Link Not Working
- [ ] Check `FRONTEND_URL` in `.env` (should match your frontend URL)
- [ ] Token valid for 24 hours only
- [ ] Check if token was deleted after first use
- [ ] Clear browser cache and try again

### Modal Not Showing After Registration
- [ ] Ensure `PhoneVerificationModal` imported in `RegisterPage.jsx`
- [ ] Check browser console for JavaScript errors
- [ ] Verify registration was successful (check response)

## Testing Checklist

- [ ] User can register successfully
- [ ] Verification email is sent
- [ ] Email link works and verifies email
- [ ] Phone OTP can be requested
- [ ] OTP appears in console or email
- [ ] OTP verification works
- [ ] Verification status displays correctly
- [ ] Users can skip phone verification during registration
- [ ] Users can verify phone later from dashboard

## Next Steps

1. Configure email settings in `.env`
2. (Optional) Configure Twilio for SMS
3. Run backend: `npm run dev`
4. Run frontend: `npm start`
5. Test registration flow
6. Add VerificationStatusWidget to user dashboards
7. Deploy to production

## Additional Resources

- Full documentation: See `EMAIL_AND_PHONE_VERIFICATION.md`
- Nodemailer docs: https://nodemailer.com/
- Twilio docs: https://www.twilio.com/docs/
