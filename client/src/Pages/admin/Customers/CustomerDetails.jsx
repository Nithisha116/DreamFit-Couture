// import { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { 
//   User, Phone, Mail, MapPin, Calendar, ShoppingBag, 
//   ChevronLeft, PlusCircle, AlertCircle, Edit, Trash2, 
//   Save, X, Hash, MessageCircle, FileText, Star, Cake,
//   IndianRupee, CreditCard, TrendingUp, Eye, Ruler, 
//   Receipt, Clock, Download, Filter, Banknote, Smartphone, 
//   Landmark, Package, ChevronLeft as ChevronLeftIcon,
//   ChevronRight, Bookmark, ChevronDown, ChevronUp, Scissors,
//   Menu
// } from "lucide-react";
// import { 
//   fetchCustomerById, 
//   updateCustomer, 
//   deleteCustomer,
//   fetchCustomerPayments,
//   fetchCustomerOrders,
//   fetchCustomerTemplates
// } from "../../../features/customer/customerSlice";
// import showToast from "../../../utils/toast";
// import { exportPaymentsToExcel } from "../../../utils/exportHelpers";
// import MeasurementPreviewModal from "../../../components/MeasurementPreviewModal";

// export default function CustomerDetails() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
  
//   // State selectors with customerTemplates
//   const { currentCustomer, customerPayments, customerOrders, customerTemplates, loading } = useSelector((state) => {
//     console.log("🔍 Customer state:", state.customer);
//     return {
//       currentCustomer: state.customer?.currentCustomer || null,
//       customerPayments: state.customer?.customerPayments || [],
//       customerOrders: state.customer?.customerOrders || [],
//       customerTemplates: state.customer?.customerTemplates || [],
//       loading: state.customer?.loading || false
//     };
//   });
  
//   const { user } = useSelector((state) => state.auth);

//   const [isEditing, setIsEditing] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [activeTab, setActiveTab] = useState("overview");
//   const [paymentFilter, setPaymentFilter] = useState("all");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [ordersPage, setOrdersPage] = useState(1);
//   const [templatesPage, setTemplatesPage] = useState(1);
//   const [expandedTemplate, setExpandedTemplate] = useState(null);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
//   // State for measurement preview modal
//   const [showMeasurementPreview, setShowMeasurementPreview] = useState(false);
//   const [previewMeasurements, setPreviewMeasurements] = useState(null);
//   const [previewTemplateName, setPreviewTemplateName] = useState("");
  
//   const itemsPerPage = 5;
  
//   const [formData, setFormData] = useState({
//     salutation: "Mr.",
//     firstName: "",
//     lastName: "",
//     dateOfBirth: "",
//     phone: "",
//     whatsappNumber: "",
//     email: "",
//     addressLine1: "",
//     addressLine2: "",
//     city: "",
//     state: "",
//     pincode: "",
//     notes: ""
//   });

//   // Get base path based on user role
//   const rolePath = user?.role === "ADMIN" ? "/admin" : 
//                    user?.role === "STORE_KEEPER" ? "/storekeeper" : 
//                    "/cuttingmaster";

//   // Check if user can perform CRUD operations
//   const canEdit = user?.role === "ADMIN" || user?.role === "STORE_KEEPER";
//   const canDelete = user?.role === "ADMIN" || user?.role === "STORE_KEEPER";

//   // Fetch customer data on mount
//   useEffect(() => {
//     if (id) {
//       console.log("🔍 Fetching customer details for ID:", id);
//       dispatch(fetchCustomerById(id));
//       dispatch(fetchCustomerPayments(id));
//       dispatch(fetchCustomerOrders(id));
//       dispatch(fetchCustomerTemplates(id));
//     }
//   }, [id, dispatch]);

//   // Load customer data into form
//   useEffect(() => {
//     if (currentCustomer) {
//       setFormData({
//         salutation: currentCustomer.salutation || "Mr.",
//         firstName: currentCustomer.firstName || "",
//         lastName: currentCustomer.lastName || "",
//         dateOfBirth: currentCustomer.dateOfBirth ? currentCustomer.dateOfBirth.split('T')[0] : "",
//         phone: currentCustomer.phone || "",
//         whatsappNumber: currentCustomer.whatsappNumber || "",
//         email: currentCustomer.email || "",
//         addressLine1: currentCustomer.addressLine1 || "",
//         addressLine2: currentCustomer.addressLine2 || "",
//         city: currentCustomer.city || "",
//         state: currentCustomer.state || "",
//         pincode: currentCustomer.pincode || "",
//         notes: currentCustomer.notes || ""
//       });
//     }
//   }, [currentCustomer]);

//   // Payment statistics
//   const paymentStats = {
//     totalPaid: customerPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
//     totalPayments: customerPayments?.length || 0,
//     lastPayment: customerPayments?.length > 0 ? customerPayments[customerPayments.length - 1] : null,
//     advancePayments: customerPayments?.filter(p => p.type === 'advance').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
//     fullPayments: customerPayments?.filter(p => p.type === 'full').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
//     partialPayments: customerPayments?.filter(p => p.type === 'partial').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
//     extraPayments: customerPayments?.filter(p => p.type === 'extra').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
//     finalSettlementPayments: customerPayments?.filter(p => p.type === 'final-settlement').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
//     byMethod: {
//       cash: customerPayments?.filter(p => p.method === 'cash').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
//       upi: customerPayments?.filter(p => p.method === 'upi').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
//       card: customerPayments?.filter(p => p.method === 'card').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
//       'bank-transfer': customerPayments?.filter(p => p.method === 'bank-transfer').reduce((sum, p) => sum + (p.amount || 0), 0) || 0
//     }
//   };

//   // Filter payments
//   const filteredPayments = customerPayments?.filter(p => {
//     if (paymentFilter === "all") return true;
//     if (paymentFilter === "final") return p.type === "final-settlement";
//     return p.type === paymentFilter;
//   }) || [];

//   // Pagination for payments
//   const totalPaymentPages = Math.ceil(filteredPayments.length / itemsPerPage);
//   const paymentStartIndex = (currentPage - 1) * itemsPerPage;
//   const paymentEndIndex = paymentStartIndex + itemsPerPage;
//   const currentPayments = filteredPayments.slice(paymentStartIndex, paymentEndIndex);

//   // Pagination for orders
//   const totalOrderPages = Math.ceil((customerOrders?.length || 0) / itemsPerPage);
//   const orderStartIndex = (ordersPage - 1) * itemsPerPage;
//   const orderEndIndex = orderStartIndex + itemsPerPage;
//   const currentOrders = customerOrders?.slice(orderStartIndex, orderEndIndex) || [];

//   // Pagination for templates
//   const totalTemplatePages = Math.ceil((customerTemplates?.length || 0) / itemsPerPage);
//   const templateStartIndex = (templatesPage - 1) * itemsPerPage;
//   const templateEndIndex = templateStartIndex + itemsPerPage;
//   const currentTemplates = customerTemplates?.slice(templateStartIndex, templateEndIndex) || [];

//   // Handler for preview measurements
//   const handlePreviewMeasurements = (template) => {
//     setPreviewMeasurements(template.measurements);
//     setPreviewTemplateName(template.name);
//     setShowMeasurementPreview(true);
//   };

//   const handleBack = () => {
//     navigate(`${rolePath}/customers`);
//   };

//   const handleCreateOrder = () => {
//     const customerData = {
//       _id: currentCustomer._id,
//       customerId: currentCustomer.customerId,
//       salutation: currentCustomer.salutation,
//       firstName: currentCustomer.firstName,
//       lastName: currentCustomer.lastName,
//       phone: currentCustomer.phone,
//       email: currentCustomer.email
//     };
    
//     navigate(`${rolePath}/orders/new`, { 
//       state: { customer: customerData }
//     });
//   };

//   const handleViewOrder = (orderId) => {
//     navigate(`${rolePath}/orders/${orderId}`);
//   };

//   const handleViewPayment = (paymentId) => {
//     navigate(`${rolePath}/payments/${paymentId}`);
//   };

//   const handleViewMeasurements = () => {
//     navigate(`${rolePath}/customer-size/${currentCustomer._id}`);
//   };

//   const handleExportPayments = () => {
//     const customerInfo = {
//       customerId: currentCustomer?.customerId,
//       name: customerFullName()
//     };
//     exportPaymentsToExcel(customerPayments, customerInfo);
//   };

//   const handleEdit = () => {
//     setIsEditing(true);
//   };

//   const handleCancelEdit = () => {
//     setIsEditing(false);
//     if (currentCustomer) {
//       setFormData({
//         salutation: currentCustomer.salutation || "Mr.",
//         firstName: currentCustomer.firstName || "",
//         lastName: currentCustomer.lastName || "",
//         dateOfBirth: currentCustomer.dateOfBirth ? currentCustomer.dateOfBirth.split('T')[0] : "",
//         phone: currentCustomer.phone || "",
//         whatsappNumber: currentCustomer.whatsappNumber || "",
//         email: currentCustomer.email || "",
//         addressLine1: currentCustomer.addressLine1 || "",
//         addressLine2: currentCustomer.addressLine2 || "",
//         city: currentCustomer.city || "",
//         state: currentCustomer.state || "",
//         pincode: currentCustomer.pincode || "",
//         notes: currentCustomer.notes || ""
//       });
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
    
//     if (name === "phone" || name === "whatsappNumber" || name === "pincode") {
//       const numericValue = value.replace(/\D/g, '');
//       const maxLength = name === "pincode" ? 6 : 10;
//       const truncated = numericValue.slice(0, maxLength);
//       setFormData(prev => ({ ...prev, [name]: truncated }));
//     } else {
//       setFormData(prev => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleUpdate = async () => {
//     try {
//       const updateData = {
//         salutation: formData.salutation,
//         firstName: formData.firstName,
//         lastName: formData.lastName,
//         dateOfBirth: formData.dateOfBirth || undefined,
//         phone: formData.phone,
//         whatsappNumber: formData.whatsappNumber,
//         email: formData.email,
//         addressLine1: formData.addressLine1,
//         addressLine2: formData.addressLine2,
//         city: formData.city,
//         state: formData.state,
//         pincode: formData.pincode,
//         notes: formData.notes
//       };

//       await dispatch(updateCustomer({ id, customerData: updateData })).unwrap();
//       showToast.success("Customer updated successfully! ✅");
//       setIsEditing(false);
//       dispatch(fetchCustomerById(id));
//     } catch (error) {
//       showToast.error(error.message || "Failed to update customer");
//     }
//   };

//   const handleDelete = async () => {
//     try {
//       await dispatch(deleteCustomer(id)).unwrap();
//       showToast.success("Customer deleted successfully! 🗑️");
//       setShowDeleteModal(false);
//       navigate(`${rolePath}/customers`);
//     } catch (error) {
//       showToast.error(error.message || "Failed to delete customer");
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "";
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-GB', { 
//       day: '2-digit', 
//       month: 'long', 
//       year: 'numeric'
//     });
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

//   const formatDisplayDate = (dateString) => {
//     if (!dateString) return null;
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     });
//   };

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 0
//     }).format(amount || 0);
//   };

//   const calculateAge = (dateString) => {
//     if (!dateString) return null;
//     const today = new Date();
//     const birthDate = new Date(dateString);
//     let age = today.getFullYear() - birthDate.getFullYear();
//     const m = today.getMonth() - birthDate.getMonth();
//     if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
//       age--;
//     }
//     return age;
//   };

//   const isVIP = currentCustomer?.notes?.toLowerCase().includes('vip');

//   const customerFullName = () => {
//     if (!currentCustomer) return 'Customer';
    
//     let name = '';
//     if (currentCustomer.firstName || currentCustomer.lastName) {
//       const firstName = currentCustomer.firstName || '';
//       const lastName = currentCustomer.lastName || '';
//       name = `${firstName} ${lastName}`.trim();
//     }
    
