import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Printer,
  Download,
  User,
  Calendar,
  Clock,
  IndianRupee,
  CreditCard,
  Banknote,
  Smartphone,
  Landmark,
  Hash,
  FileText,
  Package,
  Phone,
  Mail,
  AlertCircle,
  Receipt,
  Menu
} from "lucide-react";
import {
  fetchPayment,
} from "../../../features/payment/paymentSlice";
import { fetchOrderById } from "../../../features/order/orderSlice";
import { fetchCustomerById } from "../../../features/customer/customerSlice";
import showToast from "../../../utils/toast";
import * as XLSX from 'xlsx';

export default function PaymentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Get states from Redux with proper fallbacks
  const { currentPayment, loading } = useSelector((state) => {
    // Try both singular and plural
    const paymentState = state.payment || state.payments || {};
    return {
      currentPayment: paymentState.currentPayment || null,
      loading: paymentState.loading || false
    };
  });
  
  const { currentOrder } = useSelector((state) => {
    const orderState = state.order || state.orders || {};
    return {
      currentOrder: orderState.currentOrder || null
    };
  });
  
  const { currentCustomer } = useSelector((state) => {
    const customerState = state.customer || state.customers || {};
    return {
      currentCustomer: customerState.currentCustomer || null
    };
  });
  
  const { user } = useSelector((state) => state.auth || {});

  const basePath = user?.role === "ADMIN" ? "/admin" : 
                   user?.role === "STORE_KEEPER" ? "/storekeeper" : 
                   "/cuttingmaster";

  // Fetch payment details
  useEffect(() => {
    if (id) {
      console.log("🔍 Fetching payment details for ID:", id);
      dispatch(fetchPayment(id));
    }
  }, [id, dispatch]);

  // Fetch related order and customer when payment loads
  useEffect(() => {
    if (currentPayment) {
      console.log("✅ Payment loaded:", currentPayment);
      
      // Fetch order if exists and is a string ID (not already populated)
      if (currentPayment.order && typeof currentPayment.order === 'string') {
        console.log("🔍 Fetching order:", currentPayment.order);
        dispatch(fetchOrderById(currentPayment.order));
      }
      
      // Fetch customer if exists and is a string ID
      if (currentPayment.customer && typeof currentPayment.customer === 'string') {
        console.log("🔍 Fetching customer:", currentPayment.customer);
        dispatch(fetchCustomerById(currentPayment.customer));
      }
    }
  }, [currentPayment, dispatch]);

  const handleBack = () => {
    // Navigate back to customer if we have customer ID
    if (currentPayment?.customer) {
      const customerId = typeof currentPayment.customer === 'object' 
        ? currentPayment.customer._id 
        : currentPayment.customer;
      navigate(`${basePath}/customers/${customerId}`);
    } else {
      navigate(`${basePath}/customers`);
    }
  };

  // Get order ID safely
  const getOrderId = () => {
    if (currentOrder?.orderId) {
      return currentOrder.orderId;
    }
    if (currentPayment?.order) {
      if (typeof currentPayment.order === 'object') {
        return currentPayment.order.orderId || currentPayment.order._id;
      }
      return currentPayment.order;
    }
    return 'N/A';
  };

  // Get customer name safely
  const getCustomerName = () => {
    if (currentCustomer) {
      return `${currentCustomer.salutation || ''} ${currentCustomer.firstName || ''} ${currentCustomer.lastName || ''}`.trim() || 'Customer';
    }
    if (currentPayment?.customer && typeof currentPayment.customer === 'object') {
      const cust = currentPayment.customer;
      return `${cust.salutation || ''} ${cust.firstName || ''} ${cust.lastName || ''}`.trim() || 'Customer';
    }
    return 'Customer';
  };

  // Get customer phone safely
  const getCustomerPhone = () => {
    if (currentCustomer?.phone) {
      return currentCustomer.phone;
    }
    if (currentPayment?.customer && typeof currentPayment.customer === 'object') {
      return currentPayment.customer.phone;
    }
    return 'N/A';
  };

  // Get customer ID safely
  const getCustomerId = () => {
    if (currentCustomer?.customerId) {
      return currentCustomer.customerId;
    }
    if (currentPayment?.customer && typeof currentPayment.customer === 'object') {
      return currentPayment.customer.customerId;
    }
    return 'N/A';
  };

  // Get received by name safely
  const getReceivedBy = () => {
    if (!currentPayment?.receivedBy) return 'N/A';
    if (typeof currentPayment.receivedBy === 'object') {
      return currentPayment.receivedBy.name || 'N/A';
    }
    return currentPayment.receivedBy;
  };

  // Export to Excel
  const exportToExcel = () => {
    try {
      if (!currentPayment) {
        showToast.error("No payment data to export");
        return;
      }

      const exportData = [{
        'Payment ID': currentPayment._id || 'N/A',
        'Order ID': getOrderId(),
        'Customer ID': getCustomerId(),
        'Customer Name': getCustomerName(),
        'Customer Phone': getCustomerPhone(),
        'Amount (₹)': currentPayment.amount || 0,
        'Payment Type': currentPayment.type || 'N/A',
        'Payment Method': currentPayment.method || 'N/A',
        'Reference Number': currentPayment.referenceNumber || 'N/A',
        'Payment Date': currentPayment.paymentDate ? 
          new Date(currentPayment.paymentDate).toLocaleDateString('en-IN') : 'N/A',
        'Payment Time': currentPayment.paymentTime || 'N/A',
        'Received By': getReceivedBy(),
        'Notes': currentPayment.notes || 'N/A',
        'Created At': currentPayment.createdAt ? 
          new Date(currentPayment.createdAt).toLocaleString('en-IN') : 'N/A',
        'Updated At': currentPayment.updatedAt ? 
          new Date(currentPayment.updatedAt).toLocaleString('en-IN') : 'N/A'
      }];

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Payment Details");
      
      const fileName = `payment_${currentPayment._id}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      showToast.success("Payment details exported successfully! 📊");
    } catch (error) {
      console.error("Export error:", error);
      showToast.error("Failed to export payment details");
    }
  };

  // Print function
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Payment Receipt - ${currentPayment?._id || 'N/A'}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #2563eb; padding-bottom: 20px; }
            .header h1 { color: #2563eb; margin: 0; font-size: 28px; }
            .header p { color: #64748b; margin: 5px 0; }
            .shop-details { text-align: center; margin-bottom: 20px; color: #475569; }
            .details { margin-bottom: 20px; }
            .row { display: flex; margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding: 10px 0; }
            .label { width: 150px; font-weight: bold; color: #475569; }
            .value { flex: 1; color: #0f172a; }
            .amount { font-size: 24px; color: #059669; font-weight: bold; }
            .footer { margin-top: 50px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>DREAM FIT TAILORS</h1>
            <p>Payment Receipt</p>
          </div>
          <div class="shop-details">
            <p>123, Fashion Street, Chennai - 600001</p>
            <p>Phone: +91 98765 43210 | Email: dreamfit@gmail.com</p>
          </div>
          <div class="details">
            <div class="row">
              <div class="label">Payment ID:</div>
              <div class="value">${currentPayment?._id || 'N/A'}</div>
            </div>
            <div class="row">
              <div class="label">Order ID:</div>
              <div class="value">${getOrderId()}</div>
            </div>
            <div class="row">
              <div class="label">Customer:</div>
              <div class="value">${getCustomerName()}</div>
            </div>
            <div class="row">
              <div class="label">Customer Phone:</div>
              <div class="value">${getCustomerPhone()}</div>
            </div>
            <div class="row">
              <div class="label">Amount:</div>
              <div class="value amount">₹${currentPayment?.amount?.toLocaleString('en-IN') || 0}</div>
            </div>
            <div class="row">
              <div class="label">Payment Type:</div>
              <div class="value">${currentPayment?.type?.toUpperCase() || 'N/A'}</div>
            </div>
            <div class="row">
              <div class="label">Payment Method:</div>
              <div class="value">${currentPayment?.method?.toUpperCase() || 'N/A'}</div>
            </div>
            ${currentPayment?.referenceNumber ? `
            <div class="row">
              <div class="label">Reference Number:</div>
              <div class="value">${currentPayment.referenceNumber}</div>
            </div>
            ` : ''}
            <div class="row">
              <div class="label">Date & Time:</div>
              <div class="value">
                ${currentPayment?.paymentDate ? new Date(currentPayment.paymentDate).toLocaleDateString('en-IN') : 'N/A'} 
                at ${currentPayment?.paymentTime || '00:00'}
              </div>
            </div>
            ${currentPayment?.receivedBy ? `
            <div class="row">
              <div class="label">Received By:</div>
              <div class="value">${getReceivedBy()}</div>
            </div>
            ` : ''}
            ${currentPayment?.notes ? `
            <div class="row">
              <div class="label">Notes:</div>
              <div class="value">${currentPayment.notes}</div>
            </div>
            ` : ''}
          </div>
          <div class="footer">
            <p>Generated on ${new Date().toLocaleString()}</p>
            <p>Thank you for your business!</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const formatDateTime = (dateString, timeString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric'
    }) + (timeString ? ` at ${timeString}` : '');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm sm:text-base text-slate-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!currentPayment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-md w-full text-center">
          <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Payment Not Found</h2>
          <p className="text-sm sm:text-base text-slate-500 mb-4">Payment ID: {id}</p>
          <button
            onClick={handleBack}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base"
          >
            Back to Customers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-slate-600"
          >
            <ArrowLeft size={18} />
            <span className="font-bold text-sm">Back</span>
          </button>
          <h1 className="text-base font-black text-slate-800 truncate max-w-[150px]">
            Payment Details
          </h1>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-slate-100 rounded-xl transition-all flex items-center justify-center"
            style={{ minWidth: '36px', minHeight: '36px' }}
          >
            <Menu size={18} />
          </button>
        </div>
        
        {/* Mobile Action Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg p-4 z-40">
            <div className="space-y-2">
              <button
                onClick={() => {
                  exportToExcel();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 text-green-600 rounded-lg font-bold"
              >
                <Download size={18} />
                Export Excel
              </button>
              <button
                onClick={() => {
                  handlePrint();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-purple-50 text-purple-600 rounded-lg font-bold"
              >
                <Printer size={18} />
                Print Receipt
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
        {/* Desktop Header - Hidden on Mobile */}
        <div className="hidden lg:flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold">Back to Customer</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={exportToExcel}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm"
            >
              <Download size={16} />
              Export Excel
            </button>

            <button
              onClick={handlePrint}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm"
            >
              <Printer size={16} />
              Print Receipt
            </button>
          </div>
        </div>

        {/* Main Content - View Only */}
        <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Payment Header - Mobile Responsive */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-lg flex-shrink-0">
                  <Receipt size={20} className="sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Payment ID</p>
                  <p className="font-mono font-bold text-slate-800 text-xs sm:text-sm lg:text-base break-all">{currentPayment._id}</p>
                </div>
              </div>
              <span className={`text-xs sm:text-sm lg:text-base px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-bold self-start sm:self-center whitespace-nowrap ${
                ['full', 'final-settlement'].includes(currentPayment.type)
                  ? 'bg-green-100 text-green-700'
                  : ['advance', 'partial'].includes(currentPayment.type)
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-slate-100 text-slate-700'
              }`}>
                {['full', 'final-settlement'].includes(currentPayment.type) ? 'FULL' : ['advance', 'partial'].includes(currentPayment.type) ? 'ADVANCE' : currentPayment.type.toUpperCase()}
              </span>
            </div>

            {/* Amount Display - Mobile Responsive */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6 text-white mb-6 sm:mb-8">
              <p className="text-blue-100 text-[10px] sm:text-xs font-bold uppercase mb-1">Payment Amount</p>
              <p className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black break-words">{formatCurrency(currentPayment.amount)}</p>
            </div>

            {/* Details Grid - Mobile Responsive */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
              {/* Order Details */}
              <div className="bg-slate-50 p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl hover:shadow-md transition-all">
                <h3 className="text-[10px] sm:text-xs font-black text-slate-500 uppercase mb-2 sm:mb-3 lg:mb-4 flex items-center gap-1.5 sm:gap-2">
                  <Package size={14} className="text-blue-600 sm:w-4 sm:h-4" />
                  Order Details
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  <div>
                    <p className="text-[8px] sm:text-xs text-slate-400">Order ID</p>
                    <p className="font-mono font-bold text-blue-600 text-xs sm:text-sm lg:text-base break-words">
                      {getOrderId()}
                    </p>
                  </div>
                  {currentOrder && (
                    <>
                      <div>
                        <p className="text-[8px] sm:text-xs text-slate-400">Order Date</p>
                        <p className="font-medium text-xs sm:text-sm break-words">
                          {currentOrder.orderDate ? 
                            new Date(currentOrder.orderDate).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            }) : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[8px] sm:text-xs text-slate-400">Order Status</p>
                        <p className={`capitalize font-medium text-xs sm:text-sm ${
                          currentOrder.status === 'delivered' ? 'text-green-600' :
                          currentOrder.status === 'cancelled' ? 'text-red-600' :
                          currentOrder.status === 'in-progress' ? 'text-orange-600' :
                          'text-blue-600'
                        }`}>
                          {currentOrder.status || 'N/A'}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Customer Details */}
              <div className="bg-slate-50 p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl hover:shadow-md transition-all">
                <h3 className="text-[10px] sm:text-xs font-black text-slate-500 uppercase mb-2 sm:mb-3 lg:mb-4 flex items-center gap-1.5 sm:gap-2">
                  <User size={14} className="text-blue-600 sm:w-4 sm:h-4" />
                  Customer Details
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  <div>
                    <p className="text-[8px] sm:text-xs text-slate-400">Name</p>
                    <p className="font-bold text-slate-800 text-xs sm:text-sm lg:text-base break-words">
                      {getCustomerName()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[8px] sm:text-xs text-slate-400">Phone</p>
                    <p className="font-medium flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                      <Phone size={12} className="text-blue-500 sm:w-3 sm:h-3" />
                      <span className="break-words">{getCustomerPhone()}</span>
                    </p>
                  </div>
                  {currentCustomer?.email && (
                    <div>
                      <p className="text-[8px] sm:text-xs text-slate-400">Email</p>
                      <p className="font-medium flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                        <Mail size={12} className="text-purple-500 sm:w-3 sm:h-3" />
                        <span className="break-words">{currentCustomer.email}</span>
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-[8px] sm:text-xs text-slate-400">Customer ID</p>
                    <p className="font-mono text-[10px] sm:text-xs text-indigo-600 break-words">{getCustomerId()}</p>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-slate-50 p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl hover:shadow-md transition-all">
                <h3 className="text-[10px] sm:text-xs font-black text-slate-500 uppercase mb-2 sm:mb-3 lg:mb-4 flex items-center gap-1.5 sm:gap-2">
                  <CreditCard size={14} className="text-blue-600 sm:w-4 sm:h-4" />
                  Payment Details
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {currentPayment.method === 'cash' && <Banknote size={14} className="text-green-600 sm:w-4 sm:h-4" />}
                    {currentPayment.method === 'upi' && <Smartphone size={14} className="text-blue-600 sm:w-4 sm:h-4" />}
                    {currentPayment.method === 'card' && <CreditCard size={14} className="text-orange-600 sm:w-4 sm:h-4" />}
                    {currentPayment.method === 'bank-transfer' && <Landmark size={14} className="text-purple-600 sm:w-4 sm:h-4" />}
                    <span className="capitalize font-medium text-xs sm:text-sm lg:text-base">{currentPayment.method || 'N/A'}</span>
                  </div>
                  
                  {currentPayment.referenceNumber && (
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Hash size={14} className="text-purple-500 sm:w-4 sm:h-4" />
                      <span className="font-mono text-purple-600 text-xs sm:text-sm break-words">{currentPayment.referenceNumber}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Calendar size={14} className="text-slate-400 sm:w-4 sm:h-4" />
                    <span className="font-medium text-xs sm:text-sm break-words">
                      {currentPayment.paymentDate ? 
                        new Date(currentPayment.paymentDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        }) : 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Clock size={14} className="text-slate-400 sm:w-4 sm:h-4" />
                    <span className="font-medium text-xs sm:text-sm">{currentPayment.paymentTime || '00:00'}</span>
                  </div>

                  {currentPayment.receivedBy && (
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <User size={14} className="text-blue-400 sm:w-4 sm:h-4" />
                      <span className="font-medium text-xs sm:text-sm break-words">
                        {getReceivedBy()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="bg-slate-50 p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl hover:shadow-md transition-all">
                <h3 className="text-[10px] sm:text-xs font-black text-slate-500 uppercase mb-2 sm:mb-3 lg:mb-4 flex items-center gap-1.5 sm:gap-2">
                  <FileText size={14} className="text-blue-600 sm:w-4 sm:h-4" />
                  Notes
                </h3>
                <div className="bg-white p-3 sm:p-4 rounded-lg border border-slate-200 min-h-[80px] sm:min-h-[100px]">
                  <p className="text-slate-700 italic text-xs sm:text-sm break-words">
                    {currentPayment.notes || 'No notes added for this payment.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Metadata - Mobile Responsive */}
            <div className="mt-4 sm:mt-5 lg:mt-8 pt-4 sm:pt-5 lg:pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4 text-[10px] sm:text-xs text-slate-400">
              <div className="bg-slate-50 p-2 sm:p-3 rounded-lg">
                <p className="font-medium text-slate-500">Created</p>
                <p className="break-words">{currentPayment.createdAt ? new Date(currentPayment.createdAt).toLocaleString('en-IN') : 'N/A'}</p>
              </div>
              <div className="bg-slate-50 p-2 sm:p-3 rounded-lg">
                <p className="font-medium text-slate-500">Last Updated</p>
                <p className="break-words">{currentPayment.updatedAt ? new Date(currentPayment.updatedAt).toLocaleString('en-IN') : 'N/A'}</p>
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-4 sm:mt-5 lg:mt-6 text-center text-[8px] sm:text-[10px] lg:text-xs text-slate-400 border-t border-slate-100 pt-3 sm:pt-4">
              <p>This is a system generated payment receipt. No signature required.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
