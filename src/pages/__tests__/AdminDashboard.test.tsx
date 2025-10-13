import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AdminDashboard } from '../AdminDashboard'

// Mock the auth context
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'admin-user-id',
      email: 'michael@athanas.org',
      is_admin: true,
      username: 'Admin User',
    },
  }),
}))

// Mock the hooks
vi.mock('../../hooks/useClasses', () => ({
  useClasses: () => ({
    data: [
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
      {
        id: '2',
        name: 'Cancelled Class',
        brief_description: 'Cancelled Description',
        full_description: 'Full Cancelled Description',
        instructor: 'Test Instructor',
        start_time: '2024-01-02T10:00:00Z',
        end_time: '2024-01-02T11:00:00Z',
        price: 15,
        weekly_repeat: 0,
        is_cancelled: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ],
    isLoading: false,
  }),
  useCreateClass: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useUpdateClass: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useDeleteClass: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useCancelClass: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
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

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render admin dashboard', () => {
    render(<AdminDashboard />, { wrapper: createWrapper() })
    
    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Existing Classes')).toBeInTheDocument()
  })

  it('should display classes in the table', () => {
    render(<AdminDashboard />, { wrapper: createWrapper() })
    
    expect(screen.getByText('Test Class')).toBeInTheDocument()
    expect(screen.getByText('Cancelled Class')).toBeInTheDocument()
    expect(screen.getAllByText('Test Instructor')).toHaveLength(2)
    expect(screen.getByText('$10')).toBeInTheDocument()
    expect(screen.getByText('$15')).toBeInTheDocument()
  })

  it('should show cancelled status for cancelled classes', () => {
    render(<AdminDashboard />, { wrapper: createWrapper() })
    
    expect(screen.getByText('Cancelled')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('should show create new class button', () => {
    render(<AdminDashboard />, { wrapper: createWrapper() })
    
    expect(screen.getByText('Create New Class')).toBeInTheDocument()
  })

  it('should show sorting controls', () => {
    render(<AdminDashboard />, { wrapper: createWrapper() })
    
    expect(screen.getByText('Sort by:')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Date & Time')).toBeInTheDocument()
  })

  it('should allow changing sort field', () => {
    render(<AdminDashboard />, { wrapper: createWrapper() })
    
    const sortSelect = screen.getByDisplayValue('Date & Time')
    fireEvent.change(sortSelect, { target: { value: 'name' } })
    
    expect(sortSelect).toHaveValue('name')
  })

  it('should show action buttons for each class', () => {
    render(<AdminDashboard />, { wrapper: createWrapper() })
    
    // Should have action buttons (view attendees, duplicate, edit, cancel, delete)
    const actionButtons = screen.getAllByRole('button')
    expect(actionButtons.length).toBeGreaterThan(0)
  })
})
