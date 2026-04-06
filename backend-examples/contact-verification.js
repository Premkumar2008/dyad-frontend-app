// Example backend implementation for reCAPTCHA verification
// This is what your backend API should look like

const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// Your reCAPTCHA secret key (get this from Google reCAPTCHA admin console)
const RECAPTCHA_SECRET_KEY = '6LffdaksAAAAAK_SECRET_KEY_HERE_REPLACE_WITH_YOUR_ACTUAL_SECRET';

app.post('/api/contact-requests', async (req, res) => {
  try {
    const { recaptchaToken, ...formData } = req.body;
    
    console.log('Received contact request:', formData);
    console.log('reCAPTCHA token:', recaptchaToken);

    // 1. Verify reCAPTCHA token
    if (!recaptchaToken) {
      return res.status(400).json({ 
        success: false, 
        error: 'reCAPTCHA token is required' 
      });
    }

    const recaptchaResponse = await axios.post(
      'https://www.google.com/recaptcha/api/siteverify',
      `secret=${RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const recaptchaResult = recaptchaResponse.data;
    console.log('reCAPTCHA verification:', recaptchaResult);

    // 2. Check if reCAPTCHA verification passed
    if (!recaptchaResult.success) {
      return res.status(400).json({
        success: false,
        error: 'reCAPTCHA verification failed',
        details: recaptchaResult['error-codes']
      });
    }

    // 3. Check hostname (optional but recommended)
    const expectedHostnames = ['localhost', 'yourdomain.com', 'www.yourdomain.com'];
    if (!expectedHostnames.includes(recaptchaResult.hostname)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid hostname for reCAPTCHA'
      });
    }

    // 4. If reCAPTCHA is valid, process the contact request
    console.log('reCAPTCHA verified, processing contact request...');

    // Your existing contact form processing logic here
    // For example: send email, save to database, etc.
    
    // Example: Send email (you'd implement this)
    await sendContactEmail(formData);
    
    // Example: Save to database (you'd implement this)
    await saveContactRequest(formData);

    res.json({
      success: true,
      message: 'Contact request submitted successfully'
    });

  } catch (error) {
    console.error('Contact request error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Helper functions (implement these based on your needs)
async function sendContactEmail(formData) {
  // Implement your email sending logic here
  console.log('Sending email with data:', formData);
  // Example using nodemailer, sendgrid, etc.
}

async function saveContactRequest(formData) {
  // Implement your database saving logic here
  console.log('Saving contact request:', formData);
  // Example using MongoDB, PostgreSQL, etc.
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
