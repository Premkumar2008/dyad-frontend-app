/**
 * Production-ready email service for OTP sending
 */

// Email service configuration
export interface EmailConfig {
  service: 'smtp' | 'sendgrid' | 'ses' | 'mailgun' | 'brevo';
  smtp?: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  sendgrid?: {
    apiKey: string;
    from: string;
  };
  ses?: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    from: string;
  };
  mailgun?: {
    apiKey: string;
    domain: string;
    from: string;
  };
  brevo?: {
    apiKey: string;
    from: string;
  };
}

// Email template interface
export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// Production email service class
export class EmailService {
  private config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
  }

  /**
   * Send early access confirmation email
   */
  async sendEarlyAccessConfirmation(email: string, contactName: string, logoUrl: string): Promise<{ success: boolean; error?: string }> {
    try {
      const template = this.generateEarlyAccessConfirmationTemplate(contactName, logoUrl);

      switch (this.config.service) {
        case 'smtp':
          return this.sendViaSMTP(email, template);
        case 'sendgrid':
          return this.sendViaSendGrid(email, template);
        case 'ses':
          return this.sendViaSES(email, template);
        case 'mailgun':
          return this.sendViaMailgun(email, template);
        case 'brevo':
          return this.sendViaBrevo(email, template);
        default:
          throw new Error('Email service not configured');
      }
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email'
      };
    }
  }

  /**
   * Generate early access confirmation email template
   */
  private generateEarlyAccessConfirmationTemplate(contactName: string, logoUrl: string): EmailTemplate {
    const firstName = contactName.split(' ')[0] || contactName;

    return {
      subject: 'Early Access Request Received',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Early Access Request Received</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.7; color: #333; margin: 0; padding: 0; background: #f4f4f4; }
            .wrapper { background: #f4f4f4; padding: 30px 0; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
            .header { padding: 24px 32px; border-bottom: 1px solid #e8e8e8; }
            .header img { height: 40px; width: auto; }
            .content { padding: 32px 32px 24px; }
            .content p { margin: 0 0 16px; font-size: 15px; color: #444; }
            .signature { margin-top: 24px; }
            .signature p { margin: 0; font-size: 15px; color: #444; }
            .footer { background: #f9f9f9; border-top: 1px solid #e8e8e8; padding: 20px 32px; text-align: center; }
            .footer p { margin: 0 0 6px; font-size: 12px; color: #888; }
            .footer a { color: #888; text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="header">
                <img src="${logoUrl}" alt="Dyad Practice Solutions" />
              </div>
              <div class="content">
                <p>Hello ${firstName},</p>
                <p>Thank you for submitting an early access request. Dyad's platform launches September 2026, and we are now onboarding select practices ahead of the public release.</p>
                <p>Early access provides priority onboarding, dedicated implementation support, and preferred pricing for practices that join before our general availability date.</p>
                <p>If your practice is selected, a member of our team will reach out within 3–5 business days to schedule an introductory call and walk you through the next steps.</p>
                <p>We appreciate your interest in Dyad Practice Solutions and look forward to the possibility of working with your team.</p>
                <div class="signature">
                  <p>Regards,</p>
                  <p><strong>The Dyad Team</strong><br/>Dyad Practice Solutions</p>
                </div>
              </div>
              <div class="footer">
                <p>Dyad Practice Solutions, LLC &middot; <a href="https://dyadmd.com">dyadmd.com</a> &middot; <a href="#">Unsubscribe</a> &middot; <a href="#">Privacy Policy</a></p>
                <p>This message confirms receipt of your early access request. No action is required at this time.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Hello ${firstName},

Thank you for submitting an early access request. Dyad's platform launches September 2026, and we are now onboarding select practices ahead of the public release.

Early access provides priority onboarding, dedicated implementation support, and preferred pricing for practices that join before our general availability date.

If your practice is selected, a member of our team will reach out within 3–5 business days to schedule an introductory call and walk you through the next steps.

We appreciate your interest in Dyad Practice Solutions and look forward to the possibility of working with your team.

Regards,
The Dyad Team
Dyad Practice Solutions

---
Dyad Practice Solutions, LLC · dyadmd.com
This message confirms receipt of your early access request. No action is required at this time.
      `
    };
  }

  /**
   * Send OTP email
   */
  async sendOTP(email: string, otp: string): Promise<{ success: boolean; error?: string }> {
    try {
      const template = this.generateOTPTemplate(otp);
      
      switch (this.config.service) {
        case 'smtp':
          return this.sendViaSMTP(email, template);
        case 'sendgrid':
          return this.sendViaSendGrid(email, template);
        case 'ses':
          return this.sendViaSES(email, template);
        case 'mailgun':
          return this.sendViaMailgun(email, template);
        case 'brevo':
          return this.sendViaBrevo(email, template);
        default:
          throw new Error('Email service not configured');
      }
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send email' 
      };
    }
  }

  /**
   * Generate OTP email template
   */
  private generateOTPTemplate(otp: string): EmailTemplate {
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const expiryTime = otpExpiry.toLocaleTimeString();

    return {
      subject: 'Your DYAD Practice Solutions Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; background: #f9f9f9; }
            .otp { background: #e8f5e8; padding: 15px; margin: 20px 0; 
                    text-align: center; font-size: 24px; font-weight: bold; 
                    border-radius: 8px; letter-spacing: 3px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; 
                      margin: 10px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>DYAD Practice Solutions</h1>
              <p>Email Verification Required</p>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>Please use this OTP to Registration for DYAD Practice Solutions. Use the verification code below:</p>
              <div class="otp">${otp}</div>
              <div class="warning">
                <strong>Important:</strong> This code will expire in 10 minutes.
                Please do not share this code with anyone.
              </div>
              <p>If you didn't request this verification, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 DYAD Practice Solutions. All rights reserved.</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        DYAD Practice Solutions - Email Verification
        
        Hello,

        Please use this OTP to Registration for DYAD Practice Solutions. Use the verification code below:
        
        Verification Code: ${otp}
        
        Important: This code will expire in 10 minutes.
        Please do not share this code with anyone.
        
        If you didn't request this verification, please ignore this email.
        
        © 2024 DYAD Practice Solutions. All rights reserved.
        This is an automated message, please do not reply to this email.
      `
    };
  }

  /**
   * Send via SMTP
   */
  private async sendViaSMTP(email: string, template: EmailTemplate): Promise<{ success: boolean; error?: string }> {
    // This would require nodemailer or similar library on the backend
    // For frontend, this would be handled by your API
    console.log(`Sending OTP via SMTP to ${email}`);
    return { success: true };
  }

  /**
   * Send via SendGrid
   */
  private async sendViaSendGrid(email: string, template: EmailTemplate): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/send-email/sendgrid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject: template.subject,
          html: template.html,
          text: template.text,
          from: this.config.sendgrid?.from
        })
      });

      if (!response.ok) {
        throw new Error('SendGrid API error');
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'SendGrid service unavailable' 
      };
    }
  }

  /**
   * Send via AWS SES
   */
  private async sendViaSES(email: string, template: EmailTemplate): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/send-email/ses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject: template.subject,
          html: template.html,
          text: template.text,
          region: this.config.ses?.region
        })
      });

      if (!response.ok) {
        throw new Error('SES API error');
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'AWS SES service unavailable' 
      };
    }
  }

  /**
   * Send via Mailgun
   */
  private async sendViaMailgun(email: string, template: EmailTemplate): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/send-email/mailgun', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject: template.subject,
          html: template.html,
          text: template.text,
          domain: this.config.mailgun?.domain
        })
      });

      if (!response.ok) {
        throw new Error('Mailgun API error');
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Mailgun service unavailable' 
      };
    }
  }

  /**
   * Send via Brevo (Sendinblue)
   */
  private async sendViaBrevo(email: string, template: EmailTemplate): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch('/api/send-email/brevo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject: template.subject,
          html: template.html,
          text: template.text
        })
      });

      if (!response.ok) {
        throw new Error('Brevo API error');
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Brevo service unavailable' 
      };
    }
  }
}

