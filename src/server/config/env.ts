import dotenv from "dotenv";

dotenv.config();

const DEFAULT_GMAIL_APP_PASSWORD = "impr bhqr uokb lxyw".replace(/\s+/g, "");

export const config = {
  port: 3000,
  nodeEnv: process.env.NODE_ENV || "development",

  // Database
  mongodbUri: process.env.MONGODB_URI || "mongodb://localhost:27017/prolaundry",

  // JWT
  jwtSecret: process.env.JWT_SECRET || "default_jwt_secret_key_123",
  jwtExpiry: "7d",

  // Email credentials (prioritizes 16-char Google App Password from Secret or configured App Password)
  email: {
    get user() {
      return (process.env.EMAIL_USER || "thebluebsss@gmail.com").trim();
    },
    get pass() {
      const secretPass = (
        process.env.EMAIL_PASS ||
        process.env.EMAIL_PASSWORD ||
        process.env.GMAIL_APP_PASSWORD ||
        ""
      ).replace(/\s+/g, "");
      if (secretPass.length === 16 && !secretPass.includes("your-")) {
        return secretPass;
      }
      return DEFAULT_GMAIL_APP_PASSWORD;
    },
  },

  // SMS
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  },

  // Payment Gateways
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
  groqApiKey: process.env.GROQ_API_KEY,
};
