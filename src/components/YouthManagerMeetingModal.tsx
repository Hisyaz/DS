import React, { useState, useMemo, useEffect } from 'react';
import { PlayerConfig } from '../types';
import { generateManagerRoleProposal } from '../utils/youthLeagueSystem';
import { getSubPositionInfo } from '../utils/statCalculations';
import { useLanguage } from '../context/LanguageContext';
import {
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  ShieldAlert,
  Target,
} from 'lucide-react';

interface YouthManagerMeetingModalProps {
  isOpen: boolean;
  player: PlayerConfig;
  onConfirmRole: (chosenSubPosition: string, acceptedProposal: boolean) => void;
}

export const YouthManagerMeetingModal: React.FC<YouthManagerMeetingModalProps> = ({
  isOpen,
  player,
  onConfirmRole,
}) => {
  const { t } = useLanguage();
  const proposal = useMemo(() => {
    return generateManagerRoleProposal(player);
  }, [player.id, player.position, isOpen]);

  const [isCustomRole, setIsCustomRole] = useState(false);
  const [selectedSubPosition, setSelectedSubPosition] = useState(proposal.subPosition);

  useEffect(() => {
    setSelectedSubPosition(proposal.subPosition);
    setIsCustomRole(false);
  }, [proposal]);

  if (!isOpen) return null;

  const assignedSubInfo = getSubPositionInfo(proposal.subPosition);
  const assignedSubName = assignedSubInfo?.name ? assignedSubInfo.name.split(' (')[0] : proposal.subPosition;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto font-pixel select-none"
      style={{ touchAction: 'pan-y' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div 
        className="w-full max-w-2xl bg-slate-900 border-2 border-amber-500 pixel-corners pixel-bevel-gold shadow-2xl p-3.5 sm:p-5 text-white my-auto max-h-[95vh] flex flex-col text-left relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3 shrink-0 relative z-10">
          <div className="space-y-0.5 sm:space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 pixel-corners bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[9px] font-black uppercase tracking-wider font-arcade">
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              {t('YOUTH_MEETING_HEADER') || 'FIRST MANAGER MEETING'}
            </div>
            <h2 className="text-sm sm:text-lg font-black text-white tracking-tight pixel-text-shadow">
              {t('YOUTH_MEETING_TITLE') || 'Manager Tactical Role Proposal'}
            </h2>
            <p className="text-[10px] sm:text-xs text-slate-300 font-retro">
              {t('YOUTH_MEETING_SUBTITLE', {
                club: player.club || t('YOUTH_ACADEMY_FALLBACK') || 'Youth Academy',
              })}
            </p>
          </div>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto pr-1 py-3 space-y-3 custom-scrollbar relative z-10">
          {/* Manager Proposal Dialogue Card */}
          <div className="bg-slate-950 border-2 border-slate-800 pixel-corners pixel-bevel-sunken p-3 space-y-2.5">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-2">
              <div className="w-8 h-8 pixel-corners bg-amber-500/20 border border-amber-400/50 text-amber-400 flex items-center justify-center font-black shrink-0 pixel-bevel-raised">
                <ClipboardList className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[9px] font-bold text-slate-400 uppercase font-pixel">{t('YOUTH_COACH_ASSESSMENT') || "Head Coach's Assessment"}</div>
                <p className="text-[11px] text-slate-200 italic font-retro">
                  {t('YOUTH_COACH_SPEECH', {
                    role: assignedSubName,
                  })}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-900 p-2 pixel-corners border border-slate-700">
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1 font-pixel">
                  <Target className="w-3 h-3 text-sky-400" /> {t('Position') || 'Position'}
                </span>
                <p className="text-xs sm:text-sm font-black text-white mt-0.5 font-arcade">
                  {player.position || proposal.proposedPosition}
                </p>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1 font-pixel">
                  <ClipboardList className="w-3 h-3 text-indigo-400" /> {t('TACTICAL_ROLE_LABEL') || 'Tactical Role'}
                </span>
                <p className="text-xs sm:text-sm font-black text-indigo-300 mt-0.5 truncate font-arcade">
                  {assignedSubInfo?.name || proposal.subPosition}
                </p>
              </div>
            </div>
          </div>

          {/* Choice Options: Accept vs Custom */}
          <div className="space-y-2">
            <label className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block">
              {t('YOUTH_SELECT_ROLE_DECISION') || 'Select Your Role Decision'}:
            </label>

            {/* Option 1: Accept */}
            <div
              onClick={() => {
                setIsCustomRole(false);
                setSelectedSubPosition(proposal.subPosition);
              }}
              className={`p-3 pixel-corners border-2 cursor-pointer transition-all flex items-center justify-between ${
                !isCustomRole
                  ? 'border-amber-400 bg-amber-500/20 pixel-bevel-gold'
                  : 'border-slate-800 bg-slate-950/70 hover:border-slate-700 pixel-bevel-sunken'
              }`}
            >
              <div className="space-y-0.5">
                <div className="text-xs sm:text-sm font-black text-white flex items-center gap-2 pixel-text-shadow">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  {t('YOUTH_ACCEPT_ROLE_TITLE') || "ACCEPT MANAGER'S ASSIGNED ROLE"}
                </div>
                <p className="text-[10px] sm:text-xs text-slate-300 font-retro">
                  {t('YOUTH_ACCEPT_ROLE_DESC', {
                    role: assignedSubName,
                    code: proposal.subPosition,
                  })}
                </p>
              </div>
            </div>

            {/* Option 2: Reject / Choose Alternative */}
            <div
              onClick={() => setIsCustomRole(true)}
              className={`p-3 pixel-corners border-2 cursor-pointer transition-all space-y-2 ${
                isCustomRole
                  ? 'border-purple-400 bg-purple-500/20 pixel-bevel-raised'
                  : 'border-slate-800 bg-slate-950/70 hover:border-slate-700 pixel-bevel-sunken'
              }`}
            >
              <div className="space-y-0.5">
                <div className="text-xs sm:text-sm font-black text-white flex items-center gap-2 pixel-text-shadow">
                  <AlertTriangle className="w-4 h-4 text-purple-400 shrink-0" />
                  {t('YOUTH_REJECT_ROLE_TITLE') || 'REJECT & CHOOSE ANOTHER SUB-POSITION'}
                </div>
                <p className="text-[10px] sm:text-xs text-slate-300 font-retro">
                  {t('YOUTH_REJECT_ROLE_DESC', {
                    pos: player.position || proposal.proposedPosition,
                  })}
                </p>
              </div>

              {isCustomRole && (
                <div className="pt-2 border-t border-purple-500/30 space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {proposal.allowedSubPositions.map((subCode) => {
                      const info = getSubPositionInfo(subCode);
                      const label = info?.name || subCode;
                      return (
                        <button
                          key={subCode}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSubPosition(subCode);
                          }}
                          className={`px-2.5 py-1.5 pixel-corners text-[10px] font-black uppercase transition-all cursor-pointer border-2 font-pixel ${
                            selectedSubPosition === subCode
                              ? 'bg-purple-600 text-white border-purple-300 pixel-bevel-raised shadow-md'
                              : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500 pixel-bevel-sunken'
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="bg-amber-950/60 p-2.5 pixel-corners border border-amber-500/50 text-xs text-amber-200 flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-amber-300 font-bold block mb-0.5">
                        {t('YOUTH_SUBPOS_WARN_TITLE')}
                      </strong>
                      <p className="text-[10px] text-amber-200/90 leading-relaxed font-retro">
                        {t('YOUTH_SUBPOS_WARN_DESC')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* STICKY FOOTER ACTION BAR WITH PROMINENT ACCESSIBLE BUTTON */}
        <div className="pt-2.5 sm:pt-3 border-t-2 border-slate-800 bg-slate-900 shrink-0 flex items-center justify-end relative z-10">
          <button
            type="button"
            onClick={() => onConfirmRole(selectedSubPosition, !isCustomRole)}
            className="w-full py-3 px-6 pixel-corners text-xs sm:text-sm font-black text-slate-950 bg-amber-400 hover:bg-amber-300 border-2 border-amber-200 pixel-bevel-gold shadow-xl shadow-amber-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 min-h-[44px] uppercase font-pixel"
          >
            <span>{t('YOUTH_CONFIRM_ROLE_BTN') || 'CONFIRM & BEGIN SEASON'}</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};
