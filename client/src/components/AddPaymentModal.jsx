// // client/src/components/AddPaymentModal.jsx
// import React, { useState, useEffect } from "react";
// import { X, IndianRupee, Calendar, Clock, Hash, Wallet, Banknote, Smartphone, Landmark, CreditCard } from "lucide-react";
// import showToast from "../utils/toast";

// export default function AddPaymentModal({ 
//   isOpen, 
//   onClose, 
//   onSave, 
//   orderTotal = 0,
//   orderId,
//   customerId,
//   initialData = null,
//   title = "Add Payment"
// }) {
//   const [formData, setFormData] = useState({
//     amount: "",
//     type: "advance",
//     method: "cash",
//     referenceNumber: "",
//     paymentDate: new Date().toISOString().split('T')[0],
//     paymentTime: new Date().toLocaleTimeString('en-US', { 
//       hour12: false, 
//       hour: '2-digit', 
//       minute: '2-digit' 
//     }),
//     notes: ""
//   });

//   const [errors, setErrors] = useState({});

//   // Load initial data if editing
//   useEffect(() => {
//     if (initialData) {
//       setFormData({
//         amount: initialData.amount || "",
//         type: initialData.type || "advance",
//         method: initialData.method || "cash",
//         referenceNumber: initialData.referenceNumber || "",
//         paymentDate: initialData.paymentDate?.split('T')[0] || new Date().toISOString().split('T')[0],
//         paymentTime: initialData.paymentTime || new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
//         notes: initialData.notes || ""
//       });
//     }
//   }, [initialData]);

//   // Reset form when modal closes
//   useEffect(() => {
//     if (!isOpen) {
//       setFormData({
//         amount: "",
//         type: "advance",
//         method: "cash",
//         referenceNumber: "",
//         paymentDate: new Date().toISOString().split('T')[0],
//         paymentTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
//         notes: ""
//       });
//       setErrors({});
//     }
//   }, [isOpen]);

//   const validateForm = () => {
//     const newErrors = {};

//     if (!formData.amount || formData.amount <= 0) {
//       newErrors.amount = "Please enter a valid amount";
//     }

//     if (formData.type === "full" && Number(formData.amount) < orderTotal) {
//       newErrors.amount = `Full payment should be at least ₹${orderTotal}`;
//     }

//     if (!formData.paymentDate) {
//       newErrors.paymentDate = "Payment date is required";
//     }

//     if (!formData.paymentTime) {
//       newErrors.paymentTime = "Payment time is required";
//     }

//     if (formData.method !== "cash" && !formData.referenceNumber.trim()) {
//       newErrors.referenceNumber = `Reference number is required for ${getMethodLabel(formData.method)} payment`;
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const getMethodLabel = (method) => {
//     switch(method) {
//       case 'upi': return 'UPI';
//       case 'bank-transfer': return 'Bank Transfer';
//       case 'card': return 'Card';
//       default: return 'Cash';
//     }
//   };

//   const getMethodIcon = (method) => {
//     switch(method) {
//       case 'cash': return <Banknote size={18} className="text-green-600" />;
//       case 'upi': return <Smartphone size={18} className="text-blue-600" />;
//       case 'bank-transfer': return <Landmark size={18} className="text-purple-600" />;
//       case 'card': return <CreditCard size={18} className="text-orange-600" />;
//       default: return <Wallet size={18} className="text-slate-600" />;
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
    
//     if (!validateForm()) {
//       return;
//     }

//     onSave({
//       order: orderId,
//       customer: customerId,
//       ...formData,
//       amount: Number(formData.amount)
//     });
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     // Clear error for this field
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: null }));
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
//       <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-xl font-black text-slate-800">{title}</h3>
//           <button 
//             onClick={onClose} 
//             className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-lg"
//           >
//             <X size={20} />
//           </button>
//         </div>

//         {orderTotal > 0 && (
//           <div className="bg-blue-50 p-3 rounded-xl mb-4">
//             <p className="text-xs text-blue-600 font-bold">Order Total</p>
//             <p className="text-lg font-black text-blue-700">₹{orderTotal}</p>
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {/* Amount */}
//           <div>
//             <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//               Amount (₹) <span className="text-red-500">*</span>
//             </label>
//             <div className="relative">
//               <IndianRupee className="absolute left-3 top-3 text-slate-400" size={18} />
//               <input
//                 type="number"
//                 name="amount"
//                 value={formData.amount}
//                 onChange={handleChange}
//                 min="1"
//                 step="1"
//                 className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
//                   errors.amount ? 'border-red-300 bg-red-50' : 'border-slate-200'
//                 }`}
//                 placeholder="Enter amount"
//                 required
//               />
//             </div>
//             {errors.amount && (
//               <p className="text-xs text-red-500 mt-1">{errors.amount}</p>
//             )}
//           </div>

//           {/* Payment Type */}
//           <div>
//             <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//               Payment Type <span className="text-red-500">*</span>
//             </label>
//             <div className="grid grid-cols-3 gap-2">
//               <button
//                 type="button"
//                 onClick={() => setFormData({...formData, type: "advance"})}
//                 className={`py-3 rounded-xl font-bold transition-all ${
//                   formData.type === "advance"
//                     ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
//                     : "bg-slate-100 text-slate-600 hover:bg-slate-200"
//                 }`}
//               >
//                 Advance
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setFormData({...formData, type: "full"})}
//                 className={`py-3 rounded-xl font-bold transition-all ${
//                   formData.type === "full"
//                     ? "bg-green-600 text-white shadow-lg shadow-green-500/30"
//                     : "bg-slate-100 text-slate-600 hover:bg-slate-200"
//                 }`}
//               >
//                 Full
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setFormData({...formData, type: "extra"})}
//                 className={`py-3 rounded-xl font-bold transition-all ${
//                   formData.type === "extra"
//                     ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
//                     : "bg-slate-100 text-slate-600 hover:bg-slate-200"
//                 }`}
//               >
//                 Extra
//               </button>
//             </div>
//           </div>

//           {/* Payment Method */}
//           <div>
//             <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//               Payment Method <span className="text-red-500">*</span>
//             </label>
//             <div className="relative">
//               <div className="absolute left-3 top-3">
//                 {getMethodIcon(formData.method)}
//               </div>
//               <select
//                 name="method"
//                 value={formData.method}
//                 onChange={handleChange}
//                 className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
//                 required
//               >
//                 <option value="cash">Cash</option>
//                 <option value="upi">UPI</option>
//                 <option value="bank-transfer">Bank Transfer</option>
//                 <option value="card">Card</option>
//               </select>
//             </div>
//           </div>

