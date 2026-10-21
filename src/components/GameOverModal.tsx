import React from 'react';
import { RotateCcw, Home, Trophy, Award, Coins, Compass, CheckCircle2, LogIn } from 'lucide-react';
import { GameStats } from '../types';

interface GameOverModalProps {
  stats: GameStats;
  isLoggedIn?: boolean;
  isCloudSynced?: boolean;
  onRestart: () => void;
  onMainMenu: () => void;
  onOpenLeaderboard: () => void;
  onLogin: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  isLoggedIn,
  isCloudSynced,
  onRestart,
  onMainMenu,
  onOpenLeaderboard,
  onLogin,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-slate-700/80 rounded-3xl p-5 sm:p-7 shadow-[0_15px_50px_rgba(0,0,0,0.8)] flex flex-col items-center text-center">
        {/* New record badge celebration */}
        {stats.newHighScore && (
          <div className="mb-2 px-5 py-1.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-amber-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-bounce">
            <Trophy className="w-4 h-4 fill-amber-950" />
            <span>NOVO RECORDE!</span>
          </div>
        )}

        <h2 className="text-3xl sm:text-4xl font-black text-rose-500 italic tracking-wider uppercase mb-1 drop-shadow">
          FIM DE JOGO
        </h2>
        <p className="text-slate-300 text-xs sm:text-sm mb-4 font-medium">
          O guarda apanhou-te nos carris! Aqui está o resumo da tua corrida:
        </p>

        {/* Cloud Sync Status */}
        {isLoggedIn ? (
          isCloudSynced && (
            <div className="mb-4 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-400 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 shadow">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Recorde gravado no Ranking Global!</span>
            </div>
          )
        ) : (
          <div className="w-full mb-4 p-3 bg-slate-900/90 border-2 border-amber-500/40 rounded-2xl flex items-center justify-between gap-2 shadow-md">
            <div className="text-left text-xs">
              <span className="font-black text-amber-300 block">Guardar no Ranking Global?</span>
              <span className="text-slate-400 text-[11px]">Inicia sessão para salvar o teu recorde e moedas.</span>
            </div>
            <button
              onClick={onLogin}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 text-xs font-black rounded-xl flex items-center gap-1 transition active:scale-95 shrink-0 shadow cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Entrar</span>
            </button>
          </div>
        )}

        {/* Subway Surfers Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-2.5 mb-5">
          {/* Final Score */}
          <div className="col-span-2 bg-slate-950/90 border-2 border-amber-500/50 rounded-2xl p-4 flex flex-col items-center shadow-lg">
            <span className="text-[11px] font-black text-amber-400 uppercase tracking-widest">
              PONTUAÇÃO FINAL
            </span>
            <span className="text-3xl sm:text-4xl font-black text-white font-mono mt-0.5 tabular-nums drop-shadow">
              {stats.score.toLocaleString()}
            </span>
          </div>

          {/* Record */}
          <div className="bg-slate-950/80 border border-slate-700/80 rounded-2xl p-2.5 flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
              <Award className="w-4 h-4" />
              <span>Recorde</span>
            </div>
            <span className="text-base sm:text-lg font-black text-slate-200 font-mono mt-0.5">
              {stats.highScore.toLocaleString()}
            </span>
          </div>

          {/* Distance */}
          <div className="bg-slate-950/80 border border-slate-700/80 rounded-2xl p-2.5 flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold">
              <Compass className="w-4 h-4" />
              <span>Distância</span>
            </div>
            <span className="text-base sm:text-lg font-black text-slate-200 font-mono mt-0.5">
              {Math.floor(stats.distance)} m
            </span>
          </div>

          {/* Coins Collected */}
          <div className="bg-slate-950/80 border border-slate-700/80 rounded-2xl p-2.5 flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-xs text-yellow-400 font-bold">
              <Coins className="w-4 h-4" />
              <span>Moedas Nesta Corrida</span>
            </div>
            <span className="text-base sm:text-lg font-black text-amber-300 font-mono mt-0.5">
              +{stats.coins}
            </span>
          </div>

          {/* Mystery Boxes / Letters */}
          <div className="bg-slate-950/80 border border-slate-700/80 rounded-2xl p-2.5 flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-xs text-purple-400 font-bold">
              <span>🎁</span>
              <span>Caixas Mistério</span>
            </div>
            <span className="text-base sm:text-lg font-black text-purple-300 font-mono mt-0.5">
              {stats.mysteryBoxesCollected}
            </span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={onRestart}
            className="w-full py-4 bg-gradient-to-b from-emerald-400 via-green-500 to-emerald-700 hover:from-emerald-300 hover:to-emerald-600 border-2 border-emerald-200 text-slate-950 font-black text-lg sm:text-xl rounded-2xl tracking-wider uppercase shadow-[0_6px_20px_rgba(16,185,129,0.5)] transition active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5 stroke-[2.5]" />
            <span>JOGAR NOVAMENTE</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onOpenLeaderboard}
              className="py-2.5 bg-slate-900 hover:bg-slate-800 border-2 border-amber-500/50 text-amber-300 text-xs sm:text-sm font-bold rounded-xl transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>TOP GLOBAL</span>
            </button>

            <button
              onClick={onMainMenu}
              className="py-2.5 bg-slate-900 hover:bg-slate-800 border-2 border-slate-700 text-slate-300 text-xs sm:text-sm font-bold rounded-xl transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>MENU INICIAL</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
