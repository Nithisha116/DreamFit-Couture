import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  UserPlus, Users, Edit, Trash2, Search, 
  Mail, Phone, Calendar, CheckCircle, XCircle,
  AlertCircle, UserCog, Power, Eye,
  Scissors, HardHat, Store, Menu, Grid, Filter, X,
  TrendingUp, Activity, UserCheck
} from "lucide-react";
import { fetchAllStaff, updateStaff, deleteStaff, toggleStaffStatus } from "../../../features/user/userSlice";
import { fetchAllTailors, deleteTailor } from "../../../features/tailor/tailorSlice";
import { fetchAllCuttingMasters, deleteCuttingMaster } from "../../../features/cuttingMaster/cuttingMasterSlice";
import { fetchAllStoreKeepers, deleteStoreKeeper } from "../../../features/storeKeeper/storeKeeperSlice";
import showToast from "../../../utils/toast";

// 🚀 Skeleton Loader Components
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-slate-100 p-4 animate-pulse shadow-sm">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-slate-100 rounded-xl"></div>
        <div className="space-y-2">
          <div className="h-4 bg-slate-100 rounded w-24"></div>
          <div className="h-3 bg-slate-100 rounded w-16"></div>
        </div>
      </div>
      <div className="w-16 h-6 bg-slate-100 rounded-full"></div>
    </div>
    <div className="space-y-2 mb-4">
      <div className="h-3 bg-slate-100 rounded w-full"></div>
      <div className="h-3 bg-slate-100 rounded w-2/3"></div>
    </div>
    <div className="flex gap-2 pt-4 border-t border-slate-50">
      <div className="flex-1 h-8 bg-slate-100 rounded-lg"></div>
      <div className="flex-1 h-8 bg-slate-100 rounded-lg"></div>
    </div>
  </div>
);

const SkeletonTableRow = () => (
  <div className="p-6 border-b border-slate-50 animate-pulse">
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl"></div>
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-slate-100 rounded w-40"></div>
          <div className="h-4 bg-slate-100 rounded w-60"></div>
        </div>
      </div>
      <div className="w-24 h-8 bg-slate-100 rounded-full"></div>
      <div className="flex gap-2">
        <div className="w-10 h-10 bg-slate-100 rounded-xl"></div>
        <div className="w-10 h-10 bg-slate-100 rounded-xl"></div>
      </div>
    </div>
  </div>
);

