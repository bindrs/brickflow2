// server/index.ts
import express from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  users;
  bricks;
  Transport;
  laborers;
  orders;
  invoices;
  settings;
  expenses;
  kilns;
  rounds;
  orderCounter = 1;
  invoiceCounter = 1;
  roundCounter = 1;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.bricks = /* @__PURE__ */ new Map();
    this.Transport = /* @__PURE__ */ new Map();
    this.laborers = /* @__PURE__ */ new Map();
    this.orders = /* @__PURE__ */ new Map();
    this.invoices = /* @__PURE__ */ new Map();
    this.settings = /* @__PURE__ */ new Map();
    this.expenses = /* @__PURE__ */ new Map();
    this.kilns = /* @__PURE__ */ new Map();
    this.rounds = /* @__PURE__ */ new Map();
    this.initializeSampleData();
  }
  async initializeSampleData() {
    const sampleBricks = [];
    for (const brick of sampleBricks) {
      await this.createBrick(brick);
    }
    const sampleTransport = [];
    for (const Transport2 of sampleTransport) {
      await this.createTransport(Transport2);
    }
    const sampleLaborers = [];
    for (const laborer of sampleLaborers) {
      await this.createLaborer(laborer);
    }
    const sampleSettings = [];
    for (const setting of sampleSettings) {
      this.settings.set(setting.key, setting);
    }
  }
  // User methods
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = randomUUID();
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  // Brick methods
  async getAllBricks() {
    return Array.from(this.bricks.values());
  }
  async getBrick(id) {
    return this.bricks.get(id);
  }
  async createBrick(insertBrick) {
    const id = randomUUID();
    const brick = {
      ...insertBrick,
      id,
      currentStock: insertBrick.currentStock || 0,
      minStock: insertBrick.minStock || 1e3,
      lastUpdated: /* @__PURE__ */ new Date()
    };
    this.bricks.set(id, brick);
    return brick;
  }
  async updateBrick(id, updateData) {
    const brick = this.bricks.get(id);
    if (!brick) return void 0;
    const updatedBrick = {
      ...brick,
      ...updateData,
      lastUpdated: /* @__PURE__ */ new Date()
    };
    this.bricks.set(id, updatedBrick);
    return updatedBrick;
  }
  async deleteBrick(id) {
    return this.bricks.delete(id);
  }
  async updateBrickStock(id, newStock) {
    return this.updateBrick(id, { currentStock: newStock });
  }
  // Transport methods
  async getAllTransport() {
    return Array.from(this.Transport.values());
  }
  async getTransport(id) {
    return this.Transport.get(id);
  }
  async createTransport(insertTransport) {
    const id = randomUUID();
    const Transport2 = {
      ...insertTransport,
      id,
      status: insertTransport.status || "available",
      driverName: insertTransport.driverName || null,
      driverPhone: insertTransport.driverPhone || null,
      lastMaintenance: insertTransport.lastMaintenance || null,
      nextMaintenance: insertTransport.nextMaintenance || null
    };
    this.Transport.set(id, Transport2);
    return Transport2;
  }
  async updateTransport(id, updateData) {
    const Transport2 = this.Transport.get(id);
    if (!Transport2) return void 0;
    const updatedTransport = { ...Transport2, ...updateData };
    this.Transport.set(id, updatedTransport);
    return updatedTransport;
  }
  async deleteTransport(id) {
    return this.Transport.delete(id);
  }
  async getAvailableTransport() {
    return Array.from(this.Transport.values()).filter(
      (t) => t.status === "available"
    );
  }
  // Laborer methods
  async getAllLaborers() {
    return Array.from(this.laborers.values());
  }
  async getLaborer(id) {
    return this.laborers.get(id);
  }
  async createLaborer(insertLaborer) {
    const id = randomUUID();
    const laborer = {
      ...insertLaborer,
      id,
      // totalHoursWorked: 0, // Removed as hourly rate is no longer used
      address: insertLaborer.address || null,
      status: insertLaborer.status || "active"
    };
    this.laborers.set(id, laborer);
    return laborer;
  }
  async updateLaborer(id, updateData) {
    const laborer = this.laborers.get(id);
    if (!laborer) return void 0;
    const updatedLaborer = { ...laborer, ...updateData };
    this.laborers.set(id, updatedLaborer);
    return updatedLaborer;
  }
  async deleteLaborer(id) {
    return this.laborers.delete(id);
  }
  async getActiveLaborers() {
    return Array.from(this.laborers.values()).filter(
      (l) => l.status === "active"
    );
  }
  // Order methods
  async getAllOrders() {
    return Array.from(this.orders.values()).sort(
      (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
    );
  }
  async getOrder(id) {
    return this.orders.get(id);
  }
  async createOrder(insertOrder) {
    const id = randomUUID();
    const orderNumber = `ORD${String(this.orderCounter++).padStart(3, "0")}`;
    const order = {
      ...insertOrder,
      id,
      orderNumber,
      orderDate: /* @__PURE__ */ new Date(),
      status: insertOrder.status || "pending",
      customerPhone: insertOrder.customerPhone || null,
      assignedTransportId: insertOrder.assignedTransportId || null,
      assignedLaborerIds: insertOrder.assignedLaborerIds || [],
      deliveryDate: insertOrder.deliveryDate || null
    };
    this.orders.set(id, order);
    return order;
  }
  async updateOrder(id, updateData) {
    const order = this.orders.get(id);
    if (!order) return void 0;
    const updatedOrder = { ...order, ...updateData };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
  async deleteOrder(id) {
    return this.orders.delete(id);
  }
  async getOrdersByStatus(status) {
    return Array.from(this.orders.values()).filter((o) => o.status === status);
  }
  // Invoice methods
  async getAllInvoices() {
    return Array.from(this.invoices.values()).sort(
      (a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime()
    );
  }
  async getInvoice(id) {
    return this.invoices.get(id);
  }
  async createInvoice(insertInvoice) {
    const id = randomUUID();
    const invoiceNumber = `INV${String(this.invoiceCounter++).padStart(
      3,
      "0"
    )}`;
    const invoice = {
      ...insertInvoice,
      id,
      invoiceNumber,
      invoiceDate: /* @__PURE__ */ new Date(),
      paymentStatus: insertInvoice.paymentStatus || "pending",
      dueDate: insertInvoice.dueDate || null
    };
    this.invoices.set(id, invoice);
    return invoice;
  }
  async updateInvoice(id, updateData) {
    const invoice = this.invoices.get(id);
    if (!invoice) return void 0;
    const updatedInvoice = { ...invoice, ...updateData };
    this.invoices.set(id, updatedInvoice);
    return updatedInvoice;
  }
  async deleteInvoice(id) {
    return this.invoices.delete(id);
  }
  async getInvoiceByOrderId(orderId) {
    return Array.from(this.invoices.values()).find(
      (i) => i.orderId === orderId
    );
  }
  // Settings methods
  async getAllSettings() {
    return Array.from(this.settings.values());
  }
  async updateSettings(settings2) {
    settings2.forEach((setting) => {
      this.settings.set(setting.key, setting);
    });
    return this.getAllSettings();
  }
  // Expense methods
  async getAllExpenses() {
    return Array.from(this.expenses.values()).sort(
      (a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime()
    );
  }
  async getExpense(id) {
    return this.expenses.get(id);
  }
  async createExpense(insertExpense) {
    const id = randomUUID();
    const expense = {
      ...insertExpense,
      id,
      expenseDate: insertExpense.expenseDate || /* @__PURE__ */ new Date(),
      createdAt: /* @__PURE__ */ new Date(),
      notes: insertExpense.notes || null,
      amount: String(insertExpense.amount)
    };
    this.expenses.set(id, expense);
    return expense;
  }
  async updateExpense(id, updateData) {
    const expense = this.expenses.get(id);
    if (!expense) return void 0;
    const updatedExpense = {
      ...expense,
      ...updateData,
      amount: updateData.amount !== void 0 ? String(updateData.amount) : expense.amount
    };
    this.expenses.set(id, updatedExpense);
    return updatedExpense;
  }
  async deleteExpense(id) {
    return this.expenses.delete(id);
  }
  // Kiln Capacity methods
  async getAllKilns() {
    return Array.from(this.kilns.values()).sort(
      (a, b) => (a.kilnNumber || "").localeCompare(b.kilnNumber || "")
    );
  }
  async getKiln(id) {
    return this.kilns.get(id);
  }
  async createKiln(insertKiln) {
    const id = randomUUID();
    const kiln = {
      ...insertKiln,
      id,
      currentLoad: insertKiln.currentLoad || 0,
      status: insertKiln.status || "idle",
      startTime: insertKiln.startTime || null,
      endTime: insertKiln.endTime || null,
      temperature: insertKiln.temperature || null,
      lastUpdated: /* @__PURE__ */ new Date()
    };
    this.kilns.set(id, kiln);
    return kiln;
  }
  async updateKiln(id, updateData) {
    const kiln = this.kilns.get(id);
    if (!kiln) return void 0;
    const updatedKiln = {
      ...kiln,
      ...updateData,
      lastUpdated: /* @__PURE__ */ new Date()
    };
    this.kilns.set(id, updatedKiln);
    return updatedKiln;
  }
  async deleteKiln(id) {
    return this.kilns.delete(id);
  }
  // Round Completion methods
  async getAllRounds() {
    return Array.from(this.rounds.values()).sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
  }
  async getRound(id) {
    return this.rounds.get(id);
  }
  async createRound(insertRound) {
    const id = randomUUID();
    const roundNumber = insertRound.roundNumber || `RND${String(this.roundCounter++).padStart(4, "0")}`;
    const round = {
      ...insertRound,
      id,
      roundNumber,
      status: insertRound.status || "in_progress",
      startDate: insertRound.startDate || /* @__PURE__ */ new Date(),
      completionDate: insertRound.completionDate || null,
      qualityGrade: insertRound.qualityGrade || null,
      notes: insertRound.notes || null,
      kilnId: insertRound.kilnId || null
    };
    this.rounds.set(id, round);
    return round;
  }
  async updateRound(id, updateData) {
    const round = this.rounds.get(id);
    if (!round) return void 0;
    const updatedRound = { ...round, ...updateData };
    this.rounds.set(id, updatedRound);
    return updatedRound;
  }
  async deleteRound(id) {
    return this.rounds.delete(id);
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  decimal,
  timestamp
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var bricks = pgTable("bricks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(),
  description: text("description").notNull(),
  currentStock: integer("current_stock").notNull().default(0),
  minStock: integer("min_stock").notNull().default(1e3),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  lastUpdated: timestamp("last_updated").defaultNow()
});
var Transport = pgTable("Transport", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  registrationNumber: text("registration_number").notNull().unique(),
  model: text("model").notNull(),
  driverName: text("driver_name"),
  driverPhone: text("driver_phone"),
  status: text("status").notNull().default("available"),
  // available, assigned, maintenance
  lastMaintenance: timestamp("last_maintenance"),
  nextMaintenance: timestamp("next_maintenance")
});
var laborers = pgTable("laborers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  address: text("address"),
  monthlySalary: decimal("monthly_salary", {
    precision: 10,
    scale: 2
  }).notNull(),
  status: text("status").notNull().default("active")
  // active, inactive, on_leave
});
var orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: text("order_number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone"),
  customerAddress: text("customer_address").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  brickType: text("brick_type").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  assignedTransportId: varchar("assigned_Transport_id"),
  assignedLaborerIds: text("assigned_laborer_ids").array(),
  status: text("status").notNull().default("pending"),
  // pending, in_transit, delivered, cancelled
  orderDate: timestamp("order_date").defaultNow(),
  deliveryDate: timestamp("delivery_date")
});
var invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceNumber: text("invoice_number").notNull().unique(),
  orderId: varchar("order_id").notNull(),
  customerName: text("customer_name").notNull(),
  customerAddress: text("customer_address").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  items: text("items").notNull(),
  // JSON string of invoice items
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 12, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
  paymentStatus: text("payment_status").notNull().default("pending"),
  // pending, paid, overdue
  invoiceDate: timestamp("invoice_date").defaultNow(),
  dueDate: timestamp("due_date")
});
var settings = pgTable("settings", {
  key: varchar("key").primaryKey(),
  value: text("value").notNull()
});
var expenses = pgTable("expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  category: text("category").notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  expenseDate: timestamp("expense_date").notNull().defaultNow(),
  paymentMethod: text("payment_method").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});
