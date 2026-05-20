import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { 
  fetchInvoices, 
  collectInvoicePayment,
  cancelInvoice,
  selectInvoices, 
  selectInvoiceLoading 
} from "../../../features/invoice/invoiceSlice";
import { 
  Search, 
  Filter, 
  PlusCircle, 
  CreditCard, 
  Eye, 
  Trash2, 
  AlertCircle,
  X,
  FileText
} from "lucide-react";
import showToast from "../../../utils/toast";

const InvoiceList = () => {
  const dispatch = useDispatch();
  const invoices = useSelector(selectInvoices);
  const loading = useSelector(selectInvoiceLoading);

  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  // Payment Modal Overlay
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [refNumber, setRefNumber] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    dispatch(fetchInvoices());
  }, [dispatch]);

  // Filters
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      inv.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.order?.orderId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
    const matchesPayment = paymentFilter === "all" || inv.paymentStatus === paymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Open Collect Payment Popup
  const openPaymentModal = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentAmount(invoice.summary.dueAmount.toString());
    setPaymentMethod("upi");
    setRefNumber("");
    setNotes("");
  };

  // Quick Settle Actions
  const applyQuickPercentage = (percent) => {
    if (!selectedInvoice) return;
    const computed = (selectedInvoice.summary.dueAmount * percent) / 100;
    setPaymentAmount(Math.round(computed * 100) / 100);
  };

  // Submit Payment Capture
  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    const amount = Number(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      return showToast.error("Amount must be a positive number.");
    }
    if (amount > selectedInvoice.summary.dueAmount) {
      return showToast.error(`Maximum outstanding balance is ₹${selectedInvoice.summary.dueAmount}.`);
    }

    dispatch(collectInvoicePayment({
      id: selectedInvoice._id,
      data: {
        amount,
        method: paymentMethod,
        referenceNumber: refNumber,
        notes
      }
    })).unwrap()
    .then(() => {
      setSelectedInvoice(null);
      dispatch(fetchInvoices()); // Refresh list
    });
  };

  // Trigger Cancel
  const handleCancelInvoice = (id, invoiceNum) => {
    if (window.confirm(`Are you absolutely sure you want to cancel Invoice ${invoiceNum}? This operation will unlink all financials on the order and is fully logged.`)) {
      dispatch(cancelInvoice(id)).unwrap().then(() => {
        dispatch(fetchInvoices());
      });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-gray-800">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-gray-900 via-gray-800 to-indigo-900 bg-clip-text text-transparent">
            Sales Invoice Ledger
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            Browse tailoring invoices, register collections, and generate statements.
          </p>
        </div>
        <Link 
          to="/admin/orders" 
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 active:scale-95 transition-all text-white font-semibold shadow-md shadow-indigo-100 w-full md:w-auto justify-center"
        >
          <PlusCircle className="h-5 w-5" />
          <span>New Invoice</span>
        </Link>
      </div>

      {/* Filters & search card */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by invoice, customer..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-400 shrink-0" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full py-3 px-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
          >
            <option value="all">All Document Statuses</option>
            <option value="draft">Draft Invoices</option>
            <option value="issued">Issued Invoices</option>
            <option value="cancelled">Cancelled Invoices</option>
          </select>
        </div>

        {/* Payment Filter */}
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-gray-400 shrink-0" />
          <select 
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="w-full py-3 px-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm bg-white"
          >
            <option value="all">All Payment Statuses</option>
            <option value="pending">Pending Payments</option>
            <option value="partial">Partially Paid</option>
            <option value="paid">Fully Settled</option>
          </select>
        </div>

        {/* Dynamic record count indicator */}
        <div className="flex items-center justify-end text-sm text-gray-500 font-semibold px-2">
          Found {filteredInvoices.length} invoices
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs font-bold uppercase tracking-wider text-gray-500">
                <th className="py-4 px-6">Invoice ID</th>
                <th className="py-4 px-6">Customer</th>
                <th className="py-4 px-6">Order Reference</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6 text-right">Grand Total</th>
                <th className="py-4 px-6 text-right">Outstanding</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
                      <span>Loading invoices ledger...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="h-12 w-12 stroke-1" />
                      <span>No invoice records matched your filters.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-gray-50/50 transition-colors text-sm">
                    {/* Invoice ID */}
                    <td className="py-4 px-6 font-bold text-indigo-900">
                      <Link to={`/admin/billing/invoices/${inv._id}`} className="hover:underline">
                        {inv.invoiceNumber}
                      </Link>
                    </td>
                    
                    {/* Customer */}
                    <td className="py-4 px-6 font-semibold text-gray-800">
                      <div>
                        <p>{inv.customer?.name || "Deleted Customer"}</p>
                        <p className="text-xs font-medium text-gray-400">{inv.customer?.phone}</p>
                      </div>
                    </td>

                    {/* Order Reference */}
                    <td className="py-4 px-6">
                      <span className="font-semibold text-gray-700 bg-gray-100 px-2.5 py-1 rounded-md text-xs">
                        #{inv.order?.orderId || "N/A"}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-6 text-gray-500 font-medium">
                      {new Date(inv.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      })}
                    </td>

                    {/* Grand Total */}
                    <td className="py-4 px-6 text-right font-extrabold text-gray-900">
                      ₹{(inv.summary?.grandTotal || 0).toLocaleString("en-IN")}
                    </td>

                    {/* Outstanding Balance */}
                    <td className={`py-4 px-6 text-right font-black ${inv.summary?.dueAmount > 0 ? "text-rose-500" : "text-emerald-600"}`}>
                      ₹{(inv.summary?.dueAmount || 0).toLocaleString("en-IN")}
                    </td>

                    {/* Status badges */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {/* Doc Status */}
                        {inv.status === "cancelled" ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-100">
                            Cancelled
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100">
                            Issued
                          </span>
                        )}

                        {/* Payment Status */}
                        {inv.status !== "cancelled" && (
                          inv.paymentStatus === "paid" ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                              Paid
                            </span>
                          ) : inv.paymentStatus === "partial" ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
                              Partial
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                              Pending
                            </span>
                          )
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link 
                          to={`/admin/billing/invoices/${inv._id}`}
                          className="p-2 rounded-xl text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4.5 w-4.5" />
                        </Link>
                        
                        {inv.status !== "cancelled" && inv.summary?.dueAmount > 0 && (
                          <button 
                            onClick={() => openPaymentModal(inv)}
                            className="p-2 rounded-xl text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title="Collect Payment"
                          >
                            <CreditCard className="h-4.5 w-4.5" />
                          </button>
                        )}

                        {inv.status !== "cancelled" && (
                          <button 
                            onClick={() => handleCancelInvoice(inv._id, inv.invoiceNumber)}
                            className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                            title="Cancel Invoice"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collect Payment Modal Overlay Popup */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity">
          <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-md shadow-emerald-100">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Collect Invoice Payment</h3>
                  <p className="text-xs text-gray-400 font-semibold">{selectedInvoice.invoiceNumber}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedInvoice(null)}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handlePaymentSubmit} className="p-6 space-y-5">
              {/* Due summary snapshot */}
              <div className="grid grid-cols-2 gap-4 bg-gradient-to-r from-indigo-500 to-violet-600 p-5 rounded-2xl text-white shadow-lg shadow-indigo-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-100">Total Invoice</span>
                  <p className="text-2xl font-black">₹{selectedInvoice.summary.grandTotal.toLocaleString("en-IN")}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-100">Outstanding Balance</span>
                  <p className="text-2xl font-black">₹{selectedInvoice.summary.dueAmount.toLocaleString("en-IN")}</p>
                </div>
              </div>

              {/* Payment Amount */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Payment Amount (₹)</label>
                <input 
                  type="number"
                  step="any"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  max={selectedInvoice.summary.dueAmount}
                  className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg font-bold text-gray-900"
                  required
                />
                
                {/* Fast settle percentages buttons */}
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <button 
                    type="button" 
                    onClick={() => applyQuickPercentage(50)}
                    className="py-2.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-xs font-bold transition-all"
                  >
                    Pay 50%
                  </button>
                  <button 
                    type="button" 
                    onClick={() => applyQuickPercentage(100)}
                    className="py-2.5 rounded-lg border border-indigo-100 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-bold transition-all"
                  >
                    Clear 100%
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setPaymentAmount(selectedInvoice.summary.dueAmount.toString())}
                    className="py-2.5 rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-xs font-bold transition-all"
                  >
                    Full Settlement
                  </button>
                </div>
              </div>

              {/* Payment Channel Method */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Collection Channel</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { val: "upi", label: "UPI/QR" },
                    { val: "cash", label: "Cash" },
                    { val: "bank-transfer", label: "Bank" },
                    { val: "card", label: "Card" }
                  ].map(item => (
                    <button 
                      key={item.val}
                      type="button"
                      onClick={() => setPaymentMethod(item.val)}
                      className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                        paymentMethod === item.val 
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100" 
                          : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reference Transaction Number */}
              {paymentMethod !== "cash" && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Transaction / Reference Number</label>
                  <input 
                    type="text"
                    value={refNumber}
                    onChange={(e) => setRefNumber(e.target.value)}
                    placeholder="e.g. UTR, txn id, card slip number"
                    className="w-full p-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              )}

              {/* Payment Notes */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Collection Remarks</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Memo, partial installment notes, check clearance dates..."
                  className="w-full p-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm h-20"
                />
              </div>

              {/* Submit & Close Buttons */}
              <div className="flex gap-4 pt-3">
                <button 
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="flex-1 py-4 border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 text-gray-700 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-bold hover:from-emerald-600 hover:to-teal-700 transition-all text-sm shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
                >
                  <span>Post Payment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceList;