//           {/* Reference Number - for non-cash payments */}
//           {formData.method !== 'cash' && (
//             <div>
//               <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//                 Reference Number 
//                 <span className="text-xs font-normal lowercase ml-1 text-slate-400">
//                   (Transaction ID / UPI Ref)
//                 </span>
//               </label>
//               <div className="relative">
//                 <Hash className="absolute left-3 top-3 text-slate-400" size={18} />
//                 <input
//                   type="text"
//                   name="referenceNumber"
//                   value={formData.referenceNumber}
//                   onChange={handleChange}
//                   className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
//                     errors.referenceNumber ? 'border-red-300 bg-red-50' : 'border-slate-200'
//                   }`}
//                   placeholder={`Enter ${getMethodLabel(formData.method)} reference`}
//                 />
//               </div>
//               {errors.referenceNumber && (
//                 <p className="text-xs text-red-500 mt-1">{errors.referenceNumber}</p>
//               )}
//               <p className="text-xs text-slate-400 mt-1">
//                 {formData.method === "upi" && "e.g., UPI transaction ID or VPA"}
//                 {formData.method === "bank-transfer" && "e.g., NEFT/IMPS/RTGS reference"}
//                 {formData.method === "card" && "e.g., Card transaction ID"}
//               </p>
//             </div>
//           )}

//           {/* Date and Time */}
//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//                 Date <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <Calendar className="absolute left-3 top-3 text-slate-400" size={16} />
//                 <input
//                   type="date"
//                   name="paymentDate"
//                   value={formData.paymentDate}
//                   onChange={handleChange}
//                   max={new Date().toISOString().split('T')[0]}
//                   className={`w-full pl-9 pr-3 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
//                     errors.paymentDate ? 'border-red-300 bg-red-50' : 'border-slate-200'
//                   }`}
//                   required
//                 />
//               </div>
//               {errors.paymentDate && (
//                 <p className="text-xs text-red-500 mt-1">{errors.paymentDate}</p>
//               )}
//             </div>
//             <div>
//               <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//                 Time <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <Clock className="absolute left-3 top-3 text-slate-400" size={16} />
//                 <input
//                   type="time"
//                   name="paymentTime"
//                   value={formData.paymentTime}
//                   onChange={handleChange}
//                   className={`w-full pl-9 pr-3 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
//                     errors.paymentTime ? 'border-red-300 bg-red-50' : 'border-slate-200'
//                   }`}
//                   required
//                 />
//               </div>
//               {errors.paymentTime && (
//                 <p className="text-xs text-red-500 mt-1">{errors.paymentTime}</p>
//               )}
//             </div>
//           </div>

//           {/* Notes */}
//           <div>
//             <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//               Notes <span className="text-slate-400">(Optional)</span>
//             </label>
//             <textarea
//               name="notes"
//               value={formData.notes}
//               onChange={handleChange}
//               rows="2"
//               className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
//               placeholder="Any notes about this payment..."
//             />
//           </div>

//           {/* Buttons */}
//           <div className="flex gap-3 pt-4">
//             <button
//               type="submit"
//               className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-green-500/30"
//             >
//               {initialData ? 'Update' : 'Add'} Payment
//             </button>
//             <button
//               type="button"
//               onClick={onClose}
//               className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 rounded-xl font-bold transition-all"
//             >
//               Cancel
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }


// // client/src/components/AddPaymentModal.jsx
// import React, { useState, useEffect } from "react";
// import { X, IndianRupee, Calendar, Clock, Hash, Wallet, Banknote, Smartphone, Landmark, CreditCard } from "lucide-react";
// import showToast from "../utils/toast";

// export default function AddPaymentModal({ 
//   isOpen, 
//   onClose, 
//   onSave, 
//   orderTotalMin = 0,    // ✅ Changed from orderTotal
//   orderTotalMax = 0,    // ✅ Added max price
//   orderId,
//   customerId,
//   initialData = null,
//   title = "Add Payment"
// }) {
//   const [formData, setFormData] = useState({
//     amount: "",
//     type: "advance",
//     method: "cash",
//     referenceNumber: "",
//     paymentDate: new Date().toISOString().split('T')[0],
//     paymentTime: new Date().toLocaleTimeString('en-US', { 
//       hour12: false, 
//       hour: '2-digit', 
//       minute: '2-digit' 
//     }),
//     notes: ""
//   });

//   const [errors, setErrors] = useState({});

//   // Load initial data if editing
//   useEffect(() => {
//     if (initialData) {
//       setFormData({
//         amount: initialData.amount || "",
//         type: initialData.type || "advance",
//         method: initialData.method || "cash",
//         referenceNumber: initialData.referenceNumber || "",
//         paymentDate: initialData.paymentDate?.split('T')[0] || new Date().toISOString().split('T')[0],
//         paymentTime: initialData.paymentTime || new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
//         notes: initialData.notes || ""
//       });
//     }
//   }, [initialData]);

//   // Reset form when modal closes
//   useEffect(() => {
//     if (!isOpen) {
//       setFormData({
//         amount: "",
//         type: "advance",
//         method: "cash",
//         referenceNumber: "",
//         paymentDate: new Date().toISOString().split('T')[0],
//         paymentTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
//         notes: ""
//       });
//       setErrors({});
//     }
//   }, [isOpen]);

//   const validateForm = () => {
//     const newErrors = {};

//     if (!formData.amount || formData.amount <= 0) {
//       newErrors.amount = "Please enter a valid amount";
//     }

//     // ✅ Updated validation with price range
//     if (formData.type === "full") {
//       if (Number(formData.amount) < orderTotalMin) {
//         newErrors.amount = `Full payment should be at least minimum amount ₹${orderTotalMin}`;
//       }
//     }

//     if (!formData.paymentDate) {
//       newErrors.paymentDate = "Payment date is required";
//     }

//     if (!formData.paymentTime) {
//       newErrors.paymentTime = "Payment time is required";
//     }

