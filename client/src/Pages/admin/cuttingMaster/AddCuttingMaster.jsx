// // src/Pages/admin/cuttingMaster/AddCuttingMaster.jsx
// import React, { useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { useDispatch } from "react-redux";
// import {
//   ArrowLeft,
//   Save,
//   User,
//   Phone,
//   Mail,
//   Lock,
//   MapPin,
//   Briefcase,
//   Scissors,
//   X,
// } from "lucide-react";
// import { createCuttingMaster } from "../../../features/cuttingMaster/cuttingMasterSlice";
// import showToast from "../../../utils/toast";

// export default function AddCuttingMaster() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const dispatch = useDispatch();

//   // Pre-fill data if coming from AddStaff page
//   const prefillData = location.state || {};

//   const [formData, setFormData] = useState({
//     name: prefillData.name || "",
//     phone: prefillData.phone || "",
//     email: prefillData.email || "",
//     password: "",
//     address: {
//       street: "",
//       city: "",
//       state: "",
//       pincode: ""
//     },
//     specialization: [],
//     experience: "",
//   });

//   const [specializationInput, setSpecializationInput] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [errors, setErrors] = useState({});

//   const handleBack = () => {
//     navigate("/admin/cutting-masters");
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
    
//     if (name.includes('.')) {
//       const [parent, child] = name.split('.');
//       setFormData(prev => ({
//         ...prev,
//         [parent]: {
//           ...prev[parent],
//           [child]: value
//         }
//       }));
//     } else {
//       setFormData(prev => ({ ...prev, [name]: value }));
//     }

//     // Clear error for this field
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: null }));
//     }
//   };

//   const handleAddSpecialization = () => {
//     if (specializationInput.trim() && !formData.specialization.includes(specializationInput.trim())) {
//       setFormData(prev => ({
//         ...prev,
//         specialization: [...prev.specialization, specializationInput.trim()]
//       }));
//       setSpecializationInput("");
//     }
//   };

//   const handleRemoveSpecialization = (spec) => {
//     setFormData(prev => ({
//       ...prev,
//       specialization: prev.specialization.filter(s => s !== spec)
//     }));
//   };

//   const validateForm = () => {
//     const newErrors = {};

//     if (!formData.name.trim()) {
//       newErrors.name = "Name is required";
//     }

//     if (!formData.phone.trim()) {
//       newErrors.phone = "Phone number is required";
//     } else if (formData.phone.length !== 10) {
//       newErrors.phone = "Phone number must be 10 digits";
//     }

//     if (!formData.email.trim()) {
//       newErrors.email = "Email is required";
//     } else {
//       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//       if (!emailRegex.test(formData.email)) {
//         newErrors.email = "Enter a valid email address";
//       }
//     }

//     if (!formData.password) {
//       newErrors.password = "Password is required";
//     } else if (formData.password.length < 6) {
//       newErrors.password = "Password must be at least 6 characters";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!validateForm()) {
//       showToast.error("Please fix the errors in the form");
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       await dispatch(createCuttingMaster(formData)).unwrap();
//       showToast.success("Cutting Master created successfully! 🎉");
      
//       // If came from Staff page, go back to staff list
//       if (prefillData.fromStaff) {
//         navigate("/admin/staff");
//       } else {
//         navigate("/admin/cutting-masters");
//       }
//     } catch (error) {
//       const errorMsg = error || "Failed to create cutting master";
//       showToast.error(errorMsg);
      
//       if (errorMsg.includes("email")) {
//         setErrors(prev => ({ ...prev, email: "Email already exists" }));
//       }
//       if (errorMsg.includes("phone")) {
//         setErrors(prev => ({ ...prev, phone: "Phone already exists" }));
//       }
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 p-6">
//       {/* Header */}
//       <div className="flex items-center gap-4">
//         <button
//           onClick={handleBack}
//           className="p-2 hover:bg-slate-100 rounded-xl transition-all"
//         >
//           <ArrowLeft size={20} className="text-slate-600" />
//         </button>
//         <div>
//           <h1 className="text-3xl font-black text-slate-800 tracking-tight">Add Cutting Master</h1>
//           <p className="text-slate-500">Create a new cutting master profile</p>
//         </div>
//       </div>

//       {/* Pre-filled Notice */}
//       {prefillData.fromStaff && (
//         <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
//           <p className="text-sm text-orange-700">
//             <span className="font-bold">Note:</span> Pre-filled from Staff page. Complete the remaining details.
//           </p>
//         </div>
//       )}

