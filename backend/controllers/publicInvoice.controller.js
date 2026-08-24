import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import Garment from '../models/Garment.js';

/**
 * Public read-only invoice payload by business order ID (e.g. 2026052815).
 * No auth — invoice-only fields for customer-facing view.
 */
export const getPublicInvoiceByOrderId = async (req, res) => {
  try {
    const rawId = String(req.params.orderId || '').trim();
    if (!rawId) {
      return res.status(400).json({ success: false, message: 'Order ID is required' });
    }

    // DF-004: gate public access on the unguessable publicToken, never the
    // sequential, human-readable orderId.
    const order = await Order.findOne({ publicToken: rawId, isActive: { $ne: false } })
      .populate('customer', 'name phone customerId email address addressLine1 addressLine2 city state pincode')
      .populate({
        path: 'garments',
        match: { isActive: { $ne: false } },
        populate: [
          { path: 'category', select: 'name categoryName' },
          { path: 'item', select: 'name itemName' },
          { path: 'selectedFabric' },
        ],
      });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status === 'cancelled') {
      return res.status(404).json({ success: false, message: 'Invoice not available' });
    }

    let garments = Array.isArray(order.garments)
      ? order.garments.filter((g) => g && typeof g === 'object')
      : [];

    if (!garments.length) {
      garments = await Garment.find({ order: order._id, isActive: { $ne: false } })
        .populate('category', 'name categoryName')
        .populate('item', 'name itemName')
        .populate('selectedFabric');
    }

    const payments = await Payment.find({ order: order._id, isDeleted: false })
      .select('amount method type paymentDate paymentTime referenceNumber notes')
      .sort('-paymentDate -paymentTime');

    const orderJson = order.toObject();
    delete orderJson.createdBy;

    res.json({
      success: true,
      order: orderJson,
      garments,
      payments,
    });
  } catch (error) {
    console.error('Public invoice error:', error);
    res.status(500).json({ success: false, message: 'Unable to load invoice' });
  }
};
