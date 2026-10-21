import React from 'react';
import { Volume2, VolumeX, Pause, HelpCircle, Magnet, Zap, Wind, Rocket } from 'lucide-react';
import { GameStats } from '../types';

interface HUDProps {
  stats: GameStats;
  isMuted: boolean;
  showTouchControls?: boolean;
  onToggleTouchControls?: () => void;
  onToggleMute: () => void;
  onPause: () => void;
  onOpenHelp: () => void;
  onActivateHoverboard?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  isMuted,
  onToggleMute,
  onPause,
  onOpenHelp,
  onActivateHoverboard,
}) => {
  const speedKmh = Math.round(stats.speed * 3.6);
  const wordLetters = ['S', 'U', 'R', 'F'];

  return (
    <div className="absolute inset-0 pointer-events-none p-3 sm:p-5 flex flex-col justify-between select-none z-10 font-sans">
      {/* Top Header Bar */}
      <div className="flex items-start justify-between gap-2">
        {/* Left: Subway Surfers Gold Coins & Word Hunt (S-U-R-F) */}
        <div className="flex flex-col gap-2">
          {/* Coins counter */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/90 to-yellow-500/90 border-2 border-yellow-200 rounded-2xl px-3.5 py-1.5 shadow-[0_4px_12px_rgba(245,158,11,0.4)] w-fit">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-200 border-2 border-amber-900 flex items-center justify-center text-xs font-black text-amber-950 shadow-inner">
              ¢
            </div>
            <span className="text-xl sm:text-2xl font-black text-amber-950 font-mono tracking-tight tabular-nums drop-shadow-sm">
              {stats.coins}
            </span>
          </div>

          {/* Word Hunt (S - U - R - F) Letters */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-700/80 rounded-xl px-2.5 py-1 backdrop-blur-sm shadow-md">
            <span className="text-[10px] font-black text-cyan-400 mr-1 uppercase tracking-wider">HUNT:</span>
            {wordLetters.map((l) => {
              const collected = stats.lettersCollected.includes(l);
              return (
                <div
                  key={l}
                  className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center transition-all ${
                    collected
                      ? 'bg-gradient-to-t from-amber-500 to-yellow-300 text-amber-950 shadow-[0_0_8px_rgba(251,191,36,0.8)] scale-110'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  {l}
                </div>
              );
            })}
          </div>

          {/* Mystery Boxes collected badge if any */}
          {stats.mysteryBoxesCollected > 0 && (
            <div className="flex items-center gap-1.5 bg-purple-900/85 border border-purple-400 text-purple-200 px-2.5 py-1 rounded-xl text-xs font-black shadow-md w-fit">
              <span>🎁</span>
              <span>x{stats.mysteryBoxesCollected} CAIXAS</span>
            </div>
          )}
        </div>

        {/* Center: Distance, Inspector Warning & Power-ups */}
        <div className="flex flex-col items-center">
          {/* Distance */}
          <div className="bg-slate-950/85 border-2 border-cyan-500/50 rounded-2xl px-4 py-1 text-center shadow-lg backdrop-blur-sm">
            <div className="text-[10px] text-cyan-300 font-extrabold tracking-widest uppercase">
              DISTÂNCIA
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono tabular-nums">
              {Math.floor(stats.distance)} <span className="text-cyan-400 text-xs font-sans">m</span>
            </div>
          </div>

          {/* Inspector Alert Warning */}
          {stats.inspectorAlert && (
            <div className="mt-1.5 flex items-center gap-1.5 bg-red-600/95 border-2 border-yellow-300 text-white font-black px-3 py-1 rounded-full text-xs shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-bounce">
              <span>🚨</span>
              <span>GUARDA ATRÁS DE TI!</span>
            </div>
          )}

          {/* Active Powerups Badges */}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap justify-center max-w-xs">
            {stats.hoverboardActive && (
              <div className="flex items-center gap-1.5 bg-cyan-600 text-white border border-cyan-200 px-2.5 py-1 rounded-full text-xs font-black shadow-lg animate-pulse">
                <Wind className="w-3.5 h-3.5" />
                <span>SKATE ({Math.ceil(stats.hoverboardTimeLeft)}s)</span>
              </div>
            )}

            {stats.jetpackActive && (
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-orange-500 text-white border border-yellow-300 px-2.5 py-1 rounded-full text-xs font-black shadow-lg animate-pulse">
                <Rocket className="w-3.5 h-3.5" />
                <span>JETPACK ({Math.ceil(stats.jetpackTimeLeft)}s)</span>
              </div>
            )}

            {stats.sneakersActive && (
              <div className="flex items-center gap-1.5 bg-amber-500 text-amber-950 border border-yellow-200 px-2.5 py-1 rounded-full text-xs font-black shadow-md">
                <span>👟</span>
                <span>SUPER SALTO ({Math.ceil(stats.sneakersTimeLeft)}s)</span>
              </div>
            )}

            {stats.magnetActive && (
              <div className="flex items-center gap-1.5 bg-rose-600 text-white border border-rose-300 px-2.5 py-1 rounded-full text-xs font-black shadow-md">
                <Magnet className="w-3.5 h-3.5" />
                <span>ÍMAN ({Math.ceil(stats.magnetTimeLeft)}s)</span>
              </div>
            )}

            {stats.multiplierActive && (
              <div className="flex items-center gap-1.5 bg-yellow-400 text-yellow-950 border border-yellow-100 px-2.5 py-1 rounded-full text-xs font-black shadow-md">
                <Zap className="w-3.5 h-3.5" />
                <span>2X MULTI ({Math.ceil(stats.multiplierTimeLeft)}s)</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Subway Surfers Score & Multiplier Badge + Actions */}
        <div className="flex flex-col items-end gap-2">
          {/* Score & Multiplier */}
          <div className="flex items-center gap-2">
            {/* Multiplier Badge (e.g. x30 / x60) */}
            <div className="bg-gradient-to-b from-amber-400 to-orange-500 border-2 border-yellow-200 text-amber-950 font-black text-sm sm:text-base px-2.5 py-1 rounded-xl shadow-md flex items-center justify-center font-mono">
              x{stats.multiplierActive ? stats.scoreMultiplier * 2 : stats.scoreMultiplier}
            </div>

            {/* Main Score Readout */}
            <div className="bg-slate-950/85 border-2 border-slate-700/80 rounded-2xl px-4 py-1.5 text-right shadow-lg backdrop-blur-sm min-w-[110px]">
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">
                SCORE
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight tabular-nums drop-shadow">
                {stats.score.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Quick Buttons */}
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={onToggleMute}
              className="w-10 h-10 rounded-2xl bg-slate-950/85 hover:bg-slate-800 border-2 border-slate-700 text-slate-200 flex items-center justify-center transition active:scale-95 shadow-md cursor-pointer"
              title={isMuted ? 'Ativar Som' : 'Silenciar Som'}
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-cyan-400" />}
            </button>

            <button
              onClick={onOpenHelp}
              className="w-10 h-10 rounded-2xl bg-slate-950/85 hover:bg-slate-800 border-2 border-slate-700 text-slate-200 flex items-center justify-center transition active:scale-95 shadow-md cursor-pointer"
              title="Ajuda & Instruções"
            >
              <HelpCircle className="w-5 h-5 text-slate-300" />
            </button>

            <button
              onClick={onPause}
              className="w-10 h-10 rounded-2xl bg-gradient-to-b from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 border-2 border-yellow-200 text-slate-950 font-black flex items-center justify-center transition active:scale-95 shadow-md cursor-pointer"
              title="Pausar (Esc)"
            >
              <Pause className="w-5 h-5 fill-slate-950" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Center: Subway Surfers Hoverboard Quick Activator */}
      <div className="w-full flex justify-center pointer-events-auto mb-1">
        <button
          onClick={onActivateHoverboard}
          disabled={stats.hoverboardActive || stats.hoverboardsAvailable <= 0}
          className={`flex items-center gap-3 px-5 py-2.5 rounded-full border-2 transition-all active:scale-95 shadow-xl cursor-pointer ${
            stats.hoverboardActive
              ? 'bg-cyan-500 text-slate-950 border-cyan-200 animate-pulse'
              : stats.hoverboardsAvailable > 0
              ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:to-red-400 text-white border-yellow-300 shadow-[0_0_20px_rgba(245,158,11,0.6)]'
              : 'bg-slate-800/80 text-slate-500 border-slate-700 cursor-not-allowed opacity-60'
          }`}
          title="Ativar Skate Hoverboard (Toque 2x ou Espaço 2x)"
        >
          <div className="w-8 h-8 rounded-full bg-slate-950/30 flex items-center justify-center text-lg">
            🛹
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs sm:text-sm font-black tracking-wider uppercase drop-shadow-sm">
              {stats.hoverboardActive ? 'SKATE ATIVO!' : 'TOQUE 2X PARA SKATE'}
            </span>
            <span className="text-[10px] font-bold text-yellow-200">
              DISPONÍVEIS: {stats.hoverboardsAvailable}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};
