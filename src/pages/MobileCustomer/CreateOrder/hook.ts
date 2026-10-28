import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  storesAPI,
  servicesAPI,
  laundryOrdersAPI,
  deliveryAPI,
} from "../../../services/api";
import {
  LaundryStore,
  LaundryService,
  CartItem,
  GarmentInspectionResult,
} from "../../../types";
import { useToast } from "../../../components/Toast";

export const useMobileCustomerCreateOrder = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [stores, setStores] = useState<LaundryStore[]>([]);
  const [services, setServices] = useState<LaundryService[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const [lineItems, setLineItems] = useState<CartItem[]>([]);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [activeLineIndexForAi, setActiveLineIndexForAi] = useState<number>(0);

  // Customer contact & schedule
  const [customerName, setCustomerName] = useState(() => {
    try {
      const cached = localStorage.getItem("sachse_user_profile");
      if (cached) {
        const parsed = JSON.parse(cached);
        return parsed.fullName || parsed.username || "Nguyễn Minh Tâm";
      }
    } catch {
      // ignore
    }
    return "Nguyễn Minh Tâm";
  });
  const [phoneNumber, setPhoneNumber] = useState("0908112233");
  const [address, setAddress] = useState("45 Lê Thánh Tôn, Phường Bến Nghé");
  const [district, setDistrict] = useState("Quận 1");
  const [pickupDate, setPickupDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [pickupTime, setPickupTime] = useState("09:00 - 11:00");
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const tomorrow = new Date(Date.now() + 86400000);
    return tomorrow.toISOString().split("T")[0];
  });
  const [deliveryTime, setDeliveryTime] = useState("16:00 - 18:00");
  const [promoCode, setPromoCode] = useState("GIATMOI15");
  const [paymentMethod, setPaymentMethod] = useState<"vietqr" | "cod">("vietqr");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lastAiResult, setLastAiResult] =
    useState<GarmentInspectionResult | null>(null);

  const loadInitialCatalog = useCallback(async () => {
    try {
      const [storesRes, servicesRes] = await Promise.all([
        storesAPI.getAll(),
        servicesAPI.getAll(),
      ]);
      const loadedStores: LaundryStore[] = storesRes.data?.data?.stores || [];
      const loadedServices: LaundryService[] =
        servicesRes.data?.data?.services || [];

      setStores(loadedStores);
      setServices(loadedServices);

      const queryStoreId = searchParams.get("storeId");
      const defaultStore =
        loadedStores.find((s) => s.id === queryStoreId) ||
        loadedStores.find((s) => s.status === "open") ||
        loadedStores[0];
      if (defaultStore) {
        setSelectedStoreId(defaultStore.id);
      }

      const queryServiceId = searchParams.get("serviceId");
      const firstSvc =
        loadedServices.find((s) => s.id === queryServiceId) ||
        loadedServices[0];

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
      prev.map((item, idx) => (idx === index ? { ...item, ...patch } : item))
    );
  };

  const handleRemoveLineItem = (index: number) => {
    setLineItems((prev) => prev.filter((_, idx) => idx !== index));
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
      0
    );
    const deliveryFee = 25000;
    const discountAmount =
      promoCode.trim().toUpperCase() === "GIATMOI15"
        ? Math.round(estimatedSubtotal * 0.15)
        : 0;
    const totalPrice = Math.max(
      0,
      estimatedSubtotal + deliveryFee - discountAmount
    );
    return {
      estimatedSubtotal,
      deliveryFee,
      discountAmount,
      totalPrice,
    };
  }, [lineItems, promoCode]);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phoneNumber.trim() || !address.trim()) {
      showToast("Vui lòng điền đầy đủ Họ tên, SĐT và Địa chỉ lấy đồ", "warning");
      return;
    }
    if (lineItems.length === 0) {
      showToast("Vui lòng thêm ít nhất 1 dòng đồ giặt", "warning");
      return;
    }

    setSubmitting(true);
    try {
      const selectedStore = stores.find((s) => s.id === selectedStoreId);
      const orderPayload = {
        storeId: selectedStore?.id || "store-q1",
        storeName: selectedStore?.name || "Tiệm Giặt Sạch Sẽ Quận 1",
        customerName,
        phoneNumber,
        address,
        district,
        items: lineItems,
        pickupDate,
        pickupTime,
        deliveryDate,
        deliveryTime,
        notes,
        promoCode: promoCode.trim().toUpperCase(),
        discountAmount: pricingSummary.discountAmount,
        subtotal: pricingSummary.estimatedSubtotal,
        estimatedSubtotal: pricingSummary.estimatedSubtotal,
        deliveryFee: pricingSummary.deliveryFee,
        totalPrice: pricingSummary.totalPrice,
        paymentMethod,
        aiInspection: lastAiResult || undefined,
      };

      const res = await laundryOrdersAPI.create(orderPayload);
      const createdOrder = res.data?.data;

      // Broadcast a pickup task to nearby Shippers on the Driver Mobile App
      if (createdOrder?.id) {
        try {
          await deliveryAPI.createTask({
            orderId: createdOrder.id,
            taskType: "pickup_from_customer",
            storeId: selectedStore?.id || "store-q1",
            storeName: selectedStore?.name || "Tiệm Giặt Sạch Sẽ Quận 1",
            customerName,
            customerPhone: phoneNumber,
            customerAddress: `${address}, ${district}`,
            storeAddress:
              selectedStore?.address || "185 Nguyễn Trãi, Quận 1, TP.HCM",
            distanceKm: 1.8,
            shippingFee: pricingSummary.deliveryFee,
            notes: `Thu gom ${lineItems.length} dòng đồ giặt (${lineItems
              .map((i) => i.fabricType)
              .join(", ")})`,
          });
        } catch {
          // Non-blocking if task already created
        }
      }

      showToast(
        "Đã tạo đơn giặt & phát sóng gọi Shipper đến lấy đồ tận nhà!",
        "success"
      );
      navigate("/mobile-customer/tracking");
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Không thể tạo đơn giặt lúc này",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return {
    stores,
    services,
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
