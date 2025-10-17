import { randomUUID } from "crypto";

export class MemStorage {
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
    this.orderCounter = 1;
    this.invoiceCounter = 1;
    this.roundCounter = 1;

    this.initializeSampleData();
  }

  async initializeSampleData() {
    const sampleBricks = [];
    for (const brick of sampleBricks) {
      await this.createBrick(brick);
    }

    const sampleTransport = [];
    for (const Transport of sampleTransport) {
      await this.createTransport(Transport);
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
      minStock: insertBrick.minStock || 1000,
      lastUpdated: new Date(),
    };
    this.bricks.set(id, brick);
    return brick;
  }

  async updateBrick(id, updateData) {
    const brick = this.bricks.get(id);
    if (!brick) return undefined;

    const updatedBrick = {
      ...brick,
      ...updateData,
      lastUpdated: new Date(),
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
    const Transport = {
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

  async updateTransport(id, updateData) {
    const Transport = this.Transport.get(id);
    if (!Transport) return undefined;

    const updatedTransport = { ...Transport, ...updateData };
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
      address: insertLaborer.address || null,
      status: insertLaborer.status || "active",
    };
    this.laborers.set(id, laborer);
    return laborer;
  }

  async updateLaborer(id, updateData) {
    const laborer = this.laborers.get(id);
    if (!laborer) return undefined;

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
      (a, b) =>
        new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
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

  async updateOrder(id, updateData) {
    const order = this.orders.get(id);
    if (!order) return undefined;

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
      (a, b) =>
        new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime()
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
      invoiceDate: new Date(),
      paymentStatus: insertInvoice.paymentStatus || "pending",
      dueDate: insertInvoice.dueDate || null,
    };
    this.invoices.set(id, invoice);
    return invoice;
  }

  async updateInvoice(id, updateData) {
    const invoice = this.invoices.get(id);
    if (!invoice) return undefined;

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

  async updateSettings(settings) {
    settings.forEach((setting) => {
      this.settings.set(setting.key, setting);
    });
    return this.getAllSettings();
  }

  // Expense methods
  async getAllExpenses() {
    return Array.from(this.expenses.values()).sort(
      (a, b) =>
        new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime()
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
      expenseDate: insertExpense.expenseDate || new Date(),
      createdAt: new Date(),
      notes: insertExpense.notes || null,
      amount: String(insertExpense.amount),
    };
    this.expenses.set(id, expense);
    return expense;
  }

  async updateExpense(id, updateData) {
    const expense = this.expenses.get(id);
    if (!expense) return undefined;

    const updatedExpense = {
      ...expense,
      ...updateData,
      amount: updateData.amount !== undefined ? String(updateData.amount) : expense.amount,
    };
    this.expenses.set(id, updatedExpense);
    return updatedExpense;
  }

  async deleteExpense(id) {
    return this.expenses.delete(id);
  }

  // Kiln Capacity methods
  async getAllKilns() {
    return Array.from(this.kilns.values()).sort((a, b) =>
      (a.kilnNumber || "").localeCompare(b.kilnNumber || "")
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
      lastUpdated: new Date(),
    };
    this.kilns.set(id, kiln);
    return kiln;
  }

  async updateKiln(id, updateData) {
    const kiln = this.kilns.get(id);
    if (!kiln) return undefined;

    const updatedKiln = {
      ...kiln,
      ...updateData,
      lastUpdated: new Date(),
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
      (a, b) =>
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
  }

  async getRound(id) {
    return this.rounds.get(id);
  }

  async createRound(insertRound) {
    const id = randomUUID();
    const roundNumber =
      insertRound.roundNumber ||
      `RND${String(this.roundCounter++).padStart(4, "0")}`;
    const round = {
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

  async updateRound(id, updateData) {
    const round = this.rounds.get(id);
    if (!round) return undefined;

    const updatedRound = { ...round, ...updateData };
    this.rounds.set(id, updatedRound);
    return updatedRound;
  }

  async deleteRound(id) {
    return this.rounds.delete(id);
  }
}

export const storage = new MemStorage();
