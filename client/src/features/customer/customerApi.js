// // frontend/src/features/customer/customerApi.js
// import API from "../../app/axios";

// // ==================== CUSTOMER API CALLS ====================

// /**
//  * Create new customer
//  * @param {Object} customerData - Customer data
//  * @returns {Promise}
//  */
// export const createCustomerApi = async (customerData) => {
//   try {
//     console.log("📦 API Call: createCustomer", customerData);
//     const response = await API.post("/customers/create", customerData);
//     console.log("✅ API Response:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error("❌ API Error createCustomer:", error.response?.data || error.message);
//     if (error.response?.data) {
//       throw error.response.data;
//     } else {
//       throw { message: error.message || "Network error. Please try again." };
//     }
//   }
// };

// /**
//  * Get all customers
//  * @returns {Promise}
//  */
// export const getAllCustomersApi = async () => {
//   try {
//     console.log("📋 API Call: getAllCustomers");
//     const response = await API.get("/customers/all");
//     return response.data;
//   } catch (error) {
//     console.error("❌ API Error getAllCustomers:", error.response?.data || error.message);
//     throw error.response?.data || error;
//   }
// };

// /**
//  * Get all customers with payment summary
//  * @returns {Promise}
//  */
// export const getCustomersWithPaymentsApi = async () => {
//   try {
//     console.log("📋 API Call: getCustomersWithPayments");
//     const response = await API.get("/customers/with-payments");
//     return response.data;
//   } catch (error) {
//     console.error("❌ API Error getCustomersWithPayments:", error.response?.data || error.message);
//     throw error.response?.data || error;
//   }
// };

// /**
//  * Get customer by ID
//  * @param {string} id - Customer MongoDB ID
//  * @returns {Promise}
//  */
// export const getCustomerByIdApi = async (id) => {
//   try {
//     console.log(`🔍 API Call: getCustomerById ${id}`);
//     const response = await API.get(`/customers/${id}`);
//     return response.data;
//   } catch (error) {
//     console.error("❌ API Error getCustomerById:", error.response?.data || error.message);
//     throw error.response?.data || error;
//   }
// };

// /**
//  * Search customer by phone
//  * @param {string} phone - Phone number
//  * @returns {Promise}
//  */
// export const searchCustomerByPhoneApi = async (phone) => {
//   try {
//     console.log(`🔍 API Call: searchCustomerByPhone ${phone}`);
//     const response = await API.get(`/customers/search/phone/${phone}`);
//     return response.data;
//   } catch (error) {
//     console.error("❌ API Error searchCustomerByPhone:", error.response?.data || error.message);
//     throw error.response?.data || error;
//   }
// };

// /**
//  * Search customer by customer ID (CUST-2024-00001)
//  * @param {string} customerId - Customer ID
//  * @returns {Promise}
//  */
// export const searchCustomerByCustomerIdApi = async (customerId) => {
//   try {
//     console.log(`🔍 API Call: searchCustomerByCustomerId ${customerId}`);
//     const response = await API.get(`/customers/search/id/${customerId}`);
//     return response.data;
//   } catch (error) {
//     console.error("❌ API Error searchCustomerByCustomerId:", error.response?.data || error.message);
//     throw error.response?.data || error;
//   }
// };

// /**
//  * Update customer
//  * @param {string} id - Customer MongoDB ID
//  * @param {Object} customerData - Updated data
//  * @returns {Promise}
//  */
// export const updateCustomerApi = async (id, customerData) => {
//   try {
//     console.log(`✏️ API Call: updateCustomer ${id}`, customerData);
//     const response = await API.put(`/customers/${id}`, customerData);
//     return response.data;
//   } catch (error) {
//     console.error("❌ API Error updateCustomer:", error.response?.data || error.message);
//     throw error.response?.data || error;
//   }
// };

// /**
//  * Delete customer
//  * @param {string} id - Customer MongoDB ID
//  * @returns {Promise}
//  */
// export const deleteCustomerApi = async (id) => {
//   try {
//     console.log(`🗑️ API Call: deleteCustomer ${id}`);
//     const response = await API.delete(`/customers/${id}`);
//     return response.data;
//   } catch (error) {
//     console.error("❌ API Error deleteCustomer:", error.response?.data || error.message);
//     throw error.response?.data || error;
//   }
// };

