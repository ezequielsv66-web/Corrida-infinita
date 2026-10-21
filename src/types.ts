export type GameStatus = 'TITLE' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';

export type LaneIndex = -1 | 0 | 1; // -1: Esquerda, 0: Centro, 1: Direita

export type ObstacleType = 
  | 'TRAIN'          // Comboio de metro estacionado
  | 'TRAIN_RAMP'     // Comboio com rampa frontal para subir ao tejadilho
  | 'TRAIN_MOVING'   // Comboio em movimento rápido na direção do jogador com buzina e faróis
  | 'BARRIER'        // Barreira baixa clássica vermelha/branca (saltar por cima)
  | 'HIGH_BEAM'      // Sinalética superior elevada (deslizar por baixo)
  | 'ROAD_BLOCK';    // Barricada de obras / tampão terminal

export type PowerUpType = 
  | 'MAGNET'         // Íman de moedas (atrai moedas de todas as 3 linhas)
  | 'JETPACK'        // Mochila a jato (voa no céu com rasto de fumo e trilho de moedas)
  | 'SNEAKERS'       // Super sapatilhas de super salto elástico (salta comboios inteiros!)
  | 'MULTIPLIER'     // Multiplicador 2x de pontuação
  | 'HOVERBOARD'     // Skate voador com imunidade contra 1 colisão
  | 'MYSTERY_BOX'    // Caixa mistério clássica com prémios e moedas surpresa
  | 'LETTER_S'       // Letra S da Caça às Palavras (S-U-R-F)
  | 'LETTER_U'       // Letra U da Caça às Palavras
  | 'LETTER_R'       // Letra R da Caça às Palavras
  | 'LETTER_F';      // Letra F da Caça às Palavras

export interface GameStats {
  score: number;
  highScore: number;
  coins: number;
  totalCoins: number;
  distance: number;
  speed: number;
  scoreMultiplier: number;
  hoverboardActive: boolean;
  hoverboardTimeLeft: number;
  hoverboardsAvailable: number;
  jetpackActive: boolean;
  jetpackTimeLeft: number;
  sneakersActive: boolean;
  sneakersTimeLeft: number;
  magnetActive: boolean;
  magnetTimeLeft: number;
  multiplierActive: boolean;
  multiplierTimeLeft: number;
  shieldActive: boolean;
  newHighScore: boolean;
  mysteryBoxesCollected: number;
  lettersCollected: string[]; // ['S', 'U', 'R', 'F']
  inspectorAlert: boolean;
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
  onTrainRoof: boolean;
}
