import Order from '../models/Order.js';

export const mapStageToOrderStatus = (stageKey) => {
  if (!stageKey) return 'in-progress';
  
  const key = String(stageKey).trim().toLowerCase();
  
  if (key === 'cutting') return 'cutting';
  if (key === 'stitching' || key === 'sewing') return 'stitching';
  if (key === 'packed' || key === 'packing') return 'ready-to-delivery';
  if (key === 'delivered') return 'delivered';
  
  // Embroidery, aari, ironing, and any other custom stages default to in-progress
  return 'in-progress';
};

export const syncOrderFromWork = async (orderId, newStageKey, activeKey, now, completedWorkerName, isCompleted) => {
  try {
    if (!orderId) return;

    let newStatus;
    if (isCompleted) {
      newStatus = 'ready-to-delivery';
    } else {
      newStatus = mapStageToOrderStatus(newStageKey);
    }

    const updateDoc = {
      $set: {
        currentStage: isCompleted ? 'completed' : newStageKey,
        status: newStatus,
        [`workflowStages.${activeKey}.completed`]: true,
        [`workflowStages.${activeKey}.completedAt`]: now,
        [`workflowStages.${activeKey}.assignedTo`]: completedWorkerName,
      }
    };

    await Order.findByIdAndUpdate(orderId, updateDoc);
    console.log(`✅ Synced Order ${orderId}: currentStage -> ${updateDoc.$set.currentStage}, status -> ${newStatus}`);

  } catch (err) {
    console.error('❌ Error in syncOrderFromWork:', err);
  }
};
