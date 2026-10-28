import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { DEFAULT_STORES } from "../../data/storesData";

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
      fullName: "Quản trị viên",
      phone: "0900000000",
      role: "admin",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: "user-default-id",
      username: "user",
      email: "user@sachse.com",
      password: userPasswordHash,
      fullName: "Khách hàng",
      phone: "0911111111",
      role: "user",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
}

// Ensure local-preview-db.json exists with correct schemas
function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(
        DB_FILE,
        JSON.stringify({
          users: getDefaultUsers(),
          bookings: [],
          orders: [],
          stores: DEFAULT_STORES,
          products: [
            {
              _id: "prod-1",
              name: "Nước giặt mộc mạc hữu cơ",
              description: "Thành phần thiên nhiên lành tính cho da em bé nhạy cảm",
              price: 135000,
              originalPrice: 155000,
              category: "detergent",
              stock: 50,
              unit: "Chai",
              isActive: true,
              createdAt: new Date().toISOString()
            },
            {
              _id: "prod-2",
              name: "Nước xả vải mây trắng thơm lâu",
              description: "Hương hoa mộc mạc thơm dịu dàng dài lâu suốt ngày dài rực rỡ",
              price: 95000,
              originalPrice: 110000,
              category: "softener",
              stock: 35,
              unit: "Chai",
              isActive: true,
              createdAt: new Date().toISOString()
            }
          ],
          equipment: [],
          payments: []
        }, null, 2),
        "utf8"
      );
    }
    const content = fs.readFileSync(DB_FILE, "utf8");
    const db = JSON.parse(content);
    let needUpdate = false;
    if (!db.users || db.users.length === 0) {
      db.users = getDefaultUsers();
      needUpdate = true;
    }
    if (!db.stores || db.stores.length === 0) {
      db.stores = DEFAULT_STORES;
      needUpdate = true;
    }
    if (!db.laundry_orders) {
      db.laundry_orders = [];
      needUpdate = true;
    }
    if (!db.delivery_tasks) {
      db.delivery_tasks = [];
      needUpdate = true;
    }
    if (!db.reviews) {
      db.reviews = [];
      needUpdate = true;
    }
    if (needUpdate) {
      writeDb(db);
    }
    return db;
  } catch (err) {
    return { users: getDefaultUsers(), bookings: [], orders: [], products: [], equipment: [], payments: [], stores: DEFAULT_STORES, laundry_orders: [], delivery_tasks: [], reviews: [] };
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
      // Basic support for $in, etc.
      if (Array.isArray(queryVal.$in)) {
        if (!queryVal.$in.includes(itemVal)) return false;
      }
    } else {
      if (itemVal !== queryVal) return false;
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
    return this._id;
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
    this.item = item ? (item instanceof SimulatedDoc ? item : new SimulatedDoc(collection, item)) : null;
  }

  select(fieldsString?: string) {
    return this;
  }

  populate(path?: any) {
    return this;
  }

  exec() {
    return Promise.resolve(this.item);
  }

  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    return Promise.resolve(this.item).then(onfulfilled, onrejected);
  }
}

// Emulated Query object for chaining like sort, skip, limit, select
class SimulatedQuery {
  private items: any[];
  private _collection: string;

  constructor(collection: string, items: any[]) {
    this._collection = collection;
    this.items = items.map(item => item instanceof SimulatedDoc ? item : new SimulatedDoc(collection, item));
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

  select(fieldsString?: string) {
    return this;
  }

  populate(path?: any) {
    return this;
  }

  exec() {
    return Promise.resolve(this.items);
  }

  // Support thenable for Promise.all or awaiting
  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    return Promise.resolve(this.items).then(onfulfilled, onrejected);
  }
}

// Generate the fallback query methods for a given collection
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
      const matched = items.find((item: any) => item._id === id || item.id === id || String(item._id) === String(id));
      return new SimulatedSingleQuery(collection, matched);
    },

    create: async function (data: any) {
      const db = readDb();
      const items = db[collection] || [];
      const newObj = {
        _id: "id-" + Math.random().toString(36).substring(2, 11),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      items.push(newObj);
      db[collection] = items;
      writeDb(db);
      return new SimulatedDoc(collection, newObj);
    },

    findByIdAndUpdate: function (id: string, update: any, options?: any) {
      const db = readDb();
      const items = db[collection] || [];
      const index = items.findIndex((item: any) => item._id === id || item.id === id || String(item._id) === String(id));
      if (index === -1) return new SimulatedSingleQuery(collection, null);
      
      const updatedItem = {
        ...items[index],
        ...(update.$set || update),
        updatedAt: new Date().toISOString()
      };
      
      items[index] = updatedItem;
      db[collection] = items;
      writeDb(db);
      return new SimulatedSingleQuery(collection, updatedItem);
    },

    findOneAndUpdate: function (query: any, update: any, options?: any) {
      const db = readDb();
      const items = db[collection] || [];
      const index = items.findIndex((item: any) => matchQuery(item, query));
      if (index === -1) return new SimulatedSingleQuery(collection, null);

      const updatedItem = {
        ...items[index],
        ...(update.$set || update),
        updatedAt: new Date().toISOString()
      };

      items[index] = updatedItem;
      db[collection] = items;
      writeDb(db);
      return new SimulatedSingleQuery(collection, updatedItem);
    },

    findByIdAndDelete: function (id: string) {
      const db = readDb();
      const items = db[collection] || [];
      const index = items.findIndex((item: any) => item._id === id || item.id === id || String(item._id) === String(id));
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
    }
  };
}

