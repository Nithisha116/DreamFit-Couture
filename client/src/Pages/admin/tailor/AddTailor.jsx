// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   ArrowLeft,
//   Save,
//   User,
//   Phone,
//   Mail,
//   MapPin,
//   Briefcase,
//   Calendar,
//   Plus,
//   X,
//   Lock,
// } from "lucide-react";
// import { createTailor } from "../../../features/tailor/tailorSlice";
// import showToast from "../../../utils/toast";

// export default function AddTailor() {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const { user } = useSelector((state) => state.auth);

//   // ✅ Get base path based on user role
//   const basePath = user?.role === "ADMIN" ? "/admin" : 
//                    user?.role === "STORE_KEEPER" ? "/storekeeper" : 
//                    "/cuttingmaster";

//   // Add password to initial state
//   const [formData, setFormData] = useState({
//     name: "",
//     phone: "",
//     email: "",
//     password: "", // Add password field
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

//   // ✅ Handle Back - with basePath
//   const handleBack = () => {
//     navigate(`${basePath}/tailors`);
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

//   // Function to generate a random password
//   const generateRandomPassword = () => {
//     const length = 10;
//     const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$";
//     let password = "";
//     for (let i = 0; i < length; i++) {
//       password += charset.charAt(Math.floor(Math.random() * charset.length));
//     }
//     return password;
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

//     // DEBUG: Log form data before any processing
//     console.log("🔍 STEP 1 - Raw formData:", {
//       ...formData,
//       password: formData.password ? "[PRESENT - " + formData.password.length + " chars]" : "[EMPTY]"
//     });

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

//     // Generate password if not provided
//     const password = formData.password || generateRandomPassword();
    
//     // DEBUG: Check password generation
//     console.log("🔍 STEP 2 - Password handling:", {
//       originalPassword: formData.password ? "[PROVIDED]" : "[NOT PROVIDED]",
//       generatedPassword: !formData.password ? "[GENERATED - " + password.length + " chars]" : "[NOT GENERATED]",
//       finalPassword: password ? "[SET - " + password.length + " chars]" : "[MISSING - PROBLEM!]"
//     });

//     // Prepare data for API - Explicit object creation
//     const tailorData = {
//       name: formData.name,
//       phone: formData.phone,
//       email: formData.email || "",
//       password: password, // Explicitly set
//       experience: formData.experience ? parseInt(formData.experience) : 0,
//       specialization: formData.specialization || [],
//       address: {
//         street: formData.address.street || "",
//         city: formData.address.city || "",
//         state: formData.address.state || "",
//         pincode: formData.address.pincode || ""
//       }
//     };

//     // FINAL DEBUG: Log the complete data being sent to dispatch
//     console.log("🔍 STEP 4 - FINAL data being sent to Redux:", {
//       data: {
//         ...tailorData,
//         password: tailorData.password ? "[PRESENT - " + tailorData.password.length + " chars]" : "[MISSING - THIS IS THE PROBLEM!]"
//       },
//       passwordLength: tailorData.password ? tailorData.password.length : 0,
//       timestamp: new Date().toISOString()
//     });

//     // Add a check before dispatching
//     if (!tailorData.password) {
//       console.error("❌ CRITICAL: Password is missing right before dispatch!");
//       showToast.error("Password generation failed. Please try again.");
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       // DEBUG: Log before dispatch
//       console.log("🔍 STEP 5 - About to dispatch createTailor with password:", 
//         tailorData.password ? "[PRESENT]" : "[MISSING]");
      
//       const result = await dispatch(createTailor(tailorData)).unwrap();
      
//       console.log("✅ STEP 6 - Dispatch successful:", result);
      
//       // Show success message with password if it was auto-generated
//       if (!formData.password) {
//         showToast.success(`Tailor created successfully! Password: ${password}`, {
//           duration: 10000, // Show for 10 seconds so admin can note it down
//         });
//       } else {
//         showToast.success("Tailor created successfully! 🎉");
//       }
      
//       // ✅ Navigate with basePath
//       navigate(`${basePath}/tailors`);
//     } catch (error) {
//       console.error("❌ STEP 6 - Creation error:", error);
      
//       // Enhanced error logging
//       if (error.response) {
//         console.error("Server response data:", error.response.data);
//         console.error("Server response status:", error.response.status);
//         console.error("Server response headers:", error.response.headers);
        
