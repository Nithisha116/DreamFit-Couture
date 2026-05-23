import React, { forwardRef, useImperativeHandle, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";
import logo from "../assets/logo.png";
import { calculatePaymentSummary } from "../utils/paymentUtils";

const PaymentReceipt = forwardRef(({ 
  order,                    // Order details
  garments = [],            // Garments list (for order total)
  allPayments = [],         // All payments (for running total)
  currentPayment,           // Current payment to show
}, ref) => {
  const receiptRef = useRef();

  useImperativeHandle(ref, () => ({
    handleDownload: async () => {
      try {
        const element = receiptRef.current;
        if (!element) return;

        const canvas = await html2canvas(element, {
          scale: 3,
          useCORS: true,
          backgroundColor: "#ffffff",
          allowTaint: true,
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
        
        // Dynamic filename: PaymentReceipt_ORDERID_AMOUNT_DATE.pdf
        const date = new Date(currentPayment.paymentDate).toLocaleDateString('en-GB').replace(/\//g, '');
        const fileName = `PaymentReceipt_${order?.orderId || "Order"}_₹${currentPayment.amount}_${date}.pdf`;
        
        pdf.save(fileName);
      } catch (error) {
        console.error("PDF Error:", error);
        alert("Failed to generate PDF");
      }
    },
  }));

  if (!order || !currentPayment) return null;

  // ===== FORMATTING FUNCTIONS =====
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString, timeString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric'
    });
    return `${formattedDate} at ${timeString || '00:00'}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  // ===== CALCULATIONS =====
  const summary = calculatePaymentSummary(order, garments, allPayments);
  const orderTotal = summary.totalAmount;

  // Sort payments by date (oldest first)
  const sortedPayments = [...allPayments].sort((a, b) => 
    new Date(a.paymentDate) - new Date(b.paymentDate)
  );

  // Find current payment index
  const currentPaymentIndex = sortedPayments.findIndex(p => p._id === currentPayment._id);
  
  // Calculate previous payments total (payments before current)
  const previousPayments = sortedPayments.slice(0, currentPaymentIndex);
  const previousTotal = previousPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  // Current payment amount
  const currentAmount = currentPayment.amount || 0;

  // Running totals after this payment
  const totalPaidAfterThis = previousTotal + currentAmount;
  const balance = Math.max(0, orderTotal - totalPaidAfterThis);
  const isReceiptFullyPaid = balance <= 0;

  // Payment status
  const getPaymentStatus = () => {
    if (isReceiptFullyPaid) return "FULLY PAID";
    if (currentPayment.type === 'advance') return "ADVANCE PAYMENT";
    if (currentPayment.type === 'full') return "FULL PAYMENT";
    if (currentPayment.type === 'partial') return "PARTIAL PAYMENT";
    if (currentPayment.type === 'extra') return "EXTRA PAYMENT";
    return "PAYMENT RECEIVED";
  };

  // Generate receipt number
  const receiptNumber = `RCP-${order.orderId}-${new Date(currentPayment.paymentDate).toLocaleDateString('en-GB').replace(/\//g, '')}-${String(currentAmount).padStart(4, '0')}`;

  return (
    <div
      ref={receiptRef}
      style={{
        width: "210mm",
        minHeight: "297mm",
        margin: "0 auto",
        backgroundColor: "#ffffff",
        fontFamily: "'Inter', 'Arial', sans-serif",
        color: "#1e293b",
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      {/* Watermark */}
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
      <div style={{ position: "relative", zIndex: 10, padding: "30px 35px" }}>

        {/* ===== HEADER ===== */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          borderBottom: "2px solid #be185d",
          paddingBottom: "20px",
          marginBottom: "25px"
        }}>
          <img src={logo} alt="Dreamfit" style={{ maxWidth: "160px", maxHeight: "60px", objectFit: "contain" }} />
          <div style={{ textAlign: "right" }}>
            <h1 style={{ color: "#be185d", fontSize: "26px", fontWeight: "800", margin: 0 }}>
              PAYMENT RECEIPT
            </h1>
            <p style={{ color: "#64748b", fontSize: "12px", margin: "4px 0 0 0" }}>
              {receiptNumber}
            </p>
          </div>
        </div>

        {/* ===== RECEIPT DATE ===== */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between",
          backgroundColor: "#f8fafc",
          padding: "15px 20px",
          borderRadius: "10px",
          marginBottom: "25px"
        }}>
          <div>
            <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 4px 0" }}>Receipt Date</p>
            <p style={{ fontSize: "16px", fontWeight: "600", margin: 0 }}>
              {formatDateTime(currentPayment.paymentDate, currentPayment.paymentTime)}
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 4px 0" }}>Payment Mode</p>
            <p style={{ fontSize: "16px", fontWeight: "600", margin: 0, textTransform: "capitalize" }}>
              {currentPayment.method || "UPI"}
              {currentPayment.referenceNumber && (
                <span style={{ fontSize: "12px", color: "#64748b", marginLeft: "8px" }}>
                  (Ref: {currentPayment.referenceNumber})
                </span>
              )}
            </p>
          </div>
        </div>

        {/* ===== CUSTOMER INFO ===== */}
        <div style={{ 
          backgroundColor: "#fdf2f8",
          padding: "20px",
          borderRadius: "12px",
          borderLeft: "6px solid #be185d",
          marginBottom: "30px"
        }}>
          <p style={{ fontSize: "18px", fontWeight: "700", margin: "0 0 5px 0", color: "#be185d" }}>
            {order.customer?.name || "Customer"}
          </p>
          <p style={{ fontSize: "14px", margin: "3px 0", color: "#475569" }}>
            📞 {order.customer?.phone || "N/A"}
          </p>
          <p style={{ fontSize: "13px", margin: "3px 0", color: "#64748b" }}>
            Order ID: #{order.orderId}
          </p>
        </div>

        {/* ===== CURRENT PAYMENT CARD ===== */}
        <div style={{ 
          background: "linear-gradient(135deg, #be185d 0%, #db2777 100%)",
          borderRadius: "16px",
          padding: "25px",
          marginBottom: "30px",
          color: "white",
          boxShadow: "0 10px 25px rgba(190,24,93,0.2)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
            <span style={{ fontSize: "14px", opacity: 0.9 }}>This Payment</span>
            <span style={{ 
              backgroundColor: "rgba(255,255,255,0.2)", 
              padding: "4px 12px", 
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "600"
            }}>
              {getPaymentStatus()}
            </span>
          </div>
          
          <div style={{ fontSize: "48px", fontWeight: "800", marginBottom: "10px" }}>
            {formatCurrency(currentAmount)}
          </div>
          
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.2)",
            paddingTop: "15px",
            marginTop: "5px"
          }}>
            <span>Payment Type: <strong style={{ textTransform: "capitalize" }}>{currentPayment.type || "Advance"}</strong></span>
            {currentPayment.notes && (
              <span style={{ fontSize: "12px", opacity: 0.9 }}>Note: {currentPayment.notes}</span>
            )}
          </div>
        </div>

        {/* ===== PAYMENT SUMMARY TABLE ===== */}
        <div style={{ 
          border: "2px solid #fbcfe8",
          borderRadius: "12px",
          overflow: "hidden",
          marginBottom: "30px"
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#fdf2f8" }}>
                <th style={{ padding: "14px", textAlign: "left", fontSize: "14px", fontWeight: "600", color: "#be185d" }}>
                  Payment Summary
                </th>
                <th style={{ padding: "14px", textAlign: "right", fontSize: "14px", fontWeight: "600", color: "#be185d" }}>
                  Amount (₹)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid #fbcfe8" }}>
                <td style={{ padding: "12px 14px" }}>Order Total</td>
                <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: "600" }}>
                  {formatCurrency(orderTotal)}
                </td>
              </tr>
              
              {/* Previous Payments */}
              {previousPayments.length > 0 && (
                <tr style={{ borderBottom: "1px solid #fbcfe8", backgroundColor: "#f8fafc" }}>
                  <td style={{ padding: "12px 14px", color: "#64748b" }}>
                    Previous Payments ({previousPayments.length})
                  </td>
                  <td style={{ padding: "12px 14px", textAlign: "right", color: "#059669", fontWeight: "600" }}>
                    {formatCurrency(previousTotal)}
                  </td>
                </tr>
              )}

              {/* Current Payment */}
              <tr style={{ borderBottom: "1px solid #fbcfe8", backgroundColor: "#fef2f4" }}>
                <td style={{ padding: "12px 14px", fontWeight: "600" }}>
                  ➤ This Payment
                  <span style={{ 
                    fontSize: "11px", 
                    color: "#64748b", 
                    marginLeft: "8px",
                    display: "block"
                  }}>
                    {formatDate(currentPayment.paymentDate)}
                  </span>
                </td>
                <td style={{ 
                  padding: "12px 14px", 
                  textAlign: "right", 
                  fontWeight: "800", 
                  color: "#be185d",
                  fontSize: "18px"
                }}>
                  {formatCurrency(currentAmount)}
                </td>
              </tr>

              {/* Total Paid So Far */}
              <tr style={{ backgroundColor: "#f0fdf4" }}>
                <td style={{ padding: "14px", fontWeight: "700" }}>TOTAL PAID SO FAR</td>
                <td style={{ padding: "14px", textAlign: "right", fontWeight: "800", color: "#059669", fontSize: "20px" }}>
                  {formatCurrency(totalPaidAfterThis)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ===== RUNNING BALANCE SECTION ===== */}
        <div style={{ 
          backgroundColor: "#fff7ed",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "30px",
          border: "1px solid #fed7aa"
        }}>
          <h3 style={{ color: "#9a3412", fontSize: "16px", fontWeight: "700", margin: "0 0 15px 0" }}>
            BALANCE AFTER THIS PAYMENT
          </h3>
          
          <div style={{ display: "flex", justifycontent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: "13px", color: "#9a3412", margin: "0 0 5px 0" }}>Remaining Balance</p>
              <p style={{ fontSize: "28px", fontWeight: "800", color: "#be185d", margin: 0 }}>
                {formatCurrency(balance)}
              </p>
            </div>
            
            <div style={{ textAlign: "right" }}>
              <span style={{ 
                backgroundColor: isReceiptFullyPaid ? "#dcfce7" : "#fed7aa",
                color: isReceiptFullyPaid ? "#166534" : "#9a3412",
                padding: "6px 15px",
                borderRadius: "25px",
                fontSize: "13px",
                fontWeight: "600"
              }}>
                {isReceiptFullyPaid ? "✓ FULLY PAID" : "⏳ BALANCE PENDING"}
              </span>
            </div>
          </div>
        </div>

        {/* ===== PAYMENT HISTORY PREVIEW ===== */}
        {allPayments.length > 0 && (
          <div style={{ marginBottom: "30px" }}>
            <h4 style={{ fontSize: "14px", fontWeight: "600", color: "#64748b", margin: "0 0 10px 0" }}>
              Payment History
            </h4>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {sortedPayments.map((payment, idx) => {
                const isCurrent = payment._id === currentPayment._id;
                return (
                  <div key={idx} style={{ 
                    display: "flex", 
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px",
                    backgroundColor: isCurrent ? "#fef2f4" : "#f8fafc",
                    border: isCurrent ? "2px solid #be185d" : "1px solid #e2e8f0",
                    borderRadius: "8px"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {isCurrent && <span style={{ color: "#be185d", fontSize: "12px" }}>▶</span>}
                      <div>
                        <p style={{ fontSize: "13px", fontWeight: isCurrent ? "700" : "400", margin: 0 }}>
                          {formatDate(payment.paymentDate)}
                        </p>
                        <p style={{ fontSize: "11px", color: "#64748b", margin: "2px 0 0 0", textTransform: "capitalize" }}>
                          {payment.method} • {payment.type}
                        </p>
                      </div>
                    </div>
                    <p style={{ 
                      fontSize: "15px", 
                      fontWeight: "700", 
                      color: isCurrent ? "#be185d" : "#059669",
                      margin: 0 
                    }}>
                      {formatCurrency(payment.amount)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== FOOTER ===== */}
        <div style={{ 
          marginTop: "30px", 
          paddingTop: "20px", 
          borderTop: "2px dashed #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end"
        }}>
          <div>
            <p style={{ fontSize: "12px", color: "#64748b", margin: "0 0 5px 0" }}>
              Thank you for your payment!
            </p>
            <p style={{ fontSize: "11px", color: "#94a3b8", margin: 0 }}>
              {receiptNumber} • {new Date().toLocaleDateString('en-GB')}
            </p>
          </div>
          
          <div style={{ textAlign: "right" }}>
            <div style={{ borderTop: "2px solid #be185d", width: "180px", paddingTop: "8px" }}>
              <p style={{ fontSize: "12px", fontWeight: "600", color: "#be185d", margin: 0 }}>
                Authorized Signature
              </p>
              <p style={{ fontSize: "9px", color: "#94a3b8", margin: "2px 0 0 0" }}>
                For Dreamfit Couture
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default PaymentReceipt;