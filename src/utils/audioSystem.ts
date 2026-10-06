// ========================================================================
// FOOTBALL CAREER SIMULATOR - SOUNDTRACK AUDIO ENGINE
// 100% Original Procedural 8-Bit / Chiptune Videogame Audio Engine
// Cultural Playlists by Competition & Country + Stadium Audio Engine
// ========================================================================

import {
  PlaylistId,
  PlaylistInfo,
  SoundtrackTrack,
  SoundtrackPlaybackMode,
  ALL_PLAYLISTS,
  PLAYLIST_ORDER,
  INDIE_PLAYLIST,
  TRACK_MAX_DURATION_SECONDS,
  detectPlaylistForCompetition,
  isWorldCompetition,
  isContinentalCompetition,
  classifyCompetitionType,
  isCompetitionFinal,
  selectMatchSoundtrack,
} from '../types/soundtrack';
import { scheduleTrackStep } from './soundtrackSequencers';
import { safeGetItem, safeSetItem } from './storageCleaner';
import { getProfileStorageKey } from './profileSystem';

export {
  type PlaylistId,
  type PlaylistInfo,
  type SoundtrackTrack,
  type SoundtrackPlaybackMode,
  ALL_PLAYLISTS,
  PLAYLIST_ORDER,
  INDIE_PLAYLIST,
  TRACK_MAX_DURATION_SECONDS,
  detectPlaylistForCompetition,
  isWorldCompetition,
  isContinentalCompetition,
  classifyCompetitionType,
};

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private stadiumGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  // Music playback state
  private isMuted = false;
  private volume = 0.65;
  private soundtrackMode: SoundtrackPlaybackMode = 'immersive';
  private currentPlaylistId: PlaylistId = 'england';
  private currentTrackIndexInPlaylist = 0;
  private isPlaying = false;
  private isStadiumMode = false;
  private isIntroMode = false;
  private isMainMenuMode = true;
  private domesticPlaylistId: PlaylistId = 'england';
  private pendingPlaylistId: PlaylistId | null = null;
  private disabledTrackIds: Set<string> = new Set();
  private lockedPlaylistId: PlaylistId | null = null;

  // Match context & Priority Stack
  // Hierarchy: World (Highest) > Continental (High) > Country/League (Normal)
  private activeMatchContext: {
    type: 'world' | 'continental' | 'domestic';
    name?: string;
    isFinal?: boolean;
    trackId?: string;
  } | null = null;
  private previousPlaylistIdBeforeMatch: PlaylistId | null = null;

  // Track timing & Auto-switching every 2m30s
  private trackStartTime = 0;
  private isTransitioning = false;

  // Sequencing internals
  private nextNoteTime = 0;
  private currentStep = 0;
  private timerId: number | null = null;
  private workerTimer: Worker | null = null;
  private isSimulationActive = false;
  private lookahead = 25.0; // ms
  private scheduleAheadTime = 0.75; // seconds - high headroom buffer prevents stutter during heavy UI/sim loads

  // Stadium Ambient nodes
  private stadiumNoiseNode1: AudioNode | null = null;
  private stadiumNoiseNode2: AudioNode | null = null;
  private chantIntervalId: number | null = null;

  // Listeners for UI state update
  private stateChangeListeners: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.reloadProfileSettings();

      window.addEventListener('drawstar_profile_switched', () => {
        this.reloadProfileSettings();
      });

      // Auto-unlock AudioContext on first user interaction & resume on mobile visibility change
      const unlockAudio = () => {
        try {
          this.ensureContext();
          if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
          }
        } catch {}
      };

      const handleVisibilityChange = () => {
        try {
          if (document.visibilityState === 'visible' && this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
          }
        } catch {}
      };

      try {
        window.addEventListener('click', unlockAudio, { passive: true });
        window.addEventListener('keydown', unlockAudio, { passive: true });
        window.addEventListener('touchstart', unlockAudio, { passive: true });
        document.addEventListener('visibilitychange', handleVisibilityChange, { passive: true });
      } catch {}
    }
  }

  public reloadProfileSettings() {
    try {
      const savedMute = safeGetItem(getProfileStorageKey('bal_audio_muted'));
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
      }
      const savedVol = safeGetItem(getProfileStorageKey('bal_audio_volume'));
      if (savedVol !== null) {
        const parsed = parseFloat(savedVol);
        if (!isNaN(parsed)) this.volume = Math.max(0, Math.min(1, parsed));
      }
      const savedMode = safeGetItem(getProfileStorageKey('bal_soundtrack_mode'));
      if (savedMode === 'immersive' || savedMode === 'play_all') {
        this.soundtrackMode = savedMode;
      }
      const savedDisabled = safeGetItem(getProfileStorageKey('drawstar_disabled_tracks'));
      if (savedDisabled) {
        try {
          const arr = JSON.parse(savedDisabled);
          if (Array.isArray(arr)) {
            this.disabledTrackIds = new Set(arr);
          }
        } catch {}
      } else {
        this.disabledTrackIds.clear();
      }
      const savedLocked = safeGetItem(getProfileStorageKey('drawstar_locked_playlist'));
      if (savedLocked && ALL_PLAYLISTS[savedLocked as PlaylistId]) {
        this.lockedPlaylistId = savedLocked as PlaylistId;
      } else {
        this.lockedPlaylistId = null;
      }
      if (this.masterGain && this.ctx) {
        const target = this.isMuted ? 0 : this.volume;
        this.masterGain.gain.setValueAtTime(target, this.ctx.currentTime);
      }
      this.notify();
    } catch (e) {
      console.warn('Audio settings reload suppressed:', e);
    }
  }

  public isTrackEnabled(trackId: string): boolean {
    return !this.disabledTrackIds.has(trackId);
  }

  public setTrackEnabled(trackId: string, enabled: boolean) {
    if (enabled) {
      this.disabledTrackIds.delete(trackId);
    } else {
      this.disabledTrackIds.add(trackId);
    }
    try {
      safeSetItem(
        getProfileStorageKey('drawstar_disabled_tracks'),
        JSON.stringify(Array.from(this.disabledTrackIds))
      );
    } catch {}
    this.notify();
  }

  public enableAllTracks(playlistId?: PlaylistId) {
    if (playlistId && ALL_PLAYLISTS[playlistId]) {
      ALL_PLAYLISTS[playlistId].tracks.forEach((t) => {
        this.disabledTrackIds.delete(t.id);
      });
    } else {
      this.disabledTrackIds.clear();
    }
    try {
      safeSetItem(
        getProfileStorageKey('drawstar_disabled_tracks'),
        JSON.stringify(Array.from(this.disabledTrackIds))
      );
    } catch {}
    this.notify();
  }

  public disableAllTracks(playlistId?: PlaylistId) {
    if (playlistId && ALL_PLAYLISTS[playlistId]) {
      ALL_PLAYLISTS[playlistId].tracks.forEach((t) => {
        this.disabledTrackIds.add(t.id);
      });
    } else {
      PLAYLIST_ORDER.forEach((pId) => {
        ALL_PLAYLISTS[pId].tracks.forEach((t) => {
          this.disabledTrackIds.add(t.id);
        });
      });
    }
    try {
      safeSetItem(
        getProfileStorageKey('drawstar_disabled_tracks'),
        JSON.stringify(Array.from(this.disabledTrackIds))
      );
    } catch {}
    this.notify();
  }

  public getDisabledTrackIds(): string[] {
    return Array.from(this.disabledTrackIds);
  }

  public getLockedPlaylist(): PlaylistId | null {
    return this.lockedPlaylistId;
  }

  public setLockedPlaylist(playlistId: PlaylistId | null) {
    this.lockedPlaylistId = playlistId;
    try {
      if (playlistId) {
        safeSetItem(getProfileStorageKey('drawstar_locked_playlist'), playlistId);
      } else {
        safeSetItem(getProfileStorageKey('drawstar_locked_playlist'), '');
      }
    } catch {}
    if (playlistId && ALL_PLAYLISTS[playlistId]) {
      this.setPlaylist(playlistId, true);
    }
    this.notify();
  }

  private ensureContext() {
    try {
      if (!this.ctx && typeof window !== 'undefined') {
        const AudioCtxClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtxClass) {
          this.ctx = new AudioCtxClass();

          // Master Bus
          this.masterGain = this.ctx.createGain();
          this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
          this.masterGain.connect(this.ctx.destination);

          // Music Sub-Bus
          this.musicGain = this.ctx.createGain();
          this.musicGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
          this.musicGain.connect(this.masterGain);

          // Stadium Sub-Bus
          this.stadiumGain = this.ctx.createGain();
          this.stadiumGain.gain.setValueAtTime(0, this.ctx.currentTime);
          this.stadiumGain.connect(this.masterGain);

          // SFX Sub-Bus
          this.sfxGain = this.ctx.createGain();
          this.sfxGain.gain.setValueAtTime(0.9, this.ctx.currentTime);
          this.sfxGain.connect(this.masterGain);
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch (e) {
      console.warn('AudioContext initialization deferred until user interaction:', e);
    }
  }

  public subscribe(listener: () => void) {
    this.stateChangeListeners.add(listener);
    return () => {
      this.stateChangeListeners.delete(listener);
    };
  }

  private notify() {
    this.stateChangeListeners.forEach((l) => {
      try {
        l();
      } catch (e) {
        console.error('AudioEngine notify error:', e);
      }
    });
  }

  // ==========================================
  // PLAYBACK & PLAYLIST CONTROLS
  // ==========================================

  private getRandomTrackAcrossAllPlaylists(): { playlistId: PlaylistId; trackIndex: number } {
    const availablePlaylists: PlaylistId[] = this.lockedPlaylistId && ALL_PLAYLISTS[this.lockedPlaylistId]
      ? [this.lockedPlaylistId]
      : [
          'germany',
          'italy',
          'france',
          'spain',
          'brazil',
          'argentina',
          'england',
          'portugal',
          'saudi',
          'continental',
          'world',
        ];
    
    // Find candidates that are not disabled and respect match final rules
    const validCandidates: { playlistId: PlaylistId; trackIndex: number }[] = [];
    availablePlaylists.forEach((pId) => {
      const pl = ALL_PLAYLISTS[pId];
      if (!pl) return;
      pl.tracks.forEach((t, i) => {
        if (!t.isFinalOnly || this.activeMatchContext?.isFinal) {
          if (!this.disabledTrackIds.has(t.id)) {
            validCandidates.push({ playlistId: pId, trackIndex: i });
          }
        }
      });
    });

    if (validCandidates.length > 0) {
      return validCandidates[Math.floor(Math.random() * validCandidates.length)];
    }

    // Fallback if all tracks are disabled: pick any valid track
    const randomPlaylist = availablePlaylists[Math.floor(Math.random() * availablePlaylists.length)];
    const pl = ALL_PLAYLISTS[randomPlaylist];
    const validIndices: number[] = [];
    pl.tracks.forEach((t, i) => {
      if (!t.isFinalOnly || this.activeMatchContext?.isFinal) {
        validIndices.push(i);
      }
    });
    const chosenIdx =
      validIndices.length > 0
        ? validIndices[Math.floor(Math.random() * validIndices.length)]
        : 0;
    return { playlistId: randomPlaylist, trackIndex: chosenIdx };
  }

  /**
   * Automatically sets playlist based on active competition, country, or tournament
   * Re-evaluates domestic club context upon signing for a new team.
   * Immediately transitions into Continental or World playlists when entering international/continental stages.
   * Smoothly returns to domestic playlist upon returning to league play.
   */
  public setCompetitionContext(
    competitionNameOrId?: string,
    countryOrLeague?: string,
    tier?: string,
    isPro: boolean = false
  ) {
    // If the player explicitly locked a specific playlist, maintain that playlist!
    if (this.lockedPlaylistId && ALL_PLAYLISTS[this.lockedPlaylistId]) {
      if (this.currentPlaylistId !== this.lockedPlaylistId) {
        this.setPlaylist(this.lockedPlaylistId, false);
      }
      return;
    }

    // In Play All mode: do not automatically constrain playlist to active competition
    if (this.soundtrackMode === 'play_all') {
      return;
    }

    // Before joining a professional team / main menu: randomize from any playlist
    if (!isPro && !competitionNameOrId && !countryOrLeague) {
      this.isMainMenuMode = true;
      return;
    }

    this.isMainMenuMode = false;

    // Evaluate domestic playlist for the player's club/country
    const domesticPlaylist = detectPlaylistForCompetition(
      undefined,
      countryOrLeague,
      undefined
    );
    this.domesticPlaylistId = domesticPlaylist;

    // Detect target playlist for current competition/tournament or domestic league
    const targetPlaylist = detectPlaylistForCompetition(
      competitionNameOrId,
      countryOrLeague,
      tier
    );

    if (this.isIntroMode) {
      this.isIntroMode = false;
    }

    // PRIORITY HIERARCHY & IMMEDIATE TRANSITION:
    // 1. World Playlist (Highest Priority)
    // 2. Continental Playlist (Second Priority)
    // 3. Country/League Playlist (Normal Club Competition)
    if (targetPlaylist === 'world' || targetPlaylist === 'continental') {
      this.pendingPlaylistId = null;
      if (this.currentPlaylistId !== targetPlaylist) {
        this.setPlaylist(targetPlaylist, true);
      }
    } else if (this.currentPlaylistId === 'world' || this.currentPlaylistId === 'continental') {
      // Returning to normal club competition from World / Continental: immediately resume domestic playlist
      this.pendingPlaylistId = null;
      this.setPlaylist(targetPlaylist, true);
    } else if (this.currentPlaylistId !== targetPlaylist) {
      const elapsed = this.ctx ? this.ctx.currentTime - this.trackStartTime : 0;
      // Normal league-to-league context shift: queue gracefully
      if (this.isPlaying && elapsed < TRACK_MAX_DURATION_SECONDS) {
        this.pendingPlaylistId = targetPlaylist;
      } else {
        this.pendingPlaylistId = null;
        this.setPlaylist(targetPlaylist, this.isPlaying);
      }
    } else {
      this.pendingPlaylistId = null;
    }
  }

  /**
   * Enters Match Mode during Unique Career:
   * Immediately stops/skips the currently playing league/country song and tunes into:
   * - World Playlist for World Competitions (FIFA World Cup, U-17/U-20 World Cup, Club World Cup, Qualifiers, etc.)
   * - Continental Playlist for Continental Competitions (UEFA Champions League, Europa League, Conference League, Copa Libertadores, Sudamericana, Super Cup, etc.)
   * - Domestic Country/League Playlist for normal club matches
   * Activates immersive stadium acoustics for the match.
   */
  /**
   * Enters Match Mode when a player steps onto the pitch for a Key Match:
   * Immediately stops/skips any irrelevant song and tunes into:
   * - World Playlist for World Competitions (FIFA World Cup, International Youth Cup, Club World Cup, etc.)
   * - Continental Playlist for Continental Competitions (UEFA Champions League, Europa League, etc.)
   * - Domestic Country/League Playlist for league and cup matches
   * - Unique Final Anthems based on "Wheel of Destiny" for Finals (with Continental Final = "Wheel of Destiny", World Final = world-final, League Finals = league-final)
   * Note: Stadium Atmosphere white-noise loop is explicitly disabled during key matches.
   */
  public enterMatchMode(
    competitionType: 'world' | 'continental' | 'domestic' | 'auto',
    competitionNameOrStage?: string,
    countryOrLeague?: string,
    tier?: string,
    playerContext?: { league?: string; clubCountry?: string; country?: string },
    opponentName?: string,
    playerTeamName?: string
  ) {
    this.ensureContext();

    // Critical: Per user request, DO NOT play or trigger the Stadium Atmosphere background noise during key matches.
    // Ensure stadium ambience is shut off completely if active.
    this.exitStadiumMode();

    if (!this.activeMatchContext) {
      this.previousPlaylistIdBeforeMatch = this.currentPlaylistId;
    }

    // Determine the exact tournament / league playlist and track (including unique final song if final)
    const selection = selectMatchSoundtrack({
      stageTitle: competitionNameOrStage,
      competitionType,
      countryOrLeague,
      player: playerContext,
      opponentName,
      playerTeamName,
      clubCountry: countryOrLeague,
    });

    this.activeMatchContext = {
      type: selection.competitionCategory,
      name: competitionNameOrStage,
      isFinal: selection.isFinal,
      trackId: selection.trackId,
    };

    this.pendingPlaylistId = null;

    // Immediately transition to the tournament/league playlist and the chosen track
    if (this.currentPlaylistId !== selection.playlistId) {
      this.currentPlaylistId = selection.playlistId;
      this.currentTrackIndexInPlaylist = selection.trackIndex;
      if (!this.isPlaying) {
        this.startMusic();
      } else {
        this.switchTrackWithTransition(selection.trackIndex);
      }
    } else {
      // Same playlist: switch directly to the selected key match or final track
      if (!this.isPlaying) {
        this.currentTrackIndexInPlaylist = selection.trackIndex;
        this.startMusic();
      } else {
        this.switchTrackWithTransition(selection.trackIndex);
      }
    }

    this.notify();
  }

  /**
   * Helper that extracts competition stage info and activates the corresponding match soundtrack immediately
   */
  public enterMatchContextFromStage(
    stageTitle?: string,
    player?: { league?: string; clubCountry?: string; country?: string },
    opponentName?: string,
    playerTeamName?: string,
    clubCountry?: string
  ) {
    const combinedStrings = `${stageTitle || ''} ${playerTeamName || ''} ${opponentName || ''} ${player?.league || ''}`.trim();
    const effectiveCountry = clubCountry || player?.clubCountry || player?.country;
    const detectedType = classifyCompetitionType(combinedStrings, effectiveCountry);

    this.enterMatchMode(
      detectedType,
      stageTitle,
      effectiveCountry,
      undefined,
      player,
      opponentName,
      playerTeamName
    );
  }

  /**
   * Exits Match Mode when match concludes or match modal closes:
   * Immediately resumes the appropriate country/league playlist based on current club & league.
   * Exits stadium acoustics.
   */
  public exitMatchMode(fallbackCountryOrLeague?: string) {
    if (!this.activeMatchContext) {
      this.exitStadiumMode();
      return;
    }

    this.activeMatchContext = null;
    this.exitStadiumMode();

    // Determine domestic playlist to resume
    let targetPlaylist: PlaylistId = this.domesticPlaylistId || 'england';
    if (fallbackCountryOrLeague) {
      targetPlaylist = detectPlaylistForCompetition(
        undefined,
        fallbackCountryOrLeague,
        undefined
      );
    } else if (
      this.previousPlaylistIdBeforeMatch &&
      this.previousPlaylistIdBeforeMatch !== 'world' &&
      this.previousPlaylistIdBeforeMatch !== 'continental'
    ) {
      targetPlaylist = this.previousPlaylistIdBeforeMatch;
    }

    // If leaving a World or Continental match, or if currently playing a final-only track, transition back to normal country/league playlist
    const currentTrack = this.getCurrentTrack();
    if (
      this.currentPlaylistId === 'world' ||
      this.currentPlaylistId === 'continental' ||
      currentTrack?.isFinalOnly
    ) {
      this.pendingPlaylistId = null;
      this.setPlaylist(targetPlaylist, true);
    }

    this.previousPlaylistIdBeforeMatch = null;
    this.notify();
  }

  public setPlaylist(playlistId: PlaylistId, startImmediately: boolean = true) {
    if (ALL_PLAYLISTS[playlistId]) {
      this.isMainMenuMode = false;
      this.pendingPlaylistId = null;
      this.currentPlaylistId = playlistId;

      const pl = ALL_PLAYLISTS[playlistId];
      let startIdx = 0;
      if (pl?.tracks[startIdx]?.isFinalOnly && !this.activeMatchContext?.isFinal) {
        const nonFinalIdx = pl.tracks.findIndex((t) => !t.isFinalOnly);
        if (nonFinalIdx !== -1) startIdx = nonFinalIdx;
      }
      this.currentTrackIndexInPlaylist = startIdx;
      this.isIntroMode = playlistId === 'intro';

      if (startImmediately) {
        if (!this.isPlaying) {
          this.startMusic();
        } else {
          this.switchTrackWithTransition(startIdx);
        }
      } else {
        this.notify();
      }
    }
  }

  public startIntroMusic() {
    this.ensureContext();
    this.currentPlaylistId = 'intro';
    this.currentTrackIndexInPlaylist = 0;
    this.isIntroMode = true;
    this.isStadiumMode = false;
    this.startMusic();
  }

  public startMenuMusic() {
    this.ensureContext();
    this.isMainMenuMode = true;
    if (this.isIntroMode) {
      this.isIntroMode = false;
      const randomPlaylist = PLAYLIST_ORDER[Math.floor(Math.random() * PLAYLIST_ORDER.length)];
      const trackCount = ALL_PLAYLISTS[randomPlaylist]?.tracks.length || 10;
      const randomIdx = Math.floor(Math.random() * trackCount);
      this.currentPlaylistId = randomPlaylist;
      this.currentTrackIndexInPlaylist = randomIdx;
      this.switchTrackWithTransition(randomIdx);
    }
    if (this.isStadiumMode) {
      this.exitStadiumMode();
    } else if (!this.isPlaying) {
      const randomPlaylist = PLAYLIST_ORDER[Math.floor(Math.random() * PLAYLIST_ORDER.length)];
      const trackCount = ALL_PLAYLISTS[randomPlaylist]?.tracks.length || 10;
      const randomIdx = Math.floor(Math.random() * trackCount);
      this.currentPlaylistId = randomPlaylist;
      this.currentTrackIndexInPlaylist = randomIdx;
      this.startMusic();
    }
  }

  /**
   * Procedural chiptune UI sound effects generator
   */
  public playSfx(type: string = 'ui_click') {
    try {
      this.ensureContext();
      if (!this.ctx || this.isMuted) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.sfxGain || this.masterGain || this.ctx.destination);

      if (type === 'ui_confirm') {
        // High cheery arpeggio chime
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.05);
        osc.frequency.setValueAtTime(783.99, now + 0.10);
        osc.frequency.setValueAtTime(1046.5, now + 0.15);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'ui_card_discard') {
        // Low downward sweep
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.16);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'ui_select') {
        // Crisp dual pip
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(880, now + 0.04);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else {
        // Default subtle 8-bit blip click
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
      }
    } catch {}
  }

  private initWorkerTimer() {
    if (typeof window !== 'undefined' && typeof Worker !== 'undefined' && !this.workerTimer) {
      try {
        const blob = new Blob(
          [
            `let timer = null;
            self.onmessage = function(e) {
              if (e.data === 'start') {
                if (!timer) {
                  timer = setInterval(function() {
                    self.postMessage('tick');
                  }, 25);
                }
              } else if (e.data === 'stop') {
                if (timer) {
                  clearInterval(timer);
                  timer = null;
                }
              }
            };`
          ],
          { type: 'application/javascript' }
        );
        const url = URL.createObjectURL(blob);
        this.workerTimer = new Worker(url);
        this.workerTimer.onmessage = (e) => {
          if (e.data === 'tick' && this.isPlaying) {
            this.scheduler();
          }
        };
      } catch (err) {
        // Fallback silently to window.setTimeout
      }
    }
  }

  public setSimulationMode(active: boolean) {
    this.isSimulationActive = active;
    if (active && this.isPlaying) {
      // Immediately schedule well ahead so background simulation cannot starve audio
      this.scheduler();
    }
  }

  public startMusic() {
    this.ensureContext();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    if (this.isPlaying) {
      this.ensureSchedulerRunning();
      return;
    }

    this.isPlaying = true;
    this.currentStep = 0;
    this.trackStartTime = this.ctx.currentTime;
    this.nextNoteTime = this.ctx.currentTime + 0.05;

    if (this.musicGain && this.ctx) {
      const targetGain = this.isStadiumMode ? 0.45 : 0.7;
      this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.musicGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      this.musicGain.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 0.4);
    }

    this.initWorkerTimer();
    if (this.workerTimer) {
      try {
        this.workerTimer.postMessage('start');
      } catch {}
    }

    this.ensureSchedulerRunning();
    this.notify();
  }

  public stopMusic() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.workerTimer) {
      try {
        this.workerTimer.postMessage('stop');
      } catch {}
    }
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.musicGain.gain.setValueAtTime(0, this.ctx.currentTime);
    }
    this.notify();
  }

  public nextTrack() {
    // In Play All mode OR Main Menu mode: randomly pick from ANY playlist across entire track library
    if (this.soundtrackMode === 'play_all' || this.isMainMenuMode) {
      const { playlistId, trackIndex } = this.getRandomTrackAcrossAllPlaylists();
      this.currentPlaylistId = playlistId;
      this.switchTrackWithTransition(trackIndex);
      return;
    }

    // If a competition/team context change is pending, switch to the queued playlist now
    if (this.pendingPlaylistId) {
      const target = this.pendingPlaylistId;
      this.pendingPlaylistId = null;
      this.currentPlaylistId = target;
      const targetTracks = ALL_PLAYLISTS[target]?.tracks || [];
      const validIndices: number[] = [];
      targetTracks.forEach((t, i) => {
        if (!t.isFinalOnly || this.activeMatchContext?.isFinal) {
          validIndices.push(i);
        }
      });
      const nextIdx =
        validIndices.length > 0
          ? validIndices[Math.floor(Math.random() * validIndices.length)]
          : 0;
      this.switchTrackWithTransition(nextIdx);
      return;
    }

    const playlist = this.getCurrentPlaylist();
    let nextIdx = (this.currentTrackIndexInPlaylist + 1) % playlist.tracks.length;
    let attempts = 0;
    while (attempts < playlist.tracks.length) {
      const candidate = playlist.tracks[nextIdx];
      const isFinalRestricted = candidate?.isFinalOnly && !this.activeMatchContext?.isFinal;
      const isDisabled = candidate && this.disabledTrackIds.has(candidate.id);
      if (!isFinalRestricted && !isDisabled) {
        break;
      }
      nextIdx = (nextIdx + 1) % playlist.tracks.length;
      attempts++;
    }
    this.switchTrackWithTransition(nextIdx);
  }

  public prevTrack() {
    // In Play All mode OR Main Menu mode: randomly pick from ANY playlist across entire track library
    if (this.soundtrackMode === 'play_all' || this.isMainMenuMode) {
      const { playlistId, trackIndex } = this.getRandomTrackAcrossAllPlaylists();
      this.currentPlaylistId = playlistId;
      this.switchTrackWithTransition(trackIndex);
      return;
    }

    const playlist = this.getCurrentPlaylist();
    let prevIdx =
      (this.currentTrackIndexInPlaylist - 1 + playlist.tracks.length) % playlist.tracks.length;
    let attempts = 0;
    while (attempts < playlist.tracks.length) {
      const candidate = playlist.tracks[prevIdx];
      const isFinalRestricted = candidate?.isFinalOnly && !this.activeMatchContext?.isFinal;
      const isDisabled = candidate && this.disabledTrackIds.has(candidate.id);
      if (!isFinalRestricted && !isDisabled) {
        break;
      }
      prevIdx = (prevIdx - 1 + playlist.tracks.length) % playlist.tracks.length;
      attempts++;
    }
    this.switchTrackWithTransition(prevIdx);
  }

  public setTrack(index: number) {
    const playlist = this.getCurrentPlaylist();
    if (index >= 0 && index < playlist.tracks.length) {
      this.switchTrackWithTransition(index);
    }
  }

  public setTrackById(trackId: string) {
    for (const pId of PLAYLIST_ORDER) {
      const pl = ALL_PLAYLISTS[pId];
      const idx = pl.tracks.findIndex((t) => t.id === trackId);
      if (idx !== -1) {
        this.currentPlaylistId = pId;
        this.switchTrackWithTransition(idx);
        return;
      }
    }
  }

  private switchTrackWithTransition(targetIndex: number) {
    this.ensureContext();
    if (!this.ctx || !this.musicGain) {
      this.currentTrackIndexInPlaylist = targetIndex;
      this.currentStep = 0;
      this.notify();
      return;
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    if (this.isTransitioning) {
      // If already transitioning, just update index directly
      this.currentTrackIndexInPlaylist = targetIndex;
      this.currentStep = 0;
      this.trackStartTime = this.ctx.currentTime;
      this.nextNoteTime = this.ctx.currentTime + 0.03;
      this.notify();
      return;
    }

    this.isTransitioning = true;
    const now = this.ctx.currentTime;
    const targetGain = this.isStadiumMode ? 0.45 : 0.7;

    // Fast gentle crossfade
    this.musicGain.gain.cancelScheduledValues(now);
    this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, now);
    this.musicGain.gain.linearRampToValueAtTime(0.05, now + 0.2);

    window.setTimeout(() => {
      this.currentTrackIndexInPlaylist = targetIndex;
      this.currentStep = 0;
      if (this.ctx) {
        this.trackStartTime = this.ctx.currentTime;
        this.nextNoteTime = this.ctx.currentTime + 0.05;
        this.musicGain?.gain.cancelScheduledValues(this.ctx.currentTime);
        this.musicGain?.gain.setValueAtTime(0.05, this.ctx.currentTime);
        this.musicGain?.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 0.35);
      }
      this.isTransitioning = false;
      this.ensureSchedulerRunning();
      this.notify();
    }, 220);
  }

  public toggleMute(): boolean {
    this.ensureContext();
    this.isMuted = !this.isMuted;
    try {
      safeSetItem(getProfileStorageKey('bal_audio_muted'), String(this.isMuted));
    } catch {}

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    if (this.masterGain && this.ctx) {
      const target = this.isMuted ? 0 : this.volume;
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(target, this.ctx.currentTime + 0.08);
    }

    if (!this.isMuted) {
      if (!this.isPlaying) {
        this.startMusic();
      } else {
        this.ensureSchedulerRunning();
      }
    }
    this.notify();
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.ensureContext();
    this.volume = Math.max(0, Math.min(1, vol));
    try {
      safeSetItem(getProfileStorageKey('bal_audio_volume'), String(this.volume));
    } catch {}

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    if (!this.isMuted && this.masterGain && this.ctx) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(this.volume, this.ctx.currentTime + 0.05);
    }

    if (this.volume > 0 && this.isMuted) {
      this.isMuted = false;
      try {
        safeSetItem(getProfileStorageKey('bal_audio_muted'), 'false');
      } catch {}
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.masterGain.gain.linearRampToValueAtTime(this.volume, this.ctx.currentTime + 0.05);
      }
    }

    if (!this.isPlaying && this.volume > 0 && !this.isMuted) {
      this.startMusic();
    } else if (this.isPlaying) {
      this.ensureSchedulerRunning();
    }

    this.notify();
  }

  // ==========================================
  // STADIUM AMBIENCE MODE (KEY MATCHES)
  // ==========================================

  public enterStadiumMode() {
    this.ensureContext();
    if (!this.ctx) return;
    this.isStadiumMode = true;

    // Gently duck music volume so track continues playing naturally in the background
    if (this.musicGain) {
      this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, this.ctx.currentTime);
      this.musicGain.gain.linearRampToValueAtTime(0.45, this.ctx.currentTime + 0.6);
    }

    // Fade in stadium crowd
    if (this.stadiumGain) {
      this.stadiumGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.stadiumGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.stadiumGain.gain.linearRampToValueAtTime(0.55, this.ctx.currentTime + 0.8);
    }

    this.startStadiumAmbience();
    this.ensureSchedulerRunning();
    this.notify();
  }

  public exitStadiumMode() {
    if (!this.isStadiumMode) return;
    this.isStadiumMode = false;

    // Fade out stadium ambience
    if (this.stadiumGain && this.ctx) {
      this.stadiumGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.stadiumGain.gain.setValueAtTime(this.stadiumGain.gain.value, this.ctx.currentTime);
      this.stadiumGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.6);
    }

    this.stopStadiumAmbience();

    // Fade music back to full level
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, this.ctx.currentTime);
      this.musicGain.gain.linearRampToValueAtTime(0.7, this.ctx.currentTime + 0.8);
    }

    if (!this.isPlaying) {
      this.startMusic();
    } else {
      this.ensureSchedulerRunning();
    }

    this.notify();
  }

  private startStadiumAmbience() {
    if (!this.ctx || !this.stadiumGain) return;
    this.stopStadiumAmbience();

    try {
      const bufferSize = this.ctx.sampleRate * 2.5;
      const noiseBuffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
      for (let channel = 0; channel < 2; channel++) {
        const data = noiseBuffer.getChannelData(channel);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = data[i];
        }
      }

      const noiseSource1 = this.ctx.createBufferSource();
      noiseSource1.buffer = noiseBuffer;
      noiseSource1.loop = true;

      const filter1 = this.ctx.createBiquadFilter();
      filter1.type = 'bandpass';
      filter1.frequency.setValueAtTime(420, this.ctx.currentTime);
      filter1.Q.setValueAtTime(0.7, this.ctx.currentTime);

      const filterGain1 = this.ctx.createGain();
      filterGain1.gain.setValueAtTime(0.35, this.ctx.currentTime);

      noiseSource1.connect(filter1);
      filter1.connect(filterGain1);
      filterGain1.connect(this.stadiumGain);
      noiseSource1.start();
      this.stadiumNoiseNode1 = noiseSource1;

      const noiseSource2 = this.ctx.createBufferSource();
      noiseSource2.buffer = noiseBuffer;
      noiseSource2.loop = true;

      const filter2 = this.ctx.createBiquadFilter();
      filter2.type = 'lowpass';
      filter2.frequency.setValueAtTime(1400, this.ctx.currentTime);

      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(0.18, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

      const noiseGain2 = this.ctx.createGain();
      noiseGain2.gain.setValueAtTime(0.25, this.ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(noiseGain2.gain);

      noiseSource2.connect(filter2);
      filter2.connect(noiseGain2);
      noiseGain2.connect(this.stadiumGain);

      lfo.start();
      noiseSource2.start();
      this.stadiumNoiseNode2 = noiseSource2;
    } catch {}
  }

  private stopStadiumAmbience() {
    try {
      if (this.stadiumNoiseNode1) {
        (this.stadiumNoiseNode1 as any).stop?.();
        this.stadiumNoiseNode1.disconnect();
        this.stadiumNoiseNode1 = null;
      }
      if (this.stadiumNoiseNode2) {
        (this.stadiumNoiseNode2 as any).stop?.();
        this.stadiumNoiseNode2.disconnect();
        this.stadiumNoiseNode2 = null;
      }
      if (this.chantIntervalId) {
        window.clearInterval(this.chantIntervalId);
        this.chantIntervalId = null;
      }
    } catch {}
  }

  // ==========================================
  // SEQUENCER CLOCK & SCHEDULER
  // ==========================================

  private ensureSchedulerRunning() {
    if (!this.isPlaying) return;
    if (this.timerId === null) {
      this.scheduler();
    }
  }

  private scheduler() {
    if (!this.isPlaying || !this.ctx || this.ctx.state === 'closed') {
      this.timerId = null;
      return;
    }

    try {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      // Check for 2m30s auto-switch cycle
      const elapsed = this.ctx.currentTime - this.trackStartTime;
      if (elapsed >= TRACK_MAX_DURATION_SECONDS && !this.isTransitioning) {
        this.nextTrack();
      } else {
        // High headroom lookahead (1.5s during match simulations, 0.75s in UI)
        const aheadTime = this.isSimulationActive ? 1.5 : this.scheduleAheadTime;

        // Safeguard against severe clock desync / background tab freeze
        if (
          this.nextNoteTime < this.ctx.currentTime - 0.75 ||
          this.nextNoteTime > this.ctx.currentTime + 3.0
        ) {
          this.nextNoteTime = this.ctx.currentTime + 0.05;
        }

        // Schedule notes in the lookahead window
        let safetyCounter = 0;
        while (
          this.nextNoteTime < this.ctx.currentTime + aheadTime &&
          safetyCounter < 128
        ) {
          safetyCounter++;
          this.scheduleStep(this.currentStep, this.nextNoteTime);
          this.advanceStep();
        }
      }
    } catch (err) {
      console.warn('Audio scheduler step caught:', err);
    }

    // ALWAYS reschedule next tick as long as playback is active!
    if (this.isPlaying) {
      this.timerId = window.setTimeout(() => this.scheduler(), this.lookahead);
    } else {
      this.timerId = null;
    }
  }

  private advanceStep() {
    try {
      const track = this.getCurrentTrack();
      const bpm = track && track.bpm ? Math.max(60, track.bpm) : 128;
      const secondsPerBeat = 60.0 / bpm;
      const stepDuration = secondsPerBeat / 4; // 16th notes

      this.nextNoteTime += stepDuration;
      this.currentStep++;
      const totalSteps = (track?.bars || 16) * 16;
      if (this.currentStep >= totalSteps) {
        this.currentStep = 0;
      }
    } catch {
      this.currentStep = 0;
    }
  }

  private scheduleStep(step: number, time: number) {
    if (!this.ctx || !this.musicGain || this.ctx.state === 'closed') return;
    try {
      const track = this.getCurrentTrack();
      if (track) {
        scheduleTrackStep(this.ctx, this.musicGain, track, step, Math.max(time, this.ctx.currentTime));
      }
    } catch (err) {
      // Suppress step scheduling glitches
    }
  }

  // ==========================================
  // STADIUM SFX
  // ==========================================

  public playCrowdChant() {
    if (!this.ctx || !this.stadiumGain || this.isMuted) return;
    try {
      const notes = [440, 440, 523.25, 440, 392, 349.23];
      const durations = [0.25, 0.25, 0.4, 0.3, 0.3, 0.6];
      let offset = 0;

      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.stadiumGain) return;
        const startTime = this.ctx.currentTime + offset;
        const dur = durations[idx];

        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, startTime);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(freq * 1.5, startTime);
        filter.Q.setValueAtTime(1.5, startTime);

        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.08, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.stadiumGain);

        osc.start(startTime);
        osc.stop(startTime + dur);

        offset += dur + 0.08;
      });
    } catch {}
  }

  public playWhistle() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(2200, this.ctx.currentTime + 0.28);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.28);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.28);
    } catch {}
  }

  public playKickSound() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(32, this.ctx.currentTime + 0.14);

      gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.14);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.14);
    } catch {}
  }

  public playCrowdRoar() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    try {
      const bufferSize = this.ctx.sampleRate * 2.0;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, this.ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(1200, this.ctx.currentTime + 0.4);
      filter.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 2.0);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.35, this.ctx.currentTime + 0.35);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2.0);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      noise.start();
      noise.stop(this.ctx.currentTime + 2.0);
    } catch {}
  }

  public playSuccessChime() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.07);

        gain.gain.setValueAtTime(0.18, this.ctx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.07 + 0.35);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(this.ctx.currentTime + idx * 0.07);
        osc.stop(this.ctx.currentTime + idx * 0.07 + 0.35);
      });
    } catch {}
  }

  public playGoalCelebrationChant() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    try {
      // 1. Stadium celebration crowd roar
      this.playCrowdRoar();

      // 2. Triumphant fanfare chord progression (Fanfare horns)
      const fanfareNotes = [
        { freq: 523.25, time: 0.0, dur: 0.18 }, // C5
        { freq: 659.25, time: 0.18, dur: 0.18 }, // E5
        { freq: 783.99, time: 0.36, dur: 0.22 }, // G5
        { freq: 1046.5, time: 0.58, dur: 0.55 }, // C6
        { freq: 880.0, time: 1.15, dur: 0.2 }, // A5
        { freq: 1046.5, time: 1.35, dur: 0.7 }, // C6
      ];

      fanfareNotes.forEach(({ freq, time, dur }) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + time);

        // Warm brass filter
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, this.ctx.currentTime + time);
        filter.frequency.exponentialRampToValueAtTime(700, this.ctx.currentTime + time + dur);

        gain.gain.setValueAtTime(0.001, this.ctx.currentTime + time);
        gain.gain.linearRampToValueAtTime(0.18, this.ctx.currentTime + time + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + time + dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(this.ctx.currentTime + time);
        osc.stop(this.ctx.currentTime + time + dur);
      });
    } catch {}
  }

  public playGoalNetSound() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    try {
      // Noise burst for crisp net rustle / ball rippling net
      const bufferSize = this.ctx.sampleRate * 0.35;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.08));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
      filter.Q.setValueAtTime(2.0, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      noise.start();
      noise.stop(this.ctx.currentTime + 0.35);
    } catch {}
  }

  public playOverhitRocketSound() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    try {
      // Powerful rising rocket whoosh sound
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, this.ctx.currentTime + 0.5);

      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.55);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.55);
    } catch {}
  }

  public playBallSlowRollSound() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    try {
      // Soft gentle grass roll friction
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(90, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(45, this.ctx.currentTime + 0.8);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.8);
    } catch {}
  }

  public playFailBuzz() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.setValueAtTime(105, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.22, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    } catch {}
  }

  /**
   * Authentic 1950s Canned Sitcom Laugh Track Sound Effect
   * Accurately emulates the classic "Charley Douglass Laff Box" used in 1950s/60s television
   * Features: multi-voiced diaphragmatic laugh bursts, high gigglers, deep belly guffaws,
   * vintage optical-tape bandpass acoustics, studio slapback room delay, and comedic slide stinger.
   */
  public playCannedLaughterSound() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;

      // 1. Vintage 1950s Optical Tape Bandpass Filter (warm 220Hz - 3600Hz envelope)
      const vintageFilter = this.ctx.createBiquadFilter();
      vintageFilter.type = 'bandpass';
      vintageFilter.frequency.setValueAtTime(1400, now);
      vintageFilter.Q.setValueAtTime(0.65, now);

      // 2. 1950s Studio Audience Slapback Room Delay (55ms studio room bounce)
      const delayNode = this.ctx.createDelay();
      delayNode.delayTime.setValueAtTime(0.055, now);
      const delayFeedback = this.ctx.createGain();
      delayFeedback.gain.setValueAtTime(0.32, now);
      delayNode.connect(delayFeedback);
      delayFeedback.connect(delayNode);

      // Master laughter sub-mix gain
      const laughMasterGain = this.ctx.createGain();
      laughMasterGain.gain.setValueAtTime(0.8, now);
      laughMasterGain.gain.setValueAtTime(0.8, now + 1.2);
      laughMasterGain.gain.exponentialRampToValueAtTime(0.01, now + 2.8);

      // Connect to SFX output bus
      laughMasterGain.connect(vintageFilter);
      vintageFilter.connect(this.sfxGain);
      vintageFilter.connect(delayNode);
      delayNode.connect(this.sfxGain);

      // -------------------------------------------------------------
      // VOICE TRACK 1: Lead Medium Male Chucklers ("HA-HA-HA-HA-HA")
      // -------------------------------------------------------------
      const leadChuckles = [
        { t: 0.02, f: 360, d: 0.08, v: 0.7 },
        { t: 0.12, f: 410, d: 0.08, v: 0.8 },
        { t: 0.23, f: 380, d: 0.08, v: 0.85 },
        { t: 0.35, f: 430, d: 0.085, v: 0.9 },
        { t: 0.48, f: 395, d: 0.085, v: 0.85 },
        { t: 0.62, f: 370, d: 0.09, v: 0.8 },
        { t: 0.77, f: 340, d: 0.095, v: 0.75 },
        { t: 0.94, f: 310, d: 0.1, v: 0.65 },
        { t: 1.12, f: 280, d: 0.11, v: 0.55 },
        { t: 1.32, f: 260, d: 0.12, v: 0.45 },
        { t: 1.54, f: 240, d: 0.14, v: 0.35 },
        { t: 1.78, f: 220, d: 0.16, v: 0.25 },
      ];

      leadChuckles.forEach(({ t, f, d, v }) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const formant = this.ctx.createBiquadFilter();
        const g = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now + t);
        osc.frequency.exponentialRampToValueAtTime(f * 0.82, now + t + d);

        // Vocal Formant Bandpass (Human vowel "Ah" resonance)
        formant.type = 'bandpass';
        formant.frequency.setValueAtTime(820, now + t);
        formant.Q.setValueAtTime(4.2, now + t);

        g.gain.setValueAtTime(0.001, now + t);
        g.gain.exponentialRampToValueAtTime(v * 0.65, now + t + 0.012);
        g.gain.exponentialRampToValueAtTime(0.001, now + t + d);

        osc.connect(formant);
        formant.connect(g);
        g.connect(laughMasterGain);

        osc.start(now + t);
        osc.stop(now + t + d + 0.02);
      });

      // -------------------------------------------------------------
      // VOICE TRACK 2: High-Pitched Female Giggles ("HEE-HEE-HEE-HEE")
      // -------------------------------------------------------------
      const highGiggles = [
        { t: 0.06, f: 560, d: 0.07, v: 0.6 },
        { t: 0.17, f: 620, d: 0.07, v: 0.7 },
        { t: 0.29, f: 590, d: 0.075, v: 0.75 },
        { t: 0.42, f: 650, d: 0.075, v: 0.8 },
        { t: 0.56, f: 600, d: 0.08, v: 0.75 },
        { t: 0.71, f: 550, d: 0.085, v: 0.65 },
        { t: 0.88, f: 500, d: 0.09, v: 0.55 },
        { t: 1.06, f: 460, d: 0.1, v: 0.45 },
        { t: 1.26, f: 430, d: 0.11, v: 0.35 },
        { t: 1.48, f: 400, d: 0.12, v: 0.25 },
      ];

      highGiggles.forEach(({ t, f, d, v }) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const formant = this.ctx.createBiquadFilter();
        const g = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + t);
        osc.frequency.exponentialRampToValueAtTime(f * 0.88, now + t + d);

        formant.type = 'bandpass';
        formant.frequency.setValueAtTime(1350, now + t);
        formant.Q.setValueAtTime(4.5, now + t);

        g.gain.setValueAtTime(0.001, now + t);
        g.gain.exponentialRampToValueAtTime(v * 0.55, now + t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, now + t + d);

        osc.connect(formant);
        formant.connect(g);
        g.connect(laughMasterGain);

        osc.start(now + t);
        osc.stop(now + t + d + 0.02);
      });

      // -------------------------------------------------------------
      // VOICE TRACK 3: Deep Belly Guffaws ("HAR-HAR-HAR-HO-HO")
      // -------------------------------------------------------------
      const bellyGuffaws = [
        { t: 0.14, f: 220, d: 0.11, v: 0.65 },
        { t: 0.31, f: 250, d: 0.11, v: 0.75 },
        { t: 0.51, f: 235, d: 0.12, v: 0.7 },
        { t: 0.73, f: 210, d: 0.13, v: 0.65 },
        { t: 0.98, f: 190, d: 0.14, v: 0.55 },
        { t: 1.25, f: 170, d: 0.16, v: 0.45 },
        { t: 1.55, f: 155, d: 0.18, v: 0.35 },
      ];

      bellyGuffaws.forEach(({ t, f, d, v }) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const formant = this.ctx.createBiquadFilter();
        const g = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now + t);
        osc.frequency.exponentialRampToValueAtTime(f * 0.85, now + t + d);

        formant.type = 'bandpass';
        formant.frequency.setValueAtTime(520, now + t);
        formant.Q.setValueAtTime(3.5, now + t);

        g.gain.setValueAtTime(0.001, now + t);
        g.gain.exponentialRampToValueAtTime(v * 0.55, now + t + 0.018);
        g.gain.exponentialRampToValueAtTime(0.001, now + t + d);

        osc.connect(formant);
        formant.connect(g);
        g.connect(laughMasterGain);

        osc.start(now + t);
        osc.stop(now + t + d + 0.02);
      });

      // -------------------------------------------------------------
      // VOICE TRACK 4: Side Snicker & Nasal Cackles ("Heh-Heh-Heh")
      // -------------------------------------------------------------
      const snickers = [
        { t: 0.08, f: 470, d: 0.065, v: 0.5 },
        { t: 0.26, f: 510, d: 0.065, v: 0.55 },
        { t: 0.45, f: 480, d: 0.07, v: 0.6 },
        { t: 0.66, f: 440, d: 0.075, v: 0.55 },
        { t: 0.90, f: 400, d: 0.08, v: 0.45 },
        { t: 1.18, f: 360, d: 0.09, v: 0.35 },
      ];

      snickers.forEach(({ t, f, d, v }) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const formant = this.ctx.createBiquadFilter();
        const g = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(f, now + t);
        osc.frequency.exponentialRampToValueAtTime(f * 0.9, now + t + d);

        formant.type = 'bandpass';
        formant.frequency.setValueAtTime(1600, now + t);
        formant.Q.setValueAtTime(5.0, now + t);

        g.gain.setValueAtTime(0.001, now + t);
        g.gain.exponentialRampToValueAtTime(v * 0.35, now + t + 0.008);
        g.gain.exponentialRampToValueAtTime(0.001, now + t + d);

        osc.connect(formant);
        formant.connect(g);
        g.connect(laughMasterGain);

        osc.start(now + t);
        osc.stop(now + t + d + 0.02);
      });

      // -------------------------------------------------------------
      // TRACK 5: Audience Collective Laugh Body & Chuckle Noise
      // -------------------------------------------------------------
      const bufferSize = this.ctx.sampleRate * 2.5;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const timeSec = i / this.ctx.sampleRate;
        // Diaphragmatic flutter envelope (16Hz pulsating laugh modulation)
        const flutter = 0.5 + 0.5 * Math.sin(2 * Math.PI * 15.5 * timeSec);
        const decay = Math.exp(-timeSec / 0.85);
        data[i] = (Math.random() * 2 - 1) * decay * flutter;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(750, now);
      noiseFilter.frequency.linearRampToValueAtTime(950, now + 0.4);
      noiseFilter.frequency.linearRampToValueAtTime(550, now + 2.0);
      noiseFilter.Q.setValueAtTime(2.5, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.001, now);
      noiseGain.gain.linearRampToValueAtTime(0.28, now + 0.15);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(laughMasterGain);

      noise.start(now);
      noise.stop(now + 2.5);

      // -------------------------------------------------------------
      // TRACK 6: Classic 50s Sitcom Comedic "Wah-Wah-Wah-Waaah" Stinger
      // -------------------------------------------------------------
      const wahNotes = [
        { f: 233.08, t: 0.05, d: 0.18 }, // Bb3
        { f: 220.00, t: 0.25, d: 0.18 }, // A3
        { f: 207.65, t: 0.45, d: 0.18 }, // Ab3
        { f: 196.00, t: 0.65, d: 0.65 }, // G3 (with pitch bend and wah-wah mute modulation)
      ];

      wahNotes.forEach(({ f, t, d }, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const wahFilter = this.ctx.createBiquadFilter();
        const g = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now + t);
        if (idx === 3) {
          // Final drooping note
          osc.frequency.linearRampToValueAtTime(160, now + t + d);
        }

        // Wah-wah mute envelope
        wahFilter.type = 'bandpass';
        wahFilter.frequency.setValueAtTime(450, now + t);
        wahFilter.frequency.linearRampToValueAtTime(1100, now + t + 0.08);
        wahFilter.frequency.linearRampToValueAtTime(350, now + t + d);
        wahFilter.Q.setValueAtTime(4.0, now + t);

        g.gain.setValueAtTime(0.001, now + t);
        g.gain.linearRampToValueAtTime(0.18, now + t + 0.03);
        g.gain.exponentialRampToValueAtTime(0.001, now + t + d);

        osc.connect(wahFilter);
        wahFilter.connect(g);
        g.connect(laughMasterGain);

        osc.start(now + t);
        osc.stop(now + t + d + 0.02);
      });
    } catch (e) {
      console.warn('Canned laughter playback error:', e);
    }
  }

  // ==========================================
  // PROCEDURAL UI & MENU SFX
  // ==========================================

  /**
   * Crisp 32-bit retro arcade navigation tick (for keyboard / controller focus move)
   */
  public playMenuNav() {
    try {
      this.ensureContext();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1100, now + 0.035);
      g.gain.setValueAtTime(0.08, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.045);
    } catch {}
  }

  /**
   * Crisp 32-bit arcade menu confirm chime (for Spacebar / Gamepad Select)
   */
  public playMenuConfirm() {
    try {
      this.ensureContext();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;
      const now = this.ctx.currentTime;
      const notes = [
        { f: 587.33, t: 0, d: 0.06 },
        { f: 880.0, t: 0.05, d: 0.12 },
      ];
      notes.forEach((n) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(n.f, now + n.t);
        g.gain.setValueAtTime(0.001, now + n.t);
        g.gain.linearRampToValueAtTime(0.14, now + n.t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);
        osc.connect(g);
        g.connect(this.sfxGain);
        osc.start(now + n.t);
        osc.stop(now + n.t + n.d + 0.02);
      });
    } catch {}
  }

  // ==========================================
  // PROCEDURAL MATCH & TACTICAL SFX
  // ==========================================

  /**
   * Procedural dual-tone modulated referee whistle (Kick-off, foul, full-time).
   */
  public playRefereeWhistle(type: 'short' | 'double' | 'long' = 'short') {
    try {
      this.ensureContext();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;

      const now = this.ctx.currentTime;
      const bursts =
        type === 'double'
          ? [
              { t: 0, d: 0.18 },
              { t: 0.25, d: 0.45 },
            ]
          : type === 'long'
          ? [{ t: 0, d: 0.85 }]
          : [{ t: 0, d: 0.35 }];

      bursts.forEach(({ t, d }) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        const g = this.ctx.createGain();

        osc1.type = 'triangle';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(2800, now + t);
        osc2.frequency.setValueAtTime(3200, now + t);

        // Pea-whistle rapid trill (LFO 28Hz)
        lfo.frequency.setValueAtTime(28, now + t);
        lfoGain.gain.setValueAtTime(140, now + t);
        lfo.connect(lfoGain);
        lfoGain.connect(osc1.frequency);
        lfoGain.connect(osc2.frequency);

        g.gain.setValueAtTime(0.001, now + t);
        g.gain.linearRampToValueAtTime(0.32, now + t + 0.03);
        g.gain.setValueAtTime(0.3, now + t + d - 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, now + t + d);

        osc1.connect(g);
        osc2.connect(g);
        g.connect(this.sfxGain);

        lfo.start(now + t);
        osc1.start(now + t);
        osc2.start(now + t);

        lfo.stop(now + t + d + 0.05);
        osc1.stop(now + t + d + 0.05);
        osc2.stop(now + t + d + 0.05);
      });
    } catch (e) {
      console.warn('Referee whistle error:', e);
    }
  }

  /**
   * Heavy acoustic metallic reverberation of a ball striking the woodwork.
   */
  public playCrossbarThud() {
    try {
      this.ensureContext();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;

      const now = this.ctx.currentTime;
      // Metallic resonant ring
      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const band = this.ctx.createBiquadFilter();
      const g = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(185, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.6);

      osc2.type = 'square';
      osc2.frequency.setValueAtTime(440, now);
      osc2.frequency.exponentialRampToValueAtTime(220, now + 0.4);

      band.type = 'bandpass';
      band.frequency.setValueAtTime(320, now);
      band.Q.setValueAtTime(8.0, now);

      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(0.45, now + 0.015);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      osc.connect(band);
      osc2.connect(band);
      band.connect(g);
      g.connect(this.sfxGain);

      osc.start(now);
      osc2.start(now);
      osc.stop(now + 0.75);
      osc2.stop(now + 0.75);
    } catch (e) {
      console.warn('Crossbar audio error:', e);
    }
  }

  /**
   * Massive stadium roar noise burst for key match winning goals.
   */
  public playGoalExplosion() {
    try {
      this.ensureContext();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;

      const now = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * 2.2);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        const timeSec = i / this.ctx.sampleRate;
        const env = Math.sin((Math.PI * timeSec) / 2.2);
        data[i] = (Math.random() * 2 - 1) * env;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const lowpass = this.ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(450, now);
      lowpass.frequency.linearRampToValueAtTime(1200, now + 0.5);
      lowpass.frequency.linearRampToValueAtTime(300, now + 2.2);

      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(0.4, now + 0.2);
      g.gain.exponentialRampToValueAtTime(0.001, now + 2.2);

      noise.connect(lowpass);
      lowpass.connect(g);
      g.connect(this.sfxGain);

      noise.start(now);
      noise.stop(now + 2.3);
    } catch (e) {
      console.warn('Goal explosion error:', e);
    }
  }

  /**
   * Uplifting stinger when selecting a tactical decision.
   */
  public playTacticalChoiceStinger() {
    try {
      this.ensureContext();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;

      const now = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880]; // A Major arpeggio
      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        g.gain.setValueAtTime(0.001, now + idx * 0.05);
        g.gain.linearRampToValueAtTime(0.18, now + idx * 0.05 + 0.015);
        g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.18);

        osc.connect(g);
        g.connect(this.sfxGain);

        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.2);
      });
    } catch (e) {
      console.warn('Tactical stinger error:', e);
    }
  }

  /**
   * 32-Bit Arcade Pack Tear Sound:
   * Crisp procedural foil rip noise burst followed by an energetic ascending chiptune sparkle.
   */
  public playPackTearSound() {
    try {
      this.ensureContext();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;

      const now = this.ctx.currentTime;
      // 1. Crisp Foil Tear Noise Burst (rapid 120ms burst)
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.14);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.04));
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.setValueAtTime(1600, now);
      noiseFilter.frequency.linearRampToValueAtTime(3200, now + 0.12);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.35, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.sfxGain);

      noise.start(now);
      noise.stop(now + 0.15);

      // 2. Ascending 32-bit arcade chime notes
      const notes = [440, 554.37, 659.25, 880, 1108.73];
      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + 0.04 + idx * 0.035);

        g.gain.setValueAtTime(0.001, now + 0.04 + idx * 0.035);
        g.gain.linearRampToValueAtTime(0.12, now + 0.04 + idx * 0.035 + 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.04 + idx * 0.035 + 0.12);

        osc.connect(g);
        g.connect(this.sfxGain);

        osc.start(now + 0.04 + idx * 0.035);
        osc.stop(now + 0.04 + idx * 0.035 + 0.14);
      });
    } catch (e) {
      console.warn('Pack tear sound error:', e);
    }
  }

  /**
   * 32-Bit Arcade Card Slide / Flip Sound
   */
  public playCardFlipSound() {
    try {
      this.ensureContext();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.08);

      g.gain.setValueAtTime(0.2, now);
      g.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

      osc.connect(g);
      g.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {
      console.warn('Card flip error:', e);
    }
  }

  /**
   * 32-Bit Rarity Chime (scales with tier quality)
   */
  public playRarityChime(tier: string) {
    try {
      this.ensureContext();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;

      const now = this.ctx.currentTime;
      const t = (tier || '').toLowerCase();

      let freqs = [440, 554.37];
      let oscType: OscillatorType = 'triangle';

      if (t === 'iconic') {
        freqs = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
        oscType = 'sawtooth';
      } else if (t === 'legendary' || t === 'muramasa_blade') {
        freqs = [440, 554.37, 659.25, 880, 1108.73];
        oscType = 'square';
      } else if (t === 'gold' || t === 'steel_blade') {
        freqs = [523.25, 659.25, 783.99, 1046.5];
        oscType = 'triangle';
      } else if (t === 'silver' || t === 'copper_dagger') {
        freqs = [440, 659.25, 880];
        oscType = 'triangle';
      } else if (t === 'obsidian_knife') {
        freqs = [330, 440, 587.33];
        oscType = 'sawtooth';
      }

      freqs.forEach((f, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();

        osc.type = oscType;
        osc.frequency.setValueAtTime(f, now + idx * 0.05);

        g.gain.setValueAtTime(0.001, now + idx * 0.05);
        g.gain.linearRampToValueAtTime(0.14, now + idx * 0.05 + 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.22);

        osc.connect(g);
        g.connect(this.sfxGain);

        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.24);
      });
    } catch (e) {
      console.warn('Rarity chime error:', e);
    }
  }

  /**
   * 32-Bit Iconic Suspense Sound (deep pulse & slow ascending resonant chime)
   */
  public playIconicSuspenseSound() {
    try {
      this.ensureContext();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;

      const now = this.ctx.currentTime;
      // Sub bass rumble pulse
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(65, now);
      subOsc.frequency.exponentialRampToValueAtTime(45, now + 1.2);
      subGain.gain.setValueAtTime(0.25, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      subOsc.connect(subGain);
      subGain.connect(this.sfxGain);
      subOsc.start(now);
      subOsc.stop(now + 1.25);

      // Hollow crystal resonant chime
      const bell = this.ctx.createOscillator();
      const bellGain = this.ctx.createGain();
      bell.type = 'sine';
      bell.frequency.setValueAtTime(880, now + 0.2);
      bell.frequency.exponentialRampToValueAtTime(1760, now + 1.4);
      bellGain.gain.setValueAtTime(0.001, now + 0.2);
      bellGain.gain.linearRampToValueAtTime(0.12, now + 0.5);
      bellGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
      bell.connect(bellGain);
      bellGain.connect(this.sfxGain);
      bell.start(now + 0.2);
      bell.stop(now + 1.55);
    } catch (e) {
      console.warn('Iconic suspense sound error:', e);
    }
  }

  /**
   * 32-Bit Iconic Reveal Prismatic Flash Sound
   */
  public playIconicFlashSound() {
    try {
      this.ensureContext();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;

      const now = this.ctx.currentTime;
      // 1. Prismatic Arpeggio Sweep
      const arpeggio = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98, 2093.0];
      arpeggio.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);
        g.gain.setValueAtTime(0.001, now + idx * 0.04);
        g.gain.linearRampToValueAtTime(0.18, now + idx * 0.04 + 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.35);
        osc.connect(g);
        g.connect(this.sfxGain);
        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.38);
      });

      // 2. High-frequency celestial shimmer burst
      const shimmer = this.ctx.createOscillator();
      const shimmerGain = this.ctx.createGain();
      shimmer.type = 'triangle';
      shimmer.frequency.setValueAtTime(2637, now + 0.25);
      shimmer.frequency.exponentialRampToValueAtTime(3135.96, now + 0.8);
      shimmerGain.gain.setValueAtTime(0.001, now + 0.25);
      shimmerGain.gain.linearRampToValueAtTime(0.16, now + 0.3);
      shimmerGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      shimmer.connect(shimmerGain);
      shimmerGain.connect(this.sfxGain);
      shimmer.start(now + 0.25);
      shimmer.stop(now + 1.25);
    } catch (e) {
      console.warn('Iconic flash sound error:', e);
    }
  }

  /**
   * 32-Bit Legendary Suspense Sound (deep royal rumble & rising golden chord)
   */
  public playLegendarySuspenseSound() {
    try {
      this.ensureContext();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;

      const now = this.ctx.currentTime;
      // 1. Deep golden bass pulse
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sawtooth';
      subOsc.frequency.setValueAtTime(110, now);
      subOsc.frequency.exponentialRampToValueAtTime(82.41, now + 1.1);
      subGain.gain.setValueAtTime(0.22, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
      subOsc.connect(subGain);
      subGain.connect(this.sfxGain);
      subOsc.start(now);
      subOsc.stop(now + 1.15);

      // 2. Rising royal chord arpeggio
      const chord = [220, 277.18, 329.63, 440, 554.37];
      chord.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + 0.15 + idx * 0.08);
        g.gain.setValueAtTime(0.001, now + 0.15 + idx * 0.08);
        g.gain.linearRampToValueAtTime(0.12, now + 0.15 + idx * 0.08 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.15 + idx * 0.08 + 0.5);
        osc.connect(g);
        g.connect(this.sfxGain);
        osc.start(now + 0.15 + idx * 0.08);
        osc.stop(now + 0.15 + idx * 0.08 + 0.55);
      });
    } catch (e) {
      console.warn('Legendary suspense sound error:', e);
    }
  }

  /**
   * 32-Bit Legendary Reveal Gold Fanfare Sound
   */
  public playLegendaryFlashSound() {
    try {
      this.ensureContext();
      if (!this.ctx || !this.sfxGain || this.isMuted) return;

      const now = this.ctx.currentTime;
      // 1. Triumphant Golden Fanfare
      const fanfare = [
        { f: 440, t: 0, d: 0.12 },
        { f: 554.37, t: 0.08, d: 0.12 },
        { f: 659.25, t: 0.16, d: 0.16 },
        { f: 880, t: 0.26, d: 0.45 },
        { f: 1108.73, t: 0.32, d: 0.5 },
      ];

      fanfare.forEach((note) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(note.f, now + note.t);
        g.gain.setValueAtTime(0.001, now + note.t);
        g.gain.linearRampToValueAtTime(0.2, now + note.t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, now + note.t + note.d);
        osc.connect(g);
        g.connect(this.sfxGain);
        osc.start(now + note.t);
        osc.stop(now + note.t + note.d + 0.05);
      });

      // 2. Shimmering Gold Dust Bell
      const goldBell = this.ctx.createOscillator();
      const bellGain = this.ctx.createGain();
      goldBell.type = 'triangle';
      goldBell.frequency.setValueAtTime(1760, now + 0.3);
      goldBell.frequency.exponentialRampToValueAtTime(2217.46, now + 0.9);
      bellGain.gain.setValueAtTime(0.001, now + 0.3);
      bellGain.gain.linearRampToValueAtTime(0.18, now + 0.35);
      bellGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      goldBell.connect(bellGain);
      bellGain.connect(this.sfxGain);
      goldBell.start(now + 0.3);
      goldBell.stop(now + 1.25);
    } catch (e) {
      console.warn('Legendary flash sound error:', e);
    }
  }

  /**
   * Slot Machine Coin Insert & Unlock Sound:
   * 1. Metallic coin clink into slot bezel.
   * 2. Mechanical chute drop & ratchet lever pull.
   * 3. Rapid spinning reel ticks.
   * 4. Triumphant casino bell jackpot fanfare when mode unlocks.
   */
  public playSlotMachineCoinInsertSound() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;

      // 1. Metallic coin contact & clink (bright resonant high ping)
      const coinOsc = this.ctx.createOscillator();
      const coinGain = this.ctx.createGain();
      coinOsc.type = 'triangle';
      coinOsc.frequency.setValueAtTime(2600, now);
      coinOsc.frequency.exponentialRampToValueAtTime(3200, now + 0.06);

      coinGain.gain.setValueAtTime(0.3, now);
      coinGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      coinOsc.connect(coinGain);
      coinGain.connect(this.sfxGain);
      coinOsc.start(now);
      coinOsc.stop(now + 0.2);

      // Second bounce inside metal chute
      const chuteOsc = this.ctx.createOscillator();
      const chuteGain = this.ctx.createGain();
      chuteOsc.type = 'sine';
      chuteOsc.frequency.setValueAtTime(1800, now + 0.12);
      chuteOsc.frequency.exponentialRampToValueAtTime(2200, now + 0.18);

      chuteGain.gain.setValueAtTime(0.2, now + 0.12);
      chuteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      chuteOsc.connect(chuteGain);
      chuteGain.connect(this.sfxGain);
      chuteOsc.start(now + 0.12);
      chuteOsc.stop(now + 0.3);

      // 2. Mechanical ratchet chunk (lever / slot mechanism drop)
      const bufferSize = this.ctx.sampleRate * 0.08;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(900, now + 0.28);
      noiseFilter.Q.setValueAtTime(3, now + 0.28);
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.22, now + 0.28);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.sfxGain);
      noise.start(now + 0.28);

      // 3. Rapid reel ticks (click click click)
      const tickTimes = [0.42, 0.52, 0.62, 0.72, 0.82];
      tickTimes.forEach((t) => {
        if (!this.ctx || !this.sfxGain) return;
        const tickOsc = this.ctx.createOscillator();
        const tickGain = this.ctx.createGain();
        tickOsc.type = 'square';
        tickOsc.frequency.setValueAtTime(1200, now + t);
        tickGain.gain.setValueAtTime(0.08, now + t);
        tickGain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.03);
        tickOsc.connect(tickGain);
        tickGain.connect(this.sfxGain);
        tickOsc.start(now + t);
        tickOsc.stop(now + t + 0.04);
      });

      // 4. Casino unlock jackpot bell fanfare (G5, B5, D6, G6)
      const bells = [
        { f: 783.99, t: 0.95 },
        { f: 987.77, t: 1.08 },
        { f: 1174.66, t: 1.22 },
        { f: 1567.98, t: 1.38 },
      ];

      bells.forEach((bell) => {
        if (!this.ctx || !this.sfxGain) return;
        const bellOsc = this.ctx.createOscillator();
        const bellGain = this.ctx.createGain();
        bellOsc.type = 'sine';
        bellOsc.frequency.setValueAtTime(bell.f, now + bell.t);
        bellGain.gain.setValueAtTime(0.25, now + bell.t);
        bellGain.gain.exponentialRampToValueAtTime(0.001, now + bell.t + 0.45);
        bellOsc.connect(bellGain);
        bellGain.connect(this.sfxGain);
        bellOsc.start(now + bell.t);
        bellOsc.stop(now + bell.t + 0.48);
      });
    } catch (e) {
      console.warn('Slot machine sound error:', e);
    }
  }

  /**
   * Reroll Dice & Deck Shuffle Sound:
   * Crisp tumbling dice impacts + swift card deck riffle flutter.
   */
  public playRerollDiceSound() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      // 3 dice bounces with wooden / resin frequencies
      const bounces = [
        { f: 580, t: 0.0, vol: 0.22 },
        { f: 720, t: 0.08, vol: 0.18 },
        { f: 880, t: 0.16, vol: 0.25 },
        { f: 1050, t: 0.24, vol: 0.2 },
      ];

      bounces.forEach((b) => {
        if (!this.ctx || !this.sfxGain) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(b.f, now + b.t);
        osc.frequency.exponentialRampToValueAtTime(b.f * 0.7, now + b.t + 0.06);

        g.gain.setValueAtTime(b.vol, now + b.t);
        g.gain.exponentialRampToValueAtTime(0.001, now + b.t + 0.07);

        osc.connect(g);
        g.connect(this.sfxGain);
        osc.start(now + b.t);
        osc.stop(now + b.t + 0.08);
      });

      // Quick card slide flutter at the end
      const slideOsc = this.ctx.createOscillator();
      const slideGain = this.ctx.createGain();
      slideOsc.type = 'sine';
      slideOsc.frequency.setValueAtTime(1400, now + 0.28);
      slideOsc.frequency.exponentialRampToValueAtTime(2200, now + 0.4);
      slideGain.gain.setValueAtTime(0.12, now + 0.28);
      slideGain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
      slideOsc.connect(slideGain);
      slideGain.connect(this.sfxGain);
      slideOsc.start(now + 0.28);
      slideOsc.stop(now + 0.44);
    } catch (e) {
      console.warn('Reroll dice sound error:', e);
    }
  }
  // GETTERS
  // ==========================================

  public getIsMuted() {
    return this.isMuted;
  }
  public getVolume() {
    return this.volume;
  }
  public getIsPlaying() {
    return this.isPlaying;
  }
  public getIsStadiumMode() {
    return this.isStadiumMode;
  }
  public getCurrentPlaylistId(): PlaylistId {
    return this.currentPlaylistId;
  }
  public getCurrentPlaylist(): PlaylistInfo {
    return ALL_PLAYLISTS[this.currentPlaylistId] || ALL_PLAYLISTS.england;
  }
  public getCurrentPlaylistTracks(): SoundtrackTrack[] {
    return this.getCurrentPlaylist().tracks;
  }
  public getCurrentTrack(): SoundtrackTrack {
    const playlist = this.getCurrentPlaylist();
    return (
      playlist.tracks[this.currentTrackIndexInPlaylist] ||
      playlist.tracks[0] ||
      ALL_PLAYLISTS.england.tracks[0]
    );
  }
  public getCurrentTrackIndex() {
    return this.currentTrackIndexInPlaylist;
  }
  public getTrackElapsedTime(): number {
    if (!this.ctx || !this.isPlaying) return 0;
    const elapsed = this.ctx.currentTime - this.trackStartTime;
    return Math.max(0, Math.min(TRACK_MAX_DURATION_SECONDS, elapsed));
  }
  public getTrackDurationSeconds(): number {
    return TRACK_MAX_DURATION_SECONDS;
  }
  public getActiveMatchContext() {
    return this.activeMatchContext;
  }
  public getDomesticPlaylistId(): PlaylistId {
    return this.domesticPlaylistId;
  }
  public getSoundtrackMode(): SoundtrackPlaybackMode {
    return this.soundtrackMode;
  }
  public setSoundtrackMode(mode: SoundtrackPlaybackMode): void {
    this.soundtrackMode = mode;
    try {
      safeSetItem('bal_soundtrack_mode', mode);
    } catch {}
    this.notify();
  }
}

// Singleton global export
export const audioManager = new AudioEngine();
