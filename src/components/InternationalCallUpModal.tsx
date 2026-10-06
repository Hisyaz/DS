import React, { useState, useEffect, useRef } from 'react';
import { InternationalCallUp } from '../types/nationalTeam';
import { PlayerCardData, Nationality } from '../types';
import {
  Globe,
  Shield,
  Lock,
  CheckCircle2,
  XCircle,
  Sparkles,
  ChevronRight,
  Phone,
  PhoneCall,
  PhoneOff,
  Volume2,
  VolumeX,
  FileText,
  UserCheck,
  Flag,
  Award,
} from 'lucide-react';
import { getEligibleNationalities } from '../utils/nationalTeamSystem';

interface InternationalCallUpModalProps {
  isOpen: boolean;
  callUp: InternationalCallUp | null;
  player: PlayerCardData;
  onAccept: (callUp: InternationalCallUp) => void;
  onDecline: (callUp: InternationalCallUp) => void;
  onChooseOtherNation?: (callUp: InternationalCallUp) => void;
  hasAlternativeNationalities?: boolean;
  onClose: () => void;
}

export const InternationalCallUpModal: React.FC<InternationalCallUpModalProps> = ({
  isOpen,
  callUp,
  player,
  onAccept,
  onDecline,
  onChooseOtherNation,
  hasAlternativeNationalities,
  onClose,
}) => {
  if (!isOpen || !callUp) return null;

  // Phone call state: 'ringing' -> 'connected' -> 'details'
  const [callState, setCallState] = useState<'ringing' | 'connected' | 'details'>('ringing');
  const [callSeconds, setCallSeconds] = useState<number>(0);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [pledgeAccepted, setPledgeAccepted] = useState<boolean>(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ringIntervalRef = useRef<number | null>(null);

  const currentActiveNat = player.nationality || { code: 'ENG', iso: 'gb-eng', name: 'England' };
  const targetNat = callUp.nation;
  const isSenior = callUp.tier === 'Senior';
  const isSwitching = currentActiveNat.code !== targetNat.code;

  // All eligible nations for multi-nationality check
  const allEligibleNats = getEligibleNationalities(player);
  const hasMultipleNats = allEligibleNats.length > 1;
  const otherNats = allEligibleNats.filter((n) => n.code.toUpperCase() !== targetNat.code.toUpperCase());

  // Web Audio Ringtone & SFX Synthesizer
  const playRingtoneBeep = () => {
    if (isAudioMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(480, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch {
      // Audio autoplay gracefully handled
    }
  };

  const playAnthemChime = () => {
    if (isAudioMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      // Major chord fanfare (C5 - E5 - G5 - C6)
      const freqs = [523.25, 659.25, 783.99, 1046.5];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.65);
      });
    } catch {
      // Audio fallback
    }
  };

  // Ringing loop
  useEffect(() => {
    if (callState === 'ringing') {
      playRingtoneBeep();
      const interval = window.setInterval(() => {
        playRingtoneBeep();
      }, 2200);
      ringIntervalRef.current = interval;
      return () => {
        if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
      };
    }
  }, [callState, isAudioMuted]);

  // Call timer when connected
  useEffect(() => {
    if (callState === 'connected') {
      const timer = window.setInterval(() => {
        setCallSeconds((s) => s + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [callState]);

  const formatCallTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  };

  const handleAnswerCall = () => {
    if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
    setCallState('connected');
  };

  const handleAcceptPledge = () => {
    setPledgeAccepted(true);
    playAnthemChime();
    setTimeout(() => {
      onAccept(callUp);
    }, 900);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
      style={{ touchAction: 'pan-y' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="w-full max-w-lg bg-slate-950 border-2 border-amber-500/60 rounded-3xl shadow-2xl p-4 sm:p-6 text-white my-auto max-h-[94vh] flex flex-col text-left relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background Ambient Glow & Scanlines */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Audio Mute & Close Top Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 shrink-0">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-[10px] font-black uppercase text-amber-300 tracking-wider">
              <Globe className="w-3 h-3 text-amber-400" />
              {targetNat.name.toUpperCase()} {callUp.tier.toUpperCase()} OFFICIAL SELECTION
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAudioMuted(!isAudioMuted)}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white transition"
              title={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: INCOMING CALL (RINGING SMARTPHONE SCREEN) */}
        {/* ========================================================================= */}
        {callState === 'ringing' && (
          <div className="flex-1 py-8 flex flex-col items-center justify-center text-center space-y-6">
            {/* Pulsing Manager / Federation Avatar */}
            <div className="relative">
              <div className="absolute -inset-3 rounded-full bg-emerald-500/20 animate-ping opacity-75" />
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-emerald-400/80 shadow-2xl shadow-emerald-500/30 overflow-hidden bg-slate-900 flex items-center justify-center">
                <img
                  src={`https://flagcdn.com/w160/${(targetNat.iso || 'gb-eng').toLowerCase()}.png`}
                  alt={targetNat.code}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute bottom-0 right-0 bg-emerald-500 p-2 rounded-full border-2 border-slate-950 shadow-lg">
                <Phone className="w-4 h-4 text-slate-950 animate-bounce" />
              </div>
            </div>

            {/* Caller Identification */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 animate-pulse flex items-center justify-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5" />
                Incoming Priority Call...
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">{callUp.managerName}</h2>
              <p className="text-xs text-slate-300">
                Head Coach • <strong className="text-amber-300">{targetNat.name} National Team</strong>
              </p>
              <div className="inline-block mt-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
                Tournament: <span className="text-white font-medium">{callUp.competitionName}</span>
              </div>
            </div>

            {/* Action Buttons: Answer vs Decline */}
            <div className="w-full pt-4 grid grid-cols-2 gap-4 max-w-xs">
              {/* Decline Button */}
              <button
                type="button"
                onClick={() => onDecline(callUp)}
                className="py-3 px-4 rounded-2xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-300 text-xs font-black flex flex-col items-center justify-center gap-1 shadow-lg transition active:scale-95 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-rose-500 flex items-center justify-center text-white mb-0.5">
                  <PhoneOff className="w-4 h-4" />
                </div>
                <span>DECLINE</span>
                <span className="text-[9px] text-rose-400 font-normal">-20 Fame / Bad Rep</span>
              </button>

              {/* Answer Call Button */}
              <button
                type="button"
                onClick={handleAnswerCall}
                className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 border border-emerald-400 text-white text-xs font-black flex flex-col items-center justify-center gap-1 shadow-lg shadow-emerald-600/30 transition active:scale-95 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-emerald-600 mb-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <span>ANSWER CALL</span>
                <span className="text-[9px] text-emerald-200 font-normal">Speak with Manager</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: CONNECTED PHONE CALL & NATIONAL PLEDGE DIALOGUE */}
        {/* ========================================================================= */}
        {callState === 'connected' && (
          <div className="flex-1 py-3 flex flex-col space-y-4">
            {/* Live Call Header */}
            <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 p-3 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-emerald-400/60 shrink-0">
                  <img
                    src={`https://flagcdn.com/w80/${(targetNat.iso || 'gb-eng').toLowerCase()}.png`}
                    alt={targetNat.code}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">{callUp.managerName}</h4>
                  <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                    Call Connected ({formatCallTime(callSeconds)})
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCallState('details')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold border border-slate-700 flex items-center gap-1"
              >
                <FileText className="w-3 h-3 text-amber-400" />
                <span>View Dossier</span>
              </button>
            </div>

            {/* Manager Interactive Dialogue Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 relative">
              <div className="flex items-center gap-2 text-xs font-black text-amber-400 uppercase tracking-wide">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Head Coach Dialogue</span>
              </div>

              <div className="space-y-2 text-xs text-slate-200 leading-relaxed font-sans">
                <p>
                  &ldquo;Hello, <strong className="text-amber-300">{player.name}</strong>. I am calling you personally
                  because the coaching staff and our federation have watched your recent matches. You represent the caliber
                  and spirit we need.&rdquo;
                </p>

                {hasMultipleNats && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 text-[11px] text-amber-200 space-y-1">
                    <div className="font-bold flex items-center gap-1.5 text-amber-300">
                      <Globe className="w-3.5 h-3.5" />
                      Multiple Nationalities Notice
                    </div>
                    <p>
                      &ldquo;We know you are also eligible to represent{' '}
                      <strong>{otherNats.map((n) => n.name).join(', ')}</strong>. Before I register our official tournament
                      squad list, you must decide where your heart lies.&rdquo;
                    </p>
                  </div>
                )}

                <p>
                  &ldquo;We want you in the squad for{' '}
                  <strong className="text-white">{callUp.competitionName}</strong> as a{' '}
                  <strong className="text-sky-300">{callUp.role}</strong>. Are you ready to take the pledge and represent{' '}
                  <strong className="text-amber-300">{targetNat.name}</strong>?&rdquo;
                </p>
              </div>

              {isSenior && (
                <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-2.5 text-[10px] text-rose-300 flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>
                    Senior Call-Up Lock: Committing here locks your Senior International allegiance permanently.
                  </span>
                </div>
              )}
            </div>

            {/* Interactive Player Responses */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-1">
                Select Your Response to Head Coach:
              </span>

              {/* Choice 1: Pledge Allegiance & Accept Call */}
              <button
                type="button"
                onClick={handleAcceptPledge}
                disabled={pledgeAccepted}
                className="w-full p-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 transition active:scale-98 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-slate-950 shrink-0" />
                  <div className="text-left">
                    <div>&ldquo;I pledge my allegiance to {targetNat.name}. I am ready!&rdquo; ⚽</div>
                    <div className="text-[10px] font-semibold text-slate-900/80">
                      +{callUp.bonusFame} Fame • Joins National Team Camp
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-950 shrink-0" />
              </button>

              {/* Choice 2: Respectfully decline to play for another eligible country (ZERO PENALTIES!) */}
              {hasMultipleNats && onChooseOtherNation && (
                <button
                  type="button"
                  onClick={() => onChooseOtherNation(callUp)}
                  className="w-full p-3 rounded-2xl bg-sky-950/80 hover:bg-sky-900/90 border border-sky-500/50 text-sky-200 font-bold text-xs shadow-md transition active:scale-98 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Globe className="w-5 h-5 text-sky-400 shrink-0" />
                    <div className="text-left">
                      <div>&ldquo;With respect Coach, I want to play for another country.&rdquo; 🌍</div>
                      <div className="text-[10px] text-sky-300 font-normal">
                        Polite declination • <strong>Zero penalties / No fame lost</strong>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-sky-400 shrink-0" />
                </button>
              )}

              {/* Choice 3: Outright Decline Call-Up (Negative Modifiers) */}
              <button
                type="button"
                onClick={() => onDecline(callUp)}
                className="w-full p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-rose-300 text-xs font-bold transition active:scale-98 flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <PhoneOff className="w-4 h-4 text-rose-400 shrink-0" />
                  <div className="text-left">
                    <div>&ldquo;I don&apos;t want to play for the national team right now.&rdquo;</div>
                    <div className="text-[10px] text-rose-400/80 font-normal">
                      Declines call-up • <strong>-20 Fame & +15 Bad Reputation</strong>
                    </div>
                  </div>
                </div>
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: FULL CALL-UP DOSSIER & SELECTION DETAILS */}
        {/* ========================================================================= */}
        {callState === 'details' && (
          <div className="flex-1 overflow-y-auto custom-scrollbar py-3 space-y-3">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-amber-400" /> Federation Selection Brief
                </span>
                <span className="text-xs font-mono font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                  +{callUp.bonusFame} Fame
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                National manager <strong className="text-white">{callUp.managerName}</strong> has reserved spot for{' '}
                <strong className="text-amber-300">{player.name}</strong> as a{' '}
                <strong className="text-sky-300">{callUp.role}</strong> in{' '}
                <strong className="text-white">{callUp.competitionName}</strong>.
              </p>
            </div>

            {/* Active Nationality Switching Preview Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 space-y-2">
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Active Nationality Impact</span>
                <span className="text-[10px] text-sky-400 font-normal">FIFA Statutes Compliance</span>
              </div>

              <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-medium">Current:</span>
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <img
                      src={`https://flagcdn.com/w40/${(currentActiveNat.iso || 'gb-eng').toLowerCase()}.png`}
                      alt={currentActiveNat.code}
                      className="w-4 h-3 object-cover rounded-[2px]"
                    />
                    <span>{currentActiveNat.name}</span>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-500" />

                <div className="flex items-center gap-2">
                  <span className="text-slate-400 font-medium">New Active:</span>
                  <div className="flex items-center gap-1.5 font-black text-amber-300">
                    <img
                      src={`https://flagcdn.com/w40/${(targetNat.iso || 'gb-eng').toLowerCase()}.png`}
                      alt={targetNat.code}
                      className="w-4 h-3 object-cover rounded-[2px]"
                    />
                    <span>{targetNat.name}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setCallState('connected')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
              >
                ← Return to Manager Call
              </button>
              <button
                type="button"
                onClick={handleAcceptPledge}
                className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black shadow-md transition"
              >
                Accept Selection ⚽
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
