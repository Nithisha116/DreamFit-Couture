// import React, { forwardRef, useImperativeHandle, useRef } from "react";
// import jsPDF from "jspdf";
// import html2canvas from "html2canvas";
// import logo from "../assets/logo.png";

// const OrderInvoice = forwardRef(({ order, garments = [] }, ref) => {
//   const invoiceRef = useRef();

//   // ✅ EXPOSE BOTH handleDownload AND getInvoiceElement for printing
//   useImperativeHandle(ref, () => ({
//     handleDownload: async () => {
//       try {
//         const element = invoiceRef.current;
//         if (!element) {
//           console.error("Invoice element not found");
//           return;
//         }

//         const canvas = await html2canvas(element, {
//           scale: 3,
//           useCORS: true,
//           backgroundColor: "#ffffff",
//           allowTaint: true,
//           logging: false,
//         });

//         const imgData = canvas.toDataURL("image/png");
//         const pdf = new jsPDF("p", "mm", "a4");
//         pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
//         pdf.save(`Dreamfit_Invoice_${order?.orderId || "Order"}.pdf`);
//       } catch (error) {
//         console.error("PDF Error:", error);
//         alert("Failed to generate PDF");
//       }
//     },
//     // ✅ CRITICAL: This method is needed for printing
//     getInvoiceElement: () => invoiceRef.current
//   }));

//   if (!order) return null;

//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     return new Date(dateString).toLocaleDateString("en-GB");
//   };

//   const calculateGarmentTotal = (garment) => {
//     const qty = garment.quantity || 1;
//     const min = garment.priceRange?.min || 0;
//     const max = garment.priceRange?.max || 0;
//     return {
//       min: min * qty,
//       max: max * qty
//     };
//   };

//   const subtotalMin = garments.reduce((sum, g) => sum + (g.priceRange?.min || 0) * (g.quantity || 1), 0);
//   const subtotalMax = garments.reduce((sum, g) => sum + (g.priceRange?.max || 0) * (g.quantity || 1), 0);
//   const advance = order.advancePayment?.amount || 0;
//   const balanceMin = Math.max(0, subtotalMin - advance);
//   const balanceMax = Math.max(0, subtotalMax - advance);

//   const getGarmentId = (garment, index) => {
//     if (garment.garmentId) return garment.garmentId;
//     const prefix = garment.name?.substring(0, 2).toUpperCase() || "G";
//     const num = String(index + 1).padStart(4, '0');
//     return `#${prefix}${num}`;
//   };

//   return (
//     <div
//       ref={invoiceRef}
//       data-invoice="true"
//       style={{
//         width: "210mm",
//         minHeight: "297mm",
//         margin: "0 auto",
//         backgroundColor: "#ffffff",
//         fontFamily: "'Inter', 'Arial', 'Helvetica', sans-serif",
//         color: "#1e293b",
//         position: "relative",
//         boxSizing: "border-box",
//         lineHeight: "1.5",
//       }}
//     >
//       {/* Professional Watermark Background */}
//       <div
//         style={{
//           position: "absolute",
//           inset: 0,
//           backgroundImage: `url(${logo})`,
//           backgroundSize: "400px auto",
//           backgroundPosition: "center",
//           backgroundRepeat: "no-repeat",
//           opacity: 0.02,
//           zIndex: 1,
//         }}
//       />

//       {/* Content */}
//       <div
//         style={{
//           position: "relative",
//           zIndex: 10,
//           padding: "35px 40px",
//         }}
//       >
//         {/* HEADER with proper logo */}
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             alignItems: "center",
//             marginBottom: "25px",
//           }}
//         >
//           <img
//             src={logo}
//             alt="Dreamfit Couture"
//             style={{
//               maxWidth: "200px",
//               maxHeight: "70px",
//               objectFit: "contain",
//             }}
//           />
//           <div style={{ textAlign: "right" }}>
//             <h1
//               style={{
//                 color: "#be185d",
//                 fontSize: "26px",
//                 fontWeight: "800",
//                 margin: 0,
//                 letterSpacing: "0.5px",
//               }}
//             >
//               INVOICE & RECEIPT
//             </h1>
//             <p style={{ color: "#64748b", fontSize: "13px", margin: "4px 0 0 0" }}>
//               Advance Payment Received
//             </p>
//           </div>
//         </div>

