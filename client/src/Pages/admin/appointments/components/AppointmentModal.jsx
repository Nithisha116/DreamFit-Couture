import React, { useState, useEffect } from 'react';
import { X, Search, User, Phone, MapPin, Calendar as CalIcon, Clock } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { searchCustomerByPhoneApi, getAllCustomersApi } from '../../../../features/customer/customerApi';
import Select from 'react-select';

const APPOINTMENT_TYPES = [
  { value: 'consultation', label: 'Consultation' },
  { value: 'measurement', label: 'Measurement' },
  { value: 'fitting', label: 'Fitting / Trial' },
  { value: 'alteration', label: 'Alteration' },
  { value: 'delivery', label: 'Delivery' },
];

export default function AppointmentModal({ isOpen, onClose, selectedDate, onSave, initialData }) {
  const [formData, setFormData] = useState({
    customer: '',
    customerName: '',
    phone: '',
    appointmentType: 'consultation',
    title: '',
    description: '',
    date: '',
    time: '10:00',
    duration: 30,
    notes: '',
  });

  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [customerOptions, setCustomerOptions] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [conflictWarning, setConflictWarning] = useState('');

  // Get appointments from redux for conflict checking
  const { appointments } = useSelector((state) => state.appointment);

  // Load all customers for the dropdown
  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoadingOptions(true);
      try {
        const res = await getAllCustomersApi();
        const customersData = res?.customers || res?.data || [];
        if (customersData.length > 0) {
          // Format for react-select: match by name or phone
          const options = customersData.map(c => {
            const fullName = c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Unknown';
            return {
              value: c._id,
              label: `${fullName} - ${c.phone}`,
              customer: c
            };
          });
          setCustomerOptions(options);
        }
      } catch (error) {
        console.error("Failed to load customers for search", error);
      } finally {
        setIsLoadingOptions(false);
      }
    };
    if (isOpen) {
      fetchCustomers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          ...initialData,
          customer: initialData.customer?._id || initialData.customer || '',
          customerName: initialData.customer?.name || initialData.customerName || '',
          phone: initialData.customer?.phone || initialData.phone || '',
          date: initialData.startTime ? new Date(initialData.startTime).toISOString().split('T')[0] : '',
          time: initialData.startTime ? new Date(initialData.startTime).toTimeString().substring(0, 5) : '10:00',
        });
      } else {
        setFormData({
          customer: '',
          customerName: '',
          phone: '',
          appointmentType: 'consultation',
          title: '',
          description: '',
          date: selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          time: selectedDate ? selectedDate.toTimeString().substring(0, 5) : '10:00',
          duration: 30,
          notes: '',
        });
      }
    }
  }, [isOpen, selectedDate, initialData]);

  if (!isOpen) return null;

  const handleCustomerSelect = (selectedOption) => {
    if (selectedOption) {
      const c = selectedOption.customer;
      const fullName = c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Unknown';
      setFormData(prev => ({
        ...prev,
        customer: c._id,
        customerName: fullName,
        phone: c.phone
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        customer: '',
        customerName: '',
        phone: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.customer) {
      alert("Please select a client from the search results.");
      return;
    }

    // Construct Date objects for backend
    const startDateTime = new Date(`${formData.date}T${formData.time}`);
    const endDateTime = new Date(startDateTime.getTime() + formData.duration * 60000);

    const payload = {
      ...formData,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
    };
    
    // Conflict Check
    if (appointments?.length > 0) {
      const isConflict = appointments.some(appt => {
        // Don't conflict with itself if editing
        if (initialData && appt._id === initialData._id) return false;
        
        const apptStart = new Date(appt.startTime).getTime();
        const apptEnd = new Date(appt.endTime).getTime();
        const newStart = startDateTime.getTime();
        const newEnd = endDateTime.getTime();

        return (newStart < apptEnd && newEnd > apptStart);
      });

      if (isConflict && !window.confirm('This slot is already occupied.\n\nOverride (Admin only)?')) {
        return;
      }
    }

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-black text-slate-800">
              {initialData ? 'Edit Appointment' : 'New Appointment'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">Schedule a session with a client.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form id="appointment-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Client Search Section */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
              <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <User size={16} className="text-blue-500" /> Client Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Search Client (Name or Phone)</label>
                  <Select
                    options={customerOptions}
                    isLoading={isLoadingOptions}
                    isClearable
                    placeholder="Type name or number..."
                    onChange={handleCustomerSelect}
                    value={formData.customer ? { value: formData.customer, label: `${formData.customerName} - ${formData.phone}` } : null}
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderRadius: '0.75rem',
                        borderColor: '#e2e8f0',
                        padding: '2px',
                        boxShadow: 'none',
                        '&:hover': {
                          borderColor: '#cbd5e1'
                        }
                      })
                    }}
                  />
                  {searchError && <p className="text-red-500 text-xs mt-1">{searchError}</p>}
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Client Name</label>
                  <input 
                    type="text"
                    readOnly
                    placeholder="Auto-filled from search"
                    value={formData.customerName}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 text-sm outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Appointment Details Section */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Appointment Type</label>
                  <select 
                    value={formData.appointmentType}
                    onChange={(e) => setFormData({...formData, appointmentType: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                  >
                    {APPOINTMENT_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Title (Optional)</label>
                  <input 
                    type="text"
                    placeholder="e.g. Wedding Dress Trial"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
                  <input 
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Time</label>
                  <input 
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Duration (mins)</label>
                  <select 
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: Number(e.target.value)})}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                  >
                    <option value={15}>15 mins</option>
                    <option value={30}>30 mins</option>
                    <option value={45}>45 mins</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Additional Notes</label>
                <textarea 
                  rows={3}
                  placeholder="Measurement link, whatsapp remarks, etc..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
                />
              </div>

            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-4 md:p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 rounded-b-3xl">
          <button 
            type="button" 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-semibold text-sm text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="appointment-form"
            disabled={!formData.customer}
            className="px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Save Appointment
          </button>
        </div>

      </div>
    </div>
  );
}
