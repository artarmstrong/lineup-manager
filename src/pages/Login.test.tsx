import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Login from './Login'
import { useAuth } from '../contexts/AuthContext'

// Mock the auth context
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
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

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  )
}

describe('Login', () => {
  const mockSignIn = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      loading: false,
      signUp: vi.fn(),
      signIn: mockSignIn,
      signOut: vi.fn(),
    })
  })

  it('renders login form with email and password inputs', () => {
    renderLogin()

    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('renders link to signup page', () => {
    renderLogin()

    const signUpLink = screen.getByRole('link', { name: /sign up/i })
    expect(signUpLink).toBeInTheDocument()
    expect(signUpLink).toHaveAttribute('href', '/signup')
  })

  it('updates email input when user types', async () => {
    const user = userEvent.setup()
    renderLogin()

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement

    await user.type(emailInput, 'test@example.com')

    expect(emailInput.value).toBe('test@example.com')
  })

  it('updates password input when user types', async () => {
    const user = userEvent.setup()
    renderLogin()

    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement

    await user.type(passwordInput, 'password123')

    expect(passwordInput.value).toBe('password123')
  })

  it('calls signIn with correct credentials on form submit', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValue({ error: null })

    renderLogin()

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
  })

  it('navigates to dashboard on successful login', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValue({ error: null })

    renderLogin()

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('displays error message when login fails', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValue({
      error: { message: 'Invalid credentials', name: 'AuthError' },
    })

    renderLogin()

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })
  })

  it('does not navigate to dashboard when login fails', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValue({
      error: { message: 'Invalid credentials', name: 'AuthError' },
    })

    renderLogin()

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('shows loading state during login', async () => {
    const user = userEvent.setup()
    let resolveSignIn: any
    mockSignIn.mockReturnValue(
      new Promise((resolve) => {
        resolveSignIn = resolve
      })
    )

    renderLogin()

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(screen.getByRole('button', { name: /loading/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /loading/i })).toBeDisabled()

    // Resolve the promise to clean up
    resolveSignIn({ error: null })
  })

  it('disables form inputs during loading', async () => {
    const user = userEvent.setup()
    let resolveSignIn: any
    mockSignIn.mockReturnValue(
      new Promise((resolve) => {
        resolveSignIn = resolve
      })
    )

    renderLogin()

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(screen.getByLabelText(/email/i)).toBeDisabled()
    expect(screen.getByLabelText(/password/i)).toBeDisabled()

    // Resolve the promise to clean up
    resolveSignIn({ error: null })
  })

  it('handles unexpected errors gracefully', async () => {
    const user = userEvent.setup()
    mockSignIn.mockRejectedValue(new Error('Network error'))

    renderLogin()

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument()
    })
  })

  it('clears error message when form is resubmitted', async () => {
    const user = userEvent.setup()

    // First submission fails
    mockSignIn.mockResolvedValueOnce({
      error: { message: 'Invalid credentials', name: 'AuthError' },
    })

    renderLogin()

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument()
    })

    // Second submission succeeds
    mockSignIn.mockResolvedValueOnce({ error: null })

    await user.clear(screen.getByLabelText(/password/i))
    await user.type(screen.getByLabelText(/password/i), 'correctpassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument()
    })
  })

  it('requires email field to be filled', () => {
    renderLogin()

    const emailInput = screen.getByLabelText(/email/i)
    expect(emailInput).toHaveAttribute('required')
    expect(emailInput).toHaveAttribute('type', 'email')
  })

  it('requires password field to be filled with minimum length', () => {
    renderLogin()

    const passwordInput = screen.getByLabelText(/password/i)
    expect(passwordInput).toHaveAttribute('required')
    expect(passwordInput).toHaveAttribute('minLength', '6')
    expect(passwordInput).toHaveAttribute('type', 'password')
  })
})
