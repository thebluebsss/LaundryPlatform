import axios from "axios";

// API base URL - change this to your backend URL
const API_BASE_URL = "/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    // Try admin token first (for admin pages), then user token
    const adminToken = localStorage.getItem("sachse_admin_token");
    const userToken = localStorage.getItem("sachse_user_token");

    let token = adminToken || userToken;

    // Filter out legacy dummy tokens like "activated"
    if (token && (token === "activated" || !token.includes(".") || token.length < 15)) {
      token = null;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Handle 401 response interceptor to clean up expired/invalid tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear expired tokens to avoid continuous 401 retries
      const isAuthRoute = error.config?.url?.includes("/auth/");
      if (!isAuthRoute) {
        localStorage.removeItem("sachse_user_token");
        localStorage.removeItem("sachse_user_profile");
        // Don't auto-remove admin token if on admin page login attempt, but clear if expired JWT
        const adminToken = localStorage.getItem("sachse_admin_token");
        if (adminToken && adminToken.includes(".")) {
          localStorage.removeItem("sachse_admin_token");
        }
      }
    }
    return Promise.reject(error);
  },
);

// Orders API
export const ordersAPI = {
  getAll: () => api.get("/orders/admin"),
  getById: (id: string) => api.get(`/orders/${id}`),
  updateStatus: (id: string, status: string) =>
    api.patch(`/orders/${id}/status`, { status }),
  updatePaymentStatus: (id: string, paymentStatus: string) =>
    api.patch(`/orders/${id}/payment-status`, { paymentStatus }),
  create: (orderData: any) => api.post("/orders", orderData),
  cancel: (id: string) => api.patch(`/orders/${id}/cancel`),
};

// Bookings API
export const bookingsAPI = {
  getAll: (params?: any) => api.get("/bookings", { params }),
  getMyBookings: (params?: any) => api.get("/bookings/my", { params }),
  getById: (id: string) => api.get(`/bookings/${id}`),
  create: (bookingData: any) => api.post("/bookings", bookingData),
  updateStatus: (id: string, status: string) =>
    api.patch(`/bookings/${id}/status`, { status }),
  updatePaymentStatus: (id: string, paymentStatus: string) =>
    api.patch(`/bookings/${id}/payment-status`, { paymentStatus }),
  delete: (id: string) => api.delete(`/bookings/${id}`),
  cancel: (id: string) =>
    api.patch(`/bookings/${id}/status`, { status: "cancelled" }),
};

// Products API
export const productsAPI = {
  getAll: (params?: any) => api.get("/products", { params }),
  getById: (id: string) => api.get(`/products/${id}`),
  create: (productData: any) => api.post("/products", productData),
  update: (id: string, productData: any) =>
    api.patch(`/products/${id}`, productData),
  delete: (id: string) => api.delete(`/products/${id}`),
  getRecommendations: () => api.get("/products/recommendations"),
};

// Services API
export const servicesAPI = {
  getAll: (params?: any) => api.get("/services", { params }),
  getById: (id: string) => api.get(`/services/${id}`),
  create: (serviceData: any) => api.post("/services", serviceData),
  update: (id: string, serviceData: any) =>
    api.patch(`/services/${id}`, serviceData),
  delete: (id: string) => api.delete(`/services/${id}`),
};

// Users API
export const usersAPI = {
  getAll: () => api.get("/users"),
  getById: (id: string) => api.get(`/users/${id}`),
  create: (userData: any) => api.post("/users", userData),
  update: (id: string, userData: any) => api.patch(`/users/${id}`, userData),
  delete: (id: string) => api.delete(`/users/${id}`),
  toggleActive: (id: string) => api.patch(`/users/${id}/toggle-active`),
  getStats: () => api.get("/users/stats"),
};

// Auth API
export const authAPI = {
  login: (username: string, password: string) =>
    api.post("/auth/login", { username, password }),
  register: (userData: any) => api.post("/auth/register", userData),
  logout: () => api.post("/auth/logout"),
};

