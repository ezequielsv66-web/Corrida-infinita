import React from 'react';
import { RotateCcw, Home, Trophy, Award, Coins, Compass } from 'lucide-react';
import { GameStats } from '../types';

interface GameOverModalProps {
  stats: GameStats;
  onRestart: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  onRestart,
  onMainMenu,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center">
        {/* New record badge celebration */}
        {stats.newHighScore && (
          <div className="mb-3 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-amber-500/30 animate-bounce">
            <Trophy className="w-4 h-4 fill-slate-950" />
            <span>NOVO RECORDE PESSOAL!</span>
          </div>
        )}

        <h2 className="text-3xl sm:text-4xl font-black text-rose-500 italic tracking-wider uppercase mb-1">
          FIM DE JOGO
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          Colisão na autoestrada! Aqui está o resumo da tua corrida:
        </p>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-3 mb-6">
          {/* Final Score */}
          <div className="col-span-2 bg-slate-950/80 border border-cyan-500/40 rounded-2xl p-4 flex flex-col items-center">
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">
              PONTUAÇÃO FINAL
            </span>
            <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono mt-1 tabular-nums">
              {stats.score.toLocaleString()}
            </span>
          </div>

          {/* Record */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
              <Award className="w-4 h-4" />
              <span>Recorde</span>
            </div>
            <span className="text-lg sm:text-xl font-bold text-slate-200 font-mono mt-1">
              {stats.highScore.toLocaleString()}
            </span>
          </div>

          {/* Distance */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-3 flex flex-col items-center">
            <div className="flex items-center gap-1.5 text-xs text-sky-400 font-medium">
              <Compass className="w-4 h-4" />
              <span>Distância</span>
            </div>
            <span className="text-lg sm:text-xl font-bold text-slate-200 font-mono mt-1">
              {Math.floor(stats.distance)} m
            </span>
          </div>

          {/* Coins Collected */}
          <div className="col-span-2 bg-slate-950/60 border border-slate-800 rounded-2xl p-3 flex items-center justify-between px-5">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>Moedas nesta corrida</span>
            </div>
            <span className="text-xl font-extrabold text-amber-300 font-mono">
              +{stats.coins}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row gap-3">
          <button
            onClick={onRestart}
            className="flex-1 py-3.5 px-5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-base rounded-2xl flex items-center justify-center gap-2 transition active:scale-95 shadow-lg shadow-cyan-500/25 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>JOGAR NOVAMENTE</span>
          </button>

          <button
            onClick={onMainMenu}
            className="py-3.5 px-5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 transition active:scale-95 border border-slate-700 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
