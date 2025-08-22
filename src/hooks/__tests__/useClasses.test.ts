import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useClasses } from '../useClasses'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Create a wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return ({ children }: { children: React.ReactNode }) => {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

describe('useClasses', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch classes successfully', async () => {
    const mockClasses = [
      {
        id: '1',
        name: 'Test Class',
        brief_description: 'Test Description',
        full_description: 'Full Test Description',
        instructor: 'Test Instructor',
        start_time: '2024-01-01T10:00:00Z',
        end_time: '2024-01-01T11:00:00Z',
        price: 10,
        weekly_repeat: 0,
        is_cancelled: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockClasses,
    })

    const { result } = renderHook(() => useClasses(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual(mockClasses)
    expect(mockFetch).toHaveBeenCalledWith(
      'http://127.0.0.1:54321/rest/v1/yoga_classes?select=*',
      expect.objectContaining({
        headers: expect.objectContaining({
          'apikey': expect.any(String),
          'Authorization': expect.any(String),
          'Content-Type': 'application/json',
        }),
      })
    )
  })

  it('should handle fetch error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    mockFetch.mockRejectedValueOnce(new Error('Network error')) // Retry will also fail

    const { result } = renderHook(() => useClasses(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    }, { timeout: 3000 })

    expect(result.current.error).toBeDefined()
  })

  it('should handle non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    })
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    }) // Retry will also fail

    const { result } = renderHook(() => useClasses(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    }, { timeout: 3000 })

    expect(result.current.error).toBeDefined()
  })
})
