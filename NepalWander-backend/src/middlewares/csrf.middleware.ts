import csurf from "csurf";
import { Request, Response, NextFunction } from "express";

// ── CSRF protection middleware ────────────────────────
export const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  },
});

// ── Send CSRF token to frontend ───────────────────────
export const sendCsrfToken = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  res.json({
    success: true,
    csrfToken: req.csrfToken(),
  });
};

// ── CSRF error handler ────────────────────────────────
export const csrfErrorHandler = (
  err: any,
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err.code === "EBADCSRFTOKEN") {
    res.status(403).json({
      success: false,
      message:
        "Invalid or missing CSRF token. Request blocked.",
    });
    return;
  }
  next(err);
};