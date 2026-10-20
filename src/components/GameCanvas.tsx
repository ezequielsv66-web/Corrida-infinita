import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../game/GameEngine';
import { GameStats } from '../types';
import { AlertTriangle, RefreshCw } from 'lucide-react';

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
  const [webGLError, setWebGLError] = useState<boolean>(false);

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      const engine = new GameEngine(containerRef.current, {
        onStatsUpdate,
        onGameOver,
      });
      engineRef.current = engine;
      onEngineReady(engine);
    } catch (err) {
      console.error('Falha ao inicializar o motor 3D WebGL:', err);
      setWebGLError(true);
    }

    return () => {
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, [onEngineReady, onStatsUpdate, onGameOver]);

  if (webGLError) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-950 text-center z-50">
        <div className="w-16 h-16 rounded-2xl bg-rose-950/80 border border-rose-500/50 flex items-center justify-center text-rose-400 mb-4 shadow-xl">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
          Aceleração Gráfica WebGL Necessária
        </h2>
        <p className="text-slate-400 max-w-md text-sm mb-6">
          Não foi possível inicializar o motor 3D. Verifica se o WebGL ou a aceleração de hardware estão ativados nas definições do teu navegador.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl flex items-center gap-2 transition active:scale-95 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Tentar Novamente</span>
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden bg-slate-950"
      style={{ touchAction: 'none' }}
    />
  );
};
