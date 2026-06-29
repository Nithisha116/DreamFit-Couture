// import React, { useState, useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import {
//   Package,
//   Plus,
//   Edit,
//   Trash2,
//   X,
//   Save,
//   Image,
//   Palette,
//   Tag,
//   Layers,
//   Upload,
//   Eye,
//   Power,
//   EyeOff,
//   IndianRupee, // ✅ Add IndianRupee icon
// } from "lucide-react";
// import {
//   fetchAllFabrics,
//   createFabric,
//   updateFabric,
//   deleteFabric,
//   toggleFabricStatus,
// } from "../../../features/fabric/fabricSlice";
// import {
//   fetchAllCategories,
//   createCategory,
//   updateCategory,
//   deleteCategory,
// } from "../../../features/category/categorySlice";
// import {
//   fetchItems,
//   createItem,
//   updateItem,
//   deleteItem,
// } from "../../../features/item/itemSlice";
// import showToast from "../../../utils/toast";

// export default function Products() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState("fabric");

//   // Redux state
//   const { fabrics } = useSelector((state) => state.fabric);
//   const { categories } = useSelector((state) => state.category);
//   const { items } = useSelector((state) => state.item);
//   const { user } = useSelector((state) => state.auth);

//   // ✅ Get base path based on user role
//   const basePath = user?.role === "ADMIN" ? "/admin" : 
//                    user?.role === "STORE_KEEPER" ? "/storekeeper" : 
//                    "/cuttingmaster";

//   // UI state
//   const [showModal, setShowModal] = useState(false);
//   const [editingItem, setEditingItem] = useState(null);
//   const [selectedCategory, setSelectedCategory] = useState("");
//   const [showInactive, setShowInactive] = useState(false);

//   const isAdmin = user?.role === "ADMIN";
//   const isStoreKeeper = user?.role === "STORE_KEEPER";
//   const canEdit = isAdmin || isStoreKeeper; // Both Admin and Store Keeper can edit
//   const canDelete = isAdmin; // Only Admin can delete

//   // Form states
//   const [fabricForm, setFabricForm] = useState({
//     name: "",
//     color: "",
//     pricePerMeter: "",
//     imageFile: null,
//     imagePreview: null,
//   });
//   const [categoryForm, setCategoryForm] = useState({ name: "" });
  
//   // ✅ Updated itemForm with priceRange
//   const [itemForm, setItemForm] = useState({ 
//     name: "", 
//     categoryId: "",
//     priceRange: {  // ✅ Added priceRange object
//       min: 0,
//       max: 0
//     }
//   });

//   // Load data
//   useEffect(() => {
//     dispatch(fetchAllFabrics());
//     dispatch(fetchAllCategories());
//   }, [dispatch]);

//   useEffect(() => {
//     if (selectedCategory) {
//       dispatch(fetchItems(selectedCategory));
//     } else {
//       dispatch(fetchItems());
//     }
//   }, [selectedCategory, dispatch]);

//   // ========== FABRIC FUNCTIONS ==========
//   const handleFabricSubmit = async (e) => {
//     e.preventDefault();
//     if (!canEdit) {
//       showToast.error("You don't have permission to edit fabrics");
//       return;
//     }
//     if (!fabricForm.name || !fabricForm.color || !fabricForm.pricePerMeter) {
//       showToast.error("Please fill all required fields");
//       return;
//     }

//     try {
//       const formData = new FormData();
//       formData.append("name", fabricForm.name);
//       formData.append("color", fabricForm.color);
//       formData.append("pricePerMeter", fabricForm.pricePerMeter);
//       if (fabricForm.imageFile) formData.append("image", fabricForm.imageFile);

//       if (editingItem) {
//         await dispatch(
//           updateFabric({ id: editingItem._id, fabricData: formData }),
//         ).unwrap();
//         showToast.success("Fabric updated successfully! ✅");
//       } else {
//         await dispatch(createFabric(formData)).unwrap();
//         showToast.success("Fabric created successfully! 🎉");
//       }
//       setShowModal(false);
//       resetForms();
//     } catch (error) {
//       showToast.error(error || "Operation failed");
//     }
//   };

//   // ========== CATEGORY FUNCTIONS ==========
//   const handleCategorySubmit = async (e) => {
//     e.preventDefault();
//     if (!canEdit) {
//       showToast.error("You don't have permission to edit categories");
//       return;
//     }
//     if (!categoryForm.name) {
//       showToast.error("Category name is required");
//       return;
//     }

//     try {
//       if (editingItem) {
//         await dispatch(
//           updateCategory({ id: editingItem._id, categoryData: categoryForm }),
//         ).unwrap();
//         showToast.success("Category updated successfully! ✅");
//       } else {
//         await dispatch(createCategory(categoryForm)).unwrap();
//         showToast.success("Category created successfully! 🎉");
//       }
//       setShowModal(false);
//       resetForms();
//     } catch (error) {
//       showToast.error(error || "Operation failed");
//     }
//   };

//   // ========== ITEM FUNCTIONS ==========
//   const handleItemSubmit = async (e) => {
//     e.preventDefault();
//     if (!canEdit) {
//       showToast.error("You don't have permission to edit items");
//       return;
//     }
//     if (!itemForm.name || !itemForm.categoryId) {
//       showToast.error("Please fill all required fields");
//       return;
//     }

//     // ✅ Validate price range
//     if (itemForm.priceRange.min < 0 || itemForm.priceRange.max < 0) {
//       showToast.error("Price cannot be negative");
//       return;
//     }
//     if (itemForm.priceRange.min > itemForm.priceRange.max) {
//       showToast.error("Minimum price cannot be greater than maximum price");
//       return;
//     }

//     try {
//       if (editingItem) {
//         // ✅ Include priceRange in update
//         await dispatch(
//           updateItem({
//             id: editingItem._id,
//             itemData: { 
//               name: itemForm.name,
//               priceRange: itemForm.priceRange  // ✅ Added priceRange
//             },
//           }),
//         ).unwrap();
//         showToast.success("Item updated successfully! ✅");
//       } else {
//         // ✅ Include priceRange in create
//         await dispatch(createItem({
//           name: itemForm.name,
//           categoryId: itemForm.categoryId,
//           priceRange: itemForm.priceRange  // ✅ Added priceRange
//         })).unwrap();
//         showToast.success("Item created successfully! 🎉");
//       }
//       setShowModal(false);
//       resetForms();
//     } catch (error) {
//       showToast.error(error || "Operation failed");
//     }
//   };

//   const resetForms = () => {
//     setFabricForm({
//       name: "",
//       color: "",
//       pricePerMeter: "",
//       imageFile: null,
//       imagePreview: null,
//     });
//     setCategoryForm({ name: "" });
//     setItemForm({ 
//       name: "", 
//       categoryId: "",
//       priceRange: {  // ✅ Reset priceRange
//         min: 0,
//         max: 0
//       }
//     });
//     setEditingItem(null);
//   };

//   const handleEdit = (item) => {
//     if (!canEdit) {
//       showToast.error("You don't have permission to edit");
//       return;
//     }
//     setEditingItem(item);
//     if (activeTab === "fabric") {
//       setFabricForm({
//         name: item.name,
//         color: item.color,
//         pricePerMeter: item.pricePerMeter,
//         imageFile: null,
//         imagePreview: item.imageUrl,
//       });
//     } else if (activeTab === "category") {
//       setCategoryForm({ name: item.name });
//     } else {
//       // ✅ Include priceRange when editing item
//       setItemForm({ 
//         name: item.name, 
//         categoryId: item.category?._id || "",
//         priceRange: {
//           min: item.priceRange?.min || 0,
//           max: item.priceRange?.max || 0
//         }
//       });
//     }
//     setShowModal(true);
//   };

//   const handleDelete = async (id) => {
//     if (!canDelete) {
//       showToast.error("Only Admin can delete items");
//       return;
//     }
//     if (window.confirm("Are you sure you want to delete this item?")) {
//       try {
//         if (activeTab === "fabric") {
//           await dispatch(deleteFabric(id)).unwrap();
//           showToast.success("Fabric deleted successfully! 🗑️");
//         } else if (activeTab === "category") {
//           await dispatch(deleteCategory(id)).unwrap();
//           showToast.success("Category deleted successfully! 🗑️");
//         } else {
//           await dispatch(deleteItem(id)).unwrap();
//           showToast.success("Item deleted successfully! 🗑️");
//         }
//       } catch (error) {
//         showToast.error(error || "Failed to delete");
//       }
//     }
//   };

//   const handleToggleStatus = async (id, currentStatus) => {
//     if (!canEdit) {
//       showToast.error("You don't have permission to change status");
//       return;
//     }
//     try {
//       if (activeTab === "fabric") {
//         await dispatch(toggleFabricStatus(id)).unwrap();
//         showToast.success(`Fabric ${currentStatus ? 'deactivated' : 'activated'} successfully`);
//       }
//       // Add similar for categories and items when you have toggle functions
//     } catch (error) {
//       showToast.error("Failed to toggle status");
//     }
//   };

