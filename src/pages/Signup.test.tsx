import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Signup from './Signup'
import { useAuth } from '../contexts/AuthContext'

// Mock the auth context
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}))

const renderSignup = () => {
  return render(
    <BrowserRouter>
      <Signup />
    </BrowserRouter>
  )
}

describe('Signup', () => {
  const mockSignUp = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      loading: false,
      signUp: mockSignUp,
      signIn: vi.fn(),
      signOut: vi.fn(),
    })
  })

  it('renders signup form with email and password inputs', () => {
    renderSignup()

    expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
  })

  it('renders link to login page', () => {
    renderSignup()

    const signInLink = screen.getByRole('link', { name: /sign in/i })
    expect(signInLink).toBeInTheDocument()
    expect(signInLink).toHaveAttribute('href', '/login')
  })

  it('updates email input when user types', async () => {
    const user = userEvent.setup()
    renderSignup()

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement

    await user.type(emailInput, 'newuser@example.com')

    expect(emailInput.value).toBe('newuser@example.com')
  })

  it('updates password input when user types', async () => {
    const user = userEvent.setup()
    renderSignup()

    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement

    await user.type(passwordInput, 'password123')

    expect(passwordInput.value).toBe('password123')
  })

  it('calls signUp with correct credentials on form submit', async () => {
    const user = userEvent.setup()
    mockSignUp.mockResolvedValue({ error: null })

    renderSignup()

    await user.type(screen.getByLabelText(/email/i), 'newuser@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    expect(mockSignUp).toHaveBeenCalledWith('newuser@example.com', 'password123')
  })

  it('displays success message on successful signup', async () => {
    const user = userEvent.setup()
    mockSignUp.mockResolvedValue({ error: null })

    renderSignup()

    await user.type(screen.getByLabelText(/email/i), 'newuser@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/success! check your email for the confirmation link/i)
      ).toBeInTheDocument()
    })
  })

  it('clears form fields on successful signup', async () => {
    const user = userEvent.setup()
    mockSignUp.mockResolvedValue({ error: null })

    renderSignup()

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement

    await user.type(emailInput, 'newuser@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    await waitFor(() => {
      expect(emailInput.value).toBe('')
      expect(passwordInput.value).toBe('')
    })
  })

  it('displays error message when signup fails', async () => {
    const user = userEvent.setup()
    mockSignUp.mockResolvedValue({
      error: { message: 'Email already registered', name: 'AuthError' },
    })

    renderSignup()

    await user.type(screen.getByLabelText(/email/i), 'existing@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    await waitFor(() => {
      expect(screen.getByText('Email already registered')).toBeInTheDocument()
    })
  })

  it('does not clear form fields when signup fails', async () => {
    const user = userEvent.setup()
    mockSignUp.mockResolvedValue({
      error: { message: 'Email already registered', name: 'AuthError' },
    })

    renderSignup()

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement

    await user.type(emailInput, 'existing@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    await waitFor(() => {
      expect(screen.getByText('Email already registered')).toBeInTheDocument()
    })

    expect(emailInput.value).toBe('existing@example.com')
    expect(passwordInput.value).toBe('password123')
  })

  it('shows loading state during signup', async () => {
    const user = userEvent.setup()
    let resolveSignUp: any
    mockSignUp.mockReturnValue(
      new Promise((resolve) => {
        resolveSignUp = resolve
      })
    )

    renderSignup()

    await user.type(screen.getByLabelText(/email/i), 'newuser@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    expect(screen.getByRole('button', { name: /loading/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /loading/i })).toBeDisabled()

    // Resolve the promise to clean up
    resolveSignUp({ error: null })
  })

  it('disables form inputs during loading', async () => {
    const user = userEvent.setup()
    let resolveSignUp: any
    mockSignUp.mockReturnValue(
      new Promise((resolve) => {
        resolveSignUp = resolve
      })
    )

    renderSignup()

    await user.type(screen.getByLabelText(/email/i), 'newuser@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    expect(screen.getByLabelText(/email/i)).toBeDisabled()
    expect(screen.getByLabelText(/password/i)).toBeDisabled()

    // Resolve the promise to clean up
    resolveSignUp({ error: null })
  })

  it('handles unexpected errors gracefully', async () => {
    const user = userEvent.setup()
    mockSignUp.mockRejectedValue(new Error('Network error'))

    renderSignup()

    await user.type(screen.getByLabelText(/email/i), 'newuser@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    await waitFor(() => {
      expect(screen.getByText('An unexpected error occurred')).toBeInTheDocument()
    })
  })

  it('clears error and success messages when form is resubmitted', async () => {
    const user = userEvent.setup()

    // First submission fails
    mockSignUp.mockResolvedValueOnce({
      error: { message: 'Email already registered', name: 'AuthError' },
    })

    renderSignup()

    await user.type(screen.getByLabelText(/email/i), 'existing@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    await waitFor(() => {
      expect(screen.getByText('Email already registered')).toBeInTheDocument()
    })

    // Second submission succeeds
    mockSignUp.mockResolvedValueOnce({ error: null })

    await user.clear(screen.getByLabelText(/email/i))
    await user.type(screen.getByLabelText(/email/i), 'newuser@example.com')
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    await waitFor(() => {
      expect(screen.queryByText('Email already registered')).not.toBeInTheDocument()
    })
  })

  it('does not show both error and success messages at the same time', async () => {
    const user = userEvent.setup()

    // First submission succeeds
    mockSignUp.mockResolvedValueOnce({ error: null })

    renderSignup()

    await user.type(screen.getByLabelText(/email/i), 'newuser@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/success! check your email for the confirmation link/i)
      ).toBeInTheDocument()
    })

    // Second submission fails
    mockSignUp.mockResolvedValueOnce({
      error: { message: 'Network error', name: 'AuthError' },
    })

    await user.type(screen.getByLabelText(/email/i), 'another@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password456')
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })

    expect(
      screen.queryByText(/success! check your email for the confirmation link/i)
    ).not.toBeInTheDocument()
  })

  it('requires email field to be filled', () => {
    renderSignup()

    const emailInput = screen.getByLabelText(/email/i)
    expect(emailInput).toHaveAttribute('required')
    expect(emailInput).toHaveAttribute('type', 'email')
  })

  it('requires password field to be filled with minimum length', () => {
    renderSignup()

    const passwordInput = screen.getByLabelText(/password/i)
    expect(passwordInput).toHaveAttribute('required')
    expect(passwordInput).toHaveAttribute('minLength', '6')
    expect(passwordInput).toHaveAttribute('type', 'password')
  })
})