//     if (currentCustomer.salutation && name) {
//       return `${currentCustomer.salutation} ${name}`.trim();
//     }
//     return name || 'Customer';
//   };

//   const age = calculateAge(currentCustomer?.dateOfBirth);

//   // Toggle template expansion
//   const toggleTemplate = (templateId) => {
//     setExpandedTemplate(expandedTemplate === templateId ? null : templateId);
//   };

//   if (loading && !currentCustomer) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-slate-50">
//         <div className="text-center px-4">
//           <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
//           <p className="text-sm sm:text-base text-slate-500 font-medium">Loading customer details...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!currentCustomer && !loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
//         <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm p-6 sm:p-8 max-w-md w-full text-center">
//           <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
//           <h2 className="text-xl sm:text-2xl font-black text-slate-800 mb-2">Customer Not Found</h2>
//           <p className="text-sm sm:text-base text-slate-500 mb-6">The customer you're looking for doesn't exist.</p>
//           <button
//             onClick={handleBack}
//             className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base w-full sm:w-auto"
//           >
//             Back to Customers
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-50">
//       {/* Mobile Header */}
//       <div className="lg:hidden bg-white border-b border-slate-200 sticky top-0 z-30">
//         <div className="flex items-center justify-between px-4 py-3">
//           <button
//             onClick={handleBack}
//             className="flex items-center gap-1 text-slate-600"
//           >
//             <ChevronLeft size={20} />
//             <span className="font-bold text-sm">Back</span>
//           </button>
//           <h1 className="text-lg font-black text-slate-800 truncate max-w-[150px]">
//             {customerFullName()}
//           </h1>
//           <button
//             onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//             className="p-2 hover:bg-slate-100 rounded-xl transition-all flex items-center justify-center"
//             style={{ minWidth: '40px', minHeight: '40px' }}
//           >
//             <Menu size={20} />
//           </button>
//         </div>
        
//         {/* Mobile Action Menu - Like PaymentDetails */}
//         {mobileMenuOpen && (
//           <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg p-4 z-40 animate-in slide-in-from-top duration-300">
//             <div className="space-y-2">
//               <button
//                 onClick={() => {
//                   handleCreateOrder();
//                   setMobileMenuOpen(false);
//                 }}
//                 className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 text-green-600 rounded-lg font-bold hover:bg-green-100 transition-colors"
//               >
//                 <PlusCircle size={18} />
//                 New Order
//               </button>
              
//               <button
//                 onClick={() => {
//                   handleViewMeasurements();
//                   setMobileMenuOpen(false);
//                 }}
//                 className="w-full flex items-center gap-3 px-4 py-3 bg-purple-50 text-purple-600 rounded-lg font-bold hover:bg-purple-100 transition-colors"
//               >
//                 <Ruler size={18} />
//                 Measurements
//               </button>
              
//               {canEdit && !isEditing && (
//                 <button
//                   onClick={() => {
//                     handleEdit();
//                     setMobileMenuOpen(false);
//                   }}
//                   className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-lg font-bold hover:bg-blue-100 transition-colors"
//                 >
//                   <Edit size={18} />
//                   Edit Customer
//                 </button>
//               )}
              
//               {canDelete && (
//                 <button
//                   onClick={() => {
//                     setShowDeleteModal(true);
//                     setMobileMenuOpen(false);
//                   }}
//                   className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 text-red-600 rounded-lg font-bold hover:bg-red-100 transition-colors"
//                 >
//                   <Trash2 size={18} />
//                   Delete Customer
//                 </button>
//               )}
//             </div>
//           </div>
//         )}
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
//         {/* Desktop Header with Back Button and Actions - Hidden on Mobile */}
//         <div className="hidden lg:flex items-center justify-between mb-6">
//           <button
//             onClick={handleBack}
//             className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors group"
//           >
//             <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
//             <span className="font-bold">Back to Customers</span>
//           </button>
          
//           <div className="flex items-center gap-3">
//             {canEdit && !isEditing && (
//               <>
//                 <button
//                   onClick={handleEdit}
//                   className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all"
//                 >
//                   <Edit size={18} />
//                   Edit
//                 </button>
//                 {canDelete && (
//                   <button
//                     onClick={() => setShowDeleteModal(true)}
//                     className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-red-500/30 transition-all"
//                   >
//                     <Trash2 size={18} />
//                     Delete
//                   </button>
//                 )}
//               </>
//             )}
            
//             <button
//               onClick={handleCreateOrder}
//               className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-green-500/30 transition-all hover:scale-105"
//             >
//               <PlusCircle size={18} />
//               New Order
//             </button>

//             <button
//               onClick={handleViewMeasurements}
//               className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-purple-500/30 transition-all hover:scale-105"
//             >
//               <Ruler size={18} />
//               Measurements
//             </button>
//           </div>
//         </div>

//         {/* Main Content */}
//         <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
//           {isEditing ? (
//             /* EDIT MODE - Responsive */
//             <div className="p-4 sm:p-6 lg:p-8">
//               <h2 className="text-xl sm:text-2xl font-black text-slate-800 mb-4 sm:mb-6">Edit Customer</h2>
//               <div className="space-y-4">
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
//                   <div>
//                     <label className="block text-xs font-black uppercase text-slate-500 mb-1">Salutation</label>
//                     <select
//                       name="salutation"
//                       value={formData.salutation}
//                       onChange={handleChange}
//                       className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
//                     >
//                       <option value="Mr.">Mr.</option>
//                       <option value="Mrs.">Mrs.</option>
//                       <option value="Ms.">Ms.</option>
//                       <option value="Dr.">Dr.</option>
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-xs font-black uppercase text-slate-500 mb-1">First Name</label>
//                     <input
//                       type="text"
//                       name="firstName"
//                       value={formData.firstName}
//                       onChange={handleChange}
//                       className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-xs font-black uppercase text-slate-500 mb-1">Last Name</label>
//                     <input
//                       type="text"
//                       name="lastName"
//                       value={formData.lastName}
//                       onChange={handleChange}
//                       className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-xs font-black uppercase text-slate-500 mb-1">Date of Birth</label>
//                     <input
//                       type="date"
//                       name="dateOfBirth"
//                       value={formData.dateOfBirth}
//                       onChange={handleChange}
//                       max={new Date().toISOString().split('T')[0]}
//                       className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-xs font-black uppercase text-slate-500 mb-1">Phone</label>
//                     <input
//                       type="tel"
//                       name="phone"
//                       value={formData.phone}
//                       onChange={handleChange}
//                       maxLength="10"
//                       className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-xs font-black uppercase text-slate-500 mb-1">WhatsApp</label>
//                     <input
//                       type="tel"
//                       name="whatsappNumber"
//                       value={formData.whatsappNumber}
//                       onChange={handleChange}
//                       maxLength="10"
//                       className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
//                     />
//                   </div>
//                   <div className="sm:col-span-2">
//                     <label className="block text-xs font-black uppercase text-slate-500 mb-1">Email</label>
//                     <input
//                       type="email"
//                       name="email"
//                       value={formData.email}
//                       onChange={handleChange}
//                       className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
//                     />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
//                   <div className="sm:col-span-2">
//                     <label className="block text-xs font-black uppercase text-slate-500 mb-1">Address Line 1</label>
//                     <input
//                       type="text"
//                       name="addressLine1"
//                       value={formData.addressLine1}
//                       onChange={handleChange}
//                       className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
//                     />
//                   </div>
//                   <div className="sm:col-span-2">
//                     <label className="block text-xs font-black uppercase text-slate-500 mb-1">Address Line 2</label>
//                     <input
//                       type="text"
//                       name="addressLine2"
//                       value={formData.addressLine2}
//                       onChange={handleChange}
//                       className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-xs font-black uppercase text-slate-500 mb-1">City</label>
//                     <input
//                       type="text"
//                       name="city"
//                       value={formData.city}
//                       onChange={handleChange}
//                       className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-xs font-black uppercase text-slate-500 mb-1">State</label>
//                     <input
//                       type="text"
//                       name="state"
//                       value={formData.state}
//                       onChange={handleChange}
//                       className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-xs font-black uppercase text-slate-500 mb-1">Pincode</label>
//                     <input
//                       type="text"
//                       name="pincode"
//                       value={formData.pincode}
//                       onChange={handleChange}
//                       maxLength="6"
//                       className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-xs font-black uppercase text-slate-500 mb-1">Notes</label>
//                   <textarea
//                     name="notes"
//                     value={formData.notes}
//                     onChange={handleChange}
//                     rows="3"
//                     className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
//                   />
//                 </div>