//   // ✅ Handle View Details - with basePath
//   const handleViewDetails = (id) => {
//     if (activeTab === "fabric") navigate(`${basePath}/fabrics/${id}`);
//     else if (activeTab === "category") navigate(`${basePath}/categories/${id}`);
//     else navigate(`${basePath}/items/${id}`);
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       if (file.size > 5 * 1024 * 1024) {
//         showToast.error("Image size should be less than 5MB");
//         return;
//       }
//       if (!file.type.startsWith("image/")) {
//         showToast.error("Please select an image file");
//         return;
//       }
//       const reader = new FileReader();
//       reader.onloadend = () =>
//         setFabricForm((prev) => ({
//           ...prev,
//           imageFile: file,
//           imagePreview: reader.result,
//         }));
//       reader.readAsDataURL(file);
//     }
//   };

//   // ✅ Format price helper function
//   const formatPrice = (price) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0
//     }).format(price);
//   };

//   // Filter items based on showInactive toggle (for Admin only)
//   const filteredFabrics = (isAdmin && showInactive) 
//     ? fabrics 
//     : fabrics?.filter(f => f.isActive !== false);
  
//   const filteredCategories = (isAdmin && showInactive) 
//     ? categories 
//     : categories?.filter(c => c.isActive !== false);
  
//   const filteredItems = (isAdmin && showInactive) 
//     ? items 
//     : items?.filter(i => i.isActive !== false);

//   return (
//     <div className="space-y-8 animate-in fade-in duration-500">
//       {/* Header */}
//       <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
//         <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase flex items-center gap-3">
//           <Package size={32} className="text-blue-600" />
//           Products Management
//         </h1>
//         <p className="text-slate-500 font-medium">
//           Manage fabrics, categories, and items
//         </p>
//       </div>

//       {/* Tabs with Counts */}
//       <div className="flex gap-2 border-b border-slate-200 bg-white p-4 rounded-t-2xl">
//         {["fabric", "category", "item"].map((tab) => (
//           <button
//             key={tab}
//             onClick={() => setActiveTab(tab)}
//             className={`px-6 py-3 rounded-xl font-black uppercase tracking-wider text-sm transition-all ${
//               activeTab === tab
//                 ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
//                 : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
//             }`}
//           >
//             <span className="flex items-center gap-2">
//               {tab === "fabric"
//                 ? "👕 Fabrics"
//                 : tab === "category"
//                   ? "📁 Categories"
//                   : "🧵 Items"}
//               <span
//                 className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
//                   activeTab === tab
//                     ? "bg-white/20 text-white"
//                     : "bg-slate-200 text-slate-600"
//                 }`}
//               >
//                 {tab === "fabric"
//                   ? fabrics?.length || 0
//                   : tab === "category"
//                     ? categories?.length || 0
//                     : items?.length || 0}
//               </span>
//             </span>
//           </button>
//         ))}
//       </div>

//       {/* Content Area */}
//       <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
//         {/* Header with Add Button and Inactive Toggle */}
//         <div className="p-6 border-b border-slate-100 flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             {activeTab === "fabric" && (
//               <Tag size={24} className="text-blue-600" />
//             )}
//             {activeTab === "category" && (
//               <Layers size={24} className="text-blue-600" />
//             )}
//             {activeTab === "item" && (
//               <Package size={24} className="text-blue-600" />
//             )}
//             <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
//               {activeTab === "fabric"
//                 ? "Fabrics"
//                 : activeTab === "category"
//                   ? "Categories"
//                   : "Items"}
//               {showInactive && isAdmin && (
//                 <span className="ml-3 text-sm font-normal text-purple-600">
//                   (Showing inactive)
//                 </span>
//               )}
//             </h2>
//           </div>

//           <div className="flex items-center gap-3">
//             {/* Category Filter for Items */}
//             {activeTab === "item" && (
//               <select
//                 value={selectedCategory}
//                 onChange={(e) => setSelectedCategory(e.target.value)}
//                 className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
//               >
//                 <option value="">All Categories</option>
//                 {categories?.map((cat) => (
//                   <option key={cat._id} value={cat._id}>
//                     {cat.name}
//                   </option>
//                 ))}
//               </select>
//             )}

//             {/* Admin Only: Show Inactive Toggle */}
//             {isAdmin && (
//               <button
//                 onClick={() => setShowInactive(!showInactive)}
//                 className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
//                   showInactive 
//                     ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
//                     : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
//                 }`}
//                 title={showInactive ? 'Showing all items' : 'Show inactive items'}
//               >
//                 {showInactive ? <Eye size={18} /> : <EyeOff size={18} />}
//                 {showInactive ? 'All Items' : 'Hide Inactive'}
//               </button>
//             )}

//             {/* Add Button - Only for Admin and Store Keeper */}
//             {canEdit && (
//               <button
//                 onClick={() => {
//                   resetForms();
//                   setShowModal(true);
//                 }}
//                 className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
//               >
//                 <Plus size={20} />
//                 Add{" "}
//                 {activeTab === "fabric"
//                   ? "Fabric"
//                   : activeTab === "category"
//                     ? "Category"
//                     : "Item"}
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Lists */}
//         <div className="p-6">
//           {/* Fabrics List */}
//           {activeTab === "fabric" && (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {filteredFabrics?.map((fabric) => (
//                 <div
//                   key={fabric._id}
//                   className={`bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-all ${
//                     !fabric.isActive ? 'border-orange-200 opacity-75' : 'border-slate-200'
//                   }`}
//                 >
//                   <div className="relative h-48 bg-slate-100">
//                     {fabric.imageUrl ? (
//                       <img
//                         src={fabric.imageUrl}
//                         alt={fabric.name}
//                         className="w-full h-full object-cover"
//                         onError={(e) =>
//                           (e.target.src =
//                             "https://placehold.co/600x400/cccccc/ffffff?text=No+Image")
//                         }
//                       />
//                     ) : (
//                       <div className="w-full h-full flex items-center justify-center">
//                         <Image size={48} className="text-slate-400" />
//                       </div>
//                     )}
//                     <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
//                       ₹{fabric.pricePerMeter}/m
//                     </div>
//                     {!fabric.isActive && (
//                       <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
//                         Inactive
//                       </div>
//                     )}
//                   </div>
//                   <div className="p-4">
//                     <div className="flex items-start justify-between">
//                       <div>
//                         <h3 className={`font-black text-lg ${!fabric.isActive ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
//                           {fabric.name}
//                         </h3>
//                         <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
//                           <Palette size={14} className="text-blue-500" />
//                           <span>{fabric.color}</span>
//                         </div>
//                       </div>
//                       <div className="flex gap-2">
//                         <button
//                           onClick={() => handleViewDetails(fabric._id)}
//                           className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200"
//                           title="View"
//                         >
//                           <Eye size={16} />
//                         </button>
                        
//                         {canEdit && (
//                           <>
//                             <button
//                               onClick={() => handleToggleStatus(fabric._id, fabric.isActive)}
//                               className={`p-2 rounded-lg ${fabric.isActive ? "bg-green-100 text-green-600 hover:bg-green-200" : "bg-orange-100 text-orange-600 hover:bg-orange-200"}`}
//                               title={fabric.isActive ? "Deactivate" : "Activate"}
//                             >
//                               <Power size={16} />
//                             </button>
//                             <button
//                               onClick={() => handleEdit(fabric)}
//                               className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
//                               title="Edit"
//                             >
//                               <Edit size={16} />
//                             </button>
//                           </>
//                         )}
                        
//                         {canDelete && (
//                           <button
//                             onClick={() => handleDelete(fabric._id)}
//                             className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
//                             title="Delete"
//                           >
//                             <Trash2 size={16} />
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Categories List */}
//           {activeTab === "category" && (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//               {filteredCategories?.map((category) => (
//                 <div
//                   key={category._id}
//                   className={`bg-slate-50 rounded-xl p-4 border hover:shadow-md ${
//                     !category.isActive ? 'border-orange-200 opacity-75' : 'border-slate-200'
//                   }`}
//                 >
//                   <div className="flex items-start justify-between">
//                     <div>
//                       <h3 className={`font-black ${!category.isActive ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
//                         {category.name}
//                       </h3>
//                       <p className="text-xs text-slate-400 mt-1">
//                         ID: {category._id.slice(-6)}
//                       </p>
//                       {!category.isActive && (
//                         <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full mt-1 inline-block">
//                           Inactive
//                         </span>
//                       )}
//                     </div>
//                     <div className="flex gap-2">
//                       <button
//                         onClick={() => handleViewDetails(category._id)}
//                         className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200"
//                       >
//                         <Eye size={16} />
//                       </button>
                      
//                       {canEdit && (
//                         <button
//                           onClick={() => handleEdit(category)}
//                           className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
//                         >
//                           <Edit size={16} />
//                         </button>
//                       )}
                      
//                       {canDelete && (
//                         <button
//                           onClick={() => handleDelete(category._id)}
//                           className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
//                         >
//                           <Trash2 size={16} />
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Items List - ✅ Updated to show price range */}
//           {activeTab === "item" && (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//               {filteredItems?.map((item) => (
//                 <div
//                   key={item._id}
//                   className={`bg-slate-50 rounded-xl p-4 border hover:shadow-md ${
//                     !item.isActive ? 'border-orange-200 opacity-75' : 'border-slate-200'
//                   }`}
//                 >
//                   <div className="flex items-start justify-between">
//                     <div>
//                       <h3 className={`font-black ${!item.isActive ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
//                         {item.name}
//                       </h3>
//                       <p className="text-sm text-slate-600 mt-1">
//                         Category: {item.category?.name}
//                       </p>
//                       {/* ✅ Display price range */}
//                       {item.priceRange && (
//                         <div className="flex items-center gap-1 text-sm text-purple-600 font-bold mt-2">
//                           <IndianRupee size={14} />
//                           <span>{formatPrice(item.priceRange.min)} - {formatPrice(item.priceRange.max)}</span>
//                         </div>
//                       )}
//                       {!item.isActive && (
//                         <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full mt-1 inline-block">
//                           Inactive
//                         </span>
//                       )}
//                     </div>
//                     <div className="flex gap-2">
//                       <button
//                         onClick={() => handleViewDetails(item._id)}
//                         className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200"
//                       >
//                         <Eye size={16} />
//                       </button>
                      
//                       {canEdit && (
//                         <button
//                           onClick={() => handleEdit(item)}
//                           className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
//                         >
//                           <Edit size={16} />
//                         </button>
//                       )}
                      
//                       {canDelete && (
//                         <button
//                           onClick={() => handleDelete(item._id)}
//                           className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
//                         >
//                           <Trash2 size={16} />
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Add/Edit Modal - ✅ Updated item section with price range inputs */}
//       {showModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
//           <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
//             <div className="p-6 border-b border-slate-100 flex items-center justify-between">
//               <h2 className="text-xl font-black text-slate-800">
//                 {editingItem ? "Edit" : "Add"}{" "}
//                 {activeTab === "fabric"
//                   ? "Fabric"
//                   : activeTab === "category"
//                     ? "Category"
//                     : "Item"}
//               </h2>
//               <button
//                 onClick={() => {
//                   setShowModal(false);
//                   resetForms();
//                 }}
//                 className="p-2 hover:bg-slate-100 rounded-lg"
//               >
//                 <X size={20} className="text-slate-500" />
//               </button>
//             </div>

//             <form
//               onSubmit={
//                 activeTab === "fabric"
//                   ? handleFabricSubmit
//                   : activeTab === "category"
//                     ? handleCategorySubmit
//                     : handleItemSubmit
//               }
//               className="p-6 space-y-4"
//             >
//               {activeTab === "fabric" && (
//                 <>
//                   <input
//                     type="text"
//                     placeholder="Fabric Name"
//                     value={fabricForm.name}
//                     onChange={(e) =>
//                       setFabricForm({ ...fabricForm, name: e.target.value })
//                     }
//                     className="w-full px-4 py-3 bg-slate-50 border rounded-xl"
//                     required
//                   />
//                   <input
//                     type="text"
//                     placeholder="Color"
//                     value={fabricForm.color}
//                     onChange={(e) =>
//                       setFabricForm({ ...fabricForm, color: e.target.value })
//                     }
//                     className="w-full px-4 py-3 bg-slate-50 border rounded-xl"
//                     required
//                   />
//                   <input
//                     type="number"
//                     placeholder="Price per Meter (₹)"
//                     value={fabricForm.pricePerMeter}
//                     onChange={(e) =>
//                       setFabricForm({
//                         ...fabricForm,
//                         pricePerMeter: e.target.value,
//                       })
//                     }
//                     className="w-full px-4 py-3 bg-slate-50 border rounded-xl"
//                     required
//                   />

//                   {fabricForm.imagePreview && (
//                     <div className="relative">
//                       <img
//                         src={fabricForm.imagePreview}
//                         alt="Preview"
//                         className="w-full h-40 object-cover rounded-lg border"
//                       />
//                       <button
//                         type="button"
//                         onClick={() =>
//                           setFabricForm((prev) => ({
//                             ...prev,
//                             imageFile: null,
//                             imagePreview: null,
//                           }))
//                         }
//                         className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
//                       >
//                         ✕
//                       </button>
//                     </div>
//                   )}
//                   <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer hover:bg-slate-50">
//                     <Upload className="w-8 h-8 mb-2 text-slate-400" />
//                     <p className="text-sm text-slate-500">
//                       Click to upload image
//                     </p>
//                     <input
//                       type="file"
//                       className="hidden"
//                       accept="image/*"
//                       onChange={handleImageChange}
//                     />
//                   </label>
//                 </>
//               )}

