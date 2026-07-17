import { Request, Response, NextFunction } from "express";

// ── Recursively sanitize MongoDB operators ────────────
const sanitizeValue = (value: unknown): unknown => {
  if (typeof value === "string") {
    return value
      .replace(/^\$/, "_")
      .replace(/^\./,"_");
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value !== null && typeof value === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const key of Object.keys(value as object)) {
      const safeKey = key
        .replace(/^\$/, "_")
        .replace(/\./g, "_");
      sanitized[safeKey] = sanitizeValue(
        (value as Record<string, unknown>)[key]
      );
    }
    return sanitized;
  }
  return value;
};

// ── Express middleware ────────────────────────────────
export const mongoSanitizeMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }
  if (req.params) {
    req.params = sanitizeValue(
      req.params
    ) as Record<string, string>;
  }
  next();
};