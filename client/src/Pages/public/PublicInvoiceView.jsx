import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import OrderInvoice from "../../components/OrderInvoice";
import { fetchPublicInvoice } from "../../api/publicInvoiceApi";
import { captureElementAsImage } from "../../utils/captureInvoiceImage";

/**
 * Customer-facing invoice as a single document image (no admin chrome, no auth).
 *
 * ─── MOBILE VIEWER STRATEGY ───────────────────────────────────────────────
 *
 * The invoice PNG is 794px wide (A4). On a ~390px mobile viewport we need it
 * to fit on ONE screen with no horizontal scrolling, no word cuts, no font
 * changes — exactly like a PDF viewer or Android Gallery certificate view.
 *
 * Technique: CSS transform scale-to-fit.
 *
 *   scale = (viewportWidth - 24px padding) / 794px
 *
 * The image renders at its natural 794px width inside a container sized to
 * the POST-scale dimensions. `transform: scale(s); transform-origin: top left`
 * shrinks it visually while keeping pixel sharpness. The container is sized
 * to (794*s) × (naturalHeight*s) so layout flow has no phantom whitespace.
 *
 * The naturalHeight is measured via an onLoad handler on the img element.
 * Until it loads, the container height is 0 (invisible), then snaps to the
 * correct scaled height — no layout jump visible to the user since the image
 * appears only after capture is complete.
 *
 * Pinch-zoom: `touch-action: pinch-zoom` on the scroll container lets the
 * browser handle native magnification — user can zoom in to read fine print.
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
  // Natural pixel height of the captured image (needed to size the wrapper correctly)
  const [imgNaturalHeight, setImgNaturalHeight] = useState(0);
  const captureRef = useRef(null);
  const imageUrlRef = useRef(null);

  const INVOICE_WIDTH = 794; // px — must match captureRef width and capture canvas width
  const H_PADDING = 24;      // 12px each side breathing room on mobile

  // ─── Compute fit-to-screen scale ─────────────────────────────────────────
  // Runs on mount and on resize (orientation flip).
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

  // Scaled dimensions for the wrapper (so layout flow matches visual size)
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

      {/* Off-screen render target — fixed A4 width so html2canvas captures at full resolution */}
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
          <OrderInvoice order={order} garments={garments} payments={payments} />
        </div>
      )}

      {imageUrl && (
        <>
          {/*
           * ─── MOBILE VIEWER ─────────────────────────────────────────────
           *
           * Scroll container: vertical scroll only (overflow-x:hidden).
           * The invoice is scaled to fit width, so no horizontal scroll needed.
           * Pinch-zoom (touch-action:pinch-zoom) lets users magnify details.
           *
           * Structure:
           *   [scroll container]
           *     [flex centering wrapper + padding]
           *       [clip wrapper — sized to SCALED dimensions]
           *         [img — natural 794px width, shrunk via transform]
           *
           * The clip wrapper:
           *   width  = 794 * scale  (so the flex parent sizes it correctly)
           *   height = naturalHeight * scale  (eliminates phantom whitespace
           *            that transform leaves in layout flow)
           *   overflow: hidden  (clips any sub-pixel bleed from the transform)
           *
           * The img:
           *   width: 794px; maxWidth: none  (natural size, no browser clamping)
           *   transform: scale(s); transform-origin: top left
           *   (top-left origin aligns with the clip wrapper's top-left corner)
           *
           * The naturalHeight is read via onLoad on the img element and stored
           * in state. Until it resolves, scaledHeight is "auto" (wrapper
           * sizes itself by content — brief flash but invisible since spinner
           * hides the view until imageUrl is set).
           */}
          <div
            className="md:hidden"
            style={{
              minHeight: "100dvh",
              backgroundColor: "#d1d5db",   /* neutral-300 equivalent — clean document bg */
              overflowY: "auto",
              overflowX: "hidden",
              paddingTop: "20px",
              paddingBottom: "32px",
              touchAction: "pan-y pinch-zoom",  /* vertical scroll + pinch-zoom; no horizontal pan */
            }}
          >
            {/* Flex centering + side padding */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                paddingLeft: "12px",
                paddingRight: "12px",
              }}
            >
              {/* Clip wrapper — sized to post-scale dimensions */}
              <div
                style={{
                  width:    `${scaledWidth}px`,
                  height:   scaledHeight !== "auto" ? `${scaledHeight}px` : "auto",
                  overflow: "hidden",           /* clips sub-pixel bleed from transform */
                  flexShrink: 0,                /* prevent flex from squeezing it */
                  backgroundColor: "#ffffff",
                  borderRadius: "6px",
                  /* Layered shadow: close shadow for depth + far shadow for lift */
                  boxShadow:
                    "0 2px 8px rgba(0,0,0,0.12), 0 12px 40px rgba(0,0,0,0.22)",
                }}
              >
                <img
                  src={imageUrl}
                  alt={`DreamFit Couture Invoice ${order?.orderId || ""}`}
                  draggable={false}
                  onLoad={(e) => {
                    // Measure the natural pixel height of the PNG so we can
                    // size the clip wrapper to (naturalHeight * scale) and
                    // eliminate phantom whitespace below the scaled image.
                    setImgNaturalHeight(e.currentTarget.naturalHeight);
                  }}
                  style={{
                    width:    `${INVOICE_WIDTH}px`,
                    height:   "auto",
                    maxWidth: "none",            /* CRITICAL: prevents browser clamping to viewport */
                    display:  "block",
                    transform: `scale(${mobileScale})`,
                    transformOrigin: "top left", /* aligns with clip wrapper's origin */
                  }}
                />
              </div>
            </div>
          </div>

          {/* ─── DESKTOP VIEWER — unchanged ──────────────────────────────── */}
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