import { useState, useEffect } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import UserAvatar from '../components/UserAvatar'

export default function Profile() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const [fullName, setFullName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user?.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 means no rows returned, which is fine for new users
        throw error
      }

      if (data) {
        setFullName(data.full_name || '')
        if (data.avatar_url) {
          // Get the public URL for the avatar
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(data.avatar_url)
          setAvatarUrl(publicUrl)
        }
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      setError(null)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `${user?.id}/${Math.random()}.${fileExt}`

      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) {
        throw uploadError
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setAvatarUrl(publicUrl)

      // Update the profile with the new avatar path
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          avatar_url: filePath,
          updated_at: new Date().toISOString(),
        })

      if (updateError) throw updateError

      setMessage('Avatar uploaded successfully!')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setSaving(true)

    try {
      const updates = {
        id: user?.id,
        full_name: fullName,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase.from('profiles').upsert(updates)

      if (error) throw error

      setMessage('Profile updated successfully!')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-600 text-lg">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold text-gray-900">Lineup Manager</h1>
            <nav className="flex gap-4">
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
              >
                Profile
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/profile">
              <UserAvatar size="md" />
            </Link>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white p-8 rounded-lg shadow">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Profile</h2>

          <div className="mb-6 pb-6 border-b border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p className="text-gray-900">{user?.email}</p>
            <p className="text-sm text-gray-500 mt-1">Email cannot be changed here</p>
          </div>

          {/* Avatar Section */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-3">Profile Picture</label>
            <div className="flex items-center gap-6">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-2xl">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <label
                  htmlFor="avatar-upload"
                  className={`inline-block px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors ${
                    uploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {uploading ? 'Uploading...' : 'Upload New Picture'}
                </label>
                <p className="text-sm text-gray-500 mt-2">JPG, PNG or GIF (max 2MB)</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label htmlFor="fullName" className="block mb-2 text-gray-700 font-medium">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                disabled={saving}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              />
            </div>

            {error && (
              <div className="px-4 py-3 bg-red-50 text-red-700 rounded-md mb-4 text-sm">
                {error}
              </div>
            )}
            {message && (
              <div className="px-4 py-3 bg-green-50 text-green-700 rounded-md mb-4 text-sm">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full px-4 py-3 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : 'Update Profile'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
