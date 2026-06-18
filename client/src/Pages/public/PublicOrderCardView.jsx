import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import CustomerOrderCard from "../../components/CustomerOrderCard";
import { fetchPublicOrderCard } from "../../api/publicOrderCardApi";
import html2canvas from "html2canvas-pro";

// ─── html2canvas helpers ──────────────────────────────────────────────────────

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
  } catch { /* ignore */ }
}

async function captureElementAsImage(element, { scale = 2, overrideHeight = null } = {}) {
  if (!element) throw new Error("Nothing to capture");

  await preConvertImages(element);
  if (document.fonts?.ready) await document.fonts.ready;
  await new Promise((r) => setTimeout(r, 500));

  const finalHeight = overrideHeight && overrideHeight > 50 ? overrideHeight : element.scrollHeight;

  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: false,
    backgroundColor: "#ffffff",
    logging: false,
    windowWidth: element.scrollWidth,
    windowHeight: finalHeight,
    height: finalHeight,
    y: 0,
    x: 0,
  });

  if (canvas.width < 100 || canvas.height < 100) {
    releaseCanvas(canvas);
    throw new Error(`Canvas too small: ${canvas.width}x${canvas.height}`);
  }

  try {
    return canvas.toDataURL("image/png");
  } finally {
    releaseCanvas(canvas);
  }
}

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

export default function PublicOrderCardView() {
  const { orderId } = useParams();

  const [payload,          setPayload]          = useState(null);
  const [error,            setError]            = useState(null);
  const [loading,          setLoading]          = useState(true);
  const [capturing,        setCapturing]        = useState(false);
  const [imageUrl,         setImageUrl]         = useState(null);
  const [mobileScale,      setMobileScale]      = useState(1);
  const [imgNaturalHeight, setImgNaturalHeight] = useState(0);

  const captureRef  = useRef(null);
  const imageUrlRef = useRef(null);

  const CARD_WIDTH = 850;
  const H_PADDING  = 24;

  // ─── Fit-to-screen scale ──────────────────────────────────────────────────
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

  // ─── Fetch ────────────────────────────────────────────────────────────────
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

  // ─── Capture ──────────────────────────────────────────────────────────────
  const runCapture = useCallback(async () => {
    const node = captureRef.current;
    if (!node || !payload?.order) return;

    setCapturing(true);
    setError(null);

    try {
      // Extra tick for DOM paint after mount
      await new Promise((r) => setTimeout(r, 200));

      // Use offsetTop (relative to node) — reliable because the element is
      // positioned at top:-99999px left:0 and still in horizontal layout flow.
      // getBoundingClientRect is NOT used here because fixed+far-offscreen
      // elements still have unreliable viewport coords on mobile Chrome.
      let maxBottom = 0;
      node.querySelectorAll("*").forEach((el) => {
        if (el.offsetWidth === 0 && el.offsetHeight === 0) return;
        const bottom = el.offsetTop + el.offsetHeight;
        if (bottom > maxBottom) maxBottom = bottom;
      });

      const contentHeight = Math.max(node.scrollHeight, maxBottom);
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

  // Trigger on mobile once payload is ready
  useEffect(() => {
    if (!payload?.order || imageUrl || capturing) return;
    if (window.innerWidth >= 768) return;
    const timer = setTimeout(runCapture, 200);
    return () => clearTimeout(timer);
  }, [payload, imageUrl, capturing, runCapture]);

  // Cleanup
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

  const scaledWidth  = CARD_WIDTH * mobileScale;
  const scaledHeight = imgNaturalHeight > 0 ? imgNaturalHeight * mobileScale : "auto";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CAPTURE_WRAP_STYLES }} />

      {/* ─── MOBILE ────────────────────────────────────────────────────────── */}
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

        {/*
          Off-screen capture target.

          CRITICAL POSITIONING:
          - position: fixed   → removed from normal flow, won't affect page scroll
          - top: -99999px     → hidden above the viewport
          - left: 0           → stays inside horizontal layout bounds

          WHY NOT left:-20000px:
          Mobile Chrome refuses to compute layout for elements positioned
          thousands of pixels outside the horizontal scroll area. offsetTop,
          offsetHeight, and scrollHeight all return 0 or garbage, causing
          html2canvas to capture a near-empty canvas and produce a broken PNG.

          left:0 + top:-99999px keeps it in-flow horizontally so the browser
          computes the full 850px layout correctly, while keeping it invisible.
        */}
        {!imageUrl && payload?.order && (
          <div
            id="oc-capture-root"
            ref={captureRef}
            aria-hidden="true"
            style={{
              position:        "fixed",
              top:             "-99999px",
              left:            0,
              width:           `${CARD_WIDTH}px`,
              minWidth:        `${CARD_WIDTH}px`,
              zIndex:          -1,
              pointerEvents:   "none",
              overflow:        "visible",
              backgroundColor: "#ffffff",
            }}
          >
            <CustomerOrderCard payload={payload} />
          </div>
        )}

        {/* Captured PNG viewer */}
        {imageUrl && (
          <div
            style={{
              minHeight:       "100dvh",
              backgroundColor: "#e2e8f0",
              overflowY:       "auto",
              overflowX:       "hidden",
              paddingTop:      "20px",
              paddingBottom:   "32px",
              touchAction:     "pan-y pinch-zoom",
            }}
          >
            <div
              style={{
                display:        "flex",
                justifyContent: "center",
                paddingLeft:    "12px",
                paddingRight:   "12px",
              }}
            >
              {/* Clip wrapper — sized to post-scale dimensions to eliminate phantom whitespace */}
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
                    maxWidth:        "none",
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

      {/* ─── DESKTOP — untouched ───────────────────────────────────────────── */}
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