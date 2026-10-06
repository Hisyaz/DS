// ========================================================================
// FOOTBALL CAREER SIMULATOR - 16-BIT SUPER SOUNDTRACK PLAYLIST SYSTEM
// Authentic 16-Bit Super Nintendo (SNES) & Sega Genesis / FM Synthesis Engine
// Multi-Layered Polyphony, Lush String Beds, FM Slap Bass, & Rich Percussion
// ========================================================================

export type PlaylistId =
  | 'germany'
  | 'italy'
  | 'france'
  | 'spain'
  | 'brazil'
  | 'argentina'
  | 'england'
  | 'portugal'
  | 'saudi'
  | 'continental'
  | 'world'
  | 'intro';

export interface SoundtrackTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  playlistId: PlaylistId;
  bpm: number;
  bars: number;
  durationSeconds: number;
  description: string;
  isFinalOnly?: boolean;
}

export interface PlaylistInfo {
  id: PlaylistId;
  name: string;
  countryOrRegion: string;
  flag: string;
  styleDescription: string;
  usedFor: string[];
  colorHex: string;
  tracks: SoundtrackTrack[];
}

export const TRACK_MAX_DURATION_SECONDS = 150; // 2 minutes and 30 seconds auto-cycle

export type SoundtrackPlaybackMode = 'immersive' | 'play_all';


