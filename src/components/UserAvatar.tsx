import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

interface UserAvatarProps {
  size?: 'sm' | 'md' | 'lg'
}

export default function UserAvatar({ size = 'md' }: UserAvatarProps) {
  const { user } = useAuth()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
  }

  useEffect(() => {
    if (user) {
      loadAvatar()
    }
  }, [user])

  const loadAvatar = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user?.id)
        .single()

      if (!error && data?.avatar_url) {
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(data.avatar_url)
        setAvatarUrl(publicUrl)
      }
    } catch (err) {
      // Silently fail - just show default avatar
      console.error('Error loading avatar:', err)
    }
  }

  return (
    <>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="User avatar"
          className={`${sizeClasses[size]} rounded-full object-cover border-2 border-gray-200`}
        />
      ) : (
        <div className={`${sizeClasses[size]} rounded-full bg-indigo-100 flex items-center justify-center border-2 border-indigo-200`}>
          <span className="text-indigo-600 font-semibold">
            {user?.email?.charAt(0).toUpperCase()}
          </span>
        </div>
      )}
    </>
  )
}
