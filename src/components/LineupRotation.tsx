import type { InningAssignment, Position } from '../types/lineup.types';
import { POSITION_NAMES } from '../types/lineup.types';

interface LineupRotationProps {
  rotation: InningAssignment[][];
}

export default function LineupRotation({ rotation }: LineupRotationProps) {
  if (!rotation || rotation.length === 0) {
    return null;
  }

  // Get all unique positions from the rotation
  const allPositions = new Set<Position>();
  rotation.forEach(inning => {
    inning.forEach(assignment => {
      allPositions.add(assignment.position);
    });
  });

  // Convert to array and sort positions (field positions first, then bench)
  const positionOrder: Position[] = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'BENCH'];
  const positions = positionOrder.filter(pos => allPositions.has(pos));

  // Build a map: position -> inning -> player info
  const positionInningMap = new Map<Position, Map<number, { battingOrder: number; playerName: string; jerseyNumber?: string }>>();

  positions.forEach(position => {
    const inningMap = new Map<number, { battingOrder: number; playerName: string; jerseyNumber?: string }>();

    rotation.forEach((inningAssignments, inningIndex) => {
      const assignment = inningAssignments.find(a => a.position === position);
      if (assignment) {
        inningMap.set(inningIndex + 1, {
          battingOrder: assignment.battingOrder,
          playerName: assignment.playerName,
          jerseyNumber: assignment.jerseyNumber
        });
      }
    });

    positionInningMap.set(position, inningMap);
  });

  const numberOfInnings = rotation.length;

  return (
    <div className="mt-8 rotation-section">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Position Rotation by Inning</h3>
      <p className="text-sm text-gray-600 mb-4 print:hidden">
        This rotation distributes players evenly across positions throughout the game. This is view-only.
      </p>

      <div className="overflow-x-auto rotation-table-container">
        <table className="min-w-full divide-y divide-gray-300 border border-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border border-gray-300 sticky left-0 bg-gray-50 z-10">
                Position
              </th>
              {Array.from({ length: numberOfInnings }, (_, i) => i + 1).map(inningNum => (
                <th
                  key={inningNum}
                  className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider border border-gray-300"
                >
                  Inning {inningNum}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {positions.map(position => {
              const inningMap = positionInningMap.get(position)!;

              return (
                <tr key={position} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 border border-gray-300 sticky left-0 bg-white">
                    <div className="flex flex-col">
                      <span className="font-semibold print:hidden">{position}</span>
                      <span className="text-xs text-gray-500 print:text-sm print:text-gray-900 print:font-semibold">{POSITION_NAMES[position]}</span>
                    </div>
                  </td>
                  {Array.from({ length: numberOfInnings }, (_, i) => i + 1).map(inningNum => {
                    const playerInfo = inningMap.get(inningNum);

                    return (
                      <td
                        key={inningNum}
                        className="px-4 py-3 text-center text-sm text-gray-900 border border-gray-300"
                      >
                        {playerInfo ? (
                          <span className="font-medium">
                            {playerInfo.jerseyNumber ? `#${playerInfo.jerseyNumber} - ` : ''}{playerInfo.playerName}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Position Summary */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 print:hidden">
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