// /**
//  * Get customer payments
//  * @param {string} id - Customer MongoDB ID
//  * @returns {Promise}
//  */
// export const getCustomerPaymentsApi = async (id) => {
//   try {
//     console.log(`💰 API Call: getCustomerPayments ${id}`);
//     const response = await API.get(`/customers/${id}/payments`);
//     return response.data;
//   } catch (error) {
//     console.error("❌ API Error getCustomerPayments:", error.response?.data || error.message);
//     throw error.response?.data || error;
//   }
// };

// /**
//  * Get customer orders
//  * @param {string} id - Customer MongoDB ID
//  * @returns {Promise}
//  */
// export const getCustomerOrdersApi = async (id) => {
//   try {
//     console.log(`📦 API Call: getCustomerOrders ${id}`);
//     const response = await API.get(`/customers/${id}/orders`);
//     return response.data;
//   } catch (error) {
//     console.error("❌ API Error getCustomerOrders:", error.response?.data || error.message);
//     throw error.response?.data || error;
//   }
// };

// /**
//  * Get customer payment statistics
//  * @param {string} id - Customer MongoDB ID
//  * @returns {Promise}
//  */
// export const getCustomerPaymentStatsApi = async (id) => {
//   try {
//     console.log(`📊 API Call: getCustomerPaymentStats ${id}`);
//     const response = await API.get(`/customers/${id}/payment-stats`);
//     return response.data;
//   } catch (error) {
//     console.error("❌ API Error getCustomerPaymentStats:", error.response?.data || error.message);
//     throw error.response?.data || error;
//   }
// };

// /**
//  * Get customer statistics (Admin only)
//  * @returns {Promise}
//  */
// export const getCustomerStatsApi = async () => {
//   try {
//     console.log(`📊 API Call: getCustomerStats`);
//     const response = await API.get("/customers/stats");
//     return response.data;
//   } catch (error) {
//     console.error("❌ API Error getCustomerStats:", error.response?.data || error.message);
//     throw error.response?.data || error;
//   }
// };

















// // frontend/src/features/customer/customerApi.js
// import API from "../../app/axios";

// // ==================== CUSTOMER API CALLS ====================

// /**
//  * Create new customer
//  * @param {Object} customerData - Customer data
//  * @returns {Promise}
//  */
// export const createCustomerApi = async (customerData) => {
//   try {
//     console.log("📦 API Call: createCustomer", customerData);
//     const response = await API.post("/customers/create", customerData);
//     console.log("✅ API Response:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error("❌ API Error createCustomer:", error.response?.data || error.message);
//     if (error.response?.data) {
//       throw error.response.data;
//     } else {
//       throw { message: error.message || "Network error. Please try again." };
//     }
//   }
// };

// /**
//  * Get all customers
//  * @returns {Promise}
//  */
// export const getAllCustomersApi = async () => {
//   try {
//     console.log("📋 API Call: getAllCustomers");
//     const response = await API.get("/customers/all");
//     return response.data;
//   } catch (error) {
//     console.error("❌ API Error getAllCustomers:", error.response?.data || error.message);
//     throw error.response?.data || error;
//   }
// };

// /**
//  * Get all customers with payment summary
//  * @returns {Promise}
//  */
// export const getCustomersWithPaymentsApi = async () => {
//   try {
//     console.log("📋 API Call: getCustomersWithPayments");
//     const response = await API.get("/customers/with-payments");
//     return response.data;
//   } catch (error) {
//     console.error("❌ API Error getCustomersWithPayments:", error.response?.data || error.message);
//     throw error.response?.data || error;
//   }
// };

// /**
//  * Get customer by ID
//  * @param {string} id - Customer MongoDB ID
//  * @returns {Promise}
//  */
// export const getCustomerByIdApi = async (id) => {
//   try {
//     console.log(`🔍 API Call: getCustomerById ${id}`);
//     const response = await API.get(`/customers/${id}`);
//     return response.data;
//   } catch (error) {
//     console.error("❌ API Error getCustomerById:", error.response?.data || error.message);
//     throw error.response?.data || error;
//   }
// };

