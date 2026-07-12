// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   User, Phone, Mail, MapPin, Home, ChevronRight, X, Save,
//   Building, Globe, BookOpen, AlertCircle, Hash, Calendar
// } from "lucide-react";
// import { createNewCustomer } from "../../../features/customer/customerSlice";
// import showToast from "../../../utils/toast";

// export default function AddCustomer() {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const { loading, customers } = useSelector((state) => state.customer);
//   const { user } = useSelector((state) => state.auth);

//   console.log("🔵 ========== ADD CUSTOMER COMPONENT ==========");
//   console.log("👤 User role:", user?.role);
//   console.log("📊 Customers count:", customers?.length);

//   const [formData, setFormData] = useState({
//     salutation: "Mr.",
//     firstName: "",
//     lastName: "",
//     dateOfBirth: "",
//     phone: "", // ✅ Changed from contactNumber to phone
//     whatsappNumber: "",
//     email: "",
//     addressLine1: "",
//     addressLine2: "",
//     city: "",
//     state: "",
//     pincode: "",
//     notes: ""
//   });

//   const [errors, setErrors] = useState({});

//   // Get base path based on user role
//   const rolePath = user?.role === "ADMIN" ? "/admin" :
//                    user?.role === "STORE_KEEPER" ? "/storekeeper" :
//                    "/cuttingmaster";

//   console.log("📍 Base path:", rolePath);

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     console.log(`✏️ Field changed: ${name} =`, value);

//     // Special handling for phone numbers
//     if (name === "phone" || name === "whatsappNumber" || name === "pincode") {
//       const numericValue = value.replace(/\D/g, '');
//       const maxLength = name === "pincode" ? 6 : 10;
//       const truncated = numericValue.slice(0, maxLength);
//       setFormData(prev => ({ ...prev, [name]: truncated }));

//       // Clear error for this field
//       if (errors[name]) {
//         setErrors(prev => ({ ...prev, [name]: null }));
//       }
//     } else {
//       setFormData(prev => ({ ...prev, [name]: value }));

//       // Clear error for this field
//       if (errors[name]) {
//         setErrors(prev => ({ ...prev, [name]: null }));
//       }
//     }
//   };

//   const validateForm = () => {
//     console.log("🔍 Validating form...");
//     const newErrors = {};

//     // Validate first name
//     if (!formData.firstName.trim()) {
//       newErrors.firstName = "First name is required";
//       console.log("❌ First name missing");
//     }

//     // Validate phone number
//     if (!formData.phone) {
//       newErrors.phone = "Phone number is required";
//       console.log("❌ Phone number missing");
//     } else if (formData.phone.length !== 10) {
//       newErrors.phone = "Phone number must be 10 digits";
//       console.log("❌ Phone number invalid length:", formData.phone.length);
//     }

//     // Validate WhatsApp number
//     if (!formData.whatsappNumber) {
//       newErrors.whatsappNumber = "WhatsApp number is required";
//       console.log("❌ WhatsApp number missing");
//     } else if (formData.whatsappNumber.length !== 10) {
//       newErrors.whatsappNumber = "WhatsApp number must be 10 digits";
//       console.log("❌ WhatsApp number invalid length:", formData.whatsappNumber.length);
//     }

//     // Validate email if provided
//     if (formData.email) {
//       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//       if (!emailRegex.test(formData.email)) {
//         newErrors.email = "Enter a valid email address";
//         console.log("❌ Invalid email:", formData.email);
//       }
//     }

//     // Validate address line 1
//     if (!formData.addressLine1.trim()) {
//       newErrors.addressLine1 = "Address is required";
//       console.log("❌ Address line 1 missing");
//     }

//     // Validate pincode if provided
//     if (formData.pincode && formData.pincode.length !== 6) {
//       newErrors.pincode = "Pincode must be 6 digits";
//       console.log("❌ Invalid pincode:", formData.pincode);
//     }

//     setErrors(newErrors);
//     const isValid = Object.keys(newErrors).length === 0;
//     console.log("✅ Form valid:", isValid);
//     if (!isValid) console.log("❌ Errors:", newErrors);
//     return isValid;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     console.log("🚀 ========== FORM SUBMIT START ==========");
//     console.log("📋 Raw formData:", {
//       ...formData,
//       dateOfBirth: formData.dateOfBirth ? `"${formData.dateOfBirth}"` : "empty"
//     });

//     if (!validateForm()) {
//       console.log("❌ Form validation failed");
//       showToast.error("Please fix the errors in the form");
//       return;
//     }

//     // Process date of birth
//     let dobValue = undefined;
//     if (formData.dateOfBirth) {
//       console.log("📅 Processing date:", formData.dateOfBirth);

