// // backend/controllers/whatsapp.controller.js
// import TwilioService from '../services/twilio.service.js';
// import { MESSAGES } from '../utils/messageTemplates.js';
// import Order from '../models/Order.js';
// import Garment from '../models/Garment.js';

// // 📦 1. Send Order Confirmation
// export const sendOrderConfirmation = async (orderId) => {
//   try {
//     console.log(`📨 Sending order confirmation for: ${orderId}`);
    
//     const order = await Order.findById(orderId)
//       .populate('customer')
//       .populate('garments');

//     if (!order) {
//       console.log('❌ Order not found');
//       return;
//     }

//     const customer = order.customer;
    
//     // Get phone number (prefer whatsappNumber, fallback to phone)
//     const phoneNumber = customer.whatsappNumber || customer.phone;
//     const phone = TwilioService.formatPhone(phoneNumber);

//     if (!phone) {
//       console.log('⚠️ Customer has no phone number');
//       return;
//     }

//     const message = MESSAGES.ORDER_CONFIRMED(order, customer);
//     const result = await TwilioService.sendMessage(phone, message);
    
//     console.log(`✅ Order confirmation sent for ${order.orderId}`);
//     return result;

//   } catch (error) {
//     console.error('❌ Error sending order confirmation:', error.message);
//   }
// };

// // 💰 2. Send Payment Received
// export const sendPaymentReceived = async (orderId, payment) => {
//   try {
//     console.log(`📨 Sending payment confirmation for: ${orderId}`);
    
//     const order = await Order.findById(orderId)
//       .populate('customer');

//     if (!order) {
//       console.log('❌ Order not found');
//       return;
//     }

//     const customer = order.customer;
//     const phoneNumber = customer.whatsappNumber || customer.phone;
//     const phone = TwilioService.formatPhone(phoneNumber);

//     if (!phone) {
//       console.log('⚠️ Customer has no phone number');
//       return;
//     }

//     const message = MESSAGES.PAYMENT_RECEIVED(order, customer, payment);
//     const result = await TwilioService.sendMessage(phone, message);
    
//     console.log(`✅ Payment confirmation sent for ${order.orderId}`);
//     return result;

//   } catch (error) {
//     console.error('❌ Error sending payment confirmation:', error.message);
//   }
// };

// // 🚚 3. Send Ready to Deliver
// export const sendReadyToDeliver = async (orderId, garmentId) => {
//   try {
//     console.log(`📨 Sending ready to deliver for: ${orderId}, garment: ${garmentId}`);
    
//     const order = await Order.findById(orderId)
//       .populate('customer');

//     const garment = await Garment.findById(garmentId);

//     if (!order || !garment) {
//       console.log('❌ Order or garment not found');
//       return;
//     }

//     const customer = order.customer;
//     const phoneNumber = customer.whatsappNumber || customer.phone;
//     const phone = TwilioService.formatPhone(phoneNumber);

//     if (!phone) {
//       console.log('⚠️ Customer has no phone number');
//       return;
//     }

//     const message = MESSAGES.READY_FOR_DELIVERY(order, customer, garment);
//     const result = await TwilioService.sendMessage(phone, message);
    
//     console.log(`✅ Ready to deliver sent for ${order.orderId}`);
//     return result;

//   } catch (error) {
//     console.error('❌ Error sending ready to deliver:', error.message);
//   }
// };











// // backend/controllers/whatsapp.controller.js
// import TwilioService from '../services/twilio.service.js';
// import { MESSAGES } from '../utils/messageTemplates.js';
// import Order from '../models/Order.js';

// // 📦 1. Send Order Confirmation (when order is created)
// export const sendOrderConfirmation = async (orderId) => {
//   try {
//     console.log(`📨 Sending order confirmation for: ${orderId}`);
    
//     const order = await Order.findById(orderId)
//       .populate('customer')
//       .populate('garments');

//     if (!order) {
//       console.log('❌ Order not found');
//       return;
//     }

//     const customer = order.customer;
//     const phoneNumber = customer.whatsappNumber || customer.phone;
//     const phone = TwilioService.formatPhone(phoneNumber);

