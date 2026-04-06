# reCAPTCHA v2 Setup Guide

This guide explains how to properly set up reCAPTCHA v2 with server-side verification for the Dyad contact form.

## 🚨 Important Security Notes

- **Never expose your secret key in frontend code**
- **Always verify reCAPTCHA on the server side**
- **Use environment variables for sensitive keys**

## Step 1: Get reCAPTCHA Keys

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin/)
2. Click **+** to create a new site
3. Fill in the details:
   - **Label**: Dyad Contact Form
   - **reCAPTCHA type**: reCAPTCHA v2 ("I'm not a robot" Checkbox)
   - **Domains**: 
     - `localhost` (for development)
     - `yourdomain.com` (for production)
     - `www.yourdomain.com` (for production)
4. Accept terms and submit
5. Copy your **Site Key** and **Secret Key**

## Step 2: Configure Environment Variables

Create/update your `.env` file:

```env
# reCAPTCHA Configuration
VITE_RECAPTCHA_SITE_KEY=your-site-key-here
RECAPTCHA_SECRET_KEY=your-secret-key-here
```

## Step 3: Frontend Implementation (Already Done)

✅ The frontend is already configured to:
- Display reCAPTCHA widget
- Send token to backend
- Handle verification status

## Step 4: Backend Implementation

### Node.js/Express Example

```javascript
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

app.post('/api/contact-requests', async (req, res) => {
  try {
    const { recaptchaToken, ...formData } = req.body;
    
    // 1. Verify reCAPTCHA
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

    // 2. Check if verification passed
    if (!recaptchaResult.success) {
      return res.status(400).json({
        success: false,
        error: 'reCAPTCHA verification failed',
        details: recaptchaResult['error-codes']
      });
    }

    // 3. Process the contact request
    await sendContactEmail(formData);
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
```

### Python/Flask Example

```python
from flask import Flask, request, jsonify
import requests
import os

app = Flask(__name__)

@app.route('/api/contact-requests', methods=['POST'])
def contact_requests():
    try:
        data = request.get_json()
        recaptcha_token = data.get('recaptchaToken')
        
        # Verify reCAPTCHA
        recaptcha_response = requests.post(
            'https://www.google.com/recaptcha/api/siteverify',
            data={
                'secret': os.environ.get('RECAPTCHA_SECRET_KEY'),
                'response': recaptcha_token
            }
        )
        
        recaptcha_result = recaptcha_response.json()
        
        if not recaptcha_result.get('success'):
            return jsonify({
                'success': False,
                'error': 'reCAPTCHA verification failed'
            }), 400
        
        # Process contact request
        process_contact_form(data)
        
        return jsonify({
            'success': True,
            'message': 'Contact request submitted successfully'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': 'Internal server error'
        }), 500
```

## Step 5: Testing

### Development Testing
- Use your test site key for `localhost`
- The reCAPTCHA should work on your local development server

### Production Testing
1. Deploy to your production domain
2. Update your reCAPTCHA admin console to include your production domain
3. Test the contact form on the live site

## Common Issues & Solutions

### Issue: "Invalid key type"
**Solution**: Make sure you're using reCAPTCHA v2 keys, not v3

### Issue: "Invalid site key"
**Solution**: 
- Check if the site key is correct
- Ensure your domain is registered in reCAPTCHA admin console

### Issue: "Network error"
**Solution**: Check your server's internet connection and firewall settings

### Issue: reCAPTCHA always fails
**Solution**: 
- Verify secret key is correct
- Check server logs for detailed error messages
- Ensure you're sending the token, not the site key

## Security Best Practices

1. **Never expose secret key** in frontend code
2. **Always verify on server** - never trust frontend validation
3. **Set domain restrictions** in reCAPTCHA admin console
4. **Use HTTPS** in production
5. **Monitor verification logs** for suspicious activity
6. **Rate limit** your contact endpoint

## Files Created/Modified

- ✅ `src/pages/ContactUs.tsx` - Updated to send reCAPTCHA token
- ✅ `src/utils/recaptcha.ts` - Verification utility functions
- ✅ `backend-examples/contact-verification.js` - Backend implementation example
- ✅ `.env.example` - Environment variables template
- ✅ `RECAPTCHA_SETUP_GUIDE.md` - This setup guide

## Next Steps

1. Get your actual reCAPTCHA keys from Google
2. Update your `.env` file with the keys
3. Implement server-side verification in your backend
4. Test the complete flow
5. Deploy to production

## Support

If you need help:
- Check Google's [reCAPTCHA documentation](https://developers.google.com/recaptcha/)
- Review the server logs for detailed error messages
- Test with the provided example implementations
