import React, { useState, useRef } from 'react';
import {
  X,
  User,
  Palette,
  Users,
  Download,
  Upload,
  Check,
  Edit2,
  Trash2,
  Plus,
  Sparkles,
  Shield,
  Clock,
  Globe,
  Coins,
  FileCheck,
  AlertTriangle,
} from 'lucide-react';
import { UserProfile, ProfileAvatarColor, PROFILE_COLORS } from '../types/profile';
import { ProfileAvatar } from './ProfileAvatar';
import { useProfile } from '../utils/profileSystem';
import { useLanguage } from '../context/LanguageContext';
import { LANGUAGES, LanguageCode } from '../utils/localizationSystem';
import { audioManager } from '../utils/audioSystem';
import { haptics } from '../utils/hapticsSystem';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string) => void;
  initialTab?: 'edit' | 'switch' | 'backup';
}

const COLOR_OPTIONS: ProfileAvatarColor[] = ['red', 'blue', 'yellow', 'white', 'black'];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  showToast,
  initialTab = 'edit',
}) => {
  const { t, language } = useLanguage();
  const {
    activeProfile,
    profiles,
    createProfile,
    updateProfile,
    switchProfile,
    deleteProfile,
    downloadProfile,
    loadProfile,
  } = useProfile();

  const [activeTab, setActiveTab] = useState<'edit' | 'switch' | 'backup'>(initialTab);

  // Edit State
  const [editName, setEditName] = useState<string>(activeProfile?.name || '');
  const [editColor, setEditColor] = useState<ProfileAvatarColor>(activeProfile?.avatarColor || 'blue');

  // Create New Profile State (inside Switch tab)
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newColor, setNewColor] = useState<ProfileAvatarColor>('yellow');

  // Delete Confirmation State
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // File Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync edit state when activeProfile changes
  React.useEffect(() => {
    if (activeProfile) {
      setEditName(activeProfile.name);
      setEditColor(activeProfile.avatarColor);
    }
  }, [activeProfile]);

  if (!isOpen) return null;

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProfile) return;
    const trimmed = editName.trim();
    if (!trimmed) {
      showToast(t('PROFILE_NAME_REQUIRED') || 'Profile name cannot be empty.');
      return;
    }

    updateProfile(activeProfile.id, {
      name: trimmed,
      avatarColor: editColor,
    });

    audioManager.playSfx('ui_confirm');
    haptics.success();
    showToast(t('PROFILE_UPDATED_SUCCESS') || 'Profile updated successfully!');
  };

  const handleCreateNewProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) {
      showToast(t('PROFILE_NAME_REQUIRED') || 'Profile name cannot be empty.');
      return;
    }

    const created = createProfile(trimmed, newColor, language);
    audioManager.playSfx('ui_confirm');
    haptics.success();
    showToast(t('PROFILE_CREATED_SUCCESS') || `Profile "${created.name}" created and activated!`);
    setIsCreatingNew(false);
    setNewName('');
    setActiveTab('edit');
  };

  const handleSwitchTo = (profileId: string) => {
    if (profileId === activeProfile?.id) return;
    const success = switchProfile(profileId);
    if (success) {
      audioManager.playSfx('ui_confirm');
      haptics.selection();
      showToast(t('PROFILE_SWITCHED_SUCCESS') || 'Switched profile successfully!');
    }
  };

  const handleDelete = (profileId: string) => {
    if (profiles.length <= 1) {
      showToast(t('PROFILE_CANNOT_DELETE_LAST') || 'Cannot delete the only remaining profile.');
      return;
    }
    deleteProfile(profileId);
    setConfirmDeleteId(null);
    audioManager.playSfx('ui_card_discard');
    showToast(t('PROFILE_DELETED') || 'Profile deleted.');
  };

  const handleDownload = () => {
    if (!activeProfile) return;
    const ok = downloadProfile(activeProfile.id);
    if (ok) {
      audioManager.playSfx('ui_confirm');
      showToast(t('PROFILE_DOWNLOAD_SUCCESS') || 'Profile data downloaded successfully!');
    } else {
      showToast('Failed to export profile.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const result = loadProfile(content);
      if (result.success && result.profile) {
        audioManager.playSfx('ui_confirm');
        haptics.success();
        showToast(
          t('PROFILE_LOAD_SUCCESS') ||
            `Profile "${result.profile.name}" successfully loaded and activated!`
        );
        setActiveTab('edit');
      } else {
        showToast(result.error || 'Failed to load profile.');
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full sm:max-w-2xl bg-slate-900 border-0 sm:border-2 border-amber-500/80 pixel-bevel-gold pixel-corners shadow-[0_20px_60px_rgba(0,0,0,0.85)] text-slate-100 font-sans overflow-hidden flex flex-col h-full sm:h-auto sm:max-h-[92vh]">
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b-2 border-amber-500/50 bg-slate-950 shrink-0">
          <div className="flex items-center gap-3">
            {activeProfile && (
              <ProfileAvatar color={activeProfile.avatarColor} size="md" name={activeProfile.name} />
            )}
            <div>
              <h2 className="font-arcade font-black text-lg sm:text-xl uppercase tracking-wide text-amber-300">
                {t('PROFILE_MODAL_TITLE') || 'Player Profile'}
              </h2>
              <p className="text-[11px] font-pixel text-slate-400">
                {activeProfile ? activeProfile.name : t('NO_PROFILE_SELECTED') || 'No profile active'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 border border-slate-700 transition cursor-pointer font-arcade text-xs font-black uppercase"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">CLOSE</span>
          </button>
        </div>

        {/* TABS */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/60 px-3 sm:px-6 pt-2 shrink-0 overflow-x-auto no-scrollbar gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`pb-2 px-3 font-arcade font-black text-xs uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'edit'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>{t('PROFILE_TAB_EDIT') || 'Edit Profile'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('switch')}
            className={`pb-2 px-3 font-arcade font-black text-xs uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'switch'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{t('PROFILE_TAB_SWITCH') || 'Switch Profile'}</span>
            <span className="px-1.5 py-0.2 text-[9px] font-pixel bg-slate-800 rounded-full text-slate-300">
              {profiles.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`pb-2 px-3 font-arcade font-black text-xs uppercase tracking-wider flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'backup'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('PROFILE_TAB_BACKUP') || 'Download / Load'}</span>
          </button>
        </div>

        {/* CONTENT BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* ================= TAB 1: EDIT PROFILE ================= */}
          {activeTab === 'edit' && activeProfile && (
            <form onSubmit={handleSaveEdit} className="space-y-6">
              {/* Profile Card Preview */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center gap-4 shadow-inner">
                <ProfileAvatar color={editColor} size="xl" name={editName} />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[9px] font-pixel bg-amber-950 text-amber-300 border border-amber-500/50 rounded">
                      {t('PROFILE_ACTIVE_BADGE') || 'ACTIVE PROFILE'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ID: {activeProfile.id.slice(0, 14)}...
                    </span>
                  </div>
                  <h3 className="font-arcade font-black text-xl text-white truncate">
                    {editName || t('PROFILE_UNNAMED') || 'Unnamed Player'}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-300 font-pixel">
                    <span className="flex items-center gap-1 text-amber-300">
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      {(activeProfile.credits ?? 9999).toLocaleString()} Credits
                    </span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Globe className="w-3.5 h-3.5 text-cyan-400" />
                      {LANGUAGES[activeProfile.selectedLanguage as LanguageCode]?.flag || '🌐'}{' '}
                      {activeProfile.selectedLanguage}
                    </span>
                  </div>
                </div>
              </div>

              {/* Name Field */}
              <div className="space-y-2">
                <label className="block text-xs font-arcade uppercase tracking-wider text-amber-300 font-bold">
                  {t('PROFILE_NAME_LABEL') || 'Profile Name'}
                </label>
                <input
                  type="text"
                  maxLength={24}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder={t('PROFILE_NAME_PLACEHOLDER') || 'Enter player or profile name...'}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-lg text-white font-mono text-sm outline-none transition"
                  required
                />
                <span className="text-[10px] text-slate-400 font-mono block text-right">
                  {editName.length}/24
                </span>
              </div>

              {/* 5 Colors Circle Picker */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-arcade uppercase tracking-wider text-amber-300 font-bold">
                    {t('PROFILE_COLOR_LABEL') || 'Profile Picture Color (5 Styles)'}
                  </label>
                  <span className="text-[11px] font-pixel text-slate-400 capitalize">
                    {PROFILE_COLORS[editColor]?.label}
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-3 p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                  {COLOR_OPTIONS.map((col) => {
                    const isSelected = editColor === col;
                    const config = PROFILE_COLORS[col];
                    return (
                      <button
                        key={col}
                        type="button"
                        onClick={() => {
                          setEditColor(col);
                          audioManager.playSfx('ui_click');
                          haptics.selection();
                        }}
                        className={`group flex flex-col items-center gap-2 p-2 rounded-xl transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-800/80 border-2 border-amber-400 shadow-md scale-105'
                            : 'hover:bg-slate-800/40 border border-transparent'
                        }`}
                      >
                        <div className="relative">
                          <ProfileAvatar color={col} size="lg" showGlow={isSelected} />
                          {isSelected && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-[10px] font-pixel uppercase tracking-wide ${
                            isSelected ? 'text-amber-300 font-bold' : 'text-slate-400'
                          }`}
                        >
                          {t(`PROFILE_COLOR_${col.toUpperCase()}`) || config.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Save */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-arcade font-black text-xs uppercase tracking-wider pixel-bevel-gold flex items-center gap-2 cursor-pointer transition shadow-md active:scale-95"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{t('PROFILE_SAVE_BTN') || 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          )}

          {/* ================= TAB 2: SWITCH PROFILE ================= */}
          {activeTab === 'switch' && (
            <div className="space-y-5">
              {/* Header + Add Profile Trigger */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-pixel uppercase tracking-wide text-slate-300">
                  {t('PROFILE_SELECT_OR_CREATE') || 'Select profile or add a new one:'}
                </span>
                {!isCreatingNew && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingNew(true);
                      setNewName('');
                    }}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-arcade font-black text-xs uppercase tracking-wider pixel-bevel-cyan flex items-center gap-1.5 cursor-pointer shadow transition"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>{t('PROFILE_NEW_BTN') || '+ Add Profile'}</span>
                  </button>
                )}
              </div>

              {/* INLINE CREATE FORM */}
              {isCreatingNew && (
                <form
                  onSubmit={handleCreateNewProfile}
                  className="p-4 bg-slate-950/90 border-2 border-cyan-500/80 rounded-xl space-y-4 animate-in fade-in duration-200"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-arcade font-black text-sm text-cyan-300 uppercase tracking-wide">
                      {t('PROFILE_CREATE_TITLE') || 'Create New Profile'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsCreatingNew(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-pixel text-slate-300 block">
                      {t('PROFILE_NAME_LABEL') || 'Profile Name'}
                    </label>
                    <input
                      type="text"
                      maxLength={24}
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder={t('PROFILE_NAME_PLACEHOLDER') || 'Enter name...'}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-lg text-white font-mono text-sm outline-none"
                      required
                      autoFocus
                    />
                  </div>

                  {/* Color Circles */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-pixel text-slate-300 block">
                      {t('PROFILE_COLOR_LABEL') || 'Profile Picture Color'}
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {COLOR_OPTIONS.map((col) => {
                        const isSelected = newColor === col;
                        return (
                          <button
                            key={col}
                            type="button"
                            onClick={() => setNewColor(col)}
                            className={`flex flex-col items-center gap-1.5 p-2 rounded-lg cursor-pointer transition ${
                              isSelected
                                ? 'bg-slate-800 border-2 border-cyan-400'
                                : 'hover:bg-slate-900 border border-transparent'
                            }`}
                          >
                            <ProfileAvatar color={col} size="md" />
                            <span className="text-[9px] font-pixel uppercase text-slate-300">
                              {col}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCreatingNew(false)}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                    >
                      {t('CANCEL') || 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-arcade font-black text-xs uppercase tracking-wider pixel-bevel-cyan flex items-center gap-1.5 cursor-pointer shadow"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>{t('PROFILE_CONFIRM_BTN') || 'Confirm Profile'}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Profiles List */}
              <div className="space-y-2.5">
                {profiles.map((p) => {
                  const isActive = p.id === activeProfile?.id;
                  const isPendingDelete = confirmDeleteId === p.id;
                  return (
                    <div
                      key={p.id}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition ${
                        isActive
                          ? 'bg-amber-950/40 border-amber-500/70 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <ProfileAvatar color={p.avatarColor} size="lg" name={p.name} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-arcade font-black text-base text-white truncate">
                              {p.name}
                            </h4>
                            {isActive && (
                              <span className="px-2 py-0.5 text-[8px] font-pixel bg-amber-950 text-amber-300 border border-amber-500/60 rounded">
                                {t('PROFILE_ACTIVE_BADGE') || 'ACTIVE'}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-[11px] font-pixel text-slate-400 mt-1">
                            <span className="text-amber-300">
                              {(p.credits ?? 9999).toLocaleString()} Credits
                            </span>
                            <span>•</span>
                            <span>
                              {LANGUAGES[p.selectedLanguage as LanguageCode]?.flag || '🌐'}{' '}
                              {p.selectedLanguage}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        {!isActive && (
                          <button
                            type="button"
                            onClick={() => handleSwitchTo(p.id)}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-200 border border-slate-700 rounded-lg text-xs font-arcade font-bold uppercase transition cursor-pointer"
                          >
                            {t('PROFILE_SWITCH_BTN') || 'Switch'}
                          </button>
                        )}

                        {profiles.length > 1 && (
                          <>
                            {isPendingDelete ? (
                              <div className="flex items-center gap-1.5 bg-rose-950/90 border border-rose-600 px-2 py-1 rounded-lg">
                                <span className="text-[10px] text-rose-300 font-pixel">Delete?</span>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(p.id)}
                                  className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-bold rounded hover:bg-rose-500"
                                >
                                  Yes
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="px-1.5 py-0.5 text-slate-400 text-[10px]"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(p.id)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-850 transition"
                                title="Delete Profile"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= TAB 3: DOWNLOAD & LOAD ================= */}
          {activeTab === 'backup' && (
            <div className="space-y-6">
              {/* DOWNLOAD CARD */}
              <div className="p-4 sm:p-5 bg-slate-950/80 border-2 border-emerald-500/70 pixel-bevel-emerald rounded-xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-arcade font-black text-sm sm:text-base text-emerald-300 uppercase">
                      {t('PROFILE_DOWNLOAD_TITLE') || 'Download Profile Information'}
                    </h3>
                    <p className="text-xs text-slate-300 font-sans leading-relaxed">
                      {t('PROFILE_DOWNLOAD_DESC') ||
                        'Export this profile with all its tutorials, seen tutorials, card collection, credits, save files, language, and settings into a single portable JSON file.'}
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-arcade font-black text-xs uppercase tracking-wider pixel-bevel-emerald flex items-center gap-2 cursor-pointer shadow transition active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>{t('PROFILE_DOWNLOAD_BTN') || 'Download Profile JSON'}</span>
                  </button>
                </div>
              </div>

              {/* LOAD CARD */}
              <div className="p-4 sm:p-5 bg-slate-950/80 border-2 border-cyan-500/70 pixel-bevel-cyan rounded-xl space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shrink-0">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-arcade font-black text-sm sm:text-base text-cyan-300 uppercase">
                      {t('PROFILE_LOAD_TITLE') || 'Load Profile Information'}
                    </h3>
                    <p className="text-xs text-slate-300 font-sans leading-relaxed">
                      {t('PROFILE_LOAD_DESC') ||
                        'Import a previously downloaded profile JSON file. It will restore all stored tutorials, cards, credits, and saves, and set it as active.'}
                    </p>
                  </div>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-arcade font-black text-xs uppercase tracking-wider pixel-bevel-cyan flex items-center gap-2 cursor-pointer shadow transition active:scale-95"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{t('PROFILE_LOAD_BTN') || 'Select JSON File to Load'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
