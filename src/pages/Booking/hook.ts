import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DISTRICTS } from "../../data";
import { CartItem, LaundryOrder, PromoCode } from "../../types";
import { useToast } from "../../components/Toast";
import { Product, CartProduct } from "../../data/products";
import { bookingsAPI } from "../../services/api";

export const useBooking = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [preAppliedPromo, setPreAppliedPromo] = useState<PromoCode | undefined>(
    undefined,
  );

  const isValidCartItem = (item: any): item is CartItem =>
    item &&
    typeof item.serviceId === "string" &&
    typeof item.serviceName === "string" &&
    typeof item.quantity === "number" &&
    typeof item.unitPrice === "number" &&
    (item.pricingType === "per_kg" || item.pricingType === "per_item") &&
    typeof item.unitName === "string";

  // Load drafts on load
  useEffect(() => {
    const itemsDraft = sessionStorage.getItem("sachse_cart_draft");
    const promoDraft = sessionStorage.getItem("sachse_promo_draft");

    if (itemsDraft) {
      try {
        const parsed = JSON.parse(itemsDraft) as any[];
        const normalizedItems = Array.isArray(parsed)
          ? parsed.filter(isValidCartItem)
          : [];

        if (normalizedItems.length > 0) {
          setCartItems(normalizedItems);
        } else {
          sessionStorage.removeItem("sachse_cart_draft");
          showToast(
            "Vui lòng chọn hoặc ước tính khối lượng giặt là trước khi đặt lịch nhé!",
            "warning",
          );
          navigate("/");
        }
      } catch (e) {
        sessionStorage.removeItem("sachse_cart_draft");
        showToast(
          "Vui lòng chọn hoặc ước tính khối lượng giặt là trước khi đặt lịch nhé!",
          "warning",
        );
        navigate("/");
      }
    } else {
      // If no draft services chosen, return back to Home
      showToast(
        "Vui lòng chọn hoặc ước tính khối lượng giặt là trước khi đặt lịch nhé!",
        "warning",
      );
      navigate("/");
    }

    if (promoDraft) {
      try {
        setPreAppliedPromo(JSON.parse(promoDraft) as PromoCode);
      } catch (e) {}
    }
  }, [navigate, showToast]);

  // Form registration state
  const [fullname, setFullname] = useState(() => {
    const cachedProfile = localStorage.getItem("sachse_user_profile");
    if (cachedProfile) {
      try {
        const parsed = JSON.parse(cachedProfile);
        return parsed.fullName || "";
      } catch (e) {}
    }
    return "";
  });

  const [phoneNumber, setPhoneNumber] = useState(() => {
    const cachedProfile = localStorage.getItem("sachse_user_profile");
    if (cachedProfile) {
      try {
        const parsed = JSON.parse(cachedProfile);
        return parsed.phone || "";
      } catch (e) {}
    }
    return "";
  });

  const [city, setCity] = useState<"hanoi" | "hcm">("hanoi");
  const [district, setDistrict] = useState(DISTRICTS.hanoi[0]);

  const [addressDetail, setAddressDetail] = useState(() => {
    const cachedProfile = localStorage.getItem("sachse_user_profile");
    if (cachedProfile) {
      try {
        const parsed = JSON.parse(cachedProfile);
        return parsed.address || "";
      } catch (e) {}
    }
    return "";
  });

  useEffect(() => {
    const cachedProfile = localStorage.getItem("sachse_user_profile");
    if (cachedProfile) {
      try {
        const parsed = JSON.parse(cachedProfile);
        if (parsed.fullName && !fullname) setFullname(parsed.fullName);
        if (parsed.phone && !phoneNumber) setPhoneNumber(parsed.phone);
        if (parsed.address && !addressDetail) setAddressDetail(parsed.address);
      } catch (e) {}
    }
  }, []);

  const [notes, setNotes] = useState("");

  // Product selection state
  const [selectedProducts, setSelectedProducts] = useState<CartProduct[]>([]);

  // Delivery & Pickup dates
  const [pickupDateStr, setPickupDateStr] = useState("");
  const [pickupTimeSlot, setPickupTimeSlot] = useState("08:00 - 10:00");
  const [deliveryDateStr, setDeliveryDateStr] = useState("");
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState("14:00 - 16:00");

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset district if city changes
  useEffect(() => {
    if (city === "hanoi") {
      setDistrict(DISTRICTS.hanoi[0]);
    } else {
      setDistrict(DISTRICTS.hcm[0]);
    }
  }, [city]);

  // Generate initial dates (Tomorrow for pickup, +3 days for delivery)
  useEffect(() => {
    const today = new Date();
    const formatDate = (date: Date) => {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + 3);

    setPickupDateStr(formatDate(tomorrow));
    setDeliveryDateStr(formatDate(deliveryDate));
  }, []);

  // Time options list
  const timeSlots = [
    "08:00 - 10:00",
    "10:00 - 12:00",
    "14:00 - 16:00",
    "16:00 - 18:00",
    "19:00 - 21:00",
  ];

  // Financial values
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const productsTotal = selectedProducts.reduce(
    (sum, p) => sum + p.product.price * p.quantity,
    0,
  );
  const isFreeDelivery = subtotal + productsTotal >= 200000;
  const deliveryFee =
    subtotal + productsTotal === 0 ? 0 : isFreeDelivery ? 0 : 25000;

  let discountAmount = 0;
  if (preAppliedPromo) {
    const totalBeforeDiscount = subtotal + productsTotal;
    if (
      !preAppliedPromo.minSubtotal ||
      totalBeforeDiscount >= preAppliedPromo.minSubtotal
    ) {
      if (preAppliedPromo.discountType === "percentage") {
        discountAmount = Math.round(
          (totalBeforeDiscount * preAppliedPromo.value) / 100,
        );
      } else {
        discountAmount = preAppliedPromo.value;
      }
    }
  }

  const grandTotal = Math.max(
    0,
    subtotal + productsTotal + deliveryFee - discountAmount,
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!fullname.trim()) newErrors.fullname = "Họ và tên không được bỏ trống.";
    if (!phoneNumber.trim()) {
      newErrors.phone = "Số điện thoại liên lạc không được bỏ trống.";
    } else if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(phoneNumber.trim())) {
      newErrors.phone =
        "Số điện thoại không hợp lệ (Ví dụ hợp lệ: 0912345678).";
    }
    if (!addressDetail.trim())
      newErrors.addressDetail =
        "Điền chi tiết số nhà, tên đường để shipper dễ tìm.";

    const pDate = new Date(pickupDateStr);
    const dDate = new Date(deliveryDateStr);

    if (isNaN(pDate.getTime())) {
      newErrors.pickupDate = "Ngày thu gom chưa hợp lệ.";
    }
    if (isNaN(dDate.getTime())) {
      newErrors.deliveryDate = "Ngày trả đồ sạch chưa hợp lệ.";
    }

    if (dDate <= pDate) {
      newErrors.deliveryDate =
        "Thời gian giao trả đồ phải muộn hơn ngày thu nhận tối thiểu 1 ngày.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (): Promise<LaundryOrder | null> => {
    if (!validateForm()) return null;

    const cachedProfile = localStorage.getItem("sachse_user_profile");
    let currentUserId = "";
    if (cachedProfile) {
      try {
        const parsed = JSON.parse(cachedProfile);
        currentUserId = parsed.id || parsed._id || parsed.username || "";
      } catch (e) {}
    }

    const validCartItems = cartItems.filter(isValidCartItem);
    const validProducts = selectedProducts
      .filter((p) => p.product && typeof p.product.id === "string")
      .map((p) => ({
        productId: p.product.id,
        productName: p.product.name,
        quantity: p.quantity,
        unitPrice: p.product.price,
        unit: p.product.unit,
      }));

    if (validCartItems.length === 0 && validProducts.length === 0) {
      showToast(
        "Vui lòng chọn dịch vụ giặt hoặc sản phẩm trước khi gửi đơn.",
        "warning",
      );
      return null;
    }

    const compiledOrder: LaundryOrder = {
      id: "",
      userId: currentUserId,
      customerName: fullname.trim(),
      phoneNumber: phoneNumber.trim(),
      address: addressDetail.trim(),
      district: `${district}, ${city === "hanoi" ? "Hà Nội" : "TP. Hồ Chí Minh"}`,
      items: validCartItems,
      products: validProducts,
      pickupDate: pickupDateStr,
      pickupTime: pickupTimeSlot,
      deliveryDate: deliveryDateStr,
      deliveryTime: deliveryTimeSlot,
      notes: notes.trim(),
      promoCode: preAppliedPromo?.code,
      discountAmount,
      subtotal,
      productsTotal,
      deliveryFee,
      totalPrice: grandTotal,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    let savedOrder = null;
    try {
      const payload: any = {
        name: compiledOrder.customerName,
        phone: compiledOrder.phoneNumber,
        address: compiledOrder.address,
        district: compiledOrder.district,
        pickupDate: compiledOrder.pickupDate,
        pickupTime: compiledOrder.pickupTime,
        deliveryDate: compiledOrder.deliveryDate,
        deliveryTime: compiledOrder.deliveryTime,
        notes: compiledOrder.notes.trim() || undefined,
        promoCode: compiledOrder.promoCode,
        discountAmount: compiledOrder.discountAmount,
        subtotal: compiledOrder.subtotal,
        deliveryFee: compiledOrder.deliveryFee,
        totalPrice: compiledOrder.totalPrice,
      };

      if (compiledOrder.items.length > 0) {
        payload.items = compiledOrder.items.map((item) => ({
          serviceId: item.serviceId,
          serviceName: item.serviceName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          pricingType: item.pricingType,
          unitName: item.unitName,
        }));
        payload.service = compiledOrder.items[0].serviceId;
      }

      if (compiledOrder.products && compiledOrder.products.length > 0) {
        payload.products = compiledOrder.products.map((product) => ({
          productId: product.productId,
          productName: product.productName,
          quantity: product.quantity,
          unitPrice: product.unitPrice,
          unit: product.unit,
        }));
      }

      if (compiledOrder.productsTotal !== undefined) {
        payload.productsTotal = compiledOrder.productsTotal;
      }

      const response = await bookingsAPI.create(payload);
      savedOrder = response.data.data;
    } catch (error: any) {
      console.error("❌ Lỗi lưu booking vào database:", error);
      const serverErrors = error?.response?.data?.errors;
      const serverMessage =
        serverErrors?.[0]?.message ||
        error?.response?.data?.message ||
        error?.message ||
        "Lỗi server không xác định.";

      showToast(`Lỗi server: ${serverMessage}`, "error");
    }

    const orderId =
      savedOrder?._id?.toString() ||
      "order-" + Math.random().toString(36).substring(2, 11);
    const createdAt = savedOrder?.createdAt || new Date().toISOString();
    const normalizedOrder: LaundryOrder = {
      ...compiledOrder,
      id: orderId,
      createdAt,
      userId:
        savedOrder?.userId?._id?.toString() ||
        savedOrder?.userId ||
        currentUserId,
      totalPrice: savedOrder?.totalAmount ?? compiledOrder.totalPrice,
      subtotal: savedOrder?.subtotal ?? compiledOrder.subtotal,
      productsTotal: savedOrder?.productsTotal ?? compiledOrder.productsTotal,
      deliveryFee: savedOrder?.deliveryFee ?? compiledOrder.deliveryFee,
      discountAmount:
        savedOrder?.discountAmount ?? compiledOrder.discountAmount,
      status: savedOrder?.status ?? compiledOrder.status,
    };

    // Save order into client storage for local tracking fallback
    const cachedOrders = localStorage.getItem("sachse_laundry_orders");
    let updatedList: LaundryOrder[] = [];
    if (cachedOrders) {
      try {
        updatedList = JSON.parse(cachedOrders) as LaundryOrder[];
      } catch (e) {
        updatedList = [];
      }
    }
    updatedList = [normalizedOrder, ...updatedList];
    localStorage.setItem("sachse_laundry_orders", JSON.stringify(updatedList));
    window.dispatchEvent(new Event("storage"));

    // Clear session drafts
    sessionStorage.removeItem("sachse_cart_draft");
    sessionStorage.removeItem("sachse_promo_draft");

    return normalizedOrder;
  };

  const handleUpdateProduct = (product: Product, quantity: number) => {
    if (quantity === 0) {
      setSelectedProducts((prev) =>
        prev.filter((p) => p.product.id !== product.id),
      );
    } else {
      setSelectedProducts((prev) => {
        const existing = prev.find((p) => p.product.id === product.id);
        if (existing) {
          return prev.map((p) =>
            p.product.id === product.id ? { ...p, quantity } : p,
          );
        } else {
          return [...prev, { product, quantity }];
        }
      });
    }
  };

  return {
    cartItems,
    preAppliedPromo,
    fullname,
    setFullname,
    phoneNumber,
    setPhoneNumber,
    city,
    setCity,
    district,
    setDistrict,
    addressDetail,
    setAddressDetail,
    notes,
    setNotes,
    pickupDateStr,
    setPickupDateStr,
    pickupTimeSlot,
    setPickupTimeSlot,
    deliveryDateStr,
    setDeliveryDateStr,
    deliveryTimeSlot,
    setDeliveryTimeSlot,
    errors,
    setErrors,
    timeSlots,
    subtotal,
    productsTotal,
    deliveryFee,
    discountAmount,
    grandTotal,
    selectedProducts,
    handleUpdateProduct,
    handleFormSubmit,
  };
};