export const ALL_PLAYLISTS: Record<PlaylistId, PlaylistInfo> = {
  germany: {
    id: 'germany',
    name: 'Germany',
    countryOrRegion: 'Germany',
    flag: '🇩🇪',
    styleDescription: 'Original German football soundtrack: Industrial metal, Neue Deutsche Welle 80s synth-pop, space electronics, stadium hard rock, techno rave & soaring emotional rock ballads',
    usedFor: [
      'German 1st Division (Bundesliga)',
      'German 2nd Division (2. Bundesliga)',
      'DFB-Pokal',
      'DFL-Supercup',
      'German Youth Leagues & Academies',
    ],
    colorHex: '#d20515',
    tracks: [
      {
        id: 'ger-1',
        title: 'Maschinentakt',
        artist: 'Stahlwerk Ensemble',
        genre: 'Industrial Metal',
        playlistId: 'germany',
        bpm: 125,
        bars: 64,
        durationSeconds: 150,
        description: 'Industrial metal inspired by heavy mechanical percussion, aggressive stomping kick/snare groove, dark gritty FM bass, syncopated distorted power chords, and relentless German industrial drive.',
      },
      {
        id: 'ger-2',
        title: 'Neon Träume über Berlin',
        artist: 'Neue Welle Kollektiv',
        genre: 'Neue Deutsche Welle / 80s Synth-Pop',
        playlistId: 'germany',
        bpm: 142,
        bars: 72,
        durationSeconds: 150,
        description: 'Neue Deutsche Welle 1980s synth-pop with catchy electronic rhythm, bouncy bass, bright retro synth hooks, energetic analog pads, and sparkling matchday energy.',
      },
      {
        id: 'ger-3',
        title: 'Schwerelos im Kosmos',
        artist: 'Orbit 80s Studio',
        genre: 'Retro-Futuristic Synth-Pop',
        playlistId: 'germany',
        bpm: 128,
        bars: 64,
        durationSeconds: 150,
        description: 'Retro-futuristic German synth-pop with driving 16th-note electronic bass sequence, spacey synth leads, arpeggiated cosmic pads, and a soaring melodic chorus.',
      },
      {
        id: 'ger-4',
        title: 'Sturm der Sieger',
        artist: 'Hannover Rock Brigade',
        genre: 'German Stadium Hard Rock',
        playlistId: 'germany',
        bpm: 126,
        bars: 64,
        durationSeconds: 150,
        description: 'German hard rock anthem with powerful overdriven electric guitar riffs, screaming melodic leads, driving arena drums, and colossal stadium championship energy.',
      },
      {
        id: 'ger-5',
        title: 'Hyper Arena Rave',
        artist: 'Hamburg Eurodance Project',
        genre: 'German Rave / Eurodance',
        playlistId: 'germany',
        bpm: 160,
        bars: 80,
        durationSeconds: 150,
        description: 'Fast, high-energy 90s German club eurodance and rave with rolling 16th bassline, euphoric synth stabs, rapid hi-hats, and an unstoppable party stadium atmosphere.',
      },
      {
        id: 'ger-6',
        title: 'Wind der Freiheit',
        artist: 'Symphonie des Friedens',
        genre: 'Emotional German Rock Ballad',
        playlistId: 'germany',
        bpm: 76,
        bars: 40,
        durationSeconds: 150,
        description: 'Emotional German rock ballad with atmospheric acoustic guitars, expressive melodic whistling lead, soaring harmonized rock guitar chorus, and reflective stadium contrast.',
      },
      {
        id: 'ger-7',
        title: 'Klang der Südtribüne',
        artist: 'Ruhrpott Hymnenwerk',
        genre: 'German Symphonic Stadium Rock / Brass & Choral Anthem',
        playlistId: 'germany',
        bpm: 118,
        bars: 64,
        durationSeconds: 150,
        description: 'Passionate German stadium anthem blending powerful brass fanfares, driving rock tempo, melodic electric guitar leads, syncopated power chords, and massed terrace harmonies capturing the legendary wall of noise on matchday.',
      },
      {
        id: 'ger-final',
        title: 'Sturm der Götter (Berliner Finale)',
        artist: 'Berliner Kraft & Symphonie',
        genre: 'German Industrial Synth-Rock & Wagnerian Orchestral Power',
        playlistId: 'germany',
        bpm: 128,
        bars: 64,
        durationSeconds: 150,
        description: 'Colossal German Cup Final anthem inspired by the epic style of Wheel of Destiny, driving with relentless 16th electronic synth bass, Wagnerian brass fanfares, industrial stadium rock power, and soaring vocal choir.',
        isFinalOnly: true,
      },
    ],
  },
  italy: {
    id: 'italy',
    name: 'Italy',
    countryOrRegion: 'Italy',
    flag: '🇮🇹',
    styleDescription: 'Original Italian football soundtrack: Italia 90 anthems, classic songwriting, Bocelli-style grandeur, Sunday matchday pop & cinematic championship epics',
    usedFor: [
      'Italian 1st Division (Serie A)',
      'Italian 2nd Division (Serie B)',
      'Coppa Italia',
      'Supercoppa Italiana',
      'Milan & Rome Youth Leagues',
    ],
    colorHex: '#0284c7',
    tracks: [
      {
        id: 'ita-1',
        title: 'Notti Azzurre',
        artist: 'Azzurri Sound Project',
        genre: 'Italian Football Anthem / Pop-Rock',
        playlistId: 'italy',
        bpm: 130,
        bars: 66,
        durationSeconds: 150,
        description: 'Italia 90-inspired football anthem with energetic Italian pop-rock, warm analog synths, electric guitar riffs, stadium percussion, and a huge melodic chorus capturing the summer World Cup atmosphere.',
      },
      {
        id: 'ita-2',
        title: 'Nastro Rosa',
        artist: 'Cantautori Ensemble',
        genre: 'Italian Classic Songwriting / Ballad',
        playlistId: 'italy',
        bpm: 96,
        bars: 50,
        durationSeconds: 150,
        description: 'Emotional Italian songwriting inspired by classic ballads with warm acoustic guitar fingerpicking, soft electric guitar touches, acoustic piano, and intimate, romantic, nostalgic melodic phrasing.',
      },
      {
        id: 'ita-3',
        title: 'Voce del Cuore',
        artist: 'Orchestra Sinfonica e Tenore',
        genre: 'Classical/Pop Crossover',
        playlistId: 'italy',
        bpm: 78,
        bars: 42,
        durationSeconds: 150,
        description: 'Emotional classical/pop crossover in the Andrea Bocelli tradition with delicate grand piano, lush orchestral string swells, expressive Italian vocal/tenor lines, and a gradual cinematic crescendo for major football moments.',
      },
      {
        id: 'ita-4',
        title: 'Domenica Italiana',
        artist: 'Milano Pop Collective',
        genre: 'Italian Pop & Matchday Groove',
        playlistId: 'italy',
        bpm: 118,
        bars: 60,
        durationSeconds: 150,
        description: 'Joyful Sunday football atmosphere with modern production, interlocking acoustic and electric guitars, bright piano, live-feeling drums, melodic bass, and sunny Italian city pre-match vibes.',
      },
      {
        id: 'ita-5',
        title: 'La Notte dei Campioni',
        artist: 'Filarmonica e Coro di Roma',
        genre: 'Epic Championship Symphony',
        playlistId: 'italy',
        bpm: 124,
        bars: 64,
        durationSeconds: 150,
        description: 'The biggest cinematic anthem in the playlist: full orchestra, stadium percussion, analog synths, soaring electric guitar, and operatic-inspired vocal layers building from an intimate opening into a colossal title-deciding finale.',
      },
      {
        id: 'ita-6',
        title: 'Stella di San Siro',
        artist: 'Milano Discoteca Stadio',
        genre: 'Classic Italo-Disco & Stadium Synth-Pop',
        playlistId: 'italy',
        bpm: 122,
        bars: 64,
        durationSeconds: 150,
        description: 'Iconic 1980s Italo-Disco celebration featuring pulsating arpeggiated basslines, shimmering polyphonic synth brass, sparkling FM bell hooks, live-feeling four-on-the-floor kick, and an intoxicating Mediterranean stadium melody.',
      },
      {
        id: 'ita-final',
        title: 'Notte di Gloria (Coppa Italia Final)',
        artist: 'Orchestra & Coro Olimpico di Roma',
        genre: 'Italian Operatic Symphonic & Italo-Dramatic Climax',
        playlistId: 'italy',
        bpm: 128,
        bars: 64,
        durationSeconds: 150,
        description: 'Monumental Italian Cup Final anthem inspired by the epic style of Wheel of Destiny, combining grand concert piano arpeggios, soaring operatic tenors, dramatic Italian violin tremolos, and sweeping Italo-rock crescendo.',
        isFinalOnly: true,
      },
    ],
  },
  france: {
    id: 'france',
    name: 'France',
    countryOrRegion: 'France',
    flag: '🇫🇷',
    styleDescription: 'Original French Football Soundtrack: French House, Club Electro-Pop, Stromae-inspired Pop, Night Drive Synthwave & 1980s Pop-Rock',
    usedFor: [
      'French 1st Division',
      'French 2nd Division',
      'Paris Youth League',
      'French Domestic Cups',
    ],
    colorHex: '#0055A5',
    tracks: [
      {
        id: 'fra-1',
        title: 'Révolution Hexagone',
        artist: 'Le Club Électronique',
        genre: 'French House / Hypnotic Robotic Groove',
        playlistId: 'france',
        bpm: 124,
        bars: 64,
        durationSeconds: 124,
        description: 'Hypnotic French house groove with four-on-the-floor kick, funk-inspired walking bassline, filtered disco synth chords, talkbox vocoder textures, and an evolving stadium dancefloor build.',
      },
      {
        id: 'fra-2',
        title: 'Nuit Triomphale',
        artist: 'Stade & Lumières',
        genre: 'French Club / Electro-Pop',
        playlistId: 'france',
        bpm: 130,
        bars: 68,
        durationSeconds: 126,
        description: 'High-energy French club celebration anthem with powerful electronic drums, festival synth stabs, pumping bass, dynamic drops, and ecstatic European nightlife victory euphoria.',
      },
      {
        id: 'fra-3',
        title: 'Alors On Marque',
        artist: 'Métrique Parisienne',
        genre: 'French Electronic Pop / Melancholic Groove',
        playlistId: 'france',
        bpm: 120,
        bars: 64,
        durationSeconds: 128,
        description: 'Minimalist French electronic pop with clever syncopated bass, rhythmic vocal phrasing, melancholic brass undertones beneath an energetic beat, and a hypnotic crowd-singing chorus.',
      },
      {
        id: 'fra-4',
        title: 'Périphérique Minuit',
        artist: 'Boulevard Noir',
        genre: 'French Synthwave / Night Drive',
        playlistId: 'france',
        bpm: 105,
        bars: 54,
        durationSeconds: 124,
        description: 'Dark 1980s-inspired French synthwave with deep electronic bass, analog neon pads, gated retro drums, and mysterious Parisian night highway atmosphere after a late match.',
      },
      {
        id: 'fra-5',
        title: 'Quand le Stade S’Allume',
        artist: 'Génération Virage',
        genre: '1980s French Pop-Rock Anthem',
        playlistId: 'france',
        bpm: 118,
        bars: 60,
        durationSeconds: 122,
        description: 'Nostalgic 1980s French pop-rock football anthem with warm live drums, melodic electric guitar riffs, expressive French vocal phrasing, and an uplifting stadium sing-along chorus.',
      },
      {
        id: 'fra-6',
        title: 'Boulevard des Étoiles',
        artist: 'Montmartre Funk Syndicate',
        genre: 'French Touch Nu-Disco & Stadium Funk',
        playlistId: 'france',
        bpm: 116,
        bars: 60,
        durationSeconds: 150,
        description: 'Smooth, infectious French Touch nu-disco groove with slinky slap bass, filtered funk guitar chops, sparkling electric piano chords, upbeat brass accents, and an effortlessly chic Parisian stadium swagger.',
      },
      {
        id: 'fra-roulette',
        title: 'Le maître de la roulette',
        artist: 'Vaudeville Club & Les Bleus All-Stars',
        genre: 'Nu-Disco Funk & Parisian Electro-Pop',
        playlistId: 'france',
        bpm: 122,
        bars: 60,
        durationSeconds: 150,
        description: 'Infectious, upbeat French nu-disco funk inspired by Vaudeville Smash’s tribute to Zinedine Zidane, featuring bouncy slap bass, rhythmic funk guitar chops, punchy brass stabs, joyful vocoder hooks, and a celebratory Marseille stadium groove.',
      },
      {
        id: 'fra-final',
        title: 'Le Sacre de Saint-Denis (Coupe de France Final)',
        artist: 'Orchestre Symphonique de Saint-Denis',
        genre: 'French Touch Electro-Symphonic Grand Finale',
        playlistId: 'france',
        bpm: 128,
        bars: 64,
        durationSeconds: 150,
        description: 'Monumental Coupe de France final anthem inspired by the epic style of Wheel of Destiny, blending filtered French Touch bass, soaring French horn fanfares, operatic string crescendos, and chic Parisian stadium drama.',
        isFinalOnly: true,
      },
    ],
  },
  spain: {
    id: 'spain',
    name: 'Spain',
    countryOrRegion: 'Spain',
    flag: '🇪🇸',
    styleDescription: 'Flamenco-inspired Phrygian melodies, authentic nylon guitar plucks, rapid palmas & 16-bit beats',
    usedFor: [
      'Spanish 1st Division',
      'Spanish 2nd Division',
      'Madrid Youth League',
      'Spanish Domestic Cups',
    ],
    colorHex: '#ef4444',
    tracks: [
      {
        id: 'esp-1',
        title: 'Furia Ibérica',
        artist: 'BAL 16-Bit Sound Team',
        genre: '16-Bit Flamenco Fusion',
        playlistId: 'spain',
        bpm: 124,
        bars: 64,
        durationSeconds: 150,
        description: 'Flamenco Phrygian lead with Andalusian cadence, acoustic nylon guitar, and multi-layer palmas',
      },
      {
        id: 'esp-2',
        title: 'Sol de Madrid',
        artist: 'BAL 16-Bit Sound Team',
        genre: '16-Bit Flamenco Fusion',
        playlistId: 'spain',
        bpm: 120,
        bars: 60,
        durationSeconds: 150,
        description: 'Spanish guitar 16-bit arpeggios over syncopated rumba groove and resonant bass',
      },
      {
        id: 'esp-3',
        title: 'Duende y Balón',
        artist: 'BAL 16-Bit Sound Team',
        genre: '16-Bit Flamenco Fusion',
        playlistId: 'spain',
        bpm: 126,
        bars: 64,
        durationSeconds: 150,
        description: 'Harmonic minor leads with modern Spanish urban-infused 16-bit rhythm and brass swells',
      },
      {
        id: 'esp-4',
        title: 'Noche de Clásico',
        artist: 'BAL 16-Bit Sound Team',
        genre: '16-Bit Flamenco Fusion',
        playlistId: 'spain',
        bpm: 122,
        bars: 62,
        durationSeconds: 150,
        description: 'Fiery melodic hook with castanet-like percussion and expressive nylon guitar runs',
      },
      {
        id: 'esp-5',
        title: 'Alhambra Golden Sunset',
        artist: 'BAL 16-Bit Sound Team',
        genre: '16-Bit Flamenco Fusion',
        playlistId: 'spain',
        bpm: 120,
        bars: 60,
        durationSeconds: 150,
        description: 'Exotic Andalusian Phrygian dominant melodies with intricate guitar-style runs & string pads',
      },
      {
        id: 'esp-6',
        title: 'Rumba del Campeón',
        artist: 'BAL 16-Bit Sound Team',
        genre: '16-Bit Flamenco Fusion',
        playlistId: 'spain',
        bpm: 128,
        bars: 64,
        durationSeconds: 150,
        description: 'Bouncy Catalan rumba 16-bit groove with clapping palmas and sunny lead lines',
      },
      {
        id: 'esp-7',
        title: 'Triana Flamenco Beat',
        artist: 'BAL 16-Bit Sound Team',
        genre: '16-Bit Flamenco Fusion',
        playlistId: 'spain',
        bpm: 124,
        bars: 64,
        durationSeconds: 150,
        description: 'Seville-inspired syncopated rhythm with rapid triplet handclaps and expressive soloing',
      },
      {
        id: 'esp-8',
        title: 'Pasión por la Roja',
        artist: 'BAL 16-Bit Sound Team',
        genre: '16-Bit Flamenco Fusion',
        playlistId: 'spain',
        bpm: 126,
        bars: 64,
        durationSeconds: 150,
        description: 'National championship pride with brass stabs, driving bass, and soaring Spanish melody',
      },
      {
        id: 'esp-9',
        title: 'Bulerías de Oro',
        artist: 'BAL 16-Bit Sound Team',
        genre: '16-Bit Flamenco Fusion',
        playlistId: 'spain',
        bpm: 130,
        bars: 66,
        durationSeconds: 150,
        description: 'Fast 12-beat bulerías accent rhythm translated into punchy 16-bit arcade power',
      },
      {
        id: 'esp-10',
        title: 'Fiesta en Cibeles',
        artist: 'BAL 16-Bit Sound Team',
        genre: '16-Bit Flamenco Fusion',
        playlistId: 'spain',
        bpm: 122,
        bars: 62,
        durationSeconds: 150,
        description: 'Celebratory Spanish street party sound with joyous chords and lively syncopation',
      },
      {
        id: 'esp-11',
        title: 'Orgullo de la Charanga',
        artist: 'Banda Sinfónica del Calderón',
        genre: 'Spanish Stadium Pasodoble & Festive Brass',
        playlistId: 'spain',
        bpm: 124,
        bars: 64,
        durationSeconds: 150,
        description: 'Exuberant Spanish stadium fiesta powered by spirited paso doble trumpet fanfares, rhythmic castanets and snare rolls, energetic acoustic guitar rasgueados, and triumphant brass section counterpoints.',
      },
      {
        id: 'esp-final',
        title: 'Duelo Real (Copa del Rey Final)',
        artist: 'Bulería & Orquesta Real',
        genre: 'Spanish Pasodoble Flamenco & Dramatic Brass Finale',
        playlistId: 'spain',
        bpm: 128,
        bars: 64,
        durationSeconds: 150,
        description: 'Grand Spanish Cup Final anthem inspired by the epic style of Wheel of Destiny, ignited by fiery flamenco nylon guitar rasgueados, rhythmic castanets, triumphant pasodoble trumpet fanfares, and dramatic orchestral strings.',
        isFinalOnly: true,
      },
    ],
  },
  brazil: {
    id: 'brazil',
    name: 'Brazil',
    countryOrRegion: 'Brazil',
    flag: '🇧🇷',
    styleDescription: 'Original Brazilian football soundtrack: Carnival samba batucada, Sertanejo pop & arena anthems, Baile Funk tamborzão, Joga Bonito fusion, organic body percussion & modern nightlife funk',
    usedFor: [
      'Brazilian 1st Division (Brasileirão Série A)',
      'Brazilian 2nd Division (Brasileirão Série B)',
      'Copa do Brasil',
      'Supercopa do Brasil',
      'São Paulo & Rio de Janeiro Youth Leagues',
    ],
    colorHex: '#10b981',
    tracks: [
      {
        id: 'bra-1',
        title: 'Explosão no Maracanã',
        artist: 'GRES Batuque da Vitória',
        genre: 'Brazilian Samba / Football Carnival Anthem',
        playlistId: 'brazil',
        bpm: 132,
        bars: 80,
        durationSeconds: 150,
        description: 'Carnival-infused samba football anthem with explosive surdo and pandeiro batucada, cavaquinho strums, bright brass fanfare, and call-and-response group terrace chants turning the stadium into a carnival.',
      },
      {
        id: 'bra-2',
        title: 'Taça na Mão, Festa no Chão',
        artist: 'Duo Sertanejo dos Campeões',
        genre: 'Brazilian Sertanejo-Pop / Matchday Celebration',
        playlistId: 'brazil',
        bpm: 126,
        bars: 78,
        durationSeconds: 150,
        description: 'Uplifting Brazilian sertanejo-pop football party song featuring rhythmic acoustic guitars, vibrant sanfona accordion riffs, danceable percussion, and an infectious sing-along chorus celebrating championship glory.',
      },
      {
        id: 'bra-3',
        title: 'Arena Universitária',
        artist: 'Banda Noite de Gala',
        genre: 'Sertanejo Universitário / Arena Dance-Pop',
        playlistId: 'brazil',
        bpm: 128,
        bars: 80,
        durationSeconds: 150,
        description: 'High-voltage sertanejo arena dance-pop anthem with driving 4-on-the-floor beat, heavy synth bass, electric guitar riffs, and euphoric sing-along stadium vocals continuing the matchday celebration into the night.',
      },
      {
        id: 'bra-4',
        title: 'Passinho do Menino Rei',
        artist: 'MC Drible & DJ Favela Sound',
        genre: 'Brazilian Baile Funk / Tamborzão Street Groove',
        playlistId: 'brazil',
        bpm: 132,
        bars: 82,
        durationSeconds: 150,
        description: 'Heavyweight Brazilian baile funk with authentic syncopated tamborzão beat, crushing 808 sub drops, rhythmic MC vocal phrases, agogô cuts, and raw street-party swagger from the pitch to the favela.',
      },
      {
        id: 'bra-5',
        title: 'Ginga e Malemolência',
        artist: 'Seleção Musical da Amarelinha',
        genre: 'Joga Bonito / Samba-Pop Football Anthem',
        playlistId: 'brazil',
        bpm: 122,
        bars: 76,
        durationSeconds: 150,
        description: 'Joyful Joga Bonito fusion celebrating Brazilian football flair, creativity, and dribbling art with funky slap bass, samba percussion, warm electric piano chords, bright horns, and uplifting group vocal chants.',
      },
      {
        id: 'bra-6',
        title: 'Batuque do Corpo e Alma',
        artist: 'Coletivo Percussivo Brasil',
        genre: 'Brazilian Body Percussion & Vocal Symphony',
        playlistId: 'brazil',
        bpm: 114,
        bars: 70,
        durationSeconds: 150,
        description: 'Hypnotic Brazilian body percussion experiment layering organic chest stomps, handclaps, mouth pops, and polyrhythmic vocal chants that gradually swell into a massive, organic football celebration.',
      },
      {
        id: 'bra-7',
        title: 'Fluxo no Baile da Vitória',
        artist: 'MC Paulista & DJ do Fluxo',
        genre: 'Modern Brazilian Baile Funk / Mandelão & Nightlife',
        playlistId: 'brazil',
        bpm: 134,
        bars: 84,
        durationSeconds: 150,
        description: "Dark and festive modern Brazilian funk with deep sliding 808 sub bass, minimalist synth plucks, hypnotic dance grooves, and energetic MC vocals capturing a footballer's victorious night out.",
      },
      {
        id: 'bra-8',
        title: 'Sol de Copacabana',
        artist: 'Trio Tropical da Bahia',
        genre: 'Samba-Reggae & Coastal Bossa Groove',
        playlistId: 'brazil',
        bpm: 108,
        bars: 56,
        durationSeconds: 150,
        description: 'Sun-soaked Bahian samba-reggae and bossa groove with rolling surdo and timbal cadences, warm nylon guitar chords, smooth acoustic bass, expressive horn fills, and carefree seaside beach-to-stadium football magic.',
      },
      {
        id: 'br-final',
        title: 'O Soberano do Maracanã (Copa do Brasil Final)',
        artist: 'Batucada Sinfônica do Maracanã',
        genre: 'Brazilian Samba-Batucada & Carnival Epic Finale',
        playlistId: 'brazil',
        bpm: 128,
        bars: 64,
        durationSeconds: 150,
        description: 'Explosive Brazilian Cup Final anthem inspired by the epic style of Wheel of Destiny, driven by thunderous surdo pulses, rapid repinique rolls, rhythmic cavaquinho strums, and exuberant carnival brass fanfares.',
        isFinalOnly: true,
      },
    ],
  },
  argentina: {
    id: 'argentina',
    name: 'Argentina',
    countryOrRegion: 'Argentina',
    flag: '🇦🇷',
    styleDescription: 'Authentic Argentine football music: Bersuit murga-rock, Soda Stereo new wave, Fito Páez piano rock, Spinetta harmony, Cumbia Villera keytars & Muchachos stadium anthems',
    usedFor: [
      'Argentine 1st Division',
      'Argentine 2nd Division',
      'Argentine Domestic Cups',
      'Buenos Aires Youth League',
    ],
    colorHex: '#0ea5e9',
    tracks: [
      {
        id: 'arg-1',
        title: 'El Baile del Potrero',
        artist: 'La Murga del Tablón',
        genre: 'Argentine Murga-Rock / Ska',
        playlistId: 'argentina',
        bpm: 136,
        bars: 84,
        durationSeconds: 150,
        description: 'Bersuit Vergarabat-inspired festive murga-rock and ska fusion with syncopated dual-reed bandoneón, energetic acoustic strums, overdriven electric guitar hooks, bombo con platillo, and barrio football swagger',
      },
      {
        id: 'arg-2',
        title: 'De Pasión Ligera',
        artist: 'Stereo Estéreo',
        genre: 'Argentine Rock en Español',
        playlistId: 'argentina',
        bpm: 126,
        bars: 78,
        durationSeconds: 150,
        description: 'Soda Stereo-inspired rock en español anthem with iconic 4-chord progression, lush chorus electric guitar riffing, melodic post-punk bassline, atmospheric synth pads, and stadium power drums',
      },
      {
        id: 'arg-3',
        title: 'Mariposa de Tablón',
        artist: 'Rosario Piano Colectivo',
        genre: 'Rosario Grand Piano Rock',
        playlistId: 'argentina',
        bpm: 120,
        bars: 76,
        durationSeconds: 150,
        description: 'Fito Páez-inspired piano rock masterpiece featuring jubilant concert grand piano chords, soaring trumpet fanfares, singing melodic guitar solo lines, and warm nostalgic football poetry',
      },
      {
        id: 'arg-4',
        title: 'Muchachos de la Tercera',
        artist: 'La Hinchada Inmortal',
        genre: 'Argentine Stadium Ska-Pop Anthem',
        playlistId: 'argentina',
        bpm: 132,
        bars: 82,
        durationSeconds: 150,
        description: 'La Mosca-inspired Qatar 2022 world championship stadium march featuring explosive brass ska stabs, bombo legüero stadium beats, acoustic guitar strums, and roaring crowd terrace chants',
      },
      {
        id: 'arg-5',
        title: 'Cumbia del Potrero Iluminado',
        artist: 'Sinfonía Villera y Poética',
        genre: 'Cumbia Villera & Poetic Fusion',
        playlistId: 'argentina',
        bpm: 102,
        bars: 64,
        durationSeconds: 150,
        description: 'Authentic Argentine cumbia villera synthesized keytar leads with pitch glides, metallic güiro raspado, bouncy FM slap bass, blended with Spinetta-inspired poetic 7th/9th Rhodes jazz chords and barrio energy',
      },
      {
        id: 'arg-6',
        title: 'Milonga del Diez Eterno',
        artist: 'Arrabal & Rock Porteño',
        genre: 'Argentine Tango-Rock & Bandoneón Drama',
        playlistId: 'argentina',
        bpm: 122,
        bars: 64,
        durationSeconds: 150,
        description: 'Fiery Buenos Aires tango-rock fusion featuring dramatic syncopated bandoneón riffs, driving rock drums, singing electric guitar leads, walking acoustic bass, and the unmistakable dramatic soul of Argentine football mythology.',
      },
      {
        id: 'arg-final',
        title: 'Furia Monumental (Copa Argentina Final)',
        artist: 'Filarmónica Tablonera & Murga Porteña',
        genre: 'Argentine Murga-Rock & Bandoneón Passion Finale',
        playlistId: 'argentina',
        bpm: 128,
        bars: 64,
        durationSeconds: 150,
        description: 'Passionate Argentine Cup Final anthem inspired by the epic style of Wheel of Destiny, infused with soulful bandoneón solos, bombo legüero stadium beats, acoustic guitar strums, and roaring tablón terrace chants.',
        isFinalOnly: true,
      },
    ],
  },
  england: {
    id: 'england',
    name: 'England',
    countryOrRegion: 'England',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    styleDescription: 'Authentic British stadium rock, 1960s Merseybeat piano & brass, 1977 punk power chords, soaring 90s Britpop and majestic symphonic anthems',
    usedFor: [
      'English 1st Division',
      'English 2nd Division',
      'London Youth League',
      'English Domestic Cups',
    ],
    colorHex: '#dc2626',
    tracks: [
      {
        id: 'eng-1',
        title: 'Three Stitched Lions',
        artist: 'Wembley Terrace Sound System',
        genre: 'British Stadium Rock Anthem',
        playlistId: 'england',
        bpm: 128,
        bars: 80,
        durationSeconds: 150,
        description: "Infectious 'Football\\'s Coming Home' stadium pop-rock anthem with driving acoustic strums, singing electric guitar leads, melodic bassline, trumpet fanfares, and roaring crowd terrace chants",
      },
      {
        id: 'eng-2',
        title: 'Penny Terrace Lane',
        artist: 'Liverpool Mersey Ensemble',
        genre: '1960s British Baroque Pop',
        playlistId: 'england',
        bpm: 116,
        bars: 72,
        durationSeconds: 150,
        description: 'Abbey Road & Penny Lane-inspired British pop masterpiece featuring bright staccato concert piano, lyrical walking Hofner bass, sparkling clean guitars, piccolo trumpet fanfares, and vocal counterpoint',
      },
      {
        id: 'eng-3',
        title: 'Anarchy on the Pitch',
        artist: 'Kings Road 1977 Syndicate',
        genre: '1977 British Punk Rock',
        playlistId: 'england',
        bpm: 156,
        bars: 96,
        durationSeconds: 150,
        description: 'Sex Pistols-inspired high-voltage 1977 punk explosion with blistering overdriven power chords, furious pogo bass, aggressive backbeat drums, screaming pentatonic guitar riffs, and raw terrace attitude',
      },
      {
        id: 'eng-4',
        title: 'Maine Road Wonder',
        artist: 'Manchester Britpop Revival',
        genre: '90s Britpop Stadium Anthem',
        playlistId: 'england',
        bpm: 120,
        bars: 76,
        durationSeconds: 150,
        description: 'Soaring 90s Manchester Britpop anthem with wall-of-sound distorted guitars, acoustic rhythm, rock piano chords, emotional guitar solo hooks, and massive stadium singalong energy',
      },
      {
        id: 'eng-5',
        title: 'Bittersweet Derby',
        artist: 'Northern Symphony Orchestra',
        genre: 'Majestic Symphonic Britpop',
        playlistId: 'england',
        bpm: 88,
        bars: 56,
        durationSeconds: 150,
        description: 'The Verve-inspired sweeping cinematic Britpop symphony with hypnotic orchestral violin ostinato, syncopated 90s breakbeat drums, rolling melodic bass, warm acoustic guitar, and lush cinematic strings',
      },
      {
        id: 'eng-6',
        title: 'Terrace Two-Tone Stomp',
        artist: 'Coventry Ska All-Stars',
        genre: 'British 2-Tone Ska & Mod Anthem',
        playlistId: 'england',
        bpm: 138,
        bars: 72,
        durationSeconds: 150,
        description: 'Fast, energetic British 2-Tone ska and mod revival anthem featuring rhythmic upbeat guitar skanks, walking Hofner bass, punchy brass horns, bright staccato piano, and infectious stadium terrace bounce.',
      },
      {
        id: 'eng-final',
        title: 'Lords of Wembley (British Cup Final)',
        artist: 'Wembley Stadium Rock & Symphony',
        genre: 'British Symphonic Rock & Stadium Power Chord Drama',
        playlistId: 'england',
        bpm: 128,
        bars: 64,
        durationSeconds: 150,
        description: 'Decisive British Cup Final anthem inspired by the epic style of Wheel of Destiny, powered by roaring overdrive rock guitars, thunderous live rock drums, massed terrace crowd shouts, and majestic symphonic brass.',
        isFinalOnly: true,
      },
    ],
  },
  continental: {
    id: 'continental',
    name: 'Continental',
    countryOrRegion: 'Continental Europe & Americas',
    flag: '⭐',
    styleDescription: 'Grand symphonic orchestral scores, dramatic choir, French horn fanfares, baroque counterpoint & cinematic timpani',
    usedFor: [
      'UEFA Champions League',
      'UEFA Europa League',
      'UEFA Conference League',
      'Copa Libertadores',
      'Copa Sudamericana',
      'Recopa Sudamericana',
      'CONCACAF Champions Cup',
      'AFC Champions League',
      'CAF Champions League',
      'OFC Champions League',
      'Other Continental Club Tournaments',
    ],
    colorHex: '#eab308',
    tracks: [
      {
        id: 'epic-1',
        title: 'Vanguard of the Continent',
        artist: 'BAL Orchestral Ensemble',
        genre: 'Symphonic Allegro con Fuoco',
        playlistId: 'continental',
        bpm: 132,
        bars: 64,
        durationSeconds: 150,
        description: 'Driving minor-key orchestral tour de force with galloping strings, triumphant French horn fanfare, staccato violin counterpoint, and explosive timpani rolls',
      },
      {
        id: 'epic-2',
        title: 'Hymn of the Victorious',
        artist: 'BAL Orchestral Ensemble',
        genre: 'Triumphant Symphonic Anthem',
        playlistId: 'continental',
        bpm: 120,
        bars: 60,
        durationSeconds: 150,
        description: 'Uplifting noble D-Major continental hymn opening with rich cello/bass counterpoint, ascending into soaring operatic choir harmonies and triumphant brass crescendos',
      },
      {
        id: 'epic-3',
        title: 'Crown of the Immortals',
        artist: 'BAL Orchestral Ensemble',
        genre: 'Baroque Continental Anthem',
        playlistId: 'continental',
        bpm: 116,
        bars: 58,
        durationSeconds: 150,
        description: 'Grand stadium anthem featuring ascending 16th-note violin arpeggios, royal heraldic brass fanfares, operatic choir chant, and regal orchestral grandeur',
      },
      {
        id: 'epic-4',
        title: 'Wheel of Destiny',
        artist: 'BAL Orchestral Ensemble',
        genre: 'Epic Gothic Choral Drama',
        playlistId: 'continental',
        bpm: 128,
        bars: 64,
        durationSeconds: 150,
        description: 'Thunderous, apocalyptic orchestral drama with heavy pounding timpani on every beat, menacing choir chords, piercing brass stabs, and electrifying minor-key intensity',
        isFinalOnly: true,
      },
      {
        id: 'epic-5',
        title: 'Flight of the Valkyries',
        artist: 'BAL Orchestral Ensemble',
        genre: 'Dramatic Symphonic March',
        playlistId: 'continental',
        bpm: 136,
        bars: 68,
        durationSeconds: 150,
        description: 'Relentless galloping triplet momentum with leaping French horn fanfares, swirling high string ostinatos, and soaring heroic brass counter-melodies',
      },
      {
        id: 'epic-6',
        title: 'March of the Iron Legions',
        artist: 'BAL Orchestral Ensemble',
        genre: 'Militaristic 5/4 Orchestral Ostinato',
        playlistId: 'continental',
        bpm: 112,
        bars: 56,
        durationSeconds: 150,
        description: 'Menacing and asymmetrical 5-beat driving ostinato with growling double-bass, militaristic snare drum rolls, ominous muted brass stabs, and towering tension',
      },
      {
        id: 'epic-7',
        title: 'Cavern of the Mountain King',
        artist: 'BAL Orchestral Ensemble',
        genre: 'Accelerando Orchestral Crescendo',
        playlistId: 'continental',
        bpm: 118,
        bars: 60,
        durationSeconds: 150,
        description: 'Mysterious staccato bassoon and pizzicato strings theme gradually layering French horns, full brass, and percussion, building into an explosive whirlwind finale',
      },
      {
        id: 'epic-8',
        title: 'Festival of the Slavic Steppes',
        artist: 'BAL Orchestral Ensemble',
        genre: 'Spirited Symphonic Dance',
        playlistId: 'continental',
        bpm: 130,
        bars: 64,
        durationSeconds: 150,
        description: 'High-spirited, dynamic Bohemian orchestral dance featuring sudden fortissimo bursts, playful staccato woodwinds, syncopated folk rhythms, and joyful festive brass',
      },
      {
        id: 'epic-9',
        title: 'Royal Fanfare Rondeau',
        artist: 'BAL Orchestral Ensemble',
        genre: 'Baroque Ceremonial Fanfare',
        playlistId: 'continental',
        bpm: 118,
        bars: 60,
        durationSeconds: 150,
        description: 'Stately 18th-century court fanfare with brilliant piccolo trumpets, majestic timpani downbeats, crisp side-drum rolls, and noble European ceremonial pageantry',
      },
      {
        id: 'epic-10',
        title: 'Pomp of the Champions',
        artist: 'BAL Orchestral Ensemble',
        genre: 'Noble Ceremonial Procession',
        playlistId: 'continental',
        bpm: 104,
        bars: 52,
        durationSeconds: 150,
        description: 'Dignified, sweeping processional march featuring crisp snare rhythm, warm French horns, and a soaring broad string melody that evokes eternal football glory',
      },
      {
        id: 'epic-11',
        title: 'Echoes of Continental Glory',
        artist: 'BAL Orchestral Ensemble',
        genre: 'Dramatic Baroque & Symphonic Knockout Anthem',
        playlistId: 'continental',
        bpm: 124,
        bars: 64,
        durationSeconds: 150,
        description: 'Electrifying continental knockout anthem featuring driving baroque cello ostinatos, virtuosic staccato violin flourishes, soaring French horn fanfares, and thunderous orchestral timpani building toward an unforgettable continental climax.',
      },
    ],
  },
  world: {
    id: 'world',
    name: 'World',
    countryOrRegion: 'Global International',
    flag: '🌍',
    styleDescription: 'Original global tournament anthems: African djembe rhythms, Afro-pop dances, Latin brass celebrations, Brazilian batucada, Italian rock ballads & massed stadium terrace chants',
    usedFor: [
      'FIFA World Cup',
      'FIFA U-20 World Cup',
      'FIFA U-17 World Cup',
      'FIFA Club World Cup',
      'Intercontinental Cup',
      'Finalissima',
      'World Cup Qualifiers',
      'International Youth Tournaments',
    ],
    colorHex: '#ec4899',
    tracks: [
      {
        id: 'world-1',
        title: 'Banners of the Earth',
        artist: 'Sons of Savannah & Global Choir',
        genre: 'African-Acoustic Global Stadium Anthem',
        playlistId: 'world',
        bpm: 116,
        bars: 72,
        durationSeconds: 150,
        description: "K'naan-inspired uplifting global tournament anthem featuring warm African djembe beats, acoustic guitar strums, resonant kalimba melodies, and massive stadium singalong vocal harmonies",
      },
      {
        id: 'world-2',
        title: 'Sawa Sawa (Time for Glory)',
        artist: "Jo'burg Stadium All-Stars",
        genre: 'Afro-Pop World Cup Dance Celebration',
        playlistId: 'world',
        bpm: 128,
        bars: 80,
        durationSeconds: 150,
        description: 'Shakira Waka Waka-inspired high-energy international celebration driven by African djembe polyrhythms, bouncy synth brass, call-and-response vocal chants, and infectious dance groove',
      },
      {
        id: 'world-3',
        title: 'La Copa Inmortal',
        artist: 'San Juan Brass & Timbales',
        genre: 'Explosive Latin Brass Stadium Anthem',
        playlistId: 'world',
        bpm: 132,
        bars: 82,
        durationSeconds: 150,
        description: 'Ricky Martin Copa de la Vida-inspired Latin tournament anthem featuring blazing trumpet fanfares, sizzling timbales, congas, stadium "Allez Allez" chants, and relentless world cup energy',
      },
      {
        id: 'world-4',
        title: 'Carnaval de la Cancha',
        artist: 'Barranquilla World Sound System',
        genre: 'Latin-Pop & Cumbia-Reggaeton Stadium Groove',
        playlistId: 'world',
        bpm: 104,
        bars: 66,
        durationSeconds: 150,
        description: "Shakira Hips Don't Lie-inspired hypnotic Latin stadium groove with syncopated trumpet hooks, rolling sub bass, timbale cascara clicks, güiro scraping, and playful festival vibes",
      },
      {
        id: 'world-5',
        title: 'Stunde des Mutes',
        artist: 'Berlin Stadium Collective',
        genre: 'German Stadium Pop-Rock Anthem',
        playlistId: 'world',
        bpm: 120,
        bars: 76,
        durationSeconds: 150,
        description: 'Herbert Grönemeyer-inspired emotional German tournament anthem with driving synth-rock power chords, rolling stadium drums, acoustic rhythm, and soaring crowd chorus of collective determination',
      },
      {
        id: 'world-6',
        title: 'One Sky, One Goal',
        artist: 'Multinational Festival Orchestra',
        genre: 'Multinational Dance-Pop & Batucada',
        playlistId: 'world',
        bpm: 126,
        bars: 78,
        durationSeconds: 150,
        description: 'We Are One-inspired multinational football anthem blending Brazilian carnival surdo drums, euphoric eurodance synth drops, stadium handclaps, and universal singalong chorus',
      },
      {
        id: 'world-7',
        title: 'Canto do Maracanã',
        artist: 'Rio Batucada Syndicate',
        genre: 'High-Energy Brazilian Electro-Batucada',
        playlistId: 'world',
        bpm: 128,
        bars: 80,
        durationSeconds: 150,
        description: 'Shakira & Carlinhos Brown La La La-inspired Brazilian samba-electro celebration featuring rapid repinique rolls, deep surdo pulses, agogô bells, pumping synth bass, and electric stadium chant hooks',
      },
      {
        id: 'world-8',
        title: 'Forza Campioni (Dai Dai Dai!)',
        artist: 'Curva Mondiale Ensemble',
        genre: 'Italian Terrace Chant & Mediterranean Pop',
        playlistId: 'world',
        bpm: 130,
        bars: 82,
        durationSeconds: 150,
        description: 'Dai Dai-inspired playful, infectious Italian football chant with rhythmic terrace handclaps, energetic brass fanfare, bouncy bassline, and irresistible crowd singalong refrains',
      },
      {
        id: 'world-9',
        title: 'Notti Magiche di Gloria',
        artist: 'Milano 1990 Nostalgia Project',
        genre: '1990s Italian World Cup Rock Ballad',
        playlistId: 'world',
        bpm: 114,
        bars: 72,
        durationSeconds: 150,
        description: "Gianna Nannini & Edoardo Bennato Un'estate italiana-inspired epic rock ballad with vintage synth pads, concert piano chords, singing overdrive electric guitar solo, and emotional stadium crescendo",
      },
      {
        id: 'world-10',
        title: 'Mama Dunia (Rise as One)',
        artist: 'African Horizon Choral Project',
        genre: 'African Pop & Global Choral Anthem',
        playlistId: 'world',
        bpm: 118,
        bars: 74,
        durationSeconds: 150,
        description: 'Akon Oh Africa-inspired inspirational world football anthem featuring sparkling kalimba melodies, organic djembe rhythms, modern pop synth drive, and an uplifting global mass choir climax',
      },
      {
        id: 'world-11',
        title: 'United by the Game',
        artist: 'Global Nations Festival Ensemble',
        genre: 'Global Folk-Pop & Stadium Celebration Anthem',
        playlistId: 'world',
        bpm: 126,
        bars: 68,
        durationSeconds: 150,
        description: 'Joyous multinational stadium anthem blending spirited folk flutes, acoustic guitar rhythm, driving electronic festival kicks, triumphant brass flourishes, and an infectious global crowd singalong celebrating international unity.',
      },
      {
        id: 'world-final',
        title: 'Crown of the Titans (World Final)',
        artist: 'Global Orchestra & Nations Choir',
        genre: 'Epic Global Poly-Percussion & Choral Drama',
        playlistId: 'world',
        bpm: 128,
        bars: 64,
        durationSeconds: 150,
        description: 'Universal World Championship Final anthem inspired by the epic style of Wheel of Destiny, weaving African djembe rhythms, Latin timbales, resonant kalimbas, and massed multinational choir into an epic world title spectacle.',
        isFinalOnly: true,
      },
    ],
  },
  portugal: {
    id: 'portugal',
    name: 'Portugal',
    countryOrRegion: 'Portugal',
    flag: '🇵🇹',
    styleDescription: 'Original Portuguese football soundtrack: Traditional Lisbon fado, dramatic Atlantic modern fado, classic stadium rock, Lusophone Kuduro club beats & urban hip-hop',
    usedFor: [
      'Portuguese 1st Division (Liga Portugal)',
      'Portuguese 2nd Division (Liga Portugal 2)',
      'Taça de Portugal',
      'Taça da Liga',
      'Supertaça Cândido de Oliveira',
      'Portuguese Youth Academies & District Leagues',
    ],
    colorHex: '#059669',
    tracks: [
      {
        id: 'por-1',
        title: 'Saudade das Ruas de Lisboa',
        artist: 'Ensemble Alfama & Tejo',
        genre: 'Fado Tradicional de Lisboa',
        playlistId: 'portugal',
        bpm: 110,
        bars: 64,
        durationSeconds: 150,
        description: 'Traditional Portuguese fado inspired by Amália Rodrigues, featuring ringing 12-string guitarra portuguesa arpeggios, nylon guitar fado rhythm, nostalgic accordion melodies, and authentic Lisbon soul.',
      },
      {
        id: 'por-2',
        title: 'Canto das Ondas do Atlântico',
        artist: 'Sinfonia Lusitana',
        genre: 'Dramatic Modern Fado / Atlantic Ballad',
        playlistId: 'portugal',
        bpm: 120,
        bars: 64,
        durationSeconds: 150,
        description: 'Dramatic modern fado inspired by Dulce Pontes, with rolling wave cymbal swells, soaring emotional vocal synth leads, rich minor orchestral pads, and cinematic Portuguese maritime atmosphere.',
      },
      {
        id: 'por-3',
        title: 'Grito do Estádio Lusitano',
        artist: 'Rock Brigade de Alvalade',
        genre: 'Classic Portuguese Stadium Rock',
        playlistId: 'portugal',
        bpm: 148,
        bars: 64,
        durationSeconds: 150,
        description: 'Energetic Portuguese stadium rock anthem inspired by Xutos & Pontapés, with roaring overdrive power chords, punchy driving drums, catchy singalong riffs, and electric matchday passion.',
      },
      {
        id: 'por-4',
        title: 'Batida Urbana de Luanda a Lisboa',
        artist: 'Kuduro Club Sound System',
        genre: 'Lusophone Kuduro / Afro-Portuguese Club',
        playlistId: 'portugal',
        bpm: 140,
        bars: 80,
        durationSeconds: 150,
        description: 'High-energy Portuguese electronic Kuduro and club anthem inspired by Buraka Som Sistema, with fast syncopated African polyrhythms, heavy sub kicks, punchy electronic stabs, whistle blasts, and party frenzy.',
      },
      {
        id: 'por-5',
        title: 'Ritmo das Ruas de Sintra',
        artist: 'Lisboa Hip-Hop Coletivo',
        genre: 'Portuguese Alternative Hip-Hop / Urban Funk',
        playlistId: 'portugal',
        bpm: 94,
        bars: 56,
        durationSeconds: 150,
        description: 'Urban Portuguese hip-hop and alternative groove inspired by Da Weasel, featuring deep smooth basslines, rhythmic boom-bap drums, jazz guitar licks, and laid-back Lisbon street swagger.',
      },
      {
        id: 'por-6',
        title: 'Festa no Minho e no Dragão',
        artist: 'Banda Alegria Lusitana',
        genre: 'Festive Portuguese Folk-Pop & Accordion Party',
        playlistId: 'portugal',
        bpm: 128,
        bars: 68,
        durationSeconds: 150,
        description: 'Joyful Portuguese stadium celebration anthem featuring lively concert accordion melodies, bright acoustic guitars, bouncy dance rhythm, brass fanfares, and an infectious communal festa atmosphere.',
      },
      {
        id: 'por-final',
        title: 'O Conquistador do Jamor (Taça de Portugal Final)',
        artist: 'Guitarras do Jamor & Orquestra',
        genre: 'Portuguese Fado-Rock & Kuduro Orchestral Drama',
        playlistId: 'portugal',
        bpm: 128,
        bars: 64,
        durationSeconds: 150,
        description: 'Atmospheric Portuguese Cup Final anthem inspired by the epic style of Wheel of Destiny, intertwining the melancholic intensity of 12-string Portuguese guitars, heavy Kuduro percussion stabs, and heroic symphonic brass.',
        isFinalOnly: true,
      },
    ],
  },
  saudi: {
    id: 'saudi',
    name: 'Saudi Arabia / Arabian League',
    countryOrRegion: 'Saudi Arabia & Arabian Gulf',
    flag: '🇸🇦',
    styleDescription: 'Original Saudi & Arabian football soundtrack: Traditional Khaleeji orchestral oud, modern Gulf pop, dramatic royal anthems, Mediterranean Habibi pop & global Arabian electronic crossover',
    usedFor: [
      'Saudi Pro League (Roshn Saudi League)',
      "King's Cup (Custodian of the Two Holy Mosques Cup)",
      'Saudi Super Cup',
      'Saudi Crown Prince Cup',
      'Arab Club Champions Cup',
      'Gulf Club Leagues & Academies',
    ],
    colorHex: '#15803d',
    tracks: [
      {
        id: 'sau-1',
        title: 'Layali Al-Riyadh (Riyadh Nights)',
        artist: 'Najd Traditional Ensemble',
        genre: 'Traditional Khaleeji Orchestra / Bayati Oud',
        playlistId: 'saudi',
        bpm: 106,
        bars: 60,
        durationSeconds: 150,
        description: 'Authentic Saudi/Gulf musical identity inspired by Mohammed Abdu, with emotive acoustic oud arpeggios, atmospheric Bayati strings, resonant darbuka (doum & tek) rhythms, and deep desert majesty.',
      },
      {
        id: 'sau-2',
        title: 'Fakhr Al-Khaleej (Pride of the Gulf)',
        artist: 'Arabian Gulf Pop Orchestra',
        genre: 'Modern Gulf / Khaleeji Pop',
        playlistId: 'saudi',
        bpm: 126,
        bars: 64,
        durationSeconds: 150,
        description: 'Uplifting modern Khaleeji pop inspired by Rashed Al Majed, with driving 2/4 Gulf rhythms, syncopated collective handclaps, bright melodic oud interplay, celebratory synths, and accessible stadium energy.',
      },
      {
        id: 'sau-3',
        title: 'Malikat Al-Malaeb (Queen of the Pitch)',
        artist: 'Gulf Royal Sound',
        genre: 'Dramatic Gulf Pop / Regal Arab Anthem',
        playlistId: 'saudi',
        bpm: 122,
        bars: 64,
        durationSeconds: 150,
        description: 'Powerful Gulf pop anthem inspired by Ahlam, with dramatic Hijaz strings, heavy layered darbuka and daf percussion, majestic brass fanfares, and regal championship authority.',
      },
      {
        id: 'sau-4',
        title: 'Nour Al-Sahra (Desert Light)',
        artist: 'Mediterranean Arabian Stars',
        genre: 'Mediterranean Arabic Pop / Habibi Groove',
        playlistId: 'saudi',
        bpm: 120,
        bars: 64,
        durationSeconds: 150,
        description: 'Extremely catchy Mediterranean-Arabic pop inspired by Amr Diab, with Spanish flamenco nylon guitar flourishes, syncopated riq and darbuka grooves, bouncy bass, and vibrant celebration energy.',
      },
      {
        id: 'sau-5',
        title: 'Sahara Club Storm',
        artist: 'Riyadh Metro Electronic',
        genre: 'Arabian Moombahton / Global Club Crossover',
        playlistId: 'saudi',
        bpm: 132,
        bars: 72,
        durationSeconds: 150,
        description: 'High-energy global electronic crossover inspired by DJ Snake, with Arabian Hijaz modal synth hooks, heavy dembow/moombahton drums, deep 808 sub drops, and explosive stadium festival energy.',
      },
      {
        id: 'sau-6',
        title: 'Ardah Al-Fursan (March of the Knights)',
        artist: 'Najd Heritage Symphony',
        genre: 'Saudi Ardah & Majestic Desert March',
        playlistId: 'saudi',
        bpm: 112,
        bars: 58,
        durationSeconds: 150,
        description: 'Majestic Saudi Ardah-inspired stadium march combining resonant ceremonial drums, rhythmic Khaleeji claps, soaring Nay flute arabesques, triumphant brass fanfares, and the proud royal spirit of Saudi football history.',
      },
      {
        id: 'sau-final',
        title: 'Taj Al-Dhahab (King Cup Final)',
        artist: 'Orchestra Al-Yamamah & Oud Soloists',
        genre: 'Arabian Bayati Oud & Symphonic Royal Drama',
        playlistId: 'saudi',
        bpm: 128,
        bars: 64,
        durationSeconds: 150,
        description: 'Regal King’s Cup Final anthem inspired by the epic style of Wheel of Destiny, uniting resonant ceremonial Saudi drums, authentic Bayati oud arabesques, rhythmic Khaleeji handclaps, and majestic royal brass.',
        isFinalOnly: true,
      },
    ],
  },
  intro: {
    id: 'intro',
    name: 'Main Menu',
    countryOrRegion: 'Global',
    flag: '🎮',
    styleDescription: 'Cinematic 16-bit console introduction anthem with lush strings, brass, and soaring leads',
    usedFor: ['Startup Screen', 'Main Menu', 'Character Creation'],
    colorHex: '#6366f1',
    tracks: [
      {
        id: 'track-intro',
        title: 'Legend Awaits (16-Bit)',
        artist: 'BAL 16-Bit Sound Team',
        genre: '16-Bit Cinematic Anthem',
        playlistId: 'intro',
        bpm: 116,
        bars: 72,
        durationSeconds: 150,
        description: 'Atmospheric 16-bit console startup theme with lush SNES strings, FM bass, and soaring melody',
      },
    ],
  },
};