//                 <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
//                   <button
//                     onClick={handleUpdate}
//                     className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm"
//                   >
//                     <Save size={18} />
//                     Save Changes
//                   </button>
//                   <button
//                     onClick={handleCancelEdit}
//                     className="w-full sm:w-auto bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm"
//                   >
//                     <X size={18} />
//                     Cancel
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ) : (
//             /* VIEW MODE - Responsive */
//             <div className="p-4 sm:p-6 lg:p-8">
//               {/* VIP Badge */}
//               {isVIP && (
//                 <div className="mb-4">
//                   <span className="bg-yellow-100 text-yellow-700 px-2 sm:px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
//                     <Star size={12} />
//                     VIP CUSTOMER
//                   </span>
//                 </div>
//               )}

//               {/* Header with Avatar and Basic Info - Responsive */}
//               <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-6 sm:mb-8">
//                 <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-xl mx-auto sm:mx-0">
//                   <span className="text-2xl sm:text-3xl lg:text-4xl font-black">
//                     {customerFullName().charAt(0) || 'C'}
//                   </span>
//                 </div>
                
//                 <div className="flex-1 text-center sm:text-left">
//                   <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 mb-2">
//                     <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-800 break-words">
//                       {customerFullName()}
//                     </h1>
//                   </div>
                  
//                   <div className="flex items-center justify-center sm:justify-start gap-2 text-indigo-600 bg-indigo-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg w-fit mx-auto sm:mx-0">
//                     <Hash size={14} />
//                     <span className="font-mono font-bold text-xs sm:text-sm">{currentCustomer.customerId}</span>
//                   </div>
//                 </div>
//               </div>

//               {/* Payment Summary Cards - Responsive Grid */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
//                 <div className="bg-blue-50 p-3 sm:p-4 rounded-xl border border-blue-100">
//                   <div className="flex items-center gap-2 sm:gap-3 mb-2">
//                     <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
//                       <IndianRupee size={16} className="text-blue-600" />
//                     </div>
//                     <p className="text-[10px] sm:text-xs text-blue-600 font-bold uppercase">Total Paid</p>
//                   </div>
//                   <p className="text-lg sm:text-xl lg:text-2xl font-black text-blue-700 break-words">
//                     {formatCurrency(paymentStats.totalPaid)}
//                   </p>
//                   <p className="text-[10px] sm:text-xs text-blue-500 mt-1">{paymentStats.totalPayments} payments</p>
//                 </div>

//                 <div className="bg-green-50 p-3 sm:p-4 rounded-xl border border-green-100">
//                   <div className="flex items-center gap-2 sm:gap-3 mb-2">
//                     <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
//                       <CreditCard size={16} className="text-green-600" />
//                     </div>
//                     <p className="text-[10px] sm:text-xs text-green-600 font-bold uppercase">Last Payment</p>
//                   </div>
//                   <p className="text-lg sm:text-xl lg:text-2xl font-black text-green-700 break-words">
//                     {paymentStats.lastPayment ? formatCurrency(paymentStats.lastPayment.amount) : '₹0'}
//                   </p>
//                   <p className="text-[10px] sm:text-xs text-green-500 mt-1 truncate">
//                     {paymentStats.lastPayment ? formatDateTime(paymentStats.lastPayment.paymentDate, paymentStats.lastPayment.paymentTime) : 'No payments'}
//                   </p>
//                 </div>

//                 <div className="bg-purple-50 p-3 sm:p-4 rounded-xl border border-purple-100">
//                   <div className="flex items-center gap-2 sm:gap-3 mb-2">
//                     <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center">
//                       <ShoppingBag size={16} className="text-purple-600" />
//                     </div>
//                     <p className="text-[10px] sm:text-xs text-purple-600 font-bold uppercase">Total Orders</p>
//                   </div>
//                   <p className="text-lg sm:text-xl lg:text-2xl font-black text-purple-700">{customerOrders?.length || 0}</p>
//                   <p className="text-[10px] sm:text-xs text-purple-500 mt-1">
//                     {customerOrders?.filter(o => o.status === 'delivered').length || 0} completed
//                   </p>
//                 </div>

//                 <div className="bg-orange-50 p-3 sm:p-4 rounded-xl border border-orange-100 sm:col-span-2 lg:col-span-1">
//                   <div className="flex items-center gap-2 sm:gap-3 mb-2">
//                     <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-lg flex items-center justify-center">
//                       <TrendingUp size={16} className="text-orange-600" />
//                     </div>
//                     <p className="text-[10px] sm:text-xs text-orange-600 font-bold uppercase">Payment Methods</p>
//                   </div>
//                   <div className="space-y-1">
//                     {Object.entries(paymentStats.byMethod).map(([method, amount]) => (
//                       amount > 0 && (
//                         <div key={method} className="flex justify-between text-[10px] sm:text-xs">
//                           <span className="text-slate-600 capitalize">{method}:</span>
//                           <span className="font-bold text-orange-700">{formatCurrency(amount)}</span>
//                         </div>
//                       )
//                     ))}
//                   </div>
//                 </div>
//               </div>

//               {/* Tabs Navigation - Visible on both Mobile and Desktop */}
//               <div className="border-b border-slate-200 mb-6 overflow-x-auto">
//                 <div className="flex gap-4 sm:gap-6 min-w-max sm:min-w-0">
//                   <button
//                     onClick={() => setActiveTab("overview")}
//                     className={`pb-3 px-1 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all whitespace-nowrap ${
//                       activeTab === "overview" 
//                         ? "text-blue-600 border-b-2 border-blue-600" 
//                         : "text-slate-400 hover:text-slate-600"
//                     }`}
//                   >
//                     <User size={16} className="inline mr-1 sm:mr-2" />
//                     Overview
//                   </button>
//                   <button
//                     onClick={() => setActiveTab("payments")}
//                     className={`pb-3 px-1 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all whitespace-nowrap ${
//                       activeTab === "payments" 
//                         ? "text-blue-600 border-b-2 border-blue-600" 
//                         : "text-slate-400 hover:text-slate-600"
//                     }`}
//                   >
//                     <IndianRupee size={16} className="inline mr-1 sm:mr-2" />
//                     Payments ({customerPayments?.length || 0})
//                   </button>
//                   <button
//                     onClick={() => setActiveTab("orders")}
//                     className={`pb-3 px-1 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all whitespace-nowrap ${
//                       activeTab === "orders" 
//                         ? "text-blue-600 border-b-2 border-blue-600" 
//                         : "text-slate-400 hover:text-slate-600"
//                     }`}
//                   >
//                     <ShoppingBag size={16} className="inline mr-1 sm:mr-2" />
//                     Orders ({customerOrders?.length || 0})
//                   </button>
//                   <button
//                     onClick={() => setActiveTab("measurements")}
//                     className={`pb-3 px-1 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all whitespace-nowrap ${
//                       activeTab === "measurements" 
//                         ? "text-blue-600 border-b-2 border-blue-600" 
//                         : "text-slate-400 hover:text-slate-600"
//                     }`}
//                   >
//                     <Ruler size={16} className="inline mr-1 sm:mr-2" />
//                     Measurements ({customerTemplates?.length || 0})
//                   </button>
//                 </div>
//               </div>

//               {/* Tab Content - Responsive */}
//               <div className="min-h-[300px] sm:min-h-[400px]">
//                 {/* OVERVIEW TAB */}
//                 {activeTab === "overview" && (
//                   <div>
//                     {/* Contact Information Grid - Responsive */}
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
//                       <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-blue-50 rounded-xl">
//                         <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
//                           <Phone size={20} className="text-blue-600" />
//                         </div>
//                         <div className="min-w-0 flex-1">
//                           <p className="text-[10px] sm:text-xs text-blue-600 font-bold uppercase">Phone</p>
//                           <p className="text-sm sm:text-base lg:text-xl font-bold text-slate-800 break-words">
//                             {currentCustomer.phone}
//                           </p>
//                         </div>
//                       </div>

//                       <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-green-50 rounded-xl">
//                         <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
//                           <MessageCircle size={20} className="text-green-600" />
//                         </div>
//                         <div className="min-w-0 flex-1">
//                           <p className="text-[10px] sm:text-xs text-green-600 font-bold uppercase">WhatsApp</p>
//                           <p className="text-sm sm:text-base lg:text-xl font-bold text-slate-800 break-words">
//                             {currentCustomer.whatsappNumber || currentCustomer.phone}
//                           </p>
//                         </div>
//                       </div>

//                       <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-purple-50 rounded-xl sm:col-span-2 lg:col-span-1">
//                         <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
//                           <Mail size={20} className="text-purple-600" />
//                         </div>
//                         <div className="min-w-0 flex-1">
//                           <p className="text-[10px] sm:text-xs text-purple-600 font-bold uppercase">Email</p>
//                           <p className="text-sm sm:text-base lg:text-xl font-bold text-slate-800 break-all">
//                             {currentCustomer.email || '—'}
//                           </p>
//                         </div>
//                       </div>

//                       {currentCustomer.dateOfBirth && (
//                         <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-pink-50 rounded-xl">
//                           <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
//                             <Cake size={20} className="text-pink-600" />
//                           </div>
//                           <div className="min-w-0 flex-1">
//                             <p className="text-[10px] sm:text-xs text-pink-600 font-bold uppercase">Date of Birth</p>
//                             <p className="text-sm sm:text-base lg:text-xl font-bold text-slate-800 break-words">
//                               {formatDisplayDate(currentCustomer.dateOfBirth)}
//                               {age && <span className="text-xs sm:text-sm font-normal text-slate-500 ml-1 sm:ml-2">({age} years)</span>}
//                             </p>
//                           </div>
//                         </div>
//                       )}
//                     </div>

//                     {/* Address Section - Responsive */}
//                     {(currentCustomer.addressLine1 || currentCustomer.city) && (
//                       <div className="mb-6 sm:mb-8">
//                         <h2 className="text-base sm:text-lg font-black text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
//                           <MapPin size={18} className="text-blue-600" />
//                           Address
//                         </h2>
//                         <div className="bg-slate-50 p-4 sm:p-6 rounded-xl border border-slate-200">
//                           <p className="text-sm sm:text-base text-slate-700 font-medium break-words">
//                             {currentCustomer.addressLine1}
//                           </p>
//                           {currentCustomer.addressLine2 && (
//                             <p className="text-sm text-slate-600 mt-1 break-words">{currentCustomer.addressLine2}</p>
//                           )}
//                           {(currentCustomer.city || currentCustomer.state || currentCustomer.pincode) && (
//                             <p className="text-sm text-slate-600 mt-1 break-words">
//                               {[currentCustomer.city, currentCustomer.state, currentCustomer.pincode].filter(Boolean).join(', ')}
//                             </p>
//                           )}
//                         </div>
//                       </div>
//                     )}

//                     {/* Notes Section - Responsive */}
//                     {currentCustomer.notes && (
//                       <div className="mb-6 sm:mb-8">
//                         <h2 className="text-base sm:text-lg font-black text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
//                           <FileText size={18} className="text-blue-600" />
//                           Notes
//                         </h2>
//                         <div className="bg-amber-50 p-4 sm:p-6 rounded-xl border border-amber-200">
//                           <p className="text-sm sm:text-base text-amber-800 italic break-words">
//                             "{currentCustomer.notes}"
//                           </p>
//                         </div>
//                       </div>
//                     )}

//                     {/* Customer Since - Responsive */}
//                     <div className="text-xs sm:text-sm text-slate-400 border-t border-slate-100 pt-4 sm:pt-6">
//                       <p>Customer since: {formatDate(currentCustomer.createdAt)}</p>
//                       {currentCustomer.updatedAt !== currentCustomer.createdAt && (
//                         <p className="mt-1">Last updated: {formatDate(currentCustomer.updatedAt)}</p>
//                       )}
//                     </div>
//                   </div>
//                 )}

//                 {/* PAYMENTS TAB */}
//                 {activeTab === "payments" && (
//                   <div>
//                     {/* Payment Filters - Responsive */}
//                     <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
//                       <div className="flex flex-wrap gap-1 sm:gap-2 bg-slate-100 p-1 rounded-lg w-full sm:w-auto">
//                         <button
//                           onClick={() => setPaymentFilter("all")}
//                           className={`flex-1 sm:flex-none px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm transition-all ${
//                             paymentFilter === "all" 
//                               ? "bg-white text-blue-600 shadow-sm" 
//                               : "text-slate-500 hover:text-slate-700"
//                           }`}
//                         >
//                           All
//                         </button>
//                         <button
//                           onClick={() => setPaymentFilter("advance")}
//                           className={`flex-1 sm:flex-none px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm transition-all ${
//                             paymentFilter === "advance" 
//                               ? "bg-white text-blue-600 shadow-sm" 
//                               : "text-slate-500 hover:text-slate-700"
//                           }`}
//                         >
//                           Advance
//                         </button>
//                         <button
//                           onClick={() => setPaymentFilter("full")}
//                           className={`flex-1 sm:flex-none px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm transition-all ${
//                             paymentFilter === "full" 
//                               ? "bg-white text-blue-600 shadow-sm" 
//                               : "text-slate-500 hover:text-slate-700"
//                           }`}
//                         >
//                           Full
//                         </button>
//                         <button
//                           onClick={() => setPaymentFilter("partial")}
//                           className={`flex-1 sm:flex-none px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm transition-all ${
//                             paymentFilter === "partial" 
//                               ? "bg-white text-blue-600 shadow-sm" 
//                               : "text-slate-500 hover:text-slate-700"
//                           }`}
//                         >
//                           Partial
//                         </button>
//                         <button
//                           onClick={() => setPaymentFilter("extra")}
//                           className={`flex-1 sm:flex-none px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm transition-all ${
//                             paymentFilter === "extra" 
//                               ? "bg-white text-blue-600 shadow-sm" 
//                               : "text-slate-500 hover:text-slate-700"
//                           }`}
//                         >
//                           Extra
//                         </button>
//                         <button
//                           onClick={() => setPaymentFilter("final")}
//                           className={`flex-1 sm:flex-none px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm transition-all ${
//                             paymentFilter === "final" 
//                               ? "bg-white text-blue-600 shadow-sm" 
//                               : "text-slate-500 hover:text-slate-700"
//                           }`}
//                         >
//                           Final
//                         </button>
//                       </div>
//                       <button 
//                         onClick={handleExportPayments}
//                         className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 hover:text-blue-600 px-3 py-2 bg-slate-50 rounded-lg w-full sm:w-auto justify-center"
//                       >
//                         <Download size={14} />
//                         Export
//                       </button>
//                     </div>

//                     {filteredPayments.length === 0 ? (
//                       <div className="text-center py-8 sm:py-12 bg-slate-50 rounded-xl px-4">
//                         <IndianRupee size={40} className="text-slate-300 mx-auto mb-3 sm:mb-4" />
//                         <p className="text-base sm:text-lg font-black text-slate-400">No Payments Found</p>
//                         <p className="text-xs sm:text-sm text-slate-300 mt-2">This customer hasn't made any payments yet.</p>
//                         <button
//                           onClick={handleCreateOrder}
//                           className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-sm"
//                         >
//                           Create Order
//                         </button>
//                       </div>
//                     ) : (
//                       <>
//                         <div className="space-y-3 sm:space-y-4">
//                           {currentPayments.map((payment) => (
//                             <div
//                               key={payment._id}
//                               className="bg-white p-3 sm:p-5 rounded-xl border border-slate-200 hover:shadow-lg transition-all cursor-pointer"
//                               onClick={() => handleViewPayment(payment._id)}
//                             >
//                               <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3 mb-3">
//                                 <div className="flex flex-wrap items-center gap-2">
//                                   <span className="font-black text-lg sm:text-xl lg:text-2xl text-green-600 break-words">
//                                     {formatCurrency(payment.amount)}
//                                   </span>
//                                   <span className={`text-[10px] sm:text-xs px-2 sm:px-3 py-1 rounded-full font-bold whitespace-nowrap ${
//                                     payment.type === 'full' ? 'bg-green-100 text-green-700' :
//                                     payment.type === 'advance' ? 'bg-blue-100 text-blue-700' :
//                                     payment.type === 'partial' ? 'bg-orange-100 text-orange-700' :
//                                     payment.type === 'extra' ? 'bg-purple-100 text-purple-700' :
//                                     payment.type === 'final-settlement' ? 'bg-indigo-100 text-indigo-700' :
//                                     'bg-slate-100 text-slate-700'
//                                   }`}>
//                                     {payment.type === 'final-settlement' ? 'FINAL' : payment.type.toUpperCase()}
//                                   </span>
//                                 </div>

//                                 {payment.order && (
//                                   <div className="bg-indigo-50 px-2 sm:px-3 py-1 rounded-lg w-fit">
//                                     <span className="text-[10px] sm:text-xs font-bold text-indigo-600">Order:</span>
//                                     <span className="ml-1 sm:ml-2 font-mono font-bold text-indigo-700 text-xs">
//                                       {payment.order?.orderId || payment.order}
//                                     </span>
//                                   </div>
//                                 )}
//                               </div>

//                               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
//                                 <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
//                                   <Calendar size={12} className="text-blue-500 flex-shrink-0" />
//                                   <div className="min-w-0 flex-1">
//                                     <p className="text-[10px] text-slate-400">Date & Time</p>
//                                     <p className="text-[10px] sm:text-xs font-medium break-words">
//                                       {formatDateTime(payment.paymentDate, payment.paymentTime)}
//                                     </p>
//                                   </div>
//                                 </div>

//                                 <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
//                                   {payment.method === 'cash' && <Banknote size={12} className="text-green-600 flex-shrink-0" />}
//                                   {payment.method === 'upi' && <Smartphone size={12} className="text-blue-600 flex-shrink-0" />}
//                                   {payment.method === 'card' && <CreditCard size={12} className="text-orange-600 flex-shrink-0" />}
//                                   {payment.method === 'bank-transfer' && <Landmark size={12} className="text-purple-600 flex-shrink-0" />}
//                                   <div className="min-w-0 flex-1">
//                                     <p className="text-[10px] text-slate-400">Method</p>
//                                     <p className="text-[10px] sm:text-xs font-medium capitalize break-words">{payment.method}</p>
//                                   </div>
//                                 </div>

//                                 {payment.referenceNumber && (
//                                   <div className="flex items-center gap-2 bg-purple-50 p-2 rounded-lg">
//                                     <Hash size={12} className="text-purple-500 flex-shrink-0" />
//                                     <div className="min-w-0 flex-1">
//                                       <p className="text-[10px] text-purple-400">Reference</p>
//                                       <p className="text-[10px] sm:text-xs font-mono font-medium text-purple-700 break-words">
//                                         {payment.referenceNumber}
//                                       </p>
//                                     </div>
//                                   </div>
//                                 )}

//                                 {payment.receivedBy && (
//                                   <div className="flex items-center gap-2 bg-blue-50 p-2 rounded-lg">
//                                     <User size={12} className="text-blue-500 flex-shrink-0" />
//                                     <div className="min-w-0 flex-1">
//                                       <p className="text-[10px] text-blue-400">Received By</p>
//                                       <p className="text-[10px] sm:text-xs font-medium break-words">
//                                         {payment.receivedBy?.name || payment.receivedBy}
//                                       </p>
//                                     </div>
//                                   </div>
//                                 )}
//                               </div>

//                               {payment.notes && (
//                                 <div className="mt-2 sm:mt-3 p-2 bg-amber-50 rounded-lg">
//                                   <p className="text-[10px] sm:text-xs text-amber-600 italic break-words">"{payment.notes}"</p>
//                                 </div>
//                               )}

//                               <div className="mt-2 sm:mt-3 flex justify-end">
//                                 <button className="text-blue-600 hover:text-blue-800 text-[10px] sm:text-xs font-bold flex items-center gap-1">
//                                   <Eye size={12} />
//                                   View Details
//                                 </button>
//                               </div>
//                             </div>
//                           ))}
//                         </div>

//                         {/* Pagination - Responsive */}
//                         {totalPaymentPages > 1 && (
//                           <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-200">
//                             <p className="text-[10px] sm:text-xs text-slate-500 order-2 sm:order-1">
//                               Showing {paymentStartIndex + 1} to {Math.min(paymentEndIndex, filteredPayments.length)} of {filteredPayments.length} payments
//                             </p>
//                             <div className="flex gap-2 order-1 sm:order-2">
//                               <button
//                                 onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
//                                 disabled={currentPage === 1}
//                                 className="px-2 sm:px-3 py-1 rounded bg-slate-100 disabled:opacity-50 flex items-center gap-1 text-xs"
//                               >
//                                 <ChevronLeftIcon size={12} />
//                                 <span className="hidden xs:inline">Prev</span>
//                               </button>
//                               <span className="px-2 sm:px-3 py-1 bg-blue-600 text-white rounded text-xs">
//                                 {currentPage} / {totalPaymentPages}
//                               </span>
//                               <button
//                                 onClick={() => setCurrentPage(p => Math.min(totalPaymentPages, p + 1))}
//                                 disabled={currentPage === totalPaymentPages}
//                                 className="px-2 sm:px-3 py-1 rounded bg-slate-100 disabled:opacity-50 flex items-center gap-1 text-xs"
//                               >
//                                 <span className="hidden xs:inline">Next</span>
//                                 <ChevronRight size={12} />
//                               </button>
//                             </div>
//                           </div>
//                         )}
//                       </>
//                     )}
//                   </div>
//                 )}

//                 {/* ORDERS TAB */}
//                 {activeTab === "orders" && (
//                   <div>
//                     {customerOrders?.length === 0 ? (
//                       <div className="text-center py-8 sm:py-12 bg-slate-50 rounded-xl px-4">
//                         <ShoppingBag size={40} className="text-slate-300 mx-auto mb-3 sm:mb-4" />
//                         <p className="text-base sm:text-lg font-black text-slate-400">No Orders Found</p>
//                         <p className="text-xs sm:text-sm text-slate-300 mt-2">This customer hasn't placed any orders yet.</p>
//                         <button
//                           onClick={handleCreateOrder}
//                           className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-sm"
//                         >
//                           Create First Order
//                         </button>
//                       </div>
//                     ) : (
//                       <>
//                         <div className="space-y-3 sm:space-y-4">
//                           {currentOrders.map((order) => (
//                             <div
//                               key={order._id}
//                               className="bg-white p-3 sm:p-5 rounded-xl border border-slate-200 hover:shadow-lg transition-all cursor-pointer"
//                               onClick={() => handleViewOrder(order._id)}
//                             >
//                               <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3">
//                                 <div className="flex-1 min-w-0">
//                                   <div className="flex flex-wrap items-center gap-2 mb-2">
//                                     <span className="font-mono font-bold text-indigo-600 text-xs sm:text-sm break-words">
//                                       {order.orderId}
//                                     </span>
//                                     <span className={`text-[10px] sm:text-xs px-2 py-1 rounded-full font-bold whitespace-nowrap ${
//                                       order.status === 'delivered' ? 'bg-green-100 text-green-700' :
//                                       order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
//                                       order.status === 'in-progress' ? 'bg-orange-100 text-orange-700' :
//                                       order.status === 'draft' ? 'bg-slate-100 text-slate-700' :
//                                       order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
//                                       'bg-purple-100 text-purple-700'
//                                     }`}>
//                                       {order.status}
//                                     </span>
//                                   </div>
                                  
//                                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
//                                     <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
//                                       <Calendar size={12} className="text-slate-400 flex-shrink-0" />
//                                       <span className="text-slate-600 break-words text-[10px] sm:text-xs">
//                                         Order: {formatDate(order.orderDate)}
//                                       </span>
//                                     </div>
//                                     <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
//                                       <Calendar size={12} className="text-slate-400 flex-shrink-0" />
//                                       <span className="text-slate-600 break-words text-[10px] sm:text-xs">
//                                         Delivery: {formatDate(order.deliveryDate)}
//                                       </span>
//                                     </div>
//                                     <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg sm:col-span-2 lg:col-span-1">
//                                       <IndianRupee size={12} className="text-slate-400 flex-shrink-0" />
//                                       <span className="text-slate-600 break-words text-[10px] sm:text-xs">
//                                         ₹{order.priceSummary?.totalMin?.toLocaleString()} - ₹{order.priceSummary?.totalMax?.toLocaleString()}
//                                       </span>
//                                     </div>
//                                   </div>
                                  
//                                   {order.paymentSummary && (
//                                     <div className="mt-2 flex flex-wrap items-center gap-2">
//                                       <span className="text-[10px] sm:text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
//                                         Paid: ₹{order.paymentSummary.totalPaid?.toLocaleString()}
//                                       </span>
//                                       <span className="text-[10px] sm:text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-full">
//                                         Balance: ₹{order.balanceAmount?.toLocaleString()}
//                                       </span>
//                                     </div>
//                                   )}
//                                 </div>
                                
//                                 <button className="text-blue-600 hover:text-blue-800 self-end sm:self-center">
//                                   <Eye size={16} />
//                                 </button>
//                               </div>
//                             </div>
//                           ))}
//                         </div>

//                         {/* Pagination - Responsive */}
//                         {totalOrderPages > 1 && (
//                           <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-200">
//                             <p className="text-[10px] sm:text-xs text-slate-500 order-2 sm:order-1">
//                               Showing {orderStartIndex + 1} to {Math.min(orderEndIndex, customerOrders.length)} of {customerOrders.length} orders
//                             </p>
//                             <div className="flex gap-2 order-1 sm:order-2">
//                               <button
//                                 onClick={() => setOrdersPage(p => Math.max(1, p - 1))}
//                                 disabled={ordersPage === 1}
//                                 className="px-2 sm:px-3 py-1 rounded bg-slate-100 disabled:opacity-50 flex items-center gap-1 text-xs"
//                               >
//                                 <ChevronLeftIcon size={12} />
//                                 <span className="hidden xs:inline">Prev</span>
//                               </button>
//                               <span className="px-2 sm:px-3 py-1 bg-blue-600 text-white rounded text-xs">
//                                 {ordersPage} / {totalOrderPages}
//                               </span>
//                               <button
//                                 onClick={() => setOrdersPage(p => Math.min(totalOrderPages, p + 1))}
//                                 disabled={ordersPage === totalOrderPages}
//                                 className="px-2 sm:px-3 py-1 rounded bg-slate-100 disabled:opacity-50 flex items-center gap-1 text-xs"
//                               >
//                                 <span className="hidden xs:inline">Next</span>
//                                 <ChevronRight size={12} />
//                               </button>
//                             </div>
//                           </div>
//                         )}
//                       </>
//                     )}
//                   </div>
//                 )}

//                 {/* MEASUREMENTS TAB */}
//                 {activeTab === "measurements" && (
//                   <div>
//                     {customerTemplates?.length === 0 ? (
//                       <div className="text-center py-8 sm:py-12 bg-slate-50 rounded-xl px-4">
//                         <Ruler size={40} className="text-slate-300 mx-auto mb-3 sm:mb-4" />
//                         <p className="text-base sm:text-lg font-black text-slate-400">No Saved Templates</p>
//                         <p className="text-xs sm:text-sm text-slate-300 mt-2">
//                           This customer hasn't saved any measurement templates yet.
//                         </p>
//                         <p className="text-[10px] sm:text-xs text-slate-400 mt-4">
//                           Templates can be saved when creating garments using the "Save as Template" button.
//                         </p>
//                       </div>
//                     ) : (
//                       <>
//                         <div className="space-y-3 sm:space-y-4">
//                           {currentTemplates.map((template) => (
//                             <div
//                               key={template._id}
//                               className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-all"
//                             >
//                               {/* Template Header */}
//                               <div className="p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-indigo-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
//                                 <div className="flex items-center gap-3 flex-1 min-w-0">
//                                   <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
//                                     <Bookmark size={14} />
//                                   </div>
//                                   <div className="min-w-0 flex-1">
//                                     <h4 className="font-bold text-sm sm:text-base text-slate-800 truncate">{template.name}</h4>
//                                     <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs text-slate-500">
//                                       <span>Used {template.usageCount || 1} times</span>
//                                       <span className="hidden xs:inline">•</span>
//                                       <span className="truncate">Last used: {formatDate(template.lastUsed || template.createdAt)}</span>
//                                     </div>
//                                   </div>
//                                 </div>
                                
//                                 <div className="flex items-center gap-2 self-end sm:self-center">
//                                   <button
//                                     onClick={(e) => {
//                                       e.stopPropagation();
//                                       handlePreviewMeasurements(template);
//                                     }}
//                                     className="p-1.5 sm:p-2 bg-white hover:bg-purple-100 text-purple-600 rounded-lg transition-all shadow-sm"
//                                     title="Preview Measurements"
//                                   >
//                                     <Eye size={14} />
//                                   </button>
                                  
//                                   <button
//                                     onClick={() => toggleTemplate(template._id)}
//                                     className="p-1.5 sm:p-2 bg-white hover:bg-purple-100 text-purple-600 rounded-lg transition-all shadow-sm"
//                                   >
//                                     {expandedTemplate === template._id ? (
//                                       <ChevronUp size={14} />
//                                     ) : (
//                                       <ChevronDown size={14} />
//                                     )}
//                                   </button>
//                                 </div>
//                               </div>

//                               {/* Template Details - Expandable */}
//                               {expandedTemplate === template._id && (
//                                 <div className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50">
//                                   <h5 className="text-xs sm:text-sm font-bold text-slate-700 mb-2 sm:mb-3 flex items-center gap-2">
//                                     <Scissors size={12} className="text-purple-600" />
//                                     Measurements
//                                   </h5>
//                                   <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
//                                     {template.measurements && Object.entries(template.measurements).map(([key, value]) => (
//                                       <div key={key} className="bg-white p-2 sm:p-3 rounded-lg border border-slate-200">
//                                         <p className="text-[10px] text-slate-500 capitalize mb-1 break-words">{key}</p>
//                                         <p className="text-xs sm:text-sm font-bold text-purple-700 break-words">
//                                           {value} <span className="text-[8px] sm:text-xs font-normal text-slate-400">inches</span>
//                                         </p>
//                                       </div>
//                                     ))}
//                                   </div>
                                  
//                                   {template.notes && (
//                                     <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-amber-50 rounded-lg">
//                                       <p className="text-[10px] text-amber-600 font-bold mb-1">Notes</p>
//                                       <p className="text-xs sm:text-sm text-amber-800 italic break-words">"{template.notes}"</p>
//                                     </div>
//                                   )}

//                                   {template.garmentReference && (
//                                     <div className="mt-2 text-[10px] sm:text-xs text-purple-600 break-words">
//                                       <span className="font-medium">From garment:</span> {template.garmentReference}
//                                     </div>
//                                   )}
//                                 </div>
//                               )}
//                             </div>
//                           ))}
//                         </div>

//                         {/* Pagination for Templates - Responsive */}
//                         {totalTemplatePages > 1 && (
//                           <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-200">
//                             <p className="text-[10px] sm:text-xs text-slate-500 order-2 sm:order-1">
//                               Showing {templateStartIndex + 1} to {Math.min(templateEndIndex, customerTemplates.length)} of {customerTemplates.length} templates
//                             </p>
//                             <div className="flex gap-2 order-1 sm:order-2">
//                               <button
//                                 onClick={() => setTemplatesPage(p => Math.max(1, p - 1))}
//                                 disabled={templatesPage === 1}
//                                 className="px-2 sm:px-3 py-1 rounded bg-slate-100 disabled:opacity-50 flex items-center gap-1 text-xs"
//                               >
//                                 <ChevronLeftIcon size={12} />
//                                 <span className="hidden xs:inline">Prev</span>
//                               </button>
//                               <span className="px-2 sm:px-3 py-1 bg-blue-600 text-white rounded text-xs">
//                                 {templatesPage} / {totalTemplatePages}
//                               </span>
//                               <button
//                                 onClick={() => setTemplatesPage(p => Math.min(totalTemplatePages, p + 1))}
//                                 disabled={templatesPage === totalTemplatePages}
//                                 className="px-2 sm:px-3 py-1 rounded bg-slate-100 disabled:opacity-50 flex items-center gap-1 text-xs"
//                               >
//                                 <span className="hidden xs:inline">Next</span>
//                                 <ChevronRight size={12} />
//                               </button>
//                             </div>
//                           </div>
//                         )}
//                       </>
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Measurement Preview Modal */}
//       <MeasurementPreviewModal
//         isOpen={showMeasurementPreview}
//         onClose={() => {
//           setShowMeasurementPreview(false);
//           setPreviewMeasurements(null);
//           setPreviewTemplateName("");
//         }}
//         measurements={previewMeasurements}
//         templateName={previewTemplateName}
//       />

