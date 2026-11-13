import { Box, Typography, Stack } from "@mui/material";
import { Package, Search } from "lucide-react";
import { OrdersTable } from "./components/OrdersTable";
import { InputText } from "../../../components/InputText";
import { ButtonOutLine } from "../../../components/ButtonCustom";
import { useAdminOrders } from "./hook";

export const AdminOrders = () => {
  const {
    navigate,
    searchQuery,
    setSearchQuery,
    loading,
    error,
    filteredOrders,
    loadOrders,
    handleUpdateStatus,
  } = useAdminOrders();

  return (
    <Box className="p-6 space-y-6">
      {/* Header */}
      <Box className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <Box>
          <Typography
            variant="h4"
            sx={{ fontSize: "24px", fontWeight: "bold", color: "slate.900" }}
          >
            <Package className="w-6 h-6 inline mr-2 text-blue-600" />
            Quản Lý Đơn Hàng
          </Typography>
          <Typography variant="body2" className="text-slate-500 mt-1">
            Theo dõi và quản lý tất cả đơn hàng giặt là
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <ButtonOutLine
            onClick={() => navigate("/admin/dashboard")}
            label="← Về Dashboard"
            className="!w-auto !h-10 !px-4"
            textClassName="!text-xs"
          />
        </Stack>
      </Box>

      {/* Search using global InputText */}
      <Box className="bg-white p-4 rounded-2xl border border-slate-100">
        <InputText
          placeholder="Tìm theo tên khách hàng, mã đơn, số điện thoại..."
          startAdornment={<Search className="w-4 h-4 text-slate-400" />}
          inputProps={{
            value: searchQuery,
            onChange: (e: any) => setSearchQuery(e.target.value),
          }}
        />
      </Box>

      {/* Loading/Error States */}
      {loading && (
        <Box className="bg-white p-8 rounded-2xl border border-slate-100 text-center">
          <Typography className="text-slate-500">
            Đang tải dữ liệu...
          </Typography>
        </Box>
      )}

      {error && (
        <Box className="bg-red-50 p-4 rounded-2xl border border-red-200 text-center space-y-2">
          <Typography className="text-red-600 text-sm font-medium">
            {error}
          </Typography>
          <ButtonOutLine
            onClick={loadOrders}
            label="Thử lại"
            className="!w-auto !h-9 !px-4 mx-auto"
            textClassName="!text-xs"
          />
        </Box>
      )}

      {/* Orders Table */}
      {!loading && !error && (
        <OrdersTable
          orders={filteredOrders}
          onOrdersChange={loadOrders}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </Box>
  );
};
