import Order from '../models/Order.js';
import Garment from '../models/Garment.js';

const GARMENT_SAFE_FIELDS = [
  'garmentId',
  'name',
  'category',
  'categoryName',
  'item',
  'itemName',
  'measurementTemplate',
  'measurements',
  'measurementSource',
  'fabricSource',
  'fabricMeters',
  'fabricNotes',
  'fabricSufficiency',
  'additionalInfo',
  'referenceImages',
  'customerImages',
  'customerClothImages',
  'estimatedDelivery',
].join(' ');

function mapGarmentForPublic(g) {
  if (!g || typeof g !== 'object') return null;

  const categoryName =
    g.categoryName ||
    g.category?.name ||
    g.category?.categoryName ||
    '';

  const itemName =
    g.itemName ||
    g.item?.name ||
    g.item?.itemName ||
    '';

  const templateName =
    typeof g.measurementTemplate === 'object'
      ? g.measurementTemplate?.name
      : null;

  const hasFabric =
    g.fabricSource ||
    g.fabricMeters ||
    g.fabricNotes ||
    (g.fabricSufficiency && g.fabricSufficiency !== 'To Be Verified');

  return {
    garmentId: g.garmentId || '',
    name: g.name || 'Garment',
    categoryName,
    itemName,
    measurementTemplateName: templateName,
    measurementSource: g.measurementSource || null,
    measurements: Array.isArray(g.measurements) ? g.measurements : [],
    materials: hasFabric
      ? {
          source: g.fabricSource === 'shop' ? 'Shop Provided' : 'Customer Provided',
          meters: g.fabricMeters || '',
          notes: g.fabricNotes || '',
          sufficiency: g.fabricSufficiency || '',
        }
      : null,
    workInstructions: g.additionalInfo || '',
    referenceImages: g.referenceImages || [],
    customerImages: g.customerImages || [],
    customerClothImages: g.customerClothImages || [],
    estimatedDelivery: g.estimatedDelivery || null,
  };
}

/**
 * Public read-only order card by business order ID (e.g. 2026061101).
 * Customer-safe fields only — no workflow, workers, or QR data.
 */
export const getPublicOrderCardByOrderId = async (req, res) => {
  try {
    const rawId = String(req.params.orderId || '').trim();
    if (!rawId) {
      return res.status(400).json({ success: false, message: 'Order ID is required' });
    }

    // DF-004: gate public access on the unguessable publicToken, never the
    // sequential, human-readable orderId.
    const order = await Order.findOne({ publicToken: rawId, isActive: { $ne: false } })
      .populate('customer', 'customerId name phone email')
      .select('orderId orderDate deliveryDate specialNotes status customer garments')
      .lean();

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status === 'cancelled') {
      return res.status(404).json({ success: false, message: 'Order card not available' });
    }

    let garments = [];
    if (Array.isArray(order.garments) && order.garments.length > 0) {
      const ids = order.garments.filter((id) => id);
      garments = await Garment.find({ _id: { $in: ids }, isActive: { $ne: false } })
        .select(GARMENT_SAFE_FIELDS)
        .populate('category', 'name categoryName')
        .populate('item', 'name itemName')
        .populate('measurementTemplate', 'name')
        .lean();
    }

    if (!garments.length) {
      garments = await Garment.find({ order: order._id, isActive: { $ne: false } })
        .select(GARMENT_SAFE_FIELDS)
        .populate('category', 'name categoryName')
        .populate('item', 'name itemName')
        .populate('measurementTemplate', 'name')
        .lean();
    }

    const customer = order.customer || {};
    const mappedGarments = garments.map(mapGarmentForPublic).filter(Boolean);

    res.json({
      success: true,
      order: {
        orderId: order.orderId,
        orderDate: order.orderDate,
        deliveryDate: order.deliveryDate,
        specialNotes: order.specialNotes || '',
      },
      customer: {
        customerId: customer.customerId || '',
        name: customer.name || 'Customer',
        phone: customer.phone || '',
      },
      garments: mappedGarments,
      materialsReceived: mappedGarments
        .filter((g) => g.materials)
        .map((g) => ({
          garmentName: g.name,
          garmentId: g.garmentId,
          ...g.materials,
        })),
      worksToDo: mappedGarments.map((g) => ({
        garmentId: g.garmentId,
        name: g.name,
        category: g.categoryName,
        item: g.itemName,
        instructions: g.workInstructions,
        deliveryDate: g.estimatedDelivery,
      })),
    });
  } catch (error) {
    console.error('Public order card error:', error);
    res.status(500).json({ success: false, message: 'Unable to load order card' });
  }
};
