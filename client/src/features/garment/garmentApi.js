// import API from "../../app/axios";

// // ===== 1. CREATE GARMENT (Supports 3-Type Images) =====
// export const createGarmentApi = async (orderId, garmentData) => {
//   console.log(`📤 Creating garment for order ${orderId}`);
  
//   // Debug: FormData content monitoring
//   if (garmentData instanceof FormData) {
//     for (let pair of garmentData.entries()) {
//       console.log(`📤 Field: ${pair[0]} | Value:`, pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]);
//     }
//   }
  
//   const response = await API.post(`/garments/order/${orderId}`, garmentData, {
//     headers: { 'Content-Type': 'multipart/form-data' },
//   });
//   return response.data;
// };

// // ===== 2. GET GARMENTS BY ORDER =====
// export const getGarmentsByOrderApi = async (orderId) => {
//   const response = await API.get(`/garments/order/${orderId}`);
//   return response.data;
// };

// // ===== 3. GET GARMENT BY ID (Used for Notifications Redirect) =====
// export const getGarmentByIdApi = async (id) => {
//   const response = await API.get(`/garments/${id}`);
//   return response.data;
// };

// // ===== 4. UPDATE GARMENT (Text & Details) =====
// export const updateGarmentApi = async (id, garmentData) => {
//   // If editing text data, it's JSON. If editing images, it's FormData.
//   const isFormData = garmentData instanceof FormData;
  
//   const response = await API.put(`/garments/${id}`, garmentData, {
//     headers: {
//       'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
//     },
//   });
//   return response.data;
// };

// // ===== 5. UPDATE GARMENT IMAGES (R2 Cloud Sync) =====
// export const updateGarmentImagesApi = async (id, imageData) => {
//   const response = await API.patch(`/garments/${id}/images`, imageData, {
//     headers: { 'Content-Type': 'multipart/form-data' },
//   });
//   return response.data;
// };

// // ===== 6. DELETE GARMENT IMAGE =====
// export const deleteGarmentImageApi = async (id, imageKey, imageType) => {
//   // Axois DELETE method-la data anuppa 'data' property thevai
//   const response = await API.delete(`/garments/${id}/images`, {
//     data: { imageKey, imageType }
//   });
//   return response.data;
// };

// // ===== 7. DELETE GARMENT (Soft Delete) =====
// export const deleteGarmentApi = async (id) => {
//   const response = await API.delete(`/garments/${id}`);
//   return response.data;
// };














// import API from "../../app/axios";

// // ===== 1. CREATE GARMENT (Supports 3-Type Images) =====
// export const createGarmentApi = async (orderId, garmentData) => {
//   console.log(`📤 Creating garment for order ${orderId}`);
  
//   // Debug: FormData content monitoring
//   if (garmentData instanceof FormData) {
//     for (let pair of garmentData.entries()) {
//       console.log(`📤 Field: ${pair[0]} | Value:`, pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]);
//     }
//   }
  
//   const response = await API.post(`/garments/order/${orderId}`, garmentData, {
//     headers: { 'Content-Type': 'multipart/form-data' },
//   });
//   return response.data;
// };

// // ===== 2. GET GARMENTS BY ORDER =====
// export const getGarmentsByOrderApi = async (orderId) => {
//   const response = await API.get(`/garments/order/${orderId}`);
//   return response.data;
// };

// // ===== 3. GET GARMENT BY ID (Used for Notifications Redirect) =====
// export const getGarmentByIdApi = async (id) => {
//   const response = await API.get(`/garments/${id}`);
//   return response.data;
// };

// // ===== 4. UPDATE GARMENT (Text & Details) =====
// export const updateGarmentApi = async (id, garmentData) => {
//   // If editing text data, it's JSON. If editing images, it's FormData.
//   const isFormData = garmentData instanceof FormData;
  
//   const response = await API.put(`/garments/${id}`, garmentData, {
//     headers: {
//       'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
//     },
//   });
//   return response.data;
// };

// // ===== 5. UPDATE GARMENT IMAGES (R2 Cloud Sync) =====
// export const updateGarmentImagesApi = async (id, imageData) => {
//   const response = await API.patch(`/garments/${id}/images`, imageData, {
//     headers: { 'Content-Type': 'multipart/form-data' },
//   });
//   return response.data;
// };

