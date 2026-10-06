import React, { useEffect } from 'react';
import { PlayerCardData } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { t } from '../utils/localizationSystem';
import { audioManager } from '../utils/audioSystem';
import {
  Skull,
  AlertTriangle,
  Flame,
  XCircle,
  TrendingDown,
  ShieldAlert,
  ArrowRight,
  Newspaper,
  Volume2,
} from 'lucide-react';

interface FigoBetrayalNewsModalProps {
  isOpen: boolean;
  player: PlayerCardData;
  betrayedClub: string;
  destinationClub: string;
  rivalryName?: string;
  onClose: () => void;
}

export const FigoBetrayalNewsModal: React.FC<FigoBetrayalNewsModalProps> = ({
  isOpen,
  player,
  betrayedClub,
  destinationClub,
  rivalryName,
  onClose,
}) => {
  const { currentLanguage } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      audioManager.playWhistle();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const perkTitle =
    currentLanguage === 'es-AR'
      ? 'Traidor'
      : currentLanguage === 'es-ES'
      ? 'Judas'
      : currentLanguage === 'pt-BR'
      ? 'Judas / Traidor'
      : currentLanguage === 'fr-FR'
      ? 'Traître'
      : 'Snake';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-zinc-950 to-black border-2 border-rose-600/80 rounded-2xl shadow-2xl shadow-rose-950/50 overflow-hidden text-slate-100 flex flex-col max-h-[92vh]">
        {/* Breaking News Ticker Top Banner */}
        <div className="bg-gradient-to-r from-rose-700 via-red-600 to-rose-900 text-white px-4 py-2 flex items-center justify-between font-black text-xs uppercase tracking-widest shadow-md">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </span>
            <span>🚨 {t('GLOBAL FOOTBALL BOMBSHELL • BREAKING NEWS')}</span>
          </div>
          <span className="bg-black/40 px-2 py-0.5 rounded text-[10px] font-mono">
            {new Date().toLocaleDateString()}
          </span>
        </div>

        {/* Scrollable Content Container */}
        <div className="p-5 md:p-6 overflow-y-auto space-y-5 text-left custom-scrollbar">
          {/* Newspaper Masthead */}
          <div className="border-b border-rose-500/30 pb-3 text-center space-y-1">
            <div className="flex items-center justify-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
              <Newspaper className="w-4 h-4" />
              <span>THE GLOBAL SPORTING HERALD • SPECIAL EDITION</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight leading-snug">
              {player.name || 'STAR PLAYER'} {t('CROSSES FORBIDDEN DIVIDE TO')} {destinationClub.toUpperCase()}!
            </h1>
            <p className="text-xs text-rose-300 font-medium italic">
              {rivalryName ? `"${rivalryName}" ${t('Erupts into Chaos')}` : `${t('Historic Betrayal Shakes the Football World')}`}
            </p>
          </div>

          {/* Transfer Duel Banner */}
          <div className="grid grid-cols-7 items-center bg-slate-950/80 border border-rose-500/40 rounded-xl p-3 shadow-inner">
            <div className="col-span-3 text-center space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('Betrayed Club')}</span>
              <div className="text-sm md:text-base font-black text-rose-400 truncate px-1">
                {betrayedClub}
              </div>
              <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                ❌ {t('Blacklisted')}
              </span>
            </div>

            <div className="col-span-1 flex flex-col items-center justify-center">
              <ArrowRight className="w-5 h-5 text-amber-400 animate-pulse" />
              <span className="text-[8px] font-black text-amber-400 uppercase">DIRECT</span>
            </div>

            <div className="col-span-3 text-center space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t('New Arch-Rival')}</span>
              <div className="text-sm md:text-base font-black text-emerald-400 truncate px-1">
                {destinationClub}
              </div>
              <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ✅ {t('New Home')}
              </span>
            </div>
          </div>

          {/* Story Body Paragraphs (Luís Figo Inspiration) */}
          <div className="space-y-3 text-xs md:text-sm text-slate-300 leading-relaxed bg-black/40 p-4 rounded-xl border border-slate-800">
            <p>
              In a move sending seismic shockwaves across the continent reminiscent of <strong>Luís Figo&apos;s infamous 2000 transfer from Barcelona to Real Madrid</strong>, established starter <strong>{player.name}</strong> has signed directly for arch-rival <strong>{destinationClub}</strong>.
            </p>
            <p>
              Enraged <strong>{betrayedClub}</strong> supporters have flooded city squares, burning jerseys, throwing fake banknotes, and hoisting massive <em>&quot;{perkTitle}&quot;</em> banners. Club directors and ultra groups have officially declared you <strong>persona non grata</strong>.
            </p>
          </div>

          {/* Permanent Career Consequences Card */}
          <div className="bg-rose-950/30 border border-rose-500/40 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-rose-300 font-black text-xs uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>{t('Permanent Career Consequences Applied')}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-left">
              <div className="bg-black/60 border border-rose-500/30 rounded-lg p-2.5 space-y-1">
                <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{t('Never Signable Again')}</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  <strong>{betrayedClub}</strong> will <strong>NEVER</strong> submit another contract offer or bid for you again.
                </p>
              </div>

              <div className="bg-black/60 border border-amber-500/30 rounded-lg p-2.5 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                  <Skull className="w-3.5 h-3.5" />
                  <span>{t('Hostile Atmosphere')}</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Facing {betrayedClub} triggers deafening stadium whistles, hostile chants, and venomous pressure on every touch.
                </p>
              </div>

              <div className="bg-black/60 border border-emerald-500/30 rounded-lg p-2.5 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                  <Flame className="w-3.5 h-3.5" />
                  <span>{t('Perk Unlocked')}: {perkTitle}</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">
                  You have earned the <strong>&quot;{perkTitle}&quot;</strong> Career Perk, embodying football&apos;s ultimate villain role.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-600 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-rose-900/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t('Embrace the Hostility & Continue')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
