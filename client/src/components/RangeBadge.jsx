import React from "react";
import { formatPriceRange } from "../utils/rangeUtils";

export default function RangeBadge({ min, max, type = "standard", className = "" }) {
  const formatted = formatPriceRange(min, max);

  let bgClass = "bg-blue-50 text-blue-700 border border-blue-200";
  if (type === "paid") {
    bgClass = "bg-green-50 text-green-700 border border-green-200";
  } else if (type === "balance") {
    bgClass = "bg-amber-50 text-amber-700 border border-amber-200";
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap tracking-wide select-none ${bgClass} ${className}`}
    >
      {formatted}
    </span>
  );
}