//               {activeTab === "category" && (
//                 <input
//                   type="text"
//                   placeholder="Category Name"
//                   value={categoryForm.name}
//                   onChange={(e) => setCategoryForm({ name: e.target.value })}
//                   className="w-full px-4 py-3 bg-slate-50 border rounded-xl"
//                   required
//                 />
//               )}

//               {activeTab === "item" && (
//                 <>
//                   <input
//                     type="text"
//                     placeholder="Item Name"
//                     value={itemForm.name}
//                     onChange={(e) =>
//                       setItemForm({ ...itemForm, name: e.target.value })
//                     }
//                     className="w-full px-4 py-3 bg-slate-50 border rounded-xl"
//                     required
//                   />
//                   <select
//                     value={itemForm.categoryId}
//                     onChange={(e) =>
//                       setItemForm({ ...itemForm, categoryId: e.target.value })
//                     }
//                     className="w-full px-4 py-3 bg-slate-50 border rounded-xl"
//                     required
//                   >
//                     <option value="">Select Category</option>
//                     {categories?.map((cat) => (
//                       <option key={cat._id} value={cat._id}>
//                         {cat.name}
//                       </option>
//                     ))}
//                   </select>
                  
//                   {/* ✅ Price Range Inputs */}
//                   <div className="grid grid-cols-2 gap-3">
//                     <div>
//                       <label className="block text-xs font-medium text-slate-500 mb-1">
//                         Min Price (₹)
//                       </label>
//                       <input
//                         type="number"
//                         placeholder="Min Price"
//                         value={itemForm.priceRange.min}
//                         onChange={(e) =>
//                           setItemForm({
//                             ...itemForm,
//                             priceRange: {
//                               ...itemForm.priceRange,
//                               min: parseFloat(e.target.value) || 0
//                             }
//                           })
//                         }
//                         min="0"
//                         step="10"
//                         className="w-full px-4 py-3 bg-slate-50 border rounded-xl"
//                         required
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-xs font-medium text-slate-500 mb-1">
//                         Max Price (₹)
//                       </label>
//                       <input
//                         type="number"
//                         placeholder="Max Price"
//                         value={itemForm.priceRange.max}
//                         onChange={(e) =>
//                           setItemForm({
//                             ...itemForm,
//                             priceRange: {
//                               ...itemForm.priceRange,
//                               max: parseFloat(e.target.value) || 0
//                             }
//                           })
//                         }
//                         min="0"
//                         step="10"
//                         className="w-full px-4 py-3 bg-slate-50 border rounded-xl"
//                         required
//                       />
//                     </div>
//                   </div>
//                 </>
//               )}

//               <div className="flex gap-3 pt-4">
//                 <button
//                   type="submit"
//                   className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-black hover:bg-blue-700 flex items-center justify-center gap-2"
//                 >
//                   <Save size={18} /> {editingItem ? "Update" : "Save"}
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowModal(false);
//                     resetForms();
//                   }}
//                   className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-black hover:bg-slate-300"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }










// import React, { useState, useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import {
//   Package,
//   Plus,
//   Edit,
//   Trash2,
//   X,
//   Save,
//   Image,
//   Palette,
//   Tag,
//   Layers,
//   Upload,
//   Eye,
//   Power,
//   EyeOff,
//   IndianRupee,
//   Grid,
//   Menu,
//   Filter
// } from "lucide-react";
// import {
//   fetchAllFabrics,
//   createFabric,
//   updateFabric,
//   deleteFabric,
//   toggleFabricStatus,
// } from "../../../features/fabric/fabricSlice";
// import {
//   fetchAllCategories,
//   createCategory,
//   updateCategory,
//   deleteCategory,
// } from "../../../features/category/categorySlice";
// import {
//   fetchItems,
//   createItem,
//   updateItem,
//   deleteItem,
// } from "../../../features/item/itemSlice";
// import showToast from "../../../utils/toast";

// export default function Products() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState("fabric");

//   // Mobile state
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const [mobileView, setMobileView] = useState("grid"); // 'grid' or 'list'

//   // Redux state
//   const { fabrics } = useSelector((state) => state.fabric);
//   const { categories } = useSelector((state) => state.category);
//   const { items } = useSelector((state) => state.item);
//   const { user } = useSelector((state) => state.auth);

//   // Get base path based on user role
//   const basePath = user?.role === "ADMIN" ? "/admin" : 
//                    user?.role === "STORE_KEEPER" ? "/storekeeper" : 
//                    "/cuttingmaster";

//   // UI state
//   const [showModal, setShowModal] = useState(false);
//   const [editingItem, setEditingItem] = useState(null);
//   const [selectedCategory, setSelectedCategory] = useState("");
//   const [showInactive, setShowInactive] = useState(false);

//   const isAdmin = user?.role === "ADMIN";
//   const isStoreKeeper = user?.role === "STORE_KEEPER";
//   const canEdit = isAdmin || isStoreKeeper; // Both Admin and Store Keeper can edit
//   const canDelete = isAdmin; // Only Admin can delete

//   // Form states
//   const [fabricForm, setFabricForm] = useState({
//     name: "",
//     color: "",
//     pricePerMeter: "",
//     imageFile: null,
//     imagePreview: null,
//   });
//   const [categoryForm, setCategoryForm] = useState({ name: "" });
  
//   // Updated itemForm with priceRange
//   const [itemForm, setItemForm] = useState({ 
//     name: "", 
//     categoryId: "",
//     priceRange: {
//       min: 0,
//       max: 0
//     }
//   });

//   // Load data
//   useEffect(() => {
//     dispatch(fetchAllFabrics());
//     dispatch(fetchAllCategories());
//   }, [dispatch]);

//   useEffect(() => {
//     if (selectedCategory) {
//       dispatch(fetchItems(selectedCategory));
//     } else {
//       dispatch(fetchItems());
//     }
//   }, [selectedCategory, dispatch]);

//   // ========== FABRIC FUNCTIONS ==========
//   const handleFabricSubmit = async (e) => {
//     e.preventDefault();
//     if (!canEdit) {
//       showToast.error("You don't have permission to edit fabrics");
//       return;
//     }
//     if (!fabricForm.name || !fabricForm.color || !fabricForm.pricePerMeter) {
//       showToast.error("Please fill all required fields");
//       return;
//     }

//     try {
//       const formData = new FormData();
//       formData.append("name", fabricForm.name);
//       formData.append("color", fabricForm.color);
//       formData.append("pricePerMeter", fabricForm.pricePerMeter);
//       if (fabricForm.imageFile) formData.append("image", fabricForm.imageFile);

//       if (editingItem) {
//         await dispatch(
//           updateFabric({ id: editingItem._id, fabricData: formData }),
//         ).unwrap();
//         showToast.success("Fabric updated successfully! ✅");
//       } else {
//         await dispatch(createFabric(formData)).unwrap();
//         showToast.success("Fabric created successfully! 🎉");
//       }
//       setShowModal(false);
//       resetForms();
//     } catch (error) {
//       showToast.error(error || "Operation failed");
//     }
//   };

//   // ========== CATEGORY FUNCTIONS ==========
//   const handleCategorySubmit = async (e) => {
//     e.preventDefault();
//     if (!canEdit) {
//       showToast.error("You don't have permission to edit categories");
//       return;
//     }
//     if (!categoryForm.name) {
//       showToast.error("Category name is required");
//       return;
//     }

//     try {
//       if (editingItem) {
//         await dispatch(
//           updateCategory({ id: editingItem._id, categoryData: categoryForm }),
//         ).unwrap();
//         showToast.success("Category updated successfully! ✅");
//       } else {
//         await dispatch(createCategory(categoryForm)).unwrap();
//         showToast.success("Category created successfully! 🎉");
//       }
//       setShowModal(false);
//       resetForms();
//     } catch (error) {
//       showToast.error(error || "Operation failed");
//     }
//   };

//   // ========== ITEM FUNCTIONS ==========
//   const handleItemSubmit = async (e) => {
//     e.preventDefault();
//     if (!canEdit) {
//       showToast.error("You don't have permission to edit items");
//       return;
//     }
//     if (!itemForm.name || !itemForm.categoryId) {
//       showToast.error("Please fill all required fields");
//       return;
//     }

//     // Validate price range
//     if (itemForm.priceRange.min < 0 || itemForm.priceRange.max < 0) {
//       showToast.error("Price cannot be negative");
//       return;
//     }
//     if (itemForm.priceRange.min > itemForm.priceRange.max) {
//       showToast.error("Minimum price cannot be greater than maximum price");
//       return;
//     }

//     try {
//       if (editingItem) {
//         // Include priceRange in update
//         await dispatch(
//           updateItem({
//             id: editingItem._id,
//             itemData: { 
//               name: itemForm.name,
//               priceRange: itemForm.priceRange
//             },
//           }),
//         ).unwrap();
//         showToast.success("Item updated successfully! ✅");
//       } else {
//         // Include priceRange in create
//         await dispatch(createItem({
//           name: itemForm.name,
//           categoryId: itemForm.categoryId,
//           priceRange: itemForm.priceRange
//         })).unwrap();
//         showToast.success("Item created successfully! 🎉");
//       }
//       setShowModal(false);
//       resetForms();
//     } catch (error) {
//       showToast.error(error || "Operation failed");
//     }
//   };

//   const resetForms = () => {
//     setFabricForm({
//       name: "",
//       color: "",
//       pricePerMeter: "",
//       imageFile: null,
//       imagePreview: null,
//     });
//     setCategoryForm({ name: "" });
//     setItemForm({ 
//       name: "", 
//       categoryId: "",
//       priceRange: {
//         min: 0,
//         max: 0
//       }
//     });
//     setEditingItem(null);
//   };

//   const handleEdit = (item) => {
//     if (!canEdit) {
//       showToast.error("You don't have permission to edit");
//       return;
//     }
//     setEditingItem(item);
//     if (activeTab === "fabric") {
//       setFabricForm({
//         name: item.name,
//         color: item.color,
//         pricePerMeter: item.pricePerMeter,
//         imageFile: null,
//         imagePreview: item.imageUrl,
//       });
//     } else if (activeTab === "category") {
//       setCategoryForm({ name: item.name });
//     } else {
//       // Include priceRange when editing item
//       setItemForm({ 
//         name: item.name, 
//         categoryId: item.category?._id || "",
//         priceRange: {
//           min: item.priceRange?.min || 0,
//           max: item.priceRange?.max || 0
//         }
//       });
//     }
//     setShowModal(true);
//   };

//   const handleDelete = async (id) => {
//     if (!canDelete) {
//       showToast.error("Only Admin can delete items");
//       return;
//     }
//     if (window.confirm("Are you sure you want to delete this item?")) {
//       try {
//         if (activeTab === "fabric") {
//           await dispatch(deleteFabric(id)).unwrap();
//           showToast.success("Fabric deleted successfully! 🗑️");
//         } else if (activeTab === "category") {
//           await dispatch(deleteCategory(id)).unwrap();
//           showToast.success("Category deleted successfully! 🗑️");
//         } else {
//           await dispatch(deleteItem(id)).unwrap();
//           showToast.success("Item deleted successfully! 🗑️");
//         }
//       } catch (error) {
//         showToast.error(error || "Failed to delete");
//       }
//     }
//   };

