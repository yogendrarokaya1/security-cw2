import { Router } from "express";
import mfaController from "../controllers/mfa.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

// All MFA routes require authentication
router.use(protect);

// GET  /api/v1/mfa/setup         → get QR code
// POST /api/v1/mfa/verify-setup  → confirm and enable
// POST /api/v1/mfa/verify-login  → verify on login
// POST /api/v1/mfa/disable       → turn off MFA

router.get("/setup", mfaController.setup);
router.post("/verify-setup", mfaController.verifySetup);
router.post("/verify-login", mfaController.verifyLogin);
router.post("/disable", mfaController.disable);

export default router;