//       {/* Form */}
//       <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
//         <div className="space-y-6">
//           {/* Basic Information */}
//           <div>
//             <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
//               <User size={20} className="text-orange-600" />
//               Basic Information
//             </h2>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {/* Name */}
//               <div className="md:col-span-2">
//                 <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//                   Full Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleChange}
//                   placeholder="Enter full name"
//                   className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all ${
//                     errors.name ? 'border-red-300 bg-red-50' : 'border-slate-200'
//                   }`}
//                 />
//                 {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
//               </div>

//               {/* Phone */}
//               <div>
//                 <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//                   Phone <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <Phone className="absolute left-4 top-3.5 text-slate-400" size={18} />
//                   <input
//                     type="tel"
//                     name="phone"
//                     value={formData.phone}
//                     onChange={(e) => {
//                       const value = e.target.value.replace(/\D/g, '').slice(0, 10);
//                       setFormData(prev => ({ ...prev, phone: value }));
//                     }}
//                     placeholder="9876543210"
//                     className={`w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all ${
//                       errors.phone ? 'border-red-300 bg-red-50' : 'border-slate-200'
//                     }`}
//                   />
//                 </div>
//                 {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
//               </div>

//               {/* Email */}
//               <div>
//                 <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//                   Email <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
//                   <input
//                     type="email"
//                     name="email"
//                     value={formData.email}
//                     onChange={handleChange}
//                     placeholder="cutting@example.com"
//                     className={`w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all ${
//                       errors.email ? 'border-red-300 bg-red-50' : 'border-slate-200'
//                     }`}
//                   />
//                 </div>
//                 {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
//               </div>

//               {/* Password */}
//               <div>
//                 <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//                   Password <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
//                   <input
//                     type="password"
//                     name="password"
//                     value={formData.password}
//                     onChange={handleChange}
//                     placeholder="Min 6 characters"
//                     className={`w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all ${
//                       errors.password ? 'border-red-300 bg-red-50' : 'border-slate-200'
//                     }`}
//                   />
//                 </div>
//                 {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
//               </div>

//               {/* Experience */}
//               <div>
//                 <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//                   Experience (Years)
//                 </label>
//                 <div className="relative">
//                   <Briefcase className="absolute left-4 top-3.5 text-slate-400" size={18} />
//                   <input
//                     type="number"
//                     name="experience"
//                     value={formData.experience}
//                     onChange={handleChange}
//                     min="0"
//                     max="50"
//                     placeholder="5"
//                     className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
//                   />
//                 </div>
//               </div>

//               {/* Specialization */}
//               <div className="md:col-span-2">
//                 <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//                   Specialization
//                 </label>
//                 <div className="flex gap-2 mb-2">
//                   <input
//                     type="text"
//                     value={specializationInput}
//                     onChange={(e) => setSpecializationInput(e.target.value)}
//                     onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSpecialization())}
//                     placeholder="e.g., Shirts, Pants, Suits"
//                     className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
//                   />
//                   <button
//                     type="button"
//                     onClick={handleAddSpecialization}
//                     className="px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 transition-all"
//                   >
//                     Add
//                   </button>
//                 </div>
//                 <div className="flex flex-wrap gap-2">
//                   {formData.specialization.map((spec, index) => (
//                     <span
//                       key={index}
//                       className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium flex items-center gap-1"
//                     >
//                       {spec}
//                       <button
//                         type="button"
//                         onClick={() => handleRemoveSpecialization(spec)}
//                         className="hover:text-red-600"
//                       >
//                         <X size={14} />
//                       </button>
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Address Information */}
//           <div>
//             <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
//               <MapPin size={20} className="text-orange-600" />
//               Address Information
//             </h2>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="md:col-span-2">
//                 <input
//                   type="text"
//                   name="address.street"
//                   value={formData.address.street}
//                   onChange={handleChange}
//                   placeholder="Street address"
//                   className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
//                 />
//               </div>
//               <input
//                 type="text"
//                 name="address.city"
//                 value={formData.address.city}
//                 onChange={handleChange}
//                 placeholder="City"
//                 className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
//               />
//               <input
//                 type="text"
//                 name="address.state"
//                 value={formData.address.state}
//                 onChange={handleChange}
//                 placeholder="State"
//                 className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
//               />
//               <input
//                 type="text"
//                 name="address.pincode"
//                 value={formData.address.pincode}
//                 onChange={handleChange}
//                 maxLength="6"
//                 placeholder="Pincode"
//                 className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
//               />
//             </div>
//           </div>

