// @ts-nocheck
import crypto from "crypto";
import qs from "qs";
import Stripe from "stripe";
import { PayOS } from "@payos/node";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock_secret", {
  apiVersion: "2024-12-18.acacia" as any,
});

let payOS: PayOS | null = null;
try {
  if (
    process.env.PAYOS_CLIENT_ID &&
    process.env.PAYOS_API_KEY &&
    process.env.PAYOS_CHECKSUM_KEY
  ) {
    payOS = new PayOS(
      process.env.PAYOS_CLIENT_ID,
      process.env.PAYOS_API_KEY,
      process.env.PAYOS_CHECKSUM_KEY,
    );
  }
} catch (error: any) {
  console.warn("PayOS initialization failed:", error.message);
}

// VNPay
const vnpayConfig = {
  vnp_TmnCode: process.env.VNPAY_TMN_CODE || "DEMO",
  vnp_HashSecret: process.env.VNPAY_HASH_SECRET || "DEMO_SECRET",
  vnp_Url:
    process.env.VNPAY_URL ||
    "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  vnp_ReturnUrl:
    process.env.VNPAY_RETURN_URL ||
    "http://localhost:3000/payment/vnpay/return",
  vnp_IpnUrl:
    process.env.VNPAY_IPN_URL || "http://localhost:3001/api/payment/vnpay/ipn",
};

// MoMo
const momoConfig = {
  partnerCode: process.env.MOMO_PARTNER_CODE || "DEMO",
  accessKey: process.env.MOMO_ACCESS_KEY || "DEMO_ACCESS_KEY",
  secretKey: process.env.MOMO_SECRET_KEY || "DEMO_SECRET_KEY",
  endpoint:
    process.env.MOMO_ENDPOINT ||
    "https://test-payment.momo.vn/v2/gateway/api/create",
  redirectUrl:
    process.env.MOMO_REDIRECT_URL ||
    "http://localhost:3000/payment/momo/return",
  ipnUrl:
    process.env.MOMO_IPN_URL || "http://localhost:3001/api/payment/momo/ipn",
};

// PayOS
const payOSConfig = {
  returnUrl:
    process.env.PAYOS_RETURN_URL ||
    "http://localhost:3000/payment/payos/return",
  cancelUrl:
    process.env.PAYOS_CANCEL_URL || "http://localhost:3000/payment/cancel",
};