//   const handleToggleStatus = async (id, currentStatus) => {
//     if (!canEdit) {
//       showToast.error("You don't have permission to change status");
//       return;
//     }
//     try {
//       if (activeTab === "fabric") {
//         await dispatch(toggleFabricStatus(id)).unwrap();
//         showToast.success(`Fabric ${currentStatus ? 'deactivated' : 'activated'} successfully`);
//       }
//       // Add similar for categories and items when you have toggle functions
//     } catch (error) {
//       showToast.error("Failed to toggle status");
//     }
//   };

//   // Handle View Details - with basePath
//   const handleViewDetails = (id) => {
//     if (activeTab === "fabric") navigate(`${basePath}/fabrics/${id}`);
//     else if (activeTab === "category") navigate(`${basePath}/categories/${id}`);
//     else navigate(`${basePath}/items/${id}`);
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       if (file.size > 5 * 1024 * 1024) {
//         showToast.error("Image size should be less than 5MB");
//         return;
//       }
//       if (!file.type.startsWith("image/")) {
//         showToast.error("Please select an image file");
//         return;
//       }
//       const reader = new FileReader();
//       reader.onloadend = () =>
//         setFabricForm((prev) => ({
//           ...prev,
//           imageFile: file,
//           imagePreview: reader.result,
//         }));
//       reader.readAsDataURL(file);
//     }
//   };

//   // Format price helper function
//   const formatPrice = (price) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0
//     }).format(price);
//   };

//   // Filter items based on showInactive toggle (for Admin only)
//   const filteredFabrics = (isAdmin && showInactive) 
//     ? fabrics 
//     : fabrics?.filter(f => f.isActive !== false);
  
//   const filteredCategories = (isAdmin && showInactive) 
//     ? categories 
//     : categories?.filter(c => c.isActive !== false);
  
//   const filteredItems = (isAdmin && showInactive) 
//     ? items 
//     : items?.filter(i => i.isActive !== false);

//   return (
//     <div className="min-h-screen bg-slate-50">
//       {/* ===== MOBILE HEADER ===== */}
//       <div className="lg:hidden bg-white border-b border-slate-200 sticky top-0 z-30">
//         <div className="flex items-center justify-between px-4 py-3">
//           <h1 className="text-lg font-black text-slate-800 flex items-center gap-2">
//             <Package size={20} className="text-blue-600" />
//             Products
//           </h1>
//           <div className="flex items-center gap-2">
//             {canEdit && (
//               <button
//                 onClick={() => {
//                   resetForms();
//                   setShowModal(true);
//                 }}
//                 className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
//                 style={{ minWidth: '36px', minHeight: '36px' }}
//               >
//                 <Plus size={18} />
//               </button>
//             )}
//             <button
//               onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//               className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition flex items-center justify-center"
//               style={{ minWidth: '36px', minHeight: '36px' }}
//             >
//               <Menu size={18} />
//             </button>
//           </div>
//         </div>

//         {/* Mobile Tabs */}
//         <div className="flex gap-1 px-4 pb-3 overflow-x-auto">
//           {["fabric", "category", "item"].map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               className={`px-3 py-2 rounded-lg font-bold text-xs whitespace-nowrap flex items-center gap-1 transition-all ${
//                 activeTab === tab
//                   ? "bg-blue-600 text-white shadow-lg"
//                   : "bg-slate-100 text-slate-600"
//               }`}
//             >
//               {tab === "fabric" ? "👕 Fabrics" : tab === "category" ? "📁 Categories" : "🧵 Items"}
//               <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
//                 activeTab === tab ? "bg-white/20" : "bg-slate-200"
//               }`}>
//                 {tab === "fabric"
//                   ? fabrics?.length || 0
//                   : tab === "category"
//                     ? categories?.length || 0
//                     : items?.length || 0}
//               </span>
//             </button>
//           ))}
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
//                   setShowInactive(!showInactive);
//                   setMobileMenuOpen(false);
//                 }}
//                 className="w-full flex items-center gap-2 px-4 py-3 hover:bg-slate-100 rounded-xl font-medium"
//               >
//                 {showInactive ? <Eye size={16} /> : <EyeOff size={16} />}
//                 {showInactive ? 'Show All' : 'Hide Inactive'}
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 lg:py-8">
//         {/* ===== DESKTOP HEADER (Hidden on mobile) ===== */}
//         <div className="hidden lg:block bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-8">
//           <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase flex items-center gap-3">
//             <Package size={32} className="text-blue-600" />
//             Products Management
//           </h1>
//           <p className="text-slate-500 font-medium mt-2">
//             Manage fabrics, categories, and items
//           </p>
//         </div>

//         {/* Desktop Tabs with Counts - Hidden on Mobile */}
//         <div className="hidden lg:flex gap-2 border-b border-slate-200 bg-white p-4 rounded-t-2xl mb-6">
//           {["fabric", "category", "item"].map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               className={`px-6 py-3 rounded-xl font-black uppercase tracking-wider text-sm transition-all ${
//                 activeTab === tab
//                   ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
//                   : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
//               }`}
//             >
//               <span className="flex items-center gap-2">
//                 {tab === "fabric"
//                   ? "👕 Fabrics"
//                   : tab === "category"
//                     ? "📁 Categories"
//                     : "🧵 Items"}
//                 <span
//                   className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
//                     activeTab === tab
//                       ? "bg-white/20 text-white"
//                       : "bg-slate-200 text-slate-600"
//                   }`}
//                 >
//                   {tab === "fabric"
//                     ? fabrics?.length || 0
//                     : tab === "category"
//                       ? categories?.length || 0
//                       : items?.length || 0}
//                 </span>
//               </span>
//             </button>
//           ))}
//         </div>

//         {/* Content Area */}
//         <div className="bg-white rounded-xl lg:rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
//           {/* Header with Actions */}
//           <div className="p-4 lg:p-6 border-b border-slate-100">
//             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
//               <div className="flex items-center gap-2 lg:gap-3">
//                 {activeTab === "fabric" && <Tag size={18} className="text-blue-600 lg:w-6 lg:h-6" />}
//                 {activeTab === "category" && <Layers size={18} className="text-blue-600 lg:w-6 lg:h-6" />}
//                 {activeTab === "item" && <Package size={18} className="text-blue-600 lg:w-6 lg:h-6" />}
//                 <h2 className="text-base lg:text-xl font-black text-slate-800 uppercase tracking-tight">
//                   {activeTab === "fabric"
//                     ? "Fabrics"
//                     : activeTab === "category"
//                       ? "Categories"
//                       : "Items"}
//                 </h2>
//               </div>

//               <div className="flex flex-col sm:flex-row gap-3">
//                 {/* Category Filter for Items - Desktop */}
//                 {activeTab === "item" && (
//                   <select
//                     value={selectedCategory}
//                     onChange={(e) => setSelectedCategory(e.target.value)}
//                     className="w-full sm:w-auto px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm"
//                   >
//                     <option value="">All Categories</option>
//                     {categories?.map((cat) => (
//                       <option key={cat._id} value={cat._id}>
//                         {cat.name}
//                       </option>
//                     ))}
//                   </select>
//                 )}

//                 {/* Admin Only: Show Inactive Toggle - Desktop */}
//                 {isAdmin && (
//                   <button
//                     onClick={() => setShowInactive(!showInactive)}
//                     className={`w-full sm:w-auto px-4 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm ${
//                       showInactive 
//                         ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
//                         : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
//                     }`}
//                     title={showInactive ? 'Showing all items' : 'Show inactive items'}
//                   >
//                     {showInactive ? <Eye size={16} /> : <EyeOff size={16} />}
//                     <span className="hidden sm:inline">{showInactive ? 'All Items' : 'Hide Inactive'}</span>
//                   </button>
//                 )}

//                 {/* Add Button - Desktop */}
//                 {canEdit && (
//                   <button
//                     onClick={() => {
//                       resetForms();
//                       setShowModal(true);
//                     }}
//                     className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 text-sm"
//                   >
//                     <Plus size={18} />
//                     <span className="hidden sm:inline">Add {activeTab === "fabric" ? "Fabric" : activeTab === "category" ? "Category" : "Item"}</span>
//                   </button>
//                 )}
//               </div>
//             </div>

//             {/* Mobile Category Filter for Items */}
//             {activeTab === "item" && (
//               <div className="mt-3 lg:hidden">
//                 <select
//                   value={selectedCategory}
//                   onChange={(e) => setSelectedCategory(e.target.value)}
//                   className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm"
//                 >
//                   <option value="">All Categories</option>
//                   {categories?.map((cat) => (
//                     <option key={cat._id} value={cat._id}>
//                       {cat.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             )}
//           </div>

//           {/* Lists */}
//           <div className="p-4 lg:p-6">
//             {/* Fabrics List - Responsive Grid */}
//             {activeTab === "fabric" && (
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
//                 {filteredFabrics?.map((fabric) => (
//                   <div
//                     key={fabric._id}
//                     className={`bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-all ${
//                       !fabric.isActive ? 'border-orange-200 opacity-75' : 'border-slate-200'
//                     }`}
//                   >
//                     <div className="relative h-40 lg:h-48 bg-slate-100">
//                       {fabric.imageUrl ? (
//                         <img
//                           src={fabric.imageUrl}
//                           alt={fabric.name}
//                           className="w-full h-full object-cover"
//                           onError={(e) =>
//                             (e.target.src =
//                               "https://placehold.co/600x400/cccccc/ffffff?text=No+Image")
//                           }
//                         />
//                       ) : (
//                         <div className="w-full h-full flex items-center justify-center">
//                           <Image size={32} className="text-slate-400 lg:w-12 lg:h-12" />
//                         </div>
//                       )}
//                       <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs lg:text-sm font-bold">
//                         ₹{fabric.pricePerMeter}/m
//                       </div>
//                       {!fabric.isActive && (
//                         <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-full text-[10px] lg:text-xs font-bold">
//                           Inactive
//                         </div>
//                       )}
//                     </div>
//                     <div className="p-3 lg:p-4">
//                       <div className="flex items-start justify-between">
//                         <div className="min-w-0 flex-1">
//                           <h3 className={`font-black text-sm lg:text-base truncate ${!fabric.isActive ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
//                             {fabric.name}
//                           </h3>
//                           <div className="flex items-center gap-1 text-xs lg:text-sm text-slate-600 mt-1">
//                             <Palette size={12} className="text-blue-500 flex-shrink-0" />
//                             <span className="truncate">{fabric.color}</span>
//                           </div>
//                         </div>
//                         <div className="flex gap-1 lg:gap-2 ml-2 flex-shrink-0">
//                           <button
//                             onClick={() => handleViewDetails(fabric._id)}
//                             className="w-7 h-7 lg:w-8 lg:h-8 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-all flex items-center justify-center"
//                             title="View"
//                           >
//                             <Eye size={12} className="lg:w-4 lg:h-4" />
//                           </button>
                          
//                           {canEdit && (
//                             <>
//                               <button
//                                 onClick={() => handleToggleStatus(fabric._id, fabric.isActive)}
//                                 className={`w-7 h-7 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center transition-all ${
//                                   fabric.isActive 
//                                     ? "bg-green-100 text-green-600 hover:bg-green-200" 
//                                     : "bg-orange-100 text-orange-600 hover:bg-orange-200"
//                                 }`}
//                                 title={fabric.isActive ? "Deactivate" : "Activate"}
//                               >
//                                 <Power size={12} className="lg:w-4 lg:h-4" />
//                               </button>
//                               <button
//                                 onClick={() => handleEdit(fabric)}
//                                 className="w-7 h-7 lg:w-8 lg:h-8 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all flex items-center justify-center"
//                                 title="Edit"
//                               >
//                                 <Edit size={12} className="lg:w-4 lg:h-4" />
//                               </button>
//                             </>
//                           )}
                          
//                           {canDelete && (
//                             <button
//                               onClick={() => handleDelete(fabric._id)}
//                               className="w-7 h-7 lg:w-8 lg:h-8 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all flex items-center justify-center"
//                               title="Delete"
//                             >
//                               <Trash2 size={12} className="lg:w-4 lg:h-4" />
//                             </button>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}

//             {/* Categories List - Responsive Grid */}
//             {activeTab === "category" && (
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
//                 {filteredCategories?.map((category) => (
//                   <div
//                     key={category._id}
//                     className={`bg-slate-50 rounded-xl p-4 border hover:shadow-md ${
//                       !category.isActive ? 'border-orange-200 opacity-75' : 'border-slate-200'
//                     }`}
//                   >
//                     <div className="flex items-start justify-between">
//                       <div className="min-w-0 flex-1">
//                         <h3 className={`font-black truncate ${!category.isActive ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
//                           {category.name}
//                         </h3>
//                         <p className="text-[10px] lg:text-xs text-slate-400 mt-1 truncate">
//                           ID: {category._id.slice(-6)}
//                         </p>
//                         {!category.isActive && (
//                           <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full mt-1 inline-block">
//                             Inactive
//                           </span>
//                         )}
//                       </div>
//                       <div className="flex gap-1 lg:gap-2 ml-2 flex-shrink-0">
//                         <button
//                           onClick={() => handleViewDetails(category._id)}
//                           className="w-7 h-7 lg:w-8 lg:h-8 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-all flex items-center justify-center"
//                         >
//                           <Eye size={12} className="lg:w-4 lg:h-4" />
//                         </button>
                        
//                         {canEdit && (
//                           <button
//                             onClick={() => handleEdit(category)}
//                             className="w-7 h-7 lg:w-8 lg:h-8 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all flex items-center justify-center"
//                           >
//                             <Edit size={12} className="lg:w-4 lg:h-4" />
//                           </button>
//                         )}
                        
//                         {canDelete && (
//                           <button
//                             onClick={() => handleDelete(category._id)}
//                             className="w-7 h-7 lg:w-8 lg:h-8 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all flex items-center justify-center"
//                           >
//                             <Trash2 size={12} className="lg:w-4 lg:h-4" />
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}

