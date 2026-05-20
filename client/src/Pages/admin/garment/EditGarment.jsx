// // pages/garment/EditGarment.jsx
// import React, { useState, useEffect } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   ArrowLeft,
//   Save,
//   X,
//   Upload,
//   Trash2,
//   Calendar,
//   Image as ImageIcon,
//   User,
//   Camera,
//   Scissors,
// } from "lucide-react";
// import { fetchGarmentById, updateGarment, updateGarmentImages, deleteGarmentImage } from "../../../features/garment/garmentSlice";
// import { fetchAllCategories } from "../../../features/category/categorySlice";
// import { fetchItems } from "../../../features/item/itemSlice";
// import { fetchAllSizeFields } from "../../../features/sizeField/sizeFieldSlice";
// import { fetchAllTemplates } from "../../../features/sizeTemplate/sizeTemplateSlice";
// import showToast from "../../../utils/toast";

// export default function EditGarment() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
  
//   const { currentGarment, loading } = useSelector((state) => state.garment);
//   const { categories } = useSelector((state) => state.category);
//   const { items } = useSelector((state) => state.item);
//   const { fields } = useSelector((state) => state.sizeField);
//   const { templates } = useSelector((state) => state.sizeTemplate);
//   const { user } = useSelector((state) => state.auth);

//   const [formData, setFormData] = useState({
//     name: "",
//     category: "",
//     item: "",
//     measurementTemplate: "",
//     measurementSource: "template",
//     measurements: [],
//     additionalInfo: "",
//     estimatedDelivery: "",
//     priority: "normal",
//     priceRange: {
//       min: "",
//       max: "",
//     },
//     status: "pending",
//   });

//   const [selectedFields, setSelectedFields] = useState({});
//   const [manualMeasurements, setManualMeasurements] = useState({});
//   const [existingImages, setExistingImages] = useState({
//     reference: [],
//     customer: [],
//     cloth: []
//   });
//   const [newImages, setNewImages] = useState({
//     reference: [],
//     customer: [],
//     cloth: []
//   });
//   const [deletedImages, setDeletedImages] = useState({
//     reference: [],
//     customer: [],
//     cloth: []
//   });
//   const [previewImages, setPreviewImages] = useState({
//     reference: [],
//     customer: [],
//     cloth: []
//   });
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const isAdmin = user?.role === "ADMIN";
//   const isStoreKeeper = user?.role === "STORE_KEEPER";
//   const canEdit = isAdmin || isStoreKeeper;

//   // Load data on mount
//   useEffect(() => {
//     dispatch(fetchAllCategories());
//     dispatch(fetchAllSizeFields());
//     dispatch(fetchAllTemplates({ page: 1, search: "" }));
//     if (id) {
//       dispatch(fetchGarmentById(id));
//     }
//   }, [dispatch, id]);

//   // Load items when category changes
//   useEffect(() => {
//     if (formData.category) {
//       dispatch(fetchItems(formData.category));
//     }
//   }, [dispatch, formData.category]);

//   // Load garment data when available
//   useEffect(() => {
//     if (currentGarment) {
//       console.log("📦 Loading garment for edit:", currentGarment);
      
//       setFormData({
//         name: currentGarment.name || "",
//         category: currentGarment.category?._id || currentGarment.category || "",
//         item: currentGarment.item?._id || currentGarment.item || "",
//         measurementTemplate: currentGarment.measurementTemplate?._id || currentGarment.measurementTemplate || "",
//         measurementSource: currentGarment.measurementSource || "template",
//         measurements: currentGarment.measurements || [],
//         additionalInfo: currentGarment.additionalInfo || "",
//         estimatedDelivery: currentGarment.estimatedDelivery?.split("T")[0] || "",
//         priority: currentGarment.priority || "normal",
//         priceRange: currentGarment.priceRange || { min: "", max: "" },
//         status: currentGarment.status || "pending",
//       });

//       // Store existing images
//       setExistingImages({
//         reference: currentGarment.referenceImages || [],
//         customer: currentGarment.customerImages || [],
//         cloth: currentGarment.customerClothImages || []
//       });

