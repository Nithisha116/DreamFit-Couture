// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { 
//   ArrowLeft, Edit, Trash2, Package, Calendar, 
//   Layers, Power, Save, X, IndianRupee // ✅ Add IndianRupee icon
// } from "lucide-react";
// import { fetchItems, deleteItem, updateItem } from "../../../features/item/itemSlice";
// import { fetchAllCategories } from "../../../features/category/categorySlice";
// import showToast from "../../../utils/toast";

// export default function ItemDetail() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
  
//   const { items } = useSelector((state) => state.item);
//   const { categories } = useSelector((state) => state.category);
//   const { user } = useSelector((state) => state.auth);
  
//   const [isEditing, setIsEditing] = useState(false);
//   const [itemName, setItemName] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState("");
//   // ✅ NEW: Price range state
//   const [priceRange, setPriceRange] = useState({
//     min: 0,
//     max: 0
//   });

//   // ✅ Get base path based on user role
//   const basePath = user?.role === "ADMIN" ? "/admin" : 
//                    user?.role === "STORE_KEEPER" ? "/storekeeper" : 
//                    "/cuttingmaster";

//   const isAdmin = user?.role === "ADMIN";
//   const isStoreKeeper = user?.role === "STORE_KEEPER";
//   const canEdit = isAdmin || isStoreKeeper;
//   const canDelete = isAdmin; // Only Admin can delete

//   const item = items?.find(i => i._id === id);

//   useEffect(() => {
//     if (!items?.length) {
//       dispatch(fetchItems());
//     }
//     if (!categories?.length) {
//       dispatch(fetchAllCategories());
//     }
//   }, [dispatch, items?.length, categories?.length]);

//   useEffect(() => {
//     if (item) {
//       setItemName(item.name);
//       setSelectedCategory(item.category?._id || "");
//       // ✅ Set price range from item
//       setPriceRange({
//         min: item.priceRange?.min || 0,
//         max: item.priceRange?.max || 0
//       });
//     }
//   }, [item]);

//   const handleDelete = async () => {
//     if (!canDelete) {
//       showToast.error("Only Admin can delete items");
//       return;
//     }
//     if (window.confirm("Delete this item?")) {
//       try {
//         await dispatch(deleteItem(id)).unwrap();
//         showToast.success("Item deleted");
//         navigate(`${basePath}/products?tab=${productsReturnTab}`);
//       } catch (error) {
//         showToast.error("Delete failed");
//       }
//     }
//   };

//   const handleUpdate = async () => {
//     if (!canEdit) {
//       showToast.error("You don't have permission to edit items");
//       return;
//     }
//     if (!itemName.trim()) {
//       showToast.error("Item name is required");
//       return;
//     }

//     // ✅ Validate price range
//     if (priceRange.min < 0 || priceRange.max < 0) {
//       showToast.error("Price cannot be negative");
//       return;
//     }
//     if (priceRange.min > priceRange.max) {
//       showToast.error("Minimum price cannot be greater than maximum price");
//       return;
//     }

//     try {
//       const updateData = {
//         name: itemName,
//         priceRange: priceRange // ✅ Include price range in update
//       };
      
//       await dispatch(updateItem({ 
//         id, 
//         itemData: updateData
//       })).unwrap();
//       showToast.success("Item updated");
//       setIsEditing(false);
//     } catch (error) {
//       showToast.error(error.message || "Update failed");
//     }
//   };

//   // Format price for display
//   const formatPrice = (price) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0
//     }).format(price);
//   };

//   if (!item) {
//     return (
//       <div className="text-center py-16">
//         <Package size={64} className="mx-auto text-slate-300 mb-4" />
//         <h2 className="text-2xl font-bold text-slate-800">Item Not Found</h2>
//         <button 
//           onClick={() => navigate(`${basePath}/products?tab=item`)}
//           className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
//         >
//           Back to Items
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-4xl mx-auto p-6 animate-in fade-in duration-500">
//       {/* Back Button */}
//       <button 
//         onClick={() => navigate(`${basePath}/products?tab=item`)} 
//         className="flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 group"
//       >
//         <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
//         Back to Items
//       </button>

