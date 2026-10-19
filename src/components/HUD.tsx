import React from 'react';
import { Volume2, VolumeX, Pause, HelpCircle, Shield, Magnet, Zap } from 'lucide-react';
import { GameStats } from '../types';

interface HUDProps {
  stats: GameStats;
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onOpenHelp: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  isMuted,
  onToggleMute,
  onPause,
  onOpenHelp,
}) => {
  // Speed in km/h (speed * 3.6)
  const speedKmh = Math.round(stats.speed * 3.6);

  return (
    <div className="absolute inset-0 pointer-events-none p-3 sm:p-5 flex flex-col justify-between select-none z-10">
      {/* Top Header Bar */}
      <div className="flex items-start justify-between gap-2">
        {/* Left: Score & Coins */}
        <div className="flex flex-col gap-1">
          {/* Main Score Readout */}
          <div className="bg-slate-900/85 border border-cyan-500/40 rounded-xl px-3.5 py-1.5 shadow-lg shadow-cyan-950/40">
            <span className="text-[10px] sm:text-xs font-semibold text-cyan-400 uppercase tracking-widest block">
              PONTUAÇÃO
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-wider tabular-nums font-mono drop-shadow">
              {stats.score.toLocaleString()}
            </div>
            {stats.highScore > 0 && (
              <div className="text-[11px] text-slate-400 font-mono">
                RECORDE: <span className="text-amber-400 font-semibold">{stats.highScore.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Coins counter */}
          <div className="flex items-center gap-2 bg-slate-900/80 border border-amber-500/40 rounded-lg px-3 py-1 shadow-md w-fit">
            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-300 flex items-center justify-center text-[10px] font-black text-amber-950 shadow">
              ¢
            </div>
            <span className="text-base sm:text-lg font-bold text-amber-300 font-mono tabular-nums">
              {stats.coins}
            </span>
          </div>
        </div>

        {/* Center: Distance & Speed */}
        <div className="flex flex-col items-center">
          <div className="bg-slate-900/85 border border-slate-700/60 rounded-xl px-4 py-1.5 text-center shadow-lg">
            <div className="text-xs text-slate-400 font-semibold tracking-wider uppercase">
              DISTÂNCIA
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono tabular-nums">
              {Math.floor(stats.distance)} <span className="text-cyan-400 text-sm font-sans">m</span>
            </div>
            <div className="text-[11px] font-mono text-cyan-300">
              {speedKmh} <span className="text-[9px] text-slate-400">km/h</span>
            </div>
          </div>

          {/* Active Powerups Badges */}
          <div className="flex items-center gap-2 mt-2">
            {stats.shieldActive && (
              <div className="flex items-center gap-1.5 bg-cyan-950/90 border border-cyan-400 text-cyan-300 px-2.5 py-1 rounded-full text-xs font-bold shadow-md animate-in fade-in">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span>ESCUDO</span>
              </div>
            )}

            {stats.magnetActive && (
              <div className="flex items-center gap-1.5 bg-red-950/90 border border-red-400 text-red-300 px-2.5 py-1 rounded-full text-xs font-bold shadow-md animate-in fade-in">
                <Magnet className="w-3.5 h-3.5 text-red-400" />
                <span>ÍMAN ({Math.ceil(stats.magnetTimeLeft)}s)</span>
              </div>
            )}

            {stats.multiplierActive && (
              <div className="flex items-center gap-1.5 bg-amber-950/90 border border-amber-400 text-amber-300 px-2.5 py-1 rounded-full text-xs font-bold shadow-md animate-in fade-in">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>2X PONTOS ({Math.ceil(stats.multiplierTimeLeft)}s)</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={onToggleMute}
            className="w-10 h-10 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-slate-700/70 text-slate-200 flex items-center justify-center transition active:scale-95 shadow-md"
            title={isMuted ? 'Ativar Som' : 'Silenciar Som'}
            aria-label="Som"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-cyan-400" />}
          </button>

          <button
            onClick={onOpenHelp}
            className="w-10 h-10 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-slate-700/70 text-slate-200 flex items-center justify-center transition active:scale-95 shadow-md"
            title="Como Jogar e Publicar"
            aria-label="Ajuda"
          >
            <HelpCircle className="w-5 h-5 text-slate-300" />
          </button>

          <button
            onClick={onPause}
            className="w-10 h-10 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-slate-700/70 text-slate-200 flex items-center justify-center transition active:scale-95 shadow-md"
            title="Pausar Jogo (Esc)"
            aria-label="Pausar"
          >
            <Pause className="w-5 h-5 text-slate-200" />
          </button>
        </div>
      </div>

      {/* Speedometer Bar along bottom subtle edge */}
      <div className="w-full max-w-md mx-auto mb-1">
        <div className="h-1.5 w-full bg-slate-900/80 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-amber-400 to-rose-500 transition-all duration-300"
            style={{ width: `${Math.min(100, (stats.speed / 64) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
