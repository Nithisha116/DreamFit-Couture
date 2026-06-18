import InventoryMovement from "../models/InventoryMovement.js";
import Fabric from "../models/Fabric.js";

export const getInventorySummary = async (req, res) => {
  try {
    const fabrics = await Fabric.find({ isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    const fabricIds = fabrics.map((fabric) => fabric._id);

    const movementTotals = fabricIds.length
      ? await InventoryMovement.aggregate([
          { $match: { item: { $in: fabricIds } } },
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
        ])
      : [];

    const totalsByFabric = new Map(
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

    const rows = fabrics.map((fabric) => {
      const totals = totalsByFabric.get(String(fabric._id)) || {
        inQty: 0,
        outQty: 0,
        stock: 0,
        lastMovementAt: fabric.updatedAt || fabric.createdAt,
      };

      return {
        itemId: fabric._id,
        itemName: fabric.name,
        category: fabric.color || "—",
        stock: totals.stock,
        inQty: totals.inQty,
        outQty: totals.outQty,
        unit: "meters",
        updatedAt: totals.lastMovementAt || fabric.updatedAt || fabric.createdAt,
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
