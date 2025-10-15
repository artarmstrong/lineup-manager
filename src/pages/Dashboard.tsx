import { useAuth } from '../contexts/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import UserAvatar from '../components/UserAvatar'

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
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
                className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white p-8 rounded-lg shadow mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to your Dashboard!</h2>
          <p className="text-gray-600">Logged in as: {user?.email}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Getting Started</h3>
          <p className="text-gray-600 leading-relaxed mb-4">
            Your authentication is set up and ready to go. This is your
            protected dashboard that only authenticated users can access.
          </p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>User authentication is fully configured with Supabase</li>
            <li>Protected routes are working</li>
            <li>Session management is handled automatically</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Next Steps</h3>
          <p className="text-gray-600 leading-relaxed mb-4">You can now build your lineup management features:</p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Create database tables in Supabase</li>
            <li>Add API calls to fetch and update data</li>
            <li>Build your lineup management UI</li>
            <li>Add more pages and features</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">User Information</h3>
          <pre className="bg-gray-50 p-4 rounded overflow-x-auto text-sm text-gray-800">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      </main>
    </div>
  )
}
