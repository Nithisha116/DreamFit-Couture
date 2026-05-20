import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import API from "../../../app/axios";
import { createInvoice, selectInvoiceLoading } from "../../../features/invoice/invoiceSlice";
import { 
  User, 
  Scissors, 
  Receipt, 
  Percent, 
  Plus, 
  Trash2, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle,
  AlertTriangle,
  ArrowLeft
} from "lucide-react";
import showToast from "../../../utils/toast";

const CreateInvoice = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loading = useSelector(selectInvoiceLoading);

  // States
  const [order, setOrder] = useState(null);
  const [orderLoading, setOrderLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);

  // Add-ons line items
  const [stitchingLineItems, setStitchingLineItems] = useState([]);
  const [fabricLineItems, setFabricLineItems] = useState([]);
  const [additionLineItems, setAdditionLineItems] = useState([]);

  // Taxes & Discounts
  const [taxRate, setTaxRate] = useState(0); // 0, 5, 12, 18%
  const [discountType, setDiscountType] = useState("percentage"); // flat or percentage
  const [discountVal, setDiscountVal] = useState(0);

  // Fetch Order details on enter
  useEffect(() => {
    if (!orderId) return;
    
    setOrderLoading(true);
    API.get(`/orders/${orderId}`)
      .then(res => {
        const orderData = res.data.order;
        setOrder(orderData);
        
        // Auto initialize Stitching & Fabric line items from order garments
        if (orderData.garments && orderData.garments.length > 0) {
          const stitches = orderData.garments.map((g, idx) => ({
            id: `stitch-${idx}`,
            name: `${g.itemName || g.name} Stitching Fee`,
            amount: Number(g.priceRange?.min) || 2500 // Fallback stitching
          }));
          setStitchingLineItems(stitches);

          const fabrics = orderData.garments
            .filter(g => g.fabricSource === "store")
            .map((g, idx) => ({
              id: `fabric-${idx}`,
              name: `${g.itemName || g.name} Fabric (${g.fabricPrice || "0"})`,
              amount: Number(g.fabricPrice) || 0
            }));
          setFabricLineItems(fabrics);
        }
      })
      .catch(err => {
        console.error("Order load error:", err.message);
        showToast.error("Failed to fetch order details. Please check the ID.");
      })
      .finally(() => {
        setOrderLoading(false);
      });
  }, [orderId]);

  // Stepper helpers
  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  // Stitch Add-ons handlers
  const addStitchRow = () => {
    setStitchingLineItems(prev => [
      ...prev,
      { id: `stitch-custom-${Date.now()}`, name: "Custom Styling Stitch Charge", amount: 500 }
    ]);
  };
  const removeStitchRow = (id) => {
    setStitchingLineItems(prev => prev.filter(item => item.id !== id));
  };
  const updateStitchRow = (id, field, val) => {
    setStitchingLineItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: field === "amount" ? Number(val) || 0 : val };
      }
      return item;
    }));
  };

  // Fabric Add-ons handlers
  const addFabricRow = () => {
    setFabricLineItems(prev => [
      ...prev,
      { id: `fabric-custom-${Date.now()}`, name: "Store Cotton Fabric", amount: 1200 }
    ]);
  };
  const removeFabricRow = (id) => {
    setFabricLineItems(prev => prev.filter(item => item.id !== id));
  };
  const updateFabricRow = (id, field, val) => {
    setFabricLineItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: field === "amount" ? Number(val) || 0 : val };
      }
      return item;
    }));
  };

  // Addition add-ons handlers (Piping, lining, padding)
  const addAdditionRow = () => {
    setAdditionLineItems(prev => [
      ...prev,
      { id: `addition-custom-${Date.now()}`, name: "Lining / Piping Premium Addon", amount: 300 }
    ]);
  };
  const removeAdditionRow = (id) => {
    setAdditionLineItems(prev => prev.filter(item => item.id !== id));
  };
  const updateAdditionRow = (id, field, val) => {
    setAdditionLineItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: field === "amount" ? Number(val) || 0 : val };
      }
      return item;
    }));
  };

  // Calculate totals
  const subTotalStitching = stitchingLineItems.reduce((sum, item) => sum + item.amount, 0);
  const subTotalFabric = fabricLineItems.reduce((sum, item) => sum + item.amount, 0);
  const subTotalAddons = additionLineItems.reduce((sum, item) => sum + item.amount, 0);

  const rawSubTotal = subTotalStitching + subTotalFabric + subTotalAddons;

  // Discount calculation
  let calculatedDiscount = 0;
  if (discountType === "percentage") {
    calculatedDiscount = (rawSubTotal * discountVal) / 100;
  } else {
    calculatedDiscount = discountVal;
  }
  const postDiscountSubtotal = Math.max(rawSubTotal - calculatedDiscount, 0);

  // Tax calculation
  const calculatedTax = (postDiscountSubtotal * taxRate) / 100;

  // Grand Total & Balances
  const grandTotal = postDiscountSubtotal + calculatedTax;
  const alreadyPaidAmount = order?.paymentSummary?.totalPaid || order?.advancePayment?.amount || 0;
  const balanceDue = Math.max(grandTotal - alreadyPaidAmount, 0);

  // Issue Invoicing
  const handleIssueInvoiceSubmit = () => {
    const payload = {
      items: [
        ...stitchingLineItems.map(item => ({ name: item.name, price: Number(item.amount) || 0, qty: 1, total: Number(item.amount) || 0 })),
        ...fabricLineItems.map(item => ({ name: item.name, price: Number(item.amount) || 0, qty: 1, total: Number(item.amount) || 0 })),
        ...additionLineItems.map(item => ({ name: item.name, price: Number(item.amount) || 0, qty: 1, total: Number(item.amount) || 0 }))
      ],
      discountType: discountType,
      discountValue: Number(discountVal) || 0,
      taxPercentage: Number(taxRate) || 0
    };

    dispatch(createInvoice({ orderId: order._id, data: payload }))
      .unwrap()
      .then((newInvoice) => {
        navigate(`/admin/billing/invoices/${newInvoice._id}`);
      });
  };

  if (orderLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full mb-3" />
        <span className="font-semibold">Fetching tailoring order blueprints...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6 text-center max-w-md mx-auto space-y-4">
        <AlertTriangle className="h-14 w-14 text-rose-500 mx-auto stroke-1" />
        <h2 className="text-xl font-bold">Order Not Found</h2>
        <p className="text-gray-500 text-sm">
          We could not load any tailoring order matching ID: {orderId}.
        </p>
        <Link to="/admin/orders" className="inline-block px-5 py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 text-gray-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/admin/orders" className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-500">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-gray-900 to-indigo-900 bg-clip-text text-transparent">
              Generate Tailoring Invoice
            </h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">Order ID: #{order.orderId}</p>
          </div>
        </div>
      </div>

      {/* Stepper Status Indicators */}
      <div className="grid grid-cols-4 gap-2 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        {[
          { step: 1, icon: User, label: "Order Review" },
          { step: 2, icon: Scissors, label: "Custom Charges" },
          { step: 3, icon: Percent, label: "Taxes & Discounts" },
          { step: 4, icon: Receipt, label: "Final Ledger" }
        ].map((item) => {
          const Icon = item.icon;
          const isActive = currentStep === item.step;
          const isCompleted = currentStep > item.step;

          return (
            <div 
              key={item.step} 
              className={`flex items-center justify-center gap-2 p-3 rounded-xl transition-all ${
                isActive 
                  ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-100" 
                  : isCompleted 
                    ? "bg-emerald-50 text-emerald-600 font-bold border border-emerald-100" 
                    : "bg-gray-50 text-gray-400 border border-gray-100"
              }`}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              <span className="text-xs hidden md:inline">{item.label}</span>
            </div>
          );
        })}
      </div>

      {/* Main Steps Content container */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm min-h-[350px] flex flex-col justify-between">
        
        {/* Step 1: Customer & Order Review */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Step 1: Customer & Stitching Review</h2>
            
            {/* Customer Details info block */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Customer Details</span>
                <p className="font-extrabold text-gray-800 text-sm mt-0.5">{order.customer?.name}</p>
                <p className="text-xs text-gray-500 font-medium">{order.customer?.phone}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Stitching Specs</span>
                <p className="font-bold text-gray-700 text-sm mt-0.5">{order.garments?.length || 0} Garments Ordered</p>
                <p className="text-xs text-gray-500 font-medium">Fabric: {order.garments?.[0]?.fabricSource === "store" ? "Store Fabric" : "Customer's Cloth"}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Timeline Checks</span>
                <p className="font-bold text-gray-700 text-sm mt-0.5">Delivery: {new Date(order.deliveryDate).toLocaleDateString()}</p>
                <p className="text-xs text-gray-500 font-medium">Trial Date: {order.trialDate ? new Date(order.trialDate).toLocaleDateString() : "No trial date set"}</p>
              </div>
            </div>

            {/* Garments Table */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Ordered Tailoring Products</span>
              <div className="overflow-hidden border border-gray-200 rounded-xl">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 font-bold text-gray-500">
                      <th className="py-3 px-4">Garment</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4 text-right">Stitching Estimate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {order.garments?.map((g, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="py-3 px-4 font-bold text-gray-800">{g.itemName || g.name}</td>
                        <td className="py-3 px-4 text-gray-500 capitalize">
                          {g.categoryName || (typeof g.category === 'object' ? g.category?.name : g.category) || "General"}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            g.priority === "high" ? "bg-rose-50 text-rose-600" : "bg-gray-100 text-gray-600"
                          }`}>
                            {g.priority || "Normal"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold">₹{g.priceRange?.min || "2,500"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Custom Charges & Materials */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Step 2: Stitching Fees & Add-ons Adjustments</h2>
            
            {/* 1. Stitching Line Items */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Stitching charges</span>
                <button 
                  type="button" 
                  onClick={addStitchRow}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                >
                  <Plus className="h-4 w-4" /> Add Stitch Row
                </button>
              </div>
              <div className="space-y-2">
                {stitchingLineItems.map(item => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <input 
                      type="text" 
                      value={item.name}
                      onChange={(e) => updateStitchRow(item.id, "name", e.target.value)}
                      className="flex-1 p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                      required
                    />
                    <input 
                      type="number" 
                      value={item.amount}
                      onChange={(e) => updateStitchRow(item.id, "amount", e.target.value)}
                      className="w-36 p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-right"
                      required
                    />
                    <button 
                      type="button" 
                      onClick={() => removeStitchRow(item.id)}
                      className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Fabric Line Items */}
            <div className="space-y-3 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Fabric/Material charges</span>
                <button 
                  type="button" 
                  onClick={addFabricRow}
                  className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-800"
                >
                  <Plus className="h-4 w-4" /> Add Fabric Row
                </button>
              </div>
              <div className="space-y-2">
                {fabricLineItems.length === 0 ? (
                  <p className="text-xs text-gray-400 font-medium italic">No fabric items. Click Add to include shop fabrics.</p>
                ) : (
                  fabricLineItems.map(item => (
                    <div key={item.id} className="flex gap-4 items-center">
                      <input 
                        type="text" 
                        value={item.name}
                        onChange={(e) => updateFabricRow(item.id, "name", e.target.value)}
                        className="flex-1 p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        required
                      />
                      <input 
                        type="number" 
                        value={item.amount}
                        onChange={(e) => updateFabricRow(item.id, "amount", e.target.value)}
                        className="w-36 p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-bold text-right"
                        required
                      />
                      <button 
                        type="button" 
                        onClick={() => removeFabricRow(item.id)}
                        className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 3. Add-ons additions Items (elastic, lining, pipings) */}
            <div className="space-y-3 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Add-ons (lining, piping, elastic, padding)</span>
                <button 
                  type="button" 
                  onClick={addAdditionRow}
                  className="flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-800"
                >
                  <Plus className="h-4 w-4" /> Add lining/addon
                </button>
              </div>
              <div className="space-y-2">
                {additionLineItems.length === 0 ? (
                  <p className="text-xs text-gray-400 font-medium italic">No premium add-ons loaded. Click Add to include pipings or linings.</p>
                ) : (
                  additionLineItems.map(item => (
                    <div key={item.id} className="flex gap-4 items-center">
                      <input 
                        type="text" 
                        value={item.name}
                        onChange={(e) => updateAdditionRow(item.id, "name", e.target.value)}
                        className="flex-1 p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                        required
                      />
                      <input 
                        type="number" 
                        value={item.amount}
                        onChange={(e) => updateAdditionRow(item.id, "amount", e.target.value)}
                        className="w-36 p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-bold text-right"
                        required
                      />
                      <button 
                        type="button" 
                        onClick={() => removeAdditionRow(item.id)}
                        className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Taxes & Discounts */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Step 3: Corporate Discounts & GST Rates</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Discounts card */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                  <Percent className="h-5 w-5" />
                  <span>Configure Promotional Discounts</span>
                </div>
                
                <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block">Discounting Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      type="button" 
                      onClick={() => { setDiscountType("percentage"); setDiscountVal(0); }}
                      className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                        discountType === "percentage" 
                          ? "bg-indigo-600 border-indigo-600 text-white" 
                          : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Percentage (%)
                    </button>
                    <button 
                      type="button" 
                      onClick={() => { setDiscountType("flat"); setDiscountVal(0); }}
                      className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                        discountType === "flat" 
                          ? "bg-indigo-600 border-indigo-600 text-white" 
                          : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Flat Rupees (₹)
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block">
                    {discountType === "percentage" ? "Discount Ratio (%)" : "Flat Reduction (₹)"}
                  </label>
                  <input 
                    type="number"
                    value={discountVal}
                    onChange={(e) => setDiscountVal(Math.max(Number(e.target.value) || 0, 0))}
                    className="w-full p-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold"
                  />
                </div>
              </div>

              {/* Tax config card */}
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                  <Receipt className="h-5 w-5" />
                  <span>Configure Tailoring Taxes (GST)</span>
                </div>
                
                <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block">GST Percentage Tier</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[0, 5, 12, 18].map(rate => (
                      <button 
                        key={rate}
                        type="button" 
                        onClick={() => setTaxRate(rate)}
                        className={`py-3.5 rounded-xl border text-xs font-bold transition-all ${
                          taxRate === rate 
                            ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-100" 
                            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {rate}%
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400 font-semibold italic mt-1">
                    GST is computed on subtotal after applying discounts.
                  </p>
                </div>
              </div>
            </div>

            {/* Calculations snapshot */}
            <div className="bg-gradient-to-r from-gray-900 to-indigo-950 p-5 rounded-2xl text-white flex justify-between items-center shadow-lg shadow-indigo-950/20">
              <div>
                <span className="text-[10px] text-indigo-200/80 font-bold uppercase tracking-wider">Computed Subtotal</span>
                <p className="text-2xl font-black">₹{rawSubTotal.toLocaleString("en-IN")}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-indigo-200/80 font-bold uppercase tracking-wider">Grand Total (Post Tax/Discount)</span>
                <p className="text-2xl font-black text-emerald-400">₹{grandTotal.toLocaleString("en-IN")}</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Final Ledger Preview */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Step 4: Review Double-Entry Ledger Preview</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Detailed items ledger breakdown */}
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Ledger Lines Preview</span>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {[...stitchingLineItems, ...fabricLineItems, ...additionLineItems].map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 text-xs">
                      <span className="font-bold text-gray-700">{item.name}</span>
                      <span className="font-extrabold text-gray-900">₹{item.amount.toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Invoicing balance calculations card */}
              <div className="bg-white p-5 rounded-2xl border-2 border-indigo-50 shadow-md shadow-indigo-100/50 space-y-3 text-sm">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest block">Financial Summary Balance</span>
                
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Stitching Subtotal</span>
                  <span className="font-bold text-gray-800">₹{subTotalStitching.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Fabric Subtotal</span>
                  <span className="font-bold text-gray-800">₹{subTotalFabric.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Linings & Accessories</span>
                  <span className="font-bold text-gray-800">₹{subTotalAddons.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100 font-bold text-gray-800">
                  <span>Gross Subtotal</span>
                  <span>₹{rawSubTotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100 text-rose-500 font-semibold">
                  <span>Campaign Discounts</span>
                  <span>- ₹{calculatedDiscount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100 text-emerald-600 font-semibold">
                  <span>Taxes (GST @{taxRate}%)</span>
                  <span>+ ₹{calculatedTax.toLocaleString("en-IN")}</span>
                </div>

                {/* Grand Total */}
                <div className="flex justify-between py-2 border-b-2 border-gray-100 text-base font-extrabold text-gray-900">
                  <span>Grand Total</span>
                  <span className="text-indigo-600">₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>

                {/* Total Deductions */}
                <div className="flex justify-between py-1 border-b border-gray-100 text-xs font-bold text-gray-500">
                  <span>Less: Total Amount Paid</span>
                  <span className="text-gray-700">- ₹{alreadyPaidAmount.toLocaleString("en-IN")}</span>
                </div>

                {/* Balance Due */}
                <div className="flex justify-between pt-2 text-lg font-black text-rose-600">
                  <span>Net Outstanding Balance</span>
                  <span>₹{balanceDue.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Warning block about ledger locks */}
            <div className="flex gap-3 bg-rose-50 p-4 rounded-xl border border-rose-100 text-rose-800 text-xs">
              <CheckCircle className="h-5 w-5 shrink-0 text-rose-500" />
              <p className="leading-relaxed font-semibold">
                Once generated, the system creates a ledger entry that automatically transitions the order's financial summary and registers the Delivery Lock constraint if there is a due balance.
              </p>
            </div>
          </div>
        )}

        {/* Stepper Navigation buttons */}
        <div className="flex justify-between gap-4 pt-6 border-t border-gray-100 mt-6">
          <button 
            type="button" 
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center gap-1.5 px-5 py-3.5 rounded-xl border font-bold transition-all text-xs active:scale-95 ${
              currentStep === 1 
                ? "bg-gray-100 border-gray-100 text-gray-400 cursor-not-allowed" 
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <ChevronLeft className="h-4.5 w-4.5" /> Previous Step
          </button>

          {currentStep < 4 ? (
            <button 
              type="button" 
              onClick={nextStep}
              className="flex items-center gap-1.5 px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all text-xs active:scale-95 shadow-md shadow-indigo-100"
            >
              Next Step <ChevronRight className="h-4.5 w-4.5" />
            </button>
          ) : (
            <button 
              type="button" 
              onClick={handleIssueInvoiceSubmit}
              disabled={loading}
              className="flex items-center gap-1.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold transition-all text-xs active:scale-95 shadow-lg shadow-indigo-100"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  <span>Issuing Sales Ledger...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4.5 w-4.5" /> Issue Invoicing Document
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default CreateInvoice;
