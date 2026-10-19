import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';

interface TouchControlsProps {
  onLeft: () => void;
  onRight: () => void;
  onJump: () => void;
  onSlide: () => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onLeft,
  onRight,
  onJump,
  onSlide,
}) => {
  const triggerTouch = (action: () => void) => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  return (
    <div className="absolute bottom-4 inset-x-0 px-4 sm:px-8 flex items-center justify-between pointer-events-none z-10 select-none">
      {/* Left & Right Steering cluster */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <button
          onTouchStart={triggerTouch(onLeft)}
          onMouseDown={triggerTouch(onLeft)}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-900/70 active:bg-cyan-600/60 border-2 border-cyan-500/40 active:border-cyan-400 text-cyan-300 flex flex-col items-center justify-center shadow-lg active:scale-95 transition-transform"
          aria-label="Mudar para a Esquerda"
        >
          <ArrowLeft className="w-8 h-8 stroke-[2.5]" />
          <span className="text-[10px] font-bold tracking-wider uppercase text-cyan-400/80">ESQ</span>
        </button>

        <button
          onTouchStart={triggerTouch(onRight)}
          onMouseDown={triggerTouch(onRight)}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-900/70 active:bg-cyan-600/60 border-2 border-cyan-500/40 active:border-cyan-400 text-cyan-300 flex flex-col items-center justify-center shadow-lg active:scale-95 transition-transform"
          aria-label="Mudar para a Direita"
        >
          <ArrowRight className="w-8 h-8 stroke-[2.5]" />
          <span className="text-[10px] font-bold tracking-wider uppercase text-cyan-400/80">DIR</span>
        </button>
      </div>

      {/* Jump & Slide Action cluster */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <button
          onTouchStart={triggerTouch(onSlide)}
          onMouseDown={triggerTouch(onSlide)}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-900/70 active:bg-amber-600/60 border-2 border-amber-500/40 active:border-amber-400 text-amber-300 flex flex-col items-center justify-center shadow-lg active:scale-95 transition-transform"
          aria-label="Deslizar"
        >
          <ArrowDown className="w-8 h-8 stroke-[2.5]" />
          <span className="text-[10px] font-bold tracking-wider uppercase text-amber-400/80">DESLIZAR</span>
        </button>

        <button
          onTouchStart={triggerTouch(onJump)}
          onMouseDown={triggerTouch(onJump)}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-900/70 active:bg-sky-500/60 border-2 border-sky-400/50 active:border-sky-300 text-sky-200 flex flex-col items-center justify-center shadow-lg active:scale-95 transition-transform"
          aria-label="Saltar"
        >
          <ArrowUp className="w-8 h-8 stroke-[2.5]" />
          <span className="text-[10px] font-bold tracking-wider uppercase text-sky-300/80">SALTAR</span>
        </button>
      </div>
    </div>
  );
};