//       // Set preview for existing images
//       setPreviewImages({
//         reference: (currentGarment.referenceImages || []).map(img => ({
//           url: img.url,
//           key: img.key,
//           isExisting: true
//         })),
//         customer: (currentGarment.customerImages || []).map(img => ({
//           url: img.url,
//           key: img.key,
//           isExisting: true
//         })),
//         cloth: (currentGarment.customerClothImages || []).map(img => ({
//           url: img.url,
//           key: img.key,
//           isExisting: true
//         }))
//       });

//       // Set selected fields for measurements
//       if (currentGarment.measurements) {
//         const selected = {};
//         currentGarment.measurements.forEach(m => {
//           selected[m.name] = true;
//         });
//         setSelectedFields(selected);
//       }
//     }
//   }, [currentGarment]);

//   const handleImageChange = (e, type) => {
//     const files = Array.from(e.target.files);
    
//     // Validate files
//     const invalidFiles = files.filter(f => f.size > 5 * 1024 * 1024);
//     if (invalidFiles.length > 0) {
//       showToast.error("Some images exceed 5MB limit");
//       return;
//     }

//     const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
//     const invalidTypes = files.filter(f => !validTypes.includes(f.type));
//     if (invalidTypes.length > 0) {
//       showToast.error("Please upload only JPG, PNG or WEBP images");
//       return;
//     }

//     // Create previews
//     const newPreviews = files.map(file => ({
//       file,
//       preview: URL.createObjectURL(file),
//       isExisting: false
//     }));

//     setPreviewImages(prev => ({
//       ...prev,
//       [type]: [...prev[type], ...newPreviews]
//     }));

//     setNewImages(prev => ({
//       ...prev,
//       [type]: [...prev[type], ...files]
//     }));

//     console.log(`✅ Added ${files.length} new ${type} images`);
//   };

//   const removeImage = (index, type, isExisting) => {
//     if (isExisting) {
//       // Remove existing image - add to deleted list
//       const imageToRemove = existingImages[type][index];
      
//       // Add to deleted images
//       setDeletedImages(prev => ({
//         ...prev,
//         [type]: [...prev[type], imageToRemove.key]
//       }));
      
//       // Remove from existing images
//       setExistingImages(prev => ({
//         ...prev,
//         [type]: prev[type].filter((_, i) => i !== index)
//       }));
      
//       console.log("🗑️ Marked for deletion:", imageToRemove.key);
//     } else {
//       // Remove new image
//       const imageToRemove = previewImages[type][index];
//       if (imageToRemove.preview?.startsWith('blob:')) {
//         URL.revokeObjectURL(imageToRemove.preview);
//       }
      
//       setNewImages(prev => ({
//         ...prev,
//         [type]: prev[type].filter((_, i) => i !== index)
//       }));
//     }