//         {/* Divider */}
//         <div style={{ height: "2px", background: "linear-gradient(90deg, #be185d 0%, #fbcfe8 100%)", marginBottom: "25px" }} />

//         {/* Order Info Row */}
//         <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "25px" }}>
//           <div>
//             <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 4px 0" }}>Order Number</p>
//             <p style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>#{order.orderId || "DF-001"}</p>
//           </div>
//           <div style={{ textAlign: "right" }}>
//             <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 4px 0" }}>Order Date</p>
//             <p style={{ fontSize: "16px", fontWeight: "600", margin: 0 }}>{formatDate(order.orderDate)}</p>
//           </div>
//         </div>

//         {/* Customer Card */}
//         <div
//           style={{
//             backgroundColor: "#f8fafc",
//             borderRadius: "16px",
//             padding: "20px",
//             marginBottom: "30px",
//             border: "1px solid #f1f5f9",
//             boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
//           }}
//         >
//           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
//             <div>
//               <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 8px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>
//                 Bill To
//               </p>
//               <p style={{ fontSize: "18px", fontWeight: "700", margin: "0 0 6px 0", color: "#0f172a" }}>
//                 {order.customer?.name || "Guest Customer"}
//               </p>
//               <p style={{ fontSize: "14px", margin: "4px 0", color: "#475569" }}>
//                 📞 {order.customer?.phone || "N/A"}
//               </p>
//               <p style={{ fontSize: "14px", margin: "4px 0", color: "#475569" }}>
//                 ✉️ {order.customer?.email || "N/A"}
//               </p>
//               <p style={{ fontSize: "13px", margin: "8px 0 0 0", color: "#64748b", maxWidth: "300px" }}>
//                 {order.customer?.addressLine1}
//                 {order.customer?.addressLine2 && <>, {order.customer.addressLine2}</>}
//                 <br />
//                 {order.customer?.city}, {order.customer?.state} {order.customer?.pincode}
//               </p>
//             </div>
//             <div style={{ textAlign: "right" }}>
//               <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 8px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>
//                 Delivery Date
//               </p>
//               <p style={{ fontSize: "20px", fontWeight: "700", color: "#be185d", margin: 0 }}>
//                 {formatDate(order.deliveryDate)}
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Table Title */}
//         <h3
//           style={{
//             fontSize: "16px",
//             fontWeight: "700",
//             color: "#0f172a",
//             margin: "0 0 15px 0",
//             display: "flex",
//             alignItems: "center",
//             gap: "8px",
//           }}
//         >
//           <span style={{ display: "inline-block", width: "4px", height: "18px", backgroundColor: "#be185d", borderRadius: "4px" }} />
//           GARMENT DETAILS
//         </h3>

