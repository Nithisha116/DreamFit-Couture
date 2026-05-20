import React from "react";
import { X, Printer, Download, Mail, Building2, User, Calendar, MapPin, Phone, Wallet } from "lucide-react";
import API from "../../app/axios";

export default function SalarySlipModal({ salary, onClose }) {
  const [liveData, setLiveData] = React.useState(null);
  const [fetching, setFetching] = React.useState(false);

  React.useEffect(() => {
    if (salary?.employeeId) {
      fetchEmployeeDetails();
    }
  }, [salary]);

  const fetchEmployeeDetails = async () => {
    setFetching(true);
    try {
      // ✅ Fetch real-time recalculated data from backend
      const response = await API.get(`/salary/live/${salary._id}`);
      setLiveData(response.data);
    } catch (error) {
      console.error("Error fetching live salary data:", error);
    } finally {
      setFetching(false);
    }
  };

  if (!salary) return null;

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrint = () => {
    window.print();
  };

  const displayData = liveData || salary;
  const totalDeductions = Object.values(displayData.components.deductions).reduce((a, b) => a + b, 0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:shadow-none print:max-h-full print:rounded-none">
        
        {/* ===== MODAL HEADER (HIDDEN ON PRINT) ===== */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10 print:hidden">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">SALARY SLIP</h2>
          <div className="flex items-center gap-3">
            <button 
              onClick={handlePrint}
              className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-all active:scale-95"
            >
              <Printer size={20} />
            </button>
            <button 
              onClick={onClose}
              className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all active:scale-95"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ===== SLIP CONTENT ===== */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 print:p-0 print:overflow-visible">
          <div id="salary-slip" className="bg-white border border-slate-200 rounded-3xl p-8 lg:p-12 shadow-sm print:border-none print:shadow-none print:p-0">
            
            {/* Slip Header */}
            <div className="flex flex-col md:flex-row justify-between gap-8 mb-12 border-b border-slate-100 pb-12">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                    <Building2 size={24} />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tighter">DREAMFIT COUTURE</h3>
                </div>
                <div className="space-y-1 text-slate-500 font-medium text-sm">
                  <p className="flex items-center gap-2"><MapPin size={14} /> 123 Fashion Street, Creative District</p>
                  <p className="flex items-center gap-2"><Phone size={14} /> +91 98765 43210</p>
                </div>
              </div>

              <div className="md:text-right space-y-2">
                <div className="inline-block px-4 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500">
                  PAY SLIP: {months[salary.month-1].toUpperCase()} {salary.year}
                </div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Generated on {new Date(salary.createdAt).toLocaleDateString()}</p>
                <p className="text-slate-900 text-sm font-black uppercase">Ref: DF/PAY/{salary.year}/{String(salary.month).padStart(2, '0')}/{salary.employeeId}</p>
              </div>
            </div>

            {/* Employee Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Employee Name</p>
                <p className="text-sm font-black text-slate-900">{displayData.employeeName}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Employee ID</p>
                <p className="text-sm font-black text-slate-900">{displayData.employeeId}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Department</p>
                <p className="text-sm font-black text-slate-900">{displayData.department}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Payable Days</p>
                <p className="text-sm font-black text-slate-900">{displayData.payableDays} / 26</p>
              </div>
            </div>

            {/* Attendance Summary */}
            <div className="bg-slate-50 rounded-2xl p-6 mb-12 flex flex-wrap justify-between gap-4 border border-slate-100">
              <div className="text-center px-4">
                <p className="text-xs font-bold text-slate-500 mb-1">Present</p>
                <p className="text-lg font-black text-emerald-600">{displayData.totalPresent}</p>
              </div>
              <div className="text-center px-4">
                <p className="text-xs font-bold text-slate-500 mb-1">Absent</p>
                <p className="text-lg font-black text-red-500">{displayData.totalAbsent}</p>
              </div>
              <div className="text-center px-4">
                <p className="text-xs font-bold text-slate-500 mb-1">Leave</p>
                <p className="text-lg font-black text-blue-600">{displayData.totalLeave}</p>
              </div>
              <div className="text-center px-4">
                <p className="text-xs font-bold text-slate-500 mb-1">Half Day</p>
                <p className="text-lg font-black text-orange-500">{displayData.totalHalfDay}</p>
              </div>
              <div className="text-center px-4 border-l border-slate-200">
                <p className="text-xs font-bold text-slate-500 mb-1">Work Hours</p>
                <p className="text-lg font-black text-slate-900">{displayData.totalHoursWorked || (displayData.totalPresent * 8 + displayData.totalHalfDay * 4)} Hrs</p>
              </div>
              <div className="text-center px-4 border-l border-slate-200">
                <p className="text-xs font-bold text-slate-500 mb-1">Overtime</p>
                <p className="text-lg font-black text-slate-900">{displayData.overtimeHours} Hrs</p>
              </div>
            </div>

            {/* Earnings & Deductions Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
              {/* Earnings */}
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2 flex justify-between">
                  Earnings <span>Amount</span>
                </h4>
                <div className="space-y-3 font-medium text-sm">
                  <div className="flex justify-between text-slate-600">
                    <div>
                      <span>Earned Basic Pay</span>
                      <p className="text-[10px] text-slate-400 font-bold">({displayData.payableDays} Days @ ₹{Math.round(displayData.perDaySalary)}/day)</p>
                    </div>
                    <span className="text-slate-900 font-bold">
                      ₹{(displayData.earnedRegularPay || (displayData.payableDays * displayData.perDaySalary)).toLocaleString()}
                      {fetching && <span className="ml-2 animate-pulse text-[10px] text-slate-400">Syncing...</span>}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Overtime Pay ({displayData.overtimeHours} hrs)</span>
                    <span className="text-emerald-600 font-bold">+₹{displayData.components.overtimePay.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Bonuses / Incentives</span>
                    <span className="text-emerald-600 font-bold">+₹{displayData.components.bonuses.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-slate-50 my-2"></div>
                  <div className="flex justify-between text-slate-900 font-black">
                    <span>Gross Salary</span>
                    <span>₹{displayData.grossSalary.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div>
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2 flex justify-between">
                  Deductions <span>Amount</span>
                </h4>
                <div className="space-y-3 font-medium text-sm">
                  <div className="flex justify-between text-slate-600 italic opacity-60">
                    <span>Loss of Pay ({displayData.totalAbsent} Days)</span>
                    <span className="text-slate-400 font-medium">₹{displayData.components.deductions.absentDeduction.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 italic opacity-60">
                    <span>Half Day Loss ({displayData.totalHalfDay} count)</span>
                    <span className="text-slate-400 font-medium">₹{displayData.components.deductions.halfDayDeduction.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Late Penalty</span>
                    <span className="text-red-500 font-bold">-₹{displayData.components.deductions.latePenalty.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Tax (TDS)</span>
                    <span className="text-red-500 font-bold">-₹{displayData.components.deductions.tax.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-slate-50 my-2"></div>
                  <div className="flex justify-between text-slate-900 font-black">
                    <span>Other Deductions</span>
                    <span>₹{(displayData.components.deductions.latePenalty + displayData.components.deductions.tax).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Footer */}
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-slate-900/20">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Net Payable Salary</p>
                <p className="text-3xl font-black">₹{displayData.netSalary.toLocaleString()}</p>
                <p className="text-[10px] font-medium text-slate-400 mt-1">Amount in words: Rupees {displayData.netSalary.toLocaleString()} Only</p>
              </div>
              <div className="text-right space-y-4">
                <div className="border-t border-slate-700 pt-4 px-8">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8">Authorized Signature</p>
                  <div className="h-0.5 w-32 bg-slate-700 ml-auto"></div>
                </div>
              </div>
            </div>

            {/* Computer Generated Disclaimer */}
            <p className="mt-8 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">This is a computer generated pay slip and does not require a physical signature.</p>

          </div>
        </div>
      </div>
    </div>
  );
}