//     // ✅ UPI Reference Number is now OPTIONAL - removed validation
//     // Only show warning but don't block submission
//     if (formData.method !== "cash" && !formData.referenceNumber.trim()) {
//       // Just show toast warning, don't add to errors
//       setTimeout(() => {
//         showToast.warning(`Reference number is recommended for ${getMethodLabel(formData.method)} payment`);
//       }, 100);
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const getMethodLabel = (method) => {
//     switch(method) {
//       case 'upi': return 'UPI';
//       case 'bank-transfer': return 'Bank Transfer';
//       case 'card': return 'Card';
//       default: return 'Cash';
//     }
//   };

//   const getMethodIcon = (method) => {
//     switch(method) {
//       case 'cash': return <Banknote size={18} className="text-green-600" />;
//       case 'upi': return <Smartphone size={18} className="text-blue-600" />;
//       case 'bank-transfer': return <Landmark size={18} className="text-purple-600" />;
//       case 'card': return <CreditCard size={18} className="text-orange-600" />;
//       default: return <Wallet size={18} className="text-slate-600" />;
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
    
//     if (!validateForm()) {
//       return;
//     }

//     onSave({
//       order: orderId,
//       customer: customerId,
//       ...formData,
//       amount: Number(formData.amount)
//     });
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     // Clear error for this field
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: null }));
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
//       <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-xl font-black text-slate-800">{title}</h3>
//           <button 
//             onClick={onClose} 
//             className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-lg"
//           >
//             <X size={20} />
//           </button>
//         </div>

//         {/* ✅ Updated to show price range */}
//         {(orderTotalMin > 0 || orderTotalMax > 0) && (
//           <div className="bg-blue-50 p-3 rounded-xl mb-4">
//             <p className="text-xs text-blue-600 font-bold">Order Price Range</p>
//             <p className="text-lg font-black text-blue-700">
//               ₹{orderTotalMin} - ₹{orderTotalMax}
//             </p>
//             {orderTotalMin === orderTotalMax && (
//               <p className="text-xs text-blue-600 mt-1">Fixed price</p>
//             )}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {/* Amount */}
//           <div>
//             <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//               Amount (₹) <span className="text-red-500">*</span>
//             </label>
//             <div className="relative">
//               <IndianRupee className="absolute left-3 top-3 text-slate-400" size={18} />
//               <input
//                 type="number"
//                 name="amount"
//                 value={formData.amount}
//                 onChange={handleChange}
//                 min="1"
//                 step="1"
//                 className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
//                   errors.amount ? 'border-red-300 bg-red-50' : 'border-slate-200'
//                 }`}
//                 placeholder="Enter amount"
//                 required
//               />
//             </div>
//             {errors.amount && (
//               <p className="text-xs text-red-500 mt-1">{errors.amount}</p>
//             )}
//           </div>

//           {/* Payment Type */}
//           <div>
//             <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//               Payment Type <span className="text-red-500">*</span>
//             </label>
//             <div className="grid grid-cols-3 gap-2">
//               <button
//                 type="button"
//                 onClick={() => setFormData({...formData, type: "advance"})}
//                 className={`py-3 rounded-xl font-bold transition-all ${
//                   formData.type === "advance"
//                     ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
//                     : "bg-slate-100 text-slate-600 hover:bg-slate-200"
//                 }`}
//               >
//                 Advance
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setFormData({...formData, type: "full"})}
//                 className={`py-3 rounded-xl font-bold transition-all ${
//                   formData.type === "full"
//                     ? "bg-green-600 text-white shadow-lg shadow-green-500/30"
//                     : "bg-slate-100 text-slate-600 hover:bg-slate-200"
//                 }`}
//               >
//                 Full
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setFormData({...formData, type: "extra"})}
//                 className={`py-3 rounded-xl font-bold transition-all ${
//                   formData.type === "extra"
//                     ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
//                     : "bg-slate-100 text-slate-600 hover:bg-slate-200"
//                 }`}
//               >
//                 Extra
//               </button>
//             </div>
//           </div>

//           {/* Payment Method */}
//           <div>
//             <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//               Payment Method <span className="text-red-500">*</span>
//             </label>
//             <div className="relative">
//               <div className="absolute left-3 top-3">
//                 {getMethodIcon(formData.method)}
//               </div>
//               <select
//                 name="method"
//                 value={formData.method}
//                 onChange={handleChange}
//                 className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
//                 required
//               >
//                 <option value="cash">Cash</option>
//                 <option value="upi">UPI</option>
//                 <option value="bank-transfer">Bank Transfer</option>
//                 <option value="card">Card</option>
//               </select>
//             </div>
//           </div>

//           {/* Reference Number - Now OPTIONAL for all methods */}
//           {formData.method !== 'cash' && (
//             <div>
//               <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//                 Reference Number 
//                 <span className="text-xs font-normal lowercase ml-1 text-slate-400">
//                   (Optional - Transaction ID / UPI Ref)
//                 </span>
//               </label>
//               <div className="relative">
//                 <Hash className="absolute left-3 top-3 text-slate-400" size={18} />
//                 <input
//                   type="text"
//                   name="referenceNumber"
//                   value={formData.referenceNumber}
//                   onChange={handleChange}
//                   className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
//                   placeholder={`Enter ${getMethodLabel(formData.method)} reference (optional)`}
//                 />
//               </div>
//               <p className="text-xs text-slate-400 mt-1">
//                 {formData.method === "upi" && "e.g., UPI transaction ID or VPA (optional)"}
//                 {formData.method === "bank-transfer" && "e.g., NEFT/IMPS/RTGS reference (optional)"}
//                 {formData.method === "card" && "e.g., Card transaction ID (optional)"}
//               </p>
//             </div>
//           )}

//           {/* Date and Time */}
//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//                 Date <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <Calendar className="absolute left-3 top-3 text-slate-400" size={16} />
//                 <input
//                   type="date"
//                   name="paymentDate"
//                   value={formData.paymentDate}
//                   onChange={handleChange}
//                   max={new Date().toISOString().split('T')[0]}
//                   className={`w-full pl-9 pr-3 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
//                     errors.paymentDate ? 'border-red-300 bg-red-50' : 'border-slate-200'
//                   }`}
//                   required
//                 />
//               </div>
//               {errors.paymentDate && (
//                 <p className="text-xs text-red-500 mt-1">{errors.paymentDate}</p>
//               )}
//             </div>
//             <div>
//               <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//                 Time <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <Clock className="absolute left-3 top-3 text-slate-400" size={16} />
//                 <input
//                   type="time"
//                   name="paymentTime"
//                   value={formData.paymentTime}
//                   onChange={handleChange}
//                   className={`w-full pl-9 pr-3 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
//                     errors.paymentTime ? 'border-red-300 bg-red-50' : 'border-slate-200'
//                   }`}
//                   required
//                 />
//               </div>
//               {errors.paymentTime && (
//                 <p className="text-xs text-red-500 mt-1">{errors.paymentTime}</p>
//               )}
//             </div>
//           </div>