//         {/* Professional Table */}
//         <div style={{ marginBottom: "30px", borderRadius: "12px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
//           <table style={{ width: "100%", borderCollapse: "collapse" }}>
//             <thead>
//               <tr style={{ backgroundColor: "#f1f5f9" }}>
//                 <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#334155" }}>ID</th>
//                 <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "13px", fontWeight: "600", color: "#334155" }}>Garment</th>
//                 <th style={{ padding: "14px 16px", textAlign: "center", fontSize: "13px", fontWeight: "600", color: "#334155" }}>Qty</th>
//                 <th style={{ padding: "14px 16px", textAlign: "right", fontSize: "13px", fontWeight: "600", color: "#334155" }}>Unit Price (₹)</th>
//                 <th style={{ padding: "14px 16px", textAlign: "right", fontSize: "13px", fontWeight: "600", color: "#334155" }}>Total (₹)</th>
//               </tr>
//             </thead>
//             <tbody>
//               {garments.map((g, idx) => {
//                 const total = calculateGarmentTotal(g);
//                 return (
//                   <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
//                     <td style={{ padding: "14px 16px", fontSize: "13px", color: "#64748b" }}>
//                       <span style={{ fontFamily: "monospace", fontWeight: "600", color: "#475569" }}>{getGarmentId(g, idx)}</span>
//                     </td>
//                     <td style={{ padding: "14px 16px" }}>
//                       <div style={{ fontWeight: "600", color: "#0f172a" }}>{g.name}</div>
//                       <div style={{ fontSize: "12px", color: "#64748b" }}>{g.fabric || g.category?.name || "—"}</div>
//                     </td>
//                     <td style={{ padding: "14px 16px", textAlign: "center", color: "#334155" }}>{g.quantity}</td>
//                     <td style={{ padding: "14px 16px", textAlign: "right", fontFamily: "monospace" }}>
//                       {g.priceRange?.min === g.priceRange?.max ? (
//                         <>₹{g.priceRange?.min}</>
//                       ) : (
//                         <>₹{g.priceRange?.min} – ₹{g.priceRange?.max}</>
//                       )}
//                     </td>
//                     <td style={{ padding: "14px 16px", textAlign: "right", fontFamily: "monospace", fontWeight: "600", color: "#be185d" }}>
//                       {total.min === total.max ? (
//                         <>₹{total.min}</>
//                       ) : (
//                         <>₹{total.min} – ₹{total.max}</>
//                       )}
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//             <tfoot>
//               <tr style={{ backgroundColor: "#f8fafc" }}>
//                 <td colSpan="4" style={{ padding: "16px", textAlign: "right", fontSize: "15px", fontWeight: "600" }}>Subtotal Range</td>
//                 <td style={{ padding: "16px", textAlign: "right", fontSize: "16px", fontWeight: "700", color: "#be185d" }}>
//                   ₹{subtotalMin} – ₹{subtotalMax}
//                 </td>
//               </tr>
//             </tfoot>
//           </table>
//         </div>

//         {/* Payment + Delivery Grid */}
//         <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "40px" }}>
//           {/* Payment Card */}
//           <div style={{ backgroundColor: "#f8fafc", borderRadius: "16px", padding: "20px", border: "1px solid #f1f5f9" }}>
//             <h4 style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a", margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: "8px" }}>
//               <span style={{ width: "4px", height: "16px", backgroundColor: "#be185d", borderRadius: "4px" }} />
//               PAYMENT SUMMARY
//             </h4>
//             <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
//               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//                 <span style={{ color: "#475569" }}>Advance Paid</span>
//                 <span style={{ fontWeight: "600", color: "#059669" }}>₹{advance}</span>
//               </div>
//               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//                 <span style={{ color: "#475569" }}>Payment Mode</span>
//                 <span style={{ fontWeight: "500", color: "#334155" }}>{order.advancePayment?.method || "UPI"}</span>
//               </div>
//               <div style={{ height: "1px", backgroundColor: "#e2e8f0", margin: "8px 0" }} />
//               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//                 <span style={{ fontWeight: "600", color: "#be185d" }}>Balance Due</span>
//                 <span style={{ fontWeight: "700", color: "#be185d", fontSize: "18px" }}>
//                   ₹{balanceMin} – ₹{balanceMax}
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* Delivery Card */}
//           <div style={{ backgroundColor: "#f8fafc", borderRadius: "16px", padding: "20px", border: "1px solid #f1f5f9" }}>
//             <h4 style={{ fontSize: "15px", fontWeight: "700", color: "#0f172a", margin: "0 0 16px 0", display: "flex", alignItems: "center", gap: "8px" }}>
//               <span style={{ width: "4px", height: "16px", backgroundColor: "#be185d", borderRadius: "4px" }} />
//               DELIVERY INFO
//             </h4>
//             <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
//               <div>
//                 <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 4px 0" }}>Estimated Delivery</p>
//                 <p style={{ fontSize: "18px", fontWeight: "700", color: "#be185d", margin: 0 }}>
//                   {formatDate(order.deliveryDate)}
//                 </p>
//               </div>
//               {order.specialNotes && (
//                 <div>
//                   <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 4px 0" }}>Special Instructions</p>
//                   <p style={{ fontSize: "13px", margin: 0, fontStyle: "italic", color: "#475569" }}>"{order.specialNotes}"</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Footer with Signature */}
//         <div style={{ marginTop: "30px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: "2px dashed #e2e8f0", paddingTop: "25px" }}>
//           <div>
//             <h3 style={{ color: "#0f172a", fontSize: "18px", fontWeight: "700", margin: "0 0 4px 0" }}>DREAMFIT COUTURE</h3>
//             <p style={{ fontSize: "13px", color: "#64748b", margin: "2px 0" }}>
//               {import.meta.env.VITE_COMPANY_ADDRESS || "Chennai, Tamil Nadu"}
//             </p>
//             <p style={{ fontSize: "13px", color: "#64748b", margin: "2px 0" }}>
//               📞 {import.meta.env.VITE_COMPANY_PHONE || "+91 98765 43210"}  |  ✉️ {import.meta.env.VITE_EAMIL || "care@dreamfit.com"}
//             </p>
//           </div>
//           <div style={{ textAlign: "right" }}>
//             <div style={{ borderTop: "2px solid #be185d", width: "200px", paddingTop: "10px" }}>
//               <p style={{ fontSize: "14px", fontWeight: "600", color: "#be185d", margin: 0 }}>Authorized Signature</p>
//               <p style={{ fontSize: "11px", color: "#94a3b8", margin: "4px 0 0 0" }}>For Dreamfit Couture</p>
//             </div>
//           </div>
//         </div>

