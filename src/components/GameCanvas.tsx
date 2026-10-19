import React, { useEffect, useRef } from 'react';
import { GameEngine } from '../game/GameEngine';
import { GameStats } from '../types';

interface GameCanvasProps {
  onEngineReady: (engine: GameEngine) => void;
  onStatsUpdate: (stats: GameStats) => void;
  onGameOver: (stats: GameStats) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  onEngineReady,
  onStatsUpdate,
  onGameOver,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new GameEngine(containerRef.current, {
      onStatsUpdate,
      onGameOver,
    });
    engineRef.current = engine;
    onEngineReady(engine);

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden bg-slate-950"
      style={{ touchAction: 'none' }}
    />
  );
};