export default function Staff() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { users = [], loading = false } = useSelector((state) => state.user) || {};
  const { tailors = [], loading: tailorsLoading = false } = useSelector((state) => state.tailor) || {};
  const { cuttingMasters = [], loading: cuttingMastersLoading = false } = useSelector((state) => state.cuttingMaster) || {};
  const { storeKeepers = [], loading: storeKeepersLoading = false } = useSelector((state) => state.storeKeeper) || {};

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileView, setMobileView] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteType, setDeleteType] = useState("staff");
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: "", email: "", role: "", phone: "" });
  const [filterRole, setFilterRole] = useState("all");

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    dispatch(fetchAllStaff());
    dispatch(fetchAllTailors());
    dispatch(fetchAllCuttingMasters());
    dispatch(fetchAllStoreKeepers());
  }, [dispatch]);

  const combinedStaff = useMemo(() => {
    const staffList = users.filter(user => user && (user.role === "STORE_KEEPER" || user.role === "CUTTING_MASTER"));
    const tailorList = tailors.map(tailor => ({
      _id: tailor._id, name: tailor.name, email: tailor.email || `${tailor.phone}@tailor.dreamfit.com`,
      phone: tailor.phone, role: "TAILOR", isActive: tailor.isActive, createdAt: tailor.joiningDate || tailor.createdAt,
      updatedAt: tailor.updatedAt, type: "tailor", originalData: tailor
    }));
    const cuttingMasterList = cuttingMasters.map(cm => ({
      _id: cm._id, name: cm.name, email: cm.email, phone: cm.phone, role: "CUTTING_MASTER",
      isActive: cm.isActive, createdAt: cm.joiningDate || cm.createdAt, updatedAt: cm.updatedAt,
      type: "cuttingMaster", originalData: cm
    }));
    const storeKeeperList = storeKeepers.map(sk => ({
      _id: sk._id, name: sk.name, email: sk.email, phone: sk.phone, role: "STORE_KEEPER",
      isActive: sk.isActive, createdAt: sk.joiningDate || sk.createdAt, updatedAt: sk.updatedAt,
      type: "storeKeeper", originalData: sk
    }));
    return [...staffList, ...tailorList, ...cuttingMasterList, ...storeKeeperList];
  }, [users, tailors, cuttingMasters, storeKeepers]);

  const filteredUsers = useMemo(() => {
    return combinedStaff.filter(user => {
      if (filterRole !== "all" && user.role !== filterRole) return false;
      const matchesSearch = !debouncedSearchTerm || 
        user.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        (user.phone && user.phone.includes(debouncedSearchTerm));
      return matchesSearch;
    });
  }, [combinedStaff, debouncedSearchTerm, filterRole]);

  const stats = useMemo(() => {
    const total = combinedStaff.length;
    const active = combinedStaff.filter(u => u.isActive).length;
    const tailorsCount = combinedStaff.filter(u => u.role === "TAILOR").length;
    const othersCount = total - tailorsCount;
    return { total, active, tailorsCount, othersCount };
  }, [combinedStaff]);

  const isLoading = loading || tailorsLoading || cuttingMastersLoading || storeKeepersLoading;
  const isInitialLoading = isLoading && combinedStaff.length === 0;

  const handleAddStaff = () => navigate("/admin/add-staff");
  const handleAddTailor = () => navigate("/admin/tailors/add");
  const handleAddCuttingMaster = () => navigate("/admin/cutting-masters/add");
  const handleAddStoreKeeper = () => navigate("/admin/store-keepers/add");

  const handleViewDetails = (item) => {
    const paths = { tailor: "tailors", cuttingMaster: "cutting-masters", storeKeeper: "store-keepers" };
    navigate(`/admin/${paths[item.type] || "staff"}/${item._id}`);
  };

  const handleEdit = (item) => {
    const paths = { tailor: "tailors", cuttingMaster: "cutting-masters", storeKeeper: "store-keepers" };
    if (item.type) return navigate(`/admin/${paths[item.type]}/edit/${item._id}`);
    setSelectedUser(item);
    setEditFormData({ name: item.name || "", email: item.email || "", role: item.role || "STORE_KEEPER", phone: item.phone || "" });
    setIsEditing(true);
  };

  const handleToggleStatus = async (item) => {
    if (item.type) return showToast.info(`${item.role.replace('_', ' ')} status managed in details page`);
    try {
      await dispatch(toggleStaffStatus(item._id)).unwrap();
      showToast.success(`Staff ${item.isActive ? 'deactivated' : 'activated'} successfully!`);
    } catch (error) { showToast.error("Failed to toggle status"); }
  };

  const handleDelete = async () => {
    try {
      const actions = { tailor: deleteTailor, cuttingMaster: deleteCuttingMaster, storeKeeper: deleteStoreKeeper };
      const action = actions[deleteType] || deleteStaff;
      await dispatch(action(selectedUser._id)).unwrap();
      showToast.success(`${deleteType.replace('_', ' ')} deleted successfully! 🗑️`);
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (error) { showToast.error(error || "Failed to delete"); }
  };

  const getRoleBadge = (role, type) => {
    const config = {
      TAILOR: "bg-blue-50 text-blue-600 border-blue-100",
      CUTTING_MASTER: "bg-orange-50 text-orange-600 border-orange-100",
      STORE_KEEPER: "bg-emerald-50 text-emerald-600 border-emerald-100",
      ADMIN: "bg-purple-50 text-purple-600 border-purple-100",
    };
    return `px-3 py-1 rounded-full text-[11px] font-bold border ${config[role] || "bg-slate-50 text-slate-600 border-slate-100"}`;
  };

  const getRoleIcon = (role) => {
    const icons = { TAILOR: <Scissors size={18} />, CUTTING_MASTER: <HardHat size={18} />, STORE_KEEPER: <Store size={18} />, ADMIN: <UserCog size={18} /> };
    return icons[role] || <Users size={18} />;
  };

  const getAvatarGradient = (role) => {
    const gradients = {
      TAILOR: "from-blue-500 to-indigo-600",
      CUTTING_MASTER: "from-orange-400 to-red-500",
      STORE_KEEPER: "from-emerald-400 to-teal-600",
      ADMIN: "from-purple-500 to-pink-600"
    };
    return gradients[role] || "from-slate-400 to-slate-600";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* ===== MOBILE HEADER ===== */}
      <div className="lg:hidden bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-3.5">
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <Users size={18} />
            </div>
            TEAM
          </h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)} className="p-2.5 bg-slate-50 text-slate-600 rounded-xl border border-slate-100 shadow-sm"><Filter size={18} /></button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2.5 bg-slate-50 text-slate-600 rounded-xl border border-slate-100 shadow-sm"><Menu size={18} /></button>
          </div>
        </div>
        <div className="px-4 pb-3">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input type="text" placeholder="Search staff members..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 outline-none transition-all" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-10">
        {/* ===== DESKTOP HEADER ===== */}
        <div className="hidden lg:block mb-10">
          <div className="flex items-center justify-between gap-8 mb-10">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                  <UserCog size={32} />
                </div>
                TEAM HUB
              </h1>
              <p className="text-slate-500 font-medium mt-3 text-lg">Central directory for all DreamFit staff and production masters</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input type="text" placeholder="Search by name, email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm font-medium" />
              </div>
              <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}
                className="px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm font-bold text-slate-700">
                <option value="all">All Roles</option>
                <option value="STORE_KEEPER">Store Keepers</option>
                <option value="CUTTING_MASTER">Cutting Masters</option>
                <option value="TAILOR">Tailors</option>
              </select>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            {[
              { label: "Total Strength", value: stats.total, icon: Users, color: "blue", trend: "+2 this month" },
              { label: "Active Now", value: stats.active, icon: Activity, color: "emerald", trend: "High engagement" },
              { label: "Tailor Unit", value: stats.tailorsCount, icon: Scissors, color: "indigo", trend: "Core production" },
              { label: "Operations", value: stats.othersCount, icon: TrendingUp, color: "orange", trend: "Masters & Support" }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-start justify-between hover:shadow-md transition-shadow">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-4xl font-black text-slate-900">{stat.value}</p>
                  <div className={`text-[10px] font-bold text-${stat.color}-600 flex items-center gap-1`}>
                    <TrendingUp size={12} /> {stat.trend}
                  </div>
                </div>
                <div className={`w-14 h-14 bg-${stat.color}-50 rounded-2xl flex items-center justify-center text-${stat.color}-600`}>
                  <stat.icon size={28} />
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-4 mb-8">
            <button onClick={handleAddStaff} className="group relative px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm tracking-widest uppercase overflow-hidden shadow-xl shadow-slate-900/10 transition-all active:scale-95">
              <span className="relative z-10 flex items-center gap-2"><UserPlus size={18} /> Add General Staff</span>
              <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
            {[
              { label: "Add Tailor", action: handleAddTailor, icon: Scissors, color: "indigo" },
              { label: "Add Cutting Master", action: handleAddCuttingMaster, icon: HardHat, color: "orange" },
              { label: "Add Store Keeper", action: handleAddStoreKeeper, icon: Store, color: "emerald" }
            ].map((btn, i) => (
              <button key={i} onClick={btn.action} className={`px-6 py-4 bg-${btn.color}-600 text-white rounded-2xl font-black text-sm tracking-widest uppercase flex items-center gap-2 hover:brightness-110 shadow-lg shadow-${btn.color}-500/20 transition-all active:scale-95`}>
                <btn.icon size={18} /> {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* ===== CONTENT AREA ===== */}
        <div className="bg-white rounded-[2rem] lg:rounded-[3rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden min-h-[500px]">
          <div className="px-6 py-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-slate-100">
                <UserCheck size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Directory</h2>
                <p className="text-slate-500 text-sm font-bold">{filteredUsers.length} MEMBERS FOUND</p>
              </div>
            </div>
          </div>

          {isInitialLoading ? (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="hidden lg:table-header-group">
                  <tr className="border-b border-slate-50 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="px-8 py-5">Team Member</th>
                    <th className="px-8 py-5">Role & Status</th>
                    <th className="px-8 py-5">Contact Details</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredUsers.map((item) => (
                    <tr key={item._id} className="group hover:bg-slate-50/50 transition-all">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-5">
                          <div onClick={() => handleViewDetails(item)} 
                            className={`w-16 h-16 rounded-[1.25rem] bg-gradient-to-br ${getAvatarGradient(item.role)} flex items-center justify-center text-white shadow-lg cursor-pointer transform group-hover:scale-105 transition-all`}>
                            {getRoleIcon(item.role)}
                          </div>
                          <div className="space-y-1">
                            <h3 onClick={() => handleViewDetails(item)} className="text-xl font-black text-slate-900 cursor-pointer hover:text-blue-600 transition-colors">{item.name}</h3>
                            <p className="text-sm font-medium text-slate-400 flex items-center gap-2">
                              <Calendar size={14} /> Joined {formatDate(item.createdAt)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-2">
                          <span className={getRoleBadge(item.role)}>{item.role.replace('_', ' ')}</span>
                          {item.isActive ? (
                            <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded-full"><CheckCircle size={12} /> ACTIVE</span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-[10px] font-black text-red-600 bg-red-50 w-fit px-2 py-0.5 rounded-full"><XCircle size={12} /> INACTIVE</span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-2">
                          <p className="text-sm font-bold text-slate-700 flex items-center gap-2"><Mail size={16} className="text-slate-300" /> {item.email}</p>
                          <p className="text-sm font-bold text-slate-700 flex items-center gap-2"><Phone size={16} className="text-slate-300" /> {item.phone || "No contact"}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleViewDetails(item)} className="p-3 bg-white border border-slate-100 text-slate-600 hover:text-blue-600 hover:border-blue-100 hover:bg-blue-50 rounded-xl transition-all shadow-sm"><Eye size={20} /></button>
                          <button onClick={() => handleToggleStatus(item)} className={`p-3 rounded-xl transition-all shadow-sm border ${item.isActive ? 'bg-white border-slate-100 text-slate-600 hover:text-orange-600 hover:border-orange-100 hover:bg-orange-50' : 'bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600'}`}><Power size={20} /></button>
                          <button onClick={() => handleEdit(item)} className="p-3 bg-white border border-slate-100 text-slate-600 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50 rounded-xl transition-all shadow-sm"><Edit size={20} /></button>
                          <button onClick={() => { setSelectedUser(item); setDeleteType(item.type || "staff"); setShowDeleteModal(true); }} className="p-3 bg-white border border-slate-100 text-slate-600 hover:text-red-600 hover:border-red-100 hover:bg-red-50 rounded-xl transition-all shadow-sm"><Trash2 size={20} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-32 text-center">
              <div className="w-32 h-32 bg-slate-50 rounded-[3rem] flex items-center justify-center mx-auto mb-8 border border-slate-100">
                <Users size={64} className="text-slate-200" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4">No Members Found</h3>
              <p className="text-slate-400 font-medium max-w-sm mx-auto mb-10">We couldn't find any team members matching your filters. Try adjusting your search or add someone new.</p>
              <button onClick={handleAddStaff} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-blue-500/20 hover:scale-105 transition-transform active:scale-95">Add Staff Member</button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 transform animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-6">
              <Trash2 size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 text-center mb-2 uppercase tracking-tighter">Confirm Deletion</h2>
            <p className="text-slate-500 text-center mb-8 font-medium">Are you sure you want to remove <span className="text-slate-900 font-black">{selectedUser?.name}</span>? This action is permanent.</p>
            <div className="flex gap-4">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-700 shadow-lg shadow-red-500/20 transition-all">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}