//     if (!phone) {
//       console.log('⚠️ Customer has no phone number');
//       return;
//     }

//     const message = MESSAGES.ORDER_CONFIRMED(order, customer);
//     const result = await TwilioService.sendMessage(phone, message);
    
//     console.log(`✅ Order confirmation sent for ${order.orderId}`);
//     return result;

//   } catch (error) {
//     console.error('❌ Error sending order confirmation:', error.message);
//   }
// };

// // 💰 2. Send Payment Received (when payment is added)
// export const sendPaymentReceived = async (orderId, payment) => {
//   try {
//     console.log(`📨 Sending payment confirmation for: ${orderId}`);
    
//     const order = await Order.findById(orderId)
//       .populate('customer');

//     if (!order) {
//       console.log('❌ Order not found');
//       return;
//     }

//     const customer = order.customer;
//     const phoneNumber = customer.whatsappNumber || customer.phone;
//     const phone = TwilioService.formatPhone(phoneNumber);

//     if (!phone) {
//       console.log('⚠️ Customer has no phone number');
//       return;
//     }

//     const message = MESSAGES.PAYMENT_RECEIVED(order, customer, payment);
//     const result = await TwilioService.sendMessage(phone, message);
    
//     console.log(`✅ Payment confirmation sent for ${order.orderId}`);
//     return result;

//   } catch (error) {
//     console.error('❌ Error sending payment confirmation:', error.message);
//   }
// };

// // 🚚 3. Send Ready to Deliver (when order status becomes 'ready-to-delivery')
// export const sendReadyToDeliver = async (orderId) => {
//   try {
//     console.log(`📨 Sending ready to deliver for order: ${orderId}`);
    
//     const order = await Order.findById(orderId)
//       .populate('customer')
//       .populate('garments');

//     if (!order) {
//       console.log('❌ Order not found');
//       return;
//     }

//     // ✅ Only send if status is actually ready-to-delivery
//     if (order.status !== 'ready-to-delivery') {
//       console.log(`⚠️ Order status is ${order.status}, not sending ready message`);
//       return;
//     }

//     const customer = order.customer;
//     const phoneNumber = customer.whatsappNumber || customer.phone;
//     const phone = TwilioService.formatPhone(phoneNumber);

//     if (!phone) {
//       console.log('⚠️ Customer has no phone number');
//       return;
//     }

//     const message = MESSAGES.READY_FOR_DELIVERY(order, customer);
//     const result = await TwilioService.sendMessage(phone, message);
    
//     console.log(`✅ Ready to deliver sent for ${order.orderId}`);
//     return result;

//   } catch (error) {
//     console.error('❌ Error sending ready to deliver:', error.message);
//   }
// };
















// // backend/controllers/whatsapp.controller.js

// import TwilioService from '../services/twilio.service.js';
// import Order from '../models/Order.js';

// // 📦 1. ORDER CONFIRMATION
// export const sendOrderConfirmation = async (orderId) => {
//   try {
//     console.log(`📨 Sending order confirmation for: ${orderId}`);

//     const order = await Order.findById(orderId)
//       .populate('customer')
//       .populate('garments');

//     if (!order) return console.log('❌ Order not found');

//     const customer = order.customer;
//     const phoneNumber = customer.whatsappNumber || customer.phone;
//     const phone = TwilioService.formatPhone(phoneNumber);

//     if (!phone) return console.log('⚠️ No phone number');

//     // 🔥 Prepare garment list
//     const garmentList = order.garments
//       .map((g, i) => `${i + 1}. ${g.name}`)
//       .join('\n');

//     // 🔥 Variables mapping
//     const variables = {
//       1: customer.name,
//       2: order.orderId,
//       3: new Date(order.orderDate).toLocaleDateString(),
//       4: new Date(order.deliveryDate).toLocaleDateString(),
//       5: garmentList,
//       6: order.garments.length,
//       7: order.priceSummary.totalMin,
//       8: order.priceSummary.totalMax,
//       9: order.advancePayment.amount
//     };

