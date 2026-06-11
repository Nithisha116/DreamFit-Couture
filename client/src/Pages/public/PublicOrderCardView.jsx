import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CustomerOrderCard from "../../components/CustomerOrderCard";
import { fetchPublicOrderCard } from "../../api/publicOrderCardApi";

/**
 * Customer-facing read-only order card (no admin chrome, no auth).
 */
export default function PublicOrderCardView() {
  const { orderId } = useParams();
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setError("Invalid order card link");
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchPublicOrderCard(orderId);
        if (!cancelled) setPayload(data);
      } catch (err) {
        if (!cancelled) setError(err.message || "Unable to load order card");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-slate-600 font-medium">Loading order card…</p>
        </div>
      </div>
    );
  }

  if (error || !payload?.order) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <p className="text-lg font-bold text-slate-800">Order card unavailable</p>
          <p className="text-sm text-slate-500 mt-2">{error || "Order not found"}</p>
          {orderId && (
            <p className="text-xs text-slate-400 mt-4 font-mono">Order #{orderId}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200 py-6 sm:py-10 print:bg-white print:py-0">
      <div className="max-w-4xl mx-auto px-2 sm:px-4">
        <div className="hidden print:hidden sm:block text-center mb-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            DreamFit Couture — Order Card
          </p>
          <p className="text-sm text-slate-600 mt-1">Order #{payload.order.orderId}</p>
        </div>

        <div className="bg-white shadow-xl print:shadow-none mx-auto overflow-hidden rounded-2xl print:rounded-none">
          <CustomerOrderCard payload={payload} />
        </div>

        <p className="hidden print:hidden text-center text-xs text-slate-400 mt-6">
          This is a read-only order card. For queries, contact DreamFit Couture.
        </p>
      </div>
    </div>
  );
}
