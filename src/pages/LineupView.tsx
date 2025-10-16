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
    <>
      <style>{`
        @media print {
          @page {
            margin: 0.3in;
            size: landscape;
          }

          * {
            overflow: visible !important;
          }

          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          .print\\:hidden {
            display: none !important;
          }

          /* Force single page */
          html, body {
            height: 100%;
            overflow: hidden;
          }

          main {
            padding: 0 !important;
            margin: 0 !important;
          }

          /* Compact table styles for print */
          table {
            font-size: 7pt !important;
            border-collapse: collapse;
            width: 100%;
            page-break-inside: avoid;
          }

          th, td {
            padding: 2px 4px !important;
            border: 1px solid #000 !important;
            font-size: 7pt !important;
          }

          th {
            background-color: #f3f4f6 !important;
            font-weight: bold;
            font-size: 7pt !important;
          }

          /* Hide shadows and rounded corners */
          .shadow {
            box-shadow: none !important;
          }

          .rounded-lg {
            border-radius: 0 !important;
          }

          .bg-white {
            background: white !important;
          }

          /* Compact spacing */
          .print-compact {
            margin-bottom: 0.25rem !important;
          }

          .mb-8 {
            margin-bottom: 0.25rem !important;
          }

          .mb-6 {
            margin-bottom: 0.25rem !important;
          }

          .mb-4 {
            margin-bottom: 0.15rem !important;
          }

          .p-6 {
            padding: 0.25rem !important;
          }

          h2 {
            font-size: 11pt !important;
            margin-bottom: 3px !important;
            margin-top: 0 !important;
          }

          h3 {
            font-size: 9pt !important;
            margin-bottom: 2px !important;
            margin-top: 0 !important;
          }

          .text-sm, .text-xs {
            font-size: 6pt !important;
          }

          /* Make batting order table more compact */
          .batting-order-table {
            width: auto !important;
            max-width: 35% !important;
            float: none !important;
            margin-bottom: 0.5rem !important;
          }

          .batting-order-table table {
            width: auto !important;
          }

          .rotation-section {
            width: 100% !important;
            float: none !important;
            clear: both !important;
          }

          .rotation-table-container {
            overflow: visible !important;
          }

          /* Fix sticky position border issue in print */
          .sticky {
            position: static !important;
          }

          /* Ensure all borders show properly */
          td.border, th.border {
            border: 1px solid #000 !important;
          }

          /* Clear floats after tables */
          .clear-float::after {
            content: "";
            display: table;
            clear: both;
          }

          /* Ensure everything fits on one page */
          .overflow-x-auto {
            overflow: visible !important;
          }
        }
      `}</style>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm print:hidden">
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
        <div className="mb-6 flex justify-between items-center print:hidden">
          <Link to="/lineups" className="text-indigo-600 hover:text-indigo-700 font-medium">
            ← Back to Lineups
          </Link>
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-colors"
            >
              Print Lineup
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors"
            >
              Delete Lineup
            </button>
          </div>
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
                  <span>•</span>
                  <span>Pitcher: {lineup.data.rotationSettings.usePitcher ? 'Yes' : 'No'}</span>
                  <span>•</span>
                  <span>Catcher: {lineup.data.rotationSettings.useCatcher ? 'Yes' : 'No'}</span>
                </>
              )}
            </div>
          </div>

          {/* Players List */}
          <div className="mb-8 print-compact batting-order-table">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Batting Order</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300 border border-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border border-gray-300">
                      #
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border border-gray-300">
                      Player
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border border-gray-300">
                      Jersey
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {lineup.data.players
                    .sort((a, b) => a.battingOrder - b.battingOrder)
                    .map((player) => (
                      <tr key={player.id}>
                        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300">
                          {player.battingOrder}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 border border-gray-300">
                          {player.name}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-600 border border-gray-300">
                          {player.jerseyNumber || '-'}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Display Rotation if Generated */}
          <div className="clear-float">
            {lineup.data.rotation && lineup.data.rotation.length > 0 && (
              <LineupRotation rotation={lineup.data.rotation} />
            )}

            {!lineup.data.rotation && (
              <div className="text-center py-8 text-gray-500 print:hidden">
                <p>No position rotation has been generated for this lineup.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      </div>
    </>
  );
}
