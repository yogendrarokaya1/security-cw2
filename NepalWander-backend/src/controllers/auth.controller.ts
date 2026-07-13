import { Request, Response } from "express";
import authService from "../services/auth.service";
import { ApiResponse } from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";
import { AuthRequest } from "../types";

class AuthController {

  register = asyncHandler(
    async (req: Request, res: Response) => {
      const result = await authService.register(req.body);
      ApiResponse.created(res, result.message);
    }
  );


  verifyOtp = asyncHandler(
    async (req: Request, res: Response) => {
      const result = await authService.verifyOtp(req.body);

      if (!result.requiresApproval && result.refreshToken) {
        res.cookie("refreshToken", result.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
      }

      ApiResponse.success(res, result.message, {
        requiresApproval: result.requiresApproval,
        accessToken: result.accessToken,
        user: result.user,
      });
    }
  );

  login = asyncHandler(
    async (req: Request, res: Response) => {
      const result = await authService.login(req.body);

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      ApiResponse.success(res, "Login successful", {
        accessToken: result.accessToken,
        user: result.user,
      });
    }
  );


  forgotPassword = asyncHandler(
    async (req: Request, res: Response) => {
      const result = await authService.forgotPassword(req.body);
      ApiResponse.success(res, result.message);
    }
  );


  resetPassword = asyncHandler(
    async (req: Request, res: Response) => {
      const result = await authService.resetPassword(req.body);
      ApiResponse.success(res, result.message);
    }
  );


  resendOtp = asyncHandler(
    async (req: Request, res: Response) => {
      const result = await authService.resendOtp(
        req.body.email
      );
      ApiResponse.success(res, result.message);
    }
  );


  logout = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      res.clearCookie("refreshToken");
      if (req.user) {
        await authService.logout(req.user.id);
      }
      ApiResponse.success(res, "Logged out successfully");
    }
  );


updateProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = await authService.updateProfile(req.user!.id, req.body);
    ApiResponse.success(res, "Profile updated successfully", user);
  }
);


  getMe = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const user = await authService.getMe(req.user!.id);
      ApiResponse.success(res, "Profile fetched", user);
    }
  );
}

export default new AuthController();