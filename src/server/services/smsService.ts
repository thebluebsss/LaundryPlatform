// import twilio from "twilio";

// // Khởi tạo Twilio client
// const twilioClient = twilio(
//   process.env.TWILIO_ACCOUNT_SID,
//   process.env.TWILIO_AUTH_TOKEN
// );

// Gửi OTP qua SMS
export const sendOTPSMS = async (phone: string, otp: string) => {
  try {
    let formattedPhone = phone;
    if (phone.startsWith("0")) {
      formattedPhone = "+84" + phone.substring(1);
    } else if (!phone.startsWith("+")) {
      formattedPhone = "+84" + phone;
    }

    // Since twilio is placeholder, log the SMS
    console.log(`[twilio client placeholder]: sending SMS to ${formattedPhone}: ${otp}`);

    /*
    const message = await twilioClient.messages.create({
      body: `[Prolaundry] Ma OTP cua ban la: ${otp}. Ma co hieu luc trong 10 phut. Vui long khong chia se!`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    });
    return { success: true, messageSid: message.sid };
    */

    return { success: true, messageSid: "stub-sid" };
  } catch (error: any) {
    console.error("❌ Lỗi gửi SMS:", error);
    return { success: false, error: error.message };
  }
};

// Gửi SMS xác nhận đặt lại mật khẩu
export const sendPasswordResetSMS = async (phone: string) => {
  try {
    let formattedPhone = phone;
    if (phone.startsWith("0")) {
      formattedPhone = "+84" + phone.substring(1);
    } else if (!phone.startsWith("+")) {
      formattedPhone = "+84" + phone;
    }

    console.log(`[twilio client placeholder]: sending password reset confirmation SMS to ${formattedPhone}`);

    /*
    const message = await twilioClient.messages.create({
      body: `[Prolaundry] Mat khau cua ban da duoc dat lai thanh cong. Neu khong phai ban, vui long lien he ngay!`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    });
    return { success: true, messageSid: message.sid };
    */

    return { success: true, messageSid: "stub-sid" };
  } catch (error: any) {
    console.error(" Lỗi gửi SMS xác nhận:", error);
    return { success: false, error: error.message };
  }
};
