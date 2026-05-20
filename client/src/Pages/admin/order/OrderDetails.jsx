// import React, { useState, useEffect, useRef } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   ArrowLeft,
//   Edit,
//   Trash2,
//   Printer,
//   Download,
//   Package,
//   User,
//   Phone,
//   Calendar,
//   IndianRupee,
//   CreditCard,
//   Clock,
//   CheckCircle,
//   XCircle,
//   AlertCircle,
//   Plus,
//   Eye,
//   Image as ImageIcon,
//   Camera,
//   Scissors,
//   X,
//   Send,
//   PackageCheck,
//   Wallet,
//   Banknote,
//   Smartphone,
//   Landmark,
//   Receipt,
//   Truck,
//   Check,
//   FileText,
//   FileDown
// } from "lucide-react";
// import {
//   fetchOrderById,
//   deleteExistingOrder,
//   updateOrderStatusThunk,
//   clearCurrentOrder
// } from "../../../features/order/orderSlice";
// import { fetchGarmentsByOrder } from "../../../features/garment/garmentSlice";
// import {
//   fetchOrderPayments,
//   createPayment,
//   updatePayment,
//   deletePayment,
//   clearPayments
// } from "../../../features/payment/paymentSlice";
// import OrderInvoice from "../../../components/OrderInvoice";
// import PaymentReceipt from "../../../components/PaymentReceipt";
// import AddPaymentModal from "../../../components/AddPaymentModal";
// import showToast from "../../../utils/toast";

// // ==================== IMAGE MODAL COMPONENT ====================
// const ImageModal = ({ isOpen, image, imageType, onClose }) => {
//   useEffect(() => {
//     const handleEsc = (e) => {
//       if (e.key === 'Escape' && isOpen) {
//         onClose();
//       }
//     };
    
//     window.addEventListener('keydown', handleEsc);
//     return () => window.removeEventListener('keydown', handleEsc);
//   }, [isOpen, onClose]);

//   if (!isOpen || !image) return null;

//   const getFullImageUrl = (img) => {
//     if (!img) return null;
    
//     if (typeof img === 'string') {
//       if (img.startsWith('http')) return img;
//       if (img.startsWith('/uploads')) return `http://localhost:5000${img}`;
//       return `http://localhost:5000/uploads/${img}`;
//     }
    
//     if (img.url) {
//       return img.url;
//     }
    
//     return null;
//   };

//   const imageUrl = getFullImageUrl(image);

//   const getImageTypeLabel = () => {
//     switch(imageType) {
//       case 'reference':
//         return 'Studio Reference';
//       case 'customer':
//         return 'Customer Digital';
//       case 'cloth':
//         return 'Customer Cloth';
//       default:
//         return 'Image';
//     }
//   };

//   return (
//     <div 
//       className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-300"
//       onClick={onClose}
//     >
//       <div className="relative max-w-6xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
//         <button
//           onClick={onClose}
//           className="absolute -top-12 right-0 text-white hover:text-slate-300 transition-colors bg-black/50 hover:bg-black/70 rounded-full p-2 z-10"
//           title="Close (Esc)"
//         >
//           <X size={24} />
//         </button>

//         <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
//           <img
//             src={imageUrl}
//             alt={getImageTypeLabel()}
//             className="w-full h-auto max-h-[85vh] object-contain"
//             onError={(e) => {
//               e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
//             }}
//           />
//         </div>

//         <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">
//           <span className="capitalize">{getImageTypeLabel()}</span>
//         </div>
//       </div>

//       <div className="absolute bottom-4 right-4 text-white/50 text-xs hidden md:block">
//         Press ESC to close
//       </div>
//     </div>
//   );
// };

// // ==================== PAYMENT METHOD ICON COMPONENT ====================
// const PaymentMethodIcon = ({ method }) => {
//   switch(method) {
//     case 'cash':
//       return <Banknote size={16} className="text-green-600" />;
//     case 'upi':
//       return <Smartphone size={16} className="text-blue-600" />;
//     case 'bank-transfer':
//       return <Landmark size={16} className="text-purple-600" />;
//     case 'card':
//       return <CreditCard size={16} className="text-orange-600" />;
//     default:
//       return <Wallet size={16} className="text-slate-600" />;
//   }
// };

// // ==================== MAIN ORDER DETAILS COMPONENT ====================
// export default function OrderDetails() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
  
//   // Refs for different invoice types
//   const fullInvoiceRef = useRef();
//   const paymentReceiptRefs = useRef({});

//   // 🔍 DEBUG: Log component mount and ID
//   console.log("🔍 OrderDetails mounted with ID:", id);
//   console.log("📍 Current URL:", window.location.href);

//   // ✅ FIXED: Use state.order (singular) as shown in Redux state keys
//   const {
//     currentOrder,
//     currentPayments,
//     currentWorks,
//     loading,
//     error
//   } = useSelector((state) => {
//     // 🔍 DEBUG: Log available state keys
//     console.log("🔍 Redux state keys available:", Object.keys(state));
//     console.log("🔍 Order state (state.order):", state.order);
    
//     return {
//       currentOrder: state.order?.currentOrder || null,
//       currentPayments: state.order?.currentPayments || [],
//       currentWorks: state.order?.currentWorks || [],
//       loading: state.order?.loading || false,
//       error: state.order?.error || null
//     };
//   });

//   // Get garments state
//   const garments = useSelector((state) => {
//     const garmentsData = state.garment?.garments || state.garments?.garments || [];
//     console.log("🔍 Garments state:", { 
//       fromGarment: state.garment?.garments,
//       fromGarments: state.garments?.garments,
//       result: garmentsData 
//     });
//     return garmentsData;
//   });

//   const garmentsLoading = useSelector((state) => state.garment?.loading || state.garments?.loading || false);

//   // Get payments state
//   const payments = useSelector((state) => {
//     const paymentsData = state.payment?.payments || state.payments?.payments || [];
//     console.log("🔍 Payments state:", { 
//       fromPayment: state.payment?.payments,
//       fromPayments: state.payments?.payments,
//       result: paymentsData 
//     });
//     return paymentsData;
//   });

//   const paymentsLoading = useSelector((state) => state.payment?.loading || state.payments?.loading || false);

//   // Get auth state
//   const user = useSelector((state) => state.auth?.user || null);

//   const [showStatusMenu, setShowStatusMenu] = useState(false);
//   const [showPaymentModal, setShowPaymentModal] = useState(false);
//   const [editingPayment, setEditingPayment] = useState(null);
//   const [showPaymentHistory, setShowPaymentHistory] = useState(false);
//   const [imageModal, setImageModal] = useState({
//     isOpen: false,
//     image: null,
//     type: ''
//   });
//   const [expandedGarment, setExpandedGarment] = useState(null);
//   const [deleteLoading, setDeleteLoading] = useState(false);
//   const [dataLoadTimeout, setDataLoadTimeout] = useState(false);
//   const [fetchAttempts, setFetchAttempts] = useState(0);
//   const [downloadingPayment, setDownloadingPayment] = useState(null);
//   const [printing, setPrinting] = useState(false);
//   const [paymentLoading, setPaymentLoading] = useState(false);

//   const isAdmin = user?.role === "ADMIN";
//   const isStoreKeeper = user?.role === "STORE_KEEPER";
//   const canEdit = isAdmin || isStoreKeeper;

//   // ✅ Get base path based on user role
//   const basePath = user?.role === "ADMIN" ? "/admin" : 
//                    user?.role === "STORE_KEEPER" ? "/storekeeper" : 
//                    "/cuttingmaster";