// // ===== 6. DELETE GARMENT IMAGE =====
// export const deleteGarmentImageApi = async (id, imageKey, imageType) => {
//   // Axois DELETE method-la data anuppa 'data' property thevai
//   const response = await API.delete(`/garments/${id}/images`, {
//     data: { imageKey, imageType }
//   });
//   return response.data;
// };

// // ===== 7. DELETE GARMENT (Soft Delete) =====
// export const deleteGarmentApi = async (id) => {
//   const response = await API.delete(`/garments/${id}`);
//   return response.data;
// };

// // ============================================
// // 🟢 NEW: Get customer's order dates for garment calendar
// // ============================================
// export const getCustomerOrderDates = async (customerId, params = {}) => {
//   try {
//     const { month, year } = params;
    
//     if (!customerId) {
//       throw new Error("Customer ID is required");
//     }
    
//     if (month === undefined || year === undefined) {
//       throw new Error("Month and year are required");
//     }
    
//     console.log(`🟢 Fetching customer order dates: ${customerId}, month: ${month}, year: ${year}`);
    
//     const queryString = buildQueryString({ month, year });
//     const response = await API.get(`/garments/customer/${customerId}/order-dates${queryString}`);
    
//     console.log(`✅ Found ${response.data?.dates?.length || 0} dates for customer`);
    
//     return response.data;
//   } catch (error) {
//     console.error("❌ Error fetching customer order dates:", error);
//     throw error;
//   }
// };

// // ===== Helper function for building query string =====
// const buildQueryString = (params = {}) => {
//   const queryParams = new URLSearchParams();
  
//   Object.entries(params).forEach(([key, value]) => {
//     if (value !== undefined && value !== null && value !== '') {
//       queryParams.append(key, value);
//     }
//   });
  
//   const queryString = queryParams.toString();
//   return queryString ? `?${queryString}` : '';
// };
















// import API from "../../app/axios";

// // ===== 1. CREATE GARMENT (Supports 3-Type Images) =====
// export const createGarmentApi = async (orderId, garmentData) => {
//   console.log(`📤 Creating garment for order ${orderId}`);
  
//   // Debug: FormData content monitoring
//   if (garmentData instanceof FormData) {
//     for (let pair of garmentData.entries()) {
//       console.log(`📤 Field: ${pair[0]} | Value:`, pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]);
//     }
//   }
  
//   const response = await API.post(`/garments/order/${orderId}`, garmentData, {
//     headers: { 'Content-Type': 'multipart/form-data' },
//   });
//   return response.data;
// };

// // ===== 2. GET GARMENTS BY ORDER =====
// export const getGarmentsByOrderApi = async (orderId) => {
//   const response = await API.get(`/garments/order/${orderId}`);
//   return response.data;
// };

// // ===== 3. GET GARMENT BY ID (Used for Notifications Redirect) =====
// export const getGarmentByIdApi = async (id) => {
//   const response = await API.get(`/garments/${id}`);
//   return response.data;
// };

// // ===== 4. UPDATE GARMENT (Text & Details) =====
// export const updateGarmentApi = async (id, garmentData) => {
//   // If editing text data, it's JSON. If editing images, it's FormData.
//   const isFormData = garmentData instanceof FormData;
  
//   const response = await API.put(`/garments/${id}`, garmentData, {
//     headers: {
//       'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
//     },
//   });
//   return response.data;
// };

// // ===== 5. UPDATE GARMENT IMAGES (R2 Cloud Sync) =====
// export const updateGarmentImagesApi = async (id, imageData) => {
//   const response = await API.patch(`/garments/${id}/images`, imageData, {
//     headers: { 'Content-Type': 'multipart/form-data' },
//   });
//   return response.data;
// };

// // ===== 6. DELETE GARMENT IMAGE =====
// export const deleteGarmentImageApi = async (id, imageKey, imageType) => {
//   // Axois DELETE method-la data anuppa 'data' property thevai
//   const response = await API.delete(`/garments/${id}/images`, {
//     data: { imageKey, imageType }
//   });
//   return response.data;
// };

// // ===== 7. DELETE GARMENT (Soft Delete) =====
// export const deleteGarmentApi = async (id) => {
//   const response = await API.delete(`/garments/${id}`);
//   return response.data;
// };

// // ===== Helper function for building query string =====
// const buildQueryString = (params = {}) => {
//   const queryParams = new URLSearchParams();
  
//   Object.entries(params).forEach(([key, value]) => {
//     if (value !== undefined && value !== null && value !== '') {
//       queryParams.append(key, value);
//     }
//   });
  
//   const queryString = queryParams.toString();
//   return queryString ? `?${queryString}` : '';
// };

