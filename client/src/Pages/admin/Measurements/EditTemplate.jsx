// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { ArrowLeft, Save, X, CheckSquare, Square } from "lucide-react";
// import { fetchTemplateById, updateTemplate } from "../../../features/sizeTemplate/sizeTemplateSlice";
// import { fetchAllSizeFields } from "../../../features/sizeField/sizeFieldSlice";
// import showToast from "../../../utils/toast";

// export default function EditTemplate() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
  
//   const { currentTemplate, loading } = useSelector((state) => state.sizeTemplate);
//   const { fields } = useSelector((state) => state.sizeField);
//   const { user } = useSelector((state) => state.auth);
  
//   // ✅ Get base path based on user role
//   const basePath = user?.role === "ADMIN" ? "/admin" : 
//                    user?.role === "STORE_KEEPER" ? "/storekeeper" : 
//                    "/cuttingmaster";

//   // ✅ Debug logs
//   console.log("📊 EditTemplate - fields from Redux:", fields);
//   console.log("📊 EditTemplate - fields length:", fields?.length);
//   console.log("📊 EditTemplate - currentTemplate:", currentTemplate);
//   console.log("👤 User role:", user?.role);
//   console.log("📍 Base Path:", basePath);

//   const [formData, setFormData] = useState({
//     name: "",
//     description: "",
//     sizeFields: []
//   });
//   const [selectedFields, setSelectedFields] = useState({});

//   const isAdmin = user?.role === "ADMIN";
//   const isStoreKeeper = user?.role === "STORE_KEEPER";
//   const canEdit = isAdmin || isStoreKeeper;

//   // Check if user has permission to edit
//   useEffect(() => {
//     if (!canEdit) {
//       showToast.error("You don't have permission to edit templates");
//       navigate(`${basePath}/measurements/${id}`);
//     }
//   }, [canEdit, navigate, basePath, id]);

//   useEffect(() => {
//     console.log("📡 Fetching template ID:", id);
//     if (id) {
//       dispatch(fetchTemplateById(id));
//       dispatch(fetchAllSizeFields());
//     }
//   }, [dispatch, id]);

//   useEffect(() => {
//     if (currentTemplate) {
//       console.log("✅ Template loaded:", currentTemplate);
//       setFormData({
//         name: currentTemplate.name || "",
//         description: currentTemplate.description || "",
//         sizeFields: currentTemplate.sizeFields || []
//       });

//       const selected = {};
//       currentTemplate.sizeFields?.forEach(field => {
//         selected[field.name] = true;
//       });
//       setSelectedFields(selected);
//       console.log("✅ Selected fields set:", selected);
//     }
//   }, [currentTemplate]);

//   useEffect(() => {
//     if (fields && fields.length > 0) {
//       console.log("✅ Size fields loaded:", fields.length);
//     }
//   }, [fields]);

//   const handleFieldToggle = (field) => {
//     console.log("🔄 Toggling field:", field.name);
//     setSelectedFields(prev => ({
//       ...prev,
//       [field.name]: !prev[field.name]
//     }));

//     setFormData(prev => {
//       const fieldExists = prev.sizeFields.some(f => f.name === field.name);
      
