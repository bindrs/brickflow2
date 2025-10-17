
import { useState } from "react";
import { X, PrinterIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";

interface InvoiceModalProps {
  order?: any;
  invoice?: any;
  isOpen: boolean;
  onClose: () => void;
}

export function InvoiceModal({ order, invoice, isOpen, onClose }: InvoiceModalProps) {
  const { bricks, createInvoice, settings } = useApp();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateInvoiceData = (orderData: any) => {
    if (!orderData) return null;

    const brick = bricks?.find(b => b.id === orderData.brickType);
    if (!brick) return null;

    const unitPrice = parseFloat(orderData.unitPrice) || 0;
    const quantity = parseInt(orderData.quantity) || 0;
    
    if (unitPrice <= 0 || quantity <= 0) {
      console.error('Invalid unit price or quantity');
      return null;
    }

    const deliveryChargeValue = settings?.find(s => s.key === 'deliveryCharge')?.value || '2500';
    const laborChargeValue = settings?.find(s => s.key === 'laborCharge')?.value || '1000';
    const taxRateValue = settings?.find(s => s.key === 'taxRate')?.value || '0.18';
    
    const deliveryCharge = parseFloat(deliveryChargeValue) || 2500;
    const laborCharge = parseFloat(laborChargeValue) || 1000;
    const taxRate = parseFloat(taxRateValue) || 0.18;

    const brickAmount = unitPrice * quantity;
    const subtotal = brickAmount + deliveryCharge + laborCharge;
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + taxAmount;

    if (!orderData.customerName || !orderData.customerAddress || !orderData.deliveryAddress) {
      console.error('Missing required customer information');
      return null;
    }

    const items = [
      {
        description: `${brick.type} (Standard Size)`,
        quantity: quantity,
        rate: unitPrice,
        amount: brickAmount
      },
      {
        description: "Delivery Charges",
        quantity: 1,
        rate: deliveryCharge,
        amount: deliveryCharge
      },
      {
        description: "Labor Charges",
        quantity: 1,
        rate: laborCharge,
        amount: laborCharge
      }
    ];

    const invoiceNumber = orderData.orderNumber 
      ? `INV-${orderData.orderNumber}` 
      : `INV-${orderData.id.slice(0, 8).toUpperCase()}`;

    return {
      orderId: orderData.id,
      invoiceNumber: invoiceNumber,
      customerName: orderData.customerName.trim(),
      customerAddress: orderData.customerAddress.trim(),
      deliveryAddress: orderData.deliveryAddress.trim(),
      items: JSON.stringify(items),
      subtotal: subtotal.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      paymentStatus: "pending",
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    };
  };

  const handleGenerateInvoice = async () => {
    if (!order) return;

    setIsGenerating(true);
    try {
      const invoiceData = generateInvoiceData(order);
      if (!invoiceData) {
        toast({
          title: "Validation Error",
          description: "Unable to generate invoice. Please check that all order data is valid (customer information, quantities, and pricing).",
          variant: "destructive",
        });
        setIsGenerating(false);
        return;
      }
      await createInvoice(invoiceData);
      toast({
        title: "Success",
        description: "Invoice generated successfully!",
      });
      onClose();
    } catch (error: any) {
      console.error('Failed to generate invoice:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to generate invoice. Please check the order data and try again.',
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    const printContent = document.querySelector('.print-content');
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
              
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              
              body { 
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                margin: 0;
                padding: 40px;
                background: #f8f9fa;
                color: #1a1a1a;
              }
              
              .invoice-wrapper {
                max-width: 900px;
                margin: 0 auto;
                background: white;
                box-shadow: 0 0 40px rgba(0,0,0,0.08);
              }
              
              .invoice-header {
                background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
                color: white;
                padding: 40px 50px;
                position: relative;
                overflow: hidden;
              }
              
              .invoice-header::before {
                content: '';
                position: absolute;
                top: -50%;
                right: -10%;
                width: 300px;
                height: 300px;
                background: rgba(255,255,255,0.1);
                border-radius: 50%;
              }
              
              .company-info h1 {
                font-size: 36px;
                font-weight: 700;
                margin-bottom: 8px;
                letter-spacing: -0.5px;
              }
              
              .company-tagline {
                font-size: 14px;
                opacity: 0.9;
                font-weight: 400;
              }
              
              .invoice-meta {
                position: absolute;
                top: 40px;
                right: 50px;
                text-align: right;
              }
              
              .invoice-title {
                font-size: 28px;
                font-weight: 700;
                margin-bottom: 12px;
                letter-spacing: 2px;
              }
              
              .invoice-number {
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 8px;
              }
              
              .invoice-dates {
                font-size: 13px;
                opacity: 0.95;
              }
              
              .invoice-body {
                padding: 50px;
              }
              
              .parties-section {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 40px;
                margin-bottom: 40px;
                padding-bottom: 30px;
                border-bottom: 2px solid #e5e7eb;
              }
              
              .party-info h3 {
                font-size: 12px;
                text-transform: uppercase;
                color: #6b7280;
                font-weight: 600;
                letter-spacing: 1px;
                margin-bottom: 12px;
              }
              
              .party-details {
                font-size: 15px;
                line-height: 1.8;
                color: #374151;
              }
              
              .party-name {
                font-weight: 600;
                font-size: 16px;
                color: #1a1a1a;
                margin-bottom: 4px;
              }
              
              .items-table {
                width: 100%;
                border-collapse: separate;
                border-spacing: 0;
                margin-bottom: 30px;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                overflow: hidden;
              }
              
              .items-table thead {
                background: #f9fafb;
              }
              
              .items-table th {
                padding: 16px 20px;
                text-align: left;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
                color: #6b7280;
                letter-spacing: 0.5px;
                border-bottom: 2px solid #e5e7eb;
              }
              
              .items-table th:last-child,
              .items-table td:last-child {
                text-align: right;
              }
              
              .items-table td {
                padding: 18px 20px;
                border-bottom: 1px solid #f3f4f6;
                color: #374151;
                font-size: 14px;
              }
              
              .items-table tbody tr:last-child td {
                border-bottom: none;
              }
              
              .items-table tbody tr:hover {
                background: #fafbfc;
              }
              
              .item-description {
                font-weight: 500;
                color: #1a1a1a;
              }
              
              .totals-section {
                display: flex;
                justify-content: flex-end;
                margin-top: 30px;
              }
              
              .totals-box {
                width: 350px;
                background: #f9fafb;
                border-radius: 8px;
                padding: 24px;
              }
              
              .total-row {
                display: flex;
                justify-content: space-between;
                padding: 10px 0;
                font-size: 14px;
                color: #374151;
              }
              
              .total-row.subtotal {
                border-bottom: 1px solid #e5e7eb;
                padding-bottom: 12px;
                margin-bottom: 4px;
              }
              
              .total-row.grand-total {
                border-top: 2px solid #1e3a8a;
                margin-top: 8px;
                padding-top: 16px;
                font-size: 18px;
                font-weight: 700;
                color: #1e3a8a;
              }
              
              .total-label {
                font-weight: 500;
              }
              
              .total-value {
                font-weight: 600;
              }
              
              .payment-status {
                margin-top: 16px;
                padding-top: 16px;
                border-top: 1px solid #e5e7eb;
                text-align: center;
              }
              
              .status-label {
                font-size: 12px;
                text-transform: uppercase;
                color: #6b7280;
                margin-bottom: 6px;
                font-weight: 500;
              }
              
              .status-badge {
                display: inline-block;
                padding: 6px 16px;
                border-radius: 20px;
                font-size: 13px;
                font-weight: 600;
              }
              
              .status-paid {
                background: #d1fae5;
                color: #065f46;
              }
              
              .status-pending {
                background: #fef3c7;
                color: #92400e;
              }
              
              .status-overdue {
                background: #fee2e2;
                color: #991b1b;
              }
              
              .invoice-footer {
                background: #f9fafb;
                padding: 30px 50px;
                text-align: center;
                color: #6b7280;
                font-size: 13px;
                border-top: 1px solid #e5e7eb;
              }
              
              .footer-note {
                margin-bottom: 8px;
              }
              
              @media print {
                body {
                  padding: 0;
                  background: white;
                }
                
                .invoice-wrapper {
                  box-shadow: none;
                }
              }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const displayData = invoice || (order ? generateInvoiceData(order) : null);
  const isExistingInvoice = !!invoice;

  if (!displayData) return null;

  const items = JSON.parse(displayData.items);
  const taxRate = parseFloat(settings?.find(s => s.key === 'taxRate')?.value || '0.18') || 0.18;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>
            {isExistingInvoice ? 'Invoice Details' : 'Generate Invoice'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="print-content bg-white">
          <div className="invoice-wrapper">
            {/* Professional Header */}
            <div className="invoice-header">
              <div className="company-info">
                <h1>{settings?.find(s => s.key === 'companyName')?.value || 'BrickFlow'}</h1>
                <div className="company-tagline">{settings?.find(s => s.key === 'companyTagline')?.value || 'Professional Brick Supply & Construction Services'}</div>
              </div>
              <div className="invoice-meta">
                <div className="invoice-title">INVOICE</div>
                <div className="invoice-number">{isExistingInvoice ? invoice.invoiceNumber : 'INV-PREVIEW'}</div>
                <div className="invoice-dates">
                  <div>Date: {new Date(displayData.invoiceDate || new Date()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  {displayData.dueDate && (
                    <div>Due: {new Date(displayData.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Invoice Body */}
            <div className="invoice-body">
              {/* Bill To / Ship To Section */}
              <div className="parties-section">
                <div className="party-info">
                  <h3>Bill To</h3>
                  <div className="party-details">
                    <div className="party-name">{displayData.customerName}</div>
                    <div>{displayData.customerAddress}</div>
                  </div>
                </div>
                <div className="party-info">
                  <h3>Ship To</h3>
                  <div className="party-details">
                    <div>{displayData.deliveryAddress}</div>
                  </div>
                </div>
              </div>
              
              {/* Items Table */}
              <table className="items-table">
                <thead>
                  <tr>
                    <th style={{ width: '50%' }}>Description</th>
                    <th style={{ width: '15%' }}>Quantity</th>
                    <th style={{ width: '17.5%' }}>Rate</th>
                    <th style={{ width: '17.5%' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: any, index: number) => (
                    <tr key={index}>
                      <td><span className="item-description">{item.description}</span></td>
                      <td>{item.quantity.toLocaleString()}</td>
                      <td>PKR {item.rate.toLocaleString()}</td>
                      <td>PKR {item.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Totals Section */}
              <div className="totals-section">
                <div className="totals-box">
                  <div className="total-row subtotal">
                    <span className="total-label">Subtotal</span>
                    <span className="total-value">PKR {parseFloat(displayData.subtotal).toLocaleString()}</span>
                  </div>
                  <div className="total-row">
                    <span className="total-label">Tax ({(taxRate * 100).toFixed(0)}%)</span>
                    <span className="total-value">PKR {parseFloat(displayData.taxAmount).toLocaleString()}</span>
                  </div>
                  <div className="total-row grand-total">
                    <span className="total-label">Total Amount</span>
                    <span className="total-value">PKR {parseFloat(displayData.totalAmount).toLocaleString()}</span>
                  </div>
                  
                  {isExistingInvoice && (
                    <div className="payment-status">
                      <div className="status-label">Payment Status</div>
                      <span className={`status-badge status-${displayData.paymentStatus}`}>
                        {displayData.paymentStatus.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="invoice-footer">
              <div className="footer-note">Thank you for your business!</div>
              <div>For any queries, please contact us at {settings?.find(s => s.key === 'contacts')?.value || 'support@brickflow.com'}</div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handlePrint} 
            className="bg-blue-600 hover:bg-blue-700"
            data-testid="button-print-invoice"
          >
            <PrinterIcon className="h-4 w-4 mr-2" />
            Print Invoice
          </Button>
          {!isExistingInvoice && (
            <Button 
              onClick={handleGenerateInvoice} 
              disabled={isGenerating}
              className="bg-brick-primary hover:bg-brick-secondary"
              data-testid="button-save-invoice"
            >
              {isGenerating ? 'Generating...' : 'Save Invoice'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
