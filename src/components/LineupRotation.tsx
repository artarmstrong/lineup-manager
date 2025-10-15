import type { InningAssignment } from '../types/lineup.types';
import { POSITION_NAMES } from '../types/lineup.types';

interface LineupRotationProps {
  rotation: InningAssignment[][];
}

export default function LineupRotation({ rotation }: LineupRotationProps) {
  if (!rotation || rotation.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Position Rotation by Inning</h3>
      <p className="text-sm text-gray-600 mb-4">
        This rotation distributes players evenly across positions throughout the game. This is view-only.
      </p>

      <div className="space-y-6">
        {rotation.map((inningAssignments, index) => {
          const inningNumber = index + 1;

          return (
            <div key={inningNumber} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                Inning {inningNumber}
              </h4>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Batting Order
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Player Name
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Position
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {inningAssignments.map((assignment) => (
                      <tr key={assignment.playerId} className="hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                          {assignment.battingOrder}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                          {assignment.playerName}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {assignment.position} - {POSITION_NAMES[assignment.position]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* Position Summary */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">📊 How Rotation Works</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Players rotate through available positions each inning</li>
          <li>• Each player gets fair playing time at different positions</li>
          <li>• If there are more players than field positions, some will be on the bench</li>
          <li>• Batting order remains consistent throughout the game</li>
        </ul>
      </div>
    </div>
  );
}