//       // Create date object (input is YYYY-MM-DD)
//       const dateObj = new Date(formData.dateOfBirth);
//       // Set to noon UTC to avoid timezone issues
//       dateObj.setUTCHours(12, 0, 0, 0);
//       dobValue = dateObj.toISOString();
//       console.log("📅 Final DOB value for API:", dobValue);
//     }

//     // Prepare customer data for API - ✅ Using 'phone' field to match backend
//     const customerData = {
//       salutation: formData.salutation,
//       firstName: formData.firstName.trim(),
//       lastName: formData.lastName.trim(),
//       dateOfBirth: dobValue,
//       phone: formData.phone, // ✅ Changed from contactNumber to phone
//       whatsappNumber: formData.whatsappNumber,
//       email: formData.email.trim() || undefined,
//       addressLine1: formData.addressLine1.trim(),
//       addressLine2: formData.addressLine2.trim() || undefined,
//       city: formData.city.trim() || undefined,
//       state: formData.state.trim() || undefined,
//       pincode: formData.pincode || undefined,
//       notes: formData.notes.trim() || undefined
//     };

//     console.log("📦 Final customerData being sent to API:", customerData);

//     try {
//       console.log("⏳ Dispatching createNewCustomer action...");
//       const result = await dispatch(createNewCustomer(customerData)).unwrap();
//       console.log("✅ Customer created successfully!");
//       console.log("✅ Response from server:", result);

//       showToast.success("Customer created successfully! 🎉");
//       console.log("🔄 Navigating to:", `${rolePath}/customers`);
//       navigate(`${rolePath}/customers`);
//     } catch (error) {
//       console.error("❌ Error creating customer:", error);

//       // Check for duplicate phone error message
//       const errorMsg = error.message || error.toString();
//       console.log("❌ Error message:", errorMsg);

//       if (errorMsg.includes("already exists") ||
//           errorMsg.includes("duplicate") ||
//           errorMsg.includes("phone") ||
//           errorMsg.includes("Phone number")) {

//         console.log("❌ Duplicate phone number detected");
//         showToast.error("❌ This mobile number is already registered! Please use a different number.");

//         // Highlight the phone field with error
//         setErrors(prev => ({
//           ...prev,
//           phone: "This phone number is already taken" // ✅ Changed from contactNumber to phone
//         }));
//       } else {
//         console.log("❌ Unknown error:", errorMsg);
//         showToast.error(error.message || "Failed to create customer");
//       }
//     } finally {
//       console.log("🏁 ========== FORM SUBMIT END ==========");
//     }
//   };

//   // Handle Cancel
//   const handleCancel = () => {
//     console.log("🔙 Cancel clicked - navigating to:", `${rolePath}/customers`);
//     navigate(`${rolePath}/customers`);
//   };

//   // Get full name for display
//   const getFullName = () => {
//     return `${formData.salutation} ${formData.firstName} ${formData.lastName}`.trim();
//   };

//   // Generate preview customer ID
//   const getCustomerIdPreview = () => {
//     const year = new Date().getFullYear();
//     const nextNumber = (customers?.length || 0) + 1;
//     const sequential = String(nextNumber).padStart(5, '0');
//     return `CUST-${year}-${sequential}`;
//   };

//   return (
//     <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
//       {/* Debug Panel - Only in development */}
//       {process.env.NODE_ENV === 'development' && (
//         <div className="bg-gray-900 text-green-400 p-4 rounded-2xl font-mono text-sm mb-4 overflow-auto max-h-40">
//           <div className="flex justify-between items-center mb-2">
//             <span className="font-bold">🔍 DEBUG INFO</span>
//             <button
//               onClick={() => {
//                 console.clear();
//                 console.log("🧹 Console cleared");
//               }}
//               className="text-xs bg-gray-700 px-2 py-1 rounded hover:bg-gray-600"
//             >
//               Clear Console
//             </button>
//           </div>
//           <div className="space-y-1">
//             <div>Date of Birth: {formData.dateOfBirth || '❌ Not set'}</div>
//             <div>First Name: {formData.firstName || '❌'}</div>
//             <div>Phone: {formData.phone || '❌'}</div>
//             <div>Role: {user?.role}</div>
//             <div>Base Path: {rolePath}</div>
//           </div>
//         </div>
//       )}

//       {/* Header with Breadcrumb */}
//       <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
//         <div>
//           <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
//             <span
//               onClick={handleCancel}
//               className="hover:text-blue-600 cursor-pointer transition-colors"
//             >
//               Customers
//             </span>
//             <ChevronRight size={14} />
//             <span className="text-blue-600 font-bold">Add New Customer</span>
//           </div>
//           <h1 className="text-2xl font-black text-slate-800 tracking-tight">Add Customer</h1>
//         </div>
//         <button
//           onClick={handleCancel}
//           className="p-3 hover:bg-slate-100 rounded-xl transition-all"
//           title="Close"
//         >
//           <X size={20} className="text-slate-500" />
//         </button>
//       </div>

