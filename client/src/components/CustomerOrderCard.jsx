import { format } from "date-fns";
import logo from "../assets/logo.png";
import ImageWithFallback from "./common/ImageWithFallback";

const PRINT_STYLES = `
@media print {
  body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  #customer-order-card { padding: 10mm !important; max-width: 100% !important; }
  .coc-section { page-break-inside: avoid; break-inside: avoid; }
  .coc-no-print { display: none !important; }
}
`;

function resolveImageUrl(img) {
  if (!img) return null;
  const envUrl = import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? "http://localhost:5000" : "https://dreamfit-couture.onrender.com");
  const baseUrl = envUrl.endsWith("/api") ? envUrl.replace("/api", "") : envUrl;

  if (typeof img === "string") {
    if (img.startsWith("http")) return img;
    if (img.startsWith("/uploads")) return `${baseUrl}${img}`;
    return `${baseUrl}/uploads/${img}`;
  }

  const path = img.url || img.path || null;
  if (!path) return null;
  if (path.startsWith("http")) return path;
  if (path.startsWith("/uploads")) return `${baseUrl}${path}`;
  return `${baseUrl}/uploads/${path}`;
}

function formatDate(value) {
  if (!value) return "—";
  try {
    return format(new Date(value), "dd MMM yyyy");
  } catch {
    return "—";
  }
}

function normalizeMeasurements(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((m) => ({
      label: m.name || m.label || m.field || "",
      value: m.value,
      unit: m.unit || "inches",
    }))
    .filter((m) => m.label && m.value !== undefined && m.value !== null && m.value !== "");
}

function collectImages(garment) {
  const buckets = [
    ...(garment.referenceImages || []),
    ...(garment.customerImages || []),
    ...(garment.customerClothImages || []),
  ];
  return buckets.map(resolveImageUrl).filter(Boolean);
}

