import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ClassListing } from '../ClassListing'

// Mock the auth context
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    signOut: vi.fn(),
  }),
}))

// Mock the hooks
vi.mock('../../hooks/useClasses', () => ({
  useClasses: () => ({
    data: [
      {
        id: '1',
        name: 'Morning Flow',
        brief_description: 'Start your day with energy',
        full_description: 'A dynamic morning yoga flow to energize your day',
        instructor: 'Sarah',
        start_time: '2024-01-01T08:00:00Z',
        end_time: '2024-01-01T09:00:00Z',
        price: 12,
        weekly_repeat: 0,
        is_cancelled: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      {
        id: '2',
        name: 'Evening Relaxation',
        brief_description: 'Wind down with gentle poses',
        full_description: 'A gentle evening practice to help you relax',
        instructor: 'Alex',
        start_time: '2024-01-01T18:00:00Z',
        end_time: '2024-01-01T19:00:00Z',
        price: 10,
        weekly_repeat: 0,
        is_cancelled: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ],
    isLoading: false,
    error: null,
  }),
}))

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

// Create a wrapper with providers
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  )
}

describe('ClassListing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render class listing page', () => {
    render(<ClassListing />, { wrapper: createWrapper() })
    
    expect(screen.getByText('Yoga Classes')).toBeInTheDocument()
  })

  it('should display classes', () => {
    render(<ClassListing />, { wrapper: createWrapper() })
    
    expect(screen.getByText('Morning Flow')).toBeInTheDocument()
    expect(screen.getByText('Evening Relaxation')).toBeInTheDocument()
    expect(screen.getByText('Start your day with energy')).toBeInTheDocument()
    expect(screen.getByText('Wind down with gentle poses')).toBeInTheDocument()
  })

  it('should show instructor names', () => {
    render(<ClassListing />, { wrapper: createWrapper() })
    
    expect(screen.getAllByText('Sarah')).toHaveLength(2) // One in dropdown, one in class
  })

  it('should show prices', () => {
    render(<ClassListing />, { wrapper: createWrapper() })
    
    expect(screen.getByText('$12')).toBeInTheDocument()
    expect(screen.getByText('$10')).toBeInTheDocument()
  })

  it('should show login button when user is not authenticated', () => {
    render(<ClassListing />, { wrapper: createWrapper() })
    
    expect(screen.getByText('Login →')).toBeInTheDocument()
  })

  it('should show instructor filter', () => {
    render(<ClassListing />, { wrapper: createWrapper() })
    
    expect(screen.getByDisplayValue('All Classes')).toBeInTheDocument()
  })

  it('should allow changing instructor filter', () => {
    render(<ClassListing />, { wrapper: createWrapper() })
    
    const instructorFilter = screen.getByDisplayValue('All Classes')
    fireEvent.change(instructorFilter, { target: { value: 'Sarah' } })
    
    expect(instructorFilter).toHaveValue('Sarah')
  })

  it('should show search input', () => {
    render(<ClassListing />, { wrapper: createWrapper() })
    
    expect(screen.getByPlaceholderText('Search classes...')).toBeInTheDocument()
  })
})