export const PLAYLIST_ORDER: PlaylistId[] = [
  'germany',
  'italy',
  'france',
  'spain',
  'portugal',
  'saudi',
  'brazil',
  'argentina',
  'england',
  'continental',
  'world',
];

/**
 * All tracks in a single flattened array for backward compatibility
 */
export const INDIE_PLAYLIST: SoundtrackTrack[] = [
  ...ALL_PLAYLISTS.intro.tracks,
  ...ALL_PLAYLISTS.germany.tracks,
  ...ALL_PLAYLISTS.italy.tracks,
  ...ALL_PLAYLISTS.france.tracks,
  ...ALL_PLAYLISTS.spain.tracks,
  ...ALL_PLAYLISTS.portugal.tracks,
  ...ALL_PLAYLISTS.saudi.tracks,
  ...ALL_PLAYLISTS.brazil.tracks,
  ...ALL_PLAYLISTS.argentina.tracks,
  ...ALL_PLAYLISTS.england.tracks,
  ...ALL_PLAYLISTS.continental.tracks,
  ...ALL_PLAYLISTS.world.tracks,
];

/**
 * Check if a given competition or tier is a World-level competition (Highest Priority)
 * Covers: FIFA World Cup, U-17 World Cup, U-20 World Cup, FIFA Club World Cup,
 * Intercontinental competitions, Finalissima, World Cup Qualifiers, and International Tournaments.
 */
