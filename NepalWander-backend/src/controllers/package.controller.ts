import { Request, Response } from "express";
import packageService from "../services/package.service";
import { ApiResponse } from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";
import { AuthRequest } from "../types";
import { packageQuerySchema } from "../validators/package.validator";

// Helper to get string param safely
const getParam = (param: string | string[]): string => {
  return Array.isArray(param) ? param[0] : param;
};

class PackageController {

  // GET /api/v1/packages
  getAll = asyncHandler(
    async (req: Request, res: Response) => {
      const query = packageQuerySchema.parse(req.query);
      const result = await packageService.getAll(query);
      ApiResponse.success(res, "Packages fetched", result);
    }
  );

  // GET /api/v1/packages/featured
  getFeatured = asyncHandler(
    async (_req: Request, res: Response) => {
      const packages = await packageService.getFeatured();
      ApiResponse.success(
        res,
        "Featured packages fetched",
        packages
      );
    }
  );

  // GET /api/v1/packages/:id
  getById = asyncHandler(
    async (req: Request, res: Response) => {
      const id = getParam(req.params.id);
      const pkg = await packageService.getById(id);
      ApiResponse.success(res, "Package fetched", pkg);
    }
  );

  // GET /api/v1/packages/slug/:slug
  getBySlug = asyncHandler(
    async (req: Request, res: Response) => {
      const slug = getParam(req.params.slug);
      const pkg = await packageService.getBySlug(slug);
      ApiResponse.success(res, "Package fetched", pkg);
    }
  );

  // GET /api/v1/packages/destination/:destinationId
  getByDestination = asyncHandler(
    async (req: Request, res: Response) => {
      const destinationId = getParam(
        req.params.destinationId
      );
      const packages =
        await packageService.getByDestination(destinationId);
      ApiResponse.success(res, "Packages fetched", packages);
    }
  );

  // POST /api/v1/packages
  create = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const pkg = await packageService.create(
        req.body,
        req.user!.id
      );
      ApiResponse.created(
        res,
        "Package created successfully",
        pkg
      );
    }
  );

  // PUT /api/v1/packages/:id
  update = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const id = getParam(req.params.id);
      const pkg = await packageService.update(id, req.body);
      ApiResponse.success(
        res,
        "Package updated successfully",
        pkg
      );
    }
  );

  // DELETE /api/v1/packages/:id
  delete = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const id = getParam(req.params.id);
      const result = await packageService.delete(id);
      ApiResponse.success(res, result.message);
    }
  );
}

export default new PackageController();