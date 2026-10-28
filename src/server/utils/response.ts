import { Response } from "express";

/**
 * Chuẩn hóa response thành công
 */
export const successResponse = (
  res: Response,
  data: any,
  message: string = "Success",
  statusCode: number = 200,
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Chuẩn hóa response lỗi
 */
export const errorResponse = (
  res: Response,
  message: string = "Error",
  statusCode: number = 500,
  errors: any = null,
) => {
  const response: any = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};
