import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import './Dashboard.css'

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Lineup Manager</h1>
        <button onClick={handleSignOut} className="sign-out-button">
          Sign Out
        </button>
      </header>

      <main className="dashboard-content">
        <div className="welcome-section">
          <h2>Welcome to your Dashboard!</h2>
          <p className="user-email">Logged in as: {user?.email}</p>
        </div>

        <div className="info-card">
          <h3>Getting Started</h3>
          <p>
            Your authentication is set up and ready to go. This is your
            protected dashboard that only authenticated users can access.
          </p>
          <ul>
            <li>User authentication is fully configured with Supabase</li>
            <li>Protected routes are working</li>
            <li>Session management is handled automatically</li>
          </ul>
        </div>

        <div className="info-card">
          <h3>Next Steps</h3>
          <p>You can now build your lineup management features:</p>
          <ul>
            <li>Create database tables in Supabase</li>
            <li>Add API calls to fetch and update data</li>
            <li>Build your lineup management UI</li>
            <li>Add more pages and features</li>
          </ul>
        </div>

        <div className="info-card">
          <h3>User Information</h3>
          <pre className="user-info">{JSON.stringify(user, null, 2)}</pre>
        </div>
      </main>
    </div>
  )
}