//       {/* Main Card */}
//       <div className="bg-white rounded-2xl shadow-lg border overflow-hidden">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-6 text-white">
//           <div className="flex justify-between items-center">
//             <div className="flex items-center gap-4">
//               <div className="bg-white/20 p-3 rounded-xl">
//                 <Package size={32} />
//               </div>
//               <div>
//                 <h1 className="text-3xl font-bold">Item Details</h1>
//                 <p className="text-purple-100">Manage item information</p>
//               </div>
//             </div>
//             <div className="flex gap-3">
//               {canEdit && (
//                 <button 
//                   onClick={() => setIsEditing(!isEditing)}
//                   className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center gap-2"
//                 >
//                   <Edit size={18} /> {isEditing ? 'Cancel' : 'Edit'}
//                 </button>
//               )}
//               {canDelete && (
//                 <button 
//                   onClick={handleDelete}
//                   className="bg-red-500/20 hover:bg-red-500/30 px-4 py-2 rounded-lg flex items-center gap-2"
//                 >
//                   <Trash2 size={18} /> Delete
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Content */}
//         <div className="p-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {/* Item Info */}
//             <div className="space-y-4">
//               <h2 className="text-lg font-bold text-slate-800 mb-4">Item Information</h2>
              
//               {/* Name */}
//               <div className="bg-slate-50 p-4 rounded-lg">
//                 <div className="flex items-center gap-2 text-slate-600 mb-2">
//                   <Package size={18} className="text-purple-600" />
//                   <span className="text-sm font-medium uppercase tracking-wider">Name</span>
//                 </div>
//                 {isEditing ? (
//                   <div className="flex gap-2">
//                     <input
//                       type="text"
//                       value={itemName}
//                       onChange={(e) => setItemName(e.target.value)}
//                       className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
//                       autoFocus
//                     />
//                     <button
//                       onClick={handleUpdate}
//                       className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
//                     >
//                       <Save size={18} />
//                     </button>
//                   </div>
//                 ) : (
//                   <p className="text-xl font-bold">{item.name}</p>
//                 )}
//               </div>

//               {/* ✅ NEW: Price Range */}
//               <div className="bg-slate-50 p-4 rounded-lg">
//                 <div className="flex items-center gap-2 text-slate-600 mb-2">
//                   <IndianRupee size={18} className="text-purple-600" />
//                   <span className="text-sm font-medium uppercase tracking-wider">Price Range</span>
//                 </div>
//                 {isEditing ? (
//                   <div className="grid grid-cols-2 gap-3">
//                     <div>
//                       <label className="block text-xs text-slate-500 mb-1">Min Price (₹)</label>
//                       <input
//                         type="number"
//                         value={priceRange.min}
//                         onChange={(e) => setPriceRange({
//                           ...priceRange,
//                           min: parseFloat(e.target.value) || 0
//                         })}
//                         min="0"
//                         step="10"
//                         className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-xs text-slate-500 mb-1">Max Price (₹)</label>
//                       <input
//                         type="number"
//                         value={priceRange.max}
//                         onChange={(e) => setPriceRange({
//                           ...priceRange,
//                           max: parseFloat(e.target.value) || 0
//                         })}
//                         min="0"
//                         step="10"
//                         className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
//                       />
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="flex items-center gap-2">
//                     <span className="text-xl font-bold text-purple-600">
//                       {formatPrice(item.priceRange?.min || 0)} - {formatPrice(item.priceRange?.max || 0)}
//                     </span>
//                   </div>
//                 )}
//               </div>

