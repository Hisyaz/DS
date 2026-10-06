import React from 'react';
import {
  QualificationRule,
  QualificationSourceType,
  QualificationRuleType,
} from '../../types/competitionEditor';
import { LeagueDatabase } from '../../types/leagueEditor';
import { Plus, Trash2, ArrowRight, Check, HelpCircle } from 'lucide-react';

interface QualificationRuleBuilderProps {
  rules: QualificationRule[];
  onChangeRules: (rules: QualificationRule[]) => void;
  leagueDb?: LeagueDatabase;
  allCompetitions?: Record<string, { id: string; name: string }>;
}

export const QualificationRuleBuilder: React.FC<
  QualificationRuleBuilderProps
> = ({ rules, onChangeRules, leagueDb, allCompetitions }) => {
  const handleAddRule = () => {
    const firstLeague = leagueDb ? (Object.values(leagueDb.leagues)[0] as { id: string; name: string } | undefined) : undefined;
    const newRule: QualificationRule = {
      id: `q_rule_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      sourceType: 'league',
      sourceId: firstLeague ? firstLeague.id : 'england_d1',
      sourceName: firstLeague ? firstLeague.name : 'Premier League',
      ruleType: 'top_4',
      directQualificationSpots: 4,
      preliminarySpots: 0,
      description: 'Top 4 qualify directly.',
    };
    onChangeRules([...rules, newRule]);
  };

  const handleUpdateRule = (index: number, updated: QualificationRule) => {
    const newRules = [...rules];
    newRules[index] = updated;
    onChangeRules(newRules);
  };

  const handleRemoveRule = (index: number) => {
    const newRules = rules.filter((_, i) => i !== index);
    onChangeRules(newRules);
  };

  const availableLeagues = leagueDb ? (Object.values(leagueDb.leagues) as { id: string; name: string; countryName?: string }[]) : [];
  const compOptions = allCompetitions ? (Object.values(allCompetitions) as { id: string; name: string }[]) : [];

  return (
    <div className="space-y-4 text-left">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
            <span>QUALIFICATION RULES & SOURCES</span>
            <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded font-mono">
              {rules.length} Rules Defined
            </span>
          </h4>
          <p className="text-xs text-slate-400">
            Define who qualifies and how spots (Direct, Preliminary, Playoff) are distributed.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddRule}
          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ ADD QUALIFICATION SOURCE</span>
        </button>
      </div>

      {rules.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-900/60 border border-dashed border-slate-800 text-center space-y-2">
          <HelpCircle className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-xs font-bold text-slate-400">
            No qualification rules added yet.
          </p>
          <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
            Click "+ ADD QUALIFICATION SOURCE" above to specify league positions, cup winners, or ranking spots that grant entry into this competition.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rules.map((rule, idx) => (
            <div
              key={rule.id || idx}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 space-y-3 transition-all"
            >
              <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                <span className="text-xs font-black text-blue-400 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-blue-950 border border-blue-500/40 text-blue-300 flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  RULE #{idx + 1}
                </span>

                <button
                  type="button"
                  onClick={() => handleRemoveRule(idx)}
                  className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                  title="Remove Rule"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Source Type & Source ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    SOURCE TYPE
                  </label>
                  <select
                    value={rule.sourceType}
                    onChange={(e) => {
                      const st = e.target.value as QualificationSourceType;
                      handleUpdateRule(idx, {
                        ...rule,
                        sourceType: st,
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-blue-500"
                  >
                    <option value="league">League Table Standings</option>
                    <option value="cup_winner">Domestic Cup Winner</option>
                    <option value="prev_comp_winner">Previous Competition Winner</option>
                    <option value="prev_comp_champion">Previous Competition Champion</option>
                    <option value="host">Host Nation</option>
                    <option value="ranking">Federation / Continental Ranking</option>
                    <option value="manual">Manual Invitation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    SPECIFIC SOURCE SELECTOR
                  </label>
                  {rule.sourceType === 'league' ? (
                    <select
                      value={rule.sourceId}
                      onChange={(e) => {
                        const selectedLeague = availableLeagues.find(
                          (l) => l.id === e.target.value
                        );
                        handleUpdateRule(idx, {
                          ...rule,
                          sourceId: e.target.value,
                          sourceName: selectedLeague?.name || e.target.value,
                        });
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-blue-500"
                    >
                      {availableLeagues.map((lg) => (
                        <option key={lg.id} value={lg.id}>
                          {lg.countryName} • {lg.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={rule.sourceId}
                      onChange={(e) =>
                        handleUpdateRule(idx, { ...rule, sourceId: e.target.value, sourceName: e.target.value })
                      }
                      placeholder="e.g. ARG_CUP or UEFA_EL"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-blue-500"
                    />
                  )}
                </div>
              </div>

              {/* Rule Type & Spots Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    QUALIFICATION RULE PRESET
                  </label>
                  <select
                    value={rule.ruleType}
                    onChange={(e) => {
                      const rt = e.target.value as QualificationRuleType;
                      let dir = rule.directQualificationSpots;
                      if (rt === 'top_1') dir = 1;
                      if (rt === 'top_2') dir = 2;
                      if (rt === 'top_3') dir = 3;
                      if (rt === 'top_4') dir = 4;
                      if (rt === 'top_5') dir = 5;

                      handleUpdateRule(idx, {
                        ...rule,
                        ruleType: rt,
                        directQualificationSpots: dir,
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-blue-500"
                  >
                    <option value="top_1">1 Spot (1st Place)</option>
                    <option value="top_2">Top 2 (1st & 2nd)</option>
                    <option value="top_3">Top 3 (1st, 2nd, 3rd)</option>
                    <option value="top_4">Top 4 (1st, 2nd, 3rd, 4th)</option>
                    <option value="top_5">Top 5</option>
                    <option value="top_n">Top N Spots</option>
                    <option value="custom">Custom Spot Distribution</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-emerald-400 mb-1">
                    DIRECT SPOTS
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={32}
                    value={rule.directQualificationSpots}
                    onChange={(e) =>
                      handleUpdateRule(idx, {
                        ...rule,
                        directQualificationSpots: Math.max(0, parseInt(e.target.value) || 0),
                      })
                    }
                    className="w-full bg-slate-950 border border-emerald-500/40 rounded-lg px-2.5 py-1.5 text-xs font-bold text-emerald-300 focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-amber-400 mb-1">
                    PRELIMINARY / PLAYOFF SPOTS
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={16}
                    value={rule.preliminarySpots}
                    onChange={(e) =>
                      handleUpdateRule(idx, {
                        ...rule,
                        preliminarySpots: Math.max(0, parseInt(e.target.value) || 0),
                      })
                    }
                    className="w-full bg-slate-950 border border-amber-500/40 rounded-lg px-2.5 py-1.5 text-xs font-bold text-amber-300 focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">
                  RULE DESCRIPTION (SUMMARY)
                </label>
                <input
                  type="text"
                  value={rule.description || ''}
                  onChange={(e) =>
                    handleUpdateRule(idx, { ...rule, description: e.target.value })
                  }
                  placeholder="e.g. Top 3 qualify directly; 4th enters Preliminary Round."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:border-blue-500"
                />
              </div>

              {/* Visual Result Mapping Badges */}
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-semibold text-[11px]">
                    Outcome:
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-extrabold text-[10px]">
                    {rule.directQualificationSpots} Direct Spot{rule.directQualificationSpots !== 1 ? 's' : ''}
                  </span>
                  {rule.preliminarySpots > 0 && (
                    <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-extrabold text-[10px]">
                      {rule.preliminarySpots} Preliminary Spot{rule.preliminarySpots !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {rule.sourceName || rule.sourceId}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