//       {/* Live Preview - Shows how name will appear */}
//       {formData.firstName && (
//         <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
//           <User size={20} className="text-blue-600" />
//           <div>
//             <span className="text-xs text-blue-600 font-black uppercase tracking-wider">Preview</span>
//             <p className="text-lg font-black text-slate-800">{getFullName()}</p>
//           </div>
//         </div>
//       )}

//       {/* Customer ID Preview - Shows auto-generated ID */}
//       {formData.firstName && formData.phone && (
//         <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center gap-3">
//           <Hash size={20} className="text-purple-600" />
//           <div>
//             <span className="text-xs text-purple-600 font-black uppercase tracking-wider">Customer ID Preview</span>
//             <p className="text-lg font-mono font-bold text-purple-800">{getCustomerIdPreview()}</p>
//             <p className="text-xs text-purple-500 mt-1">Auto-generated on save</p>
//           </div>
//         </div>
//       )}

//       {/* Main Form */}
//       <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
//         {/* Customer Detail Section */}
//         <div className="p-8 border-b border-slate-100">
//           <h2 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
//             <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
//               <User size={18} className="text-blue-600" />
//             </div>
//             Customer Details
//           </h2>

//           <div className="space-y-6">
//             {/* Salutation Row */}
//             <div>
//               <label className="block text-xs font-black uppercase text-slate-500 mb-3 tracking-wider">
//                 Salutation <span className="text-red-500">*</span>
//               </label>
//               <div className="flex flex-wrap gap-4">
//                 {["Mr.", "Mrs.", "Ms.", "Dr."].map((sal) => (
//                   <label key={sal} className="flex items-center gap-2 cursor-pointer group">
//                     <input
//                       type="radio"
//                       name="salutation"
//                       value={sal}
//                       checked={formData.salutation === sal}
//                       onChange={handleChange}
//                       className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
//                     />
//                     <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">
//                       {sal}
//                     </span>
//                   </label>
//                 ))}
//               </div>
//             </div>

//             {/* First Name & Last Name */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-wider">
//                   First Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="firstName"
//                   value={formData.firstName}
//                   onChange={handleChange}
//                   placeholder="Enter first name"
//                   className={`w-full px-5 py-4 bg-slate-50 border ${
//                     errors.firstName ? 'border-red-300 bg-red-50' : 'border-slate-200'
//                   } rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium`}
//                 />
//                 {errors.firstName && (
//                   <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
//                     <AlertCircle size={12} /> {errors.firstName}
//                   </p>
//                 )}
//               </div>
//               <div>
//                 <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-wider">
//                   Last Name
//                 </label>
//                 <input
//                   type="text"
//                   name="lastName"
//                   value={formData.lastName}
//                   onChange={handleChange}
//                   placeholder="Enter last name"
//                   className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
//                 />
//               </div>
//             </div>

//             {/* Date of Birth */}
//             <div>
//               <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-wider">
//                 Date of Birth
//               </label>
//               <div className="relative">
//                 <Calendar className="absolute left-4 top-4 text-slate-400" size={20} />
//                 <input
//                   type="date"
//                   name="dateOfBirth"
//                   value={formData.dateOfBirth}
//                   onChange={handleChange}
//                   max={new Date().toISOString().split('T')[0]}
//                   className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
//                 />
//               </div>
//             </div>

//             {/* Phone Number (Primary) - ✅ Changed label from Contact Number to Phone */}
//             <div>
//               <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-wider">
//                 Phone Number <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <Phone className="absolute left-4 top-4 text-slate-400" size={20} />
//                 <input
//                   type="tel"
//                   name="phone" // ✅ Changed from contactNumber to phone
//                   value={formData.phone}
//                   onChange={handleChange}
//                   placeholder="Enter 10-digit mobile number"
//                   maxLength="10"
//                   className={`w-full pl-12 pr-5 py-4 bg-slate-50 border ${
//                     errors.phone ? 'border-red-300 bg-red-50' : 'border-slate-200'
//                   } rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium`}
//                 />
//               </div>
//               {errors.phone && (
//                 <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
//                   <AlertCircle size={12} /> {errors.phone}
//                 </p>
//               )}
//             </div>

