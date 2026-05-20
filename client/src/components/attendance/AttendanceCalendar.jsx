import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function AttendanceCalendar({ data, currentDate, onMonthChange }) {
  const [hoveredEvent, setHoveredEvent] = useState(null);

  // Get days in month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();

    return { daysInMonth, firstDayIndex };
  };

  const { daysInMonth, firstDayIndex } = getDaysInMonth(currentDate);

  // Create array of days to render (including blanks for first row offset)
  const daysArray = Array.from({ length: firstDayIndex + daysInMonth }, (_, i) => {
    if (i < firstDayIndex) return null;
    return i - firstDayIndex + 1;
  });

  const getDayRecords = (day) => {
    if (!day) return [];
    const targetDateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
    return data.filter(record => new Date(record.attendanceDate).toDateString() === targetDateStr);
  };

  const getDotColor = (status) => {
    switch (status) {
      case "Present": return "bg-emerald-500";
      case "Absent": return "bg-rose-500";
      case "Leave": return "bg-blue-500";
      case "Half Day": return "bg-yellow-500";
      case "Late": return "bg-orange-500";
      default: return "bg-slate-300";
    }
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-100">
        <h2 className="text-lg font-bold text-slate-800">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={() => onMonthChange(-1)}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            onClick={() => onMonthChange(1)}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {/* Days of week */}
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-2">
          {daysArray.map((day, idx) => {
            const records = getDayRecords(day);
            const isToday = day === new Date().getDate() && 
                            currentDate.getMonth() === new Date().getMonth() && 
                            currentDate.getFullYear() === new Date().getFullYear();

            return (
              <div 
                key={idx} 
                className={`min-h-[100px] border rounded-xl p-2 transition-colors relative group ${
                  day ? "bg-white border-slate-100 hover:border-purple-300" : "bg-slate-50/50 border-transparent"
                } ${isToday ? "ring-2 ring-purple-400 border-transparent" : ""}`}
              >
                {day && (
                  <>
                    <span className={`text-sm font-semibold mb-2 inline-block ${isToday ? "text-purple-600" : "text-slate-700"}`}>
                      {day}
                    </span>
                    
                    <div className="flex flex-wrap gap-1 mt-1">
                      {records.slice(0, 8).map((record, i) => (
                        <div 
                          key={record._id || i}
                          className="relative"
                          onMouseEnter={() => setHoveredEvent(record._id)}
                          onMouseLeave={() => setHoveredEvent(null)}
                        >
                          <div className={`w-2.5 h-2.5 rounded-full cursor-pointer ${getDotColor(record.status)}`} />
                          
                          {/* Tooltip */}
                          {hoveredEvent === record._id && (
                            <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-slate-800 text-white text-xs rounded-lg p-2 shadow-xl">
                              <p className="font-bold border-b border-slate-600 pb-1 mb-1">{record.employeeName}</p>
                              <p><span className="text-slate-400">Status:</span> {record.status}</p>
                              <p><span className="text-slate-400">Shift:</span> {record.shift}</p>
                              {(record.checkInTime || record.checkOutTime) && (
                                <p><span className="text-slate-400">Time:</span> {record.checkInTime || "-"} to {record.checkOutTime || "-"}</p>
                              )}
                              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                            </div>
                          )}
                        </div>
                      ))}
                      {records.length > 8 && (
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-200 flex items-center justify-center cursor-pointer" title={`+${records.length - 8} more`}>
                           <span className="text-[8px] font-bold text-slate-600 leading-none">+</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Legend */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-4 items-center justify-center text-sm text-slate-600 font-medium">
        <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Present</span>
        <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div> Absent</span>
        <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div> Leave</span>
        <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div> Half Day</span>
        <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div> Late</span>
      </div>
    </div>
  );
}
