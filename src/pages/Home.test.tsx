import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Home from './Home'
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

const renderHome = () => {
  return render(
    <BrowserRouter>
      <Home />
    </BrowserRouter>
  )
}

describe('Home', () => {
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
  })

  describe('Unauthenticated User', () => {
    beforeEach(() => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        session: null,
        loading: false,
        signUp: vi.fn(),
        signIn: vi.fn(),
        signOut: mockSignOut,
      })
    })

    it('renders main heading and tagline', () => {
      renderHome()

      expect(screen.getByRole('heading', { name: /lineup manager/i })).toBeInTheDocument()
      expect(screen.getByText(/manage your lineups with ease/i)).toBeInTheDocument()
    })

    it('displays sign in and sign up links when not authenticated', () => {
      renderHome()

      const signInLink = screen.getByRole('link', { name: /^sign in$/i })
      const signUpLink = screen.getByRole('link', { name: /sign up/i })

      expect(signInLink).toBeInTheDocument()
      expect(signInLink).toHaveAttribute('href', '/login')

      expect(signUpLink).toBeInTheDocument()
      expect(signUpLink).toHaveAttribute('href', '/signup')
    })

    it('does not display header navigation when not authenticated', () => {
      renderHome()

      expect(screen.queryByRole('banner')).not.toBeInTheDocument()
      expect(screen.queryByText(/welcome,/i)).not.toBeInTheDocument()
    })

    it('does not display go to dashboard link when not authenticated', () => {
      renderHome()

      expect(screen.queryByRole('link', { name: /go to dashboard/i })).not.toBeInTheDocument()
    })
  })

  describe('Authenticated User', () => {
    beforeEach(() => {
      vi.mocked(useAuth).mockReturnValue({
        user: mockUser,
        session: null,
        loading: false,
        signUp: vi.fn(),
        signIn: vi.fn(),
        signOut: mockSignOut,
      })
    })

    it('displays welcome header with user email', () => {
      renderHome()

      expect(screen.getByRole('banner')).toBeInTheDocument()
      expect(screen.getByText(/welcome, test@example\.com/i)).toBeInTheDocument()
    })

    it('displays navigation links in header', () => {
      renderHome()

      const dashboardLinks = screen.getAllByRole('link', { name: /dashboard/i })
      const profileLinks = screen.getAllByRole('link', { name: /profile/i })

      expect(dashboardLinks.length).toBeGreaterThan(0)
      expect(profileLinks.length).toBeGreaterThan(0)
    })

    it('displays user avatar in header', () => {
      renderHome()

      const avatar = screen.getByTestId('user-avatar')
      expect(avatar).toBeInTheDocument()
      expect(avatar).toHaveAttribute('data-size', 'md')
    })

    it('displays sign out button in header', () => {
      renderHome()

      const signOutButton = screen.getByRole('button', { name: /sign out/i })
      expect(signOutButton).toBeInTheDocument()
    })

    it('calls signOut when sign out button is clicked', async () => {
      const user = userEvent.setup()
      mockSignOut.mockResolvedValue({ error: null })

      renderHome()

      const signOutButton = screen.getByRole('button', { name: /sign out/i })
      await user.click(signOutButton)

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled()
      })
    })

    it('displays go to dashboard link when authenticated', () => {
      renderHome()

      const dashboardLink = screen.getByRole('link', { name: /go to dashboard/i })
      expect(dashboardLink).toBeInTheDocument()
      expect(dashboardLink).toHaveAttribute('href', '/dashboard')
    })

    it('does not display sign in and sign up links when authenticated', () => {
      renderHome()

      expect(screen.queryByRole('link', { name: /^sign in$/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('link', { name: /^sign up$/i })).not.toBeInTheDocument()
    })

    it('avatar link navigates to profile page', () => {
      renderHome()

      const avatarLinks = screen.getAllByRole('link').filter((link) => {
        return link.querySelector('[data-testid="user-avatar"]')
      })

      expect(avatarLinks[0]).toHaveAttribute('href', '/profile')
    })
  })

  describe('Sign Out Functionality', () => {
    beforeEach(() => {
      vi.mocked(useAuth).mockReturnValue({
        user: mockUser,
        session: null,
        loading: false,
        signUp: vi.fn(),
        signIn: vi.fn(),
        signOut: mockSignOut,
      })
    })

    it('handles sign out even if it fails', async () => {
      const user = userEvent.setup()
      mockSignOut.mockResolvedValue({
        error: { message: 'Network error', name: 'AuthError' },
      })

      renderHome()

      const signOutButton = screen.getByRole('button', { name: /sign out/i })
      await user.click(signOutButton)

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled()
      })
    })
  })
})
