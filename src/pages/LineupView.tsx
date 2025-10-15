import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UserAvatar from '../components/UserAvatar';
import LineupRotation from '../components/LineupRotation';
import { supabase } from '../lib/supabase';
import type { Lineup } from '../types/lineup.types';
import { POSITION_NAMES } from '../types/lineup.types';

export default function LineupView() {
  const { id } = useParams<{ id: string }>();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [lineup, setLineup] = useState<Lineup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  useEffect(() => {
    fetchLineup();
  }, [id]);

  const fetchLineup = async () => {
    if (!user || !id) return;

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('lineups')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;
      setLineup(data as Lineup);
    } catch (err) {
      console.error('Error fetching lineup:', err);
      setError('Failed to load lineup');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this lineup?')) return;

    try {
      const { error: deleteError } = await supabase
        .from('lineups')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;
      navigate('/lineups');
    } catch (err) {
      console.error('Error deleting lineup:', err);
      alert('Failed to delete lineup');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !lineup) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Lineup not found'}</p>
          <Link to="/lineups" className="text-indigo-600 hover:text-indigo-700 font-medium">
            ← Back to Lineups
          </Link>
        </div>
      </div>
    );
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <Link to="/lineups" className="text-indigo-600 hover:text-indigo-700 font-medium">
            ← Back to Lineups
          </Link>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors"
          >
            Delete Lineup
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          {/* Lineup Header */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{lineup.name}</h2>
            <div className="flex gap-4 text-sm text-gray-600">
              <span className="capitalize">{lineup.data.sport}</span>
              <span>•</span>
              <span>{lineup.data.players.length} players</span>
              {lineup.data.rotationSettings && (
                <>
                  <span>•</span>
                  <span>{lineup.data.rotationSettings.numberOfInnings} innings</span>
                </>
              )}
            </div>
          </div>

          {/* Players List */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Players & Batting Order</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Batting Order
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Player Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Initial Position
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Jersey #
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lineup.data.players
                    .sort((a, b) => a.battingOrder - b.battingOrder)
                    .map((player) => (
                      <tr key={player.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {player.battingOrder}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {player.name}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {player.position} - {POSITION_NAMES[player.position]}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {player.jerseyNumber || '-'}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Rotation Settings Summary */}
          {lineup.data.rotationSettings && (
            <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Rotation Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-blue-800">
                <div>
                  <span className="font-medium">Innings:</span> {lineup.data.rotationSettings.numberOfInnings}
                </div>
                <div>
                  <span className="font-medium">Pitcher Position:</span>{' '}
                  {lineup.data.rotationSettings.usePitcher ? 'Yes' : 'No'}
                </div>
                <div>
                  <span className="font-medium">Catcher Position:</span>{' '}
                  {lineup.data.rotationSettings.useCatcher ? 'Yes' : 'No'}
                </div>
              </div>
            </div>
          )}

          {/* Display Rotation if Generated */}
          {lineup.data.rotation && lineup.data.rotation.length > 0 && (
            <LineupRotation rotation={lineup.data.rotation} />
          )}

          {!lineup.data.rotation && (
            <div className="text-center py-8 text-gray-500">
              <p>No position rotation has been generated for this lineup.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
