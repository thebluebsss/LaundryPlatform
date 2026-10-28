import { Box, Typography, Button, Stack } from "@mui/material";
import { ShoppingBag, Plus, Minus, Package } from "lucide-react";
import { PRODUCTS, Product, CartProduct } from "../../../data/products";

interface ProductSelectionProps {
  selectedProducts: CartProduct[];
  onUpdateProduct: (product: Product, quantity: number) => void;
}

export const ProductSelection = ({
  selectedProducts,
  onUpdateProduct,
}: ProductSelectionProps) => {
  const getProductQuantity = (productId: string) => {
    const found = selectedProducts.find((p) => p.product.id === productId);
    return found ? found.quantity : 0;
  };

  const handleIncrease = (product: Product) => {
    const currentQty = getProductQuantity(product.id);
    onUpdateProduct(product, currentQty + 1);
  };

  const handleDecrease = (product: Product) => {
    const currentQty = getProductQuantity(product.id);
    if (currentQty > 0) {
      onUpdateProduct(product, currentQty - 1);
    }
  };

  const categories = {
    accessory: "Phụ kiện",
    care: "Chăm sóc",
    cleaning: "Vệ sinh",
  };

  const groupedProducts = PRODUCTS.reduce(
    (acc, product) => {
      if (!acc[product.category]) {
        acc[product.category] = [];
      }
      acc[product.category].push(product);
      return acc;
    },
    {} as Record<string, Product[]>,
  );

  return (
    <Box className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4">
      <Box className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <ShoppingBag className="w-5 h-5 text-blue-600" />
        <Typography
          variant="h6"
          sx={{ fontSize: "16px", fontWeight: "bold", color: "slate.900" }}
        >
          Mua Thêm Sản Phẩm Tiện Ích
        </Typography>
      </Box>

      <Typography
        variant="caption"
        className="text-slate-500 block leading-relaxed"
      >
        Chọn thêm các sản phẩm chăm sóc quần áo, giày dép để nhận cùng đơn giặt
        là
      </Typography>

      {Object.entries(groupedProducts).map(([category, products]) => (
        <Box key={category} className="space-y-3">
          <Typography
            variant="subtitle2"
            sx={{
              fontSize: "12px",
              fontWeight: "bold",
              color: "slate.600",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            <Package className="w-3.5 h-3.5 inline mr-1" />
            {categories[category as keyof typeof categories]}
          </Typography>

          <Stack spacing={2}>
            {products.map((product) => {
              const quantity = getProductQuantity(product.id);

              return (
                <Box
                  key={product.id}
                  className={`p-3 rounded-xl border transition-all ${
                    quantity > 0
                      ? "border-blue-300 bg-blue-50/50"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <Box className="flex items-start justify-between gap-3">
                    <Box className="flex-1">
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: "13px",
                          fontWeight: "bold",
                          color: quantity > 0 ? "blue.700" : "slate.800",
                        }}
                      >
                        {product.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        className="text-slate-500 block mt-0.5 text-xs leading-relaxed"
                      >
                        {product.description}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: "13px",
                          fontWeight: "bold",
                          color: "blue.600",
                          display: "block",
                          mt: 1,
                        }}
                      >
                        {product.price.toLocaleString("vi-VN")}đ /{" "}
                        {product.unit}
                      </Typography>
                    </Box>

                    <Box className="flex items-center gap-2">
                      {quantity === 0 ? (
                        <Button
                          onClick={() => handleIncrease(product)}
                          variant="contained"
                          size="small"
                          sx={{
                            minWidth: "auto",
                            px: 2,
                            py: 0.5,
                            fontSize: "11px",
                            fontWeight: "bold",
                            textTransform: "none",
                            borderRadius: "8px",
                            bgcolor: "blue.600",
                            "&:hover": {
                              bgcolor: "blue.700",
                            },
                          }}
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" />
                          Thêm
                        </Button>
                      ) : (
                        <Box className="flex items-center gap-1.5 bg-white border border-blue-200 rounded-lg px-1 py-0.5">
                          <Button
                            onClick={() => handleDecrease(product)}
                            sx={{
                              minWidth: "auto",
                              p: 0.5,
                              color: "blue.600",
                              "&:hover": {
                                bgcolor: "blue.50",
                              },
                            }}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </Button>

                          <Typography
                            sx={{
                              fontSize: "13px",
                              fontWeight: "bold",
                              color: "blue.700",
                              minWidth: "20px",
                              textAlign: "center",
                            }}
                          >
                            {quantity}
                          </Typography>

                          <Button
                            onClick={() => handleIncrease(product)}
                            sx={{
                              minWidth: "auto",
                              p: 0.5,
                              color: "blue.600",
                              "&:hover": {
                                bgcolor: "blue.50",
                              },
                            }}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Stack>
        </Box>
      ))}

      {selectedProducts.length > 0 && (
        <Box className="bg-blue-50 border border-blue-100 rounded-xl p-3 mt-4">
          <Typography
            variant="caption"
            sx={{ fontSize: "11px", fontWeight: "bold", color: "blue.700" }}
          >
            ✓ Đã chọn {selectedProducts.length} loại sản phẩm (
            {selectedProducts.reduce((sum, p) => sum + p.quantity, 0)} sản phẩm)
          </Typography>
        </Box>
      )}
    </Box>
  );
};
