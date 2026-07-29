// // backend/utils/messageTemplates.js

// export const MESSAGES = {
//   // 📦 1. ORDER CONFIRMATION - WITH GARMENT ID, NAME & PRICE RANGE
//   ORDER_CONFIRMED: (order, customer) => {
//     const totalGarments = order.garments?.length || 0;
//     const totalMin = order.priceSummary?.totalMin || 0;
//     const totalMax = order.priceSummary?.totalMax || 0;
//     const advancePaid = order.advancePayment?.amount || 0;
//     const totalPaid = order.paymentSummary?.totalPaid || 0;
//     const balanceMin = totalMin - totalPaid;
//     const balanceMax = totalMax - totalPaid;
    
//     // Get customer full name
//     const customerName = customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Customer';
    
//     // Generate garment details list with ID, Name and Price Range
//     const garmentList = order.garments?.map((g, index) => {
//       const garmentId = g.garmentId || g._id?.toString().slice(-6) || 'N/A';
//       const priceMin = g.priceRange?.min || 0;
//       const priceMax = g.priceRange?.max || 0;
//       return `   ${index + 1}. ${garmentId} - ${g.name} - ₹${priceMin} - ₹${priceMax}`;
//     }).join('\n') || '   No garments';

//     return `
// 🪡 *DreamFit - Order Confirmed* ✅

// 👤 *Customer:* ${customerName}
// 📦 *Order ID:* ${order.orderId}
// 📅 *Order Date:* ${new Date(order.orderDate).toLocaleDateString()}
// 📅 *Delivery Date:* ${new Date(order.deliveryDate).toLocaleDateString()}

// 👕 *Garment Details:*
// ${garmentList}

// 📊 *Summary:*
//    Total Garments: ${totalGarments}
//    Total Amount: ₹${totalMin} - ₹${totalMax}
//    Advance Paid: ₹${advancePaid}
//    Total Paid: ₹${totalPaid}
//    Balance: ₹${balanceMin} - ₹${balanceMax}

// 🔗 Track your order: ${process.env.FRONTEND_URL}/orders/${order.orderId}

// Thank you for choosing DreamFit! 🎉
//     `;
//   },

//   // 💰 2. PAYMENT RECEIVED
//   PAYMENT_RECEIVED: (order, customer, payment) => {
//     const totalPaid = order.paymentSummary?.totalPaid || 0;
//     const totalMin = order.priceSummary?.totalMin || 0;
//     const totalMax = order.priceSummary?.totalMax || 0;
//     const balanceMin = totalMin - totalPaid;
//     const balanceMax = totalMax - totalPaid;
    
//     const customerName = customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Customer';
    
//     const paymentMethod = {
//       cash: '💵 Cash',
//       upi: '📱 UPI',
//       card: '💳 Card',
//       'bank-transfer': '🏦 Bank Transfer'
//     }[payment.method] || payment.method;

//     const paymentType = {
//       advance: 'Advance Payment',
//       partial: 'Part Payment',
//       full: 'Full Payment',
//       'final-settlement': 'Final Settlement',
//       refund: 'Refund',
//       extra: 'Extra Payment'
//     }[payment.type] || 'Payment';

//     return `
// 💰 *DreamFit - ${paymentType} Received* ✅

// 👤 *Customer:* ${customerName}
// 📦 *Order ID:* ${order.orderId}
// 💵 *Amount:* ₹${payment.amount}
// 💳 *Method:* ${paymentMethod}
// 📅 *Date:* ${new Date(payment.date).toLocaleDateString()}
// ${payment.referenceNumber ? `🔖 *Ref No:* ${payment.referenceNumber}` : ''}

// 📊 *Payment Summary:*
//    Total Amount: ₹${totalMin} - ₹${totalMax}
//    Total Paid: ₹${totalPaid}
//    Balance: ₹${balanceMin} - ₹${balanceMax}

// 🔗 Track: ${process.env.FRONTEND_URL}/orders/${order.orderId}

// Thank you for choosing DreamFit! 🙏
//     `;
//   },

//   // 🚚 3. READY TO DELIVER
//   READY_FOR_DELIVERY: (order, customer, garment) => {
//     const garmentId = garment.garmentId || garment._id?.toString().slice(-6) || 'N/A';
//     const priceMin = garment.priceRange?.min || 0;
//     const priceMax = garment.priceRange?.max || 0;
//     const customerName = customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Customer';

//     return `
// 🎉 *DreamFit - Garment Ready!* ✅

// 👤 *Customer:* ${customerName}
// 📦 *Order ID:* ${order.orderId}
// 👕 *Garment:* ${garmentId} - ${garment.name}
// 💰 *Price:* ₹${priceMin} - ₹${priceMax}

// Your garment is ready for delivery!
// Please visit our store to collect.

// 📍 *Store Address:*
// 123, Gandhi Street,
// Chennai - 600001

