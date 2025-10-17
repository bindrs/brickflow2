import { useState } from "react";
import {
  ShoppingCartIcon,
  PlusIcon,
  EyeIcon,
  FileTextIcon,
  PrinterIcon,
  SearchIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/contexts/AppContext";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  insertOrderSchema,
  type InsertOrder,
  type Brick,
  type Transport,
} from "@shared/schema";
import { InvoiceModal } from "./InvoiceModal";
import { useToast } from "@/hooks/use-toast";

export default function OrderManagement() {
  const {
    orders,
    isLoadingOrders,
    createOrder,
    updateOrder,
    deleteOrder,
    bricks,
    Transport,
    invoices,
    updateInvoice,
    createInvoice,
    settings,
  } = useApp();

  const { toast } = useToast();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  const form = useForm<InsertOrder>({
    resolver: zodResolver(insertOrderSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerAddress: "",
      deliveryAddress: "",
      brickType: "",
      quantity: 1,
      unitPrice: "0",
      totalAmount: "0",
      assignedTransportId: "",
      assignedLaborerIds: [],
      status: "pending",
    },
  });

  const selectedBrick = bricks?.find((b) => b.id === form.watch("brickType"));
  const quantity = form.watch("quantity") || 0;

  // Calculate total when brick type or quantity changes
  const calculateTotal = (brick: Brick, qty: number) => {
    const unitPrice = parseFloat(brick.unitPrice);
    const deliveryCharge = 2500; // Fixed delivery charge
    const laborCharge = 1000; // Fixed labor charge
    const subtotal = unitPrice * qty + deliveryCharge + laborCharge;
    const tax = subtotal * 0.18; // 18% tax
    return (subtotal + tax).toString();
  };

  const onSubmit = async (data: InsertOrder) => {
    try {
      const brick = bricks?.find((b) => b.id === data.brickType);
      if (!brick) {
        throw new Error("Selected brick not found");
      }

      const orderData = {
        ...data,
        unitPrice: brick.unitPrice,
        totalAmount: calculateTotal(brick, data.quantity),
      };

      const rawOrder = await createOrder(orderData);
      const createdOrder: InsertOrder & { id: string; orderNumber?: string; orderDate?: string } = {
        ...rawOrder,
        orderDate: rawOrder.orderDate ? String(rawOrder.orderDate) : undefined,
      };
      form.reset();
      setShowAddDialog(false);

      // Auto-generate invoice for the created order and add to invoices panel
      try {
        const deliveryChargeValue = settings?.find(s => s.key === 'deliveryCharge')?.value || '2500';
        const laborChargeValue = settings?.find(s => s.key === 'laborCharge')?.value || '1000';
        const taxRateValue = settings?.find(s => s.key === 'taxRate')?.value || '0.18';

        const deliveryCharge = parseFloat(deliveryChargeValue) || 2500;
        const laborCharge = parseFloat(laborChargeValue) || 1000;
        const taxRate = parseFloat(taxRateValue) || 0.18;

        const unitPrice = parseFloat(brick.unitPrice) || 0;
        const quantityNum = parseInt(String(data.quantity)) || 0;

        const brickAmount = unitPrice * quantityNum;
        const subtotal = brickAmount + deliveryCharge + laborCharge;
        const taxAmount = subtotal * taxRate;
        const totalAmount = subtotal + taxAmount;

        const items = [
          {
            description: `${brick.type} (Standard Size)`,
            quantity: quantityNum,
            rate: unitPrice,
            amount: brickAmount,
          },
          {
            description: "Delivery Charges",
            quantity: 1,
            rate: deliveryCharge,
            amount: deliveryCharge,
          },
          {
            description: "Labor Charges",
            quantity: 1,
            rate: laborCharge,
            amount: laborCharge,
          },
        ];

        const invoiceNumber = createdOrder?.orderNumber
          ? `INV-${createdOrder.orderNumber}`
          : `INV-${String(createdOrder?.id || '').slice(0, 8).toUpperCase()}`;

        const invoiceData = {
          orderId: createdOrder.id,
          invoiceNumber,
          customerName: createdOrder.customerName.trim(),
          customerAddress: createdOrder.customerAddress.trim(),
          deliveryAddress: createdOrder.deliveryAddress.trim(),
          items: JSON.stringify(items),
          subtotal: subtotal.toFixed(2),
          taxAmount: taxAmount.toFixed(2),
          totalAmount: totalAmount.toFixed(2),
          paymentStatus: 'pending',
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        };

        await createInvoice(invoiceData);
        toast({ title: 'Invoice created', description: 'An invoice was automatically generated for this order.' });
      } catch (err) {
        console.error('Failed to auto-create invoice for order:', err);
      }
    } catch (error) {
      console.error("Failed to create order:", error);
    }
  };

  const filteredOrders =
    orders?.filter(
      (order) =>
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const handleGenerateInvoice = (order: any) => {
    setSelectedOrder(order);
    setShowInvoiceModal(true);
  };

  const handleMarkComplete = async (orderId: string) => {
    try {
      await updateOrder(orderId, { status: 'in_transit' });
    } catch (error) {
      console.error('Failed to mark order as complete:', error);
    }
  };

  const handleMarkDelivered = async (orderId: string) => {
    try {
      await updateOrder(orderId, { status: 'delivered' });
    } catch (error) {
      console.error('Failed to mark order as delivered:', error);
    }
  };

  const handleMarkPaid = async (orderId: string) => {
    try {
      const invoice = invoices?.find((inv) => inv.orderId === orderId);
      if (!invoice) {
        console.error('No invoice found for order', orderId);
        return;
      }
      await updateInvoice(invoice.id, { paymentStatus: 'paid' });
    } catch (error) {
      console.error('Failed to mark invoice as paid:', error);
    }
  };

  const handlePrint = (order: any) => {
    // Create a simple print window with order details
    const printContent = `
      <html>
        <head>
          <title>Order ${order.orderNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; }
            .header { text-align: center; margin-bottom: 30px; }
            .details { margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>BrickFlow</h1>
            <h2>Order Summary</h2>
          </div>
          <div class="details">
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Customer:</strong> ${order.customerName}</p>
            <p><strong>Phone:</strong> ${order.customerPhone || "N/A"}</p>
            <p><strong>Brick Type:</strong> ${order.brickType}</p>
            <p><strong>Quantity:</strong> ${order.quantity.toLocaleString()} units</p>
            <p><strong>Total Amount:</strong> PKR${parseFloat(
              order.totalAmount
            ).toLocaleString()}</p>
            <p><strong>Status:</strong> ${order.status.toUpperCase()}</p>
            <p><strong>Delivery Address:</strong> ${order.deliveryAddress}</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (isLoadingOrders) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Order Management</CardTitle>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <SearchIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="search-orders"
                />
              </div>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-brick-primary hover:bg-brick-secondary"
                    data-testid="button-create-order"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    New Order
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Order</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="customerName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Customer Name *</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  data-testid="input-customer-name"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="customerPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Customer Phone</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  value={field.value || ""}
                                  data-testid="input-customer-phone"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="customerAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Customer Address *</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                data-testid="input-customer-address"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="deliveryAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Delivery Address *</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                data-testid="input-delivery-address"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="brickType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Brick Type *</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger data-testid="select-brick-type">
                                    <SelectValue placeholder="Select brick type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {bricks?.map((brick) => (
                                    <SelectItem key={brick.id} value={brick.id}>
                                      {brick.type} - PKR
                                      {parseFloat(brick.unitPrice).toFixed(2)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="quantity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantity *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  data-testid="input-quantity"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="assignedTransportId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Assigned Transport</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || ""}
                            >
                              <FormControl>
                                <SelectTrigger data-testid="select-Transport">
                                  <SelectValue placeholder="Select Transport (optional)" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Transport?.filter(
                                  (t) => t.status === "available"
                                ).map((Transport) => (
                                  <SelectItem
                                    key={Transport.id}
                                    value={Transport.id}
                                  >
                                    {Transport.registrationNumber} -{" "}
                                    {Transport.model}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {selectedBrick && quantity > 0 && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium mb-2">Order Summary</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>
                                Bricks ({quantity.toLocaleString()} units):
                              </span>
                              <span>
                                PKR
                                {(
                                  parseFloat(selectedBrick.unitPrice) * quantity
                                ).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Delivery Charge:</span>
                              <span>PKR2,500</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Labor Charge:</span>
                              <span>PKR1,000</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Tax (18%):</span>
                              <span>
                                PKR
                                {(
                                  (parseFloat(selectedBrick.unitPrice) *
                                    quantity +
                                    3500) *
                                  0.18
                                ).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between font-bold border-t pt-1">
                              <span>Total:</span>
                              <span>
                                PKR
                                {parseFloat(
                                  calculateTotal(selectedBrick, quantity)
                                ).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowAddDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          className="bg-brick-primary hover:bg-brick-secondary"
                          data-testid="button-save-order"
                        >
                          Create Order
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bricks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => {
                  const orderInvoice = invoices?.find((inv) => inv.orderId === order.id);
                  return (
                    <tr key={order.id} data-testid={`order-row-${order.id}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-brick-primary rounded-lg flex items-center justify-center mr-3">
                            <span className="text-white font-bold text-sm">
                              {order.orderNumber?.slice(-3)}
                            </span>
                          </div>
                          <div>
                            <div
                              className="text-sm font-medium text-gray-900"
                              data-testid={`order-number-${order.id}`}
                            >
                              {order.orderNumber}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(order.orderDate!).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div
                            className="text-sm font-medium text-gray-900"
                            data-testid={`customer-name-${order.id}`}
                          >
                            {order.customerName}
                          </div>
                          {order.customerPhone && (
                            <div className="text-sm text-gray-500">
                              {order.customerPhone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {bricks?.find((b) => b.id === order.brickType)
                              ?.type || "Unknown"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.quantity.toLocaleString()} units
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        PKR{parseFloat(order.totalAmount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={
                            order.status === "delivered"
                              ? "default"
                              : order.status === "in_transit"
                              ? "secondary"
                              : order.status === "cancelled"
                              ? "destructive"
                              : "outline"
                          }
                          data-testid={`order-status-${order.id}`}
                          className={
                            order.status === "delivered" ? "bg-green-600" : ""
                          }
                        >
                          {order.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          data-testid={`button-view-order-${order.id}`}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleGenerateInvoice(order)}
                          data-testid={`button-generate-invoice-${order.id}`}
                        >
                          <FileTextIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePrint(order)}
                          data-testid={`button-print-order-${order.id}`}
                        >
                          <PrinterIcon className="h-4 w-4" />
                        </Button>
                        {/* Mark Complete (sets to in_transit) */}
                        {order.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkComplete(order.id)}
                            data-testid={`button-mark-complete-${order.id}`}
                          >
                            Complete
                          </Button>
                        )}
                        {/* Mark Delivered (available when in_transit or pending) */}
                        {order.status !== 'delivered' && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleMarkDelivered(order.id)}
                            data-testid={`button-mark-delivered-${order.id}`}
                            className="bg-green-600 text-white"
                          >
                            Delivered
                          </Button>
                        )}
                        {/* Paid button: show when there is an invoice and it's not paid */}
                        {orderInvoice && orderInvoice.paymentStatus !== 'paid' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleMarkPaid(order.id)}
                            data-testid={`button-mark-paid-${order.id}`}
                          >
                            Paid
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredOrders.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No orders found matching your search criteria
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Invoice Modal */}
      <InvoiceModal
        order={selectedOrder}
        isOpen={showInvoiceModal}
        onClose={() => {
          setShowInvoiceModal(false);
          setSelectedOrder(null);
        }}
      />
    </div>
  );
}
