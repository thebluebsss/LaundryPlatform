// @ts-nocheck
import Product from "../models/Product";
import { NotFoundError } from "../utils/errorHandler";

/**
 * Lấy danh sách products với filters
 */
export const getProducts = async (filters: any = {}) => {
  const query: any = {};

  // Filters
  if (filters.category) query.category = filters.category;
  if (filters.isActive !== undefined) query.isActive = filters.isActive;
  if (filters.tags) query.tags = { $in: filters.tags.split(",") };

  // Search
  if (filters.search) {
    query.$or = [
      { name: new RegExp(filters.search, "i") },
      { description: new RegExp(filters.search, "i") },
      { brand: new RegExp(filters.search, "i") },
    ];
  }

  // Sort
  let sort: any = { createdAt: -1 };
  if (filters.sort === "price-asc") sort = { price: 1 };
  if (filters.sort === "price-desc") sort = { price: -1 };
  if (filters.sort === "popular") sort = { soldCount: -1 };
  if (filters.sort === "rating") sort = { rating: -1 };

  // Pagination
  const page = parseInt(filters.page) || 1;
  const limit = parseInt(filters.limit) || 10;
  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(query).sort(sort).skip(skip).limit(limit),
    Product.countDocuments(query),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Lấy chi tiết product
 */
export const getProductById = async (productId: string) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw new NotFoundError("Product không tồn tại");
  }
  return product;
};

/**
 * Tạo product mới
 */
export const createProduct = async (productData: any) => {
  const product = await Product.create(productData);
  return product;
};

/**
 * Cập nhật product
 */
export const updateProduct = async (productId: string, updateData: any) => {
  const product = await Product.findByIdAndUpdate(
    productId,
    { $set: updateData },
    { new: true, runValidators: true },
  );

  if (!product) {
    throw new NotFoundError("Product không tồn tại");
  }

  return product;
};

/**
 * Xóa product
 */
export const deleteProduct = async (productId: string) => {
  const product = await Product.findByIdAndDelete(productId);
  if (!product) {
    throw new NotFoundError("Product không tồn tại");
  }
  return product;
};

/**
 * Lấy product recommendations
 */
export const getRecommendations = async (service: string) => {
  const products = await Product.find({
    isActive: true,
    recommendFor: service,
  })
    .sort({ soldCount: -1 })
    .limit(4);

  return products;
};
