import nodemailer from "nodemailer";
import { config } from "../config/env";

const getEmailCredentials = () => {
  const user = config.email.user;
  const pass = config.email.pass;
  const isConfigured = Boolean(user && pass && pass.length === 16);

  return { user, pass, isConfigured };
};

const createTransporter = () => {
  const { user, pass } = getEmailCredentials();
  return nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user,
      pass,
    },
  });
};

// Gửi OTP qua email
export const sendOTPEmail = async (
  email: string,
  otp: string,
  userName: string = "Khách hàng"
) => {
  const { user, isConfigured } = getEmailCredentials();
  if (!isConfigured) {
    return {
      success: false,
      notConfigured: true,
      error: "Chưa cấu hình EMAIL_PASS",
    };
  }

  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: {
        name: "Hệ Thống Giặt Là Sạch Sẽ",
        address: user,
      },
      to: email,
      subject: `[Giặt Là Sạch Sẽ] Mã OTP Đặt Lại Mật Khẩu: ${otp}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              background: white;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
              color: white;
              padding: 30px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content {
              padding: 40px 30px;
            }
            .otp-box {
              background: #f0f7ff;
              border: 2px dashed #1976d2;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
              margin: 30px 0;
            }
            .otp-code {
              font-size: 36px;
              font-weight: bold;
              color: #1976d2;
              letter-spacing: 8px;
              margin: 10px 0;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .footer {
              background: #f8f9fa;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #6c757d;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Giặt Là Sạch Sẽ</h1>
              <p>Hệ Thống Giặt Sấy Giao Nhận Tận Nơi</p>
            </div>
            
            <div class="content">
              <h2>Xin chào ${userName}!</h2>
              <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
              
              <div class="otp-box">
                <p style="margin: 0; color: #666;">Mã OTP của bạn là:</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 0; color: #666; font-size: 14px;">Mã có hiệu lực trong 10 phút</p>
              </div>
              
              <p><strong>Vui lòng không chia sẻ mã này với bất kỳ ai!</strong></p>
              
              <div class="warning">
                <strong>Lưu ý:</strong> Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
              </div>
              
              <p>Trân trọng,<br><strong>Đội ngũ Giặt Là Sạch Sẽ</strong></p>
            </div>
            
            <div class="footer">
              <p>Email này được gửi tự động, vui lòng không trả lời.</p>
              <p>Hotline: 0969263238 · ${user}</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("[emailService] Lỗi gửi email qua Gmail SMTP:", error?.message || error);
    return {
      success: false,
      error: String(error?.message || "Lỗi gửi email"),
    };
  }
};

export const sendPasswordResetConfirmation = async (
  email: string,
  userName: string
) => {
  try {
    const { user, isConfigured } = getEmailCredentials();
    if (!isConfigured) return { success: false };

    const transporter = createTransporter();

    const mailOptions = {
      from: {
        name: "Hệ Thống Giặt Là Sạch Sẽ",
        address: user,
      },
      to: email,
      subject: "Đặt Lại Mật Khẩu Thành Công - Giặt Là Sạch Sẽ",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: sans-serif; color: #333;">
          <h2>Đặt Lại Mật Khẩu Thành Công!</h2>
          <p>Xin chào ${userName},</p>
          <p>Mật khẩu của bạn đã được đặt lại thành công vào lúc ${new Date().toLocaleString("vi-VN")}.</p>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};
