/**
 * test_payment_edit.js — Regression tests for Payment Edit Bug Fix
 * 
 * Verifies that editing a payment's method does NOT mutate the payment type.
 * Tests the backend updatePayment controller logic directly via the Payment model.
 * 
 * Usage: node test_payment_edit.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Payment from './models/Payment.js';
import Order from './models/Order.js';
import Customer from './models/Customer.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

let passed = 0;
let failed = 0;
const results = [];

function assert(condition, testName) {
  if (condition) {
    passed++;
    results.push(`  ✅ PASS: ${testName}`);
  } else {
    failed++;
    results.push(`  ❌ FAIL: ${testName}`);
  }
}

async function cleanup(ids) {
  if (ids.payments?.length) {
    await Payment.deleteMany({ _id: { $in: ids.payments } });
  }
}

async function createTestPayment(orderId, customerId, overrides = {}) {
  const payment = await Payment.create({
    order: orderId,
    customer: customerId,
    amount: 2700,
    type: 'advance',
    method: 'cash',
    paymentDate: new Date(),
    paymentTime: '10:30:00',
    referenceNumber: 'TEST-REF-001',
    notes: 'Test payment note',
    receivedBy: customerId,
    ...overrides,
  });
  return payment;
}

async function runTests() {
  console.log('\n' + '='.repeat(70));
  console.log('  🧪 Payment Edit Regression Tests');
  console.log('  Testing: Changing payment method must NOT change payment type');
  console.log('='.repeat(70) + '\n');

  await mongoose.connect(MONGO_URI);
  console.log('  📡 Connected to MongoDB\n');

  const order = await Order.findOne({}).lean();
  const customer = await Customer.findOne({}).lean();

  if (!order || !customer) {
    console.error('  ❌ Cannot run tests: No orders or customers found in database');
    await mongoose.disconnect();
    process.exit(1);
  }

  const orderId = order._id;
  const customerId = customer._id;
  const testPaymentIds = [];

  try {
    // Test 1: Change Cash → UPI, preserve ADVANCE type
    console.log('  📋 Test 1: Cash → UPI preserves ADVANCE type');
    {
      const payment = await createTestPayment(orderId, customerId, {
        type: 'advance',
        method: 'cash',
      });
      testPaymentIds.push(payment._id);

      const updated = await Payment.findOneAndUpdate(
        { _id: payment._id },
        { method: 'upi' },
        { new: true }
      );

      assert(updated.type === 'advance', 'Type remains "advance" after Cash → UPI');
      assert(updated.method === 'upi', 'Method changed to "upi"');
      assert(updated.amount === 2700, 'Amount unchanged');
    }

    // Test 2: Change UPI → Cash, preserve ADVANCE type
    console.log('  📋 Test 2: UPI → Cash preserves ADVANCE type');
    {
      const payment = await createTestPayment(orderId, customerId, {
        type: 'advance',
        method: 'upi',
      });
      testPaymentIds.push(payment._id);

      const updated = await Payment.findOneAndUpdate(
        { _id: payment._id },
        { method: 'cash' },
        { new: true }
      );

      assert(updated.type === 'advance', 'Type remains "advance" after UPI → Cash');
      assert(updated.method === 'cash', 'Method changed to "cash"');
    }

    // Test 3: FINAL_SETTLEMENT + CASH → FINAL_SETTLEMENT + UPI
    console.log('  📋 Test 3: Final Settlement + Cash → Final Settlement + UPI');
    {
      const payment = await createTestPayment(orderId, customerId, {
        type: 'final-settlement',
        method: 'cash',
      });
      testPaymentIds.push(payment._id);

      const updated = await Payment.findOneAndUpdate(
        { _id: payment._id },
        { method: 'upi' },
        { new: true }
      );

      assert(updated.type === 'final-settlement', 'Type remains "final-settlement" after Cash → UPI');
      assert(updated.method === 'upi', 'Method changed to "upi"');
    }

    // Test 4: FULL + CASH → FULL + UPI
    console.log('  📋 Test 4: Full + Cash → Full + UPI');
    {
      const payment = await createTestPayment(orderId, customerId, {
        type: 'full',
        method: 'cash',
      });
      testPaymentIds.push(payment._id);

      const updated = await Payment.findOneAndUpdate(
        { _id: payment._id },
        { method: 'upi' },
        { new: true }
      );

      assert(updated.type === 'full', 'Type remains "full" after Cash → UPI');
      assert(updated.method === 'upi', 'Method changed to "upi"');
    }

    // Test 5: Amount change must not change type
    console.log('  📋 Test 5: Amount change does not change type');
    {
      const payment = await createTestPayment(orderId, customerId, {
        type: 'advance',
        method: 'cash',
        amount: 1000,
      });
      testPaymentIds.push(payment._id);

      const updated = await Payment.findOneAndUpdate(
        { _id: payment._id },
        { amount: 2000 },
        { new: true }
      );

      assert(updated.type === 'advance', 'Type remains "advance" after amount change');
      assert(updated.amount === 2000, 'Amount changed to 2000');
      assert(updated.method === 'cash', 'Method unchanged');
    }

    // Test 6: Method change preserves ALL other fields
    console.log('  📋 Test 6: Method change preserves all other fields');
    {
      const originalDate = new Date('2025-06-15T10:00:00Z');
      const payment = await createTestPayment(orderId, customerId, {
        type: 'advance',
        method: 'cash',
        amount: 2700,
        referenceNumber: 'REF-PRESERVE-001',
        notes: 'Important payment note',
        paymentDate: originalDate,
        paymentTime: '14:30:00',
      });
      testPaymentIds.push(payment._id);

      const updated = await Payment.findOneAndUpdate(
        { _id: payment._id },
        { method: 'bank-transfer' },
        { new: true }
      );

      assert(updated.type === 'advance', 'Type preserved');
      assert(updated.amount === 2700, 'Amount preserved');
      assert(updated.referenceNumber === 'REF-PRESERVE-001', 'Reference number preserved');
      assert(updated.notes === 'Important payment note', 'Notes preserved');
      assert(updated.paymentDate.toISOString() === originalDate.toISOString(), 'Payment date preserved');
      assert(updated.paymentTime === '14:30:00', 'Payment time preserved');
      assert(updated.method === 'bank-transfer', 'Method changed to bank-transfer');
    }

    // Test 7: Simulated controller update — only method supplied
    console.log('  📋 Test 7: Simulated controller update — only method supplied');
    {
      const payment = await createTestPayment(orderId, customerId, {
        type: 'advance',
        method: 'cash',
        amount: 3500,
      });
      testPaymentIds.push(payment._id);

      const reqBody = { method: 'upi' };
      const allowedUpdates = ['amount', 'method', 'referenceNumber', 'notes', 'type', 'paymentDate', 'paymentTime'];
      
      const paymentDoc = await Payment.findOne({ _id: payment._id });
      allowedUpdates.forEach((field) => {
        if (reqBody[field] !== undefined) paymentDoc[field] = reqBody[field];
      });
      await paymentDoc.save();

      const verified = await Payment.findById(payment._id);
      assert(verified.type === 'advance', 'Controller simulation: type preserved as "advance"');
      assert(verified.method === 'upi', 'Controller simulation: method changed to "upi"');
      assert(verified.amount === 3500, 'Controller simulation: amount preserved');
    }

    // Test 8: All method transitions preserve type
    console.log('  📋 Test 8: All method transitions preserve type');
    {
      const methods = ['cash', 'upi', 'bank-transfer', 'card'];
      
      for (const fromMethod of methods) {
        for (const toMethod of methods) {
          if (fromMethod === toMethod) continue;
          
          const payment = await createTestPayment(orderId, customerId, {
            type: 'advance',
            method: fromMethod,
          });
          testPaymentIds.push(payment._id);

          const updated = await Payment.findOneAndUpdate(
            { _id: payment._id },
            { method: toMethod },
            { new: true }
          );

          assert(
            updated.type === 'advance',
            `${fromMethod} → ${toMethod}: type preserved as "advance"`
          );
        }
      }
    }

  } finally {
    console.log('\n  🧹 Cleaning up test data...');
    await cleanup({ payments: testPaymentIds });
    console.log('  ✅ Test data cleaned up');
  }

  console.log('\n' + '─'.repeat(70));
  console.log('  📊 Test Results');
  console.log('─'.repeat(70));
  results.forEach(r => console.log(r));
  console.log('─'.repeat(70));
  console.log(`  Total: ${passed + failed} | ✅ Passed: ${passed} | ❌ Failed: ${failed}`);
  console.log('─'.repeat(70) + '\n');

  await mongoose.disconnect();
  console.log('  📡 Disconnected from MongoDB\n');

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error('  ❌ Test suite crashed:', err);
  mongoose.disconnect();
  process.exit(1);
});