//   // ✅ Set timeout for loading
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       if (loading) {
//         setDataLoadTimeout(true);
//       }
//     }, 8000);

//     return () => clearTimeout(timer);
//   }, [loading]);

//   // ✅ Fetch all data on mount
//   useEffect(() => {
//     if (id) {
//       console.log("🔍 Fetching order details for ID:", id, "Attempt:", fetchAttempts + 1);

//       const fetchData = async () => {
//         try {
//           setFetchAttempts(prev => prev + 1);

//           console.log("📦 Fetching order by ID...");
//           const orderResult = await dispatch(fetchOrderById(id)).unwrap();
//           console.log("✅ Order data fetched:", orderResult);

//           console.log("👕 Fetching garments...");
//           const garmentsResult = await dispatch(fetchGarmentsByOrder(id)).unwrap();
//           console.log("✅ Garments fetched:", garmentsResult);

//           console.log("💰 Fetching payments...");
//           const paymentsResult = await dispatch(fetchOrderPayments(id)).unwrap();
//           console.log("✅ Payments fetched:", paymentsResult);

//           console.log("🎉 All data fetched successfully!");

//         } catch (error) {
//           console.error("❌ Error fetching data:", error);
//           showToast.error(error?.message || "Failed to load order details");
//         }
//       };

//       fetchData();
//     }

//     return () => {
//       console.log("🧹 Cleaning up order details");
//       dispatch(clearCurrentOrder());
//       dispatch(clearPayments());
//     };
//   }, [dispatch, id]);

//   // ✅ Log state changes
//   useEffect(() => {
//     console.log("📊 Current state:", {
//       currentOrder: currentOrder?._id,
//       currentPaymentsCount: currentPayments?.length,
//       currentWorksCount: currentWorks?.length,
//       garmentsCount: garments?.length,
//       paymentsCount: payments?.length,
//       loading,
//       error,
//       fetchAttempts
//     });
//   }, [currentOrder, currentPayments, currentWorks, garments, payments, loading, error, fetchAttempts]);

//   // ✅ Handle error
//   useEffect(() => {
//     if (error) {
//       console.error("❌ Error in state:", error);
//       showToast.error(error);
//     }
//   }, [error]);

//   // ✅ Calculate payment statistics
//   const displayPayments = currentPayments?.length > 0 ? currentPayments : payments;

//   console.log("💰 Display payments:", {
//     currentPaymentsCount: currentPayments?.length,
//     paymentsCount: payments?.length,
//     displayCount: displayPayments?.length
//   });

//   const paymentStats = {
//     totalPaid: displayPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
//     totalPayments: displayPayments?.length || 0,
//     lastPayment: displayPayments?.length > 0 ? displayPayments[displayPayments.length - 1] : null,
//     advanceTotal: displayPayments?.filter(p => p.type === 'advance').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
//     fullTotal: displayPayments?.filter(p => p.type === 'full').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
//     partialTotal: displayPayments?.filter(p => p.type === 'partial').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
//     extraTotal: displayPayments?.filter(p => p.type === 'extra').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
//     byMethod: {
//       cash: displayPayments?.filter(p => p.method === 'cash').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
//       upi: displayPayments?.filter(p => p.method === 'upi').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
//       'bank-transfer': displayPayments?.filter(p => p.method === 'bank-transfer').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
//       card: displayPayments?.filter(p => p.method === 'card').reduce((sum, p) => sum + (p.amount || 0), 0) || 0
//     }
//   };

//   // ✅ Calculate price summary from currentOrder
//   const priceSummary = currentOrder?.priceSummary || { totalMin: 0, totalMax: 0 };

//   // ✅ Calculate balance with price range
//   const balanceAmount = {
//     min: priceSummary.totalMin - paymentStats.totalPaid,
//     max: priceSummary.totalMax - paymentStats.totalPaid
//   };

//   // ✅ Handle Back
//   const handleBack = () => {
//     navigate(`${basePath}/orders`);
//   };

//   // ✅ Handle Edit
//   const handleEdit = () => {
//     if (canEdit) {
//       navigate(`${basePath}/orders/edit/${id}`);
//     } else {
//       showToast.error("You don't have permission to edit orders");
//     }
//   };

//   // ✅ Handle Delete
//   const handleDelete = async () => {
//     if (!canEdit) {
//       showToast.error("You don't have permission to delete orders");
//       return;
//     }

//     if (!isAdmin) {
//       showToast.error("Only admins can delete orders");
//       return;
//     }

//     if (window.confirm("Are you sure you want to delete this order? This action cannot be undone.")) {
//       setDeleteLoading(true);
//       try {
//         await dispatch(deleteExistingOrder(id)).unwrap();
//         showToast.success("Order deleted successfully");
//         navigate(`${basePath}/orders`);
//       } catch (error) {
//         showToast.error(error?.message || "Failed to delete order");
//       } finally {
//         setDeleteLoading(false);
//       }
//     }
//   };

//   // ✅ Handle Status Change
//   const handleStatusChange = async (newStatus) => {
//     if (!canEdit) {
//       showToast.error("You don't have permission to update order status");
//       return;
//     }

//     try {
//       await dispatch(updateOrderStatusThunk({ id, status: newStatus })).unwrap();

//       const statusMessages = {
//         'ready-to-delivery': 'Order marked as ready for delivery',
//         'delivered': 'Order marked as delivered',
//         'cancelled': 'Order cancelled',
//         'in-progress': 'Order status updated to in progress',
//         'confirmed': 'Order confirmed',
//         'draft': 'Order moved to draft'
//       };

//       showToast.success(statusMessages[newStatus] || `Order status updated to ${newStatus}`);
//       setShowStatusMenu(false);
//       dispatch(fetchOrderById(id));
//     } catch (error) {
//       showToast.error(error?.message || "Failed to update status");
//     }
//   };

//   // ✅ Handle Add Payment
//   const handleAddPayment = () => {
//     setEditingPayment(null);
//     setShowPaymentModal(true);
//   };

//   // ✅ Handle Edit Payment
//   const handleEditPayment = (payment) => {
//     setEditingPayment(payment);
//     setShowPaymentModal(true);
//   };

//   // ✅ FIXED: Handle Save Payment - Complete fix
//   const handleSavePayment = async (paymentData) => {
//     console.log("%c💰💰💰 SAVE PAYMENT CALLED 💰💰💰", "background: purple; color: white; font-size: 14px");
//     console.log("📦 Payment data received:", paymentData);
//     console.log("📦 Order ID:", id);
//     console.log("📦 Customer ID:", currentOrder?.customer?._id);
    
//     // Validate required fields
//     if (!paymentData.amount || paymentData.amount <= 0) {
//       showToast.error("Please enter a valid amount");
//       return;
//     }

//     if (!currentOrder?.customer?._id) {
//       showToast.error("Customer information missing");
//       return;
//     }

//     setPaymentLoading(true);

//     try {
//       // Prepare payment data with proper field names
//       const preparedPaymentData = {
//         order: id,
//         customer: currentOrder.customer._id,
//         amount: Number(paymentData.amount),
//         type: paymentData.type || 'advance',
//         method: paymentData.method || 'cash',
//         referenceNumber: paymentData.referenceNumber?.trim() || '',
//         paymentDate: paymentData.paymentDate || new Date().toISOString().split('T')[0],
//         paymentTime: paymentData.paymentTime || new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
//         notes: paymentData.notes?.trim() || ''
//       };

//       console.log("📤 Prepared payment data:", preparedPaymentData);

//       let result;
      
//       if (editingPayment) {
//         // Update existing payment
//         console.log("✏️ Updating payment ID:", editingPayment._id);
//         result = await dispatch(updatePayment({
//           id: editingPayment._id,
//           data: preparedPaymentData
//         })).unwrap();
//         console.log("✅ Payment updated:", result);
//         showToast.success("Payment updated successfully");
//       } else {
//         // Create new payment
//         console.log("➕ Creating new payment...");
//         result = await dispatch(createPayment(preparedPaymentData)).unwrap();
//         console.log("✅ Payment created:", result);
//         showToast.success("Payment added successfully");
//       }

//       // Close modal and reset
//       setShowPaymentModal(false);
//       setEditingPayment(null);

//       // 🔥 CRITICAL: Refresh all data to show updated payments
//       console.log("🔄 Refreshing order and payments data...");
      
//       // Add a small delay to ensure backend processing
//       await new Promise(resolve => setTimeout(resolve, 500));
      
//       // Refresh order data (which includes updated payment summary)
//       await dispatch(fetchOrderById(id)).unwrap();
      
//       // Refresh payments list
//       await dispatch(fetchOrderPayments(id)).unwrap();
      
//       console.log("✅ Data refreshed successfully");

//     } catch (error) {
//       console.error("❌ Error saving payment:", error);
      
//       // Detailed error logging
//       if (error.response?.data) {
//         console.error("Server error response:", error.response.data);
//         showToast.error(error.response.data.message || "Failed to save payment");
//       } else if (error.message) {
//         showToast.error(error.message);
//       } else {
//         showToast.error("Failed to save payment");
//       }
//     } finally {
//       setPaymentLoading(false);
//     }
//   };

//   // ✅ Handle Delete Payment
//   const handleDeletePayment = async (paymentId) => {
//     if (!canEdit) {
//       showToast.error("You don't have permission to delete payments");
//       return;
//     }

//     if (window.confirm("Are you sure you want to delete this payment?")) {
//       try {
//         await dispatch(deletePayment(paymentId)).unwrap();
//         showToast.success("Payment deleted successfully");
        
//         // Refresh data
//         await dispatch(fetchOrderById(id)).unwrap();
//         await dispatch(fetchOrderPayments(id)).unwrap();
//       } catch (error) {
//         console.error("❌ Error deleting payment:", error);
//         showToast.error(error?.message || "Failed to delete payment");
//       }
//     }
//   };

//   // ✅ Handle View Garment
//   const handleViewGarment = (garmentId) => {
//     navigate(`${basePath}/garments/${garmentId}`);
//   };

//   // ✅ Handle Full Invoice Download
//   const handleDownloadFullInvoice = () => {
//     if (!fullInvoiceRef.current) {
//       showToast.error("Invoice not ready - please wait");
//       return;
//     }
    
//     try {
//       fullInvoiceRef.current.handleDownload();
//     } catch (error) {
//       console.error("Download error:", error);
//       showToast.error("Failed to download invoice");
//     }
//   };

//   // ✅ Handle Single Payment Receipt Download
//   const handleDownloadPaymentReceipt = async (payment) => {
//     try {
//       setDownloadingPayment(payment._id);
      
//       const receiptRef = paymentReceiptRefs.current[payment._id];
      
//       if (receiptRef) {
//         await receiptRef.handleDownload();
//         showToast.success(`Payment receipt for ₹${payment.amount} downloaded`);
//       } else {
//         showToast.error("Payment receipt not ready");
//       }
//     } catch (error) {
//       console.error("Error downloading payment receipt:", error);
//       showToast.error("Failed to download payment receipt");
//     } finally {
//       setDownloadingPayment(null);
//     }
//   };

//   // ✅ Handle Print
//   const handlePrint = async () => {
//     try {
//       setPrinting(true);
      
//       if (!fullInvoiceRef.current) {
//         showToast.error("Invoice not ready - please wait");
//         setPrinting(false);
//         return;
//       }
      
//       const element = fullInvoiceRef.current.getInvoiceElement 
//         ? fullInvoiceRef.current.getInvoiceElement() 
//         : null;
      
//       if (!element) {
//         console.error("Invoice element not found");
//         showToast.error("Invoice content not ready");
//         setPrinting(false);
//         return;
//       }
      
//       const cloneElement = element.cloneNode(true);
      
//       const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
//       let stylesHTML = '';
      
//       styles.forEach(style => {
//         if (style.tagName === 'STYLE') {
//           stylesHTML += style.outerHTML;
//         } else if (style.tagName === 'LINK') {
//           stylesHTML += style.outerHTML;
//         }
//       });

//       const printWindow = window.open('', '_blank');
      
//       if (!printWindow) {
//         showToast.error("Please allow pop-ups to print");
//         setPrinting(false);
//         return;
//       }
      
//       printWindow.document.write(`
//         <!DOCTYPE html>
//         <html>
//           <head>
//             <title>Dreamfit Invoice - ${currentOrder?.orderId}</title>
//             ${stylesHTML}
//             <style>
//               @media print {
//                 @page {
//                   size: A4;
//                   margin: 10mm;
//                 }
//                 body {
//                   margin: 0;
//                   padding: 0;
//                   background: white;
//                   -webkit-print-color-adjust: exact;
//                   print-color-adjust: exact;
//                 }
//                 .no-print {
//                   display: none !important;
//                 }
//                 div[data-invoice="true"] {
//                   width: 100% !important;
//                   max-width: 210mm !important;
//                   margin: 0 auto !important;
//                   box-shadow: none !important;
//                 }
//               }
//             </style>
//           </head>
//           <body>
//             ${cloneElement.outerHTML}
//             <script>
//               window.onload = function() {
//                 setTimeout(function() {
//                   window.print();
//                   setTimeout(function() { window.close(); }, 500);
//                 }, 500);
//               };
//             </script>
//           </body>
//         </html>
//       `);
      
//       printWindow.document.close();
//       showToast.success("Printing invoice...");
      
//     } catch (error) {
//       console.error("Print error:", error);
//       showToast.error("Failed to print invoice");
//     } finally {
//       setPrinting(false);
//     }
//   };

//   // Handle Send Acknowledgment
//   const handleSendAcknowledgment = () => {
//     showToast.success("Acknowledgment sent to customer");
//   };

//   // Handle Ready for Pickup
//   const handleReadyForPickup = () => {
//     if (currentOrder?.status === 'ready-to-delivery') {
//       showToast.success("Order is already marked as ready for delivery");
//     } else if (currentOrder?.status === 'in-progress') {
//       handleStatusChange('ready-to-delivery');
//     } else {
//       showToast.error("Order must be in progress to mark as ready for delivery");
//     }
//   };

//   // Handle Mark as Delivered
//   const handleMarkDelivered = () => {
//     if (currentOrder?.status === 'ready-to-delivery') {
//       handleStatusChange('delivered');
//     } else {
//       showToast.error("Order must be ready for delivery first");
//     }
//   };

//   const getImageUrl = (img) => {
//     if (!img) return null;

//     if (img.url) {
//       return img.url;
//     }

//     if (typeof img === 'string') {
//       if (img.startsWith('http')) return img;
//       if (img.startsWith('/uploads')) return `http://localhost:5000${img}`;
//       return `http://localhost:5000/uploads/${img}`;
//     }

//     return null;
//   };

//   const handleViewImage = (image, type) => {
//     setImageModal({
//       isOpen: true,
//       image: image,
//       type: type
//     });
//   };

//   const closeImageModal = () => {
//     setImageModal({ isOpen: false, image: null, type: '' });
//   };

//   const toggleGarmentImages = (garmentId) => {
//     setExpandedGarment(expandedGarment === garmentId ? null : garmentId);
//   };

//   const togglePaymentHistory = () => {
//     setShowPaymentHistory(!showPaymentHistory);
//   };

//   // Status badge generator
//   const getStatusBadge = (status) => {
//     const statusConfig = {
//       draft: { bg: "bg-gray-100", text: "text-gray-700", label: "Draft", icon: Clock },
//       confirmed: { bg: "bg-blue-100", text: "text-blue-700", label: "Confirmed", icon: CheckCircle },
//       "in-progress": { bg: "bg-yellow-100", text: "text-yellow-700", label: "In Progress", icon: AlertCircle },
//       "ready-to-delivery": { bg: "bg-purple-100", text: "text-purple-700", label: "Ready to Delivery", icon: Truck },
//       delivered: { bg: "bg-green-100", text: "text-green-700", label: "Delivered", icon: CheckCircle },
//       cancelled: { bg: "bg-red-100", text: "text-red-700", label: "Cancelled", icon: XCircle },
//     };
//     return statusConfig[status] || statusConfig.draft;
//   };

//   // Status options
//   const statusOptions = [
//     { value: "draft", label: "Draft" },
//     { value: "confirmed", label: "Confirmed" },
//     { value: "in-progress", label: "In Progress" },
//     { value: "ready-to-delivery", label: "Ready to Delivery" },
//     { value: "delivered", label: "Delivered" },
//     { value: "cancelled", label: "Cancelled" },
//   ];

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 0
//     }).format(amount || 0);
//   };

//   const formatDateTime = (dateString, timeString) => {
//     if (!dateString) return "";
//     const date = new Date(dateString);
//     const formattedDate = date.toLocaleDateString('en-GB', { 
//       day: '2-digit', 
//       month: 'short', 
//       year: 'numeric'
//     });
//     return `${formattedDate} at ${timeString || '00:00'}`;
//   };

//   // Loading state with timeout
//   if (loading && !dataLoadTimeout) {
//     return (
//       <div className="flex justify-center items-center min-h-[400px]">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
//           <p className="mt-4 text-slate-600">Loading order details...</p>
//           <p className="text-sm text-slate-400 mt-2">Attempt {fetchAttempts}</p>
//         </div>
//       </div>
//     );
//   }

//   // Timeout error
//   if (dataLoadTimeout && !currentOrder) {
//     return (
//       <div className="text-center py-16">
//         <Package size={64} className="mx-auto text-slate-300 mb-4" />
//         <h2 className="text-2xl font-bold text-slate-800">Taking too long to load</h2>
//         <p className="text-slate-500 mb-4">Order ID: {id}</p>
//         <p className="text-sm text-slate-400 mb-4">Attempts: {fetchAttempts}</p>
//         <div className="flex gap-4 justify-center">
//           <button
//             onClick={() => window.location.reload()}
//             className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
//           >
//             Retry
//           </button>
//           <button
//             onClick={handleBack}
//             className="bg-slate-200 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-300"
//           >
//             Back to Orders
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Order not found
//   if (!currentOrder) {
//     return (
//       <div className="text-center py-16">
//         <Package size={64} className="mx-auto text-slate-300 mb-4" />
//         <h2 className="text-2xl font-bold text-slate-800">Order Not Found</h2>
//         <p className="text-slate-500 mb-4">Order ID: {id}</p>
//         <p className="text-sm text-slate-400 mb-4">Attempts: {fetchAttempts}</p>
//         <button
//           onClick={handleBack}
//           className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
//         >
//           Back to Orders
//         </button>
//       </div>
//     );
//   }

//   const statusBadge = getStatusBadge(currentOrder.status);
//   const StatusIcon = statusBadge.icon;
//   const customer = currentOrder.customer || {};

//   return (
//     <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 p-6">
//       {/* Image Modal */}
//       <ImageModal 
//         isOpen={imageModal.isOpen}
//         image={imageModal.image}
//         imageType={imageModal.type}
//         onClose={closeImageModal}
//       />

//       {/* Add Payment Modal */}
//       <AddPaymentModal
//         isOpen={showPaymentModal}
//         onClose={() => {
//           setShowPaymentModal(false);
//           setEditingPayment(null);
//         }}
//         onSave={handleSavePayment}
//         orderTotalMin={priceSummary.totalMin}
//         orderTotalMax={priceSummary.totalMax}
//         orderId={id}
//         customerId={currentOrder?.customer?._id}
//         initialData={editingPayment}
//         title={editingPayment ? "Edit Payment" : "Add Payment to Order"}
//       />

//       {/* Hidden Full Invoice Component */}
//       <div className="fixed left-[-9999px] top-0">
//         <OrderInvoice 
//           ref={fullInvoiceRef}
//           order={currentOrder}
//           garments={garments}
//         />
//       </div>

//       {/* Hidden Payment Receipts - One for each payment */}
//       {displayPayments?.map((payment) => (
//         <div key={payment._id} className="fixed left-[-9999px] top-0">
//           <PaymentReceipt
//             ref={(el) => paymentReceiptRefs.current[payment._id] = el}
//             order={currentOrder}
//             garments={garments}
//             allPayments={displayPayments}
//             currentPayment={payment}
//           />
//         </div>
//       ))}

//       {/* Debug Panel */}
//       {/* {process.env.NODE_ENV === 'development' && (
//         <div className="bg-gray-900 text-green-400 p-4 rounded-2xl font-mono text-sm mb-4 overflow-auto max-h-60">
//           <div className="flex justify-between items-center mb-2">
//             <span className="font-bold">🔍 DEBUG INFO</span>
//             <button 
//               onClick={() => console.clear()} 
//               className="text-xs bg-gray-700 px-2 py-1 rounded hover:bg-gray-600"
//             >
//               Clear Console
//             </button>
//           </div>
//           <div className="space-y-1">
//             <div>Order ID: {currentOrder?.orderId}</div>
//             <div>Order _id: {currentOrder?._id}</div>
//             <div>Price Summary Min: ₹{priceSummary.totalMin}</div>
//             <div>Price Summary Max: ₹{priceSummary.totalMax}</div>
//             <div>Garments: {garments?.length || 0}</div>
//             <div>Payments: {displayPayments?.length || 0}</div>
//             <div>Total Paid: {formatCurrency(paymentStats.totalPaid)}</div>
//             <div>Balance Min: {formatCurrency(balanceAmount.min)}</div>
//             <div>Balance Max: {formatCurrency(balanceAmount.max)}</div>
//             <div>Can Edit: {canEdit ? 'Yes' : 'No'}</div>
//             <div>Role: {user?.role}</div>
//             <div>Status: {currentOrder?.status}</div>
//           </div>
//         </div>
//       )} */}

//       {/* Header with Actions */}
//       <div className="flex items-center justify-between">
//         <button
//           onClick={handleBack}
//           className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors group"
//         >
//           <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
//           <span className="font-bold">Back to Orders</span>
//         </button>

//         <div className="flex items-center gap-3">
//           {canEdit && (
//             <>
//               <div className="relative">
//                 <button
//                   onClick={() => setShowStatusMenu(!showStatusMenu)}
//                   className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 ${statusBadge.bg} ${statusBadge.text}`}
//                 >
//                   <StatusIcon size={18} />
//                   {statusBadge.label}
//                 </button>

//                 {showStatusMenu && (
//                   <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 z-10">
//                     {statusOptions.map((option) => (
//                       <button
//                         key={option.value}
//                         onClick={() => handleStatusChange(option.value)}
//                         className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-all ${
//                           currentOrder.status === option.value ? "bg-blue-50 text-blue-600 font-medium" : ""
//                         }`}
//                       >
//                         {option.label}
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               <button
//                 onClick={handleEdit}
//                 className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
//               >
//                 <Edit size={18} />
//                 Edit
//               </button>

//               {isAdmin && (
//                 <button
//                   onClick={handleDelete}
//                   disabled={deleteLoading}
//                   className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50"
//                 >
//                   {deleteLoading ? (
//                     <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                   ) : (
//                     <Trash2 size={18} />
//                   )}
//                   Delete
//                 </button>
//               )}

//               <button
//                 onClick={handleAddPayment}
//                 disabled={paymentLoading}
//                 className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50"
//               >
//                 {paymentLoading ? (
//                   <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                 ) : (
//                   <Wallet size={18} />
//                 )}
//                 Add Payment
//               </button>

//               {currentOrder.status === 'ready-to-delivery' && (
//                 <button
//                   onClick={handleMarkDelivered}
//                   className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
//                 >
//                   <Check size={18} />
//                   Mark Delivered
//                 </button>
//               )}
//             </>
//           )}

//           {/* Print Button - Prints Full Invoice */}
//           <button
//             onClick={handlePrint}
//             disabled={printing}
//             className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50"
//           >
//             {printing ? (
//               <div className="w-4 h-4 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
//             ) : (
//               <Printer size={18} />
//             )}
//             Print
//           </button>

//           {/* Download Full Invoice Button */}
//           <button
//             onClick={handleDownloadFullInvoice}
//             className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
//           >
//             <Download size={18} />
//             Full Invoice
//           </button>
//         </div>
//       </div>

//       {/* Order ID Header */}
//       <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
//         <div className="flex items-center justify-between">
//           <div>
//             <p className="text-blue-100 text-sm font-medium">Order ID</p>
//             <h1 className="text-3xl font-black">{currentOrder.orderId}</h1>
//           </div>
//           <div className="text-right">
//             <p className="text-blue-100 text-sm font-medium">Order Date</p>
//             <p className="text-xl font-bold">
//               {new Date(currentOrder.orderDate).toLocaleDateString()}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Main Content Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Left Column */}
//         <div className="lg:col-span-2 space-y-6">
//           {/* Customer Information */}
//           <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
//             <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
//               <User size={20} className="text-blue-600" />
//               Customer Information
//             </h2>

//             <div className="space-y-4">
//               <div className="flex items-center gap-4">
//                 <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
//                   <User size={24} className="text-blue-600" />
//                 </div>
//                 <div>
//                   <p className="text-xl font-bold text-slate-800">{customer.name || "N/A"}</p>
//                   <p className="text-sm text-slate-400">{customer.customerId || ""}</p>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div className="bg-slate-50 p-4 rounded-xl">
//                   <div className="flex items-center gap-2 text-slate-600 mb-1">
//                     <Phone size={16} className="text-blue-500" />
//                     <span className="text-xs font-medium">Phone</span>
//                   </div>
//                   <p className="font-bold">{customer.phone || "N/A"}</p>
//                 </div>

//                 <div className="bg-slate-50 p-4 rounded-xl">
//                   <div className="flex items-center gap-2 text-slate-600 mb-1">
//                     <Calendar size={16} className="text-blue-500" />
//                     <span className="text-xs font-medium">Delivery Date</span>
//                   </div>
//                   <p className="font-bold">
//                     {new Date(currentOrder.deliveryDate).toLocaleDateString()}
//                   </p>
//                 </div>
//               </div>

//               {currentOrder.specialNotes && (
//                 <div className="bg-slate-50 p-4 rounded-xl">
//                   <p className="text-xs font-medium text-slate-500 mb-1">Special Notes</p>
//                   <p className="text-slate-700">{currentOrder.specialNotes}</p>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Garments List */}
//           <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
//                 <Package size={20} className="text-blue-600" />
//                 Garments ({garments?.length || 0})
//               </h2>
//               {canEdit && (
//                 <button
//                   onClick={() => navigate(`${basePath}/orders/${id}/add-garment`)}
//                   className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2"
//                 >
//                   <Plus size={16} />
//                   Add Garment
//                 </button>
//               )}
//             </div>

//             {garments?.length === 0 ? (
//               <div className="text-center py-8 bg-slate-50 rounded-xl">
//                 <Package size={40} className="mx-auto text-slate-300 mb-2" />
//                 <p className="text-slate-500">No garments in this order</p>
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 {garments.map((garment) => {
//                   const garmentStatus = getStatusBadge(garment.status || "pending");

//                   const referenceImages = garment.referenceImages || [];
//                   const customerImages = garment.customerImages || [];
//                   const customerClothImages = garment.customerClothImages || [];

//                   const totalImages = referenceImages.length + customerImages.length + customerClothImages.length;

//                   return (
//                     <div
//                       key={garment._id}
//                       className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:shadow-md transition-all"
//                     >
//                       <div className="flex items-start justify-between mb-3">
//                         <div className="flex-1">
//                           <div className="flex items-center gap-3 mb-2">
//                             <h3 className="font-black text-slate-800">{garment.name}</h3>
//                             <span className={`text-xs px-2 py-1 rounded-full ${garmentStatus.bg} ${garmentStatus.text}`}>
//                               {garmentStatus.label}
//                             </span>
//                             {totalImages > 0 && (
//                               <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
//                                 {totalImages} {totalImages === 1 ? 'image' : 'images'}
//                               </span>
//                             )}
//                           </div>

//                           <div className="grid grid-cols-3 gap-4 text-sm mb-2">
//                             <div>
//                               <p className="text-slate-400">Garment ID</p>
//                               <p className="font-mono text-slate-700">{garment.garmentId}</p>
//                             </div>
//                             <div>
//                               <p className="text-slate-400">Price Range</p>
//                               <p className="font-bold text-blue-600">
//                                 ₹{garment.priceRange?.min} - ₹{garment.priceRange?.max}
//                               </p>
//                             </div>
//                             <div>
//                               <p className="text-slate-400">Delivery</p>
//                               <p>{new Date(garment.estimatedDelivery).toLocaleDateString()}</p>
//                             </div>
//                           </div>

//                           {totalImages > 0 && (
//                             <div className="flex flex-wrap gap-2 mt-2">
//                               {referenceImages.slice(0, 2).map((img, idx) => {
//                                 const imgUrl = getImageUrl(img);
//                                 return imgUrl ? (
//                                   <button
//                                     key={`ref-${idx}`}
//                                     onClick={() => handleViewImage(img, 'reference')}
//                                     className="relative group"
//                                   >
//                                     <img
//                                       src={imgUrl}
//                                       alt={`Reference ${idx + 1}`}
//                                       className="w-12 h-12 object-cover rounded-lg border-2 border-indigo-200"
//                                     />
//                                   </button>
//                                 ) : null;
//                               })}

//                               {customerImages.slice(0, 2).map((img, idx) => {
//                                 const imgUrl = getImageUrl(img);
//                                 return imgUrl ? (
//                                   <button
//                                     key={`cust-${idx}`}
//                                     onClick={() => handleViewImage(img, 'customer')}
//                                     className="relative group"
//                                   >
//                                     <img
//                                       src={imgUrl}
//                                       alt={`Customer ${idx + 1}`}
//                                       className="w-12 h-12 object-cover rounded-lg border-2 border-green-200"
//                                     />
//                                   </button>
//                                 ) : null;
//                               })}

//                               {customerClothImages.slice(0, 2).map((img, idx) => {
//                                 const imgUrl = getImageUrl(img);
//                                 return imgUrl ? (
//                                   <button
//                                     key={`cloth-${idx}`}
//                                     onClick={() => handleViewImage(img, 'cloth')}
//                                     className="relative group"
//                                   >
//                                     <img
//                                       src={imgUrl}
//                                       alt={`Cloth ${idx + 1}`}
//                                       className="w-12 h-12 object-cover rounded-lg border-2 border-orange-200"
//                                     />
//                                   </button>
//                                 ) : null;
//                               })}

//                               {totalImages > 6 && (
//                                 <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center text-sm font-bold text-slate-600">
//                                   +{totalImages - 6}
//                                 </div>
//                               )}
//                             </div>
//                           )}

//                           {totalImages > 0 && (
//                             <button
//                               onClick={() => toggleGarmentImages(garment._id)}
//                               className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-2 flex items-center gap-1"
//                             >
//                               <ImageIcon size={14} />
//                               {expandedGarment === garment._id ? 'Hide all images' : 'View all images'}
//                             </button>
//                           )}
//                         </div>

//                         <button
//                           onClick={() => handleViewGarment(garment._id)}
//                           className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 ml-2"
//                         >
//                           <Eye size={16} />
//                         </button>
//                       </div>

//                       {expandedGarment === garment._id && totalImages > 0 && (
//                         <div className="mt-4 pt-4 border-t border-slate-200">
//                           {referenceImages.length > 0 && (
//                             <div className="mb-4">
//                               <div className="flex items-center gap-2 mb-2">
//                                 <Camera size={16} className="text-indigo-600" />
//                                 <p className="text-sm font-bold text-indigo-600">
//                                   Reference Images ({referenceImages.length})
//                                 </p>
//                               </div>
//                               <div className="grid grid-cols-4 gap-2">
//                                 {referenceImages.map((img, idx) => {
//                                   const imgUrl = getImageUrl(img);
//                                   return imgUrl ? (
//                                     <button
//                                       key={`ref-full-${idx}`}
//                                       onClick={() => handleViewImage(img, 'reference')}
//                                       className="relative group aspect-square"
//                                     >
//                                       <img
//                                         src={imgUrl}
//                                         alt={`Reference ${idx + 1}`}
//                                         className="w-full h-full object-cover rounded-lg"
//                                       />
//                                     </button>
//                                   ) : null;
//                                 })}
//                               </div>
//                             </div>
//                           )}

//                           {customerImages.length > 0 && (
//                             <div className="mb-4">
//                               <div className="flex items-center gap-2 mb-2">
//                                 <ImageIcon size={16} className="text-green-600" />
//                                 <p className="text-sm font-bold text-green-600">
//                                   Customer Images ({customerImages.length})
//                                 </p>
//                               </div>
//                               <div className="grid grid-cols-4 gap-2">
//                                 {customerImages.map((img, idx) => {
//                                   const imgUrl = getImageUrl(img);
//                                   return imgUrl ? (
//                                     <button
//                                       key={`cust-full-${idx}`}
//                                       onClick={() => handleViewImage(img, 'customer')}
//                                       className="relative group aspect-square"
//                                     >
//                                       <img
//                                         src={imgUrl}
//                                         alt={`Customer ${idx + 1}`}
//                                         className="w-full h-full object-cover rounded-lg"
//                                       />
//                                     </button>
//                                   ) : null;
//                                 })}
//                               </div>
//                             </div>
//                           )}

//                           {customerClothImages.length > 0 && (
//                             <div>
//                               <div className="flex items-center gap-2 mb-2">
//                                 <Scissors size={16} className="text-orange-600" />
//                                 <p className="text-sm font-bold text-orange-600">
//                                   Cloth Images ({customerClothImages.length})
//                                 </p>
//                               </div>
//                               <div className="grid grid-cols-4 gap-2">
//                                 {customerClothImages.map((img, idx) => {
//                                   const imgUrl = getImageUrl(img);
//                                   return imgUrl ? (
//                                     <button
//                                       key={`cloth-full-${idx}`}
//                                       onClick={() => handleViewImage(img, 'cloth')}
//                                       className="relative group aspect-square"
//                                     >
//                                       <img
//                                         src={imgUrl}
//                                         alt={`Cloth ${idx + 1}`}
//                                         className="w-full h-full object-cover rounded-lg border-2 border-orange-200"
//                                       />
//                                     </button>
//                                   ) : null;
//                                 })}
//                               </div>
//                             </div>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Right Column - Payment Summary */}
//         <div className="lg:col-span-1">
//           <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-6">
//             <h2 className="text-lg font-black text-slate-800 mb-4">Payment Summary</h2>

//             <div className="space-y-4">
//               <div className="bg-blue-50 p-4 rounded-xl">
//                 <p className="text-xs text-blue-600 font-black uppercase mb-1">Total Amount</p>
//                 <p className="text-2xl font-black text-blue-700">
//                   {formatCurrency(priceSummary.totalMin)} - {formatCurrency(priceSummary.totalMax)}
//                 </p>
//               </div>

//               <div className="grid grid-cols-2 gap-2">
//                 <div className="bg-green-50 p-3 rounded-xl">
//                   <p className="text-xs text-green-600 font-bold">Total Paid</p>
//                   <p className="text-lg font-black text-green-700">{formatCurrency(paymentStats.totalPaid)}</p>
//                 </div>
//                 <div className="bg-purple-50 p-3 rounded-xl">
//                   <p className="text-xs text-purple-600 font-bold">Payments</p>
//                   <p className="text-lg font-black text-purple-700">{paymentStats.totalPayments}</p>
//                 </div>
//               </div>

//               <div className="bg-slate-50 p-4 rounded-xl">
//                 <p className="text-xs font-black uppercase text-slate-500 mb-3">Payment Breakdown</p>
//                 <div className="space-y-2">
//                   {paymentStats.advanceTotal > 0 && (
//                     <div className="flex justify-between items-center">
//                       <span className="text-sm text-slate-600">Advance</span>
//                       <span className="font-bold text-blue-600">{formatCurrency(paymentStats.advanceTotal)}</span>
//                     </div>
//                   )}
//                   {paymentStats.partialTotal > 0 && (
//                     <div className="flex justify-between items-center">
//                       <span className="text-sm text-slate-600">Partial</span>
//                       <span className="font-bold text-orange-600">{formatCurrency(paymentStats.partialTotal)}</span>
//                     </div>
//                   )}
//                   {paymentStats.fullTotal > 0 && (
//                     <div className="flex justify-between items-center">
//                       <span className="text-sm text-slate-600">Full</span>
//                       <span className="font-bold text-green-600">{formatCurrency(paymentStats.fullTotal)}</span>
//                     </div>
//                   )}
//                   {paymentStats.extraTotal > 0 && (
//                     <div className="flex justify-between items-center">
//                       <span className="text-sm text-slate-600">Extra</span>
//                       <span className="font-bold text-purple-600">{formatCurrency(paymentStats.extraTotal)}</span>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="bg-slate-50 p-4 rounded-xl">
//                 <p className="text-xs font-black uppercase text-slate-500 mb-3">Payment Methods</p>
//                 <div className="space-y-2">
//                   {paymentStats.byMethod.cash > 0 && (
//                     <div className="flex justify-between items-center">
//                       <div className="flex items-center gap-2">
//                         <Banknote size={14} className="text-green-600" />
//                         <span className="text-sm text-slate-600">Cash</span>
//                       </div>
//                       <span className="font-bold">{formatCurrency(paymentStats.byMethod.cash)}</span>
//                     </div>
//                   )}
//                   {paymentStats.byMethod.upi > 0 && (
//                     <div className="flex justify-between items-center">
//                       <div className="flex items-center gap-2">
//                         <Smartphone size={14} className="text-blue-600" />
//                         <span className="text-sm text-slate-600">UPI</span>
//                       </div>
//                       <span className="font-bold">{formatCurrency(paymentStats.byMethod.upi)}</span>
//                     </div>
//                   )}
//                   {paymentStats.byMethod['bank-transfer'] > 0 && (
//                     <div className="flex justify-between items-center">
//                       <div className="flex items-center gap-2">
//                         <Landmark size={14} className="text-purple-600" />
//                         <span className="text-sm text-slate-600">Bank Transfer</span>
//                       </div>
//                       <span className="font-bold">{formatCurrency(paymentStats.byMethod['bank-transfer'])}</span>
//                     </div>
//                   )}
//                   {paymentStats.byMethod.card > 0 && (
//                     <div className="flex justify-between items-center">
//                       <div className="flex items-center gap-2">
//                         <CreditCard size={14} className="text-orange-600" />
//                         <span className="text-sm text-slate-600">Card</span>
//                       </div>
//                       <span className="font-bold">{formatCurrency(paymentStats.byMethod.card)}</span>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {paymentStats.lastPayment && (
//                 <div className="bg-indigo-50 p-4 rounded-xl">
//                   <p className="text-xs text-indigo-600 font-black uppercase mb-2">Last Payment</p>
//                   <div className="flex items-center justify-between mb-1">
//                     <span className="text-lg font-black text-indigo-700">
//                       {formatCurrency(paymentStats.lastPayment.amount)}
//                     </span>
//                     <span className={`text-xs px-2 py-1 rounded-full ${
//                       paymentStats.lastPayment.type === 'full' ? 'bg-green-100 text-green-700' :
//                       paymentStats.lastPayment.type === 'advance' ? 'bg-blue-100 text-blue-700' :
//                       'bg-purple-100 text-purple-700'
//                     }`}>
//                       {paymentStats.lastPayment.type}
//                     </span>
//                   </div>
//                   <p className="text-xs text-indigo-600">
//                     {formatDateTime(paymentStats.lastPayment.paymentDate, paymentStats.lastPayment.paymentTime)}
//                   </p>
//                   {paymentStats.lastPayment.method !== 'cash' && paymentStats.lastPayment.referenceNumber && (
//                     <p className="text-xs text-purple-600 font-mono mt-1">
//                       Ref: {paymentStats.lastPayment.referenceNumber}
//                     </p>
//                   )}
//                 </div>
//               )}

//               <div className="bg-orange-50 p-4 rounded-xl">
//                 <p className="text-xs text-orange-600 font-black uppercase mb-1">Balance Amount</p>
//                 <p className="text-xl font-black text-orange-700">
//                   {formatCurrency(balanceAmount.min)} - {formatCurrency(balanceAmount.max)}
//                 </p>
//                 {balanceAmount.min <= 0 && balanceAmount.max <= 0 && (
//                   <p className="text-xs text-green-600 mt-1">✅ Fully paid</p>
//                 )}
//                 {balanceAmount.min <= 0 && balanceAmount.max > 0 && (
//                   <p className="text-xs text-orange-600 mt-1">⚠️ Minimum reached</p>
//                 )}
//               </div>

//               {displayPayments?.length > 0 && (
//                 <button
//                   onClick={togglePaymentHistory}
//                   className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all text-sm"
//                 >
//                   <Receipt size={16} />
//                   {showPaymentHistory ? 'Hide' : 'Show'} Payment History ({displayPayments.length})
//                 </button>
//               )}

//               {showPaymentHistory && displayPayments?.length > 0 && (
//                 <div className="bg-slate-50 rounded-xl p-3 max-h-96 overflow-y-auto">
//                   <div className="space-y-3">
//                     {displayPayments.map((payment) => (
//                       <div key={payment._id} className="bg-white p-3 rounded-lg border border-slate-200 hover:shadow-sm">
//                         <div className="flex items-start justify-between">
//                           <div className="flex-1">
//                             <div className="flex items-center gap-2 mb-1">
//                               <span className="font-bold text-green-600">{formatCurrency(payment.amount)}</span>
//                               <span className={`text-xs px-2 py-0.5 rounded-full ${
//                                 payment.type === 'full' ? 'bg-green-100 text-green-700' :
//                                 payment.type === 'advance' ? 'bg-blue-100 text-blue-700' :
//                                 'bg-purple-100 text-purple-700'
//                               }`}>
//                                 {payment.type}
//                               </span>
//                             </div>
//                             <div className="flex items-center gap-2 text-xs">
//                               <PaymentMethodIcon method={payment.method} />
//                               <span className="text-slate-600 capitalize">{payment.method}</span>
//                               <span className="text-slate-400">•</span>
//                               <span className="text-slate-400">
//                                 {formatDateTime(payment.paymentDate, payment.paymentTime)}
//                               </span>
//                             </div>
//                             {payment.referenceNumber && (
//                               <p className="text-xs text-purple-600 font-mono mt-1">
//                                 Ref: {payment.referenceNumber}
//                               </p>
//                             )}
//                           </div>
                          
//                           <div className="flex gap-2 ml-2">
//                             <button
//                               onClick={() => handleDownloadPaymentReceipt(payment)}
//                               disabled={downloadingPayment === payment._id}
//                               className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 disabled:opacity-50"
//                               title="Download Receipt"
//                             >
//                               {downloadingPayment === payment._id ? (
//                                 <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
//                               ) : (
//                                 <FileDown size={16} />
//                               )}
//                             </button>
                            
//                             {canEdit && (
//                               <>
//                                 <button
//                                   onClick={() => handleEditPayment(payment)}
//                                   className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
//                                 >
//                                   <Edit size={14} />
//                                 </button>
//                                 <button
//                                   onClick={() => handleDeletePayment(payment._id)}
//                                   className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
//                                 >
//                                   <Trash2 size={14} />
//                                 </button>
//                               </>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               <div className="bg-slate-50 p-4 rounded-xl">
//                 <p className="text-xs font-black uppercase text-slate-500 mb-3">Order Timeline</p>
//                 <div className="space-y-3">
//                   <div className="flex items-center gap-3">
//                     <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//                     <div className="flex-1">
//                       <p className="text-sm font-medium">Order Created</p>
//                       <p className="text-xs text-slate-400">
//                         {new Date(currentOrder.createdAt).toLocaleString()}
//                       </p>
//                     </div>
//                   </div>
//                   {currentOrder.status === "in-progress" && (
//                     <div className="flex items-center gap-3">
//                       <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
//                       <div className="flex-1">
//                         <p className="text-sm font-medium">In Progress</p>
//                         <p className="text-xs text-slate-400">
//                           {new Date(currentOrder.updatedAt).toLocaleString()}
//                         </p>
//                       </div>
//                     </div>
//                   )}
//                   {currentOrder.status === "ready-to-delivery" && (
//                     <div className="flex items-center gap-3">
//                       <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
//                       <div className="flex-1">
//                         <p className="text-sm font-medium">Ready to Delivery</p>
//                         <p className="text-xs text-slate-400">
//                           {new Date(currentOrder.updatedAt).toLocaleString()}
//                         </p>
//                       </div>
//                     </div>
//                   )}
//                   {currentOrder.status === "delivered" && (
//                     <div className="flex items-center gap-3">
//                       <div className="w-2 h-2 bg-green-500 rounded-full"></div>
//                       <div className="flex-1">
//                         <p className="text-sm font-medium">Delivered</p>
//                         <p className="text-xs text-slate-400">
//                           {new Date(currentOrder.updatedAt).toLocaleString()}
//                         </p>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div className="space-y-3 pt-2">
//                 {canEdit && (
//                   <button
//                     onClick={handleAddPayment}
//                     disabled={paymentLoading}
//                     className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
//                   >
//                     {paymentLoading ? (
//                       <>
//                         <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                         Processing...
//                       </>
//                     ) : (
//                       <>
//                         <Wallet size={18} />
//                         Add Payment
//                       </>
//                     )}
//                   </button>
//                 )}

//                 {/* <button
//                   onClick={handleSendAcknowledgment}
//                   className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
//                 >
//                   <Send size={18} />
//                   Send Acknowledgment
//                 </button> */}

//                 {currentOrder.status === 'in-progress' && (
//                   <button
//                     onClick={handleReadyForPickup}
//                     className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
//                   >
//                     <Truck size={18} />
//                     Mark Ready for Delivery
//                   </button>
//                 )}

//                 {currentOrder.status === 'ready-to-delivery' && (
//                   <button
//                     onClick={handleMarkDelivered}
//                     className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
//                   >
//                     <Check size={18} />
//                     Mark as Delivered
//                   </button>
//                 )}

//                 <button
//                   onClick={handleDownloadFullInvoice}
//                   className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
//                 >
//                   <Download size={18} />
//                   Download Full Invoice
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }




import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Printer,
  Download,
  Package,
  User,
  Phone,
  Calendar,
  IndianRupee,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Eye,
  Image as ImageIcon,
  Camera,
  Scissors,
  X,
  Send,
  PackageCheck,
  Wallet,
  Banknote,
  Smartphone,
  Landmark,
  Receipt,
  Truck,
  Check,
  FileText,
  FileDown,
  Menu
} from "lucide-react";
import {
  fetchOrderById,
  deleteExistingOrder,
  updateOrderStatusThunk,
  clearCurrentOrder
} from "../../../features/order/orderSlice";
import { fetchGarmentsByOrder } from "../../../features/garment/garmentSlice";
import {
  fetchOrderPayments,
  createPayment,
  updatePayment,
  deletePayment,
  clearPayments
} from "../../../features/payment/paymentSlice";
import OrderInvoice from "../../../components/OrderInvoice";
import PaymentReceipt from "../../../components/PaymentReceipt";
import AddPaymentModal from "../../../components/AddPaymentModal";
import showToast from "../../../utils/toast";

// ==================== IMAGE MODAL COMPONENT ====================
const ImageModal = ({ isOpen, image, imageType, onClose }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !image) return null;

  const getFullImageUrl = (img) => {
    if (!img) return null;
    
    if (typeof img === 'string') {
      if (img.startsWith('http')) return img;
      if (img.startsWith('/uploads')) return `http://localhost:5000${img}`;
      return `http://localhost:5000/uploads/${img}`;
    }
    
    if (img.url) {
      return img.url;
    }
    
    return null;
  };

  const imageUrl = getFullImageUrl(image);

  const getImageTypeLabel = () => {
    switch(imageType) {
      case 'reference':
        return 'Studio Reference';
      case 'customer':
        return 'Customer Digital';
      case 'cloth':
        return 'Customer Cloth';
      default:
        return 'Image';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-300 p-4"
      onClick={onClose}
    >
      <div className="relative w-full max-w-6xl mx-auto" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-10 sm:-top-12 right-0 text-white hover:text-slate-300 transition-colors bg-black/50 hover:bg-black/70 rounded-full p-2 z-10"
          title="Close (Esc)"
        >
          <X size={20} className="sm:w-6 sm:h-6" />
        </button>

        <div className="relative bg-black rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-white/10">
          <img
            src={imageUrl}
            alt={getImageTypeLabel()}
            className="w-full h-auto max-h-[80vh] sm:max-h-[85vh] object-contain"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
            }}
          />
        </div>

        <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm backdrop-blur-sm whitespace-nowrap">
          <span className="capitalize">{getImageTypeLabel()}</span>
        </div>
      </div>

      <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 text-white/50 text-[10px] sm:text-xs hidden md:block">
        Press ESC to close
      </div>
    </div>
  );
};

