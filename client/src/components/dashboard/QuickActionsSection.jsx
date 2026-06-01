import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  UserPlus, 
  ShoppingCart, 
  Calendar, 
  Package
} from 'lucide-react';

export default function QuickActionsSection({ basePath }) {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Add Customer',
      icon: UserPlus,
      color: 'from-emerald-500 to-teal-500',
      bgLight: 'bg-emerald-50',
      textLight: 'text-emerald-700',
      borderLight: 'border-emerald-100',
      description: 'Register a new client',
      onClick: () => navigate(`${basePath}/add-customer`)
    },
    {
      label: 'Create Order',
      icon: ShoppingCart,
      color: 'from-blue-500 to-indigo-500',
      bgLight: 'bg-blue-50',
      textLight: 'text-blue-700',
      borderLight: 'border-blue-100',
      description: 'Start a new workflow',
      onClick: () => navigate(`${basePath}/orders/new`)
    },
    {
      label: 'Add Appointment',
      icon: Calendar,
      color: 'from-orange-500 to-amber-500',
      bgLight: 'bg-orange-50',
      textLight: 'text-orange-700',
      borderLight: 'border-orange-100',
      description: 'Schedule a fitting',
      onClick: () => navigate(`${basePath}/appointments`)
    },
    {
      label: 'Inventory',
      icon: Package,
      color: 'from-purple-500 to-fuchsia-500',
      bgLight: 'bg-purple-50',
      textLight: 'text-purple-700',
      borderLight: 'border-purple-100',
      description: 'Manage shop stock',
      onClick: () => navigate(`${basePath}/products`)
    }
  ];

  return (
    <div className="mb-6 lg:mb-8">
      <h2 className="text-lg font-black text-slate-800 mb-4 px-1 flex items-center gap-2">
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border ${action.borderLight} bg-white shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden`}
          >
            {/* Subtle background glow effect on hover */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br ${action.color} transition-opacity duration-300`} />
            
            <div className={`w-12 h-12 mb-3 rounded-full flex items-center justify-center ${action.bgLight} ${action.textLight} group-hover:scale-110 transition-transform duration-300 shadow-sm relative z-10`}>
              <action.icon 
                size={22} 
                strokeWidth={2.5} 
              />
            </div>
            
            <h3 className="font-bold text-slate-700 text-sm mb-1 relative z-10">
              {action.label}
            </h3>
            
            <p className="text-[10px] text-slate-400 font-medium text-center leading-tight relative z-10 hidden sm:block">
              {action.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