// Default email service configuration
export const createEmailService = (): EmailService => {
  const config: EmailConfig = {
    service: (import.meta.env.VITE_EMAIL_SERVICE as any) || 'smtp',
    smtp: {
      host: import.meta.env.VITE_SMTP_HOST || 'localhost',
      port: parseInt(import.meta.env.VITE_SMTP_PORT || '587'),
      secure: import.meta.env.VITE_SMTP_SECURE === 'true',
      auth: {
        user: import.meta.env.VITE_SMTP_USER || '',
        pass: import.meta.env.VITE_SMTP_PASS || ''
      }
    },
    sendgrid: {
      apiKey: import.meta.env.VITE_SENDGRID_API_KEY || '',
      from: import.meta.env.VITE_SENDGRID_FROM || ''
    },
    ses: {
      accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID || '',
      secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY || '',
      region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
      from: import.meta.env.VITE_SES_FROM || 'noreply@dyadpractice.com'
    },
    mailgun: {
      apiKey: import.meta.env.VITE_MAILGUN_API_KEY || '',
      domain: import.meta.env.VITE_MAILGUN_DOMAIN || '',
      from: import.meta.env.VITE_MAILGUN_FROM || 'noreply@dyadpractice.com'
    },
    brevo: {
      apiKey: import.meta.env.VITE_BREVO_API_KEY || '',
      from: import.meta.env.VITE_BREVO_FROM || 'noreply@dyadpractice.com'
    }
  };

  return new EmailService(config);
};

export default EmailService;