//           {/* Notes */}
//           <div>
//             <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//               Notes <span className="text-slate-400">(Optional)</span>
//             </label>
//             <textarea
//               name="notes"
//               value={formData.notes}
//               onChange={handleChange}
//               rows="2"
//               className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
//               placeholder="Any notes about this payment..."
//             />
//           </div>

//           {/* Buttons */}
//           <div className="flex gap-3 pt-4">
//             <button
//               type="submit"
//               className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-green-500/30"
//             >
//               {initialData ? 'Update' : 'Add'} Payment
//             </button>
//             <button
//               type="button"
//               onClick={onClose}
//               className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 rounded-xl font-bold transition-all"
//             >
//               Cancel
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }





// // client/src/components/AddPaymentModal.jsx
// import React, { useState, useEffect } from "react";
// import { X, IndianRupee, Calendar, Clock, Hash, Wallet, Banknote, Smartphone, Landmark, CreditCard } from "lucide-react";
// import showToast from "../utils/toast";

// export default function AddPaymentModal({ 
//   isOpen, 
//   onClose, 
//   onSave, 
//   orderTotalMin = 0,    // ✅ Changed from orderTotal
//   orderTotalMax = 0,    // ✅ Added max price
//   orderId,
//   customerId,
//   initialData = null,
//   title = "Add Payment"
// }) {
//   const [formData, setFormData] = useState({
//     amount: "",
//     type: "advance",
//     method: "cash",
//     referenceNumber: "",
//     paymentDate: new Date().toISOString().split('T')[0],
//     paymentTime: new Date().toLocaleTimeString('en-US', { 
//       hour12: false, 
//       hour: '2-digit', 
//       minute: '2-digit' 
//     }),
//     notes: ""
//   });

//   const [errors, setErrors] = useState({});

//   // Debug log when modal opens
//   useEffect(() => {
//     if (isOpen) {
//       console.log("📱 AddPaymentModal opened");
//       console.log("📊 Props received:", { 
//         orderTotalMin, 
//         orderTotalMax, 
//         orderId, 
//         customerId, 
//         hasInitialData: !!initialData 
//       });
//     }
//   }, [isOpen, orderTotalMin, orderTotalMax, orderId, customerId, initialData]);

//   // Load initial data if editing
//   useEffect(() => {
//     if (initialData) {
//       console.log("✏️ Loading initial data for edit:", initialData);
//       setFormData({
//         amount: initialData.amount || "",
//         type: initialData.type || "advance",
//         method: initialData.method || "cash",
//         referenceNumber: initialData.referenceNumber || "",
//         paymentDate: initialData.paymentDate?.split('T')[0] || new Date().toISOString().split('T')[0],
//         paymentTime: initialData.paymentTime || new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
//         notes: initialData.notes || ""
//       });
//     }
//   }, [initialData]);

//   // Reset form when modal closes
//   useEffect(() => {
//     if (!isOpen) {
//       console.log("🔄 Resetting form - modal closed");
//       setFormData({
//         amount: "",
//         type: "advance",
//         method: "cash",
//         referenceNumber: "",
//         paymentDate: new Date().toISOString().split('T')[0],
//         paymentTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
//         notes: ""
//       });
//       setErrors({});
//     }
//   }, [isOpen]);

//   const validateForm = () => {
//     console.log("🔍 Validating form data:", formData);
//     const newErrors = {};

//     if (!formData.amount || formData.amount <= 0) {
//       newErrors.amount = "Please enter a valid amount";
//       console.log("❌ Amount validation failed:", formData.amount);
//     }

//     // ✅ Updated validation with price range
//     if (formData.type === "full") {
//       if (Number(formData.amount) < orderTotalMin) {
//         newErrors.amount = `Full payment should be at least minimum amount ₹${orderTotalMin}`;
//         console.log(`❌ Full payment validation: ${formData.amount} < ${orderTotalMin}`);
//       }
//     }

//     if (!formData.paymentDate) {
//       newErrors.paymentDate = "Payment date is required";
//     }

//     if (!formData.paymentTime) {
//       newErrors.paymentTime = "Payment time is required";
//     }

//     // ✅ UPI Reference Number is now OPTIONAL - removed validation
//     // Only show warning but don't block submission
//     if (formData.method !== "cash" && !formData.referenceNumber.trim()) {
//       // Just show toast warning, don't add to errors
//       setTimeout(() => {
//         showToast.warning(`Reference number is recommended for ${getMethodLabel(formData.method)} payment`);
//       }, 100);
//     }

//     setErrors(newErrors);
//     const isValid = Object.keys(newErrors).length === 0;
//     console.log(isValid ? "✅ Form validation passed" : "❌ Form validation failed:", newErrors);
//     return isValid;
//   };

//   const getMethodLabel = (method) => {
//     switch(method) {
//       case 'upi': return 'UPI';
//       case 'bank-transfer': return 'Bank Transfer';
//       case 'card': return 'Card';
//       default: return 'Cash';
//     }
//   };

//   const getMethodIcon = (method) => {
//     switch(method) {
//       case 'cash': return <Banknote size={18} className="text-green-600" />;
//       case 'upi': return <Smartphone size={18} className="text-blue-600" />;
//       case 'bank-transfer': return <Landmark size={18} className="text-purple-600" />;
//       case 'card': return <CreditCard size={18} className="text-orange-600" />;
//       default: return <Wallet size={18} className="text-slate-600" />;
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
    
//     console.log("🚀 Submit button clicked");
//     console.log("📝 Current form data:", formData);
    
//     if (!validateForm()) {
//       console.log("⛔ Submission blocked - validation failed");
//       return;
//     }

//     // ✅ SAFE amount conversion with multiple checks
//     console.log("💰 Raw amount value:", formData.amount, "Type:", typeof formData.amount);
    
//     let amount = 0;
    
//     // Check if amount exists and is valid
//     if (formData.amount === undefined || formData.amount === null || formData.amount === '') {
//       console.log("❌ Amount is empty");
//       showToast.error("Amount is required");
//       return;
//     }
    
//     // Try to convert to number
//     const numericAmount = Number(formData.amount);
//     console.log("🔢 Converted amount:", numericAmount, "Type:", typeof numericAmount);
    
