import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserIcon, CameraIcon, KeyIcon, XMarkIcon } from '@heroicons/react/24/outline';

const profileSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  avatar_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export const Profile: React.FC = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username || '',
      avatar_url: user?.avatar_url || 'avatar.png',
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Keep form in sync when user data loads/changes (e.g., after re-login)
  useEffect(() => {
    form.reset({
      username: user?.username || '',
      avatar_url: user?.avatar_url || 'avatar.png',
    });
  }, [user?.username, user?.avatar_url]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await updateProfile({
        username: data.username,
        avatar_url: data.avatar_url || 'avatar.png',
      });

      setSuccess('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    try {
      setPasswordLoading(true);
      setPasswordError(null);
      setPasswordSuccess(null);

      await changePassword(data.currentPassword, data.newPassword);

      setPasswordSuccess('Password changed successfully!');

      // Clear form and close modal after 2 seconds
      setTimeout(() => {
        setPasswordSuccess(null);
        setShowPasswordModal(false);
        passwordForm.reset();
      }, 2000);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to change password';
      setPasswordError(errorMessage);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleOpenPasswordModal = () => {
    setShowPasswordModal(true);
    setPasswordError(null);
    setPasswordSuccess(null);
    passwordForm.reset();
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordError(null);
    setPasswordSuccess(null);
    passwordForm.reset();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view your profile.</p>
          <button
            onClick={() => navigate('/auth')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Go to Login
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
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            <button
              onClick={handleBack}
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Back to Classes
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center space-x-5 mb-8">
              {/* Avatar */}
              <div className="relative">
                <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {user.avatar_url && user.avatar_url !== 'avatar.png' ? (
                    <img
                      src={user.avatar_url}
                      alt="Profile"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <UserIcon className="h-10 w-10 text-gray-400" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center">
                  <CameraIcon className="h-3 w-3 text-white" />
                </div>
              </div>

              {/* User Info */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {user.username || 'Update your profile'}
                </h2>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>

            {/* Success/Error Messages */}
            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-green-800">{success}</p>
              </div>
            )}

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Profile Form */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <div className="mt-1">
                  <input
                    {...form.register('username')}
                    type="text"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your username"
                  />
                </div>
                {form.formState.errors.username && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.username.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="avatar_url" className="block text-sm font-medium text-gray-700">
                  Avatar URL
                </label>
                <div className="mt-1">
                  <input
                    {...form.register('avatar_url')}
                    type="url"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
                {form.formState.errors.avatar_url && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.avatar_url.message}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Leave empty to use the default avatar
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>

            {/* Security Section */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Security</h3>
              <button
                type="button"
                onClick={handleOpenPasswordModal}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <KeyIcon className="h-5 w-5 mr-2 text-gray-500" />
                Change Password
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 max-w-md shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
              <button
                onClick={handleClosePasswordModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Success/Error Messages */}
            {passwordSuccess && (
              <div className="mb-4 bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-green-800">{passwordSuccess}</p>
              </div>
            )}

            {passwordError && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800">{passwordError}</p>
              </div>
            )}

            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <div className="mt-1">
                  <input
                    {...passwordForm.register('currentPassword')}
                    type="password"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your current password"
                  />
                </div>
                {passwordForm.formState.errors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordForm.formState.errors.currentPassword.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <div className="mt-1">
                  <input
                    {...passwordForm.register('newPassword')}
                    type="password"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Enter your new password"
                  />
                </div>
                {passwordForm.formState.errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordForm.formState.errors.newPassword.message}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Must be at least 6 characters
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>
                <div className="mt-1">
                  <input
                    {...passwordForm.register('confirmPassword')}
                    type="password"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Confirm your new password"
                  />
                </div>
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleClosePasswordModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {passwordLoading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
