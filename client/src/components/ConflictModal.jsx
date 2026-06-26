import React, { useState, useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ConflictModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleConflict = () => {
      setIsOpen(true);
    };

    window.addEventListener("versionConflict", handleConflict);
    return () => {
      window.removeEventListener("versionConflict", handleConflict);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 border border-rose-100 flex flex-col items-center text-center">
        <div className="h-16 w-16 bg-rose-100 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="h-8 w-8 text-rose-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Order Updated
        </h2>
        
        <p className="text-gray-600 mb-8">
          This order has been modified by another user or session. To prevent data loss, please reload the order.
        </p>
        
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <RefreshCw size={20} />
          Reload Order
        </button>
      </div>
    </div>
  );
}
