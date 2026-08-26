/**
 * JobCardPDFExport.js
 * ──────────────────────────────────────────────────
 * Dedicated PDF export engine for Job Cards.
 * Uses html2canvas-pro (oklch-safe) + jsPDF with
 * A4 dimensions, automatic multi-page slicing,
 * and proper CORS image handling.
 */
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";

/* ── A4 dimensions in points (jsPDF default unit) ── */
const A4_W_PT = 595.28; // 210mm
const A4_H_PT = 841.89; // 297mm
const MARGIN   = 20;     // pt margin on each side
const CONTENT_W = A4_W_PT - MARGIN * 2;
const CONTENT_H = A4_H_PT - MARGIN * 2;

/**
 * Wait for an <img> element to be fully decoded and paintable.
 * Prefers the Image Decoding API (guarantees the frame is ready to
 * paint, unlike the "load" event which can fire before decode
 * completes) and falls back to onload/onerror for older browsers.
 */
function waitForImageReady(img) {
  if (typeof img.decode === "function") {
    return img.decode().catch(() => {});
  }
  if (img.complete) return Promise.resolve();
  return new Promise((resolve) => {
    img.onload = resolve;
    img.onerror = resolve;
  });
}

/**
 * Pre-convert all <img> elements to base64 data URIs to avoid
 * CORS tainting when html2canvas draws them onto the canvas.
 *
 * IMPORTANT: native `loading="lazy"` images that have never scrolled
 * into view are marked "deferred" by the browser, and that deferred
 * state persists even after this function reassigns `img.src` — the
 * browser will silently withhold the repaint until the element nears
 * the viewport. Since the job card is captured off-screen sections at
 * a time, that produced an intermittent bug where reference images
 * rendered as a blank/spinner frame depending on scroll position. Force
 * every image to eager here so capture never depends on scroll state.
 */
function preConvertImages(container) {
  const images = Array.from(container.querySelectorAll("img"));
  images.forEach((img) => {
    img.loading = "eager";
  });

  return Promise.all(
    images.map(async (img) => {
      const src = img.src;
      if (!src || src.startsWith("data:")) {
        await waitForImageReady(img);
        return;
      }

      await new Promise((resolve) => {
        const probe = new Image();
        probe.crossOrigin = "Anonymous";
        probe.src = src + (src.includes("?") ? `&_cb=${Date.now()}` : `?_cb=${Date.now()}`);

        const finish = async () => {
          try {
            const c = document.createElement("canvas");
            c.width = probe.naturalWidth || probe.width;
            c.height = probe.naturalHeight || probe.height;
            c.getContext("2d").drawImage(probe, 0, 0);
            img.src = c.toDataURL("image/png");
            await waitForImageReady(img);
          } catch {
            // Leave img.src as-is; html2canvas's own useCORS fetch is the fallback.
          }
          resolve();
        };

        if (typeof probe.decode === "function") {
          probe
            .decode()
            .then(finish)
            .catch(resolve);
        } else {
          probe.onload = finish;
          probe.onerror = resolve;
        }

        // Safety timeout so one stuck/slow image can't hang the whole export.
        setTimeout(resolve, 6000);
      });

      // Defeat the on-screen loading-spinner fade so a mid-transition
      // frame (or a frozen spinner if React's state flip hasn't
      // re-rendered yet) never ends up baked into the capture.
      img.style.opacity = "1";
      img.style.transition = "none";
    }),
  );
}

/**
 * Export the Job Card DOM element to a properly paginated A4 PDF.
 *
 * @param {object}  job       – workflow job object (used for filename)
 * @param {string}  elementId – DOM id of the printable container (default "job-card-print")
 * @returns {Promise<void>}
 */
export async function exportJobCardToPdf(job, elementId = "job-card-print") {
  const el = document.getElementById(elementId);
  if (!el) throw new Error("Job card element not found");

  // 0. Make sure web fonts have finished loading/swapping — capturing while
  // a font is still mid-swap (FOUT/FOIT) changes text metrics and produces
  // inconsistent layout between runs. Guarded with a timeout in case the
  // Font Loading API is unavailable or never settles.
  if (document.fonts?.ready) {
    await Promise.race([
      document.fonts.ready,
      new Promise((r) => setTimeout(r, 3000)),
    ]);
  }

  // 1. Convert external images to base64 first (also forces eager loading,
  // see preConvertImages for why that matters)
  await preConvertImages(el);

  // Any residual loading-spinner overlays (e.g. a React state flip that
  // hasn't re-rendered yet) shouldn't be captured — they're purely a
  // loading-state affordance, not job-card content.
  el.querySelectorAll(".animate-spin").forEach((spinner) => {
    spinner.style.display = "none";
  });

  // Let the browser actually paint the image/opacity/spinner mutations
  // above before we start reading the DOM. Two rAFs guarantee at least one
  // full layout+paint cycle has completed, which is a far more reliable
  // signal than a flat timeout.
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

  // Small settle delay as an extra safety net for slower devices.
  await new Promise((r) => setTimeout(r, 150));

  // 2. Build PDF with precise section-based pagination
  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  let currentY = MARGIN;
  let pageNumber = 1;

  // Find all sections that need to be captured
  const sections = Array.from(el.querySelectorAll(".jc-section, .jc-footer"));

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];

    // Capture the section individually
    const canvas = await html2canvas(section, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      windowWidth: el.scrollWidth,
    });

    const imgData = canvas.toDataURL("image/png");
    const imgW = CONTENT_W;
    const imgH = (canvas.height * imgW) / canvas.width;

    // Check if adding this section exceeds page height
    if (currentY + imgH > A4_H_PT - MARGIN && currentY > MARGIN) {
      // Move to next page (if we aren't already at the top)
      pdf.addPage();
      pageNumber++;
      currentY = MARGIN;
    }

    // What if the single section is taller than the page?
    if (imgH > CONTENT_H) {
      // We have to slice this specific massive section
      let remaining = imgH;
      let srcY = 0;

      while (remaining > 0) {
        if (srcY > 0) {
          pdf.addPage();
          pageNumber++;
          currentY = MARGIN;
        }

        const sliceH = Math.min(remaining, CONTENT_H - currentY);
        const sliceCanvasH = (sliceH * canvas.width) / imgW;

        const slice = document.createElement("canvas");
        slice.width = canvas.width;
        slice.height = sliceCanvasH;
        const ctx = slice.getContext("2d");
        ctx.drawImage(canvas, 0, srcY, canvas.width, sliceCanvasH, 0, 0, canvas.width, sliceCanvasH);

        pdf.addImage(slice.toDataURL("image/png"), "PNG", MARGIN, currentY, imgW, sliceH);

        srcY += sliceCanvasH;
        remaining -= sliceH;
        currentY += sliceH;
      }
    } else {
      pdf.addImage(imgData, "PNG", MARGIN, currentY, imgW, imgH);
      currentY += imgH + 15; // Add a small 15pt margin between sections
    }
  }

  // Add footer text with page numbers on every page
  const pageCount = pdf.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setFontSize(8);
    pdf.setTextColor(150);
    const trackingId = job?.workflowTrackingId || job?.orderId || "export";
    pdf.text(`Tracking: ${trackingId}  |  Page ${i} of ${pageCount}`, MARGIN, A4_H_PT - 10);
  }

  const filename = `job-card-${job?.orderId || job?.workflowTrackingId || "export"}.pdf`;
  pdf.save(filename);
}

export default exportJobCardToPdf;
