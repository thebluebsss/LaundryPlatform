import { Box, Button, Chip } from "@mui/material";
import { LaundryOrder, OrderStatus } from "../../../../types";
import { Eye, Clock } from "lucide-react";
import { useState } from "react";
import { AdminOrderModal } from "../../Dashboard/components/AdminOrderModal";

interface OrdersTableProps {
  orders: LaundryOrder[];
  onOrdersChange: () => void;
  onUpdateStatus: (id: string, status: OrderStatus) => void;
}

export const OrdersTable = ({
  orders,
  onUpdateStatus,
}: OrdersTableProps) => {
  const [selectedOrder, setSelectedOrder] = useState<LaundryOrder | null>(null);

  const statuses = [
    { value: "pending" as OrderStatus, label: "Chờ nhận", color: "#f59e0b" },
    { value: "sorting" as OrderStatus, label: "Phân loại", color: "#8b5cf6" },
    { value: "washing" as OrderStatus, label: "Đang giặt", color: "#3b82f6" },
    { value: "ironing" as OrderStatus, label: "Là ủi", color: "#06b6d4" },
    {
      value: "delivering" as OrderStatus,
      label: "Giao hàng",
      color: "#10b981",
    },
    {
      value: "completed" as OrderStatus,
      label: "Hoàn thành",
      color: "#22c55e",
    },
    { value: "cancelled" as OrderStatus, label: "Đã hủy", color: "#ef4444" },
  ];

  const getStatusColor = (status: OrderStatus) => {
    return statuses.find((s) => s.value === status)?.color || "#94a3b8";
  };

  const handleUpdateStatus = (id: string, status: OrderStatus) => {
    onUpdateStatus(id, status);
    if (selectedOrder && selectedOrder.id === id) {
      setSelectedOrder({ ...selectedOrder, status });
    }
  };

  const formatPrice = (num: number) => num.toLocaleString("vi-VN") + " đ";

  return (
    <>
      <Box className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <Box className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Mã đơn
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Số ĐT
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-slate-400"
                  >
                    Không có đơn hàng nào
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-mono text-slate-800">
                      #{order.id.substring(0, 8)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                      {order.customerName}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {order.phoneNumber}
                    </td>
                    <td className="px-4 py-3">
                      <Chip
                        label={
                          statuses.find((s) => s.value === order.status)?.label
                        }
                        size="small"
                        sx={{
                          backgroundColor: getStatusColor(order.status) + "20",
                          color: getStatusColor(order.status),
                          fontWeight: "bold",
                          fontSize: "11px",
                        }}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-blue-600">
                      {formatPrice(order.totalPrice)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      <Box className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                      </Box>
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        onClick={() => setSelectedOrder(order)}
                        size="small"
                        variant="outlined"
                        sx={{
                          minWidth: "auto",
                          px: 1.5,
                          py: 0.5,
                          fontSize: "11px",
                          fontWeight: "bold",
                          borderRadius: "8px",
                          textTransform: "none",
                        }}
                        startIcon={<Eye className="w-3.5 h-3.5" />}
                      >
                        Xem
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Box>
      </Box>

      {selectedOrder && (
        <AdminOrderModal
          orderDetails={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          statuses={statuses.map((status) => ({
            ...status,
            color: `border border-${status.color.replace("#", "")} bg-white text-slate-800`,
          }))}
          handleUpdateStatus={handleUpdateStatus}
        />
      )}
    </>
  );
};
