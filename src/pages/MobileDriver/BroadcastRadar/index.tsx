import React from "react";
import { Radio, RefreshCw, Bike, MapPin } from "lucide-react";
import { useMobileDriverRadar } from "./hook";
import { BroadcastTaskCard } from "./components/BroadcastTaskCard";
import { InputSelect } from "../../../components/InputSelect";

export const MobileDriverRadar: React.FC = () => {
  const {
    tasks,
    drivers,
    selectedDriver,
    setSelectedDriver,
    isOnline,
    handleToggleOnline,
    loading,
    acceptingId,
    taskTypeFilter,
    setTaskTypeFilter,
    fetchRadarData,
    handleAcceptTask,
  } = useMobileDriverRadar();

  const driverOptions = drivers.map((d) => ({
    value: d.id,
    label: `${d.name} (${d.phone}) — ${d.storeName}`,
  }));

  return (
    <div className="space-y-4 pb-8 animate-in fade-in duration-200">
      {/* Driver Status & Identity Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isOnline ? "bg-emerald-600" : "bg-slate-700"
              }`}
            >
              <Bike className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xs text-slate-300 flex items-center gap-1.5">
                <span>Tài xế: {selectedDriver.name}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">{selectedDriver.phone}</span>
              </div>
              <h2 className="text-sm font-black">
                {isOnline
                  ? "Đang Trực Tuyến · Sẵn Sàng Nhận Chuyến"
                  : "Đang Tạm Nghỉ · Không Nhận Sóng"}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleOnline}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-colors cursor-pointer ${
              isOnline
                ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                : "bg-slate-700 text-slate-200 hover:bg-slate-600"
            }`}
          >
            {isOnline ? "Đang Bật GPS" : "Bật Trực Tuyến"}
          </button>
        </div>

        {driverOptions.length > 0 && (
          <div className="pt-2 border-t border-slate-800">
            <InputSelect
              title="Chuyển tài khoản Shipper đang trực"
              colorTitle="text-slate-300"
              value={selectedDriver.id}
              options={driverOptions}
              onChange={(e) => {
                const found = drivers.find((d) => d.id === e.target.value);
                if (found) {
                  setSelectedDriver({
                    id: found.id,
                    name: found.name,
                    phone: found.phone,
                  });
                }
              }}
            />
          </div>
        )}
      </div>

      {/* Filter & Refresh Control */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio
              className={`w-4 h-4 ${
                isOnline ? "text-emerald-600 animate-pulse" : "text-slate-400"
              }`}
            />
            <h3 className="text-sm font-black text-slate-900">
              Sàn Chuyến Đang Phát Sóng ({tasks.length})
            </h3>
          </div>
          <button
            type="button"
            onClick={fetchRadarData}
            className="h-9 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Quét đơn</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setTaskTypeFilter("all")}
            className={`py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              taskTypeFilter === "all"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Tất cả chuyến
          </button>
          <button
            type="button"
            onClick={() => setTaskTypeFilter("pickup_from_customer")}
            className={`py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              taskTypeFilter === "pickup_from_customer"
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Đi lấy đồ bẩn
          </button>
          <button
            type="button"
            onClick={() => setTaskTypeFilter("deliver_to_customer")}
            className={`py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              taskTypeFilter === "deliver_to_customer"
                ? "bg-white text-emerald-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Đi giao đồ sạch
          </button>
        </div>
      </div>

      {/* Broadcast Task List */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <BroadcastTaskCard
            key={task.id}
            task={task}
            acceptingId={acceptingId}
            onAcceptTask={handleAcceptTask}
          />
        ))}

        {!loading && tasks.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-2">
            <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-black text-slate-900">
              Hiện chưa có chuyến mới đang phát sóng
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Khi Khách hàng tạo đơn giặt mới hoặc Chủ cửa hàng phát lệnh giao đồ sạch, chuyến sẽ nổ ngay tại đây.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
