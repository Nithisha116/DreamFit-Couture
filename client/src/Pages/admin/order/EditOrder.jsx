// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   ArrowLeft,
//   Save,
//   User,
//   Calendar,
//   CreditCard,
//   IndianRupee,
//   Package,
//   ChevronDown,
//   Plus,
//   Trash2,
//   Image as ImageIcon,
//   Phone,
//   Wallet,
//   Banknote,
//   Smartphone,
//   Landmark,
//   Clock,
//   X,
//   Receipt,
//   TrendingUp,
//   Truck,
//   Check
// } from "lucide-react";

// // ✅ CORRECTED IMPORTS - Using correct slice names from Redux state
// import { 
//   fetchOrderById, 
//   updateExistingOrder,
//   updateOrderStatusThunk,
//   clearCurrentOrder
// } from "../../../features/order/orderSlice";

// import { 
//   fetchGarmentsByOrder, 
//   deleteGarment 
// } from "../../../features/garment/garmentSlice";

// import {
//   fetchOrderPayments,
//   createPayment,
//   updatePayment,
//   deletePayment,
//   clearPayments
// } from "../../../features/payment/paymentSlice.js";

// import { fetchAllCustomers } from "../../../features/customer/customerSlice";

// import GarmentForm from "../garment/GarmentForm";
// import AddPaymentModal from "../../../components/AddPaymentModal";
// import showToast from "../../../utils/toast";
// import "./CalendarStyles.css"
// export default function EditOrder() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
  
//   // ✅ DEBUG: Log component mount
//   console.log("🔍 EditOrder mounted with ID:", id);
//   console.log("📍 Current URL:", window.location.href);
  
//   // ✅ CORRECTED STATE SELECTORS - Using state.order (singular) as shown in Redux
//   const { currentOrder, loading } = useSelector((state) => {
//     console.log("🔍 Order state (state.order):", state.order);
//     return {
//       currentOrder: state.order?.currentOrder || null,
//       loading: state.order?.loading || false
//     };
//   });
  
//   // Garments - check both singular and plural
//   const garments = useSelector((state) => {
//     const garmentsData = state.garment?.garments || state.garments?.garments || [];
//     console.log("🔍 Garments state:", { 
//       fromGarment: state.garment?.garments,
//       fromGarments: state.garments?.garments,
//       result: garmentsData 
//     });
//     return garmentsData;
//   });
  
//   // Payments - check both singular and plural
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
  
//   // Customers - check both singular and plural
//   const customers = useSelector((state) => {
//     const customersData = state.customer?.customers || state.customers?.customers || [];
//     console.log("🔍 Customers state:", { 
//       fromCustomer: state.customer?.customers,
//       fromCustomers: state.customers?.customers,
//       result: customersData 
//     });
//     return customersData;
//   });
  
//   const { user } = useSelector((state) => state.auth);

//   const [formData, setFormData] = useState({
//     customer: "",
//     deliveryDate: "",
//     specialNotes: "",
//     advancePayment: {
//       amount: 0,
//       method: "cash",
//     },
//     status: "draft",
//   });

//   const [showGarmentModal, setShowGarmentModal] = useState(false);
//   const [showPaymentModal, setShowPaymentModal] = useState(false);
//   const [editingPayment, setEditingPayment] = useState(null);
//   const [showPaymentHistory, setShowPaymentHistory] = useState(false);
//   const [editingGarment, setEditingGarment] = useState(null);
//   const [expandedGarment, setExpandedGarment] = useState(null);
//   const [customerName, setCustomerName] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [dataLoadTimeout, setDataLoadTimeout] = useState(false);
//   const [fetchAttempts, setFetchAttempts] = useState(0);

//   const isAdmin = user?.role === "ADMIN";
//   const isStoreKeeper = user?.role === "STORE_KEEPER";
//   const canEdit = isAdmin || isStoreKeeper;

//   // Get base path based on user role
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
//           await dispatch(fetchOrderById(id)).unwrap();
          
//           console.log("👕 Fetching garments...");
//           await dispatch(fetchGarmentsByOrder(id)).unwrap();
          
//           console.log("💰 Fetching payments...");
//           await dispatch(fetchOrderPayments(id)).unwrap();
          
//           console.log("👥 Fetching customers...");
//           await dispatch(fetchAllCustomers()).unwrap();
          
//           console.log("🎉 All data fetched successfully!");
          
//         } catch (error) {
//           console.error("❌ Error fetching data:", error);
//           showToast.error(error?.message || "Failed to load order details");
//         }
//       };
      
//       fetchData();
//     }

//     // Cleanup on unmount
//     return () => {
//       console.log("🧹 Cleaning up edit order");
//       dispatch(clearCurrentOrder());
//       dispatch(clearPayments());
//     };
//   }, [dispatch, id]);

//   // ✅ Log state changes
//   useEffect(() => {
//     console.log("📊 Current state:", {
//       currentOrder: currentOrder?._id,
//       garmentsCount: garments?.length,
//       paymentsCount: payments?.length,
//       customersCount: customers?.length,
//       loading,
//       fetchAttempts
//     });
//   }, [currentOrder, garments, payments, customers, loading, fetchAttempts]);

//   // Find customer name from customers array
//   useEffect(() => {
//     if (currentOrder?.customer && customers?.length > 0) {
//       const customerId = currentOrder.customer._id || currentOrder.customer;
//       const fullCustomer = customers.find(c => c._id === customerId);
      
//       if (fullCustomer) {
//         let name = '';
//         if (fullCustomer.firstName || fullCustomer.lastName) {
//           const firstName = fullCustomer.firstName || '';
//           const lastName = fullCustomer.lastName || '';
//           name = `${firstName} ${lastName}`.trim();
//         } else if (fullCustomer.name) {
//           name = fullCustomer.name;
//         }
        
//         if (fullCustomer.salutation && name) {
//           name = `${fullCustomer.salutation} ${name}`;
//         }
        
//         setCustomerName(name || 'Customer');
//         console.log("👤 Customer name set:", name);
//       }
//     }
//   }, [currentOrder, customers]);

//   // Set form data when order loads
//   useEffect(() => {
//     if (currentOrder) {
//       console.log("📝 Setting form data from order:", currentOrder);
//       setFormData({
//         customer: currentOrder.customer?._id || "",
//         deliveryDate: currentOrder.deliveryDate?.split("T")[0] || "",
//         specialNotes: currentOrder.specialNotes || "",
//         advancePayment: currentOrder.advancePayment || { amount: 0, method: "cash" },
//         status: currentOrder.status || "draft",
//       });
//     }
//   }, [currentOrder]);

//   // Calculate payment statistics
//   const paymentStats = {
//     totalPaid: payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
//     totalPayments: payments?.length || 0,
//     lastPayment: payments?.length > 0 ? payments[payments.length - 1] : null,
//     advanceTotal: payments?.filter(p => p.type === 'advance').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
//     fullTotal: payments?.filter(p => p.type === 'full').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
//     partialTotal: payments?.filter(p => p.type === 'partial').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
//     extraTotal: payments?.filter(p => p.type === 'extra').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
//     byMethod: {
//       cash: payments?.filter(p => p.method === 'cash').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
//       upi: payments?.filter(p => p.method === 'upi').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
//       'bank-transfer': payments?.filter(p => p.method === 'bank-transfer').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
//       card: payments?.filter(p => p.method === 'card').reduce((sum, p) => sum + (p.amount || 0), 0) || 0
//     }
//   };

//   const priceSummary = garments?.reduce(
//     (acc, garment) => ({
//       min: acc.min + (garment.priceRange?.min || 0),
//       max: acc.max + (garment.priceRange?.max || 0),
//     }),
//     { min: 0, max: 0 }
//   ) || { min: 0, max: 0 };

