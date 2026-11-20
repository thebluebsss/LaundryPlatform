import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env";
import { UnauthorizedError, ForbiddenError } from "../utils/errorHandler";
import User from "../models/User";

// Extends express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const normalizeRole = (rawRole?: string): string => {
  if (!rawRole) return "user";
  if (rawRole === "store_manager") return "store_owner";
  if (rawRole === "shipper") return "driver";
  return rawRole;
};

const extractBearerToken = (req: Request, allowQueryToken = false): string | null => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const headerToken = authHeader.slice(7).trim();
    if (headerToken) return headerToken;
  }
  if (allowQueryToken && typeof req.query.token === "string" && req.query.token.trim()) {
    return req.query.token.trim();
  }
  return null;
};

const resolveUserFromToken = async (token: string) => {
  const decoded: any = jwt.verify(token, config.jwtSecret);
  const queryOrDoc: any = (User as any).findById(decoded.id);
  const user =
    queryOrDoc && typeof queryOrDoc.select === "function"
      ? await queryOrDoc.select("-password")
      : await queryOrDoc;

  if (!user) {
    throw new UnauthorizedError("User không tồn tại");
  }
  if (user.isActive === false) {
    throw new UnauthorizedError("Tài khoản đã bị vô hiệu hóa");
  }

  const normalized = normalizeRole(user.role);
  if (typeof user.toObject === "function") {
    const plain = user.toObject();
    delete plain.password;
    plain.role = normalized;
    return plain;
  }
  const plain = { ...user, role: normalized };
  delete plain.password;
  return plain;
};

/**
 * Middleware xác thực JWT token (optional - không throw error nếu không có token)
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractBearerToken(req, false);
    if (token) {
      req.user = await resolveUserFromToken(token);
    }
  } catch {
    // Ignore errors for optional auth
  }

  next();
};

/**
 * Middleware xác thực JWT token
 */
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractBearerToken(req, false);
    if (!token) {
      throw new UnauthorizedError("Token không được cung cấp");
    }

    req.user = await resolveUserFromToken(token);
    next();
  } catch (error: any) {
    if (error.name === "JsonWebTokenError") {
      next(new UnauthorizedError("Token không hợp lệ"));
    } else if (error.name === "TokenExpiredError") {
      next(new UnauthorizedError("Token đã hết hạn"));
    } else {
      next(error);
    }
  }
};

/**
 * Middleware xác thực JWT token cho SSE EventSource (hỗ trợ Header Authorization hoặc ?token=...)
 */
export const authenticateSseToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractBearerToken(req, true);
    if (!token) {
      throw new UnauthorizedError("Vui lòng đăng nhập để kết nối luồng thời gian thực");
    }

    req.user = await resolveUserFromToken(token);
    next();
  } catch (error: any) {
    if (error.name === "JsonWebTokenError") {
      next(new UnauthorizedError("Token không hợp lệ"));
    } else if (error.name === "TokenExpiredError") {
      next(new UnauthorizedError("Token đã hết hạn"));
    } else {
      next(error);
    }
  }
};

/**
 * Middleware kiểm tra quyền admin
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new UnauthorizedError("Vui lòng đăng nhập"));
  }

  if (normalizeRole(req.user.role) !== "admin") {
    return next(new ForbiddenError("Chỉ admin mới có quyền truy cập"));
  }

  next();
};

/**
 * Middleware kiểm tra vai trò hợp lệ (RBAC)
 */
export const requireRoles = (...allowedRoles: string[]) => {
  const normalizedAllowed = new Set(allowedRoles.map((r) => normalizeRole(r)));
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError("Vui lòng đăng nhập"));
    }

    const currentRole = normalizeRole(req.user.role);
    if (!normalizedAllowed.has(currentRole)) {
      return next(
        new ForbiddenError("Tài khoản của bạn không có quyền thực hiện thao tác này")
      );
    }

    next();
  };
};

/**
 * Middleware kiểm tra quyền sở hữu resource
 */
export const requireOwnership = (resourceUserIdField = "userId") => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError("Vui lòng đăng nhập"));
    }

    // Admin có thể truy cập mọi resource
    if (req.user.role === "admin") {
      return next();
    }

    // Kiểm tra ownership
    const resourceUserId =
      (req as any)[resourceUserIdField] || req.body[resourceUserIdField];

    if (
      resourceUserId &&
      resourceUserId.toString() !== req.user._id.toString()
    ) {
      return next(
        new ForbiddenError("Bạn không có quyền truy cập resource này"),
      );
    }

    next();
  };
};
