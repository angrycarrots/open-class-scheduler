import React, { useState } from 'react';
import type { YogaClass } from '../types';

interface ClassCardProps {
  yogaClass: YogaClass;
  onRegister: (classId: string) => void;
  isAuthenticated: boolean;
  isBooked?: boolean;
  onUnregister?: (classId: string) => void;
}

export const ClassCard: React.FC<ClassCardProps> = ({
  yogaClass,
  onRegister,
  isBooked = false,
  onUnregister,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      month: date.toLocaleDateString('en-US', { month: 'long' }),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    };
  };

  const isTomorrow = (dateString: string) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const classDate = new Date(dateString);
    return classDate.toDateString() === tomorrow.toDateString();
  };

  const dateInfo = formatDate(yogaClass.start_time);
  const tomorrow = isTomorrow(yogaClass.start_time);

  return (
    <div className="border-b border-gray-200 py-6">
      <div className="flex">
        {/* Left Column - Date & Time */}
        <div className="w-24 flex-shrink-0 mr-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{dateInfo.day}</div>
            <div className="text-sm text-gray-600">{dateInfo.dayName}</div>
            <div className="text-sm text-gray-600">{dateInfo.month}</div>
            {tomorrow && (
              <div className="mt-1">
                <span className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                  Tomorrow
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Class Details & Action */}
        <div className="flex-1 flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {yogaClass.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {yogaClass.brief_description}
                </p>
                
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <span className="mr-1">👤</span>
                  {yogaClass.instructor}
                </div>
                
                <div className="text-sm text-gray-500">
                  ${yogaClass.price}
                </div>
              </div>
              
              <div className="text-right ml-4">
                <div className="text-sm text-gray-600 mb-2">{dateInfo.time}</div>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  &gt; Details
                </button>
              </div>
            </div>

            {/* Expandable Details */}
            {showDetails && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <p className="text-gray-700 text-sm leading-relaxed">
                  {yogaClass.full_description}
                </p>
              </div>
            )}
          </div>

          {/* Register Button */}
          <div className="ml-6 flex-shrink-0">
            <button
              onClick={() => (isBooked ? onUnregister && onUnregister(yogaClass.id) : onRegister(yogaClass.id))}
              disabled={yogaClass.is_cancelled}
              className={`px-6 py-2 rounded font-medium transition-colors ${
                yogaClass.is_cancelled
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : isBooked
                    ? 'bg-gray-300 text-gray-700 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2'
                    : 'bg-[#A8A38F] text-white hover:bg-[#9A9585] focus:outline-none focus:ring-2 focus:ring-[#A8A38F] focus:ring-offset-2'
              }`}
            >
              {yogaClass.is_cancelled ? 'CANCELLED' : isBooked ? 'UNREGISTER' : 'REGISTER'}
            </button>
            {isBooked && !yogaClass.is_cancelled && (
              <div className="mt-2 text-xs text-gray-600 text-center">You are registered.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
