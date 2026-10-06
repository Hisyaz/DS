// ========================================================================
// 16-BIT SUPER SOUNDTRACK STEP SEQUENCERS
// Authentic Procedural 16-Bit Console & Arcade Music Engine
// Supports 7 Cultural Playlists + Main Menu Intro (71 Tracks)
// Features Multi-Layer Polyphony: FM Bass, Strings, Brass, Piano, Accordion,
// Nylon Guitar, Power Chords, Marimba, Pan Flute, and 16-Bit Studio Percussion
// ========================================================================

import { ChiptuneSynthEngine as S } from './audioSynthGenerators';
import { SoundtrackTrack } from '../types/soundtrack';

export function scheduleTrackStep(
  ctx: AudioContext,
  musicGain: GainNode,
  track: SoundtrackTrack,
  step: number,
  time: number
) {
  if (!ctx || !musicGain) return;

  const bar = Math.floor(step / 16);
  const beat = Math.floor((step % 16) / 4);
  const sub = step % 4;
  const isPhraseEnd = (step + 1) % 16 === 0;

  // Crash cymbal and drum roll on major section turnarounds (every 8 and 16 bars)
  if (step % (16 * 16) === 0) {
    S.synthCrash(ctx, musicGain, time, 0.42);
  } else if (step % (16 * 8) === 0) {
    S.synthCrash(ctx, musicGain, time, 0.3);
  }

  // Tom fills at bar turnarounds (bars 7, 15, 23, 31...)
  if (bar % 8 === 7 && beat === 3) {
    if (sub === 0) S.synthTom(ctx, musicGain, 'high', time, 0.28);
    if (sub === 1) S.synthTom(ctx, musicGain, 'high', time, 0.3);
    if (sub === 2) S.synthTom(ctx, musicGain, 'mid', time, 0.32);
    if (sub === 3) S.synthTom(ctx, musicGain, 'low', time, 0.35);
  }

  switch (track.id) {
    // =======================================================================
    // 0. ITALY — ITALIAN MELODIC, SYMPHONIC & POP-ROCK PLAYLIST (5 SONGS)
    // Full modern instrumentation: Grand Piano, Electric & Acoustic Guitars,
    // Warm Analog Synths, Expressive Italian Vocals & Symphonic Orchestration
    // =======================================================================

    // -----------------------------------------------------------------------
    // Track 1: "Notti Azzurre" • 130 BPM
    // Italia 90-inspired anthem with warm analog synths, electric guitar & stadium percussion
    // -----------------------------------------------------------------------
    case 'ita-1': {
      const sectionBar = bar % 16;
      // Chords: Verse (C - G - Am - F), Pre-Chorus (Dm - Em - F - G), Chorus (C - G - Am - F)
      let chordNotes: string[] = ['C4', 'E4', 'G4'];
      let rootBass = 'C2';
      let chordName = 'C';

      if (sectionBar < 8) {
        // Verse: C - G - Am - F
        const vChord = sectionBar % 4;
        if (vChord === 0) { chordNotes = ['C4', 'E4', 'G4']; rootBass = 'C2'; chordName = 'C'; }
        else if (vChord === 1) { chordNotes = ['B3', 'D4', 'G4']; rootBass = 'G1'; chordName = 'G'; }
        else if (vChord === 2) { chordNotes = ['C4', 'E4', 'A4']; rootBass = 'A1'; chordName = 'Am'; }
        else { chordNotes = ['C4', 'F4', 'A4']; rootBass = 'F1'; chordName = 'F'; }
      } else if (sectionBar < 12) {
        // Pre-Chorus Build: Dm - Em - F - G
        const pChord = sectionBar - 8;
        if (pChord === 0) { chordNotes = ['D4', 'F4', 'A4']; rootBass = 'D2'; chordName = 'Dm'; }
        else if (pChord === 1) { chordNotes = ['E4', 'G4', 'B4']; rootBass = 'E2'; chordName = 'Em'; }
        else if (pChord === 2) { chordNotes = ['F4', 'A4', 'C5']; rootBass = 'F1'; chordName = 'F'; }
        else { chordNotes = ['G4', 'B4', 'D5']; rootBass = 'G1'; chordName = 'G'; }
      } else {
        // Chorus: C - G - Am - F (Soaring Stadium Hook)
        const cChord = sectionBar - 12;
        if (cChord === 0) { chordNotes = ['C4', 'E4', 'G4']; rootBass = 'C2'; chordName = 'C'; }
        else if (cChord === 1) { chordNotes = ['B3', 'D4', 'G4']; rootBass = 'G1'; chordName = 'G'; }
        else if (cChord === 2) { chordNotes = ['C4', 'E4', 'A4']; rootBass = 'A1'; chordName = 'Am'; }
        else { chordNotes = ['C4', 'F4', 'A4']; rootBass = 'F1'; chordName = 'F'; }
      }

      // Warm Analog Polysynth (Italia 90 Synth Stabs & Pads)
      if (beat === 0 && sub === 0) {
        S.synthWarmAnalogLead(ctx, musicGain, chordNotes[0], time, 1.4, 0.22, true);
        S.synthWarmAnalogLead(ctx, musicGain, chordNotes[1], time, 1.4, 0.18, false);
        S.synthWarmAnalogLead(ctx, musicGain, chordNotes[2], time, 1.4, 0.18, false);
      }
      if (beat === 2 && sub === 2) {
        S.synthWarmAnalogLead(ctx, musicGain, chordNotes[0], time, 0.35, 0.16, false);
        S.synthWarmAnalogLead(ctx, musicGain, chordNotes[2], time, 0.35, 0.14, false);
      }

      // Driving 8th-Note Bass Pulse
      if (sub === 0 || sub === 2) {
        S.synthFmBass(ctx, musicGain, rootBass, time, 0.2, 0.38, 'solid');
      }

      // Singing Electric Guitar Lead & Riffs
      if (sectionBar >= 4) {
        if (sectionBar < 12) {
          // Verse & Pre-chorus Melodic Rock Riffs
          if (sub === 0 || (sub === 2 && beat % 2 === 1)) {
            const verseRiffs = ['E4', 'G4', 'A4', 'C5', 'D5', 'E5', 'D5', 'C5', 'A4', 'G4', 'E4', 'D4'];
            const note = verseRiffs[(step % verseRiffs.length)];
            S.synthElectricGuitar(ctx, musicGain, note, time, 0.38, 0.24, 'lead');
          }
        } else {
          // Soaring Anthemic Chorus Lead Guitar (Huge Italia 90 Stadium Melodic Hook)
          if (sub === 0 || sub === 2 || (beat === 3 && sub === 3)) {
            const chorusMelody = [
              'E5', 'G5', 'A5', 'G5', 'E5', 'D5', 'C5', 'D5',
              'E5', 'E5', 'D5', 'C5', 'A4', 'C5', 'D5', 'E5',
              'G5', 'A5', 'C6', 'B5', 'A5', 'G5', 'E5', 'G5',
              'A5', 'G5', 'E5', 'D5', 'C5', 'D5', 'C5', 'C5'
            ];
            const leadNote = chorusMelody[(step % chorusMelody.length)];
            S.synthElectricGuitar(ctx, musicGain, leadNote, time, 0.42, 0.28, 'lead');
          }
        }
      }

      // Rock Grand Piano Pounding Rhythm in Chorus
      if (sectionBar >= 12 && (sub === 0 || sub === 2)) {
        S.synthConcertPiano(ctx, musicGain, chordNotes[0], time, 0.3, 0.2, 1.1);
        S.synthConcertPiano(ctx, musicGain, chordNotes[2], time, 0.3, 0.18, 1.1);
      }

      // Vocal Chanting Layer in Chorus ("Oh-Oh" Stadium Atmosphere)
      if (sectionBar >= 12 && (beat === 1 || beat === 3) && sub === 0) {
        const chantNotes = ['G4', 'A4', 'C5', 'A4'];
        S.synthItalianVocal(ctx, musicGain, chantNotes[(step / 4) % chantNotes.length], time, 0.45, 0.22, 'oh', false);
      }

      // Stadium Rock Drums
      if (sub === 0) {
        S.synthKick(ctx, musicGain, time, 0.52);
      }
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synthSnare(ctx, musicGain, time, 0.44);
      }
      if (sub === 0 || sub === 2) {
        S.synthHiHat(ctx, musicGain, time, sub === 2, 0.14);
      }
      if (sectionBar >= 12 && sub === 0 && beat === 0) {
        S.synthCrash(ctx, musicGain, time, 0.32);
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track 2: "Nastro Rosa" • 96 BPM
    // Lucio Battisti-inspired Italian songwriting: Acoustic guitar, piano, soft electric guitar
    // -----------------------------------------------------------------------
    case 'ita-2': {
      const pBar = bar % 8;
      // Chords: Dm - Gm7 - C7 - Fmaj7 - Bbmaj7 - Em7b5 - A7sus4 - A7
      let chordNotes = ['D4', 'F4', 'A4'];
      let rootNote = 'D2';
      if (pBar === 0) { chordNotes = ['D4', 'F4', 'A4']; rootNote = 'D2'; }
      else if (pBar === 1) { chordNotes = ['D4', 'G4', 'Bb4']; rootNote = 'G1'; }
      else if (pBar === 2) { chordNotes = ['C4', 'E4', 'Bb4']; rootNote = 'C2'; }
      else if (pBar === 3) { chordNotes = ['C4', 'F4', 'A4']; rootNote = 'F1'; }
      else if (pBar === 4) { chordNotes = ['D4', 'F4', 'Bb4']; rootNote = 'Bb1'; }
      else if (pBar === 5) { chordNotes = ['D4', 'E4', 'G4', 'Bb4']; rootNote = 'E2'; }
      else if (pBar === 6) { chordNotes = ['D4', 'E4', 'A4']; rootNote = 'A1'; }
      else { chordNotes = ['C#4', 'E4', 'A4']; rootNote = 'A1'; }

      // Warm Acoustic Guitar Fingerpicking Arpeggios (Every 16th Note)
      const arpHarmonics = [chordNotes[0], chordNotes[1], chordNotes[2], chordNotes[1]];
      const arpNote = arpHarmonics[sub % arpHarmonics.length];
      S.synthAcousticGuitar(ctx, musicGain, arpNote, time, 0.38, 0.24, false);

      // Acoustic Grand Piano (Warm Chords & Counter-melody)
      if (beat === 0 && sub === 0) {
        S.synthConcertPiano(ctx, musicGain, chordNotes[0], time, 1.2, 0.22, 0.85);
        S.synthConcertPiano(ctx, musicGain, chordNotes[1], time, 1.2, 0.2, 0.85);
        S.synthConcertPiano(ctx, musicGain, chordNotes[2], time, 1.2, 0.2, 0.85);
      }
      if (beat === 2 && sub === 2) {
        S.synthConcertPiano(ctx, musicGain, chordNotes[2], time, 0.45, 0.16, 0.75);
      }

      // Smooth Melodic Bassline
      if (sub === 0 || (sub === 3 && beat === 1) || (sub === 2 && beat === 3)) {
        S.synthFmBass(ctx, musicGain, rootNote, time, 0.35, 0.32, 'smooth');
      }

      // Soft Electric Guitar with Warm Tone & Vibrato
      if (bar >= 4 && (sub === 0 || sub === 2)) {
        const guitarPhrases = [
          'A4', 'D5', 'F5', 'E5', 'D5', 'C5', 'D5', 'E5',
          'F5', 'G5', 'A5', 'G5', 'F5', 'E5', 'D5', 'C#5'
        ];
        const gNote = guitarPhrases[(step % guitarPhrases.length)];
        S.synthElectricGuitar(ctx, musicGain, gNote, time, 0.5, 0.22, 'clean');
      }

      // Intimate Italian Melodic Vocal Phrasing (Heartfelt & Nostalgic)
      if (bar >= 2 && (sub === 0 || (sub === 2 && beat % 2 === 1))) {
        const vocalMelody = [
          'D4', 'F4', 'A4', 'D5', 'C5', 'A4', 'G4', 'F4',
          'G4', 'Bb4', 'D5', 'C5', 'Bb4', 'A4', 'G4', 'F4',
          'E4', 'G4', 'Bb4', 'A4', 'G4', 'F4', 'E4', 'D4',
          'E4', 'F4', 'G4', 'F4', 'E4', 'D4', 'C#4', 'D4'
        ];
        const vNote = vocalMelody[(Math.floor(step / 2)) % vocalMelody.length];
        S.synthItalianVocal(ctx, musicGain, vNote, time, 0.55, 0.24, 'eh', false);
      }

      // Subtle Warm String Bed
      if (beat === 0 && sub === 0) {
        S.synthOrchestralStrings(ctx, musicGain, chordNotes, time, 2.0, 0.14, false);
      }

      // Gentle Ballad Groove
      if (sub === 0 && (beat === 0 || (beat === 2 && pBar % 2 === 1))) {
        S.synthKick(ctx, musicGain, time, 0.36);
      }
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synthSnare(ctx, musicGain, time, 0.28);
      }
      if (sub === 0 || sub === 2) {
        S.synthHiHat(ctx, musicGain, time, false, 0.08);
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track 3: "Voce del Cuore" • 78 BPM
    // Andrea Bocelli-inspired classical/pop crossover: Grand piano, strings, tenor vocal
    // -----------------------------------------------------------------------
    case 'ita-3': {
      const pBar = bar % 8;
      // Progression: Em - C - G - D - Em - C - D - G
      let chordNotes = ['E4', 'G4', 'B4'];
      let rootBass = 'E2';
      if (pBar === 0) { chordNotes = ['E4', 'G4', 'B4']; rootBass = 'E2'; }
      else if (pBar === 1) { chordNotes = ['E4', 'G4', 'C5']; rootBass = 'C2'; }
      else if (pBar === 2) { chordNotes = ['D4', 'G4', 'B4']; rootBass = 'G1'; }
      else if (pBar === 3) { chordNotes = ['D4', 'F#4', 'A4']; rootBass = 'D2'; }
      else if (pBar === 4) { chordNotes = ['E4', 'G4', 'B4']; rootBass = 'E2'; }
      else if (pBar === 5) { chordNotes = ['E4', 'G4', 'C5']; rootBass = 'C2'; }
      else if (pBar === 6) { chordNotes = ['D4', 'F#4', 'A4']; rootBass = 'D2'; }
      else { chordNotes = ['D4', 'G4', 'B4']; rootBass = 'G1'; }

      // Flowing Concert Grand Piano Arpeggios
      const pianoArp = [chordNotes[0], chordNotes[1], chordNotes[2], chordNotes[1]];
      S.synthConcertPiano(ctx, musicGain, pianoArp[sub % 4], time, 0.55, 0.26, 0.95);
      if (beat === 0 && sub === 0) {
        S.synthConcertPiano(ctx, musicGain, rootBass.replace('1', '2'), time, 1.8, 0.28, 1.0);
      }

      // Lush Orchestral Strings & Cello Section (Legato Swells)
      if (beat === 0 && sub === 0) {
        const isMajestic = bar >= 8;
        S.synthOrchestralStrings(ctx, musicGain, chordNotes, time, 2.8, isMajestic ? 0.28 : 0.18, isMajestic);
      }

      // Powerful Italian Tenor Vocal Performance (Expressive Formant Synthesis)
      if (bar >= 2) {
        if (sub === 0 || (sub === 2 && beat % 2 === 1)) {
          const isClimax = bar >= 12;
          const tenorAria = [
            'B4', 'G4', 'A4', 'B4', 'C5', 'B4', 'A4', 'G4',
            'E4', 'G4', 'A4', 'B4', 'D5', 'C5', 'B4', 'A4',
            'G4', 'B4', 'D5', 'G5', 'F#5', 'E5', 'D5', 'B4',
            'C5', 'E5', 'D5', 'C5', 'B4', 'A4', 'G4', 'G4'
          ];
          const ariaNote = tenorAria[(Math.floor(step / 2)) % tenorAria.length];
          S.synthItalianVocal(ctx, musicGain, ariaNote, time, isClimax ? 0.85 : 0.65, isClimax ? 0.32 : 0.26, 'ah', isClimax);
        }
      }

      // Acoustic Bass Support (Enters Bar 4)
      if (bar >= 4 && (sub === 0 || sub === 2)) {
        S.synthFmBass(ctx, musicGain, rootBass, time, 0.4, 0.32, 'smooth');
      }

      // Stadium Timpani Rolls on Cadences & Turnarounds (Bars 7, 15, 23...)
      if (bar >= 8 && pBar === 7 && beat === 3 && sub === 0) {
        S.synthStadiumTimpani(ctx, musicGain, 'G2', time, 0.42);
      } else if (bar >= 8 && pBar === 3 && beat === 3 && sub === 0) {
        S.synthStadiumTimpani(ctx, musicGain, 'D2', time, 0.36);
      }

      // Gentle Crossover Percussion (Enters Bar 8)
      if (bar >= 8) {
        if (sub === 0 && beat === 0) {
          S.synthKick(ctx, musicGain, time, 0.38);
        }
        if (sub === 0 && beat === 2) {
          S.synthSnare(ctx, musicGain, time, 0.24);
        }
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track 4: "Domenica Italiana" • 118 BPM
    // Modern Italian pop & Sunday matchday groove: Guitars, piano, live drums, bright bass
    // -----------------------------------------------------------------------
    case 'ita-4': {
      const pBar = bar % 8;
      // Progression: A - F#m - D - E - A - C#m - Bm - E
      let chordNotes = ['A3', 'C#4', 'E4'];
      let rootBass = 'A1';
      if (pBar === 0) { chordNotes = ['A3', 'C#4', 'E4']; rootBass = 'A1'; }
      else if (pBar === 1) { chordNotes = ['A3', 'C#4', 'F#4']; rootBass = 'F#1'; }
      else if (pBar === 2) { chordNotes = ['A3', 'D4', 'F#4']; rootBass = 'D2'; }
      else if (pBar === 3) { chordNotes = ['B3', 'E4', 'G#4']; rootBass = 'E2'; }
      else if (pBar === 4) { chordNotes = ['A3', 'C#4', 'E4']; rootBass = 'A1'; }
      else if (pBar === 5) { chordNotes = ['G#3', 'C#4', 'E4']; rootBass = 'C#2'; }
      else if (pBar === 6) { chordNotes = ['B3', 'D4', 'F#4']; rootBass = 'B1'; }
      else { chordNotes = ['B3', 'E4', 'G#4']; rootBass = 'E2'; }

      // Interlocking Acoustic Guitar Strumming (Every Beat)
      if (sub === 0 || sub === 2) {
        S.synthAcousticGuitar(ctx, musicGain, chordNotes[0], time, 0.25, 0.22, false);
        S.synthAcousticGuitar(ctx, musicGain, chordNotes[2], time, 0.25, 0.2, false);
      }

      // Bright Acoustic Piano Syncopated Comping
      if (sub === 1 || sub === 3) {
        S.synthConcertPiano(ctx, musicGain, chordNotes[1], time, 0.28, 0.2, 1.0);
        S.synthConcertPiano(ctx, musicGain, chordNotes[2], time, 0.28, 0.18, 1.0);
      }

      // Bright Walking Bassline with Bouncy Swing
      if (sub === 0 || sub === 2 || (beat === 1 && sub === 3) || (beat === 3 && sub === 3)) {
        const bassSteps = [rootBass, rootBass, rootBass, rootBass];
        S.synthFmBass(ctx, musicGain, bassSteps[sub % 4], time, 0.18, 0.42, 'slap');
      }

      // Bright Electric Guitar Chimey Riffs & Fills
      if (bar >= 2 && (sub === 0 || (sub === 2 && beat % 2 === 1))) {
        const electricTheme = [
          'E4', 'A4', 'C#5', 'E5', 'F#5', 'E5', 'C#5', 'B4',
          'A4', 'F#4', 'A4', 'C#5', 'B4', 'A4', 'G#4', 'A4',
          'D5', 'F#5', 'A5', 'G#5', 'F#5', 'E5', 'D5', 'C#5',
          'B4', 'C#5', 'D5', 'E5', 'F#5', 'G#5', 'A5', 'A5'
        ];
        const eNote = electricTheme[(Math.floor(step / 2)) % electricTheme.length];
        S.synthElectricGuitar(ctx, musicGain, eNote, time, 0.35, 0.24, 'lead');
      }

      // Catchy Italian Melodic Vocal Theme (Joyful Piazza & Stadium Atmosphere)
      if (bar >= 4 && (sub === 0 || (sub === 2 && beat % 2 === 0))) {
        const vocalJoy = [
          'C#5', 'E5', 'F#5', 'E5', 'C#5', 'B4', 'A4', 'B4',
          'C#5', 'C#5', 'B4', 'A4', 'F#4', 'A4', 'B4', 'C#5',
          'F#5', 'F#5', 'E5', 'D5', 'C#5', 'B4', 'A4', 'C#5',
          'B4', 'A4', 'G#4', 'A4', 'B4', 'G#4', 'A4', 'A4'
        ];
        const vJoyNote = vocalJoy[(Math.floor(step / 2)) % vocalJoy.length];
        S.synthItalianVocal(ctx, musicGain, vJoyNote, time, 0.45, 0.24, 'ah', false);
      }

      // Live-Feeling Acoustic Drums & Ride Cymbal
      if (sub === 0) {
        S.synthKick(ctx, musicGain, time, 0.48);
      }
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synthSnare(ctx, musicGain, time, 0.4);
      }
      if (sub === 0 || sub === 2) {
        S.synthRideCymbal(ctx, musicGain, time, 0.12);
        S.synthHiHat(ctx, musicGain, time, sub === 2, 0.08);
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track 5: "La Notte dei Campioni" • 124 BPM
    // Epic cinematic championship finale: Full orchestra, stadium percussion, operatic choir & synths
    // -----------------------------------------------------------------------
    case 'ita-5': {
      const stage = Math.floor(bar / 8); // Continuous cinematic build stages
      const pBar = bar % 8;
      // Grand Symphonic Progression: Dm - Bb - F - C - Gm - Dm - A7 - Dm
      let chordNotes = ['D4', 'F4', 'A4'];
      let rootBass = 'D2';
      if (pBar === 0) { chordNotes = ['D4', 'F4', 'A4']; rootBass = 'D2'; }
      else if (pBar === 1) { chordNotes = ['D4', 'F4', 'Bb4']; rootBass = 'Bb1'; }
      else if (pBar === 2) { chordNotes = ['C4', 'F4', 'A4']; rootBass = 'F1'; }
      else if (pBar === 3) { chordNotes = ['C4', 'E4', 'G4']; rootBass = 'C2'; }
      else if (pBar === 4) { chordNotes = ['D4', 'G4', 'Bb4']; rootBass = 'G1'; }
      else if (pBar === 5) { chordNotes = ['D4', 'F4', 'A4']; rootBass = 'D2'; }
      else if (pBar === 6) { chordNotes = ['C#4', 'E4', 'A4']; rootBass = 'A1'; }
      else { chordNotes = ['D4', 'F4', 'A4']; rootBass = 'D2'; }

      // Stage 0: Intimate Piano Opening
      if (sub === 0 || sub === 2) {
        const pianoVol = stage === 0 ? 0.28 : 0.22;
        S.synthConcertPiano(ctx, musicGain, chordNotes[sub === 0 ? 0 : 2], time, 0.45, pianoVol, stage >= 3 ? 1.2 : 0.85);
      }

      // Stage 1+: Full Orchestral Strings (Building Intensity)
      if (stage >= 1 && beat === 0 && sub === 0) {
        const strGain = Math.min(0.32, 0.16 + stage * 0.04);
        S.synthOrchestralStrings(ctx, musicGain, chordNotes, time, 2.2, strGain, stage >= 3);
      }

      // Stage 1+: Modern Analog Bass Pulse
      if (stage >= 1 && (sub === 0 || sub === 2)) {
        S.synthFmBass(ctx, musicGain, rootBass, time, 0.22, 0.4, stage >= 3 ? 'solid' : 'smooth');
      }

      // Stage 2+: Operatic Choir Harmonies
      if (stage >= 2 && beat === 0 && sub === 0) {
        const choirGain = Math.min(0.26, 0.14 + stage * 0.03);
        S.synthOperaticChoir(ctx, musicGain, chordNotes, time, 1.8, choirGain);
      }

      // Stage 3+: Soaring Heroic Electric Guitar Solos & Themes
      if (stage >= 3 && (sub === 0 || (sub === 2 && beat % 2 === 1))) {
        const epicSolo = [
          'D5', 'F5', 'A5', 'D6', 'C6', 'Bb5', 'A5', 'G5',
          'A5', 'D6', 'F6', 'E6', 'D6', 'C6', 'Bb5', 'A5',
          'Bb5', 'D6', 'G6', 'F6', 'E6', 'D6', 'C#6', 'D6',
          'E6', 'F6', 'G6', 'F6', 'E6', 'D6', 'C#6', 'D6'
        ];
        const gNote = epicSolo[(Math.floor(step / 2)) % epicSolo.length];
        S.synthElectricGuitar(ctx, musicGain, gNote, time, 0.45, 0.28, 'lead');
      }

      // Stage 4+: Tenor Soloist Grand Climax (Title Deciding Moment)
      if (stage >= 4 && (sub === 0 || sub === 2)) {
        const climaxAria = ['A4', 'D5', 'F5', 'A5', 'G5', 'F5', 'E5', 'F5', 'D5', 'A5', 'D6', 'D6'];
        const ariaNote = climaxAria[(Math.floor(step / 2)) % climaxAria.length];
        S.synthItalianVocal(ctx, musicGain, ariaNote, time, 0.65, 0.32, 'ah', true);
      }

      // Stadium Timpani Strikes (Building frequency with stages)
      if (stage >= 2 && (pBar === 0 || pBar === 4 || pBar === 7) && beat === 0 && sub === 0) {
        S.synthStadiumTimpani(ctx, musicGain, rootBass, time, 0.48);
      }

      // Stadium Percussion (Enters Stage 2, Full Force Stage 3+)
      if (stage >= 2) {
        if (sub === 0) {
          S.synthKick(ctx, musicGain, time, 0.52);
        }
        if ((beat === 1 || beat === 3) && sub === 0) {
          S.synthSnare(ctx, musicGain, time, 0.44);
        }
        if (sub === 0 || sub === 2) {
          S.synthHiHat(ctx, musicGain, time, sub === 2, 0.12);
        }
      }

      // Crash Cymbals on Major Section Changes
      if (stage >= 3 && pBar === 0 && beat === 0 && sub === 0) {
        S.synthCrash(ctx, musicGain, time, 0.4);
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track 6: "Stella di San Siro" • 124 BPM
    // Italo-Disco & Modern Melodic Electronic Rock (Moroder / The Kolors style)
    // Driving 16th-note arpeggiated bass, vintage 80s polysynths, punchy electro drums & vocal hooks
    // -----------------------------------------------------------------------
    case 'ita-6': {
      const sectionBar = bar % 16;
      // Chords: Am - F - C - G (Iconic Italian electronic anthem progression)
      const roots = ['A1', 'F1', 'C2', 'G1'];
      const chordTriads = [
        ['A3', 'C4', 'E4'],
        ['A3', 'C4', 'F4'],
        ['G3', 'C4', 'E4'],
        ['G3', 'B3', 'D4'],
      ];
      const curRoot = roots[sectionBar % 4];
      const curChord = chordTriads[sectionBar % 4];

      // 1. Driving 16th-Note Italo-Disco Arpeggiated Bass (Moroder pulse)
      const bassArp = [curRoot, curRoot.replace('1', '2'), curRoot, curRoot.replace('1', '2')];
      S.synthFmBass(ctx, musicGain, bassArp[sub], time, 0.14, 0.42, 'solid');

      // 2. Punchy Electro Drums (Crisp kick on all 4 beats, snappy snare on 2 and 4, open hat offbeat)
      if (sub === 0) {
        S.synthKick(ctx, musicGain, time, 0.54);
      }
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synthSnare(ctx, musicGain, time, 0.46, true);
        S.synthClap(ctx, musicGain, time, 0.28);
      }
      if (sub === 2) {
        S.synthHiHat(ctx, musicGain, time, true, 0.16);
      } else {
        S.synthHiHat(ctx, musicGain, time, false, 0.08);
      }

      // 3. Vintage 80s Polysynth Stabs & Shimmering Pads
      if (beat === 0 && sub === 0) {
        S.synthWarmAnalogLead(ctx, musicGain, curChord[0], time, 1.2, 0.2, true);
        S.synthWarmAnalogLead(ctx, musicGain, curChord[1], time, 1.2, 0.18, false);
        S.synthWarmAnalogLead(ctx, musicGain, curChord[2], time, 1.2, 0.18, false);
      }
      if (beat === 2 && sub === 2) {
        S.synthWarmAnalogLead(ctx, musicGain, curChord[0], time, 0.35, 0.16, false);
        S.synthWarmAnalogLead(ctx, musicGain, curChord[2], time, 0.35, 0.16, false);
      }

      // 4. San Siro Stadium Lead Synth Hook (Catchy Italo melody)
      if (sectionBar >= 4) {
        const italoHook = [
          'E5', 'A5', 'C6', 'B5', 'A5', 'G5', 'A5', 'E5',
          'F5', 'A5', 'C6', 'D6', 'C6', 'A5', 'G5', 'F5',
          'G5', 'C6', 'E6', 'D6', 'C6', 'B5', 'C6', 'G5',
          'B5', 'D6', 'G6', 'F6', 'E6', 'D6', 'B5', 'G5',
        ];
        const stepIdx = (sectionBar % 4) * 8 + (beat * 2 + Math.floor(sub / 2));
        const leadNote = italoHook[stepIdx % italoHook.length];
        if (sub === 0 || sub === 2) {
          S.synthWarmAnalogLead(ctx, musicGain, leadNote, time, 0.28, 0.26, true);
          S.synthElectricGuitar(ctx, musicGain, leadNote, time, 0.24, 0.2, 'lead');
        }
      }

      // 5. Vocoder / Stadium Terrace Chant ("Milano! Stella di Notte!")
      if (sectionBar >= 8 && (beat === 1 || beat === 3) && sub === 0) {
        const vChant = ['C5', 'E5', 'G5', 'E5'][(step / 4) % 4];
        S.synthItalianVocal(ctx, musicGain, vChant, time, 0.42, 0.24, 'oh', false);
      }

      // 6. Turnaround Crash & Tom Fill
      if ((sectionBar === 7 || sectionBar === 15) && beat === 3) {
        if (sub === 0) S.synthTom(ctx, musicGain, 'high', time, 0.28);
        if (sub === 1) S.synthTom(ctx, musicGain, 'mid', time, 0.3);
        if (sub === 2) S.synthTom(ctx, musicGain, 'low', time, 0.34);
        if (sub === 3) S.synthCrash(ctx, musicGain, time, 0.44);
      }
      break;
    }

    // =======================================================================
    // 🇩🇪 GERMANY — 16-BIT INDUSTRIAL METAL, NEUE DEUTSCHE WELLE & STADIUM ROCK
    // =======================================================================

    // -----------------------------------------------------------------------
    // Track 1: "Maschinentakt" • 125 BPM (Industrial Metal)
    // Heavy mechanical percussion, aggressive stomping groove, gritty FM bass,
    // syncopated distorted power chords & relentless German industrial drive
    // -----------------------------------------------------------------------
    case 'ger-1': {
      const sectionBar = bar % 16;
      // D Minor Industrial progression (D5 - Bb5 - C5 - D5) with heavy syncopation
      const roots = ['D2', 'D2', 'Bb1', 'C2'];
      const curRoot = roots[sectionBar % 4];
      const chords = [
        ['D3', 'A3', 'D4'],
        ['D3', 'A3', 'D4'],
        ['Bb2', 'F3', 'Bb3'],
        ['C3', 'G3', 'C4'],
      ];
      const curChord = chords[sectionBar % 4];

      // 1. Heavy Industrial Stomping Drums (Mechanical, tight, punchy)
      if (sub === 0) {
        S.synthKick(ctx, musicGain, time, 0.58);
      }
      // Syncopated 16th double kick hits on industrial grooves
      if ((beat === 1 && sub === 3) || (beat === 2 && sub === 2 && sectionBar % 2 === 1)) {
        S.synthKick(ctx, musicGain, time, 0.52);
      }
      // Aggressive mechanical snare + clap on 2 and 4
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synthSnare(ctx, musicGain, time, 0.5);
        S.synthClap(ctx, musicGain, time, 0.28);
      }
      // Relentless industrial 16th hi-hat grid with accents
      if (sub === 0 || sub === 2) {
        S.synthHiHat(ctx, musicGain, time, sub === 2, sub === 2 ? 0.16 : 0.1);
      }
      if (sub === 1 || sub === 3) {
        S.synthHiHat(ctx, musicGain, time, false, 0.06);
      }

      // 2. Gritty FM Reese & 808 Sub-Bass Pulse (16th-note industrial chug)
      if (sub === 0 || sub === 2 || (beat === 2 && sub === 1) || (beat === 3 && sub === 3)) {
        const bassNote = sub === 2 && sectionBar % 2 === 1 ? 'F2' : curRoot;
        S.synthFmBass(ctx, musicGain, bassNote, time, 0.18, 0.42, 'reese');
      }
      if (beat === 0 && sub === 0) {
        S.synthSubBass808(ctx, musicGain, curRoot, time, 0.6, 0.35);
      }

      // 3. Distorted Overdrive Industrial Power Chords (Heavy rhythmic chug)
      if (sectionBar >= 2) {
        // Syncopated industrial power chord rhythm (Steps: 0, 3, 6, 8, 10, 12, 14)
        const isChugStep =
          (beat === 0 && (sub === 0 || sub === 3)) ||
          (beat === 1 && (sub === 2)) ||
          (beat === 2 && (sub === 0 || sub === 2)) ||
          (beat === 3 && (sub === 0 || sub === 2));

        if (isChugStep) {
          S.synthPowerChord(ctx, musicGain, curChord[0], curChord[1], curChord[2], time, 0.22, 0.32);
          S.synthPunkGuitarOverdrive(ctx, musicGain, curChord[0], curChord[1], curChord[2], time, 0.2, 0.26);
        }
      }

      // 4. Industrial Sequencer / Alarm Synth Arpeggios (Hypnotic, dark electronic texture)
      if (sectionBar >= 4) {
        const seqNotes = ['D4', 'F4', 'A4', 'G4', 'F4', 'D4', 'Ab4', 'A4'];
        const seqNote = seqNotes[step % seqNotes.length];
        S.synthSquare(ctx, musicGain, seqNote, time, 0.1, 0.15);
        if (sub === 0 || sub === 2) {
          S.synthChiptuneArp(ctx, musicGain, [seqNote, 'D5', 'F5'], time, 0.14, 0.14);
        }
      }

      // Turnaround Crash & Impact
      if ((sectionBar === 7 || sectionBar === 15) && beat === 3 && sub === 3) {
        S.synthCrash(ctx, musicGain, time, 0.45);
        S.synthTom(ctx, musicGain, 'low', time, 0.35);
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track 2: "Neon Träume über Berlin" • 142 BPM (Neue Deutsche Welle / 80s Synth-Pop)
    // Bouncy electronic rhythm, iconic NDW bass octaves, bright retro synth hooks & analog pads
    // -----------------------------------------------------------------------
    case 'ger-2': {
      const sectionBar = bar % 16;
      // NDW Em - D - C - D classic progression
      const chords = [
        { root: 'E2', high: 'E3', notes: ['E4', 'G4', 'B4'] },
        { root: 'D2', high: 'D3', notes: ['D4', 'F#4', 'A4'] },
        { root: 'C2', high: 'C3', notes: ['C4', 'E4', 'G4'] },
        { root: 'D2', high: 'D3', notes: ['D4', 'F#4', 'A4'] },
      ];
      const cur = chords[sectionBar % 4];

      // 1. Upbeat 1980s NDW Drums (Snappy, bright, driving)
      if ((beat === 0 || beat === 2) && sub === 0) {
        S.synthKick(ctx, musicGain, time, 0.52);
      }
      if (beat === 1 && sub === 2) {
        S.synthKick(ctx, musicGain, time, 0.42);
      }
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synthSnare(ctx, musicGain, time, 0.46);
        S.synthClap(ctx, musicGain, time, 0.22);
      }
      if (sub === 0 || sub === 2) {
        S.synthHiHat(ctx, musicGain, time, sub === 2, sub === 2 ? 0.15 : 0.09);
      }

      // 2. Bouncy Octave-Jumping NDW Synth Bass (8th-note pulse: Low - High - Low - High)
      if (sub === 0 || sub === 2) {
        const bassNote = sub === 0 ? cur.root : cur.high;
        S.synthFmBass(ctx, musicGain, bassNote, time, 0.18, 0.4, 'solid');
      }

      // 3. Lush 80s Analog String Pads
      if (beat === 0 && sub === 0) {
        S.synthPadStrings(ctx, musicGain, cur.notes, time, 1.6, 0.18);
      }

      // 4. Iconic Catchy NDW Polysynth Hook (Bright analog lead & square stabs)
      if (sectionBar >= 4) {
        const ndwMelody = [
          'B4', 'G4', 'E4', 'G4', 'A4', 'B4', 'D5', 'B4',
          'A4', 'F#4', 'D4', 'F#4', 'G4', 'A4', 'C5', 'A4',
          'G4', 'E4', 'C4', 'E4', 'F#4', 'G4', 'B4', 'G4',
          'A4', 'B4', 'C5', 'D5', 'E5', 'D5', 'B4', 'A4',
        ];
        const stepIdx = (sectionBar % 4) * 8 + (beat * 2 + Math.floor(sub / 2));
        const leadNote = ndwMelody[stepIdx % ndwMelody.length];

        if (sub === 0 || sub === 2) {
          S.synthWarmAnalogLead(ctx, musicGain, leadNote, time, 0.26, 0.24, true);
          S.synthSquareChord(ctx, musicGain, [leadNote, cur.notes[1]], time, 0.2, 0.16);
        }
      }

      // 5. Synth Brass Stabs on Section Accents
      if ((beat === 0 && sub === 0) || (beat === 2 && sub === 2)) {
        S.synthBrass(ctx, musicGain, [cur.notes[0], cur.notes[2]], time, 0.35, 0.2);
      }

      // Turnaround Crash
      if (sectionBar === 15 && beat === 3 && sub === 2) {
        S.synthCrash(ctx, musicGain, time, 0.38);
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track 3: "Schwerelos im Kosmos" • 128 BPM (Retro-Futuristic Space Synth-Pop)
    // Driving 16th electronic sequencer bass, spacey arpeggios & soaring synth melody
    // -----------------------------------------------------------------------
    case 'ger-3': {
      const sectionBar = bar % 16;
      // Am - F - G - Em space progression
      const chords = [
        { root: 'A1', arp: ['A3', 'C4', 'E4', 'A4', 'C5', 'E5'], lead: 'A4' },
        { root: 'F1', arp: ['F3', 'A3', 'C4', 'F4', 'A4', 'C5'], lead: 'F4' },
        { root: 'G1', arp: ['G3', 'B3', 'D4', 'G4', 'B4', 'D5'], lead: 'G4' },
        { root: 'E1', arp: ['E3', 'G3', 'B3', 'E4', 'G4', 'B4'], lead: 'E4' },
      ];
      const cur = chords[sectionBar % 4];

      // 1. Electronic Space Drums (Crisp kick, snappy snare + toms)
      if ((beat === 0 || beat === 2) && sub === 0) {
        S.synthKick(ctx, musicGain, time, 0.54);
      }
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synthSnare(ctx, musicGain, time, 0.46);
        S.synthClap(ctx, musicGain, time, 0.2);
      }
      // 16th hi-hat pulse with open hat on upbeat
      if (sub === 2) {
        S.synthHiHat(ctx, musicGain, time, true, 0.14);
      } else {
        S.synthHiHat(ctx, musicGain, time, false, 0.08);
      }

      // 2. Relentless 16th-Note Driving Space Sequencer Bass
      const bassOctaves = [cur.root, 'A2', cur.root, 'C3'];
      const curBass = bassOctaves[sub % bassOctaves.length];
      S.synthFmBass(ctx, musicGain, curBass, time, 0.14, 0.38, 'solid');

      // 3. Cosmic Space Synth Arpeggios (Lush chiptune sweep)
      const arpNote = cur.arp[(step % cur.arp.length)];
      S.synthChiptuneArp(ctx, musicGain, [arpNote, cur.arp[(step + 2) % cur.arp.length]], time, 0.12, 0.16);

      // 4. Lush Space Pads
      if (beat === 0 && sub === 0) {
        S.synthPadStrings(ctx, musicGain, [cur.arp[1], cur.arp[3]], time, 1.8, 0.16);
      }

      // 5. Soaring Retro-Futuristic Lead Melody
      if (sectionBar >= 4) {
        const spaceMelody = [
          'E5', 'A5', 'B5', 'C6', 'B5', 'A5', 'G5', 'E5',
          'F5', 'A5', 'C6', 'E6', 'D6', 'C6', 'A5', 'F5',
          'G5', 'B5', 'D6', 'F6', 'E6', 'D6', 'B5', 'G5',
          'E5', 'G5', 'B5', 'D6', 'C6', 'B5', 'A5', 'G5',
        ];
        const melIdx = (sectionBar % 4) * 8 + (beat * 2 + Math.floor(sub / 2));
        const note = spaceMelody[melIdx % spaceMelody.length];

        if (sub === 0 || sub === 2) {
          S.synthWarmAnalogLead(ctx, musicGain, note, time, 0.32, 0.22, true);
        }
      }

      // Section Transitions
      if ((sectionBar === 7 || sectionBar === 15) && beat === 3 && sub === 3) {
        S.synthCrash(ctx, musicGain, time, 0.4);
        S.synthTom(ctx, musicGain, 'mid', time, 0.3);
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track 4: "Sturm der Sieger" • 126 BPM (German Stadium Hard Rock)
    // Heavy electric guitar riffs, screaming melodic leads & driving arena rock drums
    // -----------------------------------------------------------------------
    case 'ger-4': {
      const sectionBar = bar % 16;
      // Em - C - D - G - A Stadium Hard Rock progression
      const rockRoots = ['E2', 'C2', 'D2', 'G2'];
      const curRoot = rockRoots[sectionBar % 4];
      const powerChords = [
        ['E3', 'B3', 'E4'],
        ['C3', 'G3', 'C4'],
        ['D3', 'A3', 'D4'],
        ['G3', 'D4', 'G4'],
      ];
      const curChord = powerChords[sectionBar % 4];

      // 1. Heavy Arena Rock Drums (Kick, double hits, booming snare, ride & crash)
      if (sub === 0) {
        S.synthKick(ctx, musicGain, time, 0.56);
      }
      if (beat === 2 && sub === 2) {
        S.synthKick(ctx, musicGain, time, 0.48);
      }
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synthSnare(ctx, musicGain, time, 0.52);
      }
      // Rock Ride / Open Hi-Hat
      if (sub === 0 || sub === 2) {
        S.synthRideCymbal(ctx, musicGain, time, 0.18);
        S.synthHiHat(ctx, musicGain, time, sub === 2, 0.12);
      }

      // 2. Driving Rock 8th-Note Bass
      if (sub === 0 || sub === 2) {
        S.synthFmBass(ctx, musicGain, curRoot, time, 0.2, 0.4, 'solid');
      }

      // 3. Distorted Hard Rock Rhythm Guitars (Chugging power chords)
      const isRiffHit =
        (beat === 0 && (sub === 0 || sub === 2)) ||
        (beat === 1 && sub === 3) ||
        (beat === 2 && (sub === 0 || sub === 2)) ||
        (beat === 3 && (sub === 0 || sub === 2));

      if (isRiffHit) {
        S.synthPowerChord(ctx, musicGain, curChord[0], curChord[1], curChord[2], time, 0.26, 0.35);
        S.synthPunkGuitarOverdrive(ctx, musicGain, curChord[0], curChord[1], curChord[2], time, 0.24, 0.28);
      }

      // 4. Screaming Stadium Lead Guitar Solo (Sections >= 4)
      if (sectionBar >= 4) {
        const soloNotes = [
          'E5', 'G5', 'A5', 'B5', 'D6', 'E6', 'D6', 'B5',
          'C6', 'B5', 'A5', 'G5', 'A5', 'B5', 'C6', 'A5',
          'D6', 'C6', 'B5', 'A5', 'B5', 'C6', 'D6', 'B5',
          'G5', 'A5', 'B5', 'D6', 'E6', 'G6', 'E6', 'D6',
        ];
        const stepIdx = (sectionBar % 4) * 8 + (beat * 2 + Math.floor(sub / 2));
        const note = soloNotes[stepIdx % soloNotes.length];

        if (sub === 0 || sub === 2 || (beat === 3 && sub === 3)) {
          S.synthElectricGuitar(ctx, musicGain, note, time, 0.36, 0.28, 'lead');
        }
      }

      // Turnaround Cymbal & Crash
      if ((sectionBar === 7 || sectionBar === 15) && beat === 3 && sub === 3) {
        S.synthCrash(ctx, musicGain, time, 0.48);
        S.synthStadiumTimpani(ctx, musicGain, 'E1', time, 0.35);
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track 5: "Hyper Arena Rave" • 160 BPM (German Rave / Eurodance)
    // High-speed 4-on-the-floor, rolling 16th bassline, euphoric supersaw stabs & rapid arps
    // -----------------------------------------------------------------------
    case 'ger-5': {
      const sectionBar = bar % 16;
      // High-energy rave progression: Am - F - C - G
      const raveChords = [
        { root: 'A1', sub: 'A0', notes: ['A4', 'C5', 'E5'] },
        { root: 'F1', sub: 'F0', notes: ['F4', 'A4', 'C5'] },
        { root: 'C2', sub: 'C1', notes: ['C4', 'E4', 'G4'] },
        { root: 'G1', sub: 'G0', notes: ['G4', 'B4', 'D5'] },
      ];
      const cur = raveChords[sectionBar % 4];

      // 1. High-Speed 4-on-the-Floor 90s Rave Kick
      if (sub === 0) {
        S.synthKick(ctx, musicGain, time, 0.58);
      }
      // Snappy Snare + Rave Clap on 2 and 4
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synthSnare(ctx, musicGain, time, 0.48);
        S.synthClap(ctx, musicGain, time, 0.3);
      }
      // Iconic Open Hi-Hat on EVERY Offbeat (sub === 2) & fast 16th closed hats
      if (sub === 2) {
        S.synthHiHat(ctx, musicGain, time, true, 0.2);
      } else {
        S.synthHiHat(ctx, musicGain, time, false, 0.09);
      }

      // 2. Rolling 16th-Note Offbeat Techno Bassline
      const bassPattern = [cur.root, 'A2', cur.root, 'C3'];
      const curBassNote = bassPattern[sub % bassPattern.length];
      S.synthFmBass(ctx, musicGain, curBassNote, time, 0.12, 0.42, 'solid');
      if (beat === 0 && sub === 0) {
        S.synthSubBass808(ctx, musicGain, cur.sub, time, 0.4, 0.32);
      }

      // 3. Euphoric 90s German Rave Supersaw Stabs (Syncopated club stabs)
      if (sectionBar >= 2) {
        const isRaveHit =
          (beat === 0 && sub === 0) ||
          (beat === 0 && sub === 3) ||
          (beat === 1 && sub === 2) ||
          (beat === 2 && sub === 1) ||
          (beat === 3 && sub === 0) ||
          (beat === 3 && sub === 2);

        if (isRaveHit) {
          S.synthSquareChord(ctx, musicGain, cur.notes, time, 0.16, 0.24);
          S.synthWarmAnalogLead(ctx, musicGain, cur.notes[2], time, 0.18, 0.22, true);
        }
      }

      // 4. Rapid Speed Chiptune Arp Sequence
      if (sectionBar >= 4) {
        const arpStep = step % cur.notes.length;
        S.synthChiptuneArp(ctx, musicGain, [cur.notes[arpStep], 'A5'], time, 0.1, 0.16);
      }

      // 5. Crowd Atmosphere / Whistle Flare
      if ((sectionBar === 7 || sectionBar === 15) && beat === 3) {
        S.synthWhistle(ctx, musicGain, 'A5', time, 0.22);
        S.synthCrash(ctx, musicGain, time, 0.45);
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track 6: "Wind der Freiheit" • 76 BPM (Emotional German Rock Ballad)
    // Atmospheric acoustic guitars, nostalgic whistle lead, grand harmonized electric guitars & strings
    // -----------------------------------------------------------------------
    case 'ger-6': {
      const sectionBar = bar % 16;
      // C Major Ballad progression: C - Dm - C - Dm - Am - G - F - G
      const balladChords = [
        { root: 'C2', bass: 'C2', notes: ['C4', 'E4', 'G4'], whistle: 'G4' },
        { root: 'D2', bass: 'D2', notes: ['D4', 'F4', 'A4'], whistle: 'A4' },
        { root: 'C2', bass: 'C2', notes: ['C4', 'E4', 'G4'], whistle: 'G4' },
        { root: 'D2', bass: 'D2', notes: ['D4', 'F4', 'A4'], whistle: 'F4' },
        { root: 'A1', bass: 'A1', notes: ['A3', 'C4', 'E4'], whistle: 'E4' },
        { root: 'G1', bass: 'G1', notes: ['G3', 'B3', 'D4'], whistle: 'D4' },
        { root: 'F1', bass: 'F1', notes: ['F3', 'A3', 'C4'], whistle: 'C4' },
        { root: 'G1', bass: 'G1', notes: ['G3', 'B3', 'D4'], whistle: 'D4' },
      ];
      const cur = balladChords[sectionBar % 8];

      // 1. Slow, Deep Ballad Drums (Stadium kick on 1 & 3, warm snare on 2 & 4)
      if ((beat === 0 || beat === 2) && sub === 0) {
        S.synthKick(ctx, musicGain, time, 0.48);
      }
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synthSnare(ctx, musicGain, time, 0.44);
      }
      if (sub === 0 || sub === 2) {
        S.synthHiHat(ctx, musicGain, time, sub === 2, 0.08);
      }

      // 2. Warm Fingerpicked Acoustic Guitar Arpeggio (Gentle rolling picking)
      const pickNotes = [cur.notes[0], cur.notes[1], cur.notes[2], cur.notes[1]];
      const curPick = pickNotes[step % pickNotes.length];
      S.synthAcousticGuitar(ctx, musicGain, curPick, time, 0.42, 0.24);

      // 3. Concert Grand Piano & Lush Orchestral String Bed
      if (beat === 0 && sub === 0) {
        S.synthConcertPiano(ctx, musicGain, cur.notes[0], time, 1.8, 0.2);
        S.synthConcertPiano(ctx, musicGain, cur.notes[2], time, 1.8, 0.18);
        S.synthPadStrings(ctx, musicGain, cur.notes, time, 2.2, 0.18);
      }

      // 4. Gentle Warm Bass Pulse
      if ((beat === 0 || beat === 2) && sub === 0) {
        S.synthFmBass(ctx, musicGain, cur.bass, time, 0.4, 0.35, 'smooth');
      }

      // 5. Nostalgic Whistling / Flute Melodic Hook (Opening & Verse)
      if (sectionBar < 8) {
        const whistleMelody = [
          'G4', 'E4', 'G4', 'A4', 'C5', 'A4', 'G4', 'E4',
          'F4', 'D4', 'F4', 'G4', 'A4', 'F4', 'E4', 'D4',
        ];
        const stepIdx = (sectionBar % 4) * 4 + beat;
        const note = whistleMelody[stepIdx % whistleMelody.length];

        if (sub === 0) {
          S.synthWhistle(ctx, musicGain, note, time, 0.22);
          S.synthWarmAnalogLead(ctx, musicGain, note, time, 0.55, 0.14, true);
        }
      }

      // 6. Grand Soaring Harmonized Rock Guitar Chorus (Sections >= 8)
      if (sectionBar >= 8) {
        const chorusSolo = [
          'C5', 'E5', 'G5', 'A5', 'G5', 'E5', 'D5', 'C5',
          'A4', 'C5', 'E5', 'G5', 'F5', 'E5', 'D5', 'G5',
        ];
        const stepIdx = ((sectionBar - 8) % 8) * 4 + beat;
        const note = chorusSolo[stepIdx % chorusSolo.length];

        if (sub === 0 || sub === 2) {
          S.synthElectricGuitar(ctx, musicGain, note, time, 0.5, 0.26, 'lead');
        }
      }

      // Stadium Timpani on Major Transitions
      if ((sectionBar === 7 || sectionBar === 15) && beat === 3 && sub === 0) {
        S.synthStadiumTimpani(ctx, musicGain, 'G1', time, 0.32);
        S.synthCrash(ctx, musicGain, time, 0.35);
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track 7: "Klang der Südtribüne" • 128 BPM
    // Kraftwerk & Neue Deutsche Welle Electro-Pop / Dortmund Yellow Wall Anthem
    // Clockwork analog synthesizer pulses, vocoder chant melodies, energetic bass sequencer & terrace claps
    // -----------------------------------------------------------------------
    case 'ger-7': {
      const sectionBar = bar % 16;
      // Chords: Dm - Bb - F - C (Classic electronic anthem sequence)
      const roots = ['D2', 'Bb1', 'F1', 'C2'];
      const triads = [
        ['D4', 'F4', 'A4'],
        ['D4', 'F4', 'Bb4'],
        ['C4', 'F4', 'A4'],
        ['C4', 'E4', 'G4'],
      ];
      const curRoot = roots[sectionBar % 4];
      const curTriad = triads[sectionBar % 4];

      // 1. Clockwork Kraftwerk / NDW 16th-Note Bass Sequencer
      const isAccented = sub === 0 || sub === 2;
      S.synthFmBass(ctx, musicGain, isAccented ? curRoot : curRoot.replace('1', '2').replace('2', '3'), time, 0.12, 0.44, 'solid');

      // 2. Punchy Electronic NDW Drums
      if (sub === 0) {
        S.synthKick(ctx, musicGain, time, 0.54, 1.2);
      }
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synthSnare(ctx, musicGain, time, 0.46);
        S.synthClap(ctx, musicGain, time, 0.32);
      }
      // Tight electronic 16th hi-hat grid
      S.synthHiHat(ctx, musicGain, time, sub === 2, sub === 2 ? 0.14 : 0.08);

      // 3. Staccato Analog Synth Chord Stabs (Kraftwerk "Computer Love" style)
      if (sub === 0 || sub === 2) {
        S.synthWarmAnalogLead(ctx, musicGain, curTriad[0], time, 0.18, 0.18, false);
        S.synthWarmAnalogLead(ctx, musicGain, curTriad[2], time, 0.18, 0.16, false);
      }

      // 4. Yellow Wall Melodic Synth Lead Hook (Terrace celebration)
      if (sectionBar >= 4) {
        const südtribüneMelody = [
          'D5', 'F5', 'A5', 'D6', 'C6', 'A5', 'F5', 'E5',
          'F5', 'Bb5', 'D6', 'F6', 'E6', 'D6', 'Bb5', 'A5',
          'A5', 'C6', 'F6', 'E6', 'D6', 'C6', 'A5', 'G5',
          'G5', 'B5', 'D6', 'E6', 'D6', 'C6', 'A5', 'D5',
        ];
        const stepIdx = (sectionBar % 4) * 8 + (beat * 2 + Math.floor(sub / 2));
        const lead = südtribüneMelody[stepIdx % südtribüneMelody.length];
        if (sub === 0 || sub === 2) {
          S.synthWarmAnalogLead(ctx, musicGain, lead, time, 0.26, 0.28, true);
        }
      }

      // 5. Vocoder Chants ("Tor! Schwarz und Gelb! Vorwärts!")
      if (sectionBar >= 8 && (beat === 1 || beat === 3) && sub === 0) {
        const chantNote = ['A4', 'D5', 'F5', 'E5'][(step / 4) % 4];
        S.synthFrenchVocoder(ctx, musicGain, chantNote, time, 0.38, 0.28, 'robot');
      }

      // 6. Section Transition Timpani & Cymbal
      if ((sectionBar === 7 || sectionBar === 15) && beat === 3 && sub === 0) {
        S.synthStadiumTimpani(ctx, musicGain, 'D1', time, 0.38);
        S.synthCrash(ctx, musicGain, time, 0.42);
      }
      break;
    }

    // =======================================================================
    // PORTUGAL — PORTUGUESE FADO, ROCK, KUDURO & URBAN PLAYLIST (5 ORIGINAL TRACKS)
    // Inspired by Amália Rodrigues, Dulce Pontes, Xutos & Pontapés, Buraka Som Sistema & Da Weasel
    // =======================================================================

    // -----------------------------------------------------------------------
    // Track 1: "Saudade das Ruas de Lisboa" • 110 BPM
    // Traditional Portuguese Fado inspired by Amália Rodrigues "Cheira a Lisboa"
    // 12-string Guitarra Portuguesa arpeggios, nylon fado rhythm, nostalgic accordion
    // -----------------------------------------------------------------------
    case 'por-1': {
      const sectionBar = bar % 16;
      // Chords: Am - Dm - E7 - Am | C - G - E7 - Am
      let curChord: { root: string; notes: string[]; name: string };
      if (sectionBar < 8) {
        const v = sectionBar % 4;
        if (v === 0) curChord = { root: 'A1', notes: ['A3', 'C4', 'E4'], name: 'Am' };
        else if (v === 1) curChord = { root: 'D2', notes: ['D4', 'F4', 'A4'], name: 'Dm' };
        else if (v === 2) curChord = { root: 'E1', notes: ['B3', 'D4', 'E4', 'G#4'], name: 'E7' };
        else curChord = { root: 'A1', notes: ['A3', 'C4', 'E4'], name: 'Am' };
      } else {
        const c = sectionBar % 4;
        if (c === 0) curChord = { root: 'C2', notes: ['C4', 'E4', 'G4'], name: 'C' };
        else if (c === 1) curChord = { root: 'G1', notes: ['B3', 'D4', 'G4'], name: 'G' };
        else if (c === 2) curChord = { root: 'E1', notes: ['B3', 'D4', 'G#4'], name: 'E7' };
        else curChord = { root: 'A1', notes: ['A3', 'C4', 'E4'], name: 'Am' };
      }

      // 1. Fado Rhythm Guitar (Nylon Acoustic) - Characteristic Bass on 1 & 3, Rasgueado Chords on 2 & 4
      if (beat === 0 && sub === 0) {
        S.synthNylonGuitar(ctx, musicGain, curChord.root, time, 0.45, 0.3);
      } else if (beat === 2 && sub === 0) {
        S.synthNylonGuitar(ctx, musicGain, curChord.root, time, 0.45, 0.26);
      } else if ((beat === 1 || beat === 3) && (sub === 0 || sub === 2)) {
        S.synthNylonGuitar(ctx, musicGain, curChord.notes[0], time, 0.18, 0.2);
        S.synthNylonGuitar(ctx, musicGain, curChord.notes[1], time, 0.18, 0.18);
        S.synthNylonGuitar(ctx, musicGain, curChord.notes[2], time, 0.18, 0.18);
      }

      // 2. 12-String Guitarra Portuguesa (Chiming Lisboa Steel Arpeggios & Ornamentation)
      const fadoArp = ['E5', 'A5', 'C6', 'B5', 'A5', 'G#5', 'A5', 'E5'];
      const fadoStep = (step % 8);
      if (sub === 0 || sub === 2) {
        const arpNote = fadoArp[fadoStep];
        S.synthPortugueseGuitar(ctx, musicGain, arpNote, time, 0.25, 0.24);
      }

      // 3. Expressive Nostalgic Accordion Counterpoint (Bars >= 4)
      if (sectionBar >= 4) {
        const accordionMelody = [
          'A4', 'C5', 'E5', 'D5', 'C5', 'B4', 'A4', 'G#4',
          'B4', 'D5', 'F5', 'E5', 'D5', 'C5', 'B4', 'A4',
        ];
        const melIdx = (sectionBar % 4) * 4 + beat;
        const melNote = accordionMelody[melIdx % accordionMelody.length];
        if (sub === 0) {
          S.synthAccordion(ctx, musicGain, melNote, time, 0.6, 0.2);
        }
      }

      // 4. Warm Acoustic Bass
      if (sub === 0) {
        S.synthFmBass(ctx, musicGain, curChord.root, time, 0.35, 0.32, 'smooth');
      }

      // 5. Subtle Matchday Percussion (Gentle Shaker & Tambourine)
      if (sub === 0 || sub === 2) {
        S.synthShaker(ctx, musicGain, time, 0.12);
      }
      if (beat === 1 || beat === 3) {
        if (sub === 0) S.synthTambourine(ctx, musicGain, time, false, 0.16);
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track 2: "Canto das Ondas do Atlântico" • 120 BPM
    // Dramatic Modern Fado & Atlantic Ballad inspired by Dulce Pontes "Canção do Mar"
    // Rolling wave swells, soaring emotional vocal synths, dramatic minor strings
    // -----------------------------------------------------------------------
    case 'por-2': {
      const sectionBar = bar % 16;
      // Dramatic Atlantic Progression: Am - F - Dm - E7 (Bars 0-7: Build, Bars 8-15: Grand Climax)
      const roots = ['A1', 'F1', 'D2', 'E1'];
      const stringPads = [
        ['A3', 'C4', 'E4'],
        ['F3', 'A3', 'C4'],
        ['D3', 'F3', 'A3'],
        ['E3', 'G#3', 'B3', 'D4'],
      ];
      const curIdx = sectionBar % 4;
      const curRoot = roots[curIdx];
      const curPad = stringPads[curIdx];

      // 1. Lush Minor Orchestral String Bed
      if (beat === 0 && sub === 0) {
        S.synthPadStrings(ctx, musicGain, curPad, time, 1.9, 0.22);
        S.synthOrchestralStrings(ctx, musicGain, curPad, time, 1.9, 0.16);
      }

      // 2. Rolling Wave Percussion & Stadium Timpani
      if (beat === 0 && sub === 0) {
        S.synthStadiumTimpani(ctx, musicGain, curRoot, time, 0.35);
        S.synthKick(ctx, musicGain, time, 0.45);
      }
      if (beat === 2 && sub === 0) {
        S.synthKick(ctx, musicGain, time, 0.35);
      }
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synthSnare(ctx, musicGain, time, 0.25, true);
      }

      // 3. Deep Resonant Bass Pulse
      if (sub === 0) {
        S.synthFmBass(ctx, musicGain, curRoot, time, 0.4, 0.35, 'solid');
      }

      // 4. Portuguese Guitar Maritime Flourishes
      if (sectionBar % 2 === 1 && beat >= 2) {
        const flourishes = ['E5', 'G#5', 'B5', 'D6', 'C6', 'B5', 'A5'];
        const flourishNote = flourishes[(beat * 4 + sub) % flourishes.length];
        S.synthPortugueseGuitar(ctx, musicGain, flourishNote, time, 0.18, 0.22);
      }

      // 5. Soaring Emotional Atlantic Vocal & Lead (Dulce Pontes-style grandeur)
      if (sectionBar >= 4) {
        const soaringMelody = [
          'E5', 'A5', 'B5', 'C6', 'B5', 'A5', 'G#5', 'E5',
          'F5', 'A5', 'D6', 'C6', 'B5', 'C6', 'B5', 'A5',
        ];
        const stepIdx = (sectionBar % 8) * 4 + beat;
        const note = soaringMelody[stepIdx % soaringMelody.length];
        if (sub === 0) {
          S.synthItalianVocal(ctx, musicGain, note, time, 0.75, 0.26);
          S.synthWarmAnalogLead(ctx, musicGain, note, time, 0.75, 0.18, true);
        }
      }

      // Atlantic Wave Crash Swell
      if ((sectionBar === 7 || sectionBar === 15) && beat === 3 && sub === 0) {
        S.synthCrash(ctx, musicGain, time, 0.45);
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track 3: "Grito do Estádio Lusitano" • 148 BPM
    // Classic Portuguese Stadium Rock inspired by Xutos & Pontapés "A Minha Casinha"
    // Roaring overdrive power chords, punchy driving drums, anthemic stadium singalong
    // -----------------------------------------------------------------------
    case 'por-3': {
      const sectionBar = bar % 16;
      // High-Energy Stadium Rock Chords: A - D - E - A | F#m - D - E - A
      let rChord: { r1: string; r2: string; r3: string; bass: string };
      if (sectionBar < 8) {
        const v = sectionBar % 4;
        if (v === 0) rChord = { r1: 'A3', r2: 'E4', r3: 'A4', bass: 'A1' };
        else if (v === 1) rChord = { r1: 'D3', r2: 'A3', r3: 'D4', bass: 'D2' };
        else if (v === 2) rChord = { r1: 'E3', r2: 'B3', r3: 'E4', bass: 'E2' };
        else rChord = { r1: 'A3', r2: 'E4', r3: 'A4', bass: 'A1' };
      } else {
        const c = sectionBar % 4;
        if (c === 0) rChord = { r1: 'F#3', r2: 'C#4', r3: 'F#4', bass: 'F#1' };
        else if (c === 1) rChord = { r1: 'D3', r2: 'A3', r3: 'D4', bass: 'D2' };
        else if (c === 2) rChord = { r1: 'E3', r2: 'B3', r3: 'E4', bass: 'E2' };
        else rChord = { r1: 'A3', r2: 'E4', r3: 'A4', bass: 'A1' };
      }

      // 1. Driving Overdrive Rock Guitar Rhythms
      if (sub === 0 || sub === 2) {
        S.synthPowerChord(ctx, musicGain, rChord.r1, rChord.r2, rChord.r3, time, 0.22, 0.32);
        S.synthPunkGuitarOverdrive(ctx, musicGain, rChord.r1, rChord.r2, rChord.r3, time, 0.2, 0.25);
      }

      // 2. Punchy Driving Stadium Drums
      if (beat === 0 && sub === 0) S.synthKick(ctx, musicGain, time, 0.5);
      if (beat === 1 && sub === 2) S.synthKick(ctx, musicGain, time, 0.4);
      if (beat === 2 && sub === 0) S.synthKick(ctx, musicGain, time, 0.48);
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synthSnare(ctx, musicGain, time, 0.45, false);
      }
      // 8th-note driving hi-hats
      if (sub === 0 || sub === 2) {
        S.synthHiHat(ctx, musicGain, time, false, 0.16);
      }

      // 3. Pumping Bass Guitar
      if (sub === 0 || sub === 2) {
        S.synthFmBass(ctx, musicGain, rChord.bass, time, 0.18, 0.38, 'slap');
      }

      // 4. Sing-Along Portuguese Stadium Lead Riff (Bars >= 4)
      if (sectionBar >= 4) {
        const stadiumRiff = [
          'A4', 'C#5', 'E5', 'A5', 'G#5', 'F#5', 'E5', 'C#5',
          'D5', 'F#5', 'A5', 'F#5', 'E5', 'G#5', 'B5', 'A5',
        ];
        const stepIdx = (sectionBar % 4) * 4 + beat;
        const note = stadiumRiff[stepIdx % stadiumRiff.length];
        if (sub === 0) {
          S.synthElectricGuitar(ctx, musicGain, note, time, 0.4, 0.28, 'lead');
        }
      }

      // 5. Lusitano Terrace Chants on Chorus (Bars 8-15)
      if (sectionBar >= 8 && (beat === 0 || beat === 2) && sub === 0) {
        S.synthTerraceCrowdChant(ctx, musicGain, 'A3', time, 0.35);
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track 4: "Batida Urbana de Luanda a Lisboa" • 140 BPM
    // Lusophone Kuduro & Afro-Portuguese Club inspired by Buraka Som Sistema "Kalemba (Wegue Wegue)"
    // Syncopated Kuduro polyrhythms, heavy sub kicks, digital Kuduro stabs, whistle blasts
    // -----------------------------------------------------------------------
    case 'por-4': {
      const sectionBar = bar % 16;
      // Syncopated Afro-House & Kuduro Progression in D minor: Dm - Gm - Bb - A7
      const roots = ['D2', 'G1', 'Bb1', 'A1'];
      const curRoot = roots[sectionBar % 4];

      // 1. Signature Kuduro Syncopated Drum Pattern (Triple-hit kicks & polyrhythmic percussion)
      if (beat === 0 && sub === 0) S.synthKick(ctx, musicGain, time, 0.55);
      if (beat === 1 && sub === 2) S.synthKick(ctx, musicGain, time, 0.48);
      if (beat === 2 && sub === 1) S.synthKick(ctx, musicGain, time, 0.5);
      if (beat === 3 && sub === 0) S.synthKick(ctx, musicGain, time, 0.52);

      // Kuduro Rim Snare / Claps
      if (beat === 1 && sub === 0) S.synthSnare(ctx, musicGain, time, 0.42, true);
      if (beat === 2 && sub === 3) S.synthSnare(ctx, musicGain, time, 0.35, true);
      if (beat === 3 && sub === 0) S.synthSnare(ctx, musicGain, time, 0.42, true);

      // Conga / Timbales Polyrhythm
      if (sub === 1) S.synthConga(ctx, musicGain, true, false, time, 0.28);
      if (sub === 3) S.synthConga(ctx, musicGain, false, false, time, 0.3);

      // Agogo bells on syncopated 16ths
      if ((step % 4 === 1) || (step % 4 === 3)) {
        S.synthAgogo(ctx, musicGain, true, time, 0.16);
      }

      // 2. Heavy Sub-Bass 808
      if (beat === 0 && sub === 0) {
        S.synthSubBass808(ctx, musicGain, curRoot, time, 0.45, 0.45);
      } else if (beat === 2 && sub === 1) {
        S.synthSubBass808(ctx, musicGain, curRoot, time, 0.35, 0.4);
      }

      // 3. Kuduro Electronic Digital Stabs (Buraka Wegue-Wegue style)
      const stabNotes = ['D4', 'F4', 'A4', 'C5', 'A4', 'G4', 'F4', 'D4'];
      if ((beat === 0 && sub === 2) || (beat === 1 && sub === 3) || (beat === 2 && sub === 2) || (beat === 3 && sub === 1)) {
        const stabNote = stabNotes[(step % stabNotes.length)];
        S.synthKuduroStab(ctx, musicGain, stabNote, time, 0.15, 0.32);
      }

      // 4. Referee & Matchday Whistle Flares
      if ((sectionBar % 4 === 3) && beat === 3) {
        if (sub === 0) S.synthWhistle(ctx, musicGain, 'A5', time, 0.25);
        if (sub === 2) S.synthWhistle(ctx, musicGain, 'D6', time, 0.28);
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track 5: "Ritmo das Ruas de Sintra" • 94 BPM
    // Portuguese Alternative Hip-Hop & Urban Funk inspired by Da Weasel "Re-Tratamento"
    // Deep smooth bassline, jazz chords, laid-back boom-bap beat, Lisbon street swagger
    // -----------------------------------------------------------------------
    case 'por-5': {
      const sectionBar = bar % 16;
      // Smooth Jazzy Hip-Hop Progression: Dm9 - G13 - Cmaj7 - A7alt
      const chords = [
        { root: 'D2', bass: ['D2', 'F2', 'A2', 'C3'], keys: ['F4', 'A4', 'C5', 'E5'] },
        { root: 'G1', bass: ['G1', 'B1', 'D2', 'F2'], keys: ['F4', 'A4', 'B4', 'E5'] },
        { root: 'C2', bass: ['C2', 'E2', 'G2', 'B2'], keys: ['E4', 'G4', 'B4', 'D5'] },
        { root: 'A1', bass: ['A1', 'C#2', 'E2', 'G2'], keys: ['G4', 'Bb4', 'C#5', 'F5'] },
      ];
      const cur = chords[sectionBar % 4];

      // 1. Classic Boom-Bap Hip-Hop Drum Groove
      if (beat === 0 && sub === 0) S.synthKick(ctx, musicGain, time, 0.5);
      if (beat === 1 && sub === 2) S.synthKick(ctx, musicGain, time, 0.38); // Ghost kick
      if (beat === 2 && sub === 1) S.synthKick(ctx, musicGain, time, 0.42);
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synthSnare(ctx, musicGain, time, 0.46, true);
      }
      // Crisp boom-bap hi-hats with swing
      if (sub === 0) S.synthHiHat(ctx, musicGain, time, false, 0.18);
      if (sub === 2) S.synthHiHat(ctx, musicGain, time, false, 0.12);
      if (beat === 3 && sub === 3) S.synthHiHat(ctx, musicGain, time, true, 0.2);

      // 2. Smooth Walking FM / Sub Bassline
      const bassNote = cur.bass[beat % 4];
      if (sub === 0 || (beat === 2 && sub === 2)) {
        S.synthFmBass(ctx, musicGain, bassNote, time, 0.4, 0.4, 'smooth');
      }

      // 3. Rhodes / FM Piano Jazz Chords on 2 & 4
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synthFmPiano(ctx, musicGain, cur.keys[0], time, 0.5, 0.22);
        S.synthFmPiano(ctx, musicGain, cur.keys[1], time, 0.5, 0.2);
        S.synthFmPiano(ctx, musicGain, cur.keys[2], time, 0.5, 0.2);
      }

      // 4. Urban Wah-Guitar Licks & Melodic Hook (Bars >= 4)
      if (sectionBar >= 4) {
        const urbanHook = [
          'D4', 'F4', 'A4', 'C5', 'D5', 'C5', 'A4', 'F4',
          'G4', 'B4', 'D5', 'F5', 'E5', 'D5', 'C5', 'A4',
        ];
        const stepIdx = (sectionBar % 4) * 4 + beat;
        const note = urbanHook[stepIdx % urbanHook.length];
        if (sub === 0) {
          S.synthElectricGuitar(ctx, musicGain, note, time, 0.35, 0.22, 'clean');
          S.synthWarmAnalogLead(ctx, musicGain, note, time, 0.35, 0.15, true);
        }
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track 6: "Festa no Minho e no Dragão" • 122 BPM
    // Portuguese Vira / Northern Pimba-Folk Rock Football Festival
    // Lively concertina accordion riffs, acoustic cavaquinho chops, festive percussion & celebratory brass
    // -----------------------------------------------------------------------
    case 'por-6': {
      const sectionBar = bar % 16;
      // Chords: G - D7 - C - G (Traditional Northern Portuguese festival cadence)
      const roots = ['G1', 'D2', 'C2', 'G1'];
      const triads = [
        ['G3', 'B3', 'D4'],
        ['F#3', 'C4', 'D4'],
        ['G3', 'C4', 'E4'],
        ['G3', 'B3', 'D4'],
      ];
      const curRoot = roots[sectionBar % 4];
      const curTriad = triads[sectionBar % 4];

      // 1. Lively Portuguese Accordion / Concertina Riffs (Fast festive Vira melody)
      const viraMelody = [
        'D5', 'G5', 'B5', 'A5', 'G5', 'F#5', 'G5', 'A5',
        'F#5', 'A5', 'C6', 'B5', 'A5', 'G5', 'F#5', 'D5',
        'E5', 'G5', 'C6', 'B5', 'A5', 'G5', 'E5', 'C5',
        'D5', 'B4', 'G4', 'B4', 'D5', 'G5', 'G5', 'G5',
      ];
      const stepIdx = (sectionBar % 4) * 8 + (beat * 2 + Math.floor(sub / 2));
      const accNote = viraMelody[stepIdx % viraMelody.length];
      if (sub === 0 || sub === 2) {
        S.synthBandoneonExpressive(ctx, musicGain, accNote, time, 0.22, 0.28, false);
      }

      // 2. Cavaquinho & Acoustic Guitar Fast Offbeat Strumming
      if (sub === 2) {
        S.synthCavaquinho(ctx, musicGain, curTriad[0], time, 0.16, 0.22);
        S.synthCavaquinho(ctx, musicGain, curTriad[2], time, 0.16, 0.2);
        S.synthAcousticGuitar(ctx, musicGain, curTriad[1], time, 0.18, 0.2);
      }

      // 3. Bouncing Folk-Rock Bassline (Down on 1, upbeat on 3)
      if (sub === 0 || (sub === 2 && (beat === 1 || beat === 3))) {
        S.synthFmBass(ctx, musicGain, curRoot, time, 0.2, 0.42, 'solid');
      }

      // 4. Festive Pandeiro, Triangle & Portuguese March Drums
      if (sub === 0) S.synthKick(ctx, musicGain, time, 0.52);
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synthSnare(ctx, musicGain, time, 0.44);
        S.synthClap(ctx, musicGain, time, 0.3);
      }
      if (sub === 0 || sub === 2) S.synthPandeiro(ctx, musicGain, sub === 0 ? 'thumb' : 'slap', time, 0.22);
      S.synthShaker(ctx, musicGain, time, 0.1);

      // 5. Celebratory Stadium Brass Fanfares in Chorus (Bars >= 8)
      if (sectionBar >= 8 && (beat === 0 || beat === 2) && sub === 0) {
        S.synthBrass(ctx, musicGain, [curTriad[0], curTriad[2]], time, 0.35, 0.25, false);
      }

      // 6. Whistle flourish on turnaround
      if ((sectionBar === 7 || sectionBar === 15) && beat === 3 && sub === 0) {
        S.synthWhistle(ctx, musicGain, 'G5', time, 0.28);
        S.synthCrash(ctx, musicGain, time, 0.38);
      }
      break;
    }

    // =======================================================================
    // SAUDI ARABIA & ARABIAN LEAGUE — KHALEEJI, ARABIC POP & CLUB (5 ORIGINAL TRACKS)
    // Inspired by Mohammed Abdu, Rashed Al Majed, Ahlam, Amr Diab & DJ Snake
    // =======================================================================

    // -----------------------------------------------------------------------
    // Track 1: "Layali Al-Riyadh (Riyadh Nights)" • 106 BPM
    // Traditional Khaleeji Orchestra inspired by Mohammed Abdu "Al Amaken"
    // Authentic acoustic Oud, Bayati modal strings, resonant Darbuka & Nay flute
    // -----------------------------------------------------------------------
    case 'sau-1': {
      const sectionBar = bar % 16;
      // Traditional Bayati Maqam Progression: D (Bayati) - Gm - C - D
      const chords = [
        { root: 'D2', notes: ['D4', 'F4', 'A4'], oudArp: ['D4', 'F4', 'A4', 'D5', 'C5', 'Bb4', 'A4', 'G4'] },
        { root: 'G1', notes: ['G3', 'Bb3', 'D4'], oudArp: ['G4', 'Bb4', 'D5', 'F5', 'Eb5', 'D5', 'C5', 'Bb4'] },
        { root: 'C2', notes: ['C4', 'E4', 'G4'], oudArp: ['C4', 'E4', 'G4', 'C5', 'Bb4', 'A4', 'G4', 'F4'] },
        { root: 'D2', notes: ['D4', 'F#4', 'A4'], oudArp: ['D4', 'F#4', 'A4', 'D5', 'Eb5', 'D5', 'C5', 'A4'] },
      ];
      const cur = chords[sectionBar % 4];

      // 1. Arabian Darbuka Rhythm (Authentic 'Doum' on beats 1 & 3, syncopated 'Tek' & 'Ka')
      if (beat === 0 && sub === 0) S.synthDarbuka(ctx, musicGain, 'doum', time, 0.45);
      if (beat === 1 && sub === 1) S.synthDarbuka(ctx, musicGain, 'tek', time, 0.3);
      if (beat === 1 && sub === 3) S.synthDarbuka(ctx, musicGain, 'ka', time, 0.28);
      if (beat === 2 && sub === 0) S.synthDarbuka(ctx, musicGain, 'doum', time, 0.4);
      if (beat === 3 && sub === 0) S.synthDarbuka(ctx, musicGain, 'tek', time, 0.35);
      if (beat === 3 && sub === 2) S.synthDarbuka(ctx, musicGain, 'ka', time, 0.3);

      // 2. Collective Khaleeji Handclaps (Syncopated Arabian group claps)
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synthKhaleejiClap(ctx, musicGain, time, 0.32);
      }

      // 3. Authentic Fretless Middle Eastern Oud Plucks & Runs
      const oudStep = step % 8;
      const oudNote = cur.oudArp[oudStep % cur.oudArp.length];
      if (sub === 0 || sub === 2) {
        S.synthOud(ctx, musicGain, oudNote, time, 0.32, 0.28);
      }

      // 4. Lush Bayati Orchestral String Bed
      if (beat === 0 && sub === 0) {
        S.synthPadStrings(ctx, musicGain, cur.notes, time, 1.8, 0.2);
        S.synthOrchestralStrings(ctx, musicGain, cur.notes, time, 1.8, 0.16);
      }

      // 5. Evocative Nay Reed Flute Solos (Bars >= 4)
      if (sectionBar >= 4) {
        const nayMelody = [
          'D5', 'Eb5', 'F5', 'G5', 'A5', 'Bb5', 'A5', 'G5',
          'F5', 'G5', 'F5', 'Eb5', 'D5', 'C5', 'D5', 'D5',
        ];
        const stepIdx = (sectionBar % 4) * 4 + beat;
        const note = nayMelody[stepIdx % nayMelody.length];
        if (sub === 0) {
          S.synthNayFlute(ctx, musicGain, note, time, 0.65, 0.26);
        }
      }

      // 6. Deep Desert FM Bass
      if (sub === 0) {
        S.synthFmBass(ctx, musicGain, cur.root, time, 0.35, 0.34, 'smooth');
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track 2: "Fakhr Al-Khaleej (Pride of the Gulf)" • 126 BPM
    // Modern Gulf / Khaleeji Pop inspired by Rashed Al Majed "Allah Kareem"
    // Driving 2/4 Gulf rhythm, syncopated collective claps, bright oud & pop synths
    // -----------------------------------------------------------------------
    case 'sau-2': {
      const sectionBar = bar % 16;
      // Celebratory Gulf Pop Chords: G - C - D - G (Bright & Accessible)
      const roots = ['G1', 'C2', 'D2', 'G1'];
      const pads = [
        ['G3', 'B3', 'D4'],
        ['C4', 'E4', 'G4'],
        ['D4', 'F#4', 'A4'],
        ['G3', 'B3', 'D4'],
      ];
      const curIdx = sectionBar % 4;
      const curRoot = roots[curIdx];
      const curPad = pads[curIdx];

      // 1. Driving Khaleeji 2/4 Rhythm (Darbuka + Modern Kick/Snare)
      if (beat === 0 && sub === 0) {
        S.synthKick(ctx, musicGain, time, 0.52);
        S.synthDarbuka(ctx, musicGain, 'doum', time, 0.4);
      }
      if (beat === 1 && sub === 2) S.synthDarbuka(ctx, musicGain, 'tek', time, 0.32);
      if (beat === 2 && sub === 0) {
        S.synthKick(ctx, musicGain, time, 0.48);
        S.synthDarbuka(ctx, musicGain, 'doum', time, 0.38);
      }
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synthSnare(ctx, musicGain, time, 0.4, false);
      }

      // 2. Rhythmic Khaleeji Triplet Claps on Offbeats
      if ((beat === 1 && sub === 2) || (beat === 3 && sub === 2)) {
        S.synthKhaleejiClap(ctx, musicGain, time, 0.35);
      }

      // 3. Bright Oud Melody Stabs
      const oudHooks = ['G4', 'B4', 'D5', 'G5', 'F#5', 'E5', 'D5', 'B4'];
      if (sub === 0 || sub === 2) {
        const oNote = oudHooks[(step % 8)];
        S.synthOud(ctx, musicGain, oNote, time, 0.2, 0.26);
      }

      // 4. Modern Pop Polysynth & Brass Stabs
      if (beat === 0 && sub === 0) {
        S.synthWarmAnalogLead(ctx, musicGain, curPad[0], time, 1.4, 0.2, true);
        S.synthWarmAnalogLead(ctx, musicGain, curPad[2], time, 1.4, 0.18, false);
      }
      if (beat === 2 && sub === 2) {
        S.synthBrass(ctx, musicGain, [curPad[1]], time, 0.28, 0.24);
      }

      // 5. Joyful Gulf Pop Lead Hook (Bars >= 4)
      if (sectionBar >= 4) {
        const gulfMelody = [
          'G5', 'A5', 'B5', 'D6', 'C6', 'B5', 'A5', 'G5',
          'E5', 'G5', 'A5', 'B5', 'A5', 'G5', 'F#5', 'G5',
        ];
        const stepIdx = (sectionBar % 4) * 4 + beat;
        const note = gulfMelody[stepIdx % gulfMelody.length];
        if (sub === 0) {
          S.synthArabicLead(ctx, musicGain, note, time, 0.38, 0.26);
        }
      }

      // 6. Bouncy Bassline
      if (sub === 0 || sub === 2) {
        S.synthFmBass(ctx, musicGain, curRoot, time, 0.18, 0.38, 'slap');
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track 3: "Malikat Al-Malaeb (Queen of the Pitch)" • 122 BPM
    // Dramatic Gulf Pop & Regal Arab Anthem inspired by Ahlam "Tadri Leish"
    // Powerful Hijaz strings, heavy Darbuka and Daf percussion, regal brass fanfares
    // -----------------------------------------------------------------------
    case 'sau-3': {
      const sectionBar = bar % 16;
      // Majestic Hijaz Maqam Progression: D (Hijaz) - Cm - Eb - D
      const chords = [
        { root: 'D2', notes: ['D4', 'F#4', 'A4'], brass: ['D4', 'A4', 'D5'] },
        { root: 'C2', notes: ['C4', 'Eb4', 'G4'], brass: ['C4', 'G4', 'C5'] },
        { root: 'Eb2', notes: ['Eb4', 'G4', 'Bb4'], brass: ['Eb4', 'Bb4', 'Eb5'] },
        { root: 'D2', notes: ['D4', 'F#4', 'A4'], brass: ['D4', 'A4', 'D5'] },
      ];
      const cur = chords[sectionBar % 4];

      // 1. Majestic Heavy Arabian Drumming (Daf + Darbuka + Timpani)
      if (beat === 0 && sub === 0) {
        S.synthKick(ctx, musicGain, time, 0.55);
        S.synthDarbuka(ctx, musicGain, 'doum', time, 0.48);
        S.synthStadiumTimpani(ctx, musicGain, cur.root, time, 0.35);
      }
      if (beat === 1 && sub === 2) S.synthDarbuka(ctx, musicGain, 'tek', time, 0.36);
      if (beat === 2 && sub === 0) {
        S.synthKick(ctx, musicGain, time, 0.48);
        S.synthDarbuka(ctx, musicGain, 'doum', time, 0.42);
      }
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synthSnare(ctx, musicGain, time, 0.44, false);
        S.synthDarbuka(ctx, musicGain, 'tek', time, 0.38);
      }

      // 2. Dramatic Unison Hijaz Strings
      if (beat === 0 && sub === 0) {
        S.synthPadStrings(ctx, musicGain, cur.notes, time, 1.8, 0.22);
        S.synthOrchestralStrings(ctx, musicGain, cur.notes, time, 1.8, 0.2);
      }

      // 3. Royal Brass Fanfares on Turnarounds (Bars 0, 4, 8, 12)
      if (beat === 2 && sub === 0) {
        S.synthBrass(ctx, musicGain, [cur.brass[0]], time, 0.4, 0.28);
        S.synthBrass(ctx, musicGain, [cur.brass[1]], time, 0.4, 0.24);
      }

      // 4. Soaring Regal Arabic Lead Melodies (Ahlam-style grandeur)
      if (sectionBar >= 4) {
        const regalMelody = [
          'D5', 'Eb5', 'F#5', 'G5', 'A5', 'Bb5', 'A5', 'G5',
          'F#5', 'G5', 'F#5', 'Eb5', 'D5', 'C5', 'Eb5', 'D5',
        ];
        const stepIdx = (sectionBar % 4) * 4 + beat;
        const note = regalMelody[stepIdx % regalMelody.length];
        if (sub === 0) {
          S.synthArabicLead(ctx, musicGain, note, time, 0.5, 0.28);
          S.synthOud(ctx, musicGain, note, time, 0.3, 0.22);
        }
      }

      // 5. Deep Resonant Sub-Bass Pulse
      if (sub === 0) {
        S.synthSubBass808(ctx, musicGain, cur.root, time, 0.45, 0.42);
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track 4: "Nour Al-Sahra (Desert Light)" • 120 BPM
    // Mediterranean Arabic Pop inspired by Amr Diab "Nour El Ain"
    // Spanish flamenco nylon guitar flourishes, syncopated Darbuka/Riq & Mediterranean synths
    // -----------------------------------------------------------------------
    case 'sau-4': {
      const sectionBar = bar % 16;
      // Mediterranean / Andalusian Arabic Cadence: Em - D - C - B7
      const chords = [
        { root: 'E2', notes: ['E4', 'G4', 'B4'], guitarPluck: ['E4', 'G4', 'B4', 'E5'] },
        { root: 'D2', notes: ['D4', 'F#4', 'A4'], guitarPluck: ['D4', 'F#4', 'A4', 'D5'] },
        { root: 'C2', notes: ['C4', 'E4', 'G4'], guitarPluck: ['C4', 'E4', 'G4', 'C5'] },
        { root: 'B1', notes: ['B3', 'D#4', 'F#4', 'A4'], guitarPluck: ['B3', 'D#4', 'F#4', 'B4'] },
      ];
      const cur = chords[sectionBar % 4];

      // 1. Mediterranean Pop Beat with Darbuka + Riq Tambourine
      if (beat === 0 && sub === 0) {
        S.synthKick(ctx, musicGain, time, 0.5);
        S.synthDarbuka(ctx, musicGain, 'doum', time, 0.42);
      }
      if (beat === 1 && sub === 2) S.synthDarbuka(ctx, musicGain, 'tek', time, 0.32);
      if (beat === 2 && sub === 0) {
        S.synthKick(ctx, musicGain, time, 0.45);
        S.synthDarbuka(ctx, musicGain, 'doum', time, 0.38);
      }
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synthSnare(ctx, musicGain, time, 0.42, false);
        S.synthTambourine(ctx, musicGain, time, false, 0.22);
      }

      // 2. Spanish Flamenco Nylon Guitar Flourishes (Amr Diab signature acoustic interplay)
      const gStep = step % 4;
      const gNote = cur.guitarPluck[gStep];
      if (sub === 0 || sub === 2) {
        S.synthNylonGuitar(ctx, musicGain, gNote, time, 0.2, 0.26);
      }

      // 3. Catchy Mediterranean Accordion & Synth Hook
      if (sectionBar >= 4) {
        const habibiHook = [
          'B4', 'C5', 'D5', 'E5', 'D5', 'C5', 'B4', 'A4',
          'G4', 'A4', 'B4', 'C5', 'B4', 'A4', 'G4', 'F#4',
        ];
        const stepIdx = (sectionBar % 4) * 4 + beat;
        const note = habibiHook[stepIdx % habibiHook.length];
        if (sub === 0) {
          S.synthAccordion(ctx, musicGain, note, time, 0.4, 0.24);
          S.synthWarmAnalogLead(ctx, musicGain, note, time, 0.4, 0.18, true);
        }
      }

      // 4. Bouncy Mediterranean Bassline
      if (sub === 0 || sub === 2) {
        S.synthFmBass(ctx, musicGain, cur.root, time, 0.2, 0.38, 'solid');
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track 5: "Sahara Club Storm" • 132 BPM
    // Arabian Moombahton & Global Electronic Crossover inspired by DJ Snake "Taki Taki"
    // Punchy Dembow beat, Arabian modal lead riff, deep 808 subs & explosive club energy
    // -----------------------------------------------------------------------
    case 'sau-5': {
      const sectionBar = bar % 16;
      // Minor Moombahton Club Progression: F#m - D - A - E (with Hijaz inflection)
      const roots = ['F#1', 'D2', 'A1', 'E1'];
      const curRoot = roots[sectionBar % 4];

      // 1. Heavy Dembow / Moombahton Drum Groove (DJ Snake style)
      // Kick on every 4 beats
      if (sub === 0) {
        S.synthKick(ctx, musicGain, time, 0.55);
      }
      // Syncopated Dembow Snare (on step 3 of beat 0, step 2 of beat 1, step 3 of beat 2, step 2 of beat 3)
      if ((beat === 0 && sub === 3) || (beat === 1 && sub === 2) || (beat === 2 && sub === 3) || (beat === 3 && sub === 2)) {
        S.synthSnare(ctx, musicGain, time, 0.46, true);
        S.synthDarbuka(ctx, musicGain, 'tek', time, 0.35);
      }

      // Rapid Darbuka Roll Fill on Turnarounds (Bar 7 & 15)
      if ((sectionBar === 7 || sectionBar === 15) && beat === 3) {
        S.synthDarbuka(ctx, musicGain, 'tek', time, 0.4);
      }

      // 2. Heavy 808 Sub-Bass Drops
      if (beat === 0 && sub === 0) {
        S.synthSubBass808(ctx, musicGain, curRoot, time, 0.65, 0.48);
      } else if (beat === 2 && sub === 0) {
        S.synthSubBass808(ctx, musicGain, curRoot, time, 0.55, 0.45);
      }

      // 3. Sharp Arabian Hijaz Modal Synth Lead (Snake-charmer style club hook)
      const arabicClubLead = [
        'F#4', 'G4', 'A#4', 'B4', 'C#5', 'D5', 'C#5', 'B4',
        'A#4', 'B4', 'A#4', 'G4', 'F#4', 'E4', 'G4', 'F#4',
      ];
      const stepIdx = (sectionBar % 4) * 4 + beat;
      const leadNote = arabicClubLead[stepIdx % arabicClubLead.length];
      if (sub === 0 || sub === 2) {
        S.synthArabicLead(ctx, musicGain, leadNote, time, 0.25, 0.32);
        S.synthKuduroStab(ctx, musicGain, leadNote, time, 0.18, 0.22);
      }

      // 4. Whistle Flares & Festival Rise
      if ((sectionBar === 7 || sectionBar === 15) && beat === 3 && sub === 0) {
        S.synthWhistle(ctx, musicGain, 'F#5', time, 0.28);
        S.synthCrash(ctx, musicGain, time, 0.48);
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track 6: "Ardah Al-Fursan (March of the Knights)" • 118 BPM
    // Epic Arabian Khaleeji Percussion & Oud Anthem / Stadium Knights March
    // Deep ceremonial framing drums (Mirwas/Tabel), authentic Oud riffs, Bayati/Hijaz modal strings & stadium chants
    // -----------------------------------------------------------------------
    case 'sau-6': {
      const sectionBar = bar % 16;
      // Bayati/Hijaz Arabian March: Dm - Gm - C - Dm
      const arabMarchChords = [
        { root: 'D2', notes: ['D4', 'F4', 'A4'], oud: ['D4', 'F4', 'G4', 'A4'] },
        { root: 'G1', notes: ['D4', 'G4', 'Bb4'], oud: ['G4', 'Bb4', 'C5', 'D5'] },
        { root: 'C2', notes: ['C4', 'E4', 'G4'], oud: ['C4', 'E4', 'G4', 'Bb4'] },
        { root: 'D2', notes: ['D4', 'F#4', 'A4'], oud: ['D4', 'F#4', 'A4', 'C5'] },
      ];
      const cur = arabMarchChords[sectionBar % 4];

      // 1. Traditional Ceremonial Ardah Percussion (Deep Doum on downbeat, resonant Tek claps)
      if (beat === 0 && sub === 0) {
        S.synthDarbuka(ctx, musicGain, 'doum', time, 0.52);
        S.synthKick(ctx, musicGain, time, 0.54);
        S.synthStadiumTimpani(ctx, musicGain, cur.root, time, 0.38);
      }
      if (beat === 1 && sub === 2) {
        S.synthDarbuka(ctx, musicGain, 'tek', time, 0.36);
      }
      if (beat === 2 && sub === 0) {
        S.synthDarbuka(ctx, musicGain, 'doum', time, 0.44);
      }
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synthSnare(ctx, musicGain, time, 0.42, false);
        S.synthDarbuka(ctx, musicGain, 'tek', time, 0.4);
      }
      if (sub === 2) {
        S.synthHiHat(ctx, musicGain, time, true, 0.12);
      }

      // 2. Resonant Oud Melody & Strummed Arpeggios
      if (sub === 0 || sub === 2) {
        const ardahTheme = [
          'D4', 'F4', 'G4', 'A4', 'Bb4', 'A4', 'G4', 'F4',
          'G4', 'Bb4', 'D5', 'C5', 'Bb4', 'A4', 'G4', 'F4',
          'C4', 'E4', 'G4', 'Bb4', 'A4', 'G4', 'F4', 'E4',
          'D4', 'F#4', 'A4', 'C5', 'D5', 'A4', 'F#4', 'D4',
        ];
        const stepIdx = (sectionBar % 4) * 8 + (beat * 2 + Math.floor(sub / 2));
        const oNote = ardahTheme[stepIdx % ardahTheme.length];
        S.synthOud(ctx, musicGain, oNote, time, 0.32, 0.28);
      }

      // 3. Majestic Arabic Strings & Brass Fanfares in Chorus (Bars >= 8)
      if (sectionBar >= 8 && beat === 0 && sub === 0) {
        S.synthOrchestralStrings(ctx, musicGain, cur.notes, time, 1.8, 0.24, true);
        S.synthBrass(ctx, musicGain, [cur.notes[0], cur.notes[2]], time, 0.6, 0.26, false);
      }

      // 4. Regal Arabic Modal Lead Synth (Nay / Zurna character)
      if (sectionBar >= 4 && (sub === 0 || (sub === 2 && beat % 2 === 1))) {
        const leadNotes = ['A4', 'D5', 'F5', 'E5', 'D5', 'C#5', 'D5', 'E5'];
        const lNote = leadNotes[step % leadNotes.length];
        S.synthArabicLead(ctx, musicGain, lNote, time, 0.38, 0.25);
      }

      // 5. Deep Resonant Bass
      if (sub === 0 || sub === 2) {
        S.synthFmBass(ctx, musicGain, cur.root, time, 0.2, 0.42, 'smooth');
      }

      // 6. Turnaround Crash
      if ((sectionBar === 7 || sectionBar === 15) && beat === 3 && sub === 0) {
        S.synthCrash(ctx, musicGain, time, 0.44);
      }
      break;
    }

    // =======================================================================
    // 1. FRANCE — ORIGINAL FRENCH FOOTBALL SOUNDTRACK (5 ORIGINAL COMPOSITIONS)
    // French House, Club Electro-Pop, Stromae-inspired Pop, Synthwave & 80s Pop-Rock
    // =======================================================================

    // -----------------------------------------------------------------------
    // Track 1: "Révolution Hexagone" • 124 BPM (French House / Hypnotic Robotic Groove)
    // 4-on-the-floor kick, funk bass, filtered disco keys & robotic vocoder chants
    // -----------------------------------------------------------------------
    case 'fra-1': {
      const sectionBar = bar % 16;
      // Dm7 - G7 - Cmaj7 - Am7 (Classic French Touch disco progression)
      const discoChords = [
        { root: 'D2', high: 'D3', notes: ['F4', 'A4', 'C5', 'E5'] },
        { root: 'G1', high: 'G2', notes: ['F4', 'B4', 'D5', 'F5'] },
        { root: 'C2', high: 'C3', notes: ['E4', 'G4', 'B4', 'D5'] },
        { root: 'A1', high: 'A2', notes: ['E4', 'G4', 'A4', 'C5'] },
      ];
      const cur = discoChords[sectionBar % 4];

      // Dynamic Filter Sweep across 16-bar cycle (600Hz -> 4200Hz)
      const sweepProgress = (sectionBar / 16);
      const filterCutoff = 800 + Math.sin(sweepProgress * Math.PI) * 3400;

      // 1. Four-on-the-Floor Pumping French House Kick
      if (sub === 0) {
        S.synthKick(ctx, musicGain, time, 0.54);
      }
      // Crisp French Touch Clap + Snare on 2 and 4
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synthSnare(ctx, musicGain, time, 0.44, true);
        S.synthClap(ctx, musicGain, time, 0.32);
      }
      // Open Hi-Hat on EVERY Offbeat (sub === 2) & fast 16th closed hats
      if (sub === 2) {
        S.synthHiHat(ctx, musicGain, time, true, 0.16);
      } else {
        S.synthHiHat(ctx, musicGain, time, false, 0.08);
      }

      // 2. Funky French Touch Slap / Filtered Bass (Syncopated 16th groove with octave jumps)
      const isBassStep = sub === 0 || sub === 2 || (beat === 1 && sub === 3) || (beat === 3 && sub === 1);
      if (isBassStep) {
        const bassNote = (sub === 2 || sub === 3) ? cur.high : cur.root;
        S.synthFrenchTouchFilterBass(ctx, musicGain, bassNote, time, 0.16, 0.42, filterCutoff);
      }

      // 3. Filtered Disco Keys / Rhodes Stabs (Enters from Bar 4 onwards)
      if (bar >= 4) {
        const isKeyHit =
          (beat === 0 && sub === 0) ||
          (beat === 0 && sub === 3) ||
          (beat === 1 && sub === 2) ||
          (beat === 2 && sub === 2) ||
          (beat === 3 && sub === 1);

        if (isKeyHit) {
          S.synthDiscoHouseKeys(ctx, musicGain, cur.notes, time, 0.22, 0.22, filterCutoff);
        }
      }

      // 4. Robotic French Talkbox Vocoder Chants (Enters from Bar 8 onwards)
      if (bar >= 8 && (sub === 0 || sub === 2)) {
        const vocoderPhrases: Array<{ note: string; vowel: 'robot' | 'allez' | 'paris' | 'stade' }> = [
          { note: 'D4', vowel: 'robot' },
          { note: 'F4', vowel: 'robot' },
          { note: 'G4', vowel: 'allez' },
          { note: 'A4', vowel: 'paris' },
          { note: 'C5', vowel: 'stade' },
          { note: 'A4', vowel: 'robot' },
          { note: 'G4', vowel: 'allez' },
          { note: 'D4', vowel: 'paris' },
        ];
        const vStep = (sectionBar * 4 + beat * 2 + Math.floor(sub / 2)) % vocoderPhrases.length;
        const vItem = vocoderPhrases[vStep];
        S.synthFrenchVocoder(ctx, musicGain, vItem.note, time, 0.24, 0.26, vItem.vowel);
      }

      // 5. Soaring Stadium French House Lead (Chorus Climax: bars >= 32)
      if (bar >= 32 && (sub === 0 || (sub === 2 && beat % 2 === 1))) {
        const leadHook = [
          'A5', 'D6', 'C6', 'A5', 'F5', 'G5', 'A5', 'F5',
          'G5', 'C6', 'B5', 'G5', 'E5', 'F5', 'G5', 'E5',
          'F5', 'B5', 'A5', 'F5', 'D5', 'E5', 'F5', 'D5',
          'E5', 'A5', 'G5', 'E5', 'C#5', 'D5', 'E5', 'A5',
        ];
        const stepIdx = (sectionBar % 4) * 8 + (beat * 2 + Math.floor(sub / 2));
        const leadNote = leadHook[stepIdx % leadHook.length];
        S.synthWarmAnalogLead(ctx, musicGain, leadNote, time, 0.28, 0.24, true);
      }

      // Turnaround Crash on Section Boundary
      if ((sectionBar === 7 || sectionBar === 15) && beat === 3 && sub === 2) {
        S.synthCrash(ctx, musicGain, time, 0.42);
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track 2: "Nuit Triomphale" • 130 BPM (French Club / Electro-Pop)
    // Powerful drums, pumping bass, festival synth stabs & dynamic drops
    // -----------------------------------------------------------------------
    case 'fra-2': {
      const sectionBar = bar % 16;
      // High-energy French Club Progression: F#m - D - A - E
      const clubChords = [
        { root: 'F#1', high: 'F#2', notes: ['F#4', 'A4', 'C#5'] },
        { root: 'D2', high: 'D3', notes: ['F#4', 'A4', 'D5'] },
        { root: 'A1', high: 'A2', notes: ['E4', 'A4', 'C#5'] },
        { root: 'E2', high: 'E3', notes: ['E4', 'G#4', 'B4'] },
      ];
      const cur = clubChords[sectionBar % 4];

      // 1. Pounding 4-on-the-Floor Electronic Kick
      if (sub === 0) {
        S.synthKick(ctx, musicGain, time, 0.58);
      }
      // Explosive Festival Snare + Layered Clap on 2 and 4
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synthSnare(ctx, musicGain, time, 0.5, true);
        S.synthClap(ctx, musicGain, time, 0.32);
      }
      // Crisp 16th Hi-Hats with Open Offbeat
      if (sub === 2) {
        S.synthHiHat(ctx, musicGain, time, true, 0.18);
      } else {
        S.synthHiHat(ctx, musicGain, time, false, 0.09);
      }

      // 2. Rolling Electro-Club Sub-Bass & Solid FM Bass (16th pulse)
      if (sub === 0 || sub === 2 || (beat === 2 && sub === 3)) {
        S.synthFmBass(ctx, musicGain, cur.root, time, 0.14, 0.42, 'solid');
      }
      if (beat === 0 && sub === 0) {
        S.synthSubBass808(ctx, musicGain, cur.root, time, 0.55, 0.4);
      }

      // 3. Huge Sidechained Supersaw Stabs (Syncopated club rhythm)
      const isStabStep =
        (beat === 0 && sub === 0) ||
        (beat === 0 && sub === 3) ||
        (beat === 1 && sub === 2) ||
        (beat === 2 && sub === 1) ||
        (beat === 3 && sub === 0) ||
        (beat === 3 && sub === 2);

      if (isStabStep) {
        S.synthFrenchElectroLead(ctx, musicGain, cur.notes[2], time, 0.22, 0.28);
        S.synthSquareChord(ctx, musicGain, cur.notes, time, 0.2, 0.22);
      }

      // 4. Energetic French Stadium Chants & Vocoder
      if (sectionBar >= 4 && (beat === 1 || beat === 3) && sub === 0) {
        const chantNotes = ['A4', 'C#5', 'E5', 'C#5'];
        const vNote = chantNotes[(sectionBar * 2 + Math.floor(beat / 2)) % chantNotes.length];
        S.synthFrenchVocoder(ctx, musicGain, vNote, time, 0.35, 0.26, 'allez');
      }

      // 5. Soaring Festival Hook Melody (Chorus bars >= 16)
      if (bar >= 16 && (sub === 0 || (sub === 2 && beat % 2 === 1))) {
        const festivalMelody = [
          'C#5', 'E5', 'F#5', 'A5', 'G#5', 'F#5', 'E5', 'C#5',
          'D5', 'F#5', 'A5', 'B5', 'A5', 'F#5', 'E5', 'D5',
          'E5', 'A5', 'C#6', 'B5', 'A5', 'G#5', 'F#5', 'E5',
          'G#5', 'B5', 'E6', 'D6', 'C#6', 'B5', 'A5', 'G#5',
        ];
        const stepIdx = (sectionBar % 4) * 8 + (beat * 2 + Math.floor(sub / 2));
        const lead = festivalMelody[stepIdx % festivalMelody.length];
        S.synthFrenchElectroLead(ctx, musicGain, lead, time, 0.26, 0.28);
      }

      // Turnaround Whistle & Crash
      if ((sectionBar === 7 || sectionBar === 15) && beat === 3) {
        if (sub === 0) S.synthWhistle(ctx, musicGain, 'A5', time, 0.26);
        if (sub === 2) S.synthCrash(ctx, musicGain, time, 0.46);
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track 3: "Alors On Marque" • 120 BPM (French Electronic Pop / Melancholic Groove)
    // Minimalist crisp beat, syncopated bass, French vocal phrasing & melancholic brass lead
    // -----------------------------------------------------------------------
    case 'fra-3': {
      const sectionBar = bar % 16;
      // Stromae-style Melancholic Minor Progression: Cm - Eb - Ab - G7
      const popChords = [
        { root: 'C2', bass: 'C2', notes: ['C4', 'Eb4', 'G4'], sax: 'G4' },
        { root: 'Eb2', bass: 'Eb2', notes: ['Eb4', 'G4', 'Bb4'], sax: 'Bb4' },
        { root: 'Ab1', bass: 'Ab1', notes: ['C4', 'Eb4', 'Ab4'], sax: 'Ab4' },
        { root: 'G1', bass: 'G1', notes: ['B3', 'D4', 'G4'], sax: 'G4' },
      ];
      const cur = popChords[sectionBar % 4];

      // 1. Minimalist European Electronic Beat (Tight kick, crisp snare, syncopated shaker)
      if (beat === 0 && sub === 0) {
        S.synthKick(ctx, musicGain, time, 0.52);
      }
      if (beat === 2 && sub === 0) {
        S.synthKick(ctx, musicGain, time, 0.48);
      }
      if (beat === 1 && sub === 2) {
        // Syncopated ghost kick
        S.synthKick(ctx, musicGain, time, 0.38);
      }
      // Tight Snare + Rim on 2 and 4
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synthSnare(ctx, musicGain, time, 0.42);
        S.synthBodyPercussion(ctx, musicGain, 'clap_cup', time, 0.24);
      }
      // Crisp 16th Hi-Hats & Shakers
      if (sub === 2) {
        S.synthHiHat(ctx, musicGain, time, true, 0.12);
      } else {
        S.synthHiHat(ctx, musicGain, time, false, 0.07);
      }

      // 2. Bouncy Syncopated Minor Bassline (Distinctive European electronic pop rhythm)
      const isBassHit =
        (beat === 0 && (sub === 0 || sub === 2)) ||
        (beat === 1 && (sub === 1 || sub === 3)) ||
        (beat === 2 && (sub === 0 || sub === 2)) ||
        (beat === 3 && (sub === 1 || sub === 2));

      if (isBassHit) {
        S.synthFmBass(ctx, musicGain, cur.root, time, 0.18, 0.4, 'solid');
      }

      // 3. Melancholic French Electronic Horn / Sax Lead (Haunting counter-melody)
      if (sectionBar >= 2) {
        const saxMotif = [
          'G4', 'C5', 'Eb5', 'D5', 'C5', 'Bb4', 'C5', 'G4',
          'Bb4', 'Eb5', 'G5', 'F5', 'Eb5', 'D5', 'Eb5', 'Bb4',
          'Ab4', 'C5', 'Eb5', 'F5', 'Eb5', 'C5', 'Ab4', 'C5',
          'B4', 'D5', 'F5', 'G5', 'F5', 'D5', 'B4', 'G4',
        ];
        const stepIdx = (sectionBar % 4) * 8 + (beat * 2 + Math.floor(sub / 2));
        const saxNote = saxMotif[stepIdx % saxMotif.length];

        if (sub === 0 || sub === 2) {
          S.synthFrenchElectropopLead(ctx, musicGain, saxNote, time, 0.32, 0.25);
        }
      }

      // 4. Clever French Rhythmic Phrasing & Chants (Syncopated vocal hits)
      if (sectionBar >= 4 && (sub === 0 || (sub === 2 && beat % 2 === 1))) {
        const vocalPhra: Array<{ note: string; vowel: 'danse' | 'paris' | 'stade' | 'allez' }> = [
          { note: 'C4', vowel: 'danse' },
          { note: 'Eb4', vowel: 'danse' },
          { note: 'G4', vowel: 'paris' },
          { note: 'F4', vowel: 'danse' },
          { note: 'Eb4', vowel: 'stade' },
          { note: 'D4', vowel: 'danse' },
          { note: 'C4', vowel: 'allez' },
          { note: 'B3', vowel: 'danse' },
        ];
        const vIdx = (sectionBar * 4 + beat * 2 + Math.floor(sub / 2)) % vocalPhra.length;
        const vItem = vocalPhra[vIdx];
        S.synthFrenchVocoder(ctx, musicGain, vItem.note, time, 0.22, 0.24, vItem.vowel);
      }

      // 5. Sustained String Pads in Chorus Climax (bars >= 16)
      if (bar >= 16 && beat === 0 && sub === 0) {
        S.synthPadStrings(ctx, musicGain, cur.notes, time, 1.8, 0.16);
      }

      // Turnaround Crash
      if ((sectionBar === 7 || sectionBar === 15) && beat === 3 && sub === 2) {
        S.synthCrash(ctx, musicGain, time, 0.38);
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track 4: "Périphérique Minuit" • 105 BPM (French Synthwave / Night Drive)
    // Dark analog synths, driving electronic bass, gated retro drums & Paris night drive mood
    // -----------------------------------------------------------------------
    case 'fra-4': {
      const sectionBar = bar % 16;
      // Dark Parisian Synthwave Progression: Dm - Bb - F - C
      const darkChords = [
        { root: 'D2', sub: 'D1', notes: ['D4', 'F4', 'A4'] },
        { root: 'Bb1', sub: 'Bb0', notes: ['D4', 'F4', 'Bb4'] },
        { root: 'F1', sub: 'F0', notes: ['C4', 'F4', 'A4'] },
        { root: 'C2', sub: 'C1', notes: ['C4', 'E4', 'G4'] },
      ];
      const cur = darkChords[sectionBar % 4];

      // 1. Retro Drum Machine & 1980s Gated Snare
      if (beat === 0 && sub === 0) {
        S.synthKick(ctx, musicGain, time, 0.54);
      }
      if (beat === 2 && sub === 0) {
        S.synthKick(ctx, musicGain, time, 0.48);
      }
      // Gated 80s Snare on 2 and 4 (Massive Kavinsky / Nightcall punch)
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synth80sGatedSnare(ctx, musicGain, time, 0.48);
      }
      // Closed 16th Hi-Hats
      S.synthHiHat(ctx, musicGain, time, sub === 2, sub === 2 ? 0.12 : 0.08);

      // 2. Relentless 16th-Note Driving Synthwave Bass
      const isDrivingBass = sub === 0 || sub === 2 || (beat === 1 && sub === 3) || (beat === 3 && sub === 3);
      if (isDrivingBass) {
        S.synthFmBass(ctx, musicGain, cur.root, time, 0.16, 0.4, 'reese');
      }
      if (beat === 0 && sub === 0) {
        S.synthSubBass808(ctx, musicGain, cur.sub, time, 0.6, 0.38);
      }

      // 3. Cinematic Dark Analog Synth Pads (Lush Juno/Prophet nocturnal warmth)
      if (beat === 0 && sub === 0) {
        S.synthSynthwaveNightPad(ctx, musicGain, cur.notes, time, 2.0, 0.22);
      }

      // 4. Mysterious Nocturnal Lead Melody (Enters from bar 4)
      if (sectionBar >= 4) {
        const nightcallMelody = [
          'A4', 'D5', 'E5', 'F5', 'E5', 'D5', 'A4', 'F4',
          'Bb4', 'D5', 'F5', 'G5', 'F5', 'D5', 'Bb4', 'G4',
          'A4', 'C5', 'F5', 'E5', 'D5', 'C5', 'A4', 'F4',
          'G4', 'C5', 'E5', 'F5', 'E5', 'C5', 'G4', 'E4',
        ];
        const stepIdx = (sectionBar % 4) * 8 + (beat * 2 + Math.floor(sub / 2));
        const lead = nightcallMelody[stepIdx % nightcallMelody.length];

        if (sub === 0 || sub === 2) {
          S.synthWarmAnalogLead(ctx, musicGain, lead, time, 0.35, 0.24, true);
        }
      }

      // 5. Deep French Talkbox Vocoder Whispers ("Paris la nuit", "Minuit au stade")
      if (sectionBar >= 8 && (sub === 0 || sub === 2)) {
        const vocChants = ['D4', 'F4', 'A4', 'G4', 'F4', 'E4', 'D4', 'C4'];
        const vNote = vocChants[(sectionBar * 2 + beat) % vocChants.length];
        S.synthFrenchVocoder(ctx, musicGain, vNote, time, 0.3, 0.22, 'paris');
      }

      // Turnaround Crash & Gated Impact
      if ((sectionBar === 7 || sectionBar === 15) && beat === 3 && sub === 2) {
        S.synthCrash(ctx, musicGain, time, 0.42);
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track 5: "Quand le Stade S’Allume" • 118 BPM (1980s French Pop-Rock Anthem)
    // Live drums, warm bass guitar, electric guitars & big sing-along French chorus
    // -----------------------------------------------------------------------
    case 'fra-5': {
      const sectionBar = bar % 16;
      // Uplifting 1980s Goldman-style French Pop-Rock Progression: A - F#m - D - E
      const rockChords = [
        { root: 'A1', bass: 'A2', notes: ['A3', 'C#4', 'E4'], lead: 'E5' },
        { root: 'F#1', bass: 'F#2', notes: ['F#3', 'A3', 'C#4'], lead: 'C#5' },
        { root: 'D2', bass: 'D2', notes: ['F#3', 'A3', 'D4'], lead: 'F#5' },
        { root: 'E2', bass: 'E2', notes: ['G#3', 'B3', 'E4'], lead: 'G#5' },
      ];
      const cur = rockChords[sectionBar % 4];

      // 1. Live-Feeling 1980s Pop-Rock Drums (Punchy kick, warm snare, ride cymbal)
      if (beat === 0 && sub === 0) {
        S.synthKick(ctx, musicGain, time, 0.52);
      }
      if (beat === 2 && sub === 0) {
        S.synthKick(ctx, musicGain, time, 0.46);
      }
      if (beat === 1 && sub === 2) {
        S.synthKick(ctx, musicGain, time, 0.38);
      }
      // Booming Pop-Rock Snare on 2 and 4
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synthSnare(ctx, musicGain, time, 0.48);
      }
      // Rock Ride Cymbal & Hi-Hat
      if (sub === 0 || sub === 2) {
        S.synthRideCymbal(ctx, musicGain, time, 0.16);
        S.synthHiHat(ctx, musicGain, time, sub === 2, 0.1);
      }

      // 2. Warm 1980s Melodic Electric Bass Guitar (Smooth walking groove)
      if (sub === 0 || sub === 2 || (beat === 1 && sub === 3) || (beat === 3 && sub === 1)) {
        const bassPitch = (sub === 2 && sectionBar % 2 === 1) ? cur.bass : cur.root;
        S.synthFmBass(ctx, musicGain, bassPitch, time, 0.22, 0.38, 'smooth');
      }

      // 3. 1980s French Pop-Rock Rhythm Guitar (Clean funk-rock strumming)
      const isStrumStep =
        (beat === 0 && sub === 0) ||
        (beat === 0 && sub === 2) ||
        (beat === 1 && sub === 1) ||
        (beat === 1 && sub === 3) ||
        (beat === 2 && sub === 0) ||
        (beat === 3 && sub === 2);

      if (isStrumStep) {
        S.synthFrenchPopRockGuitar(ctx, musicGain, cur.notes[0], time, 0.18, 0.22, 'clean_strum');
        S.synthFrenchPopRockGuitar(ctx, musicGain, cur.notes[2], time, 0.18, 0.18, 'clean_strum');
      }

      // 4. Vintage 1980s Polysynth Bed & Turnaround Piano
      if (beat === 0 && sub === 0) {
        S.synthPadStrings(ctx, musicGain, cur.notes, time, 1.6, 0.15);
        S.synthConcertPiano(ctx, musicGain, cur.notes[1], time, 0.8, 0.18, 0.9);
      }

      // 5. Soaring French Pop-Rock Lead Guitar Riffs & Solo (Goldman style)
      if (sectionBar >= 4) {
        const guitarSoloNotes = [
          'E5', 'A5', 'B5', 'C#6', 'B5', 'A5', 'F#5', 'E5',
          'F#5', 'A5', 'C#6', 'E6', 'D6', 'C#6', 'A5', 'F#5',
          'A5', 'D6', 'F#6', 'E6', 'D6', 'C#6', 'B5', 'A5',
          'B5', 'E6', 'G#6', 'F#6', 'E6', 'D6', 'C#6', 'B5',
        ];
        const stepIdx = (sectionBar % 4) * 8 + (beat * 2 + Math.floor(sub / 2));
        const soloNote = guitarSoloNotes[stepIdx % guitarSoloNotes.length];

        if (sub === 0 || sub === 2 || (beat === 3 && sub === 3)) {
          S.synthFrenchPopRockGuitar(ctx, musicGain, soloNote, time, 0.36, 0.28, 'solo');
        }
      }

      // 6. Harmonized French Stadium Refrain ("Quand le stade s'allume", "Allez les Bleus")
      if (sectionBar >= 8 && (beat === 1 || beat === 3) && sub === 0) {
        const chantMelody = ['C#5', 'E5', 'A5', 'E5'];
        const cNote = chantMelody[(sectionBar + Math.floor(beat / 2)) % chantMelody.length];
        S.synthFrenchVocoder(ctx, musicGain, cNote, time, 0.38, 0.26, 'stade');
        S.synthItalianVocal(ctx, musicGain, cNote, time, 0.45, 0.2, 'oh', false);
      }

      // Turnaround Crash & Tom Fill
      if ((sectionBar === 7 || sectionBar === 15) && beat === 3) {
        if (sub === 0) S.synthTom(ctx, musicGain, 'high', time, 0.28);
        if (sub === 1) S.synthTom(ctx, musicGain, 'mid', time, 0.3);
        if (sub === 2) S.synthTom(ctx, musicGain, 'low', time, 0.34);
        if (sub === 3) S.synthCrash(ctx, musicGain, time, 0.44);
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track 6: "Boulevard des Étoiles" • 122 BPM
    // French Nu-Disco & Indie Funk / Parisian Touch (Phoenix / Cassius style)
    // Nile Rodgers-style funk rhythm guitar, bouncy slap bassline, warm Rhodes chords & vocoder hook
    // -----------------------------------------------------------------------
    case 'fra-6': {
      const sectionBar = bar % 16;
      // French Disco-Funk Progression: Dm7 - G7 - Cmaj7 - Fmaj7 (Classic Parisian 2-5-1-4)
      const funkChords = [
        { root: 'D2', notes: ['F4', 'A4', 'C5', 'E5'], guitar: ['F4', 'A4', 'C5'] },
        { root: 'G1', notes: ['F4', 'B4', 'D5', 'F5'], guitar: ['F4', 'B4', 'D5'] },
        { root: 'C2', notes: ['E4', 'G4', 'B4', 'D5'], guitar: ['E4', 'G4', 'B4'] },
        { root: 'F1', notes: ['E4', 'A4', 'C5', 'E5'], guitar: ['E4', 'A4', 'C5'] },
      ];
      const cur = funkChords[sectionBar % 4];

      // 1. Driving French Nu-Disco 4-on-the-Floor Drums
      if (sub === 0) {
        S.synthKick(ctx, musicGain, time, 0.54);
      }
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synthSnare(ctx, musicGain, time, 0.46, true);
        S.synthClap(ctx, musicGain, time, 0.3);
      }
      // Crisp 16th Hi-Hats with offbeat accents
      if (sub === 2) {
        S.synthHiHat(ctx, musicGain, time, true, 0.16);
      } else {
        S.synthHiHat(ctx, musicGain, time, false, 0.08);
      }

      // 2. Bouncy Slap Funk Bassline (Bernard Edwards / Guy-Manuel style)
      if (sub === 0 || (beat === 1 && sub === 2) || (beat === 2 && sub === 3) || (beat === 3 && sub === 2)) {
        S.synthFmBass(ctx, musicGain, cur.root, time, 0.16, 0.44, 'slap');
      }

      // 3. Funky 16th Clean Electric Guitar Chops (Chic / Phoenix style)
      const isFunkStrum =
        (sub === 1) ||
        (sub === 3) ||
        (beat === 0 && sub === 0) ||
        (beat === 2 && sub === 2);
      if (isFunkStrum) {
        S.synthFrenchPopRockGuitar(ctx, musicGain, cur.guitar[0], time, 0.14, 0.22, 'clean_strum');
        S.synthFrenchPopRockGuitar(ctx, musicGain, cur.guitar[2], time, 0.14, 0.2, 'clean_strum');
      }

      // 4. Warm Electric Piano (Rhodes 7th/9th chords on offbeats)
      if (sub === 2) {
        S.synthFmPiano(ctx, musicGain, cur.notes[0], time, 0.28, 0.2);
        S.synthFmPiano(ctx, musicGain, cur.notes[2], time, 0.28, 0.18);
      }

      // 5. Parisian Melodic Lead Synth Hook (Catchy French Touch lead)
      if (sectionBar >= 4) {
        const frenchTouchHook = [
          'A5', 'C6', 'E6', 'D6', 'C6', 'A5', 'G5', 'A5',
          'B5', 'D6', 'F6', 'E6', 'D6', 'B5', 'A5', 'G5',
          'G5', 'B5', 'D6', 'C6', 'B5', 'G5', 'E5', 'G5',
          'A5', 'C6', 'E6', 'F6', 'E6', 'C6', 'A5', 'A5',
        ];
        const stepIdx = (sectionBar % 4) * 8 + (beat * 2 + Math.floor(sub / 2));
        const lead = frenchTouchHook[stepIdx % frenchTouchHook.length];
        if (sub === 0 || sub === 2) {
          S.synthFrenchElectropopLead(ctx, musicGain, lead, time, 0.25, 0.26);
        }
      }

      // 6. French Vocoder Hook in Chorus ("Paris Brille", "Allez Champion")
      if (sectionBar >= 8 && (beat === 1 || beat === 3) && sub === 0) {
        const chantNotes = ['C5', 'E5', 'G5', 'E5'];
        const vNote = chantNotes[(sectionBar + Math.floor(beat / 2)) % chantNotes.length];
        S.synthFrenchVocoder(ctx, musicGain, vNote, time, 0.34, 0.24, 'paris');
      }

      // 7. Turnaround Crash
      if ((sectionBar === 7 || sectionBar === 15) && beat === 3 && sub === 0) {
        S.synthCrash(ctx, musicGain, time, 0.42);
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track: "Le maître de la roulette" • fra-roulette • 122 BPM
    // Inspired by "Vaudeville Smash - Zinedine Zidane": Nu-Disco Funk,
    // bouncy slap bass, funk rhythm guitar chops, punchy brass stabs & vocoder hook
    // -----------------------------------------------------------------------
    case 'fra-roulette': {
      const sectionBar = bar % 16;
      let rootBass = 'D2';
      let octaveBass = 'D3';
      let approachBass = 'C#2';
      let chordNotes = ['F4', 'A4', 'C5', 'E5']; // Dm9
      let guitarNotes = ['F4', 'A4', 'C5'];

      if (sectionBar < 4) {
        // Dm9: D - F - A - C - E
        rootBass = 'D2'; octaveBass = 'D3'; approachBass = 'F#2';
        chordNotes = ['F4', 'A4', 'C5', 'E5']; guitarNotes = ['F4', 'A4', 'D5'];
      } else if (sectionBar < 8) {
        // G9 / G13: G - B - D - F - A
        rootBass = 'G1'; octaveBass = 'G2'; approachBass = 'A1';
        chordNotes = ['F4', 'A4', 'B4', 'E5']; guitarNotes = ['F4', 'G4', 'B4'];
      } else if (sectionBar < 12) {
        // Bbmaj7: Bb - D - F - A
        rootBass = 'Bb1'; octaveBass = 'Bb2'; approachBass = 'G#1';
        chordNotes = ['F4', 'A4', 'D5', 'F5']; guitarNotes = ['F4', 'Bb4', 'D5'];
      } else {
        // A7(#9): A - C# - E - G - C
        rootBass = 'A1'; octaveBass = 'A2'; approachBass = 'C#2';
        chordNotes = ['G4', 'C5', 'C#5', 'E5']; guitarNotes = ['G4', 'A4', 'C#5'];
      }

      // 1. Four-on-the-floor Disco Kick & Snappy Snare/Clap
      if (sub === 0) {
        S.synthKick(ctx, musicGain, time, 0.52);
      }
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synthSnare(ctx, musicGain, time, 0.4);
        S.synthClap(ctx, musicGain, time, 0.32);
      }
      // Celebratory double-clap pickup on bar 7 and 15
      if ((sectionBar === 7 || sectionBar === 15) && beat === 3 && (sub === 2 || sub === 3)) {
        S.synthClap(ctx, musicGain, time, 0.36);
      }

      // 2. Disco Hi-Hat: 16th closed hats, open sizzle on offbeats
      if (sub === 2) {
        S.synthHiHat(ctx, musicGain, time, true, 0.18); // open sizzle
      } else {
        S.synthHiHat(ctx, musicGain, time, false, 0.12); // closed 16th tick
      }

      // 3. Bouncy Slap & Filtered French Funk Bassline
      if (beat === 0 && sub === 0) {
        S.synthFrenchTouchFilterBass(ctx, musicGain, rootBass, time, 0.22, 0.44, 950);
      } else if (beat === 0 && sub === 2) {
        S.synthFrenchTouchFilterBass(ctx, musicGain, octaveBass, time, 0.14, 0.38, 1400);
      } else if (beat === 1 && sub === 1) {
        S.synthFrenchTouchFilterBass(ctx, musicGain, rootBass, time, 0.16, 0.36, 1100);
      } else if (beat === 2 && sub === 0) {
        S.synthFrenchTouchFilterBass(ctx, musicGain, rootBass, time, 0.2, 0.42, 900);
      } else if (beat === 2 && sub === 2) {
        S.synthFrenchTouchFilterBass(ctx, musicGain, octaveBass, time, 0.14, 0.38, 1400);
      } else if (beat === 3 && sub === 3) {
        S.synthFrenchTouchFilterBass(ctx, musicGain, approachBass, time, 0.12, 0.32, 1200);
      }

      // 4. Funky Rhythm Guitar Chops (Chic/Vaudeville single-coil strums)
      if ((beat === 0 && sub === 2) || (beat === 1 && (sub === 1 || sub === 3)) || (beat === 2 && sub === 2) || (beat === 3 && (sub === 1 || sub === 3))) {
        const gNote = guitarNotes[step % guitarNotes.length];
        S.synthFrenchPopRockGuitar(ctx, musicGain, gNote, time, 0.14, 0.26, 'clean_strum');
      }

      // 5. Electric Piano / Disco Keys (Offbeat chord stabs)
      if (sub === 1 || sub === 3) {
        S.synthDiscoHouseKeys(ctx, musicGain, chordNotes, time, 0.18, 0.24);
      }

      // 6. Punchy Brass Fanfare ("Zidane" iconic melodic riff)
      if ((sectionBar >= 4 && sectionBar < 8) || sectionBar >= 12) {
        // Melodic horn response on beats 2 & 3
        if (beat === 2 && sub === 0) {
          S.synthBrass(ctx, musicGain, ['A4', 'C5', 'F5'], time, 0.35, 0.34, true);
        } else if (beat === 2 && sub === 2) {
          S.synthBrass(ctx, musicGain, ['G4', 'B4', 'E5'], time, 0.3, 0.32, true);
        } else if (beat === 3 && sub === 0) {
          S.synthBrass(ctx, musicGain, ['A4', 'D5', 'F5'], time, 0.5, 0.36, true);
        }
      }

      // 7. French Vocoder Hook ("Zinedine Zidane! Le maître de la roulette!")
      if ((sectionBar < 4 || (sectionBar >= 8 && sectionBar < 12)) && (beat === 1 || beat === 3) && sub === 0) {
        const vocoderMelody = ['D4', 'F4', 'A4', 'G4'];
        const vNote = vocoderMelody[(sectionBar + Math.floor(beat / 2)) % vocoderMelody.length];
        S.synthFrenchVocoder(ctx, musicGain, vNote, time, 0.36, 0.26, beat === 1 ? 'allez' : 'paris');
      }

      // 8. Turnaround Terrace Cheer & Crash
      if ((sectionBar === 7 || sectionBar === 15) && beat === 3 && sub === 0) {
        S.synthStadiumTerraceVocalChant(ctx, musicGain, ['D4', 'F4', 'A4'], time, 0.7, 0.28, 'ole');
        S.synthCrash(ctx, musicGain, time, 0.44);
      }
      break;
    }

    // =======================================================================
    // 2. SPAIN — 16-BIT FLAMENCO FUSION & SPANISH URBAN
    // =======================================================================
    case 'esp-1': {
      // "Furia Ibérica" • 124 BPM (Am - G - F - E Andalusian Cadence)
      const roots = ['A1', 'G1', 'F1', 'E1'];
      const curRoot = roots[bar % 4];

      if (sub === 0 || sub === 3) {
        S.synthFmBass(ctx, musicGain, curRoot, time, 0.22, 0.4, 'slap');
      }

      // 16-Bit Acoustic Nylon Guitar Pluck
      const flamencoScales = [
        ['A4', 'C5', 'E5', 'A5'],
        ['G4', 'B4', 'D5', 'G5'],
        ['F4', 'A4', 'C5', 'F5'],
        ['E4', 'G#4', 'B4', 'E5'],
      ];
      const curPluck = flamencoScales[bar % 4][step % 4];
      S.synthNylonGuitar(ctx, musicGain, curPluck, time, 0.16, 0.22);

      // Rapid Palmas / Handclaps
      if (sub === 2 || (beat === 3 && (sub === 1 || sub === 2 || sub === 3))) {
        S.synthClap(ctx, musicGain, time, 0.34);
      }

      if (beat === 0 && sub === 0) {
        S.synthPadStrings(ctx, musicGain, ['A3', 'E4', 'A4'], time, 1.6, 0.14);
      }

      if (sub === 0 && (beat === 0 || beat === 2)) S.synthKick(ctx, musicGain, time, 0.46);
      if (beat === 1 || beat === 3) S.synthSnare(ctx, musicGain, time, 0.36, true);
      break;
    }

    case 'esp-2': {
      // "Sol de Madrid" • 120 BPM (Dm - C - Bb - A7)
      const roots = ['D2', 'C2', 'Bb1', 'A1'];
      if (sub === 0 || sub === 2) {
        S.synthFmBass(ctx, musicGain, roots[bar % 4], time, 0.16, 0.38, 'smooth');
      }

      // Spanish guitar arpeggios
      const chords = [
        ['D4', 'F4', 'A4', 'D5'],
        ['C4', 'E4', 'G4', 'C5'],
        ['Bb3', 'D4', 'F4', 'Bb4'],
        ['A3', 'C#4', 'E4', 'A4'],
      ];
      S.synthNylonGuitar(ctx, musicGain, chords[bar % 4][step % 4], time, 0.15, 0.2);

      if (sub === 0 && (beat === 0 || beat === 2)) S.synthKick(ctx, musicGain, time, 0.44);
      if (beat === 1 || beat === 3) S.synthClap(ctx, musicGain, time, 0.32);
      if (sub === 1 || sub === 3) S.synthShaker(ctx, musicGain, time, 0.14);
      break;
    }

    case 'esp-3': {
      // "Duende y Balón" • 126 BPM (F#m - E - D - C#7)
      const roots = ['F#1', 'E1', 'D1', 'C#1'];
      S.synthSubBass808(ctx, musicGain, roots[bar % 4], time, 0.38, 0.42);

      if (sub === 0 || sub === 2) {
        const lead = ['C#5', 'F#5', 'G#5', 'A5', 'G#5', 'F#5', 'E5', 'C#5'];
        S.synthBrass(ctx, musicGain, [lead[(Math.floor(step / 2)) % lead.length]], time, 0.18, 0.2);
      }

      if (sub === 2) S.synthClap(ctx, musicGain, time, 0.34);
      if (sub === 0) S.synthKick(ctx, musicGain, time, 0.48);
      if ((beat === 1 || beat === 3) && sub === 0) S.synthSnare(ctx, musicGain, time, 0.38);
      break;
    }

    case 'esp-4': {
      // "Noche de Clásico" • 122 BPM (Em - D - C - B7)
      const roots = ['E2', 'D2', 'C2', 'B1'];
      if (sub === 0 || sub === 3) {
        S.synthFmBass(ctx, musicGain, roots[bar % 4], time, 0.2, 0.4, 'slap');
      }

      const clasicoLead = ['B4', 'E5', 'G5', 'F#5', 'E5', 'D#5', 'E5', 'B5'];
      if (sub === 0 || sub === 2) {
        S.synthNylonGuitar(ctx, musicGain, clasicoLead[(Math.floor(step / 2)) % clasicoLead.length], time, 0.16, 0.22);
      }

      if (sub === 0) S.synthKick(ctx, musicGain, time, 0.46);
      if (beat === 1 || beat === 3) S.synthClap(ctx, musicGain, time, 0.34);
      S.synthHiHat(ctx, musicGain, time, sub === 2, 0.1);
      break;
    }

    case 'esp-5': {
      // "Alhambra Golden Sunset" • 120 BPM (Am - F - Dm - E)
      const roots = ['A1', 'F1', 'D1', 'E1'];
      if (sub === 0) {
        S.synthFmBass(ctx, musicGain, roots[bar % 4], time, 0.32, 0.38, 'smooth');
      }

      if (beat === 0 && sub === 0) {
        S.synthPadStrings(ctx, musicGain, ['A3', 'C4', 'E4'], time, 1.8, 0.16);
      }

      const alhambraLick = ['E5', 'A5', 'B5', 'C6', 'B5', 'A5', 'G#5', 'E5'];
      if (sub === 0 || sub === 2) {
        S.synthPanFlute(ctx, musicGain, alhambraLick[(Math.floor(step / 2)) % alhambraLick.length], time, 0.22, 0.2);
      }

      if (sub === 0 && (beat === 0 || beat === 2)) S.synthKick(ctx, musicGain, time, 0.44);
      if (beat === 1 || beat === 3) S.synthClap(ctx, musicGain, time, 0.32);
      break;
    }

    case 'esp-6': {
      // "Rumba del Campeón" • 128 BPM (C - G - Am - F)
      const roots = ['C2', 'G1', 'A1', 'F1'];
      if (sub === 0 || sub === 2) {
        S.synthFmBass(ctx, musicGain, roots[bar % 4], time, 0.15, 0.38, 'slap');
      }

      if (sub === 1 || sub === 3) {
        S.synthNylonGuitar(ctx, musicGain, 'E4', time, 0.12, 0.22);
      }

      if (sub === 0) S.synthKick(ctx, musicGain, time, 0.46);
      if (beat === 1 || beat === 3) S.synthClap(ctx, musicGain, time, 0.34);
      S.synthShaker(ctx, musicGain, time, 0.12);
      break;
    }

    case 'esp-7': {
      // "Triana Flamenco Beat" • 124 BPM (Dm - A7)
      const roots = ['D2', 'A1'];
      S.synthFmBass(ctx, musicGain, roots[bar % 2], time, 0.18, 0.4, 'slap');

      if (sub === 0 || sub === 2) {
        const triana = ['D5', 'F5', 'A5', 'Bb5', 'A5', 'F5', 'E5', 'C#5'];
        S.synthNylonGuitar(ctx, musicGain, triana[(Math.floor(step / 2)) % triana.length], time, 0.18, 0.22);
      }

      if (sub === 0) S.synthKick(ctx, musicGain, time, 0.46);
      if (beat === 1 || beat === 3) S.synthClap(ctx, musicGain, time, 0.36);
      break;
    }

    case 'esp-8': {
      // "Pasión por la Roja" • 126 BPM (G - D - Em - C)
      const roots = ['G1', 'D2', 'E2', 'C2'];
      S.synthFmBass(ctx, musicGain, roots[bar % 4], time, 0.16, 0.4, 'solid');

      if (sub === 0 || (sub === 2 && beat % 2 === 1)) {
        const roja = ['B5', 'D6', 'G6', 'F#6', 'E6', 'D6', 'C6', 'B5'];
        S.synthBrass(ctx, musicGain, [roja[(Math.floor(step / 2)) % roja.length]], time, 0.2, 0.22);
      }

      if (sub === 0) S.synthKick(ctx, musicGain, time, 0.48);
      if ((beat === 1 || beat === 3) && sub === 0) S.synthSnare(ctx, musicGain, time, 0.38);
      S.synthHiHat(ctx, musicGain, time, sub === 2, 0.11);
      break;
    }

    case 'esp-9': {
      // "Bulerías de Oro" • 130 BPM (A - Bb - C - D)
      const roots = ['A1', 'Bb1', 'C2', 'D2'];
      S.synthFmBass(ctx, musicGain, roots[bar % 4], time, 0.14, 0.42, 'slap');

      if (sub === 0 || sub === 1 || sub === 2) {
        const buleria = ['A4', 'C#5', 'E5', 'F5', 'E5', 'D5', 'Bb4', 'A4'];
        S.synthNylonGuitar(ctx, musicGain, buleria[step % 8], time, 0.1, 0.24);
      }

      if (sub === 0) S.synthKick(ctx, musicGain, time, 0.48);
      if (beat === 1 || beat === 3) S.synthClap(ctx, musicGain, time, 0.36);
      break;
    }

    case 'esp-10': {
      // "Fiesta en Cibeles" • 122 BPM (F - C - Dm - Bb)
      const roots = ['F1', 'C2', 'D2', 'Bb1'];
      if (sub === 0 || sub === 3) {
        S.synthFmBass(ctx, musicGain, roots[bar % 4], time, 0.2, 0.38, 'solid');
      }

      if (beat === 0 && sub === 0) {
        S.synthPadStrings(ctx, musicGain, ['F4', 'A4', 'C5'], time, 1.5, 0.15);
      }

      const cibeles = ['A5', 'C6', 'F6', 'G6', 'F6', 'E6', 'D6', 'C6'];
      if (sub === 0 || sub === 2) {
        S.synthBrass(ctx, musicGain, [cibeles[(Math.floor(step / 2)) % cibeles.length]], time, 0.2, 0.2);
      }

      if (sub === 0) S.synthKick(ctx, musicGain, time, 0.46);
      if (beat === 1 || beat === 3) S.synthClap(ctx, musicGain, time, 0.34);
      S.synthHiHat(ctx, musicGain, time, sub === 2, 0.1);
      break;
    }

    // -----------------------------------------------------------------------
    // Track 11: "Orgullo de la Charanga" • 128 BPM
    // Spanish Brass Charanga, Pasodoble & Stadium Terrace Brass Band
    // Roaring festive trumpets, pasodoble march snare, castanets, Spanish nylon guitar & terrace chants
    // -----------------------------------------------------------------------
    case 'esp-11': {
      const sectionBar = bar % 16;
      // Spanish Pasodoble/Charanga Cadence: Dm - C - Bb - A7 (bars 0-7), F - C - Bb - A7 (bars 8-15)
      const roots = sectionBar < 8 ? ['D2', 'C2', 'Bb1', 'A1'] : ['F1', 'C2', 'Bb1', 'A1'];
      const curRoot = roots[sectionBar % 4];
      const chords = [
        ['D4', 'F4', 'A4'],
        ['C4', 'E4', 'G4'],
        ['D4', 'F4', 'Bb4'],
        ['C#4', 'E4', 'A4'],
      ][sectionBar % 4];

      // 1. Spanish Charanga Trumpet Fanfare & Melodic Lead
      const charangaMelody = [
        'A4', 'D5', 'F5', 'E5', 'D5', 'C#5', 'D5', 'E5',
        'G4', 'C5', 'E5', 'D5', 'C5', 'B4', 'C5', 'D5',
        'F4', 'Bb4', 'D5', 'C5', 'Bb4', 'A4', 'Bb4', 'C5',
        'E4', 'A4', 'C#5', 'D5', 'E5', 'F5', 'E5', 'A4',
      ];
      const stepIdx = (sectionBar % 4) * 8 + (beat * 2 + Math.floor(sub / 2));
      const trumpetNote = charangaMelody[stepIdx % charangaMelody.length];
      if (sub === 0 || sub === 2) {
        S.synthTrumpetSolo(ctx, musicGain, trumpetNote, time, 0.34, 0.3, true);
        S.synthBrass(ctx, musicGain, [trumpetNote], time, 0.26, 0.22, false);
      }

      // 2. Spanish Nylon Guitar Rasgueado (Crisp acoustic flamenco strumming)
      if (sub === 1 || sub === 3) {
        S.synthNylonGuitar(ctx, musicGain, chords[0], time, 0.14, 0.22);
        S.synthNylonGuitar(ctx, musicGain, chords[1], time, 0.14, 0.2);
        S.synthNylonGuitar(ctx, musicGain, chords[2], time, 0.14, 0.18);
      }

      // 3. Pasodoble Walking Brass Tuba / Bass
      if (sub === 0 || (sub === 2 && (beat === 1 || beat === 3))) {
        S.synthFmBass(ctx, musicGain, curRoot, time, 0.22, 0.44, 'solid');
      }

      // 4. Spanish Castanets / Tambourine & Military Pasodoble March Drums
      if (sub === 0) S.synthKick(ctx, musicGain, time, 0.52);
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synthSnare(ctx, musicGain, time, 0.46, false);
        S.synthClap(ctx, musicGain, time, 0.32);
      }
      if (sub === 1 || sub === 3) {
        S.synthSnare(ctx, musicGain, time, 0.18, true); // Flamenco roll
      }
      if (sub === 0 || sub === 2) {
        S.synthTambourine(ctx, musicGain, time, sub === 0, 0.2);
      }

      // 5. Spanish Terrace "Olé" Chant in Chorus (Bars >= 8)
      if (sectionBar >= 8 && (beat === 1 || beat === 3) && sub === 0) {
        S.synthStadiumTerraceVocalChant(ctx, musicGain, chords, time, 0.7, 0.3, 'ole');
      }

      // 6. Section Turnaround Crash
      if ((sectionBar === 7 || sectionBar === 15) && beat === 3 && sub === 0) {
        S.synthCrash(ctx, musicGain, time, 0.42);
      }
      break;
    }

    // =======================================================================
    // 3. BRAZIL — ORIGINAL BRAZILIAN FOOTBALL PLAYLIST (7 SONGS)
    // 100% Original Brazilian football soundtrack spanning Samba Carnival,
    // Sertanejo Pop & Arena party, Baile Funk Tamborzão, Joga Bonito fusion,
    // Organic Body Percussion, and Modern Nightlife Funk.
    // =======================================================================

    // -----------------------------------------------------------------------
    // Track 1: "Explosão no Maracanã" • 132 BPM
    // Brazilian Samba / Football Carnival Anthem (Sérgio Mendes / Carnival energy)
    // Explosive surdo batucada, pandeiro, agogô, cavaquinho, brass fanfare & call-response chants
    // -----------------------------------------------------------------------
    case 'bra-1': {
      const sectionBar = bar % 16;
      // Chords: Verse (Bm - G - Em - F#7), Chorus (D - A - Bm - F#7 / G - A - D - F#7)
      let chordNotes: string[] = ['B3', 'D4', 'F#4'];
      let rootBass = 'B1';

      if (sectionBar < 8) {
        // Verse: Bm - G - Em - F#7
        const vC = sectionBar % 4;
        if (vC === 0) { chordNotes = ['B3', 'D4', 'F#4']; rootBass = 'B1'; }
        else if (vC === 1) { chordNotes = ['B3', 'D4', 'G4']; rootBass = 'G1'; }
        else if (vC === 2) { chordNotes = ['B3', 'E4', 'G4']; rootBass = 'E1'; }
        else { chordNotes = ['A#3', 'C#4', 'F#4']; rootBass = 'F#1'; }
      } else {
        // Chorus: D - A - Bm - F#7 (bars 8-11), G - A - D - F#7 (bars 12-15)
        const cC = sectionBar - 8;
        if (cC === 0) { chordNotes = ['A3', 'D4', 'F#4']; rootBass = 'D2'; }
        else if (cC === 1) { chordNotes = ['A3', 'C#4', 'E4']; rootBass = 'A1'; }
        else if (cC === 2) { chordNotes = ['B3', 'D4', 'F#4']; rootBass = 'B1'; }
        else if (cC === 3) { chordNotes = ['A#3', 'C#4', 'F#4']; rootBass = 'F#1'; }
        else if (cC === 4) { chordNotes = ['B3', 'D4', 'G4']; rootBass = 'G1'; }
        else if (cC === 5) { chordNotes = ['A3', 'C#4', 'E4']; rootBass = 'A1'; }
        else if (cC === 6) { chordNotes = ['A3', 'D4', 'F#4']; rootBass = 'D2'; }
        else { chordNotes = ['A#3', 'C#4', 'F#4']; rootBass = 'F#1'; }
      }

      // 1. Brazilian Surdo Drums (Low on 2 and 4 with pickup syncopation)
      if (beat === 1 && sub === 0) {
        S.synthSurdo(ctx, musicGain, time, 0.45, 0.55, 'low', false);
      }
      if (beat === 3 && sub === 0) {
        S.synthSurdo(ctx, musicGain, time, 0.45, 0.58, 'low', false);
      }
      if (beat === 0 && sub === 3) {
        S.synthSurdo(ctx, musicGain, time, 0.15, 0.38, 'mid', true);
      }
      if (beat === 2 && sub === 3) {
        S.synthSurdo(ctx, musicGain, time, 0.15, 0.42, 'high', true);
      }

      // 2. Pandeiro & Shaker 16th-note swing
      if (sub === 0) S.synthPandeiro(ctx, musicGain, 'thumb', time, 0.3);
      if (sub === 1) S.synthPandeiro(ctx, musicGain, 'fingertip', time, 0.22);
      if (sub === 2) S.synthPandeiro(ctx, musicGain, 'heel', time, 0.26);
      if (sub === 3) S.synthPandeiro(ctx, musicGain, 'slap', time, 0.28);
      S.synthShaker(ctx, musicGain, time, 0.12);

      // 3. Agogô Bells (Classic Samba syncopated double-bell pattern)
      if (sub === 0 || sub === 1) S.synthAgogo(ctx, musicGain, sub === 0, time, 0.24);
      if (sub === 3 && (beat === 1 || beat === 3)) S.synthAgogo(ctx, musicGain, true, time, 0.22);

      // 4. Cuíca Accent squeaks on turnaround bars
      if (sectionBar % 4 === 3 && (beat === 2 || beat === 3)) {
        if (sub === 0) S.synthCuica(ctx, musicGain, true, time, 0.14, 0.26);
        if (sub === 2) S.synthCuica(ctx, musicGain, false, time, 0.16, 0.24);
      }

      // 5. Cavaquinho & Acoustic Guitar Samba Chops
      if (sub === 1 || sub === 3 || (beat === 0 && sub === 0)) {
        S.synthCavaquinho(ctx, musicGain, chordNotes[0], time, 0.16, 0.22);
        S.synthCavaquinho(ctx, musicGain, chordNotes[2], time, 0.16, 0.2);
        S.synthAcousticGuitar(ctx, musicGain, chordNotes[1], time, 0.18, 0.18);
      }

      // 6. Samba Syncopated Bassline (Downbeat drop, offbeat drive)
      if (sub === 1 || sub === 3 || (beat === 1 && sub === 0) || (beat === 3 && sub === 0)) {
        S.synthFmBass(ctx, musicGain, rootBass, time, 0.18, 0.42, 'slap');
      }

      // 7. Bright Brass Fanfare & Carnival Horn Section
      if (sectionBar >= 4) {
        if (sectionBar < 8) {
          // Verse Horn Counter-Riffs
          if ((beat === 0 && sub === 0) || (beat === 2 && sub === 2)) {
            const hornRiff = ['F#5', 'B5', 'D6', 'C#6', 'B5', 'A#5', 'F#5'];
            const n = hornRiff[step % hornRiff.length];
            S.synthBrass(ctx, musicGain, [n], time, 0.22, 0.24);
          }
        } else {
          // Soaring Carnival Chorus Horn Fanfare
          if (sub === 0 || sub === 2 || (beat === 3 && sub === 3)) {
            const carnivalHook = [
              'D5', 'F#5', 'A5', 'B5', 'A5', 'F#5', 'E5', 'D5',
              'F#5', 'A5', 'D6', 'C#6', 'B5', 'A5', 'F#5', 'A5',
              'B5', 'B5', 'A5', 'G5', 'F#5', 'E5', 'D5', 'E5',
              'F#5', 'E5', 'D5', 'C#5', 'B4', 'C#5', 'B4', 'B4'
            ];
            const hornN = carnivalHook[step % carnivalHook.length];
            S.synthBrass(ctx, musicGain, [hornN], time, 0.26, 0.28);
          }
        }
      }

      // 8. Call-and-Response Group Vocal Chants ('Ôôô... Samba e Gol!')
      if (sectionBar >= 8 && (beat === 1 || beat === 3) && sub === 0) {
        const chantNotes = ['F#4', 'A4', 'B4', 'D5'];
        const vNote = chantNotes[(step / 4) % chantNotes.length];
        S.synthBrazilianVocal(ctx, musicGain, vNote, time, 0.42, 0.26, 'oh', true);
      }

      // 9. Carnival Samba Whistle on major turnarounds
      if (sectionBar % 8 === 7 && beat === 3 && sub === 0) {
        S.synthWhistle(ctx, musicGain, 'B5', time, 0.32);
      }

      // 10. Handclaps on the offbeats in the chorus
      if (sectionBar >= 8 && (beat === 1 || beat === 3) && sub === 0) {
        S.synthClap(ctx, musicGain, time, 0.35);
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track 2: "Taça na Mão, Festa no Chão" • 126 BPM
    // Brazilian Sertanejo / Pop Football Party (Michel Teló / Sertanejo-Pop energy)
    // Rhythmic acoustic guitar, vibrant sanfona accordion riffs, danceable claps & catchy sing-along
    // -----------------------------------------------------------------------
    case 'bra-2': {
      const sectionBar = bar % 16;
      // Chords: A - E - F#m - D (Classic joyful party progression)
      let chordNotes: string[] = ['A3', 'C#4', 'E4'];
      let rootBass = 'A1';
      const cIdx = sectionBar % 4;
      if (cIdx === 0) { chordNotes = ['A3', 'C#4', 'E4']; rootBass = 'A1'; }
      else if (cIdx === 1) { chordNotes = ['G#3', 'B3', 'E4']; rootBass = 'E1'; }
      else if (cIdx === 2) { chordNotes = ['A3', 'C#4', 'F#4']; rootBass = 'F#1'; }
      else { chordNotes = ['A3', 'D4', 'F#4']; rootBass = 'D2'; }

      // 1. Rhythmic Acoustic Guitar Strumming (Sertanejo pattern)
      if (sub === 0 || sub === 2 || (beat === 2 && sub === 3)) {
        S.synthAcousticGuitar(ctx, musicGain, chordNotes[0], time, 0.22, 0.22);
        S.synthAcousticGuitar(ctx, musicGain, chordNotes[1], time, 0.22, 0.2);
        S.synthAcousticGuitar(ctx, musicGain, chordNotes[2], time, 0.22, 0.18);
      }

      // 2. Brazilian Sanfona / Accordion Catchy Melodic Hook
      if (sectionBar < 8) {
        // Verse: Playful bouncy Sanfona fills
        if (sub === 0 || (sub === 2 && beat % 2 === 1)) {
          const verseSanfona = ['C#5', 'E5', 'F#5', 'E5', 'C#5', 'B4', 'A4', 'B4', 'C#5', 'A4'];
          const note = verseSanfona[step % verseSanfona.length];
          S.synthSanfona(ctx, musicGain, note, time, 0.25, 0.26, false);
        }
      } else {
        // Chorus: Soaring, euphoric Sertanejo accordion hook (huge sing-along melody)
        if (sub === 0 || sub === 2 || (beat === 1 && sub === 1) || (beat === 3 && sub === 3)) {
          const chorusSanfona = [
            'E5', 'F#5', 'A5', 'G#5', 'F#5', 'E5', 'C#5', 'E5',
            'F#5', 'F#5', 'E5', 'C#5', 'B4', 'C#5', 'E5', 'F#5',
            'A5', 'B5', 'C#6', 'B5', 'A5', 'F#5', 'E5', 'F#5',
            'A5', 'G#5', 'F#5', 'E5', 'C#5', 'B4', 'A4', 'A4'
          ];
          const hookNote = chorusSanfona[step % chorusSanfona.length];
          S.synthSanfona(ctx, musicGain, hookNote, time, 0.28, 0.32, true);
        }
      }

      // 3. Sertanejo-Pop Bassline (Walking root-fifth drive)
      if (sub === 0 || sub === 2) {
        const bassNote = sub === 0 ? rootBass : (cIdx === 0 ? 'E2' : cIdx === 1 ? 'B1' : cIdx === 2 ? 'C#2' : 'A1');
        S.synthFmBass(ctx, musicGain, bassNote, time, 0.2, 0.4, 'solid');
      }

      // 4. Male Brazilian Vocal Chants in Chorus ("Vem comemorar!")
      if (sectionBar >= 8 && (beat === 1 || beat === 3) && sub === 0) {
        const vocalNotes = ['A4', 'C#5', 'E5', 'C#5'];
        const vN = vocalNotes[(step / 4) % vocalNotes.length];
        S.synthBrazilianVocal(ctx, musicGain, vN, time, 0.38, 0.24, 'eh', false);
      }

      // 5. Danceable Drums & Stadium Claps
      if (sub === 0 && (beat === 0 || beat === 2)) {
        S.synthKick(ctx, musicGain, time, 0.5);
      }
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synthSnare(ctx, musicGain, time, 0.42);
        S.synthClap(ctx, musicGain, time, 0.36);
      }
      S.synthTambourine(ctx, musicGain, time, false, 0.16);
      if (sub === 0 || sub === 2) {
        S.synthHiHat(ctx, musicGain, time, sub === 2, 0.12);
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track 3: "Arena Universitária" • 128 BPM
    // Sertanejo / Arena Party (Gusttavo Lima / Modern Sertanejo Dance-Pop)
    // 4-on-the-floor kick, heavy synth bass, electric guitar riffs & floodlight stadium festival energy
    // -----------------------------------------------------------------------
    case 'bra-3': {
      const sectionBar = bar % 16;
      // Chords: Em - C - G - D (High-energy modern arena progression)
      let chordNotes: string[] = ['E4', 'G4', 'B4'];
      let rootBass = 'E1';
      const pIdx = sectionBar % 4;
      if (pIdx === 0) { chordNotes = ['E4', 'G4', 'B4']; rootBass = 'E1'; }
      else if (pIdx === 1) { chordNotes = ['E4', 'G4', 'C5']; rootBass = 'C2'; }
      else if (pIdx === 2) { chordNotes = ['D4', 'G4', 'B4']; rootBass = 'G1'; }
      else { chordNotes = ['D4', 'F#4', 'A4']; rootBass = 'D2'; }

      // 1. Driving 4-on-the-Floor Arena Dance Drums
      if (sub === 0) {
        S.synthKick(ctx, musicGain, time, 0.54);
      }
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synthSnare(ctx, musicGain, time, 0.46, true);
        S.synthClap(ctx, musicGain, time, 0.34);
      }
      // Open hi-hat on the offbeat (8th-notes)
      if (sub === 2) {
        S.synthHiHat(ctx, musicGain, time, true, 0.18);
      } else if (sub === 0) {
        S.synthHiHat(ctx, musicGain, time, false, 0.1);
      }

      // 2. Heavy FM Synth Bass + Sub-layer (16th-note electro pulse)
      if (sub === 0 || sub === 1 || sub === 2 || sub === 3) {
        S.synthFmBass(ctx, musicGain, rootBass, time, 0.12, 0.38, 'solid');
      }

      // 3. Overdriven Electric Guitar Arena Riffs & Power Chords
      if (sectionBar >= 4) {
        if (sub === 0 || sub === 2) {
          S.synthElectricGuitar(ctx, musicGain, chordNotes[0], time, 0.24, 0.22, 'power');
          S.synthElectricGuitar(ctx, musicGain, chordNotes[2], time, 0.24, 0.2, 'power');
        }
      }

      // 4. Acoustic Guitar Strum Layer underneath
      if (sub === 0 || sub === 2) {
        S.synthAcousticGuitar(ctx, musicGain, chordNotes[1], time, 0.2, 0.18);
      }

      // 5. Soaring Arena Polysynth / Sanfona Melody Hook in Chorus
      if (sectionBar >= 8) {
        if (sub === 0 || sub === 2 || (beat === 3 && sub === 3)) {
          const arenaHook = [
            'B5', 'G5', 'A5', 'B5', 'D6', 'B5', 'A5', 'G5',
            'E5', 'G5', 'A5', 'G5', 'E5', 'D5', 'E5', 'G5',
            'D6', 'B5', 'A5', 'G5', 'B5', 'A5', 'G5', 'F#5',
            'G5', 'A5', 'B5', 'A5', 'G5', 'F#5', 'E5', 'E5'
          ];
          const leadN = arenaHook[step % arenaHook.length];
          S.synthWarmAnalogLead(ctx, musicGain, leadN, time, 0.25, 0.26, false);
          S.synthSanfona(ctx, musicGain, leadN, time, 0.22, 0.22, true);
        }
      }

      // 6. Roaring Stadium Singalong Chants in Chorus
      if (sectionBar >= 8 && (beat === 1 || beat === 3) && sub === 0) {
        const chantN = ['G4', 'B4', 'D5', 'B4'][(step / 4) % 4];
        S.synthBrazilianVocal(ctx, musicGain, chantN, time, 0.4, 0.25, 'hey', true);
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track 4: "Passinho do Menino Rei" • 132 BPM
    // Brazilian Baile Funk / Tamborzão Street Groove (MC Danone / Favela energy)
    // Syncopated Tamborzão beat, heavy 808 sub drops, agogô cuts & rhythmic MC vocal phrases
    // -----------------------------------------------------------------------
    case 'bra-4': {
      const sectionBar = bar % 8;
      // Chords: Fm - Db (Raw favela funk bassline)
      const roots = ['F1', 'Db1'];
      const curRoot = roots[bar % 2];

      // 1. Heavyweight 808 Sub-Bass Drops with Pitch Glides
      if (sub === 0 || sub === 3) {
        S.synthSubBass808(ctx, musicGain, curRoot, time, 0.38, 0.48);
      }

      // 2. Authentic Tamborzão Beat (tum... cha... tum-tum-cha)
      // Kick: Beat 0 (sub 0), Beat 1 (sub 2), Beat 2 (sub 0)
      if (sub === 0 && (beat === 0 || beat === 2)) {
        S.synthKick(ctx, musicGain, time, 0.54, 1.3);
      }
      if (beat === 1 && sub === 2) {
        S.synthKick(ctx, musicGain, time, 0.5, 1.3);
      }
      // Snare: Beat 1 (sub 0), Beat 3 (sub 0)
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synthSnare(ctx, musicGain, time, 0.44, true);
      }

      // 3. Agogô Bells & Metallic Cuts
      if (sub === 0 || sub === 1) S.synthAgogo(ctx, musicGain, true, time, 0.25);
      if (sub === 2 || sub === 3) S.synthAgogo(ctx, musicGain, false, time, 0.23);

      // 4. Congas & Woodblocks for street pocket
      if (sub === 1 || sub === 3) {
        S.synthConga(ctx, musicGain, true, true, time, 0.3);
      }

      // 5. Short Rhythmic MC-Style Vocal Phrases ('Hey!', 'Ah!', 'Dribla!')
      if ((beat === 0 && sub === 0) || (beat === 2 && sub === 2) || (beat === 3 && sub === 1)) {
        const mcNotes = ['F4', 'Ab4', 'C5', 'Bb4', 'Ab4', 'F4'];
        const mN = mcNotes[step % mcNotes.length];
        S.synthBrazilianVocal(ctx, musicGain, mN, time, 0.18, 0.28, 'hey', true);
      }

      // 6. Aggressive Brass / Synth Stabs on Section Turnarounds
      if (sectionBar % 2 === 1 && (beat === 2 || beat === 3)) {
        if (sub === 0 || sub === 2) {
          const brassStab = ['C5', 'F5', 'Ab5'];
          S.synthBrass(ctx, musicGain, brassStab, time, 0.16, 0.24);
        }
      }

      // 7. Whistle flourish on bar 7
      if (sectionBar === 7 && beat === 3 && sub === 0) {
        S.synthWhistle(ctx, musicGain, 'C6', time, 0.28);
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track 5: "Ginga e Malemolência" • 122 BPM
    // Joga Bonito / Samba-Football Fusion (Sérgio Mendes / Beautiful Football anthem)
    // Funky slap bass, samba percussion, warm Rhodes chords, bright brass fanfare & skill celebration
    // -----------------------------------------------------------------------
    case 'bra-5': {
      const sectionBar = bar % 16;
      // Chords: Dmaj7 - Bm7 - Em7 - A7 (bars 0-7), Gmaj7 - F#m7 - Em7 - A13 (bars 8-15)
      let chordNotes: string[] = ['D4', 'F#4', 'A4', 'C#5'];
      let rootBass = 'D2';

      if (sectionBar < 8) {
        const vC = sectionBar % 4;
        if (vC === 0) { chordNotes = ['D4', 'F#4', 'A4', 'C#5']; rootBass = 'D2'; }
        else if (vC === 1) { chordNotes = ['D4', 'F#4', 'A4', 'B4']; rootBass = 'B1'; }
        else if (vC === 2) { chordNotes = ['E4', 'G4', 'B4', 'D5']; rootBass = 'E1'; }
        else { chordNotes = ['E4', 'G4', 'A4', 'C#5']; rootBass = 'A1'; }
      } else {
        const cC = sectionBar - 8;
        if (cC % 4 === 0) { chordNotes = ['D4', 'G4', 'B4', 'F#5']; rootBass = 'G1'; }
        else if (cC % 4 === 1) { chordNotes = ['C#4', 'F#4', 'A4', 'E5']; rootBass = 'F#1'; }
        else if (cC % 4 === 2) { chordNotes = ['E4', 'G4', 'B4', 'D5']; rootBass = 'E1'; }
        else { chordNotes = ['E4', 'G4', 'A4', 'F#5']; rootBass = 'A1'; }
      }

      // 1. Funky FM Slap Bass (Improvisational Joga Bonito groove)
      if (sub === 0 || sub === 2 || (beat === 1 && sub === 3) || (beat === 3 && sub === 1)) {
        S.synthFmBass(ctx, musicGain, rootBass, time, 0.18, 0.42, 'slap');
      }

      // 2. Warm Electric Piano (Rhodes 7th & 9th jazz-samba chords)
      if (beat === 0 && sub === 0) {
        S.synthFmPiano(ctx, musicGain, chordNotes[0], time, 0.6, 0.22);
        S.synthFmPiano(ctx, musicGain, chordNotes[2], time, 0.6, 0.2);
        S.synthFmPiano(ctx, musicGain, chordNotes[3], time, 0.6, 0.18);
      }
      if (beat === 2 && sub === 2) {
        S.synthFmPiano(ctx, musicGain, chordNotes[1], time, 0.4, 0.18);
        S.synthFmPiano(ctx, musicGain, chordNotes[3], time, 0.4, 0.16);
      }

      // 3. Samba Percussion & Cuíca
      if (sub === 0) S.synthSurdo(ctx, musicGain, time, 0.35, 0.46, 'low');
      if (sub === 0 || sub === 2) S.synthAgogo(ctx, musicGain, sub === 0, time, 0.22);
      if (sub === 1 || sub === 3) S.synthPandeiro(ctx, musicGain, 'thumb', time, 0.24);
      S.synthShaker(ctx, musicGain, time, 0.12);

      if (sectionBar % 4 === 2 && beat === 2 && sub === 0) {
        S.synthCuica(ctx, musicGain, true, time, 0.16, 0.26);
      }

      // 4. Bright Horn Section Melody ("Joga Bonito" celebration hook)
      if (sectionBar >= 4) {
        if (sub === 0 || sub === 2 || (beat === 2 && sub === 1)) {
          const jogaMelody = [
            'F#5', 'A5', 'B5', 'D6', 'C#6', 'B5', 'A5', 'F#5',
            'A5', 'B5', 'D6', 'E6', 'F#6', 'E6', 'D6', 'B5',
            'D6', 'E6', 'F#6', 'A6', 'G6', 'F#6', 'E6', 'D6',
            'B5', 'A5', 'F#5', 'E5', 'D5', 'E5', 'D5', 'D5'
          ];
          const hornNote = jogaMelody[step % jogaMelody.length];
          S.synthBrass(ctx, musicGain, [hornNote], time, 0.24, 0.28);
          S.synthTrumpetSolo(ctx, musicGain, hornNote, time, 0.22, 0.22);
        }
      }

      // 5. Joyful Group Vocal Harmony Chants
      if (sectionBar >= 8 && (beat === 1 || beat === 3) && sub === 0) {
        const chantN = ['A4', 'B4', 'D5', 'F#5'][(step / 4) % 4];
        S.synthBrazilianVocal(ctx, musicGain, chantN, time, 0.42, 0.24, 'ah', true);
      }

      // 6. Drums & Claps
      if (sub === 0 && (beat === 0 || beat === 2)) S.synthKick(ctx, musicGain, time, 0.46);
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synthSnare(ctx, musicGain, time, 0.38);
        S.synthClap(ctx, musicGain, time, 0.3);
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track 6: "Batuque do Corpo e Alma" • 114 BPM
    // Body Percussion / Brazilian Rhythmic Experiment (Barbatuques philosophy)
    // Organic chest stomps, open/cupped claps, mouth pops, vocal ostinatos & rhythmic layering
    // -----------------------------------------------------------------------
    case 'bra-6': {
      const sectionBar = bar % 16;
      const buildPhase = Math.min(3, Math.floor(bar / 4)); // 0: intimate, 1: vocal layers, 2: polyrhythms, 3: full stadium explosion

      // 1. Organic Chest & Foot Stomps (Pitch footwork foundation)
      if (sub === 0 && (beat === 0 || beat === 2)) {
        S.synthBodyPercussion(ctx, musicGain, 'stomp', time, 0.52);
      }
      if (beat === 1 && sub === 2) {
        S.synthBodyPercussion(ctx, musicGain, 'chest', time, 0.38);
      }

      // 2. Handclaps (Open skin slaps and cupped claps)
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synthBodyPercussion(ctx, musicGain, 'clap_open', time, 0.44);
      }
      if (buildPhase >= 1 && (sub === 1 || sub === 3)) {
        S.synthBodyPercussion(ctx, musicGain, 'clap_cup', time, 0.32);
      }

      // 3. Mouth Percussion: Acoustic pops and breath ticks
      if (sub === 2 || (beat === 3 && sub === 3)) {
        S.synthBodyPercussion(ctx, musicGain, 'mouth_pop', time, 0.34);
      }
      if (sub === 1 && (beat === 0 || beat === 2)) {
        S.synthBodyPercussion(ctx, musicGain, 'breath', time, 0.26);
      }

      // 4. Vocal Rhythmic Ostinatos ("Tum-tiki-ta, pá-palma-tum!")
      if (buildPhase >= 1) {
        if (sub === 0 || sub === 2 || (beat === 2 && sub === 3)) {
          const vocalPattern = ['D4', 'F#4', 'A4', 'F#4', 'D4', 'B3', 'D4', 'E4'];
          const vNote = vocalPattern[step % vocalPattern.length];
          S.synthBrazilianVocal(ctx, musicGain, vNote, time, 0.18, 0.26, 'oh', false);
        }
      }

      // 5. Minimal Melodic Accents (Marimba & Acoustic Nylon)
      if (buildPhase >= 2) {
        if (sub === 0 || sub === 2) {
          const marimbaLick = ['A4', 'B4', 'D5', 'E5', 'F#5', 'A5', 'F#5', 'E5'];
          const mNote = marimbaLick[step % marimbaLick.length];
          S.synthMarimba(ctx, musicGain, mNote, time, 0.16, 0.22);
        }
      }

      // 6. Full Polyrhythmic Stadium Climax (Layer 3: Pandeiro, Surdo & Crowd Stomps)
      if (buildPhase >= 3) {
        if (sub === 0) S.synthSurdo(ctx, musicGain, time, 0.4, 0.48, 'low');
        if (sub === 1 || sub === 3) S.synthPandeiro(ctx, musicGain, 'slap', time, 0.28);
        if ((beat === 1 || beat === 3) && sub === 0) {
          const crowdNote = ['D5', 'F#5', 'A5', 'D6'][(step / 4) % 4];
          S.synthBrazilianVocal(ctx, musicGain, crowdNote, time, 0.42, 0.3, 'ah', true);
        }
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track 7: "Fluxo no Baile da Vitória" • 134 BPM
    // Modern Baile Funk / Brazilian Nightlife (MC Da20 & MC Gury / Mandelão energy)
    // Deep sliding 808 sub bass, minimalist synth plucks, hypnotic dance groove & MC delivery
    // -----------------------------------------------------------------------
    case 'bra-7': {
      const sectionBar = bar % 8;
      // Chords: Am - F - Dm - E7 (Dark, hypnotic, victorious nightlife progression)
      const roots = ['A1', 'F1', 'D1', 'E1'];
      const curRoot = roots[bar % 4];

      // 1. Deep 808 Sub-Bass Drops with Slide
      if (sub === 0 || sub === 3) {
        S.synthSubBass808(ctx, musicGain, curRoot, time, 0.4, 0.5);
      }

      // 2. Modern Mandelão Kick & Snare Groove
      if (sub === 0 && (beat === 0 || beat === 2)) {
        S.synthKick(ctx, musicGain, time, 0.54, 1.25);
      }
      if (beat === 1 && sub === 2) {
        S.synthKick(ctx, musicGain, time, 0.48, 1.25);
      }
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synthSnare(ctx, musicGain, time, 0.45, true);
        S.synthClap(ctx, musicGain, time, 0.32);
      }

      // 3. Open Hi-Hat Sizzle on Upbeats & Triplet Rolls
      if (sub === 2) {
        S.synthHiHat(ctx, musicGain, time, true, 0.16);
      } else if (sub === 0 || sub === 1 || sub === 3) {
        S.synthHiHat(ctx, musicGain, time, false, 0.08);
      }

      // 4. Minimalist Dark/Hypnotic Pluck Synth Lead
      if (sub === 0 || sub === 1 || sub === 2) {
        const mandelaoLead = ['A5', 'C6', 'E6', 'D6', 'C6', 'B5', 'A5', 'G#5'];
        const lNote = mandelaoLead[step % mandelaoLead.length];
        S.synthSquare(ctx, musicGain, lNote, time, 0.1, 0.2);
      }

      // 5. Energetic MC Vocal Stabs ('Tropa!', 'Ha!', 'Comemora!')
      if ((beat === 0 && sub === 0) || (beat === 2 && sub === 0) || (beat === 3 && sub === 2)) {
        const mcVocal = ['A4', 'C5', 'E5', 'D5'];
        const vNote = mcVocal[step % mcVocal.length];
        S.synthBrazilianVocal(ctx, musicGain, vNote, time, 0.2, 0.28, 'hey', true);
      }

      // 6. Brass Swells on phrase transitions
      if (sectionBar % 2 === 1 && beat === 3 && sub === 0) {
        S.synthBrass(ctx, musicGain, [['A4', 'C5', 'E5'], ['F4', 'A4', 'C5']][bar % 2], time, 0.25, 0.26);
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track 8: "Sol de Copacabana" • 120 BPM
    // Rio Bossa-Samba Funk / Beach Soccer & Sunset Groove (Marcos Valle / Azymuth style)
    // Warm Rhodes 9th chords, melodic slapping bass, cuica accents, bright flutes & joyful terrace whistling
    // -----------------------------------------------------------------------
    case 'bra-8': {
      const sectionBar = bar % 16;
      // Bossa-Funk 9th Chords: Fmaj9 - Em7 - Dm9 - Cmaj7
      const bossaChords = [
        { root: 'F1', notes: ['F4', 'A4', 'C5', 'E5', 'G5'] },
        { root: 'E1', notes: ['E4', 'G4', 'B4', 'D5', 'F#5'] },
        { root: 'D1', notes: ['D4', 'F4', 'A4', 'C5', 'E5'] },
        { root: 'C2', notes: ['C4', 'E4', 'G4', 'B4', 'D5'] },
      ];
      const cur = bossaChords[sectionBar % 4];

      // 1. Warm Rhodes Electric Piano (Syncopated jazz-bossa comps)
      if (sub === 0 || (beat === 1 && sub === 2) || (beat === 2 && sub === 3) || (beat === 3 && sub === 2)) {
        S.synthFmPiano(ctx, musicGain, cur.notes[0], time, 0.35, 0.22);
        S.synthFmPiano(ctx, musicGain, cur.notes[2], time, 0.35, 0.2);
        S.synthFmPiano(ctx, musicGain, cur.notes[3], time, 0.35, 0.18);
      }

      // 2. Melodic Slap Bass (Azymuth / Alex Malheiros funky swing)
      if (sub === 0 || (sub === 2 && beat % 2 === 1) || (beat === 3 && sub === 1)) {
        S.synthFmBass(ctx, musicGain, cur.root, time, 0.18, 0.42, 'slap');
      }

      // 3. Rio Samba-Funk Percussion (Pandeiro, Shaker, Cuica, Surdo)
      if (sub === 0) S.synthSurdo(ctx, musicGain, time, 0.3, 0.45, 'low');
      if (sub === 0 || sub === 2) S.synthAgogo(ctx, musicGain, sub === 0, time, 0.18);
      if (sub === 1 || sub === 3) S.synthPandeiro(ctx, musicGain, 'thumb', time, 0.24);
      S.synthShaker(ctx, musicGain, time, 0.1);

      // Playful Cuica squeak on bar turnaround
      if (sectionBar % 4 === 2 && beat === 2 && sub === 0) {
        S.synthCuica(ctx, musicGain, true, time, 0.18, 0.26);
      }

      // 4. Sunny Bossa-Flute & Brass Melody Hook (Copacabana beach football anthem)
      if (sectionBar >= 4) {
        const copacabanaMelody = [
          'G5', 'A5', 'C6', 'E6', 'D6', 'C6', 'A5', 'G5',
          'F#5', 'A5', 'B5', 'D6', 'C6', 'B5', 'A5', 'F#5',
          'E5', 'G5', 'A5', 'C6', 'B5', 'A5', 'G5', 'E5',
          'D5', 'E5', 'G5', 'A5', 'G5', 'E5', 'D5', 'C5',
        ];
        const stepIdx = (sectionBar % 4) * 8 + (beat * 2 + Math.floor(sub / 2));
        const leadNote = copacabanaMelody[stepIdx % copacabanaMelody.length];
        if (sub === 0 || sub === 2) {
          S.synthBrass(ctx, musicGain, [leadNote], time, 0.22, 0.24, false);
          S.synthWarmAnalogLead(ctx, musicGain, leadNote, time, 0.24, 0.22, false);
        }
      }

      // 5. Joyful Sunset Vocal Harmony ("Lala-la... Samba e Maracanã")
      if (sectionBar >= 8 && (beat === 1 || beat === 3) && sub === 0) {
        const vNote = ['A4', 'C5', 'E5', 'G5'][(step / 4) % 4];
        S.synthBrazilianVocal(ctx, musicGain, vNote, time, 0.38, 0.22, 'ah', true);
      }

      // 6. Drums & Whistle
      if (sub === 0 && (beat === 0 || beat === 2)) S.synthKick(ctx, musicGain, time, 0.48);
      if ((beat === 1 || beat === 3) && sub === 0) S.synthSnare(ctx, musicGain, time, 0.4);
      if ((sectionBar === 7 || sectionBar === 15) && beat === 3 && sub === 0) {
        S.synthWhistle(ctx, musicGain, 'A5', time, 0.26);
      }
      break;
    }

    // =======================================================================
    // 4. ARGENTINA — AUTHENTIC ARGENTINE FOOTBALL SOUNDTRACK (5 SONGS)
    // Inspired by Bersuit Vergarabat, Soda Stereo, Fito Páez, La Mosca & Cumbia Villera x Spinetta
    // Rich multi-instrumentation: Bandoneón, Grand Piano, Electric & Acoustic Guitars,
    // Keytar Leads, Authentic Güiro, Stadium Brass, Bombo Legüero & Roaring Terrace Chants
    // =======================================================================

    // -----------------------------------------------------------------------
    // Track 1: "El Baile del Potrero" • 136 BPM
    // Bersuit Vergarabat-inspired festive murga-rock and ska fusion
    // Bandoneón hooks, acoustic ska strums, overdriven rock chords, bombo & barrio swagger
    // -----------------------------------------------------------------------
    case 'arg-1': {
      const sectionBar = bar % 16;
      // Chords: Verse (G - D - Em - C / G - D - C - D), Pre-Chorus (Am - Bm - C - D7), Chorus (G - D - Em - C)
      let chordNotes: string[] = ['G4', 'B4', 'D5'];
      let rootBass = 'G1';
      let chordName = 'G';

      if (sectionBar < 8) {
        // Verse: G - D - Em - C
        const vChord = sectionBar % 4;
        if (vChord === 0) { chordNotes = ['G4', 'B4', 'D5']; rootBass = 'G1'; chordName = 'G'; }
        else if (vChord === 1) { chordNotes = ['F#4', 'A4', 'D5']; rootBass = 'D2'; chordName = 'D'; }
        else if (vChord === 2) { chordNotes = ['G4', 'B4', 'E5']; rootBass = 'E2'; chordName = 'Em'; }
        else { chordNotes = ['G4', 'C5', 'E5']; rootBass = 'C2'; chordName = 'C'; }
      } else if (sectionBar < 12) {
        // Pre-Chorus Murga Build: Am - Bm - C - D7
        const pChord = sectionBar - 8;
        if (pChord === 0) { chordNotes = ['A4', 'C5', 'E5']; rootBass = 'A1'; chordName = 'Am'; }
        else if (pChord === 1) { chordNotes = ['B4', 'D5', 'F#5']; rootBass = 'B1'; chordName = 'Bm'; }
        else if (pChord === 2) { chordNotes = ['C5', 'E5', 'G5']; rootBass = 'C2'; chordName = 'C'; }
        else { chordNotes = ['C5', 'D5', 'F#5', 'A5']; rootBass = 'D2'; chordName = 'D7'; }
      } else {
        // Chorus ("El Baile del Potrero" Gambeta Climax): G - D - Em - C
        const cChord = sectionBar - 12;
        if (cChord === 0) { chordNotes = ['G4', 'B4', 'D5']; rootBass = 'G1'; chordName = 'G'; }
        else if (cChord === 1) { chordNotes = ['F#4', 'A4', 'D5']; rootBass = 'D2'; chordName = 'D'; }
        else if (cChord === 2) { chordNotes = ['G4', 'B4', 'E5']; rootBass = 'E2'; chordName = 'Em'; }
        else { chordNotes = ['G4', 'C5', 'E5']; rootBass = 'C2'; chordName = 'C'; }
      }

      // Upbeat Ska / Murga Acoustic Guitar Strumming (Offbeat energy on 1.5, 2.5, 3.5, 4.5)
      if (sub === 2) {
        S.synthAcousticGuitar(ctx, musicGain, chordNotes[0], time, 0.18, 0.24, false);
        S.synthAcousticGuitar(ctx, musicGain, chordNotes[1], time, 0.18, 0.2, false);
        S.synthAcousticGuitar(ctx, musicGain, chordNotes[2], time, 0.18, 0.18, false);
      }

      // Syncopated Murga-Rock Walking Bass (Active Latin bounce on 1, 2.5, 3, 4.5)
      if (sub === 0 || (sub === 2 && (beat === 1 || beat === 3))) {
        const bassNote = sub === 2 ? (chordName === 'G' ? 'D2' : rootBass) : rootBass;
        S.synthFmBass(ctx, musicGain, bassNote, time, 0.2, 0.44, 'solid');
      }

      // Expressive Argentine Bandoneón / Accordion Gambeta Lead Riff
      if (sectionBar >= 2) {
        if (sectionBar < 12) {
          // Playful Murga Theme
          if (sub === 0 || (sub === 2 && beat % 2 === 0)) {
            const murgaTheme = ['B4', 'D5', 'G5', 'A5', 'B5', 'A5', 'G5', 'E5', 'D5', 'E5', 'G5', 'B4'];
            const note = murgaTheme[step % murgaTheme.length];
            S.synthBandoneonExpressive(ctx, musicGain, note, time, 0.28, 0.26, false);
          }
        } else {
          // Soaring Chorus Gambeta Hook
          if (sub === 0 || sub === 2) {
            const gambetaHook = [
              'D5', 'G5', 'B5', 'A5', 'G5', 'F#5', 'G5', 'A5',
              'B5', 'B5', 'A5', 'G5', 'E5', 'G5', 'A5', 'D5',
              'G5', 'A5', 'B5', 'C6', 'B5', 'A5', 'G5', 'E5',
              'D5', 'E5', 'G5', 'A5', 'G5', 'G5', 'G5', 'G5'
            ];
            const leadNote = gambetaHook[step % gambetaHook.length];
            S.synthBandoneonExpressive(ctx, musicGain, leadNote, time, 0.32, 0.3, true);
            S.synthElectricGuitar(ctx, musicGain, leadNote, time, 0.3, 0.22, 'lead');
          }
        }
      }

      // Rock Power Chord overdrive in Chorus
      if (sectionBar >= 12 && (sub === 0 || (beat === 2 && sub === 2))) {
        S.synthPowerChord(ctx, musicGain, rootBass, chordNotes[1], chordNotes[2], time, 0.35, 0.24);
      }

      // Murga Percussion with Bombo con Platillo, Snare Rolls & Shakers
      if (sub === 0) {
        S.synthKick(ctx, musicGain, time, 0.52);
      }
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synthSnare(ctx, musicGain, time, 0.44);
        S.synthClap(ctx, musicGain, time, 0.28);
      }
      if (sub === 0 || sub === 2) {
        S.synthHiHat(ctx, musicGain, time, sub === 2, 0.14);
      }
      if (sectionBar >= 12 && sub === 0 && (beat === 0 || beat === 2)) {
        S.synthTambourine(ctx, musicGain, time, true, 0.22);
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track 2: "De Pasión Ligera" • 126 BPM
    // Soda Stereo & Gustavo Cerati-inspired Argentine rock anthem
    // Iconic 4-chord progression, lush chorus electric guitars, driving post-punk bass
    // -----------------------------------------------------------------------
    case 'arg-2': {
      const sectionBar = bar % 16;
      // Chords: Iconic Soda Stereo progression: Bm - G - D - A
      let chordNotes: string[] = ['B4', 'D5', 'F#5'];
      let rootBass = 'B1';
      let chordName = 'Bm';

      if (sectionBar < 12) {
        const chordIdx = sectionBar % 4;
        if (chordIdx === 0) { chordNotes = ['B4', 'D5', 'F#5']; rootBass = 'B1'; chordName = 'Bm'; }
        else if (chordIdx === 1) { chordNotes = ['B4', 'D5', 'G5']; rootBass = 'G1'; chordName = 'G'; }
        else if (chordIdx === 2) { chordNotes = ['A4', 'D5', 'F#5']; rootBass = 'D2'; chordName = 'D'; }
        else { chordNotes = ['A4', 'C#5', 'E5']; rootBass = 'A1'; chordName = 'A'; }
      } else {
        // Chorus Climax with soaring power
        const cChord = sectionBar - 12;
        if (cChord === 0) { chordNotes = ['B4', 'D5', 'F#5']; rootBass = 'B1'; chordName = 'Bm'; }
        else if (cChord === 1) { chordNotes = ['B4', 'D5', 'G5']; rootBass = 'G1'; chordName = 'G'; }
        else if (cChord === 2) { chordNotes = ['A4', 'D5', 'F#5']; rootBass = 'D2'; chordName = 'D'; }
        else { chordNotes = ['A4', 'C#5', 'E5']; rootBass = 'A1'; chordName = 'A'; }
      }

      // Driving Post-Punk 8th-Note Bassline
      if (sub === 0 || sub === 2) {
        S.synthFmBass(ctx, musicGain, rootBass, time, 0.22, 0.44, 'solid');
      }

      // Dreamy 80s/90s Analog Chorus Synth Pad
      if (beat === 0 && sub === 0) {
        S.synthPadStrings(ctx, musicGain, chordNotes, time, 1.8, 0.2);
      }

      // Clean Arpeggiated Electric Guitar in Verses
      if (sectionBar < 12) {
        if (sub === 0 || sub === 2) {
          const arps = [chordNotes[0], chordNotes[1], chordNotes[2], chordNotes[1]];
          S.synthElectricGuitar(ctx, musicGain, arps[(beat * 2 + (sub === 2 ? 1 : 0)) % arps.length], time, 0.32, 0.22, 'clean');
        }
      }

      // Iconic Electric Guitar Riff & Power Chords in Chorus
      if (sectionBar >= 4) {
        if (sectionBar >= 12) {
          // Full Power Chords
          if (sub === 0 || (sub === 2 && beat % 2 === 0)) {
            S.synthPowerChord(ctx, musicGain, rootBass, chordNotes[1], chordNotes[2], time, 0.32, 0.28);
          }
          // Cerati Soaring Lead Solo Hook
          if (sub === 0 || sub === 2 || (beat === 3 && sub === 3)) {
            const ceratiLead = [
              'F#5', 'F#5', 'E5', 'D5', 'C#5', 'D5', 'E5', 'F#5',
              'G5', 'F#5', 'E5', 'D5', 'C#5', 'B4', 'C#5', 'D5',
              'F#5', 'A5', 'B5', 'A5', 'F#5', 'E5', 'D5', 'E5',
              'F#5', 'E5', 'D5', 'C#5', 'B4', 'B4', 'B4', 'B4'
            ];
            const note = ceratiLead[step % ceratiLead.length];
            S.synthElectricGuitar(ctx, musicGain, note, time, 0.38, 0.3, 'lead');
          }
          // Stadium vocal backing chants
          if ((beat === 1 || beat === 3) && sub === 0) {
            S.synthTerraceCrowdChant(ctx, musicGain, chordNotes[1], time, 0.45, 0.24, 'oh');
          }
        }
      }

      // Stadium Rock Drums
      if (sub === 0) {
        S.synthKick(ctx, musicGain, time, 0.5);
      }
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synthSnare(ctx, musicGain, time, 0.44);
      }
      if (sub === 0 || sub === 2) {
        S.synthHiHat(ctx, musicGain, time, sub === 2 && beat === 3, 0.14);
      }
      if (sectionBar >= 12 && sub === 0 && beat === 0) {
        S.synthCrash(ctx, musicGain, time, 0.36);
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track 3: "Mariposa de Tablón" • 120 BPM
    // Fito Páez-inspired Rosario grand piano rock anthem
    // Rolling grand piano chords, soaring trumpet fanfares, singing melodic guitars & poetry
    // -----------------------------------------------------------------------
    case 'arg-3': {
      const sectionBar = bar % 16;
      // Chords: Verse (C - G/B - Am - F / F - C/E - Dm7 - G), Pre-Chorus (Em7 - Am7 - Dm7 - G), Chorus (C - Em7 - F - G)
      let chordNotes: string[] = ['C4', 'E4', 'G4'];
      let rootBass = 'C2';
      let chordName = 'C';

      if (sectionBar < 8) {
        // Verse: C - G - Am - F
        const vChord = sectionBar % 4;
        if (vChord === 0) { chordNotes = ['C4', 'E4', 'G4']; rootBass = 'C2'; chordName = 'C'; }
        else if (vChord === 1) { chordNotes = ['B3', 'D4', 'G4']; rootBass = 'B1'; chordName = 'G/B'; }
        else if (vChord === 2) { chordNotes = ['C4', 'E4', 'A4']; rootBass = 'A1'; chordName = 'Am'; }
        else { chordNotes = ['C4', 'F4', 'A4']; rootBass = 'F1'; chordName = 'F'; }
      } else if (sectionBar < 12) {
        // Pre-Chorus Build: Em7 - Am7 - Dm7 - G
        const pChord = sectionBar - 8;
        if (pChord === 0) { chordNotes = ['E4', 'G4', 'B4', 'D5']; rootBass = 'E2'; chordName = 'Em7'; }
        else if (pChord === 1) { chordNotes = ['C4', 'E4', 'G4', 'A4']; rootBass = 'A1'; chordName = 'Am7'; }
        else if (pChord === 2) { chordNotes = ['D4', 'F4', 'A4', 'C5']; rootBass = 'D2'; chordName = 'Dm7'; }
        else { chordNotes = ['D4', 'G4', 'B4', 'D5']; rootBass = 'G1'; chordName = 'G'; }
      } else {
        // Chorus Rosario Anthem: C - Em7 - F - G
        const cChord = sectionBar - 12;
        if (cChord === 0) { chordNotes = ['C4', 'E4', 'G4']; rootBass = 'C2'; chordName = 'C'; }
        else if (cChord === 1) { chordNotes = ['E4', 'G4', 'B4']; rootBass = 'E2'; chordName = 'Em'; }
        else if (cChord === 2) { chordNotes = ['F4', 'A4', 'C5']; rootBass = 'F1'; chordName = 'F'; }
        else { chordNotes = ['G4', 'B4', 'D5']; rootBass = 'G1'; chordName = 'G'; }
      }

      // Rolling Concert Grand Piano (Páez signature syncopated piano chords & arpeggios)
      if (sub === 0 || sub === 2 || (beat === 1 && sub === 1) || (beat === 3 && sub === 3)) {
        S.synthConcertPiano(ctx, musicGain, chordNotes[0], time, 0.32, 0.24, 1.1);
        S.synthConcertPiano(ctx, musicGain, chordNotes[1], time, 0.32, 0.22, 1.1);
        S.synthConcertPiano(ctx, musicGain, chordNotes[2], time, 0.32, 0.2, 1.1);
      }

      // Warm Acoustic Rhythm Guitar
      if (sub === 0 || sub === 2) {
        S.synthAcousticGuitar(ctx, musicGain, chordNotes[0], time, 0.25, 0.18, false);
      }

      // Melodic Walking Bassline
      if (sub === 0 || sub === 2) {
        const bassNote = sub === 2 && beat === 3 ? (chordName === 'C' ? 'B1' : rootBass) : rootBass;
        S.synthFmBass(ctx, musicGain, bassNote, time, 0.22, 0.42, 'smooth');
      }

      // Soaring Trumpet Fanfare in Pre-Chorus & Chorus
      if (sectionBar >= 8) {
        if ((beat === 0 || beat === 2) && sub === 0) {
          const trumpetFanfare = ['G4', 'C5', 'E5', 'G5', 'A5', 'G5', 'F5', 'E5'];
          const note = trumpetFanfare[(step / 8) % trumpetFanfare.length];
          S.synthTrumpetSolo(ctx, musicGain, note, time, 0.42, 0.26, true);
        }
      }

      // Singing Melodic Electric Guitar Leads
      if (sectionBar >= 4) {
        if (sub === 0 || (sub === 2 && beat % 2 === 1)) {
          const paezHook = ['E5', 'G5', 'C6', 'B5', 'A5', 'G5', 'E5', 'F5', 'G5', 'A5', 'G5', 'E5'];
          const note = paezHook[step % paezHook.length];
          S.synthElectricGuitar(ctx, musicGain, note, time, 0.36, 0.26, 'lead');
        }
      }

      // Rosario Pop-Rock Percussion Kit
      if (sub === 0) {
        S.synthKick(ctx, musicGain, time, 0.48);
      }
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synthSnare(ctx, musicGain, time, 0.42);
        S.synthTambourine(ctx, musicGain, time, true, 0.2);
      }
      if (sub === 0 || sub === 2) {
        S.synthHiHat(ctx, musicGain, time, sub === 2, 0.12);
      }
      if (sectionBar >= 12 && sub === 0 && beat === 0) {
        S.synthCrash(ctx, musicGain, time, 0.34);
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track 4: "Muchachos de la Tercera" • 132 BPM
    // La Mosca Tsé-Tsé-inspired Qatar 2022 World Cup stadium anthem
    // Brass ska stabs, bombo legüero stadium beat, acoustic strums & roaring terrace chants
    // -----------------------------------------------------------------------
    case 'arg-4': {
      const sectionBar = bar % 16;
      // Chords: Verse (Dm - C - Bb - A7), Pre-Chorus (Gm - Dm - E7 - A7), Chorus (Dm - Bb - C - F / Gm - Dm - A7 - Dm)
      let chordNotes: string[] = ['D4', 'F4', 'A4'];
      let rootBass = 'D2';
      let chordName = 'Dm';

      if (sectionBar < 8) {
        // Verse ("En Argentina nací..."): Dm - C - Bb - A7
        const vChord = sectionBar % 4;
        if (vChord === 0) { chordNotes = ['D4', 'F4', 'A4']; rootBass = 'D2'; chordName = 'Dm'; }
        else if (vChord === 1) { chordNotes = ['C4', 'E4', 'G4']; rootBass = 'C2'; chordName = 'C'; }
        else if (vChord === 2) { chordNotes = ['D4', 'F4', 'Bb4']; rootBass = 'Bb1'; chordName = 'Bb'; }
        else { chordNotes = ['C#4', 'E4', 'A4']; rootBass = 'A1'; chordName = 'A7'; }
      } else if (sectionBar < 12) {
        // Pre-Chorus ("No te lo puedo explicar..."): Gm - Dm - E7 - A7
        const pChord = sectionBar - 8;
        if (pChord === 0) { chordNotes = ['D4', 'G4', 'Bb4']; rootBass = 'G1'; chordName = 'Gm'; }
        else if (pChord === 1) { chordNotes = ['D4', 'F4', 'A4']; rootBass = 'D2'; chordName = 'Dm'; }
        else if (pChord === 2) { chordNotes = ['D4', 'E4', 'G#4', 'B4']; rootBass = 'E2'; chordName = 'E7'; }
        else { chordNotes = ['C#4', 'E4', 'A4']; rootBass = 'A1'; chordName = 'A7'; }
      } else {
        // Chorus ("Muchachos! Ahora nos volvimos a ilusionar!"): Dm - Bb - C - F
        const cChord = sectionBar - 12;
        if (cChord === 0) { chordNotes = ['D4', 'F4', 'A4']; rootBass = 'D2'; chordName = 'Dm'; }
        else if (cChord === 1) { chordNotes = ['D4', 'F4', 'Bb4']; rootBass = 'Bb1'; chordName = 'Bb'; }
        else if (cChord === 2) { chordNotes = ['C4', 'E4', 'G4']; rootBass = 'C2'; chordName = 'C'; }
        else { chordNotes = ['C4', 'F4', 'A4']; rootBass = 'F1'; chordName = 'F'; }
      }

      // Rhythmic Acoustic Guitar Strums (Ska / Stadium Anthem feel)
      if (sub === 2 || (beat === 0 && sub === 0)) {
        S.synthAcousticGuitar(ctx, musicGain, chordNotes[0], time, 0.22, 0.24, false);
        S.synthAcousticGuitar(ctx, musicGain, chordNotes[1], time, 0.22, 0.2, false);
        S.synthAcousticGuitar(ctx, musicGain, chordNotes[2], time, 0.22, 0.18, false);
      }

      // Punchy Stadium Ska Brass Stabs
      if (sub === 2) {
        S.synthBrass(ctx, musicGain, chordNotes, time, 0.18, 0.24, true);
      }

      // Driving Stadium Bassline
      if (sub === 0 || sub === 2) {
        S.synthFmBass(ctx, musicGain, rootBass, time, 0.2, 0.44, 'solid');
      }

      // Triumphant Trumpet Lead & Terrace Crowd Singalong
      if (sectionBar >= 4) {
        if (sectionBar < 12) {
          // Verse Melody ("En Argentina nací, tierra de Diego y Lionel...")
          if (sub === 0 || sub === 2) {
            const verseMuchachos = ['A4', 'D5', 'F5', 'E5', 'D5', 'C5', 'D5', 'E5', 'F5', 'E5', 'D5', 'Bb4', 'A4', 'C#5', 'E5', 'D5'];
            const note = verseMuchachos[step % verseMuchachos.length];
            S.synthTrumpetSolo(ctx, musicGain, note, time, 0.32, 0.28, true);
          }
        } else {
          // Explosive Chorus Melody ("Muchachos! Ahora nos volvimos a ilusionar, quiero ganar la tercera...")
          if (sub === 0 || sub === 2 || (beat === 3 && sub === 3)) {
            const chorusMuchachos = [
              'A5', 'A5', 'G5', 'F5', 'E5', 'F5', 'G5', 'A5',
              'Bb5', 'A5', 'G5', 'F5', 'E5', 'D5', 'E5', 'F5',
              'G5', 'F5', 'E5', 'D5', 'C#5', 'D5', 'E5', 'F5',
              'E5', 'D5', 'C#5', 'Bb4', 'A4', 'D5', 'D5', 'D5'
            ];
            const note = chorusMuchachos[step % chorusMuchachos.length];
            S.synthTrumpetSolo(ctx, musicGain, note, time, 0.38, 0.32, true);
            S.synthBandoneonExpressive(ctx, musicGain, note, time, 0.35, 0.25, true);
          }
          // Roaring Terrace Crowd Chants
          if ((beat === 1 || beat === 3) && sub === 0) {
            S.synthTerraceCrowdChant(ctx, musicGain, chordNotes[1], time, 0.48, 0.3, 'home');
          }
        }
      }

      // Stadium Bombo Legüero, Timpani & Claps
      if (sub === 0) {
        S.synthKick(ctx, musicGain, time, 0.54);
        if (sectionBar >= 12) {
          S.synthStadiumTimpani(ctx, musicGain, 'D2', time, 0.32);
        }
      }
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synthSnare(ctx, musicGain, time, 0.46);
        S.synthClap(ctx, musicGain, time, 0.32);
        S.synthTambourine(ctx, musicGain, time, true, 0.22);
      }
      if (sub === 0 || sub === 2) {
        S.synthHiHat(ctx, musicGain, time, sub === 2, 0.14);
      }
      if (sectionBar >= 12 && sub === 0 && beat === 0) {
        S.synthCrash(ctx, musicGain, time, 0.38);
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track 5: "Cumbia del Potrero Iluminado" • 102 BPM
    // Cumbia Villera (Damas Gratis) meets Spinetta jazz-rock poetic harmony
    // Resonant keytar leads with pitch glides, authentic güiro raspado, FM slap bass & 9th chords
    // -----------------------------------------------------------------------
    case 'arg-5': {
      const sectionBar = bar % 16;
      // Chords: Spinetta-infused lush progression (Emaj9 - C#m7 - F#m9 - B13 / Em - Am - B7 - Em)
      let chordNotes: string[] = ['E4', 'G#4', 'B4', 'D#5'];
      let rootBass = 'E2';
      let chordName = 'Emaj9';

      if (sectionBar < 8) {
        // Poetic Jazz-Rock Chords
        const vChord = sectionBar % 4;
        if (vChord === 0) { chordNotes = ['E4', 'G#4', 'B4', 'D#5']; rootBass = 'E2'; chordName = 'Emaj9'; }
        else if (vChord === 1) { chordNotes = ['E4', 'G#4', 'B4', 'C#5']; rootBass = 'C#2'; chordName = 'C#m7'; }
        else if (vChord === 2) { chordNotes = ['E4', 'F#4', 'A4', 'C#5']; rootBass = 'F#1'; chordName = 'F#m9'; }
        else { chordNotes = ['D#4', 'G#4', 'A4', 'B4']; rootBass = 'B1'; chordName = 'B13'; }
      } else if (sectionBar < 12) {
        // Bridge Build: Amaj7 - G#m7 - F#m7 - B7
        const pChord = sectionBar - 8;
        if (pChord === 0) { chordNotes = ['E4', 'G#4', 'A4', 'C#5']; rootBass = 'A1'; chordName = 'Amaj7'; }
        else if (pChord === 1) { chordNotes = ['D#4', 'G#4', 'B4']; rootBass = 'G#1'; chordName = 'G#m7'; }
        else if (pChord === 2) { chordNotes = ['E4', 'F#4', 'A4', 'C#5']; rootBass = 'F#1'; chordName = 'F#m7'; }
        else { chordNotes = ['D#4', 'F#4', 'A4', 'B4']; rootBass = 'B1'; chordName = 'B7'; }
      } else {
        // Full Cumbia Villera Keytar Climax (Em - Am - B7 - Em)
        const cChord = sectionBar - 12;
        if (cChord === 0) { chordNotes = ['E4', 'G4', 'B4']; rootBass = 'E2'; chordName = 'Em'; }
        else if (cChord === 1) { chordNotes = ['E4', 'A4', 'C5']; rootBass = 'A1'; chordName = 'Am'; }
        else if (cChord === 2) { chordNotes = ['D#4', 'F#4', 'A4', 'B4']; rootBass = 'B1'; chordName = 'B7'; }
        else { chordNotes = ['E4', 'G4', 'B4']; rootBass = 'E2'; chordName = 'Em'; }
      }

      // Authentic Güiro Raspado on every 16th note (Cumbia heartbeat)
      S.synthGuiro(ctx, musicGain, sub === 0, time, sub === 0 ? 0.22 : 0.14);

      // Bouncy Cumbia Villera FM Slap Bass (Down on 1, bounce on & of 2 and 4)
      if (sub === 0 || (beat === 1 && sub === 2) || (beat === 3 && sub === 2)) {
        S.synthFmBass(ctx, musicGain, rootBass, time, 0.22, 0.44, 'slap');
      }

      // Spinetta-style Lush Electric Piano / Rhodes 9th Chords (Offbeat syncopation)
      if (sub === 2) {
        S.synthFmPiano(ctx, musicGain, chordNotes[0], time, 0.28, 0.2);
        S.synthFmPiano(ctx, musicGain, chordNotes[2], time, 0.28, 0.18);
      }

      // High-Energy Damas Gratis-Style Synthesized Keytar Lead Riff
      if (sectionBar >= 2) {
        if (sectionBar < 12) {
          // Melodic Poetic Theme
          if (sub === 0 || (sub === 2 && beat % 2 === 1)) {
            const poeticLead = ['G#5', 'B5', 'D#6', 'C#6', 'B5', 'A5', 'G#5', 'F#5', 'E5', 'F#5', 'G#5', 'B5'];
            const note = poeticLead[step % poeticLead.length];
            S.synthCumbiaKeytarLead(ctx, musicGain, note, time, 0.24, 0.25, sub === 0 ? 2 : 0);
          }
        } else {
          // Lightning Damas Gratis Keytar Solo in Chorus
          if (sub === 0 || sub === 2 || (beat === 1 && sub === 1) || (beat === 3 && sub === 3)) {
            const villeraSolo = [
              'E5', 'G5', 'B5', 'E6', 'D6', 'B5', 'A5', 'G5',
              'A5', 'C6', 'E6', 'A6', 'G6', 'E6', 'D6', 'C6',
              'B5', 'D#6', 'F#6', 'B6', 'A6', 'F#6', 'E6', 'D#6',
              'E6', 'G6', 'B6', 'E7', 'D6', 'B5', 'G5', 'E5'
            ];
            const note = villeraSolo[step % villeraSolo.length];
            S.synthCumbiaKeytarLead(ctx, musicGain, note, time, 0.26, 0.3, sub === 0 ? 1 : 0);
          }
        }
      }

      // Latin Congas & Cowbells
      if (beat === 0 && sub === 2) S.synthConga(ctx, musicGain, true, false, time, 0.24);
      if (beat === 2 && sub === 2) S.synthConga(ctx, musicGain, true, true, time, 0.28);
      if ((beat === 1 || beat === 3) && sub === 0) S.synthCowbell(ctx, musicGain, time, 0.22);

      // Cumbia Villera Percussion Kit
      if ((beat === 0 || beat === 2) && sub === 0) {
        S.synthKick(ctx, musicGain, time, 0.48);
      }
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synthSnare(ctx, musicGain, time, 0.4);
      }
      if (sectionBar >= 12 && beat === 3 && sub === 2) {
        S.synthWhistle(ctx, musicGain, 'A5', time, 0.24);
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track 6: "Milonga del Diez Eterno" • 116 BPM
    // Dramatic Tango-Rock Fusion / Maradona Tribute (Piazzolla meets Charly García)
    // Passionate Bandoneón counterpoint, driving walking rock bass, dramatic grand piano stabs & weeping electric guitar
    // -----------------------------------------------------------------------
    case 'arg-6': {
      const sectionBar = bar % 16;
      // Dramatic Piazzolla Minor Tango Cadence: Dm - Gm6 - A7b9 - Dm (bars 0-7), Bbmaj7 - Em7b5 - A7 - Dm (bars 8-15)
      const roots = sectionBar < 8 ? ['D2', 'G1', 'A1', 'D2'] : ['Bb1', 'E2', 'A1', 'D2'];
      const curRoot = roots[sectionBar % 4];
      const tangoChords = [
        ['D4', 'F4', 'A4', 'D5'],
        ['D4', 'G4', 'Bb4', 'E5'],
        ['C#4', 'E4', 'G4', 'Bb4'],
        ['D4', 'F4', 'A4', 'D5'],
      ];
      const curChord = tangoChords[sectionBar % 4];

      // 1. Dramatic Tango Staccato Piano Chords (3+3+2 Milonga syncopation)
      // Hit on step 0, 3, 6, 8, 11, 14
      const isMilongaHit =
        (step % 8 === 0) ||
        (step % 8 === 3) ||
        (step % 8 === 6);
      if (isMilongaHit) {
        S.synthConcertPiano(ctx, musicGain, curChord[0], time, 0.22, 0.26, 1.2);
        S.synthConcertPiano(ctx, musicGain, curChord[1], time, 0.22, 0.24, 1.2);
        S.synthConcertPiano(ctx, musicGain, curChord[2], time, 0.22, 0.22, 1.2);
      }

      // 2. Expressive Argentine Bandoneón Theme (Haunting, romantic & triumphant)
      const bandoneonTheme = [
        'A4', 'D5', 'F5', 'E5', 'D5', 'C#5', 'D5', 'E5',
        'F5', 'G5', 'Bb5', 'A5', 'G5', 'F5', 'E5', 'D5',
        'G5', 'Bb5', 'D6', 'C#6', 'Bb5', 'A5', 'G5', 'F5',
        'E5', 'F5', 'G5', 'F5', 'E5', 'D5', 'C#5', 'D5',
      ];
      const stepIdx = (sectionBar % 4) * 8 + (beat * 2 + Math.floor(sub / 2));
      const bNote = bandoneonTheme[stepIdx % bandoneonTheme.length];
      if (sub === 0 || sub === 2) {
        S.synthBandoneonExpressive(ctx, musicGain, bNote, time, 0.32, 0.3, true);
      }

      // 3. Driving Walking Rock / Tango Bassline
      if (sub === 0 || (sub === 2 && beat % 2 === 1)) {
        S.synthFmBass(ctx, musicGain, curRoot, time, 0.22, 0.44, 'solid');
      }

      // 4. Weeping Electric Guitar Lead Solo in Climax (Bars >= 8)
      if (sectionBar >= 8) {
        const guitarSolo = [
          'D5', 'F5', 'A5', 'D6', 'C6', 'Bb5', 'A5', 'G5',
          'A5', 'D6', 'F6', 'E6', 'D6', 'C#6', 'D6', 'E6',
        ];
        const gNote = guitarSolo[(Math.floor(step / 2)) % guitarSolo.length];
        if (sub === 0 || (sub === 2 && beat % 2 === 1)) {
          S.synthElectricGuitar(ctx, musicGain, gNote, time, 0.42, 0.26, 'lead');
        }
      }

      // 5. Bombo Legüero, Timpani & Tango Rock Snare
      if (sub === 0) S.synthKick(ctx, musicGain, time, 0.54);
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synthSnare(ctx, musicGain, time, 0.46);
        S.synthClap(ctx, musicGain, time, 0.28);
      }
      if (sub === 0 || sub === 2) {
        S.synthHiHat(ctx, musicGain, time, sub === 2, 0.12);
      }
      if (sectionBar >= 12 && beat === 0 && sub === 0) {
        S.synthStadiumTimpani(ctx, musicGain, 'D1', time, 0.44);
        S.synthCrash(ctx, musicGain, time, 0.4);
      }
      break;
    }

    // =======================================================================
    // 5. ENGLAND — AUTHENTIC BRITISH ROCK, BRITPOP & PUNK ANTHEMS (5 SONGS)
    // Inspired by Three Lions, The Beatles, Sex Pistols, Oasis, & Bitter Sweet Symphony
    // Full modern acoustic/electric guitars, concert piano, brass, strings & crowd chants
    // =======================================================================

    // -----------------------------------------------------------------------
    // Track 1: "Three Lions On The Shirt" • 128 BPM
    // Anthemic Football's Coming Home stadium pop-rock with acoustic strums,
    // singing guitar hooks, brass fanfares, driving bass, and terrace crowd chants
    // -----------------------------------------------------------------------
    case 'eng-1': {
      const sectionBar = bar % 16;
      // Chords: Verse (D - A - Bm - G / D - A - G - A), Pre-Chorus (Em - F#m - G - A), Chorus (D - A - Bm - G)
      let chordNotes: string[] = ['D4', 'F#4', 'A4'];
      let rootBass = 'D2';
      let chordName = 'D';

      if (sectionBar < 8) {
        // Verse: D - A - Bm - G
        const vChord = sectionBar % 4;
        if (vChord === 0) { chordNotes = ['D4', 'F#4', 'A4']; rootBass = 'D2'; chordName = 'D'; }
        else if (vChord === 1) { chordNotes = ['C#4', 'E4', 'A4']; rootBass = 'A1'; chordName = 'A'; }
        else if (vChord === 2) { chordNotes = ['D4', 'F#4', 'B4']; rootBass = 'B1'; chordName = 'Bm'; }
        else { chordNotes = ['D4', 'G4', 'B4']; rootBass = 'G1'; chordName = 'G'; }
      } else if (sectionBar < 12) {
        // Pre-Chorus ("It's coming home" build): Em - F#m - G - A
        const pChord = sectionBar - 8;
        if (pChord === 0) { chordNotes = ['E4', 'G4', 'B4']; rootBass = 'E2'; chordName = 'Em'; }
        else if (pChord === 1) { chordNotes = ['F#4', 'A4', 'C#5']; rootBass = 'F#1'; chordName = 'F#m'; }
        else if (pChord === 2) { chordNotes = ['G4', 'B4', 'D5']; rootBass = 'G1'; chordName = 'G'; }
        else { chordNotes = ['A4', 'C#5', 'E5']; rootBass = 'A1'; chordName = 'A'; }
      } else {
        // Chorus ("Football's Coming Home" Stadium Anthem): D - A - Bm - G
        const cChord = sectionBar - 12;
        if (cChord === 0) { chordNotes = ['D4', 'F#4', 'A4']; rootBass = 'D2'; chordName = 'D'; }
        else if (cChord === 1) { chordNotes = ['C#4', 'E4', 'A4']; rootBass = 'A1'; chordName = 'A'; }
        else if (cChord === 2) { chordNotes = ['D4', 'F#4', 'B4']; rootBass = 'B1'; chordName = 'Bm'; }
        else { chordNotes = ['D4', 'G4', 'B4']; rootBass = 'G1'; chordName = 'G'; }
      }

      // Jangly Acoustic Rhythm Guitar (Strummed 8th-note energy)
      if (sub === 0 || sub === 2) {
        S.synthAcousticGuitar(ctx, musicGain, chordNotes[0], time, 0.28, 0.22, false);
        S.synthAcousticGuitar(ctx, musicGain, chordNotes[1], time, 0.28, 0.18, false);
        S.synthAcousticGuitar(ctx, musicGain, chordNotes[2], time, 0.28, 0.16, false);
      }

      // Melodic British Walking / Pumping Rock Bassline
      if (sub === 0 || sub === 2) {
        const bassNote = sub === 2 && beat === 3 ? (chordName === 'D' ? 'C#2' : rootBass) : rootBass;
        S.synthFmBass(ctx, musicGain, bassNote, time, 0.2, 0.42, 'solid');
      }

      // Concert Grand Piano Pounding Chords in Chorus
      if (sectionBar >= 12 && (sub === 0 || sub === 2)) {
        S.synthConcertPiano(ctx, musicGain, chordNotes[0], time, 0.32, 0.22, 1.1);
        S.synthConcertPiano(ctx, musicGain, chordNotes[2], time, 0.32, 0.2, 1.1);
      }

      // Melodic Electric Guitar Hook & Riffs
      if (sectionBar >= 4) {
        if (sectionBar < 12) {
          // Verse & Pre-Chorus Arpeggiated Riffs
          if (sub === 0 || (sub === 2 && beat % 2 === 1)) {
            const verseHook = ['F#4', 'A4', 'D5', 'E5', 'F#5', 'E5', 'D5', 'B4', 'A4', 'F#4', 'G4', 'A4'];
            const note = verseHook[(step % verseHook.length)];
            S.synthElectricGuitar(ctx, musicGain, note, time, 0.35, 0.25, 'lead');
          }
        } else {
          // Iconic Chorus Hook ("Three lions on a shirt, Jules Rimet still gleaming")
          if (sub === 0 || sub === 2 || (beat === 3 && sub === 3)) {
            const chorusHook = [
              'F#5', 'F#5', 'E5', 'D5', 'F#5', 'A5', 'F#5', 'E5',
              'D5', 'D5', 'E5', 'F#5', 'E5', 'D5', 'B4', 'A4',
              'F#5', 'A5', 'B5', 'A5', 'F#5', 'E5', 'D5', 'E5',
              'F#5', 'E5', 'D5', 'B4', 'A4', 'B4', 'D5', 'D5'
            ];
            const leadNote = chorusHook[(step % chorusHook.length)];
            S.synthElectricGuitar(ctx, musicGain, leadNote, time, 0.38, 0.3, 'lead');
          }
        }
      }

      // Soaring British Brass Fanfare in Pre-Chorus & Chorus
      if (sectionBar >= 8 && (beat === 0 || beat === 2) && sub === 0) {
        const brassFanfare = ['A4', 'D5', 'F#5', 'E5'];
        S.synthTrumpetSolo(ctx, musicGain, brassFanfare[(step / 8) % brassFanfare.length], time, 0.45, 0.24, true);
      }

      // Terrace Crowd Chant Layer ("It's Coming Home!" Stadium Atmosphere)
      if (sectionBar >= 12 && (beat === 1 || beat === 3) && sub === 0) {
        const chantMelody = ['F#4', 'A4', 'D5', 'A4'];
        S.synthTerraceCrowdChant(ctx, musicGain, chantMelody[(step / 4) % chantMelody.length], time, 0.48, 0.28, 'home');
      }

      // British Pop-Rock Percussion Kit
      if (sub === 0) {
        S.synthKick(ctx, musicGain, time, 0.52);
      }
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synthSnare(ctx, musicGain, time, 0.45);
        S.synthTambourine(ctx, musicGain, time, true, 0.2);
      }
      if (sub === 0 || sub === 2) {
        S.synthHiHat(ctx, musicGain, time, sub === 2 && beat === 3, 0.13);
      }
      if (sectionBar >= 12 && sub === 0 && beat === 0) {
        S.synthCrash(ctx, musicGain, time, 0.35);
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track 2: "Penny Lane Matchday" • 116 BPM
    // Abbey Road & Penny Lane-inspired 1960s British Baroque Pop
    // Staccato concert piano, melodic Hofner bass, clean guitar, piccolo trumpet & string quartet
    // -----------------------------------------------------------------------
    case 'eng-2': {
      const sectionBar = bar % 16;
      // Chords: Verse (A - F#m - Bm - E7), Pre-Chorus (D - C#m - Bm - E), Chorus (A - C#m - D - E7)
      let chordNotes: string[] = ['A3', 'C#4', 'E4'];
      let rootBass = 'A1';
      let chordName = 'A';

      if (sectionBar < 8) {
        // Verse: A - F#m - Bm - E
        const vChord = sectionBar % 4;
        if (vChord === 0) { chordNotes = ['A3', 'C#4', 'E4']; rootBass = 'A1'; chordName = 'A'; }
        else if (vChord === 1) { chordNotes = ['F#3', 'A3', 'C#4']; rootBass = 'F#1'; chordName = 'F#m'; }
        else if (vChord === 2) { chordNotes = ['B3', 'D4', 'F#4']; rootBass = 'B1'; chordName = 'Bm'; }
        else { chordNotes = ['G#3', 'B3', 'E4']; rootBass = 'E1'; chordName = 'E'; }
      } else if (sectionBar < 12) {
        // Pre-Chorus: D - C#m - Bm - E
        const pChord = sectionBar - 8;
        if (pChord === 0) { chordNotes = ['F#3', 'A3', 'D4']; rootBass = 'D2'; chordName = 'D'; }
        else if (pChord === 1) { chordNotes = ['E3', 'G#3', 'C#4']; rootBass = 'C#2'; chordName = 'C#m'; }
        else if (pChord === 2) { chordNotes = ['D3', 'F#3', 'B3']; rootBass = 'B1'; chordName = 'Bm'; }
        else { chordNotes = ['E3', 'G#3', 'B3']; rootBass = 'E1'; chordName = 'E'; }
      } else {
        // Chorus (Penny Lane Baroque Sunburst): A - C#m - D - E
        const cChord = sectionBar - 12;
        if (cChord === 0) { chordNotes = ['A3', 'C#4', 'E4']; rootBass = 'A1'; chordName = 'A'; }
        else if (cChord === 1) { chordNotes = ['G#3', 'C#4', 'E4']; rootBass = 'C#2'; chordName = 'C#m'; }
        else if (cChord === 2) { chordNotes = ['A3', 'D4', 'F#4']; rootBass = 'D2'; chordName = 'D'; }
        else { chordNotes = ['G#3', 'B3', 'E4']; rootBass = 'E1'; chordName = 'E'; }
      }

      // Iconic 60s Staccato Concert Piano Chords (Paul McCartney Penny Lane style)
      if (sub === 0 || sub === 2) {
        S.synthConcertPiano(ctx, musicGain, chordNotes[0], time, 0.18, 0.24, 0.95);
        S.synthConcertPiano(ctx, musicGain, chordNotes[1], time, 0.18, 0.22, 0.95);
        S.synthConcertPiano(ctx, musicGain, chordNotes[2], time, 0.18, 0.2, 0.95);
      }

      // Melodic Hofner Walking Bass (Active, lyrical, musical scalar movement)
      const bassRuns: Record<string, string[]> = {
        A: ['A1', 'C#2', 'E2', 'G#2'],
        'F#m': ['F#1', 'A1', 'C#2', 'E2'],
        Bm: ['B1', 'D2', 'F#2', 'A2'],
        E: ['E1', 'G#1', 'B1', 'D2'],
        D: ['D2', 'F#2', 'A2', 'C#3'],
        'C#m': ['C#2', 'E2', 'G#2', 'B2'],
      };
      const curRun = bassRuns[chordName] || ['A1', 'E2', 'A2', 'C#2'];
      S.synthFmBass(ctx, musicGain, curRun[beat % 4], time, 0.26, 0.4, 'smooth');

      // Sparkling Piccolo / British Baroque Trumpet Solo (Penny Lane Solo style)
      if (sectionBar >= 4) {
        if (sectionBar < 12) {
          // Counterpoint flute/trumpet ornamentations
          if (sub === 0 || sub === 2) {
            const baroqueRiff = ['E5', 'G#5', 'A5', 'B5', 'C#6', 'B5', 'A5', 'G#5', 'F#5', 'E5', 'C#5', 'B4'];
            const note = baroqueRiff[(step % baroqueRiff.length)];
            S.synthTrumpetSolo(ctx, musicGain, note, time, 0.28, 0.22, true);
          }
        } else {
          // Triumphant High Piccolo Trumpet Flourishes
          if (sub === 0 || sub === 1 || sub === 2) {
            const highFanfare = [
              'A5', 'C#6', 'E6', 'F#6', 'E6', 'C#6', 'A5', 'B5',
              'C#6', 'E6', 'D6', 'C#6', 'B5', 'A5', 'G#5', 'A5'
            ];
            const note = highFanfare[(step % highFanfare.length)];
            S.synthTrumpetSolo(ctx, musicGain, note, time, 0.22, 0.26, true);
          }
        }
      }

      // Chamber String Quartet Sustained Harmonic Warmth
      if (beat === 0 && sub === 0) {
        S.synthOrchestralStrings(ctx, musicGain, [chordNotes[1], chordNotes[2], 'A4'], time, 1.4, 0.18, false);
      }

      // Clean 60s Electric Guitar Fills (George Harrison style subtle melodic licks)
      if (sectionBar < 12 && beat === 3 && sub === 2) {
        S.synthElectricGuitar(ctx, musicGain, 'C#5', time, 0.35, 0.2, 'clean');
      }

      // Beatles 3-Part Vocal Harmony ("La-La-La / Ahhh" Counterpoint)
      if (sectionBar >= 12 && (beat === 0 || beat === 2) && sub === 0) {
        S.synthItalianVocal(ctx, musicGain, 'A4', time, 0.55, 0.22, 'ah', false);
        S.synthItalianVocal(ctx, musicGain, 'C#5', time, 0.55, 0.18, 'ah', false);
      }

      // Vintage 1960s Drum Kit (Crisp rimshots, tambourine, warm kick)
      if (sub === 0 && (beat === 0 || beat === 2)) {
        S.synthKick(ctx, musicGain, time, 0.46);
      }
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synthSnare(ctx, musicGain, time, 0.38, true);
        S.synthTambourine(ctx, musicGain, time, true, 0.22);
      }
      if (sub === 0 || sub === 2) {
        S.synthHiHat(ctx, musicGain, time, false, 0.11);
      }
      if (sectionBar >= 12 && sub === 0 && beat === 0) {
        S.synthRideCymbal(ctx, musicGain, time, 0.18);
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track 3: "Anarchy in the Premier League" • 156 BPM
    // Sex Pistols-inspired 1977 British Punk Rock
    // Blistering distorted power chords, high-gain pogo bass, aggressive snare, and terrace oi chants
    // -----------------------------------------------------------------------
    case 'eng-3': {
      const sectionBar = bar % 16;
      // Chords: Intro/Verse (G5 - C5 - D5 - G5), Breakdown (Em5 - C5 - G5 - D5), Climax (G5 - D5 - C5 - D5)
      let rootNote = 'G2';
      let fifthNote = 'D3';
      let octaveNote = 'G3';

      if (sectionBar < 8) {
        // Verse: G5 - C5 - D5 - G5
        const vChord = sectionBar % 4;
        if (vChord === 0) { rootNote = 'G2'; fifthNote = 'D3'; octaveNote = 'G3'; }
        else if (vChord === 1) { rootNote = 'C3'; fifthNote = 'G3'; octaveNote = 'C4'; }
        else if (vChord === 2) { rootNote = 'D3'; fifthNote = 'A3'; octaveNote = 'D4'; }
        else { rootNote = 'G2'; fifthNote = 'D3'; octaveNote = 'G3'; }
      } else if (sectionBar < 12) {
        // Breakdown / Bridge: Em5 - C5 - G5 - D5
        const pChord = sectionBar - 8;
        if (pChord === 0) { rootNote = 'E2'; fifthNote = 'B2'; octaveNote = 'E3'; }
        else if (pChord === 1) { rootNote = 'C3'; fifthNote = 'G3'; octaveNote = 'C4'; }
        else if (pChord === 2) { rootNote = 'G2'; fifthNote = 'D3'; octaveNote = 'G3'; }
        else { rootNote = 'D3'; fifthNote = 'A3'; octaveNote = 'D4'; }
      } else {
        // Riot Chorus: G5 - D5 - C5 - D5
        const cChord = sectionBar - 12;
        if (cChord === 0) { rootNote = 'G2'; fifthNote = 'D3'; octaveNote = 'G3'; }
        else if (cChord === 1) { rootNote = 'D3'; fifthNote = 'A3'; octaveNote = 'D4'; }
        else if (cChord === 2) { rootNote = 'C3'; fifthNote = 'G3'; octaveNote = 'C4'; }
        else { rootNote = 'D3'; fifthNote = 'A3'; octaveNote = 'D4'; }
      }

      // Relentless 1977 High-Gain Distorted Punk Rhythm Guitars (Steve Jones wall-of-sound)
      if (sub === 0 || sub === 2) {
        S.synthPunkGuitarOverdrive(ctx, musicGain, rootNote, fifthNote, octaveNote, time, 0.16, 0.32);
      }
      if (sectionBar >= 12 && (sub === 1 || sub === 3)) {
        // Double-time 16th-note punk chug in chorus
        S.synthPunkGuitarOverdrive(ctx, musicGain, rootNote, fifthNote, octaveNote, time, 0.12, 0.26);
      }

      // Aggressive Pogo Bass (Glen Matlock / Sid Vicious high-attack picked bass)
      if (sub === 0 || sub === 2) {
        S.synthFmBass(ctx, musicGain, rootNote.replace('3', '2').replace('2', '1'), time, 0.14, 0.46, 'reese');
      }

      // Screaming Pentatonic Lead Solos & Angular Riffs
      if (sectionBar >= 4) {
        if (sectionBar < 12) {
          // Snarly Verse Fill Riffs
          if (sub === 0 || (sub === 2 && beat % 2 === 1)) {
            const punkLicks = ['G4', 'Bb4', 'C5', 'Db5', 'D5', 'F5', 'G5', 'F5', 'D5', 'C5', 'Bb4', 'G4'];
            const note = punkLicks[(step % punkLicks.length)];
            S.synthElectricGuitar(ctx, musicGain, note, time, 0.22, 0.28, 'lead');
          }
        } else {
          // Explosive Solo Screams
          if (sub === 0 || sub === 2 || (beat === 3 && sub === 3)) {
            const soloHook = [
              'G5', 'G5', 'F5', 'D5', 'G5', 'Bb5', 'C6', 'Bb5',
              'G5', 'F5', 'D5', 'C5', 'Bb4', 'C5', 'D5', 'G5',
              'D6', 'C6', 'Bb5', 'G5', 'F5', 'G5', 'Bb5', 'C6',
              'D6', 'Db6', 'C6', 'Bb5', 'G5', 'F5', 'G5', 'G5'
            ];
            const leadNote = soloHook[(step % soloHook.length)];
            S.synthElectricGuitar(ctx, musicGain, leadNote, time, 0.25, 0.34, 'lead');
          }
        }
      }

      // Terrace Oi! Gang Shouts
      if ((sectionBar < 8 && beat === 3 && sub === 2) || (sectionBar >= 12 && beat === 1 && sub === 0)) {
        S.synthTerraceCrowdChant(ctx, musicGain, 'G4', time, 0.22, 0.32, 'oi');
      }

      // Fast Aggressive 1977 Punk Drums (Relentless kick, slamming snare, open hi-hats)
      if (sub === 0) {
        S.synthKick(ctx, musicGain, time, 0.54, 1.2);
      }
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synthSnare(ctx, musicGain, time, 0.48, true);
      }
      if (sub === 0 || sub === 2) {
        S.synthHiHat(ctx, musicGain, time, true, 0.16);
      }
      if ((beat === 0 && sub === 0 && sectionBar % 4 === 0) || (sectionBar >= 12 && beat === 0 && sub === 0)) {
        S.synthCrash(ctx, musicGain, time, 0.42);
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track 4: "Maine Road Oasis" • 120 BPM
    // 90s Manchester Britpop Stadium Anthem (Wonderwall / Don't Look Back In Anger style)
    // Wall-of-sound distorted guitars, acoustic strums, concert rock piano, soaring lead solo & stadium singalong
    // -----------------------------------------------------------------------
    case 'eng-4': {
      const sectionBar = bar % 16;
      // Chords: Verse (Em7 - G - Dsus4 - A7sus4), Pre-Chorus (C - D - Em - G), Chorus (C - G - Am - F / C - G - D)
      let chordNotes: string[] = ['E4', 'G4', 'B4'];
      let rootBass = 'E2';
      let chordName = 'Em7';

      if (sectionBar < 8) {
        // Verse: Em7 - G - Dsus4 - A7sus4 (Classic Oasis open chord shapes)
        const vChord = sectionBar % 4;
        if (vChord === 0) { chordNotes = ['E4', 'G4', 'B4', 'D5']; rootBass = 'E2'; chordName = 'Em7'; }
        else if (vChord === 1) { chordNotes = ['G4', 'B4', 'D5']; rootBass = 'G1'; chordName = 'G'; }
        else if (vChord === 2) { chordNotes = ['D4', 'G4', 'A4', 'D5']; rootBass = 'D2'; chordName = 'Dsus4'; }
        else { chordNotes = ['A4', 'C#5', 'E5', 'G5']; rootBass = 'A1'; chordName = 'A7sus4'; }
      } else if (sectionBar < 12) {
        // Pre-Chorus: C - D - Em - G (Building soaring emotional lift)
        const pChord = sectionBar - 8;
        if (pChord === 0) { chordNotes = ['C4', 'E4', 'G4']; rootBass = 'C2'; chordName = 'C'; }
        else if (pChord === 1) { chordNotes = ['D4', 'F#4', 'A4']; rootBass = 'D2'; chordName = 'D'; }
        else if (pChord === 2) { chordNotes = ['E4', 'G4', 'B4']; rootBass = 'E2'; chordName = 'Em'; }
        else { chordNotes = ['G4', 'B4', 'D5']; rootBass = 'G1'; chordName = 'G'; }
      } else {
        // Stadium Chorus (Massive Singalong Hook): C - G - Am - F
        const cChord = sectionBar - 12;
        if (cChord === 0) { chordNotes = ['C4', 'E4', 'G4']; rootBass = 'C2'; chordName = 'C'; }
        else if (cChord === 1) { chordNotes = ['B3', 'D4', 'G4']; rootBass = 'G1'; chordName = 'G'; }
        else if (cChord === 2) { chordNotes = ['C4', 'E4', 'A4']; rootBass = 'A1'; chordName = 'Am'; }
        else { chordNotes = ['C4', 'F4', 'A4']; rootBass = 'F1'; chordName = 'F'; }
      }

      // Resonant Acoustic Guitar Strumming (Continuous 90s Britpop rhythm)
      if (sub === 0 || sub === 2 || (beat === 3 && sub === 3)) {
        S.synthAcousticGuitar(ctx, musicGain, chordNotes[0], time, 0.32, 0.24, false);
        S.synthAcousticGuitar(ctx, musicGain, chordNotes[1], time, 0.32, 0.2, false);
        S.synthAcousticGuitar(ctx, musicGain, chordNotes[2], time, 0.32, 0.18, false);
      }

      // Thick Wall-of-Sound Overdriven Rhythm Guitar
      if (sectionBar >= 4 && (sub === 0 || sub === 2)) {
        S.synthPowerChord(ctx, musicGain, rootBass, chordNotes[0], chordNotes[2], time, 0.28, 0.24);
      }

      // Steady Melodic Britpop Bassline (Guigsy style solid groove)
      if (sub === 0 || sub === 2) {
        S.synthFmBass(ctx, musicGain, rootBass, time, 0.22, 0.44, 'solid');
      }

      // Rock Grand Piano Chords in Chorus (Don't Look Back In Anger style)
      if (sectionBar >= 12 && (sub === 0 || sub === 2)) {
        S.synthConcertPiano(ctx, musicGain, chordNotes[0], time, 0.35, 0.24, 1.15);
        S.synthConcertPiano(ctx, musicGain, chordNotes[1], time, 0.35, 0.22, 1.15);
        S.synthConcertPiano(ctx, musicGain, chordNotes[2], time, 0.35, 0.2, 1.15);
      }

      // Soaring Les Paul Singing Guitar Solo & Hook (Noel Gallagher style melodic bends)
      if (sectionBar >= 4) {
        if (sectionBar < 12) {
          // Verse & Pre-Chorus Melodic fills
          if (sub === 0 || (sub === 2 && beat % 2 === 1)) {
            const verseLicks = ['G4', 'A4', 'B4', 'D5', 'E5', 'G5', 'E5', 'D5', 'B4', 'A4', 'G4', 'E4'];
            const note = verseLicks[(step % verseLicks.length)];
            S.synthElectricGuitar(ctx, musicGain, note, time, 0.38, 0.26, 'lead');
          }
        } else {
          // Triumphant Chorus Lead Solo (Huge anthemic stadium melody)
          if (sub === 0 || sub === 2 || (beat === 3 && sub === 3)) {
            const britpopChorus = [
              'G5', 'A5', 'B5', 'G5', 'E5', 'D5', 'C5', 'D5',
              'E5', 'G5', 'A5', 'G5', 'E5', 'D5', 'C5', 'A4',
              'C5', 'D5', 'E5', 'G5', 'A5', 'C6', 'B5', 'A5',
              'G5', 'E5', 'D5', 'C5', 'D5', 'E5', 'G5', 'G5'
            ];
            const leadNote = britpopChorus[(step % britpopChorus.length)];
            S.synthElectricGuitar(ctx, musicGain, leadNote, time, 0.42, 0.32, 'lead');
          }
        }
      }

      // Shaken Tambourine on Every Beat (Liam Gallagher tambourine swagger)
      if (sub === 0 || sub === 2) {
        S.synthTambourine(ctx, musicGain, time, sub === 0, 0.18);
      }

      // Stadium Crowd Singalong Harmony in Chorus
      if (sectionBar >= 12 && (beat === 1 || beat === 3) && sub === 0) {
        const singalongNotes = ['G4', 'C5', 'E5', 'D5'];
        S.synthTerraceCrowdChant(ctx, musicGain, singalongNotes[(step / 4) % singalongNotes.length], time, 0.5, 0.26, 'oh');
      }

      // Massive Stadium Drums (Roomy kick, deep snare, ride cymbal)
      if (sub === 0) {
        S.synthKick(ctx, musicGain, time, 0.52);
      }
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synthSnare(ctx, musicGain, time, 0.44);
      }
      if (sub === 0 || sub === 2) {
        S.synthHiHat(ctx, musicGain, time, sub === 2, 0.12);
      }
      if (sectionBar >= 12 && sub === 0 && beat === 0) {
        S.synthCrash(ctx, musicGain, time, 0.36);
        S.synthRideCymbal(ctx, musicGain, time, 0.2);
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track 5: "Bitter Sweet Derby Symphony" • 88 BPM
    // The Verve-inspired Majestic Symphonic Britpop
    // Sweeping violin ostinato, syncopated breakbeat drums, deep bass, warm acoustic guitar & cinematic strings
    // -----------------------------------------------------------------------
    case 'eng-5': {
      const sectionBar = bar % 16;
      // The Iconic Bitter Sweet Symphony Progression: E - Bm7 - D - A (2 bars each)
      let chordNotes: string[] = ['E4', 'G#4', 'B4'];
      let rootBass = 'E2';
      let chordIndex = Math.floor(sectionBar / 2) % 4;

      if (chordIndex === 0) { chordNotes = ['E4', 'G#4', 'B4']; rootBass = 'E2'; }
      else if (chordIndex === 1) { chordNotes = ['D4', 'F#4', 'A4', 'B4']; rootBass = 'B1'; }
      else if (chordIndex === 2) { chordNotes = ['D4', 'F#4', 'A4']; rootBass = 'D2'; }
      else { chordNotes = ['C#4', 'E4', 'A4']; rootBass = 'A1'; }

      // Iconic Sweeping Orchestral Violin Ostinato (The legendary ascending/descending motif)
      // Plays on 16th notes / 8th notes to create that timeless symphonic loop
      const violinOstinatoMotif = [
        'E5', 'G#5', 'B5', 'G#5', 'E5', 'B5', 'G#5', 'E5',
        'D5', 'F#5', 'B5', 'F#5', 'D5', 'B5', 'F#5', 'D5',
        'D5', 'F#5', 'A5', 'F#5', 'D5', 'A5', 'F#5', 'D5',
        'C#5', 'E5', 'A5', 'E5', 'C#5', 'A5', 'E5', 'C#5'
      ];
      if (sub === 0 || sub === 2) {
        const ostinatoNote = violinOstinatoMotif[(step / 2) % violinOstinatoMotif.length];
        S.synthOrchestralStrings(ctx, musicGain, [ostinatoNote], time, 0.32, 0.28, true);
      }

      // Second Violin / Cello Counter-Melody Layer (Lush symphonic depth)
      if (sectionBar >= 4 && (beat === 0 || beat === 2) && sub === 0) {
        S.synthOrchestralStrings(ctx, musicGain, [chordNotes[0], chordNotes[1], chordNotes[2]], time, 1.6, 0.22, true);
      }

      // Warm Acoustic Guitar Rhythm (Subtle 8th-note strumming grounding the orchestra)
      if (sub === 0 || sub === 2) {
        S.synthAcousticGuitar(ctx, musicGain, chordNotes[0], time, 0.35, 0.2, false);
        S.synthAcousticGuitar(ctx, musicGain, chordNotes[1], time, 0.35, 0.16, false);
      }

      // Hypnotic Deep Melodic Bassline (Nick McCabe / Simon Jones rolling groove)
      if (sub === 0 || (sub === 2 && beat % 2 === 1)) {
        S.synthFmBass(ctx, musicGain, rootBass, time, 0.28, 0.44, 'smooth');
      }

      // French Horn / Warm Brass Swell on chord changes
      if (beat === 0 && sub === 0) {
        S.synthBrass(ctx, musicGain, [chordNotes[0], chordNotes[2]], time, 0.8, 0.18, false);
      }

      // Concert Grand Piano Bell Accents in the high register
      if (sectionBar >= 8 && beat === 2 && sub === 0) {
        S.synthConcertPiano(ctx, musicGain, 'E6', time, 0.6, 0.18, 0.9);
      }

      // Emotional Choral / Crowd Harmony ("Ahhh" Atmospheric Elevation)
      if (sectionBar >= 8 && (beat === 0 || beat === 2) && sub === 0) {
        S.synthTerraceCrowdChant(ctx, musicGain, chordNotes[1], time, 0.85, 0.2, 'oh');
      }

      // 90s Hip-Hop Influenced Breakbeat Drum Kit (Syncopated groove, ghost snares & tambourine)
      // Kick on 0, 2.5
      if (beat === 0 && sub === 0) {
        S.synthKick(ctx, musicGain, time, 0.54);
      }
      if (beat === 2 && sub === 2) {
        S.synthKick(ctx, musicGain, time, 0.48);
      }

      // Snare on 2 and 4 with ghost snare on 3.5
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synthSnare(ctx, musicGain, time, 0.44);
      }
      if (beat === 3 && sub === 2) {
        S.synthSnare(ctx, musicGain, time, 0.22, true); // Ghost snare
      }

      // Shimmering Hi-Hats & Shaken Tambourine
      if (sub === 0 || sub === 2) {
        S.synthHiHat(ctx, musicGain, time, sub === 2, 0.12);
        S.synthTambourine(ctx, musicGain, time, false, 0.14);
      }

      // Majestic Timpani & Crash on 8-bar downbeats
      if (sectionBar % 8 === 0 && beat === 0 && sub === 0) {
        S.synthStadiumTimpani(ctx, musicGain, 'E2', time, 0.42);
        S.synthCrash(ctx, musicGain, time, 0.32);
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track 6: "Terrace Two-Tone Stomp" • 138 BPM
    // British 2-Tone Ska Revival & Terrace Stomp (The Specials / Madness / The Selecter style)
    // Brisk offbeat guitar skank, walking bass, brass fanfare hooks, whistle & terrace claps
    // -----------------------------------------------------------------------
    case 'eng-6': {
      const sectionBar = bar % 16;
      // 2-Tone Ska Chord Sequence: Am - Dm - F - E7 (Fast syncopated British ska)
      const roots = ['A1', 'D2', 'F1', 'E1'];
      const triads = [
        ['A4', 'C5', 'E5'],
        ['A4', 'D5', 'F5'],
        ['A4', 'C5', 'F5'],
        ['G#4', 'B4', 'E5'],
      ];
      const curRoot = roots[sectionBar % 4];
      const curTriad = triads[sectionBar % 4];

      // 1. Fast British 2-Tone Offbeat Guitar Skank (Chop on upbeats: sub 1 & sub 3)
      if (sub === 1 || sub === 3) {
        S.synthElectricGuitar(ctx, musicGain, curTriad[0], time, 0.12, 0.24, 'clean');
        S.synthElectricGuitar(ctx, musicGain, curTriad[2], time, 0.12, 0.22, 'clean');
        S.synthFmPiano(ctx, musicGain, curTriad[1], time, 0.12, 0.18);
      }

      // 2. Energetic Walking Ska Bassline
      const walkingOffsets = ['A1', 'C2', 'E2', 'G2', 'D2', 'F2', 'A2', 'C3'];
      const bassNote = (sub === 0 || sub === 2)
        ? (beat === 0 ? curRoot : walkingOffsets[(step) % walkingOffsets.length])
        : curRoot;
      if (sub === 0 || sub === 2) {
        S.synthFmBass(ctx, musicGain, bassNote, time, 0.16, 0.42, 'solid');
      }

      // 3. Upbeat British Two-Tone Brass Riff (The Specials / Madness horns)
      if (sectionBar >= 4) {
        const skaHornMelody = [
          'E5', 'A5', 'C6', 'B5', 'A5', 'E5', 'A5', 'B5',
          'F5', 'A5', 'D6', 'C6', 'B5', 'A5', 'F5', 'A5',
          'C6', 'A5', 'F5', 'E5', 'F5', 'A5', 'C6', 'D6',
          'E6', 'D6', 'B5', 'G#5', 'E5', 'F#5', 'G#5', 'B5',
        ];
        const stepIdx = (sectionBar % 4) * 8 + (beat * 2 + Math.floor(sub / 2));
        const hornNote = skaHornMelody[stepIdx % skaHornMelody.length];
        if (sub === 0 || sub === 2) {
          S.synthBrass(ctx, musicGain, [hornNote], time, 0.24, 0.28, true);
        }
      }

      // 4. Ska Drum Kit & Terrace Claps (Kick on 1 & 3, Snare on 2 & 4, open hi-hats on offbeats)
      if (sub === 0 && (beat === 0 || beat === 2)) S.synthKick(ctx, musicGain, time, 0.52);
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synthSnare(ctx, musicGain, time, 0.46);
        S.synthClap(ctx, musicGain, time, 0.34);
      }
      if (sub === 1 || sub === 3) {
        S.synthHiHat(ctx, musicGain, time, true, 0.14);
      } else {
        S.synthHiHat(ctx, musicGain, time, false, 0.08);
      }

      // 5. Matchday Referee Whistle & Terrace Chants in Chorus
      if ((sectionBar === 7 || sectionBar === 15) && beat === 3 && sub === 0) {
        S.synthWhistle(ctx, musicGain, 'A5', time, 0.28);
        S.synthCrash(ctx, musicGain, time, 0.38);
      }
      if (sectionBar >= 8 && (beat === 0 || beat === 2) && sub === 0) {
        S.synthStadiumTerraceVocalChant(ctx, musicGain, curTriad, time, 0.6, 0.24, 'allez');
      }
      break;
    }

    // =======================================================================
    // 6. CONTINENTAL — 10 ORIGINAL PRESTIGIOUS ORCHESTRAL COMPOSITIONS
    // Masterful Symphonic Scores for Continental Club Tournaments:
    // (UCL, UEL, UECL, Copa Libertadores, Sudamericana, AFC, CAF, CONCACAF)
    // Full Orchestration: French Horns, Staccato Strings, Baroque Trumpets,
    // Reedy Bassoon, Cello Ostinatos, Operatic Choir, Timpani & Concert Percussion
    // =======================================================================

    // -----------------------------------------------------------------------
    // Track 1: "Vanguard of the Continent" • 132 BPM
    // Dvořák Symphony No. 9 Allegro con fuoco-inspired minor-key epic
    // Galloping staccato strings, triumphant French horn theme, explosive timpani
    // -----------------------------------------------------------------------
    case 'epic-1': {
      const sectionBar = bar % 16;

      // Harmonic Foundation: E Minor -> C Major -> G Major -> B7 (Allegro theme)
      let chordNotes: string[] = ['E4', 'G4', 'B4'];
      let rootBass = 'E2';
      let timpaniPitch = 'E2';

      if (sectionBar < 4) {
        chordNotes = ['E4', 'G4', 'B4']; rootBass = 'E1'; timpaniPitch = 'E2';
      } else if (sectionBar < 8) {
        chordNotes = ['E4', 'G4', 'C5']; rootBass = 'C2'; timpaniPitch = 'C2';
      } else if (sectionBar < 12) {
        chordNotes = ['D4', 'G4', 'B4']; rootBass = 'G1'; timpaniPitch = 'G2';
      } else {
        chordNotes = ['D#4', 'F#4', 'B4']; rootBass = 'B1'; timpaniPitch = 'B1';
      }

      // 1. Galloping Low Cello & Contrabass Driving Ostinato (Dvořák 4th Mov pulse)
      if (sub === 0 || sub === 2 || sub === 3) {
        const celloNote = sub === 3 ? (rootBass === 'E1' ? 'G1' : rootBass === 'C2' ? 'E2' : 'D2') : rootBass;
        S.synthCelloOstinato(ctx, musicGain, celloNote, time, 0.16, 0.38);
      }

      // 2. Rapid Staccato Violin Ostinato (Shimmering string runs)
      const staccatoRun = ['B4', 'E5', 'G5', 'E5', 'B4', 'G4', 'E4', 'G4'];
      S.synthStaccatoViolin(ctx, musicGain, staccatoRun[step % staccatoRun.length], time, 0.12, 0.2);

      // 3. Heroic French Horn & Trumpet Fanfare Theme (Bars 0-7, 12-15)
      if (sectionBar < 8 || sectionBar >= 12) {
        const themeMap: { [key: number]: string } = {
          0: 'B3', 1: 'E4', 2: 'G4', 3: 'B4',
          4: 'A4', 5: 'G4', 6: 'F#4', 7: 'E4',
          8: 'G4', 9: 'B4', 10: 'E5', 11: 'D5',
          12: 'C5', 13: 'B4', 14: 'A4', 15: 'B4',
        };
        const hornNote = themeMap[step % 16];
        if (hornNote && (sub === 0 || (sub === 2 && beat % 2 === 1))) {
          S.synthFrenchHornFanfare(ctx, musicGain, hornNote, time, 0.45, 0.28);
          if (sectionBar >= 12) {
            S.synthBrass(ctx, musicGain, [hornNote], time, 0.35, 0.22, true);
          }
        }
      } else {
        // Lyrical Secondary Theme (Bars 8-11 in G Major: Warm flute & sweeping strings)
        if (beat === 0 && sub === 0) {
          S.synthOrchestralStrings(ctx, musicGain, chordNotes, time, 1.8, 0.22, true);
        }
        if (sub === 0 || sub === 2) {
          const lyricalMelody = ['D5', 'G5', 'B5', 'A5', 'G5', 'F#5', 'G5', 'D5'];
          S.synthPanFlute(ctx, musicGain, lyricalMelody[(beat * 2 + (sub === 2 ? 1 : 0)) % lyricalMelody.length], time, 0.32, 0.22);
        }
      }

      // 4. Dramatic Timpani Rolls & Explosions
      if (beat === 0 && sub === 0) {
        S.synthStadiumTimpani(ctx, musicGain, timpaniPitch, time, 0.45);
      }
      if (sectionBar === 15 && beat >= 2) {
        S.synthStadiumTimpani(ctx, musicGain, 'B1', time, 0.48);
      }

      // 5. Orchestral Snare & Concert Bass Drum
      if (sub === 0) S.synthKick(ctx, musicGain, time, 0.42, 1.2);
      if ((beat === 1 || beat === 3) && sub === 0) S.synthSnare(ctx, musicGain, time, 0.35, false);
      if (sub === 0 || sub === 2) S.synthHiHat(ctx, musicGain, time, sub === 2, 0.12);
      break;
    }

    // -----------------------------------------------------------------------
    // Track 2: "Hymn of the Victorious" • 120 BPM
    // Beethoven Symphony No. 9 Ode to Joy-inspired triumphant D-Major anthem
    // Intimate cello opening building to grand operatic choir and brass explosion
    // -----------------------------------------------------------------------
    case 'epic-2': {
      const sectionBar = bar % 16;

      // Ode to Joy-style noble melodic steps across 16 steps in D Major:
      // (F# - F# - G - A | A - G - F# - E | D - D - E - F# | F#.. E - E..)
      const odeTheme = [
        'F#4', 'F#4', 'G4', 'A4',
        'A4', 'G4', 'F#4', 'E4',
        'D4', 'D4', 'E4', 'F#4',
        'F#4', 'E4', 'E4', 'E4',
      ];
      const odeTheme2 = [
        'F#4', 'F#4', 'G4', 'A4',
        'A4', 'G4', 'F#4', 'E4',
        'D4', 'D4', 'E4', 'F#4',
        'E4', 'D4', 'D4', 'D4',
      ];

      const currentMelody = sectionBar % 4 < 2 ? odeTheme : odeTheme2;
      const melodyNote = currentMelody[step % 16];

      // Bass Roots: D -> A -> D -> A (D Major cadence)
      const roots = ['D2', 'A1', 'D2', 'A1'];
      const curRoot = roots[sectionBar % 4];

      // Section 1 (Bars 0-3): Intimate low cellos & contrabass solo stating the theme
      if (sectionBar < 4) {
        if (sub === 0) {
          S.synthCelloOstinato(ctx, musicGain, melodyNote.replace('4', '3'), time, 0.38, 0.32);
        }
        if (beat === 0 && sub === 0) {
          S.synthCelloOstinato(ctx, musicGain, curRoot, time, 0.6, 0.28);
        }
      }
      // Section 2 (Bars 4-7): Violins & Woodwinds enter with warm counterpoint
      else if (sectionBar < 8) {
        if (sub === 0) {
          S.synthStaccatoViolin(ctx, musicGain, melodyNote, time, 0.32, 0.26);
          S.synthConcertPiano(ctx, musicGain, melodyNote, time, 0.4, 0.2, 0.9);
        }
        if (beat === 0 && sub === 0) {
          S.synthOrchestralStrings(ctx, musicGain, ['D4', 'F#4', 'A4'], time, 1.8, 0.18, true);
        }
        if (sub === 0 || sub === 2) {
          S.synthFmBass(ctx, musicGain, curRoot, time, 0.22, 0.32, 'smooth');
        }
      }
      // Section 3 (Bars 8-11): Operatic Choral Voices take the melody with French horns
      else if (sectionBar < 12) {
        if (sub === 0) {
          S.synthFrenchHornFanfare(ctx, musicGain, melodyNote, time, 0.4, 0.28);
          S.synthOperaticChoir(ctx, musicGain, [melodyNote, melodyNote.replace('4', '5')], time, 0.45, 0.28);
        }
        if (beat === 0 && sub === 0) {
          S.synthOrchestralStrings(ctx, musicGain, ['D4', 'F#4', 'A4', 'D5'], time, 1.8, 0.22, true);
          S.synthStadiumTimpani(ctx, musicGain, 'D2', time, 0.42);
        }
        if (sub === 0 || sub === 2) {
          S.synthFmBass(ctx, musicGain, curRoot, time, 0.22, 0.36, 'solid');
        }
      }
      // Section 4 (Bars 12-15): Full Symphonic Climax with Grand Brass, Choir & Timpani
      else {
        if (sub === 0) {
          S.synthBaroqueTrumpet(ctx, musicGain, melodyNote.replace('4', '5'), time, 0.32, 0.28);
          S.synthFrenchHornFanfare(ctx, musicGain, melodyNote, time, 0.4, 0.28);
          S.synthEpicChoirStab(ctx, musicGain, [melodyNote, 'D5', 'F#5'], time, 0.45, 0.3, 'ah');
        }
        if (beat === 0 && sub === 0) {
          S.synthOrchestralStrings(ctx, musicGain, ['D4', 'F#4', 'A4', 'D5'], time, 1.8, 0.24, true);
          S.synthStadiumTimpani(ctx, musicGain, 'D2', time, 0.48);
          S.synthCrash(ctx, musicGain, time, 0.36);
        }
        if (sub === 0 || sub === 2) {
          S.synthCelloOstinato(ctx, musicGain, curRoot, time, 0.22, 0.4);
        }
      }

      // Percussion groove (Bars 4+)
      if (sectionBar >= 4) {
        if (sub === 0) S.synthKick(ctx, musicGain, time, 0.4, 1.1);
        if ((beat === 1 || beat === 3) && sub === 0) S.synthSnare(ctx, musicGain, time, 0.32, false);
        if (sub === 0 || sub === 2) S.synthTambourine(ctx, musicGain, time, sub === 0, 0.14);
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track 3: "Crown of the Immortals" • 116 BPM
    // UEFA Champions League / Handel Zadok the Priest-style baroque anthem
    // Ascending 16th-note string arpeggios, royal heraldic trumpets & operatic choir
    // -----------------------------------------------------------------------
    case 'epic-3': {
      const sectionBar = bar % 16;

      // Regal Baroque Chord Progression: D Minor -> Bb Major -> C Major -> F Major (Chorus in F Major)
      let baroqueArp: string[] = ['D4', 'F4', 'A4', 'D5'];
      let rootBass = 'D2';
      let choirChord: string[] = ['D4', 'F4', 'A4'];

      if (sectionBar < 4) {
        baroqueArp = ['D4', 'F4', 'A4', 'D5']; rootBass = 'D1'; choirChord = ['D4', 'F4', 'A4'];
      } else if (sectionBar < 8) {
        baroqueArp = ['D4', 'F4', 'Bb4', 'D5']; rootBass = 'Bb1'; choirChord = ['D4', 'F4', 'Bb4'];
      } else if (sectionBar < 12) {
        baroqueArp = ['C4', 'E4', 'G4', 'C5']; rootBass = 'C2'; choirChord = ['C4', 'E4', 'G4'];
      } else {
        baroqueArp = ['C4', 'F4', 'A4', 'F5']; rootBass = 'F1'; choirChord = ['C4', 'F4', 'A4', 'C5'];
      }

      // 1. Famous Rising 16th-Note Baroque Violin Arpeggiation (Zadok style)
      const arpNote = baroqueArp[step % baroqueArp.length];
      S.synthStaccatoViolin(ctx, musicGain, arpNote, time, 0.12, 0.24);

      // 2. Deep Organ & Cello Foundation
      if (beat === 0 && sub === 0) {
        S.synthOrgan(ctx, musicGain, rootBass.replace('1', '2'), time, 1.8, 0.22);
        S.synthCelloOstinato(ctx, musicGain, rootBass, time, 0.45, 0.38);
      }

      // 3. Heraldic Baroque Trumpet Fanfare (Bars 8-15: "THE CHAMPIONS" theme)
      if (sectionBar >= 8) {
        // Regal European Fanfare: F5 -> A5 -> C6 -> A5 -> G5 -> F5
        const fanfareMotif = ['F5', 'A5', 'C6', 'C6', 'A5', 'G5', 'F5', 'G5'];
        if (sub === 0 || sub === 2) {
          const trumpNote = fanfareMotif[(beat * 2 + (sub === 2 ? 1 : 0)) % fanfareMotif.length];
          S.synthBaroqueTrumpet(ctx, musicGain, trumpNote, time, 0.28, 0.28);
          S.synthFrenchHornFanfare(ctx, musicGain, trumpNote.replace('6', '5').replace('5', '4'), time, 0.35, 0.24);
        }

        // Operatic Choral Chant Chords ("Les Grandes Équipes... The Champions!")
        if (beat === 0 && sub === 0) {
          S.synthEpicChoirStab(ctx, musicGain, choirChord, time, 1.2, 0.32, 'ah');
          S.synthStadiumTimpani(ctx, musicGain, rootBass.replace('1', '2'), time, 0.48);
          S.synthCrash(ctx, musicGain, time, 0.38);
        }
      } else {
        // Ambient Choir Hum in Verse (Bars 0-7)
        if (beat === 0 && sub === 0) {
          S.synthOperaticChoir(ctx, musicGain, choirChord, time, 1.8, 0.2);
        }
      }

      // 4. Stately Percussion
      if (sub === 0) S.synthKick(ctx, musicGain, time, 0.42, 1.1);
      if ((beat === 1 || beat === 3) && sub === 0) S.synthSnare(ctx, musicGain, time, 0.34, false);
      if (sub === 0 || sub === 2) S.synthHiHat(ctx, musicGain, time, sub === 2, 0.12);
      break;
    }

    // -----------------------------------------------------------------------
    // Track 4: "Wheel of Destiny" • 128 BPM
    // Carl Orff Carmina Burana / O Fortuna-inspired gothic orchestral drama
    // Pounding timpani on every beat, menacing choir chords, piercing brass stabs
    // -----------------------------------------------------------------------
    case 'epic-4': {
      const sectionBar = bar % 16;

      // Ominous D-Minor Harmonic Progression: Dm -> Dm/C -> Bb -> A7
      let choirChord: string[] = ['D4', 'F4', 'A4'];
      let rootBass = 'D2';

      if (sectionBar < 4) {
        choirChord = ['D4', 'F4', 'A4', 'D5']; rootBass = 'D1';
      } else if (sectionBar < 8) {
        choirChord = ['C4', 'F4', 'A4', 'C5']; rootBass = 'C2';
      } else if (sectionBar < 12) {
        choirChord = ['Bb3', 'D4', 'F4', 'Bb4']; rootBass = 'Bb1';
      } else {
        choirChord = ['A3', 'C#4', 'E4', 'A4']; rootBass = 'A1';
      }

      // 1. Thunderous Timpani on EVERY BEAT (Apocalyptic O Fortuna pulse)
      if (sub === 0) {
        S.synthStadiumTimpani(ctx, musicGain, rootBass.replace('1', '2'), time, 0.48);
        S.synthKick(ctx, musicGain, time, 0.46, 1.3);
      }

      // 2. Slow Heavy Cataclysmic Choral Chants (Bars 0-3, 12-15)
      if (sectionBar < 4 || sectionBar >= 12) {
        if (beat === 0 && sub === 0) {
          S.synthEpicChoirStab(ctx, musicGain, choirChord, time, 1.6, 0.36, 'oh');
          S.synthCrash(ctx, musicGain, time, 0.42);
        }
        if (beat === 2 && sub === 0) {
          S.synthEpicChoirStab(ctx, musicGain, choirChord, time, 1.2, 0.32, 'ah');
        }
        // Heavy brass stabs
        if (sub === 0) {
          S.synthBrass(ctx, musicGain, [rootBass === 'D1' ? 'D4' : 'A3'], time, 0.25, 0.28, true);
        }
      } else {
        // 3. Relentless Rapid Staccato String Drive (Bars 4-11: Sinister buildup)
        const sinisterRun = ['D4', 'E4', 'F4', 'G4', 'F4', 'E4', 'D4', 'C#4'];
        S.synthStaccatoViolin(ctx, musicGain, sinisterRun[step % sinisterRun.length], time, 0.1, 0.25);
        S.synthCelloOstinato(ctx, musicGain, rootBass, time, 0.14, 0.36);

        // Fast Choir Stabs on 8th notes
        if (sub === 0 || sub === 2) {
          S.synthEpicChoirStab(ctx, musicGain, choirChord, time, 0.22, 0.24, 'eh');
        }
      }

      // 4. Heavy Orchestral March Snare
      if (sub === 0 || sub === 2) {
        S.synthSnare(ctx, musicGain, time, 0.32, true);
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track 5: "Flight of the Valkyries" • 136 BPM
    // Richard Wagner Ride of the Valkyries-inspired galloping orchestral march
    // Leaping French horn fanfares, swirling high string arpeggios, driving triplets
    // -----------------------------------------------------------------------
    case 'epic-5': {
      const sectionBar = bar % 16;

      // Galloping B-Minor / D-Major Wagnerian Progression
      const roots = ['B1', 'B1', 'D2', 'F#1'];
      const curRoot = roots[sectionBar % 4];

      // 1. Heavy Galloping Sawing Cello / Bass Ostinato (Dotted Triplet Pulse: 0, 2, 3)
      if (sub === 0 || sub === 2 || sub === 3) {
        S.synthCelloOstinato(ctx, musicGain, curRoot, time, 0.15, 0.4);
      }

      // 2. Swirling High Violin Runs & Arpeggios (Swirling Valkyrie winds)
      const valkyrieArp = ['F#5', 'B5', 'D6', 'F#6', 'D6', 'B5', 'F#5', 'D5'];
      S.synthStaccatoViolin(ctx, musicGain, valkyrieArp[step % valkyrieArp.length], time, 0.12, 0.24);

      // 3. Leaping French Horn & Brass Valkyrie Motif (Classic leaping intervals: 5th, 3rd, 8ve)
      // Step Pattern: Sub 0 (Long), Sub 2 (Short), Sub 3 (Short)
      const valkyrieMotif = ['B3', 'D4', 'F#4', 'B4', 'F#4', 'D4', 'B3', 'F#3'];
      if (sub === 0 || sub === 2) {
        const hornNote = valkyrieMotif[(beat * 2 + (sub === 2 ? 1 : 0)) % valkyrieMotif.length];
        S.synthFrenchHornFanfare(ctx, musicGain, hornNote, time, 0.38, 0.3);
        if (sectionBar >= 8) {
          S.synthBrass(ctx, musicGain, [hornNote, hornNote.replace('3', '4').replace('4', '5')], time, 0.28, 0.25, true);
        }
      }

      // 4. Dramatic Timpani & Brass Hits
      if (beat === 0 && sub === 0) {
        S.synthStadiumTimpani(ctx, musicGain, curRoot === 'B1' ? 'B1' : 'D2', time, 0.46);
        if (sectionBar % 4 === 0) S.synthCrash(ctx, musicGain, time, 0.38);
      }

      // 5. Galloping Snare & Kick
      if (sub === 0 || sub === 3) S.synthKick(ctx, musicGain, time, 0.44, 1.2);
      if ((beat === 1 || beat === 3) && sub === 0) S.synthSnare(ctx, musicGain, time, 0.36, false);
      if (sub === 0 || sub === 2) S.synthTambourine(ctx, musicGain, time, sub === 0, 0.15);
      break;
    }

    // -----------------------------------------------------------------------
    // Track 6: "March of the Iron Legions" • 112 BPM
    // Gustav Holst Mars, the Bringer of War-inspired 5/4 militaristic ostinato
    // Menacing double-bass growl, reedy contrabassoon, ominous muted brass stabs
    // -----------------------------------------------------------------------
    case 'epic-6': {
      const sectionBar = bar % 16;

      // Holst Mars 5-Beat Ostinato Pattern across 16 subdivisions:
      // Hit on step 0, 3, 6, 8, 10 (Driving syncopated mechanical menace)
      const isMarsHit = step % 16 === 0 || step % 16 === 3 || step % 16 === 6 || step % 16 === 8 || step % 16 === 10;

      // Dark G-Minor / Db5 Harmonic Dissonance
      const rootBass = sectionBar % 4 < 2 ? 'G1' : 'Db2';

      // 1. Menacing Low Strings & Contrabassoon Ostinato
      if (isMarsHit) {
        S.synthCelloOstinato(ctx, musicGain, rootBass, time, 0.18, 0.42);
        S.synthOrchestralBassoon(ctx, musicGain, rootBass.replace('1', '2'), time, 0.18, 0.3);
        S.synthStadiumTimpani(ctx, musicGain, 'G1', time, 0.44);
        S.synthSnare(ctx, musicGain, time, 0.34, true);
      }

      // 2. Ominous Dissonant Brass Stabs (Bars 8-15)
      if (sectionBar >= 8) {
        if (step % 16 === 0) {
          S.synthFrenchHornFanfare(ctx, musicGain, 'G4', time, 0.45, 0.3);
          S.synthBrass(ctx, musicGain, ['G3', 'Db4', 'F4'], time, 0.35, 0.28, true);
        } else if (step % 16 === 6) {
          S.synthFrenchHornFanfare(ctx, musicGain, 'Ab4', time, 0.35, 0.28);
          S.synthBrass(ctx, musicGain, ['Ab3', 'C4', 'Eb4'], time, 0.3, 0.25, true);
        }
      }

      // 3. Eerie High Strings Swell (Bars 4-11)
      if (sectionBar >= 4 && sectionBar < 12 && beat === 0 && sub === 0) {
        S.synthOrchestralStrings(ctx, musicGain, ['G4', 'Bb4', 'Db5'], time, 1.8, 0.2, false);
      }

      // 4. Militaristic Snare Drum Taps
      if (sub === 0 || sub === 2) {
        S.synthHiHat(ctx, musicGain, time, false, 0.12);
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track 7: "Cavern of the Mountain King" • 118 BPM
    // Edvard Grieg In the Hall of the Mountain King-inspired accelerando crescendo
    // Tiptoeing staccato bassoon solo building to explosive orchestral whirlwind
    // -----------------------------------------------------------------------
    case 'epic-7': {
      const sectionBar = bar % 16;

      // Famous Mountain King Staccato Theme in B Minor:
      // (B - C# - D - E - F# - D - F# | F - C# - F - E - C# - E)
      const mountainTheme = [
        'B3', 'C#4', 'D4', 'E4', 'F#4', 'D4', 'F#4', 'F#4',
        'F4', 'C#4', 'F4', 'E4', 'C#4', 'E4', 'D4', 'B3',
      ];
      const mountainThemeHigh = [
        'B4', 'C#5', 'D5', 'E5', 'F#5', 'D5', 'F#5', 'F#5',
        'F5', 'C#5', 'F5', 'E5', 'C#5', 'E5', 'D5', 'B4',
      ];

      const noteLow = mountainTheme[step % 16];
      const noteHigh = mountainThemeHigh[step % 16];

      // Dynamic Level 1 (Bars 0-3): Tiptoeing Solo Bassoon & Pizzicato Strings (Pianissimo)
      if (sectionBar < 4) {
        if (sub === 0) {
          S.synthOrchestralBassoon(ctx, musicGain, noteLow, time, 0.18, 0.28);
          S.synthStaccatoViolin(ctx, musicGain, noteLow, time, 0.12, 0.18);
        }
        if (beat === 0 && sub === 0) {
          S.synthStadiumTimpani(ctx, musicGain, 'B1', time, 0.24);
        }
      }
      // Dynamic Level 2 (Bars 4-7): Violins & French Horns enter one octave up (Mezzo-Forte)
      else if (sectionBar < 8) {
        if (sub === 0) {
          S.synthStaccatoViolin(ctx, musicGain, noteHigh, time, 0.14, 0.24);
          S.synthFrenchHornFanfare(ctx, musicGain, noteLow, time, 0.22, 0.22);
          S.synthCelloOstinato(ctx, musicGain, 'B1', time, 0.16, 0.28);
        }
        if (sub === 0) S.synthKick(ctx, musicGain, time, 0.35, 1.0);
        if ((beat === 1 || beat === 3) && sub === 0) S.synthSnare(ctx, musicGain, time, 0.28, true);
      }
      // Dynamic Level 3 (Bars 8-11): Full Brass & Strings take over (Forte)
      else if (sectionBar < 12) {
        if (sub === 0) {
          S.synthBaroqueTrumpet(ctx, musicGain, noteHigh, time, 0.18, 0.28);
          S.synthFrenchHornFanfare(ctx, musicGain, noteHigh.replace('5', '4'), time, 0.25, 0.26);
          S.synthStaccatoViolin(ctx, musicGain, noteHigh, time, 0.14, 0.25);
          S.synthCelloOstinato(ctx, musicGain, 'B1', time, 0.18, 0.35);
        }
        if (sub === 0) S.synthKick(ctx, musicGain, time, 0.44, 1.2);
        if ((beat === 1 || beat === 3) && sub === 0) S.synthSnare(ctx, musicGain, time, 0.34, false);
        if (sub === 0 || sub === 2) S.synthTambourine(ctx, musicGain, time, true, 0.14);
      }
      // Dynamic Level 4 (Bars 12-15): Maximum Fortissimo Frenzy & Crashing Cymbals (Tutti Whirlwind)
      else {
        // Double-time staccato intensity
        if (sub === 0 || sub === 2) {
          S.synthBaroqueTrumpet(ctx, musicGain, noteHigh, time, 0.15, 0.3);
          S.synthBrass(ctx, musicGain, [noteHigh, noteLow], time, 0.18, 0.28, true);
          S.synthStaccatoViolin(ctx, musicGain, noteHigh, time, 0.1, 0.28);
          S.synthCelloOstinato(ctx, musicGain, 'B1', time, 0.12, 0.42);
        }
        if (beat === 0 && sub === 0) {
          S.synthStadiumTimpani(ctx, musicGain, 'B1', time, 0.48);
          S.synthCrash(ctx, musicGain, time, 0.42);
        }
        if (sub === 0) S.synthKick(ctx, musicGain, time, 0.48, 1.3);
        if (sub === 2) S.synthSnare(ctx, musicGain, time, 0.38, true);
        if (sub === 0 || sub === 2) S.synthTambourine(ctx, musicGain, time, true, 0.18);
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track 8: "Festival of the Slavic Steppes" • 130 BPM
    // Antonín Dvořák Slavonic Dances-inspired spirited Bohemian orchestral dance
    // Sudden fortissimo bursts, playful staccato woodwinds, syncopated folk energy
    // -----------------------------------------------------------------------
    case 'epic-8': {
      const sectionBar = bar % 16;

      // Bohemian Furiant / Polka Progression: C Major -> A Minor -> F Major -> G Major
      const roots = ['C2', 'A1', 'F1', 'G1'];
      const curRoot = roots[sectionBar % 4];

      // 1. Sudden Dramatic Orchestral Fortissimo Burst (Bar downbeats: piano -> fortissimo)
      if (beat === 0 && sub === 0) {
        S.synthBrass(ctx, musicGain, ['C4', 'E4', 'G4', 'C5'], time, 0.4, 0.32, true);
        S.synthStadiumTimpani(ctx, musicGain, curRoot, time, 0.45);
        if (sectionBar % 4 === 0) S.synthCrash(ctx, musicGain, time, 0.36);
      }

      // 2. Playful Staccato Woodwinds & Xylophone Melody (Slavic dance theme)
      const slavicDanceTheme = ['G5', 'E5', 'C5', 'D5', 'E5', 'F5', 'G5', 'A5'];
      if (sub === 0 || sub === 2) {
        const fluteNote = slavicDanceTheme[(beat * 2 + (sub === 2 ? 1 : 0)) % slavicDanceTheme.length];
        S.synthPanFlute(ctx, musicGain, fluteNote, time, 0.22, 0.25);
        S.synthMarimba(ctx, musicGain, fluteNote, time, 0.18, 0.22);
        S.synthStaccatoViolin(ctx, musicGain, fluteNote, time, 0.14, 0.22);
      }

      // 3. Warm Festive French Horns & Strings (Bars 4-11)
      if (sectionBar >= 4 && sectionBar < 12) {
        if (beat === 2 && sub === 0) {
          S.synthFrenchHornFanfare(ctx, musicGain, 'G4', time, 0.35, 0.26);
        }
        if (beat === 0 && sub === 0) {
          S.synthOrchestralStrings(ctx, musicGain, ['C4', 'E4', 'G4'], time, 1.6, 0.2, true);
        }
      }

      // 4. Bouncing Folk Bass & Syncopated Percussion
      if (sub === 0 || sub === 2) {
        S.synthFmBass(ctx, musicGain, curRoot, time, 0.2, 0.38, 'solid');
      }
      if (sub === 0) S.synthKick(ctx, musicGain, time, 0.42, 1.1);
      if ((beat === 1 || beat === 3) && sub === 0) S.synthSnare(ctx, musicGain, time, 0.34, false);
      if (sub === 0 || sub === 2) S.synthTambourine(ctx, musicGain, time, sub === 2, 0.16);
      break;
    }

    // -----------------------------------------------------------------------
    // Track 9: "Royal Fanfare Rondeau" • 118 BPM
    // Jean-Joseph Mouret Rondeau (Masterpiece Theatre)-inspired baroque fanfare
    // Regal piccolo trumpet solo, crisp ceremonial side drum, noble court majesty
    // -----------------------------------------------------------------------
    case 'epic-9': {
      const sectionBar = bar % 16;

      // Stately Baroque Rondeau Theme in D Major across 16 steps:
      // (D5 - D5 - D5 - F#5 | A5.. F#5 - D5 | G5 - E5 - F#5 - D5 | E5.. A4..)
      const rondeauRefrain = [
        'D5', 'D5', 'D5', 'F#5',
        'A5', 'A5', 'F#5', 'D5',
        'G5', 'E5', 'F#5', 'D5',
        'E5', 'E5', 'A4', 'A4',
      ];
      const rondeauRefrain2 = [
        'D5', 'D5', 'D5', 'F#5',
        'A5', 'A5', 'F#5', 'D5',
        'G5', 'F#5', 'E5', 'A4',
        'D5', 'D5', 'D5', 'D5',
      ];
      const rondeauCouplet = [
        'F#5', 'F#5', 'G5', 'A5',
        'B5', 'A5', 'G5', 'F#5',
        'E5', 'F#5', 'G5', 'E5',
        'F#5', 'F#5', 'E5', 'A4',
      ];

      let currentMelody = rondeauRefrain;
      let rootBass = 'D2';

      if (sectionBar < 4) {
        currentMelody = rondeauRefrain; rootBass = 'D1';
      } else if (sectionBar < 8) {
        currentMelody = rondeauRefrain2; rootBass = 'D1';
      } else if (sectionBar < 12) {
        // Minor Couplet Section (B Minor / A Major)
        currentMelody = rondeauCouplet; rootBass = 'B1';
      } else {
        // Grand Return of the Refrain
        currentMelody = rondeauRefrain2; rootBass = 'D1';
      }

      const trumpNote = currentMelody[step % 16];

      // 1. Brilliant Solo Baroque Piccolo Trumpet Fanfare
      if (sub === 0 || (sub === 2 && beat % 2 === 0)) {
        S.synthBaroqueTrumpet(ctx, musicGain, trumpNote, time, 0.28, 0.32);
        if (sectionBar >= 12) {
          S.synthFrenchHornFanfare(ctx, musicGain, trumpNote.replace('5', '4'), time, 0.35, 0.25);
        }
      }

      // 2. Counterpoint String Orchestra & Cello
      if (beat === 0 && sub === 0) {
        S.synthOrchestralStrings(ctx, musicGain, ['D4', 'F#4', 'A4'], time, 1.8, 0.22, true);
        S.synthCelloOstinato(ctx, musicGain, rootBass, time, 0.4, 0.36);
        S.synthStadiumTimpani(ctx, musicGain, 'D2', time, 0.44);
        if (sectionBar % 8 === 0) S.synthCrash(ctx, musicGain, time, 0.35);
      }
      if (sub === 0 || sub === 2) {
        S.synthCelloOstinato(ctx, musicGain, rootBass, time, 0.18, 0.32);
      }

      // 3. Crisp Ceremonial Side-Drum Rolls
      if (sub === 0) S.synthKick(ctx, musicGain, time, 0.4, 1.1);
      if (sub === 0 || sub === 2) S.synthSnare(ctx, musicGain, time, 0.3, true);
      if (sub === 1 || sub === 3) S.synthSnare(ctx, musicGain, time, 0.18, true);
      break;
    }

    // -----------------------------------------------------------------------
    // Track 10: "Pomp of the Champions" • 104 BPM
    // Edward Elgar Pomp and Circumstance March No. 1 / Trio-inspired processional
    // Noble processional march rhythm opening to grand broad string anthem
    // -----------------------------------------------------------------------
    case 'epic-10': {
      const sectionBar = bar % 16;

      // Elgar "Land of Hope and Glory" / Trio Style Broad Lyrical Theme in G Major:
      // (G4 - A4 - B4 - G4 | E4 - G4 - D4.. | C5 - B4 - A4 - G4 | A4....)
      const elgarTrio = [
        'G4', 'G4', 'A4', 'B4',
        'G4', 'G4', 'E4', 'G4',
        'D4', 'D4', 'E4', 'F#4',
        'G4', 'G4', 'A4', 'A4',
      ];
      const elgarTrio2 = [
        'B4', 'B4', 'C5', 'D5',
        'B4', 'B4', 'G4', 'B4',
        'A4', 'A4', 'G4', 'F#4',
        'G4', 'G4', 'G4', 'G4',
      ];

      const currentMelody = sectionBar % 8 < 4 ? elgarTrio : elgarTrio2;
      const melodyNote = currentMelody[step % 16];

      // Harmonic Foundation: G Major -> C Major -> D7 -> G Major
      const roots = ['G1', 'C2', 'D2', 'G1'];
      const curRoot = roots[sectionBar % 4];

      // Section 1 (Bars 0-3): Ceremonial Processional March Opening
      if (sectionBar < 4) {
        if (sub === 0 || sub === 2) {
          S.synthFrenchHornFanfare(ctx, musicGain, 'G4', time, 0.28, 0.26);
          S.synthCelloOstinato(ctx, musicGain, curRoot, time, 0.2, 0.35);
        }
        if (beat === 0 && sub === 0) {
          S.synthStadiumTimpani(ctx, musicGain, 'G1', time, 0.42);
        }
      }
      // Section 2 (Bars 4-11): Sweeping Broad Legato String & Horn Anthem
      else if (sectionBar < 12) {
        if (sub === 0) {
          S.synthOrchestralStrings(ctx, musicGain, [melodyNote, melodyNote.replace('4', '5')], time, 0.45, 0.26, true);
          S.synthFrenchHornFanfare(ctx, musicGain, melodyNote, time, 0.4, 0.26);
          S.synthConcertPiano(ctx, musicGain, melodyNote, time, 0.5, 0.22, 0.9);
        }
        if (beat === 0 && sub === 0) {
          S.synthOrchestralStrings(ctx, musicGain, ['G4', 'B4', 'D5'], time, 1.8, 0.22, true);
          S.synthStadiumTimpani(ctx, musicGain, curRoot, time, 0.44);
        }
        if (sub === 0 || sub === 2) {
          S.synthFmBass(ctx, musicGain, curRoot, time, 0.24, 0.34, 'solid');
        }
      }
      // Section 3 (Bars 12-15): Grand Fortissimo Tutti Climax with Choir, Full Brass & Timpani
      else {
        if (sub === 0) {
          S.synthBaroqueTrumpet(ctx, musicGain, melodyNote.replace('4', '5'), time, 0.35, 0.3);
          S.synthFrenchHornFanfare(ctx, musicGain, melodyNote, time, 0.45, 0.3);
          S.synthEpicChoirStab(ctx, musicGain, [melodyNote, 'G5', 'B5'], time, 0.55, 0.32, 'ah');
          S.synthConcertPiano(ctx, musicGain, melodyNote, time, 0.55, 0.24, 1.0);
        }
        if (beat === 0 && sub === 0) {
          S.synthOrchestralStrings(ctx, musicGain, ['G4', 'B4', 'D5', 'G5'], time, 1.8, 0.26, true);
          S.synthStadiumTimpani(ctx, musicGain, 'G1', time, 0.48);
          S.synthCrash(ctx, musicGain, time, 0.4);
        }
        if (sub === 0 || sub === 2) {
          S.synthCelloOstinato(ctx, musicGain, curRoot, time, 0.24, 0.42);
        }
      }

      // Crisp Military March Snare & Kick
      if (sub === 0) S.synthKick(ctx, musicGain, time, 0.42, 1.1);
      if ((beat === 1 || beat === 3) && sub === 0) S.synthSnare(ctx, musicGain, time, 0.35, false);
      if (sub === 1 || sub === 3) S.synthSnare(ctx, musicGain, time, 0.16, true);
      if (sub === 0 || sub === 2) S.synthHiHat(ctx, musicGain, time, sub === 2, 0.12);
      break;
    }

    // -----------------------------------------------------------------------
    // Track 11: "Symphony of the Golden Boot" • 130 BPM
    // Dynamic Classical String Capriccio & Brass Fanfare (Vivaldi Storm meets UEFA Champions League)
    // Virtuosic 16th-note violin arpeggios, galloping cello ostinatos, operatic choir & thunderous timpani
    // -----------------------------------------------------------------------
    case 'epic-11': {
      const sectionBar = bar % 16;
      // Vivaldian / Baroque Dramatic Progression: Gm - Cm - F - Bb - Eb - Adim - D7 - Gm
      const roots = ['G1', 'C2', 'F1', 'Bb1', 'Eb2', 'A1', 'D2', 'G1'];
      const curRoot = roots[sectionBar % 8];
      const stringChords = [
        ['G4', 'Bb4', 'D5'],
        ['G4', 'C5', 'Eb5'],
        ['F4', 'A4', 'C5'],
        ['F4', 'Bb4', 'D5'],
        ['G4', 'Bb4', 'Eb5'],
        ['A4', 'C5', 'Eb5'],
        ['F#4', 'A4', 'D5'],
        ['G4', 'Bb4', 'D5'],
      ][sectionBar % 8];

      // 1. Virtuosic Vivaldian 16th-Note Violin Capriccio Arpeggios
      const vivaldiArp = [
        stringChords[0], stringChords[1], stringChords[2], stringChords[1],
        stringChords[2], stringChords[1], stringChords[0], stringChords[1],
      ];
      const arpNote = vivaldiArp[step % vivaldiArp.length];
      S.synthOrchestralStrings(ctx, musicGain, [arpNote], time, 0.14, 0.24, true);

      // 2. Galloping Cello & Double Bass Ostinato
      if (sub === 0 || sub === 2 || (beat % 2 === 1 && sub === 1)) {
        S.synthCelloOstinato(ctx, musicGain, curRoot, time, 0.18, 0.44);
      }

      // 3. Baroque Piccolo Trumpet & French Horn Fanfares in Chorus (Bars >= 8)
      if (sectionBar >= 8 && (beat === 0 || beat === 2) && sub === 0) {
        const brassFanfare = ['D5', 'G5', 'Bb5', 'A5', 'G5', 'F#5', 'G5', 'D5'];
        const bNote = brassFanfare[sectionBar % brassFanfare.length];
        S.synthBaroqueTrumpet(ctx, musicGain, bNote, time, 0.32, 0.3);
        S.synthFrenchHornFanfare(ctx, musicGain, bNote.replace('5', '4'), time, 0.38, 0.28);
      }

      // 4. Operatic Choir Stabs on Key Turnarounds (Bars 7 & 15)
      if ((sectionBar === 7 || sectionBar === 15) && beat === 0 && sub === 0) {
        S.synthEpicChoirStab(ctx, musicGain, ['G4', 'Bb4', 'D5', 'G5'], time, 0.8, 0.36, 'ah');
      }

      // 5. Thunderous Stadium Timpani & Concert Crash
      if (beat === 0 && sub === 0) {
        S.synthStadiumTimpani(ctx, musicGain, curRoot, time, 0.44);
      }
      if ((sectionBar === 7 || sectionBar === 15) && beat === 3 && sub === 0) {
        S.synthCrash(ctx, musicGain, time, 0.42);
      }

      // 6. Side-Drum Snare Pattern
      if (sub === 0) S.synthKick(ctx, musicGain, time, 0.46, 1.15);
      if ((beat === 1 || beat === 3) && sub === 0) S.synthSnare(ctx, musicGain, time, 0.38, false);
      if (sub === 1 || sub === 3) S.synthSnare(ctx, musicGain, time, 0.14, true);
      break;
    }

    // =======================================================================
    // 7. WORLD PLAYLIST — 10 ORIGINAL GLOBAL TOURNAMENT ANTHEMS
    // FIFA World Cup, U-20/U-17 World Cup, Club World Cup, Intercontinental & Finalissima
    // African Djembe, Batucada, Latin Brass, Italian Rock Ballad & Stadium Terrace Chants
    // =======================================================================

    // -----------------------------------------------------------------------
    // Track 1: "Banners of the Earth" • 116 BPM
    // Inspired by K'naan — "Wavin' Flag"
    // Uplifting African-acoustic global anthem with kalimba, acoustic strums & massed choir
    // -----------------------------------------------------------------------
    case 'world-1': {
      const sectionBar = bar % 16;

      // Hope Progression: C Major -> G Major -> A Minor -> F Major
      const roots = ['C2', 'G1', 'A1', 'F1'];
      const curRoot = roots[sectionBar % 4];
      const chords = [
        ['C4', 'E4', 'G4'],
        ['B3', 'D4', 'G4'],
        ['A3', 'C4', 'E4'],
        ['A3', 'C4', 'F4'],
      ][sectionBar % 4];

      // 1. Warm Acoustic Guitar Strums (On downbeat & offbeats)
      if (sub === 0 || sub === 2) {
        S.synthFrenchPopRockGuitar(ctx, musicGain, chords[0], time, 0.22, 0.22, 'clean_strum');
        S.synthFrenchPopRockGuitar(ctx, musicGain, chords[1], time, 0.22, 0.18, 'clean_strum');
      }

      // 2. Sparkling African Kalimba Melody (Hope & Unity motif)
      const kalimbaMotif = [
        'E5', 'G5', 'A5', 'G5', 'E5', 'D5', 'C5', 'D5',
        'E5', 'G5', 'C6', 'B5', 'A5', 'G5', 'E5', 'D5',
      ];
      if (sub === 0 || sub === 2) {
        const kalNote = kalimbaMotif[(beat * 2 + (sub === 2 ? 1 : 0)) % kalimbaMotif.length];
        S.synthWorldKalimba(ctx, musicGain, kalNote, time, 0.32, 0.26);
      }

      // 3. African Djembe Percussion Groove
      // Bass on beat 0, open tone on beat 2, syncopated slaps on 16th upbeat
      if (beat === 0 && sub === 0) S.synthAfricanDjembe(ctx, musicGain, 'bass', time, 0.44);
      if (beat === 2 && sub === 0) S.synthAfricanDjembe(ctx, musicGain, 'tone', time, 0.36);
      if (sub === 3) S.synthAfricanDjembe(ctx, musicGain, 'slap', time, 0.32);
      if (beat === 1 && sub === 2) S.synthAfricanDjembe(ctx, musicGain, 'slap', time, 0.28);

      // 4. Communal Stadium Singalong Choir ("Banners waving under the sky!")
      if (sectionBar >= 8) {
        if (beat === 0 && sub === 0) {
          S.synthStadiumTerraceVocalChant(ctx, musicGain, chords, time, 1.6, 0.32, 'wavin');
          S.synthPadStrings(ctx, musicGain, chords, time, 1.8, 0.16);
        }
      }

      // 5. Solid Acoustic Bass & Stadium Percussion
      if (sub === 0 || sub === 2) {
        S.synthFmBass(ctx, musicGain, curRoot, time, 0.24, 0.36, 'solid');
      }
      if (sub === 0) S.synthKick(ctx, musicGain, time, 0.42, 1.0);
      if ((beat === 1 || beat === 3) && sub === 0) S.synthSnare(ctx, musicGain, time, 0.34, false);
      if (sub === 0 || sub === 2) S.synthShaker(ctx, musicGain, time, 0.14);
      if (sectionBar % 4 === 0 && beat === 0 && sub === 0) S.synthTambourine(ctx, musicGain, time, true, 0.2);
      break;
    }

    // -----------------------------------------------------------------------
    // Track 2: "Sawa Sawa (Time for Glory)" • 128 BPM
    // Inspired by Shakira — "Waka Waka"
    // High-energy Afro-pop World Cup celebration with djembe polyrhythms & dance groove
    // -----------------------------------------------------------------------
    case 'world-2': {
      const sectionBar = bar % 16;

      // Afro-Pop Chord Progression: D Major -> A Major -> B Minor -> G Major
      const roots = ['D2', 'A1', 'B1', 'G1'];
      const curRoot = roots[sectionBar % 4];
      const choirChords = [
        ['D4', 'F#4', 'A4'],
        ['C#4', 'E4', 'A4'],
        ['D4', 'F#4', 'B4'],
        ['D4', 'G4', 'B4'],
      ][sectionBar % 4];

      // 1. High-Energy African Djembe Polyrhythms
      if (sub === 0) S.synthAfricanDjembe(ctx, musicGain, 'bass', time, 0.42);
      if (sub === 2) S.synthAfricanDjembe(ctx, musicGain, 'tone', time, 0.34);
      if (sub === 1 || sub === 3) S.synthAfricanDjembe(ctx, musicGain, 'slap', time, 0.28);

      // 2. Bouncy Marimba & Synth Brass Riff
      const afroRiff = [
        'A5', 'F#5', 'D5', 'F#5', 'A5', 'B5', 'A5', 'F#5',
        'G5', 'E5', 'C#5', 'E5', 'G5', 'A5', 'G5', 'E5',
      ];
      if (sub === 0 || sub === 2) {
        const note = afroRiff[(beat * 2 + (sub === 2 ? 1 : 0)) % afroRiff.length];
        S.synthMarimba(ctx, musicGain, note, time, 0.18, 0.24);
        if (sectionBar >= 8) {
          S.synthBrass(ctx, musicGain, [note], time, 0.2, 0.22, false);
        }
      }

      // 3. Call-and-Response Vocal Chant ("Tsamina mina / Sawa Sawa!")
      if (sectionBar >= 4) {
        if (beat === 0 && sub === 0) {
          S.synthStadiumTerraceVocalChant(ctx, musicGain, choirChords, time, 0.7, 0.3, 'ole');
        }
        if (beat === 2 && sub === 0) {
          S.synthStadiumTerraceVocalChant(ctx, musicGain, choirChords, time, 0.7, 0.28, 'allez');
        }
      }

      // 4. Agogô Bells & Dance Percussion
      if (sub === 0 || sub === 2) S.synthAgogo(ctx, musicGain, sub === 0, time, 0.18);
      if (sub === 0 || sub === 2) S.synthFmBass(ctx, musicGain, curRoot, time, 0.18, 0.42, 'slap');

      if (sub === 0) S.synthKick(ctx, musicGain, time, 0.48, 1.2);
      if ((beat === 1 || beat === 3) && sub === 0) S.synthClap(ctx, musicGain, time, 0.36);
      if (sub === 0 || sub === 2) S.synthHiHat(ctx, musicGain, time, sub === 2, 0.12);
      break;
    }

    // -----------------------------------------------------------------------
    // Track 3: "La Copa Inmortal" • 132 BPM
    // Inspired by Ricky Martin — "La Copa de la Vida"
    // Explosive Latin brass stadium anthem with timbales, congas & "Allez Allez" chants
    // -----------------------------------------------------------------------
    case 'world-3': {
      const sectionBar = bar % 16;

      // Latin Stadium Progression: Am -> F -> C -> G (Chorus: Am -> F -> Dm -> E7)
      const isChorus = sectionBar >= 8;
      const roots = isChorus ? ['A1', 'F1', 'D2', 'E2'] : ['A1', 'F1', 'C2', 'G1'];
      const curRoot = roots[sectionBar % 4];

      // 1. Blazing Latin Trumpet & Horn Fanfare
      const brassHook = [
        'E5', 'A5', 'C6', 'B5', 'A5', 'E5', 'F5', 'G5',
        'A5', 'C6', 'E6', 'D6', 'C6', 'B5', 'A5', 'B5',
      ];
      if (sub === 0 || (sub === 2 && beat % 2 === 0)) {
        const trumpNote = brassHook[(beat * 2 + (sub === 2 ? 1 : 0)) % brassHook.length];
        S.synthBaroqueTrumpet(ctx, musicGain, trumpNote, time, 0.24, 0.32);
        S.synthFrenchHornFanfare(ctx, musicGain, trumpNote.replace('6', '5').replace('5', '4'), time, 0.28, 0.24);
      }

      // 2. Sizzling Latin Timbales & Cascara Side Shells
      if (sub === 0 || sub === 2 || sub === 3) {
        S.synthLatinTimbales(ctx, musicGain, 'high', true, time, 0.24);
      }
      if (beat === 3 && sub === 2) {
        S.synthLatinTimbales(ctx, musicGain, 'high', false, time, 0.38); // Timbale rimshot
      }

      // 3. Congas & Stadium "Allez Allez" Chants
      if (sub === 0 || sub === 2) S.synthConga(ctx, musicGain, sub === 0, sub === 2, time, 0.28);

      if (isChorus) {
        if (beat === 0 && sub === 0) {
          S.synthStadiumTerraceVocalChant(ctx, musicGain, ['A4', 'C5', 'E5'], time, 0.9, 0.34, 'allez');
        }
        if (beat === 2 && sub === 0) {
          S.synthStadiumTerraceVocalChant(ctx, musicGain, ['G4', 'B4', 'D5'], time, 0.9, 0.32, 'ole');
        }
      }

      // 4. Driving Latin Slap Bass & Drums
      if (sub === 0 || sub === 2) S.synthFmBass(ctx, musicGain, curRoot, time, 0.18, 0.42, 'slap');
      if (sub === 0) S.synthKick(ctx, musicGain, time, 0.48, 1.2);
      if ((beat === 1 || beat === 3) && sub === 0) S.synthSnare(ctx, musicGain, time, 0.36, true);
      if (sub === 0 || sub === 2) S.synthHiHat(ctx, musicGain, time, sub === 2, 0.14);
      break;
    }

    // -----------------------------------------------------------------------
    // Track 4: "Carnaval de la Cancha" • 104 BPM
    // Inspired by Shakira — "Hips Don't Lie"
    // Hypnotic Latin stadium groove with syncopated trumpet hooks & cumbia-reggaeton sub bass
    // -----------------------------------------------------------------------
    case 'world-4': {
      const sectionBar = bar % 16;

      // Tropical Pop Progression: B Minor -> G Major -> D Major -> A Major
      const roots = ['B1', 'G1', 'D2', 'A1'];
      const curRoot = roots[sectionBar % 4];

      // 1. Hypnotic Syncopated Latin Trumpet Hook
      const latinTrumpet = [
        'F#5', 'B5', 'D6', 'C#6', 'B5', 'A5', 'F#5', 'G5',
        'A5', 'D6', 'F#6', 'E6', 'D6', 'C#6', 'B5', 'C#6',
      ];
      if (sub === 0 || sub === 3) {
        const trumpNote = latinTrumpet[(beat * 2 + (sub === 3 ? 1 : 0)) % latinTrumpet.length];
        S.synthBaroqueTrumpet(ctx, musicGain, trumpNote, time, 0.22, 0.28);
        S.synthFrenchPopRockGuitar(ctx, musicGain, trumpNote.replace('6', '5'), time, 0.2, 0.22, 'clean_strum');
      }

      // 2. Güiro Scrapes & Timbale Rim Accents
      if (sub === 0 || sub === 2) S.synthGuiro(ctx, musicGain, sub === 0, time, 0.22);
      if (beat === 1 && sub === 3) S.synthLatinTimbales(ctx, musicGain, 'high', false, time, 0.32);
      if (beat === 3 && sub === 3) S.synthLatinTimbales(ctx, musicGain, 'low', false, time, 0.3);

      // 3. Rolling 808 / FM Sub Bass Groove (Dembow syncopation: Beat 0, Beat 1 sub 3, Beat 2 sub 2)
      if (sub === 0) S.synthSubBass808(ctx, musicGain, curRoot, time, 0.38, 0.44);
      if (beat === 1 && sub === 3) S.synthSubBass808(ctx, musicGain, curRoot, time, 0.25, 0.38);
      if (beat === 3 && sub === 0) S.synthSubBass808(ctx, musicGain, curRoot, time, 0.28, 0.4);

      // 4. Playful Festival Chants & Percussion
      if (sectionBar >= 8 && beat === 2 && sub === 0) {
        S.synthStadiumTerraceVocalChant(ctx, musicGain, ['D5', 'F#5', 'A5'], time, 0.6, 0.28, 'ole');
      }

      if (sub === 0) S.synthKick(ctx, musicGain, time, 0.46, 1.1);
      if ((beat === 1 || beat === 3) && sub === 0) S.synthSnare(ctx, musicGain, time, 0.34, true);
      if (sub === 0 || sub === 2) S.synthShaker(ctx, musicGain, time, 0.12);
      break;
    }

    // -----------------------------------------------------------------------
    // Track 5: "Stunde des Mutes" • 120 BPM
    // Inspired by Herbert Grönemeyer — "Zeit, dass sich was dreht"
    // Emotional German stadium pop-rock anthem with driving synth power & collective pride
    // -----------------------------------------------------------------------
    case 'world-5': {
      const sectionBar = bar % 16;

      // Anthemic Momentum Progression: E Minor -> C Major -> G Major -> D Major
      const roots = ['E1', 'C2', 'G1', 'D2'];
      const curRoot = roots[sectionBar % 4];
      const chords = [
        ['E4', 'G4', 'B4'],
        ['E4', 'G4', 'C5'],
        ['D4', 'G4', 'B4'],
        ['D4', 'F#4', 'A4'],
      ][sectionBar % 4];

      // 1. Driving 16th-Note Synth-Rock Power Arpeggios (Grönemeyer momentum)
      const arpNotes = [chords[0], chords[1], chords[2], chords[1]];
      const curArp = arpNotes[step % 4];
      S.synthGermanAnthemSynthRock(ctx, musicGain, [curArp], time, 0.14, 0.26);

      // 2. Powerful Overdrive Rhythm Guitar Power Chords (Bars 4+)
      if (sectionBar >= 4 && (sub === 0 || sub === 2)) {
        S.synthFrenchPopRockGuitar(ctx, musicGain, chords[0], time, 0.24, 0.28, 'riff');
      }

      // 3. Soaring Stadium Singalong Choir of Collective Determination
      if (sectionBar >= 8) {
        if (beat === 0 && sub === 0) {
          S.synthStadiumTerraceVocalChant(ctx, musicGain, chords, time, 1.6, 0.34, 'italia');
          S.synthPadStrings(ctx, musicGain, chords, time, 1.8, 0.2);
        }
        // Singing Melodic Lead Guitar Hook
        if (sub === 0) {
          const leadTheme = ['B4', 'D5', 'E5', 'G5', 'F#5', 'E5', 'D5', 'B4'];
          S.synthItalianRockLeadGuitar(ctx, musicGain, leadTheme[beat % leadTheme.length], time, 0.38, 0.28, true);
        }
      }

      // 4. Thundering Stadium Drums & Rock Bass
      if (sub === 0 || sub === 2) S.synthFmBass(ctx, musicGain, curRoot, time, 0.22, 0.4, 'solid');
      if (sub === 0) S.synthKick(ctx, musicGain, time, 0.48, 1.2);
      if ((beat === 1 || beat === 3) && sub === 0) S.synthSnare(ctx, musicGain, time, 0.38, false);
      if (sub === 0 || sub === 2) S.synthHiHat(ctx, musicGain, time, sub === 2, 0.14);
      if (sectionBar % 4 === 0 && beat === 0 && sub === 0) S.synthCrash(ctx, musicGain, time, 0.36);
      break;
    }

    // -----------------------------------------------------------------------
    // Track 6: "One Sky, One Goal" • 126 BPM
    // Inspired by "We Are One"
    // Multinational stadium dance-pop & Brazilian batucada with universal chorus
    // -----------------------------------------------------------------------
    case 'world-6': {
      const sectionBar = bar % 16;

      // Universal Dance Progression: F Major -> C Major -> D Minor -> Bb Major
      const roots = ['F1', 'C2', 'D2', 'Bb1'];
      const curRoot = roots[sectionBar % 4];
      const choirChords = [
        ['F4', 'A4', 'C5'],
        ['E4', 'G4', 'C5'],
        ['F4', 'A4', 'D5'],
        ['F4', 'Bb4', 'D5'],
      ][sectionBar % 4];

      // 1. Brazilian Batucada Surdo Bass Pulse & Repinique Rolls
      if (sub === 0) S.synthBatucadaSurdo(ctx, musicGain, curRoot, time, false, 0.44);
      if (sub === 2) S.synthBatucadaSurdo(ctx, musicGain, curRoot, time, true, 0.32);
      if (sub === 1 || sub === 3) S.synthBatucadaRepinique(ctx, musicGain, time, sub === 3, 0.26);

      // 2. Euphoric Eurodance Synth Lead & Drop
      const danceHook = [
        'A5', 'C6', 'F6', 'E6', 'D6', 'C6', 'Bb5', 'A5',
        'G5', 'C6', 'E6', 'D6', 'C6', 'B5', 'A5', 'G5',
      ];
      if (sub === 0 || sub === 2) {
        const lead = danceHook[(beat * 2 + (sub === 2 ? 1 : 0)) % danceHook.length];
        S.synthSquare(ctx, musicGain, lead, time, 0.2, 0.24, 'sawtooth');
        S.synthBrass(ctx, musicGain, [lead], time, 0.18, 0.2, false);
      }

      // 3. Multinational Singalong Chorus ("One World, One Flag, We Are One!")
      if (sectionBar >= 8) {
        if (beat === 0 && sub === 0) {
          S.synthStadiumTerraceVocalChant(ctx, musicGain, choirChords, time, 1.4, 0.32, 'ole');
        }
        if (beat === 2 && sub === 0) {
          S.synthStadiumTerraceVocalChant(ctx, musicGain, choirChords, time, 1.2, 0.3, 'allez');
        }
      }

      // 4. Four-on-the-Floor Stadium Pop Drums & Claps
      if (sub === 0) S.synthKick(ctx, musicGain, time, 0.48, 1.25);
      if ((beat === 1 || beat === 3) && sub === 0) S.synthClap(ctx, musicGain, time, 0.38);
      if (sub === 2) S.synthHiHat(ctx, musicGain, time, true, 0.14);
      break;
    }

    // -----------------------------------------------------------------------
    // Track 7: "Canto do Maracanã" • 128 BPM
    // Inspired by Shakira & Carlinhos Brown — "La La La"
    // High-energy Brazilian electro-batucada with rapid repinique rolls & chant hooks
    // -----------------------------------------------------------------------
    case 'world-7': {
      const sectionBar = bar % 16;

      // High-Voltage Samba Progression: G Minor -> Eb Major -> Bb Major -> F Major
      const roots = ['G1', 'Eb1', 'Bb1', 'F1'];
      const curRoot = roots[sectionBar % 4];

      // 1. Rapid Brazilian Batucada Percussion Engine
      if (sub === 0) S.synthBatucadaSurdo(ctx, musicGain, curRoot, time, false, 0.46);
      if (sub === 2) S.synthBatucadaSurdo(ctx, musicGain, curRoot, time, true, 0.34);
      // Repinique 16th-note continuous festival rolls
      S.synthBatucadaRepinique(ctx, musicGain, time, sub === 0 || sub === 3, 0.28);
      if (sub === 0 || sub === 2) S.synthAgogo(ctx, musicGain, sub === 0, time, 0.2);

      // 2. Electro-Batucada Synth Bassline & Horn Stabs
      if (sub === 0 || sub === 2) S.synthFmBass(ctx, musicGain, curRoot, time, 0.16, 0.44, 'slap');

      // 3. Catchy "La La La" Stadium Chant Riff
      const lalaRiff = [
        'D5', 'G5', 'Bb5', 'A5', 'G5', 'D5', 'F5', 'G5',
        'Eb5', 'G5', 'Bb5', 'C6', 'Bb5', 'A5', 'G5', 'F5',
      ];
      if (sub === 0 || sub === 2) {
        const chantNote = lalaRiff[(beat * 2 + (sub === 2 ? 1 : 0)) % lalaRiff.length];
        S.synthBrass(ctx, musicGain, [chantNote], time, 0.18, 0.26, true);
        if (sectionBar >= 4 && (beat === 0 || beat === 2) && sub === 0) {
          S.synthStadiumTerraceVocalChant(ctx, musicGain, [chantNote, 'D5'], time, 0.6, 0.3, 'allez');
        }
      }

      // 4. Pumping Festival Drums
      if (sub === 0) S.synthKick(ctx, musicGain, time, 0.48, 1.3);
      if ((beat === 1 || beat === 3) && sub === 0) S.synthSnare(ctx, musicGain, time, 0.36, true);
      if (sub === 0 || sub === 2) S.synthTambourine(ctx, musicGain, time, true, 0.16);
      break;
    }

    // -----------------------------------------------------------------------
    // Track 8: "Forza Campioni (Dai Dai Dai!)" • 130 BPM
    // Inspired by "Dai Dai" / Italian Football Terrace Culture
    // Playful, rhythmic terrace chant with accordion bounce, brass fanfares & handclaps
    // -----------------------------------------------------------------------
    case 'world-8': {
      const sectionBar = bar % 16;

      // Infectious Italian Terrace Progression: C Major -> F Major -> G Major -> C Major
      const roots = ['C2', 'F1', 'G1', 'C2'];
      const curRoot = roots[sectionBar % 4];
      const chords = [
        ['C4', 'E4', 'G4'],
        ['C4', 'F4', 'A4'],
        ['B3', 'D4', 'G4'],
        ['C4', 'E4', 'G4'],
      ][sectionBar % 4];

      // 1. Rhythmic Terrace Handclaps ON EVERY BEAT (Stadium crowd clapping)
      if (sub === 0) S.synthClap(ctx, musicGain, time, 0.35);

      // 2. Bouncing Accordion / Organ Chords (Italian stadium flavor)
      if (sub === 0 || sub === 2) {
        chords.forEach((note) => {
          S.synthAccordion(ctx, musicGain, note, time, 0.18, 0.16);
        });
        S.synthOrgan(ctx, musicGain, chords[0], time, 0.2, 0.18);
      }

      // 3. Irresistible "Dai Dai Dai!" Terrace Vocal Singalong
      // Step Pattern: "Dai! Dai! Dai! Forza Campioni!"
      if (sectionBar >= 4) {
        if (beat === 0 && sub === 0) {
          S.synthStadiumTerraceVocalChant(ctx, musicGain, ['G4', 'C5', 'E5'], time, 0.5, 0.34, 'italia');
        }
        if (beat === 1 && sub === 0) {
          S.synthStadiumTerraceVocalChant(ctx, musicGain, ['G4', 'C5', 'E5'], time, 0.5, 0.34, 'italia');
        }
        if (beat === 2 && sub === 0) {
          S.synthStadiumTerraceVocalChant(ctx, musicGain, ['G4', 'C5', 'E5'], time, 0.5, 0.36, 'italia');
        }
        if (beat === 3 && sub === 0) {
          S.synthStadiumTerraceVocalChant(ctx, musicGain, ['A4', 'C5', 'F5'], time, 0.5, 0.36, 'ole');
        }
      }

      // 4. Energetic Brass Fanfare & Mediterranean Pop Bass
      if (sectionBar >= 8 && (sub === 0 || sub === 2)) {
        const brassRiff = ['E5', 'G5', 'C6', 'E6', 'D6', 'C6', 'B5', 'G5'];
        S.synthBaroqueTrumpet(ctx, musicGain, brassRiff[(beat * 2 + (sub === 2 ? 1 : 0)) % brassRiff.length], time, 0.22, 0.28);
      }

      if (sub === 0 || sub === 2) S.synthFmBass(ctx, musicGain, curRoot, time, 0.18, 0.38, 'solid');
      if (sub === 0) S.synthKick(ctx, musicGain, time, 0.44, 1.1);
      if ((beat === 1 || beat === 3) && sub === 0) S.synthSnare(ctx, musicGain, time, 0.32, false);
      break;
    }

    // -----------------------------------------------------------------------
    // Track 9: "Notti Magiche di Gloria" • 114 BPM
    // Inspired by Gianna Nannini & Edoardo Bennato — "Un'estate italiana" (Italia 90)
    // Emotional 1990s Italian World Cup rock ballad with singing guitar solo & stadium build
    // -----------------------------------------------------------------------
    case 'world-9': {
      const sectionBar = bar % 16;

      // Nostalgic Summer Anthem Progression: G Major -> D Major -> E Minor -> C Major
      const roots = ['G1', 'D2', 'E1', 'C2'];
      const curRoot = roots[sectionBar % 4];
      const chords = [
        ['G4', 'B4', 'D5'],
        ['F#4', 'A4', 'D5'],
        ['G4', 'B4', 'E5'],
        ['G4', 'C5', 'E5'],
      ][sectionBar % 4];

      // 1. Vintage 1980s/90s Synth Pads & Concert Grand Piano Chords
      if (beat === 0 && sub === 0) {
        S.synthPadStrings(ctx, musicGain, chords, time, 1.8, 0.22);
        S.synthConcertPiano(ctx, musicGain, chords[0], time, 1.6, 0.28, 0.9);
      }

      // 2. Emotional Singing Overdrive Electric Guitar Solos (Italia 90 nostalgia)
      const guitarTheme = [
        'B4', 'D5', 'G5', 'A5', 'B5', 'A5', 'G5', 'D5',
        'E5', 'G5', 'C6', 'B5', 'A5', 'G5', 'E5', 'D5',
      ];
      if (sub === 0 || (sub === 2 && beat % 2 === 0)) {
        const gNote = guitarTheme[(beat * 2 + (sub === 2 ? 1 : 0)) % guitarTheme.length];
        S.synthItalianRockLeadGuitar(ctx, musicGain, gNote, time, 0.38, 0.3, true);
      }

      // 3. Goosebump-Inducing Grand Stadium Chorus (Bars 8-15)
      if (sectionBar >= 8) {
        if (beat === 0 && sub === 0) {
          S.synthStadiumTerraceVocalChant(ctx, musicGain, chords, time, 1.6, 0.36, 'italia');
          S.synthCrash(ctx, musicGain, time, 0.36);
        }
        if (beat === 2 && sub === 0) {
          S.synthStadiumTerraceVocalChant(ctx, musicGain, chords, time, 1.2, 0.32, 'italia');
        }
      }

      // 4. Powerful 90s Rock Drums & Deep Bassline
      if (sub === 0 || sub === 2) S.synthFmBass(ctx, musicGain, curRoot, time, 0.22, 0.4, 'solid');
      if (sub === 0) S.synthKick(ctx, musicGain, time, 0.46, 1.15);
      if ((beat === 1 || beat === 3) && sub === 0) S.synthSnare(ctx, musicGain, time, 0.36, false);
      if (sub === 0 || sub === 2) S.synthHiHat(ctx, musicGain, time, sub === 2, 0.12);
      break;
    }

    // -----------------------------------------------------------------------
    // Track 10: "Mama Dunia (Rise as One)" • 118 BPM
    // Inspired by Akon — "Oh Africa"
    // African pop & global choral anthem with kalimba intro, djembe & massed choir climax
    // -----------------------------------------------------------------------
    case 'world-10': {
      const sectionBar = bar % 16;

      // Inspirational Global Progression: A Major -> F# Minor -> D Major -> E Major
      const roots = ['A1', 'F#1', 'D2', 'E2'];
      const curRoot = roots[sectionBar % 4];
      const choirChords = [
        ['A4', 'C#5', 'E5'],
        ['A4', 'C#5', 'F#5'],
        ['A4', 'D5', 'F#5'],
        ['G#4', 'B4', 'E5'],
      ][sectionBar % 4];

      // 1. Sparkling African Kalimba & Marimba Intro / Interlude
      const kalimbaMelody = [
        'C#5', 'E5', 'A5', 'B5', 'A5', 'F#5', 'E5', 'C#5',
        'D5', 'F#5', 'A5', 'C#6', 'B5', 'A5', 'G#5', 'E5',
      ];
      if (sub === 0 || sub === 2) {
        const kalNote = kalimbaMelody[(beat * 2 + (sub === 2 ? 1 : 0)) % kalimbaMelody.length];
        S.synthWorldKalimba(ctx, musicGain, kalNote, time, 0.3, 0.25);
        S.synthMarimba(ctx, musicGain, kalNote, time, 0.2, 0.2);
      }

      // 2. Organic African Djembe Grooves & Shakers
      if (sub === 0) S.synthAfricanDjembe(ctx, musicGain, 'bass', time, 0.44);
      if (sub === 2) S.synthAfricanDjembe(ctx, musicGain, 'tone', time, 0.34);
      if (sub === 1 || sub === 3) S.synthAfricanDjembe(ctx, musicGain, 'slap', time, 0.28);
      if (sub === 0 || sub === 2) S.synthShaker(ctx, musicGain, time, 0.14);

      // 3. Uplifting Mass Choir Climax ("Rise as one, children of the sun!")
      if (sectionBar >= 8) {
        if (beat === 0 && sub === 0) {
          S.synthEpicChoirStab(ctx, musicGain, choirChords, time, 1.6, 0.34, 'ah');
          S.synthPadStrings(ctx, musicGain, choirChords, time, 1.8, 0.18);
        }
        if (beat === 2 && sub === 0) {
          S.synthStadiumTerraceVocalChant(ctx, musicGain, choirChords, time, 1.2, 0.32, 'ole');
        }
      }

      // 4. Modern Pop Production, Deep Sub Bass & Drums
      if (sub === 0) S.synthSubBass808(ctx, musicGain, curRoot, time, 0.42, 0.44);
      if (sub === 0) S.synthKick(ctx, musicGain, time, 0.48, 1.2);
      if ((beat === 1 || beat === 3) && sub === 0) S.synthSnare(ctx, musicGain, time, 0.36, false);
      if (sub === 0 || sub === 2) S.synthHiHat(ctx, musicGain, time, sub === 2, 0.12);
      if (sectionBar % 8 === 0 && beat === 0 && sub === 0) S.synthCrash(ctx, musicGain, time, 0.38);
      break;
    }

    // =======================================================================
    // 8. MAIN MENU & INTRO — 16-BIT CINEMATIC ANTHEM ("Legend Awaits")
    // =======================================================================
    case 'track-intro': {
      // "Legend Awaits" • 116 BPM • Epic SNES / 16-Bit Console Soundtrack
      // Progression: Dm (bars 0-3), Bb (bars 4-7), F (bars 8-11), C (bars 12-15)
      const sectionBar = bar % 16;
      const roots = sectionBar < 4 ? 'D2' : sectionBar < 8 ? 'Bb1' : sectionBar < 12 ? 'F1' : 'C2';
      const chords =
        sectionBar < 4
          ? ['D4', 'F4', 'A4']
          : sectionBar < 8
          ? ['D4', 'F4', 'Bb4']
          : sectionBar < 12
          ? ['C4', 'F4', 'A4']
          : ['C4', 'E4', 'G4'];

      // Lush SNES Strings Bed
      if (beat === 0 && sub === 0) {
        S.synthPadStrings(ctx, musicGain, chords, time, 2.2, 0.18);
      }

      // Genesis FM Bass Pulse (Starts on bar 2)
      if (bar >= 2 && (sub === 0 || sub === 2)) {
        S.synthFmBass(ctx, musicGain, roots, time, 0.22, 0.4, 'solid');
      }

      // Warm FM E-Piano / Bell Counterpoint (Bars 4+)
      if (bar >= 4 && (sub === 0 || sub === 3)) {
        const epNotes = ['A4', 'D5', 'F5', 'A5', 'G5', 'F5', 'E5', 'D5'];
        S.synthFmPiano(ctx, musicGain, epNotes[(step % 8)], time, 0.26, 0.18);
      }

      // Soaring 16-Bit Synth Lead & Brass Fanfare (Bars 8+)
      if (bar >= 8 && (sub === 0 || (sub === 2 && beat % 2 === 1))) {
        const introTheme = [
          'D5', 'F5', 'A5', 'D6',
          'C6', 'A5', 'G5', 'A5',
          'Bb5', 'D6', 'F6', 'G6',
          'F6', 'E6', 'D6', 'C6'
        ];
        const lead = introTheme[(Math.floor(step / 2)) % introTheme.length];
        S.synthBrass(ctx, musicGain, [lead], time, 0.28, 0.24, false);
      }

      // 16-Bit Studio Drums (Kick enters bar 4, Snare enters bar 8)
      if (bar >= 4 && sub === 0) {
        S.synthKick(ctx, musicGain, time, 0.48);
      }
      if (bar >= 8 && (beat === 1 || beat === 3) && sub === 0) {
        S.synthSnare(ctx, musicGain, time, 0.38);
      }
      if (bar >= 6 && (sub === 0 || sub === 2)) {
        S.synthHiHat(ctx, musicGain, time, sub === 2, 0.1);
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track 11: "Heart of the Global Game" • 126 BPM
    // Global Fusion Electronic Anthem (Kygo / Afrojack tropical house meets World Cup stadium brass)
    // African log drum / marimba riffs, warm analog brass fanfare, uplifting plucks, stadium chorus & four-on-the-floor
    // -----------------------------------------------------------------------
    case 'world-11': {
      const sectionBar = bar % 16;
      // Uplifting Global Anthem Cadence: F - C - Dm - Bb (bars 0-7), Bb - C - Dm - F (bars 8-15)
      const roots = sectionBar < 8 ? ['F1', 'C2', 'D2', 'Bb1'] : ['Bb1', 'C2', 'D2', 'F1'];
      const curRoot = roots[sectionBar % 4];
      const triads = [
        ['F4', 'A4', 'C5'],
        ['E4', 'G4', 'C5'],
        ['F4', 'A4', 'D5'],
        ['F4', 'Bb4', 'D5'],
      ][sectionBar % 4];

      // 1. Tropical / African Wooden Log Drum & Marimba Arpeggios
      const marimbaPattern = [
        'A4', 'C5', 'F5', 'A5', 'G5', 'E5', 'C5', 'G4',
        'F4', 'A4', 'D5', 'F5', 'E5', 'D5', 'Bb4', 'F4',
      ];
      const mNote = marimbaPattern[step % marimbaPattern.length];
      if (sub === 0 || sub === 2) {
        S.synthMarimba(ctx, musicGain, mNote, time, 0.16, 0.28);
      }

      // 2. Warm Stadium Brass & Analog Synth Lead (Uplifting Global Trophy Theme)
      if (sectionBar >= 4) {
        const globalLead = [
          'C5', 'F5', 'G5', 'A5', 'C6', 'A5', 'G5', 'F5',
          'G5', 'A5', 'C6', 'D6', 'C6', 'A5', 'F5', 'G5',
          'F5', 'A5', 'C6', 'D6', 'F6', 'D6', 'C6', 'A5',
          'Bb5', 'A5', 'G5', 'F5', 'G5', 'A5', 'G5', 'F5',
        ];
        const stepIdx = (sectionBar % 4) * 8 + (beat * 2 + Math.floor(sub / 2));
        const leadNote = globalLead[stepIdx % globalLead.length];
        if (sub === 0 || sub === 2) {
          S.synthBrass(ctx, musicGain, [leadNote], time, 0.28, 0.26, false);
          S.synthWarmAnalogLead(ctx, musicGain, leadNote, time, 0.28, 0.22, false);
        }
      }

      // 3. Deep 808 Sub-Bass & Punchy FM Bass
      if (sub === 0 || (sub === 2 && beat % 2 === 1)) {
        S.synthFmBass(ctx, musicGain, curRoot, time, 0.18, 0.44, 'solid');
      }

      // 4. Global Stadium Drums (4-on-the-floor kick, explosive clap, African djembe & shaker)
      if (sub === 0) {
        S.synthKick(ctx, musicGain, time, 0.54, 1.2);
      }
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synthSnare(ctx, musicGain, time, 0.44);
        S.synthClap(ctx, musicGain, time, 0.36);
      }
      if (sub === 2) {
        S.synthHiHat(ctx, musicGain, time, true, 0.14);
      }
      S.synthShaker(ctx, musicGain, time, 0.1);

      // 5. Global Stadium Vocal Harmony in Chorus (Bars >= 8)
      if (sectionBar >= 8 && (beat === 0 || beat === 2) && sub === 0) {
        S.synthStadiumTerraceVocalChant(ctx, musicGain, triads, time, 0.7, 0.28, 'ole');
      }

      // 6. Section Transition Timpani & Whistle
      if ((sectionBar === 7 || sectionBar === 15) && beat === 3 && sub === 0) {
        S.synthStadiumTimpani(ctx, musicGain, 'F1', time, 0.42);
        S.synthWhistle(ctx, musicGain, 'F5', time, 0.28);
        S.synthCrash(ctx, musicGain, time, 0.4);
      }
      break;
    }

    // =======================================================================
    // FINALS SOUNDTRACKS (Inspired by "Wheel of Destiny" epic style)
    // Continental finals retain the classic original 'epic-4' (Wheel of Destiny).
    // Each other final features a unique, distinct harmonic identity, custom
    // chord progressions, varied rhythms, and signature national instrumentation.
    // =======================================================================

    // -----------------------------------------------------------------------
    // Track: "Crown of the Titans (World Final)" • world-final • 128 BPM
    // Universal World Championship: Gm -> Eb -> Bb -> F/D7 Heroic Progression
    // Global poly-percussion: Djembe, Timbales, Kalimba, Timpani & Massed Choirs
    // -----------------------------------------------------------------------
    case 'world-final': {
      const sectionBar = bar % 16;
      let choirChord: string[] = ['G4', 'Bb4', 'D5', 'G5'];
      let rootBass = 'G1';

      if (sectionBar < 4) {
        // Gm: G - Bb - D - G
        choirChord = ['G4', 'Bb4', 'D5', 'G5']; rootBass = 'G1';
      } else if (sectionBar < 8) {
        // Ebmaj7: Eb - G - Bb - D
        choirChord = ['G4', 'Bb4', 'D5', 'Eb5']; rootBass = 'Eb1';
      } else if (sectionBar < 12) {
        // Bb: F - Bb - D - F
        choirChord = ['F4', 'Bb4', 'D5', 'F5']; rootBass = 'Bb1';
      } else {
        // D7 / F#dim: F# - A - C - D
        choirChord = ['F#4', 'A4', 'C5', 'D5']; rootBass = 'D1';
      }

      // 1. Thunderous Universal Pulse: Timpani + Kick on beat 0
      if (sub === 0) {
        S.synthStadiumTimpani(ctx, musicGain, rootBass.replace('1', '2'), time, 0.48);
        S.synthKick(ctx, musicGain, time, 0.48, 1.3);
      }

      // 2. African Djembe Polyrhythms
      if (beat === 0 && sub === 0) S.synthAfricanDjembe(ctx, musicGain, 'bass', time, 0.44);
      if (beat === 1 && sub === 2) S.synthAfricanDjembe(ctx, musicGain, 'slap', time, 0.35);
      if (beat === 2 && sub === 1) S.synthAfricanDjembe(ctx, musicGain, 'tone', time, 0.32);
      if (beat === 3 && sub === 0) S.synthAfricanDjembe(ctx, musicGain, 'slap', time, 0.38);

      // 3. Latin Timbales & Cascara Accents
      if (sub === 1 || sub === 3) S.synthLatinTimbales(ctx, musicGain, 'high', true, time, 0.22);
      if ((beat === 1 || beat === 3) && sub === 0) S.synthLatinTimbales(ctx, musicGain, 'high', false, time, 0.32);

      // 4. Mystical World Kalimba Ostinato (Heroic Gm modal scale)
      const kalimbaArp = ['G4', 'Bb4', 'D5', 'G5', 'Eb5', 'G5', 'Bb5', 'Eb6', 'D5', 'F5', 'Bb5', 'D6', 'C5', 'F#5', 'A5', 'D6'];
      S.synthWorldKalimba(ctx, musicGain, kalimbaArp[step % kalimbaArp.length], time, 0.22, 0.22);

      // 5. Heavy Cataclysmic World Choir Chants & Heraldic Brass
      if (sectionBar < 4 || sectionBar >= 12) {
        if (beat === 0 && sub === 0) {
          S.synthEpicChoirStab(ctx, musicGain, choirChord, time, 1.6, 0.38, 'oh');
          S.synthCrash(ctx, musicGain, time, 0.44);
        }
        if (beat === 2 && sub === 0) {
          S.synthEpicChoirStab(ctx, musicGain, choirChord, time, 1.2, 0.34, 'ah');
        }
        if (sub === 0) {
          S.synthBrass(ctx, musicGain, [rootBass === 'G1' ? 'G4' : 'D4'], time, 0.28, 0.3, true);
        }
      } else {
        const titanMotif = ['G4', 'A4', 'Bb4', 'C5', 'Bb4', 'A4', 'G4', 'F#4'];
        S.synthStaccatoViolin(ctx, musicGain, titanMotif[step % titanMotif.length], time, 0.1, 0.24);
        S.synthCelloOstinato(ctx, musicGain, rootBass, time, 0.14, 0.36);
        if (sub === 0 || sub === 2) {
          S.synthEpicChoirStab(ctx, musicGain, choirChord, time, 0.22, 0.24, 'eh');
        }
      }

      // 6. Snare March
      if (sub === 0 || sub === 2) S.synthSnare(ctx, musicGain, time, 0.32, true);
      break;
    }

    // -----------------------------------------------------------------------
    // Track: "Lords of Wembley (British Cup Final)" • eng-final • 128 BPM
    // British Anthem Rock: Am -> F -> C -> G / E7 Stadium Chords
    // High-gain punk overdrive guitars, live rock kit, roaring terrace chorus
    // -----------------------------------------------------------------------
    case 'eng-final': {
      const sectionBar = bar % 16;
      let rootBass = 'A1';
      let rNote = 'A2';
      let fNote = 'E3';
      let oNote = 'A3';

      if (sectionBar < 4) {
        // Am
        rootBass = 'A1'; rNote = 'A2'; fNote = 'E3'; oNote = 'A3';
      } else if (sectionBar < 8) {
        // F
        rootBass = 'F1'; rNote = 'F2'; fNote = 'C3'; oNote = 'F3';
      } else if (sectionBar < 12) {
        // C
        rootBass = 'C2'; rNote = 'C3'; fNote = 'G3'; oNote = 'C4';
      } else {
        // G with E7 turnaround on bar 15
        if (sectionBar === 15) {
          rootBass = 'E1'; rNote = 'E2'; fNote = 'B2'; oNote = 'E3';
        } else {
          rootBass = 'G1'; rNote = 'G2'; fNote = 'D3'; oNote = 'G3';
        }
      }

      // 1. Timpani & Driving Rock Kick
      if (sub === 0) {
        S.synthStadiumTimpani(ctx, musicGain, rootBass.replace('1', '2'), time, 0.44);
        S.synthKick(ctx, musicGain, time, 0.52, 1.25);
      }

      // 2. High-Gain Punk Rock Distorted Power Chords
      if (sub === 0 || sub === 2) {
        S.synthPunkGuitarOverdrive(ctx, musicGain, rNote, fNote, oNote, time, 0.24, 0.34);
      }

      // 3. British Stadium Terrace Vocal Chants ("Oi! Oi! Wembley!")
      if ((beat === 0 || beat === 2) && sub === 0) {
        S.synthStadiumTerraceVocalChant(ctx, musicGain, [rNote, fNote, oNote], time, 0.65, 0.3, 'ole');
      }

      // 4. Symphonic Brass Fanfare on Bar Starts
      if (beat === 0 && sub === 0) {
        S.synthBrass(ctx, musicGain, [rNote, fNote, oNote], time, 0.8, 0.36, true);
        S.synthCrash(ctx, musicGain, time, 0.44);
      }

      // 5. Driving Rock Snare & Hi-Hat
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synthSnare(ctx, musicGain, time, 0.44, true);
      }
      if (sub === 0 || sub === 2) S.synthHiHat(ctx, musicGain, time, sub === 2, 0.14);
      break;
    }

    // -----------------------------------------------------------------------
    // Track: "Duelo Real (Copa del Rey Final)" • esp-final • 128 BPM
    // Spanish Flamenco-Paso Doble: Am -> G -> F -> E7 Andalusian Cadence
    // Rapid nylon rasgueado, castanets, heraldic dual-trumpet fanfares
    // -----------------------------------------------------------------------
    case 'esp-final': {
      const sectionBar = bar % 16;
      let rootBass = 'A1';
      let chordNotes = ['A4', 'C5', 'E5'];
      let soloTrumpet = 'E5';

      if (sectionBar < 4) {
        // Am
        rootBass = 'A1'; chordNotes = ['A4', 'C5', 'E5']; soloTrumpet = 'E5';
      } else if (sectionBar < 8) {
        // G
        rootBass = 'G1'; chordNotes = ['G4', 'B4', 'D5']; soloTrumpet = 'D5';
      } else if (sectionBar < 12) {
        // F
        rootBass = 'F1'; chordNotes = ['F4', 'A4', 'C5']; soloTrumpet = 'C5';
      } else {
        // E7 (Phrygian Dominant)
        rootBass = 'E1'; chordNotes = ['E4', 'G#4', 'B4', 'E5']; soloTrumpet = 'B4';
      }

      // 1. Galloping Timpani & March Kick
      if (sub === 0) {
        S.synthStadiumTimpani(ctx, musicGain, rootBass.replace('1', '2'), time, 0.46);
        S.synthKick(ctx, musicGain, time, 0.46);
      }

      // 2. Flamenco Nylon Guitar Rasgueado Arpeggio (Continuous 16th spanish strums)
      const nylonNote = chordNotes[step % chordNotes.length];
      S.synthNylonGuitar(ctx, musicGain, nylonNote, time, 0.16, 0.28);

      // 3. Paso Doble Heraldic Trumpet Solo (Bars 4-11)
      if (sectionBar >= 4 && sectionBar < 12 && (beat === 0 || beat === 2) && sub === 0) {
        S.synthTrumpetSolo(ctx, musicGain, soloTrumpet, time, 0.5, 0.34);
      }

      // 4. Dramatic Epic Choir Stabs (Carmina Burana style)
      if ((beat === 0 || beat === 2) && sub === 0) {
        S.synthEpicChoirStab(ctx, musicGain, chordNotes, time, 0.8, 0.32, 'ah');
      }

      // 5. Spanish March Snare & Castanet Clicks
      if (sub === 0 || sub === 2) S.synthSnare(ctx, musicGain, time, 0.32, true);
      if (sub === 1 || sub === 3) S.synthLatinTimbales(ctx, musicGain, 'high', true, time, 0.24);
      break;
    }

    // -----------------------------------------------------------------------
    // Track: "Sturm der Götter (Berliner Finale)" • ger-final • 128 BPM
    // Teutonic Industrial Synth-Rock: Cm -> Ab -> Eb -> Bb / G7
    // Relentless 16th electronic synth bass, gated 80s snare, Wagnerian brass
    // -----------------------------------------------------------------------
    case 'ger-final': {
      const sectionBar = bar % 16;
      let rootBass = 'C1';
      let chordNotes = ['C4', 'Eb4', 'G4', 'C5'];

      if (sectionBar < 4) {
        // Cm
        rootBass = 'C1'; chordNotes = ['C4', 'Eb4', 'G4', 'C5'];
      } else if (sectionBar < 8) {
        // Ab
        rootBass = 'Ab0'; chordNotes = ['C4', 'Eb4', 'Ab4', 'C5'];
      } else if (sectionBar < 12) {
        // Eb
        rootBass = 'Eb1'; chordNotes = ['Bb3', 'Eb4', 'G4', 'Bb4'];
      } else {
        // Bb / G7 turnaround
        rootBass = sectionBar === 15 ? 'G1' : 'Bb0';
        chordNotes = sectionBar === 15 ? ['B3', 'D4', 'F4', 'G4'] : ['Bb3', 'D4', 'F4', 'Bb4'];
      }

      // 1. Heavy Industrial Timpani & Electronic Kick
      if (sub === 0) {
        S.synthStadiumTimpani(ctx, musicGain, rootBass.replace('0', '1').replace('1', '2'), time, 0.5);
        S.synthKick(ctx, musicGain, time, 0.54, 1.4);
      }

      // 2. Relentless German Anthem Synth-Rock Power Drive
      S.synthGermanAnthemSynthRock(ctx, musicGain, [chordNotes[step % chordNotes.length]], time, 0.14, 0.28);

      // 3. Apocalyptic Choir & Wagnerian Heavy Brass Hits
      if ((beat === 0 || beat === 2) && sub === 0) {
        S.synthEpicChoirStab(ctx, musicGain, chordNotes, time, 0.9, 0.35, 'oh');
        S.synthBrass(ctx, musicGain, [chordNotes[0], chordNotes[2]], time, 0.45, 0.32, true);
      }

      // 4. Industrial 80s Gated Snare on 2 and 4
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synth80sGatedSnare(ctx, musicGain, time, 0.44);
      }
      if (sub === 0 || sub === 2) S.synthHiHat(ctx, musicGain, time, sub === 2, 0.12);
      break;
    }

    // -----------------------------------------------------------------------
    // Track: "Notte di Gloria (Coppa Italia Final)" • ita-final • 128 BPM
    // Italian Grand Operatic Rock: Gm -> Cm -> Eb -> D7
    // Concert piano arpeggios, operatic tenor climax, soaring lead guitar
    // -----------------------------------------------------------------------
    case 'ita-final': {
      const sectionBar = bar % 16;
      let rootBass = 'G1';
      let chordNotes = ['G4', 'Bb4', 'D5'];
      let tenorNote = 'D5';

      if (sectionBar < 4) {
        // Gm
        rootBass = 'G1'; chordNotes = ['G4', 'Bb4', 'D5']; tenorNote = 'D5';
      } else if (sectionBar < 8) {
        // Cm
        rootBass = 'C2'; chordNotes = ['G4', 'C5', 'Eb5']; tenorNote = 'Eb5';
      } else if (sectionBar < 12) {
        // Eb
        rootBass = 'Eb1'; chordNotes = ['G4', 'Bb4', 'Eb5']; tenorNote = 'G5';
      } else {
        // D7 (Major dominant climax)
        rootBass = 'D1'; chordNotes = ['F#4', 'A4', 'C5', 'D5']; tenorNote = 'F#5';
      }

      // 1. Timpani & Resonant Kick
      if (sub === 0) {
        S.synthStadiumTimpani(ctx, musicGain, rootBass.replace('1', '2'), time, 0.48);
        S.synthKick(ctx, musicGain, time, 0.46);
      }

      // 2. Grand Italian Concert Piano Arpeggio
      if (sub === 0 || sub === 2) {
        chordNotes.forEach((n) => S.synthConcertPiano(ctx, musicGain, n, time, 0.32, 0.26));
      }

      // 3. Soaring Operatic Tenor Vocals ("Nessun Dorma" grand Italian climax)
      if (beat === 0 && sub === 0) {
        S.synthItalianVocal(ctx, musicGain, tenorNote, time, 1.4, 0.38, 'ah', true);
        S.synthCrash(ctx, musicGain, time, 0.42);
      }

      // 4. Singing Italian Rock Lead Guitar (Bars 4-11)
      if (sectionBar >= 4 && sectionBar < 12 && sub === 0) {
        const leadScale = ['G4', 'A4', 'Bb4', 'D5', 'C5', 'Bb4', 'A4', 'F#4'];
        S.synthItalianRockLeadGuitar(ctx, musicGain, leadScale[step % leadScale.length], time, 0.28, 0.28);
      }

      // 5. Orchestral Snare & Dramatic Choir Stabs
      if (sub === 0 || sub === 2) S.synthSnare(ctx, musicGain, time, 0.34, true);
      break;
    }

    // -----------------------------------------------------------------------
    // Track: "Le Sacre de Saint-Denis (Coupe de France Final)" • fra-final • 128 BPM
    // French Touch Electro-Symphonic: Fm -> Db -> Bbm -> C7
    // Distinct from upbeat nu-disco roulette: grand, high-stakes electro-drama!
    // Filtered funk bass, French horn fanfares, chic disco keys & choir
    // -----------------------------------------------------------------------
    case 'fra-final': {
      const sectionBar = bar % 16;
      let rootBass = 'F1';
      let chordNotes = ['F4', 'Ab4', 'C5', 'F5'];

      if (sectionBar < 4) {
        // Fm
        rootBass = 'F1'; chordNotes = ['F4', 'Ab4', 'C5', 'F5'];
      } else if (sectionBar < 8) {
        // Dbmaj7
        rootBass = 'Db1'; chordNotes = ['F4', 'Ab4', 'C5', 'Db5'];
      } else if (sectionBar < 12) {
        // Bbm
        rootBass = 'Bb1'; chordNotes = ['F4', 'Bb4', 'Db5', 'F5'];
      } else {
        // C7 (French symphonic cadence)
        rootBass = 'C1'; chordNotes = ['E4', 'G4', 'Bb4', 'C5'];
      }

      // 1. Timpani & Club-Ready Kick
      if (sub === 0) {
        S.synthStadiumTimpani(ctx, musicGain, rootBass.replace('1', '2'), time, 0.46);
        S.synthKick(ctx, musicGain, time, 0.5);
      }

      // 2. Filtered French Touch Bass Groove
      const filterCut = 750 + Math.sin((step / 16) * Math.PI * 2) * 450;
      S.synthFrenchTouchFilterBass(ctx, musicGain, rootBass.replace('1', '2'), time, 0.18, 0.4, filterCut);

      // 3. Majestic French Horn Fanfares & Dramatic Choir
      if (beat === 0 && sub === 0) {
        S.synthFrenchHornFanfare(ctx, musicGain, chordNotes[0], time, 1.2, 0.36);
        S.synthEpicChoirStab(ctx, musicGain, chordNotes, time, 1.2, 0.32, 'oh');
      }

      // 4. Parisian Electro Keyboard Stabs
      if (sub === 1 || sub === 3) {
        S.synthDiscoHouseKeys(ctx, musicGain, chordNotes, time, 0.16, 0.24);
      }

      // 5. Snare & Hi-Hat
      if ((beat === 1 || beat === 3) && sub === 0) S.synthSnare(ctx, musicGain, time, 0.38);
      if (sub === 2) S.synthHiHat(ctx, musicGain, time, true, 0.14);
      break;
    }

    // -----------------------------------------------------------------------
    // Track: "O Soberano do Maracanã (Copa do Brasil Final)" • br-final • 128 BPM
    // Brazilian Carnival Samba-Enredo: Bm -> G -> D -> A / F#7
    // Thunderous Surdo, Repinique rolls, Cavaquinho, jubilant carnival brass
    // -----------------------------------------------------------------------
    case 'br-final': {
      const sectionBar = bar % 16;
      let rootBass = 'B1';
      let triad = ['B3', 'D4', 'F#4'];

      if (sectionBar < 4) {
        // Bm
        rootBass = 'B1'; triad = ['B3', 'D4', 'F#4'];
      } else if (sectionBar < 8) {
        // G
        rootBass = 'G1'; triad = ['B3', 'D4', 'G4'];
      } else if (sectionBar < 12) {
        // D
        rootBass = 'D2'; triad = ['A3', 'D4', 'F#4'];
      } else {
        // A / F#7 turnaround
        rootBass = sectionBar === 15 ? 'F#1' : 'A1';
        triad = sectionBar === 15 ? ['A#3', 'C#4', 'E4'] : ['A3', 'C#4', 'E4'];
      }

      // 1. Heavy Surdo Pulses & Stadium Timpani
      if (sub === 0) {
        S.synthStadiumTimpani(ctx, musicGain, rootBass.replace('1', '2'), time, 0.46);
        S.synthBatucadaSurdo(ctx, musicGain, rootBass.replace('1', '2'), time, false, 0.52);
      }
      if (sub === 2) {
        S.synthBatucadaSurdo(ctx, musicGain, rootBass.replace('1', '2'), time, true, 0.36);
      }

      // 2. Rapid Repinique Rolls & Agogô Bells
      S.synthBatucadaRepinique(ctx, musicGain, time, sub === 0 || sub === 3, 0.28);
      if (sub === 0 || sub === 2) S.synthAgogo(ctx, musicGain, sub === 0, time, 0.22);

      // 3. Cavaquinho Samba Strumming
      if (sub === 1 || sub === 3) {
        S.synthCavaquinho(ctx, musicGain, triad[0], time, 0.14, 0.24);
        S.synthCavaquinho(ctx, musicGain, triad[2], time, 0.14, 0.22);
      }

      // 4. Monumental Choir Chants & Carnival Brass
      if ((beat === 0 || beat === 2) && sub === 0) {
        S.synthEpicChoirStab(ctx, musicGain, triad, time, 0.9, 0.34, 'ah');
        S.synthBrass(ctx, musicGain, [triad[0], triad[1]], time, 0.38, 0.3, true);
      }
      break;
    }

    // -----------------------------------------------------------------------
    // Track: "Furia Monumental (Copa Argentina Final)" • arg-final • 128 BPM
    // Argentine Tango-Rock Epic: Bm -> Em -> A -> F#7
    // Expressive bandoneón solos, bombo legüero, electric guitar, tablón chants
    // -----------------------------------------------------------------------
    case 'arg-final': {
      const sectionBar = bar % 16;
      let rootBass = 'B1';
      let chordNotes = ['B3', 'D4', 'F#4'];

      if (sectionBar < 4) {
        // Bm
        rootBass = 'B1'; chordNotes = ['B3', 'D4', 'F#4'];
      } else if (sectionBar < 8) {
        // Em
        rootBass = 'E1'; chordNotes = ['B3', 'E4', 'G4'];
      } else if (sectionBar < 12) {
        // A
        rootBass = 'A1'; chordNotes = ['A3', 'C#4', 'E4'];
      } else {
        // F#7 (Tango Cadence)
        rootBass = 'F#1'; chordNotes = ['A#3', 'C#4', 'E4', 'F#4'];
      }

      // 1. Bombo Legüero & Timpani Beats
      if (sub === 0) {
        S.synthStadiumTimpani(ctx, musicGain, rootBass.replace('1', '2'), time, 0.5);
        S.synthKick(ctx, musicGain, time, 0.48);
      }

      // 2. Soulful & Dramatic Bandoneón Melodies
      if (sub === 0 || sub === 2) {
        const bandoneonNote = chordNotes[step % chordNotes.length];
        S.synthBandoneonExpressive(ctx, musicGain, bandoneonNote, time, 0.24, 0.32, true);
      }

      // 3. Tablón Stadium Terrace Vocal Chants ("Vamos vamos!")
      if ((beat === 0 || beat === 2) && sub === 0) {
        S.synthStadiumTerraceVocalChant(ctx, musicGain, chordNotes, time, 0.7, 0.32, 'ole');
        S.synthEpicChoirStab(ctx, musicGain, chordNotes, time, 0.9, 0.32, 'oh');
      }

      // 4. Electric Guitar Rock Accent
      if (sectionBar >= 4 && sectionBar < 12 && sub === 1) {
        S.synthElectricGuitar(ctx, musicGain, chordNotes[0], time, 0.2, 0.24, 'lead');
      }

      // 5. Snare & Cymbal
      if ((beat === 1 || beat === 3) && sub === 0) S.synthSnare(ctx, musicGain, time, 0.38, true);
      break;
    }

    // -----------------------------------------------------------------------
    // Track: "O Conquistador do Jamor (Taça de Portugal Final)" • por-final • 128 BPM
    // Lusitanian Fado-Kuduro Clash: Em -> C -> Am -> B7
    // 12-string Portuguese guitar arpeggios, Kuduro stabs, symphonic brass & choir
    // -----------------------------------------------------------------------
    case 'por-final': {
      const sectionBar = bar % 16;
      let rootBass = 'E1';
      let chordNotes = ['E4', 'G4', 'B4'];

      if (sectionBar < 4) {
        // Em
        rootBass = 'E1'; chordNotes = ['E4', 'G4', 'B4'];
      } else if (sectionBar < 8) {
        // C
        rootBass = 'C2'; chordNotes = ['E4', 'G4', 'C5'];
      } else if (sectionBar < 12) {
        // Am
        rootBass = 'A1'; chordNotes = ['E4', 'A4', 'C5'];
      } else {
        // B7 (Phrygian / Harmonic Minor Dominant)
        rootBass = 'B1'; chordNotes = ['D#4', 'F#4', 'A4', 'B4'];
      }

      // 1. Timpani & Heavy Kick
      if (sub === 0) {
        S.synthStadiumTimpani(ctx, musicGain, rootBass.replace('1', '2'), time, 0.48);
        S.synthKick(ctx, musicGain, time, 0.5);
      }

      // 2. Ringing 12-String Portuguese Guitar Fado Arpeggio
      const pNote = chordNotes[step % chordNotes.length];
      S.synthPortugueseGuitar(ctx, musicGain, pNote, time, 0.2, 0.28);

      // 3. Lusophone Kuduro Electronic Stabs
      if ((beat === 1 || beat === 3) && sub === 2) {
        S.synthKuduroStab(ctx, musicGain, chordNotes[0], time, 0.15, 0.3);
      }

      // 4. Soaring Atlantic Symphonic Brass & Choir
      if (beat === 0 && sub === 0) {
        S.synthBrass(ctx, musicGain, chordNotes, time, 0.8, 0.34, true);
        S.synthEpicChoirStab(ctx, musicGain, chordNotes, time, 1.2, 0.34, 'ah');
      }

      // 5. March Snare
      if (sub === 0 || sub === 2) S.synthSnare(ctx, musicGain, time, 0.34, true);
      break;
    }

    // -----------------------------------------------------------------------
    // Track: "Taj Al-Dhahab (King Cup Final)" • sau-final • 128 BPM
    // Arabian Bayati Royal Anthem: D Bayati -> Gm -> Eb -> A7
    // Ceremonial drums, authentic Bayati oud, Khaleeji handclaps, royal brass
    // -----------------------------------------------------------------------
    case 'sau-final': {
      const sectionBar = bar % 16;
      let rootBass = 'D1';
      let chordNotes = ['D4', 'F4', 'A4'];
      const oudScale = ['D4', 'Eb4', 'F4', 'G4', 'A4', 'Bb4', 'C#5', 'D5'];

      if (sectionBar < 4) {
        // D Bayati
        rootBass = 'D1'; chordNotes = ['D4', 'F4', 'A4'];
      } else if (sectionBar < 8) {
        // Gm
        rootBass = 'G1'; chordNotes = ['D4', 'G4', 'Bb4'];
      } else if (sectionBar < 12) {
        // Eb
        rootBass = 'Eb1'; chordNotes = ['Eb4', 'G4', 'Bb4'];
      } else {
        // A7 (Royal cadence)
        rootBass = 'A1'; chordNotes = ['C#4', 'E4', 'G4', 'A4'];
      }

      // 1. Ceremonial Timpani & Darbuka Doum
      if (sub === 0) {
        S.synthStadiumTimpani(ctx, musicGain, rootBass.replace('1', '2'), time, 0.48);
        S.synthKick(ctx, musicGain, time, 0.48);
        S.synthDarbuka(ctx, musicGain, 'doum', time, 0.48);
      }

      // 2. Traditional Darbuka Tek/Ka Rhythms
      if (beat === 1 && sub === 2) S.synthDarbuka(ctx, musicGain, 'tek', time, 0.36);
      if (beat === 3 && sub === 1) S.synthDarbuka(ctx, musicGain, 'ka', time, 0.34);

      // 3. Collective Khaleeji Handclaps on Syncopated 16ths
      if ((beat === 1 || beat === 3) && sub === 0) {
        S.synthKhaleejiClap(ctx, musicGain, time, 0.38);
      }

      // 4. Acoustic Bayati Oud Solo Ornamentation
      if (sub === 0 || sub === 2) {
        const oNote = oudScale[step % oudScale.length];
        S.synthOud(ctx, musicGain, oNote, time, 0.25, 0.3);
      }

      // 5. Royal Brass & Apocalyptic Epic Choir
      if (beat === 0 && sub === 0) {
        S.synthBrass(ctx, musicGain, chordNotes, time, 0.75, 0.34, true);
        S.synthEpicChoirStab(ctx, musicGain, chordNotes, time, 1.2, 0.34, 'oh');
      }

      // 6. Snare March
      if (sub === 0 || sub === 2) S.synthSnare(ctx, musicGain, time, 0.34, true);
      break;
    }

    default: {
      // Fallback 16-bit groove
      const roots = ['A1', 'F1', 'C2', 'G1'];
      S.synthFmBass(ctx, musicGain, roots[bar % 4], time, 0.18, 0.38, 'solid');
      if (sub === 0) S.synthKick(ctx, musicGain, time, 0.44);
      if ((beat === 1 || beat === 3) && sub === 0) S.synthSnare(ctx, musicGain, time, 0.36);
      break;
    }
  }
}
