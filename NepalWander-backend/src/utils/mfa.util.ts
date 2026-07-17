import speakeasy from "speakeasy";
import QRCode from "qrcode";

// ── Generate MFA secret and QR code ──────────────────
export const generateMfaSecret = async (
  email: string
): Promise<{ secret: string; qrCodeUrl: string }> => {
  const secret = speakeasy.generateSecret({
    name: `NepalWander (${email})`,
    issuer: "NepalWander",
    length: 32,
  });

  const qrCodeUrl = await QRCode.toDataURL(
    secret.otpauth_url as string
  );

  return {
    secret: secret.base32,
    qrCodeUrl,
  };
};

// ── Verify TOTP token from authenticator app ──────────
export const verifyMfaToken = (
  secret: string,
  token: string
): boolean => {
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 1, // allow 30 second clock drift
  });
};