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
 * Capture a DOM node as a single PNG data URL.
 * Normalizes container breakpoints to block mobile layout collapsing.
 */
export async function captureElementAsImage(element, { scale = 2 } = {}) {
  if (!element) throw new Error("Nothing to capture");

  await preConvertImages(element);
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }
  await new Promise((r) => setTimeout(r, 200));

  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: false,
    backgroundColor: "#ffffff",
    logging: false,
    width: 850,
    windowWidth: 850,
    onclone: (clonedDocument) => {
      const wrapper = clonedDocument.getElementById("invoice-capture-target-wrapper");
      if (wrapper) {
        // Enforce horizontal constraints over all table rows and text blocks
        const targetElements = wrapper.querySelectorAll("div, p, span, td, th");
        targetElements.forEach((el) => {
          if (el.className && typeof el.className === "string") {
            // Revert responsive drop rules to preserve desktop row layout
            let normalizedClass = el.className
              .replace(/\bflex-col\b/g, "flex-row")
              .replace(/\bgrid-cols-1\b/g, "grid-cols-2")
              .replace(/\bitems-stretch\b/g, "items-start");
            el.className = normalizedClass;
          }
        });
      }

      // Append global landscape style enforcement inside the sandbox clone
      const styleTag = clonedDocument.createElement("style");
      styleTag.innerHTML = `
        html, body, #invoice-capture-target-wrapper {
          width: 850px !important;
          min-width: 850px !important;
          max-width: 850px !important;
        }
        /* Lock specific table content strings to prevent wrapping text */
        td, th, .garment-name, h1, h2, h3 {
          white-space: nowrap !important;
          word-break: keep-all !important;
        }
        /* Keep address lines stacked neatly */
        .address, p {
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