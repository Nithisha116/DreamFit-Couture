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
 * Pre-convert all <img> elements to base64 data URIs to avoid
 * CORS tainting when html2canvas draws them onto the canvas.
 */
function preConvertImages(container) {
  const images = container.querySelectorAll("img");

  return Promise.all(
    Array.from(images).map(
      (img) =>
        new Promise((resolve) => {
          const src = img.src;
          if (!src || src.startsWith("data:")) return resolve();

          const probe = new Image();
          probe.crossOrigin = "Anonymous";
          probe.src = src + (src.includes("?") ? `&_cb=${Date.now()}` : `?_cb=${Date.now()}`);

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

          // Safety timeout
          setTimeout(resolve, 6000);
        }),
    ),
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

  // 1. Convert external images to base64 first
  await preConvertImages(el);

  // Small settle delay for layout reflow
  await new Promise((r) => setTimeout(r, 300));

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