//     // Remove from preview
//     setPreviewImages(prev => ({
//       ...prev,
//       [type]: prev[type].filter((_, i) => i !== index)
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!canEdit) {
//       showToast.error("You don't have permission to edit garments");
//       return;
//     }

//     // Validation
//     if (!formData.name) {
//       showToast.error("Garment name is required");
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       // STEP 1: Update text data (without images) - Send as JSON
//       const textData = {
//         name: formData.name,
//         category: formData.category,
//         item: formData.item,
//         measurementTemplate: formData.measurementTemplate || "",
//         measurementSource: formData.measurementSource,
//         measurements: formData.measurements,
//         additionalInfo: formData.additionalInfo || "",
//         estimatedDelivery: formData.estimatedDelivery,
//         priority: formData.priority,
//         priceRange: formData.priceRange,
//         status: formData.status,
//         // ✅ CRITICAL: Send keys of images to KEEP
//         keepReferenceKeys: existingImages.reference.map(img => img.key),
//         keepCustomerKeys: existingImages.customer.map(img => img.key),
//         keepClothKeys: existingImages.cloth.map(img => img.key),
//       };

//       console.log("📤 Updating text data with images to keep:", {
//         reference: textData.keepReferenceKeys.length,
//         customer: textData.keepCustomerKeys.length,
//         cloth: textData.keepClothKeys.length,
//       });
      
//       // First update text data
//       const updateResult = await dispatch(updateGarment({ id, garmentData: textData })).unwrap();
//       console.log("✅ Text data updated:", updateResult);

//       // STEP 2: Upload new images if any
//       const hasNewImages = 
//         newImages.reference.length > 0 || 
//         newImages.customer.length > 0 || 
//         newImages.cloth.length > 0;

//       if (hasNewImages) {
//         const imageFormData = new FormData();
        
//         // Add new images
//         newImages.reference.forEach(file => {
//           imageFormData.append("referenceImages", file);
//         });
//         newImages.customer.forEach(file => {
//           imageFormData.append("customerImages", file);
//         });
//         newImages.cloth.forEach(file => {
//           imageFormData.append("customerClothImages", file);
//         });

//         console.log("📸 Uploading new images:", {
//           reference: newImages.reference.length,
//           customer: newImages.customer.length,
//           cloth: newImages.cloth.length,
//         });

//         const imageResult = await dispatch(updateGarmentImages({ id, imageData: imageFormData })).unwrap();
//         console.log("✅ New images uploaded:", imageResult);
//       }

//       // STEP 3: Delete images that were marked for deletion
//       const hasDeletedImages = 
//         deletedImages.reference.length > 0 || 
//         deletedImages.customer.length > 0 || 
//         deletedImages.cloth.length > 0;

//       if (hasDeletedImages) {
//         console.log("🗑️ Deleting marked images:", deletedImages);
        
//         // Delete reference images
//         for (const key of deletedImages.reference) {
//           await dispatch(deleteGarmentImage({ 
//             id, 
//             imageKey: key, 
//             imageType: 'reference' 
//           })).unwrap();
//           console.log(`✅ Deleted reference image: ${key}`);
//         }
        
//         // Delete customer images
//         for (const key of deletedImages.customer) {
//           await dispatch(deleteGarmentImage({ 
//             id, 
//             imageKey: key, 
//             imageType: 'customer' 
//           })).unwrap();
//           console.log(`✅ Deleted customer image: ${key}`);
//         }
        
//         // Delete cloth images
//         for (const key of deletedImages.cloth) {
//           await dispatch(deleteGarmentImage({ 
//             id, 
//             imageKey: key, 
//             imageType: 'cloth' 
//           })).unwrap();
//           console.log(`✅ Deleted cloth image: ${key}`);
//         }
//       }
      
//       showToast.success("Garment updated successfully");
//       navigate(`/admin/garments/${id}`);
//     } catch (error) {
//       console.error("❌ Update error:", error);
//       showToast.error(error.message || "Failed to update garment");
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
//           onClick={() => navigate(`/admin/garments/${id}`)}
//           className="p-2 hover:bg-slate-100 rounded-xl transition-all"
//         >
//           <ArrowLeft size={20} className="text-slate-600" />
//         </button>
//         <div>
//           <h1 className="text-3xl font-black text-slate-800 tracking-tight">Edit Garment</h1>
//           <p className="text-slate-500">Update garment details and images</p>
//         </div>
//       </div>

//       {/* Form */}
//       <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
//         <div className="space-y-6">
//           {/* Basic Information */}
//           <div className="bg-slate-50 rounded-xl p-4">
//             <h3 className="font-black text-slate-800 mb-4">Basic Information</h3>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="md:col-span-2">
//                 <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//                   Garment Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.name}
//                   onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                   className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//                   Category <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   value={formData.category}
//                   onChange={(e) => setFormData({ 
//                     ...formData, 
//                     category: e.target.value,
//                     item: ""
//                   })}
//                   className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
//                   required
//                 >
//                   <option value="">Select Category</option>
//                   {categories?.map((cat) => (
//                     <option key={cat._id} value={cat._id}>{cat.name}</option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//                   Item <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   value={formData.item}
//                   onChange={(e) => setFormData({ ...formData, item: e.target.value })}
//                   className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
//                   required
//                   disabled={!formData.category}
//                 >
//                   <option value="">Select Item</option>
//                   {items?.map((item) => (
//                     <option key={item._id} value={item._id}>{item.name}</option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//                   Priority
//                 </label>
//                 <select
//                   value={formData.priority}
//                   onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
//                   className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
//                 >
//                   <option value="normal">Normal</option>
//                   <option value="high">High</option>
//                   <option value="low">Low</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//                   Status
//                 </label>
//                 <select
//                   value={formData.status}
//                   onChange={(e) => setFormData({ ...formData, status: e.target.value })}
//                   className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
//                 >
//                   <option value="pending">Pending</option>
//                   <option value="cutting">Cutting</option>
//                   <option value="sewing">Sewing</option>
//                   <option value="completed">Completed</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//                   Estimated Delivery <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <Calendar className="absolute left-4 top-3.5 text-slate-400" size={18} />
//                   <input
//                     type="date"
//                     value={formData.estimatedDelivery}
//                     onChange={(e) => setFormData({ ...formData, estimatedDelivery: e.target.value })}
//                     className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
//                     required
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Price Range */}
//           <div className="bg-slate-50 rounded-xl p-4">
//             <h3 className="font-black text-slate-800 mb-4">Price Range</h3>
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//                   Minimum Price (₹) <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="number"
//                   value={formData.priceRange.min}
//                   onChange={(e) => setFormData({
//                     ...formData,
//                     priceRange: { ...formData.priceRange, min: e.target.value }
//                   })}
//                   min="0"
//                   className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//                   Maximum Price (₹) <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="number"
//                   value={formData.priceRange.max}
//                   onChange={(e) => setFormData({
//                     ...formData,
//                     priceRange: { ...formData.priceRange, max: e.target.value }
//                   })}
//                   min="0"
//                   className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
//                   required
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Images Section */}
//           <div className="bg-slate-50 rounded-xl p-4">
//             <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">
//               <Camera size={20} className="text-blue-600" />
//               Garment Images
//             </h3>