// Stripe
export const createStripePaymentIntent = async (
  bookingId: string,
  amount: number,
  metadata = {},
) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Stripe expects amount in smallest currency unit
      currency: "vnd",
      metadata: { ...metadata, bookingId },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error: any) {
    console.error("Stripe Payment Intent Error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// VNPay Payment URL
export const createVNPayPaymentUrl = async (orderId: string, amount: number, orderInfo: string, ipAddr: string) => {
  try {
    const date = new Date();
    const createDate = date
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}Z/, "");

    let vnp_Params: any = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: vnpayConfig.vnp_TmnCode,
      vnp_Locale: "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: orderId,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: "other",
      vnp_Amount: amount * 100, // VNPay expects amount in VND buy unit * 100
      vnp_ReturnUrl: vnpayConfig.vnp_ReturnUrl,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: createDate,
    };

    vnp_Params = sortObject(vnp_Params);

    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", vnpayConfig.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;

    const paymentUrl =
      vnpayConfig.vnp_Url + "?" + qs.stringify(vnp_Params, { encode: false });

    return {
      success: true,
      paymentUrl,
      orderId,
    };
  } catch (error: any) {
    console.error("VNPay Payment URL Error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// MoMo Payment
export const createMoMoPayment = async (
  orderId: string,
  amount: number,
  orderInfo: string,
  extraData = "",
) => {
  try {
    const requestId = orderId + "_" + Date.now();
    const rawSignature = `accessKey=${momoConfig.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${momoConfig.ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${momoConfig.partnerCode}&redirectUrl=${momoConfig.redirectUrl}&requestId=${requestId}&requestType=captureWallet`;

    const signature = crypto
      .createHmac("sha256", momoConfig.secretKey)
      .update(rawSignature)
      .digest("hex");

    const requestBody = {
      partnerCode: momoConfig.partnerCode,
      accessKey: momoConfig.accessKey,
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl: momoConfig.redirectUrl,
      ipnUrl: momoConfig.ipnUrl,
      extraData,
      requestType: "captureWallet",
      signature,
      lang: "vi",
    };

    const response = await fetch(momoConfig.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const result: any = await response.json();

    if (result.resultCode === 0) {
      return {
        success: true,
        payUrl: result.payUrl,
        orderId,
        requestId,
      };
    } else {
      return {
        success: false,
        error: result.message || "MoMo payment creation failed",
      };
    }
  } catch (error: any) {
    console.error("MoMo Payment Error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Verify VNPay IPN
export const verifyVNPayIPN = async (vnp_Params: any) => {
  try {
    const secureHash = vnp_Params["vnp_SecureHash"];
    const paramsCopy = { ...vnp_Params };
    delete paramsCopy["vnp_SecureHash"];
    delete paramsCopy["vnp_SecureHashType"];

    const sortedParams = sortObject(paramsCopy);
    const signData = qs.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac("sha512", vnpayConfig.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    return secureHash === signed;
  } catch (error) {
    console.error("VNPay IPN Verification Error:", error);
    return false;
  }
};

// Verify MoMo IPN
export const verifyMoMoIPN = async (requestBody: any) => {
  try {
    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature,
    } = requestBody;

    const rawSignature = `accessKey=${momoConfig.accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

    const expectedSignature = crypto
      .createHmac("sha256", momoConfig.secretKey)
      .update(rawSignature)
      .digest("hex");

    return signature === expectedSignature;
  } catch (error) {
    console.error("MoMo IPN Verification Error:", error);
    return false;
  }
};

// PayOS Payment
export const createPayOSPayment = async (
  orderId: string,
  amount: number,
  orderInfo: string,
  items: any[] = [],
) => {
  try {
    if (!payOS) {
      return {
        success: false,
        error:
          "PayOS chưa được cấu hình. Vui lòng thêm PAYOS_CLIENT_ID, PAYOS_API_KEY, và PAYOS_CHECKSUM_KEY vào file .env",
      };
    }

    const orderCode =
      parseInt(orderId.replace(/[^0-9]/g, "").slice(-9)) || Date.now();

    const paymentData = {
      orderCode: orderCode,
      amount: amount,
      description: orderInfo.slice(0, 25) || "Thanh toan dich vu giat",
      items:
        items.length > 0
          ? items
          : [
              {
                name: orderInfo.slice(0, 25) || "Dich vu giat",
                quantity: 1,
                price: amount,
              },
            ],
      returnUrl: payOSConfig.returnUrl,
      cancelUrl: payOSConfig.cancelUrl,
    };

    const paymentLinkResponse = await payOS.createPaymentLink(paymentData);

    return {
      success: true,
      checkoutUrl: paymentLinkResponse.checkoutUrl,
      orderId,
      orderCode: paymentLinkResponse.orderCode,
      paymentLinkId: paymentLinkResponse.paymentLinkId,
    };
  } catch (error: any) {
    console.error("PayOS Payment Error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Verify PayOS Webhook
export const verifyPayOSWebhook = async (webhookData: any) => {
  try {
    if (!payOS) {
      return {
        success: false,
        error: "PayOS chưa được cấu hình",
      };
    }

    const verifiedData = payOS.verifyPaymentWebhookData(webhookData);
    return {
      success: true,
      data: verifiedData,
    };
  } catch (error: any) {
    console.error("PayOS Webhook Verification Error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

function sortObject(obj: any) {
  const sorted: any = {};
  const keys = Object.keys(obj).sort();
  keys.forEach((key) => {
    sorted[key] = obj[key];
  });
  return sorted;
}

export const calculateServicePrice = (
  service: string,
  weightOrParams: any = 5,
  dryCleaningItems: any = [],
) => {
  const basePrices: Record<string, number> = {
    "giat-say": 25000,
    "giat-kho": 35000,
    "giat-ui": 30000,
    "giat-say-thuong": 25000,
    "giat-kho-kg": 35000,
    "giat-ui-kg": 30000,
  };

  let weight = 5;
  let useBag = "Không";
  let extDryCleaning = false;

  if (typeof weightOrParams === "object" && weightOrParams !== null) {
    weight = weightOrParams.estimatedWeight || weightOrParams.weight || 5;
    useBag = weightOrParams.useBag || "Không";
    extDryCleaning = !!weightOrParams.dryCleaningItems;
  } else {
    weight = typeof weightOrParams === "number" ? weightOrParams : 5;
    extDryCleaning = Array.isArray(dryCleaningItems) ? dryCleaningItems.length > 0 : !!dryCleaningItems;
  }

  const unitPrice = basePrices[service] || 25000;
  let totalPrice = unitPrice * Math.max(weight, 3); // Minimum 3kg

  if (extDryCleaning) {
    totalPrice += 15000;
  }
  if (useBag === "Có") {
    totalPrice += 5000;
  }

  return {
    unitPrice,
    totalPrice,
    weight,
  };
};
