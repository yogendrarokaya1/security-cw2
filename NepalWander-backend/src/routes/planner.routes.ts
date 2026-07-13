import { Router } from "express";
import plannerController from "../controllers/planner.controller";
import validate from "../middlewares/validate.middleware";
import { generatePlanSchema } from "../validators/planner.validator";

const router = Router();

// Public — anyone can use the planner
router.post(
  "/generate",
  validate(generatePlanSchema),
  plannerController.generate
);

export default router;