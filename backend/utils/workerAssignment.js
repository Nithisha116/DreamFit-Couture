import Work from "../models/Work.js";

/**
 * Whether a worker (any role — tailor, cutting master, aari worker,
 * embroidery worker, helper) currently has an unfinished Work assignment.
 *
 * Work has no top-level `tailor`/`cuttingMaster`/etc. fields — assignment is
 * tracked exclusively via assignments[].workerId, with per-assignment
 * `status` ('pending' | 'active' | 'completed'). $elemMatch is required so
 * the workerId and status checks are evaluated against the SAME array
 * element, not independently across different assignments on the same
 * Work document.
 */
export const hasActiveWorkAssignment = async (workerId) => {
  const count = await Work.countDocuments({
    isActive: true,
    assignments: { $elemMatch: { workerId, status: { $ne: "completed" } } },
  });
  return count > 0;
};
