import { z } from "zod";

// Brick schema
export const insertBrickSchema = z.object({
  type: z.string(),
  description: z.string(),
  currentStock: z.number().optional(),
  minStock: z.number().optional(),
  unitPrice: z.string(),
});

// Transport schema (fixed typo from insertTransportchema)
export const insertTransportSchema = z.object({
  registrationNumber: z.string(),
  model: z.string(),
  driverName: z.string().optional().nullable(),
  driverPhone: z.string().optional().nullable(),
  status: z.string().optional(),
  lastMaintenance: z.date().optional().nullable(),
  nextMaintenance: z.date().optional().nullable(),
});

// Laborer schema
export const insertLaborerSchema = z.object({
  name: z.string(),
  phone: z.string(),
  address: z.string().optional().nullable(),
  monthlySalary: z.string(),
  status: z.string().optional(),
});

// Order schema
export const insertOrderSchema = z.object({
  customerName: z.string(),
  customerPhone: z.string().optional().nullable(),
  customerAddress: z.string(),
  deliveryAddress: z.string(),
  brickType: z.string(),
  quantity: z.number(),
  unitPrice: z.string(),
  totalAmount: z.string(),
  assignedTransportId: z.string().optional().nullable(),
  assignedLaborerIds: z.array(z.string()).optional(),
  status: z.string().optional(),
  deliveryDate: z.date().optional().nullable(),
});

// Invoice schema
export const insertInvoiceSchema = z.object({
  orderId: z.string(),
  customerName: z.string(),
  customerAddress: z.string(),
  deliveryAddress: z.string(),
  items: z.string(),
  subtotal: z.string(),
  taxAmount: z.string(),
  totalAmount: z.string(),
  paymentStatus: z.string().optional(),
  invoiceNumber: z.string().optional(),
  dueDate: z.date().optional().nullable(),
});

// Setting schema
export const insertSettingSchema = z.object({
  key: z.string(),
  value: z.string(),
});

// Expense schema
export const insertExpenseSchema = z.object({
  category: z.string(),
  description: z.string(),
  amount: z.union([z.string(), z.number()]).transform((val) => 
    typeof val === "string" ? parseFloat(val) : val
  ),
  expenseDate: z.union([z.string(), z.date()]).transform((val) => 
    typeof val === "string" ? new Date(val) : val
  ).optional(),
  paymentMethod: z.string(),
  notes: z.string().optional().nullable(),
});

// Kiln Capacity schema
export const insertKilnCapacitySchema = z.object({
  kilnNumber: z.string(),
  capacity: z.union([z.string(), z.number()]).transform((val) => 
    typeof val === "string" ? parseInt(val) : val
  ),
  currentLoad: z.union([z.string(), z.number()]).transform((val) => 
    typeof val === "string" ? parseInt(val) : val
  ).optional(),
  brickType: z.string(),
  status: z.string().optional(),
  startTime: z.union([z.string(), z.date(), z.null()]).transform((val) => {
    if (val === null || val === undefined) return null;
    return typeof val === "string" ? new Date(val) : val;
  }).optional().nullable(),
  endTime: z.union([z.string(), z.date(), z.null()]).transform((val) => {
    if (val === null || val === undefined) return null;
    return typeof val === "string" ? new Date(val) : val;
  }).optional().nullable(),
  temperature: z.union([z.string(), z.number(), z.null()]).transform((val) => {
    if (val === null || val === undefined || val === "") return null;
    return typeof val === "string" ? parseInt(val) : val;
  }).optional().nullable(),
});

// Round Completion schema
export const insertRoundCompletionSchema = z.object({
  roundNumber: z.string().optional(),
  kilnId: z.string().optional().nullable(),
  brickType: z.string(),
  quantity: z.union([z.string(), z.number()]).transform((val) => 
    typeof val === "string" ? parseInt(val) : val
  ),
  status: z.string().optional(),
  startDate: z.union([z.string(), z.date()]).transform((val) => 
    typeof val === "string" ? new Date(val) : val
  ).optional(),
  completionDate: z.union([z.string(), z.date(), z.null()]).transform((val) => {
    if (val === null || val === undefined) return null;
    return typeof val === "string" ? new Date(val) : val;
  }).optional().nullable(),
  qualityGrade: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});
