import nodemailer from "nodemailer";
import { ENV } from "../config/env";

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: ENV.EMAIL_HOST,
      port: ENV.EMAIL_PORT,
      secure: false,
      auth: {
        user: ENV.EMAIL_USER,
        pass: ENV.EMAIL_PASS,
      },
    });
  }

  async sendVerificationEmail(
    to: string,
    firstName: string,
    otp: string
  ): Promise<void> {
    await this.transporter.sendMail({
      from: `"NepalWander" <${ENV.EMAIL_USER}>`,
      to,
      subject: "Verify Your NepalWander Account",
      html: `
        <div style="font-family:sans-serif;max-width:520px;
                    margin:auto;padding:24px">
          <h2 style="color:#1D9E75">
            Welcome to NepalWander, ${firstName}!
          </h2>
          <p>Use the OTP below to verify your email:</p>
          <div style="background:#f5f5f5;padding:32px;
                      border-radius:8px;text-align:center;
                      margin:24px 0">
            <h1 style="color:#0D1B2A;letter-spacing:16px;
                       font-size:36px;margin:0">
              ${otp}
            </h1>
          </div>
          <p style="color:#888;font-size:12px">
            Valid for <strong>10 minutes</strong>.
            Do not share with anyone.
          </p>
        </div>
      `,
    });
  }

  async sendPasswordResetEmail(
    to: string,
    firstName: string,
    otp: string
  ): Promise<void> {
    await this.transporter.sendMail({
      from: `"NepalWander" <${ENV.EMAIL_USER}>`,
      to,
      subject: "Reset Your NepalWander Password",
      html: `
        <div style="font-family:sans-serif;max-width:520px;
                    margin:auto;padding:24px">
          <h2 style="color:#1D9E75">Password Reset</h2>
          <p>Hi ${firstName}, use this OTP to reset your password:</p>
          <div style="background:#f5f5f5;padding:32px;
                      border-radius:8px;text-align:center;
                      margin:24px 0">
            <h1 style="color:#0D1B2A;letter-spacing:16px;
                       font-size:36px;margin:0">
              ${otp}
            </h1>
          </div>
          <p style="color:#888;font-size:12px">
            Expires in <strong>10 minutes</strong>.
          </p>
        </div>
      `,
    });
  }

  async sendAdminWelcomeEmail(
    to: string,
    firstName: string,
    password: string
  ): Promise<void> {
    await this.transporter.sendMail({
      from: `"NepalWander" <${ENV.EMAIL_USER}>`,
      to,
      subject: "Your NepalWander Admin Account",
      html: `
        <div style="font-family:sans-serif;max-width:520px;
                    margin:auto;padding:24px">
          <h2 style="color:#1D9E75">
            Welcome to NepalWander Admin Panel
          </h2>
          <p>Hi ${firstName}, your admin account has been created
             by Super Admin.</p>
          <div style="background:#f5f5f5;padding:24px;
                      border-radius:8px;margin:24px 0">
            <p style="margin:0 0 8px">
              <strong>Email:</strong> ${to}
            </p>
            <p style="margin:0">
              <strong>Password:</strong> ${password}
            </p>
          </div>
          <p style="color:#D85A30;font-weight:bold">
            Please change your password after first login.
          </p>
          <p>
            Login at:
            <a href="${ENV.CLIENT_URL}/admin/login">
              ${ENV.CLIENT_URL}/admin/login
            </a>
          </p>
        </div>
      `,
    });
  }

  async sendAccountApprovedEmail(
    to: string,
    firstName: string,
    role: string
  ): Promise<void> {
    await this.transporter.sendMail({
      from: `"NepalWander" <${ENV.EMAIL_USER}>`,
      to,
      subject: "Your NepalWander Account is Approved!",
      html: `
        <div style="font-family:sans-serif;max-width:520px;
                    margin:auto;padding:24px">
          <h2 style="color:#1D9E75">
            Account Approved! 
          </h2>
          <p>Hi ${firstName}, your <strong>${role}</strong>
             account has been approved by our admin team.</p>
          <p>You can now login to NepalWander and start
             using all ${role} features.</p>
          <a href="${ENV.CLIENT_URL}/login"
             style="display:inline-block;margin-top:16px;
                    background:#1D9E75;color:#fff;
                    padding:12px 24px;border-radius:6px;
                    text-decoration:none;font-weight:bold">
            Login Now →
          </a>
        </div>
      `,
    });
  }

  async sendAccountRejectedEmail(
    to: string,
    firstName: string,
    role: string,
    reason: string
  ): Promise<void> {
    await this.transporter.sendMail({
      from: `"NepalWander" <${ENV.EMAIL_USER}>`,
      to,
      subject: "NepalWander Account Application Update",
      html: `
        <div style="font-family:sans-serif;max-width:520px;
                    margin:auto;padding:24px">
          <h2 style="color:#D85A30">
            Application Update
          </h2>
          <p>Hi ${firstName}, unfortunately your
             <strong>${role}</strong> account application
             was not approved.</p>
          <div style="background:#fff5f5;padding:16px;
                      border-radius:8px;border-left:4px solid #D85A30;
                      margin:16px 0">
            <p style="margin:0">
              <strong>Reason:</strong> ${reason}
            </p>
          </div>
          <p>If you have questions, contact us at
             <a href="mailto:support@nepalwander.com">
               support@nepalwander.com
             </a>
          </p>
        </div>
      `,
    });
  }
}

export default new EmailService();