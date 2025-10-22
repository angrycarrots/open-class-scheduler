import React, { useMemo, useState } from 'react';
import { useClasses } from '../hooks/useClasses';
import { AttendeeModal } from '../components/AttendeeModal';
import { CalendarIcon, ClockIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

export const AdminEnrolled: React.FC = () => {
  const navigate = useNavigate();
  const { data: classes = [], isLoading, error } = useClasses();
  const [viewingAttendees, setViewingAttendees] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const sortedClasses = useMemo(() => {
    return [...classes].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  }, [classes]);

  const filteredClasses = useMemo(() => {
    if (showAll) return sortedClasses;
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);
    start.setDate(start.getDate() - 7);
    end.setDate(end.getDate() + 7);
    return sortedClasses.filter(c => {
      const t = new Date(c.start_time).getTime();
      return t >= start.getTime() && t <= end.getTime();
    });
  }, [sortedClasses, showAll]);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleBack = () => navigate('/');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B4E44] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading classes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-[#8b3625] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button onClick={handleBack} className="text-white hover:text-gray-200 p-2 rounded-md">
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <h1 className="text-2xl font-bold text-white">Enrolled</h1>
            </div>
            <div className="flex items-center gap-3 text-white">
              <span className="text-sm">Show All</span>
              <button
                role="switch"
                aria-checked={showAll}
                onClick={() => setShowAll(v => !v)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white ${showAll ? 'bg-green-400' : 'bg-gray-300'}`}
                title="Toggle to show all classes"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showAll ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">Failed to load classes</p>
          </div>
        )}

        {filteredClasses.length === 0 ? (
          <div className="text-center py-12 text-gray-600">No classes found.</div>
        ) : (
          <div className="divide-y divide-gray-200 bg-white rounded-md">
            {filteredClasses.map((yogaClass) => (
              <button
                key={yogaClass.id}
                onClick={() => setViewingAttendees(yogaClass.id)}
                className="w-full text-left py-4 px-2 sm:px-4 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A8A38F]"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-lg font-semibold text-[#A8A38F]">{yogaClass.name}</div>
                    <div className="mt-1 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        {formatDate(yogaClass.start_time)}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <ClockIcon className="h-4 w-4" />
                        {formatTime(yogaClass.start_time)}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      <AttendeeModal classId={viewingAttendees} onClose={() => setViewingAttendees(null)} />
    </div>
  );
};
