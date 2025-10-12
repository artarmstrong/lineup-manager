import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const { user } = useAuth()
  const navigate = useNavigate()

  if (user) {
    navigate('/dashboard')
    return null
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 p-4">
      <div className="text-center text-white max-w-2xl">
        <h1 className="text-5xl font-bold mb-4">Lineup Manager</h1>
        <p className="text-xl mb-12 opacity-90">
          Manage your lineups with ease
        </p>

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
      </div>
    </div>
  )
}
