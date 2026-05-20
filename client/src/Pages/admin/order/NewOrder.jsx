// import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate, useLocation } from "react-router-dom";
// import {
//   ArrowLeft,
//   Save,
//   Plus,
//   Trash2,
//   User,
//   Calendar,
//   CreditCard,
//   IndianRupee,
//   Package,
//   Clock,
//   Wallet,
//   Banknote,
//   Smartphone,
//   Landmark,
//   X,
//   AlertCircle,
//   CheckCircle,
//   Image as ImageIcon,
//   Eye,
// } from "lucide-react";
// import { createNewOrder } from "../../../features/order/orderSlice";
// import { createGarment } from "../../../features/garment/garmentSlice";
// import { fetchAllCustomers } from "../../../features/customer/customerSlice";
// import { fetchOrderDates, selectOrderDates, selectCalendarLoading } from "../../../features/order/orderSlice";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import GarmentForm from "../garment/GarmentForm";
// import AddPaymentModal from "../../../components/AddPaymentModal";
// import ImagePreviewModal from "../../../components/ImagePreviewModal";
// import showToast from "../../../utils/toast";

// export default function NewOrder() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const location = useLocation();

//   // 🎯 Customer Page-la irundhu varum customer details (passed through navigation state)
//   const passedCustomer = location.state?.customer;

//   // 📦 Redux selectors - Global state-la irundhu data eduthukom
//   const { customers, loading: customersLoading } = useSelector((state) => {
//     const customerData = state.customers?.customers || state.customer?.customers || [];
//     const customersArray = Array.isArray(customerData) ? customerData : [];
//     return {
//       customers: customersArray,
//       loading: state.customers?.loading || state.customer?.loading || false
//     };
//   });

//   const { categories } = useSelector((state) => {
//     const categoriesData = state.categories?.categories || [];
//     return {
//       categories: Array.isArray(categoriesData) ? categoriesData : []
//     };
//   });

//   const { user } = useSelector((state) => state.auth);
  
//   // 📅 Calendar state from Redux (delivery dates with existing orders)
//   const orderDates = useSelector(selectOrderDates);
//   const calendarLoading = useSelector(selectCalendarLoading);
  
//   // 📝 Main form state - customer, delivery date, notes
//   const [formData, setFormData] = useState({
//     customer: "",
//     deliveryDate: "",
//     specialNotes: "",
//     advancePayment: {
//       amount: 0,
//       method: "cash",
//     },
//   });

//   // 💰 Multiple payments management
//   const [payments, setPayments] = useState([]);
//   const [showPaymentModal, setShowPaymentModal] = useState(false);
//   const [editingPayment, setEditingPayment] = useState(null);
  
//   // 🔥 NEW: Track current order ID for payments after creation
//   const [currentOrderId, setCurrentOrderId] = useState("temp");

//   // 👕 Garments management
//   const [garments, setGarments] = useState([]);
//   const [showGarmentModal, setShowGarmentModal] = useState(false);
//   const [editingGarment, setEditingGarment] = useState(null);
  
//   // 🔍 Customer search and selection
//   const [searchTerm, setSearchTerm] = useState("");
//   const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
//   const [selectedCustomerDisplay, setSelectedCustomerDisplay] = useState("");
  
//   // ⏳ Form submission states
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [serverErrors, setServerErrors] = useState(null);

//   // 📅 Calendar states
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [showCalendar, setShowCalendar] = useState(false);
//   const [currentMonth, setCurrentMonth] = useState(new Date());
//   const calendarRef = useRef(null);

//   // 🖼️ Image preview states
//   const [showImagePreview, setShowImagePreview] = useState(false);
//   const [previewImages, setPreviewImages] = useState([]);
//   const [previewTitle, setPreviewTitle] = useState("");

//   // 🔒 DUPLICATE SUBMISSION PREVENTION - using ref for instant lock
//   const isSubmittingRef = useRef(false);
  
//   // 🆔 Generate unique request ID for tracking submissions
//   const generateRequestId = () => {
//     return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`;
//   };

//   // 👤 Get user ID from auth
//   const userId = user?.id || user?._id;
//   const userRole = user?.role;

//   // 🧭 Base path based on user role (navigation purpose)
//   const basePath = user?.role === "ADMIN" ? "/admin" : 
//                    user?.role === "STORE_KEEPER" ? "/storekeeper" : 
//                    "/cuttingmaster";

//   // Load customers on mount
//   useEffect(() => {
//     dispatch(fetchAllCustomers())
//       .unwrap()
//       .catch((error) => {
//         showToast.error("Failed to load customers");
//       });
//   }, [dispatch]);

//   // AUTO-FILL: When customer passed from Customer page, auto-select them
//   useEffect(() => {
//     if (passedCustomer) {
//       const fullCustomer = customers?.find(c => c._id === passedCustomer._id) || passedCustomer;
      
//       setFormData(prev => ({
//         ...prev,
//         customer: fullCustomer._id
//       }));

//       const fullName = getCustomerFullName(fullCustomer);
//       const displayId = getCustomerDisplayId(fullCustomer);
//       let displayText = `${fullName} (${displayId})`;
      
//       setSelectedCustomerDisplay(displayText);
//       setSearchTerm(displayText);
//       setShowCustomerDropdown(false);
//     }
//   }, [passedCustomer, customers]);

//   // Fetch order dates for calendar when month changes
//   useEffect(() => {
//     const month = currentMonth.getMonth();
//     const year = currentMonth.getFullYear();
//     dispatch(fetchOrderDates({ month, year }));
//   }, [currentMonth, dispatch]);

//   // Close calendar when clicking outside
//   useEffect(() => {
//     function handleClickOutside(event) {
//       if (calendarRef.current && !calendarRef.current.contains(event.target)) {
//         setShowCalendar(false);
//       }
//     }
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   // 👤 Helper: Get customer full name from various possible fields
//   const getCustomerFullName = (customer) => {
//     if (!customer) return 'Unknown Customer';
    
//     if (customer.firstName || customer.lastName) {
//       const firstName = customer.firstName || '';
//       const lastName = customer.lastName || '';
//       const fullName = `${firstName} ${lastName}`.trim();
//       if (fullName) return fullName;
//     }
    
//     if (customer.name) return customer.name;
    
//     return 'Unknown Customer';
//   };

//   // 🔢 Helper: Get customer display ID (customerId or last 6 digits of _id)
//   const getCustomerDisplayId = (customer) => {
//     if (!customer) return '';
//     return customer.customerId || customer._id?.slice(-6) || '';
//   };

//   // 📞 Helper: Get customer phone number
//   const getCustomerPhone = (customer) => {
//     if (!customer) return 'No phone';
//     return customer.phone || customer.whatsappNumber || 'No phone';
//   };

//   // Filter customers based on search term
//   const filteredCustomers = useMemo(() => {
//     if (!customers || !Array.isArray(customers) || customers.length === 0) {
//       return [];
//     }
    
//     if (formData.customer && searchTerm === selectedCustomerDisplay) {
//       return [];
//     }
    
//     return customers.filter(customer => {
//       if (!customer) return false;

//       const fullName = getCustomerFullName(customer).toLowerCase();
//       const customerId = getCustomerDisplayId(customer).toLowerCase();
//       const phone = getCustomerPhone(customer).toLowerCase();
//       const firstName = (customer.firstName || '').toLowerCase();
//       const lastName = (customer.lastName || '').toLowerCase();
      
//       const searchLower = searchTerm.toLowerCase();
      
//       return fullName.includes(searchLower) ||
//              firstName.includes(searchLower) ||
//              lastName.includes(searchLower) ||
//              phone.includes(searchLower) ||
//              customerId.includes(searchLower);
//     });
//   }, [customers, searchTerm, formData.customer, selectedCustomerDisplay]);

//   // Calculate total payments - with NaN protection and DEBUG
//   const totalPayments = useMemo(() => {
//     console.log("%c💰💰💰 CALCULATING TOTAL PAYMENTS 💰💰💰", "background: purple; color: white; font-size: 12px");
//     console.log("Payments array:", payments);
    
//     const total = payments.reduce((sum, payment, idx) => {
//       const rawAmount = payment.amount;
//       const numAmount = Number(rawAmount);
//       const safeAmount = isNaN(numAmount) ? 0 : numAmount;
      
//       console.log(`  Payment ${idx + 1}:`, {
//         raw: rawAmount,
//         type: typeof rawAmount,
//         converted: numAmount,
//         safe: safeAmount,
//         isNaN: isNaN(numAmount)
//       });
      
//       return sum + safeAmount;
//     }, 0);
    
//     console.log("✅ Total payments:", total);
//     return total;
//   }, [payments]);

//   // Calculate price summary - with NaN protection and DEBUG
//   const priceSummary = useMemo(() => {
//     console.log("%c👕👕👕 CALCULATING PRICE SUMMARY 👕👕👕", "background: blue; color: white; font-size: 12px");
//     console.log("Garments count:", garments.length);
    
//     const totalMin = garments.reduce((sum, g, idx) => {
//       const rawMin = g.priceRange?.min;
//       const numMin = Number(rawMin);
//       const safeMin = isNaN(numMin) ? 0 : numMin;
      
//       console.log(`  Garment ${idx + 1} (${g.name}):`, {
//         raw: rawMin,
//         type: typeof rawMin,
//         converted: numMin,
//         safe: safeMin,
//         isNaN: isNaN(numMin)
//       });
      
//       return sum + safeMin;
//     }, 0);
    
//     const totalMax = garments.reduce((sum, g, idx) => {
//       const rawMax = g.priceRange?.max;
//       const numMax = Number(rawMax);
//       const safeMax = isNaN(numMax) ? 0 : numMax;
      
//       console.log(`  Garment ${idx + 1} max:`, {
//         raw: rawMax,
//         type: typeof rawMax,
//         converted: numMax,
//         safe: safeMax,
//         isNaN: isNaN(numMax)
//       });
      
//       return sum + safeMax;
//     }, 0);
    
//     console.log("✅ Price summary - Min:", totalMin, "Max:", totalMax);
//     return { totalMin, totalMax };
//   }, [garments]);

//   // Calculate balance - with NaN protection and DEBUG
//   const balanceAmount = useMemo(() => {
//     console.log("%c⚖️⚖️⚖️ CALCULATING BALANCE ⚖️⚖️⚖️", "background: orange; color: white; font-size: 12px");
    
//     const totalMin = isNaN(priceSummary.totalMin) ? 0 : Number(priceSummary.totalMin);
//     const totalMax = isNaN(priceSummary.totalMax) ? 0 : Number(priceSummary.totalMax);
//     const paid = isNaN(totalPayments) ? 0 : Number(totalPayments);
    
//     console.log("  Total Min:", totalMin);
//     console.log("  Total Max:", totalMax);
//     console.log("  Total Paid:", paid);
    
//     const balance = {
//       min: totalMin - paid,
//       max: totalMax - paid,
//     };
    
//     console.log("✅ Balance - Min:", balance.min, "Max:", balance.max);
//     return balance;
//   }, [priceSummary, totalPayments]);

//   // Payment handlers
//   const handleAddPayment = useCallback(() => {
//     console.log("%c➕➕➕ ADD PAYMENT BUTTON CLICKED ➕➕➕", "background: green; color: white; font-size: 12px");
//     setEditingPayment(null);
//     setShowPaymentModal(true);
//   }, []);

//   const handleEditPayment = useCallback((payment) => {
//     console.log("%c✏️✏️✏️ EDIT PAYMENT ✏️✏️✏️", "background: orange; color: white; font-size: 12px");
//     console.log("Payment to edit:", payment);
//     setEditingPayment(payment);
//     setShowPaymentModal(true);
//   }, []);

//   const handleDeletePayment = useCallback((index) => {
//     console.log("%c🗑️🗑️🗑️ DELETE PAYMENT 🗑️🗑️🗑️", "background: red; color: white; font-size: 12px");
//     console.log("Deleting payment at index:", index);
//     console.log("Payment:", payments[index]);
    
//     if (window.confirm("Are you sure you want to delete this payment?")) {
//       const newPayments = [...payments];
//       newPayments.splice(index, 1);
//       setPayments(newPayments);
//       console.log("✅ Payment deleted, remaining:", newPayments.length);
//       showToast.success("Payment removed");
//     }
//   }, [payments]);

//   // 🔥 FIXED: Handle Save Payment - Works for both new and existing orders
//   const handleSavePayment = useCallback((paymentData) => {
//     console.log("%c💾💾💾 SAVE PAYMENT CALLED 💾💾💾", "background: purple; color: white; font-size: 14px");
//     console.log("📦 Payment data received:", JSON.parse(JSON.stringify(paymentData)));
//     console.log("📦 Current Order ID:", currentOrderId);
//     console.log("📦 Is New Order?", currentOrderId === "temp");
    
//     // 🔥 CRITICAL: Check if amount is valid
//     console.log("💰 Amount in paymentData:", paymentData.amount);
//     console.log("💰 Amount type:", typeof paymentData.amount);
//     console.log("💰 Is NaN:", isNaN(paymentData.amount));
    
//     // Map type
//     let backendType = paymentData.type || 'advance';
//     if (backendType === 'partial') {
//       backendType = 'part-payment';
//     } else if (backendType === 'full') {
//       backendType = 'final-settlement';
//     }
    
//     const paymentWithMappedType = {
//       ...paymentData,
//       type: backendType,
//       date: paymentData.paymentDate || paymentData.date || new Date().toISOString().split('T')[0],
//       time: paymentData.paymentTime || paymentData.time || new Date().toLocaleTimeString('en-US', { hour12: false })
//     };
    
//     console.log("📦 Payment with mapped type:", JSON.parse(JSON.stringify(paymentWithMappedType)));
    
//     // 🔥 NEW: Check if this is a new order (before creation) or existing order (after creation)
//     if (currentOrderId === "temp") {
//       // NEW ORDER - Store in local state
//       console.log("📝 New order - storing payment locally");
      
//       if (editingPayment) {
//         console.log("✏️ Updating existing payment, tempId:", editingPayment.tempId);
//         const index = payments.findIndex(p => p.tempId === editingPayment.tempId);
//         console.log("Found at index:", index);
        
//         if (index !== -1) {
//           const newPayments = [...payments];
//           newPayments[index] = { 
//             ...paymentWithMappedType, 
//             tempId: editingPayment.tempId
//           };
//           setPayments(newPayments);
//           console.log("✅ Payment updated, new payments array:", newPayments);
//           showToast.success("Payment updated");
//         }
//       } else {
//         const newPayment = {
//           ...paymentWithMappedType,
//           tempId: Date.now() + Math.random()
//         };
//         console.log("➕ Adding new payment with tempId:", newPayment.tempId);
//         setPayments(prev => {
//           const updated = [...prev, newPayment];
//           console.log("✅ Payment added, new payments array:", updated);
//           return updated;
//         });
//         showToast.success("Payment added");
//       }
//     } else {
//       // EXISTING ORDER - Call API directly
//       console.log("📡 Existing order - calling API to add payment");
      
//       // Show loading toast
//       const toastId = showToast.loading("Adding payment...");
      
//       // Call API to add payment (you need to implement this in Redux)
//       dispatch(addPaymentToOrder({
//         orderId: currentOrderId,
//         paymentData: {
//           amount: paymentData.amount,
//           type: paymentData.type,
//           method: paymentData.method,
//           referenceNumber: paymentData.referenceNumber,
//           paymentDate: paymentData.paymentDate,
//           paymentTime: paymentData.paymentTime,
//           notes: paymentData.notes
//         }
//       })).then((result) => {
//         console.log("✅ Payment added via API:", result);
//         showToast.dismiss(toastId);
//         showToast.success("Payment added successfully!");
        
//         // Refresh order data to show updated payments
//         dispatch(fetchOrderById(currentOrderId));
//       }).catch((error) => {
//         console.error("❌ Error adding payment:", error);
//         showToast.dismiss(toastId);
//         showToast.error(error.response?.data?.message || "Failed to add payment");
//       });
//     }
    
//     setShowPaymentModal(false);
//     setEditingPayment(null);
//   }, [payments, editingPayment, currentOrderId, dispatch]);

//   // Garment handlers with customer validation
//   const handleAddGarment = useCallback(() => {
//     console.log("%c➕➕➕ ADD GARMENT BUTTON CLICKED ➕➕➕", "background: blue; color: white; font-size: 12px");
//     if (!formData.customer) {
//       console.log("❌ Cannot add garment - no customer selected");
//       showToast.error("Please select a customer first before adding garments");
//       return;
//     }
    
//     setEditingGarment(null);
//     setShowGarmentModal(true);
//   }, [formData.customer]);

//   const handleEditGarment = useCallback((garment) => {
//     console.log("%c✏️✏️✏️ EDIT GARMENT ✏️✏️✏️", "background: orange; color: white; font-size: 12px");
//     console.log("Garment to edit:", garment);
//     setEditingGarment(garment);
//     setShowGarmentModal(true);
//   }, []);

//   const handleDeleteGarment = useCallback((index, garment) => {
//     console.log("%c🗑️🗑️🗑️ DELETE GARMENT 🗑️🗑️🗑️", "background: red; color: white; font-size: 12px");
//     console.log("Deleting garment at index:", index);
//     console.log("Garment:", garment);
    
//     if (window.confirm(`Are you sure you want to remove ${garment.name || 'this garment'}?`)) {
//       const newGarments = [...garments];
//       newGarments.splice(index, 1);
//       setGarments(newGarments);
//       console.log("✅ Garment deleted, remaining:", newGarments.length);
//       showToast.success("Garment removed");
//     }
//   }, [garments]);

//   // 🖼️ FIXED: Image preview handlers with better logging
//   const handleViewImages = useCallback((images, type) => {
//     console.log(`%c👁️👁️👁️ VIEW IMAGES: ${type} 👁️👁️👁️`, "background: purple; color: white; font-size: 12px");
//     console.log("Images:", images);
//     console.log("Image count:", images?.length);
    
//     if (images && images.length > 0) {
//       try {
//         // Create object URLs for File objects
//         const imageUrls = images.map((img, idx) => {
//           if (img instanceof File) {
//             console.log(`  Creating URL for File ${idx + 1}:`, img.name);
//             return URL.createObjectURL(img);
//           } else if (img?.url) {
//             console.log(`  Using URL from object:`, img.url);
//             return img.url;
//           } else if (typeof img === 'string') {
//             console.log(`  Using string URL:`, img);
//             return img;
//           } else {
//             console.log(`  Unknown image type:`, img);
//             return null;
//           }
//         }).filter(url => url !== null);
        
//         console.log(`  Setting ${imageUrls.length} preview images`);
//         setPreviewImages(imageUrls);
//         setPreviewTitle(type);
//         setShowImagePreview(true);
//       } catch (error) {
//         console.error("❌ Error in handleViewImages:", error);
//         showToast.error("Failed to load images");
//       }
//     } else {
//       console.warn("⚠️ No images to view");
//       showToast.warning("No images to display");
//     }
//   }, []);

//   // Clean up object URLs when modal closes
//   const handleClosePreview = useCallback(() => {
//     console.log("%c🗑️🗑️🗑️ CLOSING PREVIEW, CLEANING UP URLs 🗑️🗑️🗑️", "background: red; color: white; font-size: 12px");
    
//     // Revoke object URLs to avoid memory leaks
//     previewImages.forEach(url => {
//       if (url && typeof url === 'string' && url.startsWith('blob:')) {
//         try {
//           URL.revokeObjectURL(url);
//           console.log("  Revoked URL:", url);
//         } catch (e) {
//           console.error("Error revoking URL:", e);
//         }
//       }
//     });
    
//     setShowImagePreview(false);
//     setPreviewImages([]);
//     setPreviewTitle("");
//   }, [previewImages]);

//   // 🖼️ FIXED: Image Gallery Component with HORIZONTAL scroll
//   const ImageGallery = ({ images, type, onView }) => {
//     // State to store object URLs
//     const [imageUrls, setImageUrls] = useState([]);
//     const [loading, setLoading] = useState(true);
    
//     // Create object URLs when images change
//     useEffect(() => {
//       console.log(`🖼️ ImageGallery for ${type}:`, images?.length || 0, "images");
//       setLoading(true);
      
//       if (!images || images.length === 0) {
//         setImageUrls([]);
//         setLoading(false);
//         return;
//       }
      
//       const urls = images.map((img, idx) => {
//         if (img instanceof File) {
//           console.log(`  Creating URL for File ${idx + 1}:`, img.name);
//           return URL.createObjectURL(img);
//         } else if (img?.url) {
//           console.log(`  Using URL from object ${idx + 1}:`, img.url);
//           return img.url;
//         } else if (typeof img === 'string') {
//           console.log(`  Using string URL ${idx + 1}:`, img);
//           return img;
//         } else {
//           console.log(`  Unknown image type ${idx + 1}:`, img);
//           return null;
//         }
//       }).filter(url => url !== null);
      
//       console.log(`  Generated ${urls.length} URLs for ${type}`);
//       setImageUrls(urls);
//       setLoading(false);
      
//       // Cleanup function
//       return () => {
//         urls.forEach(url => {
//           if (url && url.startsWith('blob:')) {
//             URL.revokeObjectURL(url);
//           }
//         });
//       };
//     }, [images, type]);
    
//     const handleImageClick = (e) => {
//       e.preventDefault();
//       e.stopPropagation();
//       console.log(`👆 Image clicked: ${type} with`, images.length, "images");
//       onView(images, type);
//     };
    
//     if (!images || images.length === 0) {
//       return null;
//     }
    
//     if (loading) {
//       return (
//         <div className="mt-3">
//           <p className="text-xs font-medium text-slate-500 mb-2">{type}:</p>
//           <div className="flex items-center gap-2">
//             <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
//             <span className="text-xs text-slate-400">Loading images...</span>
//           </div>
//         </div>
//       );
//     }
    
//     if (imageUrls.length === 0) {
//       return (
//         <div className="mt-3">
//           <p className="text-xs font-medium text-slate-500 mb-2">{type}:</p>
//           <p className="text-xs text-red-400">Failed to load images</p>
//         </div>
//       );
//     }
    
//     // 🔥 FIXED: HORIZONTAL SCROLL instead of vertical
//     return (
//       <div className="mt-3">
//         <p className="text-xs font-medium text-slate-500 mb-2">{type} ({images.length}):</p>
//         <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
//           {imageUrls.map((url, idx) => (
//             <div 
//               key={idx}
//               onClick={handleImageClick}
//               className="flex-shrink-0 relative w-20 h-20 rounded-lg border-2 border-slate-200 overflow-hidden cursor-pointer hover:border-blue-500 hover:shadow-lg transition-all group"
//             >
//               <img 
//                 src={url} 
//                 alt={`${type} ${idx + 1}`}
//                 className="w-full h-full object-cover"
//                 onError={(e) => {
//                   console.error(`❌ Image failed to load:`, url);
//                   e.target.src = 'https://via.placeholder.com/80?text=Error';
//                 }}
//                 onLoad={() => console.log(`✅ Image loaded:`, url)}
//               />
//               {/* Hover overlay */}
//               <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
//                 <Eye size={24} className="text-white opacity-0 group-hover:opacity-100 transition-all" />
//               </div>
//               {/* Image number badge */}
//               <div className="absolute bottom-1 right-1 bg-black bg-opacity-60 text-white text-xs px-1.5 py-0.5 rounded">
//                 {idx + 1}
//               </div>
//             </div>
//           ))}
          
//           {/* "More" indicator if needed - but with horizontal scroll, we show all */}
//           {images.length > imageUrls.length && (
//             <div 
//               onClick={handleImageClick}
//               className="flex-shrink-0 w-20 h-20 rounded-lg bg-slate-100 border-2 border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-200 hover:border-blue-500 transition-all group"
//             >
//               <span className="text-lg font-bold text-slate-600">+{images.length - imageUrls.length}</span>
//               <span className="text-xs text-slate-500">more</span>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   // FIXED: Handle Save Garment with better image handling and DEBUG
//   const handleSaveGarment = useCallback((garmentData) => {
//     console.log("%c📥📥📥 HANDLE SAVE GARMENT CALLED 📥📥📥", "background: blue; color: white; font-size: 14px");
//     console.log("Type:", garmentData instanceof FormData ? "FormData" : "Object");
    
//     if (garmentData instanceof FormData) {
//       // Convert FormData to object
//       const garmentObj = {
//         tempId: editingGarment?.tempId || Date.now() + Math.random(),
//         referenceImages: [],
//         customerImages: [],
//         customerClothImages: []
//       };
      
