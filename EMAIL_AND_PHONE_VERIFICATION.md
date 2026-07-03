# Email and Mobile Verification System

## Overview

This document describes the email and mobile number verification system implemented in the FreshFarm application. The system ensures that users verify both their email addresses and phone numbers for better security and communication.

## Features

### 1. Email Verification
- **Automatic Email Verification on Registration**: When a user registers, a verification email is automatically sent with a verification link
- **Email Verification Link**: Contains a unique token valid for 24 hours
- **Verification Page**: Users can verify their email by clicking the link or copying the token
- **Resend Verification Email**: Users can request a new verification email if needed

### 2. Phone Verification (OTP)
- **OTP Generation**: 6-digit One-Time Password for mobile verification
- **Multiple Delivery Methods**:
  - SMS via Twilio (if configured)
  - Email backup delivery
- **OTP Expiry**: OTP valid for 10 minutes
- **OTP Resend**: Users can request a new OTP after expiry

### 3. Verification Status
- Users can check their verification status at any time
- Displays which verifications are pending or completed
- One-click verification for pending items

## Database Schema

### User Model Updates

```javascript
// Email Verification
email_verified: Boolean (default: false)
verification_token: String (hashed)
verification_token_sent_at: Date

// Phone Verification
phone_verified: Boolean (default: false)
phone_otp: String (4-digit code)
phone_otp_timestamp: Date

// Overall Status
is_verified: Boolean (true when both email and phone are verified)
```

## Backend Endpoints

### 1. Registration
**POST** `/api/auth/register`

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+919876543210",
  "password": "securePassword123",
  "user_type": "consumer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

**Note**: Verification email is automatically sent after registration.

### 2. Send Email Verification
**POST** `/api/auth/send-email-verification`

