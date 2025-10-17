import {
  type User,
  type InsertUser,
  type Brick,
  type InsertBrick,
  type Transport,
  type InsertTransport,
  type Laborer,
  type InsertLaborer,
  type Order,
  type InsertOrder,
  type Invoice,
  type InsertInvoice,
  type Setting,
  type InsertSetting,
  type Expense,
  type InsertExpense,
  type KilnCapacity,
  type InsertKilnCapacity,
  type RoundCompletion,
  type InsertRoundCompletion,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Brick methods
  getAllBricks(): Promise<Brick[]>;
  getBrick(id: string): Promise<Brick | undefined>;
  createBrick(brick: InsertBrick): Promise<Brick>;
  updateBrick(
    id: string,
    brick: Partial<InsertBrick>
  ): Promise<Brick | undefined>;
  deleteBrick(id: string): Promise<boolean>;
  updateBrickStock(id: string, newStock: number): Promise<Brick | undefined>;

  // Transport methods
  getAllTransport(): Promise<Transport[]>;
  getTransport(id: string): Promise<Transport | undefined>;
  createTransport(Transport: InsertTransport): Promise<Transport>;
  updateTransport(
    id: string,
    Transport: Partial<InsertTransport>
  ): Promise<Transport | undefined>;
  deleteTransport(id: string): Promise<boolean>;
  getAvailableTransport(): Promise<Transport[]>;

  // Laborer methods
  getAllLaborers(): Promise<Laborer[]>;
  getLaborer(id: string): Promise<Laborer | undefined>;
  createLaborer(laborer: InsertLaborer): Promise<Laborer>;
  updateLaborer(
    id: string,
    laborer: Partial<InsertLaborer>
  ): Promise<Laborer | undefined>;
  deleteLaborer(id: string): Promise<boolean>;
  getActiveLaborers(): Promise<Laborer[]>;

  // Order methods
  getAllOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(
    id: string,
    order: Partial<InsertOrder>
  ): Promise<Order | undefined>;
  deleteOrder(id: string): Promise<boolean>;
  getOrdersByStatus(status: string): Promise<Order[]>;

  // Invoice methods
  getAllInvoices(): Promise<Invoice[]>;
  getInvoice(id: string): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(
    id: string,
    invoice: Partial<InsertInvoice>
  ): Promise<Invoice | undefined>;
  deleteInvoice(id: string): Promise<boolean>;
  getInvoiceByOrderId(orderId: string): Promise<Invoice | undefined>;

  // Settings methods
  getAllSettings(): Promise<Setting[]>;
  updateSettings(settings: InsertSetting[]): Promise<Setting[]>;

  // Expense methods
  getAllExpenses(): Promise<Expense[]>;
  getExpense(id: string): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(
    id: string,
    expense: Partial<InsertExpense>
  ): Promise<Expense | undefined>;
  deleteExpense(id: string): Promise<boolean>;

  // Kiln Capacity methods
  getAllKilns(): Promise<KilnCapacity[]>;
  getKiln(id: string): Promise<KilnCapacity | undefined>;
  createKiln(kiln: InsertKilnCapacity): Promise<KilnCapacity>;
  updateKiln(
    id: string,
    kiln: Partial<InsertKilnCapacity>
  ): Promise<KilnCapacity | undefined>;
  deleteKiln(id: string): Promise<boolean>;

  // Round Completion methods
  getAllRounds(): Promise<RoundCompletion[]>;
  getRound(id: string): Promise<RoundCompletion | undefined>;
  createRound(round: InsertRoundCompletion): Promise<RoundCompletion>;
  updateRound(
    id: string,
    round: Partial<InsertRoundCompletion>
  ): Promise<RoundCompletion | undefined>;
  deleteRound(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private bricks: Map<string, Brick>;
  private Transport: Map<string, Transport>;
  private laborers: Map<string, Laborer>;
  private orders: Map<string, Order>;
  private invoices: Map<string, Invoice>;
  private settings: Map<string, Setting>;
  private expenses: Map<string, Expense>;
  private kilns: Map<string, KilnCapacity>;
  private rounds: Map<string, RoundCompletion>;
  private orderCounter: number = 1;
  private invoiceCounter: number = 1;
  private roundCounter: number = 1;

  constructor() {
    this.users = new Map();
    this.bricks = new Map();
    this.Transport = new Map();
    this.laborers = new Map();
    this.orders = new Map();
    this.invoices = new Map();
    this.settings = new Map();
    this.expenses = new Map();
    this.kilns = new Map();
    this.rounds = new Map();

    // Initialize with some sample data
    this.initializeSampleData();
  }

  private async initializeSampleData() {
    // Sample bricks
    const sampleBricks: InsertBrick[] = [];

    for (const brick of sampleBricks) {
      await this.createBrick(brick);
    }

    // Sample Transport
    const sampleTransport: InsertTransport[] = [];

    for (const Transport of sampleTransport) {
      await this.createTransport(Transport);
    }

    // Sample laborers
    const sampleLaborers: InsertLaborer[] = [];

    for (const laborer of sampleLaborers) {
      await this.createLaborer(laborer);
    }

    // Sample settings
    const sampleSettings: Setting[] = [];
    for (const setting of sampleSettings) {
      this.settings.set(setting.key, setting);
    }
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Brick methods
  async getAllBricks(): Promise<Brick[]> {
    return Array.from(this.bricks.values());
  }

  async getBrick(id: string): Promise<Brick | undefined> {
    return this.bricks.get(id);
  }

  async createBrick(insertBrick: InsertBrick): Promise<Brick> {
    const id = randomUUID();
    const brick: Brick = {
      ...insertBrick,
      id,
      currentStock: insertBrick.currentStock || 0,
      minStock: insertBrick.minStock || 1000,
      lastUpdated: new Date(),
    };
    this.bricks.set(id, brick);
    return brick;
  }

  async updateBrick(
    id: string,
    updateData: Partial<InsertBrick>
  ): Promise<Brick | undefined> {
    const brick = this.bricks.get(id);
    if (!brick) return undefined;

    const updatedBrick: Brick = {
      ...brick,
      ...updateData,
      lastUpdated: new Date(),
    };
    this.bricks.set(id, updatedBrick);
    return updatedBrick;
  }

  async deleteBrick(id: string): Promise<boolean> {
    return this.bricks.delete(id);
  }

  async updateBrickStock(
    id: string,
    newStock: number
  ): Promise<Brick | undefined> {
    return this.updateBrick(id, { currentStock: newStock });
  }

  // Transport methods
  async getAllTransport(): Promise<Transport[]> {
    return Array.from(this.Transport.values());
  }

  async getTransport(id: string): Promise<Transport | undefined> {
    return this.Transport.get(id);
  }

  async createTransport(insertTransport: InsertTransport): Promise<Transport> {
    const id = randomUUID();
    const Transport: Transport = {
      ...insertTransport,
      id,
      status: insertTransport.status || "available",
      driverName: insertTransport.driverName || null,
      driverPhone: insertTransport.driverPhone || null,
      lastMaintenance: insertTransport.lastMaintenance || null,
      nextMaintenance: insertTransport.nextMaintenance || null,
    };
    this.Transport.set(id, Transport);
    return Transport;
  }

  async updateTransport(
    id: string,
    updateData: Partial<InsertTransport>
  ): Promise<Transport | undefined> {
    const Transport = this.Transport.get(id);
    if (!Transport) return undefined;

    const updatedTransport: Transport = { ...Transport, ...updateData };
    this.Transport.set(id, updatedTransport);
    return updatedTransport;
  }

  async deleteTransport(id: string): Promise<boolean> {
    return this.Transport.delete(id);
  }

  async getAvailableTransport(): Promise<Transport[]> {
    return Array.from(this.Transport.values()).filter(
      (t) => t.status === "available"
    );
  }

  // Laborer methods
  async getAllLaborers(): Promise<Laborer[]> {
    return Array.from(this.laborers.values());
  }

  async getLaborer(id: string): Promise<Laborer | undefined> {
    return this.laborers.get(id);
  }

  async createLaborer(insertLaborer: InsertLaborer): Promise<Laborer> {
    const id = randomUUID();
    const laborer: Laborer = {
      ...insertLaborer,
      id,
      // totalHoursWorked: 0, // Removed as hourly rate is no longer used
      address: insertLaborer.address || null,
      status: insertLaborer.status || "active",
    };
    this.laborers.set(id, laborer);
    return laborer;
  }

  async updateLaborer(
    id: string,
    updateData: Partial<InsertLaborer>
  ): Promise<Laborer | undefined> {
    const laborer = this.laborers.get(id);
    if (!laborer) return undefined;

    const updatedLaborer: Laborer = { ...laborer, ...updateData };
    this.laborers.set(id, updatedLaborer);
    return updatedLaborer;
  }

  async deleteLaborer(id: string): Promise<boolean> {
    return this.laborers.delete(id);
  }

  async getActiveLaborers(): Promise<Laborer[]> {
    return Array.from(this.laborers.values()).filter(
      (l) => l.status === "active"
    );
  }

  // Order methods
  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values()).sort(
      (a, b) =>
        new Date(b.orderDate!).getTime() - new Date(a.orderDate!).getTime()
    );
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const orderNumber = `ORD${String(this.orderCounter++).padStart(3, "0")}`;
    const order: Order = {
      ...insertOrder,
      id,
      orderNumber,
      orderDate: new Date(),
      status: insertOrder.status || "pending",
      customerPhone: insertOrder.customerPhone || null,
      assignedTransportId: insertOrder.assignedTransportId || null,
      assignedLaborerIds: insertOrder.assignedLaborerIds || [],
      deliveryDate: insertOrder.deliveryDate || null,
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrder(
    id: string,
    updateData: Partial<InsertOrder>
  ): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const updatedOrder: Order = { ...order, ...updateData };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  async deleteOrder(id: string): Promise<boolean> {
    return this.orders.delete(id);
  }

  async getOrdersByStatus(status: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter((o) => o.status === status);
  }

  // Invoice methods
  async getAllInvoices(): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).sort(
      (a, b) =>
        new Date(b.invoiceDate!).getTime() - new Date(a.invoiceDate!).getTime()
    );
  }

  async getInvoice(id: string): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const id = randomUUID();
    const invoiceNumber = `INV${String(this.invoiceCounter++).padStart(
      3,
      "0"
    )}`;
    const invoice: Invoice = {
      ...insertInvoice,
      id,
      invoiceNumber,
      invoiceDate: new Date(),
      paymentStatus: insertInvoice.paymentStatus || "pending",
      dueDate: insertInvoice.dueDate || null,
    };
    this.invoices.set(id, invoice);
    return invoice;
  }

  async updateInvoice(
    id: string,
    updateData: Partial<InsertInvoice>
  ): Promise<Invoice | undefined> {
    const invoice = this.invoices.get(id);
    if (!invoice) return undefined;

    const updatedInvoice: Invoice = { ...invoice, ...updateData };
    this.invoices.set(id, updatedInvoice);
    return updatedInvoice;
  }

  async deleteInvoice(id: string): Promise<boolean> {
    return this.invoices.delete(id);
  }

  async getInvoiceByOrderId(orderId: string): Promise<Invoice | undefined> {
    return Array.from(this.invoices.values()).find(
      (i) => i.orderId === orderId
    );
  }

  // Settings methods
  async getAllSettings(): Promise<Setting[]> {
    return Array.from(this.settings.values());
  }

  async updateSettings(settings: InsertSetting[]): Promise<Setting[]> {
    settings.forEach((setting) => {
      this.settings.set(setting.key, setting);
    });
    return this.getAllSettings();
  }

  // Expense methods
  async getAllExpenses(): Promise<Expense[]> {
    return Array.from(this.expenses.values()).sort(
      (a, b) =>
        new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime()
    );
  }

  async getExpense(id: string): Promise<Expense | undefined> {
    return this.expenses.get(id);
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const id = randomUUID();
    const expense: Expense = {
      ...insertExpense,
      id,
      expenseDate: insertExpense.expenseDate || new Date(),
      createdAt: new Date(),
      notes: insertExpense.notes || null,
      amount: String(insertExpense.amount),
    };
    this.expenses.set(id, expense);
    return expense;
  }

  async updateExpense(
    id: string,
    updateData: Partial<InsertExpense>
  ): Promise<Expense | undefined> {
    const expense = this.expenses.get(id);
    if (!expense) return undefined;

    const updatedExpense: Expense = {
      ...expense,
      ...updateData,
      amount: updateData.amount !== undefined ? String(updateData.amount) : expense.amount,
    };
    this.expenses.set(id, updatedExpense);
    return updatedExpense;
  }

  async deleteExpense(id: string): Promise<boolean> {
    return this.expenses.delete(id);
  }

  // Kiln Capacity methods
  async getAllKilns(): Promise<KilnCapacity[]> {
    return Array.from(this.kilns.values()).sort((a, b) =>
      (a.kilnNumber || "").localeCompare(b.kilnNumber || "")
    );
  }

  async getKiln(id: string): Promise<KilnCapacity | undefined> {
    return this.kilns.get(id);
  }

  async createKiln(insertKiln: InsertKilnCapacity): Promise<KilnCapacity> {
    const id = randomUUID();
    const kiln: KilnCapacity = {
      ...insertKiln,
      id,
      currentLoad: insertKiln.currentLoad || 0,
      status: insertKiln.status || "idle",
      startTime: insertKiln.startTime || null,
      endTime: insertKiln.endTime || null,
      temperature: insertKiln.temperature || null,
      lastUpdated: new Date(),
    };
    this.kilns.set(id, kiln);
    return kiln;
  }

  async updateKiln(
    id: string,
    updateData: Partial<InsertKilnCapacity>
  ): Promise<KilnCapacity | undefined> {
    const kiln = this.kilns.get(id);
    if (!kiln) return undefined;

    const updatedKiln: KilnCapacity = {
      ...kiln,
      ...updateData,
      lastUpdated: new Date(),
    };
    this.kilns.set(id, updatedKiln);
    return updatedKiln;
  }

  async deleteKiln(id: string): Promise<boolean> {
    return this.kilns.delete(id);
  }

  // Round Completion methods
  async getAllRounds(): Promise<RoundCompletion[]> {
    return Array.from(this.rounds.values()).sort(
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
  }

  async getRound(id: string): Promise<RoundCompletion | undefined> {
    return this.rounds.get(id);
  }

  async createRound(
    insertRound: InsertRoundCompletion
  ): Promise<RoundCompletion> {
    const id = randomUUID();
    const roundNumber =
      insertRound.roundNumber ||
      `RND${String(this.roundCounter++).padStart(4, "0")}`;
    const round: RoundCompletion = {
      ...insertRound,
      id,
      roundNumber,
      status: insertRound.status || "in_progress",
      startDate: insertRound.startDate || new Date(),
      completionDate: insertRound.completionDate || null,
      qualityGrade: insertRound.qualityGrade || null,
      notes: insertRound.notes || null,
      kilnId: insertRound.kilnId || null,
    };
    this.rounds.set(id, round);
    return round;
  }

  async updateRound(
    id: string,
    updateData: Partial<InsertRoundCompletion>
  ): Promise<RoundCompletion | undefined> {
    const round = this.rounds.get(id);
    if (!round) return undefined;

    const updatedRound: RoundCompletion = { ...round, ...updateData };
    this.rounds.set(id, updatedRound);
    return updatedRound;
  }

  async deleteRound(id: string): Promise<boolean> {
    return this.rounds.delete(id);
  }
}

export const storage = new MemStorage();
