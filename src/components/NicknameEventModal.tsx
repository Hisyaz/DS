import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlayerCardData } from '../types';
import {
  getEffectivePlayerNickname,
  calculateEmbracedFullName,
  applyPlayerNickname,
  rejectPlayerNickname,
  applyStartingTypeNickname,
  rejectStartingTypeNickname,
  applyFeatNickname,
  rejectFeatNickname,
  extractPlayerFirstName,
  extractPlayerLastName,
  getPlayerHeightCm,
  isCurrentClubInBrazil,
  FeatNicknameConfig,
} from '../utils/nicknameSystem';
import { getStoredLanguage } from '../utils/localizationSystem';
import { useLanguage } from '../context/LanguageContext';
import { Sparkles, Megaphone, CheckCircle, XCircle, Trophy, Crown, User, ArrowRight, Star } from 'lucide-react';

export interface NicknameEventModalProps {
  isOpen: boolean;
  player: PlayerCardData;
  onAcceptNickname: (updatedPlayer: PlayerCardData) => void;
  onDeclineNickname: (updatedPlayer: PlayerCardData) => void;
  isExProTrigger?: boolean;
  featConfig?: FeatNicknameConfig | null;
  isStartingTypeTrigger?: boolean;
  startingNickname?: string | null;
  startingTypeName?: string | null;
  startingCityName?: string | null;
}