//             {/* Reference Images */}
//             <div className="mb-8">
//               <div className="flex items-center gap-2 mb-3">
//                 <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
//                   <ImageIcon size={16} className="text-indigo-600" />
//                 </div>
//                 <div>
//                   <h4 className="font-bold text-slate-800">Reference Images</h4>
//                   <p className="text-xs text-slate-500">Current: {existingImages.reference.length} images</p>
//                 </div>
//               </div>
              
//               <div className="border-2 border-dashed border-slate-300 rounded-xl p-4">
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
//                   {previewImages.reference.map((img, index) => (
//                     <div key={index} className="relative group">
//                       <img
//                         src={img.preview || img.url}
//                         alt={`Reference ${index + 1}`}
//                         className="w-full h-24 object-cover rounded-lg"
//                       />
//                       <button
//                         type="button"
//                         onClick={() => removeImage(index, 'reference', img.isExisting)}
//                         className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
//                       >
//                         <Trash2 size={12} />
//                       </button>
//                     </div>
//                   ))}
//                   <label className="border-2 border-dashed border-slate-300 rounded-lg h-24 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-all">
//                     <Upload size={24} className="text-slate-400 mb-1" />
//                     <span className="text-xs text-slate-500">Add More</span>
//                     <input
//                       type="file"
//                       multiple
//                       accept="image/*"
//                       className="hidden"
//                       onChange={(e) => handleImageChange(e, 'reference')}
//                     />
//                   </label>
//                 </div>
//               </div>
//             </div>

//             {/* Customer Images */}
//             <div className="mb-8">
//               <div className="flex items-center gap-2 mb-3">
//                 <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
//                   <User size={16} className="text-green-600" />
//                 </div>
//                 <div>
//                   <h4 className="font-bold text-slate-800">Customer Images</h4>
//                   <p className="text-xs text-slate-500">Current: {existingImages.customer.length} images</p>
//                 </div>
//               </div>
              
//               <div className="border-2 border-dashed border-slate-300 rounded-xl p-4">
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
//                   {previewImages.customer.map((img, index) => (
//                     <div key={index} className="relative group">
//                       <img
//                         src={img.preview || img.url}
//                         alt={`Customer ${index + 1}`}
//                         className="w-full h-24 object-cover rounded-lg"
//                       />
//                       <button
//                         type="button"
//                         onClick={() => removeImage(index, 'customer', img.isExisting)}
//                         className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
//                       >
//                         <Trash2 size={12} />
//                       </button>
//                     </div>
//                   ))}
//                   <label className="border-2 border-dashed border-slate-300 rounded-lg h-24 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-all">
//                     <Upload size={24} className="text-slate-400 mb-1" />
//                     <span className="text-xs text-slate-500">Add More</span>
//                     <input
//                       type="file"
//                       multiple
//                       accept="image/*"
//                       className="hidden"
//                       onChange={(e) => handleImageChange(e, 'customer')}
//                     />
//                   </label>
//                 </div>
//               </div>
//             </div>

