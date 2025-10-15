import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext'
import type { ReactNode } from 'react'

// Mock Supabase
const mockGetSession = vi.fn()
const mockOnAuthStateChange = vi.fn()
const mockSignUp = vi.fn()
const mockSignInWithPassword = vi.fn()
const mockSignOut = vi.fn()

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: () => mockGetSession(),
      onAuthStateChange: (callback: any) => mockOnAuthStateChange(callback),
      signUp: (credentials: any) => mockSignUp(credentials),
      signInWithPassword: (credentials: any) => mockSignInWithPassword(credentials),
      signOut: () => mockSignOut(),
    },
  },
}))

describe('AuthContext', () => {
  const mockUser = {
    id: '123',
    email: 'test@example.com',
    aud: 'authenticated',
    role: 'authenticated',
    created_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: {},
  }

  const mockSession = {
    access_token: 'mock-token',
    refresh_token: 'mock-refresh',
    user: mockUser,
    expires_in: 3600,
    expires_at: Date.now() + 3600000,
    token_type: 'bearer',
  }

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  )

  beforeEach(() => {
    vi.clearAllMocks()

    // Default mock implementation
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null })
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    })
  })

  describe('useAuth', () => {
    it('throws error when used outside AuthProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        renderHook(() => useAuth())
      }).toThrow('useAuth must be used within an AuthProvider')

      consoleSpy.mockRestore()
    })

    it('provides auth context when used within AuthProvider', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current).toHaveProperty('user')
      expect(result.current).toHaveProperty('session')
      expect(result.current).toHaveProperty('loading')
      expect(result.current).toHaveProperty('signUp')
      expect(result.current).toHaveProperty('signIn')
      expect(result.current).toHaveProperty('signOut')
    })
  })

  describe('AuthProvider', () => {
    it('initializes with loading true and null user/session', () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.loading).toBe(true)
      expect(result.current.user).toBe(null)
      expect(result.current.session).toBe(null)
    })

    it('sets user and session when initial session exists', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.session).toEqual(mockSession)
    })

    it('sets user and session to null when no initial session', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.user).toBe(null)
      expect(result.current.session).toBe(null)
    })

    it('updates state when auth state changes', async () => {
      let authCallback: any
      mockOnAuthStateChange.mockImplementation((callback) => {
        authCallback = callback
        return {
          data: { subscription: { unsubscribe: vi.fn() } },
        }
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Simulate auth state change
      authCallback('SIGNED_IN', mockSession)

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
        expect(result.current.session).toEqual(mockSession)
      })
    })

    it('clears state when user signs out via auth state change', async () => {
      let authCallback: any
      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })
      mockOnAuthStateChange.mockImplementation((callback) => {
        authCallback = callback
        return {
          data: { subscription: { unsubscribe: vi.fn() } },
        }
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
      })

      // Simulate sign out
      authCallback('SIGNED_OUT', null)

      await waitFor(() => {
        expect(result.current.user).toBe(null)
        expect(result.current.session).toBe(null)
      })
    })
  })

  describe('signUp', () => {
    it('calls supabase.auth.signUp with correct credentials', async () => {
      mockSignUp.mockResolvedValue({ data: { user: mockUser }, error: null })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await result.current.signUp('test@example.com', 'password123')

      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    it('returns error when signup fails', async () => {
      const mockError = { message: 'Email already exists', name: 'AuthError' }
      mockSignUp.mockResolvedValue({ data: { user: null }, error: mockError })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const response = await result.current.signUp('test@example.com', 'password123')

      expect(response.error).toEqual(mockError)
    })

    it('returns null error when signup succeeds', async () => {
      mockSignUp.mockResolvedValue({ data: { user: mockUser }, error: null })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const response = await result.current.signUp('test@example.com', 'password123')

      expect(response.error).toBe(null)
    })
  })

  describe('signIn', () => {
    it('calls supabase.auth.signInWithPassword with correct credentials', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await result.current.signIn('test@example.com', 'password123')

      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    it('returns error when signin fails', async () => {
      const mockError = { message: 'Invalid credentials', name: 'AuthError' }
      mockSignInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: mockError,
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const response = await result.current.signIn('test@example.com', 'wrongpassword')

      expect(response.error).toEqual(mockError)
    })

    it('returns null error when signin succeeds', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const response = await result.current.signIn('test@example.com', 'password123')

      expect(response.error).toBe(null)
    })
  })

  describe('signOut', () => {
    it('calls supabase.auth.signOut', async () => {
      mockSignOut.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await result.current.signOut()

      expect(mockSignOut).toHaveBeenCalled()
    })

    it('returns error when signout fails', async () => {
      const mockError = { message: 'Network error', name: 'AuthError' }
      mockSignOut.mockResolvedValue({ error: mockError })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const response = await result.current.signOut()

      expect(response.error).toEqual(mockError)
    })

    it('returns null error when signout succeeds', async () => {
      mockSignOut.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const response = await result.current.signOut()

      expect(response.error).toBe(null)
    })
  })
})
