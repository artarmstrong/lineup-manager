import type { Player, Position, InningAssignment, RotationSettings } from '../types/lineup.types';

/**
 * Categorize positions into infield and outfield
 */
type PositionCategory = 'infield' | 'outfield' | 'bench';

function getPositionCategory(position: Position): PositionCategory {
  const infieldPositions: Position[] = ['P', 'C', '1B', '2B', '3B', 'SS'];
  const outfieldPositions: Position[] = ['LF', 'CF', 'RF'];

  if (infieldPositions.includes(position)) return 'infield';
  if (outfieldPositions.includes(position)) return 'outfield';
  return 'bench';
}

/**
 * Generates a fair rotation of players through positions over multiple innings
 * Ensures balanced distribution between infield and outfield positions
 * Prioritizes rotating players through different positions before repeating
 */
export function generateRotation(
  players: Player[],
  settings: RotationSettings
): InningAssignment[][] {
  const { numberOfInnings, usePitcher, useCatcher } = settings;

  // Build separate lists for infield and outfield positions
  const infieldPositions: Position[] = [];
  const outfieldPositions: Position[] = ['LF', 'CF', 'RF'];

  if (usePitcher) infieldPositions.push('P');
  if (useCatcher) infieldPositions.push('C');
  infieldPositions.push('1B', '2B', '3B', 'SS');

  const allFieldPositions = [...infieldPositions, ...outfieldPositions];
  const numFieldPositions = allFieldPositions.length;
  const numPlayers = players.length;

  // Track how many times each player has played each specific position
  const playerPositionCount: Map<string, Map<Position, number>> = new Map();
  players.forEach(player => {
    const positionMap = new Map<Position, number>();
    allFieldPositions.forEach(pos => positionMap.set(pos, 0));
    positionMap.set('BENCH', 0);
    playerPositionCount.set(player.id, positionMap);
  });

  // Track category counts for balancing infield/outfield
  const playerCategoryCount: Map<string, { infield: number; outfield: number; bench: number }> = new Map();
  players.forEach(player => {
    playerCategoryCount.set(player.id, { infield: 0, outfield: 0, bench: 0 });
  });

  const rotation: InningAssignment[][] = [];

  for (let inning = 1; inning <= numberOfInnings; inning++) {
    const inningAssignments: InningAssignment[] = [];
    const assignedPlayers = new Set<string>();

    // For each position, find the best player to assign
    for (const position of allFieldPositions) {
      const positionCategory = getPositionCategory(position);

      // Find the best player for this position
      let bestPlayer: Player | null = null;
      let bestScore = Infinity;

      for (const player of players) {
        if (assignedPlayers.has(player.id)) continue;

        // Check position restrictions
        if (position === 'P' && player.cannotPitch) continue;
        if (position === 'C' && player.cannotCatch) continue;

        const positionCount = playerPositionCount.get(player.id)!.get(position)!;
        const categoryCount = playerCategoryCount.get(player.id)![positionCategory];

        // Scoring system:
        // Primary: Prefer players who haven't played this specific position (lower is better)
        // Secondary: Prefer players who have played this category less (for balance)
        // Score = (positionCount * 1000) + categoryCount
        // This heavily weights avoiding repeat positions
        const score = (positionCount * 1000) + categoryCount;

        if (score < bestScore) {
          bestScore = score;
          bestPlayer = player;
        }
      }

      if (bestPlayer) {
        inningAssignments.push({
          inning,
          playerId: bestPlayer.id,
          playerName: bestPlayer.name,
          position,
          battingOrder: bestPlayer.battingOrder,
          jerseyNumber: bestPlayer.jerseyNumber,
        });

        assignedPlayers.add(bestPlayer.id);

        // Update stats
        playerPositionCount.get(bestPlayer.id)!.set(position,
          playerPositionCount.get(bestPlayer.id)!.get(position)! + 1
        );
        playerCategoryCount.get(bestPlayer.id)![positionCategory]++;
      }
    }

    // Assign remaining players to bench
    for (const player of players) {
      if (!assignedPlayers.has(player.id)) {
        inningAssignments.push({
          inning,
          playerId: player.id,
          playerName: player.name,
          position: 'BENCH',
          battingOrder: player.battingOrder,
          jerseyNumber: player.jerseyNumber,
        });

        // Update stats
        playerPositionCount.get(player.id)!.set('BENCH',
          playerPositionCount.get(player.id)!.get('BENCH')! + 1
        );
        playerCategoryCount.get(player.id)!.bench++;
      }
    }

    // Sort by batting order for display
    inningAssignments.sort((a, b) => a.battingOrder - b.battingOrder);

    rotation.push(inningAssignments);
  }

  return rotation;
}

/**
 * Get available positions based on settings (for dropdown filtering)
 */
export function getAvailablePositions(settings: RotationSettings): Position[] {
  const positions: Position[] = [];

  if (settings.usePitcher) positions.push('P');
  if (settings.useCatcher) positions.push('C');

  positions.push('1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'BENCH');

  return positions;
}

/**
 * Validates that all players have unique batting orders
 */
export function validateBattingOrders(players: Player[]): boolean {
  const orders = players.map(p => p.battingOrder);
  const uniqueOrders = new Set(orders);
  return orders.length === uniqueOrders.size;
}

/**
 * Get position statistics for a player across all innings
 */
export function getPlayerStats(
  playerId: string,
  rotation: InningAssignment[][]
): Record<Position, number> {
  const stats: Record<string, number> = {};

  rotation.forEach(inning => {
    const assignment = inning.find(a => a.playerId === playerId);
    if (assignment) {
      stats[assignment.position] = (stats[assignment.position] || 0) + 1;
    }
  });

  return stats as Record<Position, number>;
}