//             {/* Items List - ✅ Updated to show price range */}
//             {activeTab === "item" && (
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
//                 {filteredItems?.map((item) => (
//                   <div
//                     key={item._id}
//                     className={`bg-slate-50 rounded-xl p-4 border hover:shadow-md ${
//                       !item.isActive ? 'border-orange-200 opacity-75' : 'border-slate-200'
//                     }`}
//                   >
//                     <div className="flex items-start justify-between">
//                       <div className="min-w-0 flex-1">
//                         <h3 className={`font-black truncate ${!item.isActive ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
//                           {item.name}
//                         </h3>
//                         <p className="text-xs lg:text-sm text-slate-600 mt-1 truncate">
//                           {item.category?.name}
//                         </p>
//                         {/* Display price range */}
//                         {item.priceRange && (
//                           <div className="flex items-center gap-1 text-xs lg:text-sm text-purple-600 font-bold mt-2">
//                             <IndianRupee size={12} className="flex-shrink-0" />
//                             <span className="truncate">{formatPrice(item.priceRange.min)} - {formatPrice(item.priceRange.max)}</span>
//                           </div>
//                         )}
//                         {!item.isActive && (
//                           <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full mt-1 inline-block">
//                             Inactive
//                           </span>
//                         )}
//                       </div>
//                       <div className="flex gap-1 lg:gap-2 ml-2 flex-shrink-0">
//                         <button
//                           onClick={() => handleViewDetails(item._id)}
//                           className="w-7 h-7 lg:w-8 lg:h-8 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-all flex items-center justify-center"
//                         >
//                           <Eye size={12} className="lg:w-4 lg:h-4" />
//                         </button>
                        
//                         {canEdit && (
//                           <button
//                             onClick={() => handleEdit(item)}
//                             className="w-7 h-7 lg:w-8 lg:h-8 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all flex items-center justify-center"
//                           >
//                             <Edit size={12} className="lg:w-4 lg:h-4" />
//                           </button>
//                         )}
                        
//                         {canDelete && (
//                           <button
//                             onClick={() => handleDelete(item._id)}
//                             className="w-7 h-7 lg:w-8 lg:h-8 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all flex items-center justify-center"
//                           >
//                             <Trash2 size={12} className="lg:w-4 lg:h-4" />
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Add/Edit Modal - Responsive */}
//       {showModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
//           <div className="bg-white w-full max-w-md rounded-xl lg:rounded-2xl shadow-2xl overflow-hidden mx-4">
//             <div className="p-4 lg:p-6 border-b border-slate-100 flex items-center justify-between">
//               <h2 className="text-base lg:text-xl font-black text-slate-800">
//                 {editingItem ? "Edit" : "Add"}{" "}
//                 {activeTab === "fabric"
//                   ? "Fabric"
//                   : activeTab === "category"
//                     ? "Category"
//                     : "Item"}
//               </h2>
//               <button
//                 onClick={() => {
//                   setShowModal(false);
//                   resetForms();
//                 }}
//                 className="p-2 hover:bg-slate-100 rounded-lg flex items-center justify-center"
//               >
//                 <X size={18} className="text-slate-500" />
//               </button>
//             </div>

//             <form
//               onSubmit={
//                 activeTab === "fabric"
//                   ? handleFabricSubmit
//                   : activeTab === "category"
//                     ? handleCategorySubmit
//                     : handleItemSubmit
//               }
//               className="p-4 lg:p-6 space-y-3 lg:space-y-4"
//             >
//               {activeTab === "fabric" && (
//                 <>
//                   <input
//                     type="text"
//                     placeholder="Fabric Name"
//                     value={fabricForm.name}
//                     onChange={(e) =>
//                       setFabricForm({ ...fabricForm, name: e.target.value })
//                     }
//                     className="w-full px-3 lg:px-4 py-2.5 lg:py-3 bg-slate-50 border rounded-lg lg:rounded-xl text-sm lg:text-base"
//                     required
//                   />
//                   <input
//                     type="text"
//                     placeholder="Color"
//                     value={fabricForm.color}
//                     onChange={(e) =>
//                       setFabricForm({ ...fabricForm, color: e.target.value })
//                     }
//                     className="w-full px-3 lg:px-4 py-2.5 lg:py-3 bg-slate-50 border rounded-lg lg:rounded-xl text-sm lg:text-base"
//                     required
//                   />
//                   <input
//                     type="number"
//                     placeholder="Price per Meter (₹)"
//                     value={fabricForm.pricePerMeter}
//                     onChange={(e) =>
//                       setFabricForm({
//                         ...fabricForm,
//                         pricePerMeter: e.target.value,
//                       })
//                     }
//                     className="w-full px-3 lg:px-4 py-2.5 lg:py-3 bg-slate-50 border rounded-lg lg:rounded-xl text-sm lg:text-base"
//                     required
//                   />

//                   {fabricForm.imagePreview && (
//                     <div className="relative">
//                       <img
//                         src={fabricForm.imagePreview}
//                         alt="Preview"
//                         className="w-full h-32 lg:h-40 object-cover rounded-lg border"
//                       />
//                       <button
//                         type="button"
//                         onClick={() =>
//                           setFabricForm((prev) => ({
//                             ...prev,
//                             imageFile: null,
//                             imagePreview: null,
//                           }))
//                         }
//                         className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm"
//                       >
//                         ✕
//                       </button>
//                     </div>
//                   )}
//                   <label className="flex flex-col items-center justify-center w-full h-24 lg:h-32 border-2 border-dashed rounded-lg lg:rounded-xl cursor-pointer hover:bg-slate-50">
//                     <Upload className="w-6 h-6 lg:w-8 lg:h-8 mb-1 lg:mb-2 text-slate-400" />
//                     <p className="text-xs lg:text-sm text-slate-500">
//                       Click to upload image
//                     </p>
//                     <input
//                       type="file"
//                       className="hidden"
//                       accept="image/*"
//                       onChange={handleImageChange}
//                     />
//                   </label>
//                 </>
//               )}

//               {activeTab === "category" && (
//                 <input
//                   type="text"
//                   placeholder="Category Name"
//                   value={categoryForm.name}
//                   onChange={(e) => setCategoryForm({ name: e.target.value })}
//                   className="w-full px-3 lg:px-4 py-2.5 lg:py-3 bg-slate-50 border rounded-lg lg:rounded-xl text-sm lg:text-base"
//                   required
//                 />
//               )}

//               {activeTab === "item" && (
//                 <>
//                   <input
//                     type="text"
//                     placeholder="Item Name"
//                     value={itemForm.name}
//                     onChange={(e) =>
//                       setItemForm({ ...itemForm, name: e.target.value })
//                     }
//                     className="w-full px-3 lg:px-4 py-2.5 lg:py-3 bg-slate-50 border rounded-lg lg:rounded-xl text-sm lg:text-base"
//                     required
//                   />
//                   <select
//                     value={itemForm.categoryId}
//                     onChange={(e) =>
//                       setItemForm({ ...itemForm, categoryId: e.target.value })
//                     }
//                     className="w-full px-3 lg:px-4 py-2.5 lg:py-3 bg-slate-50 border rounded-lg lg:rounded-xl text-sm lg:text-base"
//                     required
//                   >
//                     <option value="">Select Category</option>
//                     {categories?.map((cat) => (
//                       <option key={cat._id} value={cat._id}>
//                         {cat.name}
//                       </option>
//                     ))}
//                   </select>
                  
//                   {/* Price Range Inputs */}
//                   <div className="grid grid-cols-2 gap-2 lg:gap-3">
//                     <div>
//                       <label className="block text-[10px] lg:text-xs font-medium text-slate-500 mb-1">
//                         Min (₹)
//                       </label>
//                       <input
//                         type="number"
//                         placeholder="Min"
//                         value={itemForm.priceRange.min}
//                         onChange={(e) =>
//                           setItemForm({
//                             ...itemForm,
//                             priceRange: {
//                               ...itemForm.priceRange,
//                               min: parseFloat(e.target.value) || 0
//                             }
//                           })
//                         }
//                         min="0"
//                         step="10"
//                         className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-slate-50 border rounded-lg lg:rounded-xl text-sm lg:text-base"
//                         required
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-[10px] lg:text-xs font-medium text-slate-500 mb-1">
//                         Max (₹)
//                       </label>
//                       <input
//                         type="number"
//                         placeholder="Max"
//                         value={itemForm.priceRange.max}
//                         onChange={(e) =>
//                           setItemForm({
//                             ...itemForm,
//                             priceRange: {
//                               ...itemForm.priceRange,
//                               max: parseFloat(e.target.value) || 0
//                             }
//                           })
//                         }
//                         min="0"
//                         step="10"
//                         className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-slate-50 border rounded-lg lg:rounded-xl text-sm lg:text-base"
//                         required
//                       />
//                     </div>
//                   </div>
//                 </>
//               )}

