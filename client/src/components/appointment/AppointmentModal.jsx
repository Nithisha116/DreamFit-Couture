import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Clock, User, AlignLeft, MapPin } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { createAppointment, updateAppointment, deleteAppointment } from '../../features/appointment/appointmentSlice';
import showToast from '../../utils/toast';

export default function AppointmentModal({ isOpen, onClose, event, slotInfo }) {
  const dispatch = useDispatch();
  const { customers } = useSelector((state) => state.customer);
  const { users } = useSelector((state) => state.user); // if users are fetched, or tailors
  
  const [formData, setFormData] = useState({
    customer: '',
    appointmentType: 'measurement',
    title: '',
    startTime: '',
    endTime: '',
    duration: 30,
    status: 'scheduled',
    location: 'Store',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (event) {
      // Editing existing event
      setFormData({
        customer: event.customer?._id || event.customer || '',
        appointmentType: event.appointmentType || 'measurement',
        title: event.title || '',
        startTime: new Date(event.startTime).toISOString().slice(0, 16),
        endTime: new Date(event.endTime).toISOString().slice(0, 16),
        duration: event.duration || 30,
        status: event.status || 'scheduled',
        location: event.location || 'Store',
        notes: event.notes || '',
      });
    } else if (slotInfo) {
      // Creating new event from slot
      const start = slotInfo.start;
      const end = slotInfo.end;
      const duration = Math.round((end.getTime() - start.getTime()) / 60000);
      
      setFormData(prev => ({
        ...prev,
        startTime: new Date(start.getTime() - (start.getTimezoneOffset() * 60000)).toISOString().slice(0, 16),
        endTime: new Date(end.getTime() - (end.getTimezoneOffset() * 60000)).toISOString().slice(0, 16),
        duration: duration || 30,
      }));
    } else {
      // Create new event without slot (e.g. "New Booking" button)
      const now = new Date();
      now.setMinutes(Math.ceil(now.getMinutes() / 30) * 30);
      const end = new Date(now.getTime() + 30 * 60000);
      
      setFormData(prev => ({
        ...prev,
        startTime: new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16),
        endTime: new Date(end.getTime() - (end.getTimezoneOffset() * 60000)).toISOString().slice(0, 16),
        duration: 30,
      }));
    }
  }, [event, slotInfo]);

  // Auto-calculate end time when start time or duration changes
  const handleTimeChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      if (field === 'startTime' || field === 'duration') {
        const start = new Date(newData.startTime);
        if (!isNaN(start.getTime())) {
          const end = new Date(start.getTime() + (parseInt(newData.duration) || 30) * 60000);
          newData.endTime = new Date(end.getTime() - (end.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
        }
      }
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer) {
      return showToast.error("Please select a customer");
    }

    setIsSubmitting(true);
    try {
      const dataToSubmit = {
        ...formData,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
      };

      if (event) {
        await dispatch(updateAppointment({ id: event._id, appointmentData: dataToSubmit })).unwrap();
        showToast.success("Appointment updated");
      } else {
        await dispatch(createAppointment(dataToSubmit)).unwrap();
        showToast.success("Appointment created");
      }
      onClose();
    } catch (error) {
      showToast.error(error || "Failed to save appointment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      try {
        await dispatch(deleteAppointment(event._id)).unwrap();
        showToast.success("Appointment deleted");
        onClose();
      } catch (error) {
        showToast.error(error || "Failed to delete appointment");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-slate-100 bg-slate-50">
          <div>
            <h2 className="text-xl font-black text-slate-800">
              {event ? 'Edit Appointment' : 'New Appointment'}
            </h2>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
              {formData.appointmentType}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Customer Selection */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-500 mb-2 flex items-center gap-2">
              <User size={14} className="text-blue-500"/>
              Customer *
            </label>
            <select
              required
              value={formData.customer}
              onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
            >
              <option value="">Select a Customer</option>
              {customers?.map(c => (
                <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>
              ))}
            </select>
          </div>

          {/* Type & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-2">
                Type
              </label>
              <select
                value={formData.appointmentType}
                onChange={(e) => setFormData({ ...formData, appointmentType: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
              >
                <option value="measurement">Measurement</option>
                <option value="fitting">Fitting / Trial</option>
                <option value="delivery">Delivery</option>
                <option value="consultation">Consultation</option>
                <option value="alteration">Alteration</option>
                <option value="home_visit">Home Visit</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-slate-500 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
              >
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="missed">Missed</option>
                <option value="rescheduled">Rescheduled</option>
              </select>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-black uppercase text-slate-500 mb-2 flex items-center gap-2">
                <CalendarIcon size={14} className="text-blue-500"/>
                Start Time
              </label>
              <input
                type="datetime-local"
                required
                value={formData.startTime}
                onChange={(e) => handleTimeChange('startTime', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-black uppercase text-slate-500 mb-2 flex items-center gap-2">
                <Clock size={14} className="text-blue-500"/>
                Duration (mins)
              </label>
              <select
                value={formData.duration}
                onChange={(e) => handleTimeChange('duration', parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
              >
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>1 Hour</option>
                <option value={90}>1.5 Hours</option>
                <option value={120}>2 Hours</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-500 mb-2 flex items-center gap-2">
              <MapPin size={14} className="text-blue-500"/>
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
              placeholder="e.g. Main Store"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-black uppercase text-slate-500 mb-2 flex items-center gap-2">
              <AlignLeft size={14} className="text-blue-500"/>
              Notes
            </label>
            <textarea
              rows="3"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium resize-none"
              placeholder="Any specific instructions or notes..."
            />
          </div>
          
        </form>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          {event ? (
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              Delete
            </button>
          ) : (
            <div></div>
          )}
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
            >
              {isSubmitting ? 'Saving...' : 'Save Appointment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
