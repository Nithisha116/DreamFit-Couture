import React, { useState, useEffect } from "react";
import { X, IndianRupee, Calendar, Clock, Hash, Wallet, Banknote, Smartphone, Landmark, CreditCard } from "lucide-react";
import showToast from "../utils/toast";

export default function AddPaymentModal({ 
  isOpen, 
  onClose, 
  onSave, 
  orderTotalMin = 0,    // ✅ Changed from orderTotal
  orderTotalMax = 0,    // ✅ Added max price
  orderTotal = 0,       // ✅ Backward compatibility (older pages)
  existingPayments = [],// ✅ Used for payment-type workflow
  balanceAmount = null, // ✅ number OR {min,max} from pages
  remainingAmount = 0,   // ✅ How much is still owed
  alreadyPaid = 0,       // ✅ What's been paid so far
  orderId,
  customerId,
  initialData = null,
  title = "Add Payment"
}) {
  const [formData, setFormData] = useState({
    amount: "",
    type: "advance",
    method: "cash",
    referenceNumber: "",
    paymentDate: new Date().toISOString().split('T')[0],
    paymentTime: new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    }),
    notes: ""
  });

  const [errors, setErrors] = useState({});

  // Debug log when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log("%c📱📱📱 ADD PAYMENT MODAL OPENED 📱📱📱", "background: blue; color: white; font-size: 14px");
      console.log("📊 Props received:", {
        orderTotalMin,
        orderTotalMax,
        orderId,
        customerId,
        hasInitialData: !!initialData
      });
      console.log("📝 Initial form state:", formData);
    }
  }, [isOpen, orderTotalMin, orderTotalMax, orderId, customerId, initialData]);

  // Load initial data if editing
  useEffect(() => {
    if (initialData) {
      console.log("%c✏️✏️✏️ LOADING EDIT DATA ✏️✏️✏️", "background: orange; color: white; font-size: 14px");
      console.log("📦 Initial data received:", JSON.parse(JSON.stringify(initialData)));
      setFormData({
        amount: initialData.amount || "",
        type: initialData.type || "advance",
        method: initialData.method || "cash",
        referenceNumber: initialData.referenceNumber || "",
        paymentDate: initialData.paymentDate?.split('T')[0] || new Date().toISOString().split('T')[0],
        paymentTime: initialData.paymentTime || new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        notes: initialData.notes || ""
      });
    }
  }, [initialData]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      console.log("%c🔄🔄🔄 RESETTING FORM 🔄🔄🔄", "background: gray; color: white; font-size: 14px");
      setFormData({
        amount: "",
        type: "advance",
        method: "cash",
        referenceNumber: "",
        paymentDate: new Date().toISOString().split('T')[0],
        paymentTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        notes: ""
      });
      setErrors({});
    }
  }, [isOpen]);

  const totalPaid = (existingPayments || []).reduce(
    (sum, p) => sum + (Number(p?.amount) || 0),
    0,
  );

  const balance = (() => {
    if (typeof balanceAmount === "number") return { min: balanceAmount, max: balanceAmount };
    if (balanceAmount && typeof balanceAmount === "object") {
      const min = Number(balanceAmount.min ?? 0);
      const max = Number(balanceAmount.max ?? balanceAmount.min ?? 0);
      return { min, max };
    }
    const minPrice = Number(orderTotalMin) || Number(orderTotal) || 0;
    const maxPrice = Number(orderTotalMax) || Number(orderTotal) || 0;
    if (totalPaid >= minPrice && minPrice > 0) {
      return { min: 0, max: 0 };
    }
    const min = minPrice - totalPaid;
    const max = maxPrice - totalPaid;
    return { min, max };
  })();

  const hasAnyPayment = (existingPayments || []).length > 0 || totalPaid > 0;
  const hasAdvance = (existingPayments || []).some((p) => p?.type === "advance");
  const fullyPaid = balance.min <= 0 && balance.max <= 0;
  const canShowAdvanceOrFull = !hasAnyPayment && !fullyPaid;
  const shouldShowFinalOnly = hasAdvance && (balance.min > 0 || balance.max > 0);

  const allowedTypes = (() => {
    if (initialData) return ["advance", "full"]; // editing: preserve access
    if (fullyPaid) return [];
    if (canShowAdvanceOrFull) return ["advance", "full"];
    if (shouldShowFinalOnly) return ["full"];
    // fallback: allow full if payments exist but balance remains
    if (hasAnyPayment && (balance.min > 0 || balance.max > 0)) return ["full"];
    return ["advance", "full"];
  })();

  // Ensure type stays valid when opening / when workflow changes
  useEffect(() => {
    if (!isOpen) return;
    if (initialData) return;
    if (allowedTypes.length === 0) return;
    if (!allowedTypes.includes(formData.type)) {
      setFormData((prev) => ({ ...prev, type: allowedTypes[0] }));
    }
  }, [isOpen, allowedTypes.join("|")]); // eslint-disable-line react-hooks/exhaustive-deps

  const validateForm = () => {
    console.log("%c🔍🔍🔍 VALIDATING FORM 🔍🔍🔍", "background: yellow; color: black; font-size: 14px");
    console.log("📝 Form data:", JSON.parse(JSON.stringify(formData)));
    const newErrors = {};

    if (!formData.amount || Number(formData.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
    }

    // Validate against remaining balance
    if (formData.type === 'advance' && remainingAmount > 0) {
      if (Number(formData.amount) > remainingAmount) {
        newErrors.amount = `Amount cannot exceed remaining balance of ₹${remainingAmount}`;
      }
    }

    if (!formData.paymentDate) {
      newErrors.paymentDate = "Payment date is required";
      console.log("❌ Payment date missing");
    } else {
      console.log("✅ Payment date OK:", formData.paymentDate);
    }

    if (!formData.paymentTime) {
      newErrors.paymentTime = "Payment time is required";
      console.log("❌ Payment time missing");
    } else {
      console.log("✅ Payment time OK:", formData.paymentTime);
    }

    // ✅ UPI Reference Number is now OPTIONAL - removed validation
    // Only show warning but don't block submission
    if (formData.method !== "cash" && !formData.referenceNumber.trim()) {
      // Just show toast warning, don't add to errors
      setTimeout(() => {
        showToast.warning(`Reference number is recommended for ${getMethodLabel(formData.method)} payment`);
      }, 100);
      console.log("⚠️ Reference number missing but optional");
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log(isValid ? "✅✅✅ FORM VALIDATION PASSED ✅✅✅" : "❌❌❌ FORM VALIDATION FAILED ❌❌❌", newErrors);
    return isValid;
  };

  const getMethodLabel = (method) => {
    switch (method) {
      case 'upi': return 'UPI';
      case 'bank-transfer': return 'Bank Transfer';
      case 'card': return 'Card';
      default: return 'Cash';
    }
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'cash': return <Banknote size={18} className="text-green-600" />;
      case 'upi': return <Smartphone size={18} className="text-blue-600" />;
      case 'bank-transfer': return <Landmark size={18} className="text-purple-600" />;
      case 'card': return <CreditCard size={18} className="text-orange-600" />;
      default: return <Wallet size={18} className="text-slate-600" />;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const amountStr = String(formData.amount).trim().replace(/[^\d.-]/g, '');
    const parsedAmount = parseFloat(amountStr);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      showToast.error("Invalid amount");
      return;
    }

    const paymentData = {
      order: orderId,
      customer: customerId,
      amount: parsedAmount,
      type: formData.type,
      method: formData.method,
      referenceNumber: formData.referenceNumber?.trim() || '',
      paymentDate: formData.paymentDate,
      paymentTime: formData.paymentTime,
      notes: formData.notes?.trim() || ''
    };


    // Call onSave with the clean data
    onSave(paymentData);

    console.log("%c✅✅✅ onSave CALLED SUCCESSFULLY ✅✅✅", "background: green; color: white");
    console.log("=".repeat(80));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`✏️ Field changed: ${name} =`, value, `(Type: ${typeof value})`);

    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      console.log(`✅ Clearing error for ${name}`);
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Order info: remaining balance */}
        {!initialData && remainingAmount > 0 && (
          <div className="space-y-2 mb-4">
            {(orderTotalMin > 0 || orderTotalMax > 0) && (
              <div className="bg-blue-50 p-3 rounded-xl">
                <p className="text-xs text-blue-600 font-bold">Order Total</p>
                <p className="text-lg font-black text-blue-700">₹{orderTotalMin} — ₹{orderTotalMax}</p>
              </div>
            )}
            {alreadyPaid > 0 && (
              <div className="bg-green-50 p-3 rounded-xl flex justify-between items-center">
                <p className="text-xs text-green-700 font-bold">Already Paid</p>
                <p className="font-black text-green-700">₹{alreadyPaid.toLocaleString('en-IN')}</p>
              </div>
            )}
            <div className="bg-orange-50 p-3 rounded-xl flex justify-between items-center border border-orange-200">
              <p className="text-xs text-orange-700 font-bold">Remaining Balance</p>
              <p className="font-black text-orange-700">₹{remainingAmount.toLocaleString('en-IN')}</p>
            </div>
          </div>
        )}

        {!initialData && remainingAmount <= 0 && orderTotalMax > 0 && (
          <div className="bg-green-50 border border-green-200 p-3 rounded-xl mb-4 text-center">
            <p className="text-green-700 font-black">Enter the amount to be paid  </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-500 mb-2">
              Amount (₹) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                min="1"
                step="1"
                className={`w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${errors.amount ? 'border-red-300 bg-red-50' : 'border-slate-200'
                  }`}
                placeholder="Enter amount"
                required
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-red-500 mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Payment Type */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-500 mb-2">
              Payment Type <span className="text-red-500">*</span>
            </label>
            {allowedTypes.length === 0 ? (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 text-emerald-800 font-bold text-sm">
                Paid Completely ✅
              </div>
            ) : (
              <>
                <div
                  className={`grid gap-2 ${
                    allowedTypes.length === 1 ? "grid-cols-1" : "grid-cols-2"
                  }`}
                >
                  {allowedTypes.includes("advance") && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: "advance", amount: "" })}
                      className={`py-3 rounded-xl font-bold transition-all ${
                        formData.type === "advance"
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      Advance
                    </button>
                  )}
                  {allowedTypes.includes("full") && (
                    <button
                      type="button"
                      onClick={() => {
                        // Auto-fill amount with remaining balance when Full is selected
                        const currentRemaining = remainingAmount > 0 ? remainingAmount : (balance.min > 0 ? balance.min : 0);
                        const autoAmount = currentRemaining > 0 ? String(currentRemaining) : "";
                        setFormData({ ...formData, type: "full", amount: autoAmount });
                      }}
                      className={`py-3 rounded-xl font-bold transition-all ${
                        formData.type === "full"
                          ? "bg-green-600 text-white shadow-lg shadow-green-500/30"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {shouldShowFinalOnly ? "Final" : "Full / Settle"}
                    </button>
                  )}
                </div>
                {formData.type === 'full' && (remainingAmount > 0 || balance.min > 0) && (
                  <p className="text-xs text-green-600 mt-2 font-bold">
                    ✅ Will settle remaining ₹{((remainingAmount > 0 ? remainingAmount : balance.min) || 0).toLocaleString('en-IN')}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-500 mb-2">
              Payment Method <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3 top-3">
                {getMethodIcon(formData.method)}
              </div>
              <select
                name="method"
                value={formData.method}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                required
              >
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="bank-transfer">Bank Transfer</option>
                <option value="card">Card</option>
              </select>
            </div>
          </div>

          {/* Reference Number - Now OPTIONAL for all methods */}
          {formData.method !== 'cash' && (
            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-2">
                Reference Number
                <span className="text-xs font-normal lowercase ml-1 text-slate-400">
                  (Optional - Transaction ID / UPI Ref)
                </span>
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type="text"
                  name="referenceNumber"
                  value={formData.referenceNumber}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder={`Enter ${getMethodLabel(formData.method)} reference (optional)`}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {formData.method === "upi" && "e.g., UPI transaction ID or VPA (optional)"}
                {formData.method === "bank-transfer" && "e.g., NEFT/IMPS/RTGS reference (optional)"}
                {formData.method === "card" && "e.g., Card transaction ID (optional)"}
              </p>
            </div>
          )}

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 text-slate-400" size={16} />
                <input
                  type="date"
                  name="paymentDate"
                  value={formData.paymentDate}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  className={`w-full pl-9 pr-3 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${errors.paymentDate ? 'border-red-300 bg-red-50' : 'border-slate-200'
                    }`}
                  required
                />
              </div>
              {errors.paymentDate && (
                <p className="text-xs text-red-500 mt-1">{errors.paymentDate}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-2">
                Time <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 text-slate-400" size={16} />
                <input
                  type="time"
                  name="paymentTime"
                  value={formData.paymentTime}
                  onChange={handleChange}
                  className={`w-full pl-9 pr-3 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all ${errors.paymentTime ? 'border-red-300 bg-red-50' : 'border-slate-200'
                    }`}
                  required
                />
              </div>
              {errors.paymentTime && (
                <p className="text-xs text-red-500 mt-1">{errors.paymentTime}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-500 mb-2">
              Notes <span className="text-slate-400">(Optional)</span>
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="2"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
              placeholder="Any notes about this payment..."
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-green-500/30"
            >
              {initialData ? 'Update' : 'Add'} Payment
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 rounded-xl font-bold transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}