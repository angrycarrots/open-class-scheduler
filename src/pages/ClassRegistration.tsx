import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useClass } from '../hooks/useClasses';
import { useCreateRegistration } from '../hooks/useRegistrations';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { sendRegistrationEmail } from '../utils/emailFunctions';
import venmoIcon from '../assets/venmo.png';
import paypalIcon from '../assets/paypal.png';
import zelleIcon from '../assets/zelle.png';
import squareIcon from '../assets/square.png';

const registrationSchema = z.object({
  payment_amount: z.number()
    .min(1, 'Payment amount must be at least $1')
    .max(12, 'Payment amount cannot exceed $12'),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

export const ClassRegistration: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: yogaClass, isLoading, error } = useClass(classId || '');
  const createRegistration = useCreateRegistration();
  const [success, setSuccess] = useState<string | null>(null);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      payment_amount: yogaClass?.price || 0,
    },
  });

  // Update form when class data loads
  React.useEffect(() => {
    if (yogaClass) {
      form.setValue('payment_amount', yogaClass.price);
    }
  }, [yogaClass, form]);

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

  const handleBack = () => {
    navigate('/');
  };

  const onSubmit = async (data: RegistrationFormData) => {
    if (!user || !yogaClass) return;

    try {
      setRegistrationError(null);

      // TODO: Implement Square payment processing here
      // For now, we'll simulate a successful payment

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Save registration to database
      await createRegistration.mutateAsync({
        classId: yogaClass.id,
        userId: user.id,
        paymentAmount: data.payment_amount,
        // squarePaymentId: 'simulated-payment-id', // TODO: Add real Square payment ID
      });

      // Send email confirmation
      try {
        await sendRegistrationEmail(
          user.email,
          user.username || 'Valued Customer',
          yogaClass.name,
          formatDate(yogaClass.start_time),
          formatTime(yogaClass.start_time),
          yogaClass.instructor,
          data.payment_amount
        );
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // Don't fail registration if email fails
      }

      setIsRegistered(true);
      setSuccess('Registration successful! You will receive a confirmation email shortly.');

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setRegistrationError(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading class details...</p>
        </div>
      </div>
    );
  }

  if (error || !yogaClass) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Class not found or error loading class details.</p>
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

  if (yogaClass.is_cancelled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">This class has been cancelled.</p>
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
              <h1 className="text-2xl font-bold text-gray-900">Register for Class</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Class Details */}
          <div className="px-6 py-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">{yogaClass.name}</h2>

            <div className="space-y-2 mb-6">
              <div className="flex items-start text-base text-gray-700">
                <span className="mr-2">-</span>
                <span>{formatDate(yogaClass.start_time)}</span>
              </div>

              <div className="flex items-start text-base text-gray-700">
                <span className="mr-2">-</span>
                <span>{formatTime(yogaClass.start_time)} - {formatTime(yogaClass.end_time)}</span>
              </div>
            </div>

            <p className="text-base text-gray-700 mb-4">{yogaClass.brief_description}</p>

            <p className="text-base text-gray-700 mb-8">{yogaClass.full_description}</p>

            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-green-800">{success}</p>
              </div>
            )}

            {registrationError && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800">{registrationError}</p>
              </div>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)}>
              <button
                type="submit"
                disabled={createRegistration.isPending || isRegistered}
                className={`px-8 py-3 border border-transparent rounded-md shadow-sm text-base font-medium ${
                  isRegistered
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {createRegistration.isPending ? 'Processing...' : isRegistered ? 'Registered' : 'Register for Class'}
              </button>
            </form>

            {isRegistered && (
              <div className="mt-8">
                <p className="text-base text-gray-700 mb-4">
                  Suggested donation: ${yogaClass.price}
                </p>

                <p className="text-base text-gray-700 mb-6">
                  Click the icon below to go to the payment page:
                </p>

                <div className="flex items-center space-x-6">
                  <a
                    href={import.meta.env.VITE_VENMO_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={venmoIcon}
                      alt="Venmo"
                      className="h-16 w-16 object-contain"
                    />
                  </a>

                  <a
                    href={import.meta.env.VITE_PAYPAL_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={paypalIcon}
                      alt="PayPal"
                      className="h-16 w-16 object-contain"
                    />
                  </a>

                  <a
                    href={import.meta.env.VITE_ZELLE_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={zelleIcon}
                      alt="Zelle"
                      className="h-16 w-16 object-contain"
                    />
                  </a>

                  <a
                    href={import.meta.env.VITE_SQUARE_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={squareIcon}
                      alt="Square"
                      className="h-16 w-16 object-contain"
                    />
                  </a>




                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