export function isWorldCompetition(
  competitionNameOrId?: string,
  countryOrLeague?: string,
  tier?: string
): boolean {
  const normComp = String(competitionNameOrId || '').toLowerCase().trim();
  const normCountry = String(countryOrLeague || '').toLowerCase().trim();
  const normTier = String(tier || '').toLowerCase().trim();

  return (
    normComp.includes('world cup') ||
    normComp.includes('world_cup') ||
    normComp.includes('worldcup') ||
    normComp.includes('copa del mundo') ||
    normComp.includes('coupe du monde') ||
    normComp.includes('copa do mundo') ||
    normComp.includes('mundial') ||
    normComp.includes('fifa') ||
    normComp.includes('cwc') ||
    normComp.includes('club world cup') ||
    normComp.includes('intercontinental') ||
    normComp.includes('finalissima') ||
    normComp.includes('qualifier') ||
    normComp.includes('qualifiers') ||
    normComp.includes('eliminatorias') ||
    normComp.includes('qualification') ||
    normComp.includes('international') ||
    normComp.includes('nations league') ||
    normComp.includes('nations') ||
    normComp.includes('u-17 world') ||
    normComp.includes('u17 world') ||
    normComp.includes('u_17_world') ||
    normComp.includes('u-20 world') ||
    normComp.includes('u20 world') ||
    normComp.includes('u_20_world') ||
    normComp.includes('olympic') ||
    normComp.includes('olympics') ||
    normComp.includes('youth cup') ||
    normComp.includes('youth tournament') ||
    normComp.includes('international youth') ||
    normTier.includes('international') ||
    normTier.includes('senior_international') ||
    normTier.includes('youth_international') ||
    normTier.includes('u17_international') ||
    normTier.includes('u20_international') ||
    normTier.includes('national_team') ||
    normCountry.includes('fifa') ||
    normCountry.includes('international') ||
    (normComp.includes('youth') &&
      (normComp.includes('world') ||
        normComp.includes('global') ||
        normComp.includes('cup') ||
        normComp.includes('tournament')))
  );
}

