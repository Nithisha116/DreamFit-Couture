import { Users, CheckCircle, XCircle, Clock, CalendarDays } from "lucide-react";

export default function AttendanceStats({ stats }) {
  const cards = [
    {
      title: "Total Employees",
      value: stats?.totalEmployees || 0,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      borderColor: "border-blue-100",
    },
    {
      title: "Present Today",
      value: stats?.presentToday || 0,
      icon: CheckCircle,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      borderColor: "border-emerald-100",
    },
    {
      title: "Absent Today",
      value: stats?.absentToday || 0,
      icon: XCircle,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      borderColor: "border-rose-100",
    },
    {
      title: "Late Employees",
      value: stats?.lateEmployees || 0,
      icon: Clock,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      borderColor: "border-orange-100",
    },
    {
      title: "On Leave",
      value: stats?.onLeave || 0,
      icon: CalendarDays,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      borderColor: "border-purple-100",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`bg-white rounded-2xl p-5 border ${card.borderColor} shadow-sm hover:shadow-md transition-shadow`}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-600">{card.title}</h3>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${card.bg}`}>
              <card.icon className={card.color} size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
