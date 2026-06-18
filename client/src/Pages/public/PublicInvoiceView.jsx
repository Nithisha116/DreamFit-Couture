import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import OrderInvoice from "../../components/OrderInvoice";
import { fetchPublicInvoice } from "../../api/publicInvoiceApi";
import { captureElementAsImage } from "../../utils/captureInvoiceImage";

/**
 * Customer-facing invoice document viewer.
 * Forces high-resolution desktop rendering during capture, preventing text clipping on mobile.
 * Enables standalone image gallery-style multi-axis scrolling and native pinch-to-zoom.
 */
export default function PublicInvoiceView() {
  const { orderId } = useParams();
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [capturing, setCapturing] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const captureRef = useRef(null);
  const imageUrlRef = useRef(null);

  // ─── Fetch invoice ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!orderId) {
      setError("Invalid invoice link");
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchPublicInvoice(orderId);
        if (!cancelled) setPayload(data);
      } catch (err) {
        if (!cancelled) setError(err.message || "Unable to load invoice");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  // ─── Capture ──────────────────────────────────────────────────────────────
  const runCapture = useCallback(async () => {
    const node = captureRef.current;
    if (!node || !payload?.order) return;

    setCapturing(true);
    setError(null);

    try {
      // Scale 2 handles crisp details for older eyes when zooming in
      const dataUrl = await captureElementAsImage(node, { scale: 2 });
      imageUrlRef.current = dataUrl;
      setImageUrl(dataUrl);
    } catch (err) {
      console.error("Public invoice capture failed:", err);
      setError("Unable to display invoice. Please try again.");
    } finally {
      setCapturing(false);
    }
  }, [payload]);

  useEffect(() => {
    if (!payload?.order || imageUrl || capturing) return;
    const timer = setTimeout(runCapture, 300); // 300ms fallback buffer for font files
    return () => clearTimeout(timer);
  }, [payload, imageUrl, capturing, runCapture]);

  useEffect(() => {
    return () => {
      imageUrlRef.current = null;
      setImageUrl(null);
    };
  }, []);

  // ─── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="fixed inset-0 bg-neutral-100 flex items-center justify-center p-6 z-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-slate-700 font-medium">Loading invoice…</p>
        </div>
      </div>
    );
  }

  // ─── Error state ──────────────────────────────────────────────────────────
  if (error && !imageUrl) {
    return (
      <div className="fixed inset-0 bg-neutral-100 flex items-center justify-center p-6 z-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <p className="text-lg font-bold text-slate-800">Invoice unavailable</p>
          <p className="text-sm text-slate-500 mt-2">{error}</p>
          {orderId && (
            <p className="text-xs text-slate-400 mt-4 font-mono">Order #{orderId}</p>
          )}
          {payload?.order && (
            <button
              type="button"
              onClick={runCapture}
              className="mt-6 px-5 py-2.5 rounded-xl bg-pink-600 text-white text-sm font-bold hover:bg-pink-700"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    );
  }

  const { order, garments = [], payments = [] } = payload || {};

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 w-screen h-screen bg-neutral-900 select-none">

      {/* Spinner while capturing */}
      {(capturing || !imageUrl) && (
        <div className="absolute inset-0 bg-neutral-100 flex items-center justify-center p-6 z-40">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-slate-700 font-medium">Preparing your invoice…</p>
          </div>
        </div>
      )}

      {/* CRITICAL FIX FOR CAPTURE ENGINE: 
        We wrap OrderInvoice inside an absolute-sized inline style canvas block.
        This blocks Tailwind responsive layouts from seeing the phone screen size,
        forcing a beautiful wide-aspect desktop layout even on small devices.
      */}
      {!imageUrl && payload?.order && (
        <div
          ref={captureRef}
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "-9999px",
            top: "-9999px",
            width: "800px",
            minWidth: "800px",
            maxWidth: "800px",
            overflow: "visible",
          }}
        >
          <div style={{ width: "800px", minWidth: "800px", backgroundColor: "#fff" }}>
            <OrderInvoice order={order} garments={garments} payments={payments} />
          </div>
        </div>
      )}

      {imageUrl && (
        <>
          {/* ─── MOBILE VIEWER (Acts exactly like NPTEL Certificate Gallery Viewer) ─── */}
          <div
            className="block md:hidden absolute inset-0 w-full h-full overflow-x-scroll overflow-y-scroll"
            style={{
              WebkitOverflowScrolling: "touch",
              touchAction: "pan-x pan-y pinch-zoom",
              backgroundColor: "#171717",
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "24px 12px",
                minWidth: "max-content",
              }}
            >
              <img
                src={imageUrl}
                alt="Invoice Document"
                draggable={false}
                style={{
                  width: "800px",
                  minWidth: "800px",
                  maxWidth: "800px",
                  height: "auto",
                  display: "block",
                  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)",
                }}
              />
            </div>
          </div>

          {/* ─── DESKTOP VIEWER ────────────────────────────────────────────── */}
          <div className="hidden md:flex absolute inset-0 w-full h-full items-start justify-center overflow-y-auto p-8 bg-neutral-300">
            <img
              src={imageUrl}
              alt={`Invoice ${order?.orderId || ""}`}
              className="w-full max-w-[210mm] h-auto shadow-2xl bg-white mb-8"
              draggable={false}
            />
          </div>
        </>
      )}
    </div>
  );
}