//   const totalAmount = priceSummary.max || 0;
//   const balanceAmount = totalAmount - paymentStats.totalPaid;

//   // Calculate garment delivery range
//   const garmentDeliveryRange = garments?.length > 0 ? {
//     min: new Date(Math.min(...garments.map(g => new Date(g.estimatedDelivery || formData.deliveryDate)))),
//     max: new Date(Math.max(...garments.map(g => new Date(g.estimatedDelivery || formData.deliveryDate))))
//   } : null;

//   // Payment Method Icon Component
//   const PaymentMethodIcon = ({ method }) => {
//     switch(method) {
//       case 'cash':
//         return <Banknote size={16} className="text-green-600" />;
//       case 'upi':
//         return <Smartphone size={16} className="text-blue-600" />;
//       case 'bank-transfer':
//         return <Landmark size={16} className="text-purple-600" />;
//       case 'card':
//         return <CreditCard size={16} className="text-orange-600" />;
//       default:
//         return <Wallet size={16} className="text-slate-600" />;
//     }
//   };

//   const handleAddGarment = () => {
//     setEditingGarment(null);
//     setShowGarmentModal(true);
//   };

//   const handleEditGarment = (garment) => {
//     setEditingGarment(garment);
//     setShowGarmentModal(true);
//   };

//   const handleDeleteGarment = async (garmentId) => {
//     if (window.confirm("Are you sure you want to remove this garment?")) {
//       try {
//         await dispatch(deleteGarment(garmentId)).unwrap();
//         showToast.success("Garment removed");
//         dispatch(fetchGarmentsByOrder(id));
//       } catch (error) {
//         showToast.error("Failed to remove garment");
//       }
//     }
//   };

//   const handleSaveGarment = () => {
//     setShowGarmentModal(false);
//     dispatch(fetchGarmentsByOrder(id));
//     showToast.success("Garment updated");
//   };

//   // Handle Add Payment
//   const handleAddPayment = () => {
//     setEditingPayment(null);
//     setShowPaymentModal(true);
//   };

//   // Handle Edit Payment
//   const handleEditPayment = (payment) => {
//     setEditingPayment(payment);
//     setShowPaymentModal(true);
//   };

//   // Handle Save Payment
//   const handleSavePayment = async (paymentData) => {
//     try {
//       if (editingPayment) {
//         // Update existing payment
//         await dispatch(updatePayment({
//           id: editingPayment._id,
//           data: {
//             amount: Number(paymentData.amount),
//             type: paymentData.type || 'advance',
//             method: paymentData.method || 'cash',
//             referenceNumber: paymentData.referenceNumber || '',
//             paymentDate: paymentData.paymentDate || paymentData.date || new Date().toISOString().split('T')[0],
//             paymentTime: paymentData.paymentTime || paymentData.time || new Date().toLocaleTimeString('en-US', { hour12: false }),
//             notes: paymentData.notes || ''
//           }
//         })).unwrap();
//         showToast.success("Payment updated successfully");
//       } else {
//         // Create new payment
//         await dispatch(createPayment({
//           order: id,
//           customer: currentOrder?.customer?._id,
//           amount: Number(paymentData.amount),
//           type: paymentData.type || 'advance',
//           method: paymentData.method || 'cash',
//           referenceNumber: paymentData.referenceNumber || '',
//           paymentDate: paymentData.paymentDate || paymentData.date || new Date().toISOString().split('T')[0],
//           paymentTime: paymentData.paymentTime || paymentData.time || new Date().toLocaleTimeString('en-US', { hour12: false }),
//           notes: paymentData.notes || ''
//         })).unwrap();
//         showToast.success("Payment added successfully");
//       }
      
//       setShowPaymentModal(false);
//       setEditingPayment(null);
//       dispatch(fetchOrderPayments(id));
//       dispatch(fetchOrderById(id));
//     } catch (error) {
//       console.error("Payment error:", error);
//       showToast.error(error.message || "Failed to save payment");
//     }
//   };

//   // Handle Delete Payment
//   const handleDeletePayment = async (paymentId) => {
//     if (!canEdit) {
//       showToast.error("You don't have permission to delete payments");
//       return;
//     }

//     if (window.confirm("Are you sure you want to delete this payment?")) {
//       try {
//         await dispatch(deletePayment(paymentId)).unwrap();
//         showToast.success("Payment deleted successfully");
//         dispatch(fetchOrderPayments(id));
//         dispatch(fetchOrderById(id));
//       } catch (error) {
//         showToast.error("Failed to delete payment");
//       }
//     }
//   };

//   // ✅ UPDATED: Handle Status Change with ready-to-delivery
//   const handleStatusChange = async (newStatus) => {
//     if (!canEdit) {
//       showToast.error("You don't have permission to update status");
//       return;
//     }

//     try {
//       await dispatch(updateOrderStatusThunk({ id, status: newStatus })).unwrap();
      
//       // Show different messages based on status
//       const statusMessages = {
//         'ready-to-delivery': 'Order marked as ready for delivery',
//         'delivered': 'Order marked as delivered',
//         'cancelled': 'Order cancelled',
//         'in-progress': 'Order status updated to in progress',
//         'confirmed': 'Order confirmed',
//         'draft': 'Order moved to draft'
//       };
      
//       showToast.success(statusMessages[newStatus] || `Status updated to ${newStatus}`);
//       setFormData(prev => ({ ...prev, status: newStatus }));
//       dispatch(fetchOrderById(id));
//     } catch (error) {
//       showToast.error("Failed to update status");
//     }
//   };

//   // ✅ NEW: Handle Mark as Ready to Delivery
//   const handleMarkReadyToDelivery = () => {
//     if (formData.status === 'in-progress') {
//       handleStatusChange('ready-to-delivery');
//     } else {
//       showToast.error("Order must be in progress to mark as ready for delivery");
//     }
//   };

//   // ✅ NEW: Handle Mark as Delivered
//   const handleMarkDelivered = () => {
//     if (formData.status === 'ready-to-delivery') {
//       handleStatusChange('delivered');
//     } else {
//       showToast.error("Order must be ready for delivery first");
//     }
//   };

//   // Handle Submit
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);

//     if (!formData.customer) {
//       showToast.error("Please select a customer");
//       setIsSubmitting(false);
//       return;
//     }

//     if (!formData.deliveryDate) {
//       showToast.error("Please select delivery date");
//       setIsSubmitting(false);
//       return;
//     }

//     try {
//       const orderUpdateData = {
//         deliveryDate: formData.deliveryDate,
//         specialNotes: formData.specialNotes,
//         advancePayment: {
//           amount: Number(formData.advancePayment.amount) || 0,
//           method: formData.advancePayment.method,
//         },
//         status: formData.status,
//         priceSummary: {
//           totalMin: priceSummary.min,
//           totalMax: priceSummary.max,
//         },
//         balanceAmount: balanceAmount,
//       };

//       console.log("📤 Updating order with data:", orderUpdateData);

//       await dispatch(updateExistingOrder({ 
//         id, 
//         data: orderUpdateData 
//       })).unwrap();
      
//       showToast.success("Order updated successfully");
//       navigate(`${basePath}/orders/${id}`);
//     } catch (error) {
//       console.error("❌ Update error:", error);
//       showToast.error(error.message || "Failed to update order");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'Not set';
//     return new Date(dateString).toLocaleDateString('en-IN', {
//       day: '2-digit',
//       month: '2-digit',
//       year: 'numeric'
//     });
//   };

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

