import React, { useState } from 'react';
import { PlayerCardData } from '../types';
import { EditorTeamData, SquadGroupKey } from '../types/leagueEditor';
import { SQUAD_GROUP_LIMITS, getActivePlayerCount } from '../utils/squadSaveFileSystem';
import { useLanguage } from '../context/LanguageContext';
import { X, ArrowRightLeft } from 'lucide-react';

interface TeamPlayerTransferModalProps {
  isOpen: boolean;
  player: PlayerCardData;
  sourceTeam: EditorTeamData;
  sourceGroupKey: SquadGroupKey;
  sourceSlotNumber: number;
  allTeams: Record<string, EditorTeamData>;
  onTransfer: (destTeamId: string, destGroupKey: SquadGroupKey) => void;
  onClose: () => void;
}

export const TeamPlayerTransferModal: React.FC<TeamPlayerTransferModalProps> = ({
  isOpen,
  player,
  sourceTeam,
  sourceGroupKey,
  sourceSlotNumber,
  allTeams,
  onTransfer,
  onClose,
}) => {
  const { t } = useLanguage();
  const destinationTeams = (Object.values(allTeams || {}) as EditorTeamData[]).filter(
    (t) => t.id !== sourceTeam.id
  );
  const [selectedDestTeamId, setSelectedDestTeamId] = useState<string>(
    destinationTeams[0]?.id || ''
  );
  const [selectedDestGroupKey, setSelectedDestGroupKey] = useState<SquadGroupKey>('squad');

  if (!isOpen) return null;

  const destTeam = allTeams[selectedDestTeamId];
  const destGroupLimits = SQUAD_GROUP_LIMITS[selectedDestGroupKey];
  const destActiveCount = destTeam ? getActivePlayerCount(destTeam, selectedDestGroupKey) : 0;
  const isDestFull = destActiveCount >= destGroupLimits.max;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDestTeamId) return;
    onTransfer(selectedDestTeamId, selectedDestGroupKey);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
      style={{ touchAction: 'pan-y' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden my-auto text-left relative max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-4 sm:p-5 shrink-0 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">{t('TRANSFER PLAYER')}</h3>
              <p className="text-[11px] sm:text-xs text-slate-400">
                {t('Move {name} to another official club', { name: player.name })}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col justify-between custom-scrollbar">
          <div className="p-4 sm:p-5 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
            {/* Player Card Summary */}
            <div className="bg-slate-950 p-3.5 sm:p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-sm font-black text-white">{player.name}</div>
                <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                  <span className="font-bold text-amber-400">{player.ovr} OVR</span>
                  <span>•</span>
                  <span className="text-slate-300 font-mono">{player.position} ({player.subPosition})</span>
                  <span>•</span>
                  <span>{t('Age {age}', { age: player.age })}</span>
                </div>
              </div>
              <div className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                #{sourceSlotNumber}
              </div>
            </div>

            {/* Destination Team Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('Destination Team *')}
              </label>
              <select
                value={selectedDestTeamId}
                onChange={(e) => setSelectedDestTeamId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:border-purple-500 cursor-pointer"
              >
                {destinationTeams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.countryCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Destination Squad Group Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {t('Destination Squad Group *')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['squad', 'reserves', 'u20', 'u17'] as SquadGroupKey[]).map((gKey) => {
                  const limits = SQUAD_GROUP_LIMITS[gKey];
                  const isSel = selectedDestGroupKey === gKey;
                  const count = destTeam ? getActivePlayerCount(destTeam, gKey) : 0;
                  const full = count >= limits.max;

                  return (
                    <button
                      key={gKey}
                      type="button"
                      onClick={() => setSelectedDestGroupKey(gKey)}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        isSel
                          ? 'bg-purple-950/60 border-purple-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      <span className="text-xs font-black uppercase">{t(limits.label)}</span>
                      <span className={`text-[10px] font-mono mt-1 ${full ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
                        {count} / {limits.max} {full ? t('(FULL)') : ''}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {isDestFull && (
              <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs font-bold text-red-300">
                {t('The selected destination squad group is full ({current}/{max}). Select another group or team.', { current: destActiveCount, max: destGroupLimits.max })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 p-3 sm:p-4 bg-slate-950 border-t border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              {t('Cancel')}
            </button>
            <button
              type="submit"
              disabled={isDestFull || !selectedDestTeamId}
              className={`px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg transition cursor-pointer ${
                isDestFull || !selectedDestTeamId
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/20'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4" />
              {t('Transfer Player')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