/**
 * Check if a given competition is a Continental-level club/international competition (Second Priority)
 * Covers: UEFA Champions League, UEFA Europa League, UEFA Conference League, Copa Libertadores,
 * Copa Sudamericana, Recopa Sudamericana, UEFA Super Cup, CONCACAF Champions Cup, AFC Champions League,
 * CAF Champions League, OFC Champions League, and other continental club competitions.
 */
export function isContinentalCompetition(
  competitionNameOrId?: string,
  countryOrLeague?: string,
  tier?: string
): boolean {
  // Exclude World competitions first (World has highest priority)
  if (isWorldCompetition(competitionNameOrId, countryOrLeague, tier)) {
    return false;
  }

  const normComp = String(competitionNameOrId || '').toLowerCase().trim();
  const normTier = String(tier || '').toLowerCase().trim();

  return (
    normComp.includes('champions league') ||
    normComp.includes('champions') ||
    normComp.includes('ucl') ||
    normComp.includes('uefa_cl') ||
    normComp.includes('europa league') ||
    normComp.includes('europa') ||
    normComp.includes('uel') ||
    normComp.includes('uefa_el') ||
    normComp.includes('conference league') ||
    normComp.includes('conference') ||
    normComp.includes('uecl') ||
    normComp.includes('uefa_ecl') ||
    normComp.includes('super cup') ||
    normComp.includes('supercup') ||
    normComp.includes('uefa_sc') ||
    normComp.includes('uefa super') ||
    normComp.includes('libertadores') ||
    normComp.includes('conmebol_lib') ||
    normComp.includes('sudamericana') ||
    normComp.includes('conmebol_sud') ||
    normComp.includes('recopa') ||
    normComp.includes('conmebol_rec') ||
    normComp.includes('concacaf_cc') ||
    normComp.includes('concacaf_cac') ||
    normComp.includes('concacaf champions') ||
    normComp.includes('afc_cl') ||
    normComp.includes('afc_cup') ||
    normComp.includes('afc champions') ||
    normComp.includes('caf_cl') ||
    normComp.includes('caf_confed_cup') ||
    normComp.includes('caf_sc') ||
    normComp.includes('caf champions') ||
    normComp.includes('ofc_cl') ||
    normComp.includes('ofc champions') ||
    normComp.includes('continental') ||
    normComp.includes('euro cup') ||
    normComp.includes('euro 20') ||
    normComp.includes('copa america') ||
    normComp.includes('asian cup') ||
    normComp.includes('afcon') ||
    normComp.includes('gold cup') ||
    normTier.includes('continental')
  );
}