//   if (!canEdit) {
//     return (
//       <div className="text-center py-16">
//         <h2 className="text-2xl font-bold text-slate-800">Access Denied</h2>
//         <p className="text-slate-500 mt-2">You don't have permission to edit orders</p>
//         <button
//           onClick={() => navigate(`${basePath}/orders/${id}`)}
//           className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg"
//         >
//           Go Back
//         </button>
//       </div>
//     );
//   }

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
//             onClick={() => navigate(`${basePath}/orders`)}
//             className="bg-slate-200 text-slate-700 px-6 py-2 rounded-lg hover:bg-slate-300"
//           >
//             Back to Orders
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (!currentOrder) {
//     return (
//       <div className="text-center py-16">
//         <Package size={64} className="mx-auto text-slate-300 mb-4" />
//         <h2 className="text-2xl font-bold text-slate-800">Order Not Found</h2>
//         <p className="text-slate-500 mb-4">Order ID: {id}</p>
//         <p className="text-sm text-slate-400 mb-4">Attempts: {fetchAttempts}</p>
//         <button
//           onClick={() => navigate(`${basePath}/orders`)}
//           className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
//         >
//           Back to Orders
//         </button>
//       </div>
//     );
//   }

//   const minimalCustomer = currentOrder?.customer;

//   return (
//     <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 p-6">
//       {/* Add Payment Modal */}
//       <AddPaymentModal
//         isOpen={showPaymentModal}
//         onClose={() => {
//           setShowPaymentModal(false);
//           setEditingPayment(null);
//         }}
//         onSave={handleSavePayment}
//         orderTotal={totalAmount}
//         orderId={id}
//         customerId={currentOrder?.customer?._id}
//         initialData={editingPayment}
//         title={editingPayment ? "Edit Payment" : "Add Payment to Order"}
//       />

//       {/* Debug Panel */}
//       {process.env.NODE_ENV === 'development' && (
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
//             <div>Garments: {garments?.length || 0}</div>
//             <div>Payments: {payments?.length || 0}</div>
//             <div>Customers: {customers?.length || 0}</div>
//             <div>Total Paid: {formatCurrency(paymentStats.totalPaid)}</div>
//             <div>Balance: {formatCurrency(balanceAmount)}</div>
//             <div>Can Edit: {canEdit ? 'Yes' : 'No'}</div>
//             <div>Role: {user?.role}</div>
//             <div>Loading: {loading ? 'Yes' : 'No'}</div>
//             <div>Fetch Attempts: {fetchAttempts}</div>
//             <div className="text-yellow-400">Status: {formData.status}</div>
//           </div>
//         </div>
//       )}

//       {/* Header */}
//       <div className="flex items-center gap-4">
//         <button
//           onClick={() => navigate(`${basePath}/orders/${id}`)}
//           className="p-2 hover:bg-slate-100 rounded-xl transition-all"
//         >
//           <ArrowLeft size={20} className="text-slate-600" />
//         </button>
//         <div>
//           <h1 className="text-3xl font-black text-slate-800 tracking-tight">Edit Order</h1>
//           <p className="text-slate-500">Order ID: {currentOrder?.orderId}</p>
//         </div>
//       </div>

//       {/* Status Bar - UPDATED with ready-to-delivery */}
//       <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <Clock size={20} className="text-blue-600" />
//             <span className="font-bold text-slate-700">Current Status:</span>
//             <select
//               value={formData.status}
//               onChange={(e) => handleStatusChange(e.target.value)}
//               className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
//             >
//               <option value="draft">Draft</option>
//               <option value="confirmed">Confirmed</option>
//               <option value="in-progress">In Progress</option>
//               <option value="ready-to-delivery">Ready to Delivery</option>
//               <option value="delivered">Delivered</option>
//               <option value="cancelled">Cancelled</option>
//             </select>
//           </div>
          
//           {/* ✅ Quick Action Buttons */}
//           <div className="flex items-center gap-2">
//             {formData.status === 'in-progress' && (
//               <button
//                 type="button"
//                 onClick={handleMarkReadyToDelivery}
//                 className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm"
//               >
//                 <Truck size={16} />
//                 Mark Ready
//               </button>
//             )}
            
//             {formData.status === 'ready-to-delivery' && (
//               <button
//                 type="button"
//                 onClick={handleMarkDelivered}
//                 className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm"
//               >
//                 <Check size={16} />
//                 Mark Delivered
//               </button>
//             )}
            
//             <div className="text-sm text-slate-400">
//               Last updated: {currentOrder?.updatedAt ? new Date(currentOrder.updatedAt).toLocaleString() : 'N/A'}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Form */}
//       <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Left Column */}
//         <div className="lg:col-span-2 space-y-6">
//           {/* Customer Details */}
//           <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
//             <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
//               <User size={20} className="text-blue-600" />
//               Customer Details
//             </h2>

//             {minimalCustomer ? (
//               <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
//                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//                   <div className="space-y-2">
//                     <div>
//                       <p className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-1">
//                         Customer Name
//                       </p>
//                       <h3 className="text-xl font-bold text-slate-800">
//                         {customerName || 'Customer'}
//                       </h3>
//                     </div>
                    
//                     <div className="flex items-center gap-2 text-slate-600">
//                       <Phone size={16} className="text-blue-500" />
//                       <p className="text-base font-medium">
//                         {minimalCustomer.phone || 'No phone'}
//                       </p>
//                     </div>
//                   </div>

//                   <div className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold inline-flex items-center gap-2 self-start">
//                     <span>🆔</span>
//                     {minimalCustomer.customerId || 'N/A'}
//                   </div>
//                 </div>

//                 <p className="text-xs text-slate-400 mt-4 text-center border-t border-blue-200 pt-3">
//                   Customer cannot be changed after order creation
//                 </p>
//               </div>
//             ) : (
//               <div className="bg-slate-50 rounded-xl p-8 text-center">
//                 <User size={48} className="mx-auto text-slate-300 mb-3" />
//                 <p className="text-slate-500">No customer information available</p>
//               </div>
//             )}
//           </div>

//           {/* Delivery Information */}
//           <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
//             <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
//               <Calendar size={20} className="text-blue-600" />
//               Delivery Information
//             </h2>
            
//             <div>
//               <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//                 Expected Delivery Date <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <Calendar className="absolute left-4 top-3.5 text-slate-400" size={18} />
//                 <input
//                   type="date"
//                   value={formData.deliveryDate}
//                   onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
//                   min={new Date().toISOString().split("T")[0]}
//                   className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
//                   required
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Order Details */}
//           <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
//             <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
//               <Package size={20} className="text-blue-600" />
//               Order Details
//             </h2>

//             {/* Special Notes */}
//             <div>
//               <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//                 Special Notes
//               </label>
//               <textarea
//                 value={formData.specialNotes}
//                 onChange={(e) => setFormData({ ...formData, specialNotes: e.target.value })}
//                 rows="3"
//                 placeholder="Any special instructions for this order..."
//                 className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
//               />
//             </div>
//           </div>

//           {/* Garments Section */}
//           <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
//                 <Package size={20} className="text-blue-600" />
//                 Garments ({garments?.length || 0})
//               </h2>
//               <button
//                 type="button"
//                 onClick={handleAddGarment}
//                 className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2"
//               >
//                 <Plus size={16} />
//                 Add Garment
//               </button>
//             </div>

