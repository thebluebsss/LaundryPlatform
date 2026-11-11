import { z } from "zod";

export const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
export const phoneRegex = /^\d{3}[-\s]?\d{3}[-\s]?\d{4}$/;

export const RequiredField = "Trường này là bắt buộc";

export const loginSchema = z.object({
  username: z.string().min(1, RequiredField),
  password: z
    .string()
    .min(1, RequiredField)
    .refine(
      (val) => val === "" || val.length >= 6,
      "Mật khẩu phải có ít nhất 6 ký tự",
    ),
});

export const adminLoginSchema = z.object({
  username: z.string().min(1, RequiredField),
  password: z.string().min(1, RequiredField),
});