/**
 * Classifies competition into priority hierarchy:
 * 'world' (Highest) -> 'continental' (High) -> 'domestic' (Normal country/league)
 */
export function classifyCompetitionType(
  competitionNameOrId?: string,
  countryOrLeague?: string,
  tier?: string
): 'world' | 'continental' | 'domestic' {
  if (isWorldCompetition(competitionNameOrId, countryOrLeague, tier)) {
    return 'world';
  }
  if (isContinentalCompetition(competitionNameOrId, countryOrLeague, tier)) {
    return 'continental';
  }
  return 'domestic';
}

/**
 * Intelligent competition-to-playlist classifier
 */
export function detectPlaylistForCompetition(
  competitionNameOrId?: string,
  countryOrLeague?: string,
  tier?: string
): PlaylistId {
  const normComp = String(competitionNameOrId || '').toLowerCase().trim();
  const normCountry = String(countryOrLeague || '').toLowerCase().trim();
  const normTier = String(tier || '').toLowerCase().trim();

  // 1. WORLD COMPETITION (Highest priority for global & international events)
  if (isWorldCompetition(competitionNameOrId, countryOrLeague, tier)) {
    return 'world';
  }

  // 2. CONTINENTAL EPIC (Priority for continental club & international tournaments)
  if (isContinentalCompetition(competitionNameOrId, countryOrLeague, tier)) {
    return 'continental';
  }

  // 3. GERMANY (German Bundesliga, 2. Bundesliga, DFB-Pokal, German clubs & youth academies)
  if (
    normComp.includes('germany') ||
    normComp.includes('deutschland') ||
    normComp.includes('ger_') ||
    normComp.includes('bundesliga') ||
    normComp.includes('dfb') ||
    normComp.includes('dfl') ||
    normComp.includes('berlin') ||
    normComp.includes('munich') ||
    normComp.includes('münchen') ||
    normComp.includes('dortmund') ||
    normComp.includes('frankfurt') ||
    normComp.includes('leipzig') ||
    normComp.includes('stuttgart') ||
    normComp.includes('bayern') ||
    normComp.includes('leverkusen') ||
    normComp.includes('wolfsburg') ||
    normComp.includes('freiburg') ||
    normComp.includes('mgladbach') ||
    normComp.includes('bremen') ||
    normComp.includes('hamburg') ||
    normComp.includes('schalke') ||
    normComp.includes('cologne') ||
    normComp.includes('köln') ||
    normCountry.includes('germany') ||
    normCountry.includes('deutschland') ||
    normCountry.includes('ger') ||
    normCountry.includes('deu') ||
    normCountry.includes('berlin') ||
    normCountry.includes('munich') ||
    normCountry.includes('dortmund')
  ) {
    return 'germany';
  }

  // 4. ITALY (Italian football leagues, cups & youth leagues)
  if (
    normComp.includes('italy') ||
    normComp.includes('italia') ||
    normComp.includes('ita_') ||
    normComp.includes('serie a') ||
    normComp.includes('serie b') ||
    normComp.includes('coppa italia') ||
    normComp.includes('supercoppa italiana') ||
    normComp.includes('milan') ||
    normComp.includes('roma') ||
    normComp.includes('rome') ||
    normComp.includes('turin') ||
    normComp.includes('torino') ||
    normComp.includes('napoli') ||
    normComp.includes('juventus') ||
    normComp.includes('inter') ||
    normComp.includes('lazio') ||
    normComp.includes('fiorentina') ||
    normCountry.includes('italy') ||
    normCountry.includes('italia') ||
    normCountry.includes('ita') ||
    normCountry.includes('milan') ||
    normCountry.includes('rome') ||
    normCountry.includes('roma')
  ) {
    return 'italy';
  }

  // 5. FRANCE
  if (
    normComp.includes('france') ||
    normComp.includes('fra_') ||
    normComp.includes('ligue 1') ||
    normComp.includes('ligue 2') ||
    normComp.includes('paris') ||
    normComp.includes('coupe de france') ||
    normComp.includes('trophee des champions') ||
    normCountry.includes('france') ||
    normCountry.includes('fra') ||
    normCountry.includes('paris')
  ) {
    return 'france';
  }

  // 6. SPAIN
  if (
    normComp.includes('spain') ||
    normComp.includes('esp_') ||
    normComp.includes('la liga') ||
    normComp.includes('laliga') ||
    normComp.includes('segunda') ||
    normComp.includes('madrid') ||
    normComp.includes('copa del rey') ||
    normComp.includes('supercopa de españa') ||
    (normComp.includes('supercopa') && normCountry.includes('spain')) ||
    normCountry.includes('spain') ||
    normCountry.includes('esp') ||
    normCountry.includes('madrid')
  ) {
    return 'spain';
  }

  // 7. PORTUGAL (Liga Portugal, Liga Portugal 2, Taça de Portugal, Taça da Liga & Portuguese Youth)
  if (
    normComp.includes('portugal') ||
    normComp.includes('por_') ||
    normComp.includes('primeira liga') ||
    normComp.includes('liga portugal') ||
    normComp.includes('taca de portugal') ||
    normComp.includes('taça de portugal') ||
    normComp.includes('taca da liga') ||
    normComp.includes('taça da liga') ||
    normComp.includes('supertaca') ||
    normComp.includes('supertaça') ||
    normComp.includes('benfica') ||
    normComp.includes('sporting') ||
    normComp.includes('porto') ||
    normComp.includes('braga') ||
    normComp.includes('guimaraes') ||
    normComp.includes('guimarães') ||
    normComp.includes('estoril') ||
    normComp.includes('boavista') ||
    normComp.includes('famalicao') ||
    normComp.includes('famalicão') ||
    normComp.includes('rio ave') ||
    normComp.includes('farense') ||
    normComp.includes('lisbon') ||
    normComp.includes('lisboa') ||
    normComp.includes('algarve') ||
    normComp.includes('madeira') ||
    normComp.includes('azores') ||
    normCountry.includes('portugal') ||
    normCountry.includes('por') ||
    normCountry.includes('prt') ||
    normCountry.includes('lisbon') ||
    normCountry.includes('lisboa') ||
    normCountry.includes('porto')
  ) {
    return 'portugal';
  }

  // 8. SAUDI ARABIA / ARABIAN LEAGUE (Saudi Pro League, King's Cup, Saudi Super Cup, Riyadh/Jeddah)
  if (
    normComp.includes('saudi') ||
    normComp.includes('sau_') ||
    normComp.includes('arabia') ||
    normComp.includes('arabian') ||
    normComp.includes('khaleej') ||
    normComp.includes('gulf') ||
    normComp.includes('roshn') ||
    normComp.includes('king cup') ||
    normComp.includes('kings cup') ||
    normComp.includes("king's cup") ||
    normComp.includes('saudi crown prince') ||
    normComp.includes('saudi super cup') ||
    normComp.includes('arab club') ||
    normComp.includes('al-hilal') ||
    normComp.includes('alhilal') ||
    normComp.includes('al-nassr') ||
    normComp.includes('alnassr') ||
    normComp.includes('al-ittihad') ||
    normComp.includes('alittihad') ||
    normComp.includes('al-ahli') ||
    normComp.includes('alahli') ||
    normComp.includes('al-shabab') ||
    normComp.includes('alshabab') ||
    normComp.includes('al-ettifaq') ||
    normComp.includes('alettifaq') ||
    normComp.includes('alqadsiah') ||
    normComp.includes('riyadh') ||
    normComp.includes('jeddah') ||
    normComp.includes('dammam') ||
    normCountry.includes('saudi') ||
    normCountry.includes('arabia') ||
    normCountry.includes('sau') ||
    normCountry.includes('ksa') ||
    normCountry.includes('riyadh') ||
    normCountry.includes('jeddah') ||
    normCountry.includes('gulf') ||
    normCountry.includes('khaleej')
  ) {
    return 'saudi';
  }

  // 7. BRAZIL
  if (
    normComp.includes('brazil') ||
    normComp.includes('brasil') ||
    normComp.includes('bra_') ||
    normComp.includes('brasileir') ||
    (normComp.includes('serie a') && (normCountry.includes('brazil') || normComp.includes('bra'))) ||
    (normComp.includes('serie b') && (normCountry.includes('brazil') || normComp.includes('bra'))) ||
    normComp.includes('copa do brasil') ||
    normComp.includes('sao paulo') ||
    normComp.includes('são paulo') ||
    normComp.includes('paulista') ||
    normComp.includes('carioca') ||
    normCountry.includes('brazil') ||
    normCountry.includes('brasil') ||
    normCountry.includes('bra')
  ) {
    return 'brazil';
  }

  // 8. ARGENTINA
  if (
    normComp.includes('argentina') ||
    normComp.includes('arg_') ||
    normComp.includes('primera a') ||
    normComp.includes('primera división') ||
    normComp.includes('primera division') ||
    normComp.includes('primera b') ||
    normComp.includes('copa argentina') ||
    normComp.includes('copa de la liga') ||
    normComp.includes('buenos aires') ||
    normComp.includes('supercopa argentina') ||
    normCountry.includes('argentina') ||
    normCountry.includes('arg') ||
    normCountry.includes('buenos aires')
  ) {
    return 'argentina';
  }

  // 9. ENGLAND
  if (
    normComp.includes('england') ||
    normComp.includes('eng_') ||
    normComp.includes('premier') ||
    normComp.includes('epl') ||
    normComp.includes('championship') ||
    normComp.includes('fa cup') ||
    normComp.includes('carabao') ||
    normComp.includes('efl cup') ||
    normComp.includes('community shield') ||
    normComp.includes('london') ||
    normCountry.includes('england') ||
    normCountry.includes('eng') ||
    normCountry.includes('london') ||
    normCountry.includes('uk') ||
    normCountry.includes('britain')
  ) {
    return 'england';
  }

  // Default fallback for generic leagues
  return 'england';
}

