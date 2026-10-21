import React from 'react';
import { Play, Volume2, VolumeX, HelpCircle, Trophy, Smartphone, Monitor, User as UserIcon } from 'lucide-react';

interface TitleScreenProps {
  highScore: number;
  totalCoins: number;
  isMuted: boolean;
  playerName?: string;
  playerPhoto?: string;
  isLoggedIn?: boolean;
  onStart: () => void;
  onToggleMute: () => void;
  onOpenHelp: () => void;
  onOpenLeaderboard: () => void;
  onOpenProfile: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  highScore,
  totalCoins,
  isMuted,
  playerName,
  playerPhoto,
  isLoggedIn,
  onStart,
  onToggleMute,
  onOpenHelp,
  onOpenLeaderboard,
  onOpenProfile,
}) => {
  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-between p-4 sm:p-8 pointer-events-none select-none font-sans">
      {/* Top Bar */}
      <div className="flex items-center justify-between w-full pointer-events-auto gap-2">
        {/* Record & Coins Pill (Subway Surfers Style) */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {highScore > 0 && (
            <div className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-yellow-500 border-2 border-yellow-200 rounded-full px-3.5 py-1.5 shadow-[0_4px_12px_rgba(245,158,11,0.5)]">
              <Trophy className="w-4 h-4 text-amber-950 fill-amber-950" />
              <span className="text-xs font-black text-amber-950 hidden sm:inline">RECORDE:</span>
              <span className="text-sm sm:text-base font-black text-amber-950 font-mono">{highScore.toLocaleString()}</span>
            </div>
          )}

          <div className="flex items-center gap-2 bg-slate-950/85 border-2 border-amber-500/60 rounded-full px-3 py-1.5 shadow-md">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-300 flex items-center justify-center text-xs font-black text-amber-950 shadow">
              ¢
            </div>
            <span className="text-sm font-mono font-black text-amber-300">{totalCoins}</span>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Global Leaderboard Button */}
          <button
            onClick={onOpenLeaderboard}
            className="h-10 px-3.5 rounded-2xl bg-gradient-to-b from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 border-2 border-yellow-200 text-slate-950 font-black flex items-center gap-1.5 transition active:scale-95 shadow-lg cursor-pointer"
            title="Classificação Global"
          >
            <Trophy className="w-4 h-4 fill-slate-950" />
            <span className="text-xs uppercase tracking-wide hidden sm:inline">RANKING</span>
          </button>

          {/* User Profile / Auth Button */}
          <button
            onClick={onOpenProfile}
            className={`h-10 px-3.5 rounded-2xl bg-slate-950/85 hover:bg-slate-900 border-2 ${
              isLoggedIn ? 'border-cyan-400 text-cyan-300' : 'border-slate-700 text-slate-200'
            } flex items-center gap-2 transition active:scale-95 shadow-lg cursor-pointer`}
            title={isLoggedIn ? `Perfil: ${playerName}` : 'Iniciar Sessão'}
          >
            {playerPhoto ? (
              <img src={playerPhoto} alt="" className="w-5 h-5 rounded-full object-cover border border-cyan-400" />
            ) : (
              <UserIcon className="w-4 h-4" />
            )}
            <span className="text-xs font-bold max-w-[90px] truncate">
              {isLoggedIn ? playerName : 'ENTRAR'}
            </span>
          </button>

          <button
            onClick={onToggleMute}
            className="w-10 h-10 rounded-2xl bg-slate-950/85 hover:bg-slate-900 border-2 border-slate-700 text-slate-200 flex items-center justify-center transition active:scale-95 shadow-lg cursor-pointer"
            title={isMuted ? 'Ativar Áudio' : 'Desativar Áudio'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-cyan-400" />}
          </button>

          <button
            onClick={onOpenHelp}
            className="w-10 h-10 rounded-2xl bg-slate-950/85 hover:bg-slate-900 border-2 border-slate-700 text-slate-200 flex items-center justify-center transition active:scale-95 shadow-lg cursor-pointer"
            title="Como Jogar"
          >
            <HelpCircle className="w-5 h-5 text-slate-200" />
          </button>
        </div>
      </div>

      {/* Subway Surfers Authentic Graffiti Hero Center Lockup */}
      <div className="flex flex-col items-center text-center my-auto max-w-xl mx-auto">
        {/* Graffiti Street Logo */}
        <div className="relative mb-2">
          {/* Glow backdrop */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-pink-500/20 to-cyan-500/20 blur-2xl rounded-full" />
          
          <svg viewBox="0 0 520 130" className="w-80 sm:w-96 md:w-[480px] drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]">
            <defs>
              <linearGradient id="subwayGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="45%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
              <linearGradient id="surfersGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>

            {/* SUBWAY text */}
            <text
              x="50%"
              y="52"
              textAnchor="middle"
              className="italic uppercase"
              style={{
                fontFamily: "'Arial Black', Impact, sans-serif",
                fontSize: '56px',
                fontWeight: 900,
                fill: 'url(#subwayGrad)',
                stroke: '#451a03',
                strokeWidth: '10px',
                paintOrder: 'stroke fill',
                letterSpacing: '0.04em',
              }}
            >
              SUBWAY
            </text>

            {/* SURFERS / CORRIDA INFINITA text */}
            <text
              x="50%"
              y="110"
              textAnchor="middle"
              className="italic uppercase"
              style={{
                fontFamily: "'Arial Black', Impact, sans-serif",
                fontSize: '48px',
                fontWeight: 900,
                fill: 'url(#surfersGrad)',
                stroke: '#0f172a',
                strokeWidth: '10px',
                paintOrder: 'stroke fill',
                letterSpacing: '0.06em',
              }}
            >
              CORRIDA 3D
            </text>
          </svg>
        </div>

        {/* Tagline */}
        <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-700/80 px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
          <span className="text-base">🛹</span>
          <span className="text-xs sm:text-sm font-black text-amber-300 uppercase tracking-wider">
            FUGE DO GUARDA · SALTA COMBOIOS · DESVIA DE OBSTÁCULOS
          </span>
        </div>

        {/* Big Subway Surfers TAP TO PLAY Button (JOGAR) */}
        <button
          onClick={onStart}
          className="pointer-events-auto group relative px-10 sm:px-16 py-4 sm:py-5 bg-gradient-to-b from-emerald-400 via-green-500 to-emerald-700 hover:from-emerald-300 hover:to-emerald-600 border-4 border-emerald-200 text-slate-950 font-black text-2xl sm:text-3xl rounded-3xl tracking-wider uppercase shadow-[0_10px_35px_rgba(16,185,129,0.7)] hover:shadow-[0_12px_45px_rgba(16,185,129,0.95)] hover:scale-105 transition-all duration-200 active:scale-95 flex items-center gap-3 cursor-pointer"
        >
          <Play className="w-8 h-8 fill-slate-950" />
          <span>JOGAR</span>
          <span className="hidden sm:inline-block text-xs bg-slate-950/25 px-2.5 py-1 rounded-xl text-slate-950 font-mono font-bold ml-2">
            ESPAÇO
          </span>
        </button>
      </div>

      {/* Flat Control Hints at Bottom */}
      <div className="w-full max-w-2xl mx-auto bg-slate-950/85 border-2 border-slate-800 rounded-2xl p-3 sm:p-4 backdrop-blur-sm pointer-events-auto shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
          {/* PC Controls */}
          <div className="flex items-start gap-2.5">
            <Monitor className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-200">Controlos no Computador</div>
              <div className="text-slate-400 text-xs mt-0.5">
                <span className="text-amber-300 font-mono">◀ / ▶</span> ou <span className="text-amber-300 font-mono">A / D</span> Mudar Pista<br />
                <span className="text-amber-300 font-mono">▲</span> ou <span className="text-amber-300 font-mono">ESPAÇO</span> Saltar · <span className="text-amber-300 font-mono">▼</span> / <span className="text-amber-300 font-mono">S</span> Rolar/Deslizar<br />
                <span className="text-cyan-300 font-mono">2x ESPAÇO</span> Ativar Skate Hoverboard!
              </div>
            </div>
          </div>

          {/* Mobile Gestures */}
          <div className="flex items-start gap-2.5">
            <Smartphone className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-200">No Telemóvel (Gestos)</div>
              <div className="text-slate-400 text-xs mt-0.5">
                Deslizar dedo <span className="text-cyan-300 font-mono">Esquerda / Direita</span> para mudar<br />
                Deslizar <span className="text-cyan-300 font-mono">Cima</span> para saltar · <span className="text-cyan-300 font-mono">Baixo</span> para deslizar<br />
                <span className="text-amber-300 font-mono">Toque 2x</span> em qualquer lugar para ativar o Skate!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