//             {garments?.length === 0 ? (
//               <div className="text-center py-8 bg-slate-50 rounded-xl">
//                 <Package size={40} className="mx-auto text-slate-300 mb-2" />
//                 <p className="text-slate-500">No garments in this order</p>
//               </div>
//             ) : (
//               <div className="space-y-3">
//                 {garments.map((garment) => (
//                   <div
//                     key={garment._id}
//                     className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:shadow-md transition-all"
//                   >
//                     <div className="flex items-start justify-between">
//                       <div className="flex-1">
//                         <div className="flex items-center gap-3 mb-2">
//                           <h3 className="font-black text-slate-800">{garment.name}</h3>
//                           <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
//                             {garment.garmentId}
//                           </span>
//                           <span className={`text-xs px-2 py-1 rounded-full ${
//                             garment.priority === 'urgent' ? 'bg-red-100 text-red-600' :
//                             garment.priority === 'high' ? 'bg-orange-100 text-orange-600' :
//                             'bg-blue-100 text-blue-600'
//                           }`}>
//                             {garment.priority}
//                           </span>
//                         </div>
                        
//                         <div className="grid grid-cols-3 gap-4 text-sm mb-3">
//                           <div>
//                             <p className="text-xs text-slate-400">Price</p>
//                             <p className="font-bold text-blue-600">
//                               ₹{garment.priceRange?.min} - ₹{garment.priceRange?.max}
//                             </p>
//                           </div>
//                           <div>
//                             <p className="text-xs text-slate-400">Delivery</p>
//                             <p className="font-medium text-purple-600">
//                               {formatDate(garment.estimatedDelivery)}
//                             </p>
//                           </div>
//                           <div>
//                             <p className="text-xs text-slate-400">Status</p>
//                             <p className="capitalize font-medium">{garment.status}</p>
//                           </div>
//                         </div>

//                         {/* Images Section */}
//                         {(garment.referenceImages?.length > 0 || garment.customerImages?.length > 0) && (
//                           <div className="mt-3 border-t border-slate-200 pt-3">
//                             <button
//                               type="button"
//                               onClick={() => setExpandedGarment(expandedGarment === garment._id ? null : garment._id)}
//                               className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
//                             >
//                               <ImageIcon size={16} />
//                               {expandedGarment === garment._id ? 'Hide Images' : 'Show Images'}
//                             </button>
                            
//                             {expandedGarment === garment._id && (
//                               <div className="mt-3 space-y-3">
//                                 {garment.referenceImages?.length > 0 && (
//                                   <div>
//                                     <p className="text-xs font-bold text-slate-500 mb-2">Reference Images</p>
//                                     <div className="grid grid-cols-3 gap-2">
//                                       {garment.referenceImages.map((img, idx) => (
//                                         <div key={idx} className="relative group">
//                                           <img
//                                             src={img.url || img}
//                                             alt={`Reference ${idx + 1}`}
//                                             className="w-full h-24 object-cover rounded-lg border border-slate-200"
//                                             onError={(e) => {
//                                               e.target.onerror = null;
//                                               e.target.src = 'https://via.placeholder.com/150?text=Image+Not+Found';
//                                             }}
//                                           />
//                                         </div>
//                                       ))}
//                                     </div>
//                                   </div>
//                                 )}
                                
//                                 {garment.customerImages?.length > 0 && (
//                                   <div>
//                                     <p className="text-xs font-bold text-slate-500 mb-2">Customer Images</p>
//                                     <div className="grid grid-cols-3 gap-2">
//                                       {garment.customerImages.map((img, idx) => (
//                                         <div key={idx} className="relative group">
//                                           <img
//                                             src={img.url || img}
//                                             alt={`Customer ${idx + 1}`}
//                                             className="w-full h-24 object-cover rounded-lg border border-slate-200"
//                                             onError={(e) => {
//                                               e.target.onerror = null;
//                                               e.target.src = 'https://via.placeholder.com/150?text=Image+Not+Found';
//                                             }}
//                                           />
//                                         </div>
//                                       ))}
//                                     </div>
//                                   </div>
//                                 )}
//                               </div>
//                             )}
//                           </div>
//                         )}
//                       </div>
                      
//                       <div className="flex gap-2 ml-4">
//                         <button
//                           type="button"
//                           onClick={() => handleEditGarment(garment)}
//                           className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
//                           title="Edit"
//                         >
//                           Edit
//                         </button>
//                         <button
//                           type="button"
//                           onClick={() => handleDeleteGarment(garment._id)}
//                           className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
//                           title="Delete"
//                         >
//                           <Trash2 size={16} />
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Right Column - Payment Summary */}
//         <div className="lg:col-span-1">
//           <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-6">
//             <h2 className="text-lg font-black text-slate-800 mb-4">Payment Summary</h2>
            
//             <div className="space-y-4">
//               {/* Total Amount */}
//               <div className="bg-blue-50 p-4 rounded-xl">
//                 <p className="text-xs text-blue-600 font-black uppercase mb-1">Total Amount</p>
//                 <p className="text-2xl font-black text-blue-700">
//                   ₹{priceSummary.min} - ₹{priceSummary.max}
//                 </p>
//               </div>

//               {/* Payment Statistics Cards */}
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

//               {/* Payment Type Breakdown */}
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

//               {/* Payment Method Breakdown */}
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

//               {/* Garment Delivery Range */}
//               {garmentDeliveryRange && (
//                 <div className="bg-purple-50 p-4 rounded-xl">
//                   <p className="text-xs text-purple-600 font-black uppercase mb-1">
//                     Garment Delivery Range
//                   </p>
//                   <p className="text-sm font-bold text-purple-700">
//                     {formatDate(garmentDeliveryRange.min)} - {formatDate(garmentDeliveryRange.max)}
//                   </p>
//                   <p className="text-xs text-purple-500 mt-1">
//                     Order delivery: {formatDate(formData.deliveryDate)}
//                   </p>
//                 </div>
//               )}

//               {/* Balance Amount */}
//               <div className="bg-orange-50 p-4 rounded-xl mt-4">
//                 <p className="text-xs text-orange-600 font-black uppercase mb-1">Balance Amount</p>
//                 <p className="text-xl font-black text-orange-700">
//                   {formatCurrency(balanceAmount)}
//                 </p>
//                 {balanceAmount < 0 && (
//                   <p className="text-xs text-green-600 mt-1">(Overpaid by {formatCurrency(Math.abs(balanceAmount))})</p>
//                 )}
//                 {balanceAmount > 0 && (
//                   <p className="text-xs text-orange-600 mt-1">Pending payment</p>
//                 )}
//               </div>

//               {/* Add Payment Button */}
//               {canEdit && (
//                 <button
//                   type="button"
//                   onClick={handleAddPayment}
//                   className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
//                 >
//                   <Wallet size={18} />
//                   Add Payment
//                 </button>
//               )}

//               {/* Payment History Toggle */}
//               {payments?.length > 0 && (
//                 <button
//                   type="button"
//                   onClick={() => setShowPaymentHistory(!showPaymentHistory)}
//                   className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all text-sm"
//                 >
//                   <Receipt size={16} />
//                   {showPaymentHistory ? 'Hide' : 'Show'} Payment History ({payments.length})
//                 </button>
//               )}

