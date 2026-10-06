import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Music,
  Radio,
  X,
  ChevronDown,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import {
  audioManager,
  ALL_PLAYLISTS,
  PLAYLIST_ORDER,
  PlaylistId,
  SoundtrackPlaybackMode,
} from '../utils/audioSystem';
import { useLanguage } from '../context/LanguageContext';

interface CompactMusicPlayerButtonProps {
  className?: string;
}

export const CompactMusicPlayerButton: React.FC<CompactMusicPlayerButtonProps> = ({
  className = '',
}) => {
  const { t } = useLanguage();
  const {
    isMuted,
    volume,
    soundtrackMode,
    isPlaying,
    isStadiumMode,
    currentPlaylistId,
    currentPlaylist,
    currentTrack,
    toggleMute,
    setVolume,
    setSoundtrackMode,
    nextTrack,
    prevTrack,
    startMusic,
    stopMusic,
    setPlaylist,
  } = useAudio();

  const [isOpen, setIsOpen] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Track elapsed time updates (only when popover is open to eliminate background re-render churn)
  useEffect(() => {
    if (!isOpen || !isPlaying || isStadiumMode || isMuted) return;
    setElapsed(Math.floor(audioManager.getTrackElapsedTime()));
    const interval = window.setInterval(() => {
      setElapsed(Math.floor(audioManager.getTrackElapsedTime()));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isOpen, isPlaying, isStadiumMode, isMuted, currentTrack?.id]);

  // Click outside and Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleTogglePlayPause = () => {
    if (isPlaying) {
      stopMusic();
    } else {
      startMusic();
    }
  };

  const currentDuration = currentTrack?.durationSeconds || 150;
  const progressPercent = Math.min(100, Math.max(0, (elapsed / currentDuration) * 100));

  return (
    <div className="relative inline-block">
      {/* 32-BIT COMPACT TRIGGER BUTTON */}
      <button
        ref={buttonRef}
        id="soundtrack-compact-trigger-btn"
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`h-9 px-2.5 flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-100 border-2 border-emerald-500/80 hover:border-emerald-400 pixel-bevel-emerald shadow-md active:scale-95 cursor-pointer transition select-none ${className} ${
          isOpen ? 'ring-2 ring-emerald-400 bg-slate-800' : ''
        }`}
        title="32-Bit Soundtrack Player • Click to control playback, skip song, adjust volume"
        aria-label="Soundtrack Player Controls"
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4 text-rose-400 shrink-0" />
        ) : isStadiumMode ? (
          <Radio className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
        ) : isPlaying ? (
          <div className="flex items-end gap-[2px] h-3.5 px-0.5 shrink-0">
            <span
              className="w-[2px] bg-emerald-400 rounded-full animate-pulse"
              style={{ height: '55%', animationDuration: '380ms' }}
            />
            <span
              className="w-[2px] bg-emerald-400 rounded-full animate-pulse"
              style={{ height: '100%', animationDuration: '280ms' }}
            />
            <span
              className="w-[2px] bg-emerald-400 rounded-full animate-pulse"
              style={{ height: '75%', animationDuration: '340ms' }}
            />
            <span
              className="w-[2px] bg-emerald-400 rounded-full animate-pulse"
              style={{ height: '45%', animationDuration: '480ms' }}
            />
          </div>
        ) : (
          <Music className="w-4 h-4 text-slate-400 shrink-0" />
        )}

        <span className="font-arcade text-[10px] text-emerald-300 hidden xl:inline uppercase tracking-wide">
          {isMuted ? 'MUTED' : isPlaying ? 'AUDIO' : 'MUSIC'}
        </span>

        <ChevronDown
          className={`w-3 h-3 text-emerald-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* 32-BIT RETRO CONTROLLER POPOVER */}
      {isOpen && (
        <div
          ref={popoverRef}
          id="soundtrack-control-popover"
          className="absolute top-full right-0 mt-2 w-80 sm:w-88 bg-slate-950/98 border-2 border-emerald-500/80 pixel-bevel-emerald pixel-corners shadow-[0_15px_40px_rgba(0,0,0,0.85)] z-50 p-4 text-white font-pixel flex flex-col gap-3.5 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl"
        >
          {/* Popover Header */}
          <div className="flex items-center justify-between border-b border-emerald-500/40 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-emerald-950 border border-emerald-400/80 flex items-center justify-center pixel-bevel-emerald text-emerald-300">
                <Music className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-arcade font-black text-xs uppercase tracking-wider text-emerald-300">
                {t('SOUNDTRACK PLAYER') || '32-BIT SOUNDTRACK PLAYER'}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-6 h-6 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 pixel-bevel-raised flex items-center justify-center cursor-pointer transition"
              title="Close Player"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Current Track Display */}
          <div className="p-3 bg-slate-900/90 border border-emerald-500/50 rounded-lg space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-pixel text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 truncate">
                <span className="text-sm">{currentPlaylist?.flag || '⚽'}</span>
                <span className="truncate">{currentPlaylist?.name || 'Default Playlist'}</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400 shrink-0">
                {formatSeconds(elapsed)} / {formatSeconds(currentDuration)}
              </span>
            </div>

            <div className="font-arcade text-xs text-white font-bold truncate drop-shadow">
              {currentTrack?.title ? t(currentTrack.title) : 'Chiptune Stadium Theme'}
            </div>

            {/* Pixelated Progress Bar */}
            <div className="w-full h-1.5 bg-slate-950 rounded-none overflow-hidden border border-emerald-500/40">
              <div
                className="h-full bg-emerald-400 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Primary Playback Controls (Previous, Play/Pause, Next/Skip) */}
          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              id="soundtrack-popover-prev-btn"
              type="button"
              onClick={prevTrack}
              className="w-10 h-10 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-emerald-300 border-2 border-slate-700 hover:border-emerald-500 pixel-bevel-raised flex items-center justify-center cursor-pointer active:scale-95 transition"
              title="Previous Track"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              id="soundtrack-popover-playpause-btn"
              type="button"
              onClick={handleTogglePlayPause}
              className={`w-12 h-12 flex items-center justify-center text-slate-950 font-black cursor-pointer active:scale-95 transition shadow-lg border-2 ${
                isPlaying
                  ? 'bg-amber-400 hover:bg-amber-300 border-amber-200 pixel-bevel-gold'
                  : 'bg-emerald-400 hover:bg-emerald-300 border-emerald-200 pixel-bevel-emerald'
              }`}
              title={isPlaying ? 'Pause Soundtrack' : 'Play Soundtrack'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              id="soundtrack-popover-next-btn"
              type="button"
              onClick={nextTrack}
              className="w-10 h-10 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-emerald-300 border-2 border-slate-700 hover:border-emerald-500 pixel-bevel-raised flex items-center justify-center cursor-pointer active:scale-95 transition"
              title="Next Track (Skip Song)"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Volume Slider & Mute Toggle */}
          <div className="p-2.5 bg-slate-900/70 border border-slate-800 rounded-lg flex items-center gap-3">
            <button
              id="soundtrack-popover-mute-btn"
              type="button"
              onClick={() => toggleMute()}
              className="w-8 h-8 bg-slate-950 hover:bg-slate-850 border border-slate-700 text-slate-300 hover:text-white pixel-bevel-raised flex items-center justify-center shrink-0 cursor-pointer transition"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              )}
            </button>

            <div className="flex-1 flex flex-col gap-1">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                <span>VOLUME</span>
                <span className="text-emerald-300">{isMuted ? '0%' : `${Math.round(volume * 100)}%`}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setVolume(val);
                  if (isMuted && val > 0) {
                    toggleMute();
                  }
                }}
                className="w-full accent-emerald-400 h-1.5 bg-slate-950 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Soundtrack Playback Mode Selector */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-pixel text-slate-400 uppercase tracking-widest block">
              PLAYBACK MODE
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {(['immersive', 'play_all'] as SoundtrackPlaybackMode[]).map((mode) => {
                const isActive = soundtrackMode === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setSoundtrackMode(mode)}
                    className={`py-1.5 px-2 text-[10px] font-arcade uppercase tracking-wider border pixel-bevel-raised cursor-pointer transition ${
                      isActive
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-400 font-bold'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {mode === 'immersive' ? 'Immersive' : 'Play All 🎲'}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
