import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  LanguageCode,
  LanguageInfo,
  LANGUAGES,
  getStoredLanguage,
  setStoredLanguage,
  subscribeLanguageChange,
  t,
} from '../utils/localizationSystem';
import {
  LanguagePacket,
  PacketValidationResult,
} from '../types/languagePacket';
import {
  getActiveLanguagePacket,
  isLanguagePacketLoaded,
  hasLanguagePacket,
  loadBuiltinLanguagePacket,
  loadLanguagePacket,
  unloadLanguagePacket,
  resetToDefaultUkEnglishPacket,
  resetToDefaultCastilianSpanishPacket,
  resetToDefaultArgentineanSpanishPacket,
  downloadLanguagePacketFile,
  exportLanguagePacketJson,
  validateLanguagePacket,
  subscribeLanguagePacket,
} from '../utils/languagePacketSystem';

interface LanguageContextType {
  currentLanguage: LanguageCode;
  language: LanguageCode;
  languageInfo: LanguageInfo;
  setLanguage: (code: LanguageCode) => boolean;
  t: (key: string, params?: Record<string, string | number>) => string;
  languagesList: LanguageInfo[];
  // Universal Language Packet Engine
  activePacket: LanguagePacket | null;
  isPacketLoaded: boolean;
  hasPacketForLanguage: (code: string) => boolean;
  loadPacket: (packet: LanguagePacket) => { success: boolean; message: string; keyCount: number };
  loadBuiltinPacket: (code: string) => boolean;
  unloadPacket: () => void;
  resetPacket: () => void;
  resetToCastilianSpanish: () => void;
  resetToArgentineanSpanish: () => void;
  downloadPacket: (packet?: LanguagePacket) => void;
  exportPacketJson: (packet?: LanguagePacket) => string;
  validatePacket: (data: any) => PacketValidationResult;
}

const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: 'es-ES',
  language: 'es-ES',
  languageInfo: LANGUAGES['es-ES'],
  setLanguage: () => false,
  t: (key, params) => t(key, params),
  languagesList: Object.values(LANGUAGES),
  activePacket: getActiveLanguagePacket(),
  isPacketLoaded: isLanguagePacketLoaded(),
  hasPacketForLanguage: (code) => hasLanguagePacket(code),
  loadPacket: () => ({ success: false, message: 'Not initialized', keyCount: 0 }),
  loadBuiltinPacket: () => false,
  unloadPacket: () => {},
  resetPacket: () => {},
  resetToCastilianSpanish: () => {},
  resetToArgentineanSpanish: () => {},
  downloadPacket: () => {},
  exportPacketJson: () => '',
  validatePacket: () => ({ valid: false }),
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<LanguageCode>(getStoredLanguage());
  const [packet, setPacket] = useState<LanguagePacket | null>(() => getActiveLanguagePacket());

  useEffect(() => {
    const unsubLang = subscribeLanguageChange((newLang) => {
      setLang(newLang);
    });
    const unsubPacket = subscribeLanguagePacket((newPacket) => {
      setPacket(newPacket ? { ...newPacket } : null);
    });
    return () => {
      unsubLang();
      unsubPacket();
    };
  }, []);

  const handleSetLanguage = useCallback((code: LanguageCode): boolean => {
    if (!hasLanguagePacket(code)) {
      console.warn(`Cannot select language ${code}: No language packet available.`);
      return false;
    }
    setStoredLanguage(code);
    // If there is a builtin packet matching this language code, activate it
    loadBuiltinLanguagePacket(code);
    return true;
  }, []);

  const value = useMemo<LanguageContextType>(() => ({
    currentLanguage: lang,
    language: lang,
    languageInfo: LANGUAGES[lang] || LANGUAGES['en-GB'],
    setLanguage: handleSetLanguage,
    t: (key, params) => t(key, params),
    languagesList: Object.values(LANGUAGES),
    activePacket: packet,
    isPacketLoaded: packet !== null && packet.translations !== undefined,
    hasPacketForLanguage: hasLanguagePacket,
    loadPacket: loadLanguagePacket,
    loadBuiltinPacket: loadBuiltinLanguagePacket,
    unloadPacket: unloadLanguagePacket,
    resetPacket: resetToDefaultUkEnglishPacket,
    resetToCastilianSpanish: resetToDefaultCastilianSpanishPacket,
    resetToArgentineanSpanish: resetToDefaultArgentineanSpanishPacket,
    downloadPacket: downloadLanguagePacketFile,
    exportPacketJson: exportLanguagePacketJson,
    validatePacket: validateLanguagePacket,
  }), [lang, packet, handleSetLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);

