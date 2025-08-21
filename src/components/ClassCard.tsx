import React, { useState } from 'react';
import type { YogaClass } from '../types';
import { CalendarIcon, ClockIcon, UserIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

interface ClassCardProps {
  yogaClass: YogaClass;
  onRegister: (classId: string) => void;
  isAuthenticated: boolean;
}

export const ClassCard: React.FC<ClassCardProps> = ({
  yogaClass,
  onRegister,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getEndTime = (startTime: string) => {
    const start = new Date(startTime);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // Add 1 hour
    return formatTime(end.toISOString());
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        {/* Class Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {yogaClass.name}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {yogaClass.brief_description}
            </p>
          </div>
          {yogaClass.is_cancelled && (
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              Cancelled
            </span>
          )}
        </div>

        {/* Class Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <CalendarIcon className="h-4 w-4 mr-2" />
            <span>{formatDate(yogaClass.start_time)}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <ClockIcon className="h-4 w-4 mr-2" />
            <span>
              {formatTime(yogaClass.start_time)} - {getEndTime(yogaClass.start_time)}
            </span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <UserIcon className="h-4 w-4 mr-2" />
            <span>{yogaClass.instructor}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <CurrencyDollarIcon className="h-4 w-4 mr-2" />
            <span>${yogaClass.price}</span>
          </div>
        </div>

        {/* Expandable Details */}
        <div className="mb-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
          
          {showDetails && (
            <div className="mt-3 p-4 bg-gray-50 rounded-md">
              <p className="text-gray-700 text-sm leading-relaxed">
                {yogaClass.full_description}
              </p>
            </div>
          )}
        </div>

        {/* Register Button */}
        <div className="flex justify-end">
          <button
            onClick={() => onRegister(yogaClass.id)}
            disabled={yogaClass.is_cancelled}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              yogaClass.is_cancelled
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            }`}
          >
            {yogaClass.is_cancelled ? 'Cancelled' : 'Register'}
          </button>
        </div>
      </div>
    </div>
  );
};