//     // 🔥 SEND TEMPLATE
//     const result = await TwilioService.sendTemplateMessage(
//       phone,
//       "HX5a3d6da41f4b72bd56092d63f0296662", // 👈 replace with real SID
//       variables
//     );

//     console.log(`✅ Order confirmation sent`);
//     return result;

//   } catch (error) {
//     console.error('❌ Error:', error.message);
//   }
// };



// // 💰 2. PAYMENT RECEIVED
// export const sendPaymentReceived = async (orderId, payment) => {
//   try {
//     console.log(`📨 Sending payment confirmation`);

//     const order = await Order.findById(orderId)
//       .populate('customer');

//     if (!order) return console.log('❌ Order not found');

//     const customer = order.customer;
//     const phone = TwilioService.formatPhone(customer.phone);

//     if (!phone) return console.log('⚠️ No phone number');

//     const variables = {
//       1: customer.name,
//       2: order.orderId,
//       3: payment.amount,
//       4: payment.method,
//       5: new Date(payment.date).toLocaleDateString(),
//       6: payment.referenceNumber || "-",
//       7: order.priceSummary.totalMin,
//       8: order.priceSummary.totalMax,
//       9: order.paymentSummary.totalPaid,
//       10: 0,
//       11: order.priceSummary.totalMax - order.paymentSummary.totalPaid,
//       12: `${process.env.FRONTEND_URL}/orders/${order.orderId}`
//     };

//     const result = await TwilioService.sendTemplateMessage(
//       phone,
//       "HX309b00e1323faf1dd5c6c7fb148aabf6", // 👈 replace
//       variables
//     );

//     console.log(`✅ Payment message sent`);
//     return result;

//   } catch (error) {
//     console.error('❌ Error:', error.message);
//   }
// };



// // 🚚 3. READY TO DELIVER
// export const sendReadyToDeliver = async (orderId) => {
//   try {
//     console.log(`📨 Sending ready to deliver`);

//     const order = await Order.findById(orderId)
//       .populate('customer')
//       .populate('garments');

//     if (!order) return console.log('❌ Order not found');

//     if (order.status !== 'ready-to-delivery') {
//       return console.log('⚠️ Not ready yet');
//     }

//     const customer = order.customer;
//     const phone = TwilioService.formatPhone(customer.phone);

//     if (!phone) return console.log('⚠️ No phone number');

//     const garmentList = order.garments
//       .map((g, i) => `${i + 1}. ${g.name}`)
//       .join('\n');

//     const variables = {
//       1: customer.name,
//       2: order.orderId,
//       3: garmentList,
//       4: order.priceSummary.totalMin,
//       5: order.priceSummary.totalMax,
//       6: order.paymentSummary.totalPaid,
//       7: order.priceSummary.totalMax - order.paymentSummary.totalPaid
//     };

//     const result = await TwilioService.sendTemplateMessage(
//       phone,
//       "HXc4e806626c617f3a618cf9d65bf4b928", // 👈 replace
//       variables
//     );

//     console.log(`✅ Ready message sent`);
//     return result;

//   } catch (error) {
//     console.error('❌ Error:', error.message);
//   }
// };
























// backend/controllers/whatsapp.controller.js

import TwilioService from '../services/twilio.service.js';
import Order from '../models/Order.js';

