import { Request, Response } from "express";
import destinationService from "../services/destination.service";
import { ApiResponse } from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";
import { AuthRequest } from "../types";
import { destinationQuerySchema } from "../validators/destination.validator";

// Helper to get string param safely
const getParam = (param: string | string[]): string => {
  return Array.isArray(param) ? param[0] : param;
};

class DestinationController {

  // GET /api/v1/destinations
  getAll = asyncHandler(
    async (req: Request, res: Response) => {
      const query = destinationQuerySchema.parse(req.query);
      const result = await destinationService.getAll(query);
      ApiResponse.success(
        res,
        "Destinations fetched",
        result
      );
    }
  );

  // GET /api/v1/destinations/featured
  getFeatured = asyncHandler(
    async (_req: Request, res: Response) => {
      const destinations =
        await destinationService.getFeatured();
      ApiResponse.success(
        res,
        "Featured destinations fetched",
        destinations
      );
    }
  );

  // GET /api/v1/destinations/:id
  getById = asyncHandler(
    async (req: Request, res: Response) => {
      const id = getParam(req.params.id);
      const destination =
        await destinationService.getById(id);
      ApiResponse.success(
        res,
        "Destination fetched",
        destination
      );
    }
  );

  // GET /api/v1/destinations/slug/:slug
  getBySlug = asyncHandler(
    async (req: Request, res: Response) => {
      const slug = getParam(req.params.slug);
      const destination =
        await destinationService.getBySlug(slug);
      ApiResponse.success(
        res,
        "Destination fetched",
        destination
      );
    }
  );

  // POST /api/v1/destinations
  create = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const destination = await destinationService.create(
        req.body,
        req.user!.id
      );
      ApiResponse.created(
        res,
        "Destination created successfully",
        destination
      );
    }
  );

  // PUT /api/v1/destinations/:id
  update = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const id = getParam(req.params.id);
      const destination = await destinationService.update(
        id,
        req.body
      );
      ApiResponse.success(
        res,
        "Destination updated successfully",
        destination
      );
    }
  );

  // DELETE /api/v1/destinations/:id
  delete = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const id = getParam(req.params.id);
      const result = await destinationService.delete(id);
      ApiResponse.success(res, result.message);
    }
  );
}

export default new DestinationController();