import React, { useState, useEffect } from "react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Download, Eye, Package, Truck, MapPin, User, Phone, 
  Calendar, Clock, QrCode, FileText, Printer
} from "lucide-react";
import api from "../../api";

// Add print styles
const printStyles = `
  @media print {
    body * {
      visibility: hidden;
    }
    .print-content, .print-content * {
      visibility: visible;
    }
    .print-content {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
    }
    .no-print {
      display: none !important;
    }
  }
`;

const EReceiptWaybill = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/seller');
      console.log('E-Receipt Orders response:', response.data);
      
      // Filter orders that have been shipped or delivered (should have tracking numbers)
      const filteredOrders = response.data.filter(order => 
        order.status === 'shipped' || 
        order.status === 'delivered' ||
        (order.status === 'packing' && order.trackingNumber)
      );
      
      console.log('Filtered orders for receipts:', filteredOrders);
      console.log('Sample order with seller info:', filteredOrders[0]);
      if (filteredOrders[0]) {
        console.log('=== ORDER INFORMATION ===');
        console.log('Order ID:', filteredOrders[0].orderID);
        console.log('Customer:', filteredOrders[0].customer);
        console.log('Delivery Location (formatted):', filteredOrders[0].location);
        console.log('');
        console.log('=== SELLER INFORMATION ===');
        console.log('Seller name:', filteredOrders[0].seller_name);
        console.log('Seller contact:', filteredOrders[0].seller_contact);
        console.log('Seller email:', filteredOrders[0].seller_email);
        console.log('Seller address (formatted):', filteredOrders[0].seller_address);
        console.log('Seller city:', filteredOrders[0].seller_city);
        console.log('Seller province:', filteredOrders[0].seller_province);
        console.log('========================');
      }
      setOrders(filteredOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSellerInfo = async () => {
    try {
      const response = await api.get('/sellers/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching seller info:', error);
      return null;
    }
  };

  const generateQRCode = (trackingNumber) => {
    // Simple QR code generation (in real app, use a QR library)
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${trackingNumber}`;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async (order) => {
    try {
      // In a real app, this would generate and download a PDF
      const element = document.createElement('a');
      const file = new Blob([generateReceiptHTML(order)], { type: 'text/html' });
      element.href = URL.createObjectURL(file);
      element.download = `receipt-${order.orderID}.html`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  const generateReceiptHTML = (order) => {
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>E-Receipt & Waybill - Order #${order.orderID}</title>
        <style>
          @media print {
            body { margin: 0; padding: 20px; }
            .no-print { display: none; }
          }
          
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #faf9f8 0%, #ffffff 100%);
            padding: 40px 20px;
          }
          
          .receipt-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border: 3px solid #a4785a;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          }
          
          .header {
            background: linear-gradient(135deg, #a4785a 0%, #7b5a3b 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            position: relative;
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 100%;
            background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><pattern id="pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill="white" opacity="0.1"/></pattern><rect width="100" height="100" fill="url(%23pattern)"/></svg>');
            opacity: 0.3;
          }
          
          .header h1 {
            font-size: 42px;
            font-weight: 800;
            margin-bottom: 10px;
            letter-spacing: 2px;
            position: relative;
            z-index: 1;
          }
          
          .header .subtitle {
            font-size: 18px;
            opacity: 0.9;
            position: relative;
            z-index: 1;
          }
          
          .tracking-banner {
            background: linear-gradient(90deg, #e5ded7 0%, #faf9f8 50%, #e5ded7 100%);
            padding: 20px;
            text-align: center;
            border-bottom: 2px dashed #a4785a;
          }
          
          .tracking-number {
            font-size: 28px;
            font-weight: 800;
            color: #5c3d28;
            letter-spacing: 3px;
            font-family: 'Courier New', monospace;
          }
          
          .content {
            padding: 40px 30px;
          }
          
          .section {
            margin-bottom: 30px;
            padding-bottom: 25px;
            border-bottom: 1px solid #e5ded7;
          }
          
          .section:last-child {
            border-bottom: none;
          }
          
          .section-title {
            font-size: 16px;
            font-weight: 700;
            color: #a4785a;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
          
          .info-item {
            background: #faf9f8;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #a4785a;
          }
          
          .label {
            font-size: 12px;
            font-weight: 600;
            color: #7b5a3b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
          }
          
          .value {
            font-size: 16px;
            font-weight: 600;
            color: #5c3d28;
          }
          
          .status-badge {
            display: inline-block;
            padding: 8px 16px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            border-radius: 20px;
            font-weight: 700;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .qr-section {
            text-align: center;
            padding: 30px;
            background: linear-gradient(135deg, #faf9f8 0%, #ffffff 100%);
            border-radius: 12px;
            margin: 20px 0;
          }
          
          .qr-code {
            border: 3px solid #a4785a;
            padding: 10px;
            background: white;
            border-radius: 8px;
            display: inline-block;
          }
          
          .footer {
            background: #5c3d28;
            color: white;
            padding: 30px;
            text-align: center;
          }
          
          .footer-logo {
            font-size: 24px;
            font-weight: 800;
            margin-bottom: 10px;
          }
          
          .footer-text {
            font-size: 12px;
            opacity: 0.8;
          }
          
          .divider {
            height: 2px;
            background: linear-gradient(90deg, transparent 0%, #a4785a 50%, transparent 100%);
            margin: 20px 0;
          }
          
          .total-amount {
            background: linear-gradient(135deg, #a4785a 0%, #7b5a3b 100%);
            color: white;
            padding: 20px;
            border-radius: 12px;
            text-align: center;
            margin: 20px 0;
          }
          
          .total-label {
            font-size: 14px;
            opacity: 0.9;
            margin-bottom: 5px;
          }
          
          .total-value {
            font-size: 36px;
            font-weight: 800;
            letter-spacing: 1px;
          }
          
          .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 120px;
            font-weight: 900;
            color: rgba(164, 120, 90, 0.03);
            z-index: 0;
            pointer-events: none;
          }
        </style>
      </head>
      <body>
        <div class="watermark">CRAFTCONNECT</div>
        
        <div class="receipt-container">
          <!-- Header -->
          <div class="header">
            <h1>🎨 CRAFTCONNECT</h1>
            <div class="subtitle">E-Receipt & Waybill</div>
          </div>
          
          <!-- Tracking Banner -->
          <div class="tracking-banner">
            <div style="font-size: 14px; color: #7b5a3b; margin-bottom: 8px; font-weight: 600;">TRACKING NUMBER</div>
            <div class="tracking-number">${order.trackingNumber || 'N/A'}</div>
          </div>
          
          <!-- Content -->
          <div class="content">
            <!-- Order Information -->
            <div class="section">
              <div class="section-title">📦 Order Information</div>
              <div class="info-grid">
                <div class="info-item">
                  <div class="label">Order Number</div>
                  <div class="value" style="font-family: 'Courier New', monospace;">${order.order_number || '#' + order.orderID}</div>
                </div>
                <div class="info-item">
                  <div class="label">Customer Name</div>
                  <div class="value">${order.customer || 'N/A'}</div>
                </div>
                <div class="info-item" style="grid-column: 1 / -1;">
                  <div class="label">📍 Delivery Location</div>
                  <div class="value" style="font-size: 14px;">${order.location || 'N/A'}</div>
                </div>
              </div>
            </div>
            
            <!-- Seller Information -->
            <div class="section">
              <div class="section-title">👤 Seller Information</div>
              <div class="info-item" style="grid-column: 1 / -1; background: linear-gradient(135deg, #faf9f8 0%, #ffffff 100%); border: 3px solid #a4785a; border-radius: 12px; padding: 25px; box-shadow: 0 4px 6px rgba(164, 120, 90, 0.1);">
                <div class="label" style="font-size: 14px; margin-bottom: 10px;">🏪 Seller Name</div>
                <div class="value" style="font-size: 22px; margin-bottom: 20px; color: #a4785a;">${order.seller_name || 'CraftConnect Seller'}</div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                  <div>
                    <div class="label" style="font-size: 12px; margin-bottom: 5px;">📞 Contact Number</div>
                    <div class="value" style="font-size: 16px;">${order.seller_contact || 'N/A'}</div>
                  </div>
                  <div>
                    <div class="label" style="font-size: 12px; margin-bottom: 5px;">📧 Email</div>
                    <div class="value" style="font-size: 14px;">${order.seller_email || 'N/A'}</div>
                  </div>
                </div>
                
                <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #7b5a3b;">
                  <div class="label" style="font-size: 14px; margin-bottom: 10px; display: flex; align-items: center; gap: 5px;">
                    📍 Complete Seller Address
                  </div>
                  <div class="value" style="font-size: 16px; line-height: 1.6; color: #5c3d28; font-weight: 700;">
                    ${order.seller_address || 'Address not available'}
                  </div>
                  ${order.seller_city || order.seller_province ? `
                  <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e5ded7; font-size: 14px; color: #7b5a3b;">
                    <div style="margin-bottom: 5px;">City: <strong>${order.seller_city || 'N/A'}</strong></div>
                    <div>Province: <strong>${order.seller_province || 'N/A'}</strong></div>
                  </div>
                  ` : ''}
                </div>
              </div>
            </div>
            
            <!-- Total Amount -->
            <div class="total-amount">
              <div class="total-label">Total Amount</div>
              <div class="total-value">₱${order.totalAmount?.toFixed(2) || order.total || '0.00'}</div>
            </div>
            
            <!-- QR Code -->
            <div class="qr-section">
              <div style="font-size: 14px; color: #7b5a3b; margin-bottom: 15px; font-weight: 600;">SCAN TO TRACK</div>
              <div class="qr-code">
                <img src="${generateQRCode(order.trackingNumber)}" alt="QR Code" style="width: 150px; height: 150px;" />
              </div>
              <div style="font-size: 12px; color: #7b5a3b; margin-top: 10px;">Scan this QR code to track your delivery in real-time</div>
            </div>
            
            <div class="divider"></div>
            
            <!-- Print Info -->
            <div style="text-align: center; color: #7b5a3b; font-size: 12px;">
              <div style="margin-bottom: 5px;">Printed on: ${currentDate}</div>
              <div>This is a computer-generated document. No signature is required.</div>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <div class="footer-logo">CRAFTCONNECT</div>
            <div class="footer-text">Connecting Artisans with the World</div>
            <div class="footer-text" style="margin-top: 10px;">
              📧 support@craftconnect.com | 📞 +63 123 456 7890 | 🌐 www.craftconnect.com
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'packing': return 'bg-orange-100 text-orange-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#a4785a] mx-auto mb-4"></div>
          <p className="text-[#5c3d28]">Loading receipts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-2xl shadow-xl p-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">E-Receipt & Waybill</h1>
            <p className="text-white/90 mt-1">Generate and manage delivery receipts</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders List */}
        <Card className="border-2 border-[#e5ded7] shadow-xl">
          <CardHeader className="border-b border-[#e5ded7] bg-gradient-to-r from-[#faf9f8] to-white">
            <CardTitle className="text-[#5c3d28] flex items-center text-xl">
              <div className="p-2 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-lg mr-3">
                <Package className="h-5 w-5 text-white" />
              </div>
              Orders with Receipts
            </CardTitle>
            <CardDescription className="text-[#7b5a3b] ml-11">
              Select an order to view or generate receipt
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-[#7b5a3b]">No orders available for receipts</p>
                </div>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.orderID}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                      selectedOrder?.orderID === order.orderID
                        ? 'border-[#a4785a] bg-gradient-to-r from-[#a4785a]/10 to-[#7b5a3b]/10'
                        : 'border-[#e5ded7] hover:border-[#a4785a]/50 hover:shadow-md'
                    }`}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-[#5c3d28]">Order #{order.orderID}</h3>
                        </div>
                        <p className="text-[#7b5a3b] text-sm">
                          <User className="h-3 w-3 inline mr-1" />
                          Customer: {order.customer || 'Unknown'}
                        </p>
                        <p className="text-[#7b5a3b] text-sm">
                          💰 Total: ₱{order.totalAmount?.toFixed(2) || order.total || '0.00'}
                        </p>
                        {order.trackingNumber && (
                          <p className="text-[#a4785a] text-sm font-medium">
                            📦 Tracking: {order.trackingNumber}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                          }}
                          className="border-[#e5ded7] text-[#5c3d28] hover:bg-[#faf9f8] hover:border-[#a4785a]"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Receipt Preview */}
        <Card className="border-2 border-[#e5ded7] shadow-xl">
          <CardHeader className="border-b border-[#e5ded7] bg-gradient-to-r from-[#faf9f8] to-white">
            <CardTitle className="text-[#5c3d28] flex items-center text-xl">
              <div className="p-2 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded-lg mr-3">
                <FileText className="h-5 w-5 text-white" />
              </div>
              E-Receipt Preview
            </CardTitle>
            <CardDescription className="text-[#7b5a3b] ml-11">
              {selectedOrder ? `Receipt for Order #${selectedOrder.orderID}` : 'Select an order to preview receipt'}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {selectedOrder ? (
              <div className="space-y-6">
                {/* Add print styles */}
                <style>{printStyles}</style>
                
                {/* Receipt Content - Print Ready */}
                <div className="print-content bg-white border-2 border-[#e5ded7] rounded-xl overflow-hidden shadow-lg">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white p-6 text-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10" style={{
                      backgroundImage: 'radial-gradient(circle at 20px 20px, white 1px, transparent 1px)',
                      backgroundSize: '40px 40px'
                    }}></div>
                    <div className="relative z-10">
                      <h2 className="text-3xl font-bold mb-2 tracking-wide">🎨 CRAFTCONNECT</h2>
                      <h3 className="text-lg font-semibold opacity-90">E-Receipt & Waybill</h3>
                      <div className="mt-3 inline-block bg-white/20 px-4 py-2 rounded-full">
                        <p className="text-sm font-bold">Order #{selectedOrder.orderID}</p>
                      </div>
                    </div>
                  </div>

                  {/* Tracking Banner */}
                  <div className="bg-gradient-to-r from-[#e5ded7] via-[#faf9f8] to-[#e5ded7] p-4 text-center border-b-2 border-dashed border-[#a4785a]">
                    <p className="text-xs font-semibold text-[#7b5a3b] mb-1 tracking-wider">TRACKING NUMBER</p>
                    <p className="text-2xl font-bold text-[#5c3d28] font-mono tracking-widest">
                      {selectedOrder.trackingNumber || 'N/A'}
                    </p>
                  </div>

                  {/* Order Details */}
                  <div className="p-6 space-y-6 relative">
                    {/* CraftConnect Watermark */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
                      <p className="text-[140px] font-black text-[#a4785a] opacity-[0.03] transform rotate-[-45deg] select-none whitespace-nowrap">
                        CRAFTCONNECT
                      </p>
                    </div>

                    {/* Order Information Section */}
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#e5ded7]">
                        <div className="p-1 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded">
                          <Package className="h-4 w-4 text-white" />
                        </div>
                        <h4 className="text-sm font-bold text-[#a4785a] uppercase tracking-wide">Order Information</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#faf9f8] p-3 rounded-lg border-l-4 border-[#a4785a]">
                          <p className="text-xs font-semibold text-[#7b5a3b] uppercase tracking-wide mb-1">Order Number</p>
                          <p className="text-sm font-bold text-[#5c3d28] font-mono">{selectedOrder.order_number || `#${selectedOrder.orderID}`}</p>
                        </div>
                        <div className="bg-[#faf9f8] p-3 rounded-lg border-l-4 border-[#a4785a]">
                          <p className="text-xs font-semibold text-[#7b5a3b] uppercase tracking-wide mb-1">Customer Name</p>
                          <p className="text-base font-bold text-[#5c3d28]">{selectedOrder.customer || 'N/A'}</p>
                        </div>
                        <div className="bg-[#faf9f8] p-3 rounded-lg border-l-4 border-[#a4785a] col-span-2">
                          <p className="text-xs font-semibold text-[#7b5a3b] uppercase tracking-wide mb-1">Delivery Location</p>
                          <p className="text-base font-bold text-[#5c3d28]">{selectedOrder.location || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Seller Information Section */}
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#e5ded7]">
                        <div className="p-1 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] rounded">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <h4 className="text-sm font-bold text-[#a4785a] uppercase tracking-wide">Seller Information</h4>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-[#faf9f8] p-4 rounded-lg border-l-4 border-[#a4785a]">
                          <p className="text-xs font-semibold text-[#7b5a3b] uppercase tracking-wide mb-2">
                            <User className="h-3 w-3 inline mr-1" />
                            Seller Name
                          </p>
                          <p className="text-lg font-bold text-[#5c3d28]">{selectedOrder.seller_name || 'CraftConnect Seller'}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-[#faf9f8] p-3 rounded-lg border-l-4 border-[#a4785a]">
                            <p className="text-xs font-semibold text-[#7b5a3b] uppercase tracking-wide mb-2">
                              <Phone className="h-3 w-3 inline mr-1" />
                              Contact
                            </p>
                            <p className="text-sm font-bold text-[#5c3d28]">{selectedOrder.seller_contact || 'N/A'}</p>
                          </div>
                          <div className="bg-[#faf9f8] p-3 rounded-lg border-l-4 border-[#a4785a]">
                            <p className="text-xs font-semibold text-[#7b5a3b] uppercase tracking-wide mb-2">
                              📧 Email
                            </p>
                            <p className="text-xs font-bold text-[#5c3d28] truncate">{selectedOrder.seller_email || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-[#faf9f8] to-white p-4 rounded-lg border-2 border-[#a4785a] shadow-md">
                          <p className="text-xs font-semibold text-[#7b5a3b] uppercase tracking-wide mb-2 flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-[#a4785a]" />
                            Seller Address (Complete)
                          </p>
                          <p className="text-base font-bold text-[#5c3d28] leading-relaxed">
                            {selectedOrder.seller_address || 'Address not available'}
                          </p>
                          <div className="mt-2 text-sm text-[#7b5a3b]">
                            <p>City: {selectedOrder.seller_city || 'N/A'}</p>
                            <p>Province: {selectedOrder.seller_province || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Total Amount - Highlighted */}
                    <div className="bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] p-5 rounded-xl text-center shadow-md">
                      <p className="text-sm font-semibold text-white/90 mb-1">TOTAL AMOUNT</p>
                      <p className="text-4xl font-bold text-white tracking-wide">
                        ₱{selectedOrder.totalAmount?.toFixed(2) || selectedOrder.total || '0.00'}
                      </p>
                    </div>

                    {/* QR Code Section */}
                    {selectedOrder.trackingNumber && (
                      <div className="bg-gradient-to-br from-[#faf9f8] to-white p-6 rounded-xl border-2 border-[#e5ded7] text-center">
                        <p className="text-sm font-semibold text-[#7b5a3b] mb-3 uppercase tracking-wide">Scan to Track</p>
                        <div className="inline-block p-3 bg-white border-3 border-[#a4785a] rounded-lg shadow-lg">
                          <img 
                            src={generateQRCode(selectedOrder.trackingNumber)} 
                            alt="QR Code" 
                            className="w-32 h-32"
                          />
                        </div>
                        <p className="text-xs text-[#7b5a3b] mt-3 font-medium">
                          Scan this QR code to track your delivery in real-time
                        </p>
                      </div>
                    )}

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-[#a4785a] to-transparent"></div>

                    {/* Footer Info */}
                    <div className="text-center space-y-2">
                      <p className="text-xs text-[#7b5a3b]">
                        Printed on: {new Date().toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-xs text-[#7b5a3b] italic">
                        This is a computer-generated document. No signature is required.
                      </p>
                    </div>
                  </div>

                  {/* Footer Banner */}
                  <div className="bg-[#5c3d28] text-white p-6 text-center">
                    <p className="text-xl font-bold mb-2">CRAFTCONNECT</p>
                    <p className="text-sm opacity-80 mb-2">Connecting Artisans with the World</p>
                    <p className="text-xs opacity-70">
                      📧 support@craftconnect.com | 📞 +63 123 456 7890 | 🌐 www.craftconnect.com
                    </p>
                  </div>
                </div>

                {/* Action Buttons - No Print */}
                <div className="flex gap-3 no-print">
                  <Button
                    onClick={() => handleDownloadPDF(selectedOrder)}
                    className="flex-1 bg-gradient-to-r from-[#a4785a] to-[#7b5a3b] text-white hover:from-[#8a6b4a] hover:to-[#6b4a2f] shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  <Button
                    onClick={handlePrint}
                    variant="outline"
                    className="flex-1 border-2 border-[#a4785a] text-[#5c3d28] hover:bg-gradient-to-r hover:from-[#a4785a] hover:to-[#7b5a3b] hover:text-white hover:border-[#a4785a] transition-all duration-200"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print Receipt
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-[#7b5a3b] text-lg">Select an order to preview receipt</p>
                <p className="text-[#7b5a3b] text-sm mt-2">Choose from the orders list to generate receipt</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EReceiptWaybill;
