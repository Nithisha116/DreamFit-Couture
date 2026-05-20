import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  X,
  Upload,
  Trash2,
  ChevronDown,
  Calendar,
  AlertCircle,
  Image as ImageIcon,
  User,
  Camera,
  Scissors,
  Save,
  BookmarkPlus,
  Eye,
    ChevronLeft,      // ← Add this
  ChevronRight  
} from "lucide-react";
import { fetchAllCategories } from "../../../features/category/categorySlice";
import { fetchItems } from "../../../features/item/itemSlice";
import { fetchAllSizeFields } from "../../../features/sizeField/sizeFieldSlice";
import { fetchAllTemplates } from "../../../features/sizeTemplate/sizeTemplateSlice";
import { fetchAllFabrics } from "../../../features/fabric/fabricSlice";
import {
  saveMeasurementTemplate,
  fetchCustomerTemplates,
} from "../../../features/customer/customerSlice";
import {
  fetchAllDeliveryDates, // 🔥 CHANGED
  selectAllDeliveryDates, // 🔥 CHANGED
  selectCalendarLoading, // 🔥 CHANGED
} from "../../../features/garment/garmentSlice";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import showToast from "../../../utils/toast";
import ImageUploadSection from "../../../components/common/ImageUploadSection";

export default function GarmentForm({
  onClose,
  onSave,
  editingGarment,
  customerId,
}) {
  const dispatch = useDispatch();

  const { categories } = useSelector((state) => state.category);
  const { items } = useSelector((state) => state.item);
  const { fields } = useSelector((state) => state.sizeField);
  const { templates } = useSelector((state) => state.sizeTemplate);
  const { fabrics } = useSelector((state) => state.fabric);
  const { user } = useSelector((state) => state.auth);
  const { currentCustomer, customerTemplates, templatesLoading } = useSelector(
    (state) => state.customer,
  );

  const allDeliveryDates = useSelector(selectAllDeliveryDates); // 🔥 CHANGED
  const calendarLoading = useSelector(selectCalendarLoading); // 🔥 CHANGED

  const userRole = user?.role;
  const isAdmin = userRole === "ADMIN";
  const isStoreKeeper = userRole === "STORE_KEEPER";
  const canEdit = isAdmin || isStoreKeeper;

  const effectiveCustomerId = customerId || currentCustomer?._id;

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    item: "",
    measurementTemplate: "",
    measurementSource: "template",
    measurements: [],
    studioImages: [],
    customerProvidedImages: [],
    customerClothImages: [],
    additionalInfo: "",
    estimatedDelivery: "",
    priority: "normal",
    priceRange: {
      min: "",
      max: "",
    },
    finalizedPrice: "",
    fabricSource: "customer",
    selectedFabric: "",
    fabricMeters: "",
    fabricPrice: 0,

    categoryName: "",
    itemName: "",
  });

  const [selectedFields, setSelectedFields] = useState({});
  const [manualMeasurements, setManualMeasurements] = useState({});
  const [previewImages, setPreviewImages] = useState({
    studio: [],
    customerProvided: [],
    customerCloth: [],
  });
  const [loading, setLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const calendarRef = useRef(null);

  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [selectedCustomerTemplate, setSelectedCustomerTemplate] = useState("");

  // ==================== LOAD DATA ON MOUNT ====================
  useEffect(() => {
    dispatch(fetchAllCategories());
    dispatch(fetchAllSizeFields());
    dispatch(fetchAllTemplates({ page: 1, search: "" }));
    dispatch(fetchAllFabrics());
  }, [dispatch]);

  useEffect(() => {
    if (effectiveCustomerId) {
      console.log(`📋 Fetching templates for customer: ${effectiveCustomerId}`);
      dispatch(fetchCustomerTemplates(effectiveCustomerId));
    }
  }, [dispatch, effectiveCustomerId]);

  // 🔥 Month fetch logic - GET ALL DELIVERY DATES (no customer needed)
  useEffect(() => {
    const month = currentMonth.getMonth() + 1; // 1-12 for backend
    const year = currentMonth.getFullYear();

    console.log(
      `📅 Fetching ALL delivery dates for month: ${month}, year: ${year}`,
    );

    // 🔥 New action - no customerId needed
    dispatch(fetchAllDeliveryDates({ month, year }));
  }, [dispatch, currentMonth]); // 🔥 Removed effectiveCustomerId dependency

  // 🔍 DEBUG: Log all delivery dates
  useEffect(() => {
    if (allDeliveryDates && allDeliveryDates.length > 0) {
      console.log("📅 All delivery dates from Redux:", allDeliveryDates);
    } else {
      console.log("📅 No delivery dates found");
    }
  }, [allDeliveryDates]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (formData.category) {
      dispatch(fetchItems(formData.category));
    }
  }, [dispatch, formData.category]);

  useEffect(() => {
    if (formData.category && categories) {
      const selectedCategory = categories.find(
        (cat) => cat._id === formData.category,
      );
      if (selectedCategory) {
        setFormData((prev) => ({
          ...prev,
          categoryName:
            selectedCategory.name || selectedCategory.categoryName || "",
        }));
      }
    }
  }, [formData.category, categories]);

  useEffect(() => {
    if (formData.item && items) {
      const selectedItem = items.find((item) => item._id === formData.item);
      if (selectedItem) {
        setFormData((prev) => {
          const newMin = selectedItem.priceRange?.min || 0;
          const newMax = selectedItem.priceRange?.max || 0;
          let newFinalized = prev.finalizedPrice;

          // Auto-populate with catalog max price if not already set, or handle bounds reset
          if (!newFinalized) {
            newFinalized = newMax;
          } else if (newFinalized && (newFinalized < newMin || newFinalized > newMax)) {
            newFinalized = newMax; // Auto-replace with new upper limit if out of new item range
            setTimeout(() => {
              showToast.info(`Custom price ₹${prev.finalizedPrice} was outside the new garment range. Reset to new maximum ₹${newMax}.`);
            }, 100);
          }

          return {
            ...prev,
            itemName: selectedItem.name || selectedItem.itemName || "",
            priceRange: {
              min: newMin,
              max: newMax,
            },
            finalizedPrice: newFinalized,
          };
        });
      }
    }
  }, [formData.item, items]);

  useEffect(() => {
    if (
      formData.fabricSource === "shop" &&
      formData.selectedFabric &&
      formData.fabricMeters
    ) {
      const selectedFabric = fabrics?.find(
        (f) => f._id === formData.selectedFabric,
      );
      if (selectedFabric) {
        const pricePerMeter = selectedFabric.pricePerMeter || 0;
        const meters = parseFloat(formData.fabricMeters) || 0;
        const fabricPrice = pricePerMeter * meters;

        setFormData((prev) => ({
          ...prev,
          fabricPrice: fabricPrice,
        }));
      }
    } else if (formData.fabricSource === "customer") {
      setFormData((prev) => ({
        ...prev,
        fabricPrice: 0,
        selectedFabric: "",
        fabricMeters: "",
      }));
    }
  }, [
    formData.fabricSource,
    formData.selectedFabric,
    formData.fabricMeters,
    fabrics,
  ]);

  useEffect(() => {
    if (
      formData.measurementTemplate &&
      formData.measurementSource === "template"
    ) {
      const template = templates?.find(
        (t) => t._id === formData.measurementTemplate,
      );
      if (template) {
        const measurements = template.sizeFields.map((field) => ({
          name: field.name,
          value: "",
          unit: "inches",
        }));
        setFormData((prev) => ({ ...prev, measurements }));

        const selected = {};
        template.sizeFields.forEach((field) => {
          selected[field.name] = true;
        });
        setSelectedFields(selected);
      }
    }
  }, [formData.measurementTemplate, templates]);

  useEffect(() => {
    if (formData.measurementSource === "customer" && selectedCustomerTemplate) {
      const template = customerTemplates?.find(
        (t) => t._id === selectedCustomerTemplate,
      );
      if (template) {
        const measurements = [];
        const manual = {};

        if (template.measurements instanceof Map) {
          template.measurements.forEach((value, key) => {
            measurements.push({
              name: key,
              value: value,
              unit: "inches",
            });
            manual[key] = value;
          });
        } else {
          Object.entries(template.measurements).forEach(([key, value]) => {
            measurements.push({
              name: key,
              value: value,
              unit: "inches",
            });
            manual[key] = value;
          });
        }

        setFormData((prev) => ({
          ...prev,
          measurements: measurements,
        }));

        setManualMeasurements(manual);

        showToast.success(`✅ Loaded template: ${template.name}`);
      }
    }
  }, [selectedCustomerTemplate, customerTemplates]);

  useEffect(() => {
    if (editingGarment) {
      setFormData({
        name: editingGarment.name || "",
        category: editingGarment.category?._id || editingGarment.category || "",
        item: editingGarment.item?._id || editingGarment.item || "",
        categoryName:
          editingGarment.categoryName || editingGarment.category?.name || "",
        itemName: editingGarment.itemName || editingGarment.item?.name || "",
        measurementTemplate:
          editingGarment.measurementTemplate?._id ||
          editingGarment.measurementTemplate ||
          "",
        measurementSource: editingGarment.measurementSource || "template",
        measurements: editingGarment.measurements || [],
        studioImages: editingGarment.referenceImages || [],
        customerProvidedImages: editingGarment.customerImages || [],
        customerClothImages: editingGarment.customerClothImages || [],
        additionalInfo: editingGarment.additionalInfo || "",
        estimatedDelivery:
          editingGarment.estimatedDelivery?.split("T")[0] || "",
        priority: editingGarment.priority || "normal",
        priceRange: editingGarment.priceRange || { min: "", max: "" },
        finalizedPrice: (editingGarment.finalizedPrice !== undefined && editingGarment.finalizedPrice !== null && editingGarment.finalizedPrice !== "") ? editingGarment.finalizedPrice : (editingGarment.priceRange?.max || ""),
        fabricSource: editingGarment.fabricSource || "customer",
        selectedFabric: editingGarment.selectedFabric || "",
        fabricMeters: editingGarment.fabricMeters || "",
        fabricPrice: editingGarment.fabricPrice || 0,
      });

      const studioPreviews = (editingGarment.referenceImages || []).map(
        (img) => ({
          preview: img.url || img,
          file: null,
          isExisting: true,
          url: img.url,
          key: img.key,
        }),
      );

      const customerPreviews = (editingGarment.customerImages || []).map(
        (img) => ({
          preview: img.url || img,
          file: null,
          isExisting: true,
          url: img.url,
          key: img.key,
        }),
      );

      const clothPreviews = (editingGarment.customerClothImages || []).map(
        (img) => ({
          preview: img.url || img,
          file: null,
          isExisting: true,
          url: img.url,
          key: img.key,
        }),
      );

      setPreviewImages({
        studio: studioPreviews,
        customerProvided: customerPreviews,
        customerCloth: clothPreviews,
      });

      if (editingGarment.measurements) {
        const selected = {};
        editingGarment.measurements.forEach((m) => {
          selected[m.name] = true;
        });
        setSelectedFields(selected);
      }

      if (
        editingGarment.measurementSource === "customer" &&
        editingGarment.measurements
      ) {
        const manual = {};
        editingGarment.measurements.forEach((m) => {
          manual[m.name] = m.value;
        });
        setManualMeasurements(manual);
      }
    }
  }, [editingGarment]);

  // ==================== IMAGE HANDLERS ====================
  const handleImagesChange = (newImages, type) => {
    setPreviewImages((prev) => ({
      ...prev,
      [type]: newImages,
    }));

    let imageField;
    switch (type) {
      case "studio":
        imageField = "studioImages";
        break;
      case "customerProvided":
        imageField = "customerProvidedImages";
        break;
      case "customerCloth":
        imageField = "customerClothImages";
        break;
      default:
        return;
    }

    const files = newImages.map(img => img.file).filter(Boolean);
    setFormData((prev) => ({
      ...prev,
      [imageField]: files,
    }));
  };

  // ==================== MEASUREMENT HANDLERS ====================
  const handleMeasurementToggle = (field) => {
    setSelectedFields((prev) => ({
      ...prev,
      [field.name]: !prev[field.name],
    }));

    if (!selectedFields[field.name]) {
      setFormData((prev) => ({
        ...prev,
        measurements: [
          ...prev.measurements,
          { name: field.name, value: "", unit: field.unit || "inches" },
        ],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        measurements: prev.measurements.filter((m) => m.name !== field.name),
      }));
    }
  };

  const handleMeasurementChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      measurements: prev.measurements.map((m) =>
        m.name === name ? { ...m, value: parseFloat(value) || "" } : m,
      ),
    }));
  };

  const handleManualMeasurementChange = (name, value) => {
    setManualMeasurements((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==================== TEMPLATE HANDLERS ====================
  const handleSaveAsTemplate = () => {
    if (!effectiveCustomerId) {
      showToast.error("No customer selected to save template");
      return;
    }

    let currentMeasurements = {};

    if (formData.measurementSource === "template") {
      formData.measurements.forEach((m) => {
        if (m.value) {
          currentMeasurements[m.name] = parseFloat(m.value);
        }
      });
    } else {
      currentMeasurements = manualMeasurements;
    }

    currentMeasurements = Object.fromEntries(
      Object.entries(currentMeasurements).filter(
        ([_, value]) => value && value > 0,
      ),
    );

    if (Object.keys(currentMeasurements).length === 0) {
      showToast.error("No measurements entered to save");
      return;
    }

    setShowSaveTemplateModal(true);
  };

  const confirmSaveTemplate = async () => {
    if (!templateName.trim()) {
      showToast.error("Please enter a template name");
      return;
    }

    if (!effectiveCustomerId) {
      showToast.error("Customer ID missing");
      setShowSaveTemplateModal(false);
      return;
    }

    let currentMeasurements = {};

    if (formData.measurementSource === "template") {
      formData.measurements.forEach((m) => {
        if (m.value) {
          currentMeasurements[m.name] = parseFloat(m.value);
        }
      });
    } else {
      currentMeasurements = manualMeasurements;
    }

    currentMeasurements = Object.fromEntries(
      Object.entries(currentMeasurements).filter(
        ([_, value]) => value && value > 0,
      ),
    );

    const templateData = {
      templateName: templateName.trim(),
      measurements: currentMeasurements,
      garmentReference: editingGarment?._id || null,
      notes: `Saved from ${formData.name} garment`,
    };

    try {
      await dispatch(
        saveMeasurementTemplate({
          customerId: effectiveCustomerId,
          templateData,
        }),
      ).unwrap();

      setShowSaveTemplateModal(false);
      setTemplateName("");
      showToast.success(`✅ Template "${templateName}" saved successfully!`);

      dispatch(fetchCustomerTemplates(effectiveCustomerId));
    } catch (error) {
      console.error("❌ Error saving template:", error);
    }
  };

  // ==================== PRICE CALCULATION ====================
  const getTotalPrices = () => {
    const fabricPrice = formData.fabricPrice || 0;
    if (formData.finalizedPrice !== "" && formData.finalizedPrice !== undefined && formData.finalizedPrice !== null) {
      const finalPrice = parseFloat(formData.finalizedPrice) || 0;
      return {
        totalMin: finalPrice + fabricPrice,
        totalMax: finalPrice + fabricPrice,
      };
    }
    const itemMin = parseFloat(formData.priceRange.min) || 0;
    const itemMax = parseFloat(formData.priceRange.max) || 0;

    return {
      totalMin: itemMin + fabricPrice,
      totalMax: itemMax + fabricPrice,
    };
  };

  // ==================== CALENDAR FUNCTIONS ====================
  const handleDateSelect = useCallback((date) => {
    setSelectedDate(date);
    setShowCalendar(false);

    // Format date as YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    setFormData((prev) => ({
      ...prev,
      estimatedDelivery: dateStr,
    }));

    console.log("📅 Date selected:", dateStr);
  }, []);

  const handleMonthChange = useCallback((date) => {
    setCurrentMonth(date);
  }, []);

  const formatDisplayDate = useCallback((date) => {
    if (!date) return "Select estimated delivery date";
    const d = new Date(date);
    return d.toLocaleDateString("en-IN", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);

  // 🔥 Render day contents with RED dots for ALL busy days
  // const renderDayContents = useCallback(
  //   (day, date) => {
  //     // Format date as YYYY-MM-DD
  //     const y = date.getFullYear();
  //     const m = String(date.getMonth() + 1).padStart(2, "0");
  //     const d = String(date.getDate()).padStart(2, "0");
  //     const dateStr = `${y}-${m}-${d}`;

  //     // ✅ Check if date has ANY orders (from all customers)
  //     const deliveryInfo = allDeliveryDates?.find(
  //       (item) => item._id === dateStr,
  //     );
  //     const hasOrders = deliveryInfo && deliveryInfo.count > 0;

  //     return (
  //       <div className="relative flex items-center justify-center w-full h-full">
  //         <span className="z-0">{day}</span>
  //         {hasOrders && (
  //           <div
  //             className="absolute -top-1 -right-1 w-2 h-2 rounded-full border border-white shadow-sm"
  //             style={{
  //               backgroundColor: "#ef4444", // 🔴 RED for busy days
  //               zIndex: 10,
  //             }}
  //           ></div>
  //         )}
  //       </div>
  //     );
  //   },
  //   [allDeliveryDates],
  // ); // 🔥 Changed dependency

// const renderDayContents = useCallback(
//   (day, date) => {
//     const y = date.getFullYear();
//     const m = String(date.getMonth() + 1).padStart(2, "0");
//     const d = String(date.getDate()).padStart(2, "0");
//     const dateStr = `${y}-${m}-${d}`;

//     const deliveryInfo = allDeliveryDates?.find((item) => item._id === dateStr);
//     const count = deliveryInfo?.count || 0;
//     const hasOrders = count > 0;

//     return (
//       /* Main Wrapper: Fixed size & overflow visible is MUST */
//       <div style={{ 
//         position: 'relative', 
//         width: '32px', 
//         height: '32px', 
//         display: 'flex', 
//         alignItems: 'center', 
//         justifyContent: 'center',
//         margin: '0 auto'
//       }}>
        
//         {/* 1. Date Number */}
//         <span style={{ fontSize: '14px', fontWeight: '500' }}>{day}</span>

//         {/* 2. 🔴 Top Corner Red Dot */}
//         {hasOrders && (
//           <div style={{
//             position: 'absolute',
//             top: '-2px',
//             right: '-2px',
//             width: '8px',
//             height: '8px',
//             backgroundColor: '#ef4444',
//             borderRadius: '50%',
//             border: '1.5px solid white',
//             boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
//           }} />
//         )}

//         {/* 3. 🟢 Bottom Center Green Badge */}
//         {hasOrders && (
//           <div style={{
//             position: 'absolute',
//             bottom: '-6px', // Push it slightly outside the box
//             left: '50%',
//             transform: 'translateX(-50%)',
//             backgroundColor: '#22c55e',
//             color: 'white',
//             borderRadius: '10px',
//             minWidth: '16px',
//             height: '14px',
//             fontSize: '9px',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             padding: '0 4px',
//             border: '1px solid white',
//             boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
//             zIndex: 10
//           }}>
//             {count > 9 ? "9+" : count}
//           </div>
//         )}
//       </div>
//     );
//   },
//   [allDeliveryDates]
// );

const renderDayContents = useCallback(
  (day, date) => {
    // 🔥 Past Date Check (Today-ku munnadi ulla dates)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPast = date < today;

    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;

    const deliveryInfo = allDeliveryDates?.find((item) => item._id === dateStr);
    const count = deliveryInfo?.count || 0;
    
    // UI condition: Orders irukanum and adhu past date-ah irukakoodathu
    const hasOrders = count > 0 && !isPast;

    return (
      /* Main Wrapper: Fixed size & overflow visible is MUST */
      <div style={{ 
        position: 'relative', 
        width: '32px', 
        height: '32px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        margin: '0 auto',
        opacity: isPast ? 0.4 : 1 // Past dates-ai mattum fade pannum
      }}>
        
        {/* 1. Date Number */}
        <span style={{ 
          fontSize: '14px', 
          fontWeight: isPast ? '400' : '500',
          color: isPast ? '#94a3b8' : 'inherit' 
        }}>
          {day}
        </span>

        {/* 2. 🔴 Top Corner Red Dot */}
        {hasOrders && (
          <div style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            width: '8px',
            height: '8px',
            backgroundColor: '#ef4444',
            borderRadius: '50%',
            border: '1.5px solid white',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
          }} />
        )}

        {/* 3. 🟢 Bottom Center Green Badge */}
        {hasOrders && (
          <div style={{
            position: 'absolute',
            bottom: '-6px', // Push it slightly outside the box
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#22c55e',
            color: 'white',
            borderRadius: '10px',
            minWidth: '16px',
            height: '14px',
            fontSize: '9px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
            border: '1px solid white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
            zIndex: 10
          }}>
            {count > 9 ? "9+" : count}
          </div>
        )}
      </div>
    );
  },
  [allDeliveryDates]
);



  // ==================== SUBMIT HANDLER ====================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!formData.name) {
      showToast.error("Garment name is required");
      setLoading(false);
      return;
    }

    if (!formData.category) {
      showToast.error("Please select a category");
      setLoading(false);
      return;
    }

    if (!formData.item) {
      showToast.error("Please select an item");
      setLoading(false);
      return;
    }

    if (!formData.estimatedDelivery) {
      showToast.error("Please select estimated delivery date");
      setLoading(false);
      return;
    }

    if (!formData.priceRange.min || !formData.priceRange.max) {
      showToast.error("Please enter price range");
      setLoading(false);
      return;
    }

    if (parseInt(formData.priceRange.min) > parseInt(formData.priceRange.max)) {
      showToast.error("Minimum price cannot be greater than maximum price");
      setLoading(false);
      return;
    }

    if (formData.finalizedPrice === "" || formData.finalizedPrice === undefined || formData.finalizedPrice === null) {
      showToast.error("Please enter the price for this garment");
      setLoading(false);
      return;
    }

    const finalPriceNum = Number(formData.finalizedPrice);
    const minPriceNum = Number(formData.priceRange.min) || 0;
    const maxPriceNum = Number(formData.priceRange.max) || 0;
    
    if (minPriceNum > 0 && maxPriceNum > 0) {
      if (finalPriceNum < minPriceNum || finalPriceNum > maxPriceNum) {
        const proceed = window.confirm(`⚠️ Custom Price Warning:\nThe entered price ₹${finalPriceNum} is outside the standard catalog range of ₹${minPriceNum} - ₹${maxPriceNum}.\n\nDo you want to override and lock this custom price?`);
        if (!proceed) {
          setLoading(false);
          return;
        }
      }
    }

    if (formData.fabricSource === "shop") {
      if (!formData.selectedFabric) {
        showToast.error("Please select a fabric");
        setLoading(false);
        return;
      }
      if (!formData.fabricMeters || parseFloat(formData.fabricMeters) <= 0) {
        showToast.error("Please enter valid fabric meters");
        setLoading(false);
        return;
      }
    }

    // Prepare final measurements
    let finalMeasurements = [];

    if (formData.measurementSource === "template") {
      finalMeasurements = formData.measurements
        .filter((m) => m.value && parseFloat(m.value) > 0)
        .map((m) => ({
          name: m.name,
          value: parseFloat(m.value),
          unit: m.unit || "inches",
        }));
      console.log("📏 Template measurements:", finalMeasurements);
    } else if (formData.measurementSource === "customer") {
      finalMeasurements = Object.entries(manualMeasurements)
        .filter(([_, value]) => value && parseFloat(value) > 0)
        .map(([name, value]) => ({
          name,
          value: parseFloat(value),
          unit: "inches",
        }));
      console.log("📏 Customer template measurements:", finalMeasurements);
    } else if (formData.measurementSource === "manual") {
      finalMeasurements = Object.entries(manualMeasurements)
        .filter(([_, value]) => value && parseFloat(value) > 0)
        .map(([name, value]) => ({
          name,
          value: parseFloat(value),
          unit: "inches",
        }));
      console.log("📏 Manual measurements:", finalMeasurements);
    }

    // Validate measurements
    if (
      finalMeasurements.length === 0 &&
      formData.measurementSource !== "template"
    ) {
      showToast.warning("No measurements entered. You can add them later.");
    }

    try {
      console.log("📦 Preparing garment data with images:");
      console.log("Studio images:", formData.studioImages?.length || 0);
      console.log(
        "Customer images:",
        formData.customerProvidedImages?.length || 0,
      );
      console.log("Cloth images:", formData.customerClothImages?.length || 0);

      // Create FormData
      const formDataToSend = new FormData();

      // Add text fields
      formDataToSend.append("name", formData.name);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("item", formData.item);
      formDataToSend.append("categoryName", formData.categoryName || "");
      formDataToSend.append("itemName", formData.itemName || "");
      formDataToSend.append(
        "measurementTemplate",
        formData.measurementTemplate || "",
      );
      formDataToSend.append("measurementSource", formData.measurementSource);
      formDataToSend.append("measurements", JSON.stringify(finalMeasurements));
      formDataToSend.append("additionalInfo", formData.additionalInfo || "");
      formDataToSend.append("estimatedDelivery", formData.estimatedDelivery);
      formDataToSend.append("priority", formData.priority);
      formDataToSend.append("priceRange", JSON.stringify(formData.priceRange));
      if (formData.finalizedPrice !== "" && formData.finalizedPrice !== null && formData.finalizedPrice !== undefined) {
        formDataToSend.append("finalizedPrice", String(formData.finalizedPrice));
      }

      // Add fabric data
      formDataToSend.append("fabricSource", formData.fabricSource);
      if (formData.fabricSource === "shop") {
        formDataToSend.append("selectedFabric", formData.selectedFabric);
        formDataToSend.append("fabricMeters", formData.fabricMeters);
        formDataToSend.append("fabricPrice", formData.fabricPrice);
      } else {
        formDataToSend.append("fabricPrice", "0");
      }

      // Add images
      if (formData.studioImages && formData.studioImages.length > 0) {
        for (const file of formData.studioImages) {
          if (file instanceof File) {
            formDataToSend.append("referenceImages", file);
          }
        }
      }

      if (
        formData.customerProvidedImages &&
        formData.customerProvidedImages.length > 0
      ) {
        for (const file of formData.customerProvidedImages) {
          if (file instanceof File) {
            formDataToSend.append("customerImages", file);
          }
        }
      }

      if (
        formData.customerClothImages &&
        formData.customerClothImages.length > 0
      ) {
        for (const file of formData.customerClothImages) {
          if (file instanceof File) {
            formDataToSend.append("customerClothImages", file);
          }
        }
      }

      // Clean up blob URLs
      Object.values(previewImages)
        .flat()
        .forEach((img) => {
          if (img.preview && img.preview.startsWith("blob:")) {
            URL.revokeObjectURL(img.preview);
          }
        });

      // Call onSave with FormData
      onSave(formDataToSend);
    } catch (error) {
      console.error("❌ Error preparing form data:", error);
      showToast.error("Failed to prepare garment data");
    } finally {
      setLoading(false);
    }
  };

  const groupedFields = fields?.reduce((acc, field) => {
    if (!acc[field.category]) acc[field.category] = [];
    acc[field.category].push(field);
    return acc;
  }, {});

  const categoryTitles = {
    upper: "Upper Body Measurements",
    lower: "Lower Body Measurements",
    full: "Full Body Measurements",
    other: "Other Measurements",
  };

  const totals = getTotalPrices();

  // Add CSS for calendar alignment
  const calendarStyles = `
    .react-datepicker__day {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 2.5rem !important;
      height: 2.5rem !important;
    }
    .react-datepicker__day > div {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <style>{calendarStyles}</style>
      <div className="bg-white w-full max-w-4xl rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 lg:p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700">
          <h2 className="text-base sm:text-lg lg:text-xl font-black text-white truncate pr-2">
            {editingGarment ? "Edit Garment" : "Add New Garment"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-all flex items-center justify-center flex-shrink-0"
          >
            <X size={18} className="sm:w-5 sm:h-5 text-white" />
          </button>
        </div>

        {/* Form - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6">
          <form
            onSubmit={handleSubmit}
            className="space-y-4 sm:space-y-5 lg:space-y-6"
          >
            {/* Basic Information */}
            <div className="bg-slate-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <h3 className="font-black text-slate-800 text-sm sm:text-base mb-3 sm:mb-4">
                Basic Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2">
                    Garment Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Men's Formal Shirt"
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
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value,
                        item: "",
                        itemName: "",
                      })
                    }
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm sm:text-base"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories?.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>

                  {formData.categoryName && (
                    <p className="text-[8px] sm:text-xs text-green-600 mt-1 truncate">
                      Selected: {formData.categoryName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2">
                    Item <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.item}
                    onChange={(e) =>
                      setFormData({ ...formData, item: e.target.value })
                    }
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm sm:text-base"
                    required
                    disabled={!formData.category}
                  >
                    <option value="">Select Item</option>
                    {items?.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name}{" "}
                        {item.priceRange
                          ? `(₹${item.priceRange.min} - ₹${item.priceRange.max})`
                          : ""}
                      </option>
                    ))}
                  </select>

                  {formData.itemName && (
                    <p className="text-[8px] sm:text-xs text-green-600 mt-1 truncate">
                      Selected: {formData.itemName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm sm:text-base"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                {/* Calendar with RED dots */}
                <div>
                  <label className="block text-[10px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2">
                    Estimated Delivery <span className="text-red-500">*</span>
                  </label>
                  <div className="relative" ref={calendarRef}>
                    <button
                      type="button"
                      onClick={() => setShowCalendar(!showCalendar)}
                      className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-left text-sm sm:text-base"
                    >
                      <Calendar
                        size={14}
                        className="text-slate-400 sm:w-4 sm:h-4 flex-shrink-0"
                      />
                      <span
                        className={`truncate ${formData.estimatedDelivery ? "text-slate-800" : "text-slate-400"}`}
                      >
                        {formatDisplayDate(formData.estimatedDelivery)}
                      </span>
                      {calendarLoading && (
                        <div className="ml-auto w-3 h-3 sm:w-4 sm:h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                      )}
                    </button>

                    {showCalendar && (
                      <div className="absolute z-20 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl p-3 sm:p-4">
                        <DatePicker
                          inline
                          selected={selectedDate}
                          onChange={handleDateSelect}
                          onMonthChange={handleMonthChange}
                          minDate={new Date()}
                          renderDayContents={renderDayContents}
                          calendarClassName="!border-0"
                        />

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mt-3 pt-3 border-t border-slate-100 text-[10px] sm:text-xs">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 sm:w-3 sm:h-3 rounded-full"
                              style={{ backgroundColor: "#ef4444" }}
                            ></div>
                            <span className="text-slate-600">
                              Busy days (orders from all customers)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-transparent border border-slate-300 rounded-full"></div>
                            <span className="text-slate-600">Free days</span>
                          </div>
                        </div>

                        {allDeliveryDates && allDeliveryDates.length > 0 && (
                          <p className="text-[8px] sm:text-xs text-blue-600 mt-2">
                            {allDeliveryDates.length} day(s) have orders this
                            month
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-[8px] sm:text-xs text-slate-400 mt-1 sm:mt-2">
                    Red dots show busy days with existing orders
                  </p>
                </div>


    




              </div>
            </div>

            {/* Fabric Section - UNCHANGED */}
            <div className="bg-slate-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border-l-4 border-l-blue-500">
              <h3 className="font-black text-slate-800 text-sm sm:text-base mb-3 sm:mb-4 flex items-center gap-2">
                <Scissors size={14} className="text-blue-600 sm:w-5 sm:h-5" />
                Fabric Details
              </h3>

              <div className="flex flex-wrap gap-3 sm:gap-4 mb-3 sm:mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="fabricSource"
                    value="customer"
                    checked={formData.fabricSource === "customer"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fabricSource: e.target.value,
                        selectedFabric: "",
                        fabricMeters: "",
                        fabricPrice: 0,
                      })
                    }
                    className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600"
                  />
                  <span className="text-[10px] sm:text-xs font-medium">
                    Customer Provided
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="fabricSource"
                    value="shop"
                    checked={formData.fabricSource === "shop"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fabricSource: e.target.value,
                      })
                    }
                    className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600"
                  />
                  <span className="text-[10px] sm:text-xs font-medium">
                    Shop Provided
                  </span>
                </label>
              </div>

              {formData.fabricSource === "shop" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-2">
                  <div>
                    <label className="block text-[8px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2">
                      Select Fabric <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.selectedFabric}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          selectedFabric: e.target.value,
                        })
                      }
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-slate-200 rounded-lg sm:rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    >
                      <option value="">Choose Fabric</option>
                      {fabrics?.map((fabric) => (
                        <option key={fabric._id} value={fabric._id}>
                          {fabric.name} - {fabric.color} (₹
                          {fabric.pricePerMeter}/m)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[8px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2">
                      Meters <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.fabricMeters}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          fabricMeters: e.target.value,
                        })
                      }
                      placeholder="e.g., 2.5"
                      step="0.1"
                      min="0"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-slate-200 rounded-lg sm:rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[8px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2">
                      Fabric Price
                    </label>
                    <div className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl text-xs sm:text-sm text-blue-700 font-bold">
                      ₹{formData.fabricPrice.toFixed(2)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Price Range & Total Display */}
            <div className="bg-slate-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <h3 className="font-black text-slate-800 text-sm sm:text-base mb-3 sm:mb-4">
                Pricing
              </h3>

              <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-[8px] sm:text-xs text-blue-600 font-bold mb-1">
                  Item Price Range
                </p>
                <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                  <div>
                    <span className="text-slate-600">Min:</span>
                    <span className="ml-1 sm:ml-2 font-bold text-blue-700">
                      ₹{formData.priceRange.min || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600">Max:</span>
                    <span className="ml-1 sm:ml-2 font-bold text-blue-700">
                      ₹{formData.priceRange.max || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Finalized Price Input */}
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-200">
                <label className="block text-[8px] sm:text-xs font-black uppercase text-slate-500 mb-2">
                  Garment Price (₹) <span className="text-rose-500">*</span>
                </label>
                
                {/* Quick Selection Buttons */}
                {formData.priceRange.min && formData.priceRange.max && (
                  <div className="flex gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, finalizedPrice: Number(formData.priceRange.min) || 0 }))}
                      className="flex-1 py-1.5 px-3 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold border border-blue-200 transition-all text-center"
                    >
                      Min Preset: ₹{formData.priceRange.min}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, finalizedPrice: Number(formData.priceRange.max) || 0 }))}
                      className="flex-1 py-1.5 px-3 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold border border-indigo-200 transition-all text-center"
                    >
                      Max Preset: ₹{formData.priceRange.max}
                    </button>
                  </div>
                )}

                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-slate-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    name="finalizedPrice"
                    value={formData.finalizedPrice || ""}
                    onChange={(e) => {
                      const val = e.target.value === "" ? "" : Number(e.target.value);
                      setFormData(prev => ({ ...prev, finalizedPrice: val }));
                    }}
                    placeholder="Enter garment price (e.g. 2500)"
                    required
                    className="w-full pl-8 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold text-slate-800"
                  />
                </div>
                
                {formData.finalizedPrice !== "" && formData.finalizedPrice !== undefined && formData.finalizedPrice !== null && (
                  (Number(formData.finalizedPrice) < Number(formData.priceRange.min) || Number(formData.finalizedPrice) > Number(formData.priceRange.max)) ? (
                    <p className="text-[10px] text-amber-600 font-bold mt-1.5 flex items-center gap-1">
                      ⚠️ Custom price is outside standard catalog range
                    </p>
                  ) : (
                    <p className="text-[10px] text-green-600 font-bold mt-1.5 flex items-center gap-1">
                      ✓ Price is within catalog range
                    </p>
                  )
                )}
                
                <p className="text-[9px] text-slate-400 mt-1">
                  This price is locked and will be used directly for all order billing, invoicing, and balance calculations.
                </p>
              </div>

              {formData.fabricSource === "shop" && formData.fabricPrice > 0 && (
                <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-[8px] sm:text-xs text-green-600 font-bold mb-1">
                    Fabric Price
                  </p>
                  <div className="text-xs sm:text-sm">
                    <span className="text-slate-600">Fabric Cost:</span>
                    <span className="ml-1 sm:ml-2 font-bold text-green-700">
                      ₹{formData.fabricPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <div className="p-3 sm:p-4 bg-purple-50 rounded-lg sm:rounded-xl border-2 border-purple-300">
                <p className="text-[8px] sm:text-xs text-purple-600 font-bold mb-2">
                  TOTAL GARMENT PRICE
                </p>
                <div className="grid grid-cols-2 gap-2 sm:gap-4 text-sm sm:text-base">
                  <div>
                    <span className="text-slate-600 text-xs">Min:</span>
                    <span className="ml-1 sm:ml-2 text-base sm:text-lg font-black text-purple-700">
                      ₹{totals.totalMin}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600 text-xs">Max:</span>
                    <span className="ml-1 sm:ml-2 text-base sm:text-lg font-black text-purple-700">
                      ₹{totals.totalMax}
                    </span>
                  </div>
                </div>
                <p className="text-[8px] sm:text-xs text-purple-500 mt-2">
                  * Tailoring (₹{formData.priceRange.min} - ₹
                  {formData.priceRange.max})
                  {formData.fabricSource === "shop" && formData.fabricPrice > 0
                    ? ` + Fabric (₹${formData.fabricPrice})`
                    : ""}
                </p>
              </div>
            </div>

            {/* Measurement Section - UNCHANGED */}
            <div className="bg-slate-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 mb-3 sm:mb-4">
                <h3 className="font-black text-slate-800 text-sm sm:text-base">
                  Measurements
                </h3>

                {effectiveCustomerId && (
                  <button
                    type="button"
                    onClick={handleSaveAsTemplate}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-xs sm:text-sm transition-all w-full sm:w-auto"
                  >
                    <BookmarkPlus size={14} className="sm:w-4 sm:h-4" />
                    Save as Template
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2 sm:gap-4 mb-3 sm:mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="measurementSource"
                    value="template"
                    checked={formData.measurementSource === "template"}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        measurementSource: e.target.value,
                      });
                      setSelectedFields({});
                      setSelectedCustomerTemplate("");
                    }}
                    className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600"
                  />
                  <span className="text-[10px] sm:text-xs font-medium">
                    Use Template
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="measurementSource"
                    value="customer"
                    checked={formData.measurementSource === "customer"}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        measurementSource: e.target.value,
                      });
                    }}
                    className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600"
                  />
                  <span className="text-[10px] sm:text-xs font-medium">
                    Customer Templates
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="measurementSource"
                    value="manual"
                    checked={formData.measurementSource === "manual"}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        measurementSource: e.target.value,
                      });
                      setSelectedCustomerTemplate("");
                    }}
                    className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600"
                  />
                  <span className="text-[10px] sm:text-xs font-medium">
                    Manual Entry
                  </span>
                </label>
              </div>

              {formData.measurementSource === "customer" && (
                <div className="mb-4">
                  <label className="block text-[8px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2">
                    Select Saved Template
                  </label>
                  {!effectiveCustomerId ? (
                    <p className="text-xs sm:text-sm text-amber-600 italic p-2 sm:p-3 bg-amber-50 rounded-lg">
                      Please select a customer first
                    </p>
                  ) : templatesLoading ? (
                    <div className="flex items-center gap-2 p-2 sm:p-3 bg-slate-100 rounded-lg">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs sm:text-sm text-slate-600">
                        Loading templates...
                      </span>
                    </div>
                  ) : customerTemplates?.length > 0 ? (
                    <select
                      value={selectedCustomerTemplate}
                      onChange={(e) =>
                        setSelectedCustomerTemplate(e.target.value)
                      }
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-slate-200 rounded-lg sm:rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    >
                      <option value="">-- Select a template --</option>
                      {customerTemplates.map((template) => (
                        <option key={template._id} value={template._id}>
                          {template.name}{" "}
                          {template.usageCount
                            ? `(Used ${template.usageCount} times)`
                            : ""}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-xs sm:text-sm text-slate-500 italic p-2 sm:p-3 bg-slate-100 rounded-lg">
                      No saved templates yet
                    </p>
                  )}
                </div>
              )}

              {/* {formData.measurementSource === "template" && (
                <>
                  <div className="mb-3 sm:mb-4">
                    <label className="block text-[8px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2">
                      Measurement Template
                    </label>
                    <select
                      value={formData.measurementTemplate}
                      onChange={(e) => setFormData({ ...formData, measurementTemplate: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-slate-200 rounded-lg sm:rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    >
                      <option value="">Select Template</option>
                      {templates?.map((template) => (
                        <option key={template._id} value={template._id}>{template.name}</option>
                      ))}
                    </select>
                  </div>

                  {formData.measurementTemplate && (
                    <div className="space-y-3 sm:space-y-4">
                      {Object.entries(groupedFields || {}).map(([category, categoryFields]) => (
                        <div key={category}>
                          <h4 className="font-bold text-slate-700 text-xs sm:text-sm mb-2">
                            {categoryTitles[category] || category}
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                            {categoryFields.map((field) => (
                              <label
                                key={field._id}
                                className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-xs sm:text-sm ${
                                  selectedFields[field.name]
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-slate-200 hover:border-blue-200"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  className="hidden"
                                  checked={selectedFields[field.name] || false}
                                  onChange={() => handleMeasurementToggle(field)}
                                />
                                <span className="truncate">{field.displayName}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}

                      {formData.measurements.length > 0 && (
                        <div className="mt-3 sm:mt-4 space-y-3">
                          <h4 className="font-bold text-slate-700 text-xs sm:text-sm">Enter Values</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                            {formData.measurements.map((measurement) => (
                              <div key={measurement.name}>
                                <label className="block text-[8px] sm:text-xs font-medium text-slate-600 mb-1 truncate">
                                  {measurement.name}
                                </label>
                                <input
                                  type="number"
                                  value={measurement.value}
                                  onChange={(e) => handleMeasurementChange(measurement.name, e.target.value)}
                                  placeholder="inches"
                                  step="0.1"
                                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )} */}
              {formData.measurementSource === "template" && (
                <>
                  <div className="mb-3 sm:mb-4">
                    <label className="block text-[8px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2">
                      Measurement Template
                    </label>
                    <select
                      value={formData.measurementTemplate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          measurementTemplate: e.target.value,
                        })
                      }
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-slate-200 rounded-lg sm:rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    >
                      <option value="">Select Template</option>
                      {templates?.map((template) => (
                        <option key={template._id} value={template._id}>
                          {template.name}
                        </option>
                      ))}
                    </select>

                    {formData.measurementTemplate && (
                      <p className="text-[8px] sm:text-xs text-blue-600 mt-1">
                        📏{" "}
                        {templates?.find(
                          (t) => t._id === formData.measurementTemplate,
                        )?.description || "Select measurements to enter"}
                      </p>
                    )}
                  </div>

                  {formData.measurementTemplate && (
                    <div className="space-y-4 sm:space-y-6">
                      {/* Show selected fields count */}
                      <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-500">
                        <span className="font-medium">
                          Select measurements to include:
                        </span>
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          {Object.values(selectedFields).filter(Boolean).length}{" "}
                          selected
                        </span>
                      </div>

                      {/* Grouped Fields with better UI */}
                      {Object.entries(groupedFields || {}).map(
                        ([category, categoryFields]) => {
                          const selectedCount = categoryFields.filter(
                            (field) => selectedFields[field.name],
                          ).length;
                          return (
                            <div
                              key={category}
                              className="border border-slate-200 rounded-xl overflow-hidden"
                            >
                              <div className="bg-gradient-to-r from-slate-50 to-white px-3 py-2 border-b border-slate-200">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-bold text-slate-800 text-xs sm:text-sm flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full"></span>
                                    {categoryTitles[category] || category}
                                  </h4>
                                  <span className="text-[8px] sm:text-xs text-slate-400">
                                    {selectedCount}/{categoryFields.length}
                                  </span>
                                </div>
                                <p className="text-[8px] sm:text-xs text-slate-500 mt-0.5">
                                  {category === "upper" &&
                                    "Chest, shoulders, arms, neck measurements"}
                                  {category === "lower" &&
                                    "Waist, hips, thighs, legs measurements"}
                                  {category === "full" &&
                                    "Full body measurements for dresses, gowns"}
                                  {category === "other" &&
                                    "Special measurements for specific garments"}
                                </p>
                              </div>

                              <div className="p-3">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                                  {categoryFields.map((field) => (
                                    <label
                                      key={field._id}
                                      className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                                        selectedFields[field.name]
                                          ? "border-blue-500 bg-blue-50 shadow-sm"
                                          : "border-slate-200 hover:border-blue-200 hover:bg-slate-50"
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        className="mt-0.5 w-3 h-3 sm:w-4 sm:h-4 text-blue-600 rounded focus:ring-blue-500"
                                        checked={
                                          selectedFields[field.name] || false
                                        }
                                        onChange={() =>
                                          handleMeasurementToggle(field)
                                        }
                                      />
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium text-slate-800 text-xs sm:text-sm truncate">
                                          {field.displayName || field.name}
                                        </div>
                                        <div className="text-[8px] sm:text-[10px] text-slate-400">
                                          {field.unit || "inches"}
                                          {field.description &&
                                            ` • ${field.description}`}
                                        </div>
                                      </div>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        },
                      )}

                      {/* Value Entry Section */}
                      {formData.measurements.length > 0 && (
                        <div className="mt-4 sm:mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 sm:p-4 border border-blue-200">
                          <div className="flex items-center gap-2 mb-3 sm:mb-4">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                              <span className="text-white text-xs sm:text-sm font-bold">
                                📏
                              </span>
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 text-xs sm:text-sm">
                                Enter Measurement Values
                              </h4>
                              <p className="text-[8px] sm:text-xs text-slate-500">
                                Enter precise measurements in inches
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {formData.measurements.map((measurement) => {
                              // Find field info for tooltip/hint
                              const fieldInfo = fields?.find(
                                (f) => f.name === measurement.name,
                              );
                              return (
                                <div
                                  key={measurement.name}
                                  className="bg-white rounded-lg p-2 sm:p-3 shadow-sm border border-slate-200"
                                >
                                  <label className="block font-bold text-slate-700 text-xs sm:text-sm mb-1 truncate">
                                    {fieldInfo?.displayName || measurement.name}
                                  </label>
                                  <div className="relative">
                                    <input
                                      type="number"
                                      value={measurement.value}
                                      onChange={(e) =>
                                        handleMeasurementChange(
                                          measurement.name,
                                          e.target.value,
                                        )
                                      }
                                      placeholder={`Enter ${fieldInfo?.displayName?.toLowerCase() || measurement.name.toLowerCase()}`}
                                      step="0.1"
                                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all pr-12"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] sm:text-xs text-slate-400">
                                      {fieldInfo?.unit || "inches"}
                                    </span>
                                  </div>
                                  {fieldInfo?.description && (
                                    <p className="text-[8px] sm:text-[10px] text-slate-400 mt-1">
                                      ℹ️ {fieldInfo.description}
                                    </p>
                                  )}
                                  {fieldInfo?.isRequired && (
                                    <p className="text-[8px] sm:text-[10px] text-red-400 mt-0.5">
                                      * Required
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Quick tips */}
                          <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-blue-100/50 rounded-lg border border-blue-200">
                            <p className="text-[8px] sm:text-xs text-blue-700 flex items-center gap-2">
                              <span className="text-blue-600">💡</span>
                              <span>
                                Tip: Use a measuring tape and measure snugly but
                                not too tight. All measurements are in inches.
                              </span>
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {formData.measurementSource === "customer" &&
                selectedCustomerTemplate && (
                  <div className="space-y-3">
                    <p className="text-xs sm:text-sm text-green-600 font-medium flex items-center gap-2">
                      <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-600 rounded-full"></span>
                      Template loaded - you can edit values
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                      {formData.measurements.map((measurement) => (
                        <div key={measurement.name}>
                          <label className="block text-[8px] sm:text-xs font-medium text-slate-600 mb-1 capitalize truncate">
                            {measurement.name}
                          </label>
                          <input
                            type="number"
                            value={measurement.value}
                            onChange={(e) =>
                              handleMeasurementChange(
                                measurement.name,
                                e.target.value,
                              )
                            }
                            step="0.1"
                            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {formData.measurementSource === "manual" && (
                <div className="space-y-3">
                  <p className="text-xs sm:text-sm text-slate-600">
                    Enter measurements manually
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                    {fields?.map((field) => (
                      <div key={field._id}>
                        <label className="block text-[8px] sm:text-xs font-medium text-slate-600 mb-1 truncate">
                          {field.displayName}
                        </label>
                        <input
                          type="number"
                          value={manualMeasurements[field.name] || ""}
                          onChange={(e) =>
                            handleManualMeasurementChange(
                              field.name,
                              e.target.value,
                            )
                          }
                          placeholder={field.unit}
                          step="0.1"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* IMAGES SECTION */}
            <div className="bg-slate-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <h3 className="font-black text-slate-800 text-sm sm:text-base mb-3 sm:mb-4 flex items-center gap-2">
                <Camera size={14} className="text-blue-600 sm:w-5 sm:h-5" />
                Garment Images
              </h3>

              <ImageUploadSection
                title="Studio Reference Images"
                subtitle="Designer images, style references"
                icon={ImageIcon}
                theme="indigo"
                type="studio"
                images={previewImages.studio}
                onImagesChange={(newImages) => handleImagesChange(newImages, 'studio')}
              />

              <ImageUploadSection
                title="Customer Digital Images"
                subtitle="Photos sent by customer"
                icon={User}
                theme="green"
                type="customerProvided"
                images={previewImages.customerProvided}
                onImagesChange={(newImages) => handleImagesChange(newImages, 'customerProvided')}
              />

              <ImageUploadSection
                title="Customer's Reference Cloth"
                subtitle="Photos of physical cloth/design"
                icon={Scissors}
                theme="orange"
                type="customerCloth"
                images={previewImages.customerCloth}
                onImagesChange={(newImages) => handleImagesChange(newImages, 'customerCloth')}
              />
            </div>

            {/* Additional Info - UNCHANGED */}
            <div className="bg-slate-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <label className="block text-[8px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2">
                Additional Information
              </label>
              <textarea
                value={formData.additionalInfo}
                onChange={(e) =>
                  setFormData({ ...formData, additionalInfo: e.target.value })
                }
                rows="3"
                placeholder="Any special instructions or notes..."
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border border-slate-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-xs sm:text-sm"
              />
            </div>

            {/* Form Actions - UNCHANGED */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg sm:rounded-xl font-black text-sm sm:text-base hover:bg-blue-700 transition-all flex items-center justify-center gap-2 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                } order-2 sm:order-1`}
              >
                <Save size={14} className="sm:w-4 sm:h-4" />
                {loading
                  ? "Processing..."
                  : editingGarment
                    ? "Update Garment"
                    : "Add Garment"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-200 text-slate-700 rounded-lg sm:rounded-xl font-black text-sm sm:text-base hover:bg-slate-300 transition-all flex items-center justify-center gap-2 order-1 sm:order-2"
              >
                <X size={14} className="sm:w-4 sm:h-4" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Save Template Modal - UNCHANGED */}
      {showSaveTemplateModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden mx-4">
            <div className="p-4 sm:p-6">
              <h3 className="text-base sm:text-lg lg:text-xl font-black text-slate-800 mb-2">
                Save as Template
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mb-4">
                Save these measurements as a template for future use
              </p>

              <div className="mb-4">
                <label className="block text-[8px] sm:text-xs font-black uppercase text-slate-500 mb-1 sm:mb-2">
                  Template Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Father Shirt Size"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl text-sm sm:text-base focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                  autoFocus
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={confirmSaveTemplate}
                  className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg sm:rounded-xl font-black text-sm sm:text-base transition-all order-2 sm:order-1"
                >
                  Save Template
                </button>
                <button
                  onClick={() => {
                    setShowSaveTemplateModal(false);
                    setTemplateName("");
                  }}
                  className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg sm:rounded-xl font-black text-sm sm:text-base transition-all order-1 sm:order-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
