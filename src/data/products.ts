export interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  category: "accessory" | "care" | "cleaning";
  description?: string;
  image?: string;
}

export const PRODUCTS: Product[] = [
  {
    id: "prod-001",
    name: "Túi thơm quần áo",
    price: 15000,
    unit: "gói",
    category: "accessory",
    description: "Túi thơm giữ mùi hương thơm mát cho tủ quần áo",
  },
  {
    id: "prod-002",
    name: "Cây lăn bụi quần áo",
    price: 35000,
    unit: "cái",
    category: "cleaning",
    description: "Dụng cụ loại bỏ bụi, lông thú trên quần áo",
  },
  {
    id: "prod-003",
    name: "Bàn chải vệ sinh giày",
    price: 25000,
    unit: "cái",
    category: "cleaning",
    description: "Bàn chải chuyên dụng vệ sinh giày dép",
  },
  {
    id: "prod-004",
    name: "Xịt khử mùi quần áo",
    price: 45000,
    unit: "chai",
    category: "care",
    description: "Xịt khử mùi hôi, mùi mốc trên quần áo",
  },
  {
    id: "prod-005",
    name: "Xịt chống nhăn quần áo",
    price: 50000,
    unit: "chai",
    category: "care",
    description: "Xịt làm phẳng nếp nhăn, giữ form quần áo",
  },
  {
    id: "prod-006",
    name: "Túi giặt đồ lót / chống rối",
    price: 20000,
    unit: "cái",
    category: "accessory",
    description: "Túi lưới bảo vệ đồ lót khi giặt máy",
  },
  {
    id: "prod-007",
    name: "Dây giày thay thế",
    price: 15000,
    unit: "đôi",
    category: "accessory",
    description: "Dây giày thay thế nhiều màu sắc",
  },
  {
    id: "prod-008",
    name: "Miếng lót giày",
    price: 30000,
    unit: "đôi",
    category: "accessory",
    description: "Miếng lót êm ái, khử mùi cho giày",
  },
  {
    id: "prod-009",
    name: "Xịt khử mùi giày",
    price: 40000,
    unit: "chai",
    category: "care",
    description: "Xịt khử mùi hôi chân, kháng khuẩn",
  },
  {
    id: "prod-010",
    name: "Bộ vệ sinh giày mini",
    price: 55000,
    unit: "bộ",
    category: "cleaning",
    description: "Bộ dụng cụ vệ sinh giày gọn nhẹ",
  },
  {
    id: "prod-011",
    name: "Cây giữ form giày",
    price: 60000,
    unit: "đôi",
    category: "accessory",
    description: "Cây gỗ giữ form giày, chống nhăn da",
  },
];

export interface CartProduct {
  product: Product;
  quantity: number;
}
