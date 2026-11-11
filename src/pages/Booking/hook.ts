import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { DISTRICTS } from "../../data";
import {
  CartItem,
  LaundryOrder,
  PromoCode,
  LaundryStore,
  LaundryService,
  GarmentInspectionResult,
} from "../../types";
import { useToast } from "../../components/Toast";
import { Product, CartProduct } from "../../data/products";
import {
  bookingsAPI,
  laundryOrdersAPI,
  storesAPI,
  servicesAPI,
  productsAPI,
} from "../../services/api";

export const useBooking = () => {
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  // Sequential Wizard Stepper State (Steps 1 -> 2 -> 3 -> 4, non-skippable)
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);
  const [maxCompletedStep, setMaxCompletedStep] = useState<number>(0);

  // Step 1: Store & Service catalog from backend API (KH-UC4.1)
  const [stores, setStores] = useState<LaundryStore[]>([]);
  const [services, setServices] = useState<LaundryService[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>(
    searchParams.get("storeId") || "",
  );

  // Step 2: Order_Details line items loop + AI Fabric Scanner (KH-UC4.2 & KH-UC4.4)
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [activeLineIndexForAi, setActiveLineIndexForAi] = useState<number>(0);
  const [lastAiResult, setLastAiResult] =
    useState<GarmentInspectionResult | null>(null);

  const [preAppliedPromo, setPreAppliedPromo] = useState<PromoCode | undefined>(
    undefined,
  );
  const [paymentMethod, setPaymentMethod] = useState<"vietqr" | "cod">("vietqr");

  const isValidCartItem = (item: any): item is CartItem =>
    item &&
    typeof item.serviceId === "string" &&
    typeof item.serviceName === "string" &&
    typeof item.quantity === "number" &&
    typeof item.unitPrice === "number" &&
    (item.pricingType === "per_kg" || item.pricingType === "per_item") &&
    typeof item.unitName === "string";

  const loadCatalogAndDrafts = useCallback(async () => {
    try {
      const [storesRes, servicesRes, productsRes] = await Promise.allSettled([
        storesAPI.getAll(),
        servicesAPI.getAll(),
        productsAPI.getAll(),
      ]);

      const rawStores =
        storesRes.status === "fulfilled"
          ? Array.isArray(storesRes.value.data?.data)
            ? storesRes.value.data.data
            : storesRes.value.data?.data?.stores || []
          : [];
      const loadedStores: LaundryStore[] = rawStores.map((s: any) => ({
        ...s,
        id: s.customId || s.id || s._id,
      }));

      const rawServices =
        servicesRes.status === "fulfilled"
          ? Array.isArray(servicesRes.value.data?.data)
            ? servicesRes.value.data.data
            : servicesRes.value.data?.data?.services || []
          : [];
      const normalizedServices: LaundryService[] = rawServices.map((s: any) => ({
        ...s,
        id: s.customId || s.id || s._id,
      }));

      const rawProducts =
        productsRes.status === "fulfilled"
          ? Array.isArray(productsRes.value.data?.data)
            ? productsRes.value.data.data
            : productsRes.value.data?.data?.products || []
          : [];
      const normalizedProducts: Product[] = rawProducts.map((p: any) => ({
        ...p,
        id: p.customId || p.id || p._id,
      }));

      setStores(loadedStores);
      setServices(normalizedServices);
      setCatalogProducts(normalizedProducts);

      const queryStoreId = searchParams.get("storeId");
      if (queryStoreId && loadedStores.some((s) => s.id === queryStoreId)) {
        setSelectedStoreId(queryStoreId);
      } else if (loadedStores.length > 0) {
        setSelectedStoreId((prev) =>
          loadedStores.some((s) => s.id === prev) ? prev : loadedStores[0].id,
        );
      }

      const itemsDraft = sessionStorage.getItem("sachse_cart_draft");
      const promoDraft = sessionStorage.getItem("sachse_promo_draft");

      let initialItems: CartItem[] = [];
      if (itemsDraft) {
        try {
          const parsed = JSON.parse(itemsDraft) as any[];
          if (Array.isArray(parsed)) {
            initialItems = parsed.filter(isValidCartItem).map((item) => ({
              ...item,
              estimatedQuantity: item.estimatedQuantity ?? item.quantity,
              fabricType: item.fabricType || "Cotton / Đồ mặc hàng ngày",
              careInstructions:
                item.careInstructions || "Giặt nước ấm tiêu chuẩn, gấp gọn",
              estimatedLineTotal:
                item.estimatedLineTotal ??
                (item.estimatedQuantity ?? item.quantity) * item.unitPrice,
            }));
          }
        } catch {
          // ignore invalid JSON
        }
      }

      if (initialItems.length === 0 && normalizedServices.length > 0) {
        const defaultSvc = normalizedServices[0];
        initialItems = [
          {
            serviceId: defaultSvc.id,
            serviceName: defaultSvc.name,
            quantity: 3,
            estimatedQuantity: 3,
            unitPrice: defaultSvc.unitPrice,
            pricingType: defaultSvc.pricingType,
            unitName: defaultSvc.unitName,
            fabricType: "Cotton / Đồ mặc hàng ngày",
            careInstructions: "Giặt nước ấm tiêu chuẩn, gấp gọn",
            estimatedLineTotal: 3 * defaultSvc.unitPrice,
          },
        ];
      }

      setCartItems(initialItems);

      if (promoDraft) {
        try {
          setPreAppliedPromo(JSON.parse(promoDraft) as PromoCode);
        } catch {
          // ignore
        }
      }
    } catch {
      // handled gracefully
    }
  }, [searchParams]);

  useEffect(() => {
    loadCatalogAndDrafts();
  }, [loadCatalogAndDrafts]);

  // Stepper navigation & validation handlers
  const handleStepClick = (targetStep: 1 | 2 | 3 | 4) => {
    if (targetStep <= maxCompletedStep + 1) {
      setActiveStep(targetStep);
    } else {
      showToast(
        `Vui lòng hoàn thành và xác nhận Bước ${maxCompletedStep + 1} trước khi chuyển sang Bước ${targetStep}.`,
        "warning",
      );
    }
  };

  const handleConfirmStep1 = () => {
    if (!selectedStoreId) {
      showToast("Vui lòng chọn 1 cửa hàng giặt sấy phục vụ (Bước 1).", "warning");
      return;
    }
    setMaxCompletedStep((prev) => Math.max(prev, 1));
    setActiveStep(2);
  };

  const handleConfirmStep2 = () => {
    const validLines = cartItems.filter(
      (item) =>
        item.serviceId &&
        Number(item.estimatedQuantity ?? item.quantity ?? 0) > 0,
    );
    if (validLines.length === 0) {
      showToast(
        "Vui lòng kê khai ít nhất 1 dòng đồ giặt hợp lệ với khối lượng/số lượng lớn hơn 0 (Bước 2).",
        "warning",
      );
      return;
    }
    setMaxCompletedStep((prev) => Math.max(prev, 2));
    setActiveStep(3);
  };

  const handleConfirmStep3 = () => {
    setMaxCompletedStep((prev) => Math.max(prev, 3));
    setActiveStep(4);
  };

  const handlePrevStep = () => {
    if (activeStep > 1) {
      setActiveStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    }
  };

  // Order_Details line item handlers (Sequence 1 loop)
  const handleAddLineItem = () => {
    const defaultSvc = services[0];
    if (!defaultSvc) return;
    setCartItems((prev) => [
      ...prev,
      {
        serviceId: defaultSvc.id,
        serviceName: defaultSvc.name,
        quantity: 2,
        estimatedQuantity: 2,
        unitPrice: defaultSvc.unitPrice,
        pricingType: defaultSvc.pricingType,
        unitName: defaultSvc.unitName,
        fabricType: "Đồ trắng (Áo sơ mi / Phông trắng)",
        careInstructions: "Giặt riêng tránh lem màu",
        estimatedLineTotal: 2 * defaultSvc.unitPrice,
      },
    ]);
  };

  const handleUpdateLineItem = (index: number, patch: Partial<CartItem>) => {
    setCartItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, ...patch } : item)),
    );
  };

  const handleRemoveLineItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleOpenAiScanner = (index: number) => {
    setActiveLineIndexForAi(index);
    setAiModalOpen(true);
  };

  const handleApplyAiResult = (result: GarmentInspectionResult) => {
    setLastAiResult(result);
    const matchedSvc =
      services.find((s) => s.category === result.recommendedService) ||
      services[0];

    handleUpdateLineItem(activeLineIndexForAi, {
      ...(matchedSvc
        ? {
            serviceId: matchedSvc.id,
            serviceName: matchedSvc.name,
            unitPrice: matchedSvc.unitPrice,
            pricingType: matchedSvc.pricingType,
            unitName: matchedSvc.unitName,
            estimatedLineTotal:
              (cartItems[activeLineIndexForAi]?.estimatedQuantity ||
                cartItems[activeLineIndexForAi]?.quantity ||
                1) * matchedSvc.unitPrice,
          }
        : {}),
      fabricType: result.detectedFabric,
      garmentDescription: result.garmentType,
      careInstructions: result.careInstructions.join(", "),
    });
  };

  // Form registration state prefilled solely from authenticated profile
  const [fullname, setFullname] = useState(() => {
    const cachedProfile = localStorage.getItem("sachse_user_profile");
    if (cachedProfile) {
      try {
        const parsed = JSON.parse(cachedProfile);
        return parsed.fullName || parsed.username || "";
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

  // Product selection state (Step 3 opt)
  const [selectedProducts, setSelectedProducts] = useState<CartProduct[]>([]);

  // Delivery & Pickup dates
  const [pickupDateStr, setPickupDateStr] = useState("");
  const [pickupTimeSlot, setPickupTimeSlot] = useState("08:00 - 10:00");
  const [deliveryDateStr, setDeliveryDateStr] = useState("");
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState("14:00 - 16:00");

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync city & district when selectedStore changes
  useEffect(() => {
    const store = stores.find((s) => s.id === selectedStoreId);
    if (store?.city === "hanoi" || store?.city === "hcm") {
      setCity(store.city);
    }
  }, [selectedStoreId, stores]);

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

  const timeSlots = [
    "08:00 - 10:00",
    "10:00 - 12:00",
    "14:00 - 16:00",
    "16:00 - 18:00",
    "19:00 - 21:00",
  ];

  // Financial values (Sequence 1 Step 22)
  const subtotal = cartItems.reduce(
    (sum, item) =>
      sum +
      (item.estimatedLineTotal ??
        item.unitPrice * (item.estimatedQuantity ?? item.quantity)),
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
    } else if (
      !/^(0[3|5|7|8|9])+([0-9]{8})$/.test(phoneNumber.replace(/\s+/g, ""))
    ) {
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

    if (dDate < pDate) {
      newErrors.deliveryDate =
        "Thời gian giao trả đồ không được sớm hơn ngày thu nhận.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (): Promise<LaundryOrder | null> => {
    if (activeStep !== 4 || maxCompletedStep < 3) {
      showToast(
        "Vui lòng hoàn thành tuần tự các Bước 1, 2, 3 trước khi xác nhận đặt đơn.",
        "warning",
      );
      return null;
    }

    if (!validateForm()) return null;

    const cachedProfile = localStorage.getItem("sachse_user_profile");
    let currentUserId = "";
    if (cachedProfile) {
      try {
        const parsed = JSON.parse(cachedProfile);
        currentUserId = parsed.id || parsed._id || parsed.username || "";
      } catch (e) {}
    }

    const validCartItems = cartItems.filter(isValidCartItem).map((item) => {
      const estQty = Number(item.estimatedQuantity ?? item.quantity ?? 1);
      return {
        ...item,
        quantity: estQty,
        estimatedQuantity: estQty,
        fabricType: item.fabricType || "Cotton / Đồ mặc hàng ngày",
        careInstructions:
          item.careInstructions || "Giặt nước ấm tiêu chuẩn, gấp gọn",
        estimatedLineTotal: estQty * item.unitPrice,
      };
    });

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
        "Vui lòng thêm ít nhất 1 dòng dịch vụ giặt hoặc sản phẩm trước khi gửi đơn.",
        "warning",
      );
      return null;
    }

    const selectedStore =
      stores.find((s) => s.id === selectedStoreId) || stores[0];

    const compiledOrder: LaundryOrder = {
      id: "",
      userId: currentUserId,
      storeId: selectedStore?.id || "store-hcm-q1",
      storeName: selectedStore?.name || "Tiệm Giặt Sấy Vô Trùng Q1",
      customerName: fullname.trim(),
      phoneNumber: phoneNumber.replace(/\s+/g, ""),
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
      estimatedSubtotal: subtotal,
      productsTotal,
      deliveryFee,
      totalPrice: grandTotal,
      status: "pending",
      weightConfirmStatus: "not_weighed",
      paymentMethod,
      paymentStatus: "pending",
      aiInspection: lastAiResult || undefined,
      createdAt: new Date().toISOString(),
    };

    try {
      const orderRes = await laundryOrdersAPI.create({
        ...compiledOrder,
        aiInspection: lastAiResult || undefined,
      });
      const savedOrder = orderRes.data?.data;

      try {
        await bookingsAPI.create({
          name: compiledOrder.customerName,
          phone: compiledOrder.phoneNumber,
          address: compiledOrder.address,
          district: compiledOrder.district,
          pickupDate: compiledOrder.pickupDate,
          pickupTime: compiledOrder.pickupTime,
          deliveryDate: compiledOrder.deliveryDate,
          deliveryTime: compiledOrder.deliveryTime,
          notes: compiledOrder.notes || undefined,
          promoCode: compiledOrder.promoCode,
          discountAmount: compiledOrder.discountAmount,
          subtotal: compiledOrder.subtotal,
          productsTotal: compiledOrder.productsTotal,
          deliveryFee: compiledOrder.deliveryFee,
          totalPrice: compiledOrder.totalPrice,
          items: compiledOrder.items,
          service: compiledOrder.items[0]?.serviceId,
          products: compiledOrder.products,
        });
      } catch {
        // non-blocking secondary sync
      }

      const orderId =
        savedOrder?.id ||
        savedOrder?._id?.toString() ||
        "ORD-" + Math.floor(1000 + Math.random() * 9000);
      const createdAt = savedOrder?.createdAt || new Date().toISOString();
      const normalizedOrder: LaundryOrder = {
        ...compiledOrder,
        id: orderId,
        createdAt,
        userId:
          savedOrder?.userId?._id?.toString() ||
          savedOrder?.userId ||
          currentUserId,
        totalPrice: savedOrder?.totalPrice ?? compiledOrder.totalPrice,
        subtotal: savedOrder?.subtotal ?? compiledOrder.subtotal,
        estimatedSubtotal:
          savedOrder?.estimatedSubtotal ?? compiledOrder.estimatedSubtotal,
        productsTotal: savedOrder?.productsTotal ?? compiledOrder.productsTotal,
        deliveryFee: savedOrder?.deliveryFee ?? compiledOrder.deliveryFee,
        discountAmount:
          savedOrder?.discountAmount ?? compiledOrder.discountAmount,
        status: "pending",
        weightConfirmStatus: "not_weighed",
      };

      setMaxCompletedStep(4);
      sessionStorage.removeItem("sachse_cart_draft");
      sessionStorage.removeItem("sachse_promo_draft");

      showToast(
        `Đã tạo đơn #${orderId} thành công! Đơn đang chờ cửa hàng xác nhận & điều phối Shipper.`,
        "success",
      );

      return normalizedOrder;
    } catch (error: any) {
      const serverErrors = error?.response?.data?.errors;
      const serverMessage =
        serverErrors?.[0]?.message ||
        error?.response?.data?.message ||
        error?.message ||
        "Lỗi server không xác định.";

      showToast(`Lỗi lưu đơn giặt: ${serverMessage}`, "error");
      return null;
    }
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
    activeStep,
    maxCompletedStep,
    handleStepClick,
    handleConfirmStep1,
    handleConfirmStep2,
    handleConfirmStep3,
    handlePrevStep,
    stores,
    services,
    catalogProducts,
    selectedStoreId,
    setSelectedStoreId,
    cartItems,
    handleAddLineItem,
    handleUpdateLineItem,
    handleRemoveLineItem,
    aiModalOpen,
    setAiModalOpen,
    activeLineIndexForAi,
    handleOpenAiScanner,
    handleApplyAiResult,
    paymentMethod,
    setPaymentMethod,
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
