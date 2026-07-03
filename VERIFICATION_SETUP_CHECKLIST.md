# ✅ Installation & Setup Verification Checklist

Complete this checklist to ensure email and phone verification is properly set up.

## Phase 1: Code Installation ✅

- [x] Backend utilities added (`backend/src/utils/verificationUtils.js`)
- [x] User model updated with verification fields
- [x] Auth controller updated with verification endpoints
- [x] Auth routes updated with new endpoints
- [x] Frontend pages created (VerifyEmailPage.jsx)
- [x] Frontend components created (PhoneVerificationModal, VerificationStatusWidget)
- [x] RegisterPage.jsx updated for phone verification
- [x] App.jsx updated with verify-email route
- [x] Documentation created

## Phase 2: Environment Configuration 📋

### Email Setup
- [ ] Edit `backend/.env`
- [ ] Set `EMAIL_SERVICE` (usually 'gmail')
- [ ] Set `EMAIL_USER` (your email address)
- [ ] Set `EMAIL_PASS` (16-character app password for Gmail)
- [ ] Set `EMAIL_FROM` (sender email)
- [ ] Set `FRONTEND_URL` (http://localhost:3000 for development)

### Optional: SMS Setup
- [ ] Create Twilio account (https://www.twilio.com)
- [ ] Get Account SID and Auth Token
- [ ] Purchase phone number
- [ ] Set `TWILIO_ACCOUNT_SID` in .env
- [ ] Set `TWILIO_AUTH_TOKEN` in .env
- [ ] Set `TWILIO_PHONE_NUMBER` in .env
- [ ] Run: `cd backend && npm install twilio`

## Phase 3: Database Setup ✅

- [x] MongoDB connection configured (User model will auto-create fields)

## Phase 4: Testing

### Email Configuration Test
```bash
cd backend
node testEmail.js
```

- [ ] SMTP connection succeeds
- [ ] Test email received in inbox
- [ ] No errors in console

### Backend Server Test
```bash
cd backend
npm run dev
```

- [ ] Server starts on port 5000
- [ ] No database connection errors
- [ ] No missing module errors

### Frontend Server Test
```bash
cd frontend
npm start
```

- [ ] Frontend loads on http://localhost:3000
- [ ] No console errors
- [ ] Navigation works

### Registration Test
1. Go to http://localhost:3000/register
2. Fill in form:
   - Name: Test User
   - Email: your_email@example.com
   - Phone: +919876543210
   - Password: test123
   - User Type: Consumer
3. Click "Create Account"

- [ ] Registration succeeds
- [ ] Phone verification modal appears
- [ ] Verification email received

### Email Verification Test
1. Check your email inbox
2. Look for "Email Verification - FreshFarm"
3. Click "Verify Email" button (or copy link)
4. Page shows "Email verified successfully"

- [ ] Email received
- [ ] Verification link works
- [ ] Redirected to login

### Phone OTP Test
1. From registration modal OR dashboard widget
2. Click "Send OTP"
3. Check backend console or email for OTP

- [ ] OTP appears in console or email
- [ ] Modal shows "Enter OTP" step
- [ ] Can enter 6-digit code

4. Enter OTP from console
5. Click "Verify"

- [ ] Verification succeeds
- [ ] Modal closes or shows success
- [ ] Status updates to verified

### Verification Status Test
```bash
cd backend
node testVerificationStatus.js
```

- [ ] Script runs without errors
- [ ] Shows user verification statistics
- [ ] Shows recent users with status

## Phase 5: Feature Integration

### Add to Consumer Dashboard
- [ ] Import VerificationStatusWidget
- [ ] Add widget to dashboard component
- [ ] Widget displays correctly
- [ ] Can click "Verify Now" button

### Add to Farmer Dashboard
- [ ] Import VerificationStatusWidget
- [ ] Add widget to dashboard component
- [ ] Widget displays correctly

### Add to Delivery Partner Dashboard
- [ ] Import VerificationStatusWidget
- [ ] Add widget to dashboard component
- [ ] Widget displays correctly

## Phase 6: API Endpoint Verification

### Test Registration Endpoint
```bash
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
- [ ] Returns 201 with token
- [ ] User created in database
- [ ] Email sent

### Test Send Email Verification
```bash
curl -X POST http://localhost:5000/api/auth/send-email-verification \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```
- [ ] Returns 200 success
- [ ] Email sent

### Test Send Phone OTP
```bash
curl -X POST http://localhost:5000/api/auth/send-phone-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210", "email": "test@example.com"}'
```
- [ ] Returns 200 success
- [ ] OTP appears in console/email

### Test Verify Phone OTP
```bash
curl -X POST http://localhost:5000/api/auth/verify-phone-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210", "otp": "123456"}'
```
- [ ] Returns 200 with success message

### Test Verification Status
```bash
curl -X POST http://localhost:5000/api/auth/verification-status \
  -H "Content-Type: application/json" \
  -d '{"user_id": "USER_ID_HERE"}'
```
- [ ] Returns 200 with status object
- [ ] Shows email_verified and phone_verified flags

## Phase 7: Error Handling

### Test Invalid Email Token
```bash
curl -X POST http://localhost:5000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token": "invalid_token"}'
```
- [ ] Returns 400 error
- [ ] Shows "Invalid or expired verification token"

### Test Invalid OTP
```bash
curl -X POST http://localhost:5000/api/auth/verify-phone-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210", "otp": "000000"}'
```
- [ ] Returns 400 error
- [ ] Shows "Invalid OTP"

### Test Expired OTP
- [ ] Wait 10+ minutes after OTP request
- [ ] Try to verify with old OTP
- [ ] Returns error: "OTP has expired"

## Phase 8: Production Readiness

- [ ] HTTPS configured (production)
- [ ] Email configuration uses production email
- [ ] SMS configuration complete (if using SMS)
- [ ] Database backups configured
- [ ] Error logging configured
- [ ] Rate limiting considered
- [ ] Email templates customized (optional)
- [ ] Frontend URL points to production (in production)

## Phase 9: Documentation Review

- [ ] Read QUICK_START_VERIFICATION.md
- [ ] Read VERIFICATION_QUICK_GUIDE.md
- [ ] Read EMAIL_AND_PHONE_VERIFICATION.md
- [ ] Share with team

## Troubleshooting

### If Emails Not Sending
- [ ] Run `node backend/testEmail.js`
- [ ] Check Gmail app password (not regular password)
- [ ] Verify 2FA is enabled on Gmail
- [ ] Check .env email configuration
- [ ] Check server logs for SMTP errors

### If SMS Not Working
- [ ] Check Twilio credentials in .env
- [ ] Verify Twilio account has SMS credits
- [ ] Check phone number format (+country_code)
- [ ] Run backend server and check console logs

### If Routes Not Found
- [ ] Verify authRoutes.js is updated
- [ ] Check backend server is running
- [ ] Clear frontend cache (Ctrl+Shift+R)
- [ ] Restart frontend dev server

### If Database Fields Missing
- [ ] Check User model has all new fields
- [ ] Register new user (auto-creates fields)
- [ ] Or manually update existing users in MongoDB

## Final Verification

- [ ] Can register users ✅
- [ ] Emails are sent ✅
- [ ] Email verification works ✅
- [ ] Phone OTP works ✅
- [ ] Status displays correctly ✅
- [ ] All documentation reviewed ✅

---

## ✨ All Set!

Your email and phone verification system is ready for production use.

**Next Steps:**
1. Test with real users
2. Monitor email delivery rates
3. Gather user feedback
4. Consider future enhancements (2FA, backup methods, etc.)

**Questions?** Check the documentation files or run the test utilities:
- `node backend/testEmail.js` - Test email
- `node backend/testVerificationStatus.js` - Check stats
