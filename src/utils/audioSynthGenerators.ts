// ========================================================================
// 16-BIT CONSOLE SOUNDTRACK SYNTHESIS ENGINE (SNES & SEGA GENESIS / FM)
// High-Fidelity 16-Bit Procedural Web Audio Synthesis Engine
// Features: 2-Operator FM synthesis, Polyphonic Resonant String & Brass Envelopes,
// Lush Detuned Chorus Beds, 16-Bit Studio Percussion Kits, and Expressive Leads
// ========================================================================

import { getNoteFreq } from './audioNotes';

export class ChiptuneSynthEngine {
  // =========================================================================
  // 1. 16-BIT BASS ENGINES (FM Solid Bass, Slap Bass, Reese, Sub-Glide)
  // =========================================================================

  /**
   * 16-bit Sega Genesis / YM2612 FM Operator Bass (Crisp, punchy, metallic, solid)
   */
  public static synthFmBass(
    ctx: AudioContext,
    dest: GainNode,
    note: string,
    time: number,
    duration: number = 0.22,
    gainVal: number = 0.38,
    style: 'solid' | 'slap' | 'reese' | 'smooth' = 'solid'
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const dur = Math.max(0.04, isFinite(duration) ? duration : 0.22);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.38);
      const freq = getNoteFreq(note);

      // Carrier Oscillator
      const carrier = ctx.createOscillator();
      const carrierGain = ctx.createGain();

      // Modulator Oscillator (FM Synthesis)
      const modulator = ctx.createOscillator();
      const modGain = ctx.createGain();

      // Lowpass filter for analog warmth
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';

      if (style === 'slap') {
        // High modulator ratio for metallic slap pop
        carrier.type = 'sawtooth';
        modulator.type = 'sine';
        modulator.frequency.setValueAtTime(freq * 3.0, t);
        modGain.gain.setValueAtTime(freq * 2.5, t);
        modGain.gain.exponentialRampToValueAtTime(0.01, t + Math.min(0.08, dur * 0.4));

        filter.frequency.setValueAtTime(3200, t);
        filter.frequency.exponentialRampToValueAtTime(600, t + dur);
        filter.Q.setValueAtTime(3.5, t);
      } else if (style === 'reese') {
        // Detuned dual carrier for reese / grime bass
        carrier.type = 'sawtooth';
        modulator.type = 'sawtooth';
        modulator.frequency.setValueAtTime(freq * 1.008, t);
        modGain.gain.setValueAtTime(freq * 0.4, t);

        filter.frequency.setValueAtTime(1400, t);
        filter.frequency.linearRampToValueAtTime(450, t + dur);
        filter.Q.setValueAtTime(2.0, t);
      } else if (style === 'smooth') {
        carrier.type = 'triangle';
        modulator.type = 'sine';
        modulator.frequency.setValueAtTime(freq * 2.0, t);
        modGain.gain.setValueAtTime(freq * 0.8, t);
        modGain.gain.exponentialRampToValueAtTime(0.01, t + dur * 0.7);

        filter.frequency.setValueAtTime(1800, t);
        filter.frequency.exponentialRampToValueAtTime(350, t + dur);
        filter.Q.setValueAtTime(1.0, t);
      } else {
        // Solid 16-bit FM Bass (Classic Genesis / Streets of Rage / Sonic)
        carrier.type = 'sine';
        modulator.type = 'sawtooth';
        modulator.frequency.setValueAtTime(freq * 2.0, t);
        modGain.gain.setValueAtTime(freq * 1.8, t);
        modGain.gain.exponentialRampToValueAtTime(freq * 0.05, t + Math.min(0.12, dur * 0.6));

        filter.frequency.setValueAtTime(2400, t);
        filter.frequency.exponentialRampToValueAtTime(400, t + dur);
        filter.Q.setValueAtTime(2.2, t);
      }

      carrier.frequency.setValueAtTime(freq, t);
      modulator.connect(carrier.frequency);

      // Volume envelope
      carrierGain.gain.setValueAtTime(0.0001, t);
      const attackEnd = t + Math.min(0.006, dur * 0.15);
      carrierGain.gain.linearRampToValueAtTime(g, attackEnd);
      carrierGain.gain.exponentialRampToValueAtTime(0.0001, Math.max(attackEnd + 0.005, t + dur));

      // Sub-bass layer for chest punch
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'triangle';
      subOsc.frequency.setValueAtTime(freq * 0.5, t);
      subGain.gain.setValueAtTime(g * 0.35, t);
      subGain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      subOsc.connect(subGain);
      subGain.connect(dest);

      carrier.connect(carrierGain);
      carrierGain.connect(filter);
      filter.connect(dest);

      modulator.start(t);
      carrier.start(t);
      subOsc.start(t);