//             {/* Cloth Images */}
//             <div>
//               <div className="flex items-center gap-2 mb-3">
//                 <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
//                   <Scissors size={16} className="text-orange-600" />
//                 </div>
//                 <div>
//                   <h4 className="font-bold text-slate-800">Cloth Images</h4>
//                   <p className="text-xs text-slate-500">Current: {existingImages.cloth.length} images</p>
//                 </div>
//               </div>
              
//               <div className="border-2 border-dashed border-orange-200 bg-orange-50/30 rounded-xl p-4">
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
//                   {previewImages.cloth.map((img, index) => (
//                     <div key={index} className="relative group">
//                       <img
//                         src={img.preview || img.url}
//                         alt={`Cloth ${index + 1}`}
//                         className="w-full h-24 object-cover rounded-lg border-2 border-orange-200"
//                       />
//                       <button
//                         type="button"
//                         onClick={() => removeImage(index, 'cloth', img.isExisting)}
//                         className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
//                       >
//                         <Trash2 size={12} />
//                       </button>
//                     </div>
//                   ))}
//                   <label className="border-2 border-dashed border-orange-300 rounded-lg h-24 flex flex-col items-center justify-center cursor-pointer hover:bg-orange-100 transition-all">
//                     <Upload size={24} className="text-orange-400 mb-1" />
//                     <span className="text-xs text-orange-600 font-medium">Add More</span>
//                     <input
//                       type="file"
//                       multiple
//                       accept="image/*"
//                       className="hidden"
//                       onChange={(e) => handleImageChange(e, 'cloth')}
//                     />
//                   </label>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Additional Info */}
//           <div className="bg-slate-50 rounded-xl p-4">
//             <label className="block text-xs font-black uppercase text-slate-500 mb-2">
//               Additional Information
//             </label>
//             <textarea
//               value={formData.additionalInfo}
//               onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
//               rows="3"
//               className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
//             />
//           </div>

//           {/* Form Actions */}
//           <div className="flex gap-3 pt-4">
//             <button
//               type="submit"
//               disabled={isSubmitting || !canEdit}
//               className={`flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-black hover:bg-blue-700 transition-all ${
//                 isSubmitting || !canEdit ? 'opacity-50 cursor-not-allowed' : ''
//               }`}
//             >
//               {isSubmitting ? 'Updating...' : 'Update Garment'}
//             </button>
//             <button
//               type="button"
//               onClick={() => navigate(`/admin/garments/${id}`)}
//               className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-black hover:bg-slate-300 transition-all"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       </form>
//     </div>
//   );
// }














// pages/garment/EditGarment.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Save,
  X,
  Upload,
  Trash2,
  Calendar,
  Image as ImageIcon,
  User,
  Camera,
  Scissors,
  Menu,
  AlertCircle
} from "lucide-react";
import { fetchGarmentById, updateGarment, updateGarmentImages, deleteGarmentImage } from "../../../features/garment/garmentSlice";
import { fetchAllCategories } from "../../../features/category/categorySlice";
import { fetchItems } from "../../../features/item/itemSlice";
import { fetchAllSizeFields } from "../../../features/sizeField/sizeFieldSlice";
import { fetchAllTemplates } from "../../../features/sizeTemplate/sizeTemplateSlice";
import showToast from "../../../utils/toast";
import ImageUploadSection from "../../../components/common/ImageUploadSection";

