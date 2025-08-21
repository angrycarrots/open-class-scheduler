import React from 'react';
import { XMarkIcon, UserIcon, EnvelopeIcon, PhoneIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { useClassRegistrations } from '../hooks/useRegistrations';

interface AttendeeModalProps {
  classId: string | null;
  onClose: () => void;
}

export const AttendeeModal: React.FC<AttendeeModalProps> = ({ classId, onClose }) => {
  const { data: registrations = [], isLoading } = useClassRegistrations(classId || '');

  if (!classId) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Class Attendees</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading attendees...</p>
          </div>
        ) : registrations.length === 0 ? (
          <div className="text-center py-8">
            <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No attendees registered for this class yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gray-50 px-4 py-2 rounded-md">
              <p className="text-sm text-gray-600">
                Total Attendees: <span className="font-semibold">{registrations.length}</span>
              </p>
            </div>

            <div className="max-h-96 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendee
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {registrations.map((registration) => (
                    <tr key={registration.id}>
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <UserIcon className="h-4 w-4 text-gray-600" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {registration.profiles?.full_name || 'Unknown User'}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {registration.user_id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            <EnvelopeIcon className="h-4 w-4 mr-1 text-gray-400" />
                            {registration.profiles?.email || 'No email'}
                          </div>
                          {registration.profiles?.phone && (
                            <div className="flex items-center mt-1">
                              <PhoneIcon className="h-4 w-4 mr-1 text-gray-400" />
                              {registration.profiles.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center text-sm text-gray-900">
                          <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                          ${registration.payment_amount}
                        </div>
                        {registration.square_payment_id && (
                          <div className="text-xs text-gray-500 mt-1">
                            Payment ID: {registration.square_payment_id.slice(0, 8)}...
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          registration.payment_status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : registration.payment_status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {registration.payment_status.charAt(0).toUpperCase() + registration.payment_status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-gray-50 px-4 py-3 rounded-md">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Total Revenue:</span>
                <span className="font-semibold">
                  ${registrations
                    .filter(r => r.payment_status === 'completed')
                    .reduce((sum, r) => sum + r.payment_amount, 0)
                    .toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
