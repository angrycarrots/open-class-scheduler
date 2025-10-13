import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { REST_URL, restHeaders } from '../utils/supabase';
import type { Waiver, UserWaiver } from '../types';

// Fetch active waiver
export const useActiveWaiver = () => {
  return useQuery({
    queryKey: ['active-waiver'],
    queryFn: async (): Promise<Waiver | null> => {
      const response = await fetch(`${REST_URL}/waivers?is_active=eq.true&select=*&limit=1`, {
        headers: await restHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return (data[0] as Waiver) || null;
    },
    retry: 1,
    retryDelay: 1000,
  });
};

// Fetch all waivers (for admin)
export const useWaivers = () => {
  return useQuery({
    queryKey: ['waivers'],
    queryFn: async (): Promise<Waiver[]> => {
      const response = await fetch(`${REST_URL}/waivers?select=*&order=created_at.desc`, {
        headers: await restHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return (data as Waiver[]) || [];
    },
    retry: 1,
    retryDelay: 1000,
  });
};

// Create new waiver
export const useCreateWaiver = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (waiverData: Omit<Waiver, 'id' | 'created_at' | 'updated_at'>) => {
      const response = await fetch(`${REST_URL}/waivers`, {
        method: 'POST',
        headers: await restHeaders(),
        body: JSON.stringify(waiverData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waivers'] });
      queryClient.invalidateQueries({ queryKey: ['active-waiver'] });
    },
  });
};

// Update waiver
export const useUpdateWaiver = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...waiverData }: Partial<Waiver> & { id: string }) => {
      const response = await fetch(`${REST_URL}/waivers?id=eq.${id}`, {
        method: 'PATCH',
        headers: await restHeaders(),
        body: JSON.stringify(waiverData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waivers'] });
      queryClient.invalidateQueries({ queryKey: ['active-waiver'] });
    },
  });
};

// Delete waiver
export const useDeleteWaiver = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${REST_URL}/waivers?id=eq.${id}`, {
        method: 'DELETE',
        headers: await restHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waivers'] });
      queryClient.invalidateQueries({ queryKey: ['active-waiver'] });
    },
  });
};

// Create user waiver agreement
export const useCreateUserWaiver = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userWaiverData: Omit<UserWaiver, 'id'>) => {
      const response = await fetch(`${REST_URL}/user_waivers`, {
        method: 'POST',
        headers: await restHeaders(),
        body: JSON.stringify(userWaiverData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-waivers'] });
    },
  });
};