//       if (fieldExists) {
//         return {
//           ...prev,
//           sizeFields: prev.sizeFields.filter(f => f.name !== field.name)
//         };
//       } else {
//         return {
//           ...prev,
//           sizeFields: [...prev.sizeFields, { 
//             name: field.name, 
//             isRequired: false,
//             order: field.order || 0
//           }]
//         };
//       }
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!canEdit) {
//       showToast.error("You don't have permission to edit templates");
//       return;
//     }
    
//     if (!formData.name.trim()) {
//       showToast.error("Template name is required");
//       return;
//     }

//     if (formData.sizeFields.length === 0) {
//       showToast.error("Please select at least one size field");
//       return;
//     }

//     try {
//       await dispatch(updateTemplate({ id, templateData: formData })).unwrap();
//       showToast.success("Template updated successfully");
//       navigate(`${basePath}/measurements/${id}`);
//     } catch (error) {
//       showToast.error(error || "Failed to update template");
//     }
//   };

//   // Group fields by category
//   const groupedFields = fields?.reduce((acc, field) => {
//     if (!acc[field.category]) acc[field.category] = [];
//     acc[field.category].push(field);
//     return acc;
//   }, {});

//   const categoryTitles = {
//     upper: "Upper Body Measurements",
//     lower: "Lower Body Measurements",
//     full: "Full Body Measurements",
//     other: "Other Measurements"
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-[400px]">
//         <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
//       </div>
//     );
//   }

//   // Show message if no fields
//   if (!fields || fields.length === 0) {
//     return (
//       <div className="max-w-4xl mx-auto p-6">
//         <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
//           <h3 className="text-xl font-bold text-slate-700 mb-2">No Size Fields Found</h3>
//           <p className="text-slate-500 mb-6">Please run the size fields seed first.</p>
//           <button
//             onClick={() => navigate(`${basePath}/measurements/${id}`)}
//             className="bg-blue-600 text-white px-6 py-2 rounded-lg"
//           >
//             Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Don't render if user doesn't have permission (redirect will happen)
//   if (!canEdit) {
//     return null;
//   }

//   return (
//     <div className="max-w-4xl mx-auto p-6 animate-in fade-in duration-500">
//       {/* Header */}
//       <div className="flex items-center gap-4 mb-6">
//         <button
//           onClick={() => navigate(`${basePath}/measurements/${id}`)}
//           className="p-2 hover:bg-slate-100 rounded-lg transition-all"
//         >
//           <ArrowLeft size={20} className="text-slate-600" />
//         </button>
//         <h1 className="text-2xl font-bold text-slate-800">Edit Template</h1>
//       </div>

//       {/* Form */}
//       <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border overflow-hidden">
//         <div className="p-6 space-y-6">
//           {/* Template Name */}
//           <div>
//             <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//               Template Name <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="text"
//               value={formData.name}
//               onChange={(e) => setFormData({...formData, name: e.target.value})}
//               className="w-full px-4 py-3 bg-slate-50 border rounded-lg"
//               required
//             />
//           </div>

//           {/* Description */}
//           <div>
//             <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//               Description
//             </label>
//             <textarea
//               value={formData.description}
//               onChange={(e) => setFormData({...formData, description: e.target.value})}
//               rows="2"
//               className="w-full px-4 py-3 bg-slate-50 border rounded-lg"
//             />
//           </div>

//           {/* Size Fields */}
//           <div>
//             <h3 className="font-bold text-slate-800 mb-4">Select Size Fields</h3>
//             <div className="space-y-4">
//               {Object.entries(groupedFields || {}).map(([category, categoryFields]) => (
//                 <div key={category} className="bg-slate-50 rounded-lg p-4">
//                   <h4 className="font-bold text-slate-700 mb-3">{categoryTitles[category] || category}</h4>
//                   <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
//                     {categoryFields.map((field) => (
//                       <label
//                         key={field._id}
//                         className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer ${
//                           selectedFields[field.name]
//                             ? 'border-purple-500 bg-purple-50'
//                             : 'border-slate-200 hover:border-purple-200'
//                         }`}
//                       >
//                         <input
//                           type="checkbox"
//                           className="hidden"
//                           checked={selectedFields[field.name] || false}
//                           onChange={() => handleFieldToggle(field)}
//                         />
//                         {selectedFields[field.name] ? (
//                           <CheckSquare size={18} className="text-purple-600" />
//                         ) : (
//                           <Square size={18} className="text-slate-400" />
//                         )}
//                         <span className="text-sm">{field.displayName}</span>
//                       </label>
//                     ))}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Form Actions */}
//         <div className="p-6 bg-slate-50 flex gap-3">
//           <button
//             type="submit"
//             className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-700 flex items-center justify-center gap-2"
//           >
//             <Save size={18} /> Update Template
//           </button>
//           <button
//             type="button"
//             onClick={() => navigate(`${basePath}/measurements/${id}`)}
//             className="flex-1 bg-slate-200 text-slate-700 px-6 py-3 rounded-lg font-bold hover:bg-slate-300"
//           >
//             Cancel
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }























// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { ArrowLeft, Save, X, CheckSquare, Square, Menu } from "lucide-react";
// import { fetchTemplateById, updateTemplate } from "../../../features/sizeTemplate/sizeTemplateSlice";
// import { fetchAllSizeFields } from "../../../features/sizeField/sizeFieldSlice";
// import showToast from "../../../utils/toast";

// export default function EditTemplate() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
  
//   const { currentTemplate, loading } = useSelector((state) => state.sizeTemplate);
//   const { fields } = useSelector((state) => state.sizeField);
//   const { user } = useSelector((state) => state.auth);
  
//   // Mobile menu state
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
//   // Get base path based on user role
//   const basePath = user?.role === "ADMIN" ? "/admin" : 
//                    user?.role === "STORE_KEEPER" ? "/storekeeper" : 
//                    "/cuttingmaster";

//   // Debug logs
//   console.log("📊 EditTemplate - fields from Redux:", fields);
//   console.log("📊 EditTemplate - fields length:", fields?.length);
//   console.log("📊 EditTemplate - currentTemplate:", currentTemplate);
//   console.log("👤 User role:", user?.role);
//   console.log("📍 Base Path:", basePath);

//   const [formData, setFormData] = useState({
//     name: "",
//     description: "",
//     sizeFields: []
//   });
//   const [selectedFields, setSelectedFields] = useState({});

//   const isAdmin = user?.role === "ADMIN";
//   const isStoreKeeper = user?.role === "STORE_KEEPER";
//   const canEdit = isAdmin || isStoreKeeper;

//   // Check if user has permission to edit
//   useEffect(() => {
//     if (!canEdit) {
//       showToast.error("You don't have permission to edit templates");
//       navigate(`${basePath}/measurements/${id}`);
//     }
//   }, [canEdit, navigate, basePath, id]);

//   useEffect(() => {
//     console.log("📡 Fetching template ID:", id);
//     if (id) {
//       dispatch(fetchTemplateById(id));
//       dispatch(fetchAllSizeFields());
//     }
//   }, [dispatch, id]);

//   useEffect(() => {
//     if (currentTemplate) {
//       console.log("✅ Template loaded:", currentTemplate);
//       setFormData({
//         name: currentTemplate.name || "",
//         description: currentTemplate.description || "",
//         sizeFields: currentTemplate.sizeFields || []
//       });

//       const selected = {};
//       currentTemplate.sizeFields?.forEach(field => {
//         selected[field.name] = true;
//       });
//       setSelectedFields(selected);
//       console.log("✅ Selected fields set:", selected);
//     }
//   }, [currentTemplate]);

//   useEffect(() => {
//     if (fields && fields.length > 0) {
//       console.log("✅ Size fields loaded:", fields.length);
//     }
//   }, [fields]);

//   const handleFieldToggle = (field) => {
//     console.log("🔄 Toggling field:", field.name);
//     setSelectedFields(prev => ({
//       ...prev,
//       [field.name]: !prev[field.name]
//     }));

//     setFormData(prev => {
//       const fieldExists = prev.sizeFields.some(f => f.name === field.name);
      
