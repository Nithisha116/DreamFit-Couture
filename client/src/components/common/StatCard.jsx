// components/common/StatCard.jsx
import React from 'react';

const StatCard = ({ 
  title, 
  value, 
  icon, 
  bgColor = 'bg-white', 
  borderColor = 'border-slate-200',
  trend = null,
  trendValue = null,
  onClick = null,
  className = '',
  children
}) => {
  return (
    <div 
      className={`${bgColor} ${borderColor} border rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-all ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs md:text-sm text-slate-600 font-medium mb-1">{title}</p>
          <p className="text-xl md:text-2xl lg:text-3xl font-black text-slate-800">{value}</p>
          
          {/* Trend Indicator */}
          {trend && trendValue && (
            <div className="flex items-center gap-1 mt-2">
              {trend === 'up' ? (
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              ) : trend === 'down' ? (
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              ) : null}
              <span className={`text-xs font-medium ${
                trend === 'up' ? 'text-green-600' : 
                trend === 'down' ? 'text-red-600' : 
                'text-slate-600'
              }`}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        
        {/* Icon Container */}
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
          bgColor.includes('gradient') ? 'bg-white/20' : 'bg-white/60'
        }`}>
          {icon}
        </div>
      </div>

      {/* Progress Bar (optional) */}
      {trend === 'progress' && (
        <div className="mt-4">
          <div className="w-full bg-slate-200 rounded-full h-1.5">
            <div 
              className="bg-blue-600 h-1.5 rounded-full" 
              style={{ width: `${trendValue}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Children (optional sub-content) */}
      {children && (
        <div className="mt-2">{children}</div>
      )}
    </div>
  );
};

// Additional specialized stat card variants
export const GradientStatCard = ({ title, value, icon, gradientFrom, gradientTo, ...props }) => {
  return (
    <StatCard
      title={title}
      value={value}
      icon={icon}
      bgColor={`bg-gradient-to-br from-${gradientFrom || 'blue'}-500 to-${gradientTo || 'blue'}-600`}
      borderColor="border-transparent"
      className="text-white"
      {...props}
    />
  );
};

export const IconStatCard = ({ title, value, icon, iconBgColor, iconColor, ...props }) => {
  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-all border border-slate-200">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 ${iconBgColor || 'bg-blue-100'} rounded-xl flex items-center justify-center`}>
          <div className={iconColor || 'text-blue-600'}>
            {icon}
          </div>
        </div>
        <div>
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <p className="text-xl md:text-2xl font-black text-slate-800">{value}</p>
        </div>
      </div>
    </div>
  );
};

export const CompactStatCard = ({ title, value, icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
    yellow: 'bg-yellow-50 text-yellow-600'
  };

  return (
    <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 mb-1">{title}</p>
          <p className="text-lg font-bold text-slate-800">{value}</p>
        </div>
        <div className={`w-8 h-8 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

// Export StatCard as default
export default StatCard;