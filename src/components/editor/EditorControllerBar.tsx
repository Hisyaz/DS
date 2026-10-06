import React from 'react';
import { Gamepad2 } from 'lucide-react';

interface EditorControllerBarProps {
  prevLabel?: string;
  nextLabel?: string;
  onPrev?: () => void;
  onNext?: () => void;
  canPrev?: boolean;
  canNext?: boolean;
  showSaveHint?: boolean;
  backLabel?: string;
  onBack?: () => void;
}

export const EditorControllerBar: React.FC<EditorControllerBarProps> = ({
  prevLabel = 'PREVIOUS',
  nextLabel = 'NEXT',
  onPrev,
  onNext,
  canPrev = true,
  canNext = true,
  showSaveHint = true,
  backLabel,
  onBack,
}) => {
  return (
    <footer className="w-full bg-slate-950/95 border-t border-slate-800/80 backdrop-blur-md px-4 py-3 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 select-none">
      {/* Navigation action buttons: large touch-friendly buttons */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
        {onBack && backLabel && (
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2.5 rounded-xl text-xs font-black bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white flex items-center gap-2 transition active:scale-95 cursor-pointer shadow-sm"
          >
            <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-600 text-[10px] font-mono text-amber-400">
              B / ESC
            </span>
            <span>{backLabel}</span>
          </button>
        )}

        <button
          type="button"
          onClick={onPrev}
          disabled={!canPrev}
          className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
            canPrev
              ? 'bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white active:scale-95'
              : 'bg-slate-950 border border-slate-900 text-slate-600 cursor-not-allowed opacity-40'
          }`}
        >
          <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-600 text-[10px] font-mono text-cyan-400">
            LB / Q
          </span>
          <span>← {prevLabel}</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={!canNext}
          className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
            canNext
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border border-blue-400/30 text-white active:scale-95 shadow-blue-500/20'
              : 'bg-slate-950 border border-slate-900 text-slate-600 cursor-not-allowed opacity-40'
          }`}
        >
          <span>{nextLabel} →</span>
          <span className="px-1.5 py-0.5 rounded bg-blue-900/60 border border-blue-400/40 text-[10px] font-mono text-cyan-200">
            RB / E
          </span>
        </button>
      </div>

      {/* Controller & Touch Indicators Badge */}
      <div className="hidden md:flex items-center gap-2.5 text-[11px] font-mono text-slate-400 bg-slate-900/80 px-3.5 py-1.5 rounded-xl border border-slate-800">
        <Gamepad2 className="w-3.5 h-3.5 text-indigo-400" />
        <span>Controls:</span>
        <span className="text-slate-300">
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-amber-300">
            D-Pad / Arrows
          </kbd>{' '}
          Navigate
        </span>
        <span className="text-slate-600">•</span>
        <span className="text-slate-300">
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-emerald-300">
            A / Enter
          </kbd>{' '}
          Select
        </span>
        {showSaveHint && (
          <>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-yellow-300">
                Y / Ctrl+S
              </kbd>{' '}
              Save
            </span>
          </>
        )}
        <span className="text-slate-600">•</span>
        <span className="text-slate-400 italic">Swipe left/right on touch</span>
      </div>
    </footer>
  );
};
