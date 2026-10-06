import React, { useState, useEffect } from 'react';
import { PlayerCardData } from '../types';
import { NATIONALITIES } from '../constants';
import {
  getValidSubPositionsForCategory,
  getValidPlayStylesForSubPosition,
  sanitizeAndRepairPlayerIdentity,
} from '../utils/playerIdentitySystem';
import { X, CheckCircle2, User, Sliders, Shield, Zap, Sparkles } from 'lucide-react';

import { isUniqueElitePlayer, applyGlobalOvrCap } from '../utils/uniquePlayerRegistry';

interface TeamPlayerEditorModalProps {
  isOpen: boolean;
  player: PlayerCardData;
  slotNumber: number;
  groupLabel: string;
  occupiedNumbers?: Map<number, string>;
  onSave: (updated: PlayerCardData) => void;
  onClose: () => void;
}

export const TeamPlayerEditorModal: React.FC<TeamPlayerEditorModalProps> = ({
  isOpen,
  player,
  slotNumber,
  groupLabel,
  occupiedNumbers,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<PlayerCardData>(player);
  const [shirtNumber, setShirtNumber] = useState<number>(player?.number ?? player?.shirtNumber ?? slotNumber);
  const [numberError, setNumberError] = useState<string | null>(null);

  useEffect(() => {
    if (player) {
      setFormData(sanitizeAndRepairPlayerIdentity(player) as PlayerCardData);
      setShirtNumber(player.number ?? player.shirtNumber ?? slotNumber);
      setNumberError(null);
    }
  }, [player, slotNumber]);

  if (!isOpen) return null;

  const currentCategory = (formData.position || 'ATT').toUpperCase() as 'ATT' | 'MID' | 'DEF' | 'GK';
  const availableSubPositions = getValidSubPositionsForCategory(currentCategory);
  const currentSubPos = availableSubPositions.includes(formData.subPosition || '')
    ? formData.subPosition!
    : availableSubPositions[0] || 'ST';
  const availablePlaystyles = getValidPlayStylesForSubPosition(currentSubPos);

  const validateShirtNumber = (num: number): string | null => {
    if (isNaN(num) || num < 1 || num > 999) {
      return 'Shirt number must be between 1 and 999.';
    }
    if (occupiedNumbers) {
      const occupiedBy = occupiedNumbers.get(num);
      if (occupiedBy) {
        return `Shirt #${num} is already taken by ${occupiedBy}.`;
      }
    }
    return null;
  };

  const handleCategoryChange = (newCat: 'ATT' | 'MID' | 'DEF' | 'GK') => {
    const newSubs = getValidSubPositionsForCategory(newCat);
    const newSub = newSubs[0] || (newCat === 'GK' ? 'GK' : 'ST');
    const newStyles = getValidPlayStylesForSubPosition(newSub);
    const newStyle = newStyles[0] || 'Balanced';

    setFormData((prev) =>
      sanitizeAndRepairPlayerIdentity({
        ...prev,
        position: newCat,
        subPosition: newSub,
        playStyle: newStyle,
      }) as PlayerCardData
    );
  };

  const handleSubPosChange = (newSub: string) => {
    const newStyles = getValidPlayStylesForSubPosition(newSub);
    const newStyle = newStyles.includes(formData.playStyle || '')
      ? formData.playStyle!
      : newStyles[0] || 'Balanced';

    setFormData((prev) =>
      sanitizeAndRepairPlayerIdentity({
        ...prev,
        subPosition: newSub,
        playStyle: newStyle,
      }) as PlayerCardData
    );
  };

  const handleOvrChange = (newOvr: number) => {
    const maxAllowed = isUniqueElitePlayer(formData) ? 99 : 96;
    const ovr = Math.min(maxAllowed, Math.max(40, newOvr));
    setFormData((prev) => ({
      ...prev,
      ovr,
      stats: {
        ...prev.stats,
        pro: ovr,
        def: prev.position === 'GK' ? ovr : Math.max(30, ovr - 10),
        cre: Math.max(30, ovr - 5),
        men: ovr,
        goa: prev.position === 'GK' ? 20 : Math.max(30, ovr - 5),
        phy: ovr,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateShirtNumber(shirtNumber);
    if (err) {
      setNumberError(err);
      return;
    }

    const updatedWithNumber: PlayerCardData = {
      ...formData,
      number: shirtNumber,
      shirtNumber: shirtNumber,
    };

    const sanitized = sanitizeAndRepairPlayerIdentity(updatedWithNumber) as PlayerCardData;
    const finalPlayer = applyGlobalOvrCap(sanitized);
    onSave(finalPlayer);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
      style={{ touchAction: 'pan-y' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div 
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-auto text-left relative max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-4 sm:p-5 shrink-0 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-mono font-black shadow-md text-xs sm:text-sm">
              #{shirtNumber || slotNumber}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                PLAYER EDITOR
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                  {groupLabel}
                </span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Slot #{slotNumber} • Shirt #{shirtNumber} • Stored directly in Team Squad Save File
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col justify-between custom-scrollbar">
          <div className="p-4 sm:p-5 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
            {/* Basic Identity & Shirt Number */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Player Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-bold text-white focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-indigo-300 mb-1 flex items-center justify-between">
                  <span>Shirt # (1-999) *</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={999}
                  required
                  value={shirtNumber}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setShirtNumber(val);
                    setNumberError(validateShirtNumber(val));
                  }}
                  className={`w-full bg-slate-950 border ${
                    numberError ? 'border-red-500 text-red-300' : 'border-indigo-500/50 text-indigo-200'
                  } rounded-xl px-3 py-2 text-xs font-mono font-black focus:border-indigo-400`}
                />
                {numberError && (
                  <p className="text-[10px] text-red-400 font-bold mt-1 leading-tight">
                    ⚠️ {numberError}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nationality *</label>
              <select
                value={formData.nationality?.code || 'ENG'}
                onChange={(e) => {
                  const selCode = e.target.value;
                  const natObj = NATIONALITIES.find((n) => n.code === selCode) || {
                    code: selCode,
                    iso: selCode,
                    name: selCode,
                  };
                  setFormData({ ...formData, nationality: natObj });
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-bold text-white focus:border-indigo-500 cursor-pointer"
              >
                {NATIONALITIES.map((n) => (
                  <option key={n.code} value={n.code}>
                    {n.name} ({n.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Age, Foot & Overall */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Age</label>
                <input
                  type="number"
                  min={15}
                  max={42}
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 20 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Foot</label>
                <select
                  value={formData.preferredFoot || 'Right'}
                  onChange={(e) => setFormData({ ...formData, preferredFoot: e.target.value as 'Left' | 'Right' })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white cursor-pointer"
                >
                  <option value="Right">Right Foot</option>
                  <option value="Left">Left Foot</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-amber-400 mb-1">Overall OVR</label>
                <input
                  type="number"
                  min={40}
                  max={99}
                  value={formData.ovr}
                  onChange={(e) => handleOvrChange(parseInt(e.target.value) || 70)}
                  className="w-full bg-slate-950 border border-amber-500/50 rounded-xl px-3 py-2 text-xs font-black text-amber-300 focus:border-amber-400"
                />
              </div>
            </div>

            {/* Position Taxonomy System */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-indigo-500/30 space-y-3">
              <span className="text-xs font-black text-indigo-400 uppercase tracking-wider block">
                Positional & Tactical Setup
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Category */}
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">1. Category</label>
                  <select
                    value={currentCategory}
                    onChange={(e) => handleCategoryChange(e.target.value as 'ATT' | 'MID' | 'DEF' | 'GK')}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white cursor-pointer"
                  >
                    <option value="ATT">ATT (Attacker)</option>
                    <option value="MID">MID (Midfielder)</option>
                    <option value="DEF">DEF (Defender)</option>
                    <option value="GK">GK (Goalkeeper)</option>
                  </select>
                </div>

                {/* Sub Position */}
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">2. Sub-Position</label>
                  <select
                    value={currentSubPos}
                    onChange={(e) => handleSubPosChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white cursor-pointer"
                  >
                    {availableSubPositions.map((sp) => (
                      <option key={sp} value={sp}>
                        {sp}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Playstyle */}
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">3. Playstyle</label>
                  <select
                    value={formData.playStyle || availablePlaystyles[0] || 'Balanced'}
                    onChange={(e) => setFormData({ ...formData, playStyle: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-bold text-white cursor-pointer"
                  >
                    {availablePlaystyles.map((ps) => (
                      <option key={ps} value={ps}>
                        {ps}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 p-3 sm:p-4 bg-slate-950 border-t border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
