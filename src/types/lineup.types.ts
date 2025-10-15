export type Sport = 'baseball' | 'softball';

export type Position =
  | 'P'     // Pitcher
  | 'C'     // Catcher
  | '1B'    // First Base
  | '2B'    // Second Base
  | '3B'    // Third Base
  | 'SS'    // Shortstop
  | 'LF'    // Left Field
  | 'CF'    // Center Field
  | 'RF'    // Right Field
  | 'BENCH'; // Bench

export interface Player {
  id: string;
  name: string;
  position: Position;
  battingOrder: number; // 1-9
  jerseyNumber?: string;
}

export interface RotationSettings {
  numberOfInnings: number;
  usePitcher: boolean;
  useCatcher: boolean;
}

export interface InningAssignment {
  inning: number;
  playerId: string;
  playerName: string;
  position: Position;
  battingOrder: number;
}

export interface LineupData {
  sport: Sport;
  players: Player[];
  rotationSettings?: RotationSettings;
  rotation?: InningAssignment[][]; // Array of innings, each inning is array of player assignments
}

export interface Lineup {
  id: string;
  user_id: string;
  created_by: string;
  team_id: string | null;
  name: string;
  data: LineupData;
  created_at: string;
  updated_at: string;
}

export interface LineupInsert {
  name: string;
  data: LineupData;
  user_id: string;
  created_by?: string;
  team_id?: string | null;
}

export interface LineupUpdate {
  name?: string;
  data?: LineupData;
  updated_at?: string;
}

// Position display names
export const POSITION_NAMES: Record<Position, string> = {
  'P': 'Pitcher',
  'C': 'Catcher',
  '1B': 'First Base',
  '2B': 'Second Base',
  '3B': 'Third Base',
  'SS': 'Shortstop',
  'LF': 'Left Field',
  'CF': 'Center Field',
  'RF': 'Right Field',
  'BENCH': 'Bench',
};

// All available positions
export const ALL_POSITIONS: Position[] = [
  'P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'BENCH'
];

// Batting order numbers
export const BATTING_ORDER_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
