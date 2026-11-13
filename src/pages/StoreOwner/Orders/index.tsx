import React, { useState, useMemo } from "react";
import { Search, Plus, Users, X, Navigation } from "lucide-react";
import { useStoreOwnerOrders } from "./hook";
import { WeighAndInspectModal } from "./components/WeighAndInspectModal";
import { CreatePosOrderModal } from "./components/CreatePosOrderModal";
import {
  StoreCustomerBookPanel,
  StoreCustomerSummary,
} from "./components/StoreCustomerBookPanel";
import { StoreOrdersTable } from "./components/StoreOrdersTable";
import { ButtonCustom, ButtonOutLine } from "../../../components/ButtonCustom";
import { InputText } from "../../../components/InputText";
import { InputSelect } from "../../../components/InputSelect";
import { DialogConfirm } from "../../../components/DialogConfirm";
import { OrderChatDrawer } from "../../../components/OrderChatDrawer";
import { OrderLiveGpsMap } from "../../../components/OrderLiveGpsMap";
import { VietQrSheetModal } from "../../MobileCustomer/OrderTracking/components/VietQrSheetModal";
import { laundryOrdersAPI } from "../../../services/api";
import { useToast } from "../../../components/Toast";
import {
  ORDER_STATUS_LABELS,
  WEIGHT_CONFIRM_STATUS_LABELS,
} from "../../../utils/orderStatusLabels";

