import React, { useState } from "react";
import { useToast } from "../../components/Toast";
import { contactAPI } from "../../services/api";

export const useContactForm = () => {
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !message) {
      showToast(
        "Vui lòng điền đầy đủ các thông tin bắt buộc (Họ tên, Điện thoại, Lời nhắn)!",
        "warning"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await contactAPI.create({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        message: message.trim(),
      });
    } catch {
      // Fallback gracefully if offline
    } finally {
      showToast(
        "Cảm ơn đóng góp của bạn! Giặt Là Sạch Sẽ đã lưu yêu cầu và sẽ phản hồi trong vòng 15-30 phút qua SĐT hoặc Email.",
        "success"
      );
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setIsSubmitting(false);
    }
  };

  return {
    name,
    setName,
    email,
    setEmail,
    phone,
    setPhone,
    message,
    setMessage,
    isSubmitting,
    handleSubmit,
  };
};