//               {/* Category */}
//               <div className="bg-slate-50 p-4 rounded-lg">
//                 <div className="flex items-center gap-2 text-slate-600 mb-2">
//                   <Layers size={18} className="text-purple-600" />
//                   <span className="text-sm font-medium uppercase tracking-wider">Category</span>
//                 </div>
//                 <p className="text-lg font-medium text-purple-600">
//                   {item.category?.name || 'Unknown'}
//                 </p>
//               </div>

//               {/* ID */}
//               <div className="bg-slate-50 p-4 rounded-lg">
//                 <div className="flex items-center gap-2 text-slate-600 mb-2">
//                   <Package size={18} className="text-purple-600" />
//                   <span className="text-sm font-medium uppercase tracking-wider">Item ID</span>
//                 </div>
//                 <p className="text-sm font-mono bg-slate-100 p-2 rounded">{item._id}</p>
//               </div>

//               {/* Created Date */}
//               <div className="bg-slate-50 p-4 rounded-lg">
//                 <div className="flex items-center gap-2 text-slate-600 mb-2">
//                   <Calendar size={18} className="text-purple-600" />
//                   <span className="text-sm font-medium uppercase tracking-wider">Created On</span>
//                 </div>
//                 <p className="text-lg">{new Date(item.createdAt).toLocaleDateString('en-US', {
//                   year: 'numeric',
//                   month: 'long',
//                   day: 'numeric'
//                 })}</p>
//               </div>
//             </div>

//             {/* Additional Info */}
//             <div className="space-y-4">
//               <h2 className="text-lg font-bold text-slate-800 mb-4">Additional Information</h2>
              
//               {/* Category Details */}
//               <div className="bg-slate-50 p-4 rounded-lg">
//                 <h3 className="font-bold text-slate-700 mb-3">Category Details</h3>
//                 <div className="space-y-2">
//                   <p className="text-sm">
//                     <span className="font-medium text-slate-500">Name:</span>{' '}
//                     {item.category?.name}
//                   </p>
//                   <p className="text-sm">
//                     <span className="font-medium text-slate-500">Category ID:</span>{' '}
//                     <span className="font-mono">{item.category?._id}</span>
//                   </p>
//                   <button
//                     onClick={() => navigate(`${basePath}/categories/${item.category?._id}`)}
//                     className="mt-2 text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1"
//                   >
//                     View Category Details →
//                   </button>
//                 </div>
//               </div>

//               {/* Status */}
//               <div className="bg-slate-50 p-4 rounded-lg">
//                 <div className="flex items-center gap-2 text-slate-600 mb-2">
//                   <Power size={18} className="text-purple-600" />
//                   <span className="text-sm font-medium uppercase tracking-wider">Status</span>
//                 </div>
//                 <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${
//                   item.isActive 
//                     ? 'bg-green-100 text-green-700' 
//                     : 'bg-red-100 text-red-700'
//                 }`}>
//                   {item.isActive ? 'Active' : 'Inactive'}
//                 </span>
//               </div>

//               {/* Metadata */}
//               <div className="bg-slate-50 p-4 rounded-lg">
//                 <h3 className="font-bold text-slate-700 mb-3">Metadata</h3>
//                 <div className="space-y-2 text-sm">
//                   <p>
//                     <span className="font-medium text-slate-500">Last Updated:</span>{' '}
//                     {new Date(item.updatedAt).toLocaleString()}
//                   </p>
//                   <p>
//                     <span className="font-medium text-slate-500">Version:</span>{' '}
//                     {item.__v || 0}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Quick Actions */}
//           <div className="mt-6 pt-6 border-t border-slate-200">
//             <h3 className="font-bold text-slate-800 mb-3">Quick Actions</h3>
//             <div className="flex gap-3">
//               <button
//                 onClick={backToProducts}
//                 className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 transition-all"
//               >
//                 View All Items
//               </button>
//               {canEdit && (
//                 <button
//                   onClick={() => {
//                     navigate(`${basePath}/products?tab=${productsReturnTab}`);
//                     setTimeout(() => {
//                       document.querySelector('[data-add-button]')?.click();
//                     }, 100);
//                   }}
//                   className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-all"
//                 >
//                   Add New Item
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }












