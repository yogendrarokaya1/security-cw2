import { Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.util";
import { AuthRequest, UserRole } from "../types";
import {
  UnauthorizedError,
  ForbiddenError,
} from "./error.middleware";
import asyncHandler from "../utils/asyncHandler";
import { UserModel } from "../models/User.model";

// ── Must be logged in ─────────────────────────────────
export const protect = asyncHandler(
  async (
    req: AuthRequest,
    _res: Response,
    next: NextFunction
  ) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("No token provided");
    }

    const token = authHeader.split(" ")[1];

    const decoded = verifyAccessToken(token);

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  }
);

// ── Restrict to specific roles ────────────────────────
export const restrictTo = (...roles: UserRole[]) =>
  asyncHandler(
    async (
      req: AuthRequest,
      _res: Response,
      next: NextFunction
    ) => {
      if (!req.user || !roles.includes(req.user.role)) {
        throw new ForbiddenError(
          "You do not have permission to perform this action"
        );
      }
      next();
    }
  );

// ── Super Admin only ──────────────────────────────────
export const isSuperAdmin = asyncHandler(
  async (
    req: AuthRequest,
    _res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      throw new UnauthorizedError("No token provided");
    }

    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenError("Access denied");
    }

    const user = await UserModel.findById(req.user.id);

    if (!user || !user.isSuperAdmin) {
      throw new ForbiddenError(
        "Only Super Admin can perform this action"
      );
    }

    next();
  }
);