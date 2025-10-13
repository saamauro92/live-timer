import { Resend } from "resend";
import { logger } from "../utils/logger";

const resend = new Resend(process.env.RESEND_API_KEY);

export class EmailService {
  private static fromEmail = process.env.FROM_EMAIL || "noreply@livetimer.com";
  private static appUrl = process.env.APP_URL || "http://localhost:3000";

  static async sendVerificationEmail(email: string, name: string, verificationToken: string): Promise<boolean> {
    try {
      const verificationUrl = `${this.appUrl}/verify-email?token=${verificationToken}`;

      const { data, error } = await resend.emails.send({
        from: this.fromEmail,
        to: [email],
        subject: "Verify your Live Timer account",
        html: this.getVerificationEmailTemplate(name, verificationUrl),
      });

      if (error) {
        logger.error("Failed to send verification email:", error);
        return false;
      }

      logger.info(`Verification email sent to ${email}, message ID: ${data?.id}`);
      return true;
    } catch (error) {
      logger.error("Error sending verification email:", error);
      return false;
    }
  }

  static async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    try {
      const { data, error } = await resend.emails.send({
        from: this.fromEmail,
        to: [email],
        subject: "Welcome to Live Timer!",
        html: this.getWelcomeEmailTemplate(name),
      });

      if (error) {
        logger.error("Failed to send welcome email:", error);
        return false;
      }

      logger.info(`Welcome email sent to ${email}, message ID: ${data?.id}`);
      return true;
    } catch (error) {
      logger.error("Error sending welcome email:", error);
      return false;
    }
  }

  private static getVerificationEmailTemplate(name: string, verificationUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email - Live Timer</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f8fafc;
            }
            .container {
              background: white;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              background: #2563eb;
              color: white;
              width: 60px;
              height: 60px;
              border-radius: 12px;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 20px;
            }
            h1 {
              color: #1f2937;
              margin: 0;
              font-size: 28px;
            }
            .content {
              margin-bottom: 30px;
            }
            p {
              margin-bottom: 20px;
              font-size: 16px;
            }
            .button {
              display: inline-block;
              background: #2563eb;
              color: white !important;
              padding: 16px 32px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              font-size: 16px;
              text-align: center;
              margin: 20px 0;
              border: none;
              mso-padding-alt: 0;
            }
            .button:hover {
              background: #1d4ed8;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 14px;
            }
            .security-note {
              background: #fef3c7;
              border: 1px solid #f59e0b;
              border-radius: 8px;
              padding: 16px;
              margin: 20px 0;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">LT</div>
              <h1>Verify Your Email</h1>
            </div>
            
            <div class="content">
              <p>Hi ${name},</p>
              
              <p>Welcome to Live Timer! We're excited to have you on board. To get started, please verify your email address by clicking the button below:</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button" style="display: inline-block; background: #2563eb; color: white !important; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; text-align: center; margin: 20px 0; border: none;">Verify Email Address</a>
              </div>
              
              <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #2563eb;">${verificationUrl}</p>
              
              <div class="security-note">
                <strong>Security Note:</strong> This verification link will expire in 24 hours. If you didn't create an account with Live Timer, you can safely ignore this email.
              </div>
              
              <p>Once verified, you'll be able to:</p>
              <ul>
                <li>Create and manage timer rooms</li>
                <li>Share live timers with your team</li>
                <li>Access all premium features</li>
              </ul>
            </div>
            
            <div class="footer">
              <p>This email was sent by Live Timer. If you have any questions, please contact our support team.</p>
              <p>&copy; 2024 Live Timer. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private static getWelcomeEmailTemplate(name: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Live Timer!</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f8fafc;
            }
            .container {
              background: white;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              background: #2563eb;
              color: white;
              width: 60px;
              height: 60px;
              border-radius: 12px;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 20px;
            }
            h1 {
              color: #1f2937;
              margin: 0;
              font-size: 28px;
            }
            .content {
              margin-bottom: 30px;
            }
            p {
              margin-bottom: 20px;
              font-size: 16px;
            }
            .button {
              display: inline-block;
              background: #2563eb;
              color: white !important;
              padding: 16px 32px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              font-size: 16px;
              text-align: center;
              margin: 20px 0;
              border: none;
              mso-padding-alt: 0;
            }
            .button:hover {
              background: #1d4ed8;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 14px;
            }
            .feature-list {
              background: #f8fafc;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .feature-list h3 {
              margin-top: 0;
              color: #1f2937;
            }
            .feature-list ul {
              margin: 0;
              padding-left: 20px;
            }
            .feature-list li {
              margin-bottom: 8px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">LT</div>
              <h1>Welcome to Live Timer!</h1>
            </div>
            
            <div class="content">
              <p>Hi ${name},</p>
              
              <p>🎉 Congratulations! Your email has been verified and your Live Timer account is now active.</p>
              
              <p>You're all set to start creating and sharing live timers with your team. Here's what you can do:</p>
              
              <div class="feature-list">
                <h3>🚀 Get Started</h3>
                <ul>
                  <li><strong>Create Rooms:</strong> Set up private timer rooms for your team</li>
                  <li><strong>Add Timers:</strong> Create custom countdown timers for meetings, presentations, and events</li>
                  <li><strong>Share Live:</strong> Get shareable links that anyone can view on any device</li>
                  <li><strong>Real-time Sync:</strong> All viewers see timer updates instantly</li>
                </ul>
              </div>
              
              <div style="text-align: center;">
                <a href="${this.appUrl}/rooms" class="button" style="display: inline-block; background: #2563eb; color: white !important; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; text-align: center; margin: 20px 0; border: none;">Create Your First Room</a>
              </div>
              
              <p>Need help getting started? Check out our quick guide on the homepage or reach out to our support team.</p>
              
              <p>Happy timing!</p>
              <p>The Live Timer Team</p>
            </div>
            
            <div class="footer">
              <p>This email was sent by Live Timer. If you have any questions, please contact our support team.</p>
              <p>&copy; 2024 Live Timer. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