// ==================== PAYMENT METHOD ICON COMPONENT ====================
const PaymentMethodIcon = ({ method }) => {
  switch(method) {
    case 'cash':
      return <Banknote size={14} className="text-green-600 sm:w-4 sm:h-4" />;
    case 'upi':
      return <Smartphone size={14} className="text-blue-600 sm:w-4 sm:h-4" />;
    case 'bank-transfer':
      return <Landmark size={14} className="text-purple-600 sm:w-4 sm:h-4" />;
    case 'card':
      return <CreditCard size={14} className="text-orange-600 sm:w-4 sm:h-4" />;
    default:
      return <Wallet size={14} className="text-slate-600 sm:w-4 sm:h-4" />;
  }
};

// ==================== MAIN ORDER DETAILS COMPONENT ====================
export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Refs for different invoice types
  const fullInvoiceRef = useRef();
  const paymentReceiptRefs = useRef({});

  // 🔍 DEBUG: Log component mount and ID
  console.log("🔍 OrderDetails mounted with ID:", id);
  console.log("📍 Current URL:", window.location.href);

  // State selectors
  const {
    currentOrder,
    currentPayments,
    currentWorks,
    loading,
    error
  } = useSelector((state) => {
    console.log("🔍 Redux state keys available:", Object.keys(state));
    console.log("🔍 Order state (state.order):", state.order);
    
    return {
      currentOrder: state.order?.currentOrder || null,
      currentPayments: state.order?.currentPayments || [],
      currentWorks: state.order?.currentWorks || [],
      loading: state.order?.loading || false,
      error: state.order?.error || null
    };
  });

  // Get garments state
  const garments = useSelector((state) => {
    const garmentsData = state.garment?.garments || state.garments?.garments || [];
    console.log("🔍 Garments state:", { 
      fromGarment: state.garment?.garments,
      fromGarments: state.garments?.garments,
      result: garmentsData 
    });
    return garmentsData;
  });

  const garmentsLoading = useSelector((state) => state.garment?.loading || state.garments?.loading || false);

  // Get payments state
  const payments = useSelector((state) => {
    const paymentsData = state.payment?.payments || state.payments?.payments || [];
    console.log("🔍 Payments state:", { 
      fromPayment: state.payment?.payments,
      fromPayments: state.payments?.payments,
      result: paymentsData 
    });
    return paymentsData;
  });

  const paymentsLoading = useSelector((state) => state.payment?.loading || state.payments?.loading || false);

  // Get auth state
  const user = useSelector((state) => state.auth?.user || null);

  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [imageModal, setImageModal] = useState({
    isOpen: false,
    image: null,
    type: ''
  });
  const [expandedGarment, setExpandedGarment] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [dataLoadTimeout, setDataLoadTimeout] = useState(false);
  const [fetchAttempts, setFetchAttempts] = useState(0);
  const [downloadingPayment, setDownloadingPayment] = useState(null);
  const [printing, setPrinting] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(false);

  const isAdmin = user?.role === "ADMIN";
  const isStoreKeeper = user?.role === "STORE_KEEPER";
  const canEdit = isAdmin || isStoreKeeper;

  // Get base path based on user role
  const basePath = user?.role === "ADMIN" ? "/admin" : 
                   user?.role === "STORE_KEEPER" ? "/storekeeper" : 
                   "/cuttingmaster";

  // Set timeout for loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setDataLoadTimeout(true);
      }
    }, 8000);

    return () => clearTimeout(timer);
  }, [loading]);

  // Fetch all data on mount
  useEffect(() => {
    if (id) {
      console.log("🔍 Fetching order details for ID:", id, "Attempt:", fetchAttempts + 1);

      const fetchData = async () => {
        try {
          setFetchAttempts(prev => prev + 1);

          console.log("📦 Fetching order by ID...");
          const orderResult = await dispatch(fetchOrderById(id)).unwrap();
          console.log("✅ Order data fetched:", orderResult);

          console.log("👕 Fetching garments...");
          const garmentsResult = await dispatch(fetchGarmentsByOrder(id)).unwrap();
          console.log("✅ Garments fetched:", garmentsResult);

          console.log("💰 Fetching payments...");
          const paymentsResult = await dispatch(fetchOrderPayments(id)).unwrap();
          console.log("✅ Payments fetched:", paymentsResult);

          console.log("🎉 All data fetched successfully!");

        } catch (error) {
          console.error("❌ Error fetching data:", error);
          showToast.error(error?.message || "Failed to load order details");
        }
      };

      fetchData();
    }

    return () => {
      console.log("🧹 Cleaning up order details");
      dispatch(clearCurrentOrder());
      dispatch(clearPayments());
    };
  }, [dispatch, id]);

  // Log state changes
  useEffect(() => {
    console.log("📊 Current state:", {
      currentOrder: currentOrder?._id,
      currentPaymentsCount: currentPayments?.length,
      currentWorksCount: currentWorks?.length,
      garmentsCount: garments?.length,
      paymentsCount: payments?.length,
      loading,
      error,
      fetchAttempts
    });
  }, [currentOrder, currentPayments, currentWorks, garments, payments, loading, error, fetchAttempts]);

  // Handle error
  useEffect(() => {
    if (error) {
      console.error("❌ Error in state:", error);
      showToast.error(error);
    }
  }, [error]);

  // Calculate payment statistics
  const displayPayments = currentPayments?.length > 0 ? currentPayments : payments;

  // Check if a full payment has already been recorded — no more payments needed
  const hasFullPayment = 
    displayPayments?.some(p => p.type === 'full') || 
    currentOrder?.paymentSummary?.paymentStatus === 'paid' || 
    (currentOrder?.balanceAmount !== undefined && currentOrder.balanceAmount <= 0) || 
    false;

  console.log("💰 Display payments:", {
    currentPaymentsCount: currentPayments?.length,
    paymentsCount: payments?.length,
    displayCount: displayPayments?.length
  });

  const paymentStats = {
    totalPaid: displayPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
    totalPayments: displayPayments?.length || 0,
    lastPayment: displayPayments?.length > 0 ? displayPayments[displayPayments.length - 1] : null,
    advanceTotal: displayPayments?.filter(p => p.type === 'advance').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
    fullTotal: displayPayments?.filter(p => p.type === 'full').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
    partialTotal: displayPayments?.filter(p => p.type === 'partial').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
    extraTotal: displayPayments?.filter(p => p.type === 'extra').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
    byMethod: {
      cash: displayPayments?.filter(p => p.method === 'cash').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
      upi: displayPayments?.filter(p => p.method === 'upi').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
      'bank-transfer': displayPayments?.filter(p => p.method === 'bank-transfer').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
      card: displayPayments?.filter(p => p.method === 'card').reduce((sum, p) => sum + (p.amount || 0), 0) || 0
    }
  };

  // Calculate estimated range and finalized billing amount from garments
  const estimatedRange = useMemo(() => {
    const min = garments.reduce((sum, g) => sum + (Number(g.priceRange?.min) || 0), 0);
    const max = garments.reduce((sum, g) => sum + (Number(g.priceRange?.max) || 0), 0);
    return { min, max };
  }, [garments]);

  const finalizedAmount = useMemo(() => {
    return garments.reduce((sum, g) => {
      const hasFinalized = g.finalizedPrice !== undefined && g.finalizedPrice !== null && g.finalizedPrice !== "";
      const val = hasFinalized ? g.finalizedPrice : (g.priceRange?.max || 0);
      return sum + Number(val);
    }, 0);
  }, [garments]);

  // Calculate price summary from currentOrder
  const priceSummary = currentOrder?.priceSummary || { totalMin: 0, totalMax: 0 };

  // Calculate balance with finalizedAmount
  const balanceAmount = {
    min: (currentOrder?.finalizedAmount || finalizedAmount) - paymentStats.totalPaid,
    max: (currentOrder?.finalizedAmount || finalizedAmount) - paymentStats.totalPaid
  };

  // Handle Back
  const handleBack = () => {
    navigate(`${basePath}/orders`);
  };

  // Handle Edit
  const handleEdit = () => {
    if (canEdit) {
      navigate(`${basePath}/orders/edit/${id}`);
    } else {
      showToast.error("You don't have permission to edit orders");
    }
  };

  // Handle Delete
  const handleDelete = async () => {
    if (!canEdit) {
      showToast.error("You don't have permission to delete orders");
      return;
    }

    if (!isAdmin) {
      showToast.error("Only admins can delete orders");
      return;
    }

    if (window.confirm("Are you sure you want to delete this order? This action cannot be undone.")) {
      setDeleteLoading(true);
      try {
        await dispatch(deleteExistingOrder(id)).unwrap();
        showToast.success("Order deleted successfully");
        navigate(`${basePath}/orders`);
      } catch (error) {
        showToast.error(error?.message || "Failed to delete order");
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  // Handle Status Change
  const handleStatusChange = async (newStatus) => {
    if (!canEdit) {
      showToast.error("You don't have permission to update order status");
      return;
    }

    try {
      await dispatch(updateOrderStatusThunk({ id, status: newStatus })).unwrap();

      const statusMessages = {
        'ready-to-delivery': 'Order marked as ready for delivery',
        'delivered': 'Order marked as delivered',
        'cancelled': 'Order cancelled',
        'in-progress': 'Order status updated to in progress',
        'confirmed': 'Order confirmed',
        'draft': 'Order moved to draft'
      };

      showToast.success(statusMessages[newStatus] || `Order status updated to ${newStatus}`);
      setShowStatusMenu(false);
      dispatch(fetchOrderById(id));
    } catch (error) {
      showToast.error(error?.message || "Failed to update status");
    }
  };

  // Handle Add Payment
  const handleAddPayment = () => {
    setEditingPayment(null);
    setShowPaymentModal(true);
  };

  // Handle Edit Payment
  const handleEditPayment = (payment) => {
    setEditingPayment(payment);
    setShowPaymentModal(true);
  };

  // Handle Save Payment
  // const handleSavePayment = async (paymentData) => {
  //   console.log("%c💰💰💰 SAVE PAYMENT CALLED 💰💰💰", "background: purple; color: white; font-size: 14px");
  //   console.log("📦 Payment data received:", paymentData);
  //   console.log("📦 Order ID:", id);
  //   console.log("📦 Customer ID:", currentOrder?.customer?._id);
    
  //   // Validate required fields
  //   if (!paymentData.amount || paymentData.amount <= 0) {
  //     showToast.error("Please enter a valid amount");
  //     return;
  //   }

  //   if (!currentOrder?.customer?._id) {
  //     showToast.error("Customer information missing");
  //     return;
  //   }

  //   setPaymentLoading(true);

  //   try {
  //     // Prepare payment data with proper field names
  //     const preparedPaymentData = {
  //       order: id,
  //       customer: currentOrder.customer._id,
  //       amount: Number(paymentData.amount),
  //       type: paymentData.type || 'advance',
  //       method: paymentData.method || 'cash',
  //       referenceNumber: paymentData.referenceNumber?.trim() || '',
  //       paymentDate: paymentData.paymentDate || new Date().toISOString().split('T')[0],
  //       paymentTime: paymentData.paymentTime || new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
  //       notes: paymentData.notes?.trim() || ''
  //     };

  //     console.log("📤 Prepared payment data:", preparedPaymentData);

  //     let result;
      
  //     if (editingPayment) {
  //       // Update existing payment
  //       console.log("✏️ Updating payment ID:", editingPayment._id);
  //       result = await dispatch(updatePayment({
  //         id: editingPayment._id,
  //         data: preparedPaymentData
  //       })).unwrap();
  //       console.log("✅ Payment updated:", result);
  //       showToast.success("Payment updated successfully");
  //     } else {
  //       // Create new payment
  //       console.log("➕ Creating new payment...");
  //       result = await dispatch(createPayment(preparedPaymentData)).unwrap();
  //       console.log("✅ Payment created:", result);
  //       showToast.success("Payment added successfully");
  //     }

  //     // Close modal and reset
  //     setShowPaymentModal(false);
  //     setEditingPayment(null);

  //     // 🔥 CRITICAL: Refresh all data to show updated payments
  //     console.log("🔄 Refreshing order and payments data...");
      
  //     // Add a small delay to ensure backend processing
  //     await new Promise(resolve => setTimeout(resolve, 500));
      
  //     // Refresh order data (which includes updated payment summary)
  //     await dispatch(fetchOrderById(id)).unwrap();
      
  //     // Refresh payments list
  //     await dispatch(fetchOrderPayments(id)).unwrap();
      
  //     console.log("✅ Data refreshed successfully");

  //   } catch (error) {
  //     console.error("❌ Error saving payment:", error);
      
  //     // Detailed error logging
  //     if (error.response?.data) {
  //       console.error("Server error response:", error.response.data);
  //       showToast.error(error.response.data.message || "Failed to save payment");
  //     } else if (error.message) {
  //       showToast.error(error.message);
  //     } else {
  //       showToast.error("Failed to save payment");
  //     }
  //   } finally {
  //     setPaymentLoading(false);
  //   }
  // };

  // 🔥 FIXED: Handle Save Payment with correct time handling
const handleSavePayment = async (paymentData) => {
  console.log("%c💰💰💰 SAVE PAYMENT CALLED 💰💰💰", "background: purple; color: white; font-size: 14px");
  console.log("📦 Payment data received:", paymentData);
  console.log("📦 Order ID:", id);
  console.log("📦 Customer ID:", currentOrder?.customer?._id);
  
  // Validate required fields
  if (!paymentData.amount || paymentData.amount <= 0) {
    showToast.error("Please enter a valid amount");
    return;
  }

  if (!currentOrder?.customer?._id) {
    showToast.error("Customer information missing");
    return;
  }

  setPaymentLoading(true);

  try {
    // ✅ CRITICAL FIX: Merge selected date with current time
    const now = new Date();
    
    // Get payment date from form or use today
    let paymentDateObj;
    if (paymentData.paymentDate) {
      paymentDateObj = new Date(paymentData.paymentDate);
    } else {
      paymentDateObj = new Date();
    }
    
    // ✅ Merge: Selected date + current time
    paymentDateObj.setHours(now.getHours());
    paymentDateObj.setMinutes(now.getMinutes());
    paymentDateObj.setSeconds(now.getSeconds());
    paymentDateObj.setMilliseconds(now.getMilliseconds());
    
    // Format date as YYYY-MM-DD for display
    const formattedDate = paymentDateObj.toISOString().split('T')[0];
    const formattedTime = paymentDateObj.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    
    console.log("📅 Payment timestamp:", {
      originalDate: paymentData.paymentDate,
      currentTime: now.toLocaleTimeString(),
      finalDateTime: paymentDateObj.toISOString(),
      displayDate: formattedDate,
      displayTime: formattedTime
    });
    
    // Prepare payment data with proper field names
    const preparedPaymentData = {
      order: id,
      customer: currentOrder.customer._id,
      amount: Number(paymentData.amount),
      type: paymentData.type || 'advance',
      method: paymentData.method || 'cash',
      referenceNumber: paymentData.referenceNumber?.trim() || '',
      paymentDate: paymentDateObj.toISOString(), // ✅ Send full ISO string with time
      paymentTime: formattedTime, // HH:MM AM/PM for display
      notes: paymentData.notes?.trim() || ''
    };

    console.log("📤 Prepared payment data with full timestamp:", preparedPaymentData);

    let result;
    
    if (editingPayment) {
      // Update existing payment
      console.log("✏️ Updating payment ID:", editingPayment._id);
      result = await dispatch(updatePayment({
        id: editingPayment._id,
        data: preparedPaymentData
      })).unwrap();
      console.log("✅ Payment updated:", result);
      showToast.success("Payment updated successfully");
    } else {
      // Create new payment
      console.log("➕ Creating new payment with full timestamp...");
      result = await dispatch(createPayment(preparedPaymentData)).unwrap();
      console.log("✅ Payment created:", result);
      showToast.success("Payment added successfully");
    }

    // Close modal and reset
    setShowPaymentModal(false);
    setEditingPayment(null);

    // 🔥 CRITICAL: Refresh all data to show updated payments
    console.log("🔄 Refreshing order and payments data...");
    
    // Add a small delay to ensure backend processing
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Refresh order data (which includes updated payment summary)
    await dispatch(fetchOrderById(id)).unwrap();
    
    // Refresh payments list
    await dispatch(fetchOrderPayments(id)).unwrap();
    
    console.log("✅ Data refreshed successfully");

  } catch (error) {
    console.error("❌ Error saving payment:", error);
    
    // Detailed error logging
    if (error.response?.data) {
      console.error("Server error response:", error.response.data);
      showToast.error(error.response.data.message || "Failed to save payment");
    } else if (error.message) {
      showToast.error(error.message);
    } else {
      showToast.error("Failed to save payment");
    }
  } finally {
    setPaymentLoading(false);
  }
};

  // Handle Delete Payment
  const handleDeletePayment = async (paymentId) => {
    if (!canEdit) {
      showToast.error("You don't have permission to delete payments");
      return;
    }

    if (window.confirm("Are you sure you want to delete this payment?")) {
      try {
        await dispatch(deletePayment(paymentId)).unwrap();
        showToast.success("Payment deleted successfully");
        
        // Refresh data
        await dispatch(fetchOrderById(id)).unwrap();
        await dispatch(fetchOrderPayments(id)).unwrap();
      } catch (error) {
        console.error("❌ Error deleting payment:", error);
        showToast.error(error?.message || "Failed to delete payment");
      }
    }
  };

  // Handle View Garment
  const handleViewGarment = (garmentId) => {
    navigate(`${basePath}/garments/${garmentId}`);
  };

  // Handle Full Invoice Download
  const handleDownloadFullInvoice = () => {
    if (!fullInvoiceRef.current) {
      showToast.error("Invoice not ready - please wait");
      return;
    }
    
    try {
      fullInvoiceRef.current.handleDownload();
    } catch (error) {
      console.error("Download error:", error);
      showToast.error("Failed to download invoice");
    }
  };

  // Handle Single Payment Receipt Download
  const handleDownloadPaymentReceipt = async (payment) => {
    try {
      setDownloadingPayment(payment._id);
      
      const receiptRef = paymentReceiptRefs.current[payment._id];
      
      if (receiptRef) {
        await receiptRef.handleDownload();
        showToast.success(`Payment receipt for ₹${payment.amount} downloaded`);
      } else {
        showToast.error("Payment receipt not ready");
      }
    } catch (error) {
      console.error("Error downloading payment receipt:", error);
      showToast.error("Failed to download payment receipt");
    } finally {
      setDownloadingPayment(null);
    }
  };

  // Handle Print
  const handlePrint = async () => {
    try {
      setPrinting(true);
      
      if (!fullInvoiceRef.current) {
        showToast.error("Invoice not ready - please wait");
        setPrinting(false);
        return;
      }
      
      const element = fullInvoiceRef.current.getInvoiceElement 
        ? fullInvoiceRef.current.getInvoiceElement() 
        : null;
      
      if (!element) {
        console.error("Invoice element not found");
        showToast.error("Invoice content not ready");
        setPrinting(false);
        return;
      }
      
      const cloneElement = element.cloneNode(true);
      
      const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
      let stylesHTML = '';
      
      styles.forEach(style => {
        if (style.tagName === 'STYLE') {
          stylesHTML += style.outerHTML;
        } else if (style.tagName === 'LINK') {
          stylesHTML += style.outerHTML;
        }
      });

      const printWindow = window.open('', '_blank');
      
      if (!printWindow) {
        showToast.error("Please allow pop-ups to print");
        setPrinting(false);
        return;
      }
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Dreamfit Invoice - ${currentOrder?.orderId}</title>
            ${stylesHTML}
            <style>
              @media print {
                @page {
                  size: A4;
                  margin: 10mm;
                }
                body {
                  margin: 0;
                  padding: 0;
                  background: white;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                .no-print {
                  display: none !important;
                }
                div[data-invoice="true"] {
                  width: 100% !important;
                  max-width: 210mm !important;
                  margin: 0 auto !important;
                  box-shadow: none !important;
                }
              }
            </style>
          </head>
          <body>
            ${cloneElement.outerHTML}
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  setTimeout(function() { window.close(); }, 500);
                }, 500);
              };
            </script>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      showToast.success("Printing invoice...");
      
    } catch (error) {
      console.error("Print error:", error);
      showToast.error("Failed to print invoice");
    } finally {
      setPrinting(false);
    }
  };

  // Handle Ready for Pickup
  const handleReadyForPickup = () => {
    if (currentOrder?.status === 'ready-to-delivery') {
      showToast.success("Order is already marked as ready for delivery");
    } else if (currentOrder?.status === 'in-progress') {
      handleStatusChange('ready-to-delivery');
    } else {
      showToast.error("Order must be in progress to mark as ready for delivery");
    }
  };

  // Handle Mark as Delivered
  const handleMarkDelivered = () => {
    if (currentOrder?.status === 'ready-to-delivery') {
      handleStatusChange('delivered');
    } else {
      showToast.error("Order must be ready for delivery first");
    }
  };

  const getImageUrl = (img) => {
    if (!img) return null;

    if (img.url) {
      return img.url;
    }

    if (typeof img === 'string') {
      if (img.startsWith('http')) return img;
      if (img.startsWith('/uploads')) return `http://localhost:5000${img}`;
      return `http://localhost:5000/uploads/${img}`;
    }

    return null;
  };

  const handleViewImage = (image, type) => {
    setImageModal({
      isOpen: true,
      image: image,
      type: type
    });
  };

  const closeImageModal = () => {
    setImageModal({ isOpen: false, image: null, type: '' });
  };

  const toggleGarmentImages = (garmentId) => {
    setExpandedGarment(expandedGarment === garmentId ? null : garmentId);
  };

  const togglePaymentHistory = () => {
    setShowPaymentHistory(!showPaymentHistory);
  };

  // Status badge generator
  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { bg: "bg-gray-100", text: "text-gray-700", label: "Draft", icon: Clock },
      confirmed: { bg: "bg-blue-100", text: "text-blue-700", label: "Confirmed", icon: CheckCircle },
      "in-progress": { bg: "bg-yellow-100", text: "text-yellow-700", label: "In Progress", icon: AlertCircle },
      "ready-to-delivery": { bg: "bg-purple-100", text: "text-purple-700", label: "Ready to Delivery", icon: Truck },
      delivered: { bg: "bg-green-100", text: "text-green-700", label: "Delivered", icon: CheckCircle },
      cancelled: { bg: "bg-red-100", text: "text-red-700", label: "Cancelled", icon: XCircle },
    };
    return statusConfig[status] || statusConfig.draft;
  };

  // Status options
  const statusOptions = [
    { value: "draft", label: "Draft" },
    { value: "confirmed", label: "Confirmed" },
    { value: "in-progress", label: "In Progress" },
    { value: "ready-to-delivery", label: "Ready to Delivery" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDateTime = (dateString, timeString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric'
    });
    return `${formattedDate} at ${timeString || '00:00'}`;
  };

  // Loading state with timeout
  if (loading && !dataLoadTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm sm:text-base text-slate-600">Loading order details...</p>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">Attempt {fetchAttempts}</p>
        </div>
      </div>
    );
  }

  // Timeout error
  if (dataLoadTimeout && !currentOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-md w-full text-center">
          <Package size={48} className="mx-auto text-slate-300 mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Taking too long to load</h2>
          <p className="text-sm sm:text-base text-slate-500 mb-2">Order ID: {id}</p>
          <p className="text-xs sm:text-sm text-slate-400 mb-4">Attempts: {fetchAttempts}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 font-bold text-sm"
            >
              Retry
            </button>
            <button
              onClick={handleBack}
              className="bg-slate-200 text-slate-700 px-6 py-2.5 sm:py-3 rounded-lg hover:bg-slate-300 font-bold text-sm"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Order not found
  if (!currentOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-md w-full text-center">
          <Package size={48} className="mx-auto text-slate-300 mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Order Not Found</h2>
          <p className="text-sm sm:text-base text-slate-500 mb-2">Order ID: {id}</p>
          <p className="text-xs sm:text-sm text-slate-400 mb-4">Attempts: {fetchAttempts}</p>
          <button
            onClick={handleBack}
            className="bg-blue-600 text-white px-6 py-2.5 sm:py-3 rounded-lg hover:bg-blue-700 font-bold text-sm"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(currentOrder.status);
  const StatusIcon = statusBadge.icon;
  const customer = currentOrder.customer || {};

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
            Order {currentOrder?.orderId}
          </h1>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-slate-100 rounded-xl transition-all"
          >
            <Menu size={18} />
          </button>
        </div>
        
        {/* Mobile Action Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg p-4 z-40 max-h-[80vh] overflow-y-auto">
            <div className="space-y-3">
              <div className="border-b border-slate-100 pb-2 mb-2">
                <p className="text-xs font-bold text-slate-400 uppercase">Order Actions</p>
              </div>
              
              {canEdit && (
                <>
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowStatusMenu(!showStatusMenu);
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 bg-slate-100 rounded-lg font-bold"
                    >
                      <span className="flex items-center gap-2">
                        <StatusIcon size={18} />
                        {statusBadge.label}
                      </span>
                      <span>▼</span>
                    </button>
                    
                    {showStatusMenu && (
                      <div className="mt-1 bg-white rounded-lg shadow-lg border border-slate-200">
                        {statusOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              handleStatusChange(option.value);
                              setMobileMenuOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 hover:bg-slate-50 ${
                              currentOrder.status === option.value ? "bg-blue-50 text-blue-600 font-medium" : ""
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      handleEdit();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-bold"
                  >
                    <Edit size={18} />
                    Edit Order
                  </button>

                  {!hasFullPayment && (
                    <button
                      onClick={() => {
                        handleAddPayment();
                        setMobileMenuOpen(false);
                      }}
                      disabled={paymentLoading}
                      className="w-full flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg font-bold disabled:opacity-50"
                    >
                      <Wallet size={18} />
                      Add Payment
                    </button>
                  )}
                  {hasFullPayment && (
                    <div className="w-full flex items-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-lg font-bold border border-green-200">
                      <Wallet size={18} />
                      Payment Complete ✓
                    </div>
                  )}

                  {currentOrder.status === 'in-progress' && (
                    <button
                      onClick={() => {
                        handleReadyForPickup();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg font-bold"
                    >
                      <Truck size={18} />
                      Ready for Delivery
                    </button>
                  )}

                  {currentOrder.status === 'ready-to-delivery' && (
                    <button
                      onClick={() => {
                        handleMarkDelivered();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg font-bold"
                    >
                      <Check size={18} />
                      Mark Delivered
                    </button>
                  )}

                  {isAdmin && (
                    <button
                      onClick={() => {
                        handleDelete();
                        setMobileMenuOpen(false);
                      }}
                      disabled={deleteLoading}
                      className="w-full flex items-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg font-bold disabled:opacity-50"
                    >
                      {deleteLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                      Delete Order
                    </button>
                  )}
                </>
              )}

              <div className="border-t border-slate-100 pt-2 mt-2">
                <p className="text-xs font-bold text-slate-400 uppercase mb-2">Documents</p>
                <button
                  onClick={() => {
                    handlePrint();
                    setMobileMenuOpen(false);
                  }}
                  disabled={printing}
                  className="w-full flex items-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg font-bold mb-2"
                >
                  <Printer size={18} />
                  Print Invoice
                </button>
                <button
                  onClick={() => {
                    handleDownloadFullInvoice();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg font-bold"
                >
                  <Download size={18} />
                  Full Invoice
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
        {/* Image Modal */}
        <ImageModal 
          isOpen={imageModal.isOpen}
          image={imageModal.image}
          imageType={imageModal.type}
          onClose={closeImageModal}
        />

        {/* Add Payment Modal */}
        <AddPaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setEditingPayment(null);
          }}
          onSave={handleSavePayment}
          orderTotalMin={priceSummary.totalMin}
          orderTotalMax={priceSummary.totalMax}
          remainingAmount={balanceAmount.max}
          alreadyPaid={paymentStats.totalPaid}
          orderId={id}
          customerId={currentOrder?.customer?._id}
          initialData={editingPayment}
          title={editingPayment ? "Edit Payment" : "Add Payment to Order"}
        />

        {/* Hidden Full Invoice Component */}
        <div className="fixed left-[-9999px] top-0">
          <OrderInvoice 
            ref={fullInvoiceRef}
            order={currentOrder}
            garments={garments}
          />
        </div>

        {/* Hidden Payment Receipts - One for each payment */}
        {displayPayments?.map((payment) => (
          <div key={payment._id} className="fixed left-[-9999px] top-0">
            <PaymentReceipt
              ref={(el) => paymentReceiptRefs.current[payment._id] = el}
              order={currentOrder}
              garments={garments}
              allPayments={displayPayments}
              currentPayment={payment}
            />
          </div>
        ))}

        {/* Desktop Header with Actions - Hidden on Mobile */}
        <div className="hidden lg:flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold">Back to Orders</span>
          </button>

          <div className="flex items-center gap-3">
            {canEdit && (
              <>
                <div className="relative">
                  <button
                    onClick={() => setShowStatusMenu(!showStatusMenu)}
                    className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 ${statusBadge.bg} ${statusBadge.text}`}
                  >
                    <StatusIcon size={18} />
                    {statusBadge.label}
                  </button>

                  {showStatusMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 z-10">
                      {statusOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleStatusChange(option.value)}
                          className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-all ${
                            currentOrder.status === option.value ? "bg-blue-50 text-blue-600 font-medium" : ""
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleEdit}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
                >
                  <Edit size={18} />
                  Edit
                </button>

                {isAdmin && (
                  <button
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50"
                  >
                    {deleteLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 size={18} />
                    )}
                    Delete
                  </button>
                )}

{!hasFullPayment ? (
                  <button
                    onClick={handleAddPayment}
                    disabled={paymentLoading}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50"
                  >
                    {paymentLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Wallet size={18} />
                    )}
                    Add Payment
                  </button>
                ) : (
                  <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 border border-green-200">
                    <Wallet size={18} />
                    Payment Complete ✓
                  </div>
                )}

                {currentOrder.status === 'ready-to-delivery' && (
                  <button
                    onClick={handleMarkDelivered}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
                  >
                    <Check size={18} />
                    Mark Delivered
                  </button>
                )}

                {/* 💳 Enterprise Billing Hub Trigger */}
                {(currentOrder.status === 'ready-to-delivery' || currentOrder.status === 'delivered') && (
                  <button
                    onClick={() => navigate(`/admin/billing/create/${currentOrder._id}`)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
                  >
                    <Receipt size={18} />
                    Billing Hub
                  </button>
                )}
              </>
            )}

            {/* Print Button - Prints Full Invoice */}
            <button
              onClick={handlePrint}
              disabled={printing}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50"
            >
              {printing ? (
                <div className="w-4 h-4 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Printer size={18} />
              )}
              Print
            </button>

            {/* Download Full Invoice Button */}
            <button
              onClick={handleDownloadFullInvoice}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
            >
              <Download size={18} />
              Full Invoice
            </button>
          </div>
        </div>

        {/* Order ID Header - Responsive */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-blue-100 text-xs sm:text-sm font-medium">Order ID</p>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black break-words">{currentOrder.orderId}</h1>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-blue-100 text-xs sm:text-sm font-medium">Order Date</p>
              <p className="text-base sm:text-lg lg:text-xl font-bold">
                {new Date(currentOrder.orderDate).toLocaleDateString('en-GB', { 
                  day: '2-digit', 
                  month: 'short', 
                  year: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-black text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
                <User size={18} className="text-blue-600" />
                Customer Information
              </h2>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                    <User size={18} className="text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-base sm:text-lg lg:text-xl font-bold text-slate-800 truncate">{customer.name || "N/A"}</p>
                    <p className="text-xs sm:text-sm text-slate-400 truncate">{customer.customerId || ""}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-slate-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                    <div className="flex items-center gap-2 text-slate-600 mb-1">
                      <Phone size={14} className="text-blue-500" />
                      <span className="text-[10px] sm:text-xs font-medium">Phone</span>
                    </div>
                    <p className="text-sm sm:text-base font-bold break-words">{customer.phone || "N/A"}</p>
                  </div>

                  <div className="bg-slate-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                    <div className="flex items-center gap-2 text-slate-600 mb-1">
                      <Calendar size={14} className="text-blue-500" />
                      <span className="text-[10px] sm:text-xs font-medium">Delivery Date</span>
                    </div>
                    <p className="text-sm sm:text-base font-bold break-words">
                      {new Date(currentOrder.deliveryDate).toLocaleDateString('en-GB', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>

                {currentOrder.specialNotes && (
                  <div className="bg-slate-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                    <p className="text-[10px] sm:text-xs font-medium text-slate-500 mb-1">Special Notes</p>
                    <p className="text-xs sm:text-sm text-slate-700 break-words">{currentOrder.specialNotes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Garments List */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h2 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2">
                  <Package size={18} className="text-blue-600" />
                  Garments ({garments?.length || 0})
                </h2>
                {canEdit && (
                  <button
                    onClick={() => navigate(`${basePath}/orders/${id}/add-garment`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-2 self-start"
                  >
                    <Plus size={14} />
                    Add Garment
                  </button>
                )}
              </div>

              {garments?.length === 0 ? (
                <div className="text-center py-6 sm:py-8 bg-slate-50 rounded-xl">
                  <Package size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm sm:text-base text-slate-500">No garments in this order</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {garments.map((garment) => {
                    const garmentStatus = getStatusBadge(garment.status || "pending");

                    const referenceImages = garment.referenceImages || [];
                    const customerImages = garment.customerImages || [];
                    const customerClothImages = garment.customerClothImages || [];

                    const totalImages = referenceImages.length + customerImages.length + customerClothImages.length;

                    return (
                      <div
                        key={garment._id}
                        className="bg-slate-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-slate-200 hover:shadow-md transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3 className="font-black text-slate-800 text-sm sm:text-base truncate max-w-[150px] sm:max-w-full">
                                {garment.name}
                              </h3>
                              <span className={`text-[10px] sm:text-xs px-2 py-1 rounded-full ${garmentStatus.bg} ${garmentStatus.text} whitespace-nowrap`}>
                                {garmentStatus.label}
                              </span>
                              {totalImages > 0 && (
                                <span className="text-[10px] sm:text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full whitespace-nowrap">
                                  {totalImages} {totalImages === 1 ? 'img' : 'imgs'}
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-sm mb-2">
                              <div className="min-w-0">
                                <p className="text-slate-400 text-[10px]">Garment ID</p>
                                <p className="font-mono text-slate-700 truncate text-xs">{garment.garmentId}</p>
                              </div>
                              <div className="min-w-0">
                                <p className="text-slate-400 text-[10px]">Price</p>
                                <p className="font-bold text-blue-600 text-xs">
                                  ₹{(garment.finalizedPrice || garment.priceRange?.max || 0).toLocaleString('en-IN')}
                                </p>
                              </div>
                              <div className="min-w-0 col-span-2 sm:col-span-1">
                                <p className="text-slate-400 text-[10px]">Delivery</p>
                                <p className="text-xs truncate">
                                  {new Date(garment.estimatedDelivery).toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            {totalImages > 0 && (
                              <div className="flex flex-wrap items-center gap-2 mt-2">
                                <div className="flex flex-wrap gap-1 sm:gap-2">
                                  {referenceImages.slice(0, 3).map((img, idx) => {
                                    const imgUrl = getImageUrl(img);
                                    return imgUrl ? (
                                      <button
                                        key={`ref-${idx}`}
                                        onClick={() => handleViewImage(img, 'reference')}
                                        className="relative group"
                                      >
                                        <img
                                          src={imgUrl}
                                          alt={`Ref ${idx + 1}`}
                                          className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded-lg border-2 border-indigo-200"
                                        />
                                      </button>
                                    ) : null;
                                  })}

                                  {customerImages.slice(0, 3).map((img, idx) => {
                                    const imgUrl = getImageUrl(img);
                                    return imgUrl ? (
                                      <button
                                        key={`cust-${idx}`}
                                        onClick={() => handleViewImage(img, 'customer')}
                                        className="relative group"
                                      >
                                        <img
                                          src={imgUrl}
                                          alt={`Cust ${idx + 1}`}
                                          className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded-lg border-2 border-green-200"
                                        />
                                      </button>
                                    ) : null;
                                  })}

                                  {customerClothImages.slice(0, 3).map((img, idx) => {
                                    const imgUrl = getImageUrl(img);
                                    return imgUrl ? (
                                      <button
                                        key={`cloth-${idx}`}
                                        onClick={() => handleViewImage(img, 'cloth')}
                                        className="relative group"
                                      >
                                        <img
                                          src={imgUrl}
                                          alt={`Cloth ${idx + 1}`}
                                          className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded-lg border-2 border-orange-200"
                                        />
                                      </button>
                                    ) : null;
                                  })}
                                </div>

                                {totalImages > 6 && (
                                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-200 rounded-lg flex items-center justify-center text-xs font-bold text-slate-600">
                                    +{totalImages - 6}
                                  </div>
                                )}

                                {totalImages > 0 && (
                                  <button
                                    onClick={() => toggleGarmentImages(garment._id)}
                                    className="text-[10px] sm:text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 ml-auto"
                                  >
                                    <Eye size={12} />
                                    {expandedGarment === garment._id ? 'Hide' : 'View all'}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => handleViewGarment(garment._id)}
                            className="p-1.5 sm:p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 self-end sm:self-center"
                          >
                            <Eye size={14} />
                          </button>
                        </div>

                        {expandedGarment === garment._id && totalImages > 0 && (
                          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-200">
                            {referenceImages.length > 0 && (
                              <div className="mb-3 sm:mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Camera size={14} className="text-indigo-600" />
                                  <p className="text-xs sm:text-sm font-bold text-indigo-600">
                                    Reference ({referenceImages.length})
                                  </p>
                                </div>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                  {referenceImages.map((img, idx) => {
                                    const imgUrl = getImageUrl(img);
                                    return imgUrl ? (
                                      <button
                                        key={`ref-full-${idx}`}
                                        onClick={() => handleViewImage(img, 'reference')}
                                        className="relative group aspect-square"
                                      >
                                        <img
                                          src={imgUrl}
                                          alt={`Ref ${idx + 1}`}
                                          className="w-full h-full object-cover rounded-lg"
                                        />
                                      </button>
                                    ) : null;
                                  })}
                                </div>
                              </div>
                            )}

                            {customerImages.length > 0 && (
                              <div className="mb-3 sm:mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <ImageIcon size={14} className="text-green-600" />
                                  <p className="text-xs sm:text-sm font-bold text-green-600">
                                    Customer ({customerImages.length})
                                  </p>
                                </div>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                  {customerImages.map((img, idx) => {
                                    const imgUrl = getImageUrl(img);
                                    return imgUrl ? (
                                      <button
                                        key={`cust-full-${idx}`}
                                        onClick={() => handleViewImage(img, 'customer')}
                                        className="relative group aspect-square"
                                      >
                                        <img
                                          src={imgUrl}
                                          alt={`Cust ${idx + 1}`}
                                          className="w-full h-full object-cover rounded-lg"
                                        />
                                      </button>
                                    ) : null;
                                  })}
                                </div>
                              </div>
                            )}

                            {customerClothImages.length > 0 && (
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Scissors size={14} className="text-orange-600" />
                                  <p className="text-xs sm:text-sm font-bold text-orange-600">
                                    Cloth ({customerClothImages.length})
                                  </p>
                                </div>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                  {customerClothImages.map((img, idx) => {
                                    const imgUrl = getImageUrl(img);
                                    return imgUrl ? (
                                      <button
                                        key={`cloth-full-${idx}`}
                                        onClick={() => handleViewImage(img, 'cloth')}
                                        className="relative group aspect-square"
                                      >
                                        <img
                                          src={imgUrl}
                                          alt={`Cloth ${idx + 1}`}
                                          className="w-full h-full object-cover rounded-lg"
                                        />
                                      </button>
                                    ) : null;
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Payment Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6 sticky top-6">
              <h2 className="text-base sm:text-lg font-black text-slate-800 mb-3 sm:mb-4">Payment Summary</h2>

              <div className="space-y-3 sm:space-y-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-blue-100 shadow-sm">
                  <p className="text-[9px] sm:text-[10px] text-blue-600 font-black uppercase mb-0.5">Finalized Billing Amount</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-black text-blue-700 break-words">
                    {formatCurrency(finalizedAmount || priceSummary.totalMax)}
                  </p>
                  {estimatedRange.min > 0 && estimatedRange.max > 0 && (
                    <div className="mt-2 pt-2 border-t border-blue-200/50 flex justify-between text-[8px] sm:text-[9px] text-slate-500 font-bold">
                      <span>ESTIMATED RANGE:</span>
                      <span>{formatCurrency(estimatedRange.min)} – {formatCurrency(estimatedRange.max)}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-green-50 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                    <p className="text-[10px] sm:text-xs text-green-600 font-bold">Total Paid</p>
                    <p className="text-base sm:text-lg font-black text-green-700 break-words">{formatCurrency(paymentStats.totalPaid)}</p>
                  </div>
                  <div className="bg-purple-50 p-2 sm:p-3 rounded-lg sm:rounded-xl">
                    <p className="text-[10px] sm:text-xs text-purple-600 font-bold">Payments</p>
                    <p className="text-base sm:text-lg font-black text-purple-700">{paymentStats.totalPayments}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                  <p className="text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-2">Payment Breakdown</p>
                  <div className="space-y-1.5">
                    {paymentStats.advanceTotal > 0 && (
                      <div className="flex justify-between items-center text-xs sm:text-sm">
                        <span className="text-slate-600">Advance</span>
                        <span className="font-bold text-blue-600">{formatCurrency(paymentStats.advanceTotal)}</span>
                      </div>
                    )}
                    {paymentStats.partialTotal > 0 && (
                      <div className="flex justify-between items-center text-xs sm:text-sm">
                        <span className="text-slate-600">Partial</span>
                        <span className="font-bold text-orange-600">{formatCurrency(paymentStats.partialTotal)}</span>
                      </div>
                    )}
                    {paymentStats.fullTotal > 0 && (
                      <div className="flex justify-between items-center text-xs sm:text-sm">
                        <span className="text-slate-600">Full</span>
                        <span className="font-bold text-green-600">{formatCurrency(paymentStats.fullTotal)}</span>
                      </div>
                    )}
                    {paymentStats.extraTotal > 0 && (
                      <div className="flex justify-between items-center text-xs sm:text-sm">
                        <span className="text-slate-600">Extra</span>
                        <span className="font-bold text-purple-600">{formatCurrency(paymentStats.extraTotal)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                  <p className="text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-2">Payment Methods</p>
                  <div className="space-y-1.5">
                    {paymentStats.byMethod.cash > 0 && (
                      <div className="flex justify-between items-center text-xs sm:text-sm">
                        <div className="flex items-center gap-1.5">
                          <Banknote size={12} className="text-green-600" />
                          <span className="text-slate-600">Cash</span>
                        </div>
                        <span className="font-bold">{formatCurrency(paymentStats.byMethod.cash)}</span>
                      </div>
                    )}
                    {paymentStats.byMethod.upi > 0 && (
                      <div className="flex justify-between items-center text-xs sm:text-sm">
                        <div className="flex items-center gap-1.5">
                          <Smartphone size={12} className="text-blue-600" />
                          <span className="text-slate-600">UPI</span>
                        </div>
                        <span className="font-bold">{formatCurrency(paymentStats.byMethod.upi)}</span>
                      </div>
                    )}
                    {paymentStats.byMethod['bank-transfer'] > 0 && (
                      <div className="flex justify-between items-center text-xs sm:text-sm">
                        <div className="flex items-center gap-1.5">
                          <Landmark size={12} className="text-purple-600" />
                          <span className="text-slate-600">Bank Transfer</span>
                        </div>
                        <span className="font-bold">{formatCurrency(paymentStats.byMethod['bank-transfer'])}</span>
                      </div>
                    )}
                    {paymentStats.byMethod.card > 0 && (
                      <div className="flex justify-between items-center text-xs sm:text-sm">
                        <div className="flex items-center gap-1.5">
                          <CreditCard size={12} className="text-orange-600" />
                          <span className="text-slate-600">Card</span>
                        </div>
                        <span className="font-bold">{formatCurrency(paymentStats.byMethod.card)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {paymentStats.lastPayment && (
                  <div className="bg-indigo-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                    <p className="text-[10px] sm:text-xs text-indigo-600 font-black uppercase mb-2">Last Payment</p>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-base sm:text-lg font-black text-indigo-700">
                        {formatCurrency(paymentStats.lastPayment.amount)}
                      </span>
                      <span className={`text-[10px] sm:text-xs px-2 py-1 rounded-full ${
                        paymentStats.lastPayment.type === 'full' ? 'bg-green-100 text-green-700' :
                        paymentStats.lastPayment.type === 'advance' ? 'bg-blue-100 text-blue-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {paymentStats.lastPayment.type}
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-indigo-600 break-words">
                      {formatDateTime(paymentStats.lastPayment.paymentDate, paymentStats.lastPayment.paymentTime)}
                    </p>
                    {paymentStats.lastPayment.method !== 'cash' && paymentStats.lastPayment.referenceNumber && (
                      <p className="text-[10px] sm:text-xs text-purple-600 font-mono mt-1 break-words">
                        Ref: {paymentStats.lastPayment.referenceNumber}
                      </p>
                    )}
                  </div>
                )}

                <div className="bg-orange-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                  <p className="text-[10px] sm:text-xs text-orange-600 font-black uppercase mb-1">Balance Amount</p>
                  <p className="text-base sm:text-lg lg:text-xl font-black text-orange-700 break-words">
                    {balanceAmount.min === balanceAmount.max
                      ? formatCurrency(balanceAmount.max)
                      : `${formatCurrency(balanceAmount.min)} - ${formatCurrency(balanceAmount.max)}`}
                  </p>
                  {balanceAmount.min <= 0 && balanceAmount.max <= 0 && (
                    <p className="text-[10px] sm:text-xs text-green-600 mt-1">✅ Fully paid</p>
                  )}
                  {balanceAmount.min <= 0 && balanceAmount.max > 0 && (
                    <p className="text-[10px] sm:text-xs text-orange-600 mt-1">⚠️ Minimum reached</p>
                  )}
                </div>

                {displayPayments?.length > 0 && (
                  <button
                    onClick={togglePaymentHistory}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all text-xs sm:text-sm"
                  >
                    <Receipt size={14} />
                    {showPaymentHistory ? 'Hide' : 'Show'} Payment History ({displayPayments.length})
                  </button>
                )}

                {showPaymentHistory && displayPayments?.length > 0 && (
                  <div className="bg-slate-50 rounded-lg p-2 sm:p-3 max-h-72 sm:max-h-96 overflow-y-auto">
                    <div className="space-y-2">
                      {displayPayments.map((payment) => (
                        <div key={payment._id} className="bg-white p-2 sm:p-3 rounded-lg border border-slate-200 hover:shadow-sm">
                          <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                <span className="font-bold text-green-600 text-sm">{formatCurrency(payment.amount)}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                  payment.type === 'full' ? 'bg-green-100 text-green-700' :
                                  payment.type === 'advance' ? 'bg-blue-100 text-blue-700' :
                                  'bg-purple-100 text-purple-700'
                                }`}>
                                  {payment.type}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs">
                                <PaymentMethodIcon method={payment.method} />
                                <span className="text-slate-600 capitalize">{payment.method}</span>
                                <span className="text-slate-400 hidden xs:inline">•</span>
                                <span className="text-slate-400 truncate max-w-[120px]">
                                  {formatDateTime(payment.paymentDate, payment.paymentTime)}
                                </span>
                              </div>
                              {payment.referenceNumber && (
                                <p className="text-[10px] text-purple-600 font-mono mt-1 truncate">
                                  Ref: {payment.referenceNumber}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex gap-1 sm:gap-2 self-end sm:self-center">
                              <button
                                onClick={() => handleDownloadPaymentReceipt(payment)}
                                disabled={downloadingPayment === payment._id}
                                className="p-1.5 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 disabled:opacity-50"
                                title="Download Receipt"
                              >
                                {downloadingPayment === payment._id ? (
                                  <div className="w-3 h-3 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <FileDown size={12} />
                                )}
                              </button>
                              
                              {canEdit && (
                                <>
                                  <button
                                    onClick={() => handleEditPayment(payment)}
                                    className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                                  >
                                    <Edit size={12} />
                                  </button>
                                  <button
                                    onClick={() => handleDeletePayment(payment._id)}
                                    className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-slate-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                  <p className="text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-2">Order Timeline</p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium">Order Created</p>
                        <p className="text-[10px] sm:text-xs text-slate-400 break-words">
                          {new Date(currentOrder.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {currentOrder.status === "in-progress" && (
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-1.5"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium">In Progress</p>
                          <p className="text-[10px] sm:text-xs text-slate-400 break-words">
                            {new Date(currentOrder.updatedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                    {currentOrder.status === "ready-to-delivery" && (
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium">Ready to Delivery</p>
                          <p className="text-[10px] sm:text-xs text-slate-400 break-words">
                            {new Date(currentOrder.updatedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                    {currentOrder.status === "delivered" && (
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium">Delivered</p>
                          <p className="text-[10px] sm:text-xs text-slate-400 break-words">
                            {new Date(currentOrder.updatedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile Action Buttons */}
                <div className="lg:hidden space-y-2 pt-2">
                  {canEdit && (
                    <>
                      <button
                        onClick={handleAddPayment}
                        disabled={paymentLoading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                      >
                        {paymentLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Wallet size={16} />
                            Add Payment
                          </>
                        )}
                      </button>

                      {currentOrder.status === 'in-progress' && (
                        <button
                          onClick={handleReadyForPickup}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm"
                        >
                          <Truck size={16} />
                          Mark Ready for Delivery
                        </button>
                      )}

                      {currentOrder.status === 'ready-to-delivery' && (
                        <button
                          onClick={handleMarkDelivered}
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm"
                        >
                          <Check size={16} />
                          Mark as Delivered
                        </button>
                      )}

                      {/* 💳 Enterprise Billing Hub Trigger */}
                      {(currentOrder.status === 'ready-to-delivery' || currentOrder.status === 'delivered') && (
                        <button
                          onClick={() => navigate(`/admin/billing/create/${currentOrder._id}`)}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm"
                        >
                          <Receipt size={16} />
                          Billing Hub
                        </button>
                      )}
                    </>
                  )}

                  <button
                    onClick={handleDownloadFullInvoice}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm"
                  >
                    <Download size={16} />
                    Download Full Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}