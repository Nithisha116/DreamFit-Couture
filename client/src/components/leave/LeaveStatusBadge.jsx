import React from "react";

export default function LeaveStatusBadge({ status }) {
  let bgColor, textColor, dotColor;

  switch (status) {
    case "Approved":
      bgColor = "bg-emerald-100/80";
      textColor = "text-emerald-700";
      dotColor = "bg-emerald-500";
      break;
    case "Rejected":
      bgColor = "bg-rose-100/80";
      textColor = "text-rose-700";
      dotColor = "bg-rose-500";
      break;
    case "Pending":
      bgColor = "bg-amber-100/80";
      textColor = "text-amber-700";
      dotColor = "bg-amber-500";
      break;
    case "Cancelled":
      bgColor = "bg-slate-100/80";
      textColor = "text-slate-700";
      dotColor = "bg-slate-500";
      break;
    default:
      bgColor = "bg-slate-100";
      textColor = "text-slate-700";
      dotColor = "bg-slate-500";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${bgColor} ${textColor} border border-white/20 shadow-sm`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
      {status}
    </span>
  );
}
