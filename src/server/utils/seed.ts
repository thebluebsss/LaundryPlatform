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
    const adminExists = await User.findOne({ username: "admin" });
    if (!adminExists) {
      logger.info("Admin user not found. Seeding default admin user...");
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await User.create({
        username: "admin",
        email: "admin@giatlasachse.vn",
        password: hashedPassword,
        fullName: "Hệ thống Quản trị viên",
        phone: "0900000000",
        role: "admin",
        isActive: true,
      });
      logger.info("Default admin user seeded successfully!");
    } else {
      logger.info("Admin user already exists.");
    }

    const driverExists = await User.findOne({ username: "driver" });
    if (!driverExists) {
      logger.info("Seeding default driver user...");
      const hashedDriverPw = await bcrypt.hash("driver123", 10);
      await User.create({
        username: "driver",
        email: "driver@giatlasachse.vn",
        password: hashedDriverPw,
        fullName: "Nguyễn Văn Hùng (Tài xế)",
        phone: "0911222333",
        role: "driver",
        vehicleType: "bike",
        licensePlate: "59B1-888.99",
        isAvailable: true,
        currentLocation: { lat: 10.7695, lng: 106.6930 },
        assignedStoreId: "store-hcm-q1",
        isActive: true,
      });
      logger.info("Default driver user seeded successfully!");
    }
  } catch (error: any) {
    logger.error("Error seeding default admin or driver user:", error);
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