// // ============================================
// // Get customer's order dates for garment calendar
// // ============================================
// export const getCustomerOrderDates = async (customerId, params = {}) => {
//   try {
//     const { month, year } = params;

//     if (!customerId) {
//       throw new Error("Customer ID is required");
//     }

//     if (!month || !year) {
//       throw new Error("Month and year are required");
//     }

//     console.log(
//       `📅 Fetching order dates for customer: ${customerId}, month: ${month}, year: ${year}`
//     );

//     const queryString = buildQueryString({ month, year });

//     // Backend route
//     const response = await API.get(
//       `/garments/customer/${customerId}/order-dates${queryString}`
//     );

//     const data = response.data;

//     console.log("📦 API Response:", data);

//     return {
//       success: data.success,
//       dates: data.dates || [],
//       customerId: data.customerId || customerId,
//       month: data.month || month,
//       year: data.year || year,
//     };

//   } catch (error) {
//     console.error("❌ Error fetching customer order dates:", error);
//     throw error;
//   }
// };









import API from "../../app/axios";

// ===== 1. CREATE GARMENT (Supports 3-Type Images) =====
export const createGarmentApi = async (orderId, garmentData) => {
  console.log(`📤 Creating garment for order ${orderId}`);
  
  if (garmentData instanceof FormData) {
    for (let pair of garmentData.entries()) {
      console.log(`📤 Field: ${pair[0]} | Value:`, pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]);
    }
  }
  
  const response = await API.post(`/garments/order/${orderId}`, garmentData);
  return response.data;
};

// ===== 2. GET GARMENTS BY ORDER =====
export const getGarmentsByOrderApi = async (orderId) => {
  const response = await API.get(`/garments/order/${orderId}`);
  return response.data;
};

// ===== 3. GET GARMENT BY ID =====
export const getGarmentByIdApi = async (id) => {
  const response = await API.get(`/garments/${id}`);
  return response.data;
};

// ===== 4. UPDATE GARMENT =====
export const updateGarmentApi = async (id, garmentData) => {
  const response = await API.put(`/garments/${id}`, garmentData);
  return response.data;
};

// ===== 5. UPDATE GARMENT IMAGES =====
export const updateGarmentImagesApi = async (id, imageData) => {
  const response = await API.patch(`/garments/${id}/images`, imageData);
  return response.data;
};

// ===== 6. DELETE GARMENT IMAGE =====
export const deleteGarmentImageApi = async (id, imageKey, imageType) => {
  const response = await API.delete(`/garments/${id}/images`, {
    data: { imageKey, imageType }
  });
  return response.data;
};

// ===== 7. DELETE GARMENT =====
export const deleteGarmentApi = async (id) => {
  const response = await API.delete(`/garments/${id}`);
  return response.data;
};

// ===== Helper function for building query string =====
const buildQueryString = (params = {}) => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value);
    }
  });
  
  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
};

// ===== 8. OLD: Get customer's order dates (keep for backward compatibility) =====
export const getCustomerOrderDates = async (customerId, params = {}) => {
  try {
    const { month, year } = params;

    if (!customerId) {
      throw new Error("Customer ID is required");
    }

    if (!month || !year) {
      throw new Error("Month and year are required");
    }

    console.log(`📅 Fetching order dates for customer: ${customerId}, month: ${month}, year: ${year}`);

    const queryString = buildQueryString({ month, year });

    const response = await API.get(
      `/garments/customer/${customerId}/order-dates${queryString}`
    );

    return response.data;
  } catch (error) {
    console.error("❌ Error fetching customer order dates:", error);
    throw error;
  }
};

// ===== 9. 🆕 NEW: Get ALL delivery dates (all customers) =====
export const getAllDeliveryDates = async (params = {}) => {
  try {
    const { month, year } = params;

    if (!month || !year) {
      throw new Error("Month and year are required");
    }

    console.log(`📅 Fetching ALL delivery dates for month: ${month}, year: ${year}`);

    const queryString = buildQueryString({ month, year });

    // 🔥 Backend route: GET /api/garments/delivery-dates?month=3&year=2026
    const response = await API.get(`/garments/delivery-dates${queryString}`);

    console.log("✅ All delivery dates response:", response.data);
    
    return response.data; // Expected: { success: true, allDates: [{_id: "2026-03-05", count: 4}] }
  } catch (error) {
    console.error("❌ getAllDeliveryDates error:", error);
    throw error;
  }
};