//             {/* WhatsApp Number */}
//             <div>
//               <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-wider">
//                 WhatsApp Number <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <Phone className="absolute left-4 top-4 text-slate-400" size={20} />
//                 <input
//                   type="tel"
//                   name="whatsappNumber"
//                   value={formData.whatsappNumber}
//                   onChange={handleChange}
//                   placeholder="Enter WhatsApp number"
//                   maxLength="10"
//                   className={`w-full pl-12 pr-5 py-4 bg-slate-50 border ${
//                     errors.whatsappNumber ? 'border-red-300 bg-red-50' : 'border-slate-200'
//                   } rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium`}
//                 />
//               </div>
//               {errors.whatsappNumber && (
//                 <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
//                   <AlertCircle size={12} /> {errors.whatsappNumber}
//                 </p>
//               )}
//             </div>

//             {/* Email */}
//             <div>
//               <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-wider">
//                 Email Address
//               </label>
//               <div className="relative">
//                 <Mail className="absolute left-4 top-4 text-slate-400" size={20} />
//                 <input
//                   type="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   placeholder="Enter email address (optional)"
//                   className={`w-full pl-12 pr-5 py-4 bg-slate-50 border ${
//                     errors.email ? 'border-red-300 bg-red-50' : 'border-slate-200'
//                   } rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium`}
//                 />
//               </div>
//               {errors.email && (
//                 <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
//                   <AlertCircle size={12} /> {errors.email}
//                 </p>
//               )}
//             </div>

//             {/* Address Line 1 */}
//             <div>
//               <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-wider">
//                 Address Line 1 <span className="text-red-500">*</span>
//               </label>
//               <div className="relative">
//                 <Home className="absolute left-4 top-4 text-slate-400" size={20} />
//                 <input
//                   type="text"
//                   name="addressLine1"
//                   value={formData.addressLine1}
//                   onChange={handleChange}
//                   placeholder="House no., Building, Street"
//                   className={`w-full pl-12 pr-5 py-4 bg-slate-50 border ${
//                     errors.addressLine1 ? 'border-red-300 bg-red-50' : 'border-slate-200'
//                   } rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium`}
//                 />
//               </div>
//               {errors.addressLine1 && (
//                 <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
//                   <AlertCircle size={12} /> {errors.addressLine1}
//                 </p>
//               )}
//             </div>

//             {/* Address Line 2 */}
//             <div>
//               <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-wider">
//                 Address Line 2
//               </label>
//               <div className="relative">
//                 <Building className="absolute left-4 top-4 text-slate-400" size={20} />
//                 <input
//                   type="text"
//                   name="addressLine2"
//                   value={formData.addressLine2}
//                   onChange={handleChange}
//                   placeholder="Area, Locality (optional)"
//                   className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
//                 />
//               </div>
//             </div>

//             {/* City, State, Pincode */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div>
//                 <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-wider">
//                   City
//                 </label>
//                 <div className="relative">
//                   <MapPin className="absolute left-4 top-4 text-slate-400" size={18} />
//                   <input
//                     type="text"
//                     name="city"
//                     value={formData.city}
//                     onChange={handleChange}
//                     placeholder="City"
//                     className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
//                   />
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-wider">
//                   State
//                 </label>
//                 <div className="relative">
//                   <Globe className="absolute left-4 top-4 text-slate-400" size={18} />
//                   <input
//                     type="text"
//                     name="state"
//                     value={formData.state}
//                     onChange={handleChange}
//                     placeholder="State"
//                     className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium"
//                   />
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-wider">
//                   Pincode
//                 </label>
//                 <input
//                   type="text"
//                   name="pincode"
//                   value={formData.pincode}
//                   onChange={handleChange}
//                   placeholder="Pincode"
//                   maxLength="6"
//                   className={`w-full px-5 py-4 bg-slate-50 border ${
//                     errors.pincode ? 'border-red-300 bg-red-50' : 'border-slate-200'
//                   } rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium`}
//                 />
//                 {errors.pincode && (
//                   <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
//                     <AlertCircle size={12} /> {errors.pincode}
//                   </p>
//                 )}
//               </div>
//             </div>

//             {/* Additional Notes */}
//             <div>
//               <label className="block text-xs font-black uppercase text-slate-500 mb-2 tracking-wider">
//                 Additional Notes
//               </label>
//               <div className="relative">
//                 <BookOpen className="absolute left-4 top-4 text-slate-400" size={20} />
//                 <textarea
//                   name="notes"
//                   value={formData.notes}
//                   onChange={handleChange}
//                   rows="3"
//                   placeholder="Any special instructions or notes about this customer..."
//                   className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium resize-none"
//                 ></textarea>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Form Actions */}
//         <div className="p-6 bg-slate-50 flex items-center justify-end gap-4">
//           <button
//             type="button"
//             onClick={handleCancel}
//             className="px-8 py-4 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl font-black uppercase tracking-wider transition-all hover:bg-slate-50"
//             disabled={loading}
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             disabled={loading}
//             className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-black uppercase tracking-wider shadow-lg shadow-blue-500/30 transition-all transform active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
//           >
//             {loading ? (
//               <>
//                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                 Creating...
//               </>
//             ) : (
//               <>
//                 <Save size={18} />
//                 Create Customer
//               </>
//             )}
//           </button>
//         </div>
//       </form>

