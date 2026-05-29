import React from 'react';
import { X, User, Clock, MapPin, Edit, Trash2, Calendar as CalIcon, Tag } from 'lucide-react';
import { format } from 'date-fns';
import StatusBadge, { STATUS_CONFIG } from './StatusBadge';

export default function AppointmentDrawer({ isOpen, onClose, appointment, onEdit, onDelete, onStatusChange }) {
  if (!isOpen || !appointment) return null;

  const start = new Date(appointment.startTime);
  const end = new Date(appointment.endTime);
  const durationMins = (end.getTime() - start.getTime()) / 60000;
  const customerName = appointment.customer?.name || appointment.customerName || 'Unknown Client';
  const customerPhone = appointment.customer?.phone || appointment.phone || 'No phone number';
  const customerInitials = customerName.charAt(0).toUpperCase();
  const tailorName = appointment.tailor?.name || 'Unassigned';

  return (
    <div className={`fixed inset-0 z-[100] flex justify-end transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`relative w-full max-w-md bg-white h-full shadow-[0_0_40px_rgba(0,0,0,0.1)] flex flex-col transform transition-transform duration-300 ease-out border-l border-slate-100 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white">
          <div>
            <h2 className="text-xl font-black text-slate-800">Appointment Details</h2>
            <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-wider font-semibold">Booking ID: #{appointment._id?.substring(0,6).toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors bg-white shadow-sm border border-slate-100 hover:scale-105 active:scale-95">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 bg-slate-50/30">
          
          {/* Status & Timing Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className={`absolute top-0 left-0 w-1.5 h-full ${STATUS_CONFIG[appointment.status]?.bar || 'bg-blue-500'}`}></div>
            
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-extrabold text-slate-800 text-lg capitalize">
                  {appointment.title || appointment.appointmentType || 'Consultation'}
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5 mt-1.5">
                  <Tag size={12} /> {appointment.appointmentType}
                </p>
              </div>
              <StatusBadge status={appointment.status} />
            </div>

            <div className="pt-4 border-t border-slate-50 flex items-center gap-3 text-sm font-semibold text-slate-700">
              <div className="flex-1 flex flex-col items-center gap-1 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                <CalIcon size={16} className="text-blue-500 shrink-0" />
                <span className="truncate text-xs">{format(start, 'dd MMM yyyy')}</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                <Clock size={16} className="text-indigo-500 shrink-0" />
                <span className="truncate text-xs">{format(start, 'hh:mm a')}</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                <Clock size={16} className="text-emerald-500 shrink-0" />
                <span className="truncate text-xs">{durationMins} mins</span>
              </div>
            </div>
          </div>

          {/* Client & Staff Info */}
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-3">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Client Information</h4>
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-4 hover:border-blue-200 transition-colors cursor-pointer group">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg shadow-inner group-hover:scale-105 transition-transform">
                  {customerInitials}
                </div>
                <div>
                  <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{customerName}</p>
                  <p className="text-xs font-medium text-slate-500 mt-0.5 flex items-center gap-1">
                    <User size={12} /> {customerPhone}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Assigned Staff</h4>
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center">
                  <User size={14} />
                </div>
                <div>
                  <p className="font-bold text-slate-700 text-sm">{tailorName}</p>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Tailor</p>
                </div>
                <button onClick={() => onEdit(appointment)} className="ml-auto text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">Reassign</button>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-3 mt-3">
                <div className="w-8 h-8 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center">
                  <User size={14} />
                </div>
                <div>
                  <p className="font-bold text-slate-700 text-sm">{appointment.createdBy?.name || 'Admin'}</p>
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Created By</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {appointment.notes && (
            <div className="space-y-3">
              <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Notes & Requirements</h4>
              <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-100/50 text-sm font-medium text-slate-700 whitespace-pre-wrap leading-relaxed">
                {appointment.notes}
              </div>
            </div>
          )}

          {/* Status Update Quick Action */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Quick Status Update</h4>
            <div className="flex flex-wrap gap-2">
              {Object.keys(STATUS_CONFIG).map((key) => {
                const isActive = appointment.status === key;
                return (
                  <button
                    key={key}
                    onClick={() => onStatusChange(appointment._id, key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      isActive 
                        ? 'bg-slate-800 text-white border-slate-800 shadow-md scale-105' 
                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    {STATUS_CONFIG[key].label}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-white grid grid-cols-2 gap-3">
          <button 
            onClick={() => onEdit(appointment)}
            className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95"
          >
            <Edit size={16} /> Reschedule / Edit
          </button>
          <button 
            onClick={() => {
              if (window.confirm('Are you sure you want to cancel/delete this appointment?')) {
                onDelete(appointment._id);
              }
            }}
            className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 px-4 py-3 rounded-xl font-bold transition-all active:scale-95"
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>

      </div>
    </div>
  );
}