// /**
//  * Search customer by phone
//  * @param {string} phone - Phone number
//  * @returns {Promise}
//  */
// export const searchCustomerByPhoneApi = async (phone) => {
//   try {
//     console.log(`🔍 API Call: searchCustomerByPhone ${phone}`);
//     const response = await API.get(`/customers/search/phone/${phone}`);
//     return response.data;
//   } catch (error) {
//     console.error("❌ API Error searchCustomerByPhone:", error.response?.data || error.message);
//     throw error.response?.data || error;
//   }
// };

// /**
//  * Search customer by customer ID (CUST-2024-00001)
//  * @param {string} customerId - Customer ID
//  * @returns {Promise}
//  */
// export const searchCustomerByCustomerIdApi = async (customerId) => {
//   try {
//     console.log(`🔍 API Call: searchCustomerByCustomerId ${customerId}`);
//     const response = await API.get(`/customers/search/id/${customerId}`);
//     return response.data;
//   } catch (error) {
//     console.error("❌ API Error searchCustomerByCustomerId:", error.response?.data || error.message);
//     throw error.response?.data || error;
//   }
// };

// /**
//  * Update customer
//  * @param {string} id - Customer MongoDB ID
//  * @param {Object} customerData - Updated data
//  * @returns {Promise}
//  */
// export const updateCustomerApi = async (id, customerData) => {
//   try {
//     console.log(`✏️ API Call: updateCustomer ${id}`, customerData);
//     const response = await API.put(`/customers/${id}`, customerData);
//     return response.data;
//   } catch (error) {
//     console.error("❌ API Error updateCustomer:", error.response?.data || error.message);
//     throw error.response?.data || error;
//   }
// };

// /**
//  * Delete customer
//  * @param {string} id - Customer MongoDB ID
//  * @returns {Promise}
//  */
// export const deleteCustomerApi = async (id) => {
//   try {
//     console.log(`🗑️ API Call: deleteCustomer ${id}`);
//     const response = await API.delete(`/customers/${id}`);
//     return response.data;
//   } catch (error) {
//     console.error("❌ API Error deleteCustomer:", error.response?.data || error.message);
//     throw error.response?.data || error;
//   }
// };

// /**
//  * Get customer payments
//  * @param {string} id - Customer MongoDB ID
//  * @returns {Promise}
//  */
// export const getCustomerPaymentsApi = async (id) => {
//   try {
//     console.log(`💰 API Call: getCustomerPayments ${id}`);
//     const response = await API.get(`/customers/${id}/payments`);
//     return response.data;
//   } catch (error) {
//     console.error("❌ API Error getCustomerPayments:", error.response?.data || error.message);
//     throw error.response?.data || error;
//   }
// };

// /**
//  * Get customer orders
//  * @param {string} id - Customer MongoDB ID
//  * @returns {Promise}
//  */
// export const getCustomerOrdersApi = async (id) => {
//   try {
//     console.log(`📦 API Call: getCustomerOrders ${id}`);
//     const response = await API.get(`/customers/${id}/orders`);
//     return response.data;
//   } catch (error) {
//     console.error("❌ API Error getCustomerOrders:", error.response?.data || error.message);
//     throw error.response?.data || error;
//   }
// };

// /**
//  * Get customer payment statistics
//  * @param {string} id - Customer MongoDB ID
//  * @returns {Promise}
//  */
// export const getCustomerPaymentStatsApi = async (id) => {
//   try {
//     console.log(`📊 API Call: getCustomerPaymentStats ${id}`);
//     const response = await API.get(`/customers/${id}/payment-stats`);
//     return response.data;
//   } catch (error) {
//     console.error("❌ API Error getCustomerPaymentStats:", error.response?.data || error.message);
//     throw error.response?.data || error;
//   }
// };

// /**
//  * Get customer statistics (Admin only)
//  * @returns {Promise}
//  */
// export const getCustomerStatsApi = async () => {
//   try {
//     console.log(`📊 API Call: getCustomerStats`);
//     const response = await API.get("/customers/stats");
//     return response.data;
//   } catch (error) {
//     console.error("❌ API Error getCustomerStats:", error.response?.data || error.message);
//     throw error.response?.data || error;
//   }
// };

// // ==================== ✅ NEW: MEASUREMENT TEMPLATE API CALLS ====================

