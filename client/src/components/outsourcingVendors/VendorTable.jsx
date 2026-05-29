import { Pencil, Trash2, Inbox } from "lucide-react";

export default function VendorTable({
  data = [],
  isLoading,
  onEdit,
  onDelete,
}) {
  const columns = [
    "Vendor Name",
    "Mobile Number",
    "Specialization",
    "Status",
    "Actions",
  ];

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {columns.map((col) => (
                  <th key={col} className="text-left py-4 px-5 text-xs font-bold text-slate-500 uppercase">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b border-slate-50">
                  {columns.map((col, j) => (
                    <td key={j} className="py-4 px-5">
                      <div className="h-4 bg-slate-100 rounded-lg animate-pulse w-20"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col items-center justify-center py-16">
        <Inbox size={48} strokeWidth={1.2} className="mb-3 text-slate-300" />
        <p className="text-sm font-semibold text-slate-500">No vendors found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              {columns.map((col) => (
                <th key={col} className="text-left py-4 px-5 text-xs font-bold text-slate-500 uppercase whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item._id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors duration-150">
                <td className="py-4 px-5 font-medium text-slate-700">{item.vendorName}</td>
                <td className="py-4 px-5 text-slate-600">{item.mobileNumber}</td>
                <td className="py-4 px-5 text-slate-600">{item.workSpecialization}</td>
                <td className="py-4 px-5">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${item.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-4 px-5">
                  <div className="flex items-center gap-2">
                    <button onClick={() => onEdit(item)} className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all" title="Edit">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => onDelete(item._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