//               {/* Payment History List */}
//               {showPaymentHistory && payments?.length > 0 && (
//                 <div className="bg-slate-50 rounded-xl p-3 max-h-60 overflow-y-auto">
//                   <div className="space-y-2">
//                     {payments.map((payment, index) => (
//                       <div key={payment._id || index} className="bg-white p-3 rounded-lg border border-slate-200">
//                         <div className="flex items-start justify-between">
//                           <div>
//                             <div className="flex items-center gap-2 mb-1">
//                               <span className="font-bold text-green-600">{formatCurrency(payment.amount)}</span>
//                               <span className={`text-xs px-2 py-0.5 rounded-full ${
//                                 payment.type === 'full' ? 'bg-green-100 text-green-700' :
//                                 payment.type === 'advance' ? 'bg-blue-100 text-blue-700' :
//                                 payment.type === 'partial' ? 'bg-orange-100 text-orange-700' :
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
//                             {payment.notes && (
//                               <p className="text-xs text-slate-400 mt-1 italic">{payment.notes}</p>
//                             )}
//                           </div>
//                           {canEdit && (
//                             <div className="flex gap-1">
//                               <button
//                                 type="button"
//                                 onClick={() => handleEditPayment(payment)}
//                                 className="text-blue-500 hover:text-blue-700 text-xs font-bold"
//                                 title="Edit"
//                               >
//                                 Edit
//                               </button>
//                               <button
//                                 type="button"
//                                 onClick={() => handleDeletePayment(payment._id)}
//                                 className="text-red-500 hover:text-red-700"
//                                 title="Delete"
//                               >
//                                 <X size={14} />
//                               </button>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Submit Button */}
//               <button
//                 type="submit"
//                 disabled={isSubmitting}
//                 className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-xl font-black uppercase tracking-wider shadow-lg shadow-blue-500/30 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 mt-6 ${
//                   isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
//                 }`}
//               >
//                 {isSubmitting ? (
//                   <>
//                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                     Updating...
//                   </>
//                 ) : (
//                   <>
//                     <Save size={18} />
//                     Update Order
//                   </>
//                 )}
//               </button>

//               <button
//                 type="button"
//                 onClick={() => navigate(`${basePath}/orders/${id}`)}
//                 className="w-full px-6 py-4 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-black uppercase tracking-wider transition-all"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       </form>

//       {/* Garment Form Modal */}
//       {showGarmentModal && (
//         <GarmentForm
//           onClose={() => setShowGarmentModal(false)}
//           onSave={handleSaveGarment}
//           editingGarment={editingGarment}
//           customerId={formData.customer} 
//         />
//       )}
//     </div>
//   );
// }





import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Save,
  User,
  Calendar,
  CreditCard,
  IndianRupee,
  Package,
  ChevronDown,
  Plus,
  Trash2,
  Image as ImageIcon,
  Phone,
  Wallet,
  Banknote,
  Smartphone,
  Landmark,
  Clock,
  X,
  Receipt,
  TrendingUp,
  Truck,
  Check,
  Menu
} from "lucide-react";

// ✅ CORRECTED IMPORTS - Using correct slice names from Redux state
import { 
  fetchOrderById, 
  updateExistingOrder,
  updateOrderStatusThunk,
  clearCurrentOrder
} from "../../../features/order/orderSlice";

import { 
  fetchGarmentsByOrder, 
  deleteGarment 
} from "../../../features/garment/garmentSlice";

import {
  fetchOrderPayments,
  createPayment,
  updatePayment,
  deletePayment,
  clearPayments
} from "../../../features/payment/paymentSlice.js";

import { fetchAllCustomers } from "../../../features/customer/customerSlice";

import GarmentForm from "../garment/GarmentForm";
import AddPaymentModal from "../../../components/AddPaymentModal";
import showToast from "../../../utils/toast";
import "./CalendarStyles.css"

