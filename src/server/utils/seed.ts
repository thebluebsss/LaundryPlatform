// @ts-nocheck
import User from "../models/User";
import Product from "../models/Product";
import LaundryService from "../models/LaundryService";
import bcrypt from "bcryptjs";
import logger from "./logger";
import { PRODUCTS } from "../../data/products";
import { LAUNDRY_SERVICES } from "../../data";

export const seedAdmin = async () => {
  try {
    const ensureAccount = async (
      username: string,
      plainPw: string,
      defaults: Record<string, any>
    ) => {
      const existing = await User.findOne({ username });
      if (!existing) {
        const hashedPassword = await bcrypt.hash(plainPw, 10);
        await User.create({
          username,
          password: hashedPassword,
          ...defaults,
        });
        logger.info(`Default user "${username}" seeded successfully!`);
      } else {
        const pwOk = await bcrypt.compare(plainPw, existing.password || "");
        const updates: Record<string, any> = {};
        if (!pwOk) {
          updates.password = await bcrypt.hash(plainPw, 10);
        }
        if (defaults.role && existing.role !== defaults.role) {
          updates.role = defaults.role;
        }
        if (existing.isActive === false) {
          updates.isActive = true;
        }
        if (Object.keys(updates).length > 0) {
          await User.findByIdAndUpdate(existing._id, { $set: updates });
          logger.info(`Repaired default user "${username}" credentials/role.`);
        }
      }
    };

    await ensureAccount("admin", "admin123", {
      email: "admin@giatlasachse.vn",
      fullName: "Hệ thống Quản trị viên",
      phone: "0900000000",
      role: "admin",
      isActive: true,
    });

    await ensureAccount("owner", "123456", {
      email: "owner@giatlasachse.vn",
      fullName: "Trần Minh Quân (Chủ tiệm Hà Nội)",
      phone: "0902223344",
      address: "125 Cầu Giấy, Quận Cầu Giấy, Hà Nội",
      storeDistrict: "Quận Cầu Giấy",
      storeCity: "hanoi",
      role: "store_owner",
      isActive: true,
    });

    await ensureAccount("driver", "123456", {
      email: "driver@giatlasachse.vn",
      fullName: "Nguyễn Văn Hùng (Tài xế Hà Nội)",
      phone: "0911222333",
      address: "Quận Cầu Giấy, TP. Hà Nội",
      role: "driver",
      vehicleType: "bike",
      licensePlate: "29-B1 888.99",
      idCardNumber: "001095012345",
      driverLicenseNumber: "010234567890",
      isAvailable: true,
      currentLocation: { lat: 21.0285, lng: 105.8542 },
      isActive: true,
    });

    await ensureAccount("user", "123456", {
      email: "user@giatlasachse.vn",
      fullName: "Nguyễn Minh Tâm",
      phone: "0911111111",
      address: "88 Láng Hạ, Quận Đống Đa, TP. Hà Nội",
      role: "user",
      isActive: true,
    });
  } catch (error: any) {
    logger.error("Error seeding default actor users:", error);
  }
};

export const seedProducts = async () => {
  try {
    const count = await Product.countDocuments();
    logger.info(`Checking products... Current count: ${count}`);
    
    // We can seed products if none exist, or we can check and insert/update missing ones
    if (count === 0) {
      logger.info("Seeding products into database...");
      for (const prod of PRODUCTS) {
        await Product.create({
          name: prod.name,
          description: prod.description || "",
          price: prod.price,
          category: prod.category,
          unit: prod.unit || "Chai",
          stock: 50,
          isActive: true,
          image: prod.image || `https://images.unsplash.com/photo-1610557892470-76d747e49536?w=200&auto=format&fit=crop&q=60`,
        });
      }
      logger.info("Products seeded successfully!");
    } else {
      // If some products exist, make sure we have all of them by checking name
      for (const prod of PRODUCTS) {
        const found = await Product.findOne({ name: prod.name });
        if (!found) {
          logger.info(`Product "${prod.name}" is missing. Adding it...`);
          await Product.create({
            name: prod.name,
            description: prod.description || "",
            price: prod.price,
            category: prod.category,
            unit: prod.unit || "Chai",
            stock: 50,
            isActive: true,
            image: prod.image || `https://images.unsplash.com/photo-1610557892470-76d747e49536?w=200&auto=format&fit=crop&q=60`,
          });
        }
      }
      logger.info("Existing products verified and missing ones added.");
    }
  } catch (error: any) {
    logger.error("Error seeding products:", error);
  }
};

export const seedServices = async () => {
  try {
    const count = await LaundryService.countDocuments();
    logger.info(`Checking laundry services... Current count: ${count}`);
    
    if (count === 0) {
      logger.info("Seeding laundry services into database...");
      for (const s of LAUNDRY_SERVICES) {
        await LaundryService.create({
          name: s.name,
          category: s.category,
          pricingType: s.pricingType,
          unitPrice: s.unitPrice,
          unitName: s.unitName,
          description: s.description || "",
          iconName: s.iconName || "Shirt",
          durationDays: s.durationDays || 1,
          featured: s.featured || false,
          isActive: true,
          customId: s.id,
        });
      }
      logger.info("Laundry services seeded successfully!");
    } else {
      for (const s of LAUNDRY_SERVICES) {
        const found = await LaundryService.findOne({ 
          $or: [{ customId: s.id }, { name: s.name }] 
        });
        if (!found) {
          logger.info(`Laundry service "${s.name}" is missing. Adding it...`);
          await LaundryService.create({
            name: s.name,
            category: s.category,
            pricingType: s.pricingType,
            unitPrice: s.unitPrice,
            unitName: s.unitName,
            description: s.description || "",
            iconName: s.iconName || "Shirt",
            durationDays: s.durationDays || 1,
            featured: s.featured || false,
            isActive: true,
            customId: s.id,
          });
        }
      }
      logger.info("Existing laundry services verified.");
    }
  } catch (error: any) {
    logger.error("Error seeding laundry services:", error);
  }
};

export const seedStores = async () => {
  try {
    const Store = (await import("../models/Store")).default;
    const { DEFAULT_STORES } = await import("../../data/storesData");
    const count = await (Store as any).countDocuments();
    if (count === 0) {
      logger.info("Seeding default stores into database...");
      for (const st of DEFAULT_STORES) {
        await (Store as any).create(st);
      }
      logger.info("Default stores seeded successfully!");
    }
  } catch (error: any) {
    logger.error("Error seeding stores:", error);
  }
};


