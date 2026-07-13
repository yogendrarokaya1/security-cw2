import { Request, Response, NextFunction } from "express";
export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(msg = "Bad Request") { super(msg, 400); }
}
export class UnauthorizedError extends AppError {
  constructor(msg = "Unauthorized") { super(msg, 401); }
}
export class ForbiddenError extends AppError {
  constructor(msg = "Forbidden") { super(msg, 403); }
}
export class NotFoundError extends AppError {
  constructor(msg = "Not Found") { super(msg, 404); }
}
export class ConflictError extends AppError {
  constructor(msg = "Conflict") { super(msg, 409); }
}

//Global error handler
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Known app error
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Mongoose duplicate key
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue || {})[0];
    res.status(409).json({
      success: false,
      message: `${field} is already in use`,
    });
    return;
  }

  // Mongoose validation
  if (err.name === "ValidationError") {
    const messages = Object.values((err as any).errors)
      .map((e: any) => e.message)
      .join(", ");
    res.status(400).json({ success: false, message: messages });
    return;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    res.status(401).json({ success: false, message: "Invalid token" });
    return;
  }
  if (err.name === "TokenExpiredError") {
    res.status(401).json({ success: false, message: "Token expired" });
    return;
  }

  // Unknown
  console.error("Unhandled Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};

//404 handler
export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};