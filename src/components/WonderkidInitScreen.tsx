import React, { useState, useCallback, useEffect } from 'react';
import {
  Sparkles,
  Shuffle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  User,
  Gamepad2,
  Info,
  Footprints,
  Scissors,
  Palette,
  Dices,
  Check,
} from 'lucide-react';
import { PlayerCard } from './PlayerCard';
import { SKIN_COLORS, HAIR_ROOT_COLORS } from '../constants';
import { PlayerCardData, HairStyle, HairLength } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface WonderkidInitScreenProps {
  player: PlayerCardData;
  onPlayerChange: (updated: PlayerCardData) => void;
  onConfirm: () => void;
  showToast?: (msg: string) => void;
}

const WONDERKID_FIRST_NAMES = [
  'Mateo', 'Lucas', 'Leo', 'Enzo', 'Julian', 'Gabriel', 'Liam', 'Noah',
  'Jude', 'Kai', 'Nico', 'Thiago', 'Milan', 'Arda', 'Lamine', 'Kenan',
  'Endrick', 'Kobbie', 'Warren', 'Florian', 'Hugo', 'Diego', 'Bruno',
  'Santi', 'Elias', 'Felix', 'Oscar', 'Theo', 'Ray', 'Max', 'Carlos'
];

const HAIR_STYLES: { id: HairStyle; label: string; labelEs: string }[] = [
  { id: 'straight', label: 'Straight', labelEs: 'Lacio' },
  { id: 'wavy', label: 'Wavy', labelEs: 'Ondulado' },
  { id: 'curly', label: 'Curly', labelEs: 'Rizado' },
  { id: 'braided', label: 'Braided', labelEs: 'Trenzas' },
  { id: 'dreads', label: 'Dreads', labelEs: 'Rastas' },
];

const HAIR_LENGTHS: { id: HairLength; label: string; labelEs: string }[] = [
  { id: 'shaved', label: 'Shaved', labelEs: 'Rapado' },
  { id: 'fade', label: 'Fade', labelEs: 'Degradé' },
  { id: 'short', label: 'Short', labelEs: 'Corto' },
  { id: 'medium', label: 'Medium', labelEs: 'Medio' },
  { id: 'long', label: 'Long', labelEs: 'Largo' },
];

const COLOR_NAME_ES: Record<string, string> = {
  'Jet Black': 'Negro Azabache',
  'Dark Brown': 'Castaño Oscuro',
  'Brown': 'Castaño',
  'Light Brown': 'Castaño Claro',
  'Auburn': 'Cobrizo',
  'Ginger': 'Pelirrojo',
  'Dark Blonde': 'Rubio Oscuro',
  'Blonde': 'Rubio',
  'Platinum': 'Platinado',
  'Pale': 'Muy Claro',
  'Fair': 'Claro',
  'Light': 'Trigueño Claro',
  'Medium Light': 'Trigueño',
  'Medium': 'Bronceado',
  'Tan': 'Moreno Claro',
  'Dark': 'Moreno',
  'Deep Dark': 'Moreno Oscuro',
};

