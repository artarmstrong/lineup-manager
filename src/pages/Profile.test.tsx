import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import Profile from './Profile'
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

// Mock Supabase
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockSingle = vi.fn()
const mockFrom = vi.fn()
const mockUpsert = vi.fn()
const mockUpload = vi.fn()
const mockGetPublicUrl = vi.fn()
const mockStorageFrom = vi.fn()

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: (table: string) => {
      mockFrom(table)
      return {
        select: (...args: any[]) => {
          mockSelect(...args)
          return {
            eq: (...args: any[]) => {
              mockEq(...args)
              return {
                single: mockSingle,
              }
            },
          }
        },
        upsert: mockUpsert,
      }
    },
    storage: {
      from: (bucket: string) => {
        mockStorageFrom(bucket)
        return {
          upload: mockUpload,
          getPublicUrl: mockGetPublicUrl,
        }
      },
    },
  },
}))

const renderProfile = () => {
  return render(
    <BrowserRouter>
      <Profile />
    </BrowserRouter>
  )
}

describe('Profile', () => {
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

    // Default successful profile load
    mockSingle.mockResolvedValue({
      data: null,
      error: { code: 'PGRST116' }, // No profile exists
    })

    mockGetPublicUrl.mockReturnValue({
      data: { publicUrl: 'https://example.com/avatar.jpg' },
    })

    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      session: null,
      loading: false,
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: mockSignOut,
    })
  })

  describe('Loading State', () => {
    it('displays loading message while fetching profile', () => {
      // Mock a delayed response
      mockSingle.mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve({ data: null, error: { code: 'PGRST116' } }), 100)
          })
      )

      renderProfile()

      expect(screen.getByText(/loading profile/i)).toBeInTheDocument()
    })

    it('hides loading message after profile is loaded', async () => {
      mockSingle.mockResolvedValue({
        data: { full_name: 'John Doe', avatar_url: null },
        error: null,
      })

      renderProfile()

      await waitFor(() => {
        expect(screen.queryByText(/loading profile/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('Profile Display', () => {
    beforeEach(async () => {
      mockSingle.mockResolvedValue({
        data: { full_name: 'John Doe', avatar_url: null },
        error: null,
      })
    })

    it('renders profile page with header and form', async () => {
      renderProfile()

      await waitFor(() => {
        expect(screen.getByRole('banner')).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: /your profile/i })).toBeInTheDocument()
      })
    })

    it('displays user email with note that it cannot be changed', async () => {
      renderProfile()

      await waitFor(() => {
        expect(screen.getByText('test@example.com')).toBeInTheDocument()
        expect(screen.getByText(/email cannot be changed here/i)).toBeInTheDocument()
      })
    })

    it('loads and displays existing profile data', async () => {
      mockSingle.mockResolvedValue({
        data: { full_name: 'John Doe', avatar_url: null },
        error: null,
      })

      renderProfile()

      await waitFor(() => {
        const fullNameInput = screen.getByLabelText(/full name/i) as HTMLInputElement
        expect(fullNameInput.value).toBe('John Doe')
      })
    })

    it('displays default avatar when no avatar is uploaded', async () => {
      mockSingle.mockResolvedValue({
        data: { full_name: 'John Doe', avatar_url: null },
        error: null,
      })

      renderProfile()

      await waitFor(() => {
        expect(screen.getByText('T')).toBeInTheDocument() // First letter of email
      })
    })

    it('displays uploaded avatar when avatar_url exists', async () => {
      mockSingle.mockResolvedValue({
        data: { full_name: 'John Doe', avatar_url: 'avatars/123/image.jpg' },
        error: null,
      })

      renderProfile()

      await waitFor(() => {
        const avatarImg = screen.getByAltText('Avatar')
        expect(avatarImg).toBeInTheDocument()
        expect(avatarImg).toHaveAttribute('src', 'https://example.com/avatar.jpg')
      })
    })
  })

  describe('Navigation', () => {
    beforeEach(async () => {
      mockSingle.mockResolvedValue({
        data: { full_name: 'John Doe', avatar_url: null },
        error: null,
      })
    })

    it('renders navigation links to dashboard and profile', async () => {
      renderProfile()

      await waitFor(() => {
        const dashboardLink = screen.getAllByRole('link', { name: /dashboard/i })[0]
        const profileLink = screen.getAllByRole('link', { name: /profile/i })[0]

        expect(dashboardLink).toHaveAttribute('href', '/dashboard')
        expect(profileLink).toHaveAttribute('href', '/profile')
      })
    })

    it('highlights profile link as active', async () => {
      renderProfile()

      await waitFor(() => {
        const profileLinks = screen.getAllByRole('link', { name: /profile/i })
        const navProfileLink = profileLinks.find((link) =>
          link.className.includes('text-indigo-600')
        )

        expect(navProfileLink).toHaveClass('text-indigo-600')
      })
    })
  })

  describe('Profile Update', () => {
    beforeEach(async () => {
      mockSingle.mockResolvedValue({
        data: { full_name: '', avatar_url: null },
        error: null,
      })
    })

    it('updates full name when form is submitted', async () => {
      const user = userEvent.setup()
      mockUpsert.mockResolvedValue({ error: null })

      renderProfile()

      await waitFor(() => {
        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
      })

      const fullNameInput = screen.getByLabelText(/full name/i)
      await user.clear(fullNameInput)
      await user.type(fullNameInput, 'Jane Smith')
      await user.click(screen.getByRole('button', { name: /update profile/i }))

      await waitFor(() => {
        expect(mockUpsert).toHaveBeenCalledWith(
          expect.objectContaining({
            id: '123',
            full_name: 'Jane Smith',
          })
        )
      })
    })

    it('displays success message after successful update', async () => {
      const user = userEvent.setup()
      mockUpsert.mockResolvedValue({ error: null })

      renderProfile()

      await waitFor(() => {
        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText(/full name/i), 'Jane Smith')
      await user.click(screen.getByRole('button', { name: /update profile/i }))

      await waitFor(() => {
        expect(screen.getByText(/profile updated successfully/i)).toBeInTheDocument()
      })
    })

    it('displays error message when update fails', async () => {
      const user = userEvent.setup()
      mockUpsert.mockResolvedValue({
        error: { message: 'Update failed', name: 'SupabaseError' },
      })

      renderProfile()

      await waitFor(() => {
        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText(/full name/i), 'Jane Smith')
      await user.click(screen.getByRole('button', { name: /update profile/i }))

      await waitFor(() => {
        expect(screen.getByText(/update failed/i)).toBeInTheDocument()
      })
    })

    it('shows saving state during update', async () => {
      const user = userEvent.setup()
      let resolveUpsert: any
      mockUpsert.mockReturnValue(
        new Promise((resolve) => {
          resolveUpsert = resolve
        })
      )

      renderProfile()

      await waitFor(() => {
        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText(/full name/i), 'Jane Smith')
      await user.click(screen.getByRole('button', { name: /update profile/i }))

      expect(screen.getByRole('button', { name: /saving/i })).toBeInTheDocument()

      // Resolve to clean up
      resolveUpsert({ error: null })
    })

    it('disables form during saving', async () => {
      const user = userEvent.setup()
      let resolveUpsert: any
      mockUpsert.mockReturnValue(
        new Promise((resolve) => {
          resolveUpsert = resolve
        })
      )

      renderProfile()

      await waitFor(() => {
        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText(/full name/i), 'Jane Smith')
      await user.click(screen.getByRole('button', { name: /update profile/i }))

      expect(screen.getByLabelText(/full name/i)).toBeDisabled()
      expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()

      // Resolve to clean up
      resolveUpsert({ error: null })
    })
  })

  describe('Avatar Upload', () => {
    beforeEach(async () => {
      mockSingle.mockResolvedValue({
        data: { full_name: 'John Doe', avatar_url: null },
        error: null,
      })
    })

    it('uploads avatar when file is selected', async () => {
      const user = userEvent.setup()
      mockUpload.mockResolvedValue({ error: null })
      mockUpsert.mockResolvedValue({ error: null })

      renderProfile()

      await waitFor(() => {
        expect(screen.getByLabelText(/upload new picture/i)).toBeInTheDocument()
      })

      const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })
      const input = screen.getByLabelText(/upload new picture/i)

      await user.upload(input, file)

      await waitFor(() => {
        expect(mockUpload).toHaveBeenCalled()
      })
    })

    it('displays success message after successful avatar upload', async () => {
      const user = userEvent.setup()
      mockUpload.mockResolvedValue({ error: null })
      mockUpsert.mockResolvedValue({ error: null })

      renderProfile()

      await waitFor(() => {
        expect(screen.getByLabelText(/upload new picture/i)).toBeInTheDocument()
      })

      const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })
      const input = screen.getByLabelText(/upload new picture/i)

      await user.upload(input, file)

      await waitFor(() => {
        expect(screen.getByText(/avatar uploaded successfully/i)).toBeInTheDocument()
      })
    })

    it('displays error when upload fails', async () => {
      const user = userEvent.setup()
      mockUpload.mockResolvedValue({
        error: { message: 'Upload failed', name: 'StorageError' },
      })

      renderProfile()

      await waitFor(() => {
        expect(screen.getByLabelText(/upload new picture/i)).toBeInTheDocument()
      })

      const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })
      const input = screen.getByLabelText(/upload new picture/i)

      await user.upload(input, file)

      await waitFor(() => {
        expect(screen.getByText(/upload failed/i)).toBeInTheDocument()
      })
    })

    it('shows uploading state during upload', async () => {
      const user = userEvent.setup()
      let resolveUpload: any
      mockUpload.mockReturnValue(
        new Promise((resolve) => {
          resolveUpload = resolve
        })
      )

      renderProfile()

      await waitFor(() => {
        expect(screen.getByText(/upload new picture/i)).toBeInTheDocument()
      })

      const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })
      const input = screen.getByLabelText(/upload new picture/i)

      await user.upload(input, file)

      await waitFor(() => {
        expect(screen.getByText(/uploading/i)).toBeInTheDocument()
      })

      // Resolve to clean up
      resolveUpload({ error: null })
    })
  })

  describe('Sign Out', () => {
    beforeEach(async () => {
      mockSingle.mockResolvedValue({
        data: { full_name: 'John Doe', avatar_url: null },
        error: null,
      })
    })

    it('calls signOut and navigates to home when sign out button is clicked', async () => {
      const user = userEvent.setup()
      mockSignOut.mockResolvedValue({ error: null })

      renderProfile()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /sign out/i }))

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled()
        expect(mockNavigate).toHaveBeenCalledWith('/')
      })
    })
  })

  describe('Error Handling', () => {
    it('displays error message when profile fails to load', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Database error', code: 'DB_ERROR' },
      })

      renderProfile()

      await waitFor(() => {
        expect(screen.getByText(/database error/i)).toBeInTheDocument()
      })
    })

    it('handles missing profile gracefully (new user)', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' }, // No rows returned
      })

      renderProfile()

      await waitFor(() => {
        const fullNameInput = screen.getByLabelText(/full name/i) as HTMLInputElement
        expect(fullNameInput.value).toBe('')
      })
    })
  })
})