//               <div className="flex flex-col sm:flex-row gap-2 lg:gap-3 pt-3 lg:pt-4">
//                 <button
//                   type="submit"
//                   className="flex-1 px-4 lg:px-6 py-2.5 lg:py-3 bg-blue-600 text-white rounded-lg lg:rounded-xl font-black text-sm lg:text-base hover:bg-blue-700 flex items-center justify-center gap-2 transition-all order-2 sm:order-1"
//                 >
//                   <Save size={16} className="lg:w-[18px] lg:h-[18px]" />
//                   {editingItem ? "Update" : "Save"}
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowModal(false);
//                     resetForms();
//                   }}
//                   className="flex-1 px-4 lg:px-6 py-2.5 lg:py-3 bg-slate-200 text-slate-700 rounded-lg lg:rounded-xl font-black text-sm lg:text-base hover:bg-slate-300 transition-all order-1 sm:order-2"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }








import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Package,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  Image,
  Palette,
  Tag,
  Layers,
  Upload,
  Eye,
  Power,
  EyeOff,
  IndianRupee,
  Grid,
  Menu,
  Filter,
  Home,
  LayoutGrid,
  ShoppingBag,
  Users,
  Settings
} from "lucide-react";
import {
  fetchAllFabrics,
  createFabric,
  updateFabric,
  deleteFabric,
  toggleFabricStatus,
} from "../../../features/fabric/fabricSlice";
import {
  fetchAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../../features/category/categorySlice";
import {
  fetchItems,
  createItem,
  updateItem,
  deleteItem,
} from "../../../features/item/itemSlice";
import API from "../../../app/axios";
import showToast from "../../../utils/toast";

const PRODUCT_TABS = ["fabric", "category", "item", "inventory"];

export default function Products() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(() =>
    PRODUCT_TABS.includes(tabFromUrl) ? tabFromUrl : "fabric",
  );

  // Mobile state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileView, setMobileView] = useState("grid"); // 'grid' or 'list'

  // Redux state
  const { fabrics } = useSelector((state) => state.fabric);
  const { categories } = useSelector((state) => state.category);
  const { items } = useSelector((state) => state.item);
  const { user } = useSelector((state) => state.auth);

  // Role-based permissions
  const isAdmin = user?.role === "ADMIN";
  const isStoreKeeper = user?.role === "STORE_KEEPER";
  const isCuttingMaster = user?.role === "CUTTING_MASTER";

  // Get base path based on user role - using useMemo
  const basePath = useMemo(() => {
    if (isAdmin) return "/admin";
    if (isStoreKeeper) return "/storekeeper";
    return "/cuttingmaster";
  }, [isAdmin, isStoreKeeper]);

  // UI state
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showInactive, setShowInactive] = useState(false);

  const canEdit = isAdmin || isStoreKeeper; // Both Admin and Store Keeper can edit
  const canDelete = isAdmin; // Only Admin can delete

  // Form states
  const [fabricForm, setFabricForm] = useState({
    name: "",
    color: "",
    pricePerMeter: "",
    imageFile: null,
    imagePreview: null,
  });
  const [categoryForm, setCategoryForm] = useState({ name: "" });
  
  // Updated itemForm with priceRange
  const [itemForm, setItemForm] = useState({ 
    name: "", 
    categoryId: "",
    priceRange: {
      min: 0,
      max: 0
    }
  });

  const [inventoryRows, setInventoryRows] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);

  const fetchInventorySummary = async () => {
    setInventoryLoading(true);
    try {
      const response = await API.get("/inventory/summary");
      setInventoryRows(response.data?.data || []);
    } catch (error) {
      showToast.error(error.response?.data?.message || "Failed to load inventory");
    } finally {
      setInventoryLoading(false);
    }
  };

  // Navigation handlers for mobile menu
  const handleNavigateToDashboard = () => {
    console.log("🏠 Navigating to dashboard with basePath:", basePath);
    navigate(`${basePath}/dashboard`);
    setMobileMenuOpen(false);
  };

  const handleNavigateToProducts = () => {
    console.log("📦 Navigating to products with basePath:", basePath);
    navigate(`${basePath}/products`);
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

  const handleNavigateToCustomers = () => {
    console.log("👥 Navigating to customers with basePath:", basePath);
    navigate(`${basePath}/customers`);
    setMobileMenuOpen(false);
  };

  const handleNavigateToTailors = () => {
    console.log("✂️ Navigating to tailors with basePath:", basePath);
    navigate(`${basePath}/tailors`);
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && PRODUCT_TABS.includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Load data
  useEffect(() => {
    dispatch(fetchAllFabrics());
    dispatch(fetchAllCategories());
    fetchInventorySummary();
  }, [dispatch]);

  useEffect(() => {
    if (selectedCategory) {
      dispatch(fetchItems(selectedCategory));
    } else {
      dispatch(fetchItems());
    }
  }, [selectedCategory, dispatch]);

  useEffect(() => {
    if (activeTab === "inventory") {
      fetchInventorySummary();
    }
  }, [activeTab]);

  // ========== FABRIC FUNCTIONS ==========
  const handleFabricSubmit = async (e) => {
    e.preventDefault();
    if (!canEdit) {
      showToast.error("You don't have permission to edit fabrics");
      return;
    }
    if (!fabricForm.name || !fabricForm.color || !fabricForm.pricePerMeter) {
      showToast.error("Please fill all required fields");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", fabricForm.name);
      formData.append("color", fabricForm.color);
      formData.append("pricePerMeter", fabricForm.pricePerMeter);
      if (fabricForm.imageFile) formData.append("image", fabricForm.imageFile);

      if (editingItem) {
        await dispatch(
          updateFabric({ id: editingItem._id, fabricData: formData }),
        ).unwrap();
        showToast.success("Fabric updated successfully! ✅");
      } else {
        await dispatch(createFabric(formData)).unwrap();
        showToast.success("Fabric created successfully! 🎉");
      }
      setShowModal(false);
      resetForms();
      fetchInventorySummary();
    } catch (error) {
      showToast.error(error || "Operation failed");
    }
  };

  // ========== CATEGORY FUNCTIONS ==========
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!canEdit) {
      showToast.error("You don't have permission to edit categories");
      return;
    }
    if (!categoryForm.name) {
      showToast.error("Category name is required");
      return;
    }

    try {
      if (editingItem) {
        await dispatch(
          updateCategory({ id: editingItem._id, categoryData: categoryForm }),
        ).unwrap();
        showToast.success("Category updated successfully! ✅");
      } else {
        await dispatch(createCategory(categoryForm)).unwrap();
        showToast.success("Category created successfully! 🎉");
      }
      setShowModal(false);
      resetForms();
    } catch (error) {
      showToast.error(error || "Operation failed");
    }
  };

  // ========== ITEM FUNCTIONS ==========
  const handleItemSubmit = async (e) => {
    e.preventDefault();
    if (!canEdit) {
      showToast.error("You don't have permission to edit items");
      return;
    }
    if (!itemForm.name || !itemForm.categoryId) {
      showToast.error("Please fill all required fields");
      return;
    }

    // Validate price range
    if (itemForm.priceRange.min < 0 || itemForm.priceRange.max < 0) {
      showToast.error("Price cannot be negative");
      return;
    }
    if (itemForm.priceRange.min > itemForm.priceRange.max) {
      showToast.error("Minimum price cannot be greater than maximum price");
      return;
    }

    try {
      if (editingItem) {
        // Include priceRange in update
        await dispatch(
          updateItem({
            id: editingItem._id,
            itemData: { 
              name: itemForm.name,
              priceRange: itemForm.priceRange
            },
          }),
        ).unwrap();
        showToast.success("Item updated successfully! ✅");
      } else {
        // Include priceRange in create
        await dispatch(createItem({
          name: itemForm.name,
          categoryId: itemForm.categoryId,
          priceRange: itemForm.priceRange
        })).unwrap();
        showToast.success("Sub Category created successfully! 🎉");
      }
      setShowModal(false);
      resetForms();
    } catch (error) {
      showToast.error(error || "Operation failed");
    }
  };

  const resetForms = () => {
    setFabricForm({
      name: "",
      color: "",
      pricePerMeter: "",
      imageFile: null,
      imagePreview: null,
    });
    setCategoryForm({ name: "" });
    setItemForm({ 
      name: "", 
      categoryId: "",
      priceRange: {
        min: 0,
        max: 0
      }
    });
    setEditingItem(null);
  };

  const handleEdit = (item) => {
    if (!canEdit) {
      showToast.error("You don't have permission to edit");
      return;
    }
    setEditingItem(item);
    if (activeTab === "fabric") {
      setFabricForm({
        name: item.name,
        color: item.color,
        pricePerMeter: item.pricePerMeter,
        imageFile: null,
        imagePreview: item.imageUrl,
      });
    } else if (activeTab === "category") {
      setCategoryForm({ name: item.name });
    } else {
      // Include priceRange when editing item
      setItemForm({ 
        name: item.name, 
        categoryId: item.category?._id || "",
        priceRange: {
          min: item.priceRange?.min || 0,
          max: item.priceRange?.max || 0
        }
      });
    }
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!canDelete) {
      showToast.error("Only Admin can delete items");
      return;
    }
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        if (activeTab === "fabric") {
          await dispatch(deleteFabric(id)).unwrap();
          showToast.success("Fabric deleted successfully! 🗑️");
          fetchInventorySummary();
        } else if (activeTab === "category") {
          await dispatch(deleteCategory(id)).unwrap();
          showToast.success("Category deleted successfully! 🗑️");
        } else {
          await dispatch(deleteItem(id)).unwrap();
          showToast.success("Item deleted successfully! 🗑️");
        }
      } catch (error) {
        showToast.error(error || "Failed to delete");
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    if (!canEdit) {
      showToast.error("You don't have permission to change status");
      return;
    }
    try {
      if (activeTab === "fabric") {
        await dispatch(toggleFabricStatus(id)).unwrap();
        showToast.success(`Fabric ${currentStatus ? 'deactivated' : 'activated'} successfully`);
        fetchInventorySummary();
      }
      // Add similar for categories and items when you have toggle functions
    } catch (error) {
      showToast.error("Failed to toggle status");
    }
  };

  // Handle View Details - with basePath
  const handleViewDetails = (id) => {
    const navState = { state: { returnTab: activeTab } };
    if (activeTab === "fabric") navigate(`${basePath}/fabrics/${id}`, navState);
    else if (activeTab === "category") navigate(`${basePath}/categories/${id}`, navState);
    else navigate(`${basePath}/items/${id}`, navState);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast.error("Image size should be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        showToast.error("Please select an image file");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () =>
        setFabricForm((prev) => ({
          ...prev,
          imageFile: file,
          imagePreview: reader.result,
        }));
      reader.readAsDataURL(file);
    }
  };

  // Format price helper function
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Filter items based on showInactive toggle (for Admin only)
  const filteredFabrics = (isAdmin && showInactive) 
    ? fabrics 
    : fabrics?.filter(f => f.isActive !== false);
  
  const filteredCategories = (isAdmin && showInactive) 
    ? categories 
    : categories?.filter(c => c.isActive !== false);
  
  const filteredItems = (isAdmin && showInactive) 
    ? items 
    : items?.filter(i => i.isActive !== false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ===== MOBILE HEADER ===== */}
      <div className="lg:hidden bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Package size={20} className="text-blue-600" />
            Products
          </h1>
          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                onClick={() => {
                  resetForms();
                  setShowModal(true);
                }}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
                style={{ minWidth: '36px', minHeight: '36px' }}
              >
                <Plus size={18} />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition flex items-center justify-center"
              style={{ minWidth: '36px', minHeight: '36px' }}
            >
              <Menu size={18} />
            </button>
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="flex gap-1 px-4 pb-3 overflow-x-auto hide-scrollbar">
          {["fabric", "category", "item", "inventory"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 rounded-lg font-bold text-xs whitespace-nowrap flex items-center gap-1 transition-all ${
                activeTab === tab
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {tab === "fabric" ? (
                <>
                  <span className="text-base">👕</span>
                  <span className="hidden xs:inline ml-1">Fabrics</span>
                </>
              ) : tab === "category" ? (
                <>
                  <span className="text-base">📁</span>
                  <span className="hidden xs:inline ml-1">Categories</span>
                </>
              ) : tab === "item" ? (
                <>
                  <span className="text-base">🧵</span>
                  <span className="hidden xs:inline ml-1">Items</span>
                </>
              ) : (
                <>
                  <span className="text-base">📦</span>
                  <span className="hidden xs:inline ml-1">Inventory</span>
                </>
              )}
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === tab ? "bg-white/20" : "bg-slate-200"
              }`}>
                {tab === "fabric"
                  ? fabrics?.length || 0
                  : tab === "category"
                    ? categories?.length || 0
                    : tab === "item"
                      ? items?.length || 0
                      : inventoryRows?.length || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Mobile Menu - Updated with proper role-based navigation */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg p-4 z-40">
            <div className="space-y-2">
              {/* Dashboard Link */}
              <button
                onClick={handleNavigateToDashboard}
                className="w-full text-left px-4 py-3 hover:bg-slate-100 rounded-xl font-medium flex items-center gap-3"
              >
                <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Home size={16} className="text-blue-600" />
                </span>
                Dashboard
              </button>

              {/* Products Link - Current Page */}
              <button
                onClick={handleNavigateToProducts}
                className="w-full text-left px-4 py-3 bg-blue-50 text-blue-600 rounded-xl font-medium flex items-center gap-3"
              >
                <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Package size={16} className="text-white" />
                </span>
                Products
              </button>

              {/* Orders Link */}
              <button
                onClick={handleNavigateToOrders}
                className="w-full text-left px-4 py-3 hover:bg-slate-100 rounded-xl font-medium flex items-center gap-3"
              >
                <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <ShoppingBag size={16} className="text-green-600" />
                </span>
                Orders
              </button>

              {/* Works Link */}
              <button
                onClick={handleNavigateToWorks}
                className="w-full text-left px-4 py-3 hover:bg-slate-100 rounded-xl font-medium flex items-center gap-3"
              >
                <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <LayoutGrid size={16} className="text-purple-600" />
                </span>
                Works
              </button>

              {/* Customers Link */}
              <button
                onClick={handleNavigateToCustomers}
                className="w-full text-left px-4 py-3 hover:bg-slate-100 rounded-xl font-medium flex items-center gap-3"
              >
                <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Users size={16} className="text-orange-600" />
                </span>
                Customers
              </button>

              {/* Tailors Link */}
              <button
                onClick={handleNavigateToTailors}
                className="w-full text-left px-4 py-3 hover:bg-slate-100 rounded-xl font-medium flex items-center gap-3"
              >
                <span className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                  <Users size={16} className="text-pink-600" />
                </span>
                Tailors
              </button>

              {/* Divider */}
              <div className="border-t border-slate-200 my-2"></div>

              {/* Show Inactive Toggle (Admin only) */}
              {isAdmin && (
                <button
                  onClick={() => {
                    setShowInactive(!showInactive);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-100 rounded-xl font-medium"
                >
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    showInactive ? 'bg-purple-100' : 'bg-slate-100'
                  }`}>
                    {showInactive ? (
                      <Eye size={16} className="text-purple-600" />
                    ) : (
                      <EyeOff size={16} className="text-slate-600" />
                    )}
                  </span>
                  {showInactive ? 'Show Active Only' : 'Show All Items'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 lg:py-8">
        {/* ===== DESKTOP HEADER (Hidden on mobile) ===== */}
        <div className="hidden lg:block bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-8">
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase flex items-center gap-3">
            <Package size={32} className="text-blue-600" />
            Products Management
          </h1>
          <p className="text-slate-500 font-medium mt-2">
            Manage fabrics, categories, and sub categories
          </p>
        </div>

        {/* Desktop Tabs with Counts - Hidden on Mobile */}
        <div className="hidden lg:flex gap-2 border-b border-slate-200 bg-white p-4 rounded-t-2xl mb-6">
          {["fabric", "category", "item", "inventory"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-black uppercase tracking-wider text-sm transition-all ${
                activeTab === tab
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span className="flex items-center gap-2">
                {tab === "fabric"
                  ? "👕 Fabrics"
                  : tab === "category"
                    ? "📁 Categories"
                    : tab === "item"
                      ? "🧵 Sub Categories"
                      : "📦 Inventory"}
                <span
                  className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab
                      ? "bg-white/20 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {tab === "fabric"
                    ? fabrics?.length || 0
                    : tab === "category"
                      ? categories?.length || 0
                      : tab === "item"
                        ? items?.length || 0
                        : inventoryRows?.length || 0}
                </span>
              </span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-xl lg:rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Header with Actions */}
          <div className="p-4 lg:p-6 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 lg:gap-3">
                {activeTab === "fabric" && <Tag size={18} className="text-blue-600 lg:w-6 lg:h-6" />}
                {activeTab === "category" && <Layers size={18} className="text-blue-600 lg:w-6 lg:h-6" />}
                {activeTab === "Sub Categories" && <Package size={18} className="text-blue-600 lg:w-6 lg:h-6" />}
                {activeTab === "inventory" && <LayoutGrid size={18} className="text-blue-600 lg:w-6 lg:h-6" />}
                <h2 className="text-base lg:text-xl font-black text-slate-800 uppercase tracking-tight">
                  {activeTab === "fabric"
                    ? "Fabrics"
                    : activeTab === "category"
                      ? "Categories"
                      : activeTab === "Sub Categories"
                        ? "Sub Categories"
                        : "Inventory"}
                </h2>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* Category Filter for Items - Desktop */}
                {activeTab === "item" && (
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full sm:w-auto px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm"
                  >
                    <option value="">All Categories</option>
                    {categories?.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                )}

                {/* Admin Only: Show Inactive Toggle - Desktop */}
                {isAdmin && (
                  <button
                    onClick={() => setShowInactive(!showInactive)}
                    className={`w-full sm:w-auto px-4 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm ${
                      showInactive 
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                    title={showInactive ? 'Showing all items' : 'Show inactive items'}
                  >
                    {showInactive ? <Eye size={16} /> : <EyeOff size={16} />}
                    <span className="hidden sm:inline">{showInactive ? 'All Items' : 'Hide Inactive'}</span>
                  </button>
                )}

                {/* Add Button - Desktop */}
                {canEdit && activeTab !== "inventory" && (
                  <button
                    onClick={() => {
                      resetForms();
                      setShowModal(true);
                    }}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 text-sm"
                  >
                    <Plus size={18} />
                    <span className="hidden sm:inline">
                      Add {activeTab === "fabric" ? "Fabric" : activeTab === "category" ? "Category" : "Item"}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Category Filter for Items */}
            {activeTab === "item" && (
              <div className="mt-3 lg:hidden">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-sm"
                >
                  <option value="">All Categories</option>
                  {categories?.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Lists */}
          <div className="p-4 lg:p-6">
              {/* Inventory - MongoDB-backed stock table */}
              {activeTab === "inventory" && (
                <div className="rounded-2xl border border-slate-100 overflow-hidden">
                  <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-slate-800">Inventory</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Stock is calculated from MongoDB inventory movements.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={fetchInventorySummary}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all"
                    >
                      <Filter size={16} />
                      Refresh inventory
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-[860px] w-full text-sm text-left">
                      <thead className="bg-white text-[10px] uppercase font-black text-slate-500 tracking-wider border-b border-slate-100">
                        <tr>
                          <th className="px-4 py-3">Item name</th>
                          <th className="px-4 py-3">Category</th>
                          <th className="px-4 py-3">Available stock</th>
                          <th className="px-4 py-3">Unit</th>
                          <th className="px-4 py-3">Low stock</th>
                          <th className="px-4 py-3">Last updated</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {inventoryLoading && (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-slate-500 font-semibold">
                              Loading inventory...
                            </td>
                          </tr>
                        )}
                        {!inventoryLoading && inventoryRows.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-slate-500 font-semibold">
                              No inventory items found.
                            </td>
                          </tr>
                        )}
                        {!inventoryLoading && inventoryRows.map((r) => {
                          const stock = Number(r.stock) || 0;
                          const critical = stock <= 0;
                          const badge = critical
                            ? "Critical"
                            : "Healthy";
                          const badgeCls = critical
                            ? "bg-rose-50 text-rose-800 border-rose-100"
                            : "bg-emerald-50 text-emerald-800 border-emerald-100";

                          return (
                            <tr key={r.itemId} className="hover:bg-blue-50/30 transition-colors">
                              <td className="px-4 py-3 font-medium text-slate-800">
                                {r.itemName}
                              </td>
                              <td className="px-4 py-3 text-slate-700">
                                {r.category}
                              </td>
                              <td className="px-4 py-3">
                                <span className="font-mono text-xs">{stock}</span>
                              </td>
                              <td className="px-4 py-3">
                                {r.unit}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg border ${badgeCls}`}>
                                  {badge}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-xs text-slate-600 font-mono">
                                {new Date(r.updatedAt).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            {/* Fabrics List - Responsive Grid */}
            {activeTab === "fabric" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {filteredFabrics?.map((fabric) => (
                  <div
                    key={fabric._id}
                    className={`bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-all ${
                      !fabric.isActive ? 'border-orange-200 opacity-75' : 'border-slate-200'
                    }`}
                  >
                    <div className="relative h-40 lg:h-48 bg-slate-100">
                      {fabric.imageUrl ? (
                        <img
                          src={fabric.imageUrl}
                          alt={fabric.name}
                          className="w-full h-full object-cover"
                          onError={(e) =>
                            (e.target.src =
                              "https://placehold.co/600x400/cccccc/ffffff?text=No+Image")
                          }
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image size={32} className="text-slate-400 lg:w-12 lg:h-12" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs lg:text-sm font-bold">
                        ₹{fabric.pricePerMeter}/m
                      </div>
                      {!fabric.isActive && (
                        <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-full text-[10px] lg:text-xs font-bold">
                          Inactive
                        </div>
                      )}
                    </div>
                    <div className="p-3 lg:p-4">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <h3 className={`font-black text-sm lg:text-base truncate ${!fabric.isActive ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                            {fabric.name}
                          </h3>
                          <div className="flex items-center gap-1 text-xs lg:text-sm text-slate-600 mt-1">
                            <Palette size={12} className="text-blue-500 flex-shrink-0" />
                            <span className="truncate">{fabric.color}</span>
                          </div>
                        </div>
                        <div className="flex gap-1 lg:gap-2 ml-2 flex-shrink-0">
                          <button
                            onClick={() => handleViewDetails(fabric._id)}
                            className="w-7 h-7 lg:w-8 lg:h-8 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-all flex items-center justify-center"
                            title="View"
                          >
                            <Eye size={12} className="lg:w-4 lg:h-4" />
                          </button>
                          
                          {canEdit && (
                            <>
                              <button
                                onClick={() => handleToggleStatus(fabric._id, fabric.isActive)}
                                className={`w-7 h-7 lg:w-8 lg:h-8 rounded-lg flex items-center justify-center transition-all ${
                                  fabric.isActive 
                                    ? "bg-green-100 text-green-600 hover:bg-green-200" 
                                    : "bg-orange-100 text-orange-600 hover:bg-orange-200"
                                }`}
                                title={fabric.isActive ? "Deactivate" : "Activate"}
                              >
                                <Power size={12} className="lg:w-4 lg:h-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(fabric)}
                                className="w-7 h-7 lg:w-8 lg:h-8 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all flex items-center justify-center"
                                title="Edit"
                              >
                                <Edit size={12} className="lg:w-4 lg:h-4" />
                              </button>
                            </>
                          )}
                          
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(fabric._id)}
                              className="w-7 h-7 lg:w-8 lg:h-8 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all flex items-center justify-center"
                              title="Delete"
                            >
                              <Trash2 size={12} className="lg:w-4 lg:h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Categories List - Responsive Grid */}
            {activeTab === "category" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                {filteredCategories?.map((category) => (
                  <div
                    key={category._id}
                    className={`bg-slate-50 rounded-xl p-4 border hover:shadow-md ${
                      !category.isActive ? 'border-orange-200 opacity-75' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className={`font-black truncate ${!category.isActive ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                          {category.name}
                        </h3>
                        <p className="text-[10px] lg:text-xs text-slate-400 mt-1 truncate">
                          ID: {category._id.slice(-6)}
                        </p>
                        {!category.isActive && (
                          <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full mt-1 inline-block">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1 lg:gap-2 ml-2 flex-shrink-0">
                        <button
                          onClick={() => handleViewDetails(category._id)}
                          className="w-7 h-7 lg:w-8 lg:h-8 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-all flex items-center justify-center"
                        >
                          <Eye size={12} className="lg:w-4 lg:h-4" />
                        </button>
                        
                        {canEdit && (
                          <button
                            onClick={() => handleEdit(category)}
                            className="w-7 h-7 lg:w-8 lg:h-8 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all flex items-center justify-center"
                          >
                            <Edit size={12} className="lg:w-4 lg:h-4" />
                          </button>
                        )}
                        
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(category._id)}
                            className="w-7 h-7 lg:w-8 lg:h-8 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all flex items-center justify-center"
                          >
                            <Trash2 size={12} className="lg:w-4 lg:h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Items List - Updated to show price range */}
            {activeTab === "item" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                {filteredItems?.map((item) => (
                  <div
                    key={item._id}
                    className={`bg-slate-50 rounded-xl p-4 border hover:shadow-md ${
                      !item.isActive ? 'border-orange-200 opacity-75' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className={`font-black truncate ${!item.isActive ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                          {item.name}
                        </h3>
                        <p className="text-xs lg:text-sm text-slate-600 mt-1 truncate">
                          {item.category?.name}
                        </p>
                        {/* Display price range */}
                        {item.priceRange && (
                          <div className="flex items-center gap-1 text-xs lg:text-sm text-purple-600 font-bold mt-2">
                            <IndianRupee size={12} className="flex-shrink-0" />
                            <span className="truncate">{formatPrice(item.priceRange.min)} - {formatPrice(item.priceRange.max)}</span>
                          </div>
                        )}
                        {!item.isActive && (
                          <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full mt-1 inline-block">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1 lg:gap-2 ml-2 flex-shrink-0">
                        <button
                          onClick={() => handleViewDetails(item._id)}
                          className="w-7 h-7 lg:w-8 lg:h-8 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-all flex items-center justify-center"
                        >
                          <Eye size={12} className="lg:w-4 lg:h-4" />
                        </button>
                        
                        {canEdit && (
                          <button
                            onClick={() => handleEdit(item)}
                            className="w-7 h-7 lg:w-8 lg:h-8 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all flex items-center justify-center"
                          >
                            <Edit size={12} className="lg:w-4 lg:h-4" />
                          </button>
                        )}
                        
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="w-7 h-7 lg:w-8 lg:h-8 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all flex items-center justify-center"
                          >
                            <Trash2 size={12} className="lg:w-4 lg:h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal - Responsive */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-xl lg:rounded-2xl shadow-2xl overflow-hidden mx-4">
            <div className="p-4 lg:p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base lg:text-xl font-black text-slate-800">
                {editingItem ? "Edit" : "Add"}{" "}
                {activeTab === "fabric"
                  ? "Fabric"
                  : activeTab === "category"
                    ? "Category"
                    : "Sub Categories"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForms();
                }}
                className="p-2 hover:bg-slate-100 rounded-lg flex items-center justify-center"
              >
                <X size={18} className="text-slate-500" />
              </button>
            </div>

            <form
              onSubmit={
                activeTab === "fabric"
                  ? handleFabricSubmit
                  : activeTab === "category"
                    ? handleCategorySubmit
                    : handleItemSubmit
              }
              className="p-4 lg:p-6 space-y-3 lg:space-y-4"
            >
              {activeTab === "fabric" && (
                <>
                  <input
                    type="text"
                    placeholder="Fabric Name"
                    value={fabricForm.name}
                    onChange={(e) =>
                      setFabricForm({ ...fabricForm, name: e.target.value })
                    }
                    className="w-full px-3 lg:px-4 py-2.5 lg:py-3 bg-slate-50 border rounded-lg lg:rounded-xl text-sm lg:text-base"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Color"
                    value={fabricForm.color}
                    onChange={(e) =>
                      setFabricForm({ ...fabricForm, color: e.target.value })
                    }
                    className="w-full px-3 lg:px-4 py-2.5 lg:py-3 bg-slate-50 border rounded-lg lg:rounded-xl text-sm lg:text-base"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Price per Meter (₹)"
                    value={fabricForm.pricePerMeter}
                    onChange={(e) =>
                      setFabricForm({
                        ...fabricForm,
                        pricePerMeter: e.target.value,
                      })
                    }
                    className="w-full px-3 lg:px-4 py-2.5 lg:py-3 bg-slate-50 border rounded-lg lg:rounded-xl text-sm lg:text-base"
                    required
                  />

                  {fabricForm.imagePreview && (
                    <div className="relative">
                      <img
                        src={fabricForm.imagePreview}
                        alt="Preview"
                        className="w-full h-32 lg:h-40 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFabricForm((prev) => ({
                            ...prev,
                            imageFile: null,
                            imagePreview: null,
                          }))
                        }
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  <label className="flex flex-col items-center justify-center w-full h-24 lg:h-32 border-2 border-dashed rounded-lg lg:rounded-xl cursor-pointer hover:bg-slate-50">
                    <Upload className="w-6 h-6 lg:w-8 lg:h-8 mb-1 lg:mb-2 text-slate-400" />
                    <p className="text-xs lg:text-sm text-slate-500">
                      Click to upload image
                    </p>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </>
              )}

              {activeTab === "category" && (
                <input
                  type="text"
                  placeholder="Category Name"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ name: e.target.value })}
                  className="w-full px-3 lg:px-4 py-2.5 lg:py-3 bg-slate-50 border rounded-lg lg:rounded-xl text-sm lg:text-base"
                  required
                />
              )}

              {activeTab === "item" && (
                <>
                  <input
                    type="text"
                    placeholder="Item Name"
                    value={itemForm.name}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, name: e.target.value })
                    }
                    className="w-full px-3 lg:px-4 py-2.5 lg:py-3 bg-slate-50 border rounded-lg lg:rounded-xl text-sm lg:text-base"
                    required
                  />
                  <select
                    value={itemForm.categoryId}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, categoryId: e.target.value })
                    }
                    className="w-full px-3 lg:px-4 py-2.5 lg:py-3 bg-slate-50 border rounded-lg lg:rounded-xl text-sm lg:text-base"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories?.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  
                  {/* Price Range Inputs */}
                  <div className="grid grid-cols-2 gap-2 lg:gap-3">
                    <div>
                      <label className="block text-[10px] lg:text-xs font-medium text-slate-500 mb-1">
                        Min (₹)
                      </label>
                      <input
                        type="number"
                        placeholder="Min"
                        value={itemForm.priceRange.min}
                        onChange={(e) =>
                          setItemForm({
                            ...itemForm,
                            priceRange: {
                              ...itemForm.priceRange,
                              min: parseFloat(e.target.value) || 0
                            }
                          })
                        }
                        min="0"
                        step="10"
                        className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-slate-50 border rounded-lg lg:rounded-xl text-sm lg:text-base"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] lg:text-xs font-medium text-slate-500 mb-1">
                        Max (₹)
                      </label>
                      <input
                        type="number"
                        placeholder="Max"
                        value={itemForm.priceRange.max}
                        onChange={(e) =>
                          setItemForm({
                            ...itemForm,
                            priceRange: {
                              ...itemForm.priceRange,
                              max: parseFloat(e.target.value) || 0
                            }
                          })
                        }
                        min="0"
                        step="10"
                        className="w-full px-3 lg:px-4 py-2 lg:py-3 bg-slate-50 border rounded-lg lg:rounded-xl text-sm lg:text-base"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex flex-col sm:flex-row gap-2 lg:gap-3 pt-3 lg:pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 lg:px-6 py-2.5 lg:py-3 bg-blue-600 text-white rounded-lg lg:rounded-xl font-black text-sm lg:text-base hover:bg-blue-700 flex items-center justify-center gap-2 transition-all order-2 sm:order-1"
                >
                  <Save size={16} className="lg:w-[18px] lg:h-[18px]" />
                  {editingItem ? "Update" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForms();
                  }}
                  className="flex-1 px-4 lg:px-6 py-2.5 lg:py-3 bg-slate-200 text-slate-700 rounded-lg lg:rounded-xl font-black text-sm lg:text-base hover:bg-slate-300 transition-all order-1 sm:order-2"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSS for hiding scrollbar */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
