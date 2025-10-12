import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Home() {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700">
      {user && (
        <header className="bg-white/10 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h2 className="text-white font-semibold">Welcome, {user.email}</h2>
            <div className="flex gap-3">
              <Link
                to="/dashboard"
                className="px-4 py-2 bg-white text-indigo-600 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Go to Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 bg-transparent text-white border border-white rounded-md text-sm font-medium hover:bg-white/10 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>
      )}

      <div className="flex justify-center items-center min-h-[calc(100vh-72px)] p-4">
        <div className="text-center text-white max-w-2xl">
          <h1 className="text-5xl font-bold mb-4">Lineup Manager</h1>
          <p className="text-xl mb-12 opacity-90">
            Manage your lineups with ease
          </p>

          {!user && (
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                to="/login"
                className="px-8 py-3 bg-white text-indigo-600 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg border-2 border-white"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-8 py-3 bg-transparent text-white rounded-lg text-lg font-semibold hover:bg-white/10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg border-2 border-white"
              >
                Sign Up
              </Link>
            </div>
          )}

          {user && (
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                to="/dashboard"
                className="px-8 py-3 bg-white text-indigo-600 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg border-2 border-white"
              >
                Go to Dashboard
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
