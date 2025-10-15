import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UserAvatar from '../components/UserAvatar';
import { supabase } from '../lib/supabase';
import type { Lineup } from '../types/lineup.types';

export default function Lineups() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [lineups, setLineups] = useState<Lineup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const fetchLineups = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('lineups')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (fetchError) throw fetchError;
      setLineups(data || []);
    } catch (err) {
      console.error('Error fetching lineups:', err);
      setError('Failed to load lineups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLineups();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lineup?')) return;

    try {
      const { error: deleteError } = await supabase
        .from('lineups')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Remove from local state
      setLineups(lineups.filter(lineup => lineup.id !== id));
    } catch (err) {
      console.error('Error deleting lineup:', err);
      alert('Failed to delete lineup');
    }
  };

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
                to="/lineups"
                className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
              >
                Lineups
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">My Lineups</h2>
          <Link
            to="/lineups/new"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-colors"
          >
            Create New Lineup
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-600">Loading lineups...</p>
          </div>
        ) : lineups.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">You haven't created any lineups yet.</p>
            <Link
              to="/lineups/new"
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-colors"
            >
              Create Your First Lineup
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {lineups.map((lineup) => (
              <div
                key={lineup.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {lineup.name}
                    </h3>
                    <p className="text-sm text-gray-500 capitalize">
                      {lineup.data.sport}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    {lineup.data.players.length} player{lineup.data.players.length !== 1 ? 's' : ''}
                  </p>
                  {lineup.data.rotationSettings && (
                    <p className="text-sm text-gray-600">
                      {lineup.data.rotationSettings.numberOfInnings} innings
                    </p>
                  )}
                  {lineup.data.rotation && lineup.data.rotation.length > 0 && (
                    <p className="text-xs text-green-600 font-medium mt-1">
                      ✓ Rotation generated
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Updated {new Date(lineup.updated_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/lineups/${lineup.id}/view`}
                    className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700 transition-colors text-center"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleDelete(lineup.id)}
                    className="px-3 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
