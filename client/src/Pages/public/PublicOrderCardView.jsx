import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import CustomerOrderCard from "../../components/CustomerOrderCard";
import { fetchPublicOrderCard } from "../../api/publicOrderCardApi";
import html2canvas from "html2canvas-pro";

// ─── html2canvas helpers (inline — no separate util file needed) ──────────────

async function preConvertImages(container) {
  const images = container.querySelectorAll("img");
  await Promise.all(
    Array.from(images).map(
      (img) =>
        new Promise((resolve) => {
          const src = img.src;
          if (!src || src.startsWith("data:")) return resolve();

          const probe = new Image();
          probe.crossOrigin = "anonymous";
          probe.src =
            src + (src.includes("?") ? `&_cb=${Date.now()}` : `?_cb=${Date.now()}`);

          probe.onload = () => {
            try {
              const c = document.createElement("canvas");
              c.width = probe.width;
              c.height = probe.height;
              c.getContext("2d").drawImage(probe, 0, 0);
              img.src = c.toDataURL("image/png");
              img.onload = () => resolve();
              img.onerror = () => resolve();
            } catch {
              resolve();
            }
          };
          probe.onerror = () => resolve();
          setTimeout(resolve, 6000);
        }),
    ),
  );
}

function releaseCanvas(canvas) {
  if (!canvas) return;
  try {
    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = 0;
    canvas.height = 0;
  } catch {
    // ignore
  }
}

async function captureElementAsImage(element, { scale = 2, overrideHeight = null } = {}) {
  if (!element) throw new Error("Nothing to capture");

  await preConvertImages(element);
  if (document.fonts?.ready) await document.fonts.ready;
  await new Promise((r) => setTimeout(r, 300));

  const finalHeight = overrideHeight || element.scrollHeight;

  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: false,
    backgroundColor: "#ffffff",
    logging: false,
    windowWidth: element.scrollWidth,
    height: finalHeight,
  });

  try {
    return canvas.toDataURL("image/png");
  } finally {
    releaseCanvas(canvas);
  }
}

// ─── Word-wrap injection styles ───────────────────────────────────────────────
// Applied only to the off-screen capture container so long IDs / strings
// (e.g. garmentId "GRM20260618-8185-7748") never slice off the right edge.
const CAPTURE_WRAP_STYLES = `
  #oc-capture-root * {
    overflow-wrap: break-word !important;
    word-break: break-word !important;
    white-space: normal !important;
  }
  #oc-capture-root .font-mono {
    overflow-wrap: break-word !important;
    word-break: break-all !important;
  }
`;

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Customer-facing read-only order card (no admin chrome, no auth).
 *
 * ─── MOBILE STRATEGY ─────────────────────────────────────────────────────────
 * Identical pipeline to PublicInvoiceView:
 *
 *   1. Render <CustomerOrderCard> off-screen at a fixed 850px desktop width.
 *   2. Measure the true content bottom via getBoundingClientRect() traversal
 *      (layout-accurate regardless of DOM nesting / positioned ancestors).
 *   3. Capture a trimmed PNG via html2canvas-pro with overrideHeight.
 *   4. Display the PNG scaled to fit the mobile viewport width using
 *      CSS transform scale + a sized clip-wrapper to eliminate phantom space.
 *   5. Pinch-zoom via touch-action: pan-y pinch-zoom.
 *
 * Desktop (≥ 768px): live HTML template rendered as before — untouched.
 */
