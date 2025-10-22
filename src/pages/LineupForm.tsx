import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UserAvatar from '../components/UserAvatar';
import { supabase } from '../lib/supabase';
import type { Sport, Player, LineupData, RotationSettings } from '../types/lineup.types';
import { POSITION_NAMES } from '../types/lineup.types';
import { generateRotation, getAvailablePositions } from '../utils/rotationGenerator';

const MAX_FREE_LINEUPS = 5;

export default function LineupForm() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [sport, setSport] = useState<Sport>('baseball');
  const [players, setPlayers] = useState<Player[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lineupCount, setLineupCount] = useState<number | null>(null);
  const [checkingLimit, setCheckingLimit] = useState(true);

  // Rotation settings
  const [numberOfInnings, setNumberOfInnings] = useState<number>(6);
  const [usePitcher, setUsePitcher] = useState<boolean>(true);
  const [useCatcher, setUseCatcher] = useState<boolean>(true);

  // Check lineup count on mount
  useEffect(() => {
    const checkLineupLimit = async () => {
      if (!user) return;

      try {
        const { count, error: countError } = await supabase
          .from('lineups')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (countError) throw countError;

        setLineupCount(count || 0);

        if (count !== null && count >= MAX_FREE_LINEUPS) {
          setError(`You have reached the maximum of ${MAX_FREE_LINEUPS} lineups for the free tier. Please delete an existing lineup to create a new one.`);
        }
      } catch (err) {
        console.error('Error checking lineup count:', err);
      } finally {
        setCheckingLimit(false);
      }
    };

    checkLineupLimit();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const addPlayer = () => {
    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name: '',
      position: 'BENCH',
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

  const updatePlayer = (playerId: string, field: keyof Player, value: string | number | boolean) => {
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

  // Get available positions based on current settings
  const availablePositions = getAvailablePositions({
    numberOfInnings,
    usePitcher,
    useCatcher,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Check lineup limit
    if (lineupCount !== null && lineupCount >= MAX_FREE_LINEUPS) {
      setError(`You have reached the maximum of ${MAX_FREE_LINEUPS} lineups for the free tier. Please delete an existing lineup to create a new one.`);
      return;
    }

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

    // Validate pitcher/catcher restrictions
    if (usePitcher) {
      const eligiblePitchers = players.filter(p => !p.cannotPitch);
      if (eligiblePitchers.length === 0) {
        setError('You have "Use Pitcher Position" enabled, but all players are marked as "Cannot pitch". At least one player must be able to pitch.');
        return;
      }
    }

    if (useCatcher) {
      const eligibleCatchers = players.filter(p => !p.cannotCatch);
      if (eligibleCatchers.length === 0) {
        setError('You have "Use Catcher Position" enabled, but all players are marked as "Cannot catch". At least one player must be able to catch.');
        return;
      }
    }

    try {
      setSaving(true);
      setError(null);

      const rotationSettings: RotationSettings = {
        numberOfInnings,
        usePitcher,
        useCatcher,
      };

      // Auto-generate rotation before saving
      const generatedRotation = generateRotation(players, rotationSettings);

      const lineupData: LineupData = {
        sport,
        players,
        rotationSettings,
        rotation: generatedRotation,
      };

      // Create new lineup
      const { data: newLineup, error: insertError } = await supabase
        .from('lineups')
        .insert({
          name,
          data: lineupData,
          user_id: user.id,
          created_by: user.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Navigate to the newly created lineup view
      navigate(`/lineups/${newLineup.id}/view`);
    } catch (err) {
      console.error('Error saving lineup:', err);
      setError('Failed to save lineup');
    } finally {
      setSaving(false);
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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/lineups" className="text-indigo-600 hover:text-indigo-700 font-medium">
            ← Back to Lineups
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Create New Lineup
          </h2>

          {checkingLimit && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
              Checking lineup limit...
            </div>
          )}

          {!checkingLimit && lineupCount !== null && lineupCount < MAX_FREE_LINEUPS && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
              You have {lineupCount} of {MAX_FREE_LINEUPS} lineups. {MAX_FREE_LINEUPS - lineupCount} remaining.
            </div>
          )}

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
                  disabled={lineupCount !== null && lineupCount >= MAX_FREE_LINEUPS}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
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
                  disabled={lineupCount !== null && lineupCount >= MAX_FREE_LINEUPS}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100"
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
                    disabled={lineupCount !== null && lineupCount >= MAX_FREE_LINEUPS}
                    className="px-3 py-1 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

                        <div className="flex-1">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
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
                                {availablePositions.map(pos => (
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

                          {/* Position Restrictions */}
                          {(usePitcher || useCatcher) && (
                            <div className="flex gap-4 text-xs">
                              {usePitcher && (
                                <label className="flex items-center gap-1 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={player.cannotPitch || false}
                                    onChange={(e) => updatePlayer(player.id, 'cannotPitch', e.target.checked)}
                                    className="h-3 w-3 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                  />
                                  <span className="text-gray-700">Cannot pitch</span>
                                </label>
                              )}
                              {useCatcher && (
                                <label className="flex items-center gap-1 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={player.cannotCatch || false}
                                    onChange={(e) => updatePlayer(player.id, 'cannotCatch', e.target.checked)}
                                    className="h-3 w-3 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                  />
                                  <span className="text-gray-700">Cannot catch</span>
                                </label>
                              )}
                            </div>
                          )}
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

              {/* Rotation Settings */}
              {players.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Position Rotation Settings</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label htmlFor="innings" className="block text-sm font-medium text-gray-700 mb-1">
                        Number of Innings
                      </label>
                      <input
                        type="number"
                        id="innings"
                        min="1"
                        max="12"
                        value={numberOfInnings}
                        onChange={(e) => setNumberOfInnings(parseInt(e.target.value) || 6)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="usePitcher"
                        checked={usePitcher}
                        onChange={(e) => setUsePitcher(e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="usePitcher" className="ml-2 block text-sm text-gray-700">
                        Use Pitcher Position
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="useCatcher"
                        checked={useCatcher}
                        onChange={(e) => setUseCatcher(e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="useCatcher" className="ml-2 block text-sm text-gray-700">
                        Use Catcher Position
                      </label>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    Position rotation will be automatically generated when you create the lineup. Players will be distributed evenly across all positions for each inning.
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving || checkingLimit || (lineupCount !== null && lineupCount >= MAX_FREE_LINEUPS)}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : checkingLimit ? 'Checking...' : 'Create Lineup'}
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
