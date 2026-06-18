import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import OrderInvoice from "../../components/OrderInvoice";
import { fetchPublicInvoice } from "../../api/publicInvoiceApi";
import { captureElementAsImage } from "../../utils/captureInvoiceImage";

/**
 * Customer-facing invoice as a single document image.
 * Dynamically computes content boundaries using client bounding rects to trim trailing space perfectly.
 */
export default function PublicInvoiceView() {
  const { orderId } = useParams();
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [capturing, setCapturing] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  // Scale factor for mobile fit-to-screen
  const [mobileScale, setMobileScale] = useState(1);
  // Natural pixel height of the captured image
  const [imgNaturalHeight, setImgNaturalHeight] = useState(0);
  const captureRef = useRef(null);
  const imageUrlRef = useRef(null);

  const INVOICE_WIDTH = 794; // px — must match captureRef width and capture canvas width
  const H_PADDING = 24;      // 12px each side breathing room on mobile

  // ─── Compute fit-to-screen scale ─────────────────────────────────────────
  useEffect(() => {
    const compute = () => {
      if (window.innerWidth >= 768) {
        setMobileScale(1);
        return;
      }
      const available = window.innerWidth - H_PADDING;
      setMobileScale(Math.min(1, available / INVOICE_WIDTH));
    };

    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

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

    return () => { cancelled = true; };
  }, [orderId]);

  // ─── Capture ──────────────────────────────────────────────────────────────
  const runCapture = useCallback(async () => {
    const node = captureRef.current;
    if (!node || !payload?.order) return;

    setCapturing(true);
    setError(null);

    try {
      // getBoundingClientRect() gives viewport-space coords — accurate regardless
      // of how deeply nested or how many positioned ancestors exist in the tree.
      const containerRect = node.getBoundingClientRect();

      // Walk every descendant and find the one whose bottom edge is lowest
      // in the viewport. That's the true content boundary.
      let maxViewportBottom = containerRect.top; // start at container top as baseline

      node.querySelectorAll("*").forEach((el) => {
        // Skip elements that are invisible or zero-size (e.g. display:none, ::before)
        if (el.offsetWidth === 0 && el.offsetHeight === 0) return;
        const r = el.getBoundingClientRect();
        if (r.bottom > maxViewportBottom) {
          maxViewportBottom = r.bottom;
        }
      });

      // Convert viewport bottom → height relative to the container top
      const contentHeight = maxViewportBottom - containerRect.top;

      // Add a small breathing room below the last element (48px safety margin)
      const customHeight = Math.ceil(contentHeight) + 48;

      const dataUrl = await captureElementAsImage(node, {
        scale: 2,
        overrideHeight: customHeight,
      });

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

  // Scaled dimensions for the wrapper
  const scaledWidth  = INVOICE_WIDTH * mobileScale;
  const scaledHeight = imgNaturalHeight > 0 ? imgNaturalHeight * mobileScale : "auto";

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

      {/* OFF-SCREEN CAPTURE TARGET */}
      {!imageUrl && payload?.order && (
        <div
          ref={captureRef}
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "-10000px",
            top: 0,
            width: `${INVOICE_WIDTH}px`,
            minWidth: `${INVOICE_WIDTH}px`,
            zIndex: -1,
            pointerEvents: "none",
            overflow: "visible",
          }}
        >
          <div style={{ backgroundColor: "#ffffff", overflow: "hidden" }}>
            <OrderInvoice order={order} garments={garments} payments={payments} />
          </div>
        </div>
      )}

      {imageUrl && (
        <>
          {/* ─── MOBILE VIEWER ───────────────────────────────────────────── */}
          <div
            className="md:hidden"
            style={{
              height: "100dvh",
              maxHeight: "100dvh",
              backgroundColor: "#d1d5db",
              overflowY: "auto",
              overflowX: "hidden",
              paddingTop: "16px",
              paddingBottom: "16px",
              boxSizing: "border-box",
              touchAction: "pan-y pinch-zoom",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                paddingLeft: "12px",
                paddingRight: "12px",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  width:    `${scaledWidth}px`,
                  height:   scaledHeight !== "auto" ? `${scaledHeight}px` : "auto",
                  overflow: "hidden",
                  flexShrink: 0,
                  backgroundColor: "#ffffff",
                  borderRadius: "6px",
                  boxShadow:
                    "0 2px 8px rgba(0,0,0,0.12), 0 12px 40px rgba(0,0,0,0.22)",
                }}
              >
                <img
                  src={imageUrl}
                  alt={`DreamFit Couture Invoice ${order?.orderId || ""}`}
                  draggable={false}
                  onLoad={(e) => {
                    setImgNaturalHeight(e.currentTarget.naturalHeight);
                  }}
                  style={{
                    width:    `${INVOICE_WIDTH}px`,
                    height:   "auto",
                    maxWidth: "none",
                    display:  "block",
                    transform: `scale(${mobileScale})`,
                    transformOrigin: "top left",
                  }}
                />
              </div>
            </div>
          </div>

          {/* ─── DESKTOP VIEWER — Unchanged ──────────────────────────────── */}
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