//       console.log("📦 Processing FormData entries:");
//       for (let [key, value] of garmentData.entries()) {
//         if (value instanceof File) {
//           console.log(`  📸 ${key}: File - ${value.name} (${value.type}, ${value.size} bytes)`);
          
//           if (key === 'referenceImages') {
//             garmentObj.referenceImages.push(value);
//           } else if (key === 'customerImages') {
//             garmentObj.customerImages.push(value);
//           } else if (key === 'customerClothImages') {
//             garmentObj.customerClothImages.push(value);
//           }
//         } else {
//           // Truncate long strings for display
//           const displayValue = value && value.length > 50 ? value.substring(0, 50) + '...' : value;
//           console.log(`  📝 ${key}: ${displayValue}`);
          
//           if (key === 'measurements' || key === 'priceRange') {
//             try {
//               garmentObj[key] = JSON.parse(value);
//             } catch (e) {
//               garmentObj[key] = value;
//             }
//           } else {
//             garmentObj[key] = value;
//           }
//         }
//       }
      
//       // Verify images were captured
//       console.log("✅ Garment object created:", {
//         name: garmentObj.name,
//         category: garmentObj.category,
//         item: garmentObj.item,
//         referenceImages: garmentObj.referenceImages?.length || 0,
//         customerImages: garmentObj.customerImages?.length || 0,
//         customerClothImages: garmentObj.customerClothImages?.length || 0
//       });
      
//       if (editingGarment) {
//         // Update existing garment
//         console.log("✏️ Updating existing garment, tempId:", editingGarment.tempId);
//         const index = garments.findIndex(g => g.tempId === editingGarment.tempId);
//         console.log("Found at index:", index);
        
//         if (index !== -1) {
//           const newGarments = [...garments];
//           newGarments[index] = garmentObj;
//           setGarments(newGarments);
//           showToast.success("Garment updated");
//           console.log("🔄 Updated garment at index:", index);
//           console.log("New garments array:", newGarments);
//         }
//       } else {
//         // Add new garment
//         console.log("➕ Adding new garment");
//         setGarments(prev => {
//           const updated = [...prev, garmentObj];
//           console.log("New garments array:", updated);
//           return updated;
//         });
//         showToast.success("Garment added");
//         console.log("➕ Added new garment, total garments:", garments.length + 1);
//       }
//     } else {
//       // Handle regular object (no images)
//       console.log("📦 Received regular object:", garmentData);
      
//       if (editingGarment) {
//         const index = garments.findIndex(g => g.tempId === editingGarment.tempId);
//         if (index !== -1) {
//           const newGarments = [...garments];
//           newGarments[index] = { ...garmentData, tempId: editingGarment.tempId };
//           setGarments(newGarments);
//           showToast.success("Garment updated");
//         }
//       } else {
//         const newGarment = {
//           ...garmentData,
//           tempId: Date.now() + Math.random()
//         };
//         setGarments([...garments, newGarment]);
//         showToast.success("Garment added");
//       }
//     }
    
//     setShowGarmentModal(false);
//   }, [garments, editingGarment]);

//   const handleCustomerSelect = useCallback((customer) => {
//     console.log("%c👤👤👤 CUSTOMER SELECTED 👤👤👤", "background: green; color: white; font-size: 12px");
//     console.log("Customer:", customer);
    
//     const fullName = getCustomerFullName(customer);
//     const displayId = getCustomerDisplayId(customer);
    
//     setFormData(prev => ({
//       ...prev,
//       customer: customer._id
//     }));

//     let displayText = `${fullName} (${displayId})`;
//     setSelectedCustomerDisplay(displayText);
//     setSearchTerm(displayText);
//     setShowCustomerDropdown(false);
    
//     console.log("✅ Customer selected:", displayText);
//   }, []);

//   const handleSearchChange = useCallback((e) => {
//     const value = e.target.value;
//     console.log("🔍 Search term changed:", value);
//     setSearchTerm(value);
//     setShowCustomerDropdown(true);
    
//     if (!value.trim()) {
//       setFormData(prev => ({ ...prev, customer: "" }));
//       setSelectedCustomerDisplay("");
//     }
//   }, []);

//   // Helper function to get category name from ID
//   const getCategoryName = useCallback((categoryId) => {
//     if (!categoryId) return 'Unknown';
//     const category = categories?.find(c => c._id === categoryId);
//     return category?.name || category?.categoryName || categoryId;
//   }, [categories]);

//   // Helper function to get item name from garment object
//   const getItemName = useCallback((garment) => {
//     if (garment.itemName) return garment.itemName;
    
//     if (garment.item && categories) {
//       for (const category of categories) {
//         if (category.items && Array.isArray(category.items)) {
//           const foundItem = category.items.find(item => 
//             item._id === garment.item || item._id?.toString() === garment.item?.toString()
//           );
//           if (foundItem) return foundItem.name || foundItem.itemName;
//         }
//       }
//     }
    
//     return garment.item || 'Unknown';
//   }, [categories]);

//   // 📅 Calendar handlers - FIXED VERSION
//   const handleDateSelect = useCallback((date) => {
//     console.log("%c📅📅📅 DATE SELECTED 📅📅📅", "background: green; color: white; font-size: 12px");
//     console.log("Date object:", date);
    
//     setSelectedDate(date);
//     setShowCalendar(false);
    
//     // Get local date string considering timezone
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const day = String(date.getDate()).padStart(2, '0');
//     const localDateStr = `${year}-${month}-${day}`;
    
//     setFormData(prev => ({
//       ...prev,
//       deliveryDate: localDateStr
//     }));
    
//     console.log("Local date string:", localDateStr);
//   }, []);

//   const handleMonthChange = useCallback((date) => {
//     console.log("📅 Month changed to:", date.toLocaleString('default', { month: 'long', year: 'numeric' }));
//     setCurrentMonth(date);
//   }, []);

//   const formatDisplayDate = useCallback((dateStr) => {
//     if (!dateStr) return "Select delivery date";
    
//     const [year, month, day] = dateStr.split('-').map(Number);
//     const date = new Date(year, month - 1, day);
    
//     return date.toLocaleDateString('en-IN', {
//       weekday: 'short',
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   }, []);

//   // Simple green dot for dates with orders
//   const renderDayContents = useCallback((day, date) => {
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const dayOfMonth = String(date.getDate()).padStart(2, '0');
//     const localDateStr = `${year}-${month}-${dayOfMonth}`;
    
//     const hasOrders = orderDates.includes(localDateStr);
    
//     return (
//       <div className="relative">
//         <div>{day}</div>
//         {hasOrders && (
//           <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
//         )}
//       </div>
//     );
//   }, [orderDates]);

//   // Payment Method Icon Component
//   const PaymentMethodIcon = ({ method }) => {
//     switch(method) {
//       case 'cash':
//         return <Banknote size={14} className="text-green-600" />;
//       case 'upi':
//         return <Smartphone size={14} className="text-blue-600" />;
//       case 'bank-transfer':
//         return <Landmark size={14} className="text-purple-600" />;
//       case 'card':
//         return <CreditCard size={14} className="text-orange-600" />;
//       default:
//         return <Wallet size={14} className="text-slate-600" />;
//     }
//   };

//   // 🔥 FIXED: MAIN SUBMIT HANDLER with NaN prevention and ULTRA DEBUGGING
//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     console.log("\n");
//     console.log("%c🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥", "background: red; color: white; font-size: 16px; font-weight: bold");
//     console.log("%c🔥          FORM SUBMISSION STARTED          🔥", "background: red; color: white; font-size: 16px; font-weight: bold");
//     console.log("%c🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥", "background: red; color: white; font-size: 16px; font-weight: bold");
//     console.log("\n");
    
//     console.log("📋 FORM DATA:", JSON.parse(JSON.stringify(formData)));
//     console.log("💰 PAYMENTS:", JSON.parse(JSON.stringify(payments)));
//     console.log("👕 GARMENTS COUNT:", garments.length);
//     console.log("👕 GARMENTS DETAILS:", JSON.parse(JSON.stringify(garments.map(g => ({
//       name: g.name,
//       priceMin: g.priceRange?.min,
//       priceMax: g.priceRange?.max,
//       refImages: g.referenceImages?.length || 0,
//       custImages: g.customerImages?.length || 0,
//       clothImages: g.customerClothImages?.length || 0
//     })))));
    
//     if (isSubmittingRef.current) {
//       console.log("⚠️ Submission already in progress, preventing duplicate");
//       showToast.warning("Order creation in progress, please wait...");
//       return;
//     }

//     setServerErrors(null);

//     // Validation
//     if (!formData.customer) {
//       console.error("❌ Missing customer");
//       showToast.error("Please select a customer");
//       return;
//     }

//     if (garments.length === 0) {
//       console.error("❌ No garments");
//       showToast.error("Please add at least one garment");
//       return;
//     }

//     if (!formData.deliveryDate) {
//       console.error("❌ Missing delivery date");
//       showToast.error("Please select delivery date");
//       return;
//     }

//     const finalUserId = userId;
//     if (!finalUserId) {
//       console.error("❌ No user ID");
//       showToast.error("You must be logged in to create an order");
//       return;
//     }

//     // Validate MongoDB IDs
//     const customerIdValid = /^[0-9a-fA-F]{24}$/.test(formData.customer);
//     const userIdValid = /^[0-9a-fA-F]{24}$/.test(finalUserId);

//     if (!customerIdValid) {
//       console.error("❌ Invalid customer ID:", formData.customer);
//       showToast.error("Invalid customer ID format");
//       return;
//     }

//     if (!userIdValid) {
//       console.error("❌ Invalid user ID:", finalUserId);
//       showToast.error("Invalid user ID format. Please log in again.");
//       return;
//     }

//     // 🔥 Set submission lock
//     isSubmittingRef.current = true;
//     setIsSubmitting(true);

//     // 🔥 Generate unique request ID
//     const requestId = generateRequestId();
//     console.log("🔒 Request ID:", requestId);

//     try {
//       // Disable submit button
//       const submitButton = e.target.querySelector('button[type="submit"]');
//       if (submitButton) {
//         submitButton.disabled = true;
//       }

//       console.log("\n");
//       console.log("%c💰💰💰💰💰💰💰💰💰💰💰💰💰💰💰💰💰💰💰💰💰", "background: purple; color: white; font-size: 14px");
//       console.log("%c💰       PROCESSING PAYMENTS (SAFE MODE)       💰", "background: purple; color: white; font-size: 14px");
//       console.log("%c💰💰💰💰💰💰💰💰💰💰💰💰💰💰💰💰💰💰💰💰💰", "background: purple; color: white; font-size: 14px");
//       console.log("\n");
      
//       console.log("💰 Processing payments:", payments.length);
//       const mappedPayments = payments.map((payment, idx) => {
//         let modelType = payment.type || 'advance';
        
//         if (modelType === 'partial') {
//           modelType = 'part-payment';
//         } else if (modelType === 'full') {
//           modelType = 'final-settlement';
//         }
        
//         // 🔥 CRITICAL: Safe number conversion with multiple checks
//         const rawAmount = payment.amount;
//         console.log(`\n📌 Payment ${idx + 1} amount analysis:`);
//         console.log(`  Raw value:`, rawAmount);
//         console.log(`  Type:`, typeof rawAmount);
        
//         let safeAmount = 0;
        
//         if (rawAmount === undefined || rawAmount === null) {
//           console.log(`  ❌ Amount is undefined/null`);
//         } else {
//           const strAmount = String(rawAmount).trim();
//           console.log(`  String:`, strAmount);
//           console.log(`  Length:`, strAmount.length);
          
//           if (strAmount === '') {
//             console.log(`  ❌ Amount is empty string`);
//           } else {
//             const numAmount = Number(strAmount);
//             console.log(`  Number():`, numAmount);
//             console.log(`  Is NaN:`, isNaN(numAmount));
            
//             if (!isNaN(numAmount) && numAmount > 0) {
//               safeAmount = numAmount;
//               console.log(`  ✅ Valid amount:`, safeAmount);
//             } else {
//               console.log(`  ❌ Invalid amount (using 0)`);
//             }
//           }
//         }
        
//         console.log(`  ✅ Final safe amount:`, safeAmount);
        
//         return {
//           amount: safeAmount,
//           type: modelType,
//           method: payment.method || 'cash',
//           referenceNumber: payment.referenceNumber || '',
//           date: payment.date || new Date().toISOString().split('T')[0],
//           notes: payment.notes || ''
//         };
//       });

//       console.log("\n✅ Mapped payments:", JSON.parse(JSON.stringify(mappedPayments)));

//       console.log("\n");
//       console.log("%c👕👕👕👕👕👕👕👕👕👕👕👕👕👕👕👕👕👕👕👕👕", "background: blue; color: white; font-size: 14px");
//       console.log("%c👕       PROCESSING GARMENTS (SAFE MODE)       👕", "background: blue; color: white; font-size: 14px");
//       console.log("%c👕👕👕👕👕👕👕👕👕👕👕👕👕👕👕👕👕👕👕👕👕", "background: blue; color: white; font-size: 14px");
//       console.log("\n");

//       // 📝 Prepare order data with ALL fields properly formatted
//       console.log("📦 Preparing order data...");
      
//       // Safe number conversions for all values
//       const safeTotalMin = isNaN(Number(priceSummary.totalMin)) ? 0 : Number(priceSummary.totalMin);
//       const safeTotalMax = isNaN(Number(priceSummary.totalMax)) ? 0 : Number(priceSummary.totalMax);
//       const safeTotalPayments = isNaN(Number(totalPayments)) ? 0 : Number(totalPayments);
      
//       console.log("💰 Price summary:", { safeTotalMin, safeTotalMax, safeTotalPayments });
      
//       const orderData = {
//         customer: formData.customer,
//         deliveryDate: formData.deliveryDate,
//         specialNotes: formData.specialNotes || "",
//         payments: mappedPayments,
//         advancePayment: {
//           amount: mappedPayments.length > 0 ? (isNaN(Number(mappedPayments[0].amount)) ? 0 : Number(mappedPayments[0].amount)) : 0,
//           method: mappedPayments.length > 0 ? mappedPayments[0].method : "cash",
//           date: new Date().toISOString()
//         },
//         priceSummary: {
//           totalMin: safeTotalMin,
//           totalMax: safeTotalMax
//         },
//         balanceAmount: safeTotalMax - safeTotalPayments,
//         createdBy: finalUserId,
//         status: "confirmed",
//         orderDate: new Date().toISOString(),
//         requestId: requestId,
//         garments: garments.map((g, idx) => {
//           console.log(`\n👕 Processing garment ${idx + 1}: ${g.name}`);
          
//           // Safe number conversions for garment prices
//           const minPrice = isNaN(Number(g.priceRange?.min)) ? 0 : Number(g.priceRange?.min);
//           const maxPrice = isNaN(Number(g.priceRange?.max)) ? 0 : Number(g.priceRange?.max);
//           const fabricPrice = isNaN(Number(g.fabricPrice)) ? 0 : Number(g.fabricPrice);
          
//           console.log(`  Price range: ${minPrice} - ${maxPrice}`);
//           console.log(`  Fabric price: ${fabricPrice}`);
//           console.log(`  Images: Ref:${g.referenceImages?.length || 0}, Cust:${g.customerImages?.length || 0}, Cloth:${g.customerClothImages?.length || 0}`);
          
//           return {
//             name: g.name,
//             garmentType: g.item || g.garmentType || g.itemName || g.name,
//             category: g.category,
//             item: g.item,
//             categoryName: g.categoryName,
//             itemName: g.itemName,
//             measurementTemplate: g.measurementTemplate,
//             measurementSource: g.measurementSource,
//             measurements: g.measurements || [],
//             additionalInfo: g.additionalInfo || '',
//             estimatedDelivery: g.estimatedDelivery || formData.deliveryDate,
//             priority: g.priority || 'normal',
//             priceRange: {
//               min: minPrice,
//               max: maxPrice
//             },
//             fabricSource: g.fabricSource || 'customer',
//             fabricPrice: fabricPrice,
//             referenceImages: g.referenceImages || [],
//             customerImages: g.customerImages || [],
//             customerClothImages: g.customerClothImages || []
//           };
//         })
//       };

//       console.log("\n");
//       console.log("%c✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅", "background: green; color: white; font-size: 14px");
//       console.log("%c✅       FINAL ORDER DATA VALIDATION       ✅", "background: green; color: white; font-size: 14px");
//       console.log("%c✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅", "background: green; color: white; font-size: 14px");
//       console.log("\n");
      
//       console.log("  Customer:", orderData.customer);
//       console.log("  Delivery Date:", orderData.deliveryDate);
//       console.log("  Payments count:", orderData.payments.length);
//       console.log("  Garments count:", orderData.garments.length);
//       console.log("  Total Min:", orderData.priceSummary.totalMin);
//       console.log("  Total Max:", orderData.priceSummary.totalMax);
//       console.log("  Balance:", orderData.balanceAmount);
      
//       // 🔍 Check for any NaN values
//       console.log("\n🔍 NAN DETECTION SCAN:");
//       let hasNaN = false;
      
//       if (isNaN(orderData.priceSummary.totalMin)) { 
//         console.error("❌ totalMin is NaN"); 
//         hasNaN = true; 
//       } else {
//         console.log("✅ totalMin OK");
//       }
      
//       if (isNaN(orderData.priceSummary.totalMax)) { 
//         console.error("❌ totalMax is NaN"); 
//         hasNaN = true; 
//       } else {
//         console.log("✅ totalMax OK");
//       }
      
//       if (isNaN(orderData.balanceAmount)) { 
//         console.error("❌ balanceAmount is NaN"); 
//         hasNaN = true; 
//       } else {
//         console.log("✅ balanceAmount OK");
//       }
      
//       orderData.payments.forEach((p, i) => {
//         if (isNaN(p.amount)) { 
//           console.error(`❌ payment[${i}].amount is NaN`); 
//           hasNaN = true; 
//         } else {
//           console.log(`✅ payment[${i}].amount OK (${p.amount})`);
//         }
//       });
      
//       orderData.garments.forEach((g, i) => {
//         if (isNaN(g.priceRange.min)) { 
//           console.error(`❌ garment[${i}].priceRange.min is NaN`); 
//           hasNaN = true; 
//         } else {
//           console.log(`✅ garment[${i}].priceRange.min OK (${g.priceRange.min})`);
//         }
        
//         if (isNaN(g.priceRange.max)) { 
//           console.error(`❌ garment[${i}].priceRange.max is NaN`); 
//           hasNaN = true; 
//         } else {
//           console.log(`✅ garment[${i}].priceRange.max OK (${g.priceRange.max})`);
//         }
        
//         if (isNaN(g.fabricPrice)) { 
//           console.error(`❌ garment[${i}].fabricPrice is NaN`); 
//           hasNaN = true; 
//         } else {
//           console.log(`✅ garment[${i}].fabricPrice OK (${g.fabricPrice})`);
//         }
//       });
      
//       if (hasNaN) {
//         console.error("\n❌❌❌ NAN VALUES DETECTED! Stopping submission. ❌❌❌");
//         throw new Error("NaN values detected in order data. Please check all number fields.");
//       }

//       // Check if there are any images
//       const hasImages = orderData.garments.some(g => 
//         g.referenceImages?.length > 0 || 
//         g.customerImages?.length > 0 || 
//         g.customerClothImages?.length > 0
//       );
//       console.log("\n📸 Has images:", hasImages ? "YES" : "NO");
//       if (hasImages) {
//         console.log("📸 Image details:");
//         orderData.garments.forEach((g, i) => {
//           if (g.referenceImages?.length > 0) console.log(`  Garment ${i+1}: ${g.referenceImages.length} reference images`);
//           if (g.customerImages?.length > 0) console.log(`  Garment ${i+1}: ${g.customerImages.length} customer images`);
//           if (g.customerClothImages?.length > 0) console.log(`  Garment ${i+1}: ${g.customerClothImages.length} cloth images`);
//         });
//       }

//       console.log("\n");
//       console.log("%c📡📡📡📡📡📡📡📡📡📡📡📡📡📡📡📡📡📡📡📡📡", "background: blue; color: white; font-size: 14px");
//       console.log("%c📡       DISPATCHING TO REDUX       📡", "background: blue; color: white; font-size: 14px");
//       console.log("%c📡📡📡📡📡📡📡📡📡📡📡📡📡📡📡📡📡📡📡📡📡", "background: blue; color: white; font-size: 14px");
//       console.log("\n");

//       // 🔥 Create the order
//       console.log("📡 Dispatching createNewOrder...");
//       const result = await dispatch(createNewOrder(orderData)).unwrap();
      
//       console.log("\n");
//       console.log("%c✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅", "background: green; color: white; font-size: 16px; font-weight: bold");
//       console.log("%c✅       ORDER CREATED SUCCESSFULLY       ✅", "background: green; color: white; font-size: 16px; font-weight: bold");
//       console.log("%c✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅", "background: green; color: white; font-size: 16px; font-weight: bold");
//       console.log("\n");
      
//       console.log("Result:", result);
      
//       const orderId = result.order?._id || result._id;

//       if (!orderId) {
//         throw new Error("Order created but no ID returned");
//       }

//       // 🔥 UPDATE currentOrderId to real ID for future payments
//       setCurrentOrderId(orderId);
//       console.log("✅ Updated currentOrderId to:", orderId);
      
//       showToast.success("Order created successfully! 🎉");
//       navigate(`${basePath}/orders`);
      
//     } catch (error) {
//       console.error("\n");
//       console.log("%c❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌", "background: red; color: white; font-size: 16px; font-weight: bold");
//       console.log("%c❌       SUBMISSION ERROR       ❌", "background: red; color: white; font-size: 16px; font-weight: bold");
//       console.log("%c❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌", "background: red; color: white; font-size: 16px; font-weight: bold");
//       console.log("\n");
      
//       console.error("❌ ERROR:", error);
      
//       if (error.response?.data) {
//         console.error("Server error response:", error.response.data);
//         setServerErrors(error.response.data);
//       }
      
//       let errorMessage = "Failed to create order";
      
//       if (error.response?.data?.message) {
//         errorMessage = error.response.data.message;
//       } else if (error.response?.data?.errors) {
//         errorMessage = `Validation failed: ${error.response.data.errors.join(', ')}`;
//         console.error("Validation errors:", error.response.data.errors);
//       } else if (error.message) {
//         errorMessage = error.message;
//       }
      
//       showToast.error(errorMessage);
      
//     } finally {
//       // 🔓 Release locks
//       isSubmittingRef.current = false;
//       setIsSubmitting(false);
      
//       // Re-enable submit button
//       const submitButton = document.querySelector('button[type="submit"]');
//       if (submitButton) {
//         submitButton.disabled = false;
//       }
      
//       console.log("\n");
//       console.log("%c🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓", "background: orange; color: white; font-size: 14px");
//       console.log("%c🔓       SUBMISSION LOCK RELEASED       🔓", "background: orange; color: white; font-size: 14px");
//       console.log("%c🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓", "background: orange; color: white; font-size: 14px");
//       console.log("\n");
//     }
//   };

//   return (
//     <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 p-6">
//       {/* 🖼️ Image Preview Modal */}
//       {showImagePreview && (
//         <ImagePreviewModal
//           images={previewImages}
//           title={previewTitle}
//           onClose={handleClosePreview}
//         />
//       )}

//       {/* Add Payment Modal - NOW USING currentOrderId */}
//       <AddPaymentModal
//         isOpen={showPaymentModal}
//         onClose={() => {
//           console.log("🚪 Closing payment modal");
//           setShowPaymentModal(false);
//           setEditingPayment(null);
//         }}
//         onSave={handleSavePayment}
//         orderTotalMin={priceSummary.totalMin}
//         orderTotalMax={priceSummary.totalMax}
//         orderId={currentOrderId}  // 🔥 FIXED: Using state instead of "temp"
//         customerId={formData.customer}
//         initialData={editingPayment}
//         title={editingPayment ? "Edit Payment" : "Add Payment"}
//       />

//       {/* Header */}
//       <div className="flex items-center gap-4">
//         <button
//           onClick={() => navigate(`${basePath}/orders`)}
//           className="p-2 hover:bg-slate-100 rounded-xl transition-all"
//         >
//           <ArrowLeft size={20} className="text-slate-600" />
//         </button>
//         <div>
//           <h1 className="text-3xl font-black text-slate-800 tracking-tight">Create New Order</h1>
//           <p className="text-slate-500">Add customer details and garments to create an order</p>
//         </div>
//       </div>