//           {/* Form Actions */}
//           <div className="flex gap-4 pt-4">
//             <button
//               type="submit"
//               disabled={isSubmitting}
//               className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-xl font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50"
//             >
//               {isSubmitting ? (
//                 <>
//                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                   Creating...
//                 </>
//               ) : (
//                 <>
//                   <Save size={18} />
//                   Create Cutting Master
//                 </>
//               )}
//             </button>
//             <button
//               type="button"
//               onClick={handleBack}
//               className="px-6 py-4 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-black uppercase tracking-wider transition-all"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       </form>
//     </div>
//   );
// }
































// src/Pages/admin/cuttingMaster/AddCuttingMaster.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  ArrowLeft,
  Save,
  User,
  Phone,
  Mail,
  Lock,
  MapPin,
  Briefcase,
  Scissors,
  X,
  Plus,
  Menu
} from "lucide-react";
import { createCuttingMaster } from "../../../features/cuttingMaster/cuttingMasterSlice";
import showToast from "../../../utils/toast";

export default function AddCuttingMaster() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Pre-fill data if coming from AddStaff page
  const prefillData = location.state || {};

  const [formData, setFormData] = useState({
    name: prefillData.name || "",
    phone: prefillData.phone || "",
    email: prefillData.email || "",
    password: "",
    address: {
      street: "",
      city: "",
      state: "",
      pincode: ""
    },
    specialization: [],
    experience: "",
    basicSalary: 0,
  });

  const [specializationInput, setSpecializationInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleBack = () => {
    navigate("/admin/cutting-masters");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleAddSpecialization = () => {
    if (specializationInput.trim() && !formData.specialization.includes(specializationInput.trim())) {
      setFormData(prev => ({
        ...prev,
        specialization: [...prev.specialization, specializationInput.trim()]
      }));
      setSpecializationInput("");
    }
  };

  const handleRemoveSpecialization = (spec) => {
    setFormData(prev => ({
      ...prev,
      specialization: prev.specialization.filter(s => s !== spec)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (formData.phone.length !== 10) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Enter a valid email address";
      }
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    try {
      await dispatch(createCuttingMaster(formData)).unwrap();
      showToast.success("Cutting Master created successfully! 🎉");
      
      // If came from Staff page, go back to staff list
      if (prefillData.fromStaff) {
        navigate("/admin/staff");
      } else {
        navigate("/admin/cutting-masters");
      }
    } catch (error) {
      const errorMsg = error || "Failed to create cutting master";
      showToast.error(errorMsg);
      
      if (errorMsg.includes("email")) {
        setErrors(prev => ({ ...prev, email: "Email already exists" }));
      }
      if (errorMsg.includes("phone")) {
        setErrors(prev => ({ ...prev, phone: "Phone already exists" }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
            Add Cutting Master
          </h1>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-slate-100 rounded-xl transition-all"
          >
            <Menu size={18} />
          </button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg p-4 z-40">
            <div className="space-y-2">
              <button
                onClick={() => {
                  navigate("/admin/dashboard");
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-slate-100 rounded-xl font-medium"
              >
                Dashboard
              </button>
              <button
                onClick={() => {
                  navigate("/admin/cutting-masters");
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-slate-100 rounded-xl font-medium"
              >
                Cutting Masters List
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
        {/* Desktop Header - Hidden on Mobile */}
        <div className="hidden lg:flex items-center gap-4 mb-6">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-slate-100 rounded-xl transition-all"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">Add Cutting Master</h1>
            <p className="text-sm lg:text-base text-slate-500">Create a new cutting master profile</p>
          </div>
        </div>

        {/* Pre-filled Notice - Mobile Responsive */}
        {prefillData.fromStaff && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
            <p className="text-xs sm:text-sm text-orange-700">
              <span className="font-bold">Note:</span> Pre-filled from Staff page. Complete the remaining details.
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6 lg:p-8">
          <div className="space-y-4 sm:space-y-5 lg:space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
                <User size={16} className="text-orange-600 sm:w-5 sm:h-5" />
                Basic Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Name */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm sm:text-base ${
                      errors.name ? 'border-red-300 bg-red-50' : 'border-slate-200'
                    }`}
                  />
                  {errors.name && <p className="text-red-500 text-[10px] sm:text-xs mt-1">{errors.name}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 sm:left-4 sm:top-3.5 text-slate-400" size={14} />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setFormData(prev => ({ ...prev, phone: value }));
                      }}
                      placeholder="9876543210"
                      className={`w-full pl-8 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-slate-50 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm sm:text-base ${
                        errors.phone ? 'border-red-300 bg-red-50' : 'border-slate-200'
                      }`}
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-[10px] sm:text-xs mt-1">{errors.phone}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 sm:left-4 sm:top-3.5 text-slate-400" size={14} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="cutting@example.com"
                      className={`w-full pl-8 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-slate-50 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm sm:text-base ${
                        errors.email ? 'border-red-300 bg-red-50' : 'border-slate-200'
                      }`}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-[10px] sm:text-xs mt-1">{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 sm:left-4 sm:top-3.5 text-slate-400" size={14} />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min 6 characters"
                      className={`w-full pl-8 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-slate-50 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm sm:text-base ${
                        errors.password ? 'border-red-300 bg-red-50' : 'border-slate-200'
                      }`}
                    />
                  </div>
                  {errors.password && <p className="text-red-500 text-[10px] sm:text-xs mt-1">{errors.password}</p>}
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2">
                    Experience (Years)
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-2.5 sm:left-4 sm:top-3.5 text-slate-400" size={14} />
                    <input
                      type="number"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      min="0"
                      max="50"
                      placeholder="5"
                      className="w-full pl-8 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm sm:text-base"
                    />
                  </div>
                </div>

                {/* Basic Salary */}
                <div>
                  <label className="block text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2">
                    Basic Salary (Monthly)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 sm:left-4 sm:top-3.5 text-slate-400 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      name="basicSalary"
                      value={formData.basicSalary}
                      onChange={handleChange}
                      min="0"
                      placeholder="35000"
                      className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm sm:text-base font-bold"
                    />
                  </div>
                </div>

                {/* Specialization */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2">
                    Specialization
                  </label>
                  
                  {/* Input and Add Button - Perfectly Centered */}
                  <div className="flex flex-col sm:flex-row gap-2 mb-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={specializationInput}
                        onChange={(e) => setSpecializationInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSpecialization())}
                        placeholder="e.g., Shirts, Pants, Suits"
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm sm:text-base"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddSpecialization}
                      className="w-full sm:w-24 lg:w-28 px-4 py-2.5 sm:py-3 bg-orange-600 text-white rounded-lg sm:rounded-xl font-bold hover:bg-orange-700 transition-all text-sm flex items-center justify-center gap-2"
                    >
                      <Plus size={16} />
                      <span>Add</span>
                    </button>
                  </div>

                  {/* Specialization Tags - Perfectly Aligned */}
                  {formData.specialization.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 p-3 bg-slate-50 rounded-lg sm:rounded-xl border border-slate-200">
                      {formData.specialization.map((spec, index) => (
                        <div
                          key={index}
                          className="inline-flex items-center bg-orange-100 text-orange-700 rounded-full pl-2.5 sm:pl-3 pr-1.5 sm:pr-2 py-1 text-[10px] sm:text-sm font-medium hover:bg-orange-200 transition-all"
                        >
                          <span className="leading-none">{spec}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSpecialization(spec)}
                            className="ml-1 p-0.5 rounded-full hover:bg-red-100 hover:text-red-600 transition-all flex items-center justify-center"
                            aria-label={`Remove ${spec}`}
                          >
                            <X size={10} className="sm:w-3 sm:h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-3 sm:p-4 bg-slate-50 rounded-lg sm:rounded-xl border border-slate-200">
                      <Scissors size={18} className="mx-auto text-slate-400 mb-1 sm:mb-2" />
                      <p className="text-[10px] sm:text-xs text-slate-500">No specializations added yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
                <MapPin size={16} className="text-orange-600 sm:w-5 sm:h-5" />
                Address Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Street - Full Width */}
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    placeholder="Street address"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm sm:text-base"
                  />
                </div>

                {/* City */}
                <div>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    placeholder="City"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm sm:text-base"
                  />
                </div>

                {/* State */}
                <div>
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    placeholder="State"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm sm:text-base"
                  />
                </div>

                {/* Pincode */}
                <div>
                  <input
                    type="text"
                    name="address.pincode"
                    value={formData.address.pincode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setFormData(prev => ({
                        ...prev,
                        address: { ...prev.address, pincode: value }
                      }));
                    }}
                    maxLength="6"
                    placeholder="Pincode"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions - Responsive */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-3 sm:py-4 rounded-lg sm:rounded-xl font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} className="sm:w-[18px] sm:h-[18px]" />
                    <span>Create Cutting Master</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleBack}
                className="w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-4 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg sm:rounded-xl font-black uppercase tracking-wider transition-all text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>

            {/* Mobile Required Fields Note */}
            <div className="sm:hidden text-[10px] text-slate-400 text-center pt-2">
              <span className="text-red-500">*</span> Required fields
            </div>
          </div>
        </form>

        {/* Desktop Required Fields Note */}
        <div className="hidden sm:block text-xs text-slate-400 mt-4 px-2">
          <span className="text-red-500">*</span> Required fields
        </div>
      </div>
    </div>
  );
}