//         // Show specific error message
//         if (error.response.data.message) {
//           showToast.error(error.response.data.message);
//         } else if (error.response.data.errors) {
//           showToast.error(error.response.data.errors.join(', '));
//         } else {
//           showToast.error("Failed to create tailor");
//         }
//       } else if (error.request) {
//         console.error("No response received:", error.request);
//         showToast.error("No response from server");
//       } else {
//         console.error("Error message:", error.message);
//         showToast.error(error.message || "Failed to create tailor");
//       }
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Add a debug effect to monitor formData changes
//   React.useEffect(() => {
//     console.log("📊 FormData updated - Password present:", 
//       formData.password ? "✅ Yes" : "❌ No");
//   }, [formData]);

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
//           <h1 className="text-3xl font-black text-slate-800 tracking-tight">Add New Tailor</h1>
//           <p className="text-slate-500">Create a new tailor profile</p>
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
//                   placeholder="Enter tailor's full name"
//                   className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
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
//                     placeholder="9876543210"
//                     className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
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
//                     placeholder="tailor@example.com"
//                     className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
//                   />
//                 </div>
//               </div>

//               {/* Password */}
//               <div>
//                 <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//                   Password <span className="text-slate-400">(Leave empty to auto-generate)</span>
//                 </label>
//                 <div className="relative">
//                   <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
//                   <input
//                     type="password"
//                     name="password"
//                     value={formData.password}
//                     onChange={handleChange}
//                     placeholder="Enter password or leave empty"
//                     className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
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
//                     placeholder="5"
//                     className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
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
//                     className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
//                   />
//                   <button
//                     type="button"
//                     onClick={handleAddSpecialization}
//                     className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
//                   >
//                     Add
//                   </button>
//                 </div>
//                 <div className="flex flex-wrap gap-2">
//                   {formData.specialization.map((spec, index) => (
//                     <span
//                       key={index}
//                       className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center gap-1"
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
//               <MapPin size={20} className="text-blue-600" />
//               Address Information
//             </h2>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               {/* Street */}
//               <div className="md:col-span-2">
//                 <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//                   Street Address
//                 </label>
//                 <input
//                   type="text"
//                   name="address.street"
//                   value={formData.address.street}
//                   onChange={handleChange}
//                   placeholder="Street name, building, area"
//                   className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
//                 />
//               </div>

//               {/* City */}
//               <div>
//                 <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//                   City
//                 </label>
//                 <input
//                   type="text"
//                   name="address.city"
//                   value={formData.address.city}
//                   onChange={handleChange}
//                   placeholder="Chennai"
//                   className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
//                 />
//               </div>

//               {/* State */}
//               <div>
//                 <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//                   State
//                 </label>
//                 <input
//                   type="text"
//                   name="address.state"
//                   value={formData.address.state}
//                   onChange={handleChange}
//                   placeholder="Tamil Nadu"
//                   className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
//                 />
//               </div>

//               {/* Pincode */}
//               <div>
//                 <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//                   Pincode
//                 </label>
//                 <input
//                   type="text"
//                   name="address.pincode"
//                   value={formData.address.pincode}
//                   onChange={handleChange}
//                   maxLength="6"
//                   placeholder="600001"
//                   className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
//                 />
//               </div>
//             </div>
//           </div>

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
//                   Creating...
//                 </>
//               ) : (
//                 <>
//                   <Save size={18} />
//                   Create Tailor
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
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Save,
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Calendar,
  Plus,
  X,
  Lock,
  Menu
} from "lucide-react";
import { createTailor } from "../../../features/tailor/tailorSlice";
import showToast from "../../../utils/toast";