//     if (isNaN(numericAmount)) {
//       console.log("❌ Amount is NaN after conversion");
//       showToast.error("Please enter a valid number for amount");
//       return;
//     }
    
//     if (numericAmount <= 0) {
//       console.log("❌ Amount is <= 0:", numericAmount);
//       showToast.error("Amount must be greater than 0");
//       return;
//     }
    
//     amount = numericAmount;
//     console.log("✅ Valid amount:", amount);

//     // ✅ Create clean payment object (don't spread formData)
//     const paymentData = {
//       order: orderId,
//       customer: customerId,
//       amount: amount,  // Guaranteed number
//       type: formData.type,
//       method: formData.method,
//       referenceNumber: formData.referenceNumber?.trim() || '',
//       paymentDate: formData.paymentDate,
//       paymentTime: formData.paymentTime,
//       notes: formData.notes?.trim() || ''
//     };

//     console.log("✅ Final payment data being sent:", paymentData);
//     console.log("📊 Amount type check:", typeof paymentData.amount, "Value:", paymentData.amount);
    
//     // Call onSave with the clean data
//     onSave(paymentData);
    
//     console.log("📤 onSave called with payment data");
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     console.log(`✏️ Field changed: ${name} =`, value);
    
//     setFormData(prev => ({ ...prev, [name]: value }));
//     // Clear error for this field
//     if (errors[name]) {
//       console.log(`✅ Clearing error for ${name}`);
//       setErrors(prev => ({ ...prev, [name]: null }));
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
//       <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-xl font-black text-slate-800">{title}</h3>
//           <button 
//             onClick={onClose} 
//             className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-lg"
//           >
//             <X size={20} />
//           </button>
//         </div>

//         {/* ✅ Updated to show price range */}
//         {(orderTotalMin > 0 || orderTotalMax > 0) && (
//           <div className="bg-blue-50 p-3 rounded-xl mb-4">
//             <p className="text-xs text-blue-600 font-bold">Order Price Range</p>
//             <p className="text-lg font-black text-blue-700">
//               ₹{orderTotalMin} - ₹{orderTotalMax}
//             </p>
//             {orderTotalMin === orderTotalMax && (
//               <p className="text-xs text-blue-600 mt-1">Fixed price</p>
//             )}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {/* Amount */}
//           <div>
//             <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//               Amount (₹) <span className="text-red-500">*</span>
//             </label>
//             <div className="relative">
//               <IndianRupee className="absolute left-3 top-3 text-slate-400" size={18} />
//               <input
//                 type="number"
//                 name="amount"
//                 value={formData.amount}
//                 onChange={handleChange}
//                 min="1"
//                 step="1"
//                 className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
//                   errors.amount ? 'border-red-300 bg-red-50' : 'border-slate-200'
//                 }`}
//                 placeholder="Enter amount"
//                 required
//               />
//             </div>
//             {errors.amount && (
//               <p className="text-xs text-red-500 mt-1">{errors.amount}</p>
//             )}
//           </div>

//           {/* Payment Type */}
//           <div>
//             <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//               Payment Type <span className="text-red-500">*</span>
//             </label>
//             <div className="grid grid-cols-3 gap-2">
//               <button
//                 type="button"
//                 onClick={() => setFormData({...formData, type: "advance"})}
//                 className={`py-3 rounded-xl font-bold transition-all ${
//                   formData.type === "advance"
//                     ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
//                     : "bg-slate-100 text-slate-600 hover:bg-slate-200"
//                 }`}
//               >
//                 Advance
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setFormData({...formData, type: "full"})}
//                 className={`py-3 rounded-xl font-bold transition-all ${
//                   formData.type === "full"
//                     ? "bg-green-600 text-white shadow-lg shadow-green-500/30"
//                     : "bg-slate-100 text-slate-600 hover:bg-slate-200"
//                 }`}
//               >
//                 Full
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setFormData({...formData, type: "extra"})}
//                 className={`py-3 rounded-xl font-bold transition-all ${
//                   formData.type === "extra"
//                     ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30"
//                     : "bg-slate-100 text-slate-600 hover:bg-slate-200"
//                 }`}
//               >
//                 Extra
//               </button>
//             </div>
//           </div>

//           {/* Payment Method */}
//           <div>
//             <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//               Payment Method <span className="text-red-500">*</span>
//             </label>
//             <div className="relative">
//               <div className="absolute left-3 top-3">
//                 {getMethodIcon(formData.method)}
//               </div>
//               <select
//                 name="method"
//                 value={formData.method}
//                 onChange={handleChange}
//                 className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
//                 required
//               >
//                 <option value="cash">Cash</option>
//                 <option value="upi">UPI</option>
//                 <option value="bank-transfer">Bank Transfer</option>
//                 <option value="card">Card</option>
//               </select>
//             </div>
//           </div>

//           {/* Reference Number - Now OPTIONAL for all methods */}
//           {formData.method !== 'cash' && (
//             <div>
//               <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//                 Reference Number 
//                 <span className="text-xs font-normal lowercase ml-1 text-slate-400">
//                   (Optional - Transaction ID / UPI Ref)
//                 </span>
//               </label>
//               <div className="relative">
//                 <Hash className="absolute left-3 top-3 text-slate-400" size={18} />
//                 <input
//                   type="text"
//                   name="referenceNumber"
//                   value={formData.referenceNumber}
//                   onChange={handleChange}
//                   className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
//                   placeholder={`Enter ${getMethodLabel(formData.method)} reference (optional)`}
//                 />
//               </div>
//               <p className="text-xs text-slate-400 mt-1">
//                 {formData.method === "upi" && "e.g., UPI transaction ID or VPA (optional)"}
//                 {formData.method === "bank-transfer" && "e.g., NEFT/IMPS/RTGS reference (optional)"}
//                 {formData.method === "card" && "e.g., Card transaction ID (optional)"}
//               </p>
//             </div>
//           )}

