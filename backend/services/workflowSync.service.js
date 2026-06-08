import Order from '../models/Order.js';

export const mapStageToOrderStatus = (stageKey, activeKey) => {
  // Try to use activeKey if the new stage doesn't have a clear mapping, or just map the newStageKey directly
  const key = String(stageKey || activeKey || '').trim().toLowerCase();
  
  if (key.includes('marking')) return 'confirmed';
  if (key.includes('cutting')) return 'cutting';
  if (key.includes('stitching') || key.includes('sewing')) return 'stitching';
  if (key.includes('trial')) return 'trial';
  if (key.includes('ironing') || key.includes('packing') || key.includes('packed') || key.includes('finishing')) return 'ready-to-delivery';
  if (key.includes('delivered') || key.includes('delivery')) return 'delivered';
  
  // Embroidery, aari, and any other custom stages default to in-progress
  return 'in-progress';
};

export const syncOrderFromWork = async (orderId, newStageKey, activeKey, now, completedWorkerName, isCompleted) => {
  try {
    if (!orderId) return;

    let newStatus = mapStageToOrderStatus(newStageKey, activeKey);
    if (isCompleted && newStatus === 'in-progress') {
      newStatus = 'ready-to-delivery';
    }

    // Status hierarchy to prevent going backwards due to multiple garments
    const statusWeights = {
      'draft': 0,
      'confirmed': 1,
      'in-progress': 2,
      'cutting': 3,
      'stitching': 4,
      'trial': 5,
      'finishing': 6,
      'ready-to-delivery': 7,
      'delivered': 8,
      'cancelled': 9
    };

    const order = await Order.findById(orderId);
    if (!order) return;

    const currentWeight = statusWeights[order.status] || 0;
    const newWeight = statusWeights[newStatus] || 0;

    const updateDoc = {
      $set: {
        [`workflowStages.${activeKey}.completed`]: true,
        [`workflowStages.${activeKey}.completedAt`]: now,
        [`workflowStages.${activeKey}.assignedTo`]: completedWorkerName,
      }
    };

    if (newWeight >= currentWeight) {
      updateDoc.$set.status = newStatus;
      updateDoc.$set.currentStage = isCompleted ? 'completed' : newStageKey;
    }

    await Order.findByIdAndUpdate(orderId, updateDoc);
    console.log(`✅ Synced Order ${orderId}: currentStage -> ${updateDoc.$set.currentStage || 'unchanged'}, status -> ${updateDoc.$set.status || 'unchanged'}`);

  } catch (err) {
    console.error('❌ Error in syncOrderFromWork:', err);
  }
};
