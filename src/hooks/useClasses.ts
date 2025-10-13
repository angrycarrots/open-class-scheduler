import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, TABLES, REST_URL, restHeaders } from '../utils/supabase';
import type { YogaClass, CreateClassData, UpdateClassData } from '../types';

// Fetch all classes
export const useClasses = () => {
  return useQuery({
    queryKey: ['classes'],
    queryFn: async (): Promise<YogaClass[]> => {
      const response = await fetch(`${REST_URL}/yoga_classes?select=*`, {
        headers: await restHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return (data as YogaClass[]) || [];
    },
    retry: 1,
    retryDelay: 1000,
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache (react-query v5)
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

      const response = await fetch(`${REST_URL}/yoga_classes`, {
        method: 'POST',
        headers: await restHeaders(),
        body: JSON.stringify({
          ...classData,
          end_time: endTime.toISOString(),
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // POST requests don't always return data, so we'll return a minimal object
      // The actual created data will be fetched by the query invalidation
      return {
        ...classData,
        end_time: endTime.toISOString(),
        id: 'temp-id', // This will be replaced when the query refreshes
      } as YogaClass;
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
      // Calculate end time if start_time is being updated (1 hour after start time)
      const updateData: any = {
        ...classData,
        updated_at: new Date().toISOString(),
      };

      if (classData.start_time) {
        const startTime = new Date(classData.start_time);
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
        updateData.end_time = endTime.toISOString();
      }

      const response = await fetch(`${REST_URL}/yoga_classes?id=eq.${id}`, {
        method: 'PATCH',
        headers: await restHeaders(),
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Update failed:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // PATCH requests don't always return data, so we'll return a minimal object
      // The actual updated data will be fetched by the query invalidation
      return {
        id,
        ...updateData,
      } as YogaClass;
    },
    onSuccess: async (_, variables) => {
      await queryClient.refetchQueries({ queryKey: ['classes'] });
      await queryClient.refetchQueries({ queryKey: ['class', variables.id] });
    },
  });
};

// Delete a class
export const useDeleteClass = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (classId: string): Promise<void> => {
      const response = await fetch(`${REST_URL}/yoga_classes?id=eq.${classId}`, {
        method: 'DELETE',
        headers: await restHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
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
      const response = await fetch(`${REST_URL}/yoga_classes?id=eq.${classId}`, {
        method: 'PATCH',
        headers: await restHeaders(),
        body: JSON.stringify({
          is_cancelled: true,
          updated_at: new Date().toISOString(),
        })
      });

      if (!response.ok) {
        console.error('useCancelClass: HTTP error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Let's verify the update by fetching the updated class
      const verifyResponse = await fetch(`${REST_URL}/yoga_classes?id=eq.${classId}&select=*`, {
        headers: await restHeaders(),
      });
      
      if (verifyResponse.ok) {
        const updatedClass = await verifyResponse.json();
        return updatedClass[0] as YogaClass;
      } else {
        // PATCH requests don't always return data, so we'll return a minimal object
        // The actual updated data will be fetched by the query invalidation
        return {
          id: classId,
          is_cancelled: true,
        } as YogaClass;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });
};


