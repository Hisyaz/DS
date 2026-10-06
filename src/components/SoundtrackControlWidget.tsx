import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  SkipForward,
  SkipBack,
  Music,
  Radio,
  ListMusic,
  Sparkles,
  Globe,
  Flame,
  ChevronDown,
  X,
  Keyboard,
  Settings,
  Check,
  Lock,
  Unlock,
  Play,
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';
import {
  ALL_PLAYLISTS,
  PLAYLIST_ORDER,
  PlaylistId,
  SoundtrackPlaybackMode,
  audioManager,
} from '../utils/audioSystem';
import { isGameNavEnabled, toggleGameNav } from '../utils/gameNavigation';
import { t } from '../utils/localizationSystem';

interface SoundtrackControlWidgetProps {
  compact?: boolean;
  className?: string;
}

export const SoundtrackControlWidget: React.FC<SoundtrackControlWidgetProps> = ({
  compact = false,
  className = '',
}) => {
  const {
    isMuted,
    volume,
    soundtrackMode,
    isPlaying,
    isStadiumMode,
    currentPlaylistId,
    currentPlaylist,
    currentPlaylistTracks,
    currentTrack,
    toggleMute,
    setVolume,
    setSoundtrackMode,
    nextTrack,
    prevTrack,
    setTrack,
    setPlaylist,
    isTrackEnabled,
    setTrackEnabled,
    enableAllTracks,
    disableAllTracks,
    lockedPlaylistId,
    setLockedPlaylist,
  } = useAudio();

  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [activeTab, setActiveTab] = useState<'tracks' | 'playlists' | 'settings'>('tracks');
  const [settingsPlaylistId, setSettingsPlaylistId] = useState<PlaylistId>(currentPlaylistId);
  const [elapsed, setElapsed] = useState(0);
  const [navEnabled, setNavEnabled] = useState(() => isGameNavEnabled());
  const popoverRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleNavToggle = (e: Event) => {
      const custom = e as CustomEvent<{ enabled: boolean }>;
      if (custom.detail) {
        setNavEnabled(custom.detail.enabled);
      }
    };
    window.addEventListener('drawstar:nav-toggle', handleNavToggle);
    return () => window.removeEventListener('drawstar:nav-toggle', handleNavToggle);
  }, []);

  // Smooth timer tick for elapsed progress (only when control popover is open)
  useEffect(() => {
    if (!showVolumeSlider || !isPlaying || isStadiumMode || isMuted) return;
    setElapsed(Math.floor(audioManager.getTrackElapsedTime()));
    const interval = window.setInterval(() => {
      setElapsed(Math.floor(audioManager.getTrackElapsedTime()));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [showVolumeSlider, isPlaying, isStadiumMode, isMuted, currentTrack?.id]);

  // Click outside to close the menu cleanly without closing on hover
  useEffect(() => {
    if (!showVolumeSlider) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        widgetRef.current &&
        !widgetRef.current.contains(event.target as Node)
      ) {
        setShowVolumeSlider(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showVolumeSlider]);

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      ref={widgetRef}
      id="soundtrack-control-widget"
      className={`relative inline-flex items-center gap-1.5 bg-slate-950/90 border border-slate-700/60 rounded-full px-2.5 py-1 text-xs backdrop-blur-md shadow-lg select-none transition-all duration-200 ${className}`}
    >
      {/* Equalizer / Mode Icon Button */}
      <button
        id="soundtrack-mute-toggle-btn"
        type="button"
        onClick={() => toggleMute()}
        className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors cursor-pointer outline-none shrink-0"
        title={isMuted ? 'Unmute Audio (16-Bit Super Soundtrack)' : 'Mute Audio'}
      >
        {isMuted ? (
          <VolumeX className="w-3.5 h-3.5 text-rose-400" />
        ) : isStadiumMode ? (
          <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        ) : (
          <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
        )}

        {/* Animated 16-bit Equalizer Wave */}
        {!isMuted && isPlaying && (
          <div className="flex items-end gap-[2px] h-3 px-0.5">
            <span
              className={`w-[2px] rounded-full animate-pulse ${
                isStadiumMode ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ height: '60%', animationDuration: '380ms' }}
            />
            <span
              className={`w-[2px] rounded-full animate-pulse ${
                isStadiumMode ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ height: '100%', animationDuration: '280ms' }}
            />
            <span
              className={`w-[2px] rounded-full animate-pulse ${
                isStadiumMode ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ height: '75%', animationDuration: '340ms' }}
            />
            <span
              className={`w-[2px] rounded-full animate-pulse ${
                isStadiumMode ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ height: '40%', animationDuration: '480ms' }}
            />
          </div>
        )}
      </button>

      {/* Track & Playlist Badge */}
      {!compact && (
        <button
          id="soundtrack-track-info-trigger"
          type="button"
          className="flex items-center gap-1.5 max-w-[150px] sm:max-w-[230px] truncate cursor-pointer hover:opacity-90 transition-opacity bg-transparent border-0 p-0 text-left"
          onClick={(e) => {
            e.stopPropagation();
            setShowVolumeSlider((prev) => !prev);
          }}
          title="Click to view playlists, tracks and adjust volume"
        >
          {isStadiumMode ? (
            <span className="font-mono font-bold text-[10px] text-amber-300 truncate uppercase">
              🏟️ Stadium Atmosphere
            </span>
          ) : (
            <span className="font-mono text-[10px] text-slate-200 truncate flex items-center gap-1">
              <span className="shrink-0 text-xs">{currentPlaylist.flag}</span>
              <span className="truncate font-semibold text-white">{t(currentTrack.title)}</span>
              <span className="text-[9px] text-slate-400 font-mono hidden sm:inline">
                ({formatSeconds(elapsed)}/2:30)
              </span>
              <ChevronDown className={`w-2.5 h-2.5 text-slate-400 shrink-0 ml-0.5 transition-transform duration-200 ${showVolumeSlider ? 'rotate-180 text-emerald-400' : ''}`} />
            </span>
          )}
        </button>
      )}

      {/* Prev / Next Track Buttons */}
      {!isStadiumMode && !isMuted && (
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            id="soundtrack-prev-track-btn"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prevTrack();
            }}
            className="p-0.5 text-slate-400 hover:text-white transition-colors cursor-pointer outline-none"
            title="Previous 16-Bit Track"
          >
            <SkipBack className="w-3 h-3" />
          </button>
          <button
            id="soundtrack-next-track-btn"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nextTrack();
            }}
            className="p-0.5 text-slate-400 hover:text-white transition-colors cursor-pointer outline-none"
            title="Next 16-Bit Track (Auto-cycles every 2:30)"
          >
            <SkipForward className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Interactive Floating Playlist & Volume Drawer */}
      {showVolumeSlider && (() => {
        const safeVol = typeof volume === 'number' && !isNaN(volume) ? volume : 0.65;
        return (
          <div
            ref={popoverRef}
            id="soundtrack-control-popover"
            className="absolute top-full left-0 mt-2 bg-slate-950 border border-slate-700/80 rounded-xl p-3 shadow-2xl z-50 flex flex-col gap-2.5 min-w-[280px] max-w-[320px] animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl text-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header & Tabs */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1 text-[11px] font-bold text-white font-mono">
                <Music className="w-3.5 h-3.5 text-emerald-400" />
                <span>16-Bit Soundtrack</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setActiveTab('tracks')}
                    className={`px-1.5 py-0.5 rounded-md font-semibold transition-colors ${
                      activeTab === 'tracks'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Tracks
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('playlists')}
                    className={`px-1.5 py-0.5 rounded-md font-semibold transition-colors ${
                      activeTab === 'playlists'
                        ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Playlists
                  </button>
                  <button
                    type="button"
                    id="soundtrack-settings-tab-btn"
                    onClick={() => setActiveTab('settings')}
                    className={`px-1.5 py-0.5 rounded-md font-semibold transition-colors flex items-center gap-1 ${
                      activeTab === 'settings'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="Soundtrack Settings: Pick specific playlist & enable/disable songs"
                  >
                    <Settings className="w-2.5 h-2.5" />
                    <span>Settings</span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setShowVolumeSlider(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800/80 transition-colors"
                  title="Close Music Player Menu"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Volume Slider */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[10px] text-slate-300 font-mono">
                <span className="flex items-center gap-1 font-semibold">
                  <Volume2 className="w-3 h-3 text-emerald-400" /> Volume
                </span>
                <span className="font-bold text-amber-400">{Math.round(safeVol * 100)}%</span>
              </div>
              <input
                id="soundtrack-volume-slider-input"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={safeVol}
                onChange={(e) => {
                  const parsed = parseFloat(e.target.value);
                  if (!isNaN(parsed)) setVolume(parsed);
                }}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Playback Mode Selector: Immersive vs Play All */}
            <div className="flex items-center justify-between bg-slate-900/80 p-1.5 rounded-lg border border-slate-800 text-[10px]">
              <span className="text-slate-300 font-semibold flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-400" /> Mode
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setSoundtrackMode('immersive')}
                  className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all ${
                    soundtrackMode === 'immersive'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white bg-slate-800/60'
                  }`}
                  title="Immersive: Play soundtrack based on league & competition context"
                >
                  Immersive
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSoundtrackMode('play_all');
                    nextTrack();
                  }}
                  className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all ${
                    soundtrackMode === 'play_all'
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white bg-slate-800/60'
                  }`}
                  title="Play All: Play all songs across all leagues & countries in randomized order"
                >
                  Play All 🎲
                </button>
              </div>
            </div>

            {/* Current Active Playlist Banner */}
            <div
              className="rounded-lg p-2 border flex flex-col gap-1 text-[10px]"
              style={{
                backgroundColor: `${currentPlaylist.colorHex}15`,
                borderColor: `${currentPlaylist.colorHex}40`,
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span>{currentPlaylist.flag}</span>
                  <span>{currentPlaylist.name}</span>
                </span>
                <span className="font-mono text-emerald-400 font-bold text-[9px]">
                  {formatSeconds(elapsed)} / 2:30
                </span>
              </div>
              <span className="text-[9px] text-slate-300 italic line-clamp-2">
                {currentPlaylist.styleDescription}
              </span>
              {/* Progress bar */}
              <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-0.5">
                <div
                  className="bg-emerald-400 h-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (elapsed / 150) * 100)}%` }}
                />
              </div>
            </div>

            {/* TAB: TRACKS LIST */}
            {activeTab === 'tracks' && (
              <div className="flex flex-col gap-1">
                <div className="text-[10px] text-slate-400 font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <ListMusic className="w-3 h-3 text-emerald-400" />
                    <span>Songs in Active Playlist ({currentPlaylistTracks.length})</span>
                  </span>
                  <span className="text-[9px] text-slate-500">2:30 auto-cycle</span>
                </div>
                <div className="flex flex-col gap-1 max-h-[140px] overflow-y-auto pr-1">
                  {currentPlaylistTracks.map((trackItem, idx) => {
                    const isSelected = currentTrack.id === trackItem.id;
                    return (
                      <button
                        key={trackItem.id}
                        type="button"
                        onClick={() => setTrack(idx)}
                        className={`text-left px-2 py-1.5 rounded-lg text-[10px] flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                            : 'text-slate-300 bg-slate-900/60 hover:bg-slate-800 hover:text-white border border-slate-800/40'
                        }`}
                      >
                        <div className="flex flex-col truncate max-w-[170px]">
                          <span className="truncate font-semibold">{t(trackItem.title)}</span>
                          <span className="text-[8px] opacity-70 truncate">{trackItem.genre}</span>
                        </div>
                        <span className="text-[9px] opacity-80 font-mono text-emerald-400">
                          {trackItem.bpm} BPM
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: PLAYLISTS SELECTOR */}
            {activeTab === 'playlists' && (
              <div className="flex flex-col gap-1">
                <div className="text-[10px] text-slate-400 font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3 text-sky-400" />
                    <span>Cultural Playlists ({PLAYLIST_ORDER.length} Regions)</span>
                  </span>
                </div>
                <div className="flex flex-col gap-1 max-h-[140px] overflow-y-auto pr-1">
                  {PLAYLIST_ORDER.map((pId) => {
                    const pl = ALL_PLAYLISTS[pId];
                    if (!pl) return null;
                    const isSelected = currentPlaylistId === pId;
                    return (
                      <button
                        key={pId}
                        type="button"
                        onClick={() => {
                          setPlaylist(pId, true);
                          setActiveTab('tracks');
                        }}
                        className={`text-left px-2 py-1.5 rounded-lg text-[10px] flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-sky-500/20 text-sky-300 font-bold border border-sky-500/40'
                            : 'text-slate-300 bg-slate-900/60 hover:bg-slate-800 hover:text-white border border-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate max-w-[180px]">
                          <span className="text-xs">{pl.flag}</span>
                          <div className="flex flex-col truncate">
                            <span className="truncate font-semibold">{pl.name}</span>
                            <span className="text-[8px] opacity-70 truncate">
                              {pl.tracks.length} songs • {pl.countryOrRegion}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <span className="text-[8px] bg-sky-500/30 text-sky-300 px-1 py-0.5 rounded font-mono">
                            ACTIVE
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: SETTINGS (PICK SPECIFIC PLAYLIST & ENABLE/DISABLE SONGS) */}
            {activeTab === 'settings' && (() => {
              const currentSettingsPlaylist = ALL_PLAYLISTS[settingsPlaylistId] || currentPlaylist;
              const isPlaylistLocked = lockedPlaylistId === settingsPlaylistId;
              const activeCount = currentSettingsPlaylist.tracks.filter((t) => isTrackEnabled(t.id)).length;
              const totalCount = currentSettingsPlaylist.tracks.length;

              return (
                <div className="flex flex-col gap-2 animate-in fade-in duration-150">
                  {/* 1. Pick Specific Playlist */}
                  <div className="flex flex-col gap-1 bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-white flex items-center gap-1 font-mono">
                        <Globe className="w-3 h-3 text-sky-400" /> Specific Playlist
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (isPlaylistLocked) {
                            setLockedPlaylist(null);
                          } else {
                            setLockedPlaylist(settingsPlaylistId);
                          }
                        }}
                        className={`px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                          isPlaylistLocked
                            ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                            : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                        }`}
                        title={isPlaylistLocked ? 'Playlist is locked. Click to allow automatic transitions.' : 'Lock playback to this specific playlist only.'}
                      >
                        {isPlaylistLocked ? (
                          <>
                            <Lock className="w-2.5 h-2.5" />
                            <span>LOCKED</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="w-2.5 h-2.5 text-slate-400" />
                            <span>LOCK PLAYLIST</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Playlist Selector Dropdown */}
                    <select
                      value={settingsPlaylistId}
                      onChange={(e) => {
                        const nextP = e.target.value as PlaylistId;
                        setSettingsPlaylistId(nextP);
                        setPlaylist(nextP, true);
                        if (isPlaylistLocked) {
                          setLockedPlaylist(nextP);
                        }
                      }}
                      className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono cursor-pointer focus:outline-none focus:border-amber-400"
                    >
                      {PLAYLIST_ORDER.map((pId) => {
                        const pl = ALL_PLAYLISTS[pId];
                        if (!pl) return null;
                        return (
                          <option key={pId} value={pId}>
                            {pl.flag} {pl.name} ({pl.tracks.length} songs)
                          </option>
                        );
                      })}
                    </select>
                    <span className="text-[8px] text-slate-400 italic">
                      {isPlaylistLocked
                        ? '🔒 Locked: Playing only this playlist throughout career menus and matches.'
                        : '💡 Unlocked: Soundtrack changes dynamically based on domestic league and cups.'}
                    </span>
                  </div>

                  {/* 2. Enable / Disable Songs Checklist */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-300 font-mono">
                      <span className="flex items-center gap-1 font-semibold">
                        <ListMusic className="w-3 h-3 text-emerald-400" />
                        <span>Songs</span>
                        <span className="text-[9px] text-amber-400 font-bold ml-1">
                          ({activeCount}/{totalCount} active)
                        </span>
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => enableAllTracks(settingsPlaylistId)}
                          className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded text-[8px] font-bold cursor-pointer"
                          title="Enable all songs in this playlist"
                        >
                          All ON
                        </button>
                        <button
                          type="button"
                          onClick={() => disableAllTracks(settingsPlaylistId)}
                          className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded text-[8px] font-bold cursor-pointer"
                          title="Disable all songs in this playlist"
                        >
                          All OFF
                        </button>
                      </div>
                    </div>

                    {/* Scrollable Song List with Retro Switches */}
                    <div className="flex flex-col gap-1 max-h-[145px] overflow-y-auto pr-1 custom-scrollbar">
                      {currentSettingsPlaylist.tracks.map((trackItem, idx) => {
                        const enabled = isTrackEnabled(trackItem.id);
                        const isCurrentlyPlaying = currentTrack.id === trackItem.id;

                        return (
                          <div
                            key={trackItem.id}
                            className={`px-2 py-1 rounded-lg text-[10px] flex items-center justify-between transition-colors border ${
                              enabled
                                ? isCurrentlyPlaying
                                  ? 'bg-emerald-500/20 text-white border-emerald-500/50 shadow-sm'
                                  : 'bg-slate-900/80 text-slate-200 border-slate-800/80 hover:border-slate-700'
                                : 'bg-slate-950/60 text-slate-500 border-slate-900/60 line-through opacity-70'
                            }`}
                          >
                            {/* Checkbox / Toggle Switch */}
                            <button
                              type="button"
                              onClick={() => setTrackEnabled(trackItem.id, !enabled)}
                              className="flex items-center gap-2 cursor-pointer flex-1 min-w-0 text-left outline-none"
                              title={enabled ? 'Click to disable song from rotation' : 'Click to enable song'}
                            >
                              <div
                                className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] shrink-0 font-bold ${
                                  enabled
                                    ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                                    : 'bg-slate-800 border-slate-700 text-transparent'
                                }`}
                              >
                                ✓
                              </div>
                              <div className="flex flex-col truncate min-w-0">
                                <span className={`truncate font-semibold ${enabled ? 'text-white' : 'text-slate-500'}`}>
                                  {t(trackItem.title)}
                                </span>
                                <span className="text-[8px] text-slate-400 truncate">
                                  {trackItem.genre} • {trackItem.bpm} BPM
                                </span>
                              </div>
                            </button>

                            {/* Instant Play Button */}
                            <button
                              type="button"
                              onClick={() => {
                                if (currentPlaylistId !== settingsPlaylistId) {
                                  setPlaylist(settingsPlaylistId, false);
                                }
                                if (!enabled) {
                                  setTrackEnabled(trackItem.id, true);
                                }
                                setTrack(idx);
                              }}
                              className={`p-1 rounded hover:bg-slate-800 transition-colors ml-1 shrink-0 ${
                                isCurrentlyPlaying ? 'text-emerald-400' : 'text-slate-400 hover:text-white'
                              }`}
                              title="Play this track now"
                            >
                              <Play className={`w-3 h-3 ${isCurrentlyPlaying ? 'fill-emerald-400' : ''}`} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Keyboard Arrow Navigation Toggle */}
            <div className="flex items-center justify-between bg-slate-900/80 p-1.5 rounded-lg border border-slate-800 text-[10px]">
              <span className="text-slate-300 font-semibold flex items-center gap-1">
                <Keyboard className="w-3 h-3 text-amber-400" /> Key Nav (Arrows & Space)
              </span>
              <button
                type="button"
                onClick={() => {
                  const next = toggleGameNav();
                  setNavEnabled(next);
                }}
                className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all cursor-pointer ${
                  navEnabled
                    ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                    : 'text-slate-400 hover:text-white bg-slate-800/60'
                }`}
                title="Toggle keyboard navigation using arrow keys and spacebar"
              >
                {navEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Bottom Actions & Status */}
            <div className="text-[10px] text-slate-400 font-mono border-t border-slate-800/80 pt-1.5 flex items-center justify-between">
              <span>{isStadiumMode ? '🏟️ Match Atmosphere' : '16-bit Super Sound'}</span>
              <button
                type="button"
                onClick={() => toggleMute()}
                className="text-[10px] text-amber-400 hover:underline font-bold"
              >
                {isMuted ? 'Unmute Audio' : 'Mute Audio'}
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
