export type GameStatus = 'TITLE' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';

export type LaneIndex = -1 | 0 | 1; // -1: Left, 0: Center, 1: Right

export type ObstacleType = 
  | 'BARRIER'        // Low barrier on road - jump or change lane
  | 'HIGH_BEAM'      // Overhead highway cyber gantry - slide or change lane
  | 'DRONE'          // Hovering robot drone in middle height - change lane
  | 'ROAD_BLOCK';    // Big concrete hazard block with warning stripes - change lane

export type PowerUpType = 
  | 'MAGNET'         // Attracts coins automatically
  | 'SHIELD'         // Absorbs 1 fatal collision
  | 'MULTIPLIER';    // 2x score multiplier

export interface GameStats {
  score: number;
  highScore: number;
  coins: number;
  totalCoins: number;
  distance: number;
  speed: number;
  shieldActive: boolean;
  magnetActive: boolean;
  multiplierActive: boolean;
  magnetTimeLeft: number;
  multiplierTimeLeft: number;
  newHighScore: boolean;
}

export interface RunnerActionState {
  lane: LaneIndex;
  targetX: number;
  currentX: number;
  y: number;
  velocityY: number;
  isJumping: boolean;
  isSliding: boolean;
  slideTimer: number;
  rollAngle: number;
  runCycle: number;
}