export default function EditGarment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentGarment, loading } = useSelector((state) => state.garment);
  const { categories } = useSelector((state) => state.category);
  const { items } = useSelector((state) => state.item);
  const { fields } = useSelector((state) => state.sizeField);
  const { templates } = useSelector((state) => state.sizeTemplate);
  const { user } = useSelector((state) => state.auth);

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    item: "",
    measurementTemplate: "",
    measurementSource: "template",
    measurements: [],
    additionalInfo: "",
    estimatedDelivery: "",
    priority: "normal",
    priceRange: {
      min: "",
      max: "",
    },
    status: "pending",
  });

  const [selectedFields, setSelectedFields] = useState({});
  const [manualMeasurements, setManualMeasurements] = useState({});
  const [existingImages, setExistingImages] = useState({
    reference: [],
    customer: [],
    cloth: []
  });
  const [newImages, setNewImages] = useState({
    reference: [],
    customer: [],
    cloth: []
  });
  const [deletedImages, setDeletedImages] = useState({
    reference: [],
    customer: [],
    cloth: []
  });
  const [previewImages, setPreviewImages] = useState({
    reference: [],
    customer: [],
    cloth: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = user?.role === "ADMIN";
  const isStoreKeeper = user?.role === "STORE_KEEPER";
  const canEdit = isAdmin || isStoreKeeper;

  // Load data on mount
  useEffect(() => {
    dispatch(fetchAllCategories());
    dispatch(fetchAllSizeFields());
    dispatch(fetchAllTemplates({ page: 1, search: "" }));
    if (id) {
      dispatch(fetchGarmentById(id));
    }
  }, [dispatch, id]);

  // Load items when category changes
  useEffect(() => {
    if (formData.category) {
      dispatch(fetchItems(formData.category));
    }
  }, [dispatch, formData.category]);

  // Load garment data when available
  useEffect(() => {
    if (currentGarment) {
      console.log("📦 Loading garment for edit:", currentGarment);
      
      setFormData({
        name: currentGarment.name || "",
        category: currentGarment.category?._id || currentGarment.category || "",
        item: currentGarment.item?._id || currentGarment.item || "",
        measurementTemplate: currentGarment.measurementTemplate?._id || currentGarment.measurementTemplate || "",
        measurementSource: currentGarment.measurementSource || "template",
        measurements: currentGarment.measurements || [],
        additionalInfo: currentGarment.additionalInfo || "",
        estimatedDelivery: currentGarment.estimatedDelivery?.split("T")[0] || "",
        priority: currentGarment.priority || "normal",
        priceRange: currentGarment.priceRange || { min: "", max: "" },
        status: currentGarment.status || "pending",
      });

      // Store existing images
      setExistingImages({
        reference: currentGarment.referenceImages || [],
        customer: currentGarment.customerImages || [],
        cloth: currentGarment.customerClothImages || []
      });

      // Set preview for existing images
      setPreviewImages({
        reference: (currentGarment.referenceImages || []).map(img => ({
          url: img.url,
          key: img.key,
          isExisting: true
        })),
        customer: (currentGarment.customerImages || []).map(img => ({
          url: img.url,
          key: img.key,
          isExisting: true
        })),
        cloth: (currentGarment.customerClothImages || []).map(img => ({
          url: img.url,
          key: img.key,
          isExisting: true
        }))
      });

      // Set selected fields for measurements
      if (currentGarment.measurements) {
        const selected = {};
        currentGarment.measurements.forEach(m => {
          selected[m.name] = true;
        });
        setSelectedFields(selected);
      }
    }
  }, [currentGarment]);

  const handleImagesChange = (updatedImagesArray, type) => {
    setPreviewImages(prev => ({
      ...prev,
      [type]: updatedImagesArray
    }));
    
    const files = updatedImagesArray
      .filter(img => !img.isExisting && img.file)
      .map(img => img.file);
      
    setNewImages(prev => ({
      ...prev,
      [type]: files
    }));
  };

  const handleRemoveExisting = (index, img, type) => {
    setDeletedImages(prev => ({
      ...prev,
      [type]: [...prev[type], img.key]
    }));
    
    setExistingImages(prev => ({
      ...prev,
      [type]: prev[type].filter(existingImg => existingImg.key !== img.key)
    }));
    
    setPreviewImages(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
    
    console.log("🗑️ Marked for deletion:", img.key);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!canEdit) {
      showToast.error("You don't have permission to edit garments");
      return;
    }

    // Validation
    if (!formData.name) {
      showToast.error("Garment name is required");
      return;
    }

    setIsSubmitting(true);

    try {
      // STEP 1: Update text data (without images) - Send as JSON
      const textData = {
        name: formData.name,
        category: formData.category,
        item: formData.item,
        measurementTemplate: formData.measurementTemplate || "",
        measurementSource: formData.measurementSource,
        measurements: formData.measurements,
        additionalInfo: formData.additionalInfo || "",
        estimatedDelivery: formData.estimatedDelivery,
        priority: formData.priority,
        priceRange: formData.priceRange,
        status: formData.status,
        // CRITICAL: Send keys of images to KEEP
        keepReferenceKeys: existingImages.reference.map(img => img.key),
        keepCustomerKeys: existingImages.customer.map(img => img.key),
        keepClothKeys: existingImages.cloth.map(img => img.key),
      };

      console.log("📤 Updating text data with images to keep:", {
        reference: textData.keepReferenceKeys.length,
        customer: textData.keepCustomerKeys.length,
        cloth: textData.keepClothKeys.length,
      });
      
      // First update text data
      const updateResult = await dispatch(updateGarment({ id, garmentData: textData })).unwrap();
      console.log("✅ Text data updated:", updateResult);

      // STEP 2: Upload new images if any
      const hasNewImages = 
        newImages.reference.length > 0 || 
        newImages.customer.length > 0 || 
        newImages.cloth.length > 0;

      if (hasNewImages) {
        const imageFormData = new FormData();
        
        // Add new images
        newImages.reference.forEach(file => {
          imageFormData.append("referenceImages", file);
        });
        newImages.customer.forEach(file => {
          imageFormData.append("customerImages", file);
        });
        newImages.cloth.forEach(file => {
          imageFormData.append("customerClothImages", file);
        });

        console.log("📸 Uploading new images:", {
          reference: newImages.reference.length,
          customer: newImages.customer.length,
          cloth: newImages.cloth.length,
        });

        const imageResult = await dispatch(updateGarmentImages({ id, imageData: imageFormData })).unwrap();
        console.log("✅ New images uploaded:", imageResult);
      }

      // STEP 3: Delete images that were marked for deletion
      const hasDeletedImages = 
        deletedImages.reference.length > 0 || 
        deletedImages.customer.length > 0 || 
        deletedImages.cloth.length > 0;

      if (hasDeletedImages) {
        console.log("🗑️ Deleting marked images:", deletedImages);
        
        // Delete reference images
        for (const key of deletedImages.reference) {
          await dispatch(deleteGarmentImage({ 
            id, 
            imageKey: key, 
            imageType: 'reference' 
          })).unwrap();
          console.log(`✅ Deleted reference image: ${key}`);
        }
        
        // Delete customer images
        for (const key of deletedImages.customer) {
          await dispatch(deleteGarmentImage({ 
            id, 
            imageKey: key, 
            imageType: 'customer' 
          })).unwrap();
          console.log(`✅ Deleted customer image: ${key}`);
        }
        
        // Delete cloth images
        for (const key of deletedImages.cloth) {
          await dispatch(deleteGarmentImage({ 
            id, 
            imageKey: key, 
            imageType: 'cloth' 
          })).unwrap();
          console.log(`✅ Deleted cloth image: ${key}`);
        }
      }
      
      showToast.success("Garment updated successfully");
      navigate(`/admin/garments/${id}`);
    } catch (error) {
      console.error("❌ Update error:", error);
      showToast.error(error.message || "Failed to update garment");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm sm:text-base text-slate-600">Loading garment details...</p>
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
            onClick={() => navigate(`/admin/garments/${id}`)}
            className="flex items-center gap-1 text-slate-600"
          >
            <ArrowLeft size={18} />
            <span className="font-bold text-sm">Cancel</span>
          </button>
          <h1 className="text-base font-black text-slate-800 truncate max-w-[150px]">
            Edit Garment
          </h1>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-slate-100 rounded-xl transition-all flex items-center justify-center"
            style={{ minWidth: '36px', minHeight: '36px' }}
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
                  navigate("/admin/orders");
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-slate-100 rounded-xl font-medium"
              >
                Orders List
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
        {/* Desktop Header - Hidden on Mobile */}
        <div className="hidden lg:flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(`/admin/garments/${id}`)}
            className="p-2 hover:bg-slate-100 rounded-xl transition-all"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">Edit Garment</h1>
            <p className="text-sm lg:text-base text-slate-500">Update garment details and images</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6 lg:p-8">
          <div className="space-y-4 sm:space-y-5 lg:space-y-6">
            {/* Basic Information */}
            <div className="bg-slate-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <h3 className="font-black text-slate-800 text-sm sm:text-base mb-3 sm:mb-4">Basic Information</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2">
                    Garment Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm sm:text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      category: e.target.value,
                      item: ""
                    })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm sm:text-base"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories?.map((cat) => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2">
                    Item <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.item}
                    onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm sm:text-base"
                    required
                    disabled={!formData.category}
                  >
                    <option value="">Select Item</option>
                    {items?.map((item) => (
                      <option key={item._id} value={item._id}>{item.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm sm:text-base"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm sm:text-base"
                  >
                    <option value="pending">Pending</option>
                    <option value="cutting">Cutting</option>
                    <option value="sewing">Sewing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2">
                    Estimated Delivery <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 sm:left-4 sm:top-3.5 text-slate-400" size={14} />
                    <input
                      type="date"
                      value={formData.estimatedDelivery}
                      onChange={(e) => setFormData({ ...formData, estimatedDelivery: e.target.value })}
                      className="w-full pl-8 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm sm:text-base"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Price Range */}
            <div className="bg-slate-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <h3 className="font-black text-slate-800 text-sm sm:text-base mb-3 sm:mb-4">Price Range</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2">
                    Min Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.priceRange.min}
                    onChange={(e) => setFormData({
                      ...formData,
                      priceRange: { ...formData.priceRange, min: e.target.value }
                    })}
                    min="0"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm sm:text-base"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2">
                    Max Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.priceRange.max}
                    onChange={(e) => setFormData({
                      ...formData,
                      priceRange: { ...formData.priceRange, max: e.target.value }
                    })}
                    min="0"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm sm:text-base"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Images Section */}
            <div className="bg-slate-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <h3 className="font-black text-slate-800 text-sm sm:text-base mb-3 sm:mb-4 flex items-center gap-2">
                <Camera size={16} className="text-blue-600 sm:w-5 sm:h-5" />
                Garment Images
              </h3>

              <ImageUploadSection
                title="Reference Images"
                subtitle={`Current: ${existingImages.reference.length} images`}
                icon={ImageIcon}
                theme="indigo"
                type="reference"
                images={previewImages.reference}
                onImagesChange={(newImages) => handleImagesChange(newImages, 'reference')}
                onRemoveExisting={(index, img) => handleRemoveExisting(index, img, 'reference')}
              />

              <ImageUploadSection
                title="Customer Images"
                subtitle={`Current: ${existingImages.customer.length} images`}
                icon={User}
                theme="green"
                type="customer"
                images={previewImages.customer}
                onImagesChange={(newImages) => handleImagesChange(newImages, 'customer')}
                onRemoveExisting={(index, img) => handleRemoveExisting(index, img, 'customer')}
              />

              <ImageUploadSection
                title="Cloth Images"
                subtitle={`Current: ${existingImages.cloth.length} images`}
                icon={Scissors}
                theme="orange"
                type="cloth"
                images={previewImages.cloth}
                onImagesChange={(newImages) => handleImagesChange(newImages, 'cloth')}
                onRemoveExisting={(index, img) => handleRemoveExisting(index, img, 'cloth')}
              />
            </div>

            {/* Additional Info */}
            <div className="bg-slate-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <label className="block text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2">
                Additional Information
              </label>
              <textarea
                value={formData.additionalInfo}
                onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                rows="3"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-sm sm:text-base"
              />
            </div>

            {/* Form Actions - Responsive */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
              <button
                type="submit"
                disabled={isSubmitting || !canEdit}
                className={`flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg sm:rounded-xl font-black text-sm sm:text-base hover:bg-blue-700 transition-all flex items-center justify-center gap-2 ${
                  isSubmitting || !canEdit ? 'opacity-50 cursor-not-allowed' : ''
                } order-2 sm:order-1`}
              >
                <Save size={14} className="sm:w-4 sm:h-4" />
                {isSubmitting ? 'Updating...' : 'Update Garment'}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/admin/garments/${id}`)}
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-200 text-slate-700 rounded-lg sm:rounded-xl font-black text-sm sm:text-base hover:bg-slate-300 transition-all flex items-center justify-center gap-2 order-1 sm:order-2"
              >
                <X size={14} className="sm:w-4 sm:h-4" />
                Cancel
              </button>
            </div>

            {/* Mobile Info Text */}
            <div className="sm:hidden text-[10px] text-slate-400 text-center pt-2">
              <span className="text-red-500">*</span> Required fields
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}