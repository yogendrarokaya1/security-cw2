import { Response } from "express";
import guideService from "../services/guide.service";
import { ApiResponse } from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";
import { AuthRequest } from "../types";
import {
  createGuideProfileSchema,
  updateGuideProfileSchema,
  addReviewSchema,
  guideQuerySchema,
} from "../validators/guide.validator";
import validate from "../middlewares/validate.middleware";

// Helper
const getParam = (param: string | string[]): string => {
  return Array.isArray(param) ? param[0] : param;
};

class GuideController {

  // POST /api/v1/guides/profile
  createProfile = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const guide = await guideService.createProfile(
        req.body,
        req.user!.id
      );
      ApiResponse.created(
        res,
        "Guide profile created successfully",
        guide
      );
    }
  );

  // GET /api/v1/guides
  getAll = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const query = guideQuerySchema.parse(req.query);
      const result = await guideService.getAll(query);
      ApiResponse.success(res, "Guides fetched", result);
    }
  );

  // GET /api/v1/guides/profile/me
  getMyProfile = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const guide = await guideService.getMyProfile(
        req.user!.id
      );
      ApiResponse.success(
        res,
        "Guide profile fetched",
        guide
      );
    }
  );

  // GET /api/v1/guides/:id
  getById = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const id = getParam(req.params.id);
      const guide = await guideService.getById(id);
      ApiResponse.success(res, "Guide fetched", guide);
    }
  );

  // PUT /api/v1/guides/profile
  updateProfile = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const guide = await guideService.updateProfile(
        req.user!.id,
        req.body
      );
      ApiResponse.success(
        res,
        "Guide profile updated",
        guide
      );
    }
  );

  // POST /api/v1/guides/review
  addReview = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const guide = await guideService.addReview(
        req.body,
        req.user!.id
      );
      ApiResponse.success(
        res,
        "Review added successfully",
        guide
      );
    }
  );

  // PATCH /api/v1/guides/profile/availability
  toggleAvailability = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const result = await guideService.toggleAvailability(
        req.user!.id
      );
      ApiResponse.success(res, result.message, result.guide);
    }
  );

  // PATCH /api/v1/admin/guides/:id/verify-nma
  verifyNma = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const id = getParam(req.params.id);
      const result = await guideService.verifyNma(id);
      ApiResponse.success(
        res,
        result.message,
        result.guide
      );
    }
  );

  // PATCH /api/v1/admin/guides/:id/toggle-status
  toggleStatus = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const id = getParam(req.params.id);
      const result = await guideService.toggleStatus(id);
      ApiResponse.success(
        res,
        result.message,
        result.guide
      );
    }
  );

  adminCreateProfile = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const guide = await guideService.adminCreateProfile(req.body);
    ApiResponse.created(res, "Guide profile created successfully", guide);
  }
);
}

export default new GuideController();