//       {/* Delete Confirmation Modal - Responsive */}
//       {showDeleteModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
//           <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 mx-4">
//             <div className="p-4 sm:p-6">
//               <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
//                 <AlertCircle size={24} className="text-red-600" />
//               </div>
//               <h2 className="text-xl sm:text-2xl font-black text-center text-slate-800 mb-2">Delete Customer</h2>
//               <p className="text-sm sm:text-base text-center text-slate-500 mb-4 sm:mb-6">
//                 Are you sure you want to delete <span className="font-black text-slate-700">{customerFullName()}</span>? 
//                 This action cannot be undone.
//               </p>
//               <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
//                 <button
//                   onClick={() => setShowDeleteModal(false)}
//                   className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black transition-all text-sm sm:text-base"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleDelete}
//                   className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black transition-all text-sm sm:text-base"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }















import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  User, Phone, Mail, MapPin, Calendar, ShoppingBag, 
  ChevronLeft, PlusCircle, AlertCircle, Edit, Trash2, 
  Save, X, Hash, MessageCircle, FileText, Star, Cake,
  IndianRupee, CreditCard, TrendingUp, Eye, Ruler, 
  Receipt, Clock, Download, Filter, Banknote, Smartphone, 
  Landmark, Package, ChevronLeft as ChevronLeftIcon,
  ChevronRight, Bookmark, ChevronDown, ChevronUp, Scissors,
  Menu
} from "lucide-react";
import { 
  fetchCustomerById, 
  updateCustomer, 
  deleteCustomer,
  fetchCustomerPayments,
  fetchCustomerOrders,
  fetchCustomerTemplates
} from "../../../features/customer/customerSlice";
import showToast from "../../../utils/toast";
import { exportPaymentsToExcel } from "../../../utils/exportHelpers";
import MeasurementPreviewModal from "../../../components/MeasurementPreviewModal";

