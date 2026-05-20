import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  User, Mail, Lock, Phone, Briefcase, X, Save,
  AlertCircle, ChevronRight, ChevronLeft, UserCog, ArrowRight, Menu,
  Scissors, Store, HardHat, Sparkles
} from "lucide-react";
import { createStaff } from "../../../features/user/userSlice";
import showToast from "../../../utils/toast";

export default function AddStaff() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.user || {});

  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "STORE_KEEPER", phone: "" });
  const [errors, setErrors] = useState({});
  const [selectedRole, setSelectedRole] = useState("STORE_KEEPER");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return showToast.error("Name and Email are required");

    const redirectionPaths = {
      TAILOR: "/admin/tailors/add",
      CUTTING_MASTER: "/admin/cutting-masters/add",
      STORE_KEEPER: "/admin/store-keepers/add"
    };

    showToast.info(`Redirecting to ${selectedRole.replace('_', ' ')} setup...`);
    setTimeout(() => {
      navigate(redirectionPaths[selectedRole], { 
        state: { name: formData.name, email: formData.email, phone: formData.phone, fromStaff: true }
      });
    }, 800);
  };

  const roleOptions = [
    { value: "STORE_KEEPER", label: "Store Keeper", icon: <Store size={24} />, description: "Inventory & Operations", color: "emerald", gradient: "from-emerald-500 to-teal-600" },
    { value: "CUTTING_MASTER", label: "Cutting Master", icon: <HardHat size={24} />, description: "Cutting Operations", color: "orange", gradient: "from-orange-400 to-red-500" },
    { value: "TAILOR", label: "Tailor", icon: <Scissors size={24} />, description: "Sewing & Production", color: "indigo", gradient: "from-blue-500 to-indigo-600" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-4xl mx-auto px-4 py-8 lg:py-12">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-10 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/admin/staff")} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
              <ChevronLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Onboard Member</h1>
              <p className="text-slate-500 font-bold text-sm">SET UP A NEW TEAM MEMBER PROFILE</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black tracking-widest">
            <Sparkles size={14} /> STEP 1 OF 2
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Role Selection */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Select Designation</h2>
            {roleOptions.map((role) => (
              <div key={role.value} onClick={() => { setSelectedRole(role.value); setFormData(p => ({ ...p, role: role.value })); }}
                className={`relative p-5 rounded-[2rem] cursor-pointer transition-all border-2 ${selectedRole === role.value ? `bg-white border-${role.color}-500 shadow-xl shadow-${role.color}-500/10 scale-[1.02]` : 'bg-white border-transparent hover:border-slate-200'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${role.gradient} flex items-center justify-center text-white shadow-lg`}>
                    {role.icon}
                  </div>
                  <div>
                    <h3 className={`font-black text-lg leading-tight ${selectedRole === role.value ? 'text-slate-900' : 'text-slate-600'}`}>{role.label}</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-tight">{role.description}</p>
                  </div>
                </div>
                {selectedRole === role.value && <div className={`absolute -right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-${role.color}-500 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white`}><ArrowRight size={14} /></div>}
              </div>
            ))}
          </div>

          {/* Right Column: Base Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
              <div className="p-8 lg:p-10">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 gap-8">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <User size={14} /> Full Legal Name
                      </label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Rahul Sharma" required
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold text-slate-700 text-lg placeholder:text-slate-300" />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Mail size={14} /> Email Address
                      </label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="e.g. rahul@dreamfit.com" required
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold text-slate-700 text-lg placeholder:text-slate-300" />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Phone size={14} /> Phone Number
                      </label>
                      <input type="tel" name="phone" value={formData.phone} maxLength="10" onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))} placeholder="10-digit mobile number"
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 outline-none transition-all font-bold text-slate-700 text-lg placeholder:text-slate-300" />
                    </div>
                  </div>

                  <div className="pt-6">
                    <button type="submit" disabled={loading}
                      className={`w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 flex items-center justify-center gap-3 group transition-all active:scale-[0.98] ${loading ? 'opacity-50' : 'hover:bg-blue-600 hover:-translate-y-1'}`}>
                      {loading ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : (
                        <>
                          NEXT: {selectedRole.replace('_', ' ')} DETAILS
                          <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                        </>
                      )}
                    </button>
                    <p className="text-center text-slate-400 font-bold text-[10px] mt-6 tracking-widest uppercase">YOU WILL COMPLETE THE FULL PROFILE IN THE NEXT STEP</p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}