// Stores API
export const storesAPI = {
  getAll: (params?: any) => api.get("/stores", { params }),
  getById: (id: string) => api.get(`/stores/${id}`),
  getDrivers: (storeId?: string) => api.get("/stores/drivers", { params: { storeId } }),
  create: (storeData: any) => api.post("/stores", storeData),
  update: (id: string, storeData: any) => api.patch(`/stores/${id}`, storeData),
  delete: (id: string) => api.delete(`/stores/${id}`),
};

// Laundry Orders API (Smart Multi-Fabric & Actual Weighing Orders)
export const laundryOrdersAPI = {
  getAll: (params?: any) => api.get("/laundry-orders", { params }),
  getById: (id: string) => api.get(`/laundry-orders/${id}`),
  create: (orderData: any) => api.post("/laundry-orders", orderData),
  updateStatus: (id: string, payload: { status?: string; paymentStatus?: string; weightConfirmStatus?: string }) =>
    api.patch(`/laundry-orders/${id}/status`, payload),
  weighOrder: (id: string, payload: any) =>
    api.patch(`/laundry-orders/${id}/weigh`, payload),
  delete: (id: string) => api.delete(`/laundry-orders/${id}`),
};

// Equipment API (Store Washing Machines, Dryers, Irons)
export const equipmentAPI = {
  getAll: (params?: any) => api.get("/equipment", { params }),
  getById: (id: string) => api.get(`/equipment/${id}`),
  create: (data: any) => api.post("/equipment", data),
  update: (id: string, data: any) => api.patch(`/equipment/${id}`, data),
  delete: (id: string) => api.delete(`/equipment/${id}`),
};

// Delivery Tasks API (Driver Dispatching & Pickup/Delivery Tracking)
export const deliveryAPI = {
  getAvailableTasks: (params?: any) => api.get("/delivery/available-tasks", { params }),
  getMyTasks: (params?: any) => api.get("/delivery/my-tasks", { params }),
  createTask: (data: any) => api.post("/delivery/create-task", data),
  acceptTask: (data: { taskId: string; driverId?: string; driverName?: string; driverPhone?: string }) =>
    api.post("/delivery/accept-task", data),
  updateTaskStatus: (data: { taskId: string; status: string; notes?: string }) =>
    api.patch("/delivery/task-status", data),
  updateLocation: (data: { driverId: string; lat: number; lng: number }) =>
    api.post("/delivery/update-location", data),
};

// AI Inspection API
export const aiAPI = {
  inspectGarment: (data: { image: string; declaredService?: string; itemName?: string }) =>
    api.post("/ai/inspect-garment", data),
  verifyCloth: (data: { image: string; expectedType?: string }) =>
    api.post("/ai/verify-cloth", data),
};

// Payments API (VietQR Napas 24/7 & PayOS)
export const paymentsAPI = {
  createVietQR: (data: { bookingId: string; amount: number; customerName?: string }) =>
    api.post("/payments/vietqr/create", data),
  confirmVietQR: (data: { bookingId: string }) =>
    api.post("/payments/vietqr/confirm", data),
  createPayOS: (data: { bookingId: string; amount: number; description?: string }) =>
    api.post("/payments/payos/create", data),
};

// Reviews API (Customer Store & Driver Ratings, Store Replies & Admin Moderation)
export const reviewsAPI = {
  getAll: (params?: {
    storeId?: string;
    shipperId?: string;
    orderId?: string;
    userId?: string;
    includeHidden?: boolean;
  }) => api.get("/reviews", { params }),
  createOrUpdate: (data: {
    orderId: string;
    userId?: string;
    customerName: string;
    customerPhone?: string;
    storeId: string;
    storeName: string;
    shipperId?: string;
    shipperName?: string;
    storeRating: number;
    storeComment: string;
    shipperRating: number;
    shipperComment: string;
  }) => api.post("/reviews", data),
  reply: (idOrOrderId: string, storeReply: string) =>
    api.patch(`/reviews/${idOrOrderId}/reply`, { storeReply }),
  toggleVisibility: (id: string, isHidden?: boolean) =>
    api.patch(`/reviews/${id}/visibility`, { isHidden }),
};

export default api;