export default function CustomerOrderCard({ payload }) {
  if (!payload?.order) return null;

  const { order, customer, garments = [], materialsReceived = [], worksToDo = [] } = payload;
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PRINT_STYLES }} />

      <div id="customer-order-card" className="bg-white text-slate-900 p-4 sm:p-10 w-full max-w-3xl mx-auto font-sans">
        {/* Header */}
        <div className="coc-section border-b-2 border-pink-200 pb-6 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src={logo} alt="DreamFit Couture" className="h-14 w-14 object-contain" />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-pink-600">
                DreamFit Couture
              </p>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Order Card</h1>
            </div>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="coc-no-print hidden sm:inline-flex self-start sm:self-center px-4 py-2 rounded-xl bg-pink-600 text-white text-sm font-bold hover:bg-pink-700 transition-colors"
          >
            Print
          </button>
        </div>

        {/* Order & customer info */}
        <div className="coc-section grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-sm">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2">
            <p className="text-[10px] font-bold uppercase text-slate-400">Order ID</p>
            <p className="font-mono font-bold text-lg text-slate-900">{order.orderId}</p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Order Date</p>
                <p className="font-semibold">{formatDate(order.orderDate)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Delivery Date</p>
                <p className="font-semibold text-pink-700">{formatDate(order.deliveryDate)}</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2">
            <p className="text-[10px] font-bold uppercase text-slate-400">Customer</p>
            <p className="font-bold text-lg text-slate-900">{customer?.name || "Customer"}</p>
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Customer ID</p>
                <p className="font-mono text-sm">{customer?.customerId || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">Phone</p>
                <p className="font-semibold">{customer?.phone || "—"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Measurements */}
        {garments.some((g) => normalizeMeasurements(g.measurements).length > 0) && (
          <div className="coc-section mb-8">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-500 mb-4 border-b border-slate-100 pb-2">
              Measurements
            </h2>
            <div className="space-y-6">
              {garments.map((garment) => {
                const measurements = normalizeMeasurements(garment.measurements);
                if (!measurements.length) return null;
                return (
                  <div key={garment.garmentId || garment.name}>
                    <p className="text-sm font-bold text-slate-800 mb-2">
                      {garment.name}
                      {garment.categoryName && (
                        <span className="text-slate-400 font-normal"> · {garment.categoryName}</span>
                      )}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {measurements.map((m, i) => (
                        <div
                          key={`${m.label}-${i}`}
                          className="rounded-lg border border-pink-100 bg-pink-50 px-3 py-2 text-center"
                        >
                          <p className="text-[9px] font-bold text-pink-400 uppercase truncate">{m.label}</p>
                          <p className="font-black text-pink-900 text-sm">
                            {m.value}
                            <span className="text-[9px] font-normal text-pink-400 ml-0.5">{m.unit}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Materials received */}
        {materialsReceived.length > 0 && (
          <div className="coc-section mb-8">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-500 mb-4 border-b border-slate-100 pb-2">
              Materials Received
            </h2>
            <div className="space-y-3">
              {materialsReceived.map((mat, idx) => (
                <div key={`${mat.garmentId}-${idx}`} className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-sm">
                  <p className="font-bold text-slate-900">{mat.garmentName}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2 text-xs">
                    <div>
                      <p className="text-slate-400 font-bold uppercase text-[10px]">Source</p>
                      <p className="font-semibold">{mat.source || "—"}</p>
                    </div>
                    {mat.meters && (
                      <div>
                        <p className="text-slate-400 font-bold uppercase text-[10px]">Meters</p>
                        <p className="font-semibold">{mat.meters}</p>
                      </div>
                    )}
                    {mat.sufficiency && (
                      <div>
                        <p className="text-slate-400 font-bold uppercase text-[10px]">Sufficiency</p>
                        <p className="font-semibold">{mat.sufficiency}</p>
                      </div>
                    )}
                  </div>
                  {mat.notes && (
                    <p className="mt-2 text-slate-600 text-xs leading-relaxed">{mat.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Works to do */}
        {worksToDo.length > 0 && (
          <div className="coc-section mb-8">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-500 mb-4 border-b border-slate-100 pb-2">
              Works To Do
            </h2>
            <div className="space-y-3">
              {worksToDo.map((work, idx) => (
                <div key={`${work.garmentId}-${idx}`} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-slate-900">{work.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {[work.category, work.item].filter(Boolean).join(" · ") || "—"}
                      </p>
                    </div>
                    {work.garmentId && (
                      <span className="text-[10px] font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">
                        {work.garmentId}
                      </span>
                    )}
                  </div>
                  {work.instructions && (
                    <p className="mt-3 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {work.instructions}
                    </p>
                  )}
                  {work.deliveryDate && (
                    <p className="mt-2 text-xs text-pink-600 font-semibold">
                      Delivery: {formatDate(work.deliveryDate)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Special notes */}
        {order.specialNotes && (
          <div className="coc-section mb-8">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-500 mb-3 border-b border-slate-100 pb-2">
              Special Notes / Instructions
            </h2>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 leading-relaxed whitespace-pre-wrap">
              {order.specialNotes}
            </div>
          </div>
        )}

        {/* Reference images */}
        {garments.some(g => collectImages(g).length > 0) && (
          <div className="coc-section mb-6">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-500 mb-4 border-b border-slate-100 pb-2">
              Reference Images
            </h2>
            <div className="space-y-6">

    {garments.map((garment) => {

        const images = [...new Set(collectImages(garment))];

        if (!images.length) return null;

        return (

            <div key={garment.garmentId || garment.name}>

                <p className="text-sm font-bold text-slate-800 mb-3">

                    {garment.name}

                    {garment.categoryName && (

                        <span className="text-slate-400 font-normal">

                            {" "}· {garment.categoryName}

                        </span>

                    )}

                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">

                    {images.map((src, i) => (

                        <div
                            key={i}
                            className="aspect-square rounded-xl border border-slate-200 overflow-hidden bg-slate-50"
                        >

                            <ImageWithFallback
                                src={src}
                                alt={`${garment.name} ${i + 1}`}
                                className="w-full h-full object-cover"
                                useProxy
                            />

                        </div>

                    ))}

                </div>

            </div>

        );

    })}

</div>
          </div>
        )}

        <p className="text-center text-[10px] text-slate-400 mt-8 border-t border-slate-100 pt-4">
          DreamFit Couture · Order Card · {order.orderId}
        </p>
      </div>
    </>
  );
}
