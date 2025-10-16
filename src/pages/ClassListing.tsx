import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClassCard } from '../components/ClassCard';
import { useAuth } from '../contexts/AuthContext';
import { useClasses } from '../hooks/useClasses';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useUserRegistrations } from '../hooks/useRegistrations';
import { useCancelRegistration } from '../hooks/useRegistrations';



export const ClassListing: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: classes = [], isLoading: loading, error } = useClasses();

  // Fetch current user's registrations and build a quick lookup set
  const { data: registrations = [], refetch: refetchRegistrations } = useUserRegistrations(user?.id);
  const bookedClassIds = useMemo(() => new Set(registrations.map(r => r.class_id)), [registrations]);
  const registrationIdByClassId = useMemo(() => new Map(registrations.map(r => [r.class_id, r.id])), [registrations]);

  const { mutateAsync: cancelRegistration } = useCancelRegistration();



  const handleRegister = (classId: string) => {
    if (!user) {
      // Redirect to login/register page
      navigate('/auth');
      return;
    }
    
    // Navigate to registration page
    navigate(`/register/${classId}`);
  };

  const handleLogin = () => {
    navigate('/auth');
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const handleAdmin = () => {
    navigate('/admin');
  };

  const handleUnregister = async (classId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    const registrationId = registrationIdByClassId.get(classId);
    if (!registrationId) {
      return;
    }
    try {
      await cancelRegistration(registrationId);
      // Manually refetch registrations to ensure UI updates
      await refetchRegistrations();
    } catch (error) {
      console.error('Error unregistering from class:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };



  // Sort classes by date (ascending)
  const sortedClasses = useMemo(() => {
    return [...classes].sort((a, b) => {
      return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
    });
  }, [classes]);

  if (loading) {
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
      {/* Header */}
      <header className="bg-[#8b3625] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-0 sm:h-16">

            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <h1 className="text-2xl font-bold text-white">Classes</h1>
              {user ? (
                <>
                  <button
                    onClick={handleProfile}
                    className="text-white hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Profile
                  </button>
                  {user?.is_admin && (
                    <button
                      onClick={handleAdmin}
                      className="bg-[#A8A38F] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#9A9585]"
                    >
                      Admin
                    </button>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="text-white hover:text-gray-200 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={handleLogin}
                  className="text-white hover:text-gray-200 px-3 py-2 rounded-md text-base font-medium flex items-center"
                >
                  Login →
                </button>
              )}
            </div>
          </div>
        </div>
      </header>



      {/* Class List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">Failed to load classes</p>
          </div>
        )}

        {sortedClasses.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <PlusIcon className="h-12 w-12" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {classes.length === 0 ? 'No classes available' : 'No classes match your filters'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {classes.length === 0 
                ? 'Check back later for upcoming yoga classes.'
                : 'Try adjusting your filters to see more classes.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-0">
            {sortedClasses.map((yogaClass) => (
              <ClassCard
                key={yogaClass.id}
                yogaClass={yogaClass}
                onRegister={handleRegister}
                isAuthenticated={!!user}
                isBooked={bookedClassIds.has(yogaClass.id)}
                onUnregister={handleUnregister}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