export default function EditOrder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // ✅ DEBUG: Log component mount
  console.log("🔍 EditOrder mounted with ID:", id);
  console.log("📍 Current URL:", window.location.href);
  
  // ✅ CORRECTED STATE SELECTORS - Using state.order (singular) as shown in Redux
  const { currentOrder, loading } = useSelector((state) => {
    console.log("🔍 Order state (state.order):", state.order);
    return {
      currentOrder: state.order?.currentOrder || null,
      loading: state.order?.loading || false
    };
  });
  
  // Garments - check both singular and plural
  const garments = useSelector((state) => {
    const garmentsData = state.garment?.garments || state.garments?.garments || [];
    console.log("🔍 Garments state:", { 
      fromGarment: state.garment?.garments,
      fromGarments: state.garments?.garments,
      result: garmentsData 
    });
    return garmentsData;
  });
  
  // Payments - check both singular and plural
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
  
  // Customers - check both singular and plural
  const customers = useSelector((state) => {
    const customersData = state.customer?.customers || state.customers?.customers || [];
    console.log("🔍 Customers state:", { 
      fromCustomer: state.customer?.customers,
      fromCustomers: state.customers?.customers,
      result: customersData 
    });
    return customersData;
  });
  
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    customer: "",
    deliveryDate: "",
    specialNotes: "",
    advancePayment: {
      amount: 0,
      method: "cash",
    },
    status: "draft",
  });

  const [showGarmentModal, setShowGarmentModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [editingGarment, setEditingGarment] = useState(null);
  const [expandedGarment, setExpandedGarment] = useState(null);
  const [customerName, setCustomerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dataLoadTimeout, setDataLoadTimeout] = useState(false);
  const [fetchAttempts, setFetchAttempts] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(false);

  const isAdmin = user?.role === "ADMIN";
  const isStoreKeeper = user?.role === "STORE_KEEPER";
  const canEdit = isAdmin || isStoreKeeper;

  // Get base path based on user role
  const basePath = user?.role === "ADMIN" ? "/admin" : 
                   user?.role === "STORE_KEEPER" ? "/storekeeper" : 
                   "/cuttingmaster";

  // ✅ Set timeout for loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setDataLoadTimeout(true);
      }
    }, 8000);
    
    return () => clearTimeout(timer);
  }, [loading]);

  // ✅ Fetch all data on mount
  useEffect(() => {
    if (id) {
      console.log("🔍 Fetching order details for ID:", id, "Attempt:", fetchAttempts + 1);
      
      const fetchData = async () => {
        try {
          setFetchAttempts(prev => prev + 1);
          
          console.log("📦 Fetching order by ID...");
          await dispatch(fetchOrderById(id)).unwrap();
          
          console.log("👕 Fetching garments...");
          await dispatch(fetchGarmentsByOrder(id)).unwrap();
          
          console.log("💰 Fetching payments...");
          await dispatch(fetchOrderPayments(id)).unwrap();
          
          console.log("👥 Fetching customers...");
          await dispatch(fetchAllCustomers()).unwrap();
          
          console.log("🎉 All data fetched successfully!");
          
        } catch (error) {
          console.error("❌ Error fetching data:", error);
          showToast.error(error?.message || "Failed to load order details");
        }
      };
      
      fetchData();
    }

    // Cleanup on unmount
    return () => {
      console.log("🧹 Cleaning up edit order");
      dispatch(clearCurrentOrder());
      dispatch(clearPayments());
    };
  }, [dispatch, id]);

  // ✅ Log state changes
  useEffect(() => {
    console.log("📊 Current state:", {
      currentOrder: currentOrder?._id,
      garmentsCount: garments?.length,
      paymentsCount: payments?.length,
      customersCount: customers?.length,
      loading,
      fetchAttempts
    });
  }, [currentOrder, garments, payments, customers, loading, fetchAttempts]);

  // Find customer name from customers array
  useEffect(() => {
    if (currentOrder?.customer && customers?.length > 0) {
      const customerId = currentOrder.customer._id || currentOrder.customer;
      const fullCustomer = customers.find(c => c._id === customerId);
      
      if (fullCustomer) {
        let name = '';
        if (fullCustomer.firstName || fullCustomer.lastName) {
          const firstName = fullCustomer.firstName || '';
          const lastName = fullCustomer.lastName || '';
          name = `${firstName} ${lastName}`.trim();
        } else if (fullCustomer.name) {
          name = fullCustomer.name;
        }
        
        if (fullCustomer.salutation && name) {
          name = `${fullCustomer.salutation} ${name}`;
        }
        
        setCustomerName(name || 'Customer');
        console.log("👤 Customer name set:", name);
      }
    }
  }, [currentOrder, customers]);

  // Set form data when order loads
  useEffect(() => {
    if (currentOrder) {
      console.log("📝 Setting form data from order:", currentOrder);
      setFormData({
        customer: currentOrder.customer?._id || "",
        deliveryDate: currentOrder.deliveryDate?.split("T")[0] || "",
        specialNotes: currentOrder.specialNotes || "",
        advancePayment: currentOrder.advancePayment || { amount: 0, method: "cash" },
        status: currentOrder.status || "draft",
      });
    }
  }, [currentOrder]);

  // Calculate payment statistics
  const paymentStats = {
    totalPaid: payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
    totalPayments: payments?.length || 0,
    lastPayment: payments?.length > 0 ? payments[payments.length - 1] : null,
    advanceTotal: payments?.filter(p => p.type === 'advance').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
    fullTotal: payments?.filter(p => p.type === 'full').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
    partialTotal: payments?.filter(p => p.type === 'partial').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
    extraTotal: payments?.filter(p => p.type === 'extra').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
    byMethod: {
      cash: payments?.filter(p => p.method === 'cash').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
      upi: payments?.filter(p => p.method === 'upi').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
      'bank-transfer': payments?.filter(p => p.method === 'bank-transfer').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
      card: payments?.filter(p => p.method === 'card').reduce((sum, p) => sum + (p.amount || 0), 0) || 0
    }
  };

  const priceSummary = garments?.reduce(
    (acc, garment) => ({
      min: acc.min + (garment.priceRange?.min || 0),
      max: acc.max + (garment.priceRange?.max || 0),
    }),
    { min: 0, max: 0 }
  ) || { min: 0, max: 0 };

  const totalAmount = priceSummary.max || 0;
  const balanceAmount = totalAmount - paymentStats.totalPaid;

  // Calculate garment delivery range
  const garmentDeliveryRange = garments?.length > 0 ? {
    min: new Date(Math.min(...garments.map(g => new Date(g.estimatedDelivery || formData.deliveryDate)))),
    max: new Date(Math.max(...garments.map(g => new Date(g.estimatedDelivery || formData.deliveryDate))))
  } : null;

  // Payment Method Icon Component
  const PaymentMethodIcon = ({ method }) => {
    switch(method) {
      case 'cash':
        return <Banknote size={14} className="text-green-600" />;
      case 'upi':
        return <Smartphone size={14} className="text-blue-600" />;
      case 'bank-transfer':
        return <Landmark size={14} className="text-purple-600" />;
      case 'card':
        return <CreditCard size={14} className="text-orange-600" />;
      default:
        return <Wallet size={14} className="text-slate-600" />;
    }
  };

  const handleAddGarment = () => {
    setEditingGarment(null);
    setShowGarmentModal(true);
  };

  const handleEditGarment = (garment) => {
    setEditingGarment(garment);
    setShowGarmentModal(true);
  };

  const handleDeleteGarment = async (garmentId) => {
    if (window.confirm("Are you sure you want to remove this garment?")) {
      try {
        await dispatch(deleteGarment(garmentId)).unwrap();
        showToast.success("Garment removed");
        dispatch(fetchGarmentsByOrder(id));
      } catch (error) {
        showToast.error("Failed to remove garment");
      }
    }
  };

  const handleSaveGarment = () => {
    setShowGarmentModal(false);
    dispatch(fetchGarmentsByOrder(id));
    showToast.success("Garment updated");
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
  const handleSavePayment = async (paymentData) => {
    try {
      if (editingPayment) {
        // Update existing payment
        await dispatch(updatePayment({
          id: editingPayment._id,
          data: {
            amount: Number(paymentData.amount),
            type: paymentData.type || 'advance',
            method: paymentData.method || 'cash',
            referenceNumber: paymentData.referenceNumber || '',
            paymentDate: paymentData.paymentDate || paymentData.date || new Date().toISOString().split('T')[0],
            paymentTime: paymentData.paymentTime || paymentData.time || new Date().toLocaleTimeString('en-US', { hour12: false }),
            notes: paymentData.notes || ''
          }
        })).unwrap();
        showToast.success("Payment updated successfully");
      } else {
        // Create new payment
        await dispatch(createPayment({
          order: id,
          customer: currentOrder?.customer?._id,
          amount: Number(paymentData.amount),
          type: paymentData.type || 'advance',
          method: paymentData.method || 'cash',
          referenceNumber: paymentData.referenceNumber || '',
          paymentDate: paymentData.paymentDate || paymentData.date || new Date().toISOString().split('T')[0],
          paymentTime: paymentData.paymentTime || paymentData.time || new Date().toLocaleTimeString('en-US', { hour12: false }),
          notes: paymentData.notes || ''
        })).unwrap();
        showToast.success("Payment added successfully");
      }
      
      setShowPaymentModal(false);
      setEditingPayment(null);
      dispatch(fetchOrderPayments(id));
      dispatch(fetchOrderById(id));
    } catch (error) {
      console.error("Payment error:", error);
      showToast.error(error.message || "Failed to save payment");
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
        dispatch(fetchOrderPayments(id));
        dispatch(fetchOrderById(id));
      } catch (error) {
        showToast.error("Failed to delete payment");
      }
    }
  };

  // ✅ UPDATED: Handle Status Change with ready-to-delivery
  const handleStatusChange = async (newStatus) => {
    if (!canEdit) {
      showToast.error("You don't have permission to update status");
      return;
    }

    try {
      await dispatch(updateOrderStatusThunk({ id, status: newStatus })).unwrap();
      
      // Show different messages based on status
      const statusMessages = {
        'ready-to-delivery': 'Order marked as ready for delivery',
        'delivered': 'Order marked as delivered',
        'cancelled': 'Order cancelled',
        'in-progress': 'Order status updated to in progress',
        'confirmed': 'Order confirmed',
        'draft': 'Order moved to draft'
      };
      
      showToast.success(statusMessages[newStatus] || `Status updated to ${newStatus}`);
      setFormData(prev => ({ ...prev, status: newStatus }));
      dispatch(fetchOrderById(id));
    } catch (error) {
      showToast.error("Failed to update status");
    }
  };

  // ✅ NEW: Handle Mark as Ready to Delivery
  const handleMarkReadyToDelivery = () => {
    if (formData.status === 'in-progress') {
      handleStatusChange('ready-to-delivery');
    } else {
      showToast.error("Order must be in progress to mark as ready for delivery");
    }
  };

  // ✅ NEW: Handle Mark as Delivered
  const handleMarkDelivered = () => {
    if (formData.status === 'ready-to-delivery') {
      handleStatusChange('delivered');
    } else {
      showToast.error("Order must be ready for delivery first");
    }
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.customer) {
      showToast.error("Please select a customer");
      setIsSubmitting(false);
      return;
    }

    if (!formData.deliveryDate) {
      showToast.error("Please select delivery date");
      setIsSubmitting(false);
      return;
    }

    try {
      const orderUpdateData = {
        deliveryDate: formData.deliveryDate,
        specialNotes: formData.specialNotes,
        advancePayment: {
          amount: Number(formData.advancePayment.amount) || 0,
          method: formData.advancePayment.method,
        },
        status: formData.status,
        priceSummary: {
          totalMin: priceSummary.min,
          totalMax: priceSummary.max,
        },
        balanceAmount: balanceAmount,
      };

      console.log("📤 Updating order with data:", orderUpdateData);

      await dispatch(updateExistingOrder({ 
        id, 
        data: orderUpdateData 
      })).unwrap();
      
      showToast.success("Order updated successfully");
      navigate(`${basePath}/orders/${id}`);
    } catch (error) {
      console.error("❌ Update error:", error);
      showToast.error(error.message || "Failed to update order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

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

  if (!canEdit) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-md w-full text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Access Denied</h2>
          <p className="text-sm sm:text-base text-slate-500 mt-2">You don't have permission to edit orders</p>
          <button
            onClick={() => navigate(`${basePath}/orders/${id}`)}
            className="mt-4 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-bold text-sm"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

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
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-bold text-sm"
            >
              Retry
            </button>
            <button
              onClick={() => navigate(`${basePath}/orders`)}
              className="bg-slate-200 text-slate-700 px-6 py-2.5 rounded-lg hover:bg-slate-300 font-bold text-sm"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-md w-full text-center">
          <Package size={48} className="mx-auto text-slate-300 mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Order Not Found</h2>
          <p className="text-sm sm:text-base text-slate-500 mb-2">Order ID: {id}</p>
          <p className="text-xs sm:text-sm text-slate-400 mb-4">Attempts: {fetchAttempts}</p>
          <button
            onClick={() => navigate(`${basePath}/orders`)}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-bold text-sm"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const minimalCustomer = currentOrder?.customer;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate(`${basePath}/orders/${id}`)}
            className="flex items-center gap-1 text-slate-600"
          >
            <ArrowLeft size={18} />
            <span className="font-bold text-sm">Back</span>
          </button>
          <h1 className="text-base font-black text-slate-800 truncate max-w-[150px]">
            Edit Order
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
                <p className="text-xs font-bold text-slate-400 uppercase">Quick Actions</p>
              </div>
              
              <button
                onClick={() => {
                  handleAddGarment();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-bold text-sm"
              >
                <Plus size={16} />
                Add Garment
              </button>
              
              <button
                onClick={() => {
                  handleAddPayment();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg font-bold text-sm"
              >
                <Wallet size={16} />
                Add Payment
              </button>
              
              {formData.status === 'in-progress' && (
                <button
                  onClick={() => {
                    handleMarkReadyToDelivery();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg font-bold text-sm"
                >
                  <Truck size={16} />
                  Mark Ready for Delivery
                </button>
              )}
              
              {formData.status === 'ready-to-delivery' && (
                <button
                  onClick={() => {
                    handleMarkDelivered();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg font-bold text-sm"
                >
                  <Check size={16} />
                  Mark Delivered
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Payment Modal */}
      <AddPaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setEditingPayment(null);
        }}
        onSave={handleSavePayment}
        orderTotal={totalAmount}
        existingPayments={payments}
        balanceAmount={balanceAmount}
        orderId={id}
        customerId={currentOrder?.customer?._id}
        initialData={editingPayment}
        title={editingPayment ? "Edit Payment" : "Add Payment to Order"}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
        {/* Desktop Header - Hidden on Mobile */}
        <div className="hidden lg:flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(`${basePath}/orders/${id}`)}
            className="p-2 hover:bg-slate-100 rounded-xl transition-all"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">Edit Order</h1>
            <p className="text-sm lg:text-base text-slate-500">Order ID: {currentOrder?.orderId}</p>
          </div>
        </div>

        {/* Status Bar - Responsive */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <Clock size={16} className="text-blue-600 flex-shrink-0" />
              <span className="font-bold text-xs sm:text-sm text-slate-700">Current Status:</span>
              <select
                value={formData.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-xs sm:text-sm"
              >
                <option value="draft">Draft</option>
                <option value="confirmed">Confirmed</option>
                <option value="in-progress">In Progress</option>
                <option value="ready-to-delivery">Ready to Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            {/* Quick Action Buttons - Hidden on Mobile (shown in mobile menu) */}
            <div className="hidden sm:flex items-center gap-2">
              {formData.status === 'in-progress' && (
                <button
                  type="button"
                  onClick={handleMarkReadyToDelivery}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-xs sm:text-sm"
                >
                  <Truck size={14} />
                  <span className="hidden sm:inline">Mark Ready</span>
                </button>
              )}
              
              {formData.status === 'ready-to-delivery' && (
                <button
                  type="button"
                  onClick={handleMarkDelivered}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-xs sm:text-sm"
                >
                  <Check size={14} />
                  <span className="hidden sm:inline">Mark Delivered</span>
                </button>
              )}
              
              <div className="text-xs sm:text-sm text-slate-400">
                Updated: {currentOrder?.updatedAt ? new Date(currentOrder.updatedAt).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Customer Details */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-black text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
                <User size={18} className="text-blue-600" />
                Customer Details
              </h2>

              {minimalCustomer ? (
                <div className="bg-blue-50 rounded-lg sm:rounded-xl p-4 sm:p-5 border border-blue-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="space-y-2">
                      <div>
                        <p className="text-[10px] sm:text-xs font-medium text-blue-600 uppercase tracking-wider mb-1">
                          Customer Name
                        </p>
                        <h3 className="text-base sm:text-lg lg:text-xl font-bold text-slate-800 break-words">
                          {customerName || 'Customer'}
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone size={14} className="text-blue-500" />
                        <p className="text-sm sm:text-base font-medium break-words">
                          {minimalCustomer.phone || 'No phone'}
                        </p>
                      </div>
                    </div>

                    <div className="bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold inline-flex items-center gap-2 self-start">
                      <span>🆔</span>
                      <span className="break-all">{minimalCustomer.customerId || 'N/A'}</span>
                    </div>
                  </div>

                  <p className="text-[10px] sm:text-xs text-slate-400 mt-3 sm:mt-4 text-center border-t border-blue-200 pt-2 sm:pt-3">
                    Customer cannot be changed after order creation
                  </p>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-lg sm:rounded-xl p-6 sm:p-8 text-center">
                  <User size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm sm:text-base text-slate-500">No customer information available</p>
                </div>
              )}
            </div>

            {/* Delivery Information */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-black text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-blue-600" />
                Delivery Information
              </h2>
              
              <div>
                <label className="block text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2">
                  Expected Delivery Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 sm:left-4 top-3 sm:top-3.5 text-slate-400" size={16} />
                  <input
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm sm:text-base"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6">
              <h2 className="text-base sm:text-lg font-black text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
                <Package size={18} className="text-blue-600" />
                Order Details
              </h2>

              {/* Special Notes */}
              <div>
                <label className="block text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2">
                  Special Notes
                </label>
                <textarea
                  value={formData.specialNotes}
                  onChange={(e) => setFormData({ ...formData, specialNotes: e.target.value })}
                  rows="3"
                  placeholder="Any special instructions for this order..."
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Garments Section */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 sm:mb-4">
                <h2 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2">
                  <Package size={18} className="text-blue-600" />
                  Garments ({garments?.length || 0})
                </h2>
                <button
                  type="button"
                  onClick={handleAddGarment}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-2 self-start"
                >
                  <Plus size={14} />
                  Add Garment
                </button>
              </div>

              {garments?.length === 0 ? (
                <div className="text-center py-6 sm:py-8 bg-slate-50 rounded-lg sm:rounded-xl">
                  <Package size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm sm:text-base text-slate-500">No garments in this order</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-3">
                  {garments.map((garment) => (
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
                            <span className="text-[10px] sm:text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full whitespace-nowrap">
                              {garment.garmentId}
                            </span>
                            <span className={`text-[10px] sm:text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                              garment.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                              garment.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              {garment.priority}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm mb-2">
                            <div className="min-w-0">
                              <p className="text-[10px] text-slate-400">Price</p>
                              <p className="font-bold text-blue-600 text-xs truncate">
                                ₹{garment.priceRange?.min} - ₹{garment.priceRange?.max}
                              </p>
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] text-slate-400">Delivery</p>
                              <p className="font-medium text-purple-600 text-xs truncate">
                                {formatDate(garment.estimatedDelivery)}
                              </p>
                            </div>
                            <div className="min-w-0 col-span-2 sm:col-span-1">
                              <p className="text-[10px] text-slate-400">Status</p>
                              <p className="capitalize font-medium text-xs truncate">{garment.status}</p>
                            </div>
                          </div>

                          {/* Images Section */}
                          {(garment.referenceImages?.length > 0 || garment.customerImages?.length > 0) && (
                            <div className="mt-2 border-t border-slate-200 pt-2">
                              <button
                                type="button"
                                onClick={() => setExpandedGarment(expandedGarment === garment._id ? null : garment._id)}
                                className="flex items-center gap-2 text-xs sm:text-sm text-blue-600 hover:text-blue-700"
                              >
                                <ImageIcon size={14} />
                                {expandedGarment === garment._id ? 'Hide Images' : 'Show Images'}
                              </button>
                              
                              {expandedGarment === garment._id && (
                                <div className="mt-2 space-y-2">
                                  {garment.referenceImages?.length > 0 && (
                                    <div>
                                      <p className="text-[10px] font-bold text-slate-500 mb-1">Reference Images</p>
                                      <div className="grid grid-cols-3 gap-1 sm:gap-2">
                                        {garment.referenceImages.map((img, idx) => (
                                          <div key={idx} className="relative group">
                                            <img
                                              src={img.url || img}
                                              alt={`Reference ${idx + 1}`}
                                              className="w-full h-16 sm:h-20 object-cover rounded-lg border border-slate-200"
                                              onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://via.placeholder.com/150?text=Image+Not+Found';
                                              }}
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {garment.customerImages?.length > 0 && (
                                    <div>
                                      <p className="text-[10px] font-bold text-slate-500 mb-1">Customer Images</p>
                                      <div className="grid grid-cols-3 gap-1 sm:gap-2">
                                        {garment.customerImages.map((img, idx) => (
                                          <div key={idx} className="relative group">
                                            <img
                                              src={img.url || img}
                                              alt={`Customer ${idx + 1}`}
                                              className="w-full h-16 sm:h-20 object-cover rounded-lg border border-slate-200"
                                              onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://via.placeholder.com/150?text=Image+Not+Found';
                                              }}
                                            />
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => handleEditGarment(garment)}
                            className="px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 text-xs font-medium"
                            title="Edit"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteGarment(garment._id)}
                            className="p-1.5 sm:p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Payment Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6 sticky top-6">
              <h2 className="text-base sm:text-lg font-black text-slate-800 mb-3 sm:mb-4">Payment Summary</h2>
              
              <div className="space-y-3 sm:space-y-4">
                {/* Total Amount */}
                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                  <p className="text-[10px] sm:text-xs text-blue-600 font-black uppercase mb-1">Total Amount</p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-black text-blue-700 break-words">
                    ₹{priceSummary.min} - ₹{priceSummary.max}
                  </p>
                </div>

                {/* Payment Statistics Cards */}
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

                {/* Payment Type Breakdown */}
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

                {/* Payment Method Breakdown */}
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

                {/* Garment Delivery Range */}
                {garmentDeliveryRange && (
                  <div className="bg-purple-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                    <p className="text-[10px] sm:text-xs text-purple-600 font-black uppercase mb-1">
                      Garment Delivery Range
                    </p>
                    <p className="text-xs sm:text-sm font-bold text-purple-700 break-words">
                      {formatDate(garmentDeliveryRange.min)} - {formatDate(garmentDeliveryRange.max)}
                    </p>
                    <p className="text-[10px] sm:text-xs text-purple-500 mt-1">
                      Order delivery: {formatDate(formData.deliveryDate)}
                    </p>
                  </div>
                )}

                {/* Balance Amount */}
                <div className="bg-orange-50 p-3 sm:p-4 rounded-lg sm:rounded-xl mt-2 sm:mt-4">
                  <p className="text-[10px] sm:text-xs text-orange-600 font-black uppercase mb-1">Balance Amount</p>
                  <p className="text-base sm:text-lg lg:text-xl font-black text-orange-700 break-words">
                    {formatCurrency(balanceAmount)}
                  </p>
                  {balanceAmount < 0 && (
                    <p className="text-[10px] sm:text-xs text-green-600 mt-1">
                      (Overpaid by {formatCurrency(Math.abs(balanceAmount))})
                    </p>
                  )}
                  {balanceAmount > 0 && (
                    <p className="text-[10px] sm:text-xs text-orange-600 mt-1">Pending payment</p>
                  )}
                </div>

                {/* Add Payment Button */}
                {canEdit && (
                  <button
                    type="button"
                    onClick={handleAddPayment}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold flex items-center justify-center gap-2 transition-all text-sm sm:text-base"
                  >
                    <Wallet size={16} />
                    Add Payment
                  </button>
                )}

                {/* Payment History Toggle */}
                {payments?.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowPaymentHistory(!showPaymentHistory)}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg font-bold flex items-center justify-center gap-2 transition-all text-xs sm:text-sm"
                  >
                    <Receipt size={14} />
                    {showPaymentHistory ? 'Hide' : 'Show'} Payment History ({payments.length})
                  </button>
                )}

                {/* Payment History List */}
                {showPaymentHistory && payments?.length > 0 && (
                  <div className="bg-slate-50 rounded-lg p-2 sm:p-3 max-h-48 sm:max-h-60 overflow-y-auto">
                    <div className="space-y-2">
                      {payments.map((payment, index) => (
                        <div key={payment._id || index} className="bg-white p-2 sm:p-3 rounded-lg border border-slate-200">
                          <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                <span className="font-bold text-green-600 text-xs sm:text-sm">{formatCurrency(payment.amount)}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                  payment.type === 'full' ? 'bg-green-100 text-green-700' :
                                  payment.type === 'advance' ? 'bg-blue-100 text-blue-700' :
                                  payment.type === 'partial' ? 'bg-orange-100 text-orange-700' :
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
                              {payment.notes && (
                                <p className="text-[10px] text-slate-400 mt-1 italic truncate">{payment.notes}</p>
                              )}
                            </div>
                            {canEdit && (
                              <div className="flex gap-1 self-end sm:self-center">
                                <button
                                  type="button"
                                  onClick={() => handleEditPayment(payment)}
                                  className="text-blue-500 hover:text-blue-700 text-[10px] sm:text-xs font-bold px-2 py-1"
                                  title="Edit"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeletePayment(payment._id)}
                                  className="text-red-500 hover:text-red-700 p-1"
                                  title="Delete"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 sm:py-4 rounded-lg sm:rounded-xl font-black uppercase tracking-wider shadow-lg shadow-blue-500/30 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 mt-4 sm:mt-6 text-sm sm:text-base ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs sm:text-sm">Updating...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Update Order</span>
                    </>
                  )}
                </button>

                {/* Cancel Button */}
                <button
                  type="button"
                  onClick={() => navigate(`${basePath}/orders/${id}`)}
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg sm:rounded-xl font-black uppercase tracking-wider transition-all text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Garment Form Modal */}
      {showGarmentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <GarmentForm
            onClose={() => setShowGarmentModal(false)}
            onSave={handleSaveGarment}
            editingGarment={editingGarment}
            customerId={formData.customer} 
          />
        </div>
      )}
    </div>
  );
}