//       {/* Main Form */}
//       <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Left Column - Customer & Order Details */}
//         <div className="lg:col-span-2 space-y-6">
          
//           {/* Customer Selection Section */}
//           <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
//             <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
//               <User size={20} className="text-blue-600" />
//               Customer Details
//             </h2>

//             <div className="relative">
//               <input
//                 type="text"
//                 placeholder="Search customer by name, phone or ID..."
//                 value={searchTerm}
//                 onChange={handleSearchChange}
//                 onFocus={() => setShowCustomerDropdown(true)}
//                 onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
//                 className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
//               />

//               {showCustomerDropdown && (
//                 <>
//                   {customersLoading && (
//                     <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg p-4 text-center">
//                       <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
//                       <p className="text-sm text-slate-500 mt-2">Loading customers...</p>
//                     </div>
//                   )}

//                   {!customersLoading && filteredCustomers.length > 0 && (
//                     <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
//                       {filteredCustomers.map((customer) => {
//                         const fullName = getCustomerFullName(customer);
//                         const displayId = getCustomerDisplayId(customer);
//                         const phone = getCustomerPhone(customer);
                        
//                         return (
//                           <button
//                             key={customer._id}
//                             type="button"
//                             onClick={() => handleCustomerSelect(customer)}
//                             className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-all border-b border-slate-100 last:border-0"
//                           >
//                             <p className="font-medium text-slate-800">{fullName}</p>
//                             <p className="text-xs text-slate-400">
//                               <span className="font-mono">{displayId}</span> • {phone}
//                             </p>
//                           </button>
//                         );
//                       })}
//                     </div>
//                   )}

//                   {!customersLoading && filteredCustomers.length === 0 && searchTerm && (
//                     <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg p-4 text-center">
//                       <p className="text-slate-500">No customers found</p>
//                       <button
//                         type="button"
//                         onClick={() => navigate(`${basePath}/add-customer`)}
//                         className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
//                       >
//                         + Create new customer
//                       </button>
//                     </div>
//                   )}
//                 </>
//               )}

//               {formData.customer && !showCustomerDropdown && (
//                 <div className="mt-2 text-xs text-green-600 font-medium">
//                   ✓ Customer selected: {selectedCustomerDisplay}
//                 </div>
//               )}
//             </div>

//             {/* Special Notes */}
//             <div className="mt-4">
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
//                 Garments
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

//             {garments.length === 0 ? (
//               <div className="text-center py-8 bg-slate-50 rounded-xl">
//                 <Package size={40} className="mx-auto text-slate-300 mb-2" />
//                 <p className="text-slate-500">No garments added yet</p>
//                 <button
//                   type="button"
//                   onClick={handleAddGarment}
//                   className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
//                 >
//                   + Add your first garment
//                 </button>
//               </div>
//             ) : (
//               <div className="space-y-3">
//                 {garments.map((garment, index) => {
//                   const categoryName = garment.categoryName || getCategoryName(garment.category);
//                   const itemName = garment.itemName || getItemName(garment);
                  
//                   return (
//                     <div
//                       key={garment.tempId}
//                       className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:shadow-md transition-all"
//                     >
//                       <div className="flex items-start justify-between">
//                         <div className="flex-1">
//                           {/* Garment Header with Badges */}
//                           <div className="flex items-center gap-2 flex-wrap">
//                             <h3 className="font-black text-slate-800">{garment.name}</h3>
//                             <span className={`text-xs px-2 py-1 rounded-full ${
//                               garment.priority === 'urgent' ? 'bg-red-100 text-red-600' :
//                               garment.priority === 'high' ? 'bg-orange-100 text-orange-600' :
//                               'bg-blue-100 text-blue-600'
//                             }`}>
//                               {garment.priority}
//                             </span>
                            
//                             {/* Image Count Badge */}
//                             {(garment.referenceImages?.length > 0 || 
//                               garment.customerImages?.length > 0 || 
//                               garment.customerClothImages?.length > 0) && (
//                               <span className="text-xs px-2 py-1 bg-purple-100 text-purple-600 rounded-full flex items-center gap-1">
//                                 <ImageIcon size={12} />
//                                 {garment.referenceImages?.length || 0}/
//                                 {garment.customerImages?.length || 0}/
//                                 {garment.customerClothImages?.length || 0}
//                               </span>
//                             )}
//                           </div>
                          
//                           {/* Garment Details Grid */}
//                           <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
//                             <div>
//                               <p className="text-xs text-slate-400">Category/Item</p>
//                               <p className="font-medium text-blue-700">
//                                 {categoryName} / {itemName}
//                               </p>
//                             </div>
                            
//                             <div>
//                               <p className="text-xs text-slate-400">Garment Delivery</p>
//                               <p className="font-medium text-purple-600">
//                                 {garment.estimatedDelivery ? new Date(garment.estimatedDelivery).toLocaleDateString() : 'Not set'}
//                               </p>
//                             </div>
                            
//                             <div>
//                               <p className="text-xs text-slate-400">Price Range</p>
//                               <p className="font-medium">₹{garment.priceRange?.min} - ₹{garment.priceRange?.max}</p>
//                             </div>
//                           </div>

//                           {/* Debug info */}
//                           <div className="text-xs text-gray-400 mb-1">
//                             Ref: {garment.referenceImages?.length || 0}, 
//                             Cust: {garment.customerImages?.length || 0}, 
//                             Cloth: {garment.customerClothImages?.length || 0}
//                           </div>

//                           {/* 🖼️ Image Galleries - NOW HORIZONTAL */}
//                           {garment.referenceImages?.length > 0 && (
//                             <ImageGallery 
//                               images={garment.referenceImages} 
//                               type="Reference Images" 
//                               onView={handleViewImages}
//                             />
//                           )}

//                           {garment.customerImages?.length > 0 && (
//                             <ImageGallery 
//                               images={garment.customerImages} 
//                               type="Customer Images" 
//                               onView={handleViewImages}
//                             />
//                           )}

//                           {garment.customerClothImages?.length > 0 && (
//                             <ImageGallery 
//                               images={garment.customerClothImages} 
//                               type="Cloth Images" 
//                               onView={handleViewImages}
//                             />
//                           )}
                          
//                           {/* Additional Info */}
//                           {garment.additionalInfo && (
//                             <p className="text-sm text-slate-500 mt-2 italic">
//                               Note: {garment.additionalInfo}
//                             </p>
//                           )}
//                         </div>
                        
//                         {/* Action Buttons */}
//                         <div className="flex gap-2 ml-4">
//                           <button
//                             type="button"
//                             onClick={() => handleEditGarment(garment)}
//                             className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
//                             title="Edit"
//                           >
//                             Edit
//                           </button>
//                           <button
//                             type="button"
//                             onClick={() => handleDeleteGarment(index, garment)}
//                             className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
//                             title="Delete"
//                           >
//                             <Trash2 size={16} />
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div> 
//           {/* Delivery Date Section */}
//           <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
//             <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
//               <Calendar size={20} className="text-blue-600" />
//               Order Delivery Details
//             </h2>
            
//             <div>
//               <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//                 Expected Delivery Date <span className="text-red-500">*</span>
//               </label>
              
//               <div className="relative" ref={calendarRef}>
//                 <button
//                   type="button"
//                   onClick={() => setShowCalendar(!showCalendar)}
//                   className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-left"
//                 >
//                   <Calendar size={18} className="text-slate-400" />
//                   <span className={formData.deliveryDate ? "text-slate-800" : "text-slate-400"}>
//                     {formatDisplayDate(formData.deliveryDate || selectedDate)}
//                   </span>
//                   {calendarLoading && (
//                     <div className="ml-auto w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
//                   )}
//                 </button>

//                 {showCalendar && (
//                   <div className="absolute z-20 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl p-4">
//                     <DatePicker
//                       inline
//                       selected={selectedDate}
//                       onChange={handleDateSelect}
//                       onMonthChange={handleMonthChange}
//                       minDate={new Date()}
//                       renderDayContents={renderDayContents}
//                       calendarClassName="!border-0"
//                     />
                    
//                     <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 text-xs">
//                       <div className="flex items-center gap-2">
//                         <div className="w-3 h-3 bg-green-500 rounded-full"></div>
//                         <span className="text-slate-600">Orders exist</span>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <div className="w-3 h-3 bg-transparent border border-slate-300 rounded-full"></div>
//                         <span className="text-slate-600">No orders</span>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {formData.deliveryDate && (
//                 <div className="mt-3 p-3 bg-blue-50 rounded-lg">
//                   <p className="text-sm text-blue-700">
//                     ✓ Delivery selected: {formatDisplayDate(formData.deliveryDate)}
//                   </p>
//                 </div>
//               )}
              
//               <p className="text-xs text-slate-400 mt-2">
//                 This is the overall order delivery date. Each garment can have its own estimated delivery date.
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Right Column - Payment Summary */}
//         <div className="lg:col-span-1">
//           <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-6">
//             <h2 className="text-lg font-black text-slate-800 mb-4">Price Summary</h2>
            
//             <div className="space-y-4">
//               <div className="bg-blue-50 p-4 rounded-xl">
//                 <p className="text-xs text-blue-600 font-black uppercase mb-1">Total Amount</p>
//                 <p className="text-2xl font-black text-blue-700">
//                   ₹{priceSummary.totalMin} - ₹{priceSummary.totalMax}
//                 </p>
//               </div>

//               {garments.length > 0 && (
//                 <div className="bg-purple-50 p-4 rounded-xl">
//                   <p className="text-xs text-purple-600 font-black uppercase mb-1">
//                     Garment Delivery Range
//                   </p>
//                   <p className="text-sm font-bold text-purple-700">
//                     {new Date(Math.min(...garments.map(g => new Date(g.estimatedDelivery || formData.deliveryDate)))).toLocaleDateString()} - {new Date(Math.max(...garments.map(g => new Date(g.estimatedDelivery || formData.deliveryDate)))).toLocaleDateString()}
//                   </p>
//                 </div>
//               )}

//               <div className="border-t border-slate-100 pt-4">
//                 <div className="flex items-center justify-between mb-3">
//                   <h3 className="text-sm font-black text-slate-700">Payments</h3>
//                   <button
//                     type="button"
//                     onClick={handleAddPayment}
//                     className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1"
//                   >
//                     <Plus size={14} />
//                     Add Payment
//                   </button>
//                 </div>

//                 {payments.length === 0 ? (
//                   <p className="text-sm text-slate-400 italic text-center py-2">
//                     No payments added yet
//                   </p>
//                 ) : (
//                   <div className="space-y-2 max-h-48 overflow-y-auto">
//                     {payments.map((payment, index) => (
//                       <div
//                         key={payment.tempId}
//                         className="bg-slate-50 rounded-lg p-3 border border-slate-200"
//                       >
//                         <div className="flex items-start justify-between">
//                           <div className="flex-1">
//                             <div className="flex items-center gap-2">
//                               <p className="font-bold text-green-600">₹{payment.amount}</p>
//                               <span className={`text-xs px-2 py-0.5 rounded-full ${
//                                 payment.type === 'advance' ? 'bg-blue-100 text-blue-700' :
//                                 payment.type === 'part-payment' ? 'bg-orange-100 text-orange-700' :
//                                 payment.type === 'final-settlement' ? 'bg-green-100 text-green-700' :
//                                 'bg-purple-100 text-purple-700'
//                               }`}>
//                                 {payment.type === 'advance' ? 'Advance' :
//                                  payment.type === 'part-payment' ? 'Part' :
//                                  payment.type === 'final-settlement' ? 'Full' : 'Extra'}
//                               </span>
//                             </div>
//                             <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
//                               <PaymentMethodIcon method={payment.method} />
//                               <span className="capitalize">{payment.method}</span>
//                             </div>
//                             {payment.referenceNumber && (
//                               <p className="text-xs text-purple-600 font-mono mt-0.5">
//                                 Ref: {payment.referenceNumber}
//                               </p>
//                             )}
//                             <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
//                               <span>{new Date(payment.date).toLocaleDateString()}</span>
//                               <span>•</span>
//                               <span>{payment.time}</span>
//                             </div>
//                             {payment.notes && (
//                               <p className="text-xs text-slate-400 mt-1 italic">
//                                 {payment.notes}
//                               </p>
//                             )}
//                           </div>
//                           <div className="flex gap-1 ml-2">
//                             <button
//                               type="button"
//                               onClick={() => handleEditPayment(payment)}
//                               className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
//                               title="Edit"
//                             >
//                               Edit
//                             </button>
//                             <button
//                               type="button"
//                               onClick={() => handleDeletePayment(index)}
//                               className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200"
//                               title="Delete"
//                             >
//                               <Trash2 size={14} />
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}

//                 {payments.length > 0 && (
//                   <div className="mt-3 pt-2 border-t border-slate-200">
//                     <div className="flex justify-between text-sm">
//                       <span className="font-medium text-slate-600">Total Paid:</span>
//                       <span className="font-bold text-green-600">₹{totalPayments}</span>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               <div className="bg-orange-50 p-4 rounded-xl">
//                 <p className="text-xs text-orange-600 font-black uppercase mb-1">Balance Amount</p>
//                 <p className="text-xl font-black text-orange-700">
//                   ₹{balanceAmount.min} - ₹{balanceAmount.max}
//                 </p>
//               </div>

//               <button
//                 type="submit"
//                 disabled={isSubmitting || !userId}
//                 className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-xl font-black uppercase tracking-wider shadow-lg shadow-blue-500/30 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 mt-6 ${
//                   isSubmitting || !userId ? 'opacity-50 cursor-not-allowed' : ''
//                 }`}
//               >
//                 {isSubmitting ? (
//                   <>
//                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                     Creating...
//                   </>
//                 ) : !userId ? (
//                   'Please log in to create order'
//                 ) : (
//                   <>
//                     <Save size={18} />
//                     Create Order
//                   </>
//                 )}
//               </button>

//               <button
//                 type="button"
//                 onClick={() => navigate(`${basePath}/orders`)}
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




















































































































































































// import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate, useLocation } from "react-router-dom";
// import {
//   ArrowLeft,
//   Save,
//   Plus,
//   Trash2,
//   User,
//   Calendar,
//   CreditCard,
//   IndianRupee,
//   Package,
//   Clock,
//   Wallet,
//   Banknote,
//   Smartphone,
//   Landmark,
//   X,
//   AlertCircle,
//   CheckCircle,
//   Image as ImageIcon,
//   Eye,
//   Camera,
//   Scissors,
//   Edit
// } from "lucide-react";
// import { createNewOrder } from "../../../features/order/orderSlice";
// import { createGarment } from "../../../features/garment/garmentSlice";
// import { fetchAllCustomers } from "../../../features/customer/customerSlice";
// import { fetchOrderDates, selectOrderDates, selectCalendarLoading } from "../../../features/order/orderSlice";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import GarmentForm from "../garment/GarmentForm";
// import AddPaymentModal from "../../../components/AddPaymentModal";
// import ImagePreviewModal from "../../../components/ImagePreviewModal";
// import showToast from "../../../utils/toast";

// export default function NewOrder() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const location = useLocation();






//   /* Inga irukkura classes hover matrum selection-ai Red-ku mathum */
// const calendarStyles = `
//   .react-datepicker__day:hover {
//     background-color: #fee2e2 !important; /* Light Red background on hover */
//     color: #b91c1c !important;           /* Dark Red text on hover */
//     border-radius: 12px !important;
//   }
//   .react-datepicker__day--selected, 
//   .react-datepicker__day--keyboard-selected {
//     background-color: #ef4444 !important; /* Solid Red when selected */
//     color: white !important;
//     border-radius: 12px !important;
//   }
//   .react-datepicker__day--today {
//     border: 1px solid #ef4444 !important; /* Today's date border */
//     border-radius: 12px !important;
//   }
// `;

//   // 🎯 Customer Page-la irundhu varum customer details (passed through navigation state)
//   const passedCustomer = location.state?.customer;

//   // 📦 Redux selectors - Global state-la irundhu data eduthukom
//   const { customers, loading: customersLoading } = useSelector((state) => {
//     const customerData = state.customers?.customers || state.customer?.customers || [];
//     const customersArray = Array.isArray(customerData) ? customerData : [];
//     return {
//       customers: customersArray,
//       loading: state.customers?.loading || state.customer?.loading || false
//     };
//   });

//   const { categories } = useSelector((state) => {
//     const categoriesData = state.categories?.categories || [];
//     return {
//       categories: Array.isArray(categoriesData) ? categoriesData : []
//     };
//   });

//   const { user } = useSelector((state) => state.auth);
  
//   // 📅 Calendar state from Redux (delivery dates with existing orders)
//   const orderDates = useSelector(selectOrderDates);
//   const calendarLoading = useSelector(selectCalendarLoading);
  
//   // 📝 Main form state - customer, delivery date, notes
//   const [formData, setFormData] = useState({
//     customer: "",
//     deliveryDate: "",
//     specialNotes: "",
//     advancePayment: {
//       amount: 0,
//       method: "cash",
//     },
//   });

//   // 💰 Multiple payments management
//   const [payments, setPayments] = useState([]);
//   const [showPaymentModal, setShowPaymentModal] = useState(false);
//   const [editingPayment, setEditingPayment] = useState(null);
  
//   // 🔥 NEW: Track current order ID for payments after creation
//   const [currentOrderId, setCurrentOrderId] = useState("temp");

//   // 👕 Garments management
//   const [garments, setGarments] = useState([]);
//   const [showGarmentModal, setShowGarmentModal] = useState(false);
//   const [editingGarment, setEditingGarment] = useState(null);
  
//   // 🔍 Customer search and selection
//   const [searchTerm, setSearchTerm] = useState("");
//   const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
//   const [selectedCustomerDisplay, setSelectedCustomerDisplay] = useState("");
  
//   // ⏳ Form submission states
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [serverErrors, setServerErrors] = useState(null);

//   // 📅 Calendar states
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [showCalendar, setShowCalendar] = useState(false);
//   const [currentMonth, setCurrentMonth] = useState(new Date());
//   const calendarRef = useRef(null);

//   // 🖼️ Image preview states
//   const [showImagePreview, setShowImagePreview] = useState(false);
//   const [previewImages, setPreviewImages] = useState([]);
//   const [previewTitle, setPreviewTitle] = useState("");
  
//   // 🔥 NEW: State for expanded garment images
//   const [expandedGarment, setExpandedGarment] = useState(null);

//   // 🔒 DUPLICATE SUBMISSION PREVENTION - using ref for instant lock
//   const isSubmittingRef = useRef(false);
  
//   // 🆔 Generate unique request ID for tracking submissions
//   const generateRequestId = () => {
//     return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`;
//   };

//   // 👤 Get user ID from auth
//   const userId = user?.id || user?._id;
//   const userRole = user?.role;

//   // 🧭 Base path based on user role (navigation purpose)
//   const basePath = user?.role === "ADMIN" ? "/admin" : 
//                    user?.role === "STORE_KEEPER" ? "/storekeeper" : 
//                    "/cuttingmaster";

//   // Load customers on mount
//   useEffect(() => {
//     dispatch(fetchAllCustomers())
//       .unwrap()
//       .catch((error) => {
//         showToast.error("Failed to load customers");
//       });
//   }, [dispatch]);

//   // AUTO-FILL: When customer passed from Customer page, auto-select them
//   useEffect(() => {
//     if (passedCustomer) {
//       const fullCustomer = customers?.find(c => c._id === passedCustomer._id) || passedCustomer;
      
//       setFormData(prev => ({
//         ...prev,
//         customer: fullCustomer._id
//       }));

//       const fullName = getCustomerFullName(fullCustomer);
//       const displayId = getCustomerDisplayId(fullCustomer);
//       let displayText = `${fullName} (${displayId})`;
      
//       setSelectedCustomerDisplay(displayText);
//       setSearchTerm(displayText);
//       setShowCustomerDropdown(false);
//     }
//   }, [passedCustomer, customers]);

//   // Fetch order dates for calendar when month changes
//   useEffect(() => {
//     const month = currentMonth.getMonth();
//     const year = currentMonth.getFullYear();
//     dispatch(fetchOrderDates({ month, year }));
//   }, [currentMonth, dispatch]);

//   // Close calendar when clicking outside
//   useEffect(() => {
//     function handleClickOutside(event) {
//       if (calendarRef.current && !calendarRef.current.contains(event.target)) {
//         setShowCalendar(false);
//       }
//     }
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   // 👤 Helper: Get customer full name from various possible fields
//   const getCustomerFullName = (customer) => {
//     if (!customer) return 'Unknown Customer';
    
//     if (customer.firstName || customer.lastName) {
//       const firstName = customer.firstName || '';
//       const lastName = customer.lastName || '';
//       const fullName = `${firstName} ${lastName}`.trim();
//       if (fullName) return fullName;
//     }
    
//     if (customer.name) return customer.name;
    
//     return 'Unknown Customer';
//   };

//   // 🔢 Helper: Get customer display ID (customerId or last 6 digits of _id)
//   const getCustomerDisplayId = (customer) => {
//     if (!customer) return '';
//     return customer.customerId || customer._id?.slice(-6) || '';
//   };

//   // 📞 Helper: Get customer phone number
//   const getCustomerPhone = (customer) => {
//     if (!customer) return 'No phone';
//     return customer.phone || customer.whatsappNumber || 'No phone';
//   };

//   // Filter customers based on search term
//   const filteredCustomers = useMemo(() => {
//     if (!customers || !Array.isArray(customers) || customers.length === 0) {
//       return [];
//     }
    
//     if (formData.customer && searchTerm === selectedCustomerDisplay) {
//       return [];
//     }
    
//     return customers.filter(customer => {
//       if (!customer) return false;

//       const fullName = getCustomerFullName(customer).toLowerCase();
//       const customerId = getCustomerDisplayId(customer).toLowerCase();
//       const phone = getCustomerPhone(customer).toLowerCase();
//       const firstName = (customer.firstName || '').toLowerCase();
//       const lastName = (customer.lastName || '').toLowerCase();
      
//       const searchLower = searchTerm.toLowerCase();
      
//       return fullName.includes(searchLower) ||
//              firstName.includes(searchLower) ||
//              lastName.includes(searchLower) ||
//              phone.includes(searchLower) ||
//              customerId.includes(searchLower);
//     });
//   }, [customers, searchTerm, formData.customer, selectedCustomerDisplay]);

//   // Calculate total payments - with NaN protection and DEBUG
//   const totalPayments = useMemo(() => {
//     console.log("%c💰💰💰 CALCULATING TOTAL PAYMENTS 💰💰💰", "background: purple; color: white; font-size: 12px");
//     console.log("Payments array:", payments);
    
//     const total = payments.reduce((sum, payment, idx) => {
//       const rawAmount = payment.amount;
//       const numAmount = Number(rawAmount);
//       const safeAmount = isNaN(numAmount) ? 0 : numAmount;
      
//       console.log(`  Payment ${idx + 1}:`, {
//         raw: rawAmount,
//         type: typeof rawAmount,
//         converted: numAmount,
//         safe: safeAmount,
//         isNaN: isNaN(numAmount)
//       });
      
//       return sum + safeAmount;
//     }, 0);
    
//     console.log("✅ Total payments:", total);
//     return total;
//   }, [payments]);

//   // Calculate price summary - with NaN protection and DEBUG
//   const priceSummary = useMemo(() => {
//     console.log("%c👕👕👕 CALCULATING PRICE SUMMARY 👕👕👕", "background: blue; color: white; font-size: 12px");
//     console.log("Garments count:", garments.length);
    
//     const totalMin = garments.reduce((sum, g, idx) => {
//       const rawMin = g.priceRange?.min;
//       const numMin = Number(rawMin);
//       const safeMin = isNaN(numMin) ? 0 : numMin;
      
//       console.log(`  Garment ${idx + 1} (${g.name}):`, {
//         raw: rawMin,
//         type: typeof rawMin,
//         converted: numMin,
//         safe: safeMin,
//         isNaN: isNaN(numMin)
//       });
      
//       return sum + safeMin;
//     }, 0);
    
//     const totalMax = garments.reduce((sum, g, idx) => {
//       const rawMax = g.priceRange?.max;
//       const numMax = Number(rawMax);
//       const safeMax = isNaN(numMax) ? 0 : numMax;
      
//       console.log(`  Garment ${idx + 1} max:`, {
//         raw: rawMax,
//         type: typeof rawMax,
//         converted: numMax,
//         safe: safeMax,
//         isNaN: isNaN(numMax)
//       });
      
