import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  audioManager,
  PlaylistId,
  PlaylistInfo,
  SoundtrackTrack,
  SoundtrackPlaybackMode,
  ALL_PLAYLISTS,
  PLAYLIST_ORDER,
  INDIE_PLAYLIST,
} from '../utils/audioSystem';

interface AudioContextType {
  isMuted: boolean;
  volume: number;
  soundtrackMode: SoundtrackPlaybackMode;
  isPlaying: boolean;
  isStadiumMode: boolean;
  currentPlaylistId: PlaylistId;
  currentPlaylist: PlaylistInfo;
  currentPlaylistTracks: SoundtrackTrack[];
  currentTrack: SoundtrackTrack;
  currentTrackIndex: number;
  toggleMute: () => boolean;
  setVolume: (v: number) => void;
  setSoundtrackMode: (mode: SoundtrackPlaybackMode) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setTrack: (index: number) => void;
  setTrackById: (trackId: string) => void;
  setPlaylist: (playlistId: PlaylistId, startImmediately?: boolean) => void;
  setCompetitionContext: (
    competitionNameOrId?: string,
    countryOrLeague?: string,
    tier?: string,
    isPro?: boolean
  ) => void;
  startMusic: () => void;
  stopMusic: () => void;
  startIntroMusic: () => void;
  startMenuMusic: () => void;
  enterStadiumMode: () => void;
  exitStadiumMode: () => void;
  enterMatchMode: (
    competitionType: 'world' | 'continental' | 'domestic' | 'auto',
    competitionNameOrStage?: string,
    countryOrLeague?: string,
    tier?: string
  ) => void;
  enterMatchContextFromStage: (
    stageTitle?: string,
    player?: { league?: string; clubCountry?: string; country?: string },
    opponentName?: string,
    playerTeamName?: string,
    clubCountry?: string
  ) => void;
  exitMatchMode: (fallbackCountryOrLeague?: string) => void;
  isTrackEnabled: (trackId: string) => boolean;
  setTrackEnabled: (trackId: string, enabled: boolean) => void;
  enableAllTracks: (playlistId?: PlaylistId) => void;
  disableAllTracks: (playlistId?: PlaylistId) => void;
  getDisabledTrackIds: () => string[];
  lockedPlaylistId: PlaylistId | null;
  setLockedPlaylist: (playlistId: PlaylistId | null) => void;
}

const AudioCtx = createContext<AudioContextType | null>(null);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState(() => audioManager.getIsMuted());
  const [volume, setVolumeState] = useState(() => audioManager.getVolume());
  const [soundtrackMode, setSoundtrackModeState] = useState<SoundtrackPlaybackMode>(() =>
    audioManager.getSoundtrackMode()
  );
  const [isPlaying, setIsPlaying] = useState(() => audioManager.getIsPlaying());
  const [isStadiumMode, setIsStadiumMode] = useState(() => audioManager.getIsStadiumMode());
  const [currentPlaylistId, setCurrentPlaylistId] = useState<PlaylistId>(() =>
    audioManager.getCurrentPlaylistId()
  );
  const [currentPlaylist, setCurrentPlaylist] = useState<PlaylistInfo>(() =>
    audioManager.getCurrentPlaylist()
  );
  const [currentPlaylistTracks, setCurrentPlaylistTracks] = useState<SoundtrackTrack[]>(() =>
    audioManager.getCurrentPlaylistTracks()
  );
  const [currentTrack, setCurrentTrack] = useState<SoundtrackTrack>(() =>
    audioManager.getCurrentTrack()
  );
  const [currentTrackIndex, setCurrentTrackIndex] = useState(() =>
    audioManager.getCurrentTrackIndex()
  );
  const [lockedPlaylistId, setLockedPlaylistIdState] = useState<PlaylistId | null>(() =>
    audioManager.getLockedPlaylist()
  );

  useEffect(() => {
    const unsubscribe = audioManager.subscribe(() => {
      setIsMuted(audioManager.getIsMuted());
      setVolumeState(audioManager.getVolume());
      setSoundtrackModeState(audioManager.getSoundtrackMode());
      setIsPlaying(audioManager.getIsPlaying());
      setIsStadiumMode(audioManager.getIsStadiumMode());
      setCurrentPlaylistId(audioManager.getCurrentPlaylistId());
      setCurrentPlaylist(audioManager.getCurrentPlaylist());
      setCurrentPlaylistTracks(audioManager.getCurrentPlaylistTracks());
      setCurrentTrack(audioManager.getCurrentTrack());
      setCurrentTrackIndex(audioManager.getCurrentTrackIndex());
      setLockedPlaylistIdState(audioManager.getLockedPlaylist());
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const toggleMute = useCallback(() => audioManager.toggleMute(), []);
  const setVolume = useCallback((v: number) => audioManager.setVolume(v), []);
  const setSoundtrackMode = useCallback((m: SoundtrackPlaybackMode) => audioManager.setSoundtrackMode(m), []);
  const nextTrack = useCallback(() => audioManager.nextTrack(), []);
  const prevTrack = useCallback(() => audioManager.prevTrack(), []);
  const setTrack = useCallback((idx: number) => audioManager.setTrack(idx), []);
  const setTrackById = useCallback((tId: string) => audioManager.setTrackById(tId), []);
  const setPlaylist = useCallback((pId: PlaylistId, startImmediately = true) =>
    audioManager.setPlaylist(pId, startImmediately), []);
  const setCompetitionContext = useCallback((
    comp?: string,
    country?: string,
    tier?: string,
    isPro?: boolean
  ) => audioManager.setCompetitionContext(comp, country, tier, isPro), []);
  const startMusic = useCallback(() => audioManager.startMusic(), []);
  const stopMusic = useCallback(() => audioManager.stopMusic(), []);
  const startIntroMusic = useCallback(() => audioManager.startIntroMusic(), []);
  const startMenuMusic = useCallback(() => audioManager.startMenuMusic(), []);
  const enterStadiumMode = useCallback(() => audioManager.enterStadiumMode(), []);
  const exitStadiumMode = useCallback(() => audioManager.exitStadiumMode(), []);
  const enterMatchMode = useCallback((
    competitionType: 'world' | 'continental' | 'domestic' | 'auto',
    competitionNameOrStage?: string,
    countryOrLeague?: string,
    tier?: string
  ) =>
    audioManager.enterMatchMode(
      competitionType,
      competitionNameOrStage,
      countryOrLeague,
      tier
    ), []);
  const enterMatchContextFromStage = useCallback((
    stageTitle?: string,
    player?: { league?: string; clubCountry?: string; country?: string },
    opponentName?: string,
    playerTeamName?: string,
    clubCountry?: string
  ) =>
    audioManager.enterMatchContextFromStage(
      stageTitle,
      player,
      opponentName,
      playerTeamName,
      clubCountry
    ), []);
  const exitMatchMode = useCallback((fallbackCountryOrLeague?: string) =>
    audioManager.exitMatchMode(fallbackCountryOrLeague), []);
  const isTrackEnabled = useCallback((tId: string) => audioManager.isTrackEnabled(tId), []);
  const setTrackEnabled = useCallback((tId: string, en: boolean) => audioManager.setTrackEnabled(tId, en), []);
  const enableAllTracks = useCallback((pId?: PlaylistId) => audioManager.enableAllTracks(pId), []);
  const disableAllTracks = useCallback((pId?: PlaylistId) => audioManager.disableAllTracks(pId), []);
  const getDisabledTrackIds = useCallback(() => audioManager.getDisabledTrackIds(), []);
  const setLockedPlaylist = useCallback((pId: PlaylistId | null) => audioManager.setLockedPlaylist(pId), []);

  const value = useMemo<AudioContextType>(() => ({
    isMuted,
    volume,
    soundtrackMode,
    isPlaying,
    isStadiumMode,
    currentPlaylistId,
    currentPlaylist,
    currentPlaylistTracks,
    currentTrack,
    currentTrackIndex,
    toggleMute,
    setVolume,
    setSoundtrackMode,
    nextTrack,
    prevTrack,
    setTrack,
    setTrackById,
    setPlaylist,
    setCompetitionContext,
    startMusic,
    stopMusic,
    startIntroMusic,
    startMenuMusic,
    enterStadiumMode,
    exitStadiumMode,
    enterMatchMode,
    enterMatchContextFromStage,
    exitMatchMode,
    isTrackEnabled,
    setTrackEnabled,
    enableAllTracks,
    disableAllTracks,
    getDisabledTrackIds,
    lockedPlaylistId,
    setLockedPlaylist,
  }), [
    isMuted,
    volume,
    soundtrackMode,
    isPlaying,
    isStadiumMode,
    currentPlaylistId,
    currentPlaylist,
    currentPlaylistTracks,
    currentTrack,
    currentTrackIndex,
    toggleMute,
    setVolume,
    setSoundtrackMode,
    nextTrack,
    prevTrack,
    setTrack,
    setTrackById,
    setPlaylist,
    setCompetitionContext,
    startMusic,
    stopMusic,
    startIntroMusic,
    startMenuMusic,
    enterStadiumMode,
    exitStadiumMode,
    enterMatchMode,
    enterMatchContextFromStage,
    exitMatchMode,
    isTrackEnabled,
    setTrackEnabled,
    enableAllTracks,
    disableAllTracks,
    getDisabledTrackIds,
    lockedPlaylistId,
    setLockedPlaylist,
  ]);

  return (
    <AudioCtx.Provider value={value}>
      {children}
    </AudioCtx.Provider>
  );
};

const staticFallbackAudioContext: AudioContextType = {
  get isMuted() { return audioManager.getIsMuted(); },
  get volume() { return audioManager.getVolume(); },
  get soundtrackMode() { return audioManager.getSoundtrackMode(); },
  get isPlaying() { return audioManager.getIsPlaying(); },
  get isStadiumMode() { return audioManager.getIsStadiumMode(); },
  get currentPlaylistId() { return audioManager.getCurrentPlaylistId(); },
  get currentPlaylist() { return audioManager.getCurrentPlaylist(); },
  get currentPlaylistTracks() { return audioManager.getCurrentPlaylistTracks(); },
  get currentTrack() { return audioManager.getCurrentTrack(); },
  get currentTrackIndex() { return audioManager.getCurrentTrackIndex(); },
  toggleMute: () => audioManager.toggleMute(),
  setVolume: (v: number) => audioManager.setVolume(v),
  setSoundtrackMode: (m: SoundtrackPlaybackMode) => audioManager.setSoundtrackMode(m),
  nextTrack: () => audioManager.nextTrack(),
  prevTrack: () => audioManager.prevTrack(),
  setTrack: (i: number) => audioManager.setTrack(i),
  setTrackById: (tId: string) => audioManager.setTrackById(tId),
  setPlaylist: (pId: PlaylistId, startImmediately = true) =>
    audioManager.setPlaylist(pId, startImmediately),
  setCompetitionContext: (
    comp?: string,
    country?: string,
    tier?: string,
    isPro?: boolean
  ) => audioManager.setCompetitionContext(comp, country, tier, isPro),
  startMusic: () => audioManager.startMusic(),
  stopMusic: () => audioManager.stopMusic(),
  startIntroMusic: () => audioManager.startIntroMusic(),
  startMenuMusic: () => audioManager.startMenuMusic(),
  enterStadiumMode: () => audioManager.enterStadiumMode(),
  exitStadiumMode: () => audioManager.exitStadiumMode(),
  enterMatchMode: (
    competitionType: 'world' | 'continental' | 'domestic' | 'auto',
    competitionNameOrStage?: string,
    countryOrLeague?: string,
    tier?: string
  ) =>
    audioManager.enterMatchMode(
      competitionType,
      competitionNameOrStage,
      countryOrLeague,
      tier
    ),
  enterMatchContextFromStage: (
    stageTitle?: string,
    player?: { league?: string; clubCountry?: string; country?: string },
    opponentName?: string,
    playerTeamName?: string,
    clubCountry?: string
  ) =>
    audioManager.enterMatchContextFromStage(
      stageTitle,
      player,
      opponentName,
      playerTeamName,
      clubCountry
    ),
  exitMatchMode: (fallbackCountryOrLeague?: string) =>
    audioManager.exitMatchMode(fallbackCountryOrLeague),
  isTrackEnabled: (tId: string) => audioManager.isTrackEnabled(tId),
  setTrackEnabled: (tId: string, en: boolean) => audioManager.setTrackEnabled(tId, en),
  enableAllTracks: (pId?: PlaylistId) => audioManager.enableAllTracks(pId),
  disableAllTracks: (pId?: PlaylistId) => audioManager.disableAllTracks(pId),
  getDisabledTrackIds: () => audioManager.getDisabledTrackIds(),
  get lockedPlaylistId() { return audioManager.getLockedPlaylist(); },
  setLockedPlaylist: (pId: PlaylistId | null) => audioManager.setLockedPlaylist(pId),
};

export function useAudio(): AudioContextType {
  const ctx = useContext(AudioCtx);
  return ctx || staticFallbackAudioContext;
}