/**
 * Checks if a given match stageTitle represents a tournament or cup final.
 */
export function isCompetitionFinal(stageTitle?: string): boolean {
  if (!stageTitle) return false;
  const s = stageTitle.toLowerCase().trim();
  // Negative filters: semi-finals, quarter-finals, preliminary rounds are NOT finals
  if (
    s.includes('semi') ||
    s.includes('quarter') ||
    s.includes('cuartos') ||
    s.includes('octavos') ||
    s.includes('demi') ||
    s.includes('quarts') ||
    s.includes('halbfinale') ||
    s.includes('viertelfinale')
  ) {
    return false;
  }
  // Positive final indicators
  if (
    s.includes('final') ||
    s.includes('decider') ||
    s.includes('championship match') ||
    s.includes('title decider') ||
    s.includes('cup final') ||
    s.includes('🏆')
  ) {
    return true;
  }
  return false;
}

/**
 * Returns the designated final track ID for each playlist:
 * - Continental finals: 'epic-4' ("Wheel of Destiny")
 * - World finals: 'world-final' ("Crown of the Titans")
 * - League/Cup finals: Unique national final anthems inspired by Wheel of Destiny's epic style
 */
export function getFinalTrackIdForPlaylist(playlistId: PlaylistId): string {
  switch (playlistId) {
    case 'continental':
      return 'epic-4'; // Original "Wheel of Destiny"
    case 'world':
      return 'world-final'; // "Crown of the Titans" with poly-percussion & global choir
    case 'england':
      return 'eng-final'; // "Lords of Wembley" with overdrive rock power chords & symphonic brass
    case 'spain':
      return 'esp-final'; // "Duelo Real" with flamenco nylon rasgueado & paso doble brass
    case 'germany':
      return 'ger-final'; // "Sturm der Götter" with industrial electronic bass & stadium synth-rock
    case 'italy':
      return 'ita-final'; // "Notte di Gloria" with grand piano, operatic tenor & Italo-dramatic crescendo
    case 'france':
      return 'fra-final'; // "Le Sacre de Saint-Denis" with French Touch filtered bass & chic electro-symphonic
    case 'brazil':
      return 'br-final'; // "O Soberano do Maracanã" with thunderous surdo & carnival batucada brass
    case 'argentina':
      return 'arg-final'; // "Furia Monumental" with soulful bandoneón & bombo legüero tablón chants
    case 'portugal':
      return 'por-final'; // "O Conquistador do Jamor" with 12-string guitarra portuguesa & Kuduro stabs
    case 'saudi':
      return 'sau-final'; // "Taj Al-Dhahab" with authentic Bayati oud, Khaleeji claps & royal brass
    default:
      return 'epic-4';
  }
}