**Request:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification email sent successfully"
}
```

### 3. Verify Email
**POST** `/api/auth/verify-email`

**Request:**
```json
{
  "token": "verification_token_here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

### 4. Send Phone OTP
**POST** `/api/auth/send-phone-otp`

**Request:**
```json
{
  "phone": "+919876543210",
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully to phone and email",
  "sms_sent": true,
  "email_sent": true
}
```

### 5. Verify Phone OTP
**POST** `/api/auth/verify-phone-otp`

**Request:**
```json
{
  "phone": "+919876543210",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Phone number verified successfully"
}
```

### 6. Get Verification Status
**GET** `/api/auth/verification-status` (Protected)
**POST** `/api/auth/verification-status`

**Request (POST):**
```json
{
  "user_id": "user_id_here"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "email_verified": true,
    "phone_verified": false,
    "is_verified": false,
    "email": "john@example.com",
    "phone": "+919876543210"
  }
}
```

## Frontend Components

### 1. VerifyEmailPage (`pages/VerifyEmailPage.jsx`)
Displays email verification status when user clicks the verification link.

**Usage:**
- Route: `/verify-email?token=<verification_token>`
- Automatically validates token and updates verification status
- Redirects to login on success

### 2. PhoneVerificationModal (`components/PhoneVerificationModal.jsx`)
Modal component for phone number verification using OTP.

**Props:**
- `email`: User's email address
- `phone`: User's phone number
- `onVerified`: Callback when verification succeeds
- `onCancel`: Callback when user cancels

**Features:**
- Two-step process: Request OTP → Enter OTP
- 60-second countdown before resend
- Real-time validation

### 3. VerificationStatusWidget (`components/VerificationStatusWidget.jsx`)
Dashboard widget showing verification status and allowing users to verify details.

**Props:**
- `userId`: User ID (optional, uses token if not provided)
- `email`: User's email
- `phone`: User's phone

**Features:**
- Real-time status display
- One-click verification button
- Integrated phone verification modal

## Environment Variables

### Email Configuration (.env)
```
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password
EMAIL_FROM=noreply@freshfarm.com
FRONTEND_URL=http://localhost:3000
```

**Gmail Setup:**
1. Enable 2-Factor Authentication
2. Generate App Password
3. Use the app password as `EMAIL_PASS`

### SMS Configuration (.env)
```
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890
```

**Twilio Setup:**
1. Create a Twilio account at https://www.twilio.com
2. Get your Account SID and Auth Token
3. Purchase a phone number
4. Update .env variables

**Note:** If Twilio is not configured, OTP will be logged to console and sent via email.

## User Flow

### Registration Flow
```
1. User fills registration form
2. User submits registration
3. Backend creates user account
4. Backend sends verification email
5. Frontend shows phone verification modal
6. User can:
   a. Verify phone with OTP
   b. Skip and verify later
7. User redirected to dashboard
```

### Email Verification Flow
```
1. User receives verification email
2. User clicks verification link
3. Frontend validates token
4. Backend marks email as verified
5. User redirected to login
```

### Phone Verification Flow (from Dashboard)
```
1. User clicks "Verify Now" on VerificationStatusWidget
2. Phone verification modal opens
3. User requests OTP
4. OTP sent via SMS and Email
5. User enters OTP
6. Backend validates OTP
7. Phone marked as verified
8. Status widget updates automatically
```

## Security Considerations

1. **Email Verification Token**:
   - Generated using crypto.randomBytes(32)
   - Valid for 24 hours
   - Single use (deleted after verification)

2. **Phone OTP**:
   - 6-digit random number
   - Valid for 10 minutes
   - Rate-limited (implement in production)
   - Not sent in responses

3. **Password Requirements**:
   - Minimum 6 characters
   - Hashed with bcryptjs (10 salt rounds)

4. **Token Protection**:
   - JWT tokens include user ID and type
   - Tokens valid for 7 days (configurable)
   - Verification tokens stored server-side

## Error Handling

### Common Errors

**Token Expired**
```json
{
  "success": false,
  "message": "Verification token has expired. Please request a new one."
}
```

**OTP Expired**
```json
{
  "success": false,
  "message": "OTP has expired. Please request a new one."
}
```

**Invalid OTP**
```json
{
  "success": false,
  "message": "Invalid OTP"
}
```

**User Not Found**
```json
{
  "success": false,
  "message": "User not found"
}
```

## Testing

### Testing Email Verification
```bash
# 1. Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+919876543210",
    "password": "test123",
    "user_type": "consumer"
  }'

# 2. Check email for verification link
# 3. Visit: http://localhost:3000/verify-email?token=<token_from_email>
```

### Testing Phone Verification
```bash
# 1. Request OTP
curl -X POST http://localhost:5000/api/auth/send-phone-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+919876543210",
    "email": "test@example.com"
  }'

# 2. Check console/email for OTP
# 3. Verify OTP
curl -X POST http://localhost:5000/api/auth/verify-phone-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+919876543210",
    "otp": "123456"
  }'
```

## Production Recommendations

1. **Rate Limiting**: Implement rate limiting on verification endpoints
2. **Database Cleanup**: Periodic cleanup of expired tokens and OTPs
3. **Logging**: Log all verification attempts for security audit
4. **Notifications**: Send reminders if user doesn't verify within 24 hours
5. **Backup Phone**: Allow users to add backup phone number
6. **Two-Factor Authentication (2FA)**: Extend system to support TOTP/push notifications
7. **Verification Analytics**: Track verification rates and failure reasons

## Troubleshooting

### Emails Not Sending
- Check `.env` email configuration
- Verify Gmail app password is correct
- Check "Less secure app access" settings
- Review server logs for errors

### SMS Not Sending
- Verify Twilio configuration in `.env`
- Check account balance and SMS limit
- Verify phone number format (should include country code)
- Check Twilio console for message status

### Verification Links Not Working
- Verify `FRONTEND_URL` in `.env`
- Check token format in database
- Ensure token hasn't expired (24-hour limit)
- Clear browser cache and try again

## Future Enhancements

1. Two-Factor Authentication (2FA)
2. Email-based OTP alternative
3. Social login integration
4. Biometric verification
5. Risk-based verification (trust scores)
6. Multi-language email templates