export default function AddTailor() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Get base path based on user role
  const basePath = user?.role === "ADMIN" ? "/admin" : 
                   user?.role === "STORE_KEEPER" ? "/storekeeper" : 
                   "/cuttingmaster";

  // Mobile state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Add password to initial state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "", // Add password field
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

  // Handle Back - with basePath
  const handleBack = () => {
    navigate(`${basePath}/tailors`);
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

  // Function to generate a random password
  const generateRandomPassword = () => {
    const length = 10;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
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

    // DEBUG: Log form data before any processing
    console.log("🔍 STEP 1 - Raw formData:", {
      ...formData,
      password: formData.password ? "[PRESENT - " + formData.password.length + " chars]" : "[EMPTY]"
    });

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

    // Generate password if not provided
    const password = formData.password || generateRandomPassword();
    
    // DEBUG: Check password generation
    console.log("🔍 STEP 2 - Password handling:", {
      originalPassword: formData.password ? "[PROVIDED]" : "[NOT PROVIDED]",
      generatedPassword: !formData.password ? "[GENERATED - " + password.length + " chars]" : "[NOT GENERATED]",
      finalPassword: password ? "[SET - " + password.length + " chars]" : "[MISSING - PROBLEM!]"
    });

    // Prepare data for API - Explicit object creation
    const tailorData = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email || "",
      password: password, // Explicitly set
      experience: formData.experience ? parseInt(formData.experience) : 0,
      basicSalary: formData.basicSalary ? parseInt(formData.basicSalary) : 0,
      specialization: formData.specialization || [],
      address: {
        street: formData.address.street || "",
        city: formData.address.city || "",
        state: formData.address.state || "",
        pincode: formData.address.pincode || ""
      }
    };

    // FINAL DEBUG: Log the complete data being sent to dispatch
    console.log("🔍 STEP 4 - FINAL data being sent to Redux:", {
      data: {
        ...tailorData,
        password: tailorData.password ? "[PRESENT - " + tailorData.password.length + " chars]" : "[MISSING - THIS IS THE PROBLEM!]"
      },
      passwordLength: tailorData.password ? tailorData.password.length : 0,
      timestamp: new Date().toISOString()
    });

    // Add a check before dispatching
    if (!tailorData.password) {
      console.error("❌ CRITICAL: Password is missing right before dispatch!");
      showToast.error("Password generation failed. Please try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      // DEBUG: Log before dispatch
      console.log("🔍 STEP 5 - About to dispatch createTailor with password:", 
        tailorData.password ? "[PRESENT]" : "[MISSING]");
      
      const result = await dispatch(createTailor(tailorData)).unwrap();
      
      console.log("✅ STEP 6 - Dispatch successful:", result);
      
      // Show success message with password if it was auto-generated
      if (!formData.password) {
        showToast.success(`Tailor created successfully! Password: ${password}`, {
          duration: 10000, // Show for 10 seconds so admin can note it down
        });
      } else {
        showToast.success("Tailor created successfully! 🎉");
      }
      
      // Navigate with basePath
      navigate(`${basePath}/tailors`);
    } catch (error) {
      console.error("❌ STEP 6 - Creation error:", error);
      
      // Enhanced error logging
      if (error.response) {
        console.error("Server response data:", error.response.data);
        console.error("Server response status:", error.response.status);
        console.error("Server response headers:", error.response.headers);
        
        // Show specific error message
        if (error.response.data.message) {
          showToast.error(error.response.data.message);
        } else if (error.response.data.errors) {
          showToast.error(error.response.data.errors.join(', '));
        } else {
          showToast.error("Failed to create tailor");
        }
      } else if (error.request) {
        console.error("No response received:", error.request);
        showToast.error("No response from server");
      } else {
        console.error("Error message:", error.message);
        showToast.error(error.message || "Failed to create tailor");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add a debug effect to monitor formData changes
  React.useEffect(() => {
    console.log("📊 FormData updated - Password present:", 
      formData.password ? "✅ Yes" : "❌ No");
  }, [formData]);

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
            Add Tailor
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
            <h1 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">Add New Tailor</h1>
            <p className="text-sm lg:text-base text-slate-500">Create a new tailor profile</p>
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
                    placeholder="Enter tailor's full name"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm sm:text-base"
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
                      placeholder="9876543210"
                      className="w-full pl-8 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm sm:text-base"
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
                      placeholder="tailor@example.com"
                      className="w-full pl-8 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm sm:text-base"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2">
                    Password <span className="text-slate-400 hidden sm:inline">(Leave empty to auto-generate)</span>
                    <span className="text-slate-400 sm:hidden text-[8px] block">(Auto-generates if empty)</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 sm:left-4 sm:top-3.5 text-slate-400" size={14} />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter or auto"
                      className="w-full pl-8 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm sm:text-base"
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
                      placeholder="5"
                      className="w-full pl-8 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm sm:text-base"
                    />
                  </div>
                </div>

                {/* Basic Salary */}
                <div>
                  <label className="block text-xs font-black uppercase text-slate-500 mb-2">
                    Basic Salary (Monthly)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      name="basicSalary"
                      value={formData.basicSalary}
                      onChange={handleChange}
                      min="0"
                      placeholder="25000"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                    />
                  </div>
                </div>

                {/* Specialization */}
                <div className="sm:col-span-2">
                  <label className="block text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2">
                    Specialization
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2 mb-2">
                    <input
                      type="text"
                      value={specializationInput}
                      onChange={(e) => setSpecializationInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSpecialization())}
                      placeholder="e.g., Shirts, Pants, Suits"
                      className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm sm:text-base"
                    />
                    <button
                      type="button"
                      onClick={handleAddSpecialization}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg sm:rounded-xl font-bold hover:bg-blue-700 transition-all text-sm flex items-center justify-center gap-2"
                    >
                      <Plus size={14} />
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {formData.specialization.map((spec, index) => (
                      <span
                        key={index}
                        className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] sm:text-sm font-medium flex items-center gap-1"
                      >
                        {spec}
                        <button
                          type="button"
                          onClick={() => handleRemoveSpecialization(spec)}
                          className="hover:text-red-600"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
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

            {/* Form Actions - Responsive */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 sm:py-4 rounded-lg sm:rounded-xl font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Save size={14} className="sm:w-[18px] sm:h-[18px]" />
                    <span>Create Tailor</span>
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
              <Lock size={12} /> Password auto-generates if left empty
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}