export interface MatchSoundtrackSelection {
  playlistId: PlaylistId;
  trackId: string;
  trackIndex: number;
  isFinal: boolean;
  competitionCategory: 'world' | 'continental' | 'domestic';
  reason: string;
}

/**
 * Selects the authentic soundtrack for key matches and finals:
 * - World Tournaments -> World playlist (or 'world-final' if Final)
 * - Continental Tournaments -> Continental playlist (or 'epic-4' if Final)
 * - Domestic Leagues/Cups -> That league's playlist (or that league's unique Cup Final song if Final)
 */
export function selectMatchSoundtrack(options: {
  stageTitle?: string;
  competitionType?: 'world' | 'continental' | 'domestic' | 'auto';
  countryOrLeague?: string;
  player?: { league?: string; clubCountry?: string; country?: string };
  opponentName?: string;
  playerTeamName?: string;
  clubCountry?: string;
}): MatchSoundtrackSelection {
  const {
    stageTitle,
    competitionType = 'auto',
    countryOrLeague,
    player,
    clubCountry,
  } = options;

  const isFinal = isCompetitionFinal(stageTitle);
  const detectedCategory = classifyCompetitionType(stageTitle, countryOrLeague);
  const finalCategory: 'world' | 'continental' | 'domestic' =
    competitionType !== 'auto' ? competitionType : detectedCategory;

  let targetPlaylist: PlaylistId;

  if (finalCategory === 'world') {
    targetPlaylist = 'world';
  } else if (finalCategory === 'continental') {
    targetPlaylist = 'continental';
  } else {
    targetPlaylist = detectPlaylistForCompetition(
      stageTitle || countryOrLeague || player?.league,
      countryOrLeague || clubCountry || player?.clubCountry || player?.country
    );
  }

  const playlist = ALL_PLAYLISTS[targetPlaylist] || ALL_PLAYLISTS.england;

  if (isFinal) {
    const finalTrackId = getFinalTrackIdForPlaylist(targetPlaylist);
    const trackIndex = playlist.tracks.findIndex((t) => t.id === finalTrackId);
    return {
      playlistId: targetPlaylist,
      trackId: finalTrackId,
      trackIndex: trackIndex >= 0 ? trackIndex : 0,
      isFinal: true,
      competitionCategory: finalCategory,
      reason: `Final match detected: playing ${finalTrackId} for ${targetPlaylist} final`,
    };
  } else {
    // For regular key matches: pick from non-final tracks so Wheel of Destiny and finals tracks are reserved
    const regularTracks = playlist.tracks.filter((t) => !t.isFinalOnly);
    const validTracks = regularTracks.length > 0 ? regularTracks : playlist.tracks;
    const trackObj = validTracks[Math.floor(Math.random() * validTracks.length)];
    const trackIndex = playlist.tracks.findIndex((t) => t.id === trackObj.id);
    return {
      playlistId: targetPlaylist,
      trackId: trackObj.id,
      trackIndex: trackIndex >= 0 ? trackIndex : 0,
      isFinal: false,
      competitionCategory: finalCategory,
      reason: `Key match detected: playing ${trackObj.title} from ${targetPlaylist} playlist`,
    };
  }
}