export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // 🚀 FIXED: Track first load to prevent "Not Found" flicker
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  
  // State selectors with customerTemplates
  const { currentCustomer, customerPayments, customerOrders, customerTemplates, loading } = useSelector((state) => {
    console.log("🔍 Customer state:", state.customer);
    return {
      currentCustomer: state.customer?.currentCustomer || null,
      customerPayments: state.customer?.customerPayments || [],
      customerOrders: state.customer?.customerOrders || [],
      customerTemplates: state.customer?.customerTemplates || [],
      loading: state.customer?.loading || false
    };
  });
  
  const { user } = useSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);
  const [templatesPage, setTemplatesPage] = useState(1);
  const [expandedTemplate, setExpandedTemplate] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // State for measurement preview modal
  const [showMeasurementPreview, setShowMeasurementPreview] = useState(false);
  const [previewMeasurements, setPreviewMeasurements] = useState(null);
  const [previewTemplateName, setPreviewTemplateName] = useState("");
  
  const itemsPerPage = 5;
  
  const [formData, setFormData] = useState({
    salutation: "Mr.",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    phone: "",
    whatsappNumber: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    notes: ""
  });

  // Get base path based on user role
  const rolePath = user?.role === "ADMIN" ? "/admin" : 
                   user?.role === "STORE_KEEPER" ? "/storekeeper" : 
                   "/cuttingmaster";

  // Check if user can perform CRUD operations
  const canEdit = user?.role === "ADMIN" || user?.role === "STORE_KEEPER";
  const canDelete = user?.role === "ADMIN" || user?.role === "STORE_KEEPER";

  // 🚀 FIXED: Fetch customer data on mount with hasLoadedOnce tracking
  useEffect(() => {
    if (id) {
      console.log("🔍 Fetching customer details for ID:", id);
      setHasLoadedOnce(false); // Reset when ID changes
      
      Promise.all([
        dispatch(fetchCustomerById(id)),
        dispatch(fetchCustomerPayments(id)),
        dispatch(fetchCustomerOrders(id)),
        dispatch(fetchCustomerTemplates(id))
      ]).finally(() => {
        // Mark as loaded after all requests complete
        setHasLoadedOnce(true);
      });
    }
  }, [id, dispatch]);

  // Load customer data into form
  useEffect(() => {
    if (currentCustomer) {
      setFormData({
        salutation: currentCustomer.salutation || "Mr.",
        firstName: currentCustomer.firstName || "",
        lastName: currentCustomer.lastName || "",
        dateOfBirth: currentCustomer.dateOfBirth ? currentCustomer.dateOfBirth.split('T')[0] : "",
        phone: currentCustomer.phone || "",
        whatsappNumber: currentCustomer.whatsappNumber || "",
        email: currentCustomer.email || "",
        addressLine1: currentCustomer.addressLine1 || "",
        addressLine2: currentCustomer.addressLine2 || "",
        city: currentCustomer.city || "",
        state: currentCustomer.state || "",
        pincode: currentCustomer.pincode || "",
        notes: currentCustomer.notes || ""
      });
    }
  }, [currentCustomer]);

  // Payment statistics
  const paymentStats = {
    totalPaid: customerPayments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
    totalPayments: customerPayments?.length || 0,
    lastPayment: customerPayments?.length > 0 ? customerPayments[customerPayments.length - 1] : null,
    advancePayments: customerPayments?.filter(p => p.type === 'advance').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
    fullPayments: customerPayments?.filter(p => p.type === 'full').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
    partialPayments: customerPayments?.filter(p => p.type === 'partial').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
    extraPayments: customerPayments?.filter(p => p.type === 'extra').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
    finalSettlementPayments: customerPayments?.filter(p => p.type === 'full' || p.type === 'final-settlement').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
    byMethod: {
      cash: customerPayments?.filter(p => p.method === 'cash').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
      upi: customerPayments?.filter(p => p.method === 'upi').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
      card: customerPayments?.filter(p => p.method === 'card').reduce((sum, p) => sum + (p.amount || 0), 0) || 0,
      'bank-transfer': customerPayments?.filter(p => p.method === 'bank-transfer').reduce((sum, p) => sum + (p.amount || 0), 0) || 0
    }
  };

  // Filter payments
  const filteredPayments = customerPayments?.filter(p => {
    if (paymentFilter === "all") return true;
    if (paymentFilter === "final") return p.type === "full" || p.type === "final-settlement";
    return p.type === paymentFilter;
  }) || [];

  // Pagination for payments
  const totalPaymentPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paymentStartIndex = (currentPage - 1) * itemsPerPage;
  const paymentEndIndex = paymentStartIndex + itemsPerPage;
  const currentPayments = filteredPayments.slice(paymentStartIndex, paymentEndIndex);

  // Pagination for orders
  const totalOrderPages = Math.ceil((customerOrders?.length || 0) / itemsPerPage);
  const orderStartIndex = (ordersPage - 1) * itemsPerPage;
  const orderEndIndex = orderStartIndex + itemsPerPage;
  const currentOrders = customerOrders?.slice(orderStartIndex, orderEndIndex) || [];

  // Pagination for templates
  const totalTemplatePages = Math.ceil((customerTemplates?.length || 0) / itemsPerPage);
  const templateStartIndex = (templatesPage - 1) * itemsPerPage;
  const templateEndIndex = templateStartIndex + itemsPerPage;
  const currentTemplates = customerTemplates?.slice(templateStartIndex, templateEndIndex) || [];

  // Handler for preview measurements
  const handlePreviewMeasurements = (template) => {
    setPreviewMeasurements(template.measurements);
    setPreviewTemplateName(template.name);
    setShowMeasurementPreview(true);
  };

  const handleBack = () => {
    navigate(`${rolePath}/customers`);
  };

  const handleCreateOrder = () => {
    const customerData = {
      _id: currentCustomer._id,
      customerId: currentCustomer.customerId,
      salutation: currentCustomer.salutation,
      firstName: currentCustomer.firstName,
      lastName: currentCustomer.lastName,
      phone: currentCustomer.phone,
      email: currentCustomer.email
    };
    
    navigate(`${rolePath}/orders/new`, { 
      state: { customer: customerData }
    });
  };

  const handleViewOrder = (orderId) => {
    navigate(`${rolePath}/orders/${orderId}`);
  };

  const handleViewPayment = (paymentId) => {
    navigate(`${rolePath}/payments/${paymentId}`);
  };

  const handleViewMeasurements = () => {
    navigate(`${rolePath}/customer-size/${currentCustomer._id}`);
  };

  const handleExportPayments = () => {
    const customerInfo = {
      customerId: currentCustomer?.customerId,
      name: customerFullName()
    };
    exportPaymentsToExcel(customerPayments, customerInfo);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (currentCustomer) {
      setFormData({
        salutation: currentCustomer.salutation || "Mr.",
        firstName: currentCustomer.firstName || "",
        lastName: currentCustomer.lastName || "",
        dateOfBirth: currentCustomer.dateOfBirth ? currentCustomer.dateOfBirth.split('T')[0] : "",
        phone: currentCustomer.phone || "",
        whatsappNumber: currentCustomer.whatsappNumber || "",
        email: currentCustomer.email || "",
        addressLine1: currentCustomer.addressLine1 || "",
        addressLine2: currentCustomer.addressLine2 || "",
        city: currentCustomer.city || "",
        state: currentCustomer.state || "",
        pincode: currentCustomer.pincode || "",
        notes: currentCustomer.notes || ""
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === "phone" || name === "whatsappNumber" || name === "pincode") {
      const numericValue = value.replace(/\D/g, '');
      const maxLength = name === "pincode" ? 6 : 10;
      const truncated = numericValue.slice(0, maxLength);
      setFormData(prev => ({ ...prev, [name]: truncated }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdate = async () => {
    try {
      const updateData = {
        salutation: formData.salutation,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth || undefined,
        phone: formData.phone,
        whatsappNumber: formData.whatsappNumber,
        email: formData.email,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        notes: formData.notes
      };

      await dispatch(updateCustomer({ id, customerData: updateData })).unwrap();
      showToast.success("Customer updated successfully! ✅");
      setIsEditing(false);
      dispatch(fetchCustomerById(id));
    } catch (error) {
      showToast.error(error.message || "Failed to update customer");
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteCustomer(id)).unwrap();
      showToast.success("Customer deleted successfully! 🗑️");
      setShowDeleteModal(false);
      navigate(`${rolePath}/customers`);
    } catch (error) {
      showToast.error(error.message || "Failed to delete customer");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric'
    });
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

  const formatDisplayDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const calculateAge = (dateString) => {
    if (!dateString) return null;
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const isVIP = currentCustomer?.notes?.toLowerCase().includes('vip');

  const customerFullName = () => {
    if (!currentCustomer) return 'Customer';
    
    let name = '';
    if (currentCustomer.firstName || currentCustomer.lastName) {
      const firstName = currentCustomer.firstName || '';
      const lastName = currentCustomer.lastName || '';
      name = `${firstName} ${lastName}`.trim();
    }
    
    if (currentCustomer.salutation && name) {
      return `${currentCustomer.salutation} ${name}`.trim();
    }
    return name || 'Customer';
  };

  const age = calculateAge(currentCustomer?.dateOfBirth);

  // Toggle template expansion
  const toggleTemplate = (templateId) => {
    setExpandedTemplate(expandedTemplate === templateId ? null : templateId);
  };

  // 🚀 FIXED: Show loading state MORE aggressively to prevent "Not Found" flicker
  // Show loading if:
  // 1. Redux says it's loading
  // 2. OR we haven't loaded once yet AND we don't have customer data
  // 3. OR we have an ID but no customer data and still loading
  if (loading || (!hasLoadedOnce && id) || (id && !currentCustomer && !hasLoadedOnce)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center px-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-sm sm:text-base text-slate-500 font-medium">Loading customer details...</p>
        </div>
      </div>
    );
  }

  // 🚀 FIXED: Only show "Not Found" when we're SURE loading is complete AND no customer exists
  if (!currentCustomer && hasLoadedOnce && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm p-6 sm:p-8 max-w-md w-full text-center">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 mb-2">Customer Not Found</h2>
          <p className="text-sm sm:text-base text-slate-500 mb-6">The customer you're looking for doesn't exist.</p>
          <button
            onClick={handleBack}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base w-full sm:w-auto"
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
            <ChevronLeft size={20} />
            <span className="font-bold text-sm">Back</span>
          </button>
          <h1 className="text-lg font-black text-slate-800 truncate max-w-[150px]">
            {customerFullName()}
          </h1>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-slate-100 rounded-xl transition-all flex items-center justify-center"
            style={{ minWidth: '40px', minHeight: '40px' }}
          >
            <Menu size={20} />
          </button>
        </div>
        
        {/* Mobile Action Menu - Like PaymentDetails */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg p-4 z-40 animate-in slide-in-from-top duration-300">
            <div className="space-y-2">
              <button
                onClick={() => {
                  handleCreateOrder();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 text-green-600 rounded-lg font-bold hover:bg-green-100 transition-colors"
              >
                <PlusCircle size={18} />
                New Order
              </button>
              
              <button
                onClick={() => {
                  handleViewMeasurements();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-purple-50 text-purple-600 rounded-lg font-bold hover:bg-purple-100 transition-colors"
              >
                <Ruler size={18} />
                Measurements
              </button>
              
              {canEdit && !isEditing && (
                <button
                  onClick={() => {
                    handleEdit();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-lg font-bold hover:bg-blue-100 transition-colors"
                >
                  <Edit size={18} />
                  Edit Customer
                </button>
              )}
              
              {canDelete && (
                <button
                  onClick={() => {
                    setShowDeleteModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 text-red-600 rounded-lg font-bold hover:bg-red-100 transition-colors"
                >
                  <Trash2 size={18} />
                  Delete Customer
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Desktop Header with Back Button and Actions - Hidden on Mobile */}
        <div className="hidden lg:flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold">Back to Customers</span>
          </button>
          
          <div className="flex items-center gap-3">
            {canEdit && !isEditing && (
              <>
                <button
                  onClick={handleEdit}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all"
                >
                  <Edit size={18} />
                  Edit
                </button>
                {canDelete && (
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-red-500/30 transition-all"
                  >
                    <Trash2 size={18} />
                    Delete
                  </button>
                )}
              </>
            )}
            
            <button
              onClick={handleCreateOrder}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-green-500/30 transition-all hover:scale-105"
            >
              <PlusCircle size={18} />
              New Order
            </button>

            <button
              onClick={handleViewMeasurements}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-purple-500/30 transition-all hover:scale-105"
            >
              <Ruler size={18} />
              Measurements
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          {isEditing ? (
            /* EDIT MODE - Responsive */
            <div className="p-4 sm:p-6 lg:p-8">
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 mb-4 sm:mb-6">Edit Customer</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-500 mb-1">Salutation</label>
                    <select
                      name="salutation"
                      value={formData.salutation}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="Mr.">Mr.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Dr.">Dr.</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-500 mb-1">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-500 mb-1">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-500 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-500 mb-1">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      maxLength="10"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-500 mb-1">WhatsApp</label>
                    <input
                      type="tel"
                      name="whatsappNumber"
                      value={formData.whatsappNumber}
                      onChange={handleChange}
                      maxLength="10"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-black uppercase text-slate-500 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-black uppercase text-slate-500 mb-1">Address Line 1</label>
                    <input
                      type="text"
                      name="addressLine1"
                      value={formData.addressLine1}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-black uppercase text-slate-500 mb-1">Address Line 2</label>
                    <input
                      type="text"
                      name="addressLine2"
                      value={formData.addressLine2}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-500 mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-500 mb-1">State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-slate-500 mb-1">Pincode</label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      maxLength="6"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-500 mb-1">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
                  <button
                    onClick={handleUpdate}
                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm"
                  >
                    <Save size={18} />
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="w-full sm:w-auto bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* VIEW MODE - Responsive */
            <div className="p-4 sm:p-6 lg:p-8">
              {/* VIP Badge */}
              {isVIP && (
                <div className="mb-4">
                  <span className="bg-yellow-100 text-yellow-700 px-2 sm:px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
                    <Star size={12} />
                    VIP CUSTOMER
                  </span>
                </div>
              )}

              {/* Header with Avatar and Basic Info - Responsive */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-xl mx-auto sm:mx-0">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-black">
                    {customerFullName().charAt(0) || 'C'}
                  </span>
                </div>
                
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 mb-2">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-800 break-words">
                      {customerFullName()}
                    </h1>
                  </div>
                  
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-indigo-600 bg-indigo-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg w-fit mx-auto sm:mx-0">
                    <Hash size={14} />
                    <span className="font-mono font-bold text-xs sm:text-sm">{currentCustomer.customerId}</span>
                  </div>
                </div>
              </div>

              {/* Payment Summary Cards - Responsive Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="bg-blue-50 p-3 sm:p-4 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <IndianRupee size={16} className="text-blue-600" />
                    </div>
                    <p className="text-[10px] sm:text-xs text-blue-600 font-bold uppercase">Total Paid</p>
                  </div>
                  <p className="text-lg sm:text-xl lg:text-2xl font-black text-blue-700 break-words">
                    {formatCurrency(paymentStats.totalPaid)}
                  </p>
                  <p className="text-[10px] sm:text-xs text-blue-500 mt-1">{paymentStats.totalPayments} payments</p>
                </div>

                <div className="bg-green-50 p-3 sm:p-4 rounded-xl border border-green-100">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CreditCard size={16} className="text-green-600" />
                    </div>
                    <p className="text-[10px] sm:text-xs text-green-600 font-bold uppercase">Last Payment</p>
                  </div>
                  <p className="text-lg sm:text-xl lg:text-2xl font-black text-green-700 break-words">
                    {paymentStats.lastPayment ? formatCurrency(paymentStats.lastPayment.amount) : '₹0'}
                  </p>
                  <p className="text-[10px] sm:text-xs text-green-500 mt-1 truncate">
                    {paymentStats.lastPayment ? formatDateTime(paymentStats.lastPayment.paymentDate, paymentStats.lastPayment.paymentTime) : 'No payments'}
                  </p>
                </div>

                <div className="bg-purple-50 p-3 sm:p-4 rounded-xl border border-purple-100">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <ShoppingBag size={16} className="text-purple-600" />
                    </div>
                    <p className="text-[10px] sm:text-xs text-purple-600 font-bold uppercase">Total Orders</p>
                  </div>
                  <p className="text-lg sm:text-xl lg:text-2xl font-black text-purple-700">{customerOrders?.length || 0}</p>
                  <p className="text-[10px] sm:text-xs text-purple-500 mt-1">
                    {customerOrders?.filter(o => o.status === 'delivered').length || 0} completed
                  </p>
                </div>

                <div className="bg-orange-50 p-3 sm:p-4 rounded-xl border border-orange-100 sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <TrendingUp size={16} className="text-orange-600" />
                    </div>
                    <p className="text-[10px] sm:text-xs text-orange-600 font-bold uppercase">Payment Methods</p>
                  </div>
                  <div className="space-y-1">
                    {Object.entries(paymentStats.byMethod).map(([method, amount]) => (
                      amount > 0 && (
                        <div key={method} className="flex justify-between text-[10px] sm:text-xs">
                          <span className="text-slate-600 capitalize">{method}:</span>
                          <span className="font-bold text-orange-700">{formatCurrency(amount)}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </div>

              {/* Tabs Navigation - Visible on both Mobile and Desktop */}
              <div className="border-b border-slate-200 mb-6 overflow-x-auto">
                <div className="flex gap-4 sm:gap-6 min-w-max sm:min-w-0">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`pb-3 px-1 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all whitespace-nowrap ${
                      activeTab === "overview" 
                        ? "text-blue-600 border-b-2 border-blue-600" 
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <User size={16} className="inline mr-1 sm:mr-2" />
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab("payments")}
                    className={`pb-3 px-1 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all whitespace-nowrap ${
                      activeTab === "payments" 
                        ? "text-blue-600 border-b-2 border-blue-600" 
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <IndianRupee size={16} className="inline mr-1 sm:mr-2" />
                    Payments ({customerPayments?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className={`pb-3 px-1 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all whitespace-nowrap ${
                      activeTab === "orders" 
                        ? "text-blue-600 border-b-2 border-blue-600" 
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <ShoppingBag size={16} className="inline mr-1 sm:mr-2" />
                    Orders ({customerOrders?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveTab("measurements")}
                    className={`pb-3 px-1 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all whitespace-nowrap ${
                      activeTab === "measurements" 
                        ? "text-blue-600 border-b-2 border-blue-600" 
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <Ruler size={16} className="inline mr-1 sm:mr-2" />
                    Measurements ({customerTemplates?.length || 0})
                  </button>
                </div>
              </div>

              {/* Tab Content - Responsive */}
              <div className="min-h-[300px] sm:min-h-[400px]">
                {/* OVERVIEW TAB */}
                {activeTab === "overview" && (
                  <div>
                    {/* Contact Information Grid - Responsive */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                      <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-blue-50 rounded-xl">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                          <Phone size={20} className="text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] sm:text-xs text-blue-600 font-bold uppercase">Phone</p>
                          <p className="text-sm sm:text-base lg:text-xl font-bold text-slate-800 break-words">
                            {currentCustomer.phone}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-green-50 rounded-xl">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                          <MessageCircle size={20} className="text-green-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] sm:text-xs text-green-600 font-bold uppercase">WhatsApp</p>
                          <p className="text-sm sm:text-base lg:text-xl font-bold text-slate-800 break-words">
                            {currentCustomer.whatsappNumber || currentCustomer.phone}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-purple-50 rounded-xl sm:col-span-2 lg:col-span-1">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                          <Mail size={20} className="text-purple-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] sm:text-xs text-purple-600 font-bold uppercase">Email</p>
                          <p className="text-sm sm:text-base lg:text-xl font-bold text-slate-800 break-all">
                            {currentCustomer.email || '—'}
                          </p>
                        </div>
                      </div>

                      {currentCustomer.dateOfBirth && (
                        <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-pink-50 rounded-xl">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-100 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                            <Cake size={20} className="text-pink-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] sm:text-xs text-pink-600 font-bold uppercase">Date of Birth</p>
                            <p className="text-sm sm:text-base lg:text-xl font-bold text-slate-800 break-words">
                              {formatDisplayDate(currentCustomer.dateOfBirth)}
                              {age && <span className="text-xs sm:text-sm font-normal text-slate-500 ml-1 sm:ml-2">({age} years)</span>}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Address Section - Responsive */}
                    {(currentCustomer.addressLine1 || currentCustomer.city) && (
                      <div className="mb-6 sm:mb-8">
                        <h2 className="text-base sm:text-lg font-black text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
                          <MapPin size={18} className="text-blue-600" />
                          Address
                        </h2>
                        <div className="bg-slate-50 p-4 sm:p-6 rounded-xl border border-slate-200">
                          <p className="text-sm sm:text-base text-slate-700 font-medium break-words">
                            {currentCustomer.addressLine1}
                          </p>
                          {currentCustomer.addressLine2 && (
                            <p className="text-sm text-slate-600 mt-1 break-words">{currentCustomer.addressLine2}</p>
                          )}
                          {(currentCustomer.city || currentCustomer.state || currentCustomer.pincode) && (
                            <p className="text-sm text-slate-600 mt-1 break-words">
                              {[currentCustomer.city, currentCustomer.state, currentCustomer.pincode].filter(Boolean).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Notes Section - Responsive */}
                    {currentCustomer.notes && (
                      <div className="mb-6 sm:mb-8">
                        <h2 className="text-base sm:text-lg font-black text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
                          <FileText size={18} className="text-blue-600" />
                          Notes
                        </h2>
                        <div className="bg-amber-50 p-4 sm:p-6 rounded-xl border border-amber-200">
                          <p className="text-sm sm:text-base text-amber-800 italic break-words">
                            "{currentCustomer.notes}"
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Customer Since - Responsive */}
                    <div className="text-xs sm:text-sm text-slate-400 border-t border-slate-100 pt-4 sm:pt-6">
                      <p>Customer since: {formatDate(currentCustomer.createdAt)}</p>
                      {currentCustomer.updatedAt !== currentCustomer.createdAt && (
                        <p className="mt-1">Last updated: {formatDate(currentCustomer.updatedAt)}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* PAYMENTS TAB */}
                {activeTab === "payments" && (
                  <div>
                    {/* Payment Filters - Responsive */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
                      <div className="flex flex-wrap gap-1 sm:gap-2 bg-slate-100 p-1 rounded-lg w-full sm:w-auto">
                        <button
                          onClick={() => setPaymentFilter("all")}
                          className={`flex-1 sm:flex-none px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm transition-all ${
                            paymentFilter === "all" 
                              ? "bg-white text-blue-600 shadow-sm" 
                              : "text-slate-500 hover:text-slate-700"
                          }`}
                        >
                          All
                        </button>
                        <button
                          onClick={() => setPaymentFilter("advance")}
                          className={`flex-1 sm:flex-none px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm transition-all ${
                            paymentFilter === "advance" 
                              ? "bg-white text-blue-600 shadow-sm" 
                              : "text-slate-500 hover:text-slate-700"
                          }`}
                        >
                          Advance
                        </button>
                        <button
                          onClick={() => setPaymentFilter("full")}
                          className={`flex-1 sm:flex-none px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold text-xs sm:text-sm transition-all ${
                            paymentFilter === "full" 
                              ? "bg-white text-blue-600 shadow-sm" 
                              : "text-slate-500 hover:text-slate-700"
                          }`}
                        >
                          Full
                        </button>

                      </div>
                      <button 
                        onClick={handleExportPayments}
                        className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 hover:text-blue-600 px-3 py-2 bg-slate-50 rounded-lg w-full sm:w-auto justify-center"
                      >
                        <Download size={14} />
                        Export
                      </button>
                    </div>

                    {filteredPayments.length === 0 ? (
                      <div className="text-center py-8 sm:py-12 bg-slate-50 rounded-xl px-4">
                        <IndianRupee size={40} className="text-slate-300 mx-auto mb-3 sm:mb-4" />
                        <p className="text-base sm:text-lg font-black text-slate-400">No Payments Found</p>
                        <p className="text-xs sm:text-sm text-slate-300 mt-2">This customer hasn't made any payments yet.</p>
                        <button
                          onClick={handleCreateOrder}
                          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-sm"
                        >
                          Create Order
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-3 sm:space-y-4">
                          {currentPayments.map((payment) => (
                            <div
                              key={payment._id}
                              className="bg-white p-3 sm:p-5 rounded-xl border border-slate-200 hover:shadow-lg transition-all cursor-pointer"
                              onClick={() => handleViewPayment(payment._id)}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3 mb-3">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-black text-lg sm:text-xl lg:text-2xl text-green-600 break-words">
                                    {formatCurrency(payment.amount)}
                                  </span>
                                  <span className={`text-[10px] sm:text-xs px-2 sm:px-3 py-1 rounded-full font-bold whitespace-nowrap ${
                                    ['full', 'final-settlement'].includes(payment.type) ? 'bg-green-100 text-green-700' :
                                    ['advance', 'partial'].includes(payment.type) ? 'bg-blue-100 text-blue-700' :
                                    'bg-slate-100 text-slate-700'
                                  }`}>
                                    {['full', 'final-settlement'].includes(payment.type) ? 'FULL' : ['advance', 'partial'].includes(payment.type) ? 'ADVANCE' : payment.type.toUpperCase()}
                                  </span>
                                </div>

                                {payment.order && (
                                  <div className="bg-indigo-50 px-2 sm:px-3 py-1 rounded-lg w-fit">
                                    <span className="text-[10px] sm:text-xs font-bold text-indigo-600">Order:</span>
                                    <span className="ml-1 sm:ml-2 font-mono font-bold text-indigo-700 text-xs">
                                      {payment.order?.orderId || payment.order}
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                                <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
                                  <Calendar size={12} className="text-blue-500 flex-shrink-0" />
                                  <div className="min-w-0 flex-1">
                                    <p className="text-[10px] text-slate-400">Date & Time</p>
                                    <p className="text-[10px] sm:text-xs font-medium break-words">
                                      {formatDateTime(payment.paymentDate, payment.paymentTime)}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
                                  {payment.method === 'cash' && <Banknote size={12} className="text-green-600 flex-shrink-0" />}
                                  {payment.method === 'upi' && <Smartphone size={12} className="text-blue-600 flex-shrink-0" />}
                                  {payment.method === 'card' && <CreditCard size={12} className="text-orange-600 flex-shrink-0" />}
                                  {payment.method === 'bank-transfer' && <Landmark size={12} className="text-purple-600 flex-shrink-0" />}
                                  <div className="min-w-0 flex-1">
                                    <p className="text-[10px] text-slate-400">Method</p>
                                    <p className="text-[10px] sm:text-xs font-medium capitalize break-words">{payment.method}</p>
                                  </div>
                                </div>

                                {payment.referenceNumber && (
                                  <div className="flex items-center gap-2 bg-purple-50 p-2 rounded-lg">
                                    <Hash size={12} className="text-purple-500 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                      <p className="text-[10px] text-purple-400">Reference</p>
                                      <p className="text-[10px] sm:text-xs font-mono font-medium text-purple-700 break-words">
                                        {payment.referenceNumber}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {payment.receivedBy && (
                                  <div className="flex items-center gap-2 bg-blue-50 p-2 rounded-lg">
                                    <User size={12} className="text-blue-500 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                      <p className="text-[10px] text-blue-400">Received By</p>
                                      <p className="text-[10px] sm:text-xs font-medium break-words">
                                        {payment.receivedBy?.name || payment.receivedBy}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {payment.notes && (
                                <div className="mt-2 sm:mt-3 p-2 bg-amber-50 rounded-lg">
                                  <p className="text-[10px] sm:text-xs text-amber-600 italic break-words">"{payment.notes}"</p>
                                </div>
                              )}

                              <div className="mt-2 sm:mt-3 flex justify-end">
                                <button className="text-blue-600 hover:text-blue-800 text-[10px] sm:text-xs font-bold flex items-center gap-1">
                                  <Eye size={12} />
                                  View Details
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Pagination - Responsive */}
                        {totalPaymentPages > 1 && (
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-200">
                            <p className="text-[10px] sm:text-xs text-slate-500 order-2 sm:order-1">
                              Showing {paymentStartIndex + 1} to {Math.min(paymentEndIndex, filteredPayments.length)} of {filteredPayments.length} payments
                            </p>
                            <div className="flex gap-2 order-1 sm:order-2">
                              <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-2 sm:px-3 py-1 rounded bg-slate-100 disabled:opacity-50 flex items-center gap-1 text-xs"
                              >
                                <ChevronLeftIcon size={12} />
                                <span className="hidden xs:inline">Prev</span>
                              </button>
                              <span className="px-2 sm:px-3 py-1 bg-blue-600 text-white rounded text-xs">
                                {currentPage} / {totalPaymentPages}
                              </span>
                              <button
                                onClick={() => setCurrentPage(p => Math.min(totalPaymentPages, p + 1))}
                                disabled={currentPage === totalPaymentPages}
                                className="px-2 sm:px-3 py-1 rounded bg-slate-100 disabled:opacity-50 flex items-center gap-1 text-xs"
                              >
                                <span className="hidden xs:inline">Next</span>
                                <ChevronRight size={12} />
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* ORDERS TAB */}
                {activeTab === "orders" && (
                  <div>
                    {customerOrders?.length === 0 ? (
                      <div className="text-center py-8 sm:py-12 bg-slate-50 rounded-xl px-4">
                        <ShoppingBag size={40} className="text-slate-300 mx-auto mb-3 sm:mb-4" />
                        <p className="text-base sm:text-lg font-black text-slate-400">No Orders Found</p>
                        <p className="text-xs sm:text-sm text-slate-300 mt-2">This customer hasn't placed any orders yet.</p>
                        <button
                          onClick={handleCreateOrder}
                          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-sm"
                        >
                          Create First Order
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-3 sm:space-y-4">
                          {currentOrders.map((order) => (
                            <div
                              key={order._id}
                              className="bg-white p-3 sm:p-5 rounded-xl border border-slate-200 hover:shadow-lg transition-all cursor-pointer"
                              onClick={() => handleViewOrder(order._id)}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <span className="font-mono font-bold text-indigo-600 text-xs sm:text-sm break-words">
                                      {order.orderId}
                                    </span>
                                    <span className={`text-[10px] sm:text-xs px-2 py-1 rounded-full font-bold whitespace-nowrap ${
                                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                      order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                                      order.status === 'in-progress' ? 'bg-orange-100 text-orange-700' :
                                      order.status === 'draft' ? 'bg-slate-100 text-slate-700' :
                                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                      'bg-purple-100 text-purple-700'
                                    }`}>
                                      {order.status}
                                    </span>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
                                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
                                      <Calendar size={12} className="text-slate-400 flex-shrink-0" />
                                      <span className="text-slate-600 break-words text-[10px] sm:text-xs">
                                        Order: {formatDate(order.orderDate)}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
                                      <Calendar size={12} className="text-slate-400 flex-shrink-0" />
                                      <span className="text-slate-600 break-words text-[10px] sm:text-xs">
                                        Delivery: {formatDate(order.deliveryDate)}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg sm:col-span-2 lg:col-span-1">
                                      <IndianRupee size={12} className="text-slate-400 flex-shrink-0" />
                                      <span className="text-slate-600 break-words text-[10px] sm:text-xs">
                                        ₹{order.priceSummary?.totalMin?.toLocaleString()} - ₹{order.priceSummary?.totalMax?.toLocaleString()}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {order.paymentSummary && (
                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                      <span className="text-[10px] sm:text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
                                        Paid: ₹{order.paymentSummary.totalPaid?.toLocaleString()}
                                      </span>
                                      <span className="text-[10px] sm:text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-full">
                                        Balance: ₹{order.balanceAmount?.toLocaleString()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                
                                <button className="text-blue-600 hover:text-blue-800 self-end sm:self-center">
                                  <Eye size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Pagination - Responsive */}
                        {totalOrderPages > 1 && (
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-200">
                            <p className="text-[10px] sm:text-xs text-slate-500 order-2 sm:order-1">
                              Showing {orderStartIndex + 1} to {Math.min(orderEndIndex, customerOrders.length)} of {customerOrders.length} orders
                            </p>
                            <div className="flex gap-2 order-1 sm:order-2">
                              <button
                                onClick={() => setOrdersPage(p => Math.max(1, p - 1))}
                                disabled={ordersPage === 1}
                                className="px-2 sm:px-3 py-1 rounded bg-slate-100 disabled:opacity-50 flex items-center gap-1 text-xs"
                              >
                                <ChevronLeftIcon size={12} />
                                <span className="hidden xs:inline">Prev</span>
                              </button>
                              <span className="px-2 sm:px-3 py-1 bg-blue-600 text-white rounded text-xs">
                                {ordersPage} / {totalOrderPages}
                              </span>
                              <button
                                onClick={() => setOrdersPage(p => Math.min(totalOrderPages, p + 1))}
                                disabled={ordersPage === totalOrderPages}
                                className="px-2 sm:px-3 py-1 rounded bg-slate-100 disabled:opacity-50 flex items-center gap-1 text-xs"
                              >
                                <span className="hidden xs:inline">Next</span>
                                <ChevronRight size={12} />
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* MEASUREMENTS TAB */}
                {activeTab === "measurements" && (
                  <div>
                    {customerTemplates?.length === 0 ? (
                      <div className="text-center py-8 sm:py-12 bg-slate-50 rounded-xl px-4">
                        <Ruler size={40} className="text-slate-300 mx-auto mb-3 sm:mb-4" />
                        <p className="text-base sm:text-lg font-black text-slate-400">No Saved Templates</p>
                        <p className="text-xs sm:text-sm text-slate-300 mt-2">
                          This customer hasn't saved any measurement templates yet.
                        </p>
                        <p className="text-[10px] sm:text-xs text-slate-400 mt-4">
                          Templates can be saved when creating garments using the "Save as Template" button.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-3 sm:space-y-4">
                          {currentTemplates.map((template) => (
                            <div
                              key={template._id}
                              className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-all"
                            >
                              {/* Template Header */}
                              <div className="p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-indigo-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                                    <Bookmark size={14} />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h4 className="font-bold text-sm sm:text-base text-slate-800 truncate">{template.name}</h4>
                                    <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs text-slate-500">
                                      <span>Used {template.usageCount || 1} times</span>
                                      <span className="hidden xs:inline">•</span>
                                      <span className="truncate">Last used: {formatDate(template.lastUsed || template.createdAt)}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2 self-end sm:self-center">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePreviewMeasurements(template);
                                    }}
                                    className="p-1.5 sm:p-2 bg-white hover:bg-purple-100 text-purple-600 rounded-lg transition-all shadow-sm"
                                    title="Preview Measurements"
                                  >
                                    <Eye size={14} />
                                  </button>
                                  
                                  <button
                                    onClick={() => toggleTemplate(template._id)}
                                    className="p-1.5 sm:p-2 bg-white hover:bg-purple-100 text-purple-600 rounded-lg transition-all shadow-sm"
                                  >
                                    {expandedTemplate === template._id ? (
                                      <ChevronUp size={14} />
                                    ) : (
                                      <ChevronDown size={14} />
                                    )}
                                  </button>
                                </div>
                              </div>

                              {/* Template Details - Expandable */}
                              {expandedTemplate === template._id && (
                                <div className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50">
                                  <h5 className="text-xs sm:text-sm font-bold text-slate-700 mb-2 sm:mb-3 flex items-center gap-2">
                                    <Scissors size={12} className="text-purple-600" />
                                    Measurements
                                  </h5>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                                    {template.measurements && Object.entries(template.measurements).map(([key, value]) => (
                                      <div key={key} className="bg-white p-2 sm:p-3 rounded-lg border border-slate-200">
                                        <p className="text-[10px] text-slate-500 capitalize mb-1 break-words">{key}</p>
                                        <p className="text-xs sm:text-sm font-bold text-purple-700 break-words">
                                          {value} <span className="text-[8px] sm:text-xs font-normal text-slate-400">inches</span>
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                  
                                  {template.notes && (
                                    <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-amber-50 rounded-lg">
                                      <p className="text-[10px] text-amber-600 font-bold mb-1">Notes</p>
                                      <p className="text-xs sm:text-sm text-amber-800 italic break-words">"{template.notes}"</p>
                                    </div>
                                  )}

                                  {template.garmentReference && (
                                    <div className="mt-2 text-[10px] sm:text-xs text-purple-600 break-words">
                                      <span className="font-medium">From garment:</span> {template.garmentReference}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Pagination for Templates - Responsive */}
                        {totalTemplatePages > 1 && (
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-200">
                            <p className="text-[10px] sm:text-xs text-slate-500 order-2 sm:order-1">
                              Showing {templateStartIndex + 1} to {Math.min(templateEndIndex, customerTemplates.length)} of {customerTemplates.length} templates
                            </p>
                            <div className="flex gap-2 order-1 sm:order-2">
                              <button
                                onClick={() => setTemplatesPage(p => Math.max(1, p - 1))}
                                disabled={templatesPage === 1}
                                className="px-2 sm:px-3 py-1 rounded bg-slate-100 disabled:opacity-50 flex items-center gap-1 text-xs"
                              >
                                <ChevronLeftIcon size={12} />
                                <span className="hidden xs:inline">Prev</span>
                              </button>
                              <span className="px-2 sm:px-3 py-1 bg-blue-600 text-white rounded text-xs">
                                {templatesPage} / {totalTemplatePages}
                              </span>
                              <button
                                onClick={() => setTemplatesPage(p => Math.min(totalTemplatePages, p + 1))}
                                disabled={templatesPage === totalTemplatePages}
                                className="px-2 sm:px-3 py-1 rounded bg-slate-100 disabled:opacity-50 flex items-center gap-1 text-xs"
                              >
                                <span className="hidden xs:inline">Next</span>
                                <ChevronRight size={12} />
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Measurement Preview Modal */}
      <MeasurementPreviewModal
        isOpen={showMeasurementPreview}
        onClose={() => {
          setShowMeasurementPreview(false);
          setPreviewMeasurements(null);
          setPreviewTemplateName("");
        }}
        measurements={previewMeasurements}
        templateName={previewTemplateName}
      />

      {/* Delete Confirmation Modal - Responsive */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 mx-4">
            <div className="p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <AlertCircle size={24} className="text-red-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-center text-slate-800 mb-2">Delete Customer</h2>
              <p className="text-sm sm:text-base text-center text-slate-500 mb-4 sm:mb-6">
                Are you sure you want to delete <span className="font-black text-slate-700">{customerFullName()}</span>? 
                This action cannot be undone.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black transition-all text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black transition-all text-sm sm:text-base"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}