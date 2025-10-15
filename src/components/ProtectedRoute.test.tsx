import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import { useAuth } from '../contexts/AuthContext'

// Mock the auth context
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}))

const TestComponent = () => <div>Protected Content</div>

const renderWithRouter = (ui: React.ReactElement, initialRoute = '/protected') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/" element={<div>Home Page</div>} />
        <Route path="/protected" element={ui} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders children when user is authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: '123',
        email: 'test@example.com',
        aud: 'authenticated',
        role: 'authenticated',
        created_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: {},
      },
      session: null,
      loading: false,
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    })

    renderWithRouter(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects to home when user is not authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      loading: false,
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    })

    renderWithRouter(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    )

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    expect(screen.getByText('Home Page')).toBeInTheDocument()
  })

  it('shows loading state when auth is loading', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      loading: true,
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    })

    renderWithRouter(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('does not show children or redirect during loading', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      loading: true,
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    })

    renderWithRouter(
      <ProtectedRoute>
        <TestComponent />
      </ProtectedRoute>
    )

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    expect(screen.queryByText('Home Page')).not.toBeInTheDocument()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })
})
