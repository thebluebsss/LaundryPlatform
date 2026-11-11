import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  storesAPI,
  servicesAPI,
  productsAPI,
  laundryOrdersAPI,
} from "../../../services/api";
import {
  LaundryStore,
  LaundryService,
  CartItem,
  GarmentInspectionResult,
} from "../../../types";
import { useToast } from "../../../components/Toast";
import { getScopedProfile } from "../../../utils/authStorage";
import { HANOI_DISTRICTS } from "../../../data";

export interface MobileCareProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  description: string;
}

export interface MobileCartProduct {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  unit: string;
}

export const useMobileCustomerCreateOrder = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // Sequential Wizard Stepper State (Steps 1 -> 2 -> 3 -> 4, non-skippable)
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);
  const [maxCompletedStep, setMaxCompletedStep] = useState<number>(0);

  const [stores, setStores] = useState<LaundryStore[]>([]);
  const [services, setServices] = useState<LaundryService[]>([]);
  const [careProducts, setCareProducts] = useState<MobileCareProduct[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<MobileCartProduct[]>(
    [],
  );
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const [lineItems, setLineItems] = useState<CartItem[]>([]);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [activeLineIndexForAi, setActiveLineIndexForAi] = useState<number>(0);

  // Customer contact & schedule prefilled strictly from authenticated profile
  const [customerName, setCustomerName] = useState(() => {
    const parsed = getScopedProfile("customer");
    return parsed?.fullName || parsed?.username || "";
  });

  const [phoneNumber, setPhoneNumber] = useState(() => {
    const parsed = getScopedProfile("customer");
    return parsed?.phone || "";
  });

  const [address, setAddress] = useState(() => {
    const parsed = getScopedProfile("customer");
    return parsed?.address || "";
  });

  const [district, setDistrict] = useState<string>(HANOI_DISTRICTS[0].name);
  const [customerCoords, setCustomerCoords] = useState<{
    lat: number;
    lng: number;
  }>({
    lat: HANOI_DISTRICTS[0].lat,
    lng: HANOI_DISTRICTS[0].lng,
  });

  const handleDistrictChange = (nextDistrict: string) => {
    setDistrict(nextDistrict);
    const matched = HANOI_DISTRICTS.find((d) => d.name === nextDistrict);
    if (matched) {
      setCustomerCoords({ lat: matched.lat, lng: matched.lng });
    }
  };

  // Auto-detect customer's real GPS location when available
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCustomerCoords({
            lat: Number(pos.coords.latitude.toFixed(6)),
            lng: Number(pos.coords.longitude.toFixed(6)),
          });
        },
        () => {
          // keep selected Hanoi district center if permission declined
        },
        { enableHighAccuracy: true, timeout: 8000 },
      );
    }
  }, []);

  const [pickupDate, setPickupDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [pickupTime, setPickupTime] = useState("09:00 - 11:00");
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const tomorrow = new Date(Date.now() + 86400000);
    return tomorrow.toISOString().split("T")[0];
  });
  const [deliveryTime, setDeliveryTime] = useState("16:00 - 18:00");
  const [promoCode, setPromoCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"vietqr" | "cod">("cod");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lastAiResult, setLastAiResult] =
    useState<GarmentInspectionResult | null>(null);

  const loadInitialCatalog = useCallback(async () => {
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
      const normalizedProducts: MobileCareProduct[] = rawProducts.map(
        (p: any) => ({
          id: p.customId || p.id || p._id,
          name: p.name,
          category: p.category || "care",
          price: Number(p.price || 0),
          unit: p.unit || "Sản phẩm",
          description: p.description || "",
        }),
      );

      setStores(loadedStores);
      setServices(normalizedServices);
      setCareProducts(normalizedProducts);

      const queryStoreId = searchParams.get("storeId");
      const defaultStore =
        loadedStores.find((s) => s.id === queryStoreId) ||
        loadedStores.find((s) => s.status === "open") ||
        loadedStores[0];
      if (defaultStore) {
        setSelectedStoreId((prev) => prev || defaultStore.id);
      }

      const queryServiceId = searchParams.get("serviceId");
      const firstSvc =
        normalizedServices.find((s) => s.id === queryServiceId) ||
        normalizedServices[0];

      if (firstSvc && lineItems.length === 0) {
        setLineItems([
          {
            serviceId: firstSvc.id,
            serviceName: firstSvc.name,
            quantity: 3,
            estimatedQuantity: 3,
            unitPrice: firstSvc.unitPrice,
            pricingType: firstSvc.pricingType,
            unitName: firstSvc.unitName,
            fabricType: "Cotton / Đồ mặc hàng ngày",
            careInstructions: "Giặt nước ấm tiêu chuẩn, gấp gọn",
            estimatedLineTotal: 3 * firstSvc.unitPrice,
          },
        ]);
      }

      if (searchParams.get("openAi") === "1") {
        setAiModalOpen(true);
      }
    } catch {
      showToast("Không thể tải danh mục dịch vụ", "error");
    }
  }, [searchParams, showToast, lineItems.length]);

  useEffect(() => {
    loadInitialCatalog();
  }, [loadInitialCatalog]);

  // Stepper navigation & validation handlers
  const handleStepClick = (targetStep: 1 | 2 | 3 | 4) => {
    if (targetStep <= maxCompletedStep + 1) {
      setActiveStep(targetStep);
    } else {
      showToast(
        `Vui lòng hoàn thành và xác nhận Bước ${maxCompletedStep + 1} trước khi sang Bước ${targetStep}.`,
        "warning",
      );
    }
  };

  const handleConfirmStep1 = () => {
    if (!selectedStoreId) {
      showToast("Vui lòng chọn 1 tiệm giặt sấy phục vụ (Bước 1).", "warning");
      return;
    }
    setMaxCompletedStep((prev) => Math.max(prev, 1));
    setActiveStep(2);
  };

  const handleConfirmStep2 = () => {
    const validLines = lineItems.filter(
      (item) =>
        item.serviceId &&
        Number(item.estimatedQuantity ?? item.quantity ?? 0) > 0,
    );
    if (validLines.length === 0) {
      showToast(
        "Vui lòng kê khai ít nhất 1 dòng đồ giặt hợp lệ với số lượng > 0 (Bước 2).",
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

  const handleAddLineItem = () => {
    const defaultSvc = services[0];
    if (!defaultSvc) return;
    setLineItems((prev) => [
      ...prev,
      {
        serviceId: defaultSvc.id,
        serviceName: defaultSvc.name,
        quantity: 1,
        estimatedQuantity: 1,
        unitPrice: defaultSvc.unitPrice,
        pricingType: defaultSvc.pricingType,
        unitName: defaultSvc.unitName,
        fabricType: "Đồ trắng (Áo sơ mi / Phông trắng)",
        careInstructions: "Giặt riêng tránh lem màu",
        estimatedLineTotal: defaultSvc.unitPrice,
      },
    ]);
  };

  const handleUpdateLineItem = (index: number, patch: Partial<CartItem>) => {
    setLineItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, ...patch } : item)),
    );
  };

  const handleRemoveLineItem = (index: number) => {
    setLineItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateProductQuantity = (
    product: MobileCareProduct,
    delta: number,
  ) => {
    setSelectedProducts((prev) => {
      const existing = prev.find((p) => p.productId === product.id);
      if (!existing) {
        if (delta <= 0) return prev;
        return [
          ...prev,
          {
            productId: product.id,
            productName: product.name,
            quantity: delta,
            unitPrice: product.price,
            unit: product.unit,
          },
        ];
      }
      const nextQty = existing.quantity + delta;
      if (nextQty <= 0) {
        return prev.filter((p) => p.productId !== product.id);
      }
      return prev.map((p) =>
        p.productId === product.id ? { ...p, quantity: nextQty } : p,
      );
    });
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
              (lineItems[activeLineIndexForAi]?.estimatedQuantity || 1) *
              matchedSvc.unitPrice,
          }
        : {}),
      fabricType: result.detectedFabric,
      garmentDescription: result.garmentType,
      careInstructions: result.careInstructions.join(", "),
    });
  };

  const pricingSummary = useMemo(() => {
    const estimatedSubtotal = lineItems.reduce(
      (sum, item) =>
        sum +
        (item.estimatedLineTotal ??
          (item.estimatedQuantity || item.quantity) * item.unitPrice),
      0,
    );
    const productsTotal = selectedProducts.reduce(
      (sum, p) => sum + p.quantity * p.unitPrice,
      0,
    );
    const deliveryFee =
      estimatedSubtotal + productsTotal >= 200000 ? 0 : 25000;
    const discountAmount =
      promoCode.trim().toUpperCase() === "GIATMOI15"
        ? Math.round(estimatedSubtotal * 0.15)
        : 0;
    const totalPrice = Math.max(
      0,
      estimatedSubtotal + productsTotal + deliveryFee - discountAmount,
    );
    return {
      estimatedSubtotal,
      productsTotal,
      deliveryFee,
      discountAmount,
      totalPrice,
    };
  }, [lineItems, selectedProducts, promoCode]);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeStep !== 4 || maxCompletedStep < 3) {
      showToast(
        "Vui lòng hoàn thành tuần tự các Bước 1, 2, 3 trước khi xác nhận đặt lịch.",
        "warning",
      );
      return;
    }
    if (!customerName.trim() || !phoneNumber.trim() || !address.trim()) {
      showToast(
        "Vui lòng điền đầy đủ Họ tên, SĐT và Địa chỉ lấy đồ",
        "warning",
      );
      return;
    }
    if (lineItems.length === 0) {
      showToast("Vui lòng thêm ít nhất 1 dòng đồ giặt", "warning");
      return;
    }

    const parsed = getScopedProfile("customer");
    const currentUserId = parsed?.id || parsed?._id || parsed?.username || "";

    setSubmitting(true);
    try {
      const selectedStore = stores.find((s) => s.id === selectedStoreId);
      const orderPayload = {
        userId: currentUserId,
        storeId: selectedStore?.id || "store-hn-hoankiem",
        storeName: selectedStore?.name || "Tiệm Giặt Sạch Sẽ Hoàn Kiếm",
        customerName: customerName.trim(),
        phoneNumber: phoneNumber.trim(),
        address: address.trim(),
        district,
        customerCoordinates: customerCoords,
        autoBroadcast: true,
        items: lineItems,
        products: selectedProducts,
        pickupDate,
        pickupTime,
        deliveryDate,
        deliveryTime,
        notes,
        promoCode: promoCode.trim().toUpperCase(),
        discountAmount: pricingSummary.discountAmount,
        subtotal: pricingSummary.estimatedSubtotal,
        estimatedSubtotal: pricingSummary.estimatedSubtotal,
        productsTotal: pricingSummary.productsTotal,
        deliveryFee: pricingSummary.deliveryFee,
        totalPrice: pricingSummary.totalPrice,
        paymentMethod,
        aiInspection: lastAiResult || undefined,
      };

      await laundryOrdersAPI.create({
        ...orderPayload,
        status: "pending",
        weightConfirmStatus: "not_weighed",
      });

      setMaxCompletedStep(4);
      showToast(
        "Đặt lịch thành công! Hệ thống đang phát sóng đơn trong bán kính 1km tới các tài xế đang trực tuyến.",
        "success",
      );
      navigate("/mobile-customer/tracking");
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Không thể tạo đơn giặt lúc này",
        "error",
      );
    } finally {
      setSubmitting(false);
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
    careProducts,
    selectedProducts,
    handleUpdateProductQuantity,
    selectedStoreId,
    setSelectedStoreId,
    lineItems,
    handleAddLineItem,
    handleUpdateLineItem,
    handleRemoveLineItem,
    aiModalOpen,
    setAiModalOpen,
    activeLineIndexForAi,
    handleOpenAiScanner,
    handleApplyAiResult,
    customerName,
    setCustomerName,
    phoneNumber,
    setPhoneNumber,
    address,
    setAddress,
    district,
    setDistrict,
    handleDistrictChange,
    customerCoords,
    setCustomerCoords,
    pickupDate,
    setPickupDate,
    pickupTime,
    setPickupTime,
    deliveryDate,
    setDeliveryDate,
    deliveryTime,
    setDeliveryTime,
    promoCode,
    setPromoCode,
    paymentMethod,
    setPaymentMethod,
    notes,
    setNotes,
    pricingSummary,
    submitting,
    handleSubmitOrder,
  };
};