// /**
//  * Save measurement template from garment
//  * @param {string} customerId - Customer ID
//  * @param {Object} templateData - Template data { templateName, measurements, garmentReference, notes }
//  * @returns {Promise}
//  */
// export const saveMeasurementTemplateApi = async (customerId, templateData) => {
//   try {
//     console.log(`📏 API Call: saveMeasurementTemplate for customer ${customerId}`, templateData);
//     const response = await API.post(`/customers/${customerId}/templates`, templateData);
//     console.log("✅ Template saved:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error("❌ API Error saveMeasurementTemplate:", error.response?.data || error.message);
//     throw error.response?.data || error;
//   }
// };

// /**
//  * Get all measurement templates for a customer
//  * @param {string} customerId - Customer ID
//  * @returns {Promise}
//  */
// export const getCustomerTemplatesApi = async (customerId) => {
//   try {
//     console.log(`📋 API Call: getCustomerTemplates for customer ${customerId}`);
//     const response = await API.get(`/customers/${customerId}/templates`);
//     return response.data;
//   } catch (error) {
//     console.error("❌ API Error getCustomerTemplates:", error.response?.data || error.message);
//     throw error.response?.data || error;
//   }
// };

// /**
//  * Get single measurement template by ID
//  * @param {string} templateId - Template ID
//  * @returns {Promise}
//  */
// export const getTemplateByIdApi = async (templateId) => {
//   try {
//     console.log(`🔍 API Call: getTemplateById ${templateId}`);
//     const response = await API.get(`/customers/templates/${templateId}`);
//     return response.data;
//   } catch (error) {
//     console.error("❌ API Error getTemplateById:", error.response?.data || error.message);
//     throw error.response?.data || error;
//   }
// };

// /**
//  * Update measurement template
//  * @param {string} templateId - Template ID
//  * @param {Object} templateData - Updated data { name, measurements, notes }
//  * @returns {Promise}
//  */
// export const updateTemplateApi = async (templateId, templateData) => {
//   try {
//     console.log(`✏️ API Call: updateTemplate ${templateId}`, templateData);
//     const response = await API.put(`/customers/templates/${templateId}`, templateData);
//     return response.data;
//   } catch (error) {
//     console.error("❌ API Error updateTemplate:", error.response?.data || error.message);
//     throw error.response?.data || error;
//   }
// };

// /**
//  * Delete measurement template
//  * @param {string} templateId - Template ID
//  * @returns {Promise}
//  */
// export const deleteTemplateApi = async (templateId) => {
//   try {
//     console.log(`🗑️ API Call: deleteTemplate ${templateId}`);
//     const response = await API.delete(`/customers/templates/${templateId}`);
//     return response.data;
//   } catch (error) {
//     console.error("❌ API Error deleteTemplate:", error.response?.data || error.message);
//     throw error.response?.data || error;
//   }
// };

// /**
//  * Use a template (increment usage count)
//  * @param {string} templateId - Template ID
//  * @returns {Promise}
//  */
// export const useTemplateApi = async (templateId) => {
//   try {
//     console.log(`📊 API Call: useTemplate ${templateId}`);
//     const response = await API.post(`/customers/templates/${templateId}/use`);
//     return response.data;
//   } catch (error) {
//     console.error("❌ API Error useTemplate:", error.response?.data || error.message);
//     throw error.response?.data || error;
//   }
// };






// frontend/src/features/customer/customerApi.js
import API from "../../app/axios";

// ==================== CUSTOMER API CALLS ====================

/**
 * Create new customer
 * @param {Object} customerData - Customer data
 * @returns {Promise}
 */
export const createCustomerApi = async (customerData) => {
  try {
    console.log("📦 API Call: createCustomer", customerData);
    const response = await API.post("/customers/create", customerData);
    console.log("✅ API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ API Error createCustomer:", error.response?.data || error.message);
    if (error.response?.data) {
      throw error.response.data;
    } else {
      throw { message: error.message || "Network error. Please try again." };
    }
  }
};

/**
 * Get all customers
 * @returns {Promise}
 */
