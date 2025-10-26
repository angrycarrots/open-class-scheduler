import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClassCard } from '../components/ClassCard';
import { useAuth } from '../contexts/AuthContext';
import { useClasses } from '../hooks/useClasses';
import { PlusIcon, HomeIcon } from '@heroicons/react/24/outline';
import { useUserRegistrations } from '../hooks/useRegistrations';
import { useCancelRegistration } from '../hooks/useRegistrations';
import { useCreateRegistration } from '../hooks/useRegistrations';
import { useMarkPaymentClicked } from '../hooks/useRegistrations';
import { sendRegistrationEmail } from '../utils/emailFunctions';



export const ClassListing: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: classes = [], isLoading: loading, error } = useClasses();

  // Fetch current user's registrations and build a quick lookup set
  const { data: registrations = [], refetch: refetchRegistrations } = useUserRegistrations(user?.id);
  const bookedClassIds = useMemo(() => new Set(registrations.map(r => r.class_id)), [registrations]);
  const registrationIdByClassId = useMemo(() => new Map(registrations.map(r => [r.class_id, r.id])), [registrations]);
  const paymentClickedByClassId = useMemo(() => new Map(registrations.map(r => [r.class_id, !!r.payment_link_clicked])), [registrations]);

  const { mutateAsync: cancelRegistration } = useCancelRegistration();
  const { mutateAsync: createRegistration } = useCreateRegistration();
  const { mutateAsync: markPaymentClicked } = useMarkPaymentClicked();



  const handleRegister = async (classId: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const yogaClass = classes.find(c => c.id === classId);
    if (!yogaClass) return;

    try {
      await createRegistration({
        classId: yogaClass.id,
        userId: user.id,
        paymentAmount: yogaClass.price,
      });

      // Send confirmation email (best-effort)
      try {
        const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        });
        const formatTime = (timeString: string) => new Date(timeString).toLocaleTimeString('en-US', {
          hour: 'numeric', minute: '2-digit', hour12: true,
        });
        await sendRegistrationEmail(
          user.email,
          user.username || 'Valued Customer',
          yogaClass.name,
          formatDate(yogaClass.start_time),
          formatTime(yogaClass.start_time),
          yogaClass.instructor,
          yogaClass.price,
        );
      } catch (_) {
        // ignore email errors
      }

      // Refresh registrations so button toggles to UNREGISTER
      await refetchRegistrations();
    } catch (e) {
      console.error('Error registering for class:', e);
    }
  };

  const handlePaymentClick = async (classId: string, method: 'venmo' | 'paypal' | 'zelle' | 'square' | 'cash') => {
    if (!user) {
      navigate('/auth');
      return;
    }
    const registrationId = registrationIdByClassId.get(classId);
    if (!registrationId) return;
    try {
      await markPaymentClicked({ registrationId, method });
      await refetchRegistrations();
    } catch (e) {
      console.error('Error marking payment link clicked:', e);
    }
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

  const handleEnrolled = () => {
    navigate('/admin/enrolled');
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
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    return [...classes]
      .filter((yogaClass) => new Date(yogaClass.start_time).getTime() >= startOfToday.getTime())
      .sort((a, b) => {
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
          <div className="flex flex-row flex-wrap items-center justify-between gap-3 sm:gap-4 py-4 sm:py-0 h-auto sm:h-16">

            <div className="flex flex-row flex-wrap items-center gap-3 sm:gap-4 w-full">
            <button
              onClick={() => navigate('/')}
              className="bg-[#A8A38F] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#9A9585]"
            >
              <HomeIcon className="h-5 w-5" />
            </button>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 ml-auto">
              {user ? (
                <>
                  <button
                    onClick={handleProfile}
                    className="bg-[#A8A38F] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#9A9585]"
                  >
                    Profile
                  </button>
                  {user?.is_admin && (
                    <div className="flex gap-2">
                      <button
                        onClick={handleAdmin}
                        className="bg-[#A8A38F] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#9A9585]"
                      >
                        Admin
                      </button>
                      <button
                        onClick={handleEnrolled}
                        className="bg-[#A8A38F] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#9A9585]"
                      >
                        Enrolled
                      </button>
                    </div>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="bg-[#A8A38F] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#9A9585]"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={handleLogin}
                  className="bg-[#A8A38F] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#9A9585]"
                >
                  Login →
                </button>
              )}
            </div>
          </div>
          </div>
        </div>
      </header>



      {/* Class List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1">
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
                hasClickedPayment={paymentClickedByClassId.get(yogaClass.id) || false}
                onPaymentClick={handlePaymentClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
