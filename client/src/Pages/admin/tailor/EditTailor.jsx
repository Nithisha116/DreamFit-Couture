// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   ArrowLeft,
//   Save,
//   User,
//   Phone,
//   Mail,
//   MapPin,
//   Briefcase,
//   Scissors,
//   X,
// } from "lucide-react";
// import { fetchTailorById, updateTailor } from "../../../features/tailor/tailorSlice";
// import showToast from "../../../utils/toast";

// export default function EditTailor() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
  
//   const { currentTailor, loading } = useSelector((state) => state.tailor);
//   const { user } = useSelector((state) => state.auth);

//   // ✅ Get base path based on user role
//   const basePath = user?.role === "ADMIN" ? "/admin" : 
//                    user?.role === "STORE_KEEPER" ? "/storekeeper" : 
//                    "/cuttingmaster";

//   const [formData, setFormData] = useState({
//     name: "",
//     phone: "",
//     email: "",
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

//   const isAdmin = user?.role === "ADMIN";
//   const isStoreKeeper = user?.role === "STORE_KEEPER";
//   const isTailorSelf = user?.tailorId === id;
  
//   const canEditAll = isAdmin || isStoreKeeper;
//   const canEditBasic = isTailorSelf;

//   useEffect(() => {
//     if (id) {
//       dispatch(fetchTailorById(id));
//     }
//   }, [dispatch, id]);

//   useEffect(() => {
//     if (currentTailor) {
//       setFormData({
//         name: currentTailor.name || "",
//         phone: currentTailor.phone || "",
//         email: currentTailor.email || "",
//         address: {
//           street: currentTailor.address?.street || "",
//           city: currentTailor.address?.city || "",
//           state: currentTailor.address?.state || "",
//           pincode: currentTailor.address?.pincode || ""
//         },
//         specialization: currentTailor.specialization || [],
//         experience: currentTailor.experience || "",
//       });
//     }
//   }, [currentTailor]);

//   // ✅ Handle Back - with basePath
//   const handleBack = () => {
//     navigate(`${basePath}/tailors/${id}`);
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

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Validation
//     if (!formData.name) {
//       showToast.error("Please enter tailor name");
//       return;
//     }

//     if (!formData.phone) {
//       showToast.error("Please enter phone number");
//       return;
//     }

//     if (formData.phone.length !== 10) {
//       showToast.error("Phone number must be 10 digits");
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       await dispatch(updateTailor({ id, tailorData: formData })).unwrap();
//       showToast.success("Tailor updated successfully! 🎉");
//       // ✅ Navigate with basePath
//       navigate(`${basePath}/tailors/${id}`);
//     } catch (error) {
//       showToast.error(error || "Failed to update tailor");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-[400px]">
//         <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
//       </div>
//     );
//   }

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
//           <h1 className="text-3xl font-black text-slate-800 tracking-tight">Edit Tailor</h1>
//           <p className="text-slate-500">Update tailor information</p>
//         </div>
//       </div>

//       {/* Form */}
//       <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
//         <div className="space-y-6">
//           {/* Basic Information */}
//           <div>
//             <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
//               <User size={20} className="text-blue-600" />
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
//                   disabled={!canEditAll && !canEditBasic}
//                   className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-500"
//                   required
//                 />
//               </div>

//               {/* Phone */}
//               <div>
//                 <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//                   Phone Number <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <Phone className="absolute left-4 top-3.5 text-slate-400" size={18} />
//                   <input
//                     type="tel"
//                     name="phone"
//                     value={formData.phone}
//                     onChange={handleChange}
//                     maxLength="10"
//                     disabled={!canEditAll && !canEditBasic}
//                     className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-500"
//                     required
//                   />
//                 </div>
//               </div>

//               {/* Email */}
//               <div>
//                 <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//                   Email Address
//                 </label>
//                 <div className="relative">
//                   <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
//                   <input
//                     type="email"
//                     name="email"
//                     value={formData.email}
//                     onChange={handleChange}
//                     disabled={!canEditAll}
//                     className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-500"
//                   />
//                 </div>
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
//                     disabled={!canEditAll}
//                     className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-500"
//                   />
//                 </div>
//               </div>

//               {/* Specialization - Only Admin/Store Keeper can edit */}
//               {canEditAll && (
//                 <div className="md:col-span-2">
//                   <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//                     Specialization
//                   </label>
//                   <div className="flex gap-2 mb-2">
//                     <input
//                       type="text"
//                       value={specializationInput}
//                       onChange={(e) => setSpecializationInput(e.target.value)}
//                       onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSpecialization())}
//                       placeholder="e.g., Shirts, Pants, Suits"
//                       className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
//                     />
//                     <button
//                       type="button"
//                       onClick={handleAddSpecialization}
//                       className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
//                     >
//                       Add
//                     </button>
//                   </div>
//                   <div className="flex flex-wrap gap-2">
//                     {formData.specialization.map((spec, index) => (
//                       <span
//                         key={index}
//                         className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-1"
//                       >
//                         {spec}
//                         <button
//                           type="button"
//                           onClick={() => handleRemoveSpecialization(spec)}
//                           className="hover:text-red-600"
//                         >
//                           <X size={14} />
//                         </button>
//                       </span>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Address Information - Only Admin/Store Keeper can edit */}
//           {canEditAll && (
//             <div>
//               <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
//                 <MapPin size={20} className="text-blue-600" />
//                 Address Information
//               </h2>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {/* Street */}
//                 <div className="md:col-span-2">
//                   <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//                     Street Address
//                   </label>
//                   <input
//                     type="text"
//                     name="address.street"
//                     value={formData.address.street}
//                     onChange={handleChange}
//                     placeholder="Street name, building, area"
//                     className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
//                   />
//                 </div>

