import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { CheckSquare } from "lucide-react";
import axios from "axios";
import showToast from "../../utils/toast";
import JobCardDocument from "../../components/workflow/JobCardDocument";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const QrWorkflowPage = () => {
  const { qrCode } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchJobDetails();
    document.body.style.backgroundColor = "#f3f4f6";
    return () => {
      document.body.style.backgroundColor = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrCode]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API_BASE_URL}/qr/${qrCode}`);
      if (res.data.success) {
        setJob(res.data.data);
      } else {
        setError(res.data.message || "Failed to load job details.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid QR Code or Job not found.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteStage = async () => {
    if (!job || job.lifecycleStatus === "completed") return;
    try {
      setUpdating(true);
      const res = await axios.post(`${API_BASE_URL}/qr/${qrCode}/scan`);
      if (res.data.success) {
        showToast.success(res.data.message);
        // Optimistically update or refetch
        fetchJobDetails();
      } else {
        showToast.error(res.data.message || "Failed to update stage.");
      }
    } catch (err) {
      showToast.error(err.response?.data?.message || "An error occurred.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="bg-red-100 text-red-600 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✖</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600">{error || "Job not found."}</p>
        </div>
      </div>
    );
  }

  const isCompleted = job.lifecycleStatus === "completed";

  return (
    <div className="min-h-screen bg-gray-100 pb-20 pt-6 px-4">
      <div className="max-w-2xl mx-auto">
        
        {/* Action Bar at the top */}
        <div className="bg-white rounded-t-2xl shadow-sm border-b border-gray-100 p-4 flex flex-col sm:flex-row justify-between items-center gap-4 relative z-10">
          <div className="text-center sm:text-left">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Action Panel</p>
            {isCompleted ? (
              <p className="text-lg font-black text-emerald-600">Workflow Completed</p>
            ) : (
              <p className="text-lg font-black text-violet-700">Update Status</p>
            )}
          </div>
          
          {!isCompleted && (
            <button
              onClick={handleCompleteStage}
              disabled={updating}
              className={`w-full sm:w-auto px-8 py-3 rounded-xl text-white font-bold text-sm shadow-md transition-all flex justify-center items-center ${
                updating ? "bg-violet-400 cursor-not-allowed" : "bg-violet-600 hover:bg-violet-700 active:scale-95"
              }`}
            >
              {updating ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <CheckSquare className="w-5 h-5 mr-2" />
                  Complete {job.currentStageLabel}
                </>
              )}
            </button>
          )}
        </div>

        {/* Re-use the EXACT same JobCardDocument component! */}
        <div className="shadow-2xl rounded-b-2xl overflow-hidden">
          <JobCardDocument job={job} showQr={false} />
        </div>

      </div>
    </div>
  );
};

export default QrWorkflowPage;
