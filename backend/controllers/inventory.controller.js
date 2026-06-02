import InventoryMovement from "../models/InventoryMovement.js";
import Item from "../models/Item.js";

export const getInventorySummary = async (req, res) => {
  try {
    const movementTotals = await InventoryMovement.aggregate([
      {
        $group: {
          _id: "$item",
          inQty: {
            $sum: {
              $cond: [{ $eq: ["$type", "IN"] }, "$qty", 0],
            },
          },
          outQty: {
            $sum: {
              $cond: [{ $eq: ["$type", "OUT"] }, "$qty", 0],
            },
          },
          lastMovementAt: { $max: "$createdAt" },
        },
      },
    ]);

    const totalsByItem = new Map(
      movementTotals.map((row) => [
        String(row._id),
        {
          inQty: row.inQty || 0,
          outQty: row.outQty || 0,
          stock: (row.inQty || 0) - (row.outQty || 0),
          lastMovementAt: row.lastMovementAt,
        },
      ])
    );

    const items = await Item.find({ isActive: true })
      .populate("category")
      .sort({ createdAt: -1 })
      .lean();

    const rows = items.map((item) => {
      const totals = totalsByItem.get(String(item._id)) || {
        inQty: 0,
        outQty: 0,
        stock: 0,
        lastMovementAt: item.updatedAt || item.createdAt,
      };

      return {
        itemId: item._id,
        itemName: item.name,
        category: item.category?.name || "Uncategorized",
        stock: totals.stock,
        inQty: totals.inQty,
        outQty: totals.outQty,
        unit: "pcs",
        updatedAt: totals.lastMovementAt || item.updatedAt || item.createdAt,
      };
    });

    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch inventory summary",
    });
  }
};