// 📞 *Contact:* +91 98765 43210

// Thank you for choosing DreamFit! 🎊
//     `;
//   }
// };




// backend/utils/messageTemplates.js

export const MESSAGES = {
  // 📦 1. ORDER CONFIRMATION (Initial)
  ORDER_CONFIRMED: (order, customer) => {
    const totalGarments = order.garments?.length || 0;
    const totalMin = order.priceSummary?.totalMin || 0;
    const totalMax = order.priceSummary?.totalMax || 0;
    const advancePaid = order.advancePayment?.amount || 0;
    
    const customerName = customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Customer';
    
    // Generate garment details list
    const garmentList = order.garments?.map((g, index) => {
      const garmentId = g.garmentId || g._id?.toString().slice(-6) || 'N/A';
      const priceMin = g.priceRange?.min || 0;
      const priceMax = g.priceRange?.max || 0;
      return `   ${index + 1}. ${garmentId} - ${g.name} - ₹${priceMin} - ₹${priceMax}`;
    }).join('\n') || '   No garments';

    return `
🪡 *DreamFit - Order Confirmed* ✅

👤 *Customer:* ${customerName}
📦 *Order ID:* ${order.orderId}
📅 *Order Date:* ${new Date(order.orderDate).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
📅 *Delivery Date:* ${new Date(order.deliveryDate).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}

👕 *Garment Details:*
${garmentList}

📊 *Summary:*
   Total Garments: ${totalGarments}
   Total Amount: ₹${totalMin} - ₹${totalMax}
   Advance Paid: ₹${advancePaid}

🔗 Track your order: ${process.env.FRONTEND_URL}/orders/${order.orderId}

Thank you for choosing DreamFit! 🎉
    `;
  },

  // 💰 2. PAYMENT RECEIVED
  PAYMENT_RECEIVED: (order, customer, payment) => {
    const totalPaid = order.paymentSummary?.totalPaid || 0;
    const totalMin = order.priceSummary?.totalMin || 0;
    const totalMax = order.priceSummary?.totalMax || 0;
    const balanceMin = totalMin - totalPaid;
    const balanceMax = totalMax - totalPaid;
    
    const customerName = customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Customer';
    
    const paymentMethod = {
      cash: '💵 Cash',
      upi: '📱 UPI',
      card: '💳 Card',
      'bank-transfer': '🏦 Bank Transfer'
    }[payment.method] || payment.method;

    const paymentType = {
      advance: 'Advance Payment',
      partial: 'Part Payment',
      full: 'Full Payment',
      'final-settlement': 'Final Settlement',
      refund: 'Refund',
      extra: 'Extra Payment'
    }[payment.type] || 'Payment';

    return `
💰 *DreamFit - ${paymentType} Received* ✅

👤 *Customer:* ${customerName}
📦 *Order ID:* ${order.orderId}
💵 *Amount:* ₹${payment.amount}
💳 *Method:* ${paymentMethod}
📅 *Date:* ${new Date(payment.date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
${payment.referenceNumber ? `🔖 *Ref No:* ${payment.referenceNumber}` : ''}

📊 *Payment Summary:*
   Total Amount: ₹${totalMin} - ₹${totalMax}
   Total Paid: ₹${totalPaid}
   Balance: ₹${balanceMin} - ₹${balanceMax}

🔗 Track: ${process.env.FRONTEND_URL}/orders/${order.orderId}

Thank you for choosing DreamFit! 🙏
    `;
  },

  // 🚚 3. READY TO DELIVER (Final)
  READY_FOR_DELIVERY: (order, customer) => {
    const customerName = customer.name || `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Customer';
    const totalMin = order.priceSummary?.totalMin || 0;
    const totalMax = order.priceSummary?.totalMax || 0;
    const totalPaid = order.paymentSummary?.totalPaid || 0;
    const balance = totalMax - totalPaid;

    // Generate garment list with status
    const garmentList = order.garments?.map((g, index) => {
      const garmentId = g.garmentId || g._id?.toString().slice(-6) || 'N/A';
      const status = g.status || 'pending';
      const statusEmoji = status === 'ready-to-deliver' ? '✅' : '⏳';
      return `   ${index + 1}. ${garmentId} - ${g.name} ${statusEmoji}`;
    }).join('\n') || '   No garments';

    return `
🎉 *DreamFit - Order Ready for Delivery!* ✅

👤 *Customer:* ${customerName}
📦 *Order ID:* ${order.orderId}

👕 *Garments:*
${garmentList}

💰 *Total Amount:* ₹${totalMin} - ₹${totalMax}
💵 *Paid:* ₹${totalPaid}
⚖️ *Balance:* ₹${balance}

📍 *Store Address:*
123, Gandhi Street,
Chennai - 600001

📞 *Contact:* +91 98765 43210

Please visit our store to collect your order!

Thank you for choosing DreamFit! 🎊
    `;
  }
};