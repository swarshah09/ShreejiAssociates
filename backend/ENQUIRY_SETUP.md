# Enquiry Form Setup Guide

The enquiry form sends notifications via SMS and Email when a user submits an enquiry.

## Email Configuration (Required)

The form sends emails using nodemailer. To configure email:

1. **For Gmail (Recommended for development):**
   - Go to your Google Account settings
   - Enable 2-Step Verification
   - Generate an App Password: https://myaccount.google.com/apppasswords
   - Add to your `.env` file:
   ```env
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your-app-password-here
   ```

2. **For other email services (SMTP):**
   Add to your `.env` file:
   ```env
   EMAIL_USER=your-email@example.com
   EMAIL_PASSWORD=your-password
   SMTP_HOST=smtp.example.com
   SMTP_PORT=587
   ```

## SMS Configuration (Optional)

SMS notifications are currently set to log to console. To enable actual SMS sending:

### Option 1: Using Twilio (Recommended)

1. Sign up at https://www.twilio.com/
2. Get your Account SID, Auth Token, and Phone Number
3. Install Twilio SDK:
   ```bash
   npm install twilio
   ```
   NHP4HCRBRHVVHMDMMP9MLTQK
4. Uncomment the Twilio code in `backend/src/controllers/enquiryController.js`
5. Add to your `.env` file:
   ```env
   TWILIO_ACCOUNT_SID=your-account-sid
   TWILIO_AUTH_TOKEN=your-auth-token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

### Option 2: Using SMS Gateway (MSG91, TextLocal, etc.)

1. Sign up with your preferred SMS gateway service
2. Get API credentials
3. Update the `sendSMS` function in `backend/src/controllers/enquiryController.js` with your gateway's API

## Recipient Configuration

Configure recipients via environment variables in `.env`:

```env
ENQUIRY_EMAIL_RECIPIENT=recipient@example.com
ENQUIRY_SMS_RECIPIENTS=+1234567890,+0987654321
```

**Note:** 
- `ENQUIRY_EMAIL_RECIPIENT` is **required** - enquiry form will fail if not set
- `ENQUIRY_SMS_RECIPIENTS` is **optional** - comma-separated phone numbers
- If not set, the system will log warnings and email sending will fail

## Testing

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Submit a test enquiry from the frontend

3. Check:
   - Console logs for SMS notifications
   - Email inbox for email notifications

