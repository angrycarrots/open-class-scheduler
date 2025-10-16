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
  const [showUnregisterDialog, setShowUnregisterDialog] = useState(false);

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
  const today = new Date(yogaClass.start_time).toDateString() === new Date().toDateString();

  const handleUnregisterClick = () => {
    if (isBooked) {
      setShowUnregisterDialog(true);
    } else {
      onRegister(yogaClass.id);
    }
  };

  const handleConfirmUnregister = () => {
    if (onUnregister) {
      onUnregister(yogaClass.id);
    }
    setShowUnregisterDialog(false);
  };

  const handleCancelUnregister = () => {
    setShowUnregisterDialog(false);
  };

  return (
    <div className="border-b border-gray-200 py-6">
      <div className="flex flex-row flex-wrap gap-6 sm:flex-nowrap sm:items-start sm:gap-8">
        {/* Left Column - Date & Time */}
        <div className="w-28 flex-shrink-0 flex flex-col items-start gap-1 text-left">
          <div className="flex items-baseline gap-2">
            <div className="text-4xl font-bold text-gray-900 leading-none">{dateInfo.day}</div>
            <div className="text-base font-medium text-gray-600">{dateInfo.dayName}</div>
          </div>
          <div className="text-sm text-gray-600 uppercase tracking-wide">{dateInfo.month}</div>
          <div className="text-sm font-medium text-gray-700">{dateInfo.time}</div>
          {(today || tomorrow) && (
            <div className="mt-1">
              <span className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full uppercase tracking-wide">
                {today ? 'Today' : 'Tomorrow'}
              </span>
            </div>
          )}
        </div>

        {/* Right Column - Class Details & Action */}
        <div className="flex-1 min-w-[12rem] flex flex-col gap-3">
          <h3 className="text-xl font-semibold text-[#A8A38F] leading-snug">
            {yogaClass.name}
          </h3>
          <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            {yogaClass.instructor}
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center text-sm font-medium text-[#6B4E44] hover:text-[#8b3625]"
          >
            &gt; Details
          </button>
          <div className="flex flex-col gap-2 sm:items-end">
            <button
              onClick={handleUnregisterClick}
              disabled={yogaClass.is_cancelled}
              className={`w-full sm:w-auto px-6 py-2 rounded font-medium transition-colors ${
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
              <div className="text-xs text-gray-600 text-center sm:text-right">You are registered.</div>
            )}
          </div>

          {/* Expandable Details */}
          {showDetails && (
            <div className="mt-2 p-4 bg-gray-50 rounded-md">
              <p className="text-gray-700 text-sm leading-relaxed">
                {yogaClass.full_description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Unregister Confirmation Dialog */}
      {showUnregisterDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Unregister
            </h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to unregister from <strong>{yogaClass.name}</strong>?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelUnregister}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUnregister}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
