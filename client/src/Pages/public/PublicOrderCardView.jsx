import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import CustomerOrderCard from "../../components/CustomerOrderCard";
import { fetchPublicOrderCard } from "../../api/publicOrderCardApi";
import { captureElementAsImage } from "../../utils/captureInvoiceImage";

/**
 * Customer-facing read-only order card.
 * Renders CustomerOrderCard off-screen at desktop scale, captures it dynamically,
 * and presents it as a single fit-to-viewport document image on mobile.
 */
export default function PublicOrderCardView() {
  const { orderId } = useParams();
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [capturing, setCapturing] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  // Scale factor for mobile fit-to-screen scaling matches
  const [mobileScale, setMobileScale] = useState(1);
  // Natural pixel height of the captured image
  const [imgNaturalHeight, setImgNaturalHeight] = useState(0);
  const captureRef = useRef(null);
  const imageUrlRef = useRef(null);

  const CARD_WIDTH = 850;   // px — fixed reference frame layout size
  const H_PADDING = 24;     // 12px padding breathing room on phone screens

  // ─── Compute fit-to-screen scale ─────────────────────────────────────────
  useEffect(() => {
    const compute = () => {
      if (window.innerWidth >= 768) {
        setMobileScale(1);
        return;
      }
      const available = window.innerWidth - H_PADDING;
      setMobileScale(Math.min(1, available / CARD_WIDTH));
    };

    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  // ─── Fetch order card ─────────────────────────────────────────────────────
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

  // ─── Capture Layout Engine ────────────────────────────────────────────────
  const runCapture = useCallback(async () => {
    const node = captureRef.current;
    if (!node || !payload?.order) return;

    setCapturing(true);
    setError(null);

    try {
      // Calculate dynamic bottom cut-line layout boundaries
      const containerRect = node.getBoundingClientRect();
      let maxViewportBottom = containerRect.top;

      node.querySelectorAll("*").forEach((el) => {
        if (el.offsetWidth === 0 && el.offsetHeight === 0) return;
        const r = el.getBoundingClientRect();
        if (r.bottom > maxViewportBottom) {
          maxViewportBottom = r.bottom;
        }
      });

      const contentHeight = maxViewportBottom - containerRect.top;
      const customHeight = Math.ceil(contentHeight) + 40;

      const dataUrl = await captureElementAsImage(node, {
        scale: 2,
        overrideHeight: customHeight,
      });

      imageUrlRef.current = dataUrl;
      setImageUrl(dataUrl);
    } catch (err) {
      console.error("Public order card capture failed:", err);
      setError("Unable to display order card cleanly. Please try again.");
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
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-slate-600 font-medium">Loading order card…</p>
        </div>
      </div>
    );
  }

  // ─── Error state ──────────────────────────────────────────────────────────
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

  // Scaled mobile bounding dimension constraints
  const scaledWidth  = CARD_WIDTH * mobileScale;
  const scaledHeight = imgNaturalHeight > 0 ? imgNaturalHeight * mobileScale : "auto";

  return (
    <div className="min-h-screen bg-slate-200 py-6 sm:py-10 print:bg-white print:py-0">
      
      {/* Spinner while capturing */}
      {(capturing || !imageUrl) && (
        <div className="fixed inset-0 bg-slate-100 flex items-center justify-center p-6 z-50">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-slate-600 font-medium">Preparing order card view…</p>
          </div>
        </div>
      )}

      {/* OFF-SCREEN CAPTURE CANVAS TARGET — Forced clean wide layout bounds */}
      {!imageUrl && payload?.order && (
        <div
          ref={captureRef}
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "-10000px",
            top: 0,
            width: `${CARD_WIDTH}px`,
            minWidth: `${CARD_WIDTH}px`,
            zIndex: -1,
            pointerEvents: "none",
            overflow: "visible",
          }}
        >
          {/* Overwrite style blocks for long string break wrap safety inside engine sandbox clone context */}
          <style>{`
            #card-capture-inner, #card-capture-inner * {
              overflow-wrap: break-word !important;
              word-wrap: break-word !important;
              word-break: break-all !important;
              white-space: normal !important;
            }
          `}</style>
          <div id="card-capture-inner" style={{ backgroundColor: "#ffffff", padding: "24px", overflow: "hidden" }}>
            <CustomerOrderCard payload={payload} />
          </div>
        </div>
      )}

      {imageUrl && (
        <div className="max-w-4xl mx-auto px-2 sm:px-4">
          
          {/* ─── MOBILE IMAGE CANVAS VIEWER (Behaves identical to Invoice View) ─── */}
          <div
            className="block sm:hidden"
            style={{
              width: "100%",
              overflowY: "auto",
              overflowX: "hidden",
              boxSizing: "border-box",
              touchAction: "pan-y pinch-zoom",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
              <div
                style={{
                  width: `${scaledWidth}px`,
                  height: scaledHeight !== "auto" ? `${scaledHeight}px` : "auto",
                  overflow: "hidden",
                  flexShrink: 0,
                  backgroundColor: "#ffffff",
                  borderRadius: "12px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                }}
              >
                <img
                  src={imageUrl}
                  alt="Order Card Document"
                  draggable={false}
                  onLoad={(e) => {
                    setImgNaturalHeight(e.currentTarget.naturalHeight);
                  }}
                  style={{
                    width: `${CARD_WIDTH}px`,
                    height: "auto",
                    maxWidth: "none",
                    display: "block",
                    transform: `scale(${mobileScale})`,
                    transformOrigin: "top left",
                  }}
                />
              </div>
            </div>
          </div>

          {/* ─── ORIGINAL PERFECT DESKTOP LAPTOP VIEWER ─── */}
          <div className="hidden sm:block">
            <div className="text-center mb-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                DreamFit Couture — Order Card
              </p>
              <p className="text-sm text-slate-600 mt-1">Order #{payload.order.orderId}</p>
            </div>

            <div className="bg-white shadow-xl mx-auto overflow-hidden rounded-2xl">
              <CustomerOrderCard payload={payload} />
            </div>

            <p className="text-center text-xs text-slate-400 mt-6">
              This is a read-only order card. For queries, contact DreamFit Couture.
            </p>
          </div>

        </div>
      )}
    </div>
  );
}