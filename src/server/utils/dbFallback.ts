import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

import { LAUNDRY_SERVICES } from "../../data";
import { PRODUCTS } from "../../data/products";

const DB_FILE = path.join(process.cwd(), "local-preview-db.json");

function getDefaultUsers() {
  const adminPasswordHash = bcrypt.hashSync("admin123", 10);
  const userPasswordHash = bcrypt.hashSync("123456", 10);
  return [
    {
      _id: "user-admin-id",
      username: "admin",
      email: "admin@sachse.com",
      password: adminPasswordHash,
      fullName: "Quản trị viên Hệ thống",
      phone: "0900000000",
      role: "admin",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "user-store-owner-id",
      username: "owner",
      email: "owner@sachse.com",
      password: userPasswordHash,
      fullName: "Trần Minh Quân (Chủ tiệm)",
      phone: "0902223344",
      address: "185 Nguyễn Trãi, Quận 1, TP.HCM",
      role: "store_owner",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "drv-1",
      username: "driver",
      email: "driver@sachse.com",
      password: userPasswordHash,
      fullName: "Nguyễn Văn Hùng (Shipper)",
      phone: "0911222333",
      role: "driver",
      vehicleType: "bike",
      licensePlate: "59-X3 889.21",
      isAvailable: true,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: "user-default-id",
      username: "user",
      email: "user@sachse.com",
      password: userPasswordHash,
      fullName: "Nguyễn Minh Tâm",
      phone: "0911111111",
      address: "45 Lê Thánh Tôn, Phường Bến Nghé, Quận 1",
      role: "user",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

function getDefaultServices() {
  return LAUNDRY_SERVICES.map((s) => ({
    _id: s.id,
    customId: s.id,
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
    createdAt: new Date().toISOString(),
  }));
}

function getDefaultProducts() {
  return PRODUCTS.map((p) => ({
    _id: p.id,
    id: p.id,
    name: p.name,
    description: p.description || "",
    price: p.price,
    category: p.category,
    unit: p.unit || "Sản phẩm",
    stock: 50,
    isActive: true,
    createdAt: new Date().toISOString(),
  }));
}

// Ensure local-preview-db.json exists with clean initial state (no mock stores or orders)
function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(
        DB_FILE,
        JSON.stringify(
          {
            cleanStartV2: true,
            users: getDefaultUsers(),
            bookings: [],
            orders: [],
            laundry_orders: [],
            delivery_tasks: [],
            reviews: [],
            stores: [],
            laundryservices: getDefaultServices(),
            products: getDefaultProducts(),
            equipment: [],
            payments: [],
          },
          null,
          2
        ),
        "utf8"
      );
    }
    const content = fs.readFileSync(DB_FILE, "utf8");
    const db = JSON.parse(content);
    let needUpdate = false;

    // One-time cleanup migration to purge any previously seeded mock stores/orders
    if (!db.cleanStartV2) {
      db.cleanStartV2 = true;
      db.stores = [];
      db.bookings = [];
      db.orders = [];
      db.laundry_orders = [];
      db.delivery_tasks = [];
      db.reviews = [];
      needUpdate = true;
    }

    const defaultUsers = getDefaultUsers();
    if (!db.users || db.users.length === 0) {
      db.users = defaultUsers;
      needUpdate = true;
    } else {
      for (const du of defaultUsers) {
        if (!db.users.some((u: any) => u.username === du.username)) {
          db.users.push(du);
          needUpdate = true;
        }
      }
    }
    if (!Array.isArray(db.stores)) {
      db.stores = [];
      needUpdate = true;
    }
    if (!db.laundryservices || db.laundryservices.length === 0) {
      db.laundryservices = getDefaultServices();
      needUpdate = true;
    }
    if (!db.products || db.products.length === 0) {
      db.products = getDefaultProducts();
      needUpdate = true;
    }
    if (!Array.isArray(db.laundry_orders)) {
      db.laundry_orders = [];
      needUpdate = true;
    }
    if (!Array.isArray(db.delivery_tasks)) {
      db.delivery_tasks = [];
      needUpdate = true;
    }
    if (!Array.isArray(db.reviews)) {
      db.reviews = [];
      needUpdate = true;
    }
    if (needUpdate) {
      writeDb(db);
    }
    return db;
  } catch (err) {
    return {
      cleanStartV2: true,
      users: getDefaultUsers(),
      bookings: [],
      orders: [],
      products: getDefaultProducts(),
      laundryservices: getDefaultServices(),
      equipment: [],
      payments: [],
      stores: [],
      laundry_orders: [],
      delivery_tasks: [],
      reviews: [],
    };
  }
}

function writeDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write to fallback DB", err);
  }
}

function matchQuery(item: any, query: any): boolean {
  if (!query) return true;
  for (const key of Object.keys(query)) {
    if (key === "$or" && Array.isArray(query.$or)) {
      const matchOr = query.$or.some((subQuery) => matchQuery(item, subQuery));
      if (!matchOr) return false;
      continue;
    }
    const queryVal = query[key];
    const itemVal = item[key];

    if (queryVal instanceof RegExp) {
      if (!queryVal.test(itemVal || "")) return false;
    } else if (typeof queryVal === "object" && queryVal !== null) {
      if (Array.isArray(queryVal.$in)) {
        if (!queryVal.$in.includes(itemVal)) return false;
      }
      if (queryVal.$ne !== undefined) {
        if (String(itemVal) === String(queryVal.$ne)) return false;
      }
    } else {
      if (String(itemVal) !== String(queryVal)) return false;
    }
  }
  return true;
}

export class SimulatedDoc {
  [key: string]: any;
  private _collection: string;

