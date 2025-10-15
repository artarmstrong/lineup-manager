import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UserAvatar from '../components/UserAvatar';
import { supabase } from '../lib/supabase';
import type { Sport, Position, Player, LineupData, Lineup } from '../types/lineup.types';
import { ALL_POSITIONS, POSITION_NAMES, BATTING_ORDER_NUMBERS } from '../types/lineup.types';

export default function LineupForm() {
  const { id } = useParams<{ id: string }>();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isEditing = id !== 'new';

  const [name, setName] = useState('');
  const [sport, setSport] = useState<Sport>('baseball');
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  useEffect(() => {
    if (isEditing) {
      fetchLineup();
    }
  }, [id]);

  const fetchLineup = async () => {
    if (!user || !id || id === 'new') return;

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('lineups')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;

      const lineup = data as Lineup;
      setName(lineup.name);
      setSport(lineup.data.sport);
      setPlayers(lineup.data.players);
    } catch (err) {
      console.error('Error fetching lineup:', err);
      setError('Failed to load lineup');
    } finally {
      setLoading(false);
    }
  };

  const addPlayer = () => {
    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name: '',
      position: 'P',
      battingOrder: players.length + 1,
      jerseyNumber: '',
    };
    setPlayers([...players, newPlayer]);
  };

  const removePlayer = (playerId: string) => {
    const updatedPlayers = players
      .filter(p => p.id !== playerId)
      .map((p, index) => ({ ...p, battingOrder: index + 1 }));
    setPlayers(updatedPlayers);
  };

  const updatePlayer = (playerId: string, field: keyof Player, value: string | number) => {
    setPlayers(players.map(p =>
      p.id === playerId ? { ...p, [field]: value } : p
    ));
  };

  const movePlayerUp = (index: number) => {
    if (index === 0) return;
    const newPlayers = [...players];
    [newPlayers[index - 1], newPlayers[index]] = [newPlayers[index], newPlayers[index - 1]];
    // Update batting order
    newPlayers.forEach((p, i) => p.battingOrder = i + 1);
    setPlayers(newPlayers);
  };

  const movePlayerDown = (index: number) => {
    if (index === players.length - 1) return;
    const newPlayers = [...players];
    [newPlayers[index], newPlayers[index + 1]] = [newPlayers[index + 1], newPlayers[index]];
    // Update batting order
    newPlayers.forEach((p, i) => p.battingOrder = i + 1);
    setPlayers(newPlayers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validation
    if (!name.trim()) {
      setError('Please enter a lineup name');
      return;
    }

    if (players.length === 0) {
      setError('Please add at least one player');
      return;
    }

    const hasEmptyNames = players.some(p => !p.name.trim());
    if (hasEmptyNames) {
      setError('All players must have a name');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const lineupData: LineupData = {
        sport,
        players,
      };

      if (isEditing) {
        // Update existing lineup
        const { error: updateError } = await supabase
          .from('lineups')
          .update({
            name,
            data: lineupData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .eq('user_id', user.id);

        if (updateError) throw updateError;
      } else {
        // Create new lineup
        const { error: insertError } = await supabase
          .from('lineups')
          .insert({
            name,
            data: lineupData,
            user_id: user.id,
            created_by: user.id,
          });

        if (insertError) throw insertError;
      }

      navigate('/lineups');
    } catch (err) {
      console.error('Error saving lineup:', err);
      setError('Failed to save lineup');
    } finally {
      setSaving(false);
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/lineups" className="text-indigo-600 hover:text-indigo-700 font-medium">
            ← Back to Lineups
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {isEditing ? 'Edit Lineup' : 'Create New Lineup'}
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Lineup Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Lineup Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Starting 9, Practice Squad"
                  required
                />
              </div>

              {/* Sport */}
              <div>
                <label htmlFor="sport" className="block text-sm font-medium text-gray-700 mb-1">
                  Sport
                </label>
                <select
                  id="sport"
                  value={sport}
                  onChange={(e) => setSport(e.target.value as Sport)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="baseball">Baseball</option>
                  <option value="softball">Softball</option>
                </select>
              </div>

              {/* Players */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Players
                  </label>
                  <button
                    type="button"
                    onClick={addPlayer}
                    className="px-3 py-1 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700 transition-colors"
                  >
                    + Add Player
                  </button>
                </div>

                {players.length === 0 ? (
                  <p className="text-gray-500 text-center py-8 bg-gray-50 rounded">
                    No players added yet. Click "Add Player" to start building your lineup.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {players.map((player, index) => (
                      <div key={player.id} className="flex gap-2 items-start p-3 bg-gray-50 rounded">
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => movePlayerUp(index)}
                            disabled={index === 0}
                            className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            onClick={() => movePlayerDown(index)}
                            disabled={index === players.length - 1}
                            className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            ▼
                          </button>
                        </div>

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Batting Order</label>
                            <input
                              type="text"
                              value={player.battingOrder}
                              readOnly
                              className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-100 text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Name</label>
                            <input
                              type="text"
                              value={player.name}
                              onChange={(e) => updatePlayer(player.id, 'name', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              placeholder="Player name"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Position</label>
                            <select
                              value={player.position}
                              onChange={(e) => updatePlayer(player.id, 'position', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                              {ALL_POSITIONS.map(pos => (
                                <option key={pos} value={pos}>
                                  {pos} - {POSITION_NAMES[pos]}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Jersey #</label>
                            <input
                              type="text"
                              value={player.jerseyNumber || ''}
                              onChange={(e) => updatePlayer(player.id, 'jerseyNumber', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              placeholder="Optional"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removePlayer(player.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : isEditing ? 'Update Lineup' : 'Create Lineup'}
                </button>
                <Link
                  to="/lineups"
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md font-medium hover:bg-gray-300 transition-colors text-center"
                >
                  Cancel
                </Link>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