export default function PublicOrderCardView() {
  const { orderId } = useParams();

  const [payload,  setPayload]  = useState(null);
  const [error,    setError]    = useState(null);
  const [loading,  setLoading]  = useState(true);

  // Mobile-capture state
  const [capturing,       setCapturing]       = useState(false);
  const [imageUrl,        setImageUrl]        = useState(null);
  const [mobileScale,     setMobileScale]     = useState(1);
  const [imgNaturalHeight,setImgNaturalHeight] = useState(0);

  const captureRef  = useRef(null);
  const imageUrlRef = useRef(null);

  const CARD_WIDTH = 850;  // off-screen render width — wide enough for sm: grid cols
  const H_PADDING  = 24;   // 12px each side on mobile

  // ─── Detect mobile & compute fit-to-screen scale ─────────────────────────
  const isMobile = () => typeof window !== "undefined" && window.innerWidth < 768;

  useEffect(() => {
    const compute = () => {
      if (window.innerWidth >= 768) { setMobileScale(1); return; }
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

    return () => { cancelled = true; };
  }, [orderId]);

  // ─── Capture (mobile only) ────────────────────────────────────────────────
  const runCapture = useCallback(async () => {
    const node = captureRef.current;
    if (!node || !payload?.order) return;

    setCapturing(true);
    setError(null);

    try {
      // getBoundingClientRect() is viewport-space — accurate regardless of
      // how deeply nested or how many positioned ancestors exist in the tree.
      const containerRect = node.getBoundingClientRect();
      let maxViewportBottom = containerRect.top; // baseline = container top

      node.querySelectorAll("*").forEach((el) => {
        // Skip invisible / zero-size nodes (display:none, collapsed flex items)
        if (el.offsetWidth === 0 && el.offsetHeight === 0) return;
        const r = el.getBoundingClientRect();
        if (r.bottom > maxViewportBottom) maxViewportBottom = r.bottom;
      });

      // Height relative to the container's own top + 48px breathing room
      const contentHeight = maxViewportBottom - containerRect.top;
      const overrideHeight = Math.ceil(contentHeight) + 48;

      const dataUrl = await captureElementAsImage(node, { scale: 2, overrideHeight });

      imageUrlRef.current = dataUrl;
      setImageUrl(dataUrl);
    } catch (err) {
      console.error("Order card capture failed:", err);
      setError("Unable to display order card. Please try again.");
    } finally {
      setCapturing(false);
    }
  }, [payload]);

  // Trigger capture once payload is ready (mobile only, once per load)
  useEffect(() => {
    if (!payload?.order || imageUrl || capturing) return;
    if (!isMobile()) return; // desktop renders live HTML — no capture needed
    const timer = setTimeout(runCapture, 150);
    return () => clearTimeout(timer);
  }, [payload, imageUrl, capturing, runCapture]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      imageUrlRef.current = null;
      setImageUrl(null);
    };
  }, []);

  // ─── Loading ──────────────────────────────────────────────────────────────
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

  // ─── Error ────────────────────────────────────────────────────────────────
  if (error && !imageUrl) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <p className="text-lg font-bold text-slate-800">Order card unavailable</p>
          <p className="text-sm text-slate-500 mt-2">{error || "Order not found"}</p>
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

  // ─── Scaled dimensions for mobile clip-wrapper ────────────────────────────
  const scaledWidth  = CARD_WIDTH * mobileScale;
  const scaledHeight = imgNaturalHeight > 0 ? imgNaturalHeight * mobileScale : "auto";

  return (
    <>
      {/* Word-wrap injection — scoped to off-screen capture root only */}
      <style dangerouslySetInnerHTML={{ __html: CAPTURE_WRAP_STYLES }} />

      {/* ─── MOBILE VIEW ─────────────────────────────────────────────────── */}
      <div className="md:hidden min-h-screen bg-slate-200">

        {/* Spinner while capturing */}
        {(capturing || (!imageUrl && payload?.order)) && (
          <div className="min-h-screen flex items-center justify-center p-6">
            <div className="text-center">
              <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="mt-4 text-slate-600 font-medium">Preparing order card…</p>
            </div>
          </div>
        )}

        {/* Off-screen capture target — fixed 850px so sm: grid columns render correctly */}
        {!imageUrl && payload?.order && (
          <div
            id="oc-capture-root"
            ref={captureRef}
            aria-hidden="true"
            style={{
              position:    "absolute",
              left:        "-20000px",
              top:         0,
              width:       `${CARD_WIDTH}px`,
              minWidth:    `${CARD_WIDTH}px`,
              zIndex:      -1,
              pointerEvents: "none",
              overflow:    "visible",
              backgroundColor: "#ffffff",
            }}
          >
            <CustomerOrderCard payload={payload} />
          </div>
        )}

        {/* Captured PNG — fit-to-screen with pinch-zoom */}
        {imageUrl && (
          <div
            style={{
              minHeight:       "100dvh",
              backgroundColor: "#e2e8f0", // slate-200
              overflowY:       "auto",
              overflowX:       "hidden",
              paddingTop:      "20px",
              paddingBottom:   "32px",
              touchAction:     "pan-y pinch-zoom",
            }}
          >
            {/* Flex centering + side padding */}
            <div
              style={{
                display:        "flex",
                justifyContent: "center",
                paddingLeft:    "12px",
                paddingRight:   "12px",
              }}
            >
              {/*
               * Clip wrapper — sized to POST-scale dimensions so layout flow
               * has no phantom whitespace below the scaled image.
               * overflow:hidden clips any sub-pixel bleed from the transform.
               */}
              <div
                style={{
                  width:           `${scaledWidth}px`,
                  height:          scaledHeight !== "auto" ? `${scaledHeight}px` : "auto",
                  overflow:        "hidden",
                  flexShrink:      0,
                  backgroundColor: "#ffffff",
                  borderRadius:    "10px",
                  boxShadow:       "0 2px 8px rgba(0,0,0,0.12), 0 12px 40px rgba(0,0,0,0.22)",
                }}
              >
                <img
                  src={imageUrl}
                  alt={`DreamFit Couture Order Card ${payload?.order?.orderId || ""}`}
                  draggable={false}
                  onLoad={(e) => setImgNaturalHeight(e.currentTarget.naturalHeight)}
                  style={{
                    width:           `${CARD_WIDTH}px`,
                    height:          "auto",
                    maxWidth:        "none",   // CRITICAL: prevents browser clamping to viewport
                    display:         "block",
                    transform:       `scale(${mobileScale})`,
                    transformOrigin: "top left",
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── DESKTOP VIEW — completely untouched ─────────────────────────── */}
      <div className="hidden md:block min-h-screen bg-slate-200 py-6 sm:py-10 print:bg-white print:py-0">
        <div className="max-w-4xl mx-auto px-2 sm:px-4">
          <div className="hidden print:hidden sm:block text-center mb-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              DreamFit Couture — Order Card
            </p>
            <p className="text-sm text-slate-600 mt-1">
              Order #{payload?.order?.orderId}
            </p>
          </div>
          <div className="bg-white shadow-xl print:shadow-none mx-auto overflow-hidden rounded-2xl print:rounded-none">
            <CustomerOrderCard payload={payload} />
          </div>
          <p className="hidden print:hidden text-center text-xs text-slate-400 mt-6">
            This is a read-only order card. For queries, contact DreamFit Couture.
          </p>
        </div>
      </div>
    </>
  );
}