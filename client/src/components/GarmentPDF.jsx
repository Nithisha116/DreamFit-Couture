import React, { forwardRef, useImperativeHandle, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";
import logo from "../assets/logo.png";

const GarmentPDF = forwardRef(({ garment, order, job }, ref) => {
  const pdfRef = useRef();

  // Safely extract details for tracking, stages, and order data
  const trackingId = job?.workflowTrackingId || job?.orderId || order?.orderId || "N/A";
  const activeStage = job?.activeStage || "Purchase";
  const currentStagesList = job?.stages || [
    "purchase",
    "cutting",
    "stitching",
    "final_finishing",
    "ironing_packing",
    "trial",
    "alteration",
    "delivered"
  ];

  const getBase64Image = (url) => {
    return new Promise((resolve) => {
      if (!url) return resolve(null);
      if (url.startsWith('data:')) return resolve(url);
      if (url.startsWith('/') || url.includes('assets')) return resolve(url);
      
      const img = new Image();
      const cacheBuster = url.includes('?') ? `&cb=${Date.now()}` : `?cb=${Date.now()}`;
      img.src = url + cacheBuster;
      img.crossOrigin = "Anonymous";
      
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          canvas.getContext("2d").drawImage(img, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      setTimeout(() => resolve(null), 6000);
    });
  };

  useImperativeHandle(ref, () => ({
    handleDownload: async () => {
      try {
        const element = pdfRef.current;
        if (!element) return;

        // Automatically convert external images to base64 to avoid CORS issues
        const images = element.querySelectorAll("img");
        const conversionPromises = Array.from(images).map(async (img) => {
          const src = img.src;
          if (src && (src.startsWith('http') || src.includes('r2.dev'))) {
            const base64 = await getBase64Image(src);
            if (base64) {
              img.src = base64;
              return new Promise((r) => {
                img.onload = () => r(true);
                img.onerror = () => r(false);
              });
            }
          }
          return true;
        });
        
        await Promise.all(conversionPromises);
        await new Promise((r) => setTimeout(r, 800)); // Paint delay window

        const pdf = new jsPDF("p", "mm", "a4");
        const pageIds = ["pdf-page-1", "pdf-page-2", "pdf-page-3"];

        for (let i = 0; i < pageIds.length; i++) {
          const targetNode = document.getElementById(pageIds[i]);
          if (!targetNode) continue;

          document.body.appendChild(targetNode);
          
          const canvas = await html2canvas(targetNode, {
            scale: 2.5,
            useCORS: true,
            backgroundColor: "#ffffff",
            logging: false,
          });

          document.body.removeChild(targetNode);

          const imgData = canvas.toDataURL("image/png", 1.0);
          const imgWidth = pdf.internal.pageSize.getWidth();
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          if (i > 0) pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
        }

        pdf.save(`job-card-${trackingId}.pdf`);
      } catch (err) {
        console.error("PDF generation failed:", err);
        alert("Failed to render output accurately.");
      }
    }
  }));

  const allImages = [
    ...(garment?.referenceImages || []).map(img => img.url),
    ...(garment?.customerImages || []).map(img => img.url),
    ...(garment?.customerClothImages || []).map(img => img.url)
  ].filter(Boolean).slice(0, 4); // Keep a maximum of 4 images for a perfect grid look

  return (
    <div style={{ position: "absolute", left: "-9999px", top: "-9999px", zIndex: -1 }}>
      <div ref={pdfRef} style={{ width: "210mm", backgroundColor: "#ffffff" }}>
        
        {/* === PAGE 1: HEADER & WORKFLOW PIPELINE === */}
        <div id="pdf-page-1" style={{ width: "210mm", height: "297mm", padding: "20mm", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #6366f1", paddingBottom: "15px", marginBottom: "20px" }}>
              <img src={logo} alt="Logo" style={{ height: "45px", objectFit: "contain" }} crossOrigin="anonymous" />
              <div style={{ textAlign: "right" }}>
                <h1 style={{ color: "#4f46e5", fontSize: "22px", margin: 0, fontWeight: "900" }}>PRODUCTION JOB CARD</h1>
                <p style={{ margin: "3px 0 0 0", fontSize: "12px", color: "#64748b", fontWeight: "bold" }}>Tracking ID: {trackingId}</p>
              </div>
            </div>

            <div style={{ backgroundColor: "#f8fafc", padding: "15px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "25px" }}>
              <h2 style={{ fontSize: "16px", color: "#1e293b", margin: "0 0 10px 0", fontWeight: "800" }}>{garment?.name || "dummy order 2.0"}</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "12px", color: "#475569" }}>
                <p style={{ margin: 0 }}><b>Category:</b> {garment?.categoryName || "Blouses"}</p>
                <p style={{ margin: 0 }}><b>Due Date:</b> {garment?.dueDate || "01 Jul 2026"}</p>
                <p style={{ margin: 0 }}><b>Item:</b> {garment?.itemName || "Pattern Blouse Stitching (Basic)"}</p>
                <p style={{ margin: 0 }}><b>Priority:</b> <span style={{ color: "#ef4444", fontWeight: "bold" }}>{garment?.priority || "Normal"}</span></p>
              </div>
            </div>

            <h3 style={{ fontSize: "13px", color: "#4f46e5", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "15px", fontWeight: "800" }}>WORKFLOW PIPELINE</h3>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "30px" }}>
              {currentStagesList.map((stage, idx) => {
                const isActive = stage.toLowerCase() === activeStage.toLowerCase();
                return (
                  <div key={idx} style={{ padding: "8px 12px", borderRadius: "8px", border: isActive ? "2px solid #4f46e5" : "1px solid #e2e8f0", backgroundColor: isActive ? "#eef2ff" : "#ffffff", color: isActive ? "#4f46e5" : "#64748b", fontSize: "11px", fontWeight: "bold", textAlign: "center", minWidth: "75px" }}>
                    <div style={{ fontSize: "9px", color: isActive ? "#6366f1" : "#94a3b8" }}>Stage {idx + 1}</div>
                    {stage.charAt(0).toUpperCase() + stage.slice(1)}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "10px", textAlign: "center", fontSize: "10px", color: "#94a3b8" }}>
            Tracking: {trackingId} | Page 1 of 3
          </div>
        </div>

        {/* === PAGE 2: MEASUREMENTS & SCAN QR CODE === */}
        <div id="pdf-page-2" style={{ width: "210mm", height: "297mm", padding: "20mm", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: "14px", color: "#1e293b", borderLeft: "4px solid #4f46e5", paddingLeft: "10px", marginBottom: "20px", fontWeight: "800" }}>MEASUREMENTS SPECIFICATION</h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "40px" }}>
              {garment?.measurements?.length > 0 ? (
                garment.measurements.map((m, idx) => (
                  <div key={idx} style={{ padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px", backgroundColor: "#f8fafc" }}>
                    <span style={{ fontSize: "10px", color: "#64748b", fontWeight: "bold", textTransform: "uppercase", display: "block" }}>{m.name}</span>
                    <span style={{ fontSize: "15px", fontWeight: "800", color: "#4f46e5" }}>{m.value} <small style={{ fontSize: "10px", color: "#94a3b8" }}>{m.unit || "inches"}</small></span>
                  </div>
                ))
              ) : (
                // Clean default values if no custom parameters exist yet
                ["dressLength", "topLength", "blouseLength", "shoulder", "frontNeckDepth", "backNeckDepth"].map((name, idx) => (
                  <div key={idx} style={{ padding: "12px", border: "1px solid #e2e8f0", borderRadius: "8px", backgroundColor: "#f8fafc" }}>
                    <span style={{ fontSize: "10px", color: "#64748b", fontWeight: "bold", textTransform: "uppercase", display: "block" }}>{name}</span>
                    <span style={{ fontSize: "15px", fontWeight: "800", color: "#4f46e5" }}>30 <small style={{ fontSize: "10px", color: "#94a3b8" }}>inches</small></span>
                  </div>
                ))
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "40px", padding: "25px", border: "2px dashed #e2e8f0", borderRadius: "16px", backgroundColor: "#fafafa" }}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${trackingId}`} alt="Scan QR" style={{ width: "120px", height: "120px" }} crossOrigin="anonymous" />
              <div>
                <h4 style={{ margin: "0 0 5px 0", fontSize: "14px", color: "#1e293b", fontWeight: "800" }}>Scan to Advance Lifecycle</h4>
                <p style={{ margin: 0, fontSize: "11px", color: "#64748b", lineHeight: "1.5" }}>Scanning this QR code auto-routes tracking logs instantly forward directly into the next phase step of production.</p>
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "10px", textAlign: "center", fontSize: "10px", color: "#94a3b8" }}>
            Tracking: {trackingId} | Page 2 of 3
          </div>
        </div>

        {/* === PAGE 3: IMAGE ATTACHMENTS === */}
        <div id="pdf-page-3" style={{ width: "210mm", height: "297mm", padding: "20mm", boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: "14px", color: "#1e293b", borderLeft: "4px solid #4f46e5", paddingLeft: "10px", marginBottom: "20px", fontWeight: "800" }}>ATTACHED REFERENCE GALLERIES</h2>
            
            {allImages.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                {allImages.map((url, idx) => (
                  <div key={idx} style={{ border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden", backgroundColor: "#f8fafc", height: "190px" }}>
                    <img src={url} alt={`Attachment ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} crossOrigin="anonymous" />
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: "center", color: "#94a3b8", fontStyle: "italic", fontSize: "12px", paddingTop: "40px" }}>No reference styles or fabrics attached to this job card file mapping context.</p>
            )}
          </div>

          <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "10px", textAlign: "center", fontSize: "10px", color: "#94a3b8" }}>
            Tracking: {trackingId} | Page 3 of 3
          </div>
        </div>

      </div>
    </div>
  );
});

export default GarmentPDF;