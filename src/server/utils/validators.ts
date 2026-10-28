import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import {
  LAUNDRY_SERVICES,
  PAYMENT_METHODS,
  PRODUCT_CATEGORIES,
} from "./constants";

/**
 * Validation Schemas
 */

// Auth Validators
export const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  fullName: Joi.string().required(),
  phone: Joi.string()
    .pattern(/^[0-9]{10,11}$/)
    .required(),
  address: Joi.string().allow("").optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().optional(),
  username: Joi.string().optional(),
  password: Joi.string().required(),
}).or("email", "username"); // Require at least one of email or username

export const updateProfileSchema = Joi.object({
  fullName: Joi.string().optional(),
  phone: Joi.string()
    .pattern(/^[0-9]{10,11}$/)
    .optional(),
  address: Joi.string().optional(),
  avatar: Joi.string().uri().optional(),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
  newPassword: Joi.string().min(6).required(),
});

// Booking Validators
export const createBookingSchema = Joi.object({
  name: Joi.string().required(),
  phone: Joi.string()
    .pattern(/^[0-9]{10,11}$/)
    .required(),
  address: Joi.string().required(),
  service: Joi.string().required(),
  pickupDate: Joi.date().iso().required(),
  deliveryDate: Joi.date().iso().min(Joi.ref("pickupDate")).optional(),
  detergent: Joi.string().optional(),
  bleach: Joi.string().optional(),
  useBag: Joi.any().optional(),
  dryCleaningItems: Joi.array().items(Joi.string()).optional(),
  notes: Joi.string().allow("").optional(),
  estimatedWeight: Joi.number().min(0).optional(),
  paymentMethod: Joi.string()
    .valid(...Object.values(PAYMENT_METHODS))
    .optional(),
  district: Joi.string().allow("").optional(),
  pickupTime: Joi.string().allow("").optional(),
  deliveryTime: Joi.string().allow("").optional(),
  promoCode: Joi.string().allow("").optional(),
  discountAmount: Joi.number().optional(),
  subtotal: Joi.number().optional(),
  productsTotal: Joi.number().optional(),
  deliveryFee: Joi.number().optional(),
  totalPrice: Joi.number().optional(),
  items: Joi.array().items(
    Joi.object({
      serviceId: Joi.string().required(),
      serviceName: Joi.string().required(),
      quantity: Joi.number().required(),
      unitPrice: Joi.number().required(),
      pricingType: Joi.string().optional(),
      unitName: Joi.string().optional(),
    })
  ).optional(),
  products: Joi.array().items(
    Joi.object({
      productId: Joi.string().required(),
      productName: Joi.string().required(),
      quantity: Joi.number().required(),
      unitPrice: Joi.number().required(),
      unit: Joi.string().optional().allow(""),
    })
  ).optional(),
});

export const updateBookingStatusSchema = Joi.object({
  status: Joi.string()
    .valid("pending", "confirmed", "processing", "completed", "cancelled")
    .required(),
});

export const updatePaymentStatusSchema = Joi.object({
  paymentStatus: Joi.string()
    .valid("pending", "paid", "failed", "refunded")
    .required(),
});

// Order Validators
export const createOrderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().required(),
        quantity: Joi.number().min(1).required(),
      }),
    )
    .min(1)
    .required(),
  customerInfo: Joi.object({
    name: Joi.string().required(),
    phone: Joi.string()
      .pattern(/^[0-9]{10,11}$/)
      .required(),
    email: Joi.string().email().optional(),
    address: Joi.string().required(),
  }).required(),
  shippingAddress: Joi.string().optional(),
  notes: Joi.string().optional(),
  paymentMethod: Joi.string()
    .valid(...Object.values(PAYMENT_METHODS))
    .optional(),
});

export const updateOrderStatusSchema = Joi.object({
  orderStatus: Joi.string()
    .valid(
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    )
    .required(),
});

// Product Validators
export const createProductSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional(),
  price: Joi.number().min(0).required(),
  originalPrice: Joi.number().min(0).optional(),
  category: Joi.string()
    .valid(...PRODUCT_CATEGORIES)
    .required(),
  image: Joi.string().uri().optional(),
  stock: Joi.number().min(0).default(0),
  unit: Joi.string().default("Chai"),
  weight: Joi.string().optional(),
  brand: Joi.string().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  isActive: Joi.boolean().default(true),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string().optional(),
  price: Joi.number().min(0).optional(),
  originalPrice: Joi.number().min(0).optional(),
  category: Joi.string()
    .valid(...PRODUCT_CATEGORIES)
    .optional(),
  image: Joi.string().uri().optional(),
  stock: Joi.number().min(0).optional(),
  unit: Joi.string().optional(),
  weight: Joi.string().optional(),
  brand: Joi.string().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  isActive: Joi.boolean().optional(),
});

// Equipment Validators
export const createEquipmentSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string()
    .valid("washing-machine", "dryer", "iron", "other")
    .required(),
  model: Joi.string().optional(),
  serialNumber: Joi.string().optional(),
  purchaseDate: Joi.date().iso().optional(),
  status: Joi.string()
    .valid("working", "maintenance", "broken")
    .default("working"),
  location: Joi.string().optional(),
  notes: Joi.string().optional(),
});

export const updateEquipmentSchema = Joi.object({
  name: Joi.string().optional(),
  type: Joi.string()
    .valid("washing-machine", "dryer", "iron", "other")
    .optional(),
  model: Joi.string().optional(),
  serialNumber: Joi.string().optional(),
  purchaseDate: Joi.date().iso().optional(),
  status: Joi.string().valid("working", "maintenance", "broken").optional(),
  location: Joi.string().optional(),
  notes: Joi.string().optional(),
});

// User Validators
export const createUserSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  fullName: Joi.string().required(),
  phone: Joi.string()
    .pattern(/^[0-9]{10,11}$/)
    .required(),
  address: Joi.string().optional(),
  role: Joi.string().valid("admin", "user", "guest").default("user"),
  isActive: Joi.boolean().default(true),
});

export const updateUserSchema = Joi.object({
  username: Joi.string().min(3).max(30).optional(),
  email: Joi.string().email().optional(),
  fullName: Joi.string().optional(),
  phone: Joi.string()
    .pattern(/^[0-9]{10,11}$/)
    .optional(),
  address: Joi.string().optional(),
  role: Joi.string().valid("admin", "user", "guest").optional(),
  isActive: Joi.boolean().optional(),
});

/**
 * Validation Middleware
 */
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log("Validating request body:", req.body);

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      console.log("Validation errors:", errors);

      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    req.body = value;
    next();
  };
};
