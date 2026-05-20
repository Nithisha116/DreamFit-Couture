import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchInvoice, 
  collectInvoicePayment,
  selectCurrentInvoice, 
  selectInvoiceLoading 
} from "../../../features/invoice/invoiceSlice";
import { 
  Printer, 
  CreditCard, 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  QrCode,
  DollarSign,
  Receipt,
  User,
  Plus
} from "lucide-react";
import showToast from "../../../utils/toast";

const InvoiceDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const invoice = useSelector(selectCurrentInvoice);
  const loading = useSelector(selectInvoiceLoading);

  // States
  const [showQR, setShowQR] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Payment Form States
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [refNumber, setRefNumber] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (id) {
      dispatch(fetchInvoice(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (invoice) {
      setPaymentAmount(invoice.summary?.dueAmount?.toString() || "");
    }
  }, [invoice]);

  const handlePrint = () => {
    window.print();
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (!invoice) return;

    const amount = Number(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      return showToast.error("Amount must be a positive number.");
    }
    if (amount > invoice.summary.dueAmount) {
      return showToast.error(`Outstanding balance is ₹${invoice.summary.dueAmount}.`);
    }

    dispatch(collectInvoicePayment({
      id: invoice._id,
      data: {
        amount,
        method: paymentMethod,
        referenceNumber: refNumber,
        notes
      }
    })).unwrap()
    .then(() => {
      setShowPaymentModal(false);
      dispatch(fetchInvoice(id)); // Reload details
    });
  };

  if (loading && !invoice) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full mb-3" />
        <span className="font-semibold">Loading sales invoice ledger...</span>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-6 text-center max-w-md mx-auto space-y-4">
        <AlertCircle className="h-14 w-14 text-rose-500 mx-auto stroke-1" />
        <h2 className="text-xl font-bold">Invoice Not Found</h2>
        <p className="text-gray-500 text-sm">
          We could not load any invoice matching ID: {id}.
        </p>
        <Link to="/admin/billing/invoices" className="inline-block px-5 py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800">
          Back to Ledger
        </Link>
      </div>
    );
  }

  // UPI QR String generation
  const merchantUpi = "dreamfitcouture@ybl";
  const payeeName = "DreamFit Couture";
  const dueAmount = invoice.summary?.dueAmount || 0;
  const invoiceNumber = invoice.invoiceNumber || "";
  
  const upiString = `upi://pay?pa=${merchantUpi}&pn=${encodeURIComponent(payeeName)}&am=${dueAmount}&cu=INR&tn=${encodeURIComponent(`Inv ${invoiceNumber}`)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiString)}`;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 text-gray-800">
      
      {/* Top Header controls (Hidden during print) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-gray-100 shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <Link to="/admin/billing/invoices" className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-500">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">
              Invoice Details
            </h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-0.5">{invoice.invoiceNumber}</p>
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {dueAmount > 0 && invoice.status !== "cancelled" && (
            <>
              <button 
                onClick={() => setShowQR(!showQR)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-indigo-100 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold text-xs active:scale-95 transition-all"
              >
                <QrCode className="h-4.5 w-4.5" />
                <span>UPI QR Code</span>
              </button>
              <button 
                onClick={() => setShowPaymentModal(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-95 transition-all text-white font-semibold text-xs shadow-md shadow-emerald-100"
              >
                <CreditCard className="h-4.5 w-4.5" />
                <span>Settle Dues</span>
              </button>
            </>
          )}
          <button 
            onClick={handlePrint}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 font-semibold text-xs shadow-sm active:scale-95 transition-all"
          >
            <Printer className="h-4.5 w-4.5" />
            <span>Print Tax Receipt</span>
          </button>
        </div>
      </div>

      {/* Live QR Drawer Banner */}
      {showQR && dueAmount > 0 && invoice.status !== "cancelled" && (
        <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 p-6 rounded-3xl border border-indigo-950 shadow-xl text-white flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200 print:hidden">
          <div className="space-y-3 max-w-md text-center md:text-left">
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">UPI Instant Store QR Code</span>
            <h3 className="text-xl font-bold">Dynamic Tailoring Payment Settlement</h3>
            <p className="text-xs text-indigo-200/80 leading-relaxed font-semibold">
              Scan using PhonePe, Google Pay, Paytm, BHIM, or any UPI client. Generates exact checkout amount of ₹{dueAmount} directly referencing Invoice ID {invoiceNumber}.
            </p>
            <div className="flex justify-center md:justify-start gap-4 text-xs font-bold text-indigo-300">
              <p>PA: {merchantUpi}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-lg border border-indigo-900 flex flex-col items-center gap-2">
            <img src={qrCodeUrl} alt="UPI QR Checkout" className="h-44 w-44 rounded-lg" />
            <span className="text-[10px] text-gray-400 font-bold tracking-wider uppercase">₹{dueAmount.toLocaleString("en-IN")} due</span>
          </div>
        </div>
      )}

      {/* Main A4 Invoice Container Sheet */}
      <div id="a4-invoice-sheet" className="bg-white p-8 md:p-12 rounded-3xl border border-gray-100 shadow-sm space-y-8 print:border-none print:shadow-none print:p-0">
        
        {/* Print Brand header */}
        <div className="flex justify-between items-start border-b border-gray-100 pb-6">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-gray-900">
              DREAMFIT COUTURE
            </h2>
            <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase">Bespoke Tailoring & Bridal Wear Studio</p>
            <p className="text-xs text-gray-500 mt-2">Studio 4B, Sky Towers, Bangalore, KA, IN</p>
            <p className="text-xs text-gray-500">Contact: +91 98765 43210 | info@dreamfit.in</p>
          </div>
          <div className="text-right space-y-1">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-indigo-50 border border-indigo-100 text-indigo-600 print:border-none print:bg-none print:text-black">
              TAX INVOICE
            </span>
            <h4 className="text-lg font-black text-gray-800 mt-2">{invoice.invoiceNumber}</h4>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              Date: {new Date(invoice.createdAt).toLocaleDateString("en-IN")}
            </p>
          </div>
        </div>

        {/* Customer & Order Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100 print:bg-transparent print:border-none print:p-0">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Billed To</span>
            <p className="font-extrabold text-gray-800 text-sm">{invoice.customer?.name || "Customer"}</p>
            <p className="text-xs text-gray-500 font-medium">Contact: {invoice.customer?.phone}</p>
            {invoice.customer?.email && <p className="text-xs text-gray-500 font-medium">Email: {invoice.customer.email}</p>}
            {invoice.customer?.address && (
              <p className="text-xs text-gray-500 max-w-xs leading-relaxed">{invoice.customer.address}</p>
            )}
          </div>
          <div className="space-y-1.5 md:text-right md:justify-self-end">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Tailoring Job Blueprint</span>
            <p className="text-xs font-bold text-gray-700">Order ID: <span className="bg-white px-2 py-0.5 rounded border border-gray-200 font-bold font-mono">{invoice.order?.orderId || "N/A"}</span></p>
            <p className="text-xs text-gray-500 font-semibold">Stitching Status: {invoice.order?.status || "Completed"}</p>
            <p className="text-xs text-gray-500 font-semibold">Delivery Commitment: {invoice.order?.deliveryDate ? new Date(invoice.order.deliveryDate).toLocaleDateString() : "N/A"}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Detailed Services Ledger Ledger</span>
          <div className="overflow-hidden border border-gray-200 rounded-xl print:border-none print:rounded-none">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 font-bold text-gray-500">
                  <th className="py-3 px-4">Line Item Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Service Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoice.items?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="py-3.5 px-4 font-bold text-gray-800">{item.name}</td>
                    <td className="py-3.5 px-4 text-gray-500 capitalize">{item.category || "stitching"}</td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-gray-900">₹{(item.total || item.price || 0).toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Calculations & Balances summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {/* Notes remarks */}
          <div className="text-xs text-gray-400 font-medium leading-relaxed max-w-sm">
            <p className="font-bold text-gray-500 uppercase tracking-wider mb-1">Standard Studio Terms</p>
            <p>1. Tailoring works once finalized and invoiced trigger Delivery Lock safety protocols.</p>
            <p>2. Trial sessions are recommended before marking statuses as complete.</p>
            <p>3. Dynamic UPI checkout details remain valid until invoice values are refreshed.</p>
          </div>

          {/* Ledger calculations */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-2.5 text-sm print:bg-transparent print:border-none print:p-0">
            <div className="flex justify-between py-1 border-b border-gray-200">
              <span className="text-gray-500 font-medium">Gross Subtotal</span>
              <span className="font-bold text-gray-800">₹{(invoice.summary?.subtotal || 0).toLocaleString("en-IN")}</span>
            </div>
            
            {invoice.summary?.discountAmount > 0 && (
              <div className="flex justify-between py-1 border-b border-gray-200 text-rose-500 font-semibold">
                <span>Promotional Discount</span>
                <span>- ₹{invoice.summary.discountAmount.toLocaleString("en-IN")}</span>
              </div>
            )}
            
            {invoice.summary?.taxAmount > 0 && (
              <div className="flex justify-between py-1 border-b border-gray-200 text-emerald-600 font-semibold">
                <span>GST Tax Added</span>
                <span>+ ₹{invoice.summary.taxAmount.toLocaleString("en-IN")}</span>
              </div>
            )}

            <div className="flex justify-between py-1.5 border-b-2 border-gray-200 text-base font-extrabold text-gray-900">
              <span>Grand Total Value</span>
              <span className="text-indigo-600">₹{(invoice.summary?.grandTotal || 0).toLocaleString("en-IN")}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-gray-200 text-xs text-gray-500">
              <span>Less: Total Amount Paid</span>
              <span className="font-semibold text-gray-700">- ₹{(invoice.summary?.paidAmount || 0).toLocaleString("en-IN")}</span>
            </div>

            <div className={`flex justify-between pt-2 text-lg font-black ${dueAmount > 0 ? "text-rose-500" : "text-emerald-600"}`}>
              <span>Outstanding Dues</span>
              <span>₹{dueAmount.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* Ledger logs / Payment history */}
        <div className="space-y-3 pt-6 border-t border-gray-100">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Collection ledger logs history</span>
          {invoice.payments?.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No payments have been received for this invoice yet.</p>
          ) : (
            <div className="space-y-2">
              {invoice.payments?.map((pay, idx) => (
                <div key={idx} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs print:border-none print:p-1">
                  <div>
                    <span className="font-extrabold text-gray-800">₹{pay.amount.toLocaleString("en-IN")}</span>
                    <span className="mx-2 text-gray-300">|</span>
                    <span className="font-semibold text-gray-500 capitalize">{pay.method}</span>
                    {pay.referenceNumber && (
                      <span className="text-gray-400 font-medium"> ({pay.referenceNumber})</span>
                    )}
                  </div>
                  <span className="text-gray-400 font-bold">
                    {new Date(pay.paymentDate || pay.createdAt).toLocaleDateString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Styles for print output */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          #a4-invoice-sheet {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
        }
      `}</style>

      {/* Collect Payment Modal Popup */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity">
          <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-md shadow-emerald-100">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Settle Outstanding Balance</h3>
                  <p className="text-xs text-gray-400 font-semibold">{invoice.invoiceNumber}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="text-xl">&times;</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handlePaymentSubmit} className="p-6 space-y-5">
              {/* Due summary snapshot */}
              <div className="grid grid-cols-2 gap-4 bg-gradient-to-r from-indigo-500 to-violet-600 p-5 rounded-2xl text-white shadow-lg">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-100">Total Invoice</span>
                  <p className="text-2xl font-black">₹{invoice.summary.grandTotal.toLocaleString("en-IN")}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-100">Outstanding Balance</span>
                  <p className="text-2xl font-black">₹{dueAmount.toLocaleString("en-IN")}</p>
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
                  max={dueAmount}
                  className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg font-bold text-gray-900"
                  required
                />
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
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-md" 
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
                  placeholder="Memo, partial installment notes..."
                  className="w-full p-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm h-20"
                />
              </div>

              {/* Submit & Close Buttons */}
              <div className="flex gap-4 pt-3">
                <button 
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-4 border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 text-gray-700 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-bold hover:from-emerald-600 hover:to-teal-700 transition-all text-sm shadow-lg flex items-center justify-center gap-2"
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

export default InvoiceDetails;
