import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ChevronLeft, Plus, Ruler, Trash2, Edit } from "lucide-react";
import { fetchCustomerProfiles, deleteCustomerProfile } from "../../../features/customerSize/customerSizeSlice";
import { fetchCustomerById } from "../../../features/customer/customerSlice";
import CustomerSizeModal from "../../../components/customer-size/CustomerSizeModal";
import showToast from "../../../utils/toast";

export default function CustomerSizePage() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { profiles, isLoading } = useSelector((state) => state.customerSize);
  const { currentCustomer } = useSelector((state) => state.customer);
  const { user } = useSelector((state) => state.auth);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);

  const rolePath = user?.role === "ADMIN" ? "/admin" : 
                   user?.role === "STORE_KEEPER" ? "/storekeeper" : 
                   "/cuttingmaster";

  useEffect(() => {
    if (customerId) {
      dispatch(fetchCustomerById(customerId));
      dispatch(fetchCustomerProfiles(customerId));
    }
  }, [customerId, dispatch]);

  const handleBack = () => {
    navigate(`${rolePath}/customers/${customerId}`);
  };

  const handleCreateNew = () => {
    setSelectedProfile(null);
    setIsModalOpen(true);
  };

  const handleEdit = (profile) => {
    setSelectedProfile(profile);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this profile?")) {
      try {
        await dispatch(deleteCustomerProfile(id)).unwrap();
        showToast.success("Profile deleted successfully");
      } catch (error) {
        showToast.error(error.message || "Failed to delete profile");
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('en-GB', { 
      day: '2-digit', month: 'short', year: 'numeric' 
    });
  };

  if (isLoading && !currentCustomer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-slate-500 hover:text-blue-600 mb-2 transition-colors font-bold text-sm"
            >
              <ChevronLeft size={16} /> Back to Customer Details
            </button>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center gap-3">
              <Ruler className="text-purple-600" size={32} />
              Measurement Profiles
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              For: {currentCustomer?.salutation} {currentCustomer?.firstName} {currentCustomer?.lastName}
            </p>
          </div>

          <button
            onClick={handleCreateNew}
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-purple-500/30 transition-all hover:scale-105"
          >
            <Plus size={18} /> New Profile
          </button>
        </div>

        {/* Profiles Grid */}
        {isLoading && profiles.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-slate-200">
            <Ruler size={48} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-black text-slate-700 mb-2">No Profiles Found</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              This customer doesn't have any measurement profiles saved yet. Create their first profile to easily auto-fill sizes on their next order.
            </p>
            <button
              onClick={handleCreateNew}
              className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-6 py-2.5 rounded-xl font-bold transition-colors"
            >
              Create New Profile
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {profiles.map((profile) => (
              <div key={profile._id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all">
                
                <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100 flex justify-between items-center">
                  <div className="min-w-0">
                    <h3 className="font-black text-slate-800 text-lg truncate">{profile.profileName}</h3>
                    <p className="text-xs font-bold text-purple-600 uppercase tracking-wider">{profile.garmentType}</p>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button onClick={() => handleEdit(profile)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(profile._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="p-4 sm:p-5">
                  <div className="grid grid-cols-2 gap-3">
                    {profile.measurements && profile.measurements.map((m, idx) => (
                      <div key={idx} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase mb-0.5 truncate" title={m.fieldName}>
                          {m.fieldDisplayName || m.fieldName}
                        </p>
                        <p className="font-black text-slate-700">
                          {m.value} <span className="text-xs font-medium text-slate-400 font-mono">{m.unit}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  {profile.notes && (
                    <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
                      <p className="text-xs text-amber-800 italic">"{profile.notes}"</p>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-xs text-slate-400">
                    <span>Updated: {formatDate(profile.updatedAt)}</span>
                    <span>Used: {profile.usageCount || 0} times</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      <CustomerSizeModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        profileToEdit={selectedProfile}
        customerId={customerId}
      />
    </div>
  );
}
