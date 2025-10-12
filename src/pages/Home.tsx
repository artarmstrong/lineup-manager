import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import './Home.css'

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()

  if (user) {
    navigate('/dashboard')
    return null
  }

  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Lineup Manager</h1>
        <p className="home-subtitle">
          Manage your lineups with ease
        </p>

        <div className="home-buttons">
          <Link to="/login" className="home-button primary">
            Sign In
          </Link>
          <Link to="/signup" className="home-button secondary">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}