//       return sum + safeMax;
//     }, 0);
    
//     console.log("✅ Price summary - Min:", totalMin, "Max:", totalMax);
//     return { totalMin, totalMax };
//   }, [garments]);

//   // Calculate balance - with NaN protection and DEBUG
//   const balanceAmount = useMemo(() => {
//     console.log("%c⚖️⚖️⚖️ CALCULATING BALANCE ⚖️⚖️⚖️", "background: orange; color: white; font-size: 12px");
    
//     const totalMin = isNaN(priceSummary.totalMin) ? 0 : Number(priceSummary.totalMin);
//     const totalMax = isNaN(priceSummary.totalMax) ? 0 : Number(priceSummary.totalMax);
//     const paid = isNaN(totalPayments) ? 0 : Number(totalPayments);
    
//     console.log("  Total Min:", totalMin);
//     console.log("  Total Max:", totalMax);
//     console.log("  Total Paid:", paid);
    
//     const balance = {
//       min: totalMin - paid,
//       max: totalMax - paid,
//     };
    
//     console.log("✅ Balance - Min:", balance.min, "Max:", balance.max);
//     return balance;
//   }, [priceSummary, totalPayments]);

//   // 🔍🔍🔍 CUSTOMER HANDLERS 🔍🔍🔍
  
//   // Handle customer search input change
//   const handleSearchChange = useCallback((e) => {
//     const value = e.target.value;
//     console.log("🔍 Search term changed:", value);
//     setSearchTerm(value);
//     setShowCustomerDropdown(true);
    
//     if (!value.trim()) {
//       setFormData(prev => ({ ...prev, customer: "" }));
//       setSelectedCustomerDisplay("");
//     }
//   }, []);

//   // Handle customer selection from dropdown
//   const handleCustomerSelect = useCallback((customer) => {
//     console.log("%c👤👤👤 CUSTOMER SELECTED 👤👤👤", "background: green; color: white; font-size: 12px");
//     console.log("Customer:", customer);
    
//     const fullName = getCustomerFullName(customer);
//     const displayId = getCustomerDisplayId(customer);
    
//     setFormData(prev => ({
//       ...prev,
//       customer: customer._id
//     }));

//     let displayText = `${fullName} (${displayId})`;
//     setSelectedCustomerDisplay(displayText);
//     setSearchTerm(displayText);
//     setShowCustomerDropdown(false);
    
//     console.log("✅ Customer selected:", displayText);
//   }, []);

//   // 💰 PAYMENT HANDLERS
//   const handleAddPayment = useCallback(() => {
//     console.log("%c➕➕➕ ADD PAYMENT BUTTON CLICKED ➕➕➕", "background: green; color: white; font-size: 12px");
//     setEditingPayment(null);
//     setShowPaymentModal(true);
//   }, []);

//   const handleEditPayment = useCallback((payment) => {
//     console.log("%c✏️✏️✏️ EDIT PAYMENT ✏️✏️✏️", "background: orange; color: white; font-size: 12px");
//     console.log("Payment to edit:", payment);
//     setEditingPayment(payment);
//     setShowPaymentModal(true);
//   }, []);

//   const handleDeletePayment = useCallback((index) => {
//     console.log("%c🗑️🗑️🗑️ DELETE PAYMENT 🗑️🗑️🗑️", "background: red; color: white; font-size: 12px");
//     console.log("Deleting payment at index:", index);
//     console.log("Payment:", payments[index]);
    
//     if (window.confirm("Are you sure you want to delete this payment?")) {
//       const newPayments = [...payments];
//       newPayments.splice(index, 1);
//       setPayments(newPayments);
//       console.log("✅ Payment deleted, remaining:", newPayments.length);
//       showToast.success("Payment removed");
//     }
//   }, [payments]);

//   // 🔥 Handle Save Payment - Works for both new and existing orders
//   const handleSavePayment = useCallback((paymentData) => {
//     console.log("%c💾💾💾 SAVE PAYMENT CALLED 💾💾💾", "background: purple; color: white; font-size: 14px");
//     console.log("📦 Payment data received:", JSON.parse(JSON.stringify(paymentData)));
//     console.log("📦 Current Order ID:", currentOrderId);
//     console.log("📦 Is New Order?", currentOrderId === "temp");
    
//     // 🔥 CRITICAL: Check if amount is valid
//     console.log("💰 Amount in paymentData:", paymentData.amount);
//     console.log("💰 Amount type:", typeof paymentData.amount);
//     console.log("💰 Is NaN:", isNaN(paymentData.amount));
    
//     // Map type
//     let backendType = paymentData.type || 'advance';
//     if (backendType === 'partial') {
//       backendType = 'part-payment';
//     } else if (backendType === 'full') {
//       backendType = 'final-settlement';
//     }
    
//     const paymentWithMappedType = {
//       ...paymentData,
//       type: backendType,
//       date: paymentData.paymentDate || paymentData.date || new Date().toISOString().split('T')[0],
//       time: paymentData.paymentTime || paymentData.time || new Date().toLocaleTimeString('en-US', { hour12: false })
//     };
    
//     console.log("📦 Payment with mapped type:", JSON.parse(JSON.stringify(paymentWithMappedType)));
    
//     // 🔥 NEW: Check if this is a new order (before creation) or existing order (after creation)
//     if (currentOrderId === "temp") {
//       // NEW ORDER - Store in local state
//       console.log("📝 New order - storing payment locally");
      
//       if (editingPayment) {
//         console.log("✏️ Updating existing payment, tempId:", editingPayment.tempId);
//         const index = payments.findIndex(p => p.tempId === editingPayment.tempId);
//         console.log("Found at index:", index);
        
//         if (index !== -1) {
//           const newPayments = [...payments];
//           newPayments[index] = { 
//             ...paymentWithMappedType, 
//             tempId: editingPayment.tempId
//           };
//           setPayments(newPayments);
//           console.log("✅ Payment updated, new payments array:", newPayments);
//           showToast.success("Payment updated");
//         }
//       } else {
//         const newPayment = {
//           ...paymentWithMappedType,
//           tempId: Date.now() + Math.random()
//         };
//         console.log("➕ Adding new payment with tempId:", newPayment.tempId);
//         setPayments(prev => {
//           const updated = [...prev, newPayment];
//           console.log("✅ Payment added, new payments array:", updated);
//           return updated;
//         });
//         showToast.success("Payment added");
//       }
//     } else {
//       // EXISTING ORDER - Call API directly
//       console.log("📡 Existing order - calling API to add payment");
      
//       // Show loading toast
//       const toastId = showToast.loading("Adding payment...");
      
//       // Call API to add payment (you need to implement this in Redux)
//       dispatch(addPaymentToOrder({
//         orderId: currentOrderId,
//         paymentData: {
//           amount: paymentData.amount,
//           type: paymentData.type,
//           method: paymentData.method,
//           referenceNumber: paymentData.referenceNumber,
//           paymentDate: paymentData.paymentDate,
//           paymentTime: paymentData.paymentTime,
//           notes: paymentData.notes
//         }
//       })).then((result) => {
//         console.log("✅ Payment added via API:", result);
//         showToast.dismiss(toastId);
//         showToast.success("Payment added successfully!");
        
//         // Refresh order data to show updated payments
//         dispatch(fetchOrderById(currentOrderId));
//       }).catch((error) => {
//         console.error("❌ Error adding payment:", error);
//         showToast.dismiss(toastId);
//         showToast.error(error.response?.data?.message || "Failed to add payment");
//       });
//     }
    
//     setShowPaymentModal(false);
//     setEditingPayment(null);
//   }, [payments, editingPayment, currentOrderId, dispatch]);

//   // 👕 GARMENT HANDLERS
//   const handleAddGarment = useCallback(() => {
//     console.log("%c➕➕➕ ADD GARMENT BUTTON CLICKED ➕➕➕", "background: blue; color: white; font-size: 12px");
//     if (!formData.customer) {
//       console.log("❌ Cannot add garment - no customer selected");
//       showToast.error("Please select a customer first before adding garments");
//       return;
//     }
    
//     setEditingGarment(null);
//     setShowGarmentModal(true);
//   }, [formData.customer]);

//   const handleEditGarment = useCallback((garment) => {
//     console.log("%c✏️✏️✏️ EDIT GARMENT ✏️✏️✏️", "background: orange; color: white; font-size: 12px");
//     console.log("Garment to edit:", garment);
//     setEditingGarment(garment);
//     setShowGarmentModal(true);
//   }, []);

//   const handleDeleteGarment = useCallback((index, garment) => {
//     console.log("%c🗑️🗑️🗑️ DELETE GARMENT 🗑️🗑️🗑️", "background: red; color: white; font-size: 12px");
//     console.log("Deleting garment at index:", index);
//     console.log("Garment:", garment);
    
//     if (window.confirm(`Are you sure you want to remove ${garment.name || 'this garment'}?`)) {
//       const newGarments = [...garments];
//       newGarments.splice(index, 1);
//       setGarments(newGarments);
//       console.log("✅ Garment deleted, remaining:", newGarments.length);
//       showToast.success("Garment removed");
//     }
//   }, [garments]);

//   // 🎯 ADD THIS MISSING FUNCTION - handleSaveGarment
//   const handleSaveGarment = useCallback((garmentData) => {
//     console.log("%c📥📥📥 HANDLE SAVE GARMENT CALLED 📥📥📥", "background: blue; color: white; font-size: 14px");
//     console.log("Type:", garmentData instanceof FormData ? "FormData" : "Object");
    
//     if (garmentData instanceof FormData) {
//       // Convert FormData to object
//       const garmentObj = {
//         tempId: editingGarment?.tempId || Date.now() + Math.random(),
//         referenceImages: [],
//         customerImages: [],
//         customerClothImages: []
//       };
      
//       console.log("📦 Processing FormData entries:");
//       for (let [key, value] of garmentData.entries()) {
//         if (value instanceof File) {
//           console.log(`  📸 ${key}: File - ${value.name} (${value.type}, ${value.size} bytes)`);
          
//           if (key === 'referenceImages') {
//             garmentObj.referenceImages.push(value);
//           } else if (key === 'customerImages') {
//             garmentObj.customerImages.push(value);
//           } else if (key === 'customerClothImages') {
//             garmentObj.customerClothImages.push(value);
//           }
//         } else {
//           // Truncate long strings for display
//           const displayValue = value && value.length > 50 ? value.substring(0, 50) + '...' : value;
//           console.log(`  📝 ${key}: ${displayValue}`);
          
//           if (key === 'measurements' || key === 'priceRange') {
//             try {
//               garmentObj[key] = JSON.parse(value);
//             } catch (e) {
//               garmentObj[key] = value;
//             }
//           } else {
//             garmentObj[key] = value;
//           }
//         }
//       }
      
//       // Verify images were captured
//       console.log("✅ Garment object created:", {
//         name: garmentObj.name,
//         category: garmentObj.category,
//         item: garmentObj.item,
//         referenceImages: garmentObj.referenceImages?.length || 0,
//         customerImages: garmentObj.customerImages?.length || 0,
//         customerClothImages: garmentObj.customerClothImages?.length || 0
//       });
      
//       if (editingGarment) {
//         // Update existing garment
//         console.log("✏️ Updating existing garment, tempId:", editingGarment.tempId);
//         const index = garments.findIndex(g => g.tempId === editingGarment.tempId);
//         console.log("Found at index:", index);
        
//         if (index !== -1) {
//           const newGarments = [...garments];
//           newGarments[index] = garmentObj;
//           setGarments(newGarments);
//           showToast.success("Garment updated");
//           console.log("🔄 Updated garment at index:", index);
//           console.log("New garments array:", newGarments);
//         }
//       } else {
//         // Add new garment
//         console.log("➕ Adding new garment");
//         setGarments(prev => {
//           const updated = [...prev, garmentObj];
//           console.log("New garments array:", updated);
//           return updated;
//         });
//         showToast.success("Garment added");
//         console.log("➕ Added new garment, total garments:", garments.length + 1);
//       }
//     } else {
//       // Handle regular object (no images)
//       console.log("📦 Received regular object:", garmentData);
      
//       if (editingGarment) {
//         const index = garments.findIndex(g => g.tempId === editingGarment.tempId);
//         if (index !== -1) {
//           const newGarments = [...garments];
//           newGarments[index] = { ...garmentData, tempId: editingGarment.tempId };
//           setGarments(newGarments);
//           showToast.success("Garment updated");
//         }
//       } else {
//         const newGarment = {
//           ...garmentData,
//           tempId: Date.now() + Math.random()
//         };
//         setGarments([...garments, newGarment]);
//         showToast.success("Garment added");
//       }
//     }
    
//     setShowGarmentModal(false);
//   }, [garments, editingGarment]);

//   // 🖼️ IMAGE PREVIEW HANDLERS
//   const handleViewImages = useCallback((images, type) => {
//     console.log(`%c👁️👁️👁️ VIEW IMAGES: ${type} 👁️👁️👁️`, "background: purple; color: white; font-size: 12px");
//     console.log("Images:", images);
//     console.log("Image count:", images?.length);
    
//     if (images && images.length > 0) {
//       try {
//         // Create object URLs for File objects
//         const imageUrls = images.map((img, idx) => {
//           if (img instanceof File) {
//             console.log(`  Creating URL for File ${idx + 1}:`, img.name);
//             return URL.createObjectURL(img);
//           } else if (img?.url) {
//             console.log(`  Using URL from object:`, img.url);
//             return img.url;
//           } else if (typeof img === 'string') {
//             console.log(`  Using string URL:`, img);
//             return img;
//           } else {
//             console.log(`  Unknown image type:`, img);
//             return null;
//           }
//         }).filter(url => url !== null);
        
//         console.log(`  Setting ${imageUrls.length} preview images`);
//         setPreviewImages(imageUrls);
//         setPreviewTitle(type);
//         setShowImagePreview(true);
//       } catch (error) {
//         console.error("❌ Error in handleViewImages:", error);
//         showToast.error("Failed to load images");
//       }
//     } else {
//       console.warn("⚠️ No images to view");
//       showToast.warning("No images to display");
//     }
//   }, []);

//   // Clean up object URLs when modal closes
//   const handleClosePreview = useCallback(() => {
//     console.log("%c🗑️🗑️🗑️ CLOSING PREVIEW, CLEANING UP URLs 🗑️🗑️🗑️", "background: red; color: white; font-size: 12px");
    
//     // Revoke object URLs to avoid memory leaks
//     previewImages.forEach(url => {
//       if (url && typeof url === 'string' && url.startsWith('blob:')) {
//         try {
//           URL.revokeObjectURL(url);
//           console.log("  Revoked URL:", url);
//         } catch (e) {
//           console.error("Error revoking URL:", e);
//         }
//       }
//     });
    
//     setShowImagePreview(false);
//     setPreviewImages([]);
//     setPreviewTitle("");
//   }, [previewImages]);

//   // Helper function to get category name from ID
//   const getCategoryName = useCallback((categoryId) => {
//     if (!categoryId) return 'Unknown';
//     const category = categories?.find(c => c._id === categoryId);
//     return category?.name || category?.categoryName || categoryId;
//   }, [categories]);

//   // Helper function to get item name from garment object
//   const getItemName = useCallback((garment) => {
//     if (garment.itemName) return garment.itemName;
    
//     if (garment.item && categories) {
//       for (const category of categories) {
//         if (category.items && Array.isArray(category.items)) {
//           const foundItem = category.items.find(item => 
//             item._id === garment.item || item._id?.toString() === garment.item?.toString()
//           );
//           if (foundItem) return foundItem.name || foundItem.itemName;
//         }
//       }
//     }
    
//     return garment.item || 'Unknown';
//   }, [categories]);

//   // 📅 CALENDAR HANDLERS
//   const handleDateSelect = useCallback((date) => {
//     console.log("%c📅📅📅 DATE SELECTED 📅📅📅", "background: green; color: white; font-size: 12px");
//     console.log("Date object:", date);
    
//     setSelectedDate(date);
//     setShowCalendar(false);
    
//     // Get local date string considering timezone
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, '0');
//     const day = String(date.getDate()).padStart(2, '0');
//     const localDateStr = `${year}-${month}-${day}`;
    
//     setFormData(prev => ({
//       ...prev,
//       deliveryDate: localDateStr
//     }));
    
//     console.log("Local date string:", localDateStr);
//   }, []);

//   const handleMonthChange = useCallback((date) => {
//     console.log("📅 Month changed to:", date.toLocaleString('default', { month: 'long', year: 'numeric' }));
//     setCurrentMonth(date);
//   }, []);

//   const formatDisplayDate = useCallback((dateStr) => {
//     if (!dateStr) return "Select delivery date";
    
//     const [year, month, day] = dateStr.split('-').map(Number);
//     const date = new Date(year, month - 1, day);
    
//     return date.toLocaleDateString('en-IN', {
//       weekday: 'short',
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   }, []);

//   // Simple green dot for dates with orders
//   // const renderDayContents = useCallback((day, date) => {
//   //   const year = date.getFullYear();
//   //   const month = String(date.getMonth() + 1).padStart(2, '0');
//   //   const dayOfMonth = String(date.getDate()).padStart(2, '0');
//   //   const localDateStr = `${year}-${month}-${dayOfMonth}`;
    
//   //   const hasOrders = orderDates.includes(localDateStr);
    
//   //   return (
//   //     <div className="relative">
//   //       <div>{day}</div>
//   //       {hasOrders && (
//   //         <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white  style={{ 
//   //           backgroundColor: '#ef4444',  // 🔴 Force red
//   //           boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
//   //         }}"></div>
          
//   //       )}
//   //     </div>
//   //   );
//   // }, [orderDates]);


//   // 📅 CALENDAR HANDLERS - Indha section-ai replace pannunga
// const renderDayContents = useCallback((day, date) => {
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const dayOfMonth = String(date.getDate()).padStart(2, '0');
//   const localDateStr = `${year}-${month}-${dayOfMonth}`;
  
//   const hasOrders = orderDates.includes(localDateStr);
  
//   return (
//     <div className="relative">
//       <div>{day}</div>
//       {hasOrders && (
//         <div 
//           className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm"
//           style={{ 
//             backgroundColor: '#ef4444', // 🔴 Absolute Red
//             zIndex: 10 
//           }}
//         ></div>
//       )}
//     </div>
//   );
// }, [orderDates]);
//   // Payment Method Icon Component
//   const PaymentMethodIcon = ({ method }) => {
//     switch(method) {
//       case 'cash':
//         return <Banknote size={14} className="text-green-600" />;
//       case 'upi':
//         return <Smartphone size={14} className="text-blue-600" />;
//       case 'bank-transfer':
//         return <Landmark size={14} className="text-purple-600" />;
//       case 'card':
//         return <CreditCard size={14} className="text-orange-600" />;
//       default:
//         return <Wallet size={14} className="text-slate-600" />;
//     }
//   };

//   // 🔥 MAIN SUBMIT HANDLER
//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     console.log("\n");
//     console.log("%c🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥", "background: red; color: white; font-size: 16px; font-weight: bold");
//     console.log("%c🔥          FORM SUBMISSION STARTED          🔥", "background: red; color: white; font-size: 16px; font-weight: bold");
//     console.log("%c🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥", "background: red; color: white; font-size: 16px; font-weight: bold");
//     console.log("\n");
    
//     console.log("📋 FORM DATA:", JSON.parse(JSON.stringify(formData)));
//     console.log("💰 PAYMENTS:", JSON.parse(JSON.stringify(payments)));
//     console.log("👕 GARMENTS COUNT:", garments.length);
//     console.log("👕 GARMENTS DETAILS:", JSON.parse(JSON.stringify(garments.map(g => ({
//       name: g.name,
//       priceMin: g.priceRange?.min,
//       priceMax: g.priceRange?.max,
//       refImages: g.referenceImages?.length || 0,
//       custImages: g.customerImages?.length || 0,
//       clothImages: g.customerClothImages?.length || 0
//     })))));
    
//     if (isSubmittingRef.current) {
//       console.log("⚠️ Submission already in progress, preventing duplicate");
//       showToast.warning("Order creation in progress, please wait...");
//       return;
//     }

//     setServerErrors(null);

//     // Validation
//     if (!formData.customer) {
//       console.error("❌ Missing customer");
//       showToast.error("Please select a customer");
//       return;
//     }

//     if (garments.length === 0) {
//       console.error("❌ No garments");
//       showToast.error("Please add at least one garment");
//       return;
//     }

//     if (!formData.deliveryDate) {
//       console.error("❌ Missing delivery date");
//       showToast.error("Please select delivery date");
//       return;
//     }

//     const finalUserId = userId;
//     if (!finalUserId) {
//       console.error("❌ No user ID");
//       showToast.error("You must be logged in to create an order");
//       return;
//     }

//     // Validate MongoDB IDs
//     const customerIdValid = /^[0-9a-fA-F]{24}$/.test(formData.customer);
//     const userIdValid = /^[0-9a-fA-F]{24}$/.test(finalUserId);

//     if (!customerIdValid) {
//       console.error("❌ Invalid customer ID:", formData.customer);
//       showToast.error("Invalid customer ID format");
//       return;
//     }

//     if (!userIdValid) {
//       console.error("❌ Invalid user ID:", finalUserId);
//       showToast.error("Invalid user ID format. Please log in again.");
//       return;
//     }

//     // 🔥 Set submission lock
//     isSubmittingRef.current = true;
//     setIsSubmitting(true);

//     // 🔥 Generate unique request ID
//     const requestId = generateRequestId();
//     console.log("🔒 Request ID:", requestId);

//     try {
//       // Disable submit button
//       const submitButton = e.target.querySelector('button[type="submit"]');
//       if (submitButton) {
//         submitButton.disabled = true;
//       }

//       console.log("\n");
//       console.log("%c💰💰💰💰💰💰💰💰💰💰💰💰💰💰💰💰💰💰💰💰💰", "background: purple; color: white; font-size: 14px");
//       console.log("%c💰       PROCESSING PAYMENTS (SAFE MODE)       💰", "background: purple; color: white; font-size: 14px");
//       console.log("%c💰💰💰💰💰💰💰💰💰💰💰💰💰💰💰💰💰💰💰💰💰", "background: purple; color: white; font-size: 14px");
//       console.log("\n");
      
//       console.log("💰 Processing payments:", payments.length);
//       const mappedPayments = payments.map((payment, idx) => {
//         let modelType = payment.type || 'advance';
        
//         if (modelType === 'partial') {
//           modelType = 'part-payment';
//         } else if (modelType === 'full') {
//           modelType = 'final-settlement';
//         }
        
//         // 🔥 CRITICAL: Safe number conversion with multiple checks
//         const rawAmount = payment.amount;
//         console.log(`\n📌 Payment ${idx + 1} amount analysis:`);
//         console.log(`  Raw value:`, rawAmount);
//         console.log(`  Type:`, typeof rawAmount);
        
//         let safeAmount = 0;
        
//         if (rawAmount === undefined || rawAmount === null) {
//           console.log(`  ❌ Amount is undefined/null`);
//         } else {
//           const strAmount = String(rawAmount).trim();
//           console.log(`  String:`, strAmount);
//           console.log(`  Length:`, strAmount.length);
          
//           if (strAmount === '') {
//             console.log(`  ❌ Amount is empty string`);
//           } else {
//             const numAmount = Number(strAmount);
//             console.log(`  Number():`, numAmount);
//             console.log(`  Is NaN:`, isNaN(numAmount));
            
//             if (!isNaN(numAmount) && numAmount > 0) {
//               safeAmount = numAmount;
//               console.log(`  ✅ Valid amount:`, safeAmount);
//             } else {
//               console.log(`  ❌ Invalid amount (using 0)`);
//             }
//           }
//         }
        
//         console.log(`  ✅ Final safe amount:`, safeAmount);
        
//         return {
//           amount: safeAmount,
//           type: modelType,
//           method: payment.method || 'cash',
//           referenceNumber: payment.referenceNumber || '',
//           date: payment.date || new Date().toISOString().split('T')[0],
//           notes: payment.notes || ''
//         };
//       });

//       console.log("\n✅ Mapped payments:", JSON.parse(JSON.stringify(mappedPayments)));

//       console.log("\n");
//       console.log("%c👕👕👕👕👕👕👕👕👕👕👕👕👕👕👕👕👕👕👕👕👕", "background: blue; color: white; font-size: 14px");
//       console.log("%c👕       PROCESSING GARMENTS (SAFE MODE)       👕", "background: blue; color: white; font-size: 14px");
//       console.log("%c👕👕👕👕👕👕👕👕👕👕👕👕👕👕👕👕👕👕👕👕👕", "background: blue; color: white; font-size: 14px");
//       console.log("\n");