export const getAllCustomersApi = async () => {
  try {
    console.log("📋 API Call: getAllCustomers");
    const response = await API.get("/customers/all");
    return response.data;
  } catch (error) {
    console.error("❌ API Error getAllCustomers:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Get all customers with payment summary
 * @returns {Promise}
 */
export const getCustomersWithPaymentsApi = async () => {
  try {
    console.log("📋 API Call: getCustomersWithPayments");
    const response = await API.get("/customers/with-payments");
    return response.data;
  } catch (error) {
    console.error("❌ API Error getCustomersWithPayments:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Get customer by ID
 * @param {string} id - Customer MongoDB ID
 * @returns {Promise}
 */
export const getCustomerByIdApi = async (id) => {
  try {
    console.log(`🔍 API Call: getCustomerById ${id}`);
    const response = await API.get(`/customers/${id}`);
    return response.data;
  } catch (error) {
    console.error("❌ API Error getCustomerById:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Search customer by phone
 * @param {string} phone - Phone number
 * @returns {Promise}
 */
export const searchCustomerByPhoneApi = async (phone) => {
  try {
    console.log(`🔍 API Call: searchCustomerByPhone ${phone}`);
    const response = await API.get(`/customers/search/phone/${phone}`);
    return response.data;
  } catch (error) {
    console.error("❌ API Error searchCustomerByPhone:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Search customer by customer ID (CUST-2024-00001)
 * @param {string} customerId - Customer ID
 * @returns {Promise}
 */
export const searchCustomerByCustomerIdApi = async (customerId) => {
  try {
    console.log(`🔍 API Call: searchCustomerByCustomerId ${customerId}`);
    const response = await API.get(`/customers/search/id/${customerId}`);
    return response.data;
  } catch (error) {
    console.error("❌ API Error searchCustomerByCustomerId:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Update customer
 * @param {string} id - Customer MongoDB ID
 * @param {Object} customerData - Updated data
 * @returns {Promise}
 */
export const updateCustomerApi = async (id, customerData) => {
  try {
    console.log(`✏️ API Call: updateCustomer ${id}`, customerData);
    const response = await API.put(`/customers/${id}`, customerData);
    return response.data;
  } catch (error) {
    console.error("❌ API Error updateCustomer:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Delete customer
 * @param {string} id - Customer MongoDB ID
 * @returns {Promise}
 */
export const deleteCustomerApi = async (id) => {
  try {
    console.log(`🗑️ API Call: deleteCustomer ${id}`);
    const response = await API.delete(`/customers/${id}`);
    return response.data;
  } catch (error) {
    console.error("❌ API Error deleteCustomer:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Get customer payments
 * @param {string} id - Customer MongoDB ID
 * @returns {Promise}
 */
export const getCustomerPaymentsApi = async (id) => {
  try {
    console.log(`💰 API Call: getCustomerPayments ${id}`);
    const response = await API.get(`/customers/${id}/payments`);
    return response.data;
  } catch (error) {
    console.error("❌ API Error getCustomerPayments:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Get customer orders
 * @param {string} id - Customer MongoDB ID
 * @returns {Promise}
 */
export const getCustomerOrdersApi = async (id) => {
  try {
    console.log(`📦 API Call: getCustomerOrders ${id}`);
    const response = await API.get(`/customers/${id}/orders`);
    return response.data;
  } catch (error) {
    console.error("❌ API Error getCustomerOrders:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Get customer payment statistics
 * @param {string} id - Customer MongoDB ID
 * @returns {Promise}
 */
export const getCustomerPaymentStatsApi = async (id) => {
  try {
    console.log(`📊 API Call: getCustomerPaymentStats ${id}`);
    const response = await API.get(`/customers/${id}/payment-stats`);
    return response.data;
  } catch (error) {
    console.error("❌ API Error getCustomerPaymentStats:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Get customer statistics (Admin only)
 * @returns {Promise}
 */
export const getCustomerStatsApi = async () => {
  try {
    console.log(`📊 API Call: getCustomerStats`);
    const response = await API.get("/customers/stats");
    return response.data;
  } catch (error) {
    console.error("❌ API Error getCustomerStats:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// ==================== ✅ MEASUREMENT TEMPLATE API CALLS ====================

/**
 * Save measurement template from garment
 * @param {string} customerId - Customer ID
 * @param {Object} templateData - Template data { templateName, measurements, garmentReference, notes }
 * @returns {Promise}
 */
export const saveMeasurementTemplateApi = async (customerId, templateData) => {
  try {
    console.log(`📏 API Call: saveMeasurementTemplate for customer ${customerId}`, templateData);
    const response = await API.post(`/customers/${customerId}/templates`, templateData);
    console.log("✅ Template saved:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ API Error saveMeasurementTemplate:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Get all measurement templates for a customer
 * @param {string} customerId - Customer ID
 * @returns {Promise}
 */
export const getCustomerTemplatesApi = async (customerId) => {
  try {
    console.log(`📋 API Call: getCustomerTemplates for customer ${customerId}`);
    const response = await API.get(`/customers/${customerId}/templates`);
    return response.data;
  } catch (error) {
    console.error("❌ API Error getCustomerTemplates:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Get single measurement template by ID
 * @param {string} templateId - Template ID
 * @returns {Promise}
 */
export const getTemplateByIdApi = async (templateId) => {
  try {
    console.log(`🔍 API Call: getTemplateById ${templateId}`);
    const response = await API.get(`/customers/templates/${templateId}`);
    return response.data;
  } catch (error) {
    console.error("❌ API Error getTemplateById:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Update measurement template
 * @param {string} templateId - Template ID
 * @param {Object} templateData - Updated data { name, measurements, notes }
 * @returns {Promise}
 */
export const updateTemplateApi = async (templateId, templateData) => {
  try {
    console.log(`✏️ API Call: updateTemplate ${templateId}`, templateData);
    const response = await API.put(`/customers/templates/${templateId}`, templateData);
    return response.data;
  } catch (error) {
    console.error("❌ API Error updateTemplate:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Delete measurement template
 * @param {string} templateId - Template ID
 * @returns {Promise}
 */
export const deleteTemplateApi = async (templateId) => {
  try {
    console.log(`🗑️ API Call: deleteTemplate ${templateId}`);
    const response = await API.delete(`/customers/templates/${templateId}`);
    return response.data;
  } catch (error) {
    console.error("❌ API Error deleteTemplate:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Use a template (increment usage count)
 * @param {string} templateId - Template ID
 * @returns {Promise}
 */
export const useTemplateApi = async (templateId) => {
  try {
    console.log(`📊 API Call: useTemplate ${templateId}`);
    const response = await API.post(`/customers/templates/${templateId}/use`);
    return response.data;
  } catch (error) {
    console.error("❌ API Error useTemplate:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// ==================== ✅ NEW: IMPORT/EXPORT API CALLS ====================

/**
 * Import customers from Excel file
 * @param {FormData} formData - FormData with Excel file
 * @returns {Promise}
 */
export const importCustomersApi = async (formData) => {
  try {
    console.log("📥 API Call: importCustomers");
    const response = await API.post("/customers/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log("✅ Import response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ API Error importCustomers:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Export customers to Excel file
 * @returns {Promise} - Returns blob data for download
 */
export const exportCustomersApi = async () => {
  try {
    console.log("📤 API Call: exportCustomers");
    const response = await API.get("/customers/export", {
      responseType: "blob", // 🔴 VERY IMPORTANT for file downloads
    });
    console.log("✅ Export successful, file size:", response.data?.size || "unknown");
    return response.data;
  } catch (error) {
    console.error("❌ API Error exportCustomers:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Download sample Excel template
 * @returns {Promise} - Returns blob data for download
 */
export const downloadSampleTemplateApi = async () => {
  try {
    console.log("📄 API Call: downloadSampleTemplate");
    const response = await API.get("/customers/sample-template", {
      responseType: "blob",
    });
    console.log("✅ Sample template downloaded, size:", response.data?.size || "unknown");
    return response.data;
  } catch (error) {
    console.error("❌ API Error downloadSampleTemplate:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

// ==================== 🚫 BLACKLIST API CALLS ====================

/**
 * Blacklist a customer
 * @param {string} id - Customer ID
 * @param {Object} data - { reason, notes }
 * @returns {Promise}
 */
export const blacklistCustomerApi = async (id, data) => {
  try {
    console.log(`🚫 API Call: blacklistCustomer ${id}`, data);
    const response = await API.post(`/customers/${id}/blacklist`, data);
    return response.data;
  } catch (error) {
    console.error("❌ API Error blacklistCustomer:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};

/**
 * Unblacklist a customer
 * @param {string} id - Customer ID
 * @returns {Promise}
 */
export const unblacklistCustomerApi = async (id) => {
  try {
    console.log(`✅ API Call: unblacklistCustomer ${id}`);
    const response = await API.post(`/customers/${id}/unblacklist`);
    return response.data;
  } catch (error) {
    console.error("❌ API Error unblacklistCustomer:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};