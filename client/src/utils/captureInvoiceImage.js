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
 * Capture a DOM node as a single PNG data URL (full height, one image).
 * Locks the viewport structural layout frame to 1200px wide to provide complete right-side column clearance.
 */
export async function captureElementAsImage(element, { scale = 2 } = {}) {
  if (!element) throw new Error("Nothing to capture");

  await preConvertImages(element);
  if (document.fonts?.ready) {
    await document.fonts.ready;
  }
  await new Promise((r) => setTimeout(r, 300));

  // We push the capture bounding frame to 1200px wide to prevent column clipping
  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: false,
    backgroundColor: "#ffffff",
    logging: false,
    width: 1200,
    windowWidth: 1200,
    onclone: (clonedDocument) => {
      const target = clonedDocument.getElementById("invoice-capture-target-wrapper");
      if (target) {
        // Enforce the wrapper and its direct child container to hold the full layout width safely
        target.style.setProperty("width", "1200px", "important");
        target.style.setProperty("min-width", "1200px", "important");
        target.style.setProperty("max-width", "1200px", "important");

        const firstChild = target.firstElementChild;
        if (firstChild) {
          firstChild.style.setProperty("width", "1200px", "important");
          firstChild.style.setProperty("min-width", "1200px", "important");
          firstChild.style.setProperty("max-width", "1200px", "important");
          firstChild.style.setProperty("padding-right", "60px", "important"); // Gives structural breathing room to totals
        }

        // Fix flex layouts inside the invoice template without forcing row alignment blindly
        const allElements = target.getElementsByTagName("*");
        for (let el of allElements) {
          if (el.className && typeof el.className === "string") {
            let updatedClass = el.className
              .replace(/\bflex-col\b/g, "flex-row")
              .replace(/\bgrid-cols-1\b/g, "grid-cols-2")
              .replace(/\bmd:grid-cols-3\b/g, "grid-cols-2");
            el.className = updatedClass;
          }
        }
      }

      // Explicitly adjust global rules inside the sandbox copy
      const styleTag = clonedDocument.createElement("style");
      styleTag.innerHTML = `
        html, body {
          width: 1200px !important;
          min-width: 1200px !important;
        }
        /* Ensure specific items like names or titles stay on one line */
        .customer-name, .garment-title-class {
          white-space: nowrap !important;
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