//       {/* Help Text */}
//       <div className="flex items-center justify-between text-xs text-slate-400 px-2">
//         <div>
//           <span className="text-red-500">*</span> Required fields
//         </div>
//         <div className="flex items-center gap-4">
//           <span className="flex items-center gap-1">
//             <Phone size={12} /> Phone numbers must be unique
//           </span>
//           <span className="flex items-center gap-1">
//             <MapPin size={12} /> Complete address helps delivery
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Home,
  ChevronRight,
  X,
  Save,
  Building,
  Globe,
  BookOpen,
  AlertCircle,
  Hash,
  Calendar,
} from "lucide-react";
import { createNewCustomer } from "../../../features/customer/customerSlice";
import showToast from "../../../utils/toast";

export default function AddCustomer() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, customers } = useSelector((state) => state.customer);
  const { user } = useSelector((state) => state.auth);

  console.log("🔵 ========== ADD CUSTOMER COMPONENT ==========");
  console.log("👤 User role:", user?.role);
  console.log("📊 Customers count:", customers?.length);

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
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Get base path based on user role
  const rolePath =
    user?.role === "ADMIN"
      ? "/admin"
      : user?.role === "STORE_KEEPER"
        ? "/storekeeper"
        : "/cuttingmaster";

  console.log("📍 Base path:", rolePath);

  const handleChange = (e) => {
    const { name, value } = e.target;

    console.log(`✏️ Field changed: ${name} =`, value);

    // Special handling for phone numbers
    if (name === "phone" || name === "whatsappNumber" || name === "pincode") {
      const numericValue = value.replace(/\D/g, "");
      const maxLength = name === "pincode" ? 6 : 10;
      const truncated = numericValue.slice(0, maxLength);
      setFormData((prev) => ({ ...prev, [name]: truncated }));

      // Clear error for this field
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: null }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));

      // Clear error for this field
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: null }));
      }
    }
  };

  const validateForm = () => {
    console.log("🔍 Validating form...");
    const newErrors = {};

    // Validate first name
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
      console.log("❌ First name missing");
    }

    // Validate phone number
    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
      console.log("❌ Phone number missing");
    } else if (formData.phone.length !== 10) {
      newErrors.phone = "Phone number must be 10 digits";
      console.log("❌ Phone number invalid length:", formData.phone.length);
    }

    // Validate WhatsApp number
    if (!formData.whatsappNumber) {
      newErrors.whatsappNumber = "WhatsApp number is required";
      console.log("❌ WhatsApp number missing");
    } else if (formData.whatsappNumber.length !== 10) {
      newErrors.whatsappNumber = "WhatsApp number must be 10 digits";
      console.log(
        "❌ WhatsApp number invalid length:",
        formData.whatsappNumber.length,
      );
    }

    // Validate email if provided
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Enter a valid email address";
        console.log("❌ Invalid email:", formData.email);
      }
    }

    // Validate address line 1
    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = "Address is required";
      console.log("❌ Address line 1 missing");
    }

    // Validate pincode if provided
    if (formData.pincode && formData.pincode.length !== 6) {
      newErrors.pincode = "Pincode must be 6 digits";
      console.log("❌ Invalid pincode:", formData.pincode);
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log("✅ Form valid:", isValid);
    if (!isValid) console.log("❌ Errors:", newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("🚀 ========== FORM SUBMIT START ==========");
    console.log("📋 Raw formData:", {
      ...formData,
      dateOfBirth: formData.dateOfBirth ? `"${formData.dateOfBirth}"` : "empty",
    });

    if (!validateForm()) {
      console.log("❌ Form validation failed");
      showToast.error("Please fix the errors in the form");
      return;
    }

    // Process date of birth
    let dobValue = undefined;
    if (formData.dateOfBirth) {
      console.log("📅 Processing date:", formData.dateOfBirth);

      // Create date object (input is YYYY-MM-DD)
      const dateObj = new Date(formData.dateOfBirth);
      // Set to noon UTC to avoid timezone issues
      dateObj.setUTCHours(12, 0, 0, 0);
      dobValue = dateObj.toISOString();
      console.log("📅 Final DOB value for API:", dobValue);
    }

    // Prepare customer data for API - Using 'phone' field to match backend
    const customerData = {
      salutation: formData.salutation,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      dateOfBirth: dobValue,
      phone: formData.phone,
      whatsappNumber: formData.whatsappNumber,
      email: formData.email.trim() || undefined,
      addressLine1: formData.addressLine1.trim(),
      addressLine2: formData.addressLine2.trim() || undefined,
      city: formData.city.trim() || undefined,
      state: formData.state.trim() || undefined,
      pincode: formData.pincode || undefined,
      notes: formData.notes.trim() || undefined,
    };

    console.log("📦 Final customerData being sent to API:", customerData);

    try {
      console.log("⏳ Dispatching createNewCustomer action...");
      const result = await dispatch(createNewCustomer(customerData)).unwrap();
      console.log("✅ Customer created successfully!");
      console.log("✅ Response from server:", result);

      // showToast.success("Customer created successfully! 🎉");
      // console.log("🔄 Navigating to:", `${rolePath}/customers`);
      // navigate(`${rolePath}/customers`);
      // Toast is handled by customerSlice.js
      console.log("🔄 Navigating to customer details:", result?._id);
      console.log("🔗 URL:", `${rolePath}/customers/${result?._id}`);
      navigate(`${rolePath}/customers/${result?._id}`);
    } catch (error) {
      console.error("❌ Error creating customer:", error);

      // Check for duplicate phone error message
      const errorMsg = error.message || error.toString();
      console.log("❌ Error message:", errorMsg);

      if (
        errorMsg.includes("already exists") ||
        errorMsg.includes("duplicate") ||
        errorMsg.includes("phone") ||
        errorMsg.includes("Phone number")
      ) {
        console.log("❌ Duplicate phone number detected");
        // Toast is already shown by the Redux thunk (customerSlice.js)
        
        // Highlight the phone field with error
        setErrors((prev) => ({
          ...prev,
          phone: "This phone number is already taken",
        }));
      } else {
        console.log("❌ Unknown error:", errorMsg);
        // Toast is already shown by the Redux thunk
      }
    } finally {
      console.log("🏁 ========== FORM SUBMIT END ==========");
    }
  };

  // Handle Cancel
  const handleCancel = () => {
    console.log("🔙 Cancel clicked - navigating to:", `${rolePath}/customers`);
    navigate(`${rolePath}/customers`);
  };

  // Get full name for display
  const getFullName = () => {
    return `${formData.salutation} ${formData.firstName} ${formData.lastName}`.trim();
  };

  // Generate preview customer ID
  const getCustomerIdPreview = () => {
    const year = new Date().getFullYear();
    const nextNumber = (customers?.length || 0) + 1;
    const sequential = String(nextNumber).padStart(5, "0");
    return `CUST-${year}-${sequential}`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={handleCancel}
            className="flex items-center gap-1 text-slate-600"
          >
            <X size={18} />
            <span className="font-bold text-sm">Cancel</span>
          </button>
          <h1 className="text-lg font-black text-slate-800">Add Customer</h1>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-slate-100 rounded-xl transition-all"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg p-4 z-40">
            <div className="space-y-2">
              <button
                onClick={() => {
                  navigate(rolePath);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-slate-100 rounded-xl font-medium"
              >
                Dashboard
              </button>
              <button
                onClick={() => {
                  navigate(`${rolePath}/customers`);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-slate-100 rounded-xl font-medium"
              >
                Customers
              </button>
              <button
                onClick={() => {
                  navigate(`${rolePath}/orders`);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-slate-100 rounded-xl font-medium"
              >
                Orders
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
        {/* Debug Panel - Only in development */}
        {/* {process.env.NODE_ENV === 'development' && (
          <div className="bg-gray-900 text-green-400 p-3 sm:p-4 rounded-xl sm:rounded-2xl font-mono text-xs sm:text-sm mb-4 overflow-auto max-h-32 sm:max-h-40">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold">🔍 DEBUG INFO</span>
              <button 
                onClick={() => {
                  console.clear();
                  console.log("🧹 Console cleared");
                }} 
                className="text-[10px] sm:text-xs bg-gray-700 px-2 py-1 rounded hover:bg-gray-600"
              >
                Clear Console
              </button>
            </div>
            <div className="space-y-1">
              <div className="truncate">Date of Birth: {formData.dateOfBirth || '❌ Not set'}</div>
              <div className="truncate">First Name: {formData.firstName || '❌'}</div>
              <div className="truncate">Phone: {formData.phone || '❌'}</div>
              <div className="truncate">Role: {user?.role}</div>
            </div>
          </div>
        )} */}

        {/* Desktop Header with Breadcrumb - Hidden on Mobile */}
        <div className="hidden lg:flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
              <span
                onClick={handleCancel}
                className="hover:text-blue-600 cursor-pointer transition-colors"
              >
                Customers
              </span>
              <ChevronRight size={14} />
              <span className="text-blue-600 font-bold">Add New Customer</span>
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Add Customer
            </h1>
          </div>
          <button
            onClick={handleCancel}
            className="p-3 hover:bg-slate-100 rounded-xl transition-all"
            title="Close"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Live Preview - Responsive */}
        {formData.firstName && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4 flex items-center gap-3 mb-4">
            <User size={18} className="text-blue-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] sm:text-xs text-blue-600 font-black uppercase tracking-wider">
                Preview
              </span>
              <p className="text-base sm:text-lg font-black text-slate-800 truncate">
                {getFullName()}
              </p>
            </div>
          </div>
        )}

        {/* Customer ID Preview - Responsive */}
        {formData.firstName && formData.phone && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 sm:p-4 flex items-center gap-3 mb-4">
            <Hash size={18} className="text-purple-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] sm:text-xs text-purple-600 font-black uppercase tracking-wider">
                Customer ID Preview
              </span>
              <p className="text-sm sm:text-base lg:text-lg font-mono font-bold text-purple-800 truncate">
                {getCustomerIdPreview()}
              </p>
              <p className="text-[8px] sm:text-xs text-purple-500 mt-1">
                Auto-generated on save
              </p>
            </div>
          </div>
        )}

        {/* Main Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
        >
          {/* Customer Detail Section */}
          <div className="p-4 sm:p-6 lg:p-8 border-b border-slate-100">
            <h2 className="text-base sm:text-lg font-black text-slate-800 mb-4 sm:mb-6 flex items-center gap-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <User size={14} className="text-blue-600" />
              </div>
              Customer Details
            </h2>

            <div className="space-y-4 sm:space-y-6">
              {/* Salutation Row - Responsive */}
              <div>
                <label className="block text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-2 sm:mb-3 tracking-wider">
                  Salutation <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  {["Mr.", "Mrs.", "Ms.", "Dr."].map((sal) => (
                    <label
                      key={sal}
                      className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group"
                    >
                      <input
                        type="radio"
                        name="salutation"
                        value={sal}
                        checked={formData.salutation === sal}
                        onChange={handleChange}
                        className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                      />
                      <span className="text-xs sm:text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">
                        {sal}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* First Name & Last Name - Responsive Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2 tracking-wider">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    className={`w-full px-3 sm:px-5 py-3 sm:py-4 bg-slate-50 border ${
                      errors.firstName
                        ? "border-red-300 bg-red-50"
                        : "border-slate-200"
                    } rounded-lg sm:rounded-xl focus:ring-2 sm:focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-sm sm:text-base`}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-[10px] sm:text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={10} /> {errors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2 tracking-wider">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    className="w-full px-3 sm:px-5 py-3 sm:py-4 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 sm:focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Date of Birth - Responsive */}
              <div>
                <label className="block text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2 tracking-wider">
                  Date of Birth
                </label>
                <div className="relative">
                  <Calendar
                    className="absolute left-3 sm:left-4 top-3 sm:top-4 text-slate-400"
                    size={16}
                  />
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full pl-9 sm:pl-12 pr-3 sm:pr-5 py-3 sm:py-4 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 sm:focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Phone Number - Responsive */}
              <div>
                <label className="block text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2 tracking-wider">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-3 sm:left-4 top-3 sm:top-4 text-slate-400"
                    size={16}
                  />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter 10-digit mobile number"
                    maxLength="10"
                    className={`w-full pl-9 sm:pl-12 pr-3 sm:pr-5 py-3 sm:py-4 bg-slate-50 border ${
                      errors.phone
                        ? "border-red-300 bg-red-50"
                        : "border-slate-200"
                    } rounded-lg sm:rounded-xl focus:ring-2 sm:focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-sm sm:text-base`}
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-[10px] sm:text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={10} /> {errors.phone}
                  </p>
                )}
              </div>

              {/* WhatsApp Number - Responsive */}
              <div>
                <label className="block text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2 tracking-wider">
                  WhatsApp Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-3 sm:left-4 top-3 sm:top-4 text-slate-400"
                    size={16}
                  />
                  <input
                    type="tel"
                    name="whatsappNumber"
                    value={formData.whatsappNumber}
                    onChange={handleChange}
                    placeholder="Enter WhatsApp number"
                    maxLength="10"
                    className={`w-full pl-9 sm:pl-12 pr-3 sm:pr-5 py-3 sm:py-4 bg-slate-50 border ${
                      errors.whatsappNumber
                        ? "border-red-300 bg-red-50"
                        : "border-slate-200"
                    } rounded-lg sm:rounded-xl focus:ring-2 sm:focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-sm sm:text-base`}
                  />
                </div>
                {errors.whatsappNumber && (
                  <p className="text-red-500 text-[10px] sm:text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={10} /> {errors.whatsappNumber}
                  </p>
                )}
              </div>

              {/* Email - Responsive */}
              <div>
                <label className="block text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2 tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 sm:left-4 top-3 sm:top-4 text-slate-400"
                    size={16}
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address (optional)"
                    className={`w-full pl-9 sm:pl-12 pr-3 sm:pr-5 py-3 sm:py-4 bg-slate-50 border ${
                      errors.email
                        ? "border-red-300 bg-red-50"
                        : "border-slate-200"
                    } rounded-lg sm:rounded-xl focus:ring-2 sm:focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-sm sm:text-base`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-[10px] sm:text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={10} /> {errors.email}
                  </p>
                )}
              </div>

              {/* Address Line 1 - Responsive */}
              <div>
                <label className="block text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2 tracking-wider">
                  Address Line 1 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Home
                    className="absolute left-3 sm:left-4 top-3 sm:top-4 text-slate-400"
                    size={16}
                  />
                  <input
                    type="text"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    placeholder="House no., Building, Street"
                    className={`w-full pl-9 sm:pl-12 pr-3 sm:pr-5 py-3 sm:py-4 bg-slate-50 border ${
                      errors.addressLine1
                        ? "border-red-300 bg-red-50"
                        : "border-slate-200"
                    } rounded-lg sm:rounded-xl focus:ring-2 sm:focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-sm sm:text-base`}
                  />
                </div>
                {errors.addressLine1 && (
                  <p className="text-red-500 text-[10px] sm:text-xs mt-1 flex items-center gap-1">
                    <AlertCircle size={10} /> {errors.addressLine1}
                  </p>
                )}
              </div>

              {/* Address Line 2 - Responsive */}
              <div>
                <label className="block text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2 tracking-wider">
                  Address Line 2
                </label>
                <div className="relative">
                  <Building
                    className="absolute left-3 sm:left-4 top-3 sm:top-4 text-slate-400"
                    size={16}
                  />
                  <input
                    type="text"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleChange}
                    placeholder="Area, Locality (optional)"
                    className="w-full pl-9 sm:pl-12 pr-3 sm:pr-5 py-3 sm:py-4 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 sm:focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* City, State, Pincode - Responsive Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <label className="block text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2 tracking-wider">
                    City
                  </label>
                  <div className="relative">
                    <MapPin
                      className="absolute left-3 top-3 sm:left-4 sm:top-4 text-slate-400"
                      size={14}
                    />
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="City"
                      className="w-full pl-8 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 sm:focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-sm sm:text-base"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2 tracking-wider">
                    State
                  </label>
                  <div className="relative">
                    <Globe
                      className="absolute left-3 top-3 sm:left-4 sm:top-4 text-slate-400"
                      size={14}
                    />
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="State"
                      className="w-full pl-8 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 sm:focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-sm sm:text-base"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2 tracking-wider">
                    Pincode
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="Pincode"
                    maxLength="6"
                    className={`w-full px-3 sm:px-5 py-3 sm:py-4 bg-slate-50 border ${
                      errors.pincode
                        ? "border-red-300 bg-red-50"
                        : "border-slate-200"
                    } rounded-lg sm:rounded-xl focus:ring-2 sm:focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-sm sm:text-base`}
                  />
                  {errors.pincode && (
                    <p className="text-red-500 text-[10px] sm:text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={10} /> {errors.pincode}
                    </p>
                  )}
                </div>
              </div>

              {/* Additional Notes - Responsive */}
              <div>
                <label className="block text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2 tracking-wider">
                  Additional Notes
                </label>
                <div className="relative">
                  <BookOpen
                    className="absolute left-3 sm:left-4 top-3 sm:top-4 text-slate-400"
                    size={16}
                  />
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Any special instructions or notes about this customer..."
                    className="w-full pl-9 sm:pl-12 pr-3 sm:pr-5 py-3 sm:py-4 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 sm:focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-sm sm:text-base resize-none"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions - Responsive */}
          <div className="p-4 sm:p-6 bg-slate-50 flex flex-col sm:flex-row items-center justify-end gap-3 sm:gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl font-black uppercase tracking-wider transition-all hover:bg-slate-50 text-sm sm:text-base"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-black uppercase tracking-wider shadow-lg shadow-blue-500/30 transition-all transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs sm:text-sm">Creating...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Create Customer</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Help Text - Responsive */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-[10px] sm:text-xs text-slate-400 px-2 mt-4 gap-2">
          <div>
            <span className="text-red-500">*</span> Required fields
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <span className="flex items-center gap-1">
              <Phone size={10} /> Phone numbers must be unique
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={10} /> Complete address helps delivery
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
