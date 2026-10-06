import React, { useState } from 'react';
import { PlayerCardData, Nationality } from '../types';
import { InternationalCallUp, NationalTeam } from '../types/nationalTeam';
import {
  getEligibleNationalities,
  checkForInternationalCallUp,
  acceptInternationalCallUp,
  declineInternationalCallUp,
  createNationalTeam,
} from '../utils/nationalTeamSystem';
import { getNationalTeamsDatabase } from '../utils/nationalTeamDatabaseManager';
import { useTestMode } from '../utils/testModeSystem';
import { useLanguage } from '../context/LanguageContext';
import { Globe, Lock, Unlock, Shield, Award, Sparkles, Flag, Trophy, Users, ChevronRight, Play } from 'lucide-react';

interface NationalTeamPanelProps {
  player: PlayerCardData;
  onUpdatePlayer: (updated: PlayerCardData) => void;
  onTriggerCallUpModal: (callUp: InternationalCallUp) => void;
}

export const NationalTeamPanel: React.FC<NationalTeamPanelProps> = ({
  player,
  onUpdatePlayer,
  onTriggerCallUpModal,
}) => {
  const { t } = useLanguage();
  const { isTestMode } = useTestMode();
  const activeNat = player.nationality || { code: 'ENG', iso: 'gb-eng', name: 'England' };
  const eligibleNats = getEligibleNationalities(player);
  const isSeniorLocked = Boolean(player.isSeniorLocked || player.seniorNationalTeamLocked);

  const [selectedInspectNat, setSelectedInspectNat] = useState<Nationality>(activeNat);
  const [inspectTier, setInspectTier] = useState<'U17' | 'U20' | 'Senior'>('Senior');
  const [nationalTeamModal, setNationalTeamModal] = useState<NationalTeam | null>(null);

  // Filter other nationalities that are NOT the active nationality
  const otherNats = eligibleNats.filter((n) => n.code !== activeNat.code);

  const handleSwitchPrimaryNationality = (targetNat: Nationality) => {
    if (isSeniorLocked) return;
    const currentActiveNat = activeNat;
    const currentOthers = [
      ...(player.otherNationalities || []),
      ...(player.extraNationalities || []),
    ];
    const updatedOthersList: Nationality[] = [...currentOthers];
    if (currentActiveNat.code !== targetNat.code) {
      if (!updatedOthersList.some((n) => n.code === currentActiveNat.code)) {
        updatedOthersList.push(currentActiveNat);
      }
    }
    const cleanOthers = updatedOthersList.filter((n) => n.code !== targetNat.code);
    const updated: PlayerCardData = {
      ...player,
      nationality: targetNat,
      otherNationalities: cleanOthers,
      extraNationalities: cleanOthers,
    };
    onUpdatePlayer(updated);
    setSelectedInspectNat(targetNat);
  };

  const handleTestCallUp = (tier: 'U17' | 'U20' | 'Senior', nation?: Nationality) => {
    const targetNat = nation || activeNat;
    const testCallUp: InternationalCallUp = {
      id: `test-${targetNat.code}-${tier}-${Date.now()}`,
      nation: targetNat,
      tier,
      competitionName:
        tier === 'U17'
          ? 'U17 World Championship Qualifiers'
          : tier === 'U20'
          ? 'U20 Continental Youth Championship'
          : 'FIFA World Cup Final Stage',
      managerName: `${targetNat.name} Head Coach`,
      role: 'Key Starter',
      bonusFame: tier === 'Senior' ? 150 : tier === 'U20' ? 80 : 40,
      date: new Date().toLocaleDateString('en-GB'),
      isSeniorLockWarning: tier === 'Senior' && !isSeniorLocked,
    };

    onTriggerCallUpModal(testCallUp);
  };

  const handleOpenNationalTeamSquad = (nation: Nationality, tier: 'U17' | 'U20' | 'Senior') => {
    const db = getNationalTeamsDatabase();
    const found = db.find(
      (t) => t.nation.code === nation.code || t.nation.name.toLowerCase() === nation.name.toLowerCase()
    );

    if (found) {
      const squadForTier =
        tier === 'Senior'
          ? found.squad
          : tier === 'U20'
          ? found.u20Squad || found.squad
          : found.u17Squad || found.squad;

      const teamObj: NationalTeam = {
        ...found,
        squad: squadForTier,
        tier,
        ovr: found.teamOvr || found.ovr || 75,
      };
      setNationalTeamModal(teamObj);
    } else {
      const team = createNationalTeam(nation, tier, [player]);
      setNationalTeamModal(team);
    }
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur relative overflow-hidden space-y-6 text-left">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center">
            <Globe className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-base font-black tracking-wide text-white uppercase flex items-center gap-2">
              International Team & Career Hub
            </h3>
            <p className="text-xs text-slate-400">
              National team eligibility, U17/U20 switching & Senior commitment tracking
            </p>
          </div>
        </div>

        {/* Lock Status Badge */}
        <div className="flex items-center gap-2">
          {isSeniorLocked ? (
            <div className="px-3 py-1.5 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-300 text-xs font-black flex items-center gap-1.5 shadow-sm">
              <Lock className="w-4 h-4 text-rose-400" />
              <span>SENIOR NATION LOCKED ({player.seniorNation || activeNat.name})</span>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <Unlock className="w-4 h-4 text-emerald-400" />
              <span>UNLOCKED (Eligible for {eligibleNats.length} Nations)</span>
            </div>
          )}
        </div>
      </div>

      {/* Active & Other Nationalities Display (Section 2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Active Nationality Card */}
        <div className="bg-slate-950/90 border-2 border-amber-500/40 rounded-2xl p-4 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1">
              <Flag className="w-3.5 h-3.5" /> ACTIVE NATIONALITY ON PLAYER CARD
            </span>
            <span className="text-xs font-mono font-bold text-slate-400">({activeNat.code})</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-8 rounded-md overflow-hidden border border-black/30 shadow-md shrink-0">
              <img
                src={`https://flagcdn.com/w80/${(activeNat.iso || 'gb-eng').toLowerCase()}.png`}
                alt={activeNat.code}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h4 className="text-lg font-black text-white">{activeNat.name}</h4>
              <p className="text-xs text-slate-400">
                Default origin: <strong className="text-slate-200">{player.startingCity || 'Hometown'}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Other Nationalities List (Section 2) */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-sky-400" /> OTHER ELIGIBLE NATIONALITIES
            </span>
            <span className="text-xs font-mono font-bold text-sky-400">({otherNats.length})</span>
          </div>

          {otherNats.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {otherNats.map((nat) => (
                <div
                  key={nat.code}
                  className="flex items-center justify-between gap-3 px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs font-bold text-slate-200 shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={`https://flagcdn.com/w40/${(nat.iso || 'gb-eng').toLowerCase()}.png`}
                      alt={nat.code}
                      className="w-5 h-3.5 object-cover rounded-[2px] border border-black/20"
                      referrerPolicy="no-referrer"
                    />
                    <span>{nat.name}</span>
                    <span className="text-[10px] text-sky-400 font-mono">({nat.code})</span>
                  </div>

                  {!isSeniorLocked && (
                    <button
                      type="button"
                      onClick={() => handleSwitchPrimaryNationality(nat)}
                      className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-[10px] font-black uppercase tracking-wide transition cursor-pointer active:scale-95"
                    >
                      {t('SWITCH_PRIMARY_NATION') || 'Make Primary'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">
              No secondary nationalities registered. (You can acquire extra nationalities through family cards & origin choices).
            </p>
          )}
        </div>
      </div>

      {/* International Progression (Section 5 & 8) */}
      <div className="space-y-3">
        <h4 className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-2">
          <Award className="w-4 h-4" /> INTERNATIONAL PROGRESSION & STATS
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* U17 Progression */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-sky-400 uppercase">U17 Level</span>
              <span className="text-xs font-bold text-white">{player.u17Nation || 'Not Represented'}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2">
              <span>Caps: <strong className="text-white">{player.u17Caps || 0}</strong></span>
              <span>Goals: <strong className="text-amber-400">{player.u17Goals || 0}</strong></span>
            </div>
            {isTestMode && (
              <button
                type="button"
                onClick={() => handleTestCallUp('U17')}
                className="w-full mt-1 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-[10px] font-bold text-sky-300 transition cursor-pointer text-center"
              >
                Trigger U17 Call-Up Test ⚽
              </button>
            )}
          </div>

          {/* U20 Progression */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-indigo-400 uppercase">U20 Level</span>
              <span className="text-xs font-bold text-white">{player.u20Nation || 'Not Represented'}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2">
              <span>Caps: <strong className="text-white">{player.u20Caps || 0}</strong></span>
              <span>Goals: <strong className="text-amber-400">{player.u20Goals || 0}</strong></span>
            </div>
            {isTestMode && (
              <button
                type="button"
                onClick={() => handleTestCallUp('U20')}
                className="w-full mt-1 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-[10px] font-bold text-indigo-300 transition cursor-pointer text-center"
              >
                Trigger U20 Call-Up Test ⚽
              </button>
            )}
          </div>

          {/* Senior Progression */}
          <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-amber-400 uppercase flex items-center gap-1">
                Senior Level {isSeniorLocked && <Lock className="w-3 h-3 text-rose-400" />}
              </span>
              <span className="text-xs font-bold text-amber-300">{player.seniorNation || 'Uncommitted'}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2">
              <span>Caps: <strong className="text-white">{player.seniorCaps || player.internationalCaps || 0}</strong></span>
              <span>Goals: <strong className="text-amber-400">{player.seniorGoals || player.internationalGoals || 0}</strong></span>
            </div>
            {isTestMode && (
              <button
                type="button"
                onClick={() => handleTestCallUp('Senior')}
                className="w-full mt-1 py-1.5 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-400/50 rounded-xl text-[10px] font-black text-amber-200 transition cursor-pointer text-center"
              >
                Trigger Senior Call-Up Test 🏆
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Inspect / Generate National Team Squads */}
      {isTestMode && (
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-black uppercase text-white flex items-center gap-1.5">
                <Users className="w-4 h-4 text-sky-400" /> National Team Squad Generator (23 Players)
              </h4>
              <p className="text-[11px] text-slate-400">
                Inspect National Team rosters procedurally built from real database stars + nation name generators
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedInspectNat.code}
                onChange={(e) => {
                  const found = eligibleNats.find((n) => n.code === e.target.value);
                  if (found) setSelectedInspectNat(found);
                }}
                className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white cursor-pointer"
              >
                {eligibleNats.map((n) => (
                  <option key={n.code} value={n.code}>
                    {n.name} ({n.code})
                  </option>
                ))}
              </select>

              <select
                value={inspectTier}
                onChange={(e) => setInspectTier(e.target.value as any)}
                className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-amber-400 cursor-pointer"
              >
                <option value="U17">U17</option>
                <option value="U20">U20</option>
                <option value="Senior">Senior</option>
              </select>

              <button
                type="button"
                onClick={() => handleOpenNationalTeamSquad(selectedInspectNat, inspectTier)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl transition cursor-pointer shadow-sm shrink-0"
              >
                View Squad 📋
              </button>
            </div>
          </div>
        </div>
      )}

      {/* National Team Squad Modal View */}
      {nationalTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-3xl w-full shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-6 rounded overflow-hidden border border-black/30">
                  <img
                    src={`https://flagcdn.com/w40/${(nationalTeamModal.nation.iso || 'gb-eng').toLowerCase()}.png`}
                    alt={nationalTeamModal.nation.code}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    {nationalTeamModal.nation.name} {nationalTeamModal.tier} Squad
                  </h3>
                  <p className="text-xs text-slate-400">
                    Manager: <strong className="text-amber-300">{nationalTeamModal.manager.name}</strong> • Team OVR:{' '}
                    <strong className="text-emerald-400">{nationalTeamModal.ovr} OVR</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNationalTeamModal(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {nationalTeamModal.squad.map((sq, idx) => (
                <div
                  key={sq.id || idx}
                  className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-8 py-0.5 rounded bg-slate-900 text-amber-400 font-mono font-black text-[10px] text-center border border-slate-800">
                      {sq.position || 'ST'}
                    </span>
                    <span className="font-bold text-white truncate max-w-[120px]">{sq.name}</span>
                  </div>
                  <span className="font-black text-amber-300 font-mono">{sq.ovr} OVR</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
