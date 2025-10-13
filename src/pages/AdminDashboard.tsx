import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useClasses } from '../hooks/useClasses';
import { useCreateClass, useUpdateClass, useDeleteClass, useCancelClass } from '../hooks/useClasses';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AttendeeModal } from '../components/AttendeeModal';
import { createWeeklyClasses, getDayOfWeekName } from '../utils/weeklyRepeat';
import { REST_URL, restHeaders } from '../utils/supabase';
import { sendCancellationToAllRegistrants } from '../utils/emailFunctions';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  XMarkIcon, 
  EyeIcon,
  DocumentDuplicateIcon,
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
// Types are used in the form schema

const classSchema = z.object({
  name: z.string().min(1, 'Class name is required'),
  brief_description: z.string().min(1, 'Brief description is required'),
  full_description: z.string().min(1, 'Full description is required'),
  instructor: z.string().min(1, 'Instructor is required'),
  start_time: z.string().min(1, 'Start time is required'),
  price: z.number().min(0, 'Price must be at least $0'),
  weekly_repeat: z.number().min(0).max(26, 'Weekly repeat must be between 0 and 26'),
});

type ClassFormData = z.infer<typeof classSchema>;

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: classes = [], isLoading } = useClasses();
  const createClass = useCreateClass();
  const updateClass = useUpdateClass();
  const deleteClass = useDeleteClass();
  const cancelClass = useCancelClass();

  const [isCreating, setIsCreating] = useState(false);
  const [editingClass, setEditingClass] = useState<string | null>(null);
  const [viewingAttendees, setViewingAttendees] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'instructor' | 'price'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const form = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: '',
      brief_description: '',
      full_description: '',
      instructor: 'Sarah',
      start_time: '',
      price: 10,
      weekly_repeat: 0,
    },
  });

  const handleBack = () => {
    navigate('/');
  };

  // Sort classes based on current sort settings
  const sortedClasses = React.useMemo(() => {
    return [...classes].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'instructor':
          comparison = a.instructor.localeCompare(b.instructor);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [classes, sortBy, sortOrder]);

  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingClass(null);
    form.reset({
      name: '',
      brief_description: '',
      full_description: '',
      instructor: 'Sarah',
      start_time: '',
      price: 10,
      weekly_repeat: 0,
    });
    setFormError(null);
    setFormSuccess(null);
  };

  const handleEdit = (classId: string) => {
    const yogaClass = classes.find(c => c.id === classId);
    if (yogaClass) {
      setEditingClass(classId);
      setIsCreating(false);
      form.reset({
        name: yogaClass.name,
        brief_description: yogaClass.brief_description,
        full_description: yogaClass.full_description,
        instructor: yogaClass.instructor,
        start_time: new Date(yogaClass.start_time).toISOString().slice(0, 16),
        price: yogaClass.price,
        weekly_repeat: yogaClass.weekly_repeat,
      });
      setFormError(null);
      setFormSuccess(null);
    }
  };

  const handleDuplicate = (classId: string) => {
    const yogaClass = classes.find(c => c.id === classId);
    if (yogaClass) {
      setIsCreating(true);
      setEditingClass(null);
      form.reset({
        name: yogaClass.name,
        brief_description: yogaClass.brief_description,
        full_description: yogaClass.full_description,
        instructor: yogaClass.instructor,
        start_time: '', // Reset start time so user can set new time
        price: yogaClass.price,
        weekly_repeat: yogaClass.weekly_repeat,
      });
      setFormError(null);
      setFormSuccess('Class data copied to form. Please set a new start time and save.');
      setTimeout(() => setFormSuccess(null), 5000);
    }
  };

  const handleCancel = async (classId: string) => {
    if (window.confirm('Are you sure you want to cancel this class? All registered users will be notified.')) {
      try {
        // Get class details before cancelling
        const yogaClass = classes.find(c => c.id === classId);
        if (!yogaClass) {
          setFormError('Class not found');
          return;
        }

        // Get registrations for this class
        const response = await fetch(`${REST_URL}/class_registrations?class_id=eq.${classId}&select=*`, {
          headers: restHeaders(),
        });

        let registrations = [];
        if (!response.ok) {
          console.error('Failed to fetch registrations:', response.status, response.statusText);
        } else {
          registrations = await response.json();
        }

        // Cancel the class
        await cancelClass.mutateAsync(classId);
        
        // Send cancellation emails to all registrants
        if (registrations.length > 0) {
          try {
            // TODO: Implement proper email sending when we have user profile data
          } catch (emailError) {
            console.error('Failed to send cancellation emails:', emailError);
            // Don't fail the cancellation if emails fail
          }
        }

        setFormSuccess('Class cancelled successfully! All registrants have been notified.');
        setTimeout(() => setFormSuccess(null), 3000);
      } catch (error) {
        console.error('Cancel class error:', error);
        setFormError('Failed to cancel class');
      }
    }
  };

  const handleDelete = async (classId: string) => {
    if (window.confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
      try {
        await deleteClass.mutateAsync(classId);
        setFormSuccess('Class deleted successfully!');
        setTimeout(() => setFormSuccess(null), 3000);
      } catch {
        setFormError('Failed to delete class');
      }
    }
  };

  const onSubmit = async (data: ClassFormData) => {
    try {
      setFormError(null);
      
      if (isCreating) {
        // Handle weekly repeat functionality
        if (data.weekly_repeat > 0) {
          // Create multiple classes for weekly repeat
          const startDate = new Date(data.start_time);
          const dayOfWeek = startDate.getDay();
          const time = `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`;
          
          const weeklyClasses = createWeeklyClasses(
            {
              name: data.name,
              brief_description: data.brief_description,
              full_description: data.full_description,
              instructor: data.instructor,
              price: data.price,
            },
            {
              startDate,
              weeks: data.weekly_repeat,
              dayOfWeek,
              time,
            }
          );

          // Create all classes
          for (const classData of weeklyClasses) {
            await createClass.mutateAsync(classData);
          }
          
          setFormSuccess(`Created ${weeklyClasses.length} classes for ${getDayOfWeekName(dayOfWeek)}s!`);
        } else {
          // Create single class
          await createClass.mutateAsync(data);
          setFormSuccess('Class created successfully!');
        }
        
        setIsCreating(false);
        form.reset();
      } else if (editingClass) {
        await updateClass.mutateAsync({ id: editingClass, ...data });
        setFormSuccess('Class updated successfully!');
        setEditingClass(null);
        form.reset();
      }
      
      setTimeout(() => setFormSuccess(null), 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Operation failed';
      setFormError(errorMessage);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
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

  if (!user || !user.is_admin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Access denied. Admin privileges required.</p>
          <button
            onClick={handleBack}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Back to Classes
          </button>
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
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/waivers')}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
              >
                <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                Manage Waivers
              </button>
              <button
                onClick={handleCreateNew}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create New Class
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create/Edit Class Form */}
          {(isCreating || editingClass) && (
            <div className="lg:col-span-1">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {isCreating ? 'Create New Class' : 'Edit Class'}
                </h2>

                {formError && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-red-800">{formError}</p>
                  </div>
                )}

                {formSuccess && (
                  <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-4">
                    <p className="text-green-800">{formSuccess}</p>
                  </div>
                )}

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Class Name</label>
                    <input
                      {...form.register('name')}
                      type="text"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    {form.formState.errors.name && (
                      <p className="mt-1 text-sm text-red-600">{form.formState.errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Brief Description</label>
                    <textarea
                      {...form.register('brief_description')}
                      rows={2}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    {form.formState.errors.brief_description && (
                      <p className="mt-1 text-sm text-red-600">{form.formState.errors.brief_description.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Description</label>
                    <textarea
                      {...form.register('full_description')}
                      rows={4}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    {form.formState.errors.full_description && (
                      <p className="mt-1 text-sm text-red-600">{form.formState.errors.full_description.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Instructor</label>
                    <input
                      {...form.register('instructor')}
                      type="text"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    {form.formState.errors.instructor && (
                      <p className="mt-1 text-sm text-red-600">{form.formState.errors.instructor.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Time</label>
                    <input
                      {...form.register('start_time')}
                      type="datetime-local"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    {form.formState.errors.start_time && (
                      <p className="mt-1 text-sm text-red-600">{form.formState.errors.start_time.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price ($)</label>
                    <input
                      {...form.register('price', { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      min="0"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    {form.formState.errors.price && (
                      <p className="mt-1 text-sm text-red-600">{form.formState.errors.price.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Weekly Repeat (0-26 weeks)</label>
                    <input
                      {...form.register('weekly_repeat', { valueAsNumber: true })}
                      type="number"
                      min="0"
                      max="26"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    {form.formState.errors.weekly_repeat && (
                      <p className="mt-1 text-sm text-red-600">{form.formState.errors.weekly_repeat.message}</p>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={createClass.isPending || updateClass.isPending}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {createClass.isPending || updateClass.isPending ? 'Saving...' : (isCreating ? 'Create Class' : 'Update Class')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreating(false);
                        setEditingClass(null);
                        form.reset();
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Existing Classes */}
          <div className={`${(isCreating || editingClass) ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Existing Classes</h2>
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600">Sort by:</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'instructor' | 'price')}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="date">Date & Time</option>
                      <option value="name">Name</option>
                      <option value="instructor">Instructor</option>
                      <option value="price">Price</option>
                    </select>
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </button>
                  </div>
                </div>
              </div>
              
              {isLoading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading classes...</p>
                </div>
              ) : classes.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-gray-600">No classes found. Create your first class!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Class Details {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Time {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sortedClasses.map((yogaClass) => (
                        <tr key={yogaClass.id}>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{yogaClass.name}</div>
                              <div className="text-sm text-gray-500">{yogaClass.brief_description}</div>
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <UserIcon className="h-4 w-4 mr-1" />
                                {yogaClass.instructor} {sortBy === 'instructor' && (sortOrder === 'asc' ? '↑' : '↓')}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              <div className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                {formatDate(yogaClass.start_time)}
                              </div>
                              <div className="flex items-center mt-1">
                                <ClockIcon className="h-4 w-4 mr-1" />
                                {formatTime(yogaClass.start_time)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center text-sm text-gray-900">
                              <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                              ${yogaClass.price}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {yogaClass.is_cancelled ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Cancelled
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Active
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => setViewingAttendees(yogaClass.id)}
                                className="text-blue-600 hover:text-blue-900"
                                title="View Attendees"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDuplicate(yogaClass.id)}
                                className="text-green-600 hover:text-green-900"
                                title="Duplicate Class"
                              >
                                <DocumentDuplicateIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(yogaClass.id)}
                                className="text-indigo-600 hover:text-indigo-900"
                                title="Edit Class"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              {!yogaClass.is_cancelled && (
                                <button
                                  onClick={() => handleCancel(yogaClass.id)}
                                  className="text-yellow-600 hover:text-yellow-900"
                                  title="Cancel Class"
                                >
                                  <XMarkIcon className="h-4 w-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(yogaClass.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Delete Class"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Attendee Modal */}
      <AttendeeModal
        classId={viewingAttendees}
        onClose={() => setViewingAttendees(null)}
      />
    </div>
  );
};
