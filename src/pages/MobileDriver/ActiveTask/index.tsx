import React from "react";
import { useNavigate } from "react-router-dom";
import { Navigation, RefreshCw, Bike } from "lucide-react";
import { useMobileDriverActiveTask } from "./hook";
import { DriverStepControl } from "./components/DriverStepControl";
import { ButtonCustom } from "../../../components/ButtonCustom";

export const MobileDriverActiveTask: React.FC = () => {
  const navigate = useNavigate();
  const {
    activeTasks,
    loading,
    updatingId,
    fetchActiveTasks,
    handleAdvanceStatus,
  } = useMobileDriverActiveTask();

  return (
    <div className="space-y-4 pb-8 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-black text-emerald-600">
            <Navigation className="w-4 h-4" />
            <span>Điều Hướng & Bàn Giao Giỏ Đồ</span>
          </div>
          <h2 className="text-base font-black text-slate-900 mt-0.5">
            Chuyến Đang Thực Hiện ({activeTasks.length})
          </h2>
        </div>

        <button
          type="button"
          onClick={fetchActiveTasks}
          className="h-9 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Làm mới</span>
        </button>
      </div>

      <div className="space-y-3">
        {activeTasks.map((task) => (
          <DriverStepControl
            key={task.id}
            task={task}
            updatingId={updatingId}
            onAdvanceStatus={handleAdvanceStatus}
          />
        ))}

        {!loading && activeTasks.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
            <Bike className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="space-y-1">
              <p className="text-sm font-black text-slate-900">
                Bạn chưa có chuyến nào đang chạy
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Hãy mở Sàn Nhận Chuyến để nhận lệnh thu gom đồ bẩn hoặc giao đồ sạch gần bạn.
              </p>
            </div>
            <ButtonCustom
              type="button"
              onClick={() => navigate("/mobile-driver/radar")}
              label="Mở Sàn Nhận Chuyến Ngay →"
              className="!h-10 !w-auto !px-5 !text-xs mx-auto !bg-emerald-600 hover:!bg-emerald-700"
              textClassName="!text-xs"
            />
          </div>
        )}
      </div>
    </div>
  );
};
