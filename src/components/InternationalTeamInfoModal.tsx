import React from 'react';
import { InternationalYouthClub } from '../types/youthLeague';
import { KitRenderer } from './KitRenderer';
import { Shield, Globe, Users, Trophy, X, Target, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface InternationalTeamInfoModalProps {
  isOpen: boolean;
  club: InternationalYouthClub | null;
  onClose: () => void;
}

export const InternationalTeamInfoModal: React.FC<InternationalTeamInfoModalProps> = ({
  isOpen,
  club,
  onClose,
}) => {
  const { t } = useLanguage();
  if (!isOpen || !club) return null;

  const kitConfig = {
    color1: club.primaryColor || '#3b82f6',
    color2: club.secondaryColor || '#ffffff',
    pattern: 'stripes' as const,
    collar: 'round' as const,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-4 sm:p-6 max-w-2xl w-full shadow-2xl space-y-4 sm:space-y-6 relative text-left overflow-hidden max-h-[90vh] flex flex-col my-auto">
        {/* Ambient background glow */}
        <div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: club.primaryColor }}
        />

        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 sm:pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-lg border border-white/20"
              style={{ backgroundColor: club.primaryColor }}
            >
              {club.flag}
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-amber-400 flex items-center gap-1">
                <Globe className="w-3 h-3" /> {club.federation} {t('FEDERATION') || 'FEDERATION'} • {club.country.toUpperCase()}
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">{club.name}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 sm:space-y-6">
          {/* Club Specs & Kit Display */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 items-center">
            {/* Kit Renderer */}
            <div className="flex flex-col items-center justify-center space-y-2 border-b sm:border-b-0 sm:border-r border-slate-800 pb-4 sm:pb-0 sm:pr-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase">{t('OFFICIAL_UNIFORM') || 'Official Uniform'}</span>
              <KitRenderer kit={kitConfig} size="sm" showSponsor={false} />
              <span className="text-[10px] font-mono text-slate-400">{club.preferredFormation} {t('FORMATION') || 'Formation'}</span>
            </div>

            {/* OVR Ratings */}
            <div className="col-span-2 space-y-3">
              <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-amber-300">{t('TEAM_OVR') || 'Team Overall (OVR)'}</span>
                <span className="text-lg font-black text-amber-400 px-3 py-0.5 rounded-lg bg-amber-500/20 border border-amber-400/40">
                  {club.teamOvr} OVR
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-900 p-2 rounded-xl border border-rose-500/20">
                  <div className="text-[10px] text-rose-400 font-bold uppercase">{t('ATTACK') || 'Attack'}</div>
                  <div className="text-sm font-black text-white">{club.attOvr}</div>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl border border-sky-500/20">
                  <div className="text-[10px] text-sky-400 font-bold uppercase">{t('MIDFIELD') || 'Midfield'}</div>
                  <div className="text-sm font-black text-white">{club.midOvr}</div>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl border border-emerald-500/20">
                  <div className="text-[10px] text-emerald-400 font-bold uppercase">{t('DEFENSE') || 'Defense'}</div>
                  <div className="text-sm font-black text-white">{club.defOvr}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Representative Players Preview (Section 19) */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5">
              <Users className="w-4 h-4" /> {t('REPRESENTATIVE_SQUAD') || 'Representative Youth Squad (4 Key Players)'}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {club.representativePlayers.map((player) => {
                let posBg = 'bg-rose-500/20 text-rose-300 border-rose-500/40';
                if (player.position === 'MID') posBg = 'bg-sky-500/20 text-sky-300 border-sky-500/40';
                if (player.position === 'DEF') posBg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
                if (player.position === 'GK') posBg = 'bg-amber-500/20 text-amber-300 border-amber-500/40';

                return (
                  <div
                    key={player.id}
                    className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black border ${posBg}`}>
                        {t(player.position) || player.position}
                      </span>
                      <div>
                        <div className="text-xs font-black text-white">{player.name}</div>
                        <div className="text-[10px] text-slate-400">{t(player.country) || player.country}</div>
                      </div>
                    </div>

                    <div className="text-xs font-black text-amber-300 bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800">
                      {player.ovr} OVR
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer close button */}
        <div className="flex justify-end pt-3 border-t border-slate-800 shrink-0 pb-20 sm:pb-2">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs rounded-xl cursor-pointer transition-all text-center"
          >
            {t('CLOSE_TEAM_PREVIEW') || 'Close Team Preview'}
          </button>
        </div>
      </div>
    </div>
  );
};
