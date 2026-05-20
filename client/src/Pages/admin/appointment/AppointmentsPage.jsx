import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { Plus, Search, Calendar as CalendarIcon, Filter } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAppointments, updateAppointment } from '../../../features/appointment/appointmentSlice';
import { fetchAllCustomers } from '../../../features/customer/customerSlice';
import AppointmentModal from '../../../components/appointment/AppointmentModal';
import showToast from '../../../utils/toast';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const DnDCalendar = withDragAndDrop(Calendar);

export default function AppointmentsPage() {
  const dispatch = useDispatch();
  const { appointments, isLoading } = useSelector((state) => state.appointment);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [currentView, setCurrentView] = useState(Views.WEEK);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    dispatch(fetchAppointments());
    dispatch(fetchAllCustomers());
  }, [dispatch]);

  const events = useMemo(() => {
    return appointments.map(appt => ({
      ...appt,
      start: new Date(appt.startTime),
      end: new Date(appt.endTime),
      title: `${appt.customer?.name || 'Customer'} - ${appt.appointmentType}`,
    }));
  }, [appointments]);

  const handleSelectSlot = (slotInfo) => {
    setSelectedSlot(slotInfo);
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setSelectedSlot(null);
    setIsModalOpen(true);
  };

  const handleEventDrop = async ({ event, start, end }) => {
    try {
      const durationMs = end.getTime() - start.getTime();
      const durationMinutes = Math.round(durationMs / 60000);

      const appointmentData = {
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        duration: durationMinutes,
      };

      await dispatch(updateAppointment({ id: event._id, appointmentData })).unwrap();
      showToast.success('Appointment rescheduled');
      dispatch(fetchAppointments());
    } catch (error) {
      showToast.error(error || 'Failed to reschedule appointment');
    }
  };

  const handleEventResize = async ({ event, start, end }) => {
    try {
      const durationMs = end.getTime() - start.getTime();
      const durationMinutes = Math.round(durationMs / 60000);

      const appointmentData = {
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        duration: durationMinutes,
      };

      await dispatch(updateAppointment({ id: event._id, appointmentData })).unwrap();
      showToast.success('Appointment duration updated');
      dispatch(fetchAppointments());
    } catch (error) {
      showToast.error(error || 'Failed to update duration');
    }
  };

  const eventStyleGetter = (event) => {
    let backgroundColor = '#3b82f6'; // default blue (confirmed)
    
    switch (event.status) {
      case 'completed': backgroundColor = '#10b981'; break; // green
      case 'scheduled': backgroundColor = '#f59e0b'; break; // yellow/amber
      case 'cancelled': backgroundColor = '#ef4444'; break; // red
      case 'missed': backgroundColor = '#6b7280'; break; // gray
      case 'rescheduled': backgroundColor = '#8b5cf6'; break; // purple
      default: break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block',
        fontSize: '0.8rem',
        fontWeight: '500',
        padding: '2px 5px',
      }
    };
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    setSelectedSlot(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-blue-600" />
            Appointments
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Manage schedule, fittings, and deliveries
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search appointments..."
              className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">
            <Filter size={16} />
            <span className="hidden sm:inline">Filter</span>
          </button>
          
          <button
            onClick={() => { setSelectedEvent(null); setSelectedSlot(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            <Plus size={16} />
            <span>New Booking</span>
          </button>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 h-[700px]">
          <DnDCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            view={currentView}
            onView={setCurrentView}
            date={currentDate}
            onNavigate={setCurrentDate}
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            onEventDrop={handleEventDrop}
            onEventResize={handleEventResize}
            resizable
            eventPropGetter={eventStyleGetter}
            min={new Date(0, 0, 0, 8, 0, 0)} // Start at 8 AM
            max={new Date(0, 0, 0, 21, 0, 0)} // End at 9 PM
            step={30}
            timeslots={2}
            views={['month', 'week', 'day', 'agenda']}
            defaultView={Views.WEEK}
          />
        </div>
      </div>

      {/* Appointment Modal */}
      {isModalOpen && (
        <AppointmentModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          event={selectedEvent}
          slotInfo={selectedSlot}
        />
      )}
    </div>
  );
}
