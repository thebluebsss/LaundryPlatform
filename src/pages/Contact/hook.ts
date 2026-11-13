import React, { useState } from "react";
import { useToast } from "../../components/Toast";

export const useContactForm = () => {
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !message) {
      showToast(
        "Vui lòng điền đầy đủ các thông tin bắt buộc (Họ tên, Điện thoại, Lời nhắn)!",
        "warning"
      );
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      showToast(
        "Cảm ơn đóng góp của bạn! Giặt Là Sạch Sẽ sẽ phản hồi lại trong vòng 15-30 phút qua SĐT hoặc Email.",
        "success"
      );
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setIsSubmitting(false);
    }, 1200);
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