//       if (fieldExists) {
//         return {
//           ...prev,
//           sizeFields: prev.sizeFields.filter(f => f.name !== field.name)
//         };
//       } else {
//         return {
//           ...prev,
//           sizeFields: [...prev.sizeFields, { 
//             name: field.name, 
//             isRequired: false,
//             order: field.order || 0
//           }]
//         };
//       }
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!canEdit) {
//       showToast.error("You don't have permission to edit templates");
//       return;
//     }
    
//     if (!formData.name.trim()) {
//       showToast.error("Template name is required");
//       return;
//     }

//     if (formData.sizeFields.length === 0) {
//       showToast.error("Please select at least one size field");
//       return;
//     }

//     try {
//       await dispatch(updateTemplate({ id, templateData: formData })).unwrap();
//       showToast.success("Template updated successfully");
//       navigate(`${basePath}/measurements/${id}`);
//     } catch (error) {
//       showToast.error(error || "Failed to update template");
//     }
//   };

//   // Group fields by category
//   const groupedFields = fields?.reduce((acc, field) => {
//     if (!acc[field.category]) acc[field.category] = [];
//     acc[field.category].push(field);
//     return acc;
//   }, {});

//   const categoryTitles = {
//     upper: "Upper Body Measurements",
//     lower: "Lower Body Measurements",
//     full: "Full Body Measurements",
//     other: "Other Measurements"
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
//           <p className="mt-4 text-sm sm:text-base text-slate-600">Loading template details...</p>
//         </div>
//       </div>
//     );
//   }

//   // Show message if no fields
//   if (!fields || fields.length === 0) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
//         <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-md w-full text-center">
//           <h3 className="text-lg sm:text-xl font-bold text-slate-700 mb-2">No Size Fields Found</h3>
//           <p className="text-sm sm:text-base text-slate-500 mb-4 sm:mb-6">Please run the size fields seed first.</p>
//           <button
//             onClick={() => navigate(`${basePath}/measurements/${id}`)}
//             className="w-full sm:w-auto bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base"
//           >
//             Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Don't render if user doesn't have permission (redirect will happen)
//   if (!canEdit) {
//     return null;
//   }

//   return (
//     <div className="min-h-screen bg-slate-50">
//       {/* Mobile Header */}
//       <div className="lg:hidden bg-white border-b border-slate-200 sticky top-0 z-30">
//         <div className="flex items-center justify-between px-4 py-3">
//           <button
//             onClick={() => navigate(`${basePath}/measurements/${id}`)}
//             className="flex items-center gap-1 text-slate-600"
//           >
//             <ArrowLeft size={18} />
//             <span className="font-bold text-sm">Cancel</span>
//           </button>
//           <h1 className="text-base font-black text-slate-800 truncate max-w-[150px]">
//             Edit Template
//           </h1>
//           <button
//             onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//             className="p-2 hover:bg-slate-100 rounded-xl transition-all flex items-center justify-center"
//             style={{ minWidth: '36px', minHeight: '36px' }}
//           >
//             <Menu size={18} />
//           </button>
//         </div>
        
//         {/* Mobile Menu */}
//         {mobileMenuOpen && (
//           <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg p-4 z-40">
//             <div className="space-y-2">
//               <button
//                 onClick={() => {
//                   navigate(basePath);
//                   setMobileMenuOpen(false);
//                 }}
//                 className="w-full text-left px-4 py-3 hover:bg-slate-100 rounded-xl font-medium"
//               >
//                 Dashboard
//               </button>
//               <button
//                 onClick={() => {
//                   navigate(`${basePath}/measurements`);
//                   setMobileMenuOpen(false);
//                 }}
//                 className="w-full text-left px-4 py-3 hover:bg-slate-100 rounded-xl font-medium"
//               >
//                 Templates List
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
//         {/* Desktop Header - Hidden on Mobile */}
//         <div className="hidden lg:flex items-center gap-4 mb-6">
//           <button
//             onClick={() => navigate(`${basePath}/measurements/${id}`)}
//             className="p-2 hover:bg-slate-100 rounded-lg transition-all"
//           >
//             <ArrowLeft size={20} className="text-slate-600" />
//           </button>
//           <h1 className="text-xl lg:text-2xl font-bold text-slate-800">Edit Template</h1>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-lg border overflow-hidden">
//           <div className="p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-5 lg:space-y-6">
//             {/* Template Name */}
//             <div>
//               <label className="block text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2">
//                 Template Name <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 value={formData.name}
//                 onChange={(e) => setFormData({...formData, name: e.target.value})}
//                 className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border rounded-lg sm:rounded-xl text-sm sm:text-base"
//                 required
//               />
//             </div>

//             {/* Description */}
//             <div>
//               <label className="block text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2">
//                 Description
//               </label>
//               <textarea
//                 value={formData.description}
//                 onChange={(e) => setFormData({...formData, description: e.target.value})}
//                 rows="2"
//                 className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border rounded-lg sm:rounded-xl text-sm sm:text-base"
//               />
//             </div>

//             {/* Size Fields */}
//             <div>
//               <h3 className="font-bold text-slate-800 text-sm sm:text-base mb-3 sm:mb-4">Select Size Fields</h3>
//               <div className="space-y-3 sm:space-y-4">
//                 {Object.entries(groupedFields || {}).map(([category, categoryFields]) => (
//                   <div key={category} className="bg-slate-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
//                     <h4 className="font-bold text-slate-700 text-xs sm:text-sm mb-2 sm:mb-3">{categoryTitles[category] || category}</h4>
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
//                       {categoryFields.map((field) => (
//                         <label
//                           key={field._id}
//                           className={`flex items-center gap-2 p-2 sm:p-2.5 rounded-lg border cursor-pointer transition-all ${
//                             selectedFields[field.name]
//                               ? 'border-purple-500 bg-purple-50'
//                               : 'border-slate-200 hover:border-purple-200'
//                           }`}
//                         >
//                           <input
//                             type="checkbox"
//                             className="hidden"
//                             checked={selectedFields[field.name] || false}
//                             onChange={() => handleFieldToggle(field)}
//                           />
//                           <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6">
//                             {selectedFields[field.name] ? (
//                               <CheckSquare size={14} className="text-purple-600 sm:w-4 sm:h-4" />
//                             ) : (
//                               <Square size={14} className="text-slate-400 sm:w-4 sm:h-4" />
//                             )}
//                           </div>
//                           <span className="text-xs sm:text-sm truncate">{field.displayName}</span>
//                         </label>
//                       ))}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Form Actions - Responsive */}
//           <div className="p-4 sm:p-5 lg:p-6 bg-slate-50 flex flex-col sm:flex-row gap-2 sm:gap-3">
//             <button
//               type="submit"
//               className="flex-1 bg-purple-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base hover:bg-purple-700 flex items-center justify-center gap-2 order-2 sm:order-1"
//             >
//               <Save size={14} className="sm:w-4 sm:h-4" />
//               Update Template
//             </button>
//             <button
//               type="button"
//               onClick={() => navigate(`${basePath}/measurements/${id}`)}
//               className="flex-1 bg-slate-200 text-slate-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base hover:bg-slate-300 flex items-center justify-center gap-2 order-1 sm:order-2"
//             >
//               <X size={14} className="sm:w-4 sm:h-4" />
//               Cancel
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }











