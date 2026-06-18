import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import OrderInvoice from "../../components/OrderInvoice";
import { fetchPublicInvoice } from "../../api/publicInvoiceApi";
import { captureElementAsImage } from "../../utils/captureInvoiceImage";

/**
 * Customer-facing invoice view.
 * Restores original pristine desktop layout styling while optimizing 
 * mobile image sizing to prevent text clipping and wrapping.
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

  // ─── Mobile body lock ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!imageUrl) return undefined;

    const mq = window.matchMedia("(max-width: 767px)");

    const applyLock = () => {
      if (!mq.matches) {
        document.documentElement.style.cssText = "";
        document.body.style.cssText = "";
        return;
      }
      document.documentElement.style.cssText = "height:100%;overflow:hidden;";
      document.body.style.cssText = "height:100%;overflow:hidden;margin:0;";
    };

    applyLock();
    mq.addEventListener("change", applyLock);

    return () => {
      mq.removeEventListener("change", applyLock);
      document.documentElement.style.cssText = "";
      document.body.style.cssText = "";
    };
  }, [imageUrl]);

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
    const timer = setTimeout(runCapture, 150);
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
      <div className="min-h-screen bg-neutral-300 flex items-center justify-center p-6">
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
      <div className="min-h-screen bg-neutral-300 flex items-center justify-center p-6">
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
    <div className="min-h-screen bg-neutral-300">

      {/* Spinner while capturing */}
      {(capturing || !imageUrl) && (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-slate-700 font-medium">Preparing your invoice…</p>
          </div>
        </div>
      )}

      {/* Off-screen render target — Fixed A4 baseline size */}
      {!imageUrl && payload?.order && (
        <div
          ref={captureRef}
          id="invoice-capture-target-wrapper"
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "-10000px",
            top: 0,
            width: "850px",
            minWidth: "850px",
            maxWidth: "850px",
            zIndex: -1,
            pointerEvents: "none",
            overflow: "visible",
          }}
        >
          <div style={{ width: "850px", minWidth: "850px", maxWidth: "850px", backgroundColor: "#ffffff" }}>
            <OrderInvoice order={order} garments={garments} payments={payments} />
          </div>
        </div>
      )}

      {imageUrl && (
        <>
          {/* ─── MOBILE VIEWER (Matches Image Gallery Style) ─── */}
          <div
            className="md:hidden"
            style={{
              width: "100vw",
              height: "100dvh",
              overflowX: "scroll",
              overflowY: "scroll",
              backgroundColor: "#171717",
              WebkitOverflowScrolling: "touch",
              touchAction: "pan-x pan-y pinch-zoom",
            }}
          >
            <div
              style={{
                width: "890px", // Provides breathing margin padding around canvas bounds
                minWidth: "890px",
                padding: "20px",
                boxSizing: "border-box",
                display: "inline-block",
              }}
            >
              <img
                src={imageUrl}
                alt="Invoice"
                draggable={false}
                style={{
                  width: "850px",
                  minWidth: "850px",
                  maxWidth: "850px",
                  height: "auto",
                  display: "block",
                  boxShadow: "0 4px 32px rgba(0,0,0,0.6)",
                }}
              />
            </div>
          </div>

          {/* ─── DESKTOP VIEWER (Keeps Original Design Aspect) ─── */}
          <div className="hidden md:flex md:justify-center md:p-4 md:min-h-screen md:bg-neutral-300">
            <img
              src={imageUrl}
              alt={`DreamFit Couture Invoice ${order?.orderId || ""}`}
              className="w-full max-w-[210mm] h-auto shadow-2xl bg-white"
              style={{ display: capturing ? "none" : "block" }}
              draggable={false}
            />
          </div>
        </>
      )}
    </div>
  );
}