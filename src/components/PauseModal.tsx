import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';

interface PauseModalProps {
  isMuted: boolean;
  onResume: () => void;
  onRestart: () => void;
  onToggleMute: () => void;
  onMainMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  isMuted,
  onResume,
  onRestart,
  onToggleMute,
  onMainMenu,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center">
        <h3 className="text-2xl font-black text-cyan-400 italic tracking-wider uppercase mb-1">
          JOGO EM PAUSA
        </h3>
        <p className="text-slate-400 text-xs mb-6">
          Faz uma pausa ou ajusta as definições de jogo.
        </p>

        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={onResume}
            className="w-full py-3 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl flex items-center justify-center gap-2 transition active:scale-95 shadow-md shadow-cyan-500/20"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>CONTINUAR</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl flex items-center justify-center gap-2 transition active:scale-95 border border-slate-700"
          >
            <RotateCcw className="w-4 h-4" />
            <span>REINICIAR CORRIDA</span>
          </button>

          <button
            onClick={onToggleMute}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl flex items-center justify-center gap-2 transition active:scale-95 border border-slate-700"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            <span>{isMuted ? 'ATIVAR ÁUDIO' : 'SILENCIAR ÁUDIO'}</span>
          </button>

          <button
            onClick={onMainMenu}
            className="w-full py-2.5 px-4 text-slate-400 hover:text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition mt-2"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Voltar ao Menu Principal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
