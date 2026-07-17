import { Response } from "express";
import { AuthRequest } from "../types";
import asyncHandler from "../utils/asyncHandler";
import mfaService from "../services/mfa.service";
import { ApiResponse } from "../utils/ApiResponse";

class MfaController {

  // GET /api/v1/mfa/setup
  // Returns QR code for Google Authenticator
  setup = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const result = await mfaService.setupMfa(
        req.user!.id
      );
      ApiResponse.success(res, result.message, {
        qrCodeUrl: result.qrCodeUrl,
      });
    }
  );

  // POST /api/v1/mfa/verify-setup
  // Confirms setup by verifying first token
  verifySetup = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const { token } = req.body;
      const result = await mfaService.verifyAndEnableMfa(
        req.user!.id,
        token
      );
      ApiResponse.success(res, result.message);
    }
  );

  // POST /api/v1/mfa/verify-login
  // Verifies token during login flow
  verifyLogin = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const { userId, token } = req.body;
      const result = await mfaService.verifyMfaLogin(
        userId,
        token
      );
      ApiResponse.success(
        res,
        "MFA verified successfully",
        result
      );
    }
  );

  // POST /api/v1/mfa/disable
  // Disables MFA after verifying token
  disable = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const { token } = req.body;
      const result = await mfaService.disableMfa(
        req.user!.id,
        token
      );
      ApiResponse.success(res, result.message);
    }
  );
}

export default new MfaController();