export const StoreOwnerOrders: React.FC = () => {
  const { showToast } = useToast();
  const {
    orders,
    reviewsMap,
    services,
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    weightFilter,
    setWeightFilter,
    weighingOrder,
    setWeighingOrder,
    chatOrder,
    setChatOrder,
    gpsOrder,
    setGpsOrder,
    paymentOrder,
    setPaymentOrder,
    isPosModalOpen,
    setIsPosModalOpen,
    orderToDelete,
    setOrderToDelete,
    loadOrdersAndServices,
    handleSaveWeighOrder,
    handleBroadcastPickup,
    handleBroadcastDelivery,
    handleConfirmHandoverFromShipper,
    handleUpdateOrderStatus,
    handleCreatePosOrder,
    handleDeleteOrder,
    handleReplyOrderReview,
    handleMessagesChanged,
  } = useStoreOwnerOrders();

  const [showCustomerBook, setShowCustomerBook] = useState(false);
  const [customerCareNotes, setCustomerCareNotes] = useState<
    Record<string, string>
  >(() => {
    try {
      const saved = localStorage.getItem("sachse_store_customer_notes");
      return saved
        ? JSON.parse(saved)
        : {
            "0908112233":
              "Khách quen VIP: Ưu tiên nước xả hương Lavender nhẹ, gấp áo sơ mi không kẹp ghim.",
          };
    } catch {
      return {};
    }
  });

  const storeCustomers = useMemo<StoreCustomerSummary[]>(() => {
    const map: Record<string, StoreCustomerSummary> = {};
    orders.forEach((o) => {
      const key = o.phoneNumber || o.customerName;
      if (!map[key]) {
        map[key] = {
          name: o.customerName,
          phone: o.phoneNumber,
          address: `${o.address}, ${o.district}`,
          orderCount: 0,
          totalSpent: 0,
          lastOrderId: o.id,
        };
      }
      map[key].orderCount += 1;
      map[key].totalSpent += Number(o.totalPrice || 0);
    });
    return Object.values(map);
  }, [orders]);

  const handleSaveCustomerCareNote = (phone: string, note: string) => {
    const next = { ...customerCareNotes, [phone]: note };
    setCustomerCareNotes(next);
    localStorage.setItem("sachse_store_customer_notes", JSON.stringify(next));
    showToast(
      `Đã lưu ghi chú chăm sóc vải riêng cho khách (${phone})!`,
      "success"
    );
  };

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const paginatedOrders = orders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Quản lý đơn giặt tại tiệm
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi Live GPS tài xế, chat trực tiếp theo mã đơn, cân khối lượng
            thực tế và đối soát thanh toán tự động.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <ButtonOutLine
            onClick={() => setShowCustomerBook(!showCustomerBook)}
            iconStart={<Users className="w-4 h-4" />}
            label={`Khách của tiệm (${storeCustomers.length})`}
            className="!w-auto !h-10 !px-4 whitespace-nowrap"
            textClassName="!text-xs"
          />
          <ButtonCustom
            onClick={() => setIsPosModalOpen(true)}
            iconStart={<Plus className="w-4 h-4" />}
            label="Tạo đơn tại quầy"
            className="!w-auto !h-10 !px-4 whitespace-nowrap"
            textClassName="!text-xs"
          />
        </div>
      </div>

      {/* Quản lý thông tin khách của tiệm */}
      {showCustomerBook && (
        <StoreCustomerBookPanel
          customers={storeCustomers}
          customerCareNotes={customerCareNotes}
          onSaveCustomerCareNote={handleSaveCustomerCareNote}
          onFilterByPhone={(phone) => {
            setSearchQuery(phone);
            setCurrentPage(1);
          }}
          onClose={() => setShowCustomerBook(false)}
        />
      )}

      {/* Filter Bar using global InputText and InputSelect */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <div className="md:col-span-5">
          <InputText
            title="Tìm kiếm đơn giặt"
            placeholder="Mã đơn (ORD-8821), tên khách, SĐT, yêu cầu của khách..."
            startAdornment={<Search className="w-4 h-4 text-slate-400" />}
            inputProps={{
              value: searchQuery,
              onChange: (e: any) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              },
            }}
          />
        </div>

        <div className="md:col-span-4">
          <InputSelect
            title="Trạng thái xác nhận cân nặng"
            value={weightFilter}
            options={[
              { value: "all", label: "Tất cả trạng thái cân" },
              {
                value: "not_weighed",
                label: WEIGHT_CONFIRM_STATUS_LABELS.not_weighed,
              },
              {
                value: "waiting_customer",
                label: WEIGHT_CONFIRM_STATUS_LABELS.waiting_customer,
              },
              {
                value: "accepted",
                label: WEIGHT_CONFIRM_STATUS_LABELS.accepted,
              },
              {
                value: "rejected_return",
                label: WEIGHT_CONFIRM_STATUS_LABELS.rejected_return,
              },
            ]}
            onChange={(e) => {
              setWeightFilter(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="md:col-span-3">
          <InputSelect
            title="Tiến độ xử lý đơn giặt"
            value={statusFilter}
            options={[
              { value: "all", label: "Tất cả tiến độ" },
              ...Object.entries(ORDER_STATUS_LABELS).map(([val, label]) => ({
                value: val,
                label,
              })),
            ]}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* High-Density Orders Table */}
      <StoreOrdersTable
        loading={loading}
        orders={orders}
        paginatedOrders={paginatedOrders}
        reviewsMap={reviewsMap}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={(page) => setCurrentPage(page)}
        onOpenPosModal={() => setIsPosModalOpen(true)}
        onWeighOrder={(ord) => setWeighingOrder(ord)}
        onOpenChat={(ord) => setChatOrder(ord)}
        onOpenGps={(ord) => setGpsOrder(ord)}
        onOpenPayment={(ord) => setPaymentOrder(ord)}
        onDeleteOrder={(ord) => setOrderToDelete(ord)}
        onBroadcastPickup={handleBroadcastPickup}
        onBroadcastDelivery={handleBroadcastDelivery}
        onConfirmHandoverFromShipper={handleConfirmHandoverFromShipper}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onReplyOrderReview={handleReplyOrderReview}
      />

      {/* Weigh & Inspect Modal */}
      <WeighAndInspectModal
        order={weighingOrder}
        services={services}
        onClose={() => setWeighingOrder(null)}
        onSave={handleSaveWeighOrder}
      />

      {/* Walk-in POS Order Modal */}
      <CreatePosOrderModal
        isOpen={isPosModalOpen}
        services={services}
        onClose={() => setIsPosModalOpen(false)}
        onCreate={handleCreatePosOrder}
      />

      {/* In-App Order Chat Drawer for Store Owner */}
      <OrderChatDrawer
        orderId={chatOrder?.id || null}
        isOpen={!!chatOrder}
        onClose={() => setChatOrder(null)}
        currentRole="store"
        currentSenderName={chatOrder?.storeName || "Chủ Tiệm Giặt Sạch Sẽ"}
        customerName={chatOrder?.customerName}
        storeName={chatOrder?.storeName}
        shipperName={chatOrder?.shipperName}
        initialMessages={chatOrder?.messages || []}
        onMessagesChanged={handleMessagesChanged}
      />

      {/* Live GPS Tracking Modal for Store Owner */}
      {gpsOrder && (
        <div className="fixed inset-0 z-[1200] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                  <Navigation className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    Bản Đồ Live GPS Tài Xế · Đơn #{gpsOrder.id.toUpperCase()}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Khách hàng: {gpsOrder.customerName} ({gpsOrder.phoneNumber})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setGpsOrder(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <OrderLiveGpsMap
              order={
                orders.find((o) => o.id === gpsOrder.id) || gpsOrder
              }
              heightClassName="h-[340px]"
            />
          </div>
        </div>
      )}

      {/* Electronic Payment & Auto-Reconciliation Modal */}
      <VietQrSheetModal
        order={paymentOrder}
        processing={false}
        onClose={() => setPaymentOrder(null)}
        onConfirmPaid={async (orderId) => {
          try {
            await laundryOrdersAPI.updateStatus(orderId, {
              paymentStatus: "paid",
            });
            setPaymentOrder(null);
            await loadOrdersAndServices();
          } catch {}
        }}
      />

      {/* Delete Confirmation Dialog */}
      <DialogConfirm
        isOpen={!!orderToDelete}
        onClose={() => setOrderToDelete(null)}
        onSubmit={handleDeleteOrder}
        isDelete
        textTitle="Xác nhận xóa đơn giặt"
        textContent={`Bạn có chắc chắn muốn xóa đơn giặt #${orderToDelete?.id} của khách hàng "${orderToDelete?.customerName}" khỏi danh sách cửa hàng?`}
        textCancel="Hủy bỏ"
        textButton="Xóa đơn"
      />
    </div>
  );
};
