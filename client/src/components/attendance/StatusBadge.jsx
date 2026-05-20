export default function StatusBadge({ status }) {
  let bgColor, textColor, dotColor;

  switch (status) {
    case "Present":
      bgColor = "bg-emerald-100/80";
      textColor = "text-emerald-700";
      dotColor = "bg-emerald-500";
      break;
    case "Absent":
      bgColor = "bg-rose-100/80";
      textColor = "text-rose-700";
      dotColor = "bg-rose-500";
      break;
    case "Leave":
      bgColor = "bg-blue-100/80";
      textColor = "text-blue-700";
      dotColor = "bg-blue-500";
      break;
    case "Half Day":
      bgColor = "bg-yellow-100/80";
      textColor = "text-yellow-700";
      dotColor = "bg-yellow-500";
      break;
    case "Late":
      bgColor = "bg-orange-100/80";
      textColor = "text-orange-700";
      dotColor = "bg-orange-500";
      break;
    case "Not Marked":
      bgColor = "bg-slate-200/50";
      textColor = "text-slate-400";
      dotColor = "bg-slate-300";
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