  constructor(collection: string, data: any) {
    Object.assign(this, data);
    this._collection = collection;
    if (!this._id && !this.id) {
      this._id = "fallback-id-" + Math.random().toString(36).substring(2, 10);
    }
  }

  get id() {
    return this.customId || this._id;
  }

  async save() {
    const db = readDb();
    const items = db[this._collection] || [];
    const index = items.findIndex((i: any) => i._id === this._id);
    const plainObj = this.toObject();
    if (index >= 0) {
      items[index] = plainObj;
    } else {
      items.push(plainObj);
    }
    db[this._collection] = items;
    writeDb(db);
    return this;
  }

  toObject() {
    const copy = { ...this };
    delete copy._collection;
    return copy;
  }

  toJSON() {
    return this.toObject();
  }

  select() {
    return this;
  }

  populate() {
    return this;
  }
}

class SimulatedSingleQuery {
  private item: any;
  private _collection: string;

  constructor(collection: string, item: any) {
    this._collection = collection;
    this.item = item
      ? item instanceof SimulatedDoc
        ? item
        : new SimulatedDoc(collection, item)
      : null;
  }

  select() {
    return this;
  }

  populate() {
    return this;
  }

  exec() {
    return Promise.resolve(this.item);
  }

  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    return Promise.resolve(this.item).then(onfulfilled, onrejected);
  }
}

class SimulatedQuery {
  private items: any[];
  private _collection: string;

  constructor(collection: string, items: any[]) {
    this._collection = collection;
    this.items = items.map((item) =>
      item instanceof SimulatedDoc ? item : new SimulatedDoc(collection, item)
    );
  }

  sort(sortObj: any) {
    if (sortObj && typeof sortObj === "object") {
      const field = Object.keys(sortObj)[0];
      const order = sortObj[field];
      this.items.sort((a, b) => {
        const valA = a[field];
        const valB = b[field];
        if (valA < valB) return order === -1 ? 1 : -1;
        if (valA > valB) return order === -1 ? -1 : 1;
        return 0;
      });
    }
    return this;
  }

  skip(n: number) {
    this.items = this.items.slice(n);
    return this;
  }

  limit(n: number) {
    this.items = this.items.slice(0, n);
    return this;
  }

  select() {
    return this;
  }

  populate() {
    return this;
  }

  exec() {
    return Promise.resolve(this.items);
  }

  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    return Promise.resolve(this.items).then(onfulfilled, onrejected);
  }
}

export function createModelFallback(collection: string) {
  return {
    find: function (query?: any) {
      const db = readDb();
      const items = db[collection] || [];
      const filtered = items.filter((item: any) => matchQuery(item, query));
      return new SimulatedQuery(collection, filtered);
    },

    findOne: function (query?: any) {
      const db = readDb();
      const items = db[collection] || [];
      const matched = items.find((item: any) => matchQuery(item, query));
      return new SimulatedSingleQuery(collection, matched);
    },

    findById: function (id: string) {
      const db = readDb();
      const items = db[collection] || [];
      const matched = items.find(
        (item: any) =>
          item._id === id ||
          item.id === id ||
          item.customId === id ||
          String(item._id) === String(id)
      );
      return new SimulatedSingleQuery(collection, matched);
    },

    create: async function (data: any) {
      const db = readDb();
      const items = db[collection] || [];
      const newObj = {
        _id: data._id || data.id || "id-" + Math.random().toString(36).substring(2, 11),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      items.push(newObj);
      db[collection] = items;
      writeDb(db);
      return new SimulatedDoc(collection, newObj);
    },

    findByIdAndUpdate: function (id: string, update: any) {
      const db = readDb();
      const items = db[collection] || [];
      const index = items.findIndex(
        (item: any) =>
          item._id === id ||
          item.id === id ||
          item.customId === id ||
          String(item._id) === String(id)
      );
      if (index === -1) return new SimulatedSingleQuery(collection, null);

      const updatedItem = {
        ...items[index],
        ...(update.$set || update),
        updatedAt: new Date().toISOString(),
      };

      items[index] = updatedItem;
      db[collection] = items;
      writeDb(db);
      return new SimulatedSingleQuery(collection, updatedItem);
    },

    findOneAndUpdate: function (query: any, update: any) {
      const db = readDb();
      const items = db[collection] || [];
      const index = items.findIndex((item: any) => matchQuery(item, query));
      if (index === -1) return new SimulatedSingleQuery(collection, null);

      const updatedItem = {
        ...items[index],
        ...(update.$set || update),
        updatedAt: new Date().toISOString(),
      };

      items[index] = updatedItem;
      db[collection] = items;
      writeDb(db);
      return new SimulatedSingleQuery(collection, updatedItem);
    },

    findByIdAndDelete: function (id: string) {
      const db = readDb();
      const items = db[collection] || [];
      const index = items.findIndex(
        (item: any) =>
          item._id === id ||
          item.id === id ||
          item.customId === id ||
          String(item._id) === String(id)
      );
      if (index === -1) return new SimulatedSingleQuery(collection, null);

      const removed = items.splice(index, 1)[0];
      db[collection] = items;
      writeDb(db);
      return new SimulatedSingleQuery(collection, removed);
    },

    findOneAndDelete: function (query: any) {
      const db = readDb();
      const items = db[collection] || [];
      const index = items.findIndex((item: any) => matchQuery(item, query));
      if (index === -1) return new SimulatedSingleQuery(collection, null);

      const removed = items.splice(index, 1)[0];
      db[collection] = items;
      writeDb(db);
      return new SimulatedSingleQuery(collection, removed);
    },

    countDocuments: async function (query?: any) {
      const db = readDb();
      const items = db[collection] || [];
      return items.filter((item: any) => matchQuery(item, query)).length;
    },
  };
}
