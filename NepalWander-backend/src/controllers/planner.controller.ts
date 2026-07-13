import { Request, Response } from "express";
import plannerService from "../services/planner.service";
import { ApiResponse } from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";

class PlannerController {

  // POST /api/v1/planner/generate
  generate = asyncHandler(
    async (req: Request, res: Response) => {
      const result = await plannerService.generatePlan(
        req.body
      );
      ApiResponse.success(res, result.message, result.plan);
    }
  );
}

export default new PlannerController();