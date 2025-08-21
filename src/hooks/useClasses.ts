import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, TABLES } from '../utils/supabase';
import type { YogaClass, CreateClassData, UpdateClassData } from '../types';

// Fetch all classes
export const useClasses = () => {
  return useQuery({
    queryKey: ['classes'],
    queryFn: async (): Promise<YogaClass[]> => {
      const { data, error } = await supabase
        .from(TABLES.CLASSES)
        .select('*')
        .order('start_time', { ascending: true });

      if (error) throw error;
      return (data as YogaClass[]) || [];
    },
    retry: 1,
    retryDelay: 1000,
    staleTime: 0, // Always fetch fresh data
    cacheTime: 0, // Don't cache
  });
};

// Fetch a single class
export const useClass = (classId: string) => {
  return useQuery({
    queryKey: ['class', classId],
    queryFn: async (): Promise<YogaClass> => {
      const { data, error } = await supabase
        .from(TABLES.CLASSES)
        .select('*')
        .eq('id', classId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!classId,
  });
};

// Create a new class
export const useCreateClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (classData: CreateClassData): Promise<YogaClass> => {
      // Calculate end time (1 hour after start time)
      const startTime = new Date(classData.start_time);
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

      const { data, error } = await supabase
        .from(TABLES.CLASSES)
        .insert({
          ...classData,
          end_time: endTime.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });
};

// Update a class
export const useUpdateClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...classData }: UpdateClassData): Promise<YogaClass> => {
      const { data, error } = await supabase
        .from(TABLES.CLASSES)
        .update({
          ...classData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      queryClient.invalidateQueries({ queryKey: ['class', variables.id] });
    },
  });
};

// Delete a class
export const useDeleteClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (classId: string): Promise<void> => {
      const { error } = await supabase
        .from(TABLES.CLASSES)
        .delete()
        .eq('id', classId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });
};

// Cancel a class
export const useCancelClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (classId: string): Promise<YogaClass> => {
      const { data, error } = await supabase
        .from(TABLES.CLASSES)
        .update({
          is_cancelled: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', classId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });
};


