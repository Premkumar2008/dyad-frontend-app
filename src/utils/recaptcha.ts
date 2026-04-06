// Server-side reCAPTCHA verification utility

export interface RecaptchaVerificationResult {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  error_codes?: string[];
}

export const verifyRecaptcha = async (token: string): Promise<RecaptchaVerificationResult> => {
  const secretKey = 'YOUR_SECRET_KEY_HERE'; // Replace with your actual secret key
  
  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    const result = await response.json();
    console.log('reCAPTCHA verification result:', result);
    
    return result;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return { success: false, error_codes: ['network-error'] };
  }
};

// For development/testing - mock verification
export const mockVerifyRecaptcha = async (token: string): Promise<RecaptchaVerificationResult> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // For testing, always return success if token exists
  if (token && token.length > 0) {
    return {
      success: true,
      challenge_ts: new Date().toISOString(),
      hostname: 'localhost'
    };
  }
  
  return {
    success: false,
    error_codes: ['invalid-input-response']
  };
};