var kilnCapacity = pgTable("kiln_capacity", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  kilnNumber: text("kiln_number").notNull(),
  capacity: integer("capacity").notNull(),
  currentLoad: integer("current_load").notNull().default(0),
  brickType: text("brick_type").notNull(),
  status: text("status").notNull().default("idle"),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  temperature: integer("temperature"),
  lastUpdated: timestamp("last_updated").defaultNow()
});
var roundCompletions = pgTable("round_completions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roundNumber: text("round_number").notNull().unique(),
  kilnId: varchar("kiln_id"),
  brickType: text("brick_type").notNull(),
  quantity: integer("quantity").notNull(),
  status: text("status").notNull().default("in_progress"),
  startDate: timestamp("start_date").notNull().defaultNow(),
  completionDate: timestamp("completion_date"),
  qualityGrade: text("quality_grade"),
  notes: text("notes")
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var insertBrickSchema = createInsertSchema(bricks).omit({
  id: true,
  lastUpdated: true
});
var insertTransportchema = createInsertSchema(Transport).omit({
  id: true
});
var insertLaborerSchema = createInsertSchema(laborers).omit({
  id: true
});
var insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  orderNumber: true,
  orderDate: true
});
var insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  invoiceDate: true
});
var insertSettingSchema = createInsertSchema(settings);
var insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true
}).extend({
  expenseDate: z.union([z.string(), z.date()]).transform((val) => typeof val === "string" ? new Date(val) : val),
  amount: z.union([z.string(), z.number()]).transform((val) => typeof val === "string" ? parseFloat(val) : val)
});
var insertKilnCapacitySchema = createInsertSchema(kilnCapacity).omit({
  id: true,
  lastUpdated: true
}).extend({
  startTime: z.union([z.string(), z.date(), z.null()]).transform((val) => {
    if (val === null || val === void 0) return null;
    return typeof val === "string" ? new Date(val) : val;
  }).optional().nullable(),
  endTime: z.union([z.string(), z.date(), z.null()]).transform((val) => {
    if (val === null || val === void 0) return null;
    return typeof val === "string" ? new Date(val) : val;
  }).optional().nullable(),
  capacity: z.union([z.string(), z.number()]).transform((val) => typeof val === "string" ? parseInt(val) : val),
  currentLoad: z.union([z.string(), z.number()]).transform((val) => typeof val === "string" ? parseInt(val) : val).optional(),
  temperature: z.union([z.string(), z.number(), z.null()]).transform((val) => {
    if (val === null || val === void 0 || val === "") return null;
    return typeof val === "string" ? parseInt(val) : val;
  }).optional().nullable()
});
var insertRoundCompletionSchema = createInsertSchema(roundCompletions).omit({
  id: true
}).extend({
  startDate: z.union([z.string(), z.date()]).transform((val) => typeof val === "string" ? new Date(val) : val),
  completionDate: z.union([z.string(), z.date(), z.null()]).transform((val) => {
    if (val === null || val === void 0) return null;
    return typeof val === "string" ? new Date(val) : val;
  }).optional().nullable(),
  quantity: z.union([z.string(), z.number()]).transform((val) => typeof val === "string" ? parseInt(val) : val)
});

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/api/bricks", async (req, res) => {
    try {
      const bricks2 = await storage.getAllBricks();
      res.json(bricks2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bricks" });
    }
  });
  app2.post("/api/bricks", async (req, res) => {
    try {
      const validatedData = insertBrickSchema.parse(req.body);
      const brick = await storage.createBrick(validatedData);
      res.status(201).json(brick);
    } catch (error) {
      res.status(400).json({ message: "Invalid brick data" });
    }
  });
  app2.put("/api/bricks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertBrickSchema.partial().parse(req.body);
      const brick = await storage.updateBrick(id, validatedData);
      if (!brick) {
        return res.status(404).json({ message: "Brick not found" });
      }
      res.json(brick);
    } catch (error) {
      res.status(400).json({ message: "Invalid brick data" });
    }
  });
  app2.delete("/api/bricks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteBrick(id);
      if (!deleted) {
        return res.status(404).json({ message: "Brick not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete brick" });
    }
  });
  app2.get("/api/Transport", async (req, res) => {
    try {
      const Transport2 = await storage.getAllTransport();
      res.json(Transport2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch Transport" });
    }
  });
  app2.get("/api/Transport/available", async (req, res) => {
    try {
      const Transport2 = await storage.getAvailableTransport();
      res.json(Transport2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch available Transport" });
    }
  });
  app2.post("/api/Transport", async (req, res) => {
    try {
      const validatedData = insertTransportchema.parse(req.body);
      const Transport2 = await storage.createTransport(validatedData);
      res.status(201).json(Transport2);
    } catch (error) {
      res.status(400).json({ message: "Invalid Transport data" });
    }
  });
  app2.put("/api/Transport/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertTransportchema.partial().parse(req.body);
      const Transport2 = await storage.updateTransport(id, validatedData);
      if (!Transport2) {
        return res.status(404).json({ message: "Transport not found" });
      }
      res.json(Transport2);
    } catch (error) {
      res.status(400).json({ message: "Invalid Transport data" });
    }
  });
  app2.delete("/api/Transport/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteTransport(id);
      if (!deleted) {
        return res.status(404).json({ message: "Transport not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete Transport" });
    }
  });
  app2.get("/api/laborers", async (req, res) => {
    try {
      const laborers2 = await storage.getAllLaborers();
      res.json(laborers2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch laborers" });
    }
  });
  app2.get("/api/laborers/active", async (req, res) => {
    try {
      const laborers2 = await storage.getActiveLaborers();
      res.json(laborers2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active laborers" });
    }
  });
  app2.post("/api/laborers", async (req, res) => {
    try {
      const validatedData = insertLaborerSchema.parse(req.body);
      const laborer = await storage.createLaborer(validatedData);
      res.status(201).json(laborer);
    } catch (error) {
      res.status(400).json({ message: "Invalid laborer data" });
    }
  });
  app2.put("/api/laborers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertLaborerSchema.partial().parse(req.body);
      const laborer = await storage.updateLaborer(id, validatedData);
      if (!laborer) {
        return res.status(404).json({ message: "Laborer not found" });
      }
      res.json(laborer);
    } catch (error) {
      res.status(400).json({ message: "Invalid laborer data" });
    }
  });
  app2.delete("/api/laborers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteLaborer(id);
      if (!deleted) {
        return res.status(404).json({ message: "Laborer not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete laborer" });
    }
  });
  app2.get("/api/orders", async (req, res) => {
    try {
      const orders2 = await storage.getAllOrders();
      res.json(orders2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });
  app2.get("/api/orders/status/:status", async (req, res) => {
    try {
      const { status } = req.params;
      const orders2 = await storage.getOrdersByStatus(status);
      res.json(orders2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders by status" });
    }
  });
  app2.post("/api/orders", async (req, res) => {
    try {
      const validatedData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(validatedData);
      const brick = await storage.getBrick(validatedData.brickType);
      if (brick) {
        await storage.updateBrickStock(
          brick.id,
          brick.currentStock - validatedData.quantity
        );
      }
      if (validatedData.assignedTransportId) {
        await storage.updateTransport(validatedData.assignedTransportId, {
          status: "assigned"
        });
      }
      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ message: "Invalid order data" });
    }
  });
  app2.put("/api/orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertOrderSchema.partial().parse(req.body);
      const order = await storage.updateOrder(id, validatedData);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(400).json({ message: "Invalid order data" });
    }
  });
  app2.delete("/api/orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteOrder(id);
      if (!deleted) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete order" });
    }
  });
  app2.get("/api/invoices", async (req, res) => {
    try {
      const invoices2 = await storage.getAllInvoices();
      res.json(invoices2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });
  app2.get("/api/invoices/order/:orderId", async (req, res) => {
    try {
      const { orderId } = req.params;
      const invoice = await storage.getInvoiceByOrderId(orderId);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });
  app2.post("/api/invoices", async (req, res) => {
    try {
      const payload = { ...req.body };
      for (const key of Object.keys(payload)) {
        const val = payload[key];
        if (typeof val === "string" && /date$/i.test(key)) {
          const d = new Date(val);
          if (!isNaN(d.getTime())) payload[key] = d;
        }
      }
      const validatedData = insertInvoiceSchema.parse(payload);
      const invoice = await storage.createInvoice(validatedData);
      res.status(201).json(invoice);
    } catch (error) {
      const errBody = { message: "Invalid invoice data" };
      if (error && typeof error === "object" && "issues" in error) {
        errBody.details = error.issues;
      } else if (error instanceof Error) {
        errBody.details = error.message;
      }
      res.status(400).json(errBody);
    }
  });
  app2.put("/api/invoices/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const payload = { ...req.body };
      for (const key of Object.keys(payload)) {
        const val = payload[key];
        if (typeof val === "string" && /date$/i.test(key)) {
          const d = new Date(val);
          if (!isNaN(d.getTime())) payload[key] = d;
        }
      }
      const validatedData = insertInvoiceSchema.partial().parse(payload);
      const invoice = await storage.updateInvoice(id, validatedData);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      if (validatedData.paymentStatus === "paid" && invoice.orderId) {
        await storage.updateOrder(invoice.orderId, { status: "delivered" });
      }
      res.json(invoice);
    } catch (error) {
      const errBody = { message: "Invalid invoice data" };
      if (error && typeof error === "object" && "issues" in error) {
        errBody.details = error.issues;
      } else if (error instanceof Error) {
        errBody.details = error.message;
      }
      res.status(400).json(errBody);
    }
  });
  app2.delete("/api/invoices/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteInvoice(id);
      if (!deleted) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete invoice" });
    }
  });
  app2.get("/api/expenses", async (req, res) => {
    try {
      const expenses2 = await storage.getAllExpenses();
      res.json(expenses2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });
  app2.post("/api/expenses", async (req, res) => {
    try {
      const payload = { ...req.body };
      if (typeof payload.expenseDate === "string") {
        payload.expenseDate = new Date(payload.expenseDate);
      }
      if (typeof payload.amount === "string") {
        payload.amount = parseFloat(payload.amount);
      }
      const validatedData = insertExpenseSchema.parse(payload);
      const expense = await storage.createExpense(validatedData);
      res.status(201).json(expense);
    } catch (error) {
      const errBody = { message: "Invalid expense data" };
      if (error && typeof error === "object" && "issues" in error) {
        errBody.details = error.issues;
      } else if (error instanceof Error) {
        errBody.details = error.message;
      }
      res.status(400).json(errBody);
    }
  });
  app2.put("/api/expenses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const payload = { ...req.body };
      if (typeof payload.expenseDate === "string") {
        payload.expenseDate = new Date(payload.expenseDate);
      }
      if (typeof payload.amount === "string") {
        payload.amount = parseFloat(payload.amount);
      }
      const validatedData = insertExpenseSchema.partial().parse(payload);
      const expense = await storage.updateExpense(id, validatedData);
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      res.json(expense);
    } catch (error) {
      const errBody = { message: "Invalid expense data" };
      if (error && typeof error === "object" && "issues" in error) {
        errBody.details = error.issues;
      } else if (error instanceof Error) {
        errBody.details = error.message;
      }
      res.status(400).json(errBody);
    }
  });
  app2.delete("/api/expenses/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteExpense(id);
      if (!deleted) {
        return res.status(404).json({ message: "Expense not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });
  app2.get("/api/kiln-capacity", async (req, res) => {
    try {
      const kilns = await storage.getAllKilns();
      res.json(kilns);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch kiln capacity data" });
    }
  });
  app2.post("/api/kiln-capacity", async (req, res) => {
    try {
      const payload = { ...req.body };
      if (typeof payload.startTime === "string") {
        payload.startTime = new Date(payload.startTime);
      }
      if (typeof payload.endTime === "string") {
        payload.endTime = new Date(payload.endTime);
      }
      if (typeof payload.capacity === "string") {
        payload.capacity = parseInt(payload.capacity);
      }
      if (typeof payload.currentLoad === "string") {
        payload.currentLoad = parseInt(payload.currentLoad);
      }
      if (typeof payload.temperature === "string") {
        payload.temperature = parseInt(payload.temperature);
      }
      const validatedData = insertKilnCapacitySchema.parse(payload);
      const kiln = await storage.createKiln(validatedData);
      res.status(201).json(kiln);
    } catch (error) {
      const errBody = { message: "Invalid kiln capacity data" };
      if (error && typeof error === "object" && "issues" in error) {
        errBody.details = error.issues;
      } else if (error instanceof Error) {
        errBody.details = error.message;
      }
      res.status(400).json(errBody);
    }
  });
  app2.put("/api/kiln-capacity/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const payload = { ...req.body };
      if (typeof payload.startTime === "string") {
        payload.startTime = new Date(payload.startTime);
      }
      if (typeof payload.endTime === "string") {
        payload.endTime = new Date(payload.endTime);
      }
      if (typeof payload.capacity === "string") {
        payload.capacity = parseInt(payload.capacity);
      }
      if (typeof payload.currentLoad === "string") {
        payload.currentLoad = parseInt(payload.currentLoad);
      }
      if (typeof payload.temperature === "string") {
        payload.temperature = parseInt(payload.temperature);
      }
      const validatedData = insertKilnCapacitySchema.partial().parse(payload);
      const kiln = await storage.updateKiln(id, validatedData);
      if (!kiln) {
        return res.status(404).json({ message: "Kiln not found" });
      }
      res.json(kiln);
    } catch (error) {
      const errBody = { message: "Invalid kiln capacity data" };
      if (error && typeof error === "object" && "issues" in error) {
        errBody.details = error.issues;
      } else if (error instanceof Error) {
        errBody.details = error.message;
      }
      res.status(400).json(errBody);
    }
  });
  app2.delete("/api/kiln-capacity/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteKiln(id);
      if (!deleted) {
        return res.status(404).json({ message: "Kiln not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete kiln" });
    }
  });
  app2.get("/api/round-completions", async (req, res) => {
    try {
      const rounds = await storage.getAllRounds();
      res.json(rounds);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch round completions" });
    }
  });
  app2.post("/api/round-completions", async (req, res) => {
    try {
      const payload = { ...req.body };
      if (typeof payload.startDate === "string") {
        payload.startDate = new Date(payload.startDate);
      }
      if (typeof payload.completionDate === "string") {
        payload.completionDate = new Date(payload.completionDate);
      }
      if (typeof payload.quantity === "string") {
        payload.quantity = parseInt(payload.quantity);
      }
      const validatedData = insertRoundCompletionSchema.parse(payload);
      const round = await storage.createRound(validatedData);
      res.status(201).json(round);
    } catch (error) {
      const errBody = { message: "Invalid round completion data" };
      if (error && typeof error === "object" && "issues" in error) {
        errBody.details = error.issues;
      } else if (error instanceof Error) {
        errBody.details = error.message;
      }
      res.status(400).json(errBody);
    }
  });
  app2.put("/api/round-completions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const payload = { ...req.body };
      if (typeof payload.startDate === "string") {
        payload.startDate = new Date(payload.startDate);
      }
      if (typeof payload.completionDate === "string") {
        payload.completionDate = new Date(payload.completionDate);
      }
      if (typeof payload.quantity === "string") {
        payload.quantity = parseInt(payload.quantity);
      }
      const validatedData = insertRoundCompletionSchema.partial().parse(payload);
      const round = await storage.updateRound(id, validatedData);
      if (!round) {
        return res.status(404).json({ message: "Round completion not found" });
      }
      res.json(round);
    } catch (error) {
      const errBody = { message: "Invalid round completion data" };
      if (error && typeof error === "object" && "issues" in error) {
        errBody.details = error.issues;
      } else if (error instanceof Error) {
        errBody.details = error.message;
      }
      res.status(400).json(errBody);
    }
  });
  app2.delete("/api/round-completions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteRound(id);
      if (!deleted) {
        return res.status(404).json({ message: "Round completion not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete round completion" });
    }
  });
  app2.get("/api/settings", async (req, res) => {
    try {
      const settings2 = await storage.getAllSettings();
      res.json(settings2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });
  app2.put("/api/settings", async (req, res) => {
    try {
      const validatedData = insertSettingSchema.array().parse(req.body);
      const settings2 = await storage.updateSettings(validatedData);
      res.json(settings2);
    } catch (error) {
      res.status(400).json({ message: "Invalid settings data" });
    }
  });
  app2.get("/api/statistics", async (req, res) => {
    try {
      const bricks2 = await storage.getAllBricks();
      const Transport2 = await storage.getAllTransport();
      const laborers2 = await storage.getAllLaborers();
      const orders2 = await storage.getAllOrders();
      const invoices2 = await storage.getAllInvoices();
      const stats = {
        totalBricks: bricks2.reduce((sum, brick) => sum + brick.currentStock, 0),
        availableTransport: Transport2.filter((t) => t.status === "available").length,
        activeLaborers: laborers2.filter((l) => l.status === "active").length,
        pendingOrders: orders2.filter((o) => o.status === "pending").length,
        totalSales: invoices2.filter((i) => i.paymentStatus === "paid").reduce((sum, invoice) => sum + parseFloat(invoice.totalAmount), 0),
        lowStockBricks: bricks2.filter(
          (brick) => brick.currentStock <= brick.minStock
        )
      };
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}

// server/index.ts
import path3 from "path";
import { fileURLToPath } from "url";
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path4 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path4.startsWith("/api")) {
      let logLine = `${req.method} ${path4} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path3.dirname(__filename);
    const clientDistPath = path3.join(__dirname, "../../client/dist");
    app.use(express.static(clientDistPath));
    app.get("*", (req, res) => {
      res.sendFile(path3.join(clientDistPath, "index.html"));
    });
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  app.listen(port, () => {
    log(`serving on port ${port}`);
  });
})();
