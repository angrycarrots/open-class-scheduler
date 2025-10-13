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
        .select('*')
        .eq('class_id', classId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const registrations = data || [];

      // Attempt to enrich with profile data via Supabase if we have user IDs
      if (registrations.length > 0) {
        try {
          const userIds = Array.from(new Set(registrations.map(r => r.user_id)));
          const { data: profiles, error: profilesError } = await supabase
            .from(TABLES.PROFILES)
            .select('id, full_name, email')
            .in('id', userIds);

          if (!profilesError && profiles) {
            const byId = new Map(profiles.map(p => [p.id, p] as const));
            return registrations.map(r => ({
              ...r,
              profiles: byId.get(r.user_id) ? {
                id: r.user_id,
                username: byId.get(r.user_id)?.full_name,
                email: byId.get(r.user_id)?.email,
              } : undefined,
            }));
          }
        } catch (_e) {
          // Swallow enrichment errors and fall back to bare registrations
        }
      }

      return registrations;
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
    onSuccess: async () => {
      // Invalidate all registration queries (including user-specific ones)
      await queryClient.invalidateQueries({ queryKey: ['registrations'] });
      await queryClient.invalidateQueries({ queryKey: ['class-registrations'] });
      // Force refetch to ensure UI updates immediately
      await queryClient.refetchQueries({ queryKey: ['registrations'] });
    },
  });
};
