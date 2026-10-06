import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Globe, Check, X, Sparkles, FileCode, Lock, Flag } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { LanguageCode } from '../utils/localizationSystem';
import { LanguagePacketModal } from './LanguagePacketModal';
import { LanguageFlagCarousel } from './LanguageFlagCarousel';

interface LanguagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UPCOMING_LANGUAGES = [
  {
    code: 'de-DE',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    region: 'Deutschland & DACH',
  },
  {
    code: 'it-IT',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    region: 'Italia',
  },
  {
    code: 'ar-SA',
    name: 'Arabic (Saudi Arabia)',
    nativeName: 'العربية (السعودية)',
    flag: '🇸🇦',
    region: 'Saudi Arabia & Gulf',
  },
];

export const LanguagePickerModal: React.FC<LanguagePickerModalProps> = ({ isOpen, onClose }) => {
  const { currentLanguage, setLanguage, languagesList, t, isPacketLoaded, activePacket, hasPacketForLanguage } = useLanguage();
  const [notice, setNotice] = useState<string | null>(null);
  const [showPacketModal, setShowPacketModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'carousel' | 'list'>('carousel');

  if (!isOpen) return null;

  // Unified list of all languages: scrolling shows flag, name, and active/inactive status
  const allLanguages = [
    ...languagesList.map((lang) => ({
      code: lang.code,
      name: lang.name,
      nativeName: lang.nativeName,
      flag: lang.flag,
      region: lang.region,
      hasPacket: hasPacketForLanguage(lang.code),
    })),
    ...UPCOMING_LANGUAGES.map((lang) => ({
      code: lang.code,
      name: lang.name,
      nativeName: lang.nativeName,
      flag: lang.flag,
      region: lang.region,
      hasPacket: false,
    })),
  ];

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      style={{ touchAction: 'pan-y' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`bg-slate-900 border border-blue-500/40 rounded-2xl sm:rounded-3xl p-3 sm:p-5 w-full shadow-2xl space-y-3.5 text-left relative overflow-hidden my-auto max-h-[92vh] flex flex-col transition-all duration-300 ${
          activeTab === 'carousel' ? 'max-w-3xl' : 'max-w-md'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP SHIMMER LINE */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-500" />

        {/* HEADER: TITLE + TABS + PACKETS BUTTON + CLOSE BUTTON */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-400">
              <Globe className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                {t('NAV_SELECT_LANGUAGE') || 'Language'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isPacketLoaded
                  ? `${activePacket?.meta?.languageName || 'Packet Loaded'}`
                  : 'No Packet Loaded'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* VIEW MODE TOGGLE */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('carousel')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'carousel'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Carousel</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'list'
                    ? 'bg-blue-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>List</span>
              </button>
            </div>

            {/* SMALL PACKET BUTTON AT THE TOP */}
            <button
              type="button"
              onClick={() => setShowPacketModal(true)}
              className="px-2.5 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm hover:scale-[1.02] active:scale-95"
              title="Manage Language Packets (JSON)"
            >
              <FileCode className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-mono text-[11px] hidden sm:inline">Packets</span>
              {isPacketLoaded && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {notice && (
          <div className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold flex items-center gap-2 animate-in fade-in shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {/* TAB 1: 32-BIT RETRO FLAG CAROUSEL */}
        {activeTab === 'carousel' ? (
          <div className="py-2 flex-1 flex flex-col items-center justify-center">
            <LanguageFlagCarousel
              onConfirm={(code) => {
                setLanguage(code);
                onClose();
              }}
              onClose={onClose}
            />
          </div>
        ) : (
          /* TAB 2: SCROLLING LIST OF LANGUAGES & PACKET STATUS */
          <div className="space-y-2 flex-1 overflow-y-auto pr-1 custom-scrollbar max-h-[55vh]">
            {allLanguages.map((langItem) => {
              const isSelected = currentLanguage === langItem.code;
              const hasPacket = langItem.hasPacket;

              return (
                <button
                  key={langItem.code}
                  type="button"
                  disabled={!hasPacket}
                  onClick={() => {
                    if (!hasPacket) {
                      setNotice(`${langItem.name} has no Language Packet yet.`);
                      setTimeout(() => setNotice(null), 3000);
                      return;
                    }
                    setLanguage(langItem.code as LanguageCode);
                    onClose();
                  }}
                  className={`w-full p-3 rounded-xl border transition-all flex items-center justify-between gap-3 text-left ${
                    !hasPacket
                      ? 'bg-slate-950/40 border-slate-850 opacity-40 cursor-not-allowed select-none'
                      : isSelected
                      ? 'bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-blue-500 shadow-md shadow-blue-500/20 ring-1 ring-blue-500/40 cursor-pointer'
                      : 'bg-slate-950/70 hover:bg-slate-850 border-slate-800 hover:border-slate-700 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-2xl filter drop-shadow select-none ${!hasPacket ? 'grayscale-[60%]' : ''}`}>
                      {langItem.flag}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs sm:text-sm font-bold ${
                            !hasPacket
                              ? 'text-slate-500'
                              : isSelected
                              ? 'text-white'
                              : 'text-slate-200'
                          }`}
                        >
                          {langItem.nativeName}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          ({langItem.name})
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">
                        {langItem.region}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5">
                    {isSelected && hasPacket && (
                      <span className="text-[10px] font-mono font-bold bg-blue-500 text-slate-950 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                        <Check className="w-3 h-3 stroke-[3]" /> ACTIVE
                      </span>
                    )}
                    {hasPacket && !isSelected && (
                      <span className="text-[10px] font-mono font-bold bg-emerald-950/50 text-emerald-400 border border-emerald-800/40 px-2 py-0.5 rounded-md">
                        READY
                      </span>
                    )}
                    {!hasPacket && (
                      <span className="text-[9px] sm:text-[10px] font-mono font-bold bg-slate-900/80 text-slate-500 border border-slate-800 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5 text-slate-600" /> INACTIVE
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* BOTTOM NOTE */}
        <div className="p-2 bg-slate-950/50 rounded-xl border border-slate-800/80 text-[10px] font-mono text-slate-400 flex items-center gap-2 shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Languages require an installed packet to be selectable.</span>
        </div>
      </div>

      {/* LANGUAGE PACKET MODAL */}
      <LanguagePacketModal
        isOpen={showPacketModal}
        onClose={() => setShowPacketModal(false)}
      />
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
};

/**
 * Direct Language Packet Button for quick access to Packet Hub
 */
export const LanguagePacketButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isPacketLoaded } = useLanguage();

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        title="Universal Language Packet Hub (Load/Download/Edit game text)"
        className={`bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-indigo-500/50 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md hover:shadow-indigo-500/10 cursor-pointer ${className}`}
      >
        <FileCode className="w-4 h-4 text-indigo-400" />
        <span className="hidden sm:inline text-xs font-black uppercase">
          {isPacketLoaded ? 'PACKET' : 'NO PACKET'}
        </span>
        {isPacketLoaded && (
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        )}
      </button>

      <LanguagePacketModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};

/**
 * Top-Right Globe Button Component for navigation bars & menus
 */
export const LanguagePickerButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { languageInfo } = useLanguage();

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        title="Change Language / Cambiar Idioma"
        className={`h-9 px-2.5 bg-slate-900/90 hover:bg-slate-800 text-slate-100 border-2 border-blue-500/80 hover:border-blue-400 pixel-bevel-raised shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition select-none active:scale-95 ${className}`}
      >
        <Globe className="w-4 h-4 text-blue-400 shrink-0" />
        <span className="text-sm leading-none shrink-0">{languageInfo.flag}</span>
        <span className="hidden xl:inline text-[10px] font-mono text-slate-300 font-bold uppercase">{languageInfo.code}</span>
      </button>

      <LanguagePickerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
