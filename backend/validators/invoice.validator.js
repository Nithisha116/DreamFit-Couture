/**
 * Validates request payload for creating an Invoice
 * @param {Object} data - req.body data
 * @returns {Object} { isValid, errors }
 */
export const validateCreateInvoiceInput = (data) => {
  const errors = [];

  if (!data) {
    return { isValid: false, errors: ["Request body cannot be empty"] };
  }

  // 1. Validate Items
  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    errors.push("Invoice must contain at least one item.");
  } else {
    data.items.forEach((item, index) => {
      if (!item.name || typeof item.name !== "string" || item.name.trim() === "") {
        errors.push(`Item at index ${index} must have a valid name.`);
      }
      if (item.price === undefined || typeof item.price !== "number" || item.price < 0) {
        errors.push(`Price for item '${item.name || index}' must be a non-negative number.`);
      }
      if (item.qty === undefined || typeof item.qty !== "number" || item.qty <= 0) {
        errors.push(`Quantity for item '${item.name || index}' must be a number greater than zero.`);
      }
    });
  }

  // 2. Validate Discount
  if (data.discountType && !["flat", "percentage", "none"].includes(data.discountType)) {
    errors.push("Discount type must be one of: 'flat', 'percentage', 'none'.");
  }

  if (data.discountValue !== undefined) {
    if (typeof data.discountValue !== "number" || data.discountValue < 0) {
      errors.push("Discount value must be a non-negative number.");
    }
    if (data.discountType === "percentage" && data.discountValue > 100) {
      errors.push("Percentage discount value cannot exceed 100%.");
    }
  }

  // 3. Validate Taxes
  if (data.taxPercentage !== undefined) {
    if (typeof data.taxPercentage !== "number" || data.taxPercentage < 0 || data.taxPercentage > 100) {
      errors.push("Tax percentage must be a number between 0 and 100.");
    }
  }

  // 4. Validate Costs
  if (data.outsourcingCost !== undefined && (typeof data.outsourcingCost !== "number" || data.outsourcingCost < 0)) {
    errors.push("Outsourcing cost must be a non-negative number.");
  }

  if (data.materialCost !== undefined && (typeof data.materialCost !== "number" || data.materialCost < 0)) {
    errors.push("Material cost must be a non-negative number.");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
