import React from 'react';
import { Play, Volume2, VolumeX, HelpCircle, Trophy, Smartphone, Monitor } from 'lucide-react';

interface TitleScreenProps {
  highScore: number;
  totalCoins: number;
  isMuted: boolean;
  onStart: () => void;
  onToggleMute: () => void;
  onOpenHelp: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  highScore,
  totalCoins,
  isMuted,
  onStart,
  onToggleMute,
  onOpenHelp,
}) => {
  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-between p-6 sm:p-10 pointer-events-none select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between w-full pointer-events-auto">
        {/* Record & Coins Pill */}
        <div className="flex items-center gap-3">
          {highScore > 0 && (
            <div className="flex items-center gap-2 bg-slate-900/90 border border-amber-500/50 rounded-full px-3.5 py-1.5 shadow-lg">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-slate-300">RECORDE:</span>
              <span className="text-sm font-bold text-amber-300 font-mono">{highScore.toLocaleString()}</span>
            </div>
          )}

          {totalCoins > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700 rounded-full px-3 py-1.5 shadow-md">
              <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-300 flex items-center justify-center text-[10px] font-black text-amber-950">
                ¢
              </div>
              <span className="text-xs font-mono font-bold text-amber-300">{totalCoins}</span>
            </div>
          )}
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMute}
            className="w-11 h-11 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center transition active:scale-95 shadow-lg"
            title={isMuted ? 'Ativar Áudio' : 'Desativar Áudio'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-cyan-400" />}
          </button>
          <button
            onClick={onOpenHelp}
            className="w-11 h-11 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center transition active:scale-95 shadow-lg"
            title="Como Jogar & Publicar"
          >
            <HelpCircle className="w-5 h-5 text-slate-200" />
          </button>
        </div>
      </div>

      {/* Hero Center Lockup */}
      <div className="flex flex-col items-center text-center my-auto max-w-xl mx-auto">
        {/* Bespoke SVG Title Lockup */}
        <div className="mb-3">
          <svg viewBox="0 0 460 76" className="w-72 sm:w-96 md:w-[440px] drop-shadow-[0_10px_20px_rgba(6,182,212,0.35)]">
            <defs>
              <linearGradient id="titleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
            <text
              x="50%"
              y="58"
              textAnchor="middle"
              className="font-black italic tracking-wider uppercase"
              style={{
                fontFamily: "'Chakra Petch', sans-serif",
                fontSize: '48px',
                fontWeight: 900,
                fill: 'url(#titleGrad)',
                letterSpacing: '0.08em',
              }}
            >
              CORRIDA INFINITA
            </text>
          </svg>
        </div>

        <p className="text-slate-300 text-sm sm:text-base max-w-md font-medium drop-shadow mb-6">
          Desvia-te dos obstáculos a alta velocidade, recolhe moedas e supera o teu recorde na autoestrada do futuro.
        </p>

        {/* Start Button */}
        <button
          onClick={onStart}
          className="pointer-events-auto group relative px-8 sm:px-12 py-4 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-lg sm:text-xl rounded-2xl tracking-wider uppercase shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:shadow-[0_0_40px_rgba(6,182,212,0.8)] transition-all duration-200 active:scale-95 flex items-center gap-3 cursor-pointer"
        >
          <Play className="w-6 h-6 fill-slate-950" />
          <span>INICIAR CORRIDA</span>
          <span className="hidden sm:inline-block text-xs bg-slate-950/25 px-2 py-0.5 rounded text-slate-900 font-mono font-semibold ml-2">
            ESPAÇO
          </span>
        </button>
      </div>

      {/* Flat Control Hints at Bottom */}
      <div className="w-full max-w-2xl mx-auto bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3 sm:p-4 backdrop-blur-sm pointer-events-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
          {/* PC Controls */}
          <div className="flex items-start gap-2.5">
            <Monitor className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-200">Computador</div>
              <div className="text-slate-400 text-xs mt-0.5">
                <span className="text-cyan-300 font-mono">A / D</span> ou <span className="text-cyan-300 font-mono">◀ / ▶</span> Mudar Faixa<br />
                <span className="text-cyan-300 font-mono">ESPAÇO</span> ou <span className="text-cyan-300 font-mono">▲</span> Saltar · <span className="text-cyan-300 font-mono">S</span> ou <span className="text-cyan-300 font-mono">▼</span> Deslizar
              </div>
            </div>
          </div>

          {/* Mobile Controls */}
          <div className="flex items-start gap-2.5">
            <Smartphone className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-200">Telemóvel / Tablet</div>
              <div className="text-slate-400 text-xs mt-0.5">
                <span className="text-amber-300">Deslizar dedo</span> em qualquer direção (Gestos) ou utilizar os <span className="text-amber-300">botões táteis</span> no ecrã.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
