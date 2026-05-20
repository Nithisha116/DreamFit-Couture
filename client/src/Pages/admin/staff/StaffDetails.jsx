import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  User, Mail, Phone, Calendar, MapPin, 
  ChevronLeft, Edit, Power, AlertCircle,
  Shield, Clock, CheckCircle, XCircle, Scissors, Star,
  HardHat, Store, Briefcase, Sparkles, Activity, Wallet
} from "lucide-react";
import { fetchTailorById } from "../../../features/tailor/tailorSlice";
import { fetchCuttingMasterById } from "../../../features/cuttingMaster/cuttingMasterSlice";
import { fetchStoreKeeperById } from "../../../features/storeKeeper/storeKeeperSlice";
import showToast from "../../../utils/toast";
import API from "../../../app/axios";

export default function StaffDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userType, setUserType] = useState("staff");

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      // Try staff first
      try {
        const response = await API.get(`/users/${id}`);
        if (response.data) { setStaff(response.data); setUserType("staff"); setLoading(false); return; }
      } catch (e) {}

      // Try other models
      const results = await Promise.allSettled([
        dispatch(fetchTailorById(id)).unwrap(),
        dispatch(fetchCuttingMasterById(id)).unwrap(),
        dispatch(fetchStoreKeeperById(id)).unwrap()
      ]);

      const found = results.find(r => r.status === "fulfilled" && (r.value.tailor || r.value.cuttingMaster || r.value.storeKeeper));
      if (found) {
        const val = found.value;
        if (val.tailor) { setStaff(val.tailor); setUserType("tailor"); }
        else if (val.cuttingMaster) { setStaff(val.cuttingMaster); setUserType("cuttingMaster"); }
        else if (val.storeKeeper) { setStaff(val.storeKeeper); setUserType("storeKeeper"); }
        setLoading(false);
        return;
      }
      setError("Member not found");
    } catch (err) { setError("Failed to load profile"); } finally { setLoading(false); }
  };

  const handleToggleStatus = async () => {
    if (userType !== "staff") return showToast.info("Manage status in production master settings");
    try {
      await API.put(`/users/${id}/toggle-status`);
      setStaff(prev => ({ ...prev, isActive: !prev.isActive }));
      showToast.success(`Account ${staff.isActive ? 'deactivated' : 'activated'}!`);
    } catch (error) { showToast.error("Failed to update status"); }
  };

  const getRoleBadge = (role) => {
    const configs = {
      ADMIN: "bg-purple-100 text-purple-700 border-purple-200",
      TAILOR: "bg-blue-100 text-blue-700 border-blue-200",
      CUTTING_MASTER: "bg-orange-100 text-orange-700 border-orange-200",
      STORE_KEEPER: "bg-emerald-100 text-emerald-700 border-emerald-200"
    };
    return `px-4 py-1.5 rounded-full text-xs font-black border uppercase tracking-widest ${configs[role] || "bg-slate-100 text-slate-700 border-slate-200"}`;
  };

  const getHeaderGradient = () => {
    const role = staff?.role || userType.toUpperCase();
    const gradients = {
      ADMIN: "from-purple-600 to-indigo-700",
      TAILOR: "from-blue-600 to-indigo-700",
      CUTTING_MASTER: "from-orange-500 to-red-600",
      STORE_KEEPER: "from-emerald-600 to-teal-700"
    };
    return gradients[role] || "from-slate-700 to-slate-900";
  };

  const getRoleIcon = () => {
    const role = staff?.role || userType.toUpperCase();
    const icons = { ADMIN: <UserCog size={40} />, TAILOR: <Scissors size={40} />, CUTTING_MASTER: <HardHat size={40} />, STORE_KEEPER: <Store size={40} /> };
    return icons[role] || <User size={40} />;
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center animate-pulse">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-2xl animate-spin mb-4 mx-auto shadow-xl shadow-blue-500/10"></div>
        <p className="text-slate-400 font-black tracking-widest uppercase text-xs">Authenticating Profile...</p>
      </div>
    </div>
  );

  if (error || !staff) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="bg-white rounded-[3rem] p-12 max-w-lg w-full text-center shadow-2xl border border-slate-100">
        <div className="w-24 h-24 bg-red-50 text-red-400 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8"><AlertCircle size={48} /></div>
        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter uppercase">Member Not Found</h2>
        <p className="text-slate-500 font-medium mb-10 leading-relaxed">The profile you are looking for might have been removed or moved to a different sector.</p>
        <button onClick={() => navigate("/admin/staff")} className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 active:scale-95">Back to Directory</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-10">
          <button onClick={() => navigate("/admin/staff")} className="flex items-center gap-3 text-slate-400 hover:text-blue-600 transition-all font-black uppercase tracking-widest text-xs group">
            <div className="w-10 h-10 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center group-hover:-translate-x-1 transition-transform"><ChevronLeft size={20} /></div>
            Back to Team
          </button>
          
          <div className="flex items-center gap-3">
            {userType === "staff" && (
              <button onClick={handleToggleStatus} className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 ${staff.isActive ? 'bg-white border border-slate-100 text-orange-600 hover:bg-orange-50' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20'}`}>
                {staff.isActive ? 'DEACTIVATE' : 'ACTIVATE ACCOUNT'}
              </button>
            )}
            <button onClick={() => navigate(`/admin/${userType === 'staff' ? 'staff' : userType + 's'}/edit/${id}`)} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-2">
              <Edit size={16} /> EDIT PROFILE
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Hero Profile Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden text-center p-10 relative">
              <div className={`absolute top-0 left-0 w-full h-32 bg-gradient-to-br ${getHeaderGradient()} opacity-10`}></div>
              <div className="relative pt-10">
                <div className={`w-32 h-32 rounded-[2.5rem] bg-gradient-to-br ${getHeaderGradient()} flex items-center justify-center text-white mx-auto shadow-2xl mb-8 relative`}>
                  {getRoleIcon()}
                  <div className={`absolute -bottom-2 -right-2 w-10 h-10 border-4 border-white rounded-full flex items-center justify-center ${staff.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                    <Activity size={18} className="text-white" />
                  </div>
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-2">{staff.name}</h1>
                <div className="flex flex-col items-center gap-4">
                  <span className={getRoleBadge(staff.role || userType.toUpperCase())}>{userType === 'staff' ? staff.role : userType}</span>
                  <div className="w-full h-px bg-slate-50"></div>
                  <div className="space-y-4 w-full">
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-500 shadow-sm"><Mail size={18} /></div>
                      <div className="text-left overflow-hidden">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Identity</p>
                        <p className="text-sm font-bold text-slate-700 truncate">{staff.email || "No Verified Email"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm"><Phone size={18} /></div>
                      <div className="text-left">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Direct Line</p>
                        <p className="text-sm font-bold text-slate-700">{staff.phone || "No Phone Registered"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance/Quick Stats */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-900/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black uppercase tracking-widest text-xs flex items-center gap-2"><Sparkles size={16} className="text-blue-400" /> Member Status</h3>
                <span className="text-[10px] bg-white/10 px-2 py-1 rounded-full font-bold">SECURE</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-3xl border border-white/10">
                  <p className="text-[10px] font-bold text-white/50 uppercase mb-1">Joined In</p>
                  <p className="text-lg font-black">{new Date(staff.createdAt).getFullYear()}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-3xl border border-white/10">
                  <p className="text-[10px] font-bold text-white/50 uppercase mb-1">XP Level</p>
                  <p className="text-lg font-black">{staff.experience || 0} Years</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Information */}
          <div className="lg:col-span-8 space-y-8">
            {/* General Info Card */}
            <div className="bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
              <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/20">
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                  <Shield size={24} className="text-blue-600" />
                  Professional Profile
                </h2>
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm"><Briefcase size={20} /></div>
              </div>
              <div className="p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                  {[
                    { label: "Internal Identifier", value: staff.tailorId || staff.cuttingMasterId || staff.storeKeeperId || staff._id?.slice(-8), icon: <Shield className="text-blue-500" /> },
                    { label: "Basic Salary", value: `₹${(staff.basicSalary || 0).toLocaleString()}`, icon: <Wallet className="text-blue-600" /> },
                    { label: "Onboarding Date", value: new Date(staff.joiningDate || staff.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }), icon: <Calendar className="text-emerald-500" /> },
                    { label: "Current Status", value: staff.isActive ? 'Active Member' : 'Deactivated', icon: <Activity className={staff.isActive ? 'text-emerald-500' : 'text-red-500'} />, color: staff.isActive ? 'text-emerald-600' : 'text-red-600' },
                    { label: "Last Verified", value: new Date(staff.updatedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' Today', icon: <Clock className="text-purple-500" /> }
                  ].map((info, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center flex-shrink-0 border border-slate-100 shadow-sm">{info.icon}</div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{info.label}</p>
                        <p className={`text-lg font-black ${info.color || 'text-slate-900'} tracking-tight uppercase`}>{info.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Role Specific: Specialization */}
                {userType === "tailor" && staff.specialization?.length > 0 && (
                  <div className="mt-12 p-8 bg-blue-50/50 rounded-[2rem] border border-blue-100">
                    <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Scissors size={18} /> Master Specializations
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {staff.specialization.map((spec, i) => (
                        <span key={i} className="px-5 py-2 bg-white border border-blue-100 text-blue-700 rounded-2xl text-sm font-black uppercase tracking-tight shadow-sm">{spec}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Address & Extra Card */}
            {(staff.address || staff.notes) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {staff.address && (
                  <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><MapPin size={18} className="text-red-500" /> Registered Location</h3>
                    <div className="space-y-2">
                      <p className="text-lg font-black text-slate-900 uppercase tracking-tight">{staff.address.street || "STREET UNKNOWN"}</p>
                      <p className="text-slate-500 font-bold">{[staff.address.city, staff.address.state, staff.address.pincode].filter(Boolean).join(', ') || "LOCATION NOT PINNED"}</p>
                    </div>
                  </div>
                )}
                {staff.notes && (
                  <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><AlertCircle size={80} /></div>
                    <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2 relative z-10 opacity-60">Administrative Notes</h3>
                    <p className="text-lg font-black leading-snug relative z-10 italic">"{staff.notes}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}