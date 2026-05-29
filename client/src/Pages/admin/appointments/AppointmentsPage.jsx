import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Calendar as BigCalendar, 
  dateFnsLocalizer,
  Views 
} from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

// Import our custom components and actions
import { 
  fetchAppointments, 
  createAppointment, 
  updateAppointment, 
  deleteAppointment 
} from '../../../features/appointment/appointmentSlice';
import AppointmentModal from './components/AppointmentModal';
import AppointmentDrawer from './components/AppointmentDrawer';
import StatusBadge, { STATUS_CONFIG } from './components/StatusBadge';

import { Calendar as CalIcon, Plus, Filter, Search, Clock, User, Scissors } from 'lucide-react';

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

const DragAndDropCalendar = withDragAndDrop(BigCalendar);

export default function AppointmentsPage() {
  const dispatch = useDispatch();
  
  // State from Redux
  const { appointments, isLoading } = useSelector((state) => state.appointment);
  
  // Local State
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [filterText, setFilterText] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState(Views.WEEK);

  useEffect(() => {
    dispatch(fetchAppointments());
  }, [dispatch]);

  // Convert backend appointments to react-big-calendar format
  const events = useMemo(() => {
    let filtered = appointments || [];
    if (filterText) {
      filtered = filtered.filter(a => 
        (a.customer?.name || '').toLowerCase().includes(filterText.toLowerCase()) ||
        (a.title || '').toLowerCase().includes(filterText.toLowerCase())
      );
    }

    return filtered.map(appt => {
      const config = STATUS_CONFIG[appt.status] || STATUS_CONFIG['scheduled'];
      return {
        ...appt,
        start: new Date(appt.startTime),
        end: new Date(appt.endTime),
        title: `${appt.customer?.name || appt.customerName || 'Unknown'}`,
        resource: appt,
        colorClass: config.color, // used for background/border
        barClass: config.bar, // used for left side indicator
        shadowClass: config.shadow, // used for hover glow
      };
    });
  }, [appointments, filterText]);

  // Handle Drag & Drop Rescheduling
  const moveEvent = useCallback(
    ({ event, start, end }) => {
      const updatedData = {
        startTime: start.toISOString(),
        endTime: end.toISOString()
      };
      dispatch(updateAppointment({ id: event._id, appointmentData: updatedData }));
    },
    [dispatch]
  );

  const resizeEvent = useCallback(
    ({ event, start, end }) => {
      const updatedData = {
        startTime: start.toISOString(),
        endTime: end.toISOString()
      };
      dispatch(updateAppointment({ id: event._id, appointmentData: updatedData }));
    },
    [dispatch]
  );

  // Handlers for Calendar Actions
  const handleSelectSlot = (slotInfo) => {
    setSelectedSlot(slotInfo.start);
    setSelectedAppointment(null);
    setIsModalOpen(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedAppointment(event.resource);
    setIsDrawerOpen(true);
  };

  // Handlers for Modals & Drawers
  const handleSaveAppointment = async (data) => {
    try {
      if (selectedAppointment) {
        await dispatch(updateAppointment({ id: selectedAppointment._id, appointmentData: data })).unwrap();
      } else {
        await dispatch(createAppointment(data)).unwrap();
      }
      setIsModalOpen(false);
      setSelectedAppointment(null);
      dispatch(fetchAppointments()); // Refresh to ensure backend calculates exact durations if needed
    } catch (error) {
      alert(`Failed to save appointment: ${error}`);
    }
  };

  const handleDelete = async (id) => {
    await dispatch(deleteAppointment(id));
    setIsDrawerOpen(false);
  };

  const handleStatusChange = async (id, newStatus) => {
    await dispatch(updateAppointment({ id, appointmentData: { status: newStatus } }));
    setIsDrawerOpen(false);
    dispatch(fetchAppointments());
  };

  // Custom Event Component for Premium Look
  const CustomEvent = ({ event }) => {
    // Determine if it's a short event (like 15 mins) to adjust layout
    const durationMins = (event.end.getTime() - event.start.getTime()) / 60000;
    const isShort = durationMins <= 15;

    return (
      <div 
        className={`group relative flex h-full w-full flex-col overflow-hidden rounded-[10px] transition-all duration-300 ease-out cursor-pointer hover:shadow-lg hover:shadow-indigo-500/30 text-white`}
        style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}
        title={`${event.title} - ${event.appointmentType}`}
      >
        {/* Left Status Bar */}
        <div className={`absolute left-0 top-0 bottom-0 w-[5px] ${event.barClass}`} />
        
        <div className="flex flex-col h-full px-2.5 py-1.5 ml-1 overflow-hidden">
          {/* Client Name */}
          <div className="font-extrabold text-[12px] leading-tight truncate tracking-wide">
            {event.title}
          </div>

          {/* Service & Time (Hide if short duration) */}
          {!isShort && (
            <div className="mt-1 flex flex-col gap-0.5 opacity-90">
              <div className="flex items-center gap-1.5 text-[10px] font-medium truncate">
                <span className="truncate capitalize">{event.appointmentType || 'Consultation'}</span>
              </div>
              <div className="flex items-center gap-1 text-[9px] font-semibold tracking-wide opacity-80 mt-auto">
                <Clock size={9} />
                {format(event.start, 'hh:mm a')}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[1600px] mx-auto h-[calc(100vh-100px)] flex flex-col space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700 mb-1.5">
            <CalIcon className="w-3.5 h-3.5" /> Appointments
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800">
            Scheduling
          </h1>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/30 outline-none transition-all"
            />
          </div>
          <button 
            onClick={() => { setSelectedAppointment(null); setSelectedSlot(new Date()); setIsModalOpen(true); }}
            className="flex-shrink-0 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md transition-all hover:-translate-y-0.5"
          >
            <Plus size={18} /> <span className="hidden sm:inline">New Appt</span>
          </button>
        </div>
      </div>

      {/* Calendar Area */}
      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col p-4 relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-sm flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        <DragAndDropCalendar
          localizer={localizer}
          events={events}
          onEventDrop={moveEvent}
          onEventResize={resizeEvent}
          resizable
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          date={currentDate}
          onNavigate={(newDate) => setCurrentDate(newDate)}
          view={currentView}
          onView={(newView) => setCurrentView(newView)}
          views={['month', 'week', 'day']}
          step={15}
          timeslots={4}
          min={new Date(2023, 1, 1, 8, 0)} // Starts at 8am
          max={new Date(2023, 1, 1, 20, 0)} // Ends at 8pm
          components={{
            event: CustomEvent,
          }}
          className="custom-calendar-theme"
          style={{ height: '100%' }}
        />
      </div>

      {/* Modals & Drawers */}
      <AppointmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        selectedDate={selectedSlot}
        initialData={selectedAppointment}
        onSave={handleSaveAppointment}
      />

      <AppointmentDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        appointment={selectedAppointment}
        onEdit={(appt) => { setIsDrawerOpen(false); setSelectedAppointment(appt); setIsModalOpen(true); }}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
