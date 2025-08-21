import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClassCard } from '../components/ClassCard';
import { ClassFilters, type FilterOptions } from '../components/ClassFilters';
import { useAuth } from '../contexts/AuthContext';
import { useClasses } from '../hooks/useClasses';
import { PlusIcon } from '@heroicons/react/24/outline';

export const ClassListing: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { data: classes = [], isLoading: loading, error } = useClasses();
  const [filters, setFilters] = useState<FilterOptions>({});

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

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Get unique instructors for filter
  const instructors = useMemo(() => {
    const uniqueInstructors = new Set(classes.map(c => c.instructor));
    return Array.from(uniqueInstructors).sort();
  }, [classes]);

  // Filter and sort classes
  const filteredAndSortedClasses = useMemo(() => {
    let filtered = [...classes];

    // Apply filters
    if (filters.instructor) {
      filtered = filtered.filter(c => c.instructor === filters.instructor);
    }

    if (filters.priceRange) {
      switch (filters.priceRange) {
        case 'low':
          filtered = filtered.filter(c => c.price <= 5);
          break;
        case 'medium':
          filtered = filtered.filter(c => c.price > 5 && c.price <= 10);
          break;
        case 'high':
          filtered = filtered.filter(c => c.price > 10);
          break;
      }
    }

    if (filters.dateRange) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

      switch (filters.dateRange) {
        case 'today':
          filtered = filtered.filter(c => {
            const classDate = new Date(c.start_time);
            return classDate >= today && classDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
          });
          break;
        case 'week':
          filtered = filtered.filter(c => {
            const classDate = new Date(c.start_time);
            return classDate >= today && classDate < weekFromNow;
          });
          break;
        case 'month':
          filtered = filtered.filter(c => {
            const classDate = new Date(c.start_time);
            return classDate >= today && classDate < monthFromNow;
          });
          break;
      }
    }

    // Apply sorting
    const sortBy = filters.sortBy || 'date';
    const sortOrder = filters.sortOrder || 'asc';

    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [classes, filters]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading classes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Yoga Classes</h1>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <button
                    onClick={handleProfile}
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Profile
                  </button>
                  {user.email === 'admin@example.com' && (
                    <button
                      onClick={handleAdmin}
                      className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
                    >
                      Admin
                    </button>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={handleLogin}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">Failed to load classes</p>
          </div>
        )}

        {/* Filters */}
        <ClassFilters
          filters={filters}
          onFiltersChange={setFilters}
          instructors={instructors}
        />

        {filteredAndSortedClasses.length === 0 ? (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedClasses.map((yogaClass) => (
              <ClassCard
                key={yogaClass.id}
                yogaClass={yogaClass}
                onRegister={handleRegister}
                isAuthenticated={!!user}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
