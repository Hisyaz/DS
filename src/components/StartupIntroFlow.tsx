import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  Trophy,
  Star,
  Volume2,
  VolumeX,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  User,
  Check,
  Plus,
  Monitor,
  Layers,
  Lock,
  Cpu,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LanguageCode } from '../utils/localizationSystem';
import { useAudio } from '../context/AudioContext';
import { LanguageFlagCarousel } from './LanguageFlagCarousel';
import { hasTutorialPreference, setTutorialEnabled } from '../utils/tutorialSystem';
import { AnimatedDrawStarLogo } from './AnimatedDrawStarLogo';
import { ProfileAvatarColor, PROFILE_COLORS } from '../types/profile';
import { ProfileAvatar } from './ProfileAvatar';
import {
  runProfileRead,
  createProfile,
  setActiveProfile,
} from '../utils/profileSystem';
import { audioManager } from '../utils/audioSystem';
import { haptics } from '../utils/hapticsSystem';
import {
  useGraphicSettings,
  hasConfiguredInitialQuality,
  setGraphicSettings,
  GraphicQuality,
} from '../utils/graphicSettingsSystem';
import { detectDeviceHardware, DeviceHardwareProfile } from '../utils/hardwareTierDetector';

interface StartupIntroFlowProps {
  onComplete: () => void;
}

const COLOR_OPTIONS: ProfileAvatarColor[] = ['red', 'blue', 'yellow', 'white', 'black'];

export const StartupIntroFlow: React.FC<StartupIntroFlowProps> = ({ onComplete }) => {
  const { t, setLanguage } = useLanguage();
  const { isMuted, toggleMute, startIntroMusic, startMenuMusic, stopMusic } = useAudio();
  const { graphicSettings } = useGraphicSettings();

  const [step, setStep] = useState<
    'dev_message' | 'language_picker' | 'create_profile' | 'graphic_preset_prompt' | 'tutorial_prompt'
  >('dev_message');
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [selectedFlagCode, setSelectedFlagCode] = useState<string | null>(null);

  // Profile creation state
  const [newProfileName, setNewProfileName] = useState<string>('Striker');
  const [newProfileColor, setNewProfileColor] = useState<ProfileAvatarColor>('blue');

  // Graphic preset onboarding state
  const [hardwareProfile, setHardwareProfile] = useState<DeviceHardwareProfile>(() => detectDeviceHardware());
  const [selectedQuality, setSelectedQuality] = useState<GraphicQuality>('balanced');

  // Start intro soundtrack automatically once on mount
  const hasStartedMusicRef = useRef(false);
  useEffect(() => {
    if (!hasStartedMusicRef.current) {
      hasStartedMusicRef.current = true;
      startIntroMusic();
    }
  }, [startIntroMusic]);

  const handleAdvanceFromLogo = useCallback(() => {
    if (isFadingOut) return;
    setIsFadingOut(true);
    setTimeout(() => {
      setStep('language_picker');
      setIsFadingOut(false);
    }, 450);
  }, [isFadingOut]);

  const finishFlow = useCallback(() => {
    // 1. Immediately silence the epic intro music
    stopMusic();

    // 2. Smoothly complete the intro screen transition
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 500);

    // 3. Exactly 3 seconds of dramatic silence, then start regular menu/game soundtrack
    setTimeout(() => {
      startMenuMusic();
    }, 3000);
  }, [stopMusic, onComplete, startMenuMusic]);

  const proceedAfterProfileOrPreset = useCallback(() => {
    if (!hasConfiguredInitialQuality()) {
      setStep('graphic_preset_prompt');
      setIsFadingOut(false);
    } else if (!hasTutorialPreference()) {
      setStep('tutorial_prompt');
      setIsFadingOut(false);
    } else {
      finishFlow();
    }
  }, [finishFlow]);

  // Step 2 -> Step 3: Automatically read profile upon selecting language
  const handleConfirmLanguage = useCallback(
    (code: LanguageCode) => {
      if (selectedFlagCode) return; // Prevent duplicate clicks
      setSelectedFlagCode(code);
      setLanguage(code);

      setIsFadingOut(true);
      setTimeout(() => {
        // Read if there is an existing profile: if found, load it immediately. If not, prompt to create one!
        const readResult = runProfileRead();
        if (readResult.hasProfiles) {
          const profileToActivate = readResult.activeProfile || readResult.profiles[0];
          if (profileToActivate) {
            setActiveProfile(profileToActivate.id);
          }
          proceedAfterProfileOrPreset();
        } else {
          // No profile found: prompt user to create one
          setStep('create_profile');
          setIsFadingOut(false);
        }
      }, 350);
    },
    [selectedFlagCode, setLanguage, proceedAfterProfileOrPreset]
  );

  // Submit new profile creation
  const handleConfirmCreateProfile = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = newProfileName.trim();
      if (!trimmed) return;

      const lang = selectedFlagCode || 'en-GB';
      createProfile(trimmed, newProfileColor, lang);
      audioManager.playSfx('ui_confirm');
      haptics.success();

      // Proceed to Graphic Preset selection (first time for this profile) or tutorial selection
      setIsFadingOut(true);
      setTimeout(() => {
        proceedAfterProfileOrPreset();
      }, 350);
    },
    [newProfileName, newProfileColor, selectedFlagCode, proceedAfterProfileOrPreset]
  );

  // Confirm Graphic Preset (saved to profile settings and never asked again)
  const handleConfirmGraphicPreset = useCallback(() => {
    setGraphicSettings({
      quality: selectedQuality,
      hasChosenInitialQuality: true,
    });
    audioManager.playSfx('ui_confirm');
    haptics.success();

    setIsFadingOut(true);
    setTimeout(() => {
      if (!hasTutorialPreference()) {
        setStep('tutorial_prompt');
        setIsFadingOut(false);
      } else {
        finishFlow();
      }
    }, 350);
  }, [selectedQuality, finishFlow]);

  const handleSelectTutorial = useCallback((enabled: boolean) => {
    setTutorialEnabled(enabled);
    finishFlow();
  }, [finishFlow]);

  const qualityCardOptions: {
    id: GraphicQuality;
    title: string;
    badge: string;
    description: string;
    isLocked: boolean;
  }[] = [
    {
      id: 'performance',
      title: t('QUALITY_PERFORMANCE_TITLE') || 'Performance Mode (Low-Spec & Mobile)',
      badge: t('QUALITY_PERFORMANCE_BADGE') || '60+ FPS • Ultra-Fast',
      description:
        t('QUALITY_PERFORMANCE_DESC') ||
        'Optimized flat barebones styling for maximum responsiveness. Strips expensive blurs, scanlines, drop shadows, confetti cascades, and heavy GPU animation loops.',
      isLocked: false,
    },
    {
      id: 'balanced',
      title: t('QUALITY_BALANCED_TITLE') || 'Balanced Mode (32-Bit Arcade)',
      badge: t('QUALITY_BALANCED_BADGE') || 'Active Standard (60 FPS)',
      description:
        t('QUALITY_BALANCED_DESC') ||
        'Original 32-bit retro arcade aesthetic with stepped pixel bevels, CRT scanlines, and authentic audio-visual pacing.',
      isLocked: false,
    },
    {
      id: 'high',
      title: t('QUALITY_HIGH_QUALITY_TITLE') || 'High Quality Mode (Cyber-Arcade Glass)',
      badge: t('QUALITY_HIGH_QUALITY_BADGE') || '120 FPS • Max Fidelity',
      description:
        t('QUALITY_HIGH_QUALITY_DESC') ||
        'Deluxe visual overhaul with volumetric neon ambient glow, holographic foil card shimmer, interactive 3D tilt, and high-density celebration particle cascades.',
      isLocked: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 select-none overflow-y-auto overscroll-contain font-sans flex flex-col items-center justify-start sm:justify-center p-3 sm:p-4 min-h-screen">
      {/* Top right quick audio toggle */}
      <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-40">
        <button
          type="button"
          onClick={() => toggleMute()}
          className="p-2 sm:p-2.5 rounded-full bg-slate-900/80 border border-slate-700/60 text-slate-300 hover:text-white backdrop-blur-md cursor-pointer transition-all shadow-md"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>
      </div>

      {/* 🏟️ AUTHENTIC STADIUM BACKDROP: DEEP MIDNIGHT ARCADE STADIUM FOR INTRO LOGO, SILVER HEXAGONAL FOR CAROUSEL */}
      <div
        className={`fixed inset-0 z-0 overflow-hidden pointer-events-none transition-colors duration-1000 ${
          step === 'dev_message' ? 'bg-[#060c1c]' : 'bg-[#e3e7ec]'
        }`}
      >
        {step === 'dev_message' ? (
          <>
            {/* Retro Stadium Night Sky & Floodlight Beams */}
            <div className="absolute inset-0 opacity-50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/60 via-slate-950 to-black" />
            <div className="absolute -top-24 left-1/4 w-[550px] h-[550px] bg-blue-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
            <div className="absolute -top-24 right-1/4 w-[550px] h-[550px] bg-amber-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
            {/* Pixel Star Field */}
            <div
              className="absolute inset-0 opacity-60"
              style={{
                backgroundImage:
                  'radial-gradient(2px 2px at 20px 30px, #ffffff, rgba(0,0,0,0)), radial-gradient(2px 2px at 50px 80px, #fef08a, rgba(0,0,0,0)), radial-gradient(2px 2px at 110px 40px, #ffffff, rgba(0,0,0,0)), radial-gradient(3px 3px at 180px 140px, #facc15, rgba(0,0,0,0)), radial-gradient(2px 2px at 270px 70px, #ffffff, rgba(0,0,0,0)), radial-gradient(2px 2px at 360px 210px, #fef08a, rgba(0,0,0,0))',
                backgroundSize: '360px 260px',
              }}
            />
            {/* Center Stadium Floodlight Glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-80 bg-gradient-to-t from-emerald-950/40 via-sky-950/20 to-transparent blur-3xl" />
          </>
        ) : (
          <>
            {/* Hexagon Pattern Grid */}
            <div
              className="absolute inset-0 opacity-40 mix-blend-multiply"
              style={{
                backgroundImage: `radial-gradient(circle at 50% 50%, #ffffff 0%, rgba(220, 226, 235, 0.4) 60%, rgba(185, 195, 210, 0.8) 100%),
                  url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='138.56' viewBox='0 0 80 138.56'%3E%3Cpath d='M40 0 L80 23.09 L80 69.28 L40 92.37 L0 69.28 L0 23.09 Z M40 138.56 L80 115.47 L80 69.28 L40 46.19 L0 69.28 L0 115.47 Z' fill='none' stroke='%23b0bac8' stroke-width='1.2' stroke-opacity='0.45'/%3E%3C/svg%3E")`,
                backgroundSize: 'cover, 90px 156px',
                backgroundPosition: 'center center',
              }}
            />

            {/* Ambient Stadium Spotlights & Dust Particles */}
            <div className="absolute -top-32 left-1/4 w-96 h-96 bg-white/70 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-300/40 via-transparent to-white/60 pointer-events-none" />
          </>
        )}
      </div>

      {/* STEP 1: 32-BIT ANIMATED PIXEL DRAWSTAR LOGO & DEVELOPED BY HISYAZ */}
      {step === 'dev_message' && (
        <div
          className={`relative z-10 max-w-2xl w-full text-center flex flex-col items-center justify-center p-2 sm:p-4 my-auto transition-all duration-500 transform ${
            isFadingOut ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}
        >
          <AnimatedDrawStarLogo onAdvance={handleAdvanceFromLogo} />
        </div>
      )}

      {/* STEP 2: 32-BIT RETRO LANGUAGE SELECTION FLAG CAROUSEL */}
      {step === 'language_picker' && (
        <div className="relative z-10 max-w-5xl w-full flex flex-col items-center justify-center p-2 sm:p-4 my-auto animate-in fade-in duration-500">
          <LanguageFlagCarousel onConfirm={handleConfirmLanguage} />
        </div>
      )}

      {/* STEP 2.5: CREATE PROFILE (NAME & 5 COLOR CIRCLE PROFILE PICS) */}
      {step === 'create_profile' && (
        <div
          className={`relative z-10 max-w-md w-full my-auto p-4 sm:p-6 bg-slate-900/95 border-2 border-amber-500/80 pixel-bevel-gold pixel-corners shadow-[0_10px_50px_rgba(0,0,0,0.85)] text-white font-pixel flex flex-col items-center text-center space-y-4 sm:space-y-5 transition-all duration-400 transform max-h-[92vh] overflow-y-auto ${
            isFadingOut ? 'opacity-0 scale-95' : 'opacity-100 scale-100 animate-in fade-in zoom-in-95 duration-400'
          }`}
        >
          {/* Header */}
          <div className="flex flex-col items-center space-y-1.5 shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-950 border-2 border-amber-400/80 p-1 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" />
            </div>
            <h2 className="text-lg sm:text-2xl font-black font-arcade uppercase tracking-wide text-amber-300">
              {t('STARTUP_PROFILE_CREATE_TITLE') || 'Create Your Profile'}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-300 max-w-sm font-sans leading-relaxed">
              {t('STARTUP_PROFILE_CREATE_SUBTITLE') || 'Enter your profile name and pick an avatar color to begin.'}
            </p>
          </div>

          <form onSubmit={handleConfirmCreateProfile} className="w-full space-y-4 text-left">
            {/* Live Avatar Preview */}
            <div className="flex items-center justify-center gap-3.5 p-2.5 sm:p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
              <ProfileAvatar color={newProfileColor} size="lg" name={newProfileName} showGlow />
              <div className="text-left">
                <span className="font-arcade font-black text-sm sm:text-base text-white block">
                  {newProfileName.trim() || 'Player'}
                </span>
                <span className="text-[10px] font-pixel text-amber-400/90 capitalize">
                  {t(`PROFILE_COLOR_${newProfileColor.toUpperCase()}`) || PROFILE_COLORS[newProfileColor]?.label}
                </span>
              </div>
            </div>

            {/* Name Input */}
            <div className="space-y-1">
              <label className="block text-[11px] font-arcade uppercase tracking-wider text-amber-300 font-bold">
                {t('STARTUP_PROFILE_NAME_LABEL') || 'Profile Name'}
              </label>
              <input
                type="text"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value.slice(0, 16))}
                placeholder={t('STARTUP_PROFILE_NAME_PLACEHOLDER') || 'Enter player name...'}
                maxLength={16}
                required
                className="w-full px-3 py-2 bg-slate-950 border-2 border-amber-500/50 focus:border-amber-400 rounded-none text-white font-arcade text-sm outline-none transition"
              />
            </div>

            {/* Avatar Color Picker */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-arcade uppercase tracking-wider text-amber-300 font-bold">
                {t('STARTUP_PROFILE_COLOR_LABEL') || 'Avatar Color'}
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {COLOR_OPTIONS.map((col) => {
                  const config = PROFILE_COLORS[col];
                  const isSelected = newProfileColor === col;
                  return (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setNewProfileColor(col)}
                      className={`p-1.5 sm:p-2 rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-950/70 border-2 border-amber-400 scale-105 shadow-md shadow-amber-500/20'
                          : 'bg-slate-950 border border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="relative">
                        <ProfileAvatar color={col} size="sm" showGlow={isSelected} />
                        {isSelected && (
                          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow">
                            <Check className="w-2 h-2 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <span className="text-[8px] sm:text-[9px] font-pixel uppercase tracking-wide text-slate-300">
                        {t(`PROFILE_COLOR_${col.toUpperCase()}`) || config.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Confirm Button */}
            <div className="pt-2 sticky bottom-0 bg-slate-900/90 backdrop-blur pb-1">
              <button
                type="submit"
                className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-arcade font-black text-sm uppercase tracking-wider pixel-bevel-gold cursor-pointer shadow-lg active:scale-98 transition flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{t('STARTUP_PROFILE_CONFIRM_BTN') || 'Confirm Profile & Continue'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* STEP 2.75: INITIAL GRAPHIC PRESET ONBOARDING (BIG 3-BOX DISPLAY & HARDWARE SUMMARY) */}
      {step === 'graphic_preset_prompt' && (
        <div
          className={`relative z-10 max-w-3xl w-full my-auto p-4 sm:p-6 bg-slate-900/95 border-2 border-amber-500/80 pixel-bevel-gold pixel-corners shadow-[0_10px_50px_rgba(0,0,0,0.85)] text-white font-mono flex flex-col items-center text-center space-y-4 sm:space-y-5 transition-all duration-500 transform max-h-[92vh] overflow-y-auto ${
            isFadingOut ? 'opacity-0 scale-95' : 'opacity-100 scale-100 animate-in fade-in zoom-in-95 duration-400'
          }`}
        >
          {/* Header Icon & Title */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-950 border-2 border-amber-400/80 p-1 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Monitor className="w-6 h-6 text-amber-300" />
            </div>
            <h2 className="text-lg sm:text-2xl font-black font-arcade uppercase tracking-wide text-amber-300">
              {t('ONBOARDING_GRAPHIC_TITLE') || 'DISPLAY & PERFORMANCE PRESET'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-retro leading-relaxed">
              {t('ONBOARDING_GRAPHIC_SUBTITLE') ||
                'Based on a quick scan of your device, choose the visual preset that best fits your hardware. You can always change this later in Settings > Graphics.'}
            </p>
          </div>

          {/* Non-intrusive Hardware Summary Badge */}
          <div className="px-3.5 py-1.5 bg-slate-950/80 border border-slate-700/80 pixel-bevel-raised flex items-center gap-2 text-xs text-slate-300">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span className="font-arcade text-amber-300 text-[10px] uppercase">
              {t('ONBOARDING_DEVICE_DETECTED') || 'DETECTED HARDWARE'}:
            </span>
            <span className="text-[11px] text-slate-200 font-bold">{hardwareProfile.hardwareSummary}</span>
          </div>

          {/* 3 Large Boxes Describing Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 w-full text-left">
            {qualityCardOptions.map((opt) => {
              const isSelected = selectedQuality === opt.id;
              const isRecommended = hardwareProfile.recommendedQuality === opt.id;

              return (
                <div
                  key={opt.id}
                  onClick={() => {
                    if (!opt.isLocked) {
                      setSelectedQuality(opt.id);
                      haptics.buttonPress();
                    }
                  }}
                  className={`p-4 border-2 transition-all flex flex-col justify-between space-y-3 relative ${
                    opt.isLocked
                      ? 'bg-slate-950/70 border-slate-800 opacity-60 cursor-not-allowed pixel-bevel-raised'
                      : isSelected
                      ? 'bg-amber-950/80 border-amber-400 pixel-bevel-gold cursor-pointer shadow-lg shadow-amber-500/20 scale-[1.02]'
                      : 'bg-slate-950/90 hover:bg-slate-800/80 border-slate-700 hover:border-slate-500 pixel-bevel-raised cursor-pointer active:scale-98'
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Header Chips */}
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <span
                        className={`text-[8px] font-mono font-black px-1.5 py-0.5 border ${
                          opt.isLocked
                            ? 'bg-slate-900 text-slate-500 border-slate-800'
                            : 'bg-emerald-950 text-emerald-300 border-emerald-400'
                        }`}
                      >
                        {opt.badge}
                      </span>

                      {isRecommended && (
                        <span className="text-[8px] font-mono font-black px-1.5 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-400 animate-pulse">
                          RECOMMENDED
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-arcade font-bold text-sm sm:text-base text-white leading-tight">
                      {opt.title}
                    </h3>

                    {/* Description */}
                    <p className="text-[11px] text-slate-300 leading-relaxed font-retro">
                      {opt.description}
                    </p>
                  </div>

                  {/* Bottom selection state */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                    {isSelected ? (
                      <div className="flex items-center gap-1.5 text-amber-300 font-black">
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>SELECTED</span>
                      </div>
                    ) : opt.isLocked ? (
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Lock className="w-3.5 h-3.5" />
                        <span>DISABLED</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">TAP TO CHOOSE</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Confirm Button */}
          <button
            type="button"
            onClick={handleConfirmGraphicPreset}
            className="w-full max-w-md py-3 px-6 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 font-arcade font-black text-sm uppercase tracking-wider border-2 border-amber-300 pixel-bevel-gold shadow-lg cursor-pointer active:scale-95 transition flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{t('ONBOARDING_CONFIRM_BTN') || 'Confirm Preset & Continue'}</span>
          </button>
        </div>
      )}

      {/* STEP 3: TUTORIAL ON / OFF SELECTION (FIRST TIME ACCESS ONLY) */}
      {step === 'tutorial_prompt' && (
        <div
          className={`relative z-10 max-w-2xl w-full my-auto p-4 sm:p-7 bg-slate-900/95 border-2 border-amber-500/80 pixel-bevel-gold pixel-corners shadow-[0_10px_50px_rgba(0,0,0,0.85)] text-white font-pixel flex flex-col items-center text-center space-y-4 sm:space-y-6 transition-all duration-500 transform max-h-[92vh] overflow-y-auto ${
            isFadingOut ? 'opacity-0 scale-95' : 'opacity-100 scale-100 animate-in fade-in zoom-in-95 duration-400'
          }`}
        >
          {/* Header Icon & Title */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-lg shadow-amber-500/30 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <HelpCircle className="w-7 h-7 text-amber-400 animate-pulse" />
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-arcade uppercase tracking-wide text-amber-300">
              {t('TUTORIAL_SELECTION_TITLE') || 'Guided Tutorial System'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg font-retro leading-relaxed">
              {t('TUTORIAL_SELECTION_SUBTITLE') || 'Would you like interactive explanations to appear the first time you discover each game system?'}
            </p>
          </div>

          {/* Tutorial Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-left">
            {/* OPTION 1: TUTORIAL ON */}
            <button
              id="tutorial-choice-on-btn"
              type="button"
              onClick={() => handleSelectTutorial(true)}
              className="group p-4 bg-slate-950/80 hover:bg-slate-800/90 border-2 border-emerald-500/70 hover:border-emerald-400 pixel-corners pixel-bevel-raised transition-all cursor-pointer flex flex-col justify-between space-y-3 shadow-lg hover:shadow-emerald-500/20 active:translate-y-0.5"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-500/40 pixel-corners">
                    {t('TUTORIAL_ON_BADGE') || 'FIRST-TIME PLAYERS'}
                  </span>
                  <BookOpen className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-base sm:text-lg font-black font-arcade uppercase tracking-wide text-emerald-300">
                  {t('TUTORIAL_ON_TITLE') || 'TUTORIAL ON'}
                </div>
                <p className="text-[11px] text-slate-300 font-retro leading-relaxed">
                  {t('TUTORIAL_ON_DESC') || 'Explanations show the first time you see something (Card Store, Development, Matchdays). Can be toggled anytime.'}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono font-bold text-emerald-400 group-hover:text-emerald-300">
                <span>{t('TUTORIAL_CONFIRM_BTN') || 'Start Career'}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            {/* OPTION 2: TUTORIAL OFF */}
            <button
              id="tutorial-choice-off-btn"
              type="button"
              onClick={() => handleSelectTutorial(false)}
              className="group p-4 bg-slate-950/80 hover:bg-slate-800/90 border-2 border-slate-700 hover:border-slate-500 pixel-corners pixel-bevel-raised transition-all cursor-pointer flex flex-col justify-between space-y-3 shadow-lg hover:shadow-slate-700/20 active:translate-y-0.5"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase bg-slate-900 text-slate-400 border border-slate-700 pixel-corners">
                    {t('TUTORIAL_OFF_BADGE') || 'VETERAN MODE'}
                  </span>
                  <ShieldCheck className="w-4 h-4 text-slate-400 group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-base sm:text-lg font-black font-arcade uppercase tracking-wide text-slate-200 group-hover:text-white">
                  {t('TUTORIAL_OFF_TITLE') || 'TUTORIAL OFF'}
                </div>
                <p className="text-[11px] text-slate-400 font-retro leading-relaxed">
                  {t('TUTORIAL_OFF_DESC') || 'Play freely without introductory popups. All guides remain accessible anytime in the Game Wiki.'}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono font-bold text-slate-400 group-hover:text-white">
                <span>{t('TUTORIAL_CONFIRM_BTN') || 'Start Career'}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