// 📦 1. ORDER CONFIRMATION
export const sendOrderConfirmation = async (orderId) => {
  try {
    console.log(`📨 Sending order confirmation for: ${orderId}`);

    const order = await Order.findById(orderId)
      .populate('customer')
      .populate('garments');

    if (!order) return console.log('❌ Order not found');

    const customer = order.customer;
    const phoneNumber = customer.whatsappNumber || customer.phone;
    
    // Format phone number (no need to call formatPhone separately, sendTemplateMessage will do it)
    
    if (!phoneNumber) return console.log('⚠️ No phone number');

    // 🔥 Prepare garment list
    const garmentList = order.garments
      .map((g, i) => `${i + 1}. ${g.name}`)
      .join('\n');

    // 🔥 Variables mapping (1-based index for Twilio template)
    const variables = {
      "1": customer.name || "Customer",
      "2": order.orderId,
      // Explicit IST — without it these default to the server process's own
      // OS timezone (UTC on most hosts), which can shift the displayed date
      // by a day for a customer in India.
      "3": new Date(order.orderDate).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' }),
      "4": new Date(order.deliveryDate).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' }),
      "5": garmentList,
      "6": order.garments.length.toString(),
      "7": order.priceSummary?.totalMin?.toString() || "0",
      "8": order.priceSummary?.totalMax?.toString() || "0",
      "9": order.advancePayment?.amount?.toString() || "0"
    };

    // 🔥 SEND TEMPLATE
    const result = await TwilioService.sendTemplateMessage(
      phoneNumber,  // Send raw phone number, service will format it
      "HX5a3d6da41f4b72bd56092d63f0296662", // Content Template SID
      variables
    );

    console.log(`✅ Order confirmation sent`);
    return result;

  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
};

// 💰 2. PAYMENT RECEIVED
export const sendPaymentReceived = async (orderId, payment) => {
  try {
    console.log(`📨 Sending payment confirmation for order: ${orderId}`);

    const order = await Order.findById(orderId)
      .populate('customer');

    if (!order) return console.log('❌ Order not found');

    const customer = order.customer;
    const phoneNumber = customer.whatsappNumber || customer.phone;

    if (!phoneNumber) return console.log('⚠️ No phone number');

    const totalPaid = order.paymentSummary?.totalPaid || 0;
    const totalMin = order.priceSummary?.totalMin || 0;
    const totalMax = order.priceSummary?.totalMax || 0;
    const balance = totalMax - totalPaid;

    const variables = {
      "1": customer.name || "Customer",
      "2": order.orderId,
      "3": payment.amount?.toString() || "0",
      "4": payment.method || "Unknown",
      // Explicit IST — see note above.
      "5": new Date(payment.date).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' }),
      "6": payment.referenceNumber || "-",
      "7": totalMin.toString(),
      "8": totalMax.toString(),
      "9": totalPaid.toString(),
      "10": "0", // Placeholder if needed
      "11": balance.toString(),
      "12": `${process.env.FRONTEND_URL}/orders/${order.orderId}`
    };

    const result = await TwilioService.sendTemplateMessage(
      phoneNumber,
      "HX309b00e1323faf1dd5c6c7fb148aabf6", // Content Template SID
      variables
    );

    console.log(`✅ Payment message sent`);
    return result;

  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
};

// 🚚 3. READY TO DELIVER
export const sendReadyToDeliver = async (orderId) => {
  try {
    console.log(`📨 Sending ready to deliver for order: ${orderId}`);

    const order = await Order.findById(orderId)
      .populate('customer')
      .populate('garments');

    if (!order) return console.log('❌ Order not found');

    if (order.status !== 'ready-to-delivery') {
      return console.log('⚠️ Order not ready yet, status:', order.status);
    }

    const customer = order.customer;
    const phoneNumber = customer.whatsappNumber || customer.phone;

    if (!phoneNumber) return console.log('⚠️ No phone number');

    const garmentList = order.garments
      .map((g, i) => `${i + 1}. ${g.name}`)
      .join('\n');

    const totalPaid = order.paymentSummary?.totalPaid || 0;
    const totalMin = order.priceSummary?.totalMin || 0;
    const totalMax = order.priceSummary?.totalMax || 0;
    const balance = totalMax - totalPaid;

    const variables = {
      "1": customer.name || "Customer",
      "2": order.orderId,
      "3": garmentList,
      "4": totalMin.toString(),
      "5": totalMax.toString(),
      "6": totalPaid.toString(),
      "7": balance.toString()
    };

    const result = await TwilioService.sendTemplateMessage(
      phoneNumber,
      "HXc4e806626c617f3a618cf9d65bf4b928", // Content Template SID
      variables
    );

    console.log(`✅ Ready message sent`);
    return result;

  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
};


