import nodemailer from 'nodemailer';

// Email and SMS recipients from environment variables
const EMAIL_RECIPIENT = process.env.ENQUIRY_EMAIL_RECIPIENT || process.env.EMAIL_RECIPIENT;
const SMS_RECIPIENTS = process.env.ENQUIRY_SMS_RECIPIENTS 
  ? process.env.ENQUIRY_SMS_RECIPIENTS.split(',').map(phone => phone.trim())
  : (process.env.SMS_RECIPIENTS ? process.env.SMS_RECIPIENTS.split(',').map(phone => phone.trim()) : []);

// Validate required environment variables
if (!EMAIL_RECIPIENT) {
  console.warn('⚠️  WARNING: ENQUIRY_EMAIL_RECIPIENT not set. Email notifications will fail.');
}

// SMS service - simple logging (hardcoded)
const sendSMS = async (phoneNumber, message) => {
  try {
    // Log SMS message (hardcoded - no actual SMS service)
    console.log(`SMS to ${phoneNumber}: ${message}`);
    return true;
  } catch (error) {
    console.error('Error logging SMS:', error);
    return false;
  }
};

// Email configuration
const createEmailTransporter = () => {
  // Configure nodemailer based on your email service
  // Options: Gmail, SendGrid, AWS SES, etc.
  
  // For Gmail (recommended for development)
  const emailUser = process.env.EMAIL_USER;
  const emailPassword = process.env.EMAIL_PASSWORD || process.env.EMAIL_APP_PASSWORD;
  
  if (!emailUser || !emailPassword) {
    throw new Error('EMAIL_USER and EMAIL_PASSWORD must be set in environment variables');
  }
  
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPassword // Use App Password for Gmail
    }
  });

  // For other services, use SMTP configuration:
  /*
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  */
};

const sendEmail = async (to, subject, htmlContent) => {
  try {
    const transporter = createEmailTransporter();
    
    const emailUser = process.env.EMAIL_USER;
    if (!emailUser) {
      throw new Error('EMAIL_USER must be set in environment variables');
    }
    
    const mailOptions = {
      from: emailUser,
      to: to,
      subject: subject,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    // Don't fail the request if email fails
    return false;
  }
};

export const submitEnquiry = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phoneNumber,
      email,
      city,
      state,
      postalCode,
      preferredContact,
      propertyInterest
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !phoneNumber || !postalCode || !propertyInterest) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Prepare enquiry details
    const enquiryDetails = {
      firstName,
      lastName,
      phoneNumber,
      email: email || 'Not provided',
      city: city || 'Not provided',
      state: state || 'Not provided',
      postalCode,
      preferredContact: preferredContact === 'meeting' ? 'Schedule a Meeting' : 'Expecting a Return Call',
      propertyInterest,
      submittedAt: new Date().toISOString()
    };

    // Format message for SMS and Email
    const messageText = `
New Property Enquiry from Shree Ji Associates Website

Name: ${firstName} ${lastName}
Phone: ${phoneNumber}
Email: ${enquiryDetails.email}
Location: ${city}, ${state} - ${postalCode}
Preferred Contact: ${enquiryDetails.preferredContact}
Property Interest: ${propertyInterest}

Submitted on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
    `.trim();

    const emailHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Property Enquiry</h2>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Name:</strong> ${firstName} ${lastName}</p>
          <p><strong>Phone Number:</strong> ${phoneNumber}</p>
          <p><strong>Email:</strong> ${enquiryDetails.email}</p>
          <p><strong>Location:</strong> ${city}, ${state} - ${postalCode}</p>
          <p><strong>Preferred Contact Method:</strong> ${enquiryDetails.preferredContact}</p>
          <p><strong>Property Interest:</strong> ${propertyInterest}</p>
          <p><strong>Submitted On:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
        </div>
        <p style="color: #6b7280; font-size: 14px;">This enquiry was submitted through the Shree Ji Associates website.</p>
      </div>
    `;

    // Send SMS to configured phone numbers (if configured)
    if (SMS_RECIPIENTS && SMS_RECIPIENTS.length > 0) {
      const smsPromises = SMS_RECIPIENTS.map(phone => 
        sendSMS(phone, messageText)
      );
      await Promise.all(smsPromises);
    } else {
      console.log('SMS recipients not configured. Skipping SMS notifications.');
    }

    // Send email to configured recipient
    if (!EMAIL_RECIPIENT) {
      console.error('EMAIL_RECIPIENT not configured. Cannot send email notification.');
      return res.status(500).json({
        success: false,
        message: 'Email service not configured. Please contact administrator.'
      });
    }
    
    await sendEmail(EMAIL_RECIPIENT, `New Property Enquiry - ${firstName} ${lastName}`, emailHTML);

    res.json({
      success: true,
      message: 'Enquiry submitted successfully. We will contact you soon.',
      data: enquiryDetails
    });
  } catch (error) {
    console.error('Error submitting enquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit enquiry. Please try again later.'
    });
  }
};