//       // 📝 Prepare order data with ALL fields properly formatted
//       console.log("📦 Preparing order data...");
      
//       // Safe number conversions for all values
//       const safeTotalMin = isNaN(Number(priceSummary.totalMin)) ? 0 : Number(priceSummary.totalMin);
//       const safeTotalMax = isNaN(Number(priceSummary.totalMax)) ? 0 : Number(priceSummary.totalMax);
//       const safeTotalPayments = isNaN(Number(totalPayments)) ? 0 : Number(totalPayments);
      
//       console.log("💰 Price summary:", { safeTotalMin, safeTotalMax, safeTotalPayments });
      
//       const orderData = {
//         customer: formData.customer,
//         deliveryDate: formData.deliveryDate,
//         specialNotes: formData.specialNotes || "",
//         payments: mappedPayments,
//         advancePayment: {
//           amount: mappedPayments.length > 0 ? (isNaN(Number(mappedPayments[0].amount)) ? 0 : Number(mappedPayments[0].amount)) : 0,
//           method: mappedPayments.length > 0 ? mappedPayments[0].method : "cash",
//           date: new Date().toISOString()
//         },
//         priceSummary: {
//           totalMin: safeTotalMin,
//           totalMax: safeTotalMax
//         },
//         balanceAmount: safeTotalMax - safeTotalPayments,
//         createdBy: finalUserId,
//         status: "confirmed",
//         orderDate: new Date().toISOString(),
//         requestId: requestId,
//         garments: garments.map((g, idx) => {
//           console.log(`\n👕 Processing garment ${idx + 1}: ${g.name}`);
          
//           // Safe number conversions for garment prices
//           const minPrice = isNaN(Number(g.priceRange?.min)) ? 0 : Number(g.priceRange?.min);
//           const maxPrice = isNaN(Number(g.priceRange?.max)) ? 0 : Number(g.priceRange?.max);
//           const fabricPrice = isNaN(Number(g.fabricPrice)) ? 0 : Number(g.fabricPrice);
          
//           console.log(`  Price range: ${minPrice} - ${maxPrice}`);
//           console.log(`  Fabric price: ${fabricPrice}`);
//           console.log(`  Images: Ref:${g.referenceImages?.length || 0}, Cust:${g.customerImages?.length || 0}, Cloth:${g.customerClothImages?.length || 0}`);
          
//           return {
//             name: g.name,
//             garmentType: g.item || g.garmentType || g.itemName || g.name,
//             category: g.category,
//             item: g.item,
//             categoryName: g.categoryName,
//             itemName: g.itemName,
//             measurementTemplate: g.measurementTemplate,
//             measurementSource: g.measurementSource,
//             measurements: g.measurements || [],
//             additionalInfo: g.additionalInfo || '',
//             estimatedDelivery: g.estimatedDelivery || formData.deliveryDate,
//             priority: g.priority || 'normal',
//             priceRange: {
//               min: minPrice,
//               max: maxPrice
//             },
//             fabricSource: g.fabricSource || 'customer',
//             fabricPrice: fabricPrice,
//             referenceImages: g.referenceImages || [],
//             customerImages: g.customerImages || [],
//             customerClothImages: g.customerClothImages || []
//           };
//         })
//       };

//       console.log("\n");
//       console.log("%c✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅", "background: green; color: white; font-size: 14px");
//       console.log("%c✅       FINAL ORDER DATA VALIDATION       ✅", "background: green; color: white; font-size: 14px");
//       console.log("%c✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅", "background: green; color: white; font-size: 14px");
//       console.log("\n");
      
//       console.log("  Customer:", orderData.customer);
//       console.log("  Delivery Date:", orderData.deliveryDate);
//       console.log("  Payments count:", orderData.payments.length);
//       console.log("  Garments count:", orderData.garments.length);
//       console.log("  Total Min:", orderData.priceSummary.totalMin);
//       console.log("  Total Max:", orderData.priceSummary.totalMax);
//       console.log("  Balance:", orderData.balanceAmount);
      
//       // 🔍 Check for any NaN values
//       console.log("\n🔍 NAN DETECTION SCAN:");
//       let hasNaN = false;
      
//       if (isNaN(orderData.priceSummary.totalMin)) { 
//         console.error("❌ totalMin is NaN"); 
//         hasNaN = true; 
//       } else {
//         console.log("✅ totalMin OK");
//       }
      
//       if (isNaN(orderData.priceSummary.totalMax)) { 
//         console.error("❌ totalMax is NaN"); 
//         hasNaN = true; 
//       } else {
//         console.log("✅ totalMax OK");
//       }
      
//       if (isNaN(orderData.balanceAmount)) { 
//         console.error("❌ balanceAmount is NaN"); 
//         hasNaN = true; 
//       } else {
//         console.log("✅ balanceAmount OK");
//       }
      
//       orderData.payments.forEach((p, i) => {
//         if (isNaN(p.amount)) { 
//           console.error(`❌ payment[${i}].amount is NaN`); 
//           hasNaN = true; 
//         } else {
//           console.log(`✅ payment[${i}].amount OK (${p.amount})`);
//         }
//       });
      
//       orderData.garments.forEach((g, i) => {
//         if (isNaN(g.priceRange.min)) { 
//           console.error(`❌ garment[${i}].priceRange.min is NaN`); 
//           hasNaN = true; 
//         } else {
//           console.log(`✅ garment[${i}].priceRange.min OK (${g.priceRange.min})`);
//         }
        
//         if (isNaN(g.priceRange.max)) { 
//           console.error(`❌ garment[${i}].priceRange.max is NaN`); 
//           hasNaN = true; 
//         } else {
//           console.log(`✅ garment[${i}].priceRange.max OK (${g.priceRange.max})`);
//         }
        
//         if (isNaN(g.fabricPrice)) { 
//           console.error(`❌ garment[${i}].fabricPrice is NaN`); 
//           hasNaN = true; 
//         } else {
//           console.log(`✅ garment[${i}].fabricPrice OK (${g.fabricPrice})`);
//         }
//       });
      
//       if (hasNaN) {
//         console.error("\n❌❌❌ NAN VALUES DETECTED! Stopping submission. ❌❌❌");
//         throw new Error("NaN values detected in order data. Please check all number fields.");
//       }

//       // Check if there are any images
//       const hasImages = orderData.garments.some(g => 
//         g.referenceImages?.length > 0 || 
//         g.customerImages?.length > 0 || 
//         g.customerClothImages?.length > 0
//       );
//       console.log("\n📸 Has images:", hasImages ? "YES" : "NO");
//       if (hasImages) {
//         console.log("📸 Image details:");
//         orderData.garments.forEach((g, i) => {
//           if (g.referenceImages?.length > 0) console.log(`  Garment ${i+1}: ${g.referenceImages.length} reference images`);
//           if (g.customerImages?.length > 0) console.log(`  Garment ${i+1}: ${g.customerImages.length} customer images`);
//           if (g.customerClothImages?.length > 0) console.log(`  Garment ${i+1}: ${g.customerClothImages.length} cloth images`);
//         });
//       }

//       console.log("\n");
//       console.log("%c📡📡📡📡📡📡📡📡📡📡📡📡📡📡📡📡📡📡📡📡📡", "background: blue; color: white; font-size: 14px");
//       console.log("%c📡       DISPATCHING TO REDUX       📡", "background: blue; color: white; font-size: 14px");
//       console.log("%c📡📡📡📡📡📡📡📡📡📡📡📡📡📡📡📡📡📡📡📡📡", "background: blue; color: white; font-size: 14px");
//       console.log("\n");

//       // 🔥 Create the order
//       console.log("📡 Dispatching createNewOrder...");
//       const result = await dispatch(createNewOrder(orderData)).unwrap();
      
//       console.log("\n");
//       console.log("%c✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅", "background: green; color: white; font-size: 16px; font-weight: bold");
//       console.log("%c✅       ORDER CREATED SUCCESSFULLY       ✅", "background: green; color: white; font-size: 16px; font-weight: bold");
//       console.log("%c✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅", "background: green; color: white; font-size: 16px; font-weight: bold");
//       console.log("\n");
      
//       console.log("Result:", result);
      
//       const orderId = result.order?._id || result._id;

//       if (!orderId) {
//         throw new Error("Order created but no ID returned");
//       }

//       // 🔥 UPDATE currentOrderId to real ID for future payments
//       setCurrentOrderId(orderId);
//       console.log("✅ Updated currentOrderId to:", orderId);
      
//       showToast.success("Order created successfully! 🎉");
//       navigate(`${basePath}/orders`);
      
//     } catch (error) {
//       console.error("\n");
//       console.log("%c❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌", "background: red; color: white; font-size: 16px; font-weight: bold");
//       console.log("%c❌       SUBMISSION ERROR       ❌", "background: red; color: white; font-size: 16px; font-weight: bold");
//       console.log("%c❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌", "background: red; color: white; font-size: 16px; font-weight: bold");
//       console.log("\n");
      
//       console.error("❌ ERROR:", error);
      
//       if (error.response?.data) {
//         console.error("Server error response:", error.response.data);
//         setServerErrors(error.response.data);
//       }
      
//       let errorMessage = "Failed to create order";
      
//       if (error.response?.data?.message) {
//         errorMessage = error.response.data.message;
//       } else if (error.response?.data?.errors) {
//         errorMessage = `Validation failed: ${error.response.data.errors.join(', ')}`;
//         console.error("Validation errors:", error.response.data.errors);
//       } else if (error.message) {
//         errorMessage = error.message;
//       }
      
//       showToast.error(errorMessage);
      
//     } finally {
//       // 🔓 Release locks
//       isSubmittingRef.current = false;
//       setIsSubmitting(false);
      
//       // Re-enable submit button
//       const submitButton = document.querySelector('button[type="submit"]');
//       if (submitButton) {
//         submitButton.disabled = false;
//       }
      
//       console.log("\n");
//       console.log("%c🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓", "background: orange; color: white; font-size: 14px");
//       console.log("%c🔓       SUBMISSION LOCK RELEASED       🔓", "background: orange; color: white; font-size: 14px");
//       console.log("%c🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓", "background: orange; color: white; font-size: 14px");
//       console.log("\n");
//     }
//   };

//   return (
//     <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 p-6">
//       {/* 🖼️ Image Preview Modal */}
//       {showImagePreview && (
//         <ImagePreviewModal
//           images={previewImages}
//           title={previewTitle}
//           onClose={handleClosePreview}
//         />
//       )}

//       {/* Add Payment Modal - NOW USING currentOrderId */}
//       <AddPaymentModal
//         isOpen={showPaymentModal}
//         onClose={() => {
//           console.log("🚪 Closing payment modal");
//           setShowPaymentModal(false);
//           setEditingPayment(null);
//         }}
//         onSave={handleSavePayment}
//         orderTotalMin={priceSummary.totalMin}
//         orderTotalMax={priceSummary.totalMax}
//         orderId={currentOrderId}
//         customerId={formData.customer}
//         initialData={editingPayment}
//         title={editingPayment ? "Edit Payment" : "Add Payment"}
//       />

//       {/* Header */}
//       <div className="flex items-center gap-4">
//         <button
//           onClick={() => navigate(`${basePath}/orders`)}
//           className="p-2 hover:bg-slate-100 rounded-xl transition-all"
//         >
//           <ArrowLeft size={20} className="text-slate-600" />
//         </button>
//         <div>
//           <h1 className="text-3xl font-black text-slate-800 tracking-tight">Create New Order</h1>
//           <p className="text-slate-500">Add customer details and garments to create an order</p>
//         </div>
//       </div>

//       {/* Main Form */}
//       <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Left Column - Customer & Order Details */}
//         <div className="lg:col-span-2 space-y-6">
          
//           {/* Customer Selection Section */}
//           <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
//             <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
//               <User size={20} className="text-blue-600" />
//               Customer Details
//             </h2>

//             <div className="relative">
//               <input
//                 type="text"
//                 placeholder="Search customer by name, phone or ID..."
//                 value={searchTerm}
//                 onChange={handleSearchChange}
//                 onFocus={() => setShowCustomerDropdown(true)}
//                 onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
//                 className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
//               />

//               {showCustomerDropdown && (
//                 <>
//                   {customersLoading && (
//                     <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg p-4 text-center">
//                       <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
//                       <p className="text-sm text-slate-500 mt-2">Loading customers...</p>
//                     </div>
//                   )}

//                   {!customersLoading && filteredCustomers.length > 0 && (
//                     <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
//                       {filteredCustomers.map((customer) => {
//                         const fullName = getCustomerFullName(customer);
//                         const displayId = getCustomerDisplayId(customer);
//                         const phone = getCustomerPhone(customer);
                        
//                         return (
//                           <button
//                             key={customer._id}
//                             type="button"
//                             onClick={() => handleCustomerSelect(customer)}
//                             className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-all border-b border-slate-100 last:border-0"
//                           >
//                             <p className="font-medium text-slate-800">{fullName}</p>
//                             <p className="text-xs text-slate-400">
//                               <span className="font-mono">{displayId}</span> • {phone}
//                             </p>
//                           </button>
//                         );
//                       })}
//                     </div>
//                   )}

//                   {!customersLoading && filteredCustomers.length === 0 && searchTerm && (
//                     <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg p-4 text-center">
//                       <p className="text-slate-500">No customers found</p>
//                       <button
//                         type="button"
//                         onClick={() => navigate(`${basePath}/add-customer`)}
//                         className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
//                       >
//                         + Create new customer
//                       </button>
//                     </div>
//                   )}
//                 </>
//               )}

//               {formData.customer && !showCustomerDropdown && (
//                 <div className="mt-2 text-xs text-green-600 font-medium">
//                   ✓ Customer selected: {selectedCustomerDisplay}
//                 </div>
//               )}
//             </div>

//             {/* Special Notes */}
//             <div className="mt-4">
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

//           {/* 🔥 GARMENTS SECTION - WITH UPDATED IMAGE LAYOUT */}
//           <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
//                 <Package size={20} className="text-blue-600" />
//                 Garments
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

//             {garments.length === 0 ? (
//               <div className="text-center py-8 bg-slate-50 rounded-xl">
//                 <Package size={40} className="mx-auto text-slate-300 mb-2" />
//                 <p className="text-slate-500">No garments added yet</p>
//                 <button
//                   type="button"
//                   onClick={handleAddGarment}
//                   className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
//                 >
//                   + Add your first garment
//                 </button>
//               </div>
//             ) : (
//               <div className="space-y-3">
//                 {garments.map((garment, index) => {
//                   const categoryName = garment.categoryName || getCategoryName(garment.category);
//                   const itemName = garment.itemName || getItemName(garment);
                  
//                   // Calculate total images
//                   const totalImages = (garment.referenceImages?.length || 0) + 
//                                      (garment.customerImages?.length || 0) + 
//                                      (garment.customerClothImages?.length || 0);
                  
//                   return (
//                     <div
//                       key={garment.tempId}
//                       className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:shadow-md transition-all"
//                     >
//                       <div className="flex items-start justify-between">
//                         <div className="flex-1">
//                           {/* Garment Header with Badges */}
//                           <div className="flex items-center gap-2 flex-wrap mb-2">
//                             <h3 className="font-black text-slate-800">{garment.name}</h3>
//                             <span className={`text-xs px-2 py-1 rounded-full ${
//                               garment.priority === 'urgent' ? 'bg-red-100 text-red-600' :
//                               garment.priority === 'high' ? 'bg-orange-100 text-orange-600' :
//                               'bg-blue-100 text-blue-600'
//                             }`}>
//                               {garment.priority}
//                             </span>
                            
//                             {/* 🔥 NEW: Total Image Count Badge */}
//                             {totalImages > 0 && (
//                               <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full flex items-center gap-1">
//                                 <ImageIcon size={12} />
//                                 {totalImages} {totalImages === 1 ? 'image' : 'images'}
//                               </span>
//                             )}
//                           </div>
                          
//                           {/* Garment Details Grid */}
//                           <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
//                             <div>
//                               <p className="text-xs text-slate-400">Category/Item</p>
//                               <p className="font-medium text-blue-700">
//                                 {categoryName} / {itemName}
//                               </p>
//                             </div>
                            
//                             <div>
//                               <p className="text-xs text-slate-400">Garment Delivery</p>
//                               <p className="font-medium text-purple-600">
//                                 {garment.estimatedDelivery ? new Date(garment.estimatedDelivery).toLocaleDateString() : 'Not set'}
//                               </p>
//                             </div>
                            
//                             <div>
//                               <p className="text-xs text-slate-400">Price Range</p>
//                               <p className="font-medium">₹{garment.priceRange?.min} - ₹{garment.priceRange?.max}</p>
//                             </div>
//                           </div>

//                           {/* Debug info */}
//                           <div className="text-xs text-gray-400 mb-1">
//                             Ref: {garment.referenceImages?.length || 0}, 
//                             Cust: {garment.customerImages?.length || 0}, 
//                             Cloth: {garment.customerClothImages?.length || 0}
//                           </div>

//                           {/* 🖼️🔥 NEW IMAGE GALLERY LAYOUT - EXACTLY LIKE YOUR EXAMPLE 🔥🖼️ */}
//                           {totalImages > 0 && (
//                             <div className="mt-3">
//                               {/* Thumbnail Previews - First 2 of each type */}
//                               <div className="flex flex-wrap gap-2">
//                                 {/* Reference Images - Indigo border */}
//                                 {garment.referenceImages?.slice(0, 2).map((img, idx) => {
//                                   const imgUrl = img instanceof File ? URL.createObjectURL(img) : (img?.url || img);
//                                   return (
//                                     <button
//                                       key={`ref-${idx}`}
//                                       onClick={() => handleViewImages(garment.referenceImages, 'reference')}
//                                       className="relative group"
//                                     >
//                                       <img
//                                         src={imgUrl}
//                                         alt={`Reference ${idx + 1}`}
//                                         className="w-12 h-12 object-cover rounded-lg border-2 border-indigo-200 hover:border-indigo-400 transition-all"
//                                       />
//                                     </button>
//                                   );
//                                 })}

//                                 {/* Customer Images - Green border */}
//                                 {garment.customerImages?.slice(0, 2).map((img, idx) => {
//                                   const imgUrl = img instanceof File ? URL.createObjectURL(img) : (img?.url || img);
//                                   return (
//                                     <button
//                                       key={`cust-${idx}`}
//                                       onClick={() => handleViewImages(garment.customerImages, 'customer')}
//                                       className="relative group"
//                                     >
//                                       <img
//                                         src={imgUrl}
//                                         alt={`Customer ${idx + 1}`}
//                                         className="w-12 h-12 object-cover rounded-lg border-2 border-green-200 hover:border-green-400 transition-all"
//                                       />
//                                     </button>
//                                   );
//                                 })}

//                                 {/* Cloth Images - Orange border */}
//                                 {garment.customerClothImages?.slice(0, 2).map((img, idx) => {
//                                   const imgUrl = img instanceof File ? URL.createObjectURL(img) : (img?.url || img);
//                                   return (
//                                     <button
//                                       key={`cloth-${idx}`}
//                                       onClick={() => handleViewImages(garment.customerClothImages, 'cloth')}
//                                       className="relative group"
//                                     >
//                                       <img
//                                         src={imgUrl}
//                                         alt={`Cloth ${idx + 1}`}
//                                         className="w-12 h-12 object-cover rounded-lg border-2 border-orange-200 hover:border-orange-400 transition-all"
//                                       />
//                                     </button>
//                                   );
//                                 })}

//                                 {/* More images indicator */}
//                                 {totalImages > 6 && (
//                                   <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center text-sm font-bold text-slate-600">
//                                     +{totalImages - 6}
//                                   </div>
//                                 )}
//                               </div>

//                               {/* View All Images Button */}
//                               {totalImages > 0 && (
//                                 <button
//                                   onClick={() => setExpandedGarment(expandedGarment === garment.tempId ? null : garment.tempId)}
//                                   className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-2 flex items-center gap-1"
//                                 >
//                                   <ImageIcon size={14} />
//                                   {expandedGarment === garment.tempId ? 'Hide all images' : 'View all images'}
//                                 </button>
//                               )}
//                             </div>
//                           )}

//                           {/* 🔥 EXPANDED VIEW - Full gallery when expanded */}
//                           {expandedGarment === garment.tempId && totalImages > 0 && (
//                             <div className="mt-4 pt-4 border-t border-slate-200">
//                               {/* Reference Images Full Gallery */}
//                               {garment.referenceImages?.length > 0 && (
//                                 <div className="mb-4">
//                                   <div className="flex items-center gap-2 mb-2">
//                                     <Camera size={16} className="text-indigo-600" />
//                                     <p className="text-sm font-bold text-indigo-600">
//                                       Reference Images ({garment.referenceImages.length})
//                                     </p>
//                                   </div>
//                                   <div className="grid grid-cols-4 gap-2">
//                                     {garment.referenceImages.map((img, idx) => {
//                                       const imgUrl = img instanceof File ? URL.createObjectURL(img) : (img?.url || img);
//                                       return (
//                                         <button
//                                           key={`ref-full-${idx}`}
//                                           onClick={() => handleViewImages(garment.referenceImages, 'reference')}
//                                           className="relative group aspect-square"
//                                         >
//                                           <img
//                                             src={imgUrl}
//                                             alt={`Reference ${idx + 1}`}
//                                             className="w-full h-full object-cover rounded-lg border-2 border-indigo-200 hover:border-indigo-400"
//                                           />
//                                         </button>
//                                       );
//                                     })}
//                                   </div>
//                                 </div>
//                               )}

//                               {/* Customer Images Full Gallery */}
//                               {garment.customerImages?.length > 0 && (
//                                 <div className="mb-4">
//                                   <div className="flex items-center gap-2 mb-2">
//                                     <ImageIcon size={16} className="text-green-600" />
//                                     <p className="text-sm font-bold text-green-600">
//                                       Customer Images ({garment.customerImages.length})
//                                     </p>
//                                   </div>
//                                   <div className="grid grid-cols-4 gap-2">
//                                     {garment.customerImages.map((img, idx) => {
//                                       const imgUrl = img instanceof File ? URL.createObjectURL(img) : (img?.url || img);
//                                       return (
//                                         <button
//                                           key={`cust-full-${idx}`}
//                                           onClick={() => handleViewImages(garment.customerImages, 'customer')}
//                                           className="relative group aspect-square"
//                                         >
//                                           <img
//                                             src={imgUrl}
//                                             alt={`Customer ${idx + 1}`}
//                                             className="w-full h-full object-cover rounded-lg border-2 border-green-200 hover:border-green-400"
//                                           />
//                                         </button>
//                                       );
//                                     })}
//                                   </div>
//                                 </div>
//                               )}

//                               {/* Cloth Images Full Gallery */}
//                               {garment.customerClothImages?.length > 0 && (
//                                 <div>
//                                   <div className="flex items-center gap-2 mb-2">
//                                     <Scissors size={16} className="text-orange-600" />
//                                     <p className="text-sm font-bold text-orange-600">
//                                       Cloth Images ({garment.customerClothImages.length})
//                                     </p>
//                                   </div>
//                                   <div className="grid grid-cols-4 gap-2">
//                                     {garment.customerClothImages.map((img, idx) => {
//                                       const imgUrl = img instanceof File ? URL.createObjectURL(img) : (img?.url || img);
//                                       return (
//                                         <button
//                                           key={`cloth-full-${idx}`}
//                                           onClick={() => handleViewImages(garment.customerClothImages, 'cloth')}
//                                           className="relative group aspect-square"
//                                         >
//                                           <img
//                                             src={imgUrl}
//                                             alt={`Cloth ${idx + 1}`}
//                                             className="w-full h-full object-cover rounded-lg border-2 border-orange-200 hover:border-orange-400"
//                                           />
//                                         </button>
//                                       );
//                                     })}
//                                   </div>
//                                 </div>
//                               )}
//                             </div>
//                           )}
                          
//                           {/* Additional Info */}
//                           {garment.additionalInfo && (
//                             <p className="text-sm text-slate-500 mt-2 italic">
//                               Note: {garment.additionalInfo}
//                             </p>
//                           )}
//                         </div>
                        