import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Save, X, CheckSquare, Square, Menu } from "lucide-react";
import { fetchTemplateById, updateTemplate } from "../../../features/sizeTemplate/sizeTemplateSlice";
import { fetchAllSizeFields } from "../../../features/sizeField/sizeFieldSlice";
import showToast from "../../../utils/toast";

export default function EditTemplate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentTemplate, loading } = useSelector((state) => state.sizeTemplate);
  const { fields } = useSelector((state) => state.sizeField);
  const { user } = useSelector((state) => state.auth);
  
  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Get base path based on user role - using useMemo
  const isAdmin = user?.role === "ADMIN";
  const isStoreKeeper = user?.role === "STORE_KEEPER";
  
  const basePath = useMemo(() => {
    if (isAdmin) return "/admin";
    if (isStoreKeeper) return "/storekeeper";
    return "/cuttingmaster";
  }, [isAdmin, isStoreKeeper]);

  // Debug logs
  console.log("📊 EditTemplate - fields from Redux:", fields);
  console.log("📊 EditTemplate - fields length:", fields?.length);
  console.log("📊 EditTemplate - currentTemplate:", currentTemplate);
  console.log("👤 User role:", user?.role);
  console.log("📍 Base Path:", basePath);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sizeFields: []
  });
  const [selectedFields, setSelectedFields] = useState({});

  const canEdit = isAdmin || isStoreKeeper;

  // Navigation handlers for mobile menu
  const handleNavigateToDashboard = () => {
    console.log("🏠 Navigating to dashboard with basePath:", basePath);
    navigate(`${basePath}/dashboard`);
    setMobileMenuOpen(false);
  };

  const handleNavigateToTemplates = () => {
    console.log("📏 Navigating to templates with basePath:", basePath);
    navigate(`${basePath}/measurements`);
    setMobileMenuOpen(false);
  };

  const handleNavigateToWorks = () => {
    console.log("🔨 Navigating to works with basePath:", basePath);
    navigate(`${basePath}/tasks`);
    setMobileMenuOpen(false);
  };

  const handleNavigateToOrders = () => {
    console.log("📦 Navigating to orders with basePath:", basePath);
    navigate(`${basePath}/orders`);
    setMobileMenuOpen(false);
  };

  // Check if user has permission to edit
  useEffect(() => {
    if (!canEdit) {
      showToast.error("You don't have permission to edit templates");
      navigate(`${basePath}/measurements/${id}`);
    }
  }, [canEdit, navigate, basePath, id]);

  useEffect(() => {
    console.log("📡 Fetching template ID:", id);
    if (id) {
      dispatch(fetchTemplateById(id));
      dispatch(fetchAllSizeFields());
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentTemplate) {
      console.log("✅ Template loaded:", currentTemplate);
      setFormData({
        name: currentTemplate.name || "",
        description: currentTemplate.description || "",
        sizeFields: currentTemplate.sizeFields || []
      });

      const selected = {};
      currentTemplate.sizeFields?.forEach(field => {
        selected[field.name] = true;
      });
      setSelectedFields(selected);
      console.log("✅ Selected fields set:", selected);
    }
  }, [currentTemplate]);

  useEffect(() => {
    if (fields && fields.length > 0) {
      console.log("✅ Size fields loaded:", fields.length);
    }
  }, [fields]);

  const handleFieldToggle = (field) => {
    console.log("🔄 Toggling field:", field.name);
    setSelectedFields(prev => ({
      ...prev,
      [field.name]: !prev[field.name]
    }));

    setFormData(prev => {
      const fieldExists = prev.sizeFields.some(f => f.name === field.name);
      
      if (fieldExists) {
        return {
          ...prev,
          sizeFields: prev.sizeFields.filter(f => f.name !== field.name)
        };
      } else {
        return {
          ...prev,
          sizeFields: [...prev.sizeFields, { 
            name: field.name, 
            isRequired: false,
            order: field.order || 0
          }]
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!canEdit) {
      showToast.error("You don't have permission to edit templates");
      return;
    }
    
    if (!formData.name.trim()) {
      showToast.error("Template name is required");
      return;
    }

    if (formData.sizeFields.length === 0) {
      showToast.error("Please select at least one size field");
      return;
    }

    try {
      await dispatch(updateTemplate({ id, templateData: formData })).unwrap();
      showToast.success("Template updated successfully");
      navigate(`${basePath}/measurements/${id}`);
    } catch (error) {
      showToast.error(error || "Failed to update template");
    }
  };

  // Group fields by category
  const groupedFields = fields?.reduce((acc, field) => {
    if (!acc[field.category]) acc[field.category] = [];
    acc[field.category].push(field);
    return acc;
  }, {});

  const categoryTitles = {
    upper: "Upper Body Measurements",
    lower: "Lower Body Measurements",
    full: "Full Body Measurements",
    other: "Other Measurements"
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm sm:text-base text-slate-600">Loading template details...</p>
        </div>
      </div>
    );
  }

  // Show message if no fields
  if (!fields || fields.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-md w-full text-center">
          <h3 className="text-lg sm:text-xl font-bold text-slate-700 mb-2">No Size Fields Found</h3>
          <p className="text-sm sm:text-base text-slate-500 mb-4 sm:mb-6">Please run the size fields seed first.</p>
          <button
            onClick={() => navigate(`${basePath}/measurements/${id}`)}
            className="w-full sm:w-auto bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Don't render if user doesn't have permission (redirect will happen)
  if (!canEdit) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate(`${basePath}/measurements/${id}`)}
            className="flex items-center gap-1 text-slate-600"
          >
            <ArrowLeft size={18} />
            <span className="font-bold text-sm">Cancel</span>
          </button>
          <h1 className="text-base font-black text-slate-800 truncate max-w-[150px]">
            Edit Template
          </h1>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-slate-100 rounded-xl transition-all flex items-center justify-center"
            style={{ minWidth: '36px', minHeight: '36px' }}
          >
            <Menu size={18} />
          </button>
        </div>
        
        {/* Mobile Menu - Updated with proper navigation */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg p-4 z-40">
            <div className="space-y-2">
              {/* Dashboard Link */}
              <button
                onClick={handleNavigateToDashboard}
                className="w-full text-left px-4 py-3 hover:bg-slate-100 rounded-xl font-medium flex items-center gap-3"
              >
                <span className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-xs">🏠</span>
                </span>
                Dashboard
              </button>

              {/* Templates Link */}
              <button
                onClick={handleNavigateToTemplates}
                className="w-full text-left px-4 py-3 hover:bg-slate-100 rounded-xl font-medium flex items-center gap-3"
              >
                <span className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-xs">📏</span>
                </span>
                Templates
              </button>

              {/* Works Link */}
              <button
                onClick={handleNavigateToWorks}
                className="w-full text-left px-4 py-3 hover:bg-slate-100 rounded-xl font-medium flex items-center gap-3"
              >
                <span className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-xs">🔨</span>
                </span>
                Works
              </button>

              {/* Orders Link */}
              <button
                onClick={handleNavigateToOrders}
                className="w-full text-left px-4 py-3 hover:bg-slate-100 rounded-xl font-medium flex items-center gap-3"
              >
                <span className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-orange-600 text-xs">📦</span>
                </span>
                Orders
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
        {/* Desktop Header - Hidden on Mobile */}
        <div className="hidden lg:flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(`${basePath}/measurements/${id}`)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-all"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <h1 className="text-xl lg:text-2xl font-bold text-slate-800">Edit Template</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-lg border overflow-hidden">
          <div className="p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-5 lg:space-y-6">
            {/* Template Name */}
            <div>
              <label className="block text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2">
                Template Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border rounded-lg sm:rounded-xl text-sm sm:text-base"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="2"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border rounded-lg sm:rounded-xl text-sm sm:text-base"
              />
            </div>

            {/* Size Fields */}
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base mb-3 sm:mb-4">Select Size Fields</h3>
              <div className="space-y-3 sm:space-y-4">
                {Object.entries(groupedFields || {}).map(([category, categoryFields]) => (
                  <div key={category} className="bg-slate-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <h4 className="font-bold text-slate-700 text-xs sm:text-sm mb-2 sm:mb-3">{categoryTitles[category] || category}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                      {categoryFields.map((field) => (
                        <label
                          key={field._id}
                          className={`flex items-center gap-2 p-2 sm:p-2.5 rounded-lg border cursor-pointer transition-all ${
                            selectedFields[field.name]
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-slate-200 hover:border-purple-200'
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={selectedFields[field.name] || false}
                            onChange={() => handleFieldToggle(field)}
                          />
                          <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6">
                            {selectedFields[field.name] ? (
                              <CheckSquare size={14} className="text-purple-600 sm:w-4 sm:h-4" />
                            ) : (
                              <Square size={14} className="text-slate-400 sm:w-4 sm:h-4" />
                            )}
                          </div>
                          <span className="text-xs sm:text-sm truncate">{field.displayName}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form Actions - Responsive */}
          <div className="p-4 sm:p-5 lg:p-6 bg-slate-50 flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              type="submit"
              className="flex-1 bg-purple-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base hover:bg-purple-700 flex items-center justify-center gap-2 order-2 sm:order-1"
            >
              <Save size={14} className="sm:w-4 sm:h-4" />
              Update Template
            </button>
            <button
              type="button"
              onClick={() => navigate(`${basePath}/measurements/${id}`)}
              className="flex-1 bg-slate-200 text-slate-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base hover:bg-slate-300 flex items-center justify-center gap-2 order-1 sm:order-2"
            >
              <X size={14} className="sm:w-4 sm:h-4" />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}