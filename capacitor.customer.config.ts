/**
 * Cấu hình Capacitor Native dành riêng cho APP KHÁCH HÀNG (iOS App Store & Google Play / CH Play)
 * Package ID: vn.sachse.customer
 * Build command: npm run build:app-customer
 */
const customerCapacitorConfig = {
  appId: "vn.sachse.customer",
  appName: "Sạch Sẽ - Giặt Sấy",
  webDir: "dist-customer",
  bundledWebRuntime: false,
  server: {
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: "#2563eb",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#2563eb",
    },
  },
};

export default customerCapacitorConfig;