//                         {/* Action Buttons */}
//                         <div className="flex gap-2 ml-4">
//                           <button
//                             type="button"
//                             onClick={() => handleEditGarment(garment)}
//                             className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
//                             title="Edit"
//                           >
//                             <Edit size={16} />
//                           </button>
//                           <button
//                             type="button"
//                             onClick={() => handleDeleteGarment(index, garment)}
//                             className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
//                             title="Delete"
//                           >
//                             <Trash2 size={16} />
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div> 
          
//           {/* Delivery Date Section */}
//           <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
//             <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
//               <Calendar size={20} className="text-blue-600" />
//               Order Delivery Details
//             </h2>
            
//             <div>
//               <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//                 Expected Delivery Date <span className="text-red-500">*</span>
//               </label>
              
//               <div className="relative" ref={calendarRef}>
//                 <button
//                   type="button"
//                   onClick={() => setShowCalendar(!showCalendar)}
//                   className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-left"
//                 >
//                   <Calendar size={18} className="text-slate-400" />
//                   <span className={formData.deliveryDate ? "text-slate-800" : "text-slate-400"}>
//                     {formatDisplayDate(formData.deliveryDate || selectedDate)}
//                   </span>
//                   {calendarLoading && (
//                     <div className="ml-auto w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
//                   )}
//                 </button>

//                 {showCalendar && (
//                   <div className="absolute z-20 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl p-4">
//                     <DatePicker
//                       inline
//                       selected={selectedDate}
//                       onChange={handleDateSelect}
//                       onMonthChange={handleMonthChange}
//                       minDate={new Date()}
//                       renderDayContents={renderDayContents}
//                       calendarClassName="!border-0"
//                     />
                    
//                     <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 text-xs">
//                       <div className="flex items-center gap-2">
//                         <div className="w-3 h-3 bg-red-500 rounded-full style={{ backgroundColor: '#ef4444' }}"></div>
//                         <span className="text-slate-600">Orders exist</span>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <div className="w-3 h-3 bg-transparent border border-slate-300 rounded-full"></div>
//                         <span className="text-slate-600">No orders</span>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {formData.deliveryDate && (
//                 <div className="mt-3 p-3 bg-blue-50 rounded-lg">
//                   <p className="text-sm text-blue-700">
//                     ✓ Delivery selected: {formatDisplayDate(formData.deliveryDate)}
//                   </p>
//                 </div>
//               )}
              
//               <p className="text-xs text-slate-400 mt-2">
//                 This is the overall order delivery date. Each garment can have its own estimated delivery date.
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Right Column - Payment Summary */}
//         <div className="lg:col-span-1">
//           <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-6">
//             <h2 className="text-lg font-black text-slate-800 mb-4">Price Summary</h2>
            
//             <div className="space-y-4">
//               <div className="bg-blue-50 p-4 rounded-xl">
//                 <p className="text-xs text-blue-600 font-black uppercase mb-1">Total Amount</p>
//                 <p className="text-2xl font-black text-blue-700">
//                   ₹{priceSummary.totalMin} - ₹{priceSummary.totalMax}
//                 </p>
//               </div>

//               {garments.length > 0 && (
//                 <div className="bg-purple-50 p-4 rounded-xl">
//                   <p className="text-xs text-purple-600 font-black uppercase mb-1">
//                     Garment Delivery Range
//                   </p>
//                   <p className="text-sm font-bold text-purple-700">
//                     {new Date(Math.min(...garments.map(g => new Date(g.estimatedDelivery || formData.deliveryDate)))).toLocaleDateString()} - {new Date(Math.max(...garments.map(g => new Date(g.estimatedDelivery || formData.deliveryDate)))).toLocaleDateString()}
//                   </p>
//                 </div>
//               )}

//               <div className="border-t border-slate-100 pt-4">
//                 <div className="flex items-center justify-between mb-3">
//                   <h3 className="text-sm font-black text-slate-700">Payments</h3>
//                   <button
//                     type="button"
//                     onClick={handleAddPayment}
//                     className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1"
//                   >
//                     <Plus size={14} />
//                     Add Payment
//                   </button>
//                 </div>

//                 {payments.length === 0 ? (
//                   <p className="text-sm text-slate-400 italic text-center py-2">
//                     No payments added yet
//                   </p>
//                 ) : (
//                   <div className="space-y-2 max-h-48 overflow-y-auto">
//                     {payments.map((payment, index) => (
//                       <div
//                         key={payment.tempId}
//                         className="bg-slate-50 rounded-lg p-3 border border-slate-200"
//                       >
//                         <div className="flex items-start justify-between">
//                           <div className="flex-1">
//                             <div className="flex items-center gap-2">
//                               <p className="font-bold text-green-600">₹{payment.amount}</p>
//                               <span className={`text-xs px-2 py-0.5 rounded-full ${
//                                 payment.type === 'advance' ? 'bg-blue-100 text-blue-700' :
//                                 payment.type === 'part-payment' ? 'bg-orange-100 text-orange-700' :
//                                 payment.type === 'final-settlement' ? 'bg-green-100 text-green-700' :
//                                 'bg-purple-100 text-purple-700'
//                               }`}>
//                                 {payment.type === 'advance' ? 'Advance' :
//                                  payment.type === 'part-payment' ? 'Part' :
//                                  payment.type === 'final-settlement' ? 'Full' : 'Extra'}
//                               </span>
//                             </div>
//                             <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
//                               <PaymentMethodIcon method={payment.method} />
//                               <span className="capitalize">{payment.method}</span>
//                             </div>
//                             {payment.referenceNumber && (
//                               <p className="text-xs text-purple-600 font-mono mt-0.5">
//                                 Ref: {payment.referenceNumber}
//                               </p>
//                             )}
//                             <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
//                               <span>{new Date(payment.date).toLocaleDateString()}</span>
//                               <span>•</span>
//                               <span>{payment.time}</span>
//                             </div>
//                             {payment.notes && (
//                               <p className="text-xs text-slate-400 mt-1 italic">
//                                 {payment.notes}
//                               </p>
//                             )}
//                           </div>
//                           <div className="flex gap-1 ml-2">
//                             <button
//                               type="button"
//                               onClick={() => handleEditPayment(payment)}
//                               className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
//                               title="Edit"
//                             >
//                               Edit
//                             </button>
//                             <button
//                               type="button"
//                               onClick={() => handleDeletePayment(index)}
//                               className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200"
//                               title="Delete"
//                             >
//                               <Trash2 size={14} />
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}

//                 {payments.length > 0 && (
//                   <div className="mt-3 pt-2 border-t border-slate-200">
//                     <div className="flex justify-between text-sm">
//                       <span className="font-medium text-slate-600">Total Paid:</span>
//                       <span className="font-bold text-green-600">₹{totalPayments}</span>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               <div className="bg-orange-50 p-4 rounded-xl">
//                 <p className="text-xs text-orange-600 font-black uppercase mb-1">Balance Amount</p>
//                 <p className="text-xl font-black text-orange-700">
//                   ₹{balanceAmount.min} - ₹{balanceAmount.max}
//                 </p>
//               </div>

//               <button
//                 type="submit"
//                 disabled={isSubmitting || !userId}
//                 className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-xl font-black uppercase tracking-wider shadow-lg shadow-blue-500/30 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 mt-6 ${
//                   isSubmitting || !userId ? 'opacity-50 cursor-not-allowed' : ''
//                 }`}
//               >
//                 {isSubmitting ? (
//                   <>
//                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                     Creating...
//                   </>
//                 ) : !userId ? (
//                   'Please log in to create order'
//                 ) : (
//                   <>
//                     <Save size={18} />
//                     Create Order
//                   </>
//                 )}
//               </button>

//               <button
//                 type="button"
//                 onClick={() => navigate(`${basePath}/orders`)}
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










import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  User,
  Calendar,
  CreditCard,
  IndianRupee,
  Package,
  Clock,
  Wallet,
  Banknote,
  Smartphone,
  Landmark,
  X,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
  Eye,
  Camera,
  Scissors,
  Edit
} from "lucide-react";
import { createNewOrder } from "../../../features/order/orderSlice";
import { createGarment } from "../../../features/garment/garmentSlice";
import { fetchAllCustomers } from "../../../features/customer/customerSlice";
import { fetchDeliveryDates, selectDeliveryDates, selectDeliveryCalendarLoading } from "../../../features/order/orderSlice";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import GarmentForm from "../garment/GarmentForm";
import AddPaymentModal from "../../../components/AddPaymentModal";
import ImagePreviewModal from "../../../components/ImagePreviewModal";
import showToast from "../../../utils/toast";

export default function NewOrder() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  /* Inga irukkura classes hover matrum selection-ai Red-ku mathum */
  const calendarStyles = `
    .react-datepicker__day:hover {
      background-color: #fee2e2 !important;
      color: #b91c1c !important;
      border-radius: 12px !important;
    }
    .react-datepicker__day--selected, 
    .react-datepicker__day--keyboard-selected {
      background-color: #ef4444 !important;
      color: white !important;
      border-radius: 12px !important;
    }
    .react-datepicker__day--today {
      border: 1px solid #ef4444 !important;
      border-radius: 12px !important;
    }
  `;

  // 🎯 Customer Page-la irundhu varum customer details (passed through navigation state)
  const passedCustomer = location.state?.customer;

  // 📦 Redux selectors - Global state-la irundhu data eduthukom
  const { customers, loading: customersLoading } = useSelector((state) => {
    const customerData = state.customers?.customers || state.customer?.customers || [];
    const customersArray = Array.isArray(customerData) ? customerData : [];
    return {
      customers: customersArray,
      loading: state.customers?.loading || state.customer?.loading || false
    };
  });

  const { categories } = useSelector((state) => {
    const categoriesData = state.categories?.categories || [];
    return {
      categories: Array.isArray(categoriesData) ? categoriesData : []
    };
  });

  const { user } = useSelector((state) => state.auth);
  
  // 📅 Calendar state from Redux (DELIVERY dates with existing orders - RED DOTS)
  const deliveryDates = useSelector(selectDeliveryDates);
  const calendarLoading = useSelector(selectDeliveryCalendarLoading);
  
  // 📝 Main form state - customer, delivery date, notes
  const [formData, setFormData] = useState({
    customer: "",
    deliveryDate: "",
    specialNotes: "",
    advancePayment: {
      amount: 0,
      method: "cash",
    },
  });

  // 💰 Multiple payments management
  const [payments, setPayments] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  
  // 🔥 NEW: Track current order ID for payments after creation
  const [currentOrderId, setCurrentOrderId] = useState("temp");

  // 👕 Garments management
  const [garments, setGarments] = useState([]);
  const [showGarmentModal, setShowGarmentModal] = useState(false);
  const [editingGarment, setEditingGarment] = useState(null);
  
  // 🔍 Customer search and selection
  const [searchTerm, setSearchTerm] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [selectedCustomerDisplay, setSelectedCustomerDisplay] = useState("");
  
  // ⏳ Form submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState(null);

  // 📅 Calendar states
  const [selectedDate, setSelectedDate] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const calendarRef = useRef(null);

  // 🖼️ Image preview states
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [previewTitle, setPreviewTitle] = useState("");
  
  // 🔥 NEW: State for expanded garment images
  const [expandedGarment, setExpandedGarment] = useState(null);

  // 🔒 DUPLICATE SUBMISSION PREVENTION - using ref for instant lock
  const isSubmittingRef = useRef(false);
  
  // 🆔 Generate unique request ID for tracking submissions
  const generateRequestId = () => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`;
  };

  // 👤 Get user ID from auth
  const userId = user?.id || user?._id;
  const userRole = user?.role;

  // 🧭 Base path based on user role (navigation purpose)
  const basePath = user?.role === "ADMIN" ? "/admin" : 
                   user?.role === "STORE_KEEPER" ? "/storekeeper" : 
                   "/cuttingmaster";

  // Load customers on mount
  useEffect(() => {
    dispatch(fetchAllCustomers())
      .unwrap()
      .catch((error) => {
        showToast.error("Failed to load customers");
      });
  }, [dispatch]);

  // AUTO-FILL: When customer passed from Customer page, auto-select them
  useEffect(() => {
    if (passedCustomer) {
      const fullCustomer = customers?.find(c => c._id === passedCustomer._id) || passedCustomer;
      
      setFormData(prev => ({
        ...prev,
        customer: fullCustomer._id
      }));

      const fullName = getCustomerFullName(fullCustomer);
      const displayId = getCustomerDisplayId(fullCustomer);
      let displayText = `${fullName} (${displayId})`;
      
      setSelectedCustomerDisplay(displayText);
      setSearchTerm(displayText);
      setShowCustomerDropdown(false);
    }
  }, [passedCustomer, customers]);

  // 🔥 Fetch DELIVERY dates for calendar when month changes (RED DOTS)
  useEffect(() => {
    const month = currentMonth.getMonth() + 1; // 1-12 for backend
    const year = currentMonth.getFullYear();
    console.log(`📅 Fetching DELIVERY dates for month: ${month}, year: ${year}`);
    dispatch(fetchDeliveryDates({ month, year }));
  }, [currentMonth, dispatch]);

  // Close calendar when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 👤 Helper: Get customer full name from various possible fields
  const getCustomerFullName = (customer) => {
    if (!customer) return 'Unknown Customer';
    
    if (customer.firstName || customer.lastName) {
      const firstName = customer.firstName || '';
      const lastName = customer.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim();
      if (fullName) return fullName;
    }
    
    if (customer.name) return customer.name;
    
    return 'Unknown Customer';
  };

  // 🔢 Helper: Get customer display ID (customerId or last 6 digits of _id)
  const getCustomerDisplayId = (customer) => {
    if (!customer) return '';
    return customer.customerId || customer._id?.slice(-6) || '';
  };

  // 📞 Helper: Get customer phone number
  const getCustomerPhone = (customer) => {
    if (!customer) return 'No phone';
    return customer.phone || customer.whatsappNumber || 'No phone';
  };

  // Filter customers based on search term
  const filteredCustomers = useMemo(() => {
    if (!customers || !Array.isArray(customers) || customers.length === 0) {
      return [];
    }
    
    if (formData.customer && searchTerm === selectedCustomerDisplay) {
      return [];
    }
    
    return customers.filter(customer => {
      if (!customer) return false;

      const fullName = getCustomerFullName(customer).toLowerCase();
      const customerId = getCustomerDisplayId(customer).toLowerCase();
      const phone = getCustomerPhone(customer).toLowerCase();
      const firstName = (customer.firstName || '').toLowerCase();
      const lastName = (customer.lastName || '').toLowerCase();
      
      const searchLower = searchTerm.toLowerCase();
      
      return fullName.includes(searchLower) ||
             firstName.includes(searchLower) ||
             lastName.includes(searchLower) ||
             phone.includes(searchLower) ||
             customerId.includes(searchLower);
    });
  }, [customers, searchTerm, formData.customer, selectedCustomerDisplay]);

  // Calculate total payments - with NaN protection and DEBUG
  const totalPayments = useMemo(() => {
    console.log("%c💰💰💰 CALCULATING TOTAL PAYMENTS 💰💰💰", "background: purple; color: white; font-size: 12px");
    console.log("Payments array:", payments);
    
    const total = payments.reduce((sum, payment, idx) => {
      const rawAmount = payment.amount;
      const numAmount = Number(rawAmount);
      const safeAmount = isNaN(numAmount) ? 0 : numAmount;
      
      console.log(`  Payment ${idx + 1}:`, {
        raw: rawAmount,
        type: typeof rawAmount,
        converted: numAmount,
        safe: safeAmount,
        isNaN: isNaN(numAmount)
      });
      
      return sum + safeAmount;
    }, 0);
    
    console.log("✅ Total payments:", total);
    return total;
  }, [payments]);

  // Calculate estimated range reference
  const estimatedRange = useMemo(() => {
    const min = garments.reduce((sum, g) => sum + (Number(g.priceRange?.min) || 0), 0);
    const max = garments.reduce((sum, g) => sum + (Number(g.priceRange?.max) || 0), 0);
    return { min, max };
  }, [garments]);

  // Calculate finalized amount (negotiated sum)
  const finalizedAmount = useMemo(() => {
    return garments.reduce((sum, g) => {
      const hasFinalized = g.finalizedPrice !== undefined && g.finalizedPrice !== null && g.finalizedPrice !== "";
      const val = hasFinalized ? g.finalizedPrice : (g.priceRange?.max || 0);
      return sum + Number(val);
    }, 0);
  }, [garments]);

  // Unified driving totalAmount
  const totalAmount = finalizedAmount;

  // Calculate priceSummary object for backward compatibility
  const priceSummary = useMemo(() => {
    return { totalMin: finalizedAmount, totalMax: finalizedAmount };
  }, [finalizedAmount]);

  // Calculate balance - with NaN protection and DEBUG
  const balanceAmount = useMemo(() => {
    console.log("%c⚖️⚖️⚖️ CALCULATING BALANCE ⚖️⚖️⚖️", "background: orange; color: white; font-size: 12px");
    
    const paid = isNaN(totalPayments) ? 0 : Number(totalPayments);
    const remaining = Math.max(0, finalizedAmount - paid);
    
    console.log("  Finalized Total Amount:", finalizedAmount);
    console.log("  Total Paid:", paid);
    console.log("  Remaining Balance:", remaining);
    
    return {
      min: remaining,
      max: remaining,
    };
  }, [finalizedAmount, totalPayments]);

  // 🔍🔍🔍 CUSTOMER HANDLERS 🔍🔍🔍
  
  // Handle customer search input change
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    console.log("🔍 Search term changed:", value);
    setSearchTerm(value);
    setShowCustomerDropdown(true);
    
    if (!value.trim()) {
      setFormData(prev => ({ ...prev, customer: "" }));
      setSelectedCustomerDisplay("");
    }
  }, []);

  // Handle customer selection from dropdown
  const handleCustomerSelect = useCallback((customer) => {
    console.log("%c👤👤👤 CUSTOMER SELECTED 👤👤👤", "background: green; color: white; font-size: 12px");
    console.log("Customer:", customer);
    
    const fullName = getCustomerFullName(customer);
    const displayId = getCustomerDisplayId(customer);
    
    setFormData(prev => ({
      ...prev,
      customer: customer._id
    }));

    let displayText = `${fullName} (${displayId})`;
    setSelectedCustomerDisplay(displayText);
    setSearchTerm(displayText);
    setShowCustomerDropdown(false);
    
    console.log("✅ Customer selected:", displayText);
  }, []);

  // 💰 PAYMENT HANDLERS
  const handleAddPayment = useCallback(() => {
    console.log("%c➕➕➕ ADD PAYMENT BUTTON CLICKED ➕➕➕", "background: green; color: white; font-size: 12px");
    setEditingPayment(null);
    setShowPaymentModal(true);
  }, []);

  const handleEditPayment = useCallback((payment) => {
    console.log("%c✏️✏️✏️ EDIT PAYMENT ✏️✏️✏️", "background: orange; color: white; font-size: 12px");
    console.log("Payment to edit:", payment);
    setEditingPayment(payment);
    setShowPaymentModal(true);
  }, []);

  const handleDeletePayment = useCallback((index) => {
    console.log("%c🗑️🗑️🗑️ DELETE PAYMENT 🗑️🗑️🗑️", "background: red; color: white; font-size: 12px");
    console.log("Deleting payment at index:", index);
    console.log("Payment:", payments[index]);
    
    if (window.confirm("Are you sure you want to delete this payment?")) {
      const newPayments = [...payments];
      newPayments.splice(index, 1);
      setPayments(newPayments);
      console.log("✅ Payment deleted, remaining:", newPayments.length);
      showToast.success("Payment removed");
    }
  }, [payments]);

  // 🔥 Handle Save Payment - Works for both new and existing orders
  // const handleSavePayment = useCallback((paymentData) => {
  //   console.log("%c💾💾💾 SAVE PAYMENT CALLED 💾💾💾", "background: purple; color: white; font-size: 14px");
  //   console.log("📦 Payment data received:", JSON.parse(JSON.stringify(paymentData)));
  //   console.log("📦 Current Order ID:", currentOrderId);
  //   console.log("📦 Is New Order?", currentOrderId === "temp");
    
  //   // 🔥 CRITICAL: Check if amount is valid
  //   console.log("💰 Amount in paymentData:", paymentData.amount);
  //   console.log("💰 Amount type:", typeof paymentData.amount);
  //   console.log("💰 Is NaN:", isNaN(paymentData.amount));
    
  //   // Map type
  //   let backendType = paymentData.type || 'advance';
  //   if (backendType === 'partial') {
  //     backendType = 'part-payment';
  //   } else if (backendType === 'full') {
  //     backendType = 'final-settlement';
  //   }
    
  //   const paymentWithMappedType = {
  //     ...paymentData,
  //     type: backendType,
  //     date: paymentData.paymentDate || paymentData.date || new Date().toISOString().split('T')[0],
  //     time: paymentData.paymentTime || paymentData.time || new Date().toLocaleTimeString('en-US', { hour12: false })
  //   };
    
  //   console.log("📦 Payment with mapped type:", JSON.parse(JSON.stringify(paymentWithMappedType)));
    
  //   // 🔥 NEW: Check if this is a new order (before creation) or existing order (after creation)
  //   if (currentOrderId === "temp") {
  //     // NEW ORDER - Store in local state
  //     console.log("📝 New order - storing payment locally");
      
  //     if (editingPayment) {
  //       console.log("✏️ Updating existing payment, tempId:", editingPayment.tempId);
  //       const index = payments.findIndex(p => p.tempId === editingPayment.tempId);
  //       console.log("Found at index:", index);
        
  //       if (index !== -1) {
  //         const newPayments = [...payments];
  //         newPayments[index] = { 
  //           ...paymentWithMappedType, 
  //           tempId: editingPayment.tempId
  //         };
  //         setPayments(newPayments);
  //         console.log("✅ Payment updated, new payments array:", newPayments);
  //         showToast.success("Payment updated");
  //       }
  //     } else {
  //       const newPayment = {
  //         ...paymentWithMappedType,
  //         tempId: Date.now() + Math.random()
  //       };
  //       console.log("➕ Adding new payment with tempId:", newPayment.tempId);
  //       setPayments(prev => {
  //         const updated = [...prev, newPayment];
  //         console.log("✅ Payment added, new payments array:", updated);
  //         return updated;
  //       });
  //       showToast.success("Payment added");
  //     }
  //   } else {
  //     // EXISTING ORDER - Call API directly
  //     console.log("📡 Existing order - calling API to add payment");
      
  //     // Show loading toast
  //     const toastId = showToast.loading("Adding payment...");
      
  //     // Call API to add payment (you need to implement this in Redux)
  //     dispatch(addPaymentToOrder({
  //       orderId: currentOrderId,
  //       paymentData: {
  //         amount: paymentData.amount,
  //         type: paymentData.type,
  //         method: paymentData.method,
  //         referenceNumber: paymentData.referenceNumber,
  //         paymentDate: paymentData.paymentDate,
  //         paymentTime: paymentData.paymentTime,
  //         notes: paymentData.notes
  //       }
  //     })).then((result) => {
  //       console.log("✅ Payment added via API:", result);
  //       showToast.dismiss(toastId);
  //       showToast.success("Payment added successfully!");
        
  //       // Refresh order data to show updated payments
  //       dispatch(fetchOrderById(currentOrderId));
  //     }).catch((error) => {
  //       console.error("❌ Error adding payment:", error);
  //       showToast.dismiss(toastId);
  //       showToast.error(error.response?.data?.message || "Failed to add payment");
  //     });
  //   }
    
  //   setShowPaymentModal(false);
  //   setEditingPayment(null);
  // }, [payments, editingPayment, currentOrderId, dispatch]);


  // 🔥 FIXED: Handle Save Payment - With correct time handling
const handleSavePayment = useCallback((paymentData) => {
  console.log("%c💾💾💾 SAVE PAYMENT CALLED 💾💾💾", "background: purple; color: white; font-size: 14px");
  console.log("📦 Payment data received:", JSON.parse(JSON.stringify(paymentData)));
  console.log("📦 Current Order ID:", currentOrderId);
  console.log("📦 Is New Order?", currentOrderId === "temp");
  
  // 🔥 CRITICAL: Check if amount is valid
  console.log("💰 Amount in paymentData:", paymentData.amount);
  console.log("💰 Amount type:", typeof paymentData.amount);
  
  // Use exactly what the user selected
  let backendType = paymentData.type || 'advance';
  
  // ✅ FIXED: Get current time for the payment
  const now = new Date();
  
  // Get selected payment date or use today
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
  
  const paymentWithMappedType = {
    ...paymentData,
    type: backendType,
    date: formattedDate,  // YYYY-MM-DD for display
    time: formattedTime,   // HH:MM AM/PM for display
    fullTimestamp: paymentDateObj.toISOString() // ✅ Full timestamp for backend
  };
  
  console.log("📦 Payment with mapped type:", JSON.parse(JSON.stringify(paymentWithMappedType)));
  
  // 🔥 NEW: Check if this is a new order (before creation) or existing order (after creation)
  if (currentOrderId === "temp") {
    // NEW ORDER - Store in local state
    console.log("📝 New order - storing payment locally");
    
    if (editingPayment) {
      console.log("✏️ Updating existing payment, tempId:", editingPayment.tempId);
      const index = payments.findIndex(p => p.tempId === editingPayment.tempId);
      console.log("Found at index:", index);
      
      if (index !== -1) {
        const newPayments = [...payments];
        newPayments[index] = { 
          ...paymentWithMappedType, 
          tempId: editingPayment.tempId
        };
        setPayments(newPayments);
        console.log("✅ Payment updated, new payments array:", newPayments);
        showToast.success("Payment updated");
      }
    } else {
      const newPayment = {
        ...paymentWithMappedType,
        tempId: Date.now() + Math.random()
      };
      console.log("➕ Adding new payment with tempId:", newPayment.tempId);
      setPayments(prev => {
        const updated = [...prev, newPayment];
        console.log("✅ Payment added, new payments array:", updated);
        return updated;
      });
      showToast.success("Payment added");
    }
  } else {
    // EXISTING ORDER - Call API directly
    console.log("📡 Existing order - calling API to add payment");
    
    // Show loading toast
    const toastId = showToast.loading("Adding payment...");
    
    // ✅ FIXED: Send full timestamp to API
    const paymentPayload = {
      amount: paymentData.amount,
      type: paymentData.type,
      method: paymentData.method,
      referenceNumber: paymentData.referenceNumber,
      paymentDate: paymentDateObj.toISOString(), // ✅ Send full ISO string with time
      notes: paymentData.notes
    };
    
    console.log("📤 Payment payload:", paymentPayload);
    
    // Call API to add payment (you need to implement this in Redux)
    dispatch(addPaymentToOrder({
      orderId: currentOrderId,
      paymentData: paymentPayload
    })).then((result) => {
      console.log("✅ Payment added via API:", result);
      showToast.dismiss(toastId);
      showToast.success("Payment added successfully!");
      
      // Refresh order data to show updated payments
      dispatch(fetchOrderById(currentOrderId));
    }).catch((error) => {
      console.error("❌ Error adding payment:", error);
      showToast.dismiss(toastId);
      showToast.error(error.response?.data?.message || "Failed to add payment");
    });
  }
  
  setShowPaymentModal(false);
  setEditingPayment(null);
}, [payments, editingPayment, currentOrderId, dispatch]);

  // 👕 GARMENT HANDLERS
  const handleAddGarment = useCallback(() => {
    console.log("%c➕➕➕ ADD GARMENT BUTTON CLICKED ➕➕➕", "background: blue; color: white; font-size: 12px");
    if (!formData.customer) {
      console.log("❌ Cannot add garment - no customer selected");
      showToast.error("Please select a customer first before adding garments");
      return;
    }
    
    setEditingGarment(null);
    setShowGarmentModal(true);
  }, [formData.customer]);

  const handleEditGarment = useCallback((garment) => {
    console.log("%c✏️✏️✏️ EDIT GARMENT ✏️✏️✏️", "background: orange; color: white; font-size: 12px");
    console.log("Garment to edit:", garment);
    setEditingGarment(garment);
    setShowGarmentModal(true);
  }, []);

  const handleDeleteGarment = useCallback((index, garment) => {
    console.log("%c🗑️🗑️🗑️ DELETE GARMENT 🗑️🗑️🗑️", "background: red; color: white; font-size: 12px");
    console.log("Deleting garment at index:", index);
    console.log("Garment:", garment);
    
    if (window.confirm(`Are you sure you want to remove ${garment.name || 'this garment'}?`)) {
      const newGarments = [...garments];
      newGarments.splice(index, 1);
      setGarments(newGarments);
      console.log("✅ Garment deleted, remaining:", newGarments.length);
      showToast.success("Garment removed");
    }
  }, [garments]);

  // 🎯 ADD THIS MISSING FUNCTION - handleSaveGarment
  const handleSaveGarment = useCallback((garmentData) => {
    console.log("%c📥📥📥 HANDLE SAVE GARMENT CALLED 📥📥📥", "background: blue; color: white; font-size: 14px");
    console.log("Type:", garmentData instanceof FormData ? "FormData" : "Object");
    
    if (garmentData instanceof FormData) {
      // Convert FormData to object
      const garmentObj = {
        tempId: editingGarment?.tempId || Date.now() + Math.random(),
        referenceImages: [],
        customerImages: [],
        customerClothImages: []
      };
      
      console.log("📦 Processing FormData entries:");
      for (let [key, value] of garmentData.entries()) {
        if (value instanceof File) {
          console.log(`  📸 ${key}: File - ${value.name} (${value.type}, ${value.size} bytes)`);
          
          if (key === 'referenceImages') {
            garmentObj.referenceImages.push(value);
          } else if (key === 'customerImages') {
            garmentObj.customerImages.push(value);
          } else if (key === 'customerClothImages') {
            garmentObj.customerClothImages.push(value);
          }
        } else {
          // Truncate long strings for display
          const displayValue = value && value.length > 50 ? value.substring(0, 50) + '...' : value;
          console.log(`  📝 ${key}: ${displayValue}`);
          
          if (key === 'measurements' || key === 'priceRange') {
            try {
              garmentObj[key] = JSON.parse(value);
            } catch (e) {
              garmentObj[key] = value;
            }
          } else if (key === 'finalizedPrice') {
            garmentObj[key] = value === "" || value === "null" || value === "undefined" ? null : Number(value);
          } else {
            garmentObj[key] = value;
          }
        }
      }
      
      // Verify images were captured
      console.log("✅ Garment object created:", {
        name: garmentObj.name,
        category: garmentObj.category,
        item: garmentObj.item,
        referenceImages: garmentObj.referenceImages?.length || 0,
        customerImages: garmentObj.customerImages?.length || 0,
        customerClothImages: garmentObj.customerClothImages?.length || 0
      });
      
      if (editingGarment) {
        // Update existing garment
        console.log("✏️ Updating existing garment, tempId:", editingGarment.tempId);
        const index = garments.findIndex(g => g.tempId === editingGarment.tempId);
        console.log("Found at index:", index);
        
        if (index !== -1) {
          const newGarments = [...garments];
          newGarments[index] = garmentObj;
          setGarments(newGarments);
          showToast.success("Garment updated");
          console.log("🔄 Updated garment at index:", index);
          console.log("New garments array:", newGarments);
        }
      } else {
        // Add new garment
        console.log("➕ Adding new garment");
        setGarments(prev => {
          const updated = [...prev, garmentObj];
          console.log("New garments array:", updated);
          return updated;
        });
        showToast.success("Garment added");
        console.log("➕ Added new garment, total garments:", garments.length + 1);
      }
    } else {
      // Handle regular object (no images)
      console.log("📦 Received regular object:", garmentData);
      
      if (editingGarment) {
        const index = garments.findIndex(g => g.tempId === editingGarment.tempId);
        if (index !== -1) {
          const newGarments = [...garments];
          newGarments[index] = { ...garmentData, tempId: editingGarment.tempId };
          setGarments(newGarments);
          showToast.success("Garment updated");
        }
      } else {
        const newGarment = {
          ...garmentData,
          tempId: Date.now() + Math.random()
        };
        setGarments([...garments, newGarment]);
        showToast.success("Garment added");
      }
    }
    
    setShowGarmentModal(false);
  }, [garments, editingGarment]);

  // 🖼️ IMAGE PREVIEW HANDLERS
  const handleViewImages = useCallback((images, type) => {
    console.log(`%c👁️👁️👁️ VIEW IMAGES: ${type} 👁️👁️👁️`, "background: purple; color: white; font-size: 12px");
    console.log("Images:", images);
    console.log("Image count:", images?.length);
    
    if (images && images.length > 0) {
      try {
        // Create object URLs for File objects
        const imageUrls = images.map((img, idx) => {
          if (img instanceof File) {
            console.log(`  Creating URL for File ${idx + 1}:`, img.name);
            return URL.createObjectURL(img);
          } else if (img?.url) {
            console.log(`  Using URL from object:`, img.url);
            return img.url;
          } else if (typeof img === 'string') {
            console.log(`  Using string URL:`, img);
            return img;
          } else {
            console.log(`  Unknown image type:`, img);
            return null;
          }
        }).filter(url => url !== null);
        
        console.log(`  Setting ${imageUrls.length} preview images`);
        setPreviewImages(imageUrls);
        setPreviewTitle(type);
        setShowImagePreview(true);
      } catch (error) {
        console.error("❌ Error in handleViewImages:", error);
        showToast.error("Failed to load images");
      }
    } else {
      console.warn("⚠️ No images to view");
      showToast.warning("No images to display");
    }
  }, []);

  // Clean up object URLs when modal closes
  const handleClosePreview = useCallback(() => {
    console.log("%c🗑️🗑️🗑️ CLOSING PREVIEW, CLEANING UP URLs 🗑️🗑️🗑️", "background: red; color: white; font-size: 12px");
    
    // Revoke object URLs to avoid memory leaks
    previewImages.forEach(url => {
      if (url && typeof url === 'string' && url.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(url);
          console.log("  Revoked URL:", url);
        } catch (e) {
          console.error("Error revoking URL:", e);
        }
      }
    });
    
    setShowImagePreview(false);
    setPreviewImages([]);
    setPreviewTitle("");
  }, [previewImages]);

  // Helper function to get category name from ID
  const getCategoryName = useCallback((categoryId) => {
    if (!categoryId) return 'Unknown';
    const category = categories?.find(c => c._id === categoryId);
    return category?.name || category?.categoryName || categoryId;
  }, [categories]);

  // Helper function to get item name from garment object
  const getItemName = useCallback((garment) => {
    if (garment.itemName) return garment.itemName;
    
    if (garment.item && categories) {
      for (const category of categories) {
        if (category.items && Array.isArray(category.items)) {
          const foundItem = category.items.find(item => 
            item._id === garment.item || item._id?.toString() === garment.item?.toString()
          );
          if (foundItem) return foundItem.name || foundItem.itemName;
        }
      }
    }
    
    return garment.item || 'Unknown';
  }, [categories]);

  // 📅 CALENDAR HANDLERS
  const handleDateSelect = useCallback((date) => {
    console.log("%c📅📅📅 DATE SELECTED 📅📅📅", "background: green; color: white; font-size: 12px");
    console.log("Date object:", date);
    
    setSelectedDate(date);
    setShowCalendar(false);
    
    // Get local date string considering timezone
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const localDateStr = `${year}-${month}-${day}`;
    
    setFormData(prev => ({
      ...prev,
      deliveryDate: localDateStr
    }));
    
    console.log("Local date string:", localDateStr);
  }, []);

  const handleMonthChange = useCallback((date) => {
    console.log("📅 Month changed to:", date.toLocaleString('default', { month: 'long', year: 'numeric' }));
    setCurrentMonth(date);
  }, []);

  const formatDisplayDate = useCallback((dateStr) => {
    if (!dateStr) return "Select delivery date";
    
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  // 🔥 RENDER DAY CONTENTS WITH RED DOTS FOR DELIVERY DATES
  // const renderDayContents = useCallback((day, date) => {
  //   const year = date.getFullYear();
  //   const month = String(date.getMonth() + 1).padStart(2, '0');
  //   const dayOfMonth = String(date.getDate()).padStart(2, '0');
  //   const localDateStr = `${year}-${month}-${dayOfMonth}`;
    
  //   // ✅ Check if date has any DELIVERIES (from all customers)
  //   const deliveryInfo = deliveryDates?.find(item => item._id === localDateStr);
  //   const hasDeliveries = deliveryInfo && deliveryInfo.count > 0;
    
  //   return (
  //     <div className="relative">
  //       <div>{day}</div>
  //       {hasDeliveries && (
  //         <div 
  //           className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm"
  //           style={{ 
  //             backgroundColor: '#ef4444', // 🔴 Absolute Red for busy delivery days
  //             zIndex: 10 
  //           }}
  //         ></div>
  //       )}
  //     </div>
  //   );
  // }, [deliveryDates]);

 // 🔥 RENDER DAY CONTENTS - EXACT UI MATCH
//  const renderDayContents = useCallback((day, date) => {
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const dayOfMonth = String(date.getDate()).padStart(2, '0');
//   const localDateStr = `${year}-${month}-${dayOfMonth}`;
  
//   // ✅ Matching your NewOrder state variables
//   const deliveryInfo = deliveryDates?.find(item => item._id === localDateStr);
//   const count = deliveryInfo?.count || 0;
//   const hasDeliveries = count > 0;
  
//   return (
//     /* Main Wrapper: Fixed size for centering */
//     <div style={{ 
//       position: 'relative', 
//       width: '32px', 
//       height: '32px', 
//       display: 'flex', 
//       alignItems: 'center', 
//       justifyContent: 'center',
//       margin: '0 auto',
//       overflow: 'visible' 
//     }}>
      
//       {/* 1. Date Number */}
//       <span style={{ fontSize: '14px', fontWeight: '600', zIndex: 5 }}>
//         {day}
//       </span>

//       {/* 2. 🔴 Top Right Corner - Small Red Dot */}
//       {hasDeliveries && (
//         <div style={{
//           position: 'absolute',
//           top: '-2px',
//           right: '-2px',
//           width: '9px',
//           height: '9px',
//           backgroundColor: '#ef4444',
//           borderRadius: '50%',
//           border: '1.5px solid white',
//           boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
//           zIndex: 10
//         }} />
//       )}

//       {/* 3. 🟢 Bottom Center - Green Badge with Count */}
//       {hasDeliveries && (
//         <div style={{
//           position: 'absolute',
//           bottom: '-6px', 
//           left: '50%',
//           transform: 'translateX(-50%)',
//           backgroundColor: '#22c55e',
//           color: 'white',
//           borderRadius: '10px',
//           minWidth: '18px',
//           height: '15px',
//           fontSize: '9px',
//           fontWeight: 'bold',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           padding: '0 4px',
//           border: '1px solid white',
//           boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
//           zIndex: 15
//         }}>
//           {count > 9 ? "9+" : count}
//         </div>
//       )}
//     </div>
//   );
// }, [deliveryDates]);

const renderDayContents = useCallback((day, date) => {
  // 🔥 Logic to check if the date is in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isPast = date < today;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const dayOfMonth = String(date.getDate()).padStart(2, '0');
  const localDateStr = `${year}-${month}-${dayOfMonth}`;
  
  const deliveryInfo = deliveryDates?.find(item => item._id === localDateStr);
  const count = deliveryInfo?.count || 0;
  
  // Logic: Orders irukanum and adhu past date-ah irukakoodathu
  const hasDeliveries = count > 0 && !isPast;
  
  return (
    /* Main Wrapper: Fixed size for centering */
    <div style={{ 
      position: 'relative', 
      width: '32px', 
      height: '32px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      margin: '0 auto',
      overflow: 'visible',
      opacity: isPast ? 0.4 : 1 // Past dates-ai visual-ah fade pannum
    }}>
      
      {/* 1. Date Number */}
      <span style={{ 
        fontSize: '14px', 
        fontWeight: '600', 
        zIndex: 5,
        color: isPast ? '#94a3b8' : 'inherit' // Past dates-ku gray color
      }}>
        {day}
      </span>

      {/* 2. 🔴 Top Right Corner - Small Red Dot */}
      {hasDeliveries && (
        <div style={{
          position: 'absolute',
          top: '-2px',
          right: '-2px',
          width: '9px',
          height: '9px',
          backgroundColor: '#ef4444',
          borderRadius: '50%',
          border: '1.5px solid white',
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
          zIndex: 10
        }} />
      )}

      {/* 3. 🟢 Bottom Center - Green Badge with Count */}
      {hasDeliveries && (
        <div style={{
          position: 'absolute',
          bottom: '-6px', 
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#22c55e',
          color: 'white',
          borderRadius: '10px',
          minWidth: '18px',
          height: '15px',
          fontSize: '9px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 4px',
          border: '1px solid white',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          zIndex: 15
        }}>
          {count > 9 ? "9+" : count}
        </div>
      )}
    </div>
  );
}, [deliveryDates]);

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

  // 🔥 MAIN SUBMIT HANDLER
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log("\n");
    console.log("%c🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥", "background: red; color: white; font-size: 16px; font-weight: bold");
    console.log("%c🔥          FORM SUBMISSION STARTED          🔥", "background: red; color: white; font-size: 16px; font-weight: bold");
    console.log("%c🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥", "background: red; color: white; font-size: 16px; font-weight: bold");
    console.log("\n");
    
    console.log("📋 FORM DATA:", JSON.parse(JSON.stringify(formData)));
    console.log("💰 PAYMENTS:", JSON.parse(JSON.stringify(payments)));
    console.log("👕 GARMENTS COUNT:", garments.length);
    console.log("👕 GARMENTS DETAILS:", JSON.parse(JSON.stringify(garments.map(g => ({
      name: g.name,
      priceMin: g.priceRange?.min,
      priceMax: g.priceRange?.max,
      refImages: g.referenceImages?.length || 0,
      custImages: g.customerImages?.length || 0,
      clothImages: g.customerClothImages?.length || 0
    })))));
    
    if (isSubmittingRef.current) {
      console.log("⚠️ Submission already in progress, preventing duplicate");
      showToast.warning("Order creation in progress, please wait...");
      return;
    }

    setServerErrors(null);

    // Validation
    if (!formData.customer) {
      console.error("❌ Missing customer");
      showToast.error("Please select a customer");
      return;
    }

    if (garments.length === 0) {
      console.error("❌ No garments");
      showToast.error("Please add at least one garment");
      return;
    }

    if (!formData.deliveryDate) {
      console.error("❌ Missing delivery date");
      showToast.error("Please select delivery date");
      return;
    }

    const finalUserId = userId;
    if (!finalUserId) {
      console.error("❌ No user ID");
      showToast.error("You must be logged in to create an order");
      return;
    }

    // Validate MongoDB IDs
    const customerIdValid = /^[0-9a-fA-F]{24}$/.test(formData.customer);
    const userIdValid = /^[0-9a-fA-F]{24}$/.test(finalUserId);

    if (!customerIdValid) {
      console.error("❌ Invalid customer ID:", formData.customer);
      showToast.error("Invalid customer ID format");
      return;
    }

    if (!userIdValid) {
      console.error("❌ Invalid user ID:", finalUserId);
      showToast.error("Invalid user ID format. Please log in again.");
      return;
    }

    // 🔥 Set submission lock
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    // 🔥 Generate unique request ID
    const requestId = generateRequestId();
    console.log("🔒 Request ID:", requestId);

    try {
      // Disable submit button
      const submitButton = e.target.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
      }

      console.log("\n");
      console.log("%c💰💰💰💰💰💰💰💰💰💰💰💰💰💰💰💰💰💰💰💰💰", "background: purple; color: white; font-size: 14px");
      console.log("%c💰       PROCESSING PAYMENTS (SAFE MODE)       💰", "background: purple; color: white; font-size: 14px");
      console.log("%c💰💰💰💰💰💰💰💰💰💰💰💰💰💰💰💰💰💰💰💰💰", "background: purple; color: white; font-size: 14px");
      console.log("\n");
      
      console.log("💰 Processing payments:", payments.length);
      const mappedPayments = payments.map((payment, idx) => {
        let modelType = payment.type || 'advance';
        
        if (modelType === 'partial' || modelType === 'part-payment') {
          modelType = 'advance';
        } else if (modelType === 'final-settlement') {
          modelType = 'full';
        }
        
        // 🔥 CRITICAL: Safe number conversion with multiple checks
        const rawAmount = payment.amount;
        console.log(`\n📌 Payment ${idx + 1} amount analysis:`);
        console.log(`  Raw value:`, rawAmount);
        console.log(`  Type:`, typeof rawAmount);
        
        let safeAmount = 0;
        
        if (rawAmount === undefined || rawAmount === null) {
          console.log(`  ❌ Amount is undefined/null`);
        } else {
          const strAmount = String(rawAmount).trim();
          console.log(`  String:`, strAmount);
          console.log(`  Length:`, strAmount.length);
          
          if (strAmount === '') {
            console.log(`  ❌ Amount is empty string`);
          } else {
            const numAmount = Number(strAmount);
            console.log(`  Number():`, numAmount);
            console.log(`  Is NaN:`, isNaN(numAmount));
            
            if (!isNaN(numAmount) && numAmount > 0) {
              safeAmount = numAmount;
              console.log(`  ✅ Valid amount:`, safeAmount);
            } else {
              console.log(`  ❌ Invalid amount (using 0)`);
            }
          }
        }
        
        console.log(`  ✅ Final safe amount:`, safeAmount);
        
        return {
          amount: safeAmount,
          type: modelType,
          method: payment.method || 'cash',
          referenceNumber: payment.referenceNumber || '',
          date: payment.date || new Date().toISOString().split('T')[0],
          notes: payment.notes || ''
        };
      });

      console.log("\n✅ Mapped payments:", JSON.parse(JSON.stringify(mappedPayments)));

      console.log("\n");
      console.log("%c👕👕👕👕👕👕👕👕👕👕👕👕👕👕👕👕👕👕👕👕👕", "background: blue; color: white; font-size: 14px");
      console.log("%c👕       PROCESSING GARMENTS (SAFE MODE)       👕", "background: blue; color: white; font-size: 14px");
      console.log("%c👕👕👕👕👕👕👕👕👕👕👕👕👕👕👕👕👕👕👕👕👕", "background: blue; color: white; font-size: 14px");
      console.log("\n");

      // 📝 Prepare order data with ALL fields properly formatted
      console.log("📦 Preparing order data...");
      
      // Safe number conversions for all values
      const safeTotalMin = isNaN(Number(priceSummary.totalMin)) ? 0 : Number(priceSummary.totalMin);
      const safeTotalMax = isNaN(Number(priceSummary.totalMax)) ? 0 : Number(priceSummary.totalMax);
      const safeTotalPayments = isNaN(Number(totalPayments)) ? 0 : Number(totalPayments);
      
      console.log("💰 Price summary:", { safeTotalMin, safeTotalMax, safeTotalPayments });
      
      const orderData = {
        customer: formData.customer,
        deliveryDate: formData.deliveryDate,
        specialNotes: formData.specialNotes || "",
        payments: mappedPayments,
        // NOTE: advancePayment is derived from payments[] on the backend.
        // Do NOT send it separately to avoid duplicate entries.
        priceSummary: {
          totalMin: safeTotalMin,
          totalMax: safeTotalMax
        },
        balanceAmount: Math.max(0, safeTotalMax - safeTotalPayments),
        createdBy: finalUserId,
        status: "confirmed",
        orderDate: new Date().toISOString(),
        requestId: requestId,
        garments: garments.map((g, idx) => {
          console.log(`\n👕 Processing garment ${idx + 1}: ${g.name}`);
          
          // Safe number conversions for garment prices
          const minPrice = isNaN(Number(g.priceRange?.min)) ? 0 : Number(g.priceRange?.min);
          const maxPrice = isNaN(Number(g.priceRange?.max)) ? 0 : Number(g.priceRange?.max);
          const fabricPrice = isNaN(Number(g.fabricPrice)) ? 0 : Number(g.fabricPrice);
          
          console.log(`  Price range: ${minPrice} - ${maxPrice}`);
          console.log(`  Fabric price: ${fabricPrice}`);
          console.log(`  Images: Ref:${g.referenceImages?.length || 0}, Cust:${g.customerImages?.length || 0}, Cloth:${g.customerClothImages?.length || 0}`);
          
          return {
            name: g.name,
            garmentType: g.item || g.garmentType || g.itemName || g.name,
            category: g.category,
            item: g.item,
            categoryName: g.categoryName,
            itemName: g.itemName,
            measurementTemplate: g.measurementTemplate,
            measurementSource: g.measurementSource,
            measurements: g.measurements || [],
            additionalInfo: g.additionalInfo || '',
            estimatedDelivery: g.estimatedDelivery || formData.deliveryDate,
            priority: g.priority || 'normal',
            priceRange: {
              min: minPrice,
              max: maxPrice
            },
            finalizedPrice: g.finalizedAmount !== undefined && g.finalizedAmount !== null && g.finalizedAmount !== ""
              ? Number(g.finalizedAmount)
              : (g.finalizedPrice !== undefined && g.finalizedPrice !== null && g.finalizedPrice !== ""
                ? Number(g.finalizedPrice)
                : maxPrice),
            finalizedAmount: g.finalizedAmount !== undefined && g.finalizedAmount !== null && g.finalizedAmount !== ""
              ? Number(g.finalizedAmount)
              : (g.finalizedPrice !== undefined && g.finalizedPrice !== null && g.finalizedPrice !== ""
                ? Number(g.finalizedPrice)
                : maxPrice),
            minPrice: minPrice,
            maxPrice: maxPrice,
            fabricSource: g.fabricSource || 'customer',
            fabricPrice: fabricPrice,
            referenceImages: g.referenceImages || [],
            customerImages: g.customerImages || [],
            customerClothImages: g.customerClothImages || []
          };
        })
      };

      console.log("\n");
      console.log("%c✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅", "background: green; color: white; font-size: 14px");
      console.log("%c✅       FINAL ORDER DATA VALIDATION       ✅", "background: green; color: white; font-size: 14px");
      console.log("%c✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅", "background: green; color: white; font-size: 14px");
      console.log("\n");
      
      console.log("  Customer:", orderData.customer);
      console.log("  Delivery Date:", orderData.deliveryDate);
      console.log("  Payments count:", orderData.payments.length);
      console.log("  Garments count:", orderData.garments.length);
      console.log("  Total Min:", orderData.priceSummary.totalMin);
      console.log("  Total Max:", orderData.priceSummary.totalMax);
      console.log("  Balance:", orderData.balanceAmount);
      
      // 🔍 Check for any NaN values
      console.log("\n🔍 NAN DETECTION SCAN:");
      let hasNaN = false;
      
      if (isNaN(orderData.priceSummary.totalMin)) { 
        console.error("❌ totalMin is NaN"); 
        hasNaN = true; 
      } else {
        console.log("✅ totalMin OK");
      }
      
      if (isNaN(orderData.priceSummary.totalMax)) { 
        console.error("❌ totalMax is NaN"); 
        hasNaN = true; 
      } else {
        console.log("✅ totalMax OK");
      }
      
      if (isNaN(orderData.balanceAmount)) { 
        console.error("❌ balanceAmount is NaN"); 
        hasNaN = true; 
      } else {
        console.log("✅ balanceAmount OK");
      }
      
      orderData.payments.forEach((p, i) => {
        if (isNaN(p.amount)) { 
          console.error(`❌ payment[${i}].amount is NaN`); 
          hasNaN = true; 
        } else {
          console.log(`✅ payment[${i}].amount OK (${p.amount})`);
        }
      });
      
      orderData.garments.forEach((g, i) => {
        if (isNaN(g.priceRange.min)) { 
          console.error(`❌ garment[${i}].priceRange.min is NaN`); 
          hasNaN = true; 
        } else {
          console.log(`✅ garment[${i}].priceRange.min OK (${g.priceRange.min})`);
        }
        
        if (isNaN(g.priceRange.max)) { 
          console.error(`❌ garment[${i}].priceRange.max is NaN`); 
          hasNaN = true; 
        } else {
          console.log(`✅ garment[${i}].priceRange.max OK (${g.priceRange.max})`);
        }
        
        if (isNaN(g.fabricPrice)) { 
          console.error(`❌ garment[${i}].fabricPrice is NaN`); 
          hasNaN = true; 
        } else {
          console.log(`✅ garment[${i}].fabricPrice OK (${g.fabricPrice})`);
        }
      });
      
      if (hasNaN) {
        console.error("\n❌❌❌ NAN VALUES DETECTED! Stopping submission. ❌❌❌");
        throw new Error("NaN values detected in order data. Please check all number fields.");
      }

      // Check if there are any images
      const hasImages = orderData.garments.some(g => 
        g.referenceImages?.length > 0 || 
        g.customerImages?.length > 0 || 
        g.customerClothImages?.length > 0
      );
      console.log("\n📸 Has images:", hasImages ? "YES" : "NO");
      if (hasImages) {
        console.log("📸 Image details:");
        orderData.garments.forEach((g, i) => {
          if (g.referenceImages?.length > 0) console.log(`  Garment ${i+1}: ${g.referenceImages.length} reference images`);
          if (g.customerImages?.length > 0) console.log(`  Garment ${i+1}: ${g.customerImages.length} customer images`);
          if (g.customerClothImages?.length > 0) console.log(`  Garment ${i+1}: ${g.customerClothImages.length} cloth images`);
        });
      }

      console.log("\n");
      console.log("%c📡📡📡📡📡📡📡📡📡📡📡📡📡📡📡📡📡📡📡📡📡", "background: blue; color: white; font-size: 14px");
      console.log("%c📡       DISPATCHING TO REDUX       📡", "background: blue; color: white; font-size: 14px");
      console.log("%c📡📡📡📡📡📡📡📡📡📡📡📡📡📡📡📡📡📡📡📡📡", "background: blue; color: white; font-size: 14px");
      console.log("\n");

      // 🔥 Create the order
      console.log("📡 Dispatching createNewOrder...");
      const result = await dispatch(createNewOrder(orderData)).unwrap();
      
      console.log("\n");
      console.log("%c✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅", "background: green; color: white; font-size: 16px; font-weight: bold");
      console.log("%c✅       ORDER CREATED SUCCESSFULLY       ✅", "background: green; color: white; font-size: 16px; font-weight: bold");
      console.log("%c✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅", "background: green; color: white; font-size: 16px; font-weight: bold");
      console.log("\n");
      
      console.log("Result:", result);
      
      const orderId = result.order?._id || result._id;

      if (!orderId) {
        throw new Error("Order created but no ID returned");
      }

      // 🔥 UPDATE currentOrderId to real ID for future payments
      setCurrentOrderId(orderId);
      console.log("✅ Updated currentOrderId to:", orderId);
      
      showToast.success("Order created successfully! 🎉");
      navigate(`${basePath}/orders`);
      
    } catch (error) {
      console.error("\n");
      console.log("%c❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌", "background: red; color: white; font-size: 16px; font-weight: bold");
      console.log("%c❌       SUBMISSION ERROR       ❌", "background: red; color: white; font-size: 16px; font-weight: bold");
      console.log("%c❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌❌", "background: red; color: white; font-size: 16px; font-weight: bold");
      console.log("\n");
      
      console.error("❌ ERROR:", error);
      
      if (error.response?.data) {
        console.error("Server error response:", error.response.data);
        setServerErrors(error.response.data);
      }
      
      let errorMessage = "Failed to create order";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        errorMessage = `Validation failed: ${error.response.data.errors.join(', ')}`;
        console.error("Validation errors:", error.response.data.errors);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showToast.error(errorMessage);
      
    } finally {
      // 🔓 Release locks
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      
      // Re-enable submit button
      const submitButton = document.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = false;
      }
      
      console.log("\n");
      console.log("%c🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓", "background: orange; color: white; font-size: 14px");
      console.log("%c🔓       SUBMISSION LOCK RELEASED       🔓", "background: orange; color: white; font-size: 14px");
      console.log("%c🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓🔓", "background: orange; color: white; font-size: 14px");
      console.log("\n");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500 p-6">
      <style>{calendarStyles}</style>
      
      {/* 🖼️ Image Preview Modal */}
      {showImagePreview && (
        <ImagePreviewModal
          images={previewImages}
          title={previewTitle}
          onClose={handleClosePreview}
        />
      )}

      {/* Add Payment Modal - NOW USING currentOrderId */}
      <AddPaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          console.log("🚪 Closing payment modal");
          setShowPaymentModal(false);
          setEditingPayment(null);
        }}
        onSave={handleSavePayment}
        orderTotalMin={priceSummary.totalMin}
        orderTotalMax={priceSummary.totalMax}
        remainingAmount={balanceAmount.max}
        alreadyPaid={totalPayments}
        orderId={currentOrderId}
        customerId={formData.customer}
        initialData={editingPayment}
        title={editingPayment ? "Edit Payment" : "Add Payment"}
      />

      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`${basePath}/orders`)}
          className="p-2 hover:bg-slate-100 rounded-xl transition-all"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Create New Order</h1>
          <p className="text-slate-500">Add customer details and garments to create an order</p>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Customer & Order Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Customer Selection Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <User size={20} className="text-blue-600" />
              Customer Details
            </h2>

            <div className="relative">
              <input
                type="text"
                placeholder="Search customer by name, phone or ID..."
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setShowCustomerDropdown(true)}
                onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />

              {showCustomerDropdown && (
                <>
                  {customersLoading && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg p-4 text-center">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                      <p className="text-sm text-slate-500 mt-2">Loading customers...</p>
                    </div>
                  )}

                  {!customersLoading && filteredCustomers.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {filteredCustomers.map((customer) => {
                        const fullName = getCustomerFullName(customer);
                        const displayId = getCustomerDisplayId(customer);
                        const phone = getCustomerPhone(customer);
                        
                        return (
                          <button
                            key={customer._id}
                            type="button"
                            onClick={() => handleCustomerSelect(customer)}
                            className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-all border-b border-slate-100 last:border-0"
                          >
                            <p className="font-medium text-slate-800">{fullName}</p>
                            <p className="text-xs text-slate-400">
                              <span className="font-mono">{displayId}</span> • {phone}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {!customersLoading && filteredCustomers.length === 0 && searchTerm && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg p-4 text-center">
                      <p className="text-slate-500">No customers found</p>
                      <button
                        type="button"
                        onClick={() => navigate(`${basePath}/add-customer`)}
                        className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        + Create new customer
                      </button>
                    </div>
                  )}
                </>
              )}

              {formData.customer && !showCustomerDropdown && (
                <div className="mt-2 text-xs text-green-600 font-medium">
                  ✓ Customer selected: {selectedCustomerDisplay}
                </div>
              )}
            </div>

            {/* Special Notes */}
            <div className="mt-4">
              <label className="block text-xs font-black uppercase text-slate-500 mb-2">
                Special Notes
              </label>
              <textarea
                value={formData.specialNotes}
                onChange={(e) => setFormData({ ...formData, specialNotes: e.target.value })}
                rows="3"
                placeholder="Any special instructions for this order..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* 🔥 GARMENTS SECTION - WITH UPDATED IMAGE LAYOUT */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Package size={20} className="text-blue-600" />
                Garments
              </h2>
              <button
                type="button"
                onClick={handleAddGarment}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2"
              >
                <Plus size={16} />
                Add Garment
              </button>
            </div>

            {garments.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl">
                <Package size={40} className="mx-auto text-slate-300 mb-2" />
                <p className="text-slate-500">No garments added yet</p>
                <button
                  type="button"
                  onClick={handleAddGarment}
                  className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  + Add your first garment
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {garments.map((garment, index) => {
                  const categoryName = garment.categoryName || getCategoryName(garment.category);
                  const itemName = garment.itemName || getItemName(garment);
                  
                  // Calculate total images
                  const totalImages = (garment.referenceImages?.length || 0) + 
                                     (garment.customerImages?.length || 0) + 
                                     (garment.customerClothImages?.length || 0);
                  
                  return (
                    <div
                      key={garment.tempId}
                      className="bg-slate-50 rounded-xl p-4 border border-slate-200 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* Garment Header with Badges */}
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <h3 className="font-black text-slate-800">{garment.name}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              garment.priority === 'urgent' ? 'bg-red-100 text-red-600' :
                              garment.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              {garment.priority}
                            </span>
                            
                            {/* 🔥 NEW: Total Image Count Badge */}
                            {totalImages > 0 && (
                              <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full flex items-center gap-1">
                                <ImageIcon size={12} />
                                {totalImages} {totalImages === 1 ? 'image' : 'images'}
                              </span>
                            )}
                          </div>
                          
                          {/* Garment Details Grid */}
                          <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                            <div>
                              <p className="text-xs text-slate-400">Category/Item</p>
                              <p className="font-medium text-blue-700">
                                {categoryName} / {itemName}
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-xs text-slate-400">Garment Delivery</p>
                              <p className="font-medium text-purple-600">
                                {garment.estimatedDelivery ? new Date(garment.estimatedDelivery).toLocaleDateString() : 'Not set'}
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-xs text-slate-400">Price</p>
                              <p className="font-semibold text-emerald-600">
                                ₹{(garment.finalizedPrice || garment.priceRange?.max || 0).toLocaleString('en-IN')}
                              </p>
                            </div>
                          </div>

                          {/* Debug info */}
                          <div className="text-xs text-gray-400 mb-1">
                            Ref: {garment.referenceImages?.length || 0}, 
                            Cust: {garment.customerImages?.length || 0}, 
                            Cloth: {garment.customerClothImages?.length || 0}
                          </div>

                          {/* 🖼️🔥 NEW IMAGE GALLERY LAYOUT - EXACTLY LIKE YOUR EXAMPLE 🔥🖼️ */}
                          {totalImages > 0 && (
                            <div className="mt-3">
                              {/* Thumbnail Previews - First 2 of each type */}
                              <div className="flex flex-wrap gap-2">
                                {/* Reference Images - Indigo border */}
                                {garment.referenceImages?.slice(0, 2).map((img, idx) => {
                                  const imgUrl = img instanceof File ? URL.createObjectURL(img) : (img?.url || img);
                                  return (
                                    <button
                                      key={`ref-${idx}`}
                                      onClick={() => handleViewImages(garment.referenceImages, 'reference')}
                                      className="relative group"
                                    >
                                      <img
                                        src={imgUrl}
                                        alt={`Reference ${idx + 1}`}
                                        className="w-12 h-12 object-cover rounded-lg border-2 border-indigo-200 hover:border-indigo-400 transition-all"
                                      />
                                    </button>
                                  );
                                })}

                                {/* Customer Images - Green border */}
                                {garment.customerImages?.slice(0, 2).map((img, idx) => {
                                  const imgUrl = img instanceof File ? URL.createObjectURL(img) : (img?.url || img);
                                  return (
                                    <button
                                      key={`cust-${idx}`}
                                      onClick={() => handleViewImages(garment.customerImages, 'customer')}
                                      className="relative group"
                                    >
                                      <img
                                        src={imgUrl}
                                        alt={`Customer ${idx + 1}`}
                                        className="w-12 h-12 object-cover rounded-lg border-2 border-green-200 hover:border-green-400 transition-all"
                                      />
                                    </button>
                                  );
                                })}

                                {/* Cloth Images - Orange border */}
                                {garment.customerClothImages?.slice(0, 2).map((img, idx) => {
                                  const imgUrl = img instanceof File ? URL.createObjectURL(img) : (img?.url || img);
                                  return (
                                    <button
                                      key={`cloth-${idx}`}
                                      onClick={() => handleViewImages(garment.customerClothImages, 'cloth')}
                                      className="relative group"
                                    >
                                      <img
                                        src={imgUrl}
                                        alt={`Cloth ${idx + 1}`}
                                        className="w-12 h-12 object-cover rounded-lg border-2 border-orange-200 hover:border-orange-400 transition-all"
                                      />
                                    </button>
                                  );
                                })}

                                {/* More images indicator */}
                                {totalImages > 6 && (
                                  <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center text-sm font-bold text-slate-600">
                                    +{totalImages - 6}
                                  </div>
                                )}
                              </div>

                              {/* View All Images Button */}
                              {totalImages > 0 && (
                                <button
                                  onClick={() => setExpandedGarment(expandedGarment === garment.tempId ? null : garment.tempId)}
                                  className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-2 flex items-center gap-1"
                                >
                                  <ImageIcon size={14} />
                                  {expandedGarment === garment.tempId ? 'Hide all images' : 'View all images'}
                                </button>
                              )}
                            </div>
                          )}

                          {/* 🔥 EXPANDED VIEW - Full gallery when expanded */}
                          {expandedGarment === garment.tempId && totalImages > 0 && (
                            <div className="mt-4 pt-4 border-t border-slate-200">
                              {/* Reference Images Full Gallery */}
                              {garment.referenceImages?.length > 0 && (
                                <div className="mb-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Camera size={16} className="text-indigo-600" />
                                    <p className="text-sm font-bold text-indigo-600">
                                      Reference Images ({garment.referenceImages.length})
                                    </p>
                                  </div>
                                  <div className="grid grid-cols-4 gap-2">
                                    {garment.referenceImages.map((img, idx) => {
                                      const imgUrl = img instanceof File ? URL.createObjectURL(img) : (img?.url || img);
                                      return (
                                        <button
                                          key={`ref-full-${idx}`}
                                          onClick={() => handleViewImages(garment.referenceImages, 'reference')}
                                          className="relative group aspect-square"
                                        >
                                          <img
                                            src={imgUrl}
                                            alt={`Reference ${idx + 1}`}
                                            className="w-full h-full object-cover rounded-lg border-2 border-indigo-200 hover:border-indigo-400"
                                          />
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Customer Images Full Gallery */}
                              {garment.customerImages?.length > 0 && (
                                <div className="mb-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <ImageIcon size={16} className="text-green-600" />
                                    <p className="text-sm font-bold text-green-600">
                                      Customer Images ({garment.customerImages.length})
                                    </p>
                                  </div>
                                  <div className="grid grid-cols-4 gap-2">
                                    {garment.customerImages.map((img, idx) => {
                                      const imgUrl = img instanceof File ? URL.createObjectURL(img) : (img?.url || img);
                                      return (
                                        <button
                                          key={`cust-full-${idx}`}
                                          onClick={() => handleViewImages(garment.customerImages, 'customer')}
                                          className="relative group aspect-square"
                                        >
                                          <img
                                            src={imgUrl}
                                            alt={`Customer ${idx + 1}`}
                                            className="w-full h-full object-cover rounded-lg border-2 border-green-200 hover:border-green-400"
                                          />
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Cloth Images Full Gallery */}
                              {garment.customerClothImages?.length > 0 && (
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Scissors size={16} className="text-orange-600" />
                                    <p className="text-sm font-bold text-orange-600">
                                      Cloth Images ({garment.customerClothImages.length})
                                    </p>
                                  </div>
                                  <div className="grid grid-cols-4 gap-2">
                                    {garment.customerClothImages.map((img, idx) => {
                                      const imgUrl = img instanceof File ? URL.createObjectURL(img) : (img?.url || img);
                                      return (
                                        <button
                                          key={`cloth-full-${idx}`}
                                          onClick={() => handleViewImages(garment.customerClothImages, 'cloth')}
                                          className="relative group aspect-square"
                                        >
                                          <img
                                            src={imgUrl}
                                            alt={`Cloth ${idx + 1}`}
                                            className="w-full h-full object-cover rounded-lg border-2 border-orange-200 hover:border-orange-400"
                                          />
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Additional Info */}
                          {garment.additionalInfo && (
                            <p className="text-sm text-slate-500 mt-2 italic">
                              Note: {garment.additionalInfo}
                            </p>
                          )}
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2 ml-4">
                          <button
                            type="button"
                            onClick={() => handleEditGarment(garment)}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteGarment(index, garment)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div> 
          
          {/* Delivery Date Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-blue-600" />
              Order Delivery Details
            </h2>
            
            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-2">
                Expected Delivery Date <span className="text-red-500">*</span>
              </label>
              
              <div className="relative" ref={calendarRef}>
                <button
                  type="button"
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-left"
                >
                  <Calendar size={18} className="text-slate-400" />
                  <span className={formData.deliveryDate ? "text-slate-800" : "text-slate-400"}>
                    {formatDisplayDate(formData.deliveryDate || selectedDate)}
                  </span>
                  {calendarLoading && (
                    <div className="ml-auto w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </button>

                {showCalendar && (
                  <div className="absolute z-20 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl p-4">
                    <DatePicker
                      inline
                      selected={selectedDate}
                      onChange={handleDateSelect}
                      onMonthChange={handleMonthChange}
                      minDate={new Date()}
                      renderDayContents={renderDayContents}
                      calendarClassName="!border-0"
                    />
                    
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ef4444' }}></div>
                        <span className="text-slate-600">Busy delivery days</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-transparent border border-slate-300 rounded-full"></div>
                        <span className="text-slate-600">Free days</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {formData.deliveryDate && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    ✓ Delivery selected: {formatDisplayDate(formData.deliveryDate)}
                  </p>
                </div>
              )}
              
              <p className="text-xs text-slate-400 mt-2">
                This is the overall order delivery date. Each garment can have its own estimated delivery date.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Payment Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-6">
            <h2 className="text-lg font-black text-slate-800 mb-4">Price Summary</h2>
            
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 shadow-sm">
                <p className="text-[10px] text-blue-600 font-black uppercase mb-0.5">Finalized Billing Amount</p>
                <p className="text-2xl font-black text-blue-700">
                  ₹{finalizedAmount.toLocaleString('en-IN')}
                </p>
                {estimatedRange.min > 0 && estimatedRange.max > 0 && (
                  <div className="mt-2 pt-2 border-t border-blue-200/50 flex justify-between text-[9px] text-slate-500 font-bold">
                    <span>ESTIMATED RANGE:</span>
                    <span>₹{estimatedRange.min.toLocaleString('en-IN')} - ₹{estimatedRange.max.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              {garments.length > 0 && (
                <div className="bg-purple-50 p-4 rounded-xl">
                  <p className="text-xs text-purple-600 font-black uppercase mb-1">
                    Garment Delivery Range
                  </p>
                  <p className="text-sm font-bold text-purple-700">
                    {new Date(Math.min(...garments.map(g => new Date(g.estimatedDelivery || formData.deliveryDate)))).toLocaleDateString()} - {new Date(Math.max(...garments.map(g => new Date(g.estimatedDelivery || formData.deliveryDate)))).toLocaleDateString()}
                  </p>
                </div>
              )}

              <div className="border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-black text-slate-700">Payments</h3>
                  <button
                    type="button"
                    onClick={handleAddPayment}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1"
                  >
                    <Plus size={14} />
                    Add Payment
                  </button>
                </div>

                {payments.length === 0 ? (
                  <p className="text-sm text-slate-400 italic text-center py-2">
                    No payments added yet
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {payments.map((payment, index) => (
                      <div
                        key={payment.tempId}
                        className="bg-slate-50 rounded-lg p-3 border border-slate-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-green-600">₹{payment.amount}</p>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                ['advance', 'partial', 'part-payment'].includes(payment.type) ? 'bg-blue-100 text-blue-700' :
                                ['full', 'final-settlement'].includes(payment.type) ? 'bg-green-100 text-green-700' :
                                'bg-purple-100 text-purple-700'
                              }`}>
                                {['advance', 'partial', 'part-payment'].includes(payment.type) ? 'Advance' :
                                 ['full', 'final-settlement'].includes(payment.type) ? 'Full' : 'Extra'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                              <PaymentMethodIcon method={payment.method} />
                              <span className="capitalize">{payment.method}</span>
                            </div>
                            {payment.referenceNumber && (
                              <p className="text-xs text-purple-600 font-mono mt-0.5">
                                Ref: {payment.referenceNumber}
                              </p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                              <span>{new Date(payment.date).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>{payment.time}</span>
                            </div>
                            {payment.notes && (
                              <p className="text-xs text-slate-400 mt-1 italic">
                                {payment.notes}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-1 ml-2">
                            <button
                              type="button"
                              onClick={() => handleEditPayment(payment)}
                              className="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                              title="Edit"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePayment(index)}
                              className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200"
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

                {payments.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-200">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-slate-600">Total Paid:</span>
                      <span className="font-bold text-green-600">₹{totalPayments}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-orange-50 p-4 rounded-xl">
                <p className="text-xs text-orange-600 font-black uppercase mb-1">Balance Amount</p>
                <p className="text-xl font-black text-orange-700">
                  ₹{balanceAmount.min} - ₹{balanceAmount.max}
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !userId}
                className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-xl font-black uppercase tracking-wider shadow-lg shadow-blue-500/30 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 mt-6 ${
                  isSubmitting || !userId ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </>
                ) : !userId ? (
                  'Please log in to create order'
                ) : (
                  <>
                    <Save size={18} />
                    Create Order
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate(`${basePath}/orders`)}
                className="w-full px-6 py-4 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-black uppercase tracking-wider transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Garment Form Modal */}
      {showGarmentModal && (
        <GarmentForm
          onClose={() => setShowGarmentModal(false)}
          onSave={handleSaveGarment}
          editingGarment={editingGarment}
          customerId={formData.customer}
        />
      )}
    </div>
  );
}