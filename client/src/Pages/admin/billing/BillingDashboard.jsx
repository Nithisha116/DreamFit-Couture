import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { 
  fetchBillingStats, 
  selectBillingStats, 
  selectInvoiceLoading 
} from "../../../features/invoice/invoiceSlice";
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CreditCard, 
  PlusCircle, 
  FileText, 
  ArrowRight, 
  Receipt,
  RotateCw
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from "recharts";

const BillingDashboard = () => {
  const dispatch = useDispatch();
  const stats = useSelector(selectBillingStats);
  const loading = useSelector(selectInvoiceLoading);

  useEffect(() => {
    dispatch(fetchBillingStats());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchBillingStats());
  };

  // Safe formatting
  const revenue = stats?.totalRevenue || 0;
  const dues = stats?.totalDue || 0;
  const todayCollection = stats?.todayCollection || 0;
  const methods = stats?.paymentMethods || { cash: 0, upi: 0, bankTransfer: 0, card: 0 };

  const totalCollected = (methods.cash || 0) + (methods.upi || 0) + (methods.bankTransfer || 0) + (methods.card || 0);

  // Pie chart data
  const pieData = [
    { name: "UPI", value: methods.upi || 0, color: "#8B5CF6" }, // Purple
    { name: "Cash", value: methods.cash || 0, color: "#10B981" }, // Emerald
    { name: "Bank Transfer", value: methods.bankTransfer || 0, color: "#3B82F6" }, // Blue
    { name: "Card", value: methods.card || 0, color: "#F59E0B" } // Amber
  ].filter(item => item.value > 0);

  // Bar chart data for cash flow comparison
  const barData = [
    { name: "Total Invoiced", amount: revenue, fill: "#3B82F6" },
    { name: "Paid Collection", amount: revenue - dues, fill: "#10B981" },
    { name: "Outstanding Dues", amount: dues, fill: "#EF4444" }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-gray-800">
      {/* Upper header action bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-gray-900 via-gray-800 to-indigo-900 bg-clip-text text-transparent">
            DreamFit Billing Hub
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            Enterprise Financial Ledger, Invoices & Collections Summary.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={handleRefresh}
            className="flex items-center justify-center p-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 active:scale-95 transition-all text-gray-600 shadow-sm"
            title="Refresh Ledger"
          >
            <RotateCw className={`h-5 w-5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
          <Link 
            to="/admin/billing/invoices"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 active:scale-95 transition-all text-gray-700 font-semibold shadow-sm"
          >
            <FileText className="h-5 w-5 text-gray-500" />
            <span>All Invoices</span>
          </Link>
          <Link 
            to="/admin/orders" 
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 active:scale-95 transition-all text-white font-semibold shadow-md shadow-indigo-100"
          >
            <PlusCircle className="h-5 w-5" />
            <span>New Invoice</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Revenue */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-white p-6 rounded-2xl border border-indigo-100/50 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">Total Sales Value</span>
            <h3 className="text-3xl font-black text-gray-900">₹{revenue.toLocaleString("en-IN")}</h3>
            <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-sm">
              <TrendingUp className="h-4 w-4" />
              <span>Issued Invoices</span>
            </div>
          </div>
          <div className="p-4 bg-indigo-500 rounded-xl text-white shadow-md shadow-indigo-100 group-hover:scale-110 transition-transform">
            <Receipt className="h-7 w-7" />
          </div>
        </div>

        {/* Card 2: Today Collections */}
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-white p-6 rounded-2xl border border-emerald-100/50 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">Today's Collections</span>
            <h3 className="text-3xl font-black text-gray-900">₹{todayCollection.toLocaleString("en-IN")}</h3>
            <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-sm">
              <DollarSign className="h-4 w-4" />
              <span>Real-time Cash/UPI</span>
            </div>
          </div>
          <div className="p-4 bg-emerald-500 rounded-xl text-white shadow-md shadow-emerald-100 group-hover:scale-110 transition-transform">
            <CreditCard className="h-7 w-7" />
          </div>
        </div>

        {/* Card 3: Outstanding Dues */}
        <div className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-white to-white p-6 rounded-2xl border border-rose-100/50 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-500">Outstanding Dues</span>
            <h3 className="text-3xl font-black text-rose-600">₹{dues.toLocaleString("en-IN")}</h3>
            <div className="flex items-center gap-1.5 text-rose-500 font-semibold text-sm">
              <Clock className="h-4 w-4" />
              <span>Pending Delivery Locks</span>
            </div>
          </div>
          <div className="p-4 bg-rose-500 rounded-xl text-white shadow-md shadow-rose-100 group-hover:scale-110 transition-transform">
            <Clock className="h-7 w-7" />
          </div>
        </div>
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Flow Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Sales Invoicing & Ledger Breakdown</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} />
                <Tooltip 
                  formatter={(value) => [`₹${value.toLocaleString("en-IN")}`, "Amount"]}
                  contentStyle={{ background: "#1F2937", border: "none", borderRadius: "12px", color: "#FFF" }}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]} maxBarSize={60}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Channels Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 flex flex-col justify-between">
          <h2 className="text-lg font-bold text-gray-900">Payment Channel Share</h2>
          
          {pieData.length > 0 ? (
            <div className="h-56 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip formatter={(value) => [`₹${value.toLocaleString("en-IN")}`, "Received"]} />
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center space-y-1">
                <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Total Settled</span>
                <p className="text-2xl font-black text-gray-800">₹{totalCollected.toLocaleString("en-IN")}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-56 text-gray-400">
              <CreditCard className="h-12 w-12 stroke-1 mb-2" />
              <span>No collections logged yet</span>
            </div>
          )}

          {/* Legends */}
          <div className="grid grid-cols-2 gap-4 mt-2">
            {[
              { label: "UPI", color: "bg-purple-500", val: methods.upi },
              { label: "Cash", color: "bg-emerald-500", val: methods.cash },
              { label: "Bank", color: "bg-blue-500", val: methods.bankTransfer },
              { label: "Card", color: "bg-amber-500", val: methods.card }
            ].map(leg => (
              <div key={leg.label} className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100">
                <span className={`h-3 w-3 rounded-full ${leg.color}`} />
                <div>
                  <p className="text-xs font-bold text-gray-500">{leg.label}</p>
                  <p className="text-sm font-extrabold text-gray-800">₹{(leg.val || 0).toLocaleString("en-IN")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action links & Quick help */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-950 p-8 rounded-3xl border border-indigo-950 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 text-white relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-indigo-500/10 rounded-full blur-2xl" />
        <div className="space-y-2 relative z-10 text-center md:text-left">
          <h2 className="text-2xl font-bold">Secure Double-Entry Ledger Protection</h2>
          <p className="text-indigo-200/80 text-sm max-w-xl">
            DreamFit Couture Invoicing implements transactional audit logs, strict allowed state machine limits, Paise decimal float-free math scaling, and immediate database rollbacks on payment failure.
          </p>
        </div>
        <Link 
          to="/admin/billing/invoices"
          className="relative z-10 flex items-center justify-center gap-2 bg-white text-indigo-900 px-6 py-4 rounded-2xl hover:bg-gray-100 active:scale-95 transition-all font-bold shadow-lg shadow-indigo-950/30 shrink-0"
        >
          <span>Open Sales Ledger</span>
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
};

export default BillingDashboard;
