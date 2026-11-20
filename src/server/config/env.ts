import dotenv from "dotenv";

dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";
const resolvedJwtSecret = (
  process.env.JWT_SECRET ||
  process.env.SESSION_SECRET ||
  ""
).trim();

if (nodeEnv === "production" && !resolvedJwtSecret) {
  throw new Error(
    "CRITICAL: JWT_SECRET (hoặc SESSION_SECRET) bắt buộc phải được cấu hình trong môi trường production!"
  );
}

const parsedPort = Number(process.env.PORT);

export const config = {
  port: Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 3000,
  nodeEnv,

  // CORS
  corsOrigins: (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),

  // Database
  mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/prolaundry",

  // JWT
  jwtSecret: resolvedJwtSecret || "sachse_dev_only_jwt_secret_change_in_prod",
  jwtExpiry: "7d",

  // Email credentials (loaded strictly from environment variables / Secrets)
  email: {
    get user() {
      return (process.env.EMAIL_USER || "").trim();
    },
    get pass() {
      const secretPass = (
        process.env.EMAIL_PASS ||
        process.env.EMAIL_PASSWORD ||
        process.env.GMAIL_APP_PASSWORD ||
        ""
      ).replace(/\s+/g, "");
      if (secretPass && !secretPass.includes("your-")) {
        return secretPass;
      }
      return "";
    },
  },

  // SMS
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  },

  // Payment Gateways & Webhook Security
  paymentWebhookSecret: (process.env.PAYMENT_WEBHOOK_SECRET || "").trim(),
  allowDemoPaymentConfirm:
    process.env.ALLOW_DEMO_PAYMENT_CONFIRM === "true" ||
    nodeEnv !== "production",

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  },

  vnpay: {
    tmnCode: process.env.VNPAY_TMN_CODE,
    hashSecret: process.env.VNPAY_HASH_SECRET,
    url: process.env.VNPAY_URL,
    returnUrl: process.env.VNPAY_RETURN_URL,
    ipnUrl: process.env.VNPAY_IPN_URL,
  },

  momo: {
    partnerCode: process.env.MOMO_PARTNER_CODE,
    accessKey: process.env.MOMO_ACCESS_KEY,
    secretKey: process.env.MOMO_SECRET_KEY,
    endpoint: process.env.MOMO_ENDPOINT,
    redirectUrl: process.env.MOMO_REDIRECT_URL,
    ipnUrl: process.env.MOMO_IPN_URL,
  },

  payos: {
    clientId: process.env.PAYOS_CLIENT_ID,
    apiKey: process.env.PAYOS_API_KEY,
    checksumKey: process.env.PAYOS_CHECKSUM_KEY,
    returnUrl: process.env.PAYOS_RETURN_URL,
    cancelUrl: process.env.PAYOS_CANCEL_URL,
  },

  // AI
  geminiModel: (process.env.GEMINI_MODEL || "gemini-2.5-flash").trim(),
  groqApiKey: process.env.GROQ_API_KEY,
};
