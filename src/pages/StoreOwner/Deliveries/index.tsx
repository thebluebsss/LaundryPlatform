import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Truck,
  Plus,
  ArrowLeft,
  MapPin,
  Phone,
  Bike,
  CheckCircle2,
  Radio,
} from "lucide-react";
import { useStoreOwnerDeliveries } from "./hook";
import { DispatchTaskModal } from "./components/DispatchTaskModal";
import { ButtonCustom, ButtonOutLine } from "../../../components/ButtonCustom";
import { InputSelect } from "../../../components/InputSelect";

const TASK_STATUS_LABELS: Record<string, string> = {
  broadcasting: "Đang phát sóng tìm tài xế",
  accepted: "Tài xế đã nhận chuyến",
  picking_up: "Đang di chuyển lấy đồ",
  arrived_pickup: "Đã tới điểm lấy đồ",
  in_transit: "Đang vận chuyển",
  completed: "Đã giao nhận xong",
  cancelled: "Đã hủy chuyến",
};

export const StoreOwnerDeliveries: React.FC = () => {
  const navigate = useNavigate();
  const {
    tasks,
    drivers,
    loading,
    taskTypeFilter,
    setTaskTypeFilter,
    statusFilter,
    setStatusFilter,
    isDispatchModalOpen,
    setIsDispatchModalOpen,
    handleAssignDriver,
    handleUpdateTaskStage,
    handleCreateDispatchTask,
  } = useStoreOwnerDeliveries();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-indigo-600 font-bold">
            <Truck className="w-4 h-4" />
            <span>Điều Phối Giao Nhận & Đội Ngũ Tài Xế (Bảng delivery_tasks)</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-slate-900 mt-1">
            Quản Lý Chuyến Lấy Đồ Bẩn & Giao Đồ Sạch
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi thời gian thực các chuyến thu gom 2 chiều và phân công shipper thuộc chi nhánh.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <ButtonOutLine
            onClick={() => navigate("/store-owner/dashboard")}
            iconStart={<ArrowLeft className="w-4 h-4" />}
            label="Tổng Quan Tiệm"
            className="!w-auto !h-10 !px-4 whitespace-nowrap"
            textClassName="!text-xs"
          />
          <ButtonCustom
            onClick={() => setIsDispatchModalOpen(true)}
            iconStart={<Plus className="w-4 h-4" />}
            label="Tạo Chuyến Điều Phối"
            className="!w-auto !h-10 !px-4 whitespace-nowrap"
            textClassName="!text-xs"
          />
        </div>
      </div>

      {/* Main Split: Tasks List (Left 8 cols) + Branch Drivers Roster (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-4">
          {/* Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputSelect
              title="Loại chuyến giao nhận"
              value={taskTypeFilter}
              options={[
                { value: "all", label: "Tất cả chiều lấy & giao" },
                {
                  value: "pickup_from_customer",
                  label: "Chiều lấy đồ bẩn (Khách → Tiệm)",
                },
                {
                  value: "deliver_to_customer",
                  label: "Chiều trả đồ sạch (Tiệm → Khách)",
                },
              ]}
              onChange={(e) => setTaskTypeFilter(e.target.value)}
            />
            <InputSelect
              title="Trạng thái chuyến"
              value={statusFilter}
              options={[
                { value: "all", label: "Tất cả trạng thái" },
                { value: "broadcasting", label: "Đang phát sóng tìm tài xế" },
                { value: "accepted", label: "Tài xế đã nhận" },
                { value: "in_transit", label: "Đang trên đường giao/nhận" },
                { value: "completed", label: "Đã hoàn thành" },
              ]}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
          </div>

          {/* Tasks Cards */}
          {loading ? (
            <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
              Đang tải danh sách chuyến giao nhận...
            </div>
          ) : tasks.length === 0 ? (
            <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center space-y-3">
              <p className="text-slate-500 text-sm font-semibold">
                Không có chuyến giao nhận nào trong bộ lọc này.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono font-black text-slate-900">
                        #{task.orderId}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-bold text-blue-600">
                        {task.taskType === "deliver_to_customer"
                          ? "Giao trả đồ sạch cho khách"
                          : "Thu gom đồ bẩn về tiệm"}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-slate-500 tabular-nums">
                        {task.distanceKm || 2.2} km ·{" "}
                        {(task.shippingFee || 20000).toLocaleString("vi-VN")}đ
                      </span>
                    </div>

                    <span
                      className={`text-xs font-bold flex items-center gap-1 ${
                        task.status === "broadcasting"
                          ? "text-amber-600"
                          : task.status === "completed"
                          ? "text-emerald-600"
                          : "text-blue-600"
                      }`}
                    >
                      {task.status === "broadcasting" ? (
                        <Radio className="w-3.5 h-3.5" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      {TASK_STATUS_LABELS[task.status] || task.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-slate-400 font-bold">
                        Khách hàng & Điểm hẹn:
                      </span>
                      <div className="font-bold text-slate-900">
                        {task.customerName} ·{" "}
                        <span className="font-mono tabular-nums">
                          {task.customerPhone}
                        </span>
                      </div>
                      <div className="text-slate-600 flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>{task.customerAddress}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-slate-400 font-bold">
                        Tài xế phụ trách:
                      </span>
                      {task.driverName ? (
                        <div className="space-y-1">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <Bike className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{task.driverName}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono text-slate-600 tabular-nums">
                              {task.driverPhone}
                            </span>
                          </div>
                          <p className="text-slate-500">
                            Chi nhánh: {task.storeName}
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 pt-1">
                          <select
                            defaultValue=""
                            onChange={(e) => {
                              const drv = drivers.find(
                                (d) => d.id === e.target.value
                              );
                              if (drv) handleAssignDriver(task, drv);
                            }}
                            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 cursor-pointer"
                          >
                            <option value="" disabled>
                              + Gán nhanh Tài xế chi nhánh...
                            </option>
                            {drivers.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name} ({d.phone})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  {task.notes && (
                    <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      Ghi chú: {task.notes}
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-end gap-2">
                    {task.status !== "completed" && (
                      <>
                        <ButtonOutLine
                          onClick={() =>
                            handleUpdateTaskStage(task, "in_transit")
                          }
                          label="Đang Vận Chuyển"
                          className="!w-auto !h-8 !px-3 !text-xs"
                          textClassName="!text-xs"
                        />
                        <ButtonCustom
                          onClick={() =>
                            handleUpdateTaskStage(task, "completed")
                          }
                          label="Xác Nhận Đã Bàn Giao Đồ"
                          className="!w-auto !h-8 !px-3.5 !text-xs"
                          textClassName="!text-xs"
                        />
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Active Store Drivers Roster */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900">
              Đội Tài Xế Trực Tại Chi Nhánh
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Danh sách Shipper thuộc biên chế cửa hàng (Bảng users · role: driver)
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {drivers.slice(0, 6).map((drv) => (
              <div
                key={drv.id}
                className="py-3 flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Bike className="w-3.5 h-3.5 text-blue-600" />
                    <span>{drv.name}</span>
                  </div>
                  <div className="text-slate-500 font-mono tabular-nums flex items-center gap-1.5">
                    <Phone className="w-3 h-3" />
                    <span>{drv.phone}</span>
                    <span aria-hidden="true">·</span>
                    <span>{drv.completedOrders} chuyến</span>
                  </div>
                </div>

                <span
                  className={`font-bold ${
                    drv.status === "available"
                      ? "text-emerald-600"
                      : "text-amber-600"
                  }`}
                >
                  {drv.status === "available" ? "Sẵn sàng" : "Đang đi đơn"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <DispatchTaskModal
        isOpen={isDispatchModalOpen}
        drivers={drivers}
        onClose={() => setIsDispatchModalOpen(false)}
        onCreate={handleCreateDispatchTask}
      />
    </div>
  );
};
