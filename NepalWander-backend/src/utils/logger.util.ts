import winston from "winston";
import path from "path";
import fs from "fs";

// ── Ensure logs directory exists ──────────────────────
const logsDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// ── Custom log format for files ───────────────────────
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// ── Console format for development ────────────────────
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "HH:mm:ss" }),
  winston.format.printf(
    ({ timestamp, level, message, ...meta }) => {
      const metaStr = Object.keys(meta).length
        ? `\n${JSON.stringify(meta, null, 2)}`
        : "";
      return `[${timestamp}] ${level}: ${message}${metaStr}`;
    }
  )
);

// ── Winston logger instance ───────────────────────────
const logger = winston.createLogger({
  level:
    process.env.NODE_ENV === "production" ? "info" : "debug",
  format: logFormat,
  transports: [
    // Errors only
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
    }),
    // All activity
    new winston.transports.File({
      filename: path.join(logsDir, "activity.log"),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 10,
    }),
    // Auth specific
    new winston.transports.File({
      filename: path.join(logsDir, "auth.log"),
      maxsize: 10 * 1024 * 1024,
      maxFiles: 10,
    }),
  ],
});

// ── Console output in development only ───────────────
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

// ── Helper: mask email for privacy in logs ────────────
const maskEmail = (email: string): string => {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  const masked =
    local.length > 2
      ? `${local[0]}${"*".repeat(local.length - 2)}${
          local[local.length - 1]
        }`
      : "**";
  return `${masked}@${domain}`;
};

// ── Auth event logger ─────────────────────────────────
// Use for: login, logout, register, OTP verify
export const logAuth = (
  event: string,
  data: {
    email?: string;
    userId?: string;
    role?: string;
    ip?: string;
    success: boolean;
    reason?: string;
  }
) => {
  logger.info(`AUTH:${event}`, {
    event,
    userId: data.userId,
    email: data.email ? maskEmail(data.email) : undefined,
    role: data.role,
    ip: data.ip,
    success: data.success,
    reason: data.reason,
    timestamp: new Date().toISOString(),
  });
};

// ── Security event logger ─────────────────────────────
// Use for: failed logins, lockouts, suspicious activity
export const logSecurity = (
  event: string,
  data: {
    ip?: string;
    email?: string;
    userId?: string;
    reason?: string;
    meta?: Record<string, unknown>;
  }
) => {
  logger.warn(`SECURITY:${event}`, {
    event,
    ip: data.ip,
    email: data.email ? maskEmail(data.email) : undefined,
    userId: data.userId,
    reason: data.reason,
    meta: data.meta,
    timestamp: new Date().toISOString(),
  });
};

// ── General activity logger ───────────────────────────
// Use for: bookings, profile updates, admin actions
export const logActivity = (
  event: string,
  data: {
    userId?: string;
    role?: string;
    ip?: string;
    resource?: string;
    action?: string;
    meta?: Record<string, unknown>;
  }
) => {
  logger.info(`ACTIVITY:${event}`, {
    event,
    userId: data.userId,
    role: data.role,
    ip: data.ip,
    resource: data.resource,
    action: data.action,
    meta: data.meta,
    timestamp: new Date().toISOString(),
  });
};

// ── Error logger ──────────────────────────────────────
// Use for: caught exceptions, service errors
export const logError = (
  event: string,
  error: Error,
  data?: Record<string, unknown>
) => {
  logger.error(`ERROR:${event}`, {
    event,
    message: error.message,
    stack:
      process.env.NODE_ENV !== "production"
        ? error.stack
        : undefined,
    ...data,
    timestamp: new Date().toISOString(),
  });
};

export default logger;