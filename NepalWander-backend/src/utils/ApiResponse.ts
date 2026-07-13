import { Response } from "express";

export class ApiResponse {
  static success(
    res: Response,
    message: string,
    data?: unknown,
    statusCode = 200
  ): Response {
    return res.status(statusCode).json({
      success: true,
      message,
      data: data ?? null,
    });
  }

  static created(
    res: Response,
    message: string,
    data?: unknown
  ): Response {
    return res.status(201).json({
      success: true,
      message,
      data: data ?? null,
    });
  }

  static error(
    res: Response,
    message: string,
    statusCode = 500,
    errors?: unknown
  ): Response {
    return res.status(statusCode).json({
      success: false,
      message,
      errors: errors ?? null,
    });
  }
}