//           {/* Date and Time */}
//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//                 Date <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <Calendar className="absolute left-3 top-3 text-slate-400" size={16} />
//                 <input
//                   type="date"
//                   name="paymentDate"
//                   value={formData.paymentDate}
//                   onChange={handleChange}
//                   max={new Date().toISOString().split('T')[0]}
//                   className={`w-full pl-9 pr-3 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
//                     errors.paymentDate ? 'border-red-300 bg-red-50' : 'border-slate-200'
//                   }`}
//                   required
//                 />
//               </div>
//               {errors.paymentDate && (
//                 <p className="text-xs text-red-500 mt-1">{errors.paymentDate}</p>
//               )}
//             </div>
//             <div>
//               <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//                 Time <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <Clock className="absolute left-3 top-3 text-slate-400" size={16} />
//                 <input
//                   type="time"
//                   name="paymentTime"
//                   value={formData.paymentTime}
//                   onChange={handleChange}
//                   className={`w-full pl-9 pr-3 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
//                     errors.paymentTime ? 'border-red-300 bg-red-50' : 'border-slate-200'
//                   }`}
//                   required
//                 />
//               </div>
//               {errors.paymentTime && (
//                 <p className="text-xs text-red-500 mt-1">{errors.paymentTime}</p>
//               )}
//             </div>
//           </div>

//           {/* Notes */}
//           <div>
//             <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//               Notes <span className="text-slate-400">(Optional)</span>
//             </label>
//             <textarea
//               name="notes"
//               value={formData.notes}
//               onChange={handleChange}
//               rows="2"
//               className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
//               placeholder="Any notes about this payment..."
//             />
//           </div>

//           {/* Buttons */}
//           <div className="flex gap-3 pt-4">
//             <button
//               type="submit"
//               className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-green-500/30"
//             >
//               {initialData ? 'Update' : 'Add'} Payment
//             </button>
//             <button
//               type="button"
//               onClick={onClose}
//               className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 rounded-xl font-bold transition-all"
//             >
//               Cancel
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }


// client/src/components/AddPaymentModal.jsx
import React, { useState, useEffect } from "react";
import { X, IndianRupee, Calendar, Clock, Hash, Wallet, Banknote, Smartphone, Landmark, CreditCard } from "lucide-react";
import showToast from "../utils/toast";

