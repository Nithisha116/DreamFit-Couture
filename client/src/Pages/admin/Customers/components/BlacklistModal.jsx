import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { blacklistCustomer, unblacklistCustomer } from "../../../../features/customer/customerSlice";
import showToast from "../../../../utils/toast";
import { X, AlertTriangle, CheckCircle } from "lucide-react";

const BlacklistModal = ({ isOpen, onClose, customer }) => {
  const dispatch = useDispatch();
  
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !customer) return null;

  const isAlreadyBlacklisted = customer.isBlacklisted;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAlreadyBlacklisted && !reason.trim()) {
      showToast.error("Reason is required to blacklist a customer.");
      return;
    }

    setLoading(true);

    try {
      if (isAlreadyBlacklisted) {
        await dispatch(unblacklistCustomer(customer._id)).unwrap();
        showToast.success("Customer removed from blacklist");
      } else {
        await dispatch(blacklistCustomer({ 
          id: customer._id, 
          data: { reason, notes } 
        })).unwrap();
        showToast.success("Customer successfully blacklisted");
      }
      onClose();
      setReason("");
      setNotes("");
    } catch (error) {
      showToast.error(error.message || "Failed to update blacklist status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn">
        
        {/* HEADER */}
        <div className={`p-4 border-b dark:border-gray-700 flex justify-between items-center ${isAlreadyBlacklisted ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
          <h2 className={`text-lg font-bold flex items-center gap-2 ${isAlreadyBlacklisted ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
            {isAlreadyBlacklisted ? <CheckCircle /> : <AlertTriangle />}
            {isAlreadyBlacklisted ? "Unblacklist Customer" : "Blacklist Customer"}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* BODY */}
        <form onSubmit={handleSubmit} className="p-6">
          
          <div className="mb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Customer Name</p>
            <p className="font-semibold text-gray-800 dark:text-white text-lg">
              {customer.name || `${customer.firstName} ${customer.lastName}`}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {customer.phone}
            </p>
          </div>

          {!isAlreadyBlacklisted ? (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for Blacklisting *
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white transition-all resize-none"
                  rows="3"
                  placeholder="e.g., Unpaid bills, abusive behavior..."
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white transition-all resize-none"
                  rows="2"
                  placeholder="Provide more details if needed..."
                />
              </div>
              
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-800/30 mb-6">
                <p className="text-xs text-red-600 dark:text-red-400">
                  <strong>Warning:</strong> Blacklisting a customer will display warnings on all their future orders and appointments. Their existing records will remain intact.
                </p>
              </div>
            </>
          ) : (
            <div className="mb-6 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800/30">
              <p className="text-sm text-green-700 dark:text-green-400">
                Are you sure you want to remove this customer from the blacklist? They will be able to transact normally again.
              </p>
            </div>
          )}

          {/* FOOTER */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (!isAlreadyBlacklisted && !reason.trim())}
              className={`px-4 py-2 rounded-lg font-medium text-white transition-all flex items-center gap-2 ${
                isAlreadyBlacklisted 
                  ? "bg-green-600 hover:bg-green-700 disabled:bg-green-400" 
                  : "bg-red-600 hover:bg-red-700 disabled:bg-red-400"
              }`}
            >
              {loading && (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isAlreadyBlacklisted ? "Unblacklist" : "Confirm Blacklist"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default BlacklistModal;
