import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, TABLES } from '../utils/supabase';
import type { YogaClass, CreateClassData, UpdateClassData } from '../types';

// Fetch all classes
export const useClasses = () => {
  return useQuery({
    queryKey: ['classes'],
    queryFn: async (): Promise<YogaClass[]> => {
      console.log('useClasses: Fetching classes...');
      const response = await fetch('http://127.0.0.1:54321/rest/v1/yoga_classes?select=*', {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('useClasses: Fetched', data.length, 'classes');
      
      // Log any cancelled classes
      const cancelledClasses = data.filter((class_: any) => class_.is_cancelled);
      if (cancelledClasses.length > 0) {
        console.log('useClasses: Found cancelled classes:', cancelledClasses.map(c => ({ id: c.id, name: c.name, is_cancelled: c.is_cancelled })));
      }
      
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

      const response = await fetch('http://127.0.0.1:54321/rest/v1/yoga_classes', {
        method: 'POST',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...classData,
          end_time: endTime.toISOString(),
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data[0] as YogaClass;
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
      const response = await fetch(`http://127.0.0.1:54321/rest/v1/yoga_classes?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...classData,
          updated_at: new Date().toISOString(),
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data[0] as YogaClass;
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
      const response = await fetch(`http://127.0.0.1:54321/rest/v1/yoga_classes?id=eq.${classId}`, {
        method: 'DELETE',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
          'Content-Type': 'application/json'
        }
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
      console.log('useCancelClass: Starting cancellation for class:', classId);
      const response = await fetch(`http://127.0.0.1:54321/rest/v1/yoga_classes?id=eq.${classId}`, {
        method: 'PATCH',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          is_cancelled: true,
          updated_at: new Date().toISOString(),
        })
      });

      if (!response.ok) {
        console.error('useCancelClass: HTTP error:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log('useCancelClass: Class cancelled successfully');
      
      // Let's verify the update by fetching the updated class
      const verifyResponse = await fetch(`http://127.0.0.1:54321/rest/v1/yoga_classes?id=eq.${classId}&select=*`, {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
          'Content-Type': 'application/json'
        }
      });
      
      if (verifyResponse.ok) {
        const updatedClass = await verifyResponse.json();
        console.log('useCancelClass: Verified updated class:', updatedClass[0]);
        return updatedClass[0] as YogaClass;
      } else {
        console.error('useCancelClass: Failed to verify update:', verifyResponse.status);
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


