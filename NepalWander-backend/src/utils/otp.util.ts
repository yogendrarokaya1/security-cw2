import crypto from "crypto";

interface OtpResult {
  otp: string;
  otpExpires: Date;
}

export const generateOtp = (): OtpResult => {
  const otp = crypto.randomInt(100000, 999999).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  return { otp, otpExpires };
};