import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Dashboard from './Dashboard'
import { useAuth } from '../contexts/AuthContext'

// Mock the auth context
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}))

// Mock UserAvatar component
vi.mock('../components/UserAvatar', () => ({
  default: ({ size }: { size?: string }) => (
    <div data-testid="user-avatar" data-size={size}>
      Avatar
    </div>
  ),
}))

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  )
}

describe('Dashboard', () => {
  const mockUser = {
    id: '123',
    email: 'test@example.com',
    aud: 'authenticated',
    role: 'authenticated',
    created_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: {},
  }

  const mockSignOut = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      session: null,
      loading: false,
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: mockSignOut,
    })
  })

  it('renders dashboard with header and main content', () => {
    renderDashboard()

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /lineup manager/i })).toBeInTheDocument()
  })

  it('displays welcome message with user email', () => {
    renderDashboard()

    expect(screen.getByText(/welcome to your dashboard/i)).toBeInTheDocument()
    // The "Logged in as: test@example.com" text is in the Dashboard component
    expect(screen.getByText(/logged in as: test@example\.com/i)).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    renderDashboard()

    const dashboardLink = screen.getAllByRole('link', { name: /dashboard/i })[0]
    const profileLink = screen.getAllByRole('link', { name: /profile/i })[0]

    expect(dashboardLink).toBeInTheDocument()
    expect(dashboardLink).toHaveAttribute('href', '/dashboard')

    expect(profileLink).toBeInTheDocument()
    expect(profileLink).toHaveAttribute('href', '/profile')
  })

  it('renders user avatar in header', () => {
    renderDashboard()

    const avatar = screen.getByTestId('user-avatar')
    expect(avatar).toBeInTheDocument()
    expect(avatar).toHaveAttribute('data-size', 'md')
  })

  it('renders sign out button', () => {
    renderDashboard()

    const signOutButton = screen.getByRole('button', { name: /sign out/i })
    expect(signOutButton).toBeInTheDocument()
  })

  it('calls signOut and navigates to home when sign out button is clicked', async () => {
    const user = userEvent.setup()
    mockSignOut.mockResolvedValue({ error: null })

    renderDashboard()

    const signOutButton = screen.getByRole('button', { name: /sign out/i })
    await user.click(signOutButton)

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })

  it('displays getting started section', () => {
    renderDashboard()

    expect(screen.getByRole('heading', { name: /getting started/i })).toBeInTheDocument()
    expect(
      screen.getByText(/your authentication is set up and ready to go/i)
    ).toBeInTheDocument()
  })

  it('displays next steps section', () => {
    renderDashboard()

    expect(screen.getByRole('heading', { name: /next steps/i })).toBeInTheDocument()
    expect(
      screen.getByText(/you can now build your lineup management features/i)
    ).toBeInTheDocument()
  })

  it('displays user information section with JSON data', () => {
    renderDashboard()

    expect(screen.getByRole('heading', { name: /user information/i })).toBeInTheDocument()

    // Check that the user JSON is displayed (formatted)
    const preElement = screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === 'pre'
    })

    expect(preElement).toBeInTheDocument()
  })

  it('displays correct information in getting started list', () => {
    renderDashboard()

    expect(
      screen.getByText(/user authentication is fully configured with supabase/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/protected routes are working/i)).toBeInTheDocument()
    expect(
      screen.getByText(/session management is handled automatically/i)
    ).toBeInTheDocument()
  })

  it('displays correct information in next steps list', () => {
    renderDashboard()

    expect(screen.getByText(/create database tables in supabase/i)).toBeInTheDocument()
    expect(screen.getByText(/add api calls to fetch and update data/i)).toBeInTheDocument()
    expect(screen.getByText(/build your lineup management ui/i)).toBeInTheDocument()
    expect(screen.getByText(/add more pages and features/i)).toBeInTheDocument()
  })

  it('avatar link navigates to profile page', () => {
    renderDashboard()

    // Find the link that wraps the avatar
    const avatarLinks = screen.getAllByRole('link').filter((link) => {
      return link.querySelector('[data-testid="user-avatar"]')
    })

    expect(avatarLinks[0]).toHaveAttribute('href', '/profile')
  })

  it('has proper styling classes for active dashboard link', () => {
    renderDashboard()

    // Get the dashboard link in navigation (not in header text)
    const dashboardLinks = screen.getAllByRole('link', { name: /dashboard/i })
    const navDashboardLink = dashboardLinks.find((link) =>
      link.className.includes('text-indigo-600')
    )

    expect(navDashboardLink).toHaveClass('text-indigo-600')
  })

  it('navigates to home page even if signOut fails', async () => {
    const user = userEvent.setup()
    mockSignOut.mockResolvedValue({
      error: { message: 'Network error', name: 'AuthError' },
    })

    renderDashboard()

    const signOutButton = screen.getByRole('button', { name: /sign out/i })
    await user.click(signOutButton)

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith('/')
    })
  })
})
