import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, TABLES } from '../utils/supabase';
import type { ClassRegistration } from '../types';

// Fetch user's registrations
export const useUserRegistrations = (userId?: string) => {
  return useQuery({
    queryKey: ['registrations', userId],
    queryFn: async (): Promise<ClassRegistration[]> => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from(TABLES.REGISTRATIONS)
        .select(`
          *,
          yoga_classes (
            id,
            name,
            start_time,
            end_time,
            instructor,
            is_cancelled
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
};

// Fetch registrations for a specific class (admin only)
export const useClassRegistrations = (classId: string) => {
  return useQuery({
    queryKey: ['class-registrations', classId],
    queryFn: async (): Promise<ClassRegistration[]> => {
      const { data, error } = await supabase
        .from(TABLES.REGISTRATIONS)
        .select(`
          *,
          profiles (
            id,
            full_name,
            email,
            phone
          )
        `)
        .eq('class_id', classId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!classId,
  });
};

// Create a new registration
export const useCreateRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      classId,
      userId,
      paymentAmount,
      squarePaymentId,
    }: {
      classId: string;
      userId: string;
      paymentAmount: number;
      squarePaymentId?: string;
    }): Promise<ClassRegistration> => {
      const { data, error } = await supabase
        .from(TABLES.REGISTRATIONS)
        .insert({
          class_id: classId,
          user_id: userId,
          payment_amount: paymentAmount,
          payment_status: 'completed',
          square_payment_id: squarePaymentId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data as ClassRegistration;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['registrations', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['class-registrations', variables.classId] });
    },
  });
};

// Update registration payment status
export const useUpdateRegistrationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      registrationId,
      status,
    }: {
      registrationId: string;
      status: 'pending' | 'completed' | 'failed';
    }): Promise<ClassRegistration> => {
      const { data, error } = await supabase
        .from(TABLES.REGISTRATIONS)
        .update({
          payment_status: status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', registrationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      queryClient.invalidateQueries({ queryKey: ['class-registrations'] });
    },
  });
};

// Cancel a registration
export const useCancelRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (registrationId: string): Promise<void> => {
      const { error } = await supabase
        .from(TABLES.REGISTRATIONS)
        .delete()
        .eq('id', registrationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      queryClient.invalidateQueries({ queryKey: ['class-registrations'] });
    },
  });
};
