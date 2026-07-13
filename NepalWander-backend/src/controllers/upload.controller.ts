import { Response } from "express";
import { AuthRequest } from "../types";
import asyncHandler from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { uploadToCloudinary } from "../services/claudinary.service";

class UploadController {
  // POST /api/v1/upload
  uploadImage = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      if (!req.file) {
        return ApiResponse.error(res, "No file provided", 400);
      }

      const folder = (req.query.folder as string) || "nepalwander";
      const url = await uploadToCloudinary(req.file.buffer, folder);

      ApiResponse.success(res, "Image uploaded successfully", { url });
    }
  );

  // POST /api/v1/upload/multiple
  uploadMultiple = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return ApiResponse.error(res, "No files provided", 400);
      }

      const folder = (req.query.folder as string) || "nepalwander";
      const urls = await Promise.all(
        req.files.map((file) => uploadToCloudinary(file.buffer, folder))
      );

      ApiResponse.success(res, "Images uploaded successfully", { urls });
    }
  );
}

export default new UploadController();