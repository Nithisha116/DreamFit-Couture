import { useMemo, useState } from "react";
import {
  addDays,
  format,
  startOfWeek,
  isSameDay,
  setHours,
  setMinutes,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Calendar as CalIcon,
} from "lucide-react";

const SLOT_START = 8;
const SLOT_END = 17;
const SLOT_MIN = 30;

function buildSlots() {
  const list = [];
  for (let h = SLOT_START; h <= SLOT_END; h++) {
    for (const m of [0, 30]) {
      if (h === SLOT_END && m > 0) break;
      list.push({ h, m });
    }
  }
  return list;
}

const SLOTS = buildSlots();

const INITIAL_APPTS = [
  {
    id: "ap-1",
    start: setMinutes(setHours(new Date(2026, 4, 12), 10), 0),
    client: "Mrs. Amika",
    tailor: "taniya",
    outfit: "Blouse fitting",
    status: "Confirmed",
  },
  {
    id: "ap-2",
    start: setMinutes(setHours(new Date(2026, 4, 14), 15), 30),
    client: "Rashika",
    tailor: "rakesh",
    outfit: "Embroidery review",
    status: "Pending",
  },
];

export default function AppointmentsPage() {
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(2026, 4, 11), { weekStartsOn: 1 }),
  );
  const [search, setSearch] = useState("");
  const [appointments, setAppointments] = useState(INITIAL_APPTS);
  const [modal, setModal] = useState(null);

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const apptForCell = (day, slot) => {
    const start = setMinutes(setHours(day, slot.h), slot.m);
    return appointments.find((a) => {
      if (!isSameDay(a.start, day)) return false;
      return (
        a.start.getHours() === start.getHours() &&
        a.start.getMinutes() === start.getMinutes()
      );
    });
  };

  const filteredAppts = appointments.filter((a) =>
    `${a.client} ${a.outfit}`
      .toLowerCase()
      .includes(search.trim().toLowerCase()),
  );

  return (
    <div className="max-w-[1400px] mx-auto space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700 mb-3">
            <CalIcon className="w-3.5 h-3.5" />
            Styling suite
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Appointments
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Weekly boutique calendar with tailor assignment and slot states.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setWeekStart((d) => addDays(d, -7))}
            className="p-2 rounded-xl border border-slate-200 hover:bg-white bg-slate-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setWeekStart((d) => addDays(d, 7))}
            className="p-2 rounded-xl border border-slate-200 hover:bg-white bg-slate-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="px-4 py-2 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-800 shadow-sm">
            {format(weekStart, "MMM d")} – {format(addDays(weekStart, 6), "MMM d, yyyy")}
          </div>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search client…"
          className="w-full pl-10 pr-3 py-2.5 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/30 outline-none"
        />
      </div>

      <div className="rounded-3xl bg-white border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[720px]">
            <div
              className="grid border-b border-slate-100 bg-slate-50/90"
              style={{ gridTemplateColumns: `96px repeat(7, minmax(0,1fr))` }}
            >
              <div className="p-2 text-[10px] font-black uppercase text-slate-400">
                Time
              </div>
              {days.map((d) => {
                const today = isSameDay(d, new Date());
                return (
                  <div
                    key={d.toISOString()}
                    className={`p-2 text-center border-l border-slate-100 ${
                      today ? "bg-blue-50/80" : ""
                    }`}
                  >
                    <div className="text-[10px] font-black uppercase text-slate-500">
                      {format(d, "EEE")}
                    </div>
                    <div className="text-sm font-black text-slate-900">
                      {format(d, "d")}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="max-h-[520px] overflow-y-auto">
              {SLOTS.map((slot) => (
                <div
                  key={`${slot.h}-${slot.m}`}
                  className="grid border-b border-slate-50 hover:bg-slate-50/50"
                  style={{
                    gridTemplateColumns: `96px repeat(7, minmax(0,1fr))`,
                  }}
                >
                  <div className="p-2 text-xs font-mono text-slate-500 flex items-center">
                    {format(
                      setMinutes(setHours(new Date(2026, 0, 1), slot.h), slot.m),
                      "h:mm a",
                    )}
                  </div>
                  {days.map((d) => {
                    const appt = filteredAppts.find((a) => {
                      if (!isSameDay(a.start, d)) return false;
                      return (
                        a.start.getHours() === slot.h &&
                        a.start.getMinutes() === slot.m
                      );
                    });
                    const free = !appt;
                    return (
                      <button
                        key={`${d}-${slot.h}-${slot.m}`}
                        type="button"
                        onClick={() => {
                          if (appt) setModal({ type: "view", appt });
                          else {
                            const start = setMinutes(
                              setHours(d, slot.h),
                              slot.m,
                            );
                            setModal({
                              type: "create",
                              start,
                              client: "",
                              tailor: "taniya",
                              outfit: "",
                            });
                          }
                        }}
                        className={`border-l border-slate-100 min-h-[40px] p-1 text-left transition-all ${
                          free
                            ? "hover:bg-blue-50/60"
                            : "bg-gradient-to-br from-blue-600/90 to-indigo-600 text-white"
                        }`}
                      >
                        {appt && (
                          <div className="px-1 py-0.5 rounded-lg bg-white/10 text-[10px] font-bold leading-tight">
                            {appt.client}
                            <span className="block font-normal opacity-90 capitalize">
                              {appt.tailor}
                            </span>
                          </div>
                        )}
                        {free && (
                          <span className="text-[9px] text-slate-300 px-1">
                            Free
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/45 backdrop-blur-sm"
            aria-label="Close"
            onClick={() => setModal(null)}
          />
          <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-100 p-6">
            <button
              type="button"
              onClick={() => setModal(null)}
              className="absolute top-4 right-4 p-2 rounded-xl hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            {modal.type === "view" ? (
              <>
                <h2 className="text-lg font-black text-slate-900">
                  Appointment
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {format(modal.appt.start, "EEE d MMM yyyy · h:mm a")}
                </p>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Client</dt>
                    <dd className="font-bold">{modal.appt.client}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Tailor</dt>
                    <dd className="font-bold capitalize">{modal.appt.tailor}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Outfit</dt>
                    <dd className="font-bold">{modal.appt.outfit}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-slate-500">Status</dt>
                    <dd className="font-bold">{modal.appt.status}</dd>
                  </div>
                </dl>
              </>
            ) : (
              <>
                <h2 className="text-lg font-black text-slate-900">
                  New appointment
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {format(modal.start, "EEE d MMM yyyy · h:mm a")}
                </p>
                <div className="mt-4 space-y-3">
                  <label className="block text-xs font-bold text-slate-500">
                    Client
                    <input
                      value={modal.client}
                      onChange={(e) =>
                        setModal((m) => ({ ...m, client: e.target.value }))
                      }
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-xs font-bold text-slate-500">
                    Outfit / purpose
                    <input
                      value={modal.outfit}
                      onChange={(e) =>
                        setModal((m) => ({ ...m, outfit: e.target.value }))
                      }
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block text-xs font-bold text-slate-500">
                    Tailor
                    <select
                      value={modal.tailor}
                      onChange={(e) =>
                        setModal((m) => ({ ...m, tailor: e.target.value }))
                      }
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm capitalize"
                    >
                      {[
                        "taniya",
                        "rakesh",
                        "kamali",
                        "priyanka",
                        "vinum",
                      ].map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!modal.client.trim()) return;
                    setAppointments((a) => [
                      ...a,
                      {
                        id: `ap-${Date.now()}`,
                        start: modal.start,
                        client: modal.client.trim(),
                        tailor: modal.tailor,
                        outfit: modal.outfit.trim() || "Consultation",
                        status: "Pending",
                      },
                    ]);
                    setModal(null);
                  }}
                  className="mt-6 w-full rounded-2xl bg-[#1E6BFF] text-white font-bold py-3 hover:bg-blue-700"
                >
                  Save appointment
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
