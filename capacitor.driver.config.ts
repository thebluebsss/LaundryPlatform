/**
 * Cấu hình Capacitor Native dành riêng cho APP TÀI XẾ / SHIPPER (iOS App Store & Google Play / CH Play)
 * Package ID: vn.sachse.driver
 * Build command: npm run build:app-driver
 */
const driverCapacitorConfig = {
  appId: "vn.sachse.driver",
  appName: "Sạch Sẽ Tài Xế",
  webDir: "dist-driver",
  bundledWebRuntime: false,
  server: {
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: "#059669",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#059669",
    },
  },
};

export default driverCapacitorConfig;
