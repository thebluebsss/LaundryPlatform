import React from 'react';
import { Search, Eye } from 'lucide-react';
import { LaundryOrder, OrderStatus } from '../../../../types';
import { 
  Stack, 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TextField, 
  InputAdornment, 
  Select, 
  MenuItem, 
  Button,
  Paper 
} from '@mui/material';

interface OrdersTableProps {
  filteredOrders: LaundryOrder[];
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: OrderStatus | 'all';
  setStatusFilter: (val: any) => void;
  statuses: { value: OrderStatus; label: string; color: string }[];
  onSelectOrder: (order: LaundryOrder) => void;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({
  filteredOrders,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  statuses,
  onSelectOrder
}) => {
  const formatPrice = (num: number) => {
    return num.toLocaleString('vi-VN') + ' đ';
  };

  const getStatusBadgeClass = (status: OrderStatus) => {
    const found = statuses.find(s => s.value === status);
    return found ? found.color : 'bg-slate-100 text-slate-800';
  };

  return (
    <Paper 
      elevation={0}
      sx={{ 
        borderRadius: '24px', 
        p: 3, 
        border: '1px solid',
        borderColor: 'slate.100',
        bgcolor: 'background.paper'
      }}
      className="border border-slate-100 shadow-sm"
    >
      <Stack spacing={3}>
        {/* Controllers header */}
        <Stack 
          spacing={2}
          sx={{ 
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            pb: 2, 
            borderBottom: '1px solid', 
            borderColor: 'slate.100' 
          }}
          className="border-b border-slate-100"
        >
          <Typography 
            variant="subtitle2" 
            sx={{ fontWeight: 900, textTransform: 'uppercase', tracking: '0.1em', color: 'text.secondary' }}
            className="text-slate-400 text-xs tracking-wider"
          >
            Danh Sách Quản Lý Đơn
          </Typography>

          <Stack 
            spacing={1.5} 
            sx={{ 
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center' 
            }}
          >
            <TextField
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm tên, SĐT..."
              variant="outlined"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search className="w-3.5 h-3.5 text-slate-400" />
                    </InputAdornment>
                  ),
                  style: { fontSize: '12px', borderRadius: '8px' }
                }
              }}
              sx={{ width: { xs: '100%', sm: 160 } }}
              className="bg-slate-50"
            />

            <Select
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ fontSize: '12px', borderRadius: '8px', minWidth: 130 }}
              className="bg-slate-50"
            >
              <MenuItem value="all">
                <Box component="span" sx={{ fontSize: '12px' }}>Mọi trạng thái</Box>
              </MenuItem>
              {statuses.map((s) => (
                <MenuItem key={s.value} value={s.value}>
                  <Box component="span" sx={{ fontSize: '12px' }}>{s.label}</Box>
                </MenuItem>
              ))}
            </Select>
          </Stack>
        </Stack>

        {/* Table of orders */}
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small" aria-label="laundry orders table">
            <TableHead>
              <TableRow sx={{ borderColor: 'slate.100' }}>
                <TableCell sx={{ py: 1.5, fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', color: 'slate.400' }} className="text-slate-400">
                  Mã đơn
                </TableCell>
                <TableCell sx={{ py: 1.5, fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', color: 'slate.400' }} className="text-slate-400">
                  Họ tên khách
                </TableCell>
                <TableCell sx={{ py: 1.5, fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', color: 'slate.400' }} className="text-slate-400">
                  Trạng thái
                </TableCell>
                <TableCell align="right" sx={{ py: 1.5, fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', color: 'slate.400' }} className="text-slate-400">
                  Giá gốc
                </TableCell>
                <TableCell align="right" sx={{ py: 1.5, fontWeight: 'bold', fontSize: '11px', textTransform: 'uppercase', color: 'slate.400' }} className="text-slate-400">
                  Chi tiết
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    Chưa ghi nhận đơn hàng tương đương.
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow 
                    key={order.id} 
                    hover
                    sx={{ '&:last-child td, &:last-child th': { border: 0 }, transition: 'colors 0.2s' }}
                  >
                    <TableCell sx={{ py: 2, fontWeight: 'bold', color: 'primary.main', fontSize: '13px' }} className="text-blue-600 font-bold">
                      #{order.id.slice(0, 6).toUpperCase()}
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Box>
                        <Typography sx={{ fontSize: '13px', fontWeight: 'bold', color: 'text.primary' }} className="text-slate-800">
                          {order.customerName}
                        </Typography>
                        <Typography sx={{ fontSize: '10px', color: 'text.secondary', mt: 0.5 }}>
                          {order.phoneNumber}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Box 
                        component="span" 
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(order.status)}`}
                      >
                        {statuses.find(s => s.value === order.status)?.label || order.status}
                      </Box>
                    </TableCell>
                    <TableCell align="right" sx={{ py: 2, fontWeight: 700, fontSize: '13px', color: 'text.primary' }}>
                      {formatPrice(order.totalPrice)}
                    </TableCell>
                    <TableCell align="right" sx={{ py: 2 }}>
                      <Button
                        size="small"
                        onClick={() => onSelectOrder(order)}
                        variant="contained"
                        startIcon={<Eye className="w-3.5 h-3.5" />}
                        sx={{ 
                          fontSize: '11px', 
                          fontWeight: 'bold', 
                          borderRadius: '8px', 
                          bgcolor: 'slate.900', 
                          color: '#fff',
                          textTransform: 'none',
                          '&:hover': { bgcolor: 'slate.800' }
                        }}
                        className="bg-slate-900 hover:bg-slate-800 cursor-pointer"
                      >
                        Xem Đốc
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </Paper>
  );
};
