import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useClass } from '../hooks/useClasses';
import { useCreateRegistration } from '../hooks/useRegistrations';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, ClockIcon, UserIcon, CurrencyDollarIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
// TODO: Import email service when implemented
// import { sendRegistrationEmail } from '../utils/email';

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
      console.log('Processing payment:', {
        classId: yogaClass.id,
        userId: user.id,
        amount: data.payment_amount,
        className: yogaClass.name,
      });

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Save registration to database
      await createRegistration.mutateAsync({
        classId: yogaClass.id,
        userId: user.id,
        paymentAmount: data.payment_amount,
        // squarePaymentId: 'simulated-payment-id', // TODO: Add real Square payment ID
      });

      // TODO: Send email confirmation when email service is implemented
      // try {
      //   await sendRegistrationEmail(
      //     user.email,
      //     yogaClass.name,
      //     formatDate(yogaClass.start_time),
      //     formatTime(yogaClass.start_time)
      //   );
      // } catch (emailError) {
      //   console.error('Failed to send email:', emailError);
      //   // Don't fail registration if email fails
      // }

      setSuccess('Registration successful! You will receive a confirmation email shortly.');
      
      // Redirect to home after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);

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
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{yogaClass.name}</h2>
            
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <CalendarIcon className="h-4 w-4 mr-2" />
                <span>{formatDate(yogaClass.start_time)}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <ClockIcon className="h-4 w-4 mr-2" />
                <span>{formatTime(yogaClass.start_time)} - {formatTime(yogaClass.end_time)}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <UserIcon className="h-4 w-4 mr-2" />
                <span>{yogaClass.instructor}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                <span>Base Price: ${yogaClass.price}</span>
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-700">{yogaClass.brief_description}</p>
            </div>
          </div>

          {/* Registration Form */}
          <div className="px-6 py-6">
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

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="payment_amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Amount (${yogaClass.price} - $12)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    {...form.register('payment_amount', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min={yogaClass.price}
                    max={12}
                    className="pl-7 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder={yogaClass.price.toString()}
                  />
                </div>
                {form.formState.errors.payment_amount && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.payment_amount.message}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  You can adjust your payment from the minimum of ${yogaClass.price} up to $12
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
                  disabled={createRegistration.isPending}
                  className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {createRegistration.isPending ? 'Processing...' : 'Complete Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};