export const WonderkidInitScreen: React.FC<WonderkidInitScreenProps> = ({
  player,
  onPlayerChange,
  onConfirm,
  showToast,
}) => {
  const { t, currentLanguage } = useLanguage();
  const isSpanish = currentLanguage === 'es-ES' || currentLanguage === 'es-AR';
  const [step, setStep] = useState<'name' | 'appearance'>('name');

  // Ensure default state on entering creation: weak foot 0, no facial hair, no accessories, no special hair
  useEffect(() => {
    if (
      player.weakFootStars !== 0 ||
      (player.accessories?.accessory && player.accessories.accessory !== 'none') ||
      player.biometrics.facialHairStyle !== 'none' ||
      player.biometrics.facialHair !== 'none' ||
      player.biometrics.hairStyle === 'special'
    ) {
      onPlayerChange({
        ...player,
        weakFootStars: 0,
        accessories: {
          ...(player.accessories || { headbandColor: '#000000' }),
          accessory: 'none',
        },
        biometrics: {
          ...player.biometrics,
          facialHairStyle: 'none',
          facialHair: 'none',
          hairStyle: player.biometrics.hairStyle === 'special' ? 'straight' : player.biometrics.hairStyle,
          hairLength: player.biometrics.hairLength === 'special' ? 'short' : player.biometrics.hairLength,
          specialHair: undefined,
        },
      });
    }
  }, []);

  // Handle Pick Random Name
  const handlePickRandomName = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * WONDERKID_FIRST_NAMES.length);
    const randomName = WONDERKID_FIRST_NAMES[randomIndex].toUpperCase();
    onPlayerChange({
      ...player,
      name: randomName,
    });
    if (showToast) {
      showToast(`🎲 Name rolled: ${randomName}`);
    }
  }, [player, onPlayerChange, showToast]);

  // Handle Pick Random Appearance Design (Age 10 appropriate: no facial hair, tattoos, or accessories)
  const handleRandomizeDesign = useCallback(() => {
    const randomSkin = SKIN_COLORS[Math.floor(Math.random() * SKIN_COLORS.length)].hex;
    const randomStyle = HAIR_STYLES[Math.floor(Math.random() * HAIR_STYLES.length)].id;
    const randomLength = HAIR_LENGTHS[Math.floor(Math.random() * HAIR_LENGTHS.length)].id;
    const randomRoot = HAIR_ROOT_COLORS[Math.floor(Math.random() * HAIR_ROOT_COLORS.length)].hex;
    const randomPreferredFoot: 'Left' | 'Right' = Math.random() > 0.4 ? 'Right' : 'Left';

    onPlayerChange({
      ...player,
      preferredFoot: randomPreferredFoot,
      weakFootStars: 0,
      accessories: {
        ...(player.accessories || { headbandColor: '#000000' }),
        accessory: 'none',
      },
      biometrics: {
        ...player.biometrics,
        skinColor: randomSkin,
        hairStyle: randomStyle,
        hairLength: randomLength,
        hairRoot: randomRoot,
        facialHairStyle: 'none',
        facialHair: 'none',
        specialHair: undefined,
      },
    });

    if (showToast) {
      showToast('🎲 New Wonderkid look generated!');
    }
  }, [player, onPlayerChange, showToast]);

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (player.name && player.name.trim().length > 0) {
        setStep('appearance');
      }
    }
  };

  const handleConfirmCharacter = useCallback(() => {
    onPlayerChange({
      ...player,
      weakFootStars: 0,
      accessories: {
        ...(player.accessories || { headbandColor: '#000000' }),
        accessory: 'none',
      },
      biometrics: {
        ...player.biometrics,
        facialHairStyle: 'none',
        facialHair: 'none',
        specialHair: undefined,
      },
    });
    onConfirm();
  }, [player, onPlayerChange, onConfirm]);

  return (
    <div className="w-full max-w-5xl mx-auto py-4 px-2 sm:px-4">
      {/* STEP 1: NAME ENTRY SCREEN */}
      {step === 'name' && (
        <div className="max-w-xl mx-auto space-y-6">
          {/* Arcade Enclosure */}
          <div className="bg-slate-900 border-4 border-amber-400 pixel-corners pixel-bevel-gold p-6 shadow-2xl text-center relative overflow-hidden font-pixel">
            {/* Retro Scanline Overlay */}
            <div className="absolute inset-0 pixel-scanlines opacity-30 pointer-events-none z-0" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-950 border border-amber-400 text-amber-300 font-arcade font-black text-[11px] tracking-wider uppercase mb-3 pixel-corners pixel-bevel-gold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {t('WK_STEP_NAME_BADGE')}
              </div>

              <h1 className="text-xl sm:text-2xl font-black font-arcade text-white tracking-wider uppercase">
                {t('WK_STEP_NAME_TITLE')}
              </h1>

              <p className="text-xs text-slate-300 mt-2 max-w-md mx-auto leading-relaxed font-retro">
                {t('WK_STEP_NAME_SUBTITLE')}
              </p>

              {/* Input Box & Random Button */}
              <div className="mt-8 space-y-3">
                <div className="text-left">
                  <label
                    htmlFor="wk-name-input"
                    className="block text-xs font-arcade font-bold text-amber-400 uppercase tracking-wider mb-2"
                  >
                    {t('WK_NAME_LABEL')}
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <User className="w-5 h-5 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="wk-name-input"
                        type="text"
                        autoFocus
                        maxLength={24}
                        value={player.name || ''}
                        onChange={(e) =>
                          onPlayerChange({
                            ...player,
                            name: e.target.value.toUpperCase(),
                          })
                        }
                        onKeyDown={handleNameKeyDown}
                        placeholder={t('WK_NAME_PLACEHOLDER') || 'ENTER FIRST NAME...'}
                        className="w-full pl-11 pr-4 py-3 bg-slate-950 border-2 border-amber-400 text-amber-300 font-arcade font-black text-base sm:text-lg tracking-widest uppercase placeholder-slate-600 outline-none transition-all shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)] pixel-corners caret-amber-400"
                      />
                    </div>

                    <button
                      id="wk-pick-random-name-btn"
                      type="button"
                      onClick={handlePickRandomName}
                      className="px-4 py-3 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 border-2 border-amber-300 pixel-corners pixel-bevel-raised font-arcade font-black text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md cursor-pointer shrink-0"
                      title={t('WK_NAME_RANDOM_BTN') || 'Roll Random Name'}
                    >
                      <Shuffle className="w-4 h-4 text-slate-950" />
                      <span className="hidden sm:inline">{t('WK_NAME_RANDOM_BTN') || 'RANDOM'}</span>
                    </button>
                  </div>
                </div>

                {/* Retro RPG Info Dialogue Box with gold borders */}
                <div className="p-3 bg-slate-950 border-2 border-amber-500/60 pixel-corners pixel-bevel-gold text-amber-200 text-xs flex items-start gap-2.5 text-left leading-relaxed font-retro shadow-inner">
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{t('WK_NAME_LASTNAME_NOTE')}</span>
                </div>
              </div>

              {/* Action Bar */}
              <div className="mt-8 pt-4 border-t-2 border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-retro">
                  <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">{t('WK_NAV_HINT')}</span>
                </div>

                <button
                  id="wk-continue-appearance-btn"
                  type="button"
                  disabled={!player.name || player.name.trim().length === 0}
                  onClick={() => setStep('appearance')}
                  className={`w-full sm:w-auto px-6 py-3 pixel-corners font-arcade font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 ${
                    player.name && player.name.trim().length > 0
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-2 border-emerald-300 pixel-bevel-emerald'
                      : 'bg-slate-900 text-slate-600 border-2 border-slate-800 cursor-not-allowed pixel-bevel-raised'
                  }`}
                >
                  <span>{t('WK_BTN_CONTINUE')}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: DYNAMIC CARD CREATION STUDIO (SETTINGS AROUND THE CARD) */}
      {step === 'appearance' && (
        <div className="space-y-5 animate-fadeIn font-pixel">
          {/* RETRO TOP CONSOLE BAR WITH BACK AND START CAREER BUTTONS */}
          <div className="bg-slate-900 border-2 border-amber-500/80 pixel-corners pixel-bevel-gold p-3 sm:p-4 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-950 border border-emerald-400 text-emerald-300 font-arcade font-black text-[10px] sm:text-[11px] tracking-wider uppercase mb-0.5 sm:mb-1 pixel-corners pixel-bevel-raised">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                {t('WK_STEP_APP_BADGE')}
              </div>
              <h2 className="text-base sm:text-xl font-black font-arcade text-white tracking-wide uppercase">
                {t('WK_STEP_APP_TITLE')}
              </h2>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 hidden xs:block font-retro">
                Configure your 10-year-old wonderkid's look and preferred foot directly on the player card.
              </p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                id="wk-top-back-btn"
                type="button"
                onClick={() => setStep('name')}
                className="px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border-2 border-slate-600 pixel-corners pixel-bevel-raised font-arcade font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('WK_BTN_BACK_NAME')}</span>
              </button>

              {/* START CAREER RETRO ARCADE BUTTON */}
              <button
                id="wk-top-continue-btn"
                type="button"
                onClick={handleConfirmCharacter}
                className="flex-1 sm:flex-initial px-4 sm:px-8 py-2.5 sm:py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-arcade font-black text-xs sm:text-sm uppercase tracking-wider pixel-corners pixel-bevel-emerald border-2 border-emerald-300 shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
              >
                <CheckCircle2 className="w-4 sm:w-5 h-4 sm:h-5 stroke-[2.5]" />
                <span>{t('WK_CONFIRM_START')} ★</span>
              </button>
            </div>
          </div>

          {/* MAIN DYNAMIC CARD STUDIO CONTAINER */}
          <div className="bg-slate-900 border-2 border-amber-500/60 pixel-corners pixel-bevel-gold p-4 sm:p-6 shadow-2xl space-y-5 relative">
            <div className="absolute inset-0 pixel-scanlines opacity-20 pointer-events-none z-0" />

            {/* 1. ABOVE PORTRAIT: HAIR CONTROLS (STYLE, LENGTH, COLOR) */}
            <div className="bg-slate-950 border-2 border-amber-500/40 pixel-corners pixel-bevel-raised p-4 space-y-4 shadow-inner relative z-10">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2 text-amber-300 font-arcade font-black text-xs uppercase tracking-wider">
                  <Scissors className="w-4 h-4 text-amber-400" />
                  <span>{t('WK_HAIR_STYLE') || 'HAIR OPTIONS'} ({t('PREVIEW') || 'PREVIEW'})</span>
                </div>
                <span className="text-[10px] text-slate-400 font-retro">{t('WK_HAIR_STYLE')} & {t('WK_HAIR_COLOR')}</span>
              </div>

              {/* Hair Styles Row */}
              <div>
                <span className="block text-[10px] font-arcade font-bold uppercase tracking-wider text-amber-400 mb-1.5">
                  {t('WK_HAIR_STYLE')}
                </span>
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                  {HAIR_STYLES.map((st) => {
                    const isSelected = player.biometrics.hairStyle === st.id;
                    return (
                      <button
                        key={st.id}
                        id={`wk-hair-style-${st.id}`}
                        type="button"
                        onClick={() =>
                          onPlayerChange({
                            ...player,
                            biometrics: {
                              ...player.biometrics,
                              hairStyle: st.id,
                            },
                          })
                        }
                        className={`py-2 px-1 text-xs font-arcade font-black pixel-corners border-2 text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-400 text-slate-950 border-amber-200 pixel-bevel-gold shadow-md'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900 pixel-bevel-raised'
                        }`}
                      >
                        {isSpanish ? st.labelEs : st.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hair Lengths Row */}
              <div>
                <span className="block text-[10px] font-arcade font-bold uppercase tracking-wider text-amber-400 mb-1.5">
                  {t('WK_HAIR_LENGTH')}
                </span>
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                  {HAIR_LENGTHS.map((len) => {
                    const isSelected = player.biometrics.hairLength === len.id;
                    return (
                      <button
                        key={len.id}
                        id={`wk-hair-length-${len.id}`}
                        type="button"
                        onClick={() =>
                          onPlayerChange({
                            ...player,
                            biometrics: {
                              ...player.biometrics,
                              hairLength: len.id,
                            },
                          })
                        }
                        className={`py-2 px-1 text-xs font-arcade font-black pixel-corners border-2 text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-400 text-slate-950 border-amber-200 pixel-bevel-gold shadow-md'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900 pixel-bevel-raised'
                        }`}
                      >
                        {isSpanish ? len.labelEs : len.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hair Colors Palette: Sharp square pixel tiles with retro black borders and illuminated selection rings */}
              <div>
                <span className="block text-[10px] font-arcade font-bold uppercase tracking-wider text-amber-400 mb-1.5">
                  {t('WK_HAIR_COLOR')}
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1.5">
                  {HAIR_ROOT_COLORS.map((hc) => {
                    const isSelected = player.biometrics.hairRoot === hc.hex;
                    const localizedHcName = isSpanish ? (COLOR_NAME_ES[hc.name] || hc.name) : hc.name;
                    return (
                      <button
                        key={hc.hex}
                        id={`wk-hair-color-${hc.name.toLowerCase().replace(/\s+/g, '-')}`}
                        type="button"
                        onClick={() =>
                          onPlayerChange({
                            ...player,
                            biometrics: {
                              ...player.biometrics,
                              hairRoot: hc.hex,
                            },
                          })
                        }
                        className={`p-1.5 pixel-corners border-2 flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-400/20 border-amber-400 pixel-bevel-gold ring-2 ring-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.6)]'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700 pixel-bevel-raised'
                        }`}
                        title={localizedHcName}
                      >
                        <span
                          className="w-4 h-4 pixel-corners border border-black shadow-inner shrink-0"
                          style={{ backgroundColor: hc.hex }}
                        />
                        <span className="text-[9px] font-arcade font-bold text-slate-300 truncate">{localizedHcName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 2. THE CARD COCKPIT: [LEFT: STRONG FOOT] - [CENTER: PORTRAIT CARD] - [RIGHT: RANDOM BUTTON] */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-center relative z-10">
              {/* LEFT SIDE: STRONG FOOT COCKPIT */}
              <div className="md:col-span-3 order-2 md:order-1 bg-slate-950 border-2 border-amber-500/40 pixel-corners pixel-bevel-raised p-4 flex flex-col justify-center space-y-3 shadow-inner h-full min-h-[220px]">
                <div className="flex items-center gap-2 text-slate-200 font-arcade font-black text-xs uppercase tracking-wider border-b border-slate-800 pb-2">
                  <Footprints className="w-4 h-4 text-emerald-400" />
                  <span>{t('WK_PREFERRED_FOOT')}</span>
                </div>

                <p className="text-[10px] text-slate-400 font-retro">
                  {t('WK_FOOT_DESC')}
                </p>

                <div className="flex flex-col gap-2.5">
                  <button
                    id="wk-foot-left-btn"
                    type="button"
                    onClick={() =>
                      onPlayerChange({
                        ...player,
                        preferredFoot: 'Left',
                        weakFootStars: 0,
                      })
                    }
                    className={`py-3 px-3.5 pixel-corners border-2 flex items-center justify-between font-arcade font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                      player.preferredFoot === 'Left'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 pixel-bevel-emerald shadow-[0_0_12px_rgba(52,211,153,0.4)]'
                        : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300 pixel-bevel-raised'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-6 h-6 pixel-corners bg-slate-950 border border-slate-700 flex items-center justify-center font-arcade font-black text-xs text-amber-300">
                        L
                      </span>
                      <span>{t('FOOT_LEFT')}</span>
                    </span>
                    <span
                      className={`w-2.5 h-2.5 pixel-corners border ${
                        player.preferredFoot === 'Left'
                          ? 'bg-emerald-400 animate-pulse border-emerald-200 shadow-[0_0_8px_rgba(52,211,153,0.9)]'
                          : 'bg-slate-800 border-slate-700'
                      }`}
                    />
                  </button>

                  <button
                    id="wk-foot-right-btn"
                    type="button"
                    onClick={() =>
                      onPlayerChange({
                        ...player,
                        preferredFoot: 'Right',
                        weakFootStars: 0,
                      })
                    }
                    className={`py-3 px-3.5 pixel-corners border-2 flex items-center justify-between font-arcade font-black text-xs uppercase tracking-wider transition-all cursor-pointer ${
                      player.preferredFoot === 'Right'
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 pixel-bevel-emerald shadow-[0_0_12px_rgba(52,211,153,0.4)]'
                        : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300 pixel-bevel-raised'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-6 h-6 pixel-corners bg-slate-950 border border-slate-700 flex items-center justify-center font-arcade font-black text-xs text-amber-300">
                        R
                      </span>
                      <span>{t('FOOT_RIGHT')}</span>
                    </span>
                    <span
                      className={`w-2.5 h-2.5 pixel-corners border ${
                        player.preferredFoot === 'Right'
                          ? 'bg-emerald-400 animate-pulse border-emerald-200 shadow-[0_0_8px_rgba(52,211,153,0.9)]'
                          : 'bg-slate-800 border-slate-700'
                      }`}
                    />
                  </button>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 text-center font-retro">
                  {t('WK_WEAK_FOOT_NOTE')}
                </div>
              </div>

              {/* CENTER: THE CARD PORTRAIT (CLEAN 10YO DISPLAY) */}
              <div className="md:col-span-6 order-1 md:order-2 flex flex-col items-center justify-center py-2">
                <div className="text-center mb-2">
                  <span className="px-3.5 py-1 bg-amber-950 border border-amber-400 text-amber-300 pixel-corners pixel-bevel-gold text-xs font-arcade font-black uppercase tracking-wider inline-flex items-center gap-1.5 shadow">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    {player.name || 'WONDERKID'} • AGE 10
                  </span>
                </div>

                <div className="w-full flex justify-center py-1 overflow-visible">
                  <div className="transform scale-[0.85] xs:scale-[0.92] sm:scale-100 origin-top transition-transform duration-200">
                    <PlayerCard
                      id="wonderkid-init-portrait-card"
                      player={player}
                      hideTeam={true}
                      hideNationality={true}
                      hidePosition={true}
                      hideStats={true}
                      hidePerks={true}
                      hideOvr={true}
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE: RANDOMIZER COCKPIT */}
              <div className="md:col-span-3 order-3 bg-slate-950 border-2 border-amber-500/40 pixel-corners pixel-bevel-raised p-4 flex flex-col justify-center space-y-3 shadow-inner h-full min-h-[220px]">
                <div className="flex items-center gap-2 text-slate-200 font-arcade font-black text-xs uppercase tracking-wider border-b border-slate-800 pb-2">
                  <Dices className="w-4 h-4 text-amber-400" />
                  <span>{t('WK_RANDOMIZER')}</span>
                </div>

                <p className="text-[10px] text-slate-400 font-retro">
                  {t('WK_RANDOMIZER_DESC')}
                </p>

                <button
                  id="wk-random-appearance-btn"
                  type="button"
                  onClick={handleRandomizeDesign}
                  className="w-full py-4 px-3 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 border-2 border-amber-300 pixel-corners pixel-bevel-gold font-arcade font-black text-xs uppercase tracking-wider flex flex-col items-center justify-center gap-1.5 transition-all shadow-xl cursor-pointer"
                >
                  <Dices className="w-6 h-6 text-slate-950 animate-pulse" />
                  <span className="text-sm font-black font-arcade">{t('WK_RANDOMIZE_BTN')}</span>
                  <span className="text-[9px] font-retro text-slate-900 font-bold">{t('WK_AGE_10_APPROPRIATE')}</span>
                </button>

                <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 text-center font-retro">
                  {t('WK_AGE_RESTRICTION')}
                </div>
              </div>
            </div>

            {/* 3. BELOW PORTRAIT: SKIN TONE SELECTOR */}
            <div className="bg-slate-950 border-2 border-amber-500/40 pixel-corners pixel-bevel-raised p-4 space-y-3 shadow-inner relative z-10">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-amber-300 font-arcade font-black text-xs uppercase tracking-wider">
                  <Palette className="w-4 h-4 text-amber-400" />
                  <span>{t('WK_SKIN_COLOR')} ({t('SELECT') || 'SELECCIÓN'})</span>
                </div>
                <span className="text-[10px] text-slate-400 font-retro">{t('WK_SKIN_UNDERTONES')}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
                {SKIN_COLORS.map((skin) => {
                  const isSelected = player.biometrics.skinColor === skin.hex;
                  return (
                    <button
                      key={skin.hex}
                      id={`wk-skin-${skin.name.toLowerCase().replace(/\s+/g, '-')}`}
                      type="button"
                      onClick={() =>
                        onPlayerChange({
                          ...player,
                          biometrics: {
                            ...player.biometrics,
                            skinColor: skin.hex,
                          },
                        })
                      }
                      className={`p-2 pixel-corners border-2 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-400/20 border-amber-400 pixel-bevel-gold ring-2 ring-amber-400 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.6)]'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200 pixel-bevel-raised'
                      }`}
                    >
                      <span
                        className="w-7 h-7 pixel-corners border-2 border-black/80 shadow-inner shrink-0"
                        style={{ backgroundColor: skin.hex }}
                      />
                      <span className="text-[10px] font-arcade font-black uppercase truncate w-full text-center">
                        {isSpanish ? (COLOR_NAME_ES[skin.name] || skin.name) : skin.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* BOTTOM BAR WITH BIG RETRO CONTINUE BUTTON */}
          <div className="bg-slate-900 border-2 border-amber-500/80 pixel-corners pixel-bevel-gold p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-300 font-retro">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{t('WK_APPEARANCE_NOTE')}</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                id="wk-bottom-back-btn"
                type="button"
                onClick={() => setStep('name')}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 border-2 border-slate-600 pixel-corners pixel-bevel-raised font-arcade font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t('WK_BTN_BACK_NAME')}</span>
              </button>

              {/* BIG BOTTOM CONTINUE BUTTON */}
              <button
                id="wk-bottom-continue-btn"
                type="button"
                onClick={handleConfirmCharacter}
                className="flex-1 sm:flex-initial px-8 sm:px-10 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-arcade font-black text-sm uppercase tracking-wider pixel-corners pixel-bevel-emerald border-2 border-emerald-300 shadow-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-95"
              >
                <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                <span>{t('WK_CONFIRM_START')} ★</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WonderkidInitScreen;
