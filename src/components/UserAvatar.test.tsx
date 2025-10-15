import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import UserAvatar from './UserAvatar'
import { useAuth } from '../contexts/AuthContext'

// Mock the auth context
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}))

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        })),
      })),
    })),
    storage: {
      from: vi.fn(() => ({
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://example.com/avatar.jpg' } })),
      })),
    },
  },
}))

describe('UserAvatar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders default avatar with user initial when no avatar is uploaded', () => {
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

    render(<UserAvatar />)

    // Should show the first letter of the email
    expect(screen.getByText('T')).toBeInTheDocument()
  })

  it('renders with correct size classes', () => {
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

    const { container, rerender } = render(<UserAvatar size="sm" />)
    expect(container.querySelector('.w-8')).toBeInTheDocument()

    rerender(<UserAvatar size="md" />)
    expect(container.querySelector('.w-10')).toBeInTheDocument()

    rerender(<UserAvatar size="lg" />)
    expect(container.querySelector('.w-12')).toBeInTheDocument()
  })

  it('handles missing user gracefully', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      loading: false,
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    })

    render(<UserAvatar />)

    // Should still render without crashing
    const avatar = document.querySelector('.rounded-full')
    expect(avatar).toBeInTheDocument()
  })
})