//                 {/* City */}
//                 <div>
//                   <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//                     City
//                   </label>
//                   <input
//                     type="text"
//                     name="address.city"
//                     value={formData.address.city}
//                     onChange={handleChange}
//                     placeholder="Chennai"
//                     className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
//                   />
//                 </div>

//                 {/* State */}
//                 <div>
//                   <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//                     State
//                   </label>
//                   <input
//                     type="text"
//                     name="address.state"
//                     value={formData.address.state}
//                     onChange={handleChange}
//                     placeholder="Tamil Nadu"
//                     className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
//                   />
//                 </div>

//                 {/* Pincode */}
//                 <div>
//                   <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//                     Pincode
//                   </label>
//                   <input
//                     type="text"
//                     name="address.pincode"
//                     value={formData.address.pincode}
//                     onChange={handleChange}
//                     maxLength="6"
//                     placeholder="600001"
//                     className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
//                   />
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Form Actions */}
//           <div className="flex gap-4 pt-4">
//             <button
//               type="submit"
//               disabled={isSubmitting}
//               className={`flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
//                 isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
//               }`}
//             >
//               {isSubmitting ? (
//                 <>
//                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                   Updating...
//                 </>
//               ) : (
//                 <>
//                   <Save size={18} />
//                   Update Tailor
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










import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Save,
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Scissors,
  X,
  Menu,
  Lock,
  Plus
} from "lucide-react";
import { fetchTailorById, updateTailor } from "../../../features/tailor/tailorSlice";
import showToast from "../../../utils/toast";

