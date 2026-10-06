import React, { useState } from 'react';
import { useProfile } from '../utils/profileSystem';
import { ProfileAvatar } from './ProfileAvatar';
import { ProfileModal } from './ProfileModal';
import { ChevronDown, UserPlus } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { audioManager } from '../utils/audioSystem';
import { haptics } from '../utils/hapticsSystem';

interface ProfileTopRightBadgeProps {
  className?: string;
  showToast?: (msg: string) => void;
  // If embedded in a flex header rather than fixed
  embedded?: boolean;
}

export const ProfileTopRightBadge: React.FC<ProfileTopRightBadgeProps> = ({
  className = '',
  showToast = (msg) => console.log(msg),
  embedded = false,
}) => {
  const { t } = useLanguage();
  const { activeProfile, profiles } = useProfile();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<'edit' | 'switch' | 'backup'>('edit');

  const handleClickBadge = () => {
    audioManager.playSfx('ui_click');
    haptics.selection();
    setModalTab('edit');
    setIsModalOpen(true);
  };

  if (!activeProfile && profiles.length === 0) {
    return null;
  }

  const badgeContent = (
    <button
      id="profile-top-right-btn"
      type="button"
      onClick={handleClickBadge}
      className={`group flex items-center gap-2 h-9 px-2 rounded-lg bg-slate-900/90 hover:bg-slate-850 text-slate-100 border-2 border-amber-500/80 hover:border-amber-400 pixel-bevel-gold shadow-md cursor-pointer transition-all duration-150 active:scale-95 select-none shrink-0 ${className}`}
      title={
        activeProfile
          ? `${activeProfile.name} • Click to Edit, Switch, or Download/Load Profile`
          : 'Player Profile'
      }
    >
      {activeProfile ? (
        <>
          <ProfileAvatar
            color={activeProfile.avatarColor}
            size="sm"
            name={activeProfile.name}
            showGlow
          />
          <div className="flex flex-col text-left leading-none max-w-[110px] sm:max-w-[140px] truncate">
            <span className="font-arcade font-bold text-xs text-white group-hover:text-amber-300 transition-colors truncate">
              {activeProfile.name}
            </span>
            <span className="text-[8px] font-pixel text-amber-400/90 uppercase tracking-widest mt-0.5">
              {t('PROFILE_LABEL') || 'PROFILE'}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-300 transition-transform group-hover:translate-y-0.5" />
        </>
      ) : (
        <div className="flex items-center gap-1.5 px-1 text-xs font-arcade text-amber-300">
          <UserPlus className="w-3.5 h-3.5" />
          <span>{t('PROFILE_CREATE_BTN') || 'Profile'}</span>
        </div>
      )}
    </button>
  );

  return (
    <>
      {embedded ? (
        badgeContent
      ) : (
        <div className="fixed top-2.5 right-14 sm:right-16 z-40 animate-in fade-in duration-300">
          {badgeContent}
        </div>
      )}

      {isModalOpen && (
        <ProfileModal
          isOpen={isModalOpen}
          initialTab={modalTab}
          onClose={() => setIsModalOpen(false)}
          showToast={showToast}
        />
      )}
    </>
  );
};