export const NicknameEventModal: React.FC<NicknameEventModalProps> = ({
  isOpen,
  player,
  onAcceptNickname,
  onDeclineNickname,
  isExProTrigger = false,
  featConfig = null,
  isStartingTypeTrigger = false,
  startingNickname = null,
  startingTypeName = null,
  startingCityName = null,
}) => {
  const { t } = useLanguage();
  const currentLang = getStoredLanguage();

  if (!isOpen) return null;

  const currentSub = player.subPosition || player.position || 'ST';
  const currentStyle = player.playStyle || 'Poacher';
  const heightCm = getPlayerHeightCm(player);
  const isClubInBrazil = isCurrentClubInBrazil(player);

  // Determine nickname and new matchday name
  const isStarting = Boolean(isStartingTypeTrigger && startingNickname);
  const isFeat = Boolean(featConfig);
  const nickname = isStarting && startingNickname
    ? startingNickname
    : isFeat && featConfig
    ? featConfig.nickname
    : getEffectivePlayerNickname(player, currentLang);

  const newFullName = calculateEmbracedFullName(player, nickname);
  const firstName = extractPlayerFirstName(player);
  const lastName = extractPlayerLastName(player);
  const currentFullName = player.name || `${firstName} ${lastName}`.trim() || 'Prodigy';

  // Check if player already has an active nickname
  const hasActiveNickname = Boolean(
    player.nickname &&
    player.nicknameAccepted &&
    player.nickname.trim() !== ''
  );
  const activeNickname = player.nickname || '';

  const handleAccept = () => {
    if (isStarting && startingNickname) {
      const updated = applyStartingTypeNickname(player, startingNickname);
      onAcceptNickname(updated);
    } else if (isFeat && featConfig) {
      const updated = applyFeatNickname(player, featConfig);
      onAcceptNickname(updated);
    } else {
      const updated = applyPlayerNickname(player, nickname);
      onAcceptNickname(updated);
    }
  };

  const handleDecline = () => {
    if (isStarting && startingNickname) {
      const updated = rejectStartingTypeNickname(player, startingNickname);
      onDeclineNickname(updated);
    } else if (isFeat && featConfig) {
      const updated = rejectFeatNickname(player, featConfig);
      onDeclineNickname(updated);
    } else {
      const updated = rejectPlayerNickname(player, nickname);
      onDeclineNickname(updated);
    }
  };

  // Localized, Starting Archetype, or Feat headline
  const headlineText = isStarting && startingNickname
    ? (t('NICKNAME_STARTING_HEADLINE', { nickname: startingNickname }) || t(`Fans are calling you "${startingNickname}"`) || `Fans are calling you "${startingNickname}"`).replace('{nickname}', startingNickname)
    : isFeat && featConfig
    ? `You've earned a new nickname: "${featConfig.nickname}"`
    : (t('NICKNAME_EVENT_HEADLINE') || 'Fans are calling you "{nickname}"').replace('{nickname}', nickname);

  const subtitleText = isStarting && startingNickname
    ? (t('NICKNAME_STARTING_SUBTITLE', { archetype: t(startingTypeName || 'Player') || startingTypeName || 'Player', city: startingCityName || 'the academy', nickname: startingNickname }) || t(`Based on your chosen ${startingTypeName || 'Player'} archetype in ${startingCityName || 'the academy'}, the local supporters and scouts have already given you a signature nickname!`) || `Based on your chosen ${startingTypeName || 'Player'} archetype in ${startingCityName || 'the academy'}, the local supporters and scouts have already given you a signature nickname!`)
        .replace('{archetype}', t(startingTypeName || 'Player') || startingTypeName || 'Player')
        .replace('{city}', startingCityName || 'the academy')
        .replace('{nickname}', startingNickname)
    : isFeat && featConfig
    ? featConfig.achievementDescription
    : (t('NICKNAME_EVENT_SUBTITLE') || "Your signature playstyle and unforgettable matches have ignited the stadium's imagination!");

  return (
    <AnimatePresence>
      <div
        id="nickname-event-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
      >
        <motion.div
          id="nickname-event-modal-container"
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`relative w-full max-w-xl bg-gradient-to-b ${
            isStarting
              ? 'from-slate-900 via-amber-950/30 to-slate-900 border-amber-500/50 shadow-[0_0_55px_rgba(245,158,11,0.3)]'
              : isFeat
              ? 'from-slate-900 via-amber-950/40 to-slate-900 border-amber-400 shadow-[0_0_60px_rgba(245,158,11,0.35)]'
              : 'from-slate-900 via-slate-900 to-indigo-950/90 border-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.25)]'
          } border rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-white overflow-hidden my-auto`}
        >
          {/* Ambient background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-32 bg-amber-500/20 blur-3xl pointer-events-none rounded-full" />
          <div className="absolute -bottom-10 right-0 w-48 h-48 bg-indigo-500/15 blur-3xl pointer-events-none rounded-full" />

          {/* Header Badge */}
          <div className="flex items-center justify-between mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-black uppercase tracking-wider shadow-sm">
              {isStarting ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>Archetype Nickname • {startingCityName || 'Academy'}</span>
                </>
              ) : isFeat ? (
                <>
                  <Crown className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>Feat Achievement • Career Milestone</span>
                </>
              ) : isExProTrigger ? (
                <>
                  <Megaphone className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>Heritage Reputation • Fan Chants</span>
                </>
              ) : (
                <>
                  <Megaphone className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>{t('NICKNAME_EVENT_TITLE') || 'Nickname Event'}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 text-[11px] font-bold">
              <Sparkles className="w-3 h-3 text-yellow-400" />
              <span>
                {isStarting
                  ? `${startingTypeName || 'Archetype'} • ${startingCityName || 'Academy'}`
                  : isFeat && featConfig
                  ? featConfig.title
                  : isClubInBrazil
                  ? heightCm < 175
                    ? `${heightCm} cm • Diminutivo (-inho)`
                    : heightCm > 185
                    ? `${heightCm} cm • Aumentativo (-ão)`
                    : `${currentSub} • ${currentStyle}`
                  : `${currentSub} • ${currentStyle}`}
              </span>
            </div>
          </div>

          {/* Headline */}
          <div className="text-center my-4">
            <div className="inline-block p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/25 to-yellow-600/15 border border-amber-400/40 mb-3 shadow-inner">
              {isFeat ? (
                <Trophy className="w-9 h-9 text-amber-300 animate-bounce" />
              ) : (
                <Trophy className="w-8 h-8 text-amber-300" />
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md">
              {headlineText}
            </h2>
            <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
              {subtitleText}
            </p>
          </div>

          {/* Visual Name Comparison Box */}
          <div className="my-5 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 shadow-inner flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div className="flex-1 w-full p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-center sm:justify-start gap-1">
                <User className="w-3 h-3 text-slate-400" />
                {hasActiveNickname ? 'Active Identity' : t('NICKNAME_CURRENT_NAME') || 'Current Identity'}
              </div>
              <div className="text-base font-bold text-slate-300 truncate">
                {currentFullName}
              </div>
              {hasActiveNickname && (
                <div className="text-[11px] text-amber-400/90 font-semibold mt-0.5">
                  Current Nickname: "{activeNickname}"
                </div>
              )}
            </div>

            <ArrowRight className="w-5 h-5 text-amber-400 shrink-0 hidden sm:block" />

            <div className="flex-1 w-full p-2.5 rounded-xl bg-gradient-to-r from-amber-950/40 to-yellow-950/30 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
              <div className="text-[10px] font-black text-amber-300 uppercase tracking-wider mb-1 flex items-center justify-center sm:justify-start gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                {t('NICKNAME_PROPOSED_NAME') || 'New Matchday Name'}
              </div>
              <div className="text-base font-black text-amber-200 truncate">
                {newFullName}
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">
                New Nickname: "{nickname}"
              </div>
            </div>
          </div>

          {/* Action Choices */}
          <div className="space-y-3 mt-6">
            {/* Accept / Replace Option */}
            <button
              id="nickname-accept-btn"
              onClick={handleAccept}
              className="w-full group text-left p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold transition-all shadow-lg hover:shadow-emerald-500/25 border border-emerald-400/50 flex items-start gap-3.5 cursor-pointer active:scale-[0.99]"
            >
              <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-400/40 text-emerald-300 shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-base font-black tracking-wide">
                    {hasActiveNickname ? 'REPLACE' : t('NICKNAME_EMBRACE_BTN') || 'Embrace It'}
                  </span>
                  <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-200 border border-emerald-400/30">
                    {nickname}
                  </span>
                </div>
                <p className="text-xs text-emerald-100/90 mt-1 font-normal leading-relaxed">
                  {isStarting
                    ? `Replace your first name with "${nickname}". Your last name ("${lastName || ''}") remains preserved. Saved to your Customization library.`
                    : hasActiveNickname
                    ? `Replace your active nickname ("${activeNickname}") with "${nickname}". Your last name ("${lastName || ''}") remains preserved.`
                    : t('NICKNAME_EMBRACE_DESC') ||
                      'Replace your first name with this nickname for your career. Your last name remains unchanged.'}
                </p>
              </div>
            </button>

            {/* Decline / Keep Current Option */}
            <button
              id="nickname-decline-btn"
              onClick={handleDecline}
              className="w-full group text-left p-3.5 sm:p-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white font-medium transition-all border border-slate-700 hover:border-slate-600 flex items-start gap-3.5 cursor-pointer active:scale-[0.99]"
            >
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                <XCircle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-base font-bold text-slate-200">
                  {isStarting
                    ? (t('NICKNAME_DISCARD_KEEP_BIRTH_NAME') || t('DISCARD / KEEP BIRTH NAME') || 'DISCARD / KEEP BIRTH NAME')
                    : hasActiveNickname
                    ? 'KEEP CURRENT'
                    : t('NICKNAME_IGNORE_BTN') || 'Ignore It'}
                </span>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {isStarting
                    ? (t('NICKNAME_STARTING_DISCARD_DESC', { nickname }) || t(`Discard "${nickname}" and retain your birth name. Saved to Customization so you can add it back later if you want.`) || `Discard "${nickname}" and retain your birth name. Saved to Customization so you can add it back later if you want.`).replace('{nickname}', nickname)
                    : hasActiveNickname
                    ? `Keep your current active nickname ("${activeNickname}"). Decline "${nickname}".`
                    : isFeat
                    ? `Decline "${nickname}" and retain your current name.`
                    : t('NICKNAME_IGNORE_DESC') ||
                      'Keep your original name permanently. You will not receive another regular nickname event.'}
                </p>
              </div>
            </button>
          </div>

          {/* Footer Notice */}
          <div className="text-center mt-5">
            <p className="text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1.5">
              {isStarting ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Notice: Discarded nicknames are stored in Customization and can be re-equipped at any time.</span>
                </>
              ) : isFeat ? (
                <>
                  <Star className="w-3.5 h-3.5 text-amber-500" />
                  <span>Feat Nicknames can be earned upon fulfilling legendary career achievements.</span>
                </>
              ) : (
                <span>{t('NICKNAME_ONCE_PER_CAREER_NOTICE') || '⚡ Notice: The regular nickname event can happen only once per career.'}</span>
              )}
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
