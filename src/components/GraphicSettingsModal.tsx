import React, { useState } from 'react';
import {
  Monitor,
  Type,
  Eye,
  Check,
  Lock,
  X,
  Layers,
  Vibrate,
} from 'lucide-react';
import {
  useGraphicSettings,
  FontSizeOption,
  ColorblindMode,
  GraphicQuality,
} from '../utils/graphicSettingsSystem';
import { haptics } from '../utils/hapticsSystem';
import { useLanguage } from '../context/LanguageContext';

interface GraphicSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GraphicSettingsModal: React.FC<GraphicSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useLanguage();
  const { graphicSettings, updateGraphicSettings } = useGraphicSettings();
  const [hapticsState, setHapticsState] = useState<boolean>(() => haptics.getIsEnabled());
  const [activeTab, setActiveTab] = useState<'graphics' | 'general'>('graphics');

  if (!isOpen) return null;

  // Font options scaled so former XL is the new comfortable Standard (base), former Large is Compact (sm), with larger Large & XL sizes
  const fontOptions: { id: FontSizeOption; label: string; sublabel: string; scale: string }[] = [
    { id: 'sm', label: t('FONT_SIZE_COMPACT') || 'Compact', sublabel: '17.5px (Former Large)', scale: 'text-xs' },
    { id: 'base', label: t('FONT_SIZE_STANDARD') || 'Standard', sublabel: '19px (Former XL • Default)', scale: 'text-sm' },
    { id: 'lg', label: t('FONT_SIZE_LARGE') || 'Large', sublabel: '21px (+10% Scale)', scale: 'text-base' },
    { id: 'xl', label: t('FONT_SIZE_EXTRA_LARGE') || 'Extra Large', sublabel: '23px (+20% Scale)', scale: 'text-lg' },
  ];

  const colorblindOptions: {
    id: ColorblindMode;
    label: string;
    description: string;
    colors: string[];
  }[] = [
    {
      id: 'none',
      label: t('COLORBLIND_STANDARD') || 'Standard',
      description: t('COLORBLIND_STANDARD_DESC') || 'Default color spectrum with full dynamic range',
      colors: ['#ef4444', '#22c55e', '#3b82f6', '#eab308'],
    },
    {
      id: 'protanopia',
      label: t('COLORBLIND_PROTANOPIA') || 'Protanopia',
      description: t('COLORBLIND_PROTANOPIA_DESC') || 'Red-blind / Red-weak daltonization optimization',
      colors: ['#ca8a04', '#0284c7', '#6366f1', '#f59e0b'],
    },
    {
      id: 'deuteranopia',
      label: t('COLORBLIND_DEUTERANOPIA') || 'Deuteranopia',
      description: t('COLORBLIND_DEUTERANOPIA_DESC') || 'Green-blind / Green-weak enhanced contrast calibration',
      colors: ['#d97706', '#2563eb', '#8b5cf6', '#eab308'],
    },
    {
      id: 'tritanopia',
      label: t('COLORBLIND_TRITANOPIA') || 'Tritanopia',
      description: t('COLORBLIND_TRITANOPIA_DESC') || 'Blue-blind / Blue-weak optimized separation palette',
      colors: ['#dc2626', '#059669', '#0891b2', '#f97316'],
    },
    {
      id: 'high_contrast',
      label: t('COLORBLIND_HIGH_CONTRAST') || 'High Contrast',
      description: t('COLORBLIND_HIGH_CONTRAST_DESC') || 'Enhanced border contrast, clarity & boosted luminance',
      colors: ['#ff0000', '#00ff66', '#00aaff', '#ffff00'],
    },
  ];

  // Performance, Balanced, and High Quality presets are all active
  const qualityOptions: {
    id: GraphicQuality;
    title: string;
    badge: string;
    description: string;
    tagline?: string;
    featureTags?: string[];
    isLocked: boolean;
  }[] = [
    {
      id: 'performance',
      title: t('QUALITY_PERFORMANCE_TITLE') || 'Performance Mode (Low-Spec & Mobile)',
      badge: t('BADGE_PERFORMANCE') || '60+ FPS • Ultra-Fast',
      description:
        t('QUALITY_PERFORMANCE_DESC') ||
        'Optimized flat barebones styling for maximum responsiveness. Strips expensive blurs, scanlines, drop shadows, confetti cascades, and heavy GPU animation loops.',
      tagline: 'Fastest Response • Low Battery Usage • 60+ FPS on Low-End Devices',
      featureTags: ['Maximum FPS', 'Low Battery Usage', 'Zero Input Lag'],
      isLocked: false,
    },
    {
      id: 'balanced',
      title: t('QUALITY_BALANCED_TITLE') || 'Balanced Mode (32-Bit Arcade)',
      badge: t('BADGE_ACTIVE') || 'Standard 60 FPS',
      description:
        t('QUALITY_BALANCED_DESC') ||
        'Original 32-bit retro arcade aesthetic with stepped pixel bevels, CRT scanlines, and authentic audio-visual pacing.',
      tagline: 'Full Arcade Aesthetics • Retro Scanlines • Classic Audio-Visual Pacing',
      featureTags: ['Authentic 32-Bit', 'CRT Scanlines', 'Procedural Audio'],
      isLocked: false,
    },
    {
      id: 'high',
      title: t('QUALITY_HIGH_QUALITY_TITLE') || 'High Quality Mode (Cyber-Arcade Glass)',
      badge: t('BADGE_HIGH_QUALITY') || '120 FPS • Max Fidelity',
      description:
        t('QUALITY_HIGH_QUALITY_DESC') ||
        'Deluxe visual overhaul with volumetric neon ambient glow, holographic foil card shimmer, interactive 3D tilt, and high-density celebration particle cascades.',
      tagline: 'Max Fidelity • Volumetric Neon & CRT Bloom • Deluxe Particle FX • Holographic Card Shimmer',
      featureTags: [
        'Max Fidelity',
        'Volumetric Neon & CRT Bloom',
        'Deluxe Particle FX',
        'Holographic Card Shimmer',
      ],
      isLocked: false,
    },
  ];

  return (
    <div
      id="graphic-settings-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150 font-mono select-none"
      onClick={onClose}
    >
      {/* 32-Bit Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none pixel-scanlines opacity-40 z-0" />

      <div
        id="graphic-settings-modal-content"
        className="bg-slate-900 border-2 border-amber-500/80 pixel-bevel-gold p-4 sm:p-6 max-w-xl w-full shadow-[0_0_35px_rgba(245,158,11,0.35)] space-y-4 text-left relative overflow-hidden my-auto max-h-[90vh] flex flex-col z-10 text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - 32-Bit Retro Cabinet Style */}
        <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 bg-slate-950 border border-amber-400 pixel-bevel-gold text-amber-400 flex items-center justify-center shadow-sm shrink-0">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider pixel-text-shadow">
                  {t('SETTINGS_TITLE') || 'Settings'}
                </h3>
                <span className="px-1.5 py-0.2 bg-amber-950 border border-amber-500 text-amber-300 text-[9px] font-mono font-black uppercase">
                  32-BIT FX
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                {t('SETTINGS_SUBTITLE') || 'Display graphics, font scaling, colorblind filters & device controls'}
              </p>
            </div>
          </div>

          <button
            id="graphic-settings-close-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-700 pixel-bevel-raised transition cursor-pointer active:scale-95"
            title={t('Close') || 'Close'}
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Section Navigation Tabs: GRAPHICS vs GENERAL */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('graphics')}
            className={`px-4 py-1.5 font-arcade text-xs uppercase tracking-wider border transition cursor-pointer active:scale-95 flex items-center gap-1.5 ${
              activeTab === 'graphics'
                ? 'bg-amber-950 text-amber-300 border-amber-400 pixel-bevel-gold font-black'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white pixel-bevel-raised'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>{t('SETTINGS_TAB_GRAPHICS') || 'GRAPHICS'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`px-4 py-1.5 font-arcade text-xs uppercase tracking-wider border transition cursor-pointer active:scale-95 flex items-center gap-1.5 ${
              activeTab === 'general'
                ? 'bg-cyan-950 text-cyan-300 border-cyan-400 pixel-bevel-cyan font-black'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white pixel-bevel-raised'
            }`}
          >
            <Vibrate className="w-3.5 h-3.5" />
            <span>{t('SETTINGS_TAB_GENERAL') || 'GENERAL'}</span>
          </button>
        </div>

        {/* Scrollable Settings Body */}
        <div className="space-y-4 overflow-y-auto pr-1 flex-1 custom-scrollbar">
          {activeTab === 'graphics' && (
            <>
              {/* SECTION: GRAPHIC QUALITY PRESET */}
              <div className="space-y-2 p-3 bg-slate-950 border border-slate-800 pixel-bevel-raised">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t('Quality Preset')}</span>
                  </label>
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 uppercase ${
                      graphicSettings.quality === 'high' || graphicSettings.quality === 'high_quality'
                        ? 'text-purple-300 bg-purple-950 border border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                        : graphicSettings.quality === 'performance'
                        ? 'text-cyan-300 bg-cyan-950 border border-cyan-500 pixel-bevel-cyan'
                        : 'text-amber-300 bg-amber-950 border border-amber-500 pixel-bevel-gold'
                    }`}
                  >
                    {graphicSettings.quality === 'high' || graphicSettings.quality === 'high_quality'
                      ? 'HIGH QUALITY • 120 FPS'
                      : graphicSettings.quality === 'performance'
                      ? 'PERFORMANCE 60+ FPS'
                      : 'BALANCED 60 FPS'}
                  </span>
                </div>

                <div className="space-y-2">
                  {qualityOptions.map((q) => {
                    const isSelected =
                      graphicSettings.quality === q.id ||
                      (q.id === 'high' && graphicSettings.quality === 'high_quality');
                    return (
                      <button
                        key={q.id}
                        id={`quality-opt-${q.id}`}
                        type="button"
                        disabled={q.isLocked}
                        onClick={() => {
                          if (!q.isLocked) {
                            updateGraphicSettings({ quality: q.id });
                            haptics.buttonPress();
                          }
                        }}
                        className={`w-full p-3 border flex items-center justify-between gap-3 text-left transition-all ${
                          q.isLocked
                            ? 'bg-slate-950 border-slate-800 opacity-60 cursor-not-allowed pixel-bevel-raised'
                            : isSelected
                            ? q.id === 'high'
                              ? 'bg-gradient-to-r from-purple-950/90 via-slate-900 to-indigo-950/90 border-purple-400 text-white pixel-bevel-gold cursor-pointer shadow-[0_0_30px_rgba(168,85,247,0.4)]'
                              : q.id === 'performance'
                              ? 'bg-cyan-950/70 border-cyan-400 text-white pixel-bevel-cyan cursor-pointer shadow-md'
                              : 'bg-amber-950/70 border-amber-400 text-white pixel-bevel-gold cursor-pointer shadow-md'
                            : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300 pixel-bevel-raised cursor-pointer active:scale-95'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black uppercase tracking-wider text-white">{q.title}</span>
                            <span
                              className={`text-[8px] font-mono font-black px-1.5 py-0.2 border ${
                                isSelected
                                  ? q.id === 'high'
                                    ? 'bg-purple-400 text-slate-950 border-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.7)]'
                                    : q.id === 'performance'
                                    ? 'bg-cyan-400 text-slate-950 border-cyan-300'
                                    : 'bg-amber-400 text-slate-950 border-amber-300'
                                  : 'bg-slate-800 text-slate-400 border-slate-700'
                              }`}
                            >
                              {q.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                            {q.description}
                          </p>

                          {/* Active Feature Tag Badges */}
                          {q.featureTags && (
                            <div className="mt-1.5 flex flex-wrap gap-1">
                              {q.featureTags.map((tag, tagIdx) => (
                                <span
                                  key={tagIdx}
                                  className={`text-[8px] font-mono font-bold px-1.5 py-0.5 border ${
                                    isSelected
                                      ? q.id === 'high'
                                        ? 'bg-purple-900/50 text-purple-200 border-purple-400/60 shadow-[0_0_8px_rgba(168,85,247,0.3)]'
                                        : q.id === 'performance'
                                        ? 'bg-cyan-900/40 text-cyan-300 border-cyan-500/60'
                                        : 'bg-amber-900/40 text-amber-300 border-amber-500/60'
                                      : 'bg-slate-950/70 text-slate-400 border-slate-800'
                                  }`}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="shrink-0 flex items-center gap-1">
                          {isSelected ? (
                            <div
                              className={`flex items-center gap-1 text-[10px] font-mono font-black px-2 py-1 ${
                                q.id === 'high'
                                  ? 'text-purple-200 bg-purple-950 border border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.6)]'
                                  : q.id === 'performance'
                                  ? 'text-cyan-300 bg-cyan-950 border border-cyan-500 pixel-bevel-cyan'
                                  : 'text-amber-300 bg-amber-950 border border-amber-500 pixel-bevel-gold'
                              }`}
                            >
                              <Check className="w-3 h-3 stroke-[3]" />
                              <span>ACTIVE</span>
                            </div>
                          ) : q.isLocked ? (
                            <div className="flex items-center gap-1 text-[9px] font-mono text-slate-500 bg-slate-950 border border-slate-800 px-1.5 py-0.5">
                              <Lock className="w-2.5 h-2.5" />
                              <span>DISABLED</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-[9px] font-mono text-slate-400 bg-slate-800 border border-slate-700 px-2 py-1 hover:bg-slate-700 hover:text-white">
                              <span>SELECT</span>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <p className="text-[10px] text-slate-400 bg-slate-900/80 p-2 border border-slate-800">
                  💡 {t('QUALITY_STATUS_NOTE') || 'Performance Mode (ultra-responsive), Balanced (standard 32-bit arcade), and High Quality (volumetric neon bloom, holographic card shimmer, deluxe particle cascades) are all active with live instant switching.'}
                </p>
              </div>

              {/* SECTION: FONT SIZE (Moved under GRAPHICS) */}
              <div className="space-y-2 p-3 bg-slate-950 border border-slate-800 pixel-bevel-raised">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t('Font Size')}</span>
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">
                    {fontOptions.find((f) => f.id === graphicSettings.fontSize)?.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {fontOptions.map((f) => {
                    const isSelected = graphicSettings.fontSize === f.id;
                    return (
                      <button
                        key={f.id}
                        id={`font-size-opt-${f.id}`}
                        type="button"
                        onClick={() => updateGraphicSettings({ fontSize: f.id })}
                        className={`p-2.5 border text-left transition-all cursor-pointer flex flex-col justify-between active:scale-95 ${
                          isSelected
                            ? 'bg-amber-950 text-amber-300 border-amber-400 pixel-bevel-gold font-black shadow-sm'
                            : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300 pixel-bevel-raised'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-black ${f.scale}`}>{f.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 stroke-[3]" />}
                        </div>
                        <span className="text-[9px] text-slate-400 font-mono">{f.sublabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION: COLORBLIND ACCESSIBILITY FILTERS (Moved under GRAPHICS) */}
              <div className="space-y-2 p-3 bg-slate-950 border border-slate-800 pixel-bevel-raised">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t('Colorblind Mode')}</span>
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">
                    {colorblindOptions.find((c) => c.id === graphicSettings.colorblindMode)?.label}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {colorblindOptions.map((c) => {
                    const isSelected = graphicSettings.colorblindMode === c.id;
                    return (
                      <button
                        key={c.id}
                        id={`colorblind-opt-${c.id}`}
                        type="button"
                        onClick={() => updateGraphicSettings({ colorblindMode: c.id })}
                        className={`w-full p-2.5 border text-left transition-all cursor-pointer flex items-center justify-between gap-2.5 active:scale-95 ${
                          isSelected
                            ? 'bg-emerald-950/70 border-emerald-400 pixel-bevel-emerald text-emerald-200 font-bold'
                            : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 pixel-bevel-raised'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black uppercase tracking-wider text-white">{c.label}</span>
                            {isSelected && (
                              <span className="text-[8px] font-mono font-black bg-emerald-500 text-slate-950 px-1.5 py-0.2 border border-emerald-300">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">{c.description}</p>
                        </div>

                        {/* Color Swatches */}
                        <div className="flex items-center gap-1 shrink-0 bg-slate-950 p-1 border border-slate-700">
                          {c.colors.map((color, i) => (
                            <span
                              key={i}
                              className="w-2.5 h-2.5 border border-slate-900"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {activeTab === 'general' && (
            <>
              {/* SECTION: HAPTIC FEEDBACK */}
              <div className="space-y-2 p-3 bg-slate-950 border border-slate-800 pixel-bevel-raised">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Vibrate className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{t('Haptic Vibration')}</span>
                  </label>
                  <span className="text-[9px] font-mono font-bold text-cyan-300 bg-cyan-950 border border-cyan-500 px-1.5 py-0.5 pixel-bevel-cyan">
                    TOUCH FX
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const next = !haptics.getIsEnabled();
                    haptics.setIsEnabled(next);
                    if (next) haptics.mediumTap();
                    setHapticsState(next);
                  }}
                  className={`w-full p-2.5 border flex items-center justify-between gap-3 text-left transition-all cursor-pointer active:scale-95 ${
                    hapticsState
                      ? 'bg-cyan-950/60 border-cyan-400 text-white pixel-bevel-cyan'
                      : 'bg-slate-900 border-slate-800 text-slate-400 pixel-bevel-raised'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider text-white">
                        {hapticsState ? t('Vibration Enabled') : t('Vibration Disabled')}
                      </span>
                      <span
                        className={`text-[9px] font-mono font-black px-1.5 py-0.5 border ${
                          hapticsState
                            ? 'bg-cyan-400 text-slate-950 border-cyan-300'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {hapticsState ? 'ON' : 'OFF'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {t('Tactile vibration on penalty shots, goal celebrations, card draws, and key moments.')}
                    </p>
                  </div>

                  <div
                    className={`w-10 h-5 border transition-colors relative flex items-center px-0.5 ${
                      hapticsState ? 'bg-cyan-950 border-cyan-400' : 'bg-slate-800 border-slate-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-3.5 bg-white transition-transform ${
                        hapticsState ? 'translate-x-4 bg-cyan-300' : 'translate-x-0 bg-slate-500'
                      }`}
                    />
                  </div>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer - 32-Bit Arcade Confirm */}
        <div className="pt-2.5 border-t-2 border-slate-800 flex items-center justify-end shrink-0">
          <button
            id="graphic-settings-done-btn"
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 font-black font-mono text-xs uppercase tracking-wider border-2 border-amber-300 pixel-bevel-gold shadow-md cursor-pointer active:scale-95"
          >
            {t('Done') || 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
