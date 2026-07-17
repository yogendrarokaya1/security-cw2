import { UserRepository } from "../repositories/user.repository";
import {
  generateMfaSecret,
  verifyMfaToken,
} from "../utils/mfa.util";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../middlewares/error.middleware";
import {
  logAuth,
  logSecurity,
} from "../utils/logger.util";

const userRepository = new UserRepository();

class MfaService {

  // ── Step 1: Generate secret + QR code ────────────────
  async setupMfa(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    if (user.mfaEnabled) {
      throw new BadRequestError(
        "MFA is already enabled on your account"
      );
    }

    const { secret, qrCodeUrl } =
      await generateMfaSecret(user.email);

    await userRepository.saveMfaTempSecret(userId, secret);

    logAuth("MFA_SETUP_INITIATED", {
      userId,
      email: user.email,
      success: true,
    });

    return {
      qrCodeUrl,
      message:
        "Scan the QR code with Google Authenticator then verify with a 6-digit code",
    };
  }

  // ── Step 2: Verify code and enable MFA ───────────────
  async verifyAndEnableMfa(
    userId: string,
    token: string
  ) {
    const user =
      await userRepository.findByIdWithMfa(userId);
    if (!user) throw new NotFoundError("User not found");

    if (!user.mfaTempSecret) {
      throw new BadRequestError(
        "No MFA setup in progress. Please start setup first."
      );
    }

    const isValid = verifyMfaToken(
      user.mfaTempSecret,
      token
    );

    if (!isValid) {
      logSecurity("MFA_ENABLE_FAILED", {
        userId,
        reason: "Invalid TOTP token during MFA setup",
      });
      throw new UnauthorizedError(
        "Invalid authenticator code. Please try again."
      );
    }

    await userRepository.enableMfa(
      userId,
      user.mfaTempSecret
    );

    logAuth("MFA_ENABLED", {
      userId,
      email: user.email,
      success: true,
    });

    return {
      message:
        "MFA enabled successfully. You will need your authenticator app on every login.",
    };
  }

  // ── Step 3: Verify MFA token on login ────────────────
  async verifyMfaLogin(userId: string, token: string) {
    const user =
      await userRepository.findByIdWithMfa(userId);
    if (!user) throw new NotFoundError("User not found");

    if (!user.mfaEnabled || !user.mfaSecret) {
      throw new BadRequestError("MFA is not enabled");
    }

    const isValid = verifyMfaToken(
      user.mfaSecret,
      token
    );

    if (!isValid) {
      logSecurity("MFA_LOGIN_FAILED", {
        userId,
        email: user.email,
        reason: "Invalid TOTP token during login",
      });
      throw new UnauthorizedError(
        "Invalid authenticator code. Please try again."
      );
    }

    logAuth("MFA_LOGIN_SUCCESS", {
      userId,
      email: user.email,
      success: true,
    });

    return { verified: true };
  }

  // ── Disable MFA ───────────────────────────────────────
  async disableMfa(userId: string, token: string) {
    const user =
      await userRepository.findByIdWithMfa(userId);
    if (!user) throw new NotFoundError("User not found");

    if (!user.mfaEnabled || !user.mfaSecret) {
      throw new BadRequestError(
        "MFA is not enabled on your account"
      );
    }

    const isValid = verifyMfaToken(
      user.mfaSecret,
      token
    );

    if (!isValid) {
      throw new UnauthorizedError(
        "Invalid authenticator code"
      );
    }

    await userRepository.disableMfa(userId);

    logAuth("MFA_DISABLED", {
      userId,
      email: user.email,
      success: true,
    });

    return { message: "MFA disabled successfully." };
  }
}

export default new MfaService();