export default function AddPaymentModal({ 
  isOpen, 
  onClose, 
  onSave, 
  orderTotalMin = 0,    // ✅ Changed from orderTotal
  orderTotalMax = 0,    // ✅ Added max price
  orderTotal = 0,       // ✅ Backward compatibility (older pages)
  existingPayments = [],// ✅ Used for payment-type workflow
  balanceAmount = null, // ✅ number OR {min,max} from pages
  orderId,
  customerId,
  initialData = null,
  title = "Add Payment"
}) {
  const [formData, setFormData] = useState({
    amount: "",
    type: "advance",
    method: "cash",
    referenceNumber: "",
    paymentDate: new Date().toISOString().split('T')[0],
    paymentTime: new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    notes: ""
  });

  const [errors, setErrors] = useState({});

  // Debug log when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log("%c📱📱📱 ADD PAYMENT MODAL OPENED 📱📱📱", "background: blue; color: white; font-size: 14px");
      console.log("📊 Props received:", { 
        orderTotalMin, 
        orderTotalMax, 
        orderId, 
        customerId, 
        hasInitialData: !!initialData 
      });
      console.log("📝 Initial form state:", formData);
    }
  }, [isOpen, orderTotalMin, orderTotalMax, orderId, customerId, initialData]);

  // Load initial data if editing
  useEffect(() => {
    if (initialData) {
      console.log("%c✏️✏️✏️ LOADING EDIT DATA ✏️✏️✏️", "background: orange; color: white; font-size: 14px");
      console.log("📦 Initial data received:", JSON.parse(JSON.stringify(initialData)));
      setFormData({
        amount: initialData.amount || "",
        type: initialData.type || "advance",
        method: initialData.method || "cash",
        referenceNumber: initialData.referenceNumber || "",
        paymentDate: initialData.paymentDate?.split('T')[0] || new Date().toISOString().split('T')[0],
        paymentTime: initialData.paymentTime || new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        notes: initialData.notes || ""
      });
    }
  }, [initialData]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      console.log("%c🔄🔄🔄 RESETTING FORM 🔄🔄🔄", "background: gray; color: white; font-size: 14px");
      setFormData({
        amount: "",
        type: "advance",
        method: "cash",
        referenceNumber: "",
        paymentDate: new Date().toISOString().split('T')[0],
        paymentTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        notes: ""
      });
      setErrors({});
    }
  }, [isOpen]);

  const totalPaid = (existingPayments || []).reduce(
    (sum, p) => sum + (Number(p?.amount) || 0),
    0,
  );

  const balance = (() => {
    if (typeof balanceAmount === "number") return { min: balanceAmount, max: balanceAmount };
    if (balanceAmount && typeof balanceAmount === "object") {
      const min = Number(balanceAmount.min ?? 0);
      const max = Number(balanceAmount.max ?? balanceAmount.min ?? 0);
      return { min, max };
    }
    const min = (Number(orderTotalMin) || Number(orderTotal) || 0) - totalPaid;
    const max = (Number(orderTotalMax) || Number(orderTotal) || 0) - totalPaid;
    return { min, max };
  })();

  const hasAnyPayment = (existingPayments || []).length > 0 || totalPaid > 0;
  const hasAdvance = (existingPayments || []).some((p) => p?.type === "advance");
  const fullyPaid = balance.min <= 0 && balance.max <= 0;
  const canShowAdvanceOrFull = !hasAnyPayment && !fullyPaid;
  const shouldShowFinalOnly = hasAdvance && (balance.min > 0 || balance.max > 0);

  const allowedTypes = (() => {
    if (initialData) return ["advance", "full"]; // editing: preserve access
    if (fullyPaid) return [];
    if (canShowAdvanceOrFull) return ["advance", "full"];
    if (shouldShowFinalOnly) return ["full"];
    // fallback: allow full if payments exist but balance remains
    if (hasAnyPayment && (balance.min > 0 || balance.max > 0)) return ["full"];
    return ["advance", "full"];
  })();

  // Ensure type stays valid when opening / when workflow changes
  useEffect(() => {
    if (!isOpen) return;
    if (initialData) return;
    if (allowedTypes.length === 0) return;
    if (!allowedTypes.includes(formData.type)) {
      setFormData((prev) => ({ ...prev, type: allowedTypes[0] }));
    }
  }, [isOpen, allowedTypes.join("|")]); // eslint-disable-line react-hooks/exhaustive-deps

  const validateForm = () => {
    console.log("%c🔍🔍🔍 VALIDATING FORM 🔍🔍🔍", "background: yellow; color: black; font-size: 14px");
    console.log("📝 Form data:", JSON.parse(JSON.stringify(formData)));
    const newErrors = {};

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = "Please enter a valid amount";
      console.log("❌ Amount validation failed:", formData.amount);
    } else {
      console.log("✅ Amount validation passed:", formData.amount);
    }

    // ✅ Updated validation with price range
    if (formData.type === "full") {
      if (Number(formData.amount) < orderTotalMin) {
        newErrors.amount = `Full payment should be at least minimum amount ₹${orderTotalMin}`;
        console.log(`❌ Full payment validation: ${formData.amount} < ${orderTotalMin}`);
      } else {
        console.log(`✅ Full payment validation: ${formData.amount} >= ${orderTotalMin}`);
      }
    }

    if (!formData.paymentDate) {
      newErrors.paymentDate = "Payment date is required";
      console.log("❌ Payment date missing");
    } else {
      console.log("✅ Payment date OK:", formData.paymentDate);
    }

    if (!formData.paymentTime) {
      newErrors.paymentTime = "Payment time is required";
      console.log("❌ Payment time missing");
    } else {
      console.log("✅ Payment time OK:", formData.paymentTime);
    }

    // ✅ UPI Reference Number is now OPTIONAL - removed validation
    // Only show warning but don't block submission
    if (formData.method !== "cash" && !formData.referenceNumber.trim()) {
      // Just show toast warning, don't add to errors
      setTimeout(() => {
        showToast.warning(`Reference number is recommended for ${getMethodLabel(formData.method)} payment`);
      }, 100);
      console.log("⚠️ Reference number missing but optional");
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log(isValid ? "✅✅✅ FORM VALIDATION PASSED ✅✅✅" : "❌❌❌ FORM VALIDATION FAILED ❌❌❌", newErrors);
    return isValid;
  };

  const getMethodLabel = (method) => {
    switch(method) {
      case 'upi': return 'UPI';
      case 'bank-transfer': return 'Bank Transfer';
      case 'card': return 'Card';
      default: return 'Cash';
    }
  };

  const getMethodIcon = (method) => {
    switch(method) {
      case 'cash': return <Banknote size={18} className="text-green-600" />;
      case 'upi': return <Smartphone size={18} className="text-blue-600" />;
      case 'bank-transfer': return <Landmark size={18} className="text-purple-600" />;
      case 'card': return <CreditCard size={18} className="text-orange-600" />;
      default: return <Wallet size={18} className="text-slate-600" />;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log("%c🔥🔥🔥🔥🔥 SUBMIT BUTTON CLICKED 🔥🔥🔥🔥🔥", "background: red; color: white; font-size: 16px; font-weight: bold");
    console.log("📝 CURRENT FORM DATA:", JSON.parse(JSON.stringify(formData)));
    console.log("=".repeat(80));
    
    if (!validateForm()) {
      console.log("%c⛔⛔⛔ SUBMISSION BLOCKED - VALIDATION FAILED ⛔⛔⛔", "background: red; color: white; font-size: 14px");
      return;
    }

    console.log("%c💰💰💰 AMOUNT DEBUGGING STARTED 💰💰💰", "background: purple; color: white; font-size: 14px");
    
    // STEP 1: Raw amount value
    console.log("📌 STEP 1: Raw amount value:", formData.amount);
    console.log("📌 STEP 1: Type:", typeof formData.amount);
    console.log("📌 STEP 1: Length:", formData.amount?.length);
    console.log("📌 STEP 1: Is empty string:", formData.amount === "");
    console.log("📌 STEP 1: Is undefined:", formData.amount === undefined);
    console.log("📌 STEP 1: Is null:", formData.amount === null);
    
    // Check if amount exists
    if (formData.amount === undefined || formData.amount === null || formData.amount === '') {
      console.log("%c❌❌❌ STEP 2 FAILED: Amount is empty ❌❌❌", "background: red; color: white");
      showToast.error("Amount is required");
      return;
    }
    console.log("✅ STEP 2 PASSED: Amount exists");

    // STEP 3: Try different conversion methods
    console.log("📌 STEP 3: Testing different conversion methods:");
    const method1 = Number(formData.amount);
    const method2 = parseFloat(formData.amount);
    const method3 = parseInt(formData.amount, 10);
    const method4 = +formData.amount;
    
    console.log("  - Number():", method1, "Type:", typeof method1, isNaN(method1) ? "❌ NaN" : "✅ OK");
    console.log("  - parseFloat():", method2, "Type:", typeof method2, isNaN(method2) ? "❌ NaN" : "✅ OK");
    console.log("  - parseInt():", method3, "Type:", typeof method3, isNaN(method3) ? "❌ NaN" : "✅ OK");
    console.log("  - Unary +:", method4, "Type:", typeof method4, isNaN(method4) ? "❌ NaN" : "✅ OK");

    // STEP 4: Check character codes (reveals hidden characters)
    if (typeof formData.amount === 'string') {
      console.log("📌 STEP 4: Character code analysis:");
      const chars = [...formData.amount];
      chars.forEach((char, index) => {
        console.log(`  - Char ${index}: '${char}' (code: ${char.charCodeAt(0)})`);
      });
    }

    // STEP 5: Clean the string (remove any non-numeric characters except decimal)
    const amountStr = String(formData.amount).trim();
    const cleanedStr = amountStr.replace(/[^\d.-]/g, '');
    console.log("📌 STEP 5: Cleaned string:", cleanedStr);
    console.log("📌 STEP 5: Original vs Cleaned:", amountStr !== cleanedStr ? "⚠️ Changed" : "✅ No change");

    // STEP 6: Parse the cleaned string
    const parsedAmount = parseFloat(cleanedStr);
    console.log("📌 STEP 6: Parsed amount:", parsedAmount);
    console.log("📌 STEP 6: Is NaN:", isNaN(parsedAmount));

    if (isNaN(parsedAmount)) {
      console.log("%c❌❌❌ STEP 7 FAILED: Parsed amount is NaN ❌❌❌", "background: red; color: white");
      console.log("  - Original value type:", typeof formData.amount);
      console.log("  - String representation:", JSON.stringify(formData.amount));
      console.log("  - Character codes:", formData.amount ? [...String(formData.amount)].map(c => c.charCodeAt(0)) : []);
      showToast.error("Invalid amount format");
      return;
    }
    console.log("✅ STEP 7 PASSED: Parsed amount is valid number");

    // STEP 8: Check if amount is positive
    if (parsedAmount <= 0) {
      console.log("%c❌❌❌ STEP 8 FAILED: Amount <= 0 ❌❌❌", "background: red; color: white");
      console.log("  - Amount:", parsedAmount);
      showToast.error("Amount must be greater than 0");
      return;
    }
    console.log("✅ STEP 8 PASSED: Amount > 0");

    const amount = parsedAmount;
    console.log("%c✅✅✅ FINAL AMOUNT:", "background: green; color: white", amount, "Type:", typeof amount);

    console.log("=".repeat(80));
    console.log("%c📦📦📦 CREATING PAYMENT OBJECT 📦📦📦", "background: blue; color: white; font-size: 14px");

    // ✅ Create clean payment object (don't spread formData)
    const paymentData = {
      order: orderId,
      customer: customerId,
      amount: amount,  // Guaranteed number
      type: formData.type,
      method: formData.method,
      referenceNumber: formData.referenceNumber?.trim() || '',
      paymentDate: formData.paymentDate,
      paymentTime: formData.paymentTime,
      notes: formData.notes?.trim() || ''
    };

    console.log("📦 FINAL PAYMENT OBJECT:", JSON.parse(JSON.stringify(paymentData)));
    console.log("📊 Amount in final object:", paymentData.amount);
    console.log("📊 Amount type:", typeof paymentData.amount);
    console.log("📊 Is NaN:", isNaN(paymentData.amount));
    
    // Final sanity check
    if (typeof paymentData.amount !== 'number' || isNaN(paymentData.amount)) {
      console.log("%c💥💥💥 CRITICAL ERROR: Amount is still NaN in final object! 💥💥💥", "background: red; color: white; font-size: 16px");
      console.log("  - Amount value:", paymentData.amount);
      console.log("  - Amount type:", typeof paymentData.amount);
      console.log("  - Is NaN:", isNaN(paymentData.amount));
      showToast.error("Internal error: amount is invalid");
      return;
    }
    
    console.log("%c✅✅✅ FINAL SANITY CHECK PASSED ✅✅✅", "background: green; color: white");
    console.log("=".repeat(80));
    console.log("%c📤📤📤 CALLING onSave WITH PAYMENT DATA 📤📤📤", "background: purple; color: white; font-size: 14px");
    
    // Call onSave with the clean data
    onSave(paymentData);
    
    console.log("%c✅✅✅ onSave CALLED SUCCESSFULLY ✅✅✅", "background: green; color: white");
    console.log("=".repeat(80));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`✏️ Field changed: ${name} =`, value, `(Type: ${typeof value})`);
    
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      console.log(`✅ Clearing error for ${name}`);
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black text-slate-800">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* ✅ Updated to show price range */}
        {(orderTotalMin > 0 || orderTotalMax > 0) && (
          <div className="bg-blue-50 p-3 rounded-xl mb-4">
            <p className="text-xs text-blue-600 font-bold">Order Price Range</p>
            <p className="text-lg font-black text-blue-700">
              ₹{orderTotalMin} - ₹{orderTotalMax}
            </p>
            {orderTotalMin === orderTotalMax && (
              <p className="text-xs text-blue-600 mt-1">Fixed price</p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-500 mb-2">
              Amount (₹) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                min="1"
                step="1"
                className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                  errors.amount ? 'border-red-300 bg-red-50' : 'border-slate-200'
                }`}
                placeholder="Enter amount"
                required
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-red-500 mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Payment Type */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-500 mb-2">
              Payment Type <span className="text-red-500">*</span>
            </label>
            {allowedTypes.length === 0 ? (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 text-emerald-800 font-bold text-sm">
                Paid Completely ✅
              </div>
            ) : (
              <div
                className={`grid gap-2 ${
                  allowedTypes.length === 1 ? "grid-cols-1" : "grid-cols-2"
                }`}
              >
                {allowedTypes.includes("advance") && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "advance" })}
                    className={`py-3 rounded-xl font-bold transition-all ${
                      formData.type === "advance"
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Advance
                  </button>
                )}
                {allowedTypes.includes("full") && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: "full" })}
                    className={`py-3 rounded-xl font-bold transition-all ${
                      formData.type === "full"
                        ? "bg-green-600 text-white shadow-lg shadow-green-500/30"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {shouldShowFinalOnly ? "Final" : "Full"}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-500 mb-2">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-3">
                {getMethodIcon(formData.method)}
              </div>
              <select
                name="method"
                value={formData.method}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                required
              >
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="bank-transfer">Bank Transfer</option>
                <option value="card">Card</option>
              </select>
            </div>
          </div>

          {/* Reference Number - Now OPTIONAL for all methods */}
          {formData.method !== 'cash' && (
            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-2">
                Reference Number 
                <span className="text-xs font-normal lowercase ml-1 text-slate-400">
                  (Optional - Transaction ID / UPI Ref)
                </span>
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type="text"
                  name="referenceNumber"
                  value={formData.referenceNumber}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder={`Enter ${getMethodLabel(formData.method)} reference (optional)`}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {formData.method === "upi" && "e.g., UPI transaction ID or VPA (optional)"}
                {formData.method === "bank-transfer" && "e.g., NEFT/IMPS/RTGS reference (optional)"}
                {formData.method === "card" && "e.g., Card transaction ID (optional)"}
              </p>
            </div>
          )}

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 text-slate-400" size={16} />
                <input
                  type="date"
                  name="paymentDate"
                  value={formData.paymentDate}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  className={`w-full pl-9 pr-3 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                    errors.paymentDate ? 'border-red-300 bg-red-50' : 'border-slate-200'
                  }`}
                  required
                />
              </div>
              {errors.paymentDate && (
                <p className="text-xs text-red-500 mt-1">{errors.paymentDate}</p>
              )}
            </div>
            <div>
              {/* <label className="block text-xs font-black uppercase text-slate-500 mb-2">
                Time <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 text-slate-400" size={16} />
                <input
                  type="time"
                  name="paymentTime"
                  value={formData.paymentTime}
                  onChange={handleChange}
                  className={`w-full pl-9 pr-3 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                    errors.paymentTime ? 'border-red-300 bg-red-50' : 'border-slate-200'
                  }`}
                  required
                />
              </div> */}
              {errors.paymentTime && (
                <p className="text-xs text-red-500 mt-1">{errors.paymentTime}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-500 mb-2">
              Notes <span className="text-slate-400">(Optional)</span>
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="2"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
              placeholder="Any notes about this payment..."
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-green-500/30"
            >
              {initialData ? 'Update' : 'Add'} Payment
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 rounded-xl font-bold transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}