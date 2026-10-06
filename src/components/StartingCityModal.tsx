import React, { useState } from 'react';
import { STARTING_CITIES, StartingCityOption } from '../constants';
import { Building2, MapPin, Check, Sparkles, ArrowRight, Flag, Clock, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { translateNationality } from '../utils/localizationSystem';
import { getLocalizedStartingCities } from '../utils/gameVocabulary';
import { ChoiceSystem } from './ChoiceSystem';

interface StartingCityModalProps {
  isOpen: boolean;
  onConfirmCity: (city: StartingCityOption) => void;
}

export const StartingCityModal: React.FC<StartingCityModalProps> = ({
  isOpen,
  onConfirmCity,
}) => {
  const { t, language } = useLanguage();
  const [phase, setPhase] = useState<'intro' | 'selection'>('intro');
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  if (!isOpen) return null;

  // Authoritative localized city entries for chosen language
  const localizedCities = getLocalizedStartingCities(STARTING_CITIES, language);
  const currentCity = localizedCities[currentIndex] || localizedCities[0];
  const selectableCities = localizedCities.filter((c) => !c.isUpcoming);

  return (
    <>
      {/* ========================================================================= */}
      {/* PHASE 1: PRE-SELECTION INTRO STAGE (32-BIT RETRO BRIEFING) */}
      {/* ========================================================================= */}
      {phase === 'intro' && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/95 flex items-center justify-center p-3 sm:p-6 overflow-y-auto overscroll-contain animate-in fade-in duration-150 select-none">
          {/* Scanlines */}
          <div className="absolute inset-0 pointer-events-none pixel-scanlines opacity-40" />

          <div className="w-full max-w-xl bg-slate-900 border-2 border-emerald-500/80 pixel-bevel-emerald p-5 sm:p-7 shadow-[0_0_30px_rgba(16,185,129,0.3)] flex flex-col items-center text-center space-y-4 text-white relative overflow-hidden my-auto animate-in zoom-in-95 duration-150">
            {/* Step Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950 border border-emerald-400 pixel-bevel-emerald text-emerald-300 font-mono text-xs font-black uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('CITY_MODAL_BADGE')}</span>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-wider uppercase pixel-text-shadow">
                {t('CITY_MODAL_TITLE')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-md mx-auto">
                {t('CITY_MODAL_SUBTITLE')}
              </p>
            </div>

            {/* Key Info Highlights in 32-bit Dossier Panels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left">
              <div className="bg-slate-950 border border-slate-700 pixel-bevel-raised p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-black text-emerald-400 uppercase font-mono">
                  <Flag className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{t('CITY_MODAL_NATIONALITY_COUNTRY')}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal font-mono">
                  {t('CITY_MODAL_NATIONALITY_COUNTRY_DESC')}
                </p>
              </div>

              <div className="bg-slate-950 border border-slate-700 pixel-bevel-raised p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-black text-teal-400 uppercase font-mono">
                  <Building2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>{t('CITY_MODAL_YOUTH_CLUBS')}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal font-mono">
                  {t('CITY_MODAL_YOUTH_CLUBS_DESC')}
                </p>
              </div>
            </div>

            {/* Available Cities Count Banner */}
            <div className="w-full bg-slate-950 border border-emerald-600/50 pixel-bevel-emerald p-3 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-emerald-900 border border-emerald-500 text-emerald-300 flex items-center justify-center font-black text-sm shrink-0">
                  <Globe className="w-5 h-5 text-emerald-300" />
                </div>
                <div className="text-left font-mono">
                  <div className="font-black text-white text-xs">{STARTING_CITIES.length} {t('CITY_MODAL_GLOBAL_HUBS')}</div>
                  <div className="text-[10px] text-slate-400">
                    {selectableCities.length} {t('CITY_MODAL_ACTIVE_ORIGINS')} • {STARTING_CITIES.length - selectableCities.length} {t('CITY_MODAL_COMING_SOON')}
                  </div>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-500 text-emerald-300 font-mono font-black text-[10px]">
                {t('CITY_MODAL_STEP_1_OF_4')}
              </span>
            </div>

            {/* 32-Bit Action Button */}
            <button
              type="button"
              onClick={() => setPhase('selection')}
              className="w-full min-h-[48px] bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:brightness-110 text-slate-950 font-mono font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-emerald-300 pixel-bevel-emerald shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all cursor-pointer active:scale-95"
            >
              <span>{t('CITY_MODAL_BROWSE_BTN')}</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PHASE 2: 32-BIT RESPONSIVE CITY CHOICE SYSTEM */}
      {/* ========================================================================= */}
      {phase === 'selection' && (
        <ChoiceSystem
          isOpen={isOpen}
          totalChoices={STARTING_CITIES.length}
          currentIndex={currentIndex}
          onNavigate={setCurrentIndex}
          onConfirm={() => {
            if (!currentCity.isUpcoming) {
              onConfirmCity(currentCity);
            }
          }}
          title={currentCity.cityName}
          subtitle={`${currentCity.countryName} • ${translateNationality(currentCity.nationality.name)}`}
          selectorLabel={t('CITY_MODAL_CITY_OF', { current: currentIndex + 1, total: STARTING_CITIES.length })}
          themeColor="#10b981"
          accentGradient="from-emerald-400 via-teal-300 to-emerald-500"
          categoryBadge={
            <span className="px-2 py-0.5 text-[10px] font-mono font-black uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-500 pixel-bevel-emerald">
              {t('CITY_MODAL_ORIGIN_BADGE', { code: currentCity.nationality.code })}
            </span>
          }
          topActions={
            <button
              type="button"
              onClick={() => setPhase('intro')}
              className="text-[10px] sm:text-xs text-slate-300 hover:text-white font-mono font-bold px-2.5 py-1 bg-slate-950 border border-slate-700 pixel-bevel-raised shrink-0 cursor-pointer active:scale-95"
            >
              {t('CITY_MODAL_INFO')}
            </button>
          }
          confirmDisabled={Boolean(currentCity.isUpcoming)}
          confirmLabel={
            currentCity.isUpcoming
              ? t('CITY_MODAL_COMING_SOON')
              : t('CITY_MODAL_START_IN', { cityName: currentCity.cityName.toUpperCase() })
          }
          confirmIcon={<Check className="w-5 h-5 stroke-[3]" />}
        >
          {/* Centered 32-Bit City Visual Card */}
          <div className="w-full max-w-xl mx-auto flex flex-col items-center">
            <div
              className={`relative w-full border-2 overflow-hidden shadow-2xl transition-all duration-200 ${
                currentCity.isUpcoming
                  ? 'border-slate-800 bg-slate-900 pixel-bevel-raised'
                  : 'border-emerald-500 bg-slate-900 pixel-bevel-emerald shadow-[0_0_25px_rgba(16,185,129,0.35)]'
              }`}
            >
              {/* Retro Hero Panoramic Image Banner */}
              <div className="relative w-full h-40 sm:h-52 overflow-hidden border-b-2 border-slate-800">
                <img
                  src={currentCity.imageUrl}
                  alt={currentCity.cityName}
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-cover object-center scale-105 transition-all duration-300 ${
                    currentCity.isUpcoming ? 'grayscale contrast-125 brightness-75' : ''
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-transparent to-transparent" />

                {/* Top Floating Badges inside Image */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 z-10">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-950/90 border border-slate-700 text-white text-xs font-mono font-black pixel-bevel-raised">
                    <span>{currentCity.nationality.code}</span>
                    <span className="text-slate-500">|</span>
                    <span className="text-slate-300">{currentCity.countryName}</span>
                  </div>

                  {currentCity.isUpcoming ? (
                    <span className="px-2.5 py-1 bg-zinc-950/90 text-amber-300 border border-amber-500/80 text-[10px] sm:text-xs font-mono font-black uppercase tracking-wider flex items-center gap-1 pixel-bevel-gold">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{t('CITY_MODAL_COMING_SOON')}</span>
                    </span>
                  ) : currentCity.statModifier ? (
                    <span className="px-2.5 py-1 bg-emerald-950/90 text-emerald-300 border border-emerald-400 text-xs font-mono font-black tracking-wider flex items-center gap-1 pixel-bevel-emerald shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{currentCity.statModifier.label}</span>
                    </span>
                  ) : null}
                </div>

                {/* City Title with Retro Typography */}
                <div className="absolute bottom-2.5 left-3.5 right-3.5 z-10">
                  <h2 className={`text-2xl sm:text-3xl font-black uppercase tracking-wider font-mono ${currentCity.isUpcoming ? 'text-slate-300' : 'text-emerald-300'} pixel-text-shadow`}>
                    {currentCity.cityName}
                  </h2>
                  <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono font-medium">
                    <MapPin className={`w-3.5 h-3.5 ${currentCity.isUpcoming ? 'text-slate-400' : 'text-emerald-400'} shrink-0`} />
                    <span className="truncate">{currentCity.landmark}</span>
                  </div>
                </div>
              </div>

              {/* 32-Bit Card Body Information */}
              <div className="p-3.5 sm:p-4 space-y-3 text-left font-mono">
                {/* Culture & Origin Description */}
                <div className="p-3 bg-slate-950 border border-slate-800 pixel-bevel-raised space-y-1">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block">
                    {t('CITY_MODAL_CULTURE_ROOTS')}
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed font-normal">
                    {currentCity.description}
                  </p>
                </div>

                {/* Feature Grid: Nationality & Youth Pathways */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="p-2.5 bg-slate-950 border border-slate-800 pixel-bevel-raised space-y-0.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-300 uppercase">
                      <Flag className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{t('CITY_MODAL_NATIONAL_ORIGIN')}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {t('CITY_MODAL_NATIONAL_ORIGIN_DESC', {
                        country: translateNationality(currentCity.nationality.name),
                        code: currentCity.nationality.code,
                      })}
                    </p>
                  </div>

                  <div className="p-2.5 bg-slate-950 border border-slate-800 pixel-bevel-raised space-y-0.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-300 uppercase">
                      <Building2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span>{t('CITY_MODAL_YOUTH_NETWORK')}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {t('CITY_MODAL_YOUTH_NETWORK_DESC')}
                    </p>
                  </div>
                </div>

                {/* Stat Bonus Highlight Banner */}
                {currentCity.statModifier && (
                  <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/50 pixel-bevel-emerald flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-emerald-900 border border-emerald-400 text-emerald-300 flex items-center justify-center font-black text-xs">
                        ★
                      </div>
                      <div>
                        <div className="text-xs font-black text-white">{t('CITY_MODAL_ATTR_BOOST')}</div>
                        <div className="text-[10px] text-emerald-300">{t('CITY_MODAL_PERMANENT_MODIFIER')}</div>
                      </div>
                    </div>
                    <div className="px-2 py-0.5 bg-emerald-900 border border-emerald-400 text-emerald-200 font-mono font-black text-xs">
                      {currentCity.statModifier.label}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ChoiceSystem>
      )}
    </>
  );
};