export default function EditTailor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentTailor, loading } = useSelector((state) => state.tailor);
  const { user } = useSelector((state) => state.auth);

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Get base path based on user role
  const basePath = user?.role === "ADMIN" ? "/admin" : 
                   user?.role === "STORE_KEEPER" ? "/storekeeper" : 
                   "/cuttingmaster";

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
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

  const isAdmin = user?.role === "ADMIN";
  const isStoreKeeper = user?.role === "STORE_KEEPER";
  const isTailorSelf = user?.tailorId === id;
  
  const canEditAll = isAdmin || isStoreKeeper;
  const canEditBasic = isTailorSelf;

  useEffect(() => {
    if (id) {
      dispatch(fetchTailorById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentTailor) {
      setFormData({
        name: currentTailor.name || "",
        phone: currentTailor.phone || "",
        email: currentTailor.email || "",
        address: {
          street: currentTailor.address?.street || "",
          city: currentTailor.address?.city || "",
          state: currentTailor.address?.state || "",
          pincode: currentTailor.address?.pincode || ""
        },
        specialization: currentTailor.specialization || [],
        experience: currentTailor.experience || "",
        basicSalary: currentTailor.basicSalary || 0,
      });
    }
  }, [currentTailor]);

  // Handle Back - with basePath
  const handleBack = () => {
    navigate(`${basePath}/tailors/${id}`);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name) {
      showToast.error("Please enter tailor name");
      return;
    }

    if (!formData.phone) {
      showToast.error("Please enter phone number");
      return;
    }

    if (formData.phone.length !== 10) {
      showToast.error("Phone number must be 10 digits");
      return;
    }

    setIsSubmitting(true);

    try {
      await dispatch(updateTailor({ id, tailorData: formData })).unwrap();
      showToast.success("Tailor updated successfully! 🎉");
      // Navigate with basePath
      navigate(`${basePath}/tailors/${id}`);
    } catch (error) {
      showToast.error(error || "Failed to update tailor");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm sm:text-base text-slate-600">Loading tailor details...</p>
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
            Edit Tailor
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
                  navigate(basePath);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-slate-100 rounded-xl font-medium"
              >
                Dashboard
              </button>
              <button
                onClick={() => {
                  navigate(`${basePath}/tailors`);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-slate-100 rounded-xl font-medium"
              >
                Tailors List
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
            <h1 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">Edit Tailor</h1>
            <p className="text-sm lg:text-base text-slate-500">Update tailor information</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6 lg:p-8">
          <div className="space-y-4 sm:space-y-5 lg:space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
                <User size={16} className="text-blue-600 sm:w-5 sm:h-5" />
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
                    disabled={!canEditAll && !canEditBasic}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-500 text-sm sm:text-base"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 sm:left-4 sm:top-3.5 text-slate-400" size={14} />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      maxLength="10"
                      disabled={!canEditAll && !canEditBasic}
                      className="w-full pl-8 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-500 text-sm sm:text-base"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 sm:left-4 sm:top-3.5 text-slate-400" size={14} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!canEditAll}
                      className="w-full pl-8 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-500 text-sm sm:text-base"
                    />
                  </div>
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
                      disabled={!canEditAll}
                      className="w-full pl-8 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-500 text-sm sm:text-base"
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
                      disabled={!canEditAll}
                      className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-500 text-sm sm:text-base font-bold"
                    />
                  </div>
                </div>

                {/* Specialization - Only Admin/Store Keeper can edit */}
                {canEditAll && (
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2">
                      Specialization
                    </label>
                    
                    {/* Input and Add Button */}
                    <div className="flex flex-col sm:flex-row gap-2 mb-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={specializationInput}
                          onChange={(e) => setSpecializationInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSpecialization())}
                          placeholder="e.g., Shirts, Pants, Suits"
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm sm:text-base"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddSpecialization}
                        className="w-full sm:w-24 lg:w-28 px-4 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg sm:rounded-xl font-bold hover:bg-blue-700 transition-all text-sm flex items-center justify-center gap-2"
                      >
                        <Plus size={16} />
                        <span>Add</span>
                      </button>
                    </div>

                    {/* Specialization Tags - PERFECTLY ALIGNED */}
                    {formData.specialization.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 p-3 bg-slate-50 rounded-lg sm:rounded-xl border border-slate-200">
                        {formData.specialization.map((spec, index) => (
                          <div
                            key={index}
                            className="inline-flex items-center bg-blue-100 text-blue-700 rounded-full pl-2.5 sm:pl-3 pr-1.5 sm:pr-2 py-1 text-[10px] sm:text-sm font-medium hover:bg-blue-200 transition-all"
                          >
                            <span className="leading-none">{spec}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSpecialization(spec)}
                              className="ml-1 p-0.5 rounded-full hover:bg-red-100 hover:text-red-600 transition-all flex items-center justify-center"
                              aria-label={`Remove ${spec}`}
                            >
                              <X size={12} className="sm:w-3.5 sm:h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-4 sm:p-5 bg-slate-50 rounded-lg sm:rounded-xl border border-slate-200">
                        <Scissors size={20} className="mx-auto text-slate-400 mb-2" />
                        <p className="text-xs sm:text-sm text-slate-500">No specializations added yet</p>
                        <p className="text-[10px] sm:text-xs text-slate-400 mt-1">Add specializations using the input above</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Address Information - Only Admin/Store Keeper can edit */}
            {canEditAll && (
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-800 mb-3 sm:mb-4 flex items-center gap-2">
                  <MapPin size={16} className="text-blue-600 sm:w-5 sm:h-5" />
                  Address Information
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* Street */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleChange}
                      placeholder="Street name, building, area"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm sm:text-base"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                      placeholder="Chennai"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm sm:text-base"
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="address.state"
                      value={formData.address.state}
                      onChange={handleChange}
                      placeholder="Tamil Nadu"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm sm:text-base"
                    />
                  </div>

                  {/* Pincode */}
                  <div>
                    <label className="block text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2">
                      Pincode
                    </label>
                    <input
                      type="text"
                      name="address.pincode"
                      value={formData.address.pincode}
                      onChange={handleChange}
                      maxLength="6"
                      placeholder="600001"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm sm:text-base"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Permission Info - Show who can edit what */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <h3 className="font-bold text-blue-800 text-xs sm:text-sm mb-2">Edit Permissions:</h3>
              <ul className="list-disc list-inside text-[10px] sm:text-xs text-blue-700 space-y-1">
                {canEditAll && (
                  <li>You can edit all fields (Admin/Store Keeper)</li>
                )}
                {!canEditAll && canEditBasic && (
                  <li>You can edit basic information (Name, Phone)</li>
                )}
                {!canEditAll && !canEditBasic && (
                  <li>You don't have permission to edit this tailor</li>
                )}
              </ul>
            </div>

            {/* Form Actions - Responsive */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting || (!canEditAll && !canEditBasic)}
                className={`flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 sm:py-4 rounded-lg sm:rounded-xl font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${
                  isSubmitting || (!canEditAll && !canEditBasic) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} className="sm:w-[18px] sm:h-[18px]" />
                    <span>Update Tailor</span>
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

            {/* Mobile Info Text */}
            <div className="sm:hidden text-[10px] text-slate-400 text-center pt-2">
              <span className="text-red-500">*</span> Required fields
            </div>
          </div>
        </form>

        {/* Desktop Info Text - Hidden on Mobile */}
        <div className="hidden sm:flex items-center justify-between text-xs text-slate-400 px-2 mt-4">
          <div>
            <span className="text-red-500">*</span> Required fields
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Lock size={12} /> Field permissions based on role
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