      modulator.stop(t + dur);
      carrier.stop(t + dur);
      subOsc.stop(t + dur);
    } catch {}
  }

  /**
   * 16-Bit Deep SNES / Console Bass (Full warm triangle + lowpass saturation)
   */
  public static synthTriangleBass(
    ctx: AudioContext,
    dest: GainNode,
    note: string,
    time: number,
    duration: number = 0.28,
    gainVal: number = 0.36
  ) {
    // Automatically uses 16-bit FM Bass for richer harmonic punch!
    this.synthFmBass(ctx, dest, note, time, duration, gainVal, 'solid');
  }

  /**
   * 16-Bit 808 Sub Bass Glide (For UK Drill, French Afro-Trap, Modern Urban)
   */
  public static synthSubBass808(
    ctx: AudioContext,
    dest: GainNode,
    note: string,
    time: number,
    duration: number = 0.45,
    gainVal: number = 0.42,
    slideNote?: string
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const dur = Math.max(0.1, isFinite(duration) ? duration : 0.45);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.42);
      const freq = getNoteFreq(note);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * 1.3, t); // Initial punch drop
      osc.frequency.exponentialRampToValueAtTime(freq, t + 0.04);

      if (slideNote) {
        const slideFreq = getNoteFreq(slideNote);
        osc.frequency.setValueAtTime(freq, t + dur * 0.4);
        osc.frequency.exponentialRampToValueAtTime(slideFreq, t + dur * 0.85);
      }

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, t);
      filter.Q.setValueAtTime(1.5, t);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(g, t + 0.01);
      gain.gain.setValueAtTime(g * 0.9, t + dur * 0.6);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      osc.start(t);
      osc.stop(t + dur);
    } catch {}
  }

  // =========================================================================
  // 2. 16-BIT POLYPHONIC INSTRUMENTS (Pads, Strings, Brass, Piano, Accordion)
  // =========================================================================

  /**
   * 16-Bit SNES Lush Strings / Synth Pad Bed (Multi-voice detuned stereo chorusing)
   */
  public static synthPadStrings(
    ctx: AudioContext,
    dest: GainNode,
    notes: string[],
    time: number,
    duration: number = 0.6,
    gainVal: number = 0.16
  ) {
    if (!ctx || !dest || !notes || notes.length === 0 || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const dur = Math.max(0.08, isFinite(duration) ? duration : 0.6);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.16);
      const perVoiceGain = g / Math.max(1, notes.length * 0.75);

      notes.forEach((note, nIdx) => {
        try {
          const freq = getNoteFreq(note);
          [-6, 0, 6].forEach((detuneCents) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            osc.type = nIdx % 2 === 0 ? 'sawtooth' : 'triangle';
            osc.frequency.setValueAtTime(freq, t);
            osc.detune.setValueAtTime(detuneCents, t);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800, t);
            filter.frequency.linearRampToValueAtTime(2200, t + dur * 0.4);
            filter.frequency.linearRampToValueAtTime(900, t + dur);
            filter.Q.setValueAtTime(1.0, t);

            gain.gain.setValueAtTime(0.0001, t);
            const attack = t + Math.min(0.06, dur * 0.25);
            gain.gain.linearRampToValueAtTime(perVoiceGain * 0.35, attack);
            gain.gain.exponentialRampToValueAtTime(0.0001, Math.max(attack + 0.01, t + dur));

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(dest);

            osc.start(t);
            osc.stop(t + dur);
          });
        } catch {}
      });
    } catch {}
  }

  /**
   * 16-Bit Polyphonic Synth Brass Fanfares & Stabs
   */
  public static synthBrass(
    ctx: AudioContext,
    dest: GainNode,
    notes: string[],
    time: number,
    duration: number = 0.32,
    gainVal: number = 0.22,
    isPunchy: boolean = true
  ) {
    if (!ctx || !dest || !notes || notes.length === 0 || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const dur = Math.max(0.05, isFinite(duration) ? duration : 0.32);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.22);
      const perNoteGain = g / Math.max(1, notes.length * 0.65);

      notes.forEach((note) => {
        try {
          const freq = getNoteFreq(note);
          [-8, 8].forEach((detune) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(freq, t);
            osc.detune.setValueAtTime(detune, t);

            filter.type = 'lowpass';
            if (isPunchy) {
              filter.frequency.setValueAtTime(600, t);
              filter.frequency.exponentialRampToValueAtTime(3800, t + 0.035);
              filter.frequency.exponentialRampToValueAtTime(1400, t + dur);
              filter.Q.setValueAtTime(3.2, t);
            } else {
              filter.frequency.setValueAtTime(1200, t);
              filter.frequency.linearRampToValueAtTime(2600, t + dur * 0.5);
              filter.frequency.linearRampToValueAtTime(1200, t + dur);
              filter.Q.setValueAtTime(1.5, t);
            }

            gain.gain.setValueAtTime(0.0001, t);
            const attackEnd = t + Math.min(0.015, dur * 0.15);
            gain.gain.linearRampToValueAtTime(perNoteGain * 0.5, attackEnd);
            gain.gain.exponentialRampToValueAtTime(0.0001, Math.max(attackEnd + 0.01, t + dur));

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(dest);

            osc.start(t);
            osc.stop(t + dur);
          });
        } catch {}
      });
    } catch {}
  }

  /**
   * 16-Bit Polyphonic Chord Stabs (Backwards compatible upgrade to synthSquareChord)
   */
  public static synthSquareChord(
    ctx: AudioContext,
    dest: GainNode,
    notes: string[],
    time: number,
    duration: number = 0.35,
    gainVal: number = 0.16
  ) {
    this.synthBrass(ctx, dest, notes, time, duration, gainVal, true);
  }

  /**
   * 16-Bit DX7 / FM Electric Piano (Crystal bells + warm Rhodes body)
   */
  public static synthFmPiano(
    ctx: AudioContext,
    dest: GainNode,
    note: string,
    time: number,
    duration: number = 0.35,
    gainVal: number = 0.18
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const dur = Math.max(0.05, isFinite(duration) ? duration : 0.35);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.18);
      const freq = getNoteFreq(note);

      // Carrier (warm tone)
      const carrier = ctx.createOscillator();
      const carrierGain = ctx.createGain();
      carrier.type = 'sine';
      carrier.frequency.setValueAtTime(freq, t);

      // Bell Modulator (FM chime)
      const modulator = ctx.createOscillator();
      const modGain = ctx.createGain();
      modulator.type = 'sine';
      modulator.frequency.setValueAtTime(freq * 7.0, t); // 7th harmonic bell chime
      modGain.gain.setValueAtTime(freq * 1.5, t);
      modGain.gain.exponentialRampToValueAtTime(0.01, t + Math.min(0.15, dur * 0.5));
      modulator.connect(carrier.frequency);

      carrierGain.gain.setValueAtTime(0.0001, t);
      carrierGain.gain.linearRampToValueAtTime(g, t + 0.004);
      carrierGain.gain.exponentialRampToValueAtTime(g * 0.3, t + 0.1);
      carrierGain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      carrier.connect(carrierGain);
      carrierGain.connect(dest);

      modulator.start(t);
      carrier.start(t);
      modulator.stop(t + dur);
      carrier.stop(t + dur);
    } catch {}
  }

  /**
   * 16-Bit Accordion & Bandoneón (Dual-reed tremolo beating for French musette & Argentine cumbia)
   */
  public static synthAccordion(
    ctx: AudioContext,
    dest: GainNode,
    note: string,
    time: number,
    duration: number = 0.26,
    gainVal: number = 0.2
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const dur = Math.max(0.04, isFinite(duration) ? duration : 0.26);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.2);
      const freq = getNoteFreq(note);

      // Dual reed with ±10 cents beating
      [-10, 10].forEach((detune) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);
        osc.detune.setValueAtTime(detune, t);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1600, t);
        filter.Q.setValueAtTime(1.8, t);

        gain.gain.setValueAtTime(0.0001, t);
        const attackEnd = t + Math.min(0.02, dur * 0.15);
        gain.gain.linearRampToValueAtTime(g * 0.5, attackEnd);
        gain.gain.exponentialRampToValueAtTime(0.0001, Math.max(attackEnd + 0.01, t + dur));

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(dest);

        osc.start(t);
        osc.stop(t + dur);
      });
    } catch {}
  }

  /**
   * 16-Bit Spanish / Flamenco Nylon Acoustic Guitar Pluck
   */
  public static synthNylonGuitar(
    ctx: AudioContext,
    dest: GainNode,
    note: string,
    time: number,
    duration: number = 0.22,
    gainVal: number = 0.24
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const dur = Math.max(0.04, isFinite(duration) ? duration : 0.22);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.24);
      const freq = getNoteFreq(note);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);

      // Pluck filter transient
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(4200, t);
      filter.frequency.exponentialRampToValueAtTime(800, t + Math.min(0.12, dur));
      filter.Q.setValueAtTime(2.5, t);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(g, t + 0.003);
      gain.gain.exponentialRampToValueAtTime(g * 0.25, t + 0.07);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      osc.start(t);
      osc.stop(t + dur);
    } catch {}
  }

  /**
   * 16-Bit British Rock / Punk Power Chord with Overdrive Resonance
   */
  public static synthPowerChord(
    ctx: AudioContext,
    dest: GainNode,
    rootNote: string,
    fifthNote: string,
    octaveNote: string,
    time: number,
    duration: number = 0.25,
    gainVal: number = 0.24
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const dur = Math.max(0.05, isFinite(duration) ? duration : 0.25);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.24);
      const notes = [rootNote, fifthNote, octaveNote];

      notes.forEach((n, i) => {
        try {
          const freq = getNoteFreq(n);
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, t);
          osc.detune.setValueAtTime((i - 1) * 7, t);

          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(1800, t);
          filter.Q.setValueAtTime(2.2, t);

          gain.gain.setValueAtTime(0.0001, t);
          gain.gain.linearRampToValueAtTime(g * 0.38, t + 0.006);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(dest);

          osc.start(t);
          osc.stop(t + dur);
        } catch {}
      });
    } catch {}
  }

  /**
   * 16-Bit Shakuhachi / Pan Flute / Whistling Air Lead
   */
  public static synthPanFlute(
    ctx: AudioContext,
    dest: GainNode,
    note: string,
    time: number,
    duration: number = 0.3,
    gainVal: number = 0.2
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const dur = Math.max(0.05, isFinite(duration) ? duration : 0.3);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.2);
      const freq = getNoteFreq(note);

      // Core tone
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      // Vibrato LFO
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(5.5, t);
      lfoGain.gain.setValueAtTime(freq * 0.015, t);
      lfo.connect(osc.frequency);

      oscGain.gain.setValueAtTime(0.0001, t);
      oscGain.gain.linearRampToValueAtTime(g * 0.9, t + 0.03);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      osc.connect(oscGain);
      oscGain.connect(dest);

      // Breath chiff noise transient
      const bufferSize = Math.floor(ctx.sampleRate * 0.05);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(freq * 1.5, t);
      noiseFilter.Q.setValueAtTime(3.0, t);
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(g * 0.4, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(dest);

      lfo.start(t);
      osc.start(t);
      noise.start(t);

      lfo.stop(t + dur);
      osc.stop(t + dur);
      noise.stop(t + 0.05);
    } catch {}
  }

  /**
   * 16-Bit Wooden Marimba / Steel Drum / Kalimba
   */
  public static synthMarimba(
    ctx: AudioContext,
    dest: GainNode,
    note: string,
    time: number,
    duration: number = 0.22,
    gainVal: number = 0.22
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const dur = Math.max(0.04, isFinite(duration) ? duration : 0.22);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.22);
      const freq = getNoteFreq(note);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq * 1.2, t);
      filter.Q.setValueAtTime(3.5, t);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(g, t + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      osc.start(t);
      osc.stop(t + dur);
    } catch {}
  }

  /**
   * 16-Bit Hammond Drawbar Organ (Fundamental + 8ve + 5th with rotary tremolo)
   */
  public static synthOrgan(
    ctx: AudioContext,
    dest: GainNode,
    note: string,
    time: number,
    duration: number = 0.25,
    gainVal: number = 0.2
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const dur = Math.max(0.04, isFinite(duration) ? duration : 0.25);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.2);
      const freq = getNoteFreq(note);

      [1.0, 2.0, 3.0].forEach((mult, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq * mult, t);

        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime((g * 0.4) / (idx + 1), t + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

        osc.connect(gain);
        gain.connect(dest);

        osc.start(t);
        osc.stop(t + dur);
      });
    } catch {}
  }

  /**
   * 16-Bit Expressive Lead (Dual detuned saw/pulse with warm resonant lowpass filter & vibrato)
   */
  public static synthSquare(
    ctx: AudioContext,
    dest: GainNode,
    note: string,
    time: number,
    duration: number = 0.18,
    gainVal: number = 0.18,
    dutyType: 'square' | 'sawtooth' = 'square'
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const dur = Math.max(0.03, isFinite(duration) ? duration : 0.18);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.18);
      const freq = getNoteFreq(note);

      // Primary oscillator
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc1.type = dutyType;
      osc2.type = dutyType === 'sawtooth' ? 'square' : 'sawtooth';

      osc1.frequency.setValueAtTime(freq, t);
      osc2.frequency.setValueAtTime(freq, t);
      osc2.detune.setValueAtTime(7, t); // Chorus detune

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3600, t);
      filter.frequency.exponentialRampToValueAtTime(1400, t + dur);
      filter.Q.setValueAtTime(2.0, t);

      gain.gain.setValueAtTime(0.0001, t);
      const attackEnd = t + Math.min(0.008, dur * 0.15);
      gain.gain.linearRampToValueAtTime(g, attackEnd);
      gain.gain.exponentialRampToValueAtTime(0.0001, Math.max(attackEnd + 0.005, t + dur));

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + dur);
      osc2.stop(t + dur);
    } catch {}
  }

  /**
   * 16-Bit Cascading Polyphonic Arpeggio
   */
  public static synthChiptuneArp(
    ctx: AudioContext,
    dest: GainNode,
    notes: string[],
    time: number,
    stepDuration: number = 0.25,
    gainVal: number = 0.16
  ) {
    if (!ctx || !dest || !notes || notes.length === 0 || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const dur = Math.max(0.03, isFinite(stepDuration) ? stepDuration : 0.25);
      const noteTime = dur / notes.length;
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.16);

      notes.forEach((n, idx) => {
        try {
          const startTime = t + idx * noteTime;
          this.synthSquare(ctx, dest, n, startTime, noteTime * 0.95, g, 'square');
        } catch {}
      });
    } catch {}
  }

  // =========================================================================
  // 3. 16-BIT CONSOLE & ARCADE DRUM KITS (Punchy PCM-Style Layered Percussion)
  // =========================================================================

  /**
   * 16-Bit Punchy Studio Kick Drum (Sub-Sweep + Transient Click)
   */
  public static synthKick(
    ctx: AudioContext,
    dest: GainNode,
    time: number,
    gainVal: number = 0.48,
    punchiness: number = 1.0
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.48);
      const p = Math.max(0.2, isFinite(punchiness) ? punchiness : 1.0);

      // Sub Boom Oscillator
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(180 * p, t);
      subOsc.frequency.exponentialRampToValueAtTime(36, t + 0.09);

      subGain.gain.setValueAtTime(g, t);
      subGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      subOsc.connect(subGain);
      subGain.connect(dest);

      // Punchy Click Transient
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'triangle';
      clickOsc.frequency.setValueAtTime(320, t);
      clickOsc.frequency.exponentialRampToValueAtTime(60, t + 0.02);
      clickGain.gain.setValueAtTime(g * 0.6, t);
      clickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);
      clickOsc.connect(clickGain);
      clickGain.connect(dest);

      subOsc.start(t);
      clickOsc.start(t);
      subOsc.stop(t + 0.22);
      clickOsc.stop(t + 0.025);
    } catch {}
  }

  /**
   * 16-Bit Studio Snare Drum (Tuned Shell + Crispy Snare Noise Wire)
   */
  public static synthSnare(
    ctx: AudioContext,
    dest: GainNode,
    time: number,
    gainVal: number = 0.38,
    isTight: boolean = false
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.38);

      // Tuned Snare Shell
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, t);
      osc.frequency.exponentialRampToValueAtTime(110, t + 0.06);
      oscGain.gain.setValueAtTime(g * 0.65, t);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
      osc.connect(oscGain);
      oscGain.connect(dest);
      osc.start(t);
      osc.stop(t + 0.09);

      // Crisp Shaped Noise Wire
      const dur = isTight ? 0.11 : 0.18;
      const bufferSize = Math.floor(ctx.sampleRate * dur);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2400, t);
      filter.Q.setValueAtTime(1.2, t);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(g * 0.9, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(dest);

      noise.start(t);
      noise.stop(t + dur);
    } catch {}
  }

  /**
   * 16-Bit Metallic Hi-Hat (Crisp Closed / Sizzling Open)
   */
  public static synthHiHat(
    ctx: AudioContext,
    dest: GainNode,
    time: number,
    isOpen: boolean = false,
    gainVal: number = 0.14
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.14);
      const dur = isOpen ? 0.24 : 0.04;
      const bufferSize = Math.floor(ctx.sampleRate * dur);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(7500, t);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(g, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      noise.start(t);
      noise.stop(t + dur);
    } catch {}
  }

  /**
   * 16-Bit Shimmering Crash Cymbal
   */
  public static synthCrash(
    ctx: AudioContext,
    dest: GainNode,
    time: number,
    gainVal: number = 0.4
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.4);
      const dur = 1.4;
      const bufferSize = Math.floor(ctx.sampleRate * dur);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(4500, t);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(g, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      noise.start(t);
      noise.stop(t + dur);
    } catch {}
  }

  /**
   * 16-Bit Multi-Layer Handclap (Wide studio snap)
   */
  public static synthClap(
    ctx: AudioContext,
    dest: GainNode,
    time: number,
    gainVal: number = 0.32
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.32);
      const bufferSize = Math.floor(ctx.sampleRate * 0.2);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      [0, 0.011, 0.022].forEach((offset) => {
        try {
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(1500, t + offset);
          filter.Q.setValueAtTime(1.5, t + offset);

          const gain = ctx.createGain();
          gain.gain.setValueAtTime(g * 0.75, t + offset);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + offset + 0.14);

          noise.connect(filter);
          filter.connect(gain);
          gain.connect(dest);

          noise.start(t + offset);
          noise.stop(t + offset + 0.14);
        } catch {}
      });
    } catch {}
  }

  /**
   * 16-Bit Resonant Agogô Bells (Brazilian Funk & Carnival Samba)
   */
  public static synthAgogo(
    ctx: AudioContext,
    dest: GainNode,
    isHigh: boolean,
    time: number,
    gainVal: number = 0.24
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.24);
      const freq = isHigh ? 880 : 587.33; // A5 or D5

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq * 1.5, t);
      filter.Q.setValueAtTime(4.0, t);

      gain.gain.setValueAtTime(g, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      osc.start(t);
      osc.stop(t + 0.16);
    } catch {}
  }

  /**
   * 16-Bit Latin Congas & Bongos
   */
  public static synthConga(
    ctx: AudioContext,
    dest: GainNode,
    isHigh: boolean,
    isSlap: boolean,
    time: number,
    gainVal: number = 0.28
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.28);
      const baseFreq = isHigh ? (isSlap ? 440 : 330) : 190;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * 1.4, t);
      osc.frequency.exponentialRampToValueAtTime(baseFreq, t + 0.03);

      gain.gain.setValueAtTime(g, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + (isSlap ? 0.08 : 0.18));

      osc.connect(gain);
      gain.connect(dest);

      osc.start(t);
      osc.stop(t + (isSlap ? 0.08 : 0.18));
    } catch {}
  }

  /**
   * 16-Bit Pitched Tom-Toms (High / Mid / Low drum fills)
   */
  public static synthTom(
    ctx: AudioContext,
    dest: GainNode,
    pitch: 'high' | 'mid' | 'low',
    time: number,
    gainVal: number = 0.32
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.32);
      const startFreq = pitch === 'high' ? 220 : pitch === 'mid' ? 160 : 110;
      const endFreq = startFreq * 0.45;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(startFreq, t);
      osc.frequency.exponentialRampToValueAtTime(endFreq, t + 0.12);

      gain.gain.setValueAtTime(g, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(t);
      osc.stop(t + 0.18);
    } catch {}
  }

  /**
   * 16-Bit Güiro Scrape (Argentine Cumbia & Tropical)
   */
  public static synthGuiro(
    ctx: AudioContext,
    dest: GainNode,
    isLong: boolean,
    time: number,
    gainVal: number = 0.18
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.18);
      const dur = isLong ? 0.15 : 0.06;
      const bufferSize = Math.floor(ctx.sampleRate * dur);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(isLong ? 2600 : 3400, t);
      filter.Q.setValueAtTime(3.5, t);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(g, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      noise.start(t);
      noise.stop(t + dur);
    } catch {}
  }

  /**
   * 16-Bit Shaker / Cabasa (Brazilian Samba & Afrobeat)
   */
  public static synthShaker(
    ctx: AudioContext,
    dest: GainNode,
    time: number,
    gainVal: number = 0.14
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.14);
      const dur = 0.055;
      const bufferSize = Math.floor(ctx.sampleRate * dur);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(5500, t);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(g, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      noise.start(t);
      noise.stop(t + dur);
    } catch {}
  }

  /**
   * 16-Bit 808 Cowbell
   */
  public static synthCowbell(
    ctx: AudioContext,
    dest: GainNode,
    time: number,
    gainVal: number = 0.2
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.2);

      [587.33, 845.0].forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, t);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(freq, t);
        filter.Q.setValueAtTime(5.0, t);

        gain.gain.setValueAtTime(g * 0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(dest);

        osc.start(t);
        osc.stop(t + 0.14);
      });
    } catch {}
  }

  /**
   * 16-Bit Samba Carnival Whistle Motif
   */
  public static synthWhistle(
    ctx: AudioContext,
    dest: GainNode,
    note: string,
    time: number,
    gainVal: number = 0.22
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.22);
      const freq = getNoteFreq(note);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.linearRampToValueAtTime(freq * 1.06, t + 0.05);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(g, t + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(t);
      osc.stop(t + 0.14);
    } catch {}
  }

  // =========================================================================
  // 4. MODERN & ITALIAN SYMPHONIC / POP-ROCK INSTRUMENTATION ENGINES
  // Full modern instrumentation: Grand Piano, Singing Electric Guitar,
  // Warm Acoustic Guitar, Expressive Italian Vocals, Orchestral Strings & Timpani
  // =========================================================================

  /**
   * Concert Grand Acoustic Piano (Multi-harmonic hammer strike & rich soundboard resonance)
   */
  public static synthConcertPiano(
    ctx: AudioContext,
    dest: GainNode,
    note: string,
    time: number,
    duration: number = 0.65,
    gainVal: number = 0.24,
    velocity: number = 1.0
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const dur = Math.max(0.08, isFinite(duration) ? duration : 0.65);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal * velocity : 0.24);
      const freq = getNoteFreq(note);

      // Fundamental & Harmonic Tines
      [
        { mult: 1.0, type: 'triangle' as OscillatorType, weight: 0.65, detune: 0 },
        { mult: 2.0, type: 'sine' as OscillatorType, weight: 0.28, detune: 3 },
        { mult: 3.0, type: 'sine' as OscillatorType, weight: 0.12, detune: -2 },
        { mult: 4.0, type: 'sine' as OscillatorType, weight: 0.06, detune: 4 },
      ].forEach((harm) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = harm.type;
        osc.frequency.setValueAtTime(freq * harm.mult, t);
        osc.detune.setValueAtTime(harm.detune, t);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(Math.min(12000, freq * 4.5 * velocity), t);
        filter.frequency.exponentialRampToValueAtTime(Math.max(300, freq * 1.5), t + dur);

        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(g * harm.weight, t + 0.004);
        gain.gain.exponentialRampToValueAtTime(g * harm.weight * 0.35, t + 0.12);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(dest);

        osc.start(t);
        osc.stop(t + dur);
      });

      // Hammer Strike Transient Felt Thump
      const hammerOsc = ctx.createOscillator();
      const hammerGain = ctx.createGain();
      hammerOsc.type = 'sine';
      hammerOsc.frequency.setValueAtTime(freq * 3.2, t);
      hammerOsc.frequency.exponentialRampToValueAtTime(freq * 0.8, t + 0.02);
      hammerGain.gain.setValueAtTime(g * 0.22, t);
      hammerGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);
      hammerOsc.connect(hammerGain);
      hammerGain.connect(dest);
      hammerOsc.start(t);
      hammerOsc.stop(t + 0.025);
    } catch {}
  }

  /**
   * Warm Acoustic Guitar (Steel/Nylon fingerpicking with resonant wooden soundboard)
   */
  public static synthAcousticGuitar(
    ctx: AudioContext,
    dest: GainNode,
    note: string,
    time: number,
    duration: number = 0.45,
    gainVal: number = 0.22,
    isMuted: boolean = false
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const dur = Math.max(0.05, isFinite(duration) ? duration : 0.45);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.22);
      const freq = getNoteFreq(note);

      // Core String Pluck (Saw + Triangle blend)
      [-4, 4].forEach((detune) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const bodyFilter = ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);
        osc.detune.setValueAtTime(detune, t);

        // Acoustic guitar body formant resonance (around 220Hz and 1.8kHz)
        bodyFilter.type = 'bandpass';
        bodyFilter.frequency.setValueAtTime(Math.min(3800, freq * 2.8), t);
        bodyFilter.frequency.exponentialRampToValueAtTime(Math.max(250, freq * 1.2), t + (isMuted ? 0.08 : dur));
        bodyFilter.Q.setValueAtTime(2.2, t);

        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(g * 0.5, t + 0.004);
        gain.gain.exponentialRampToValueAtTime(g * 0.2, t + (isMuted ? 0.06 : 0.14));
        gain.gain.exponentialRampToValueAtTime(0.0001, t + (isMuted ? 0.12 : dur));

        osc.connect(bodyFilter);
        bodyFilter.connect(gain);
        gain.connect(dest);

        osc.start(t);
        osc.stop(t + (isMuted ? 0.12 : dur));
      });
    } catch {}
  }

  /**
   * Singing Overdrive Electric Guitar (Rock anthem solos, arpeggiated riffs, and power leads)
   */
  public static synthElectricGuitar(
    ctx: AudioContext,
    dest: GainNode,
    note: string,
    time: number,
    duration: number = 0.35,
    gainVal: number = 0.25,
    style: 'lead' | 'power' | 'clean' | 'muted' = 'lead'
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const dur = Math.max(0.04, isFinite(duration) ? duration : 0.35);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.25);
      const freq = getNoteFreq(note);

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const cabFilter = ctx.createBiquadFilter();

      osc1.type = 'sawtooth';
      osc2.type = 'square';
      osc1.frequency.setValueAtTime(freq, t);
      osc2.frequency.setValueAtTime(freq, t);
      osc2.detune.setValueAtTime(8, t);

      // Natural singing vibrato for sustained notes
      if (dur > 0.3 && style === 'lead') {
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(5.8, t); // 5.8 Hz vibrato
        lfoGain.gain.setValueAtTime(0, t);
        lfoGain.gain.setValueAtTime(0, t + 0.12); // delayed vibrato onset
        lfoGain.gain.linearRampToValueAtTime(freq * 0.025, t + 0.28);
        lfo.connect(lfoGain);
        lfoGain.connect(osc1.frequency);
        lfoGain.connect(osc2.frequency);
        lfo.start(t);
        lfo.stop(t + dur);
      }

      // Guitar amp cabinet emulation (peaking midrange bandpass)
      cabFilter.type = 'bandpass';
      if (style === 'lead') {
        cabFilter.frequency.setValueAtTime(2200, t);
        cabFilter.Q.setValueAtTime(2.8, t);
      } else if (style === 'clean') {
        cabFilter.frequency.setValueAtTime(3200, t);
        cabFilter.Q.setValueAtTime(1.4, t);
      } else {
        cabFilter.frequency.setValueAtTime(1600, t);
        cabFilter.Q.setValueAtTime(3.2, t);
      }

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(g, t + 0.008);
      if (style === 'lead') {
        gain.gain.setValueAtTime(g * 0.85, t + dur * 0.6);
      }
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      osc1.connect(cabFilter);
      osc2.connect(cabFilter);
      cabFilter.connect(gain);
      gain.connect(dest);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + dur);
      osc2.stop(t + dur);
    } catch {}
  }

  /**
   * Warm Analog Synth (Oberheim/Prophet-inspired warm brass, pads, and summer leads)
   */
  public static synthWarmAnalogLead(
    ctx: AudioContext,
    dest: GainNode,
    note: string,
    time: number,
    duration: number = 0.35,
    gainVal: number = 0.22,
    filterSweep: boolean = true
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const dur = Math.max(0.05, isFinite(duration) ? duration : 0.35);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.22);
      const freq = getNoteFreq(note);

      // Triple detuned analog saw wave stack
      [-9, 0, 9].forEach((detune) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);
        osc.detune.setValueAtTime(detune, t);

        filter.type = 'lowpass';
        if (filterSweep) {
          filter.frequency.setValueAtTime(750, t);
          filter.frequency.exponentialRampToValueAtTime(4800, t + 0.06);
          filter.frequency.exponentialRampToValueAtTime(1600, t + dur);
          filter.Q.setValueAtTime(3.8, t);
        } else {
          filter.frequency.setValueAtTime(2800, t);
          filter.Q.setValueAtTime(1.8, t);
        }

        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(g * 0.4, t + 0.015);
        gain.gain.setValueAtTime(g * 0.35, t + dur * 0.5);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(dest);

        osc.start(t);
        osc.stop(t + dur);
      });
    } catch {}
  }

  /**
   * Expressive Italian Vocal / Tenor / Classical Crossover Formant Synthesizer
   * Produces authentic vocal phrasing, expressive vibrato, and vowel formants ('ah', 'oh', 'eh')
   */
  public static synthItalianVocal(
    ctx: AudioContext,
    dest: GainNode,
    note: string,
    time: number,
    duration: number = 0.55,
    gainVal: number = 0.26,
    vowel: 'ah' | 'oh' | 'eh' | 'ee' = 'ah',
    isTenorClimax: boolean = false
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const dur = Math.max(0.08, isFinite(duration) ? duration : 0.55);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.26);
      const freq = getNoteFreq(note);

      // Voice Glottal Source (Dual detuned sawtooth with soft pulse)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, t);
      osc2.frequency.setValueAtTime(freq, t);
      osc2.detune.setValueAtTime(6, t);

      // Human Singing Vibrato (5.4 Hz with progressive depth)
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(5.4, t);
      lfoGain.gain.setValueAtTime(0, t);
      lfoGain.gain.setValueAtTime(0, t + Math.min(0.1, dur * 0.2));
      lfoGain.gain.linearRampToValueAtTime(freq * (isTenorClimax ? 0.035 : 0.022), t + dur * 0.65);
      lfo.connect(lfoGain);
      lfoGain.connect(osc1.frequency);
      lfoGain.connect(osc2.frequency);
      lfo.start(t);
      lfo.stop(t + dur);

      // Vowel Formant Frequencies (F1, F2, F3 in Hz)
      let f1 = 800;
      let f2 = 1200;
      let f3 = 2800;
      if (vowel === 'oh') {
        f1 = 500;
        f2 = 900;
        f3 = 2400;
      } else if (vowel === 'eh') {
        f1 = 600;
        f2 = 1900;
        f3 = 2600;
      } else if (vowel === 'ee') {
        f1 = 300;
        f2 = 2300;
        f3 = 3000;
      }

      // Formant Bandpass Filters
      [
        { f: f1, q: 5.0, gainMult: 0.5 },
        { f: f2, q: 6.0, gainMult: 0.35 },
        { f: f3, q: 7.0, gainMult: 0.2 },
      ].forEach((formant) => {
        const fFilter = ctx.createBiquadFilter();
        const fGain = ctx.createGain();

        fFilter.type = 'bandpass';
        fFilter.frequency.setValueAtTime(formant.f, t);
        fFilter.Q.setValueAtTime(formant.q, t);

        fGain.gain.setValueAtTime(0.0001, t);
        const attackTime = isTenorClimax ? Math.min(0.08, dur * 0.2) : Math.min(0.04, dur * 0.15);
        fGain.gain.linearRampToValueAtTime(g * formant.gainMult, t + attackTime);
        fGain.gain.setValueAtTime(g * formant.gainMult * 0.9, t + dur * 0.7);
        fGain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

        osc1.connect(fFilter);
        osc2.connect(fFilter);
        fFilter.connect(fGain);
        fGain.connect(dest);
      });

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + dur);
      osc2.stop(t + dur);
    } catch {}
  }

  /**
   * Operatic Choir & Choral Harmony Layers
   */
  public static synthOperaticChoir(
    ctx: AudioContext,
    dest: GainNode,
    notes: string[],
    time: number,
    duration: number = 0.8,
    gainVal: number = 0.2
  ) {
    if (!ctx || !dest || !notes || notes.length === 0 || ctx.state === 'closed') return;
    try {
      const perVoiceGain = gainVal / Math.max(1, notes.length * 0.7);
      notes.forEach((note) => {
        this.synthItalianVocal(ctx, dest, note, time, duration, perVoiceGain, 'oh', false);
      });
    } catch {}
  }

  /**
   * Lush Cinematic Orchestral Strings & Cello Section (Legato swells and symphonic backing)
   */
  public static synthOrchestralStrings(
    ctx: AudioContext,
    dest: GainNode,
    notes: string[],
    time: number,
    duration: number = 0.9,
    gainVal: number = 0.22,
    isMajestic: boolean = false
  ) {
    if (!ctx || !dest || !notes || notes.length === 0 || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const dur = Math.max(0.1, isFinite(duration) ? duration : 0.9);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.22);
      const perNoteGain = g / Math.max(1, notes.length * 0.7);

      notes.forEach((note, nIdx) => {
        try {
          const freq = getNoteFreq(note);
          [-8, 0, 8].forEach((detune) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            osc.type = nIdx === 0 ? 'sawtooth' : 'triangle';
            osc.frequency.setValueAtTime(freq, t);
            osc.detune.setValueAtTime(detune, t);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(isMajestic ? 1200 : 700, t);
            filter.frequency.linearRampToValueAtTime(isMajestic ? 3800 : 2200, t + dur * 0.45);
            filter.frequency.linearRampToValueAtTime(1000, t + dur);
            filter.Q.setValueAtTime(1.5, t);

            gain.gain.setValueAtTime(0.0001, t);
            const attack = t + Math.min(0.12, dur * 0.3);
            gain.gain.linearRampToValueAtTime(perNoteGain * 0.35, attack);
            gain.gain.setValueAtTime(perNoteGain * 0.32, t + dur * 0.7);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(dest);

            osc.start(t);
            osc.stop(t + dur);
          });
        } catch {}
      });
    } catch {}
  }

  /**
   * Orchestral Stadium Timpani (Booming cinematic kettle drum with pitch-dive resonance)
   */
  public static synthStadiumTimpani(
    ctx: AudioContext,
    dest: GainNode,
    pitchNote: string = 'C2',
    time: number,
    gainVal: number = 0.45
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.45);
      const freq = getNoteFreq(pitchNote);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * 1.5, t);
      osc.frequency.exponentialRampToValueAtTime(freq, t + 0.08);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650, t);
      filter.frequency.exponentialRampToValueAtTime(180, t + 0.4);
      filter.Q.setValueAtTime(3.0, t);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(g, t + 0.006);
      gain.gain.exponentialRampToValueAtTime(g * 0.4, t + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.85);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      osc.start(t);
      osc.stop(t + 0.85);
    } catch {}
  }

  /**
   * Live Ride Cymbal (Crisp bell ping + shimmering wash)
   */
  public static synthRideCymbal(
    ctx: AudioContext,
    dest: GainNode,
    time: number,
    gainVal: number = 0.16
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.16);

      // Ping harmonic
      const bellOsc = ctx.createOscillator();
      const bellGain = ctx.createGain();
      bellOsc.type = 'triangle';
      bellOsc.frequency.setValueAtTime(1046, t); // C6 bell
      bellGain.gain.setValueAtTime(g * 0.6, t);
      bellGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
      bellOsc.connect(bellGain);
      bellGain.connect(dest);
      bellOsc.start(t);
      bellOsc.stop(t + 0.12);

      // Wash noise
      const dur = 0.45;
      const bufferSize = Math.floor(ctx.sampleRate * dur);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(6500, t);
      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(g * 0.7, t);
      nGain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      noise.connect(filter);
      filter.connect(nGain);
      nGain.connect(dest);
      noise.start(t);
      noise.stop(t + dur);
    } catch {}
  }

  // =========================================================================
  // 6. AUTHENTIC BRITISH SOUNDTRACK INSTRUMENTS (Britpop, 1977 Punk, Merseybeat)
  // =========================================================================

  /**
   * Authentic British Tambourine Shake & Hit (Beatles 60s, Oasis 90s, Britpop)
   */
  public static synthTambourine(
    ctx: AudioContext,
    dest: GainNode,
    time: number,
    isAccent: boolean = false,
    gainVal: number = 0.16
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const g = Math.max(0.0001, isFinite(gainVal) ? (isAccent ? gainVal * 1.3 : gainVal) : 0.16);

      // 3 rapid jingle bursts for authentic shake
      const offsets = isAccent ? [0, 0.012, 0.024] : [0, 0.015];
      offsets.forEach((offset, idx) => {
        const dur = idx === offsets.length - 1 ? 0.08 : 0.03;
        const bufferSize = Math.floor(ctx.sampleRate * dur);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(8500, t + offset);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(g * (idx === offsets.length - 1 ? 1.0 : 0.5), t + offset);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + offset + dur);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(dest);

        noise.start(t + offset);
        noise.stop(t + offset + dur);
      });
    } catch {}
  }

  /**
   * Solo Piccolo / British Baroque Trumpet (Penny Lane, Three Lions fanfare)
   */
  public static synthTrumpetSolo(
    ctx: AudioContext,
    dest: GainNode,
    note: string,
    time: number,
    duration: number = 0.32,
    gainVal: number = 0.24,
    isBright: boolean = true
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const dur = Math.max(0.05, isFinite(duration) ? duration : 0.32);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.24);
      const freq = getNoteFreq(note);

      // Dual sawtooth with brass formant
      [-5, 5].forEach((detune) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);
        osc.detune.setValueAtTime(detune, t);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(isBright ? 2400 : 1600, t);
        filter.frequency.linearRampToValueAtTime(isBright ? 3600 : 2200, t + 0.04);
        filter.frequency.linearRampToValueAtTime(isBright ? 2000 : 1400, t + dur);
        filter.Q.setValueAtTime(3.2, t);

        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(g * 0.5, t + 0.015);
        gain.gain.setValueAtTime(g * 0.45, t + dur * 0.6);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(dest);

        osc.start(t);
        osc.stop(t + dur);
      });
    } catch {}
  }

  /**
   * 1977 High-Gain Punk Rock Distorted Guitar (Sex Pistols raw power chord bite)
   */
  public static synthPunkGuitarOverdrive(
    ctx: AudioContext,
    dest: GainNode,
    rootNote: string,
    fifthNote: string,
    octaveNote: string,
    time: number,
    duration: number = 0.22,
    gainVal: number = 0.28
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const dur = Math.max(0.04, isFinite(duration) ? duration : 0.22);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.28);
      const notes = [rootNote, fifthNote, octaveNote];

      notes.forEach((n, i) => {
        try {
          const freq = getNoteFreq(n);
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();
          const ampFilter = ctx.createBiquadFilter();

          osc1.type = 'sawtooth';
          osc2.type = 'square';
          osc1.frequency.setValueAtTime(freq, t);
          osc2.frequency.setValueAtTime(freq, t);
          osc2.detune.setValueAtTime((i - 1) * 9, t);

          ampFilter.type = 'peaking';
          ampFilter.frequency.setValueAtTime(2600, t);
          ampFilter.Q.setValueAtTime(2.5, t);
          ampFilter.gain.setValueAtTime(10, t);

          gain.gain.setValueAtTime(0.0001, t);
          gain.gain.linearRampToValueAtTime(g * 0.4, t + 0.005);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

          osc1.connect(ampFilter);
          osc2.connect(ampFilter);
          ampFilter.connect(gain);
          gain.connect(dest);

          osc1.start(t);
          osc2.start(t);
          osc1.stop(t + dur);
          osc2.stop(t + dur);
        } catch {}
      });
    } catch {}
  }

  /**
   * British Stadium Terrace Crowd Harmony Chant ("Football's coming home", "Oh-Oh", "Oi-Oi")
   */
  public static synthTerraceCrowdChant(
    ctx: AudioContext,
    dest: GainNode,
    note: string,
    time: number,
    duration: number = 0.5,
    gainVal: number = 0.26,
    chantType: 'home' | 'oh' | 'oi' = 'home'
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const vowel = chantType === 'oi' ? 'eh' : chantType === 'oh' ? 'oh' : 'ah';
      this.synthItalianVocal(ctx, dest, note, time, duration, gainVal, vowel, false);
    } catch {}
  }

  /**
   * Authentic Argentine Bandoneón / Accordion Bellows Expression
   * (Bersuit Murga Rock, Tango Nuevo, and Traditional Argentine Football Ballads)
   */
  public static synthBandoneonExpressive(
    ctx: AudioContext,
    dest: GainNode,
    note: string,
    time: number,
    duration: number = 0.35,
    gainVal: number = 0.24,
    isStaccato: boolean = false
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const dur = Math.max(0.04, isFinite(duration) ? duration : 0.35);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.24);
      const freq = getNoteFreq(note);

      // Dual octave reeds + subtle beating for authentic bellows acoustics
      [-12, 0, 12].forEach((detuneCents, idx) => {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc.type = idx === 1 ? 'sawtooth' : 'triangle';
          osc.frequency.setValueAtTime(freq, t);
          osc.detune.setValueAtTime(detuneCents, t);

          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(1750, t);
          filter.Q.setValueAtTime(2.2, t);

          gain.gain.setValueAtTime(0.0001, t);
          const attack = isStaccato ? 0.008 : 0.025;
          gain.gain.linearRampToValueAtTime(g * (idx === 1 ? 0.5 : 0.25), t + attack);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(dest);

          osc.start(t);
          osc.stop(t + dur);
        } catch {}
      });
    } catch {}
  }

  /**
   * Argentine Cumbia Villera Keytar / Synth Lead (Damas Gratis / Pibes Chorros style)
   * High-energy resonant synth lead with pitch-bend glide and bright vibrato
   */
  public static synthCumbiaKeytarLead(
    ctx: AudioContext,
    dest: GainNode,
    note: string,
    time: number,
    duration: number = 0.22,
    gainVal: number = 0.24,
    pitchBendSemis: number = 0
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const dur = Math.max(0.04, isFinite(duration) ? duration : 0.22);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.24);
      const freq = getNoteFreq(note);

      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc2.type = 'square';

      // Pitch glide if specified
      if (pitchBendSemis !== 0) {
        const startFreq = freq * Math.pow(2, pitchBendSemis / 12);
        osc.frequency.setValueAtTime(startFreq, t);
        osc.frequency.exponentialRampToValueAtTime(freq, t + 0.04);
        osc2.frequency.setValueAtTime(startFreq, t);
        osc2.frequency.exponentialRampToValueAtTime(freq, t + 0.04);
      } else {
        osc.frequency.setValueAtTime(freq, t);
        osc2.frequency.setValueAtTime(freq, t);
      }
      osc2.detune.setValueAtTime(9, t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(4500, t);
      filter.frequency.exponentialRampToValueAtTime(2200, t + dur);
      filter.Q.setValueAtTime(3.8, t);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(g * 0.7, t + 0.006);
      gain.gain.exponentialRampToValueAtTime(g * 0.45, t + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      osc.start(t);
      osc2.start(t);
      osc.stop(t + dur);
      osc2.stop(t + dur);
    } catch {}
  }

  /**
   * Brazilian Surdo Drum (Deep, resonant, low-end pulse for Samba and Batucada)
   */
  public static synthSurdo(
    ctx: AudioContext,
    dest: GainNode,
    time: number,
    duration: number = 0.45,
    gainVal: number = 0.52,
    pitch: 'low' | 'mid' | 'high' = 'low',
    isMuted: boolean = false
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const dur = isMuted ? 0.12 : Math.max(0.08, isFinite(duration) ? duration : 0.45);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.52);

      const baseFreq = pitch === 'low' ? 52 : pitch === 'mid' ? 68 : 86;

      // Low sine body
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * 1.3, t);
      osc.frequency.exponentialRampToValueAtTime(baseFreq, t + 0.04);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(g, t + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      // Noise click for beater impact on leather skin
      const bufferSize = Math.floor(ctx.sampleRate * 0.02);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(450, t);
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(g * 0.35, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.02);

      osc.connect(gain);
      gain.connect(dest);
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(dest);

      osc.start(t);
      osc.stop(t + dur);
      noise.start(t);
      noise.stop(t + 0.025);
    } catch {}
  }

  /**
   * Brazilian Cuíca (High/low pitch friction squeak characteristic of Samba)
   */
  public static synthCuica(
    ctx: AudioContext,
    dest: GainNode,
    isHigh: boolean = true,
    time: number,
    duration: number = 0.16,
    gainVal: number = 0.28
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const dur = Math.max(0.06, isFinite(duration) ? duration : 0.16);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.28);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      const startF = isHigh ? 380 : 220;
      const endF = isHigh ? 640 : 340;
      osc.frequency.setValueAtTime(startF, t);
      osc.frequency.linearRampToValueAtTime(endF, t + dur * 0.6);
      osc.frequency.exponentialRampToValueAtTime(startF * 1.1, t + dur);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(startF * 1.8, t);
      filter.frequency.linearRampToValueAtTime(endF * 1.8, t + dur * 0.6);
      filter.Q.setValueAtTime(5.5, t);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(g, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      osc.start(t);
      osc.stop(t + dur);
    } catch {}
  }

  /**
   * Brazilian Pandeiro (Hand drum with jingles / platinelas)
   */
  public static synthPandeiro(
    ctx: AudioContext,
    dest: GainNode,
    style: 'thumb' | 'fingertip' | 'heel' | 'slap' = 'thumb',
    time: number,
    gainVal: number = 0.28
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.28);

      // 1. Drum skin tone
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';

      let toneFreq = 160;
      let dur = 0.08;
      if (style === 'thumb') {
        toneFreq = 110;
        dur = 0.14;
      } else if (style === 'heel') {
        toneFreq = 145;
        dur = 0.09;
      } else if (style === 'slap') {
        toneFreq = 220;
        dur = 0.06;
      }

      osc.frequency.setValueAtTime(toneFreq * 1.2, t);
      osc.frequency.exponentialRampToValueAtTime(toneFreq, t + 0.03);
      oscGain.gain.setValueAtTime(g * 0.7, t);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(oscGain);
      oscGain.connect(dest);
      osc.start(t);
      osc.stop(t + dur);

      // 2. Metallic Jingles (Platinelas)
      const bufferSize = Math.floor(ctx.sampleRate * 0.05);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(6500, t);

      const jingleGain = ctx.createGain();
      jingleGain.gain.setValueAtTime(g * 0.5, t);
      jingleGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);

      noise.connect(filter);
      filter.connect(jingleGain);
      jingleGain.connect(dest);
      noise.start(t);
      noise.stop(t + 0.055);
    } catch {}
  }

  /**
   * Brazilian Sanfona / Sertanejo Accordion (Vibrant dual-reed musette tuning)
   */
  public static synthSanfona(
    ctx: AudioContext,
    dest: GainNode,
    note: string,
    time: number,
    duration: number = 0.3,
    gainVal: number = 0.26,
    isTremolo: boolean = false
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const dur = Math.max(0.04, isFinite(duration) ? duration : 0.3);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.26);
      const freq = getNoteFreq(note);

      // Rich Sertanejo Musette (triple-reed tuning with ±10 cents)
      [-10, 0, 10].forEach((cents, idx) => {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc.type = idx === 1 ? 'sawtooth' : 'triangle';
          osc.frequency.setValueAtTime(freq, t);
          osc.detune.setValueAtTime(cents, t);

          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(2100, t);
          filter.Q.setValueAtTime(2.4, t);

          gain.gain.setValueAtTime(0.0001, t);
          gain.gain.linearRampToValueAtTime(g * (idx === 1 ? 0.45 : 0.28), t + 0.015);
          if (isTremolo) {
            gain.gain.setValueAtTime(g * 0.4, t + dur * 0.5);
          }
          gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(dest);

          osc.start(t);
          osc.stop(t + dur);
        } catch {}
      });
    } catch {}
  }

  /**
   * Brazilian Group Vocal Chant & Formants ('ô', 'a', 'eh', 'u', 'hey')
   */
  public static synthBrazilianVocal(
    ctx: AudioContext,
    dest: GainNode,
    note: string,
    time: number,
    duration: number = 0.4,
    gainVal: number = 0.24,
    vowel: 'oh' | 'ah' | 'eh' | 'hey' = 'oh',
    isChant: boolean = true
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const dur = Math.max(0.05, isFinite(duration) ? duration : 0.4);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.24);
      const freq = getNoteFreq(note);

      // Formants for Brazilian vocal sounds
      let f1 = 500;
      let f2 = 900;
      if (vowel === 'ah') { f1 = 800; f2 = 1200; }
      else if (vowel === 'eh') { f1 = 550; f2 = 1800; }
      else if (vowel === 'hey') { f1 = 650; f2 = 2000; }

      [f1, f2].forEach((fFreq, fIdx) => {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc.type = isChant ? 'sawtooth' : 'triangle';
          osc.frequency.setValueAtTime(freq, t);
          if (fIdx === 1) osc.detune.setValueAtTime(7, t);

          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(fFreq, t);
          filter.Q.setValueAtTime(4.2, t);

          gain.gain.setValueAtTime(0.0001, t);
          gain.gain.linearRampToValueAtTime(g * (fIdx === 0 ? 0.6 : 0.4), t + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(dest);

          osc.start(t);
          osc.stop(t + dur);
        } catch {}
      });
    } catch {}
  }

  /**
   * Brazilian Cavaquinho (Bright, percussive high 4-string acoustic instrument)
   */
  public static synthCavaquinho(
    ctx: AudioContext,
    dest: GainNode,
    note: string,
    time: number,
    duration: number = 0.18,
    gainVal: number = 0.22
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const dur = Math.max(0.04, isFinite(duration) ? duration : 0.18);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.22);
      const freq = getNoteFreq(note);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      filter.type = 'highpass';
      filter.frequency.setValueAtTime(400, t);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(g, t + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      osc.start(t);
      osc.stop(t + dur);
    } catch {}
  }

  /**
   * Organic Body Percussion & Vocal Rhythm (Barbatuques style)
   * Stomp, Chest thump, Open/Cupped Handclaps, Mouth pops, Breath clicks
   */
  public static synthBodyPercussion(
    ctx: AudioContext,
    dest: GainNode,
    type: 'stomp' | 'chest' | 'clap_open' | 'clap_cup' | 'mouth_pop' | 'breath',
    time: number,
    gainVal: number = 0.32
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.32);

      if (type === 'stomp' || type === 'chest') {
        // Deep body resonance
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const startFreq = type === 'stomp' ? 95 : 130;
        const endFreq = type === 'stomp' ? 42 : 65;
        osc.frequency.setValueAtTime(startFreq, t);
        osc.frequency.exponentialRampToValueAtTime(endFreq, t + 0.05);

        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(g, t + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + (type === 'stomp' ? 0.22 : 0.14));

        osc.connect(gain);
        gain.connect(dest);
        osc.start(t);
        osc.stop(t + (type === 'stomp' ? 0.25 : 0.16));
      } else if (type === 'mouth_pop') {
        // Resonant acoustic mouth bubble/pop
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(620, t);
        osc.frequency.exponentialRampToValueAtTime(280, t + 0.035);

        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(g * 0.8, t + 0.002);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(t);
        osc.stop(t + 0.045);
      } else if (type === 'breath') {
        // Rhythmic breath expulsion
        const bufferSize = Math.floor(ctx.sampleRate * 0.06);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1400, t);
        filter.Q.setValueAtTime(2.0, t);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(g * 0.45, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(dest);
        noise.start(t);
        noise.stop(t + 0.065);
      } else {
        // Handclaps (open skin slap or hollow cup)
        const isCup = type === 'clap_cup';
        const bufferSize = Math.floor(ctx.sampleRate * 0.08);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * (isCup ? 0.2 : 0.35)));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = isCup ? 'bandpass' : 'highpass';
        filter.frequency.setValueAtTime(isCup ? 850 : 2200, t);
        if (isCup) filter.Q.setValueAtTime(3.5, t);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(g * (isCup ? 0.75 : 0.6), t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + (isCup ? 0.05 : 0.08));

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(dest);
        noise.start(t);
        noise.stop(t + (isCup ? 0.055 : 0.085));
      }
    } catch {}
  }

  /**
   * 16-Bit Portuguese Guitar (Guitarra Portuguesa - 12-String Steel Fado Chime)
   * Rich high-register double courses, teardrop attack & sparkling Lisboa timbre
   */
  public static synthPortugueseGuitar(
    ctx: AudioContext,
    dest: GainNode,
    note: string,
    time: number,
    duration: number = 0.28,
    gainVal: number = 0.26
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const dur = Math.max(0.05, isFinite(duration) ? duration : 0.28);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.26);
      const freq = getNoteFreq(note);

      // Primary Course
      const osc1 = ctx.createOscillator();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, t);

      // Secondary Course (Detuned high-steel ringing harmonic)
      const osc2 = ctx.createOscillator();
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(freq * 1.004, t);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3200, t);
      filter.frequency.exponentialRampToValueAtTime(1200, t + Math.min(0.18, dur));
      filter.Q.setValueAtTime(2.8, t);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(g, t + 0.002);
      gain.gain.exponentialRampToValueAtTime(g * 0.45, t + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + dur);
      osc2.stop(t + dur);
    } catch {}
  }

  /**
   * 16-Bit Kuduro Afro-House Electronic Club Stab
   * Punchy, distorted, syncopated digital attack
   */
  public static synthKuduroStab(
    ctx: AudioContext,
    dest: GainNode,
    note: string,
    time: number,
    duration: number = 0.18,
    gainVal: number = 0.28
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const dur = Math.max(0.04, isFinite(duration) ? duration : 0.18);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.28);
      const freq = getNoteFreq(note);

      const osc1 = ctx.createOscillator();
      osc1.type = 'square';
      osc1.frequency.setValueAtTime(freq, t);

      const osc2 = ctx.createOscillator();
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(freq * 0.5, t);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(5400, t);
      filter.frequency.exponentialRampToValueAtTime(600, t + dur);
      filter.Q.setValueAtTime(4.5, t);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(g, t + 0.002);
      gain.gain.exponentialRampToValueAtTime(g * 0.2, t + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + dur);
      osc2.stop(t + dur);
    } catch {}
  }

  /**
   * 16-Bit Authentic Arabian Oud (Fretless Middle Eastern Lute)
   * Deep wooden pear-shaped body resonance with expressive double-string pluck
   */
  public static synthOud(
    ctx: AudioContext,
    dest: GainNode,
    note: string,
    time: number,
    duration: number = 0.35,
    gainVal: number = 0.28
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const dur = Math.max(0.06, isFinite(duration) ? duration : 0.35);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.28);
      const freq = getNoteFreq(note);

      // Primary String
      const osc1 = ctx.createOscillator();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(freq * 1.008, t);
      osc1.frequency.exponentialRampToValueAtTime(freq, t + 0.02); // Initial micro-slide on plectrum attack

      // Body Resonance Carrier
      const osc2 = ctx.createOscillator();
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(freq * 2, t);

      // Warm wooden acoustic chamber filter
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, t);
      filter.frequency.exponentialRampToValueAtTime(450, t + dur * 0.7);
      filter.Q.setValueAtTime(2.2, t);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(g, t + 0.004);
      gain.gain.exponentialRampToValueAtTime(g * 0.38, t + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      const gain2 = ctx.createGain();
      gain2.gain.setValueAtTime(0.18, t);

      osc1.connect(filter);
      osc2.connect(gain2);
      gain2.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + dur);
      osc2.stop(t + dur);
    } catch {}
  }

  /**
   * 16-Bit Arabian Darbuka / Tablah Percussion
   * 'doum' (deep bass goblet punch) vs 'tek' / 'ka' (sharp high rim crack)
   */
  public static synthDarbuka(
    ctx: AudioContext,
    dest: GainNode,
    type: 'doum' | 'tek' | 'ka' = 'doum',
    time: number,
    gainVal: number = 0.35
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.35);

      if (type === 'doum') {
        // Deep resonant bass punch
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, t);
        osc.frequency.exponentialRampToValueAtTime(65, t + 0.12);

        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(g * 1.1, t + 0.003);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(t);
        osc.stop(t + 0.23);
      } else {
        // 'tek' or 'ka' sharp metallic rim attack
        const isTek = type === 'tek';
        const bufferSize = Math.floor(ctx.sampleRate * 0.05);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(isTek ? 2800 : 2100, t);
        osc.frequency.exponentialRampToValueAtTime(isTek ? 950 : 700, t + 0.04);

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(isTek ? 3400 : 2400, t);
        filter.Q.setValueAtTime(4.0, t);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(g * (isTek ? 0.9 : 0.75), t + 0.002);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);

        noise.connect(filter);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(dest);

        noise.start(t);
        osc.start(t);
        noise.stop(t + 0.065);
        osc.stop(t + 0.065);
      }
    } catch {}
  }

  /**
   * 16-Bit Arabian Khaleeji Collective Handclaps (Staggered Group Claps)
   */
  public static synthKhaleejiClap(
    ctx: AudioContext,
    dest: GainNode,
    time: number,
    gainVal: number = 0.32
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.32);

      // 3 staggered micro-transients simulating group syncopated Khaleeji applause
      const offsets = [0, 0.012, 0.024];
      offsets.forEach((off, idx) => {
        const hitTime = t + off;
        const bufferSize = Math.floor(ctx.sampleRate * 0.06);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.28));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1400 + idx * 300, hitTime);
        filter.Q.setValueAtTime(2.2, hitTime);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(g * (idx === 0 ? 0.6 : 0.45), hitTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, hitTime + 0.05);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(dest);

        noise.start(hitTime);
        noise.stop(hitTime + 0.055);
      });
    } catch {}
  }

  /**
   * 16-Bit Nay Reed Flute (Arabian Breath & Evocative Pitch Expression)
   */
  public static synthNayFlute(
    ctx: AudioContext,
    dest: GainNode,
    note: string,
    time: number,
    duration: number = 0.5,
    gainVal: number = 0.24
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const dur = Math.max(0.08, isFinite(duration) ? duration : 0.5);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.24);
      const freq = getNoteFreq(note);

      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      // Breath noise component
      const bufferSize = Math.floor(ctx.sampleRate * Math.min(dur, 0.4));
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.2;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(freq * 1.5, t);
      noiseFilter.Q.setValueAtTime(4.0, t);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(g * 0.15, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(g, t + 0.04);
      gain.gain.setValueAtTime(g * 0.85, t + dur * 0.6);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      osc.connect(gain);
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(dest);
      gain.connect(dest);

      osc.start(t);
      noise.start(t);
      osc.stop(t + dur);
      noise.stop(t + dur);
    } catch {}
  }

  /**
   * 16-Bit Modern Arabic / Hijaz Modal Synth Lead
   */
  public static synthArabicLead(
    ctx: AudioContext,
    dest: GainNode,
    note: string,
    time: number,
    duration: number = 0.35,
    gainVal: number = 0.26
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const dur = Math.max(0.05, isFinite(duration) ? duration : 0.35);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.26);
      const freq = getNoteFreq(note);

      const osc1 = ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(freq, t);

      const osc2 = ctx.createOscillator();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(freq * 1.006, t);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(4800, t);
      filter.frequency.exponentialRampToValueAtTime(1400, t + dur);
      filter.Q.setValueAtTime(3.5, t);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(g, t + 0.005);
      gain.gain.exponentialRampToValueAtTime(g * 0.6, t + dur * 0.5);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + dur);
      osc2.stop(t + dur);
    } catch {}
  }

  // =========================================================================
  // 12. FRENCH SOUNDTRACK ENGINES (French House, Electro-Pop, Synthwave, 80s Pop-Rock)
  // =========================================================================

  /**
   * French Robotic Vocoder / Talkbox Voice Synthesizer
   * Resonant multi-formant carrier synth creating Daft Punk / French Touch vocoder phrases
   */
  public static synthFrenchVocoder(
    ctx: AudioContext,
    dest: GainNode,
    note: string,
    time: number,
    duration: number = 0.28,
    gainVal: number = 0.26,
    vowel: 'robot' | 'allez' | 'danse' | 'paris' | 'stade' = 'robot'
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const dur = Math.max(0.06, isFinite(duration) ? duration : 0.28);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.26);
      const freq = getNoteFreq(note);

      // Carrier pulse oscillator + sub saw for rich harmonics
      const osc1 = ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(freq, t);

      const osc2 = ctx.createOscillator();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(freq * 1.004, t);

      // Formant filter bank (F1 & F2 vowel resonant peaks)
      const f1 = ctx.createBiquadFilter();
      f1.type = 'bandpass';
      const f2 = ctx.createBiquadFilter();
      f2.type = 'bandpass';

      if (vowel === 'allez') {
        f1.frequency.setValueAtTime(800, t);
        f1.Q.setValueAtTime(5.0, t);
        f2.frequency.setValueAtTime(1900, t);
        f2.Q.setValueAtTime(6.0, t);
      } else if (vowel === 'danse') {
        f1.frequency.setValueAtTime(650, t);
        f1.Q.setValueAtTime(6.0, t);
        f2.frequency.setValueAtTime(1450, t);
        f2.Q.setValueAtTime(7.0, t);
      } else if (vowel === 'paris') {
        f1.frequency.setValueAtTime(500, t);
        f1.Q.setValueAtTime(7.0, t);
        f2.frequency.setValueAtTime(2300, t);
        f2.Q.setValueAtTime(8.0, t);
      } else if (vowel === 'stade') {
        f1.frequency.setValueAtTime(750, t);
        f1.Q.setValueAtTime(5.5, t);
        f2.frequency.setValueAtTime(1600, t);
        f2.Q.setValueAtTime(6.5, t);
      } else {
        // 'robot' talkbox timbre
        f1.frequency.setValueAtTime(450, t);
        f1.Q.setValueAtTime(8.0, t);
        f2.frequency.setValueAtTime(2100, t);
        f2.Q.setValueAtTime(9.0, t);
      }

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(g, t + 0.008);
      gain.gain.setValueAtTime(g * 0.9, t + dur * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      osc1.connect(f1);
      osc2.connect(f1);
      osc1.connect(f2);
      osc2.connect(f2);

      f1.connect(gain);
      f2.connect(gain);
      gain.connect(dest);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + dur);
      osc2.stop(t + dur);
    } catch {}
  }

  /**
   * French Touch Filter Bass (Daft Punk / French House style)
   * Sweeping lowpass resonant filter with punchy sub and disco bounce
   */
  public static synthFrenchTouchFilterBass(
    ctx: AudioContext,
    dest: GainNode,
    note: string,
    time: number,
    duration: number = 0.22,
    gainVal: number = 0.42,
    filterCutoff: number = 1800
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const dur = Math.max(0.05, isFinite(duration) ? duration : 0.22);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.42);
      const freq = getNoteFreq(note);

      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);

      const sub = ctx.createOscillator();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(freq * 0.5, t);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(Math.min(6000, Math.max(200, filterCutoff)), t);
      filter.frequency.exponentialRampToValueAtTime(320, t + dur);
      filter.Q.setValueAtTime(4.5, t);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(g, t + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(g * 0.4, t);
      subGain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      sub.connect(subGain);
      subGain.connect(dest);

      osc.start(t);
      sub.start(t);
      osc.stop(t + dur);
      sub.stop(t + dur);
    } catch {}
  }

  /**
   * French House Disco Keys (Rhodes / M1 / Analog Polysynth stabs)
   */
  public static synthDiscoHouseKeys(
    ctx: AudioContext,
    dest: GainNode,
    notes: string[],
    time: number,
    duration: number = 0.25,
    gainVal: number = 0.22,
    cutoff: number = 2400
  ) {
    if (!ctx || !dest || !notes || notes.length === 0 || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const dur = Math.max(0.05, isFinite(duration) ? duration : 0.25);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.22);

      notes.forEach((note) => {
        const freq = getNoteFreq(note);
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(cutoff, t);
        filter.frequency.exponentialRampToValueAtTime(cutoff * 0.4, t + dur);
        filter.Q.setValueAtTime(2.0, t);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(g / notes.length, t + 0.004);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(dest);

        osc.start(t);
        osc.stop(t + dur);
      });
    } catch {}
  }

  /**
   * French Club Electro Supersaw Lead (High energy festival drops & anthems)
   */
  public static synthFrenchElectroLead(
    ctx: AudioContext,
    dest: GainNode,
    note: string,
    time: number,
    duration: number = 0.28,
    gainVal: number = 0.26
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const dur = Math.max(0.05, isFinite(duration) ? duration : 0.28);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.26);
      const freq = getNoteFreq(note);

      const osc1 = ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(freq, t);

      const osc2 = ctx.createOscillator();
      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(freq * 1.008, t);

      const osc3 = ctx.createOscillator();
      osc3.type = 'square';
      osc3.frequency.setValueAtTime(freq * 0.992, t);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(5500, t);
      filter.frequency.exponentialRampToValueAtTime(1800, t + dur);
      filter.Q.setValueAtTime(4.0, t);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(g, t + 0.005);
      gain.gain.exponentialRampToValueAtTime(g * 0.7, t + dur * 0.6);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      osc1.connect(filter);
      osc2.connect(filter);
      osc3.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      osc1.start(t);
      osc2.start(t);
      osc3.start(t);
      osc1.stop(t + dur);
      osc2.stop(t + dur);
      osc3.stop(t + dur);
    } catch {}
  }

  /**
   * French Electropop Melancholic Lead (Stromae style: reedy electronic sax / synth)
   */
  public static synthFrenchElectropopLead(
    ctx: AudioContext,
    dest: GainNode,
    note: string,
    time: number,
    duration: number = 0.32,
    gainVal: number = 0.25
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const dur = Math.max(0.05, isFinite(duration) ? duration : 0.32);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.25);
      const freq = getNoteFreq(note);

      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      // Slight pitch bend for expressive phrasing
      osc.frequency.setValueAtTime(freq * 0.98, t);
      osc.frequency.linearRampToValueAtTime(freq, t + 0.04);

      const subOsc = ctx.createOscillator();
      subOsc.type = 'triangle';
      subOsc.frequency.setValueAtTime(freq, t);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1600, t);
      filter.Q.setValueAtTime(3.2, t);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(g, t + 0.01);
      gain.gain.setValueAtTime(g * 0.8, t + dur * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      osc.connect(filter);
      subOsc.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      osc.start(t);
      subOsc.start(t);
      osc.stop(t + dur);
      subOsc.stop(t + dur);
    } catch {}
  }

  /**
   * 1980s French Synthwave Night Drive Pad (Kavinsky style: lush analog dark synth)
   */
  public static synthSynthwaveNightPad(
    ctx: AudioContext,
    dest: GainNode,
    notes: string[],
    time: number,
    duration: number = 1.8,
    gainVal: number = 0.2
  ) {
    if (!ctx || !dest || !notes || notes.length === 0 || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const dur = Math.max(0.2, isFinite(duration) ? duration : 1.8);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.2);

      notes.forEach((note, idx) => {
        const freq = getNoteFreq(note);
        const osc1 = ctx.createOscillator();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(freq, t);

        const osc2 = ctx.createOscillator();
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(freq * (idx % 2 === 0 ? 1.005 : 0.995), t);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, t);
        filter.frequency.linearRampToValueAtTime(800, t + dur);
        filter.Q.setValueAtTime(1.8, t);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(g / notes.length, t + 0.12);
        gain.gain.setValueAtTime((g / notes.length) * 0.9, t + dur * 0.7);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(dest);

        osc1.start(t);
        osc2.start(t);
        osc1.stop(t + dur);
        osc2.stop(t + dur);
      });
    } catch {}
  }

  /**
   * 1980s Gated Reverb Snare (Massive Phil Collins / Kavinsky / French Pop-Rock snare)
   */
  public static synth80sGatedSnare(
    ctx: AudioContext,
    dest: GainNode,
    time: number,
    gainVal: number = 0.46
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.46);

      // 1. Tonal body
      const toneOsc = ctx.createOscillator();
      toneOsc.type = 'sine';
      toneOsc.frequency.setValueAtTime(190, t);
      toneOsc.frequency.exponentialRampToValueAtTime(85, t + 0.08);

      const toneGain = ctx.createGain();
      toneGain.gain.setValueAtTime(g * 0.7, t);
      toneGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);

      toneOsc.connect(toneGain);
      toneGain.connect(dest);

      // 2. Gated Noise Reverb Burst
      const bufferSize = Math.floor(ctx.sampleRate * 0.18);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.75));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2200, t);
      filter.Q.setValueAtTime(1.8, t);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(g * 0.9, t);
      // Sharp gate cut at 140ms
      noiseGain.gain.setValueAtTime(g * 0.85, t + 0.13);
      noiseGain.gain.linearRampToValueAtTime(0.0001, t + 0.15);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(dest);

      toneOsc.start(t);
      noise.start(t);
      toneOsc.stop(t + 0.12);
      noise.stop(t + 0.16);
    } catch {}
  }

  /**
   * 1980s French Pop-Rock Guitar (Goldman style: warm overdrive & singable melodic bite)
   */
  public static synthFrenchPopRockGuitar(
    ctx: AudioContext,
    dest: GainNode,
    note: string,
    time: number,
    duration: number = 0.35,
    gainVal: number = 0.28,
    style: 'riff' | 'solo' | 'clean_strum' = 'riff'
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const dur = Math.max(0.06, isFinite(duration) ? duration : 0.35);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.28);
      const freq = getNoteFreq(note);

      const osc = ctx.createOscillator();
      osc.type = style === 'clean_strum' ? 'triangle' : 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);

      // Subtle vibrato for solos
      if (style === 'solo') {
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(5.5, t);
        lfoGain.gain.setValueAtTime(4.5, t);
        lfo.connect(osc.frequency);
        lfo.start(t + 0.08);
        lfo.stop(t + dur);
      }

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(style === 'solo' ? 3800 : 2600, t);
      filter.Q.setValueAtTime(style === 'solo' ? 3.0 : 1.5, t);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(g, t + (style === 'clean_strum' ? 0.003 : 0.01));
      gain.gain.setValueAtTime(g * 0.8, t + dur * 0.6);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(dest);

      osc.start(t);
      osc.stop(t + dur);
    } catch {}
  }

  // =========================================================================
  // 7. CONTINENTAL SYMPHONIC & ORCHESTRAL INSTRUMENTATION
  // Grand Hall Orchestral Synthesis: French Horns, Staccato Strings,
  // Baroque Piccolo Trumpet, Reedy Bassoon, Cello Ostinato & Fortissimo Choir
  // =========================================================================

  /**
   * Heroic French Horn Fanfare & Swell (Warm rounded brass with natural overtone bloom)
   */
  public static synthFrenchHornFanfare(
    ctx: AudioContext,
    dest: GainNode,
    note: string,
    time: number,
    duration: number = 0.45,
    gainVal: number = 0.26
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const dur = Math.max(0.06, isFinite(duration) ? duration : 0.45);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.26);
      const freq = getNoteFreq(note);

      // Warm double-bell French Horn (Sawtooth + rich lowpass vowel resonance)
      [-6, 6].forEach((detune) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const bodyFilter = ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);
        osc.detune.setValueAtTime(detune, t);

        bodyFilter.type = 'bandpass';
        bodyFilter.frequency.setValueAtTime(850, t);
        bodyFilter.frequency.linearRampToValueAtTime(2200, t + Math.min(0.08, dur * 0.25));
        bodyFilter.frequency.exponentialRampToValueAtTime(1100, t + dur);
        bodyFilter.Q.setValueAtTime(2.4, t);

        gain.gain.setValueAtTime(0.0001, t);
        const attack = t + Math.min(0.04, dur * 0.2);
        gain.gain.linearRampToValueAtTime(g * 0.55, attack);
        gain.gain.setValueAtTime(g * 0.5, t + dur * 0.7);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

        osc.connect(bodyFilter);
        bodyFilter.connect(gain);
        gain.connect(dest);

        osc.start(t);
        osc.stop(t + dur);
      });
    } catch {}
  }

  /**
   * Crisp Staccato Violin / Spiccato String Section (Sharp bow bite & rapid articulation)
   */
  public static synthStaccatoViolin(
    ctx: AudioContext,
    dest: GainNode,
    note: string,
    time: number,
    duration: number = 0.16,
    gainVal: number = 0.24
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const dur = Math.max(0.03, isFinite(duration) ? duration : 0.16);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.24);
      const freq = getNoteFreq(note);

      [-7, 0, 7].forEach((detune, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = idx === 1 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        osc.detune.setValueAtTime(detune, t);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(3200, t);
        filter.frequency.exponentialRampToValueAtTime(1200, t + dur);
        filter.Q.setValueAtTime(3.0, t);

        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(g * 0.45, t + 0.006);
        gain.gain.exponentialRampToValueAtTime(g * 0.1, t + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(dest);

        osc.start(t);
        osc.stop(t + dur);
      });
    } catch {}
  }

  /**
   * Reedy Orchestral Bassoon / Contrabassoon (Hollow woodwind for Grieg & Holst themes)
   */
  public static synthOrchestralBassoon(
    ctx: AudioContext,
    dest: GainNode,
    note: string,
    time: number,
    duration: number = 0.22,
    gainVal: number = 0.25
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const dur = Math.max(0.04, isFinite(duration) ? duration : 0.22);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.25);
      const freq = getNoteFreq(note);

      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const formant1 = ctx.createBiquadFilter();
      const formant2 = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc2.type = 'square';
      osc.frequency.setValueAtTime(freq, t);
      osc2.frequency.setValueAtTime(freq * 2, t);

      // Bassoon double-reed formant peaks (approx 450Hz and 1100Hz)
      formant1.type = 'bandpass';
      formant1.frequency.setValueAtTime(450, t);
      formant1.Q.setValueAtTime(4.0, t);

      formant2.type = 'bandpass';
      formant2.frequency.setValueAtTime(1150, t);
      formant2.Q.setValueAtTime(3.5, t);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(g, t + 0.008);
      gain.gain.exponentialRampToValueAtTime(g * 0.4, t + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      osc.connect(formant1);
      osc2.connect(formant2);
      formant1.connect(gain);
      formant2.connect(gain);
      gain.connect(dest);

      osc.start(t);
      osc2.start(t);
      osc.stop(t + dur);
      osc2.stop(t + dur);
    } catch {}
  }

  /**
   * Regal Baroque Trumpet / Piccolo Fanfare (Mouret Rondeau & Champions League herald)
   */
  public static synthBaroqueTrumpet(
    ctx: AudioContext,
    dest: GainNode,
    note: string,
    time: number,
    duration: number = 0.26,
    gainVal: number = 0.26
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const dur = Math.max(0.04, isFinite(duration) ? duration : 0.26);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.26);
      const freq = getNoteFreq(note);

      [-4, 4].forEach((detune) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);
        osc.detune.setValueAtTime(detune, t);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2800, t);
        filter.frequency.linearRampToValueAtTime(4200, t + 0.02);
        filter.frequency.linearRampToValueAtTime(2400, t + dur);
        filter.Q.setValueAtTime(3.8, t);

        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(g * 0.55, t + 0.008);
        gain.gain.setValueAtTime(g * 0.48, t + dur * 0.6);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(dest);

        osc.start(t);
        osc.stop(t + dur);
      });
    } catch {}
  }

  /**
   * Dramatic Fortissimo Choral Chord Stab (Carmina Burana & Epic Orchestral Climaxes)
   */
  public static synthEpicChoirStab(
    ctx: AudioContext,
    dest: GainNode,
    notes: string[],
    time: number,
    duration: number = 0.6,
    gainVal: number = 0.3,
    vowel: 'ah' | 'oh' | 'eh' = 'ah'
  ) {
    if (!ctx || !dest || !notes || notes.length === 0 || ctx.state === 'closed') return;
    try {
      const perVoiceGain = gainVal / Math.max(1, notes.length * 0.6);
      notes.forEach((note) => {
        this.synthItalianVocal(ctx, dest, note, time, duration, perVoiceGain, vowel, true);
      });
    } catch {}
  }

  /**
   * Heavy Cello & Contrabass Sawing Ostinato (Holst Mars, Dvořák New World, Wagner Valkyries)
   */
  public static synthCelloOstinato(
    ctx: AudioContext,
    dest: GainNode,
    note: string,
    time: number,
    duration: number = 0.22,
    gainVal: number = 0.35
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const dur = Math.max(0.04, isFinite(duration) ? duration : 0.22);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.35);
      const freq = getNoteFreq(note);

      [-8, 0, 8].forEach((detune, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = idx === 1 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        osc.detune.setValueAtTime(detune, t);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(950, t);
        filter.frequency.exponentialRampToValueAtTime(320, t + dur);
        filter.Q.setValueAtTime(2.5, t);

        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(g * 0.4, t + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(dest);

        osc.start(t);
        osc.stop(t + dur);
      });
    } catch {}
  }

  // =========================================================================
  // 8. WORLD TOURNAMENT SPECIALIZED SYNTHESIS ENGINES
  // African Percussion (Djembe/Dundun/Kalimba), Brazilian Batucada (Surdo/Repinique),
  // Latin Timbales/Cascara, Italian Stadium Rock Lead Guitar & Massed Terrace Chants
  // =========================================================================

  /**
   * Authentic African Djembe Drum (Bass tone, Open tone, or Sharp slap)
   */
  public static synthAfricanDjembe(
    ctx: AudioContext,
    dest: GainNode,
    pitch: 'bass' | 'tone' | 'slap',
    time: number,
    gainVal: number = 0.38
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.38);

      if (pitch === 'bass') {
        // Deep resonant bass body (130Hz -> 65Hz)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, t);
        osc.frequency.exponentialRampToValueAtTime(65, t + 0.12);

        gain.gain.setValueAtTime(g * 1.1, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);

        osc.connect(gain);
        gain.connect(dest);
        osc.start(t);
        osc.stop(t + 0.32);
      } else if (pitch === 'tone') {
        // Resonant goblet rim tone (280Hz -> 210Hz)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, t);
        osc.frequency.exponentialRampToValueAtTime(220, t + 0.05);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(380, t);
        filter.Q.setValueAtTime(2.5, t);

        gain.gain.setValueAtTime(g * 0.9, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(dest);

        osc.start(t);
        osc.stop(t + 0.18);
      } else {
        // Sharp high palm slap (Crack transient + bandpass skin ring)
        const bufferSize = Math.floor(ctx.sampleRate * 0.08);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2600, t);
        filter.Q.setValueAtTime(3.5, t);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(g * 1.2, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(dest);

        noise.start(t);
        noise.stop(t + 0.08);
      }
    } catch {}
  }

  /**
   * Brazilian Batucada Surdo (Deep 22" Carnival Bass Drum)
   */
  public static synthBatucadaSurdo(
    ctx: AudioContext,
    dest: GainNode,
    note: string = 'C2',
    time: number,
    isMuted: boolean = false,
    gainVal: number = 0.44
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.44);
      const freq = getNoteFreq(note);
      const dur = isMuted ? 0.09 : 0.42;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * 1.5, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.85, t + 0.07);

      gain.gain.setValueAtTime(g, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(t);
      osc.stop(t + dur);

      // Mallet attack hit
      const click = ctx.createOscillator();
      const clickGain = ctx.createGain();
      click.type = 'triangle';
      click.frequency.setValueAtTime(220, t);
      click.frequency.exponentialRampToValueAtTime(50, t + 0.02);
      clickGain.gain.setValueAtTime(g * 0.5, t);
      clickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);
      click.connect(clickGain);
      clickGain.connect(dest);
      click.start(t);
      click.stop(t + 0.025);
    } catch {}
  }

  /**
   * Brazilian Repinique / Caixeta Stick & Rimshot (High-energy carnival drive)
   */
  public static synthBatucadaRepinique(
    ctx: AudioContext,
    dest: GainNode,
    time: number,
    isRimshot: boolean = false,
    gainVal: number = 0.32
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.32);
      const dur = isRimshot ? 0.08 : 0.045;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(isRimshot ? 620 : 440, t);
      osc.frequency.exponentialRampToValueAtTime(isRimshot ? 280 : 200, t + 0.03);

      gain.gain.setValueAtTime(g, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(t);
      osc.stop(t + dur);

      if (isRimshot) {
        const bufferSize = Math.floor(ctx.sampleRate * 0.06);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(4000, t);
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(g * 0.7, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(dest);
        noise.start(t);
        noise.stop(t + 0.06);
      }
    } catch {}
  }

  /**
   * Latin Timbales & Cascara Side Shell Click (Salsa, Mambo, Ricky Martin & Shakira styles)
   */
  public static synthLatinTimbales(
    ctx: AudioContext,
    dest: GainNode,
    pitch: 'high' | 'low',
    isCascara: boolean,
    time: number,
    gainVal: number = 0.32
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.32);

      if (isCascara) {
        // Metallic wooden stick on the paila shell
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        osc.type = 'square';
        osc.frequency.setValueAtTime(1450, t);
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2800, t);
        filter.Q.setValueAtTime(6.0, t);
        gain.gain.setValueAtTime(g * 0.75, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(dest);
        osc.start(t);
        osc.stop(t + 0.035);
      } else {
        // Ringing open rimshot drum head
        const baseFreq = pitch === 'high' ? 440 : 330;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(baseFreq * 1.6, t);
        osc.frequency.exponentialRampToValueAtTime(baseFreq, t + 0.04);
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(baseFreq * 1.8, t);
        filter.Q.setValueAtTime(3.0, t);
        gain.gain.setValueAtTime(g, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(dest);
        osc.start(t);
        osc.stop(t + 0.16);
      }
    } catch {}
  }

  /**
   * African Thumb Piano / Kalimba (Warm wooden box resonance with ringing metal tines)
   */
  public static synthWorldKalimba(
    ctx: AudioContext,
    dest: GainNode,
    note: string,
    time: number,
    duration: number = 0.35,
    gainVal: number = 0.25
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const dur = Math.max(0.05, isFinite(duration) ? duration : 0.35);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.25);
      const freq = getNoteFreq(note);

      // Fundamental tine + harmonic overtone
      [1.0, 3.1].forEach((mult, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq * mult, t);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(freq * 3.5, t);
        filter.frequency.exponentialRampToValueAtTime(freq * 1.2, t + dur);

        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(idx === 0 ? g : g * 0.35, t + 0.003);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(dest);

        osc.start(t);
        osc.stop(t + dur);
      });
    } catch {}
  }

  /**
   * Massed Football Stadium Terrace Vocal Chant ("Ole Ole", "Allez Allez", "Dai Dai Dai", "Ohhh")
   */
  public static synthStadiumTerraceVocalChant(
    ctx: AudioContext,
    dest: GainNode,
    notes: string[],
    time: number,
    duration: number = 0.45,
    gainVal: number = 0.3,
    style: 'allez' | 'ole' | 'wavin' | 'italia' = 'ole'
  ) {
    if (!ctx || !dest || !notes || notes.length === 0 || ctx.state === 'closed') return;
    try {
      const vowel = style === 'allez' ? 'eh' : style === 'italia' ? 'ah' : 'oh';
      const perVoiceGain = gainVal / Math.max(1, notes.length * 0.65);
      notes.forEach((note) => {
        this.synthItalianVocal(ctx, dest, note, time, duration, perVoiceGain, vowel, true);
      });
    } catch {}
  }

  /**
   * 1980s / 1990s Italian World Cup Rock Lead Guitar (Un'estate italiana style singing overdrive)
   */
  public static synthItalianRockLeadGuitar(
    ctx: AudioContext,
    dest: GainNode,
    note: string,
    time: number,
    duration: number = 0.4,
    gainVal: number = 0.28,
    withVibrato: boolean = true
  ) {
    if (!ctx || !dest || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const dur = Math.max(0.06, isFinite(duration) ? duration : 0.4);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.28);
      const freq = getNoteFreq(note);

      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc2.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);
      osc2.frequency.setValueAtTime(freq, t);
      osc2.detune.setValueAtTime(6, t);

      if (withVibrato) {
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(5.8, t);
        lfoGain.gain.setValueAtTime(5.0, t);
        lfo.connect(osc.frequency);
        lfo.connect(osc2.frequency);
        lfo.start(t + 0.1);
        lfo.stop(t + dur);
      }

      const ampFilter = ctx.createBiquadFilter();
      ampFilter.type = 'lowpass';
      ampFilter.frequency.setValueAtTime(3200, t);
      ampFilter.Q.setValueAtTime(2.2, t);

      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(g, t + 0.012);
      gain.gain.setValueAtTime(g * 0.85, t + dur * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      osc.connect(ampFilter);
      osc2.connect(ampFilter);
      ampFilter.connect(gain);
      gain.connect(dest);

      osc.start(t);
      osc2.start(t);
      osc.stop(t + dur);
      osc2.stop(t + dur);
    } catch {}
  }

  /**
   * German Stadium Pop-Rock Driving Synth Power Riff (Herbert Grönemeyer style)
   */
  public static synthGermanAnthemSynthRock(
    ctx: AudioContext,
    dest: GainNode,
    notes: string[],
    time: number,
    duration: number = 0.24,
    gainVal: number = 0.26
  ) {
    if (!ctx || !dest || !notes || notes.length === 0 || ctx.state === 'closed') return;
    try {
      const now = ctx.currentTime;
      const t = Math.max(time, now);
      const dur = Math.max(0.04, isFinite(duration) ? duration : 0.24);
      const g = Math.max(0.0001, isFinite(gainVal) ? gainVal : 0.26);
      const perVoiceGain = g / Math.max(1, notes.length * 0.7);

      notes.forEach((note) => {
        const freq = getNoteFreq(note);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2600, t);
        filter.frequency.exponentialRampToValueAtTime(1100, t + dur);
        filter.Q.setValueAtTime(1.8, t);

        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(perVoiceGain, t + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(dest);

        osc.start(t);
        osc.stop(t + dur);
      });
    } catch {}
  }
}


