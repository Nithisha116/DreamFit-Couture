import Work from "../models/Work.js";

/**
 * Checks if a single Work task is assigned to production or worker activity.
 */
export const isWorkAssigned = (work) => {
  if (!work) return false;
  if (work.assignments && work.assignments.length > 0) {
    if (work.assignments.some(a => a.workerId)) return true;
  }
  if (work.status && !['pending', 'new', 'draft', 'cancelled'].includes(work.status)) {
    return true;
  }
  return false;
};

/**
 * Checks if an order has any active or historical assigned production work.
 */
export const checkOrderAssignment = async (orderId) => {
  // Query all historical work records for maximum safety
  const works = await Work.find({ order: orderId });
  return works.some(isWorkAssigned);
};