//         {/* Thank You Note */}
//         <div style={{ marginTop: "30px", textAlign: "center" }}>
//           <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
//             Thank you for your business, {order.customer?.name?.split(" ")[0] || "Valued Customer"}!
//           </p>
//           <p style={{ fontSize: "10px", color: "#94a3b8", marginTop: "12px" }}>
//             Invoice #{order.orderId || "DF-001"} • Generated on {new Date().toLocaleDateString("en-GB")}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// });

// export default OrderInvoice;

import React, { forwardRef, useImperativeHandle, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import pdfBg from "../assets/Pdfbg.png";
import logo from "../assets/logo.png";

const OrderInvoice = forwardRef(({ order, garments = [] }, ref) => {
  const invoiceRef = useRef();

  // ✅ EXPOSE BOTH handleDownload AND getInvoiceElement for printing
  useImperativeHandle(ref, () => ({
    handleDownload: async () => {
      try {
        const element = invoiceRef.current;
        if (!element) {
          console.error("Invoice element not found");
          return;
        }

        const canvas = await html2canvas(element, {
          scale: 3,
          useCORS: true,
          backgroundColor: "#ffffff",
          allowTaint: true,
          logging: false,
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
        pdf.save(`Dreamfit_Invoice_${order?.orderId || "Order"}.pdf`);
      } catch (error) {
        console.error("PDF Error:", error);
        alert("Failed to generate PDF");
      }
    },
    // ✅ CRITICAL: This method is needed for printing
    getInvoiceElement: () => invoiceRef.current,
  }));

  if (!order) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  // Helper function to safely get quantity from garment
  const getQuantity = (garment) => {
    // Try different possible quantity field names
    return garment.quantity || garment.qty || garment.Quantity || 1;
  };

  const calculateGarmentTotal = (garment) => {
    const qty = getQuantity(garment);
    const finalized = garment.finalizedPrice !== undefined && garment.finalizedPrice !== null && garment.finalizedPrice !== ""
      ? Number(garment.finalizedPrice)
      : (garment.priceRange?.max || 0);
    return finalized * qty;
  };

  // Calculate finalized subtotal
  const finalizedSubtotal = garments.reduce((sum, g) => {
    const qty = getQuantity(g);
    const finalized = g.finalizedPrice !== undefined && g.finalizedPrice !== null && g.finalizedPrice !== ""
      ? Number(g.finalizedPrice)
      : (g.priceRange?.max || 0);
    return sum + finalized * qty;
  }, 0);

  const advance = order.advancePayment?.amount || 0;
  const balanceDue = Math.max(0, finalizedSubtotal - advance);

  const getGarmentId = (garment, index) => {
    if (garment.garmentId) return garment.garmentId;
    const prefix = garment.name?.substring(0, 2).toUpperCase() || "G";
    const num = String(index + 1).padStart(4, "0");
    return `#${prefix}${num}`;
  };

  return (
    <div
      ref={invoiceRef}
      data-invoice="true"
      style={{
        width: "210mm",
        minHeight: "297mm",
        margin: "0 auto",
        backgroundColor: "#ffffff",
        fontFamily: "'Inter', 'Arial', 'Helvetica', sans-serif",
        color: "#1e293b",
        position: "relative",
        boxSizing: "border-box",
        lineHeight: "1.5",
      }}
    >
      {/* Professional Watermark Background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${logo})`,
          backgroundSize: "400px auto",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.02,
          zIndex: 1,
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          padding: "35px 40px",
        }}
      >
        {/* HEADER with proper logo */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "25px",
          }}
        >
          <img
            src={logo}
            alt="Dreamfit Couture"
            style={{
              maxWidth: "200px",
              maxHeight: "70px",
              objectFit: "contain",
            }}
          />
          <div style={{ textAlign: "right" }}>
            <h1
              style={{
                color: "#be185d",
                fontSize: "26px",
                fontWeight: "800",
                margin: 0,
                letterSpacing: "0.5px",
              }}
            >
              INVOICE & RECEIPT
            </h1>
            <p
              style={{
                color: "#64748b",
                fontSize: "13px",
                margin: "4px 0 0 0",
              }}
            >
              Advance Payment Received
            </p>
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            height: "2px",
            background: "linear-gradient(90deg, #be185d 0%, #fbcfe8 100%)",
            marginBottom: "25px",
          }}
        />

        {/* Order Info Row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "25px",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "13px",
                color: "#64748b",
                margin: "0 0 4px 0",
              }}
            >
              Order Number
            </p>
            <p style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>
              #{order.orderId || "DF-001"}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p
              style={{
                fontSize: "13px",
                color: "#64748b",
                margin: "0 0 4px 0",
              }}
            >
              Order Date
            </p>
            <p style={{ fontSize: "16px", fontWeight: "600", margin: 0 }}>
              {formatDate(order.orderDate)}
            </p>
          </div>
        </div>

        {/* Customer Card */}
        <div
          style={{
            backgroundColor: "#f8fafc",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "30px",
            border: "1px solid #f1f5f9",
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  margin: "0 0 8px 0",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Bill To
              </p>
              <p
                style={{
                  fontSize: "18px",
                  fontWeight: "700",
                  margin: "0 0 6px 0",
                  color: "#0f172a",
                }}
              >
                {order.customer?.name || "Guest Customer"}
              </p>
              <p
                style={{ fontSize: "14px", margin: "4px 0", color: "#475569" }}
              >
                📞 {order.customer?.phone || "N/A"}
              </p>
              <p
                style={{ fontSize: "14px", margin: "4px 0", color: "#475569" }}
              >
                ✉️ {order.customer?.email || "N/A"}
              </p>
              <p
                style={{
                  fontSize: "13px",
                  margin: "8px 0 0 0",
                  color: "#64748b",
                  maxWidth: "300px",
                }}
              >
                {order.customer?.addressLine1}
                {order.customer?.addressLine2 && (
                  <>, {order.customer.addressLine2}</>
                )}
                <br />
                {order.customer?.city}, {order.customer?.state}{" "}
                {order.customer?.pincode}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  margin: "0 0 8px 0",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Delivery Date
              </p>
              <p
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#be185d",
                  margin: 0,
                }}
              >
                {formatDate(order.deliveryDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Table Title */}
        <h3
          style={{
            fontSize: "16px",
            fontWeight: "700",
            color: "#0f172a",
            margin: "0 0 15px 0",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span
            style={{
              display: "inline-block",
              width: "4px",
              height: "18px",
              backgroundColor: "#be185d",
              borderRadius: "4px",
            }}
          />
          GARMENT DETAILS
        </h3>

        {/* Professional Table */}
        <div
          style={{
            marginBottom: "30px",
            borderRadius: "12px",
            overflow: "hidden",
            border: "1px solid #e2e8f0",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f1f5f9" }}>
                <th
                  style={{
                    padding: "14px 16px",
                    textAlign: "left",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#334155",
                  }}
                >
                  ID
                </th>
                <th
                  style={{
                    padding: "14px 16px",
                    textAlign: "left",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#334155",
                  }}
                >
                  Garment
                </th>
                <th
                  style={{
                    padding: "14px 16px",
                    textAlign: "center",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#334155",
                  }}
                >
                  Qty
                </th>
                <th
                  style={{
                    padding: "14px 16px",
                    textAlign: "right",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#334155",
                  }}
                >
                  Unit Price (₹)
                </th>
                <th
                  style={{
                    padding: "14px 16px",
                    textAlign: "right",
                    fontSize: "13px",
                    fontWeight: "600",
                    color: "#334155",
                  }}
                >
                  Total (₹)
                </th>
              </tr>
            </thead>
            <tbody>
              {garments.map((g, idx) => {
                const total = calculateGarmentTotal(g);
                const quantity = getQuantity(g);
                return (
                  <tr key={idx} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td
                      style={{
                        padding: "14px 16px",
                        fontSize: "13px",
                        color: "#64748b",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontWeight: "600",
                          color: "#475569",
                        }}
                      >
                        {getGarmentId(g, idx)}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ fontWeight: "600", color: "#0f172a" }}>
                        {g.name}
                      </div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>
                        {g.fabric || g.category?.name || "—"}
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        textAlign: "center",
                        color: "#334155",
                        fontWeight: "600",
                      }}
                    >
                      {quantity}
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        textAlign: "right",
                        fontFamily: "monospace",
                      }}
                    >
                      {g.finalizedPrice !== undefined && g.finalizedPrice !== null && g.finalizedPrice !== "" ? (
                        <>₹{Number(g.finalizedPrice).toLocaleString('en-IN')}</>
                      ) : (
                        <>₹{(g.priceRange?.max || 0).toLocaleString('en-IN')}</>
                      )}
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        textAlign: "right",
                        fontFamily: "monospace",
                        fontWeight: "600",
                        color: "#be185d",
                      }}
                    >
                      <>₹{total.toLocaleString('en-IN')}</>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: "#f8fafc" }}>
                <td
                  colSpan="4"
                  style={{
                    padding: "16px",
                    textAlign: "right",
                    fontSize: "15px",
                    fontWeight: "600",
                  }}
                >
                  Subtotal
                </td>
                <td
                  style={{
                    padding: "16px",
                    textAlign: "right",
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "#be185d",
                  }}
                >
                  ₹{finalizedSubtotal.toLocaleString('en-IN')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Payment + Delivery Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
            marginBottom: "40px",
          }}
        >
          {/* Payment Card */}
          <div
            style={{
              backgroundColor: "#f8fafc",
              borderRadius: "16px",
              padding: "20px",
              border: "1px solid #f1f5f9",
            }}
          >
            <h4
              style={{
                fontSize: "15px",
                fontWeight: "700",
                color: "#0f172a",
                margin: "0 0 16px 0",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  width: "4px",
                  height: "16px",
                  backgroundColor: "#be185d",
                  borderRadius: "4px",
                }}
              />
              PAYMENT SUMMARY
            </h4>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ color: "#475569" }}>Advance Paid</span>
                <span style={{ fontWeight: "600", color: "#059669" }}>
                  ₹{advance}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ color: "#475569" }}>Payment Mode</span>
                <span style={{ fontWeight: "500", color: "#334155" }}>
                  {order.advancePayment?.method || "UPI"}
                </span>
              </div>
              <div
                style={{
                  height: "1px",
                  backgroundColor: "#e2e8f0",
                  margin: "8px 0",
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontWeight: "600", color: "#be185d" }}>
                  Balance Due
                </span>
                <span
                  style={{
                    fontWeight: "700",
                    color: "#be185d",
                    fontSize: "18px",
                  }}
                >
                  ₹{balanceDue.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Card */}
          <div
            style={{
              backgroundColor: "#f8fafc",
              borderRadius: "16px",
              padding: "20px",
              border: "1px solid #f1f5f9",
            }}
          >
            <h4
              style={{
                fontSize: "15px",
                fontWeight: "700",
                color: "#0f172a",
                margin: "0 0 16px 0",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  width: "4px",
                  height: "16px",
                  backgroundColor: "#be185d",
                  borderRadius: "4px",
                }}
              />
              DELIVERY INFO
            </h4>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <div>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    margin: "0 0 4px 0",
                  }}
                >
                  Estimated Delivery
                </p>
                <p
                  style={{
                    fontSize: "18px",
                    fontWeight: "700",
                    color: "#be185d",
                    margin: 0,
                  }}
                >
                  {formatDate(order.deliveryDate)}
                </p>
              </div>
              {order.specialNotes && (
                <div>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                      margin: "0 0 4px 0",
                    }}
                  >
                    Special Instructions
                  </p>
                  <p
                    style={{
                      fontSize: "13px",
                      margin: 0,
                      fontStyle: "italic",
                      color: "#475569",
                    }}
                  >
                    "{order.specialNotes}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer with Signature */}
        <div
          style={{
            marginTop: "30px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            borderTop: "2px dashed #e2e8f0",
            paddingTop: "25px",
          }}
        >
          <div>
            <h3
              style={{
                color: "#0f172a",
                fontSize: "18px",
                fontWeight: "700",
                margin: "0 0 4px 0",
              }}
            >
              DREAMFIT COUTURE
            </h3>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "2px 0" }}>
              {import.meta.env.VITE_COMPANY_ADDRESS || "No.10, Karanai Pudhucheri Main Road, Urapakkam, Chengalpet - 603 210"}
            </p>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "2px 0" }}>
              📞 {import.meta.env.VITE_COMPANY_PHONE || "+91 739 722 8655"} | ✉️{" "}
              {import.meta.env.VITE_EAMIL || "dreamfitcouture55@gmail.com"}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                borderTop: "2px solid #be185d",
                width: "200px",
                paddingTop: "10px",
              }}
            >
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#be185d",
                  margin: 0,
                }}
              >
                Authorized Signature
              </p>
              <p
                style={{
                  fontSize: "11px",
                  color: "#94a3b8",
                  margin: "4px 0 0 0",
                }}
              >
                For Dreamfit Couture
              </p>
            </div>
          </div>
        </div>

        {/* Thank You Note */}
        {/* <div style={{ marginTop: "30px", textAlign: "center" }}>
          <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
            Thank you for your business, {order.customer?.name?.split(" ")[0] || "Valued Customer"}!
          </p>
          <p style={{ fontSize: "10px", color: "#94a3b8", marginTop: "12px" }}>
            Invoice #{order.orderId || "DF-001"} • Generated on {new Date().toLocaleDateString("en-GB")}
          </p>
        </div> */}

        {/* Thank You Note */}
        <div style={{ marginTop: "30px", textAlign: "center" }}>
          <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>
            Thank you for your business,{" "}
            {order.customer?.name || "Valued Customer"}!
          </p>
          <p style={{ fontSize: "10px", color: "#94a3b8", marginTop: "12px" }}>
            Invoice #{order.orderId || "DF-001"} • Generated on{" "}
            {new Date().toLocaleDateString("en-GB")}
          </p>
        </div>
      </div>
    </div>
  );
});

export default OrderInvoice;
