import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { HomeIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

type SimpleUser = {
  id: string;
  email: string;
  full_name: string | null;
};

export const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<SimpleUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState<Record<string, boolean>>({});
  const { sendMagicLink } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get only the necessary user data
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .order('full_name', { ascending: true, nullsFirst: false });

      if (error) throw error;
      
      setUsers(data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load users. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  const handleBack = () => navigate('/');

  const handleSendMagicLink = async (email: string, userId: string) => {
    try {
      setSendingEmail(prev => ({ ...prev, [userId]: true }));
      await sendMagicLink(email);
      setError(null);
    } catch (err) {
      console.error('Error sending magic link:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to send magic link';
      setError(errorMessage);
    } finally {
      setSendingEmail(prev => ({ ...prev, [userId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#8b3625] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={handleBack}
              className="bg-[#A8A38F] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#9A9585] flex items-center gap-1"
            >
              <HomeIcon className="h-5 w-5" />

            </button>
            <h1 className="text-xl font-bold text-white">Users</h1>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="w-full px-2 py-4 sm:px-4 lg:px-6">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 sm:mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <div className="inline-block min-w-full py-2 align-middle sm:px-2">
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-2 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                  <th scope="col" className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.full_name || 'N/A'}
                      </td>
                      <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleSendMagicLink(user.email, user.id)}
                          disabled={sendingEmail[user.id]}
                          className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium ${
                            sendingEmail[user.id]
                              ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                              : 'bg-[#a8a38f] text-white hover:bg-[#9A9585]'
                          }`}
                        >
                          {sendingEmail[user.id] ? (
                            'Sending...'
                          ) : (
                            <>
                              <EnvelopeIcon className="h-4 w-4" />
                              <span>Magic</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                    </tr>
                  ))
                )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
