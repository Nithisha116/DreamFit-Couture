import html2canvas from "html2canvas-pro";

/**
 * Pre-convert external <img> sources to data URIs so html2canvas can render
 * without CORS tainting (same approach as JobCardPDFExport).
 */
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
          probe.crossOrigin = "anonymous";
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
    // ignore cleanup errors
  }
}

/**
 * Capture a DOM node as a single PNG data URL (full height, one image).
 * Dynamically forces a desktop breakpoint context inside html2canvas sandboxed clone.
 */
export async function captureElementAsImage(element, { scale = 2 } = {}) {
  if (!element) throw new Error("Nothing to capture");

  await preConvertImages(element);
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }
  await new Promise((r) => setTimeout(r, 300));

  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: false,
    backgroundColor: "#ffffff",
    logging: false,
    width: 1024,
    windowWidth: 1024,
    // The onclone hook manipulates the hidden rendering sandbox document
    onclone: (clonedDocument) => {
      // 1. Force the viewport meta tag to behave like a large screen device layout
      const meta = clonedDocument.querySelector("meta[name=viewport]");
      if (meta) {
        meta.setAttribute("content", "width=1024, initial-scale=1");
      }

      // 2. Inject global desktop forcing overrides to kill flex-wrap and responsive squeezing
      const styleTag = clonedDocument.createElement("style");
      styleTag.innerHTML = `
        /* Overwrite body width inside sandbox */
        body {
          width: 1024px !important;
          min-width: 1024px !important;
        }
        /* Break down common grid/flex column drops and text clamping on phone viewports */
        div, table, tr, td, th, section, span, p {
          flex-direction: row !important;
          flex-wrap: nowrap !important;
          word-break: keep-all !important;
          white-space: nowrap !important;
        }
        /* Keep labels/subtitles wrapped neatly but avoid column breaking */
        .payment-summary-class, p.address, span.text-muted, .g-details {
          white-space: normal !important;
        }
      `;
      clonedDocument.head.appendChild(styleTag);
    },
  });

  try {
    return canvas.toDataURL("image/png");
  } finally {
    releaseCanvas(canvas);
  }
}