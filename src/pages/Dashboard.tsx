import { useAuth } from '../contexts/AuthContext'
import Header from '../components/Header'
import Card from '../components/Card'

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card padding={8} className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to your Dashboard!</h2>
          <p className="text-gray-600">Logged in as: {user?.email}</p>
        </Card>

        <Card className="mb-6">
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
        </Card>

        <Card className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Next Steps</h3>
          <p className="text-gray-600 leading-relaxed mb-4">You can now build your lineup management features:</p>
          <ul className="list-disc pl-6 text-gray-600 space-y-2">
            <li>Create database tables in Supabase</li>
            <li>Add API calls to fetch and update data</li>
            <li>Build your lineup management UI</li>
            <li>Add more pages and features</li>
          </ul>
        </Card>

        <Card>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">User Information</h3>
          <pre className="bg-gray-50 p-4 rounded overflow-x-auto text-sm text-gray-800">
            {JSON.stringify(user, null, 2)}
          </pre>
        </Card>
      </main>
    </div>
  )
}
