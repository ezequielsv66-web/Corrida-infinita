import React from 'react';

export const AdSlotTop: React.FC = () => {
  return (
    <div
      className="w-full bg-slate-950 border-b border-slate-800/80 px-2 py-1 flex items-center justify-center shrink-0 select-none z-20 min-h-[42px] sm:min-h-[50px]"
      aria-label="Espaço de publicidade superior"
    >
      <div className="w-full max-w-4xl h-8 sm:h-10 bg-slate-900/60 border border-slate-800/90 rounded-lg flex items-center justify-between px-3 text-[11px] text-slate-400">
        <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 bg-slate-800/70 px-1.5 py-0.5 rounded">
          Publicidade
        </span>
        <span className="truncate mx-2 text-slate-400 hidden sm:inline">
          Espaço reservado para anúncio responsivo superior (728x90 / Banner adaptativo)
        </span>
        <span className="text-[10px] text-slate-400 font-mono">
          AdSlotTop
        </span>
      </div>
    </div>
  );
};