import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  ArrowLeft, Edit, Trash2, Package, Calendar, 
  Layers, Power, Save, X, IndianRupee, Menu
} from "lucide-react";
import { fetchItems, deleteItem, updateItem } from "../../../features/item/itemSlice";
import { fetchAllCategories } from "../../../features/category/categorySlice";
import showToast from "../../../utils/toast";

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const { items } = useSelector((state) => state.item);
  const { categories } = useSelector((state) => state.category);
  const { user } = useSelector((state) => state.auth);
  
  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [itemName, setItemName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  // Price range state
  const [priceRange, setPriceRange] = useState({
    min: 0,
    max: 0
  });

  // Get base path based on user role
  const basePath = user?.role === "ADMIN" ? "/admin" : 
                   user?.role === "STORE_KEEPER" ? "/storekeeper" : 
                   "/cuttingmaster";

  const productsReturnTab = location.state?.returnTab || "item";
  const backToProducts = () =>
    navigate(`${basePath}/products?tab=${productsReturnTab}`);

  const isAdmin = user?.role === "ADMIN";
  const isStoreKeeper = user?.role === "STORE_KEEPER";
  const canEdit = isAdmin || isStoreKeeper;
  const canDelete = isAdmin; // Only Admin can delete

  const item = items?.find(i => i._id === id);

  useEffect(() => {
    if (!items?.length) {
      dispatch(fetchItems());
    }
    if (!categories?.length) {
      dispatch(fetchAllCategories());
    }
  }, [dispatch, items?.length, categories?.length]);

  useEffect(() => {
    if (item) {
      setItemName(item.name);
      setSelectedCategory(item.category?._id || "");
      // Set price range from item
      setPriceRange({
        min: item.priceRange?.min || 0,
        max: item.priceRange?.max || 0
      });
    }
  }, [item]);

  const handleDelete = async () => {
    if (!canDelete) {
      showToast.error("Only Admin can delete items");
      return;
    }
    if (window.confirm("Delete this item?")) {
      try {
        await dispatch(deleteItem(id)).unwrap();
        showToast.success("Item deleted");
        navigate(`${basePath}/products?tab=${productsReturnTab}`);
      } catch (error) {
        showToast.error("Delete failed");
      }
    }
  };

  const handleUpdate = async () => {
    if (!canEdit) {
      showToast.error("You don't have permission to edit items");
      return;
    }
    if (!itemName.trim()) {
      showToast.error("Item name is required");
      return;
    }

    // Validate price range
    if (priceRange.min < 0 || priceRange.max < 0) {
      showToast.error("Price cannot be negative");
      return;
    }
    if (priceRange.min > priceRange.max) {
      showToast.error("Minimum price cannot be greater than maximum price");
      return;
    }

    try {
      const updateData = {
        name: itemName,
        priceRange: priceRange // Include price range in update
      };
      
      await dispatch(updateItem({ 
        id, 
        itemData: updateData
      })).unwrap();
      showToast.success("Item updated");
      setIsEditing(false);
    } catch (error) {
      showToast.error(error.message || "Update failed");
    }
  };

  // Format price for display
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-md w-full text-center">
          <Package size={48} className="mx-auto text-slate-300 mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Item Not Found</h2>
          <button 
            onClick={backToProducts}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base"
          >
            Back to Items
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
            onClick={backToProducts}
            className="flex items-center gap-1 text-slate-600"
          >
            <ArrowLeft size={18} />
            <span className="font-bold text-sm">Back</span>
          </button>
          <h1 className="text-base font-black text-slate-800 truncate max-w-[150px]">
            {item.name}
          </h1>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-slate-100 rounded-xl transition-all flex items-center justify-center"
            style={{ minWidth: '36px', minHeight: '36px' }}
          >
            <Menu size={18} />
          </button>
        </div>
        
        {/* Mobile Action Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-lg p-4 z-40">
            <div className="space-y-2">
              {canEdit && (
                <button
                  onClick={() => {
                    setIsEditing(!isEditing);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-600 rounded-lg font-bold"
                >
                  <Edit size={18} />
                  {isEditing ? 'Cancel Edit' : 'Edit Item'}
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => {
                    handleDelete();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 text-red-600 rounded-lg font-bold"
                >
                  <Trash2 size={18} />
                  Delete Item
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
        {/* Desktop Back Button - Hidden on Mobile */}
        <button 
          onClick={backToProducts}
          className="hidden lg:flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold">Back to Items</span>
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-lg border overflow-hidden">
          {/* Header - Mobile Responsive */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/20 p-1.5 sm:p-2 rounded-lg lg:rounded-xl flex items-center justify-center">
                  <Package size={16} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">Item Details</h1>
                  <p className="text-purple-100 text-xs sm:text-sm">Manage item information</p>
                </div>
              </div>
              {/* Desktop Action Buttons - Hidden on Mobile */}
              <div className="hidden lg:flex gap-2">
                {canEdit && (
                  <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-white/20 hover:bg-white/30 px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg flex items-center gap-2 text-sm"
                  >
                    <Edit size={16} /> {isEditing ? 'Cancel' : 'Edit'}
                  </button>
                )}
                {canDelete && (
                  <button 
                    onClick={handleDelete}
                    className="bg-red-500/20 hover:bg-red-500/30 px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg flex items-center gap-2 text-sm"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Content - Mobile Responsive */}
          <div className="p-4 sm:p-5 lg:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
              {/* Item Info Column */}
              <div className="space-y-3 sm:space-y-4">
                <h2 className="text-base sm:text-lg font-bold text-slate-800 mb-2 sm:mb-3 lg:mb-4">
                  Item Information
                </h2>
                
                {/* Name */}
                <div className="bg-slate-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-slate-600 mb-1 sm:mb-2">
                    <Package size={14} className="text-purple-600 sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px]" />
                    <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider">Name</span>
                  </div>
                  {isEditing ? (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-purple-500"
                        autoFocus
                      />
                      <button
                        onClick={handleUpdate}
                        className="w-full sm:w-auto bg-purple-600 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2 text-sm"
                      >
                        <Save size={14} className="sm:w-4 sm:h-4" />
                        <span className="sm:hidden">Save</span>
                        <span className="hidden sm:inline">Save</span>
                      </button>
                    </div>
                  ) : (
                    <p className="text-base sm:text-lg lg:text-xl font-bold break-words">{item.name}</p>
                  )}
                </div>

                {/* Price Range */}
                <div className="bg-slate-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-slate-600 mb-1 sm:mb-2">
                    <IndianRupee size={14} className="text-purple-600 sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px]" />
                    <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider">Price Range</span>
                  </div>
                  {isEditing ? (
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <div>
                        <label className="block text-[10px] sm:text-xs text-slate-500 mb-1">Min (₹)</label>
                        <input
                          type="number"
                          value={priceRange.min}
                          onChange={(e) => setPriceRange({
                            ...priceRange,
                            min: parseFloat(e.target.value) || 0
                          })}
                          min="0"
                          step="10"
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] sm:text-xs text-slate-500 mb-1">Max (₹)</label>
                        <input
                          type="number"
                          value={priceRange.max}
                          onChange={(e) => setPriceRange({
                            ...priceRange,
                            max: parseFloat(e.target.value) || 0
                          })}
                          min="0"
                          step="10"
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-base sm:text-lg lg:text-xl font-bold text-purple-600 break-words">
                        {formatPrice(item.priceRange?.min || 0)} - {formatPrice(item.priceRange?.max || 0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Category */}
                <div className="bg-slate-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-slate-600 mb-1 sm:mb-2">
                    <Layers size={14} className="text-purple-600 sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px]" />
                    <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider">Category</span>
                  </div>
                  <p className="text-sm sm:text-base lg:text-lg font-medium text-purple-600 break-words">
                    {item.category?.name || 'Unknown'}
                  </p>
                </div>

                {/* ID */}
                <div className="bg-slate-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-slate-600 mb-1 sm:mb-2">
                    <Package size={14} className="text-purple-600 sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px]" />
                    <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider">Item ID</span>
                  </div>
                  <p className="text-xs sm:text-sm font-mono bg-slate-100 p-1.5 sm:p-2 rounded break-all">{item._id}</p>
                </div>

                {/* Created Date */}
                <div className="bg-slate-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-slate-600 mb-1 sm:mb-2">
                    <Calendar size={14} className="text-purple-600 sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px]" />
                    <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider">Created On</span>
                  </div>
                  <p className="text-xs sm:text-sm lg:text-base break-words">
                    {new Date(item.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Additional Info Column */}
              <div className="space-y-3 sm:space-y-4">
                <h2 className="text-base sm:text-lg font-bold text-slate-800 mb-2 sm:mb-3 lg:mb-4">
                  Additional Information
                </h2>
                
                {/* Category Details */}
                <div className="bg-slate-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                  <h3 className="font-bold text-slate-700 text-sm sm:text-base mb-2 sm:mb-3">Category Details</h3>
                  <div className="space-y-1.5 sm:space-y-2">
                    <p className="text-xs sm:text-sm break-words">
                      <span className="font-medium text-slate-500">Name:</span>{' '}
                      {item.category?.name}
                    </p>
                    <p className="text-xs sm:text-sm break-words">
                      <span className="font-medium text-slate-500">Category ID:</span>{' '}
                      <span className="font-mono text-[10px] sm:text-xs">{item.category?._id}</span>
                    </p>
                    <button
                      onClick={() => navigate(`${basePath}/categories/${item.category?._id}`)}
                      className="mt-1 sm:mt-2 text-purple-600 hover:text-purple-700 text-xs sm:text-sm font-medium flex items-center gap-1"
                    >
                      View Category Details →
                    </button>
                  </div>
                </div>

                {/* Status */}
                <div className="bg-slate-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-slate-600 mb-1 sm:mb-2">
                    <Power size={14} className="text-purple-600 sm:w-4 sm:h-4 lg:w-[18px] lg:h-[18px]" />
                    <span className="text-[10px] sm:text-xs font-medium uppercase tracking-wider">Status</span>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold ${
                    item.isActive 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {item.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Metadata */}
                <div className="bg-slate-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                  <h3 className="font-bold text-slate-700 text-sm sm:text-base mb-2 sm:mb-3">Metadata</h3>
                  <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                    <p className="break-words">
                      <span className="font-medium text-slate-500">Last Updated:</span>{' '}
                      {new Date(item.updatedAt).toLocaleString()}
                    </p>
                    <p>
                      <span className="font-medium text-slate-500">Version:</span>{' '}
                      {item.__v || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-4 sm:mt-5 lg:mt-6 pt-4 sm:pt-5 lg:pt-6 border-t border-slate-200">
              <h3 className="font-bold text-slate-800 text-sm sm:text-base mb-2 sm:mb-3">Quick Actions</h3>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={backToProducts}
                  className="w-full sm:w-auto bg-slate-100 text-slate-700 px-4 py-2.5 sm:py-2 rounded-lg hover:bg-slate-200 transition-all text-sm flex items-center justify-center"
                >
                  View All Items
                </button>
                {canEdit && (
                  <button
                    onClick={() => {
                      navigate(`${basePath}/products?tab=${productsReturnTab}`);
                      setTimeout(() => {
                        document.querySelector('[data-add-button]')?.click();
                      }, 100);
                    }}
                    className="w-full sm:w-auto bg-purple-600 text-white px-4 py-2.5 sm:py-2 rounded-lg hover:bg-purple-700 transition-all text-sm flex items-center justify-center"
                  >
                    Add New Item
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}