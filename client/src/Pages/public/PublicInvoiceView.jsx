import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import OrderInvoice from "../../components/OrderInvoice";
import { fetchPublicInvoice } from "../../api/publicInvoiceApi";
import { captureElementAsImage } from "../../utils/captureInvoiceImage";

/**
 * Customer-facing invoice as a single document image (no admin chrome, no auth).
 * Renders OrderInvoice off-screen, captures once, then shows only the image.
 *
 * Mobile viewer: behaves like Android Gallery / PDF viewer — full A4 width,
 * horizontal + vertical scroll, pinch-zoom via touch-action: pan-x pan-y pinch-zoom.
 *
 * Root cause of original bug:
 *   position:fixed + overflow-x:auto has a long-standing WebKit/Chrome-mobile bug
 *   where the scrollable area is clipped to the viewport even when the child is wider.
 *   Simultaneously locking document.body overflow removed the only fallback scroll path.
 *   Fix: use a non-fixed full-viewport container (position:absolute on a relative root,
 *   or simply a block-level div that fills the screen via height:100dvh on html/body).
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
  // When the image viewer is shown on mobile we make <html> and <body>
  // exactly viewport-sized so the viewer div can be the sole scroll host.
  // This prevents double-scroll bars and lets touch events go to the viewer.
  useEffect(() => {
    if (!imageUrl) return undefined;

    const mq = window.matchMedia("(max-width: 767px)");

    const applyLock = () => {
      if (!mq.matches) {
        // Desktop: release any lock
        document.documentElement.style.cssText = "";
        document.body.style.cssText = "";
        return;
      }
      // Mobile: constrain root so the viewer div owns all scrolling
      document.documentElement.style.cssText =
        "height:100%;overflow:hidden;";
      document.body.style.cssText =
        "height:100%;overflow:hidden;margin:0;";
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
    const timer = setTimeout(runCapture, 100);
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

      {/* Off-screen render target — fixed A4 width so html2canvas captures correctly */}
      {!imageUrl && payload?.order && (
        <div
          ref={captureRef}
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "-10000px",
            top: 0,
            width: "794px",
            minWidth: "794px",
            zIndex: -1,
            pointerEvents: "none",
            overflow: "visible",
          }}
        >
          <OrderInvoice order={order} garments={garments} payments={payments} />
        </div>
      )}

      {imageUrl && (
        <>
          {/*
           * ─── MOBILE VIEWER ───────────────────────────────────────────────
           *
           * WHY this approach works (and fixed/overflow-x:auto did NOT):
           *
           * Mobile WebKit & Chrome have a bug: overflow-x:auto on a
           * position:fixed element doesn't expand the scrollable area beyond
           * 100vw — the browser clips it. This is why your right-swipe was dead.
           *
           * Solution:
           *  • html + body are locked to height:100% overflow:hidden (done in useEffect).
           *  • This outer div fills the screen using width:100vw height:100dvh.
           *    It is NOT fixed — it's in normal flow, but since body is 100% tall
           *    and clipped, it naturally occupies exactly the viewport.
           *  • overflow:auto on a non-fixed, block-level element works correctly
           *    on all mobile browsers — this is the same pattern Android Gallery
           *    and PDF viewers use internally.
           *  • touch-action:pan-x pan-y pinch-zoom enables native pinch-zoom
           *    without any JS library.
           *  • The inner wrapper is exactly 794px wide (A4) + 40px horizontal
           *    padding = 834px total, which forces the horizontal scrollbar to appear.
           *  • The img has width:794px and maxWidth:none — critical. Without
           *    maxWidth:none, browsers silently clamp images to 100% of parent.
           */}
          <div
            className="md:hidden"
            style={{
              width: "100vw",
              height: "100dvh",   /* dvh = dynamic viewport height — avoids mobile browser chrome overlap */
              overflow: "auto",   /* both axes — same as Android Gallery scroll container */
              backgroundColor: "#000",
              WebkitOverflowScrolling: "touch",  /* smooth momentum scroll on older iOS */
              touchAction: "pan-x pan-y pinch-zoom", /* native pinch-zoom, no JS needed */
            }}
          >
            {/*
             * Inner wrapper: fixed content width.
             * padding creates breathing room around the document (like a PDF viewer margin).
             * This div MUST be wider than the viewport to make horizontal scroll work.
             */}
            <div
              style={{
                width: "834px",      /* 794px image + 20px left + 20px right padding */
                minWidth: "834px",   /* belt-and-suspenders: prevent any shrink */
                padding: "20px",
                boxSizing: "border-box",
              }}
            >
              <img
                src={imageUrl}
                alt="Invoice"
                draggable={false}
                style={{
                  width: "794px",
                  maxWidth: "none",   /* CRITICAL: prevent browser from scaling down to viewport */
                  height: "auto",
                  display: "block",
                  boxShadow: "0 4px 32px rgba(0,0,0,0.5)",
                }}
              />
            </div>
          </div>

          {/* ─── DESKTOP VIEWER — ────────────────────────────── */}
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