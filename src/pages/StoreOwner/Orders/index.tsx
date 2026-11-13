import React, { useState, useMemo } from "react";
import { Search, Plus, Users } from "lucide-react";
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
    isPosModalOpen,
    setIsPosModalOpen,
    orderToDelete,
    setOrderToDelete,
    handleSaveWeighOrder,
    handleBroadcastPickup,
    handleBroadcastDelivery,
    handleConfirmHandoverFromShipper,
    handleUpdateOrderStatus,
    handleCreatePosOrder,
    handleDeleteOrder,
    handleReplyOrderReview,
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
            Theo dõi tiến độ giặt sấy, xem yêu cầu đặc biệt của khách, cân khối
            lượng thực tế và tạo đơn tại quầy.
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
