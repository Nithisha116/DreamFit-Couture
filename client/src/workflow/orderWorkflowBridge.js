import {
  createJobFromOrderPayload,
  upsertJobFromWork,
} from "./workflowEngine";
import { emitWorkflowChanged, loadWorkflowJobs } from "./workflowStorage";

function resolveCustomerName(order) {
  const c = order?.customer;
  if (c && typeof c === "object") {
    return c.name || c.fullName || c.customerName || "Customer";
  }
  if (typeof c === "string" && c.length > 12) return "Customer";
  if (typeof c === "string") return c;
  return order?.customerName || "Customer";
}

function resolveGarmentList(order) {
  const garments = order?.garments;
  if (!Array.isArray(garments) || !garments.length) return [];

  return garments.map((g, index) => {
    if (typeof g === "object" && g !== null) {
      return {
        name: g.name || g.garmentName || `Garment ${index + 1}`,
        garmentId: g.garmentId || g._id || "",
        categoryName: g.categoryName || g.category?.name || "",
        itemName: g.itemName || g.item?.name || "",
        priority: g.priority || "normal",
        estimatedDelivery: g.estimatedDelivery || g.deliveryDate,
      };
    }
    return { name: `Garment ${index + 1}`, garmentId: String(g), priority: "normal" };
  });
}

function findExistingJobForSlot(jobs, { orderMongoId, workCode, workMongoId }) {
  if (workMongoId) {
    const byWork = jobs.find((j) => j.workMongoId === workMongoId);
    if (byWork) return byWork;
  }
  if (workCode) {
    const byCode = jobs.find((j) => j.workCode === workCode);
    if (byCode) return byCode;
  }
  if (orderMongoId && workCode) {
    return jobs.find((j) => j.orderMongoId === orderMongoId && j.workCode === workCode);
  }
  return null;
}

/**
 * Register workflow jobs immediately after order creation (before works API returns).
 */
export function registerWorkflowJobsFromOrder(order, works = []) {
  if (!order) return [];

  const orderMongoId = order._id || order.id;
  const orderId = order.orderId || order.orderNumber || "";
  const customerName = resolveCustomerName(order);
  const dueDate = order.deliveryDate || order.estimatedDelivery || null;
  const existing = loadWorkflowJobs();
  const created = [];

  if (works?.length) {
    for (const work of works) {
      const normalized = {
        ...work,
        order:
          typeof work.order === "object"
            ? work.order
            : { _id: orderMongoId, orderId, customer: order.customer, deliveryDate: dueDate },
      };
      const prev = findExistingJobForSlot(existing, {
        workMongoId: work._id,
        workCode: work.workId,
        orderMongoId,
      });
      const job = upsertJobFromWork(normalized, [], prev);
      created.push(job);
    }
    emitWorkflowChanged();
    return created;
  }

  const garments = resolveGarmentList(order);
  const seqWidth = String(Math.max(garments.length, 1)).length;

  garments.forEach((g, index) => {
    const seq = String(index + 1).padStart(Math.max(seqWidth, 2), "0");
    const workCode = orderId ? `${orderId}.${seq}` : `ORD-${seq}`;
    const prev = findExistingJobForSlot(existing, { orderMongoId, workCode });

    const fields = {
      orderId,
      orderMongoId,
      customerName,
      garmentName: g.name,
      garmentId: g.garmentId,
      categoryName: g.categoryName,
      itemName: g.itemName,
      priority: g.priority || "normal",
      dueDate: g.estimatedDelivery || dueDate,
      workCode,
      workMongoId: null,
    };

    const job = createJobFromOrderPayload(fields, prev);
    created.push(job);
  });

  if (!garments.length && orderMongoId) {
    created.push(
      createJobFromOrderPayload({
        orderId,
        orderMongoId,
        customerName,
        garmentName: "Garment — pending sync",
        dueDate,
        workCode: orderId || undefined,
      }),
    );
  }

  emitWorkflowChanged();
  return created;
}
