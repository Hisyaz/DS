import { PlayerCardData } from '../types';
import { EditorTeamData, SquadSlot, TeamSquadSaveFile } from '../types/leagueEditor';

export interface UniqueElitePlayerDef {
  id: string;
  teamId: string;
  shirtNumber: number;
  matchRole: 'mancity_st' | 'realmadrid_st' | 'psg_winger' | 'mancity_cdm' | 'arsenal_cdm' | 'corinthians_st' | string;
  name: string;
  nationality: { code: string; iso: string; name: string };
  position: 'ATT' | 'MID' | 'DEF' | 'GK';
  subPosition: string;
  playStyle: string;
  ovr: number;
  potentialOvr: number;
  heightCm: number;
  weightKg: number;
  statsOverride: {
    pro: number;
    def: number;
    cre: number;
    men: number;
    goa: number;
    phy: number;
    detailed: Partial<{
      pace: number;
      stamina: number;
      strength: number;
      ballControl: number;
      retention: number;
      dribbling: number;
      shortPass: number;
      longPass: number;
      crossing: number;
      shooting: number;
      heading: number;
      longShots: number;
      tackling: number;
      marking: number;
      interceptions: number;
      positioning: number;
      composure: number;
      reactions: number;
    }>;
  };
}

/**
 * GLOBAL UNIQUE ELITE PLAYERS REGISTRY
 * Scaled strictly to realistic elite brackets:
 * - 90–94 OVR: Top 5 players in the entire world (Haal of Norway 93, Kiki Mobutu 94, Rodi 91, Oussie Le Voler 90)
 * - 95+ OVR: Reserved exclusively for prime historical legends (prime Messi, Cristiano Ronaldo, Pelé, Maradona)
 * - 88 OVR: Declan Bread (Arsenal CDM - league superstar)
 * - 84 OVR: Emphies Detay (Corinthians Complete Attacker - #1 player in South America)
 * - All other South American players capped <= 82 OVR (below Emphies Detay)
 * - All other European non-unique players capped <= 87 OVR
 */
export const UNIQUE_ELITE_PLAYERS_REGISTRY: UniqueElitePlayerDef[] = [
  // 1. MANCHESTER CITY #9 — HAAL OF NORWAY (93 OVR) — Top Premier League striker
  {
    id: 'unique_haal_norway',
    teamId: 'eng_mancity',
    shirtNumber: 9,
    matchRole: 'mancity_st',
    name: 'Haal of Norway',
    nationality: { code: 'NOR', iso: 'no', name: 'Norway' },
    position: 'ATT',
    subPosition: 'ST',
    playStyle: 'Poacher',
    ovr: 93,
    potentialOvr: 94,
    heightCm: 195,
    weightKg: 88,
    statsOverride: {
      pro: 93,
      def: 42,
      cre: 84,
      men: 93,
      goa: 20,
      phy: 93,
      detailed: {
        pace: 89,
        stamina: 88,
        strength: 94,
        ballControl: 88,
        retention: 86,
        dribbling: 86,
        shortPass: 82,
        longPass: 76,
        crossing: 72,
        shooting: 94,
        heading: 92,
        longShots: 88,
        tackling: 40,
        marking: 40,
        interceptions: 40,
        positioning: 94,
        composure: 92,
        reactions: 93,
      },
    },
  },

  // ==========================================
  // SPAIN LA LIGA STAR PLAYERS (34 STARS)
  // ==========================================

  // 1. REAL MADRID #10 — KIKI MOBUTU (Kylian Mbappé) (94 OVR) — 27yo Complete Striker, France
  {
    id: 'unique_kiki_mobutu',
    teamId: 'esp_realmadrid',
    shirtNumber: 10,
    matchRole: 'realmadrid_st',
    name: 'Kiki Mobutu',
    nationality: { code: 'FRA', iso: 'fr', name: 'France' },
    position: 'ATT',
    subPosition: 'ST',
    playStyle: 'Complete',
    ovr: 94,
    potentialOvr: 94,
    heightCm: 178,
    weightKg: 75,
    statsOverride: {
      pro: 94,
      def: 44,
      cre: 92,
      men: 93,
      goa: 20,
      phy: 89,
      detailed: {
        pace: 95,
        stamina: 90,
        strength: 84,
        ballControl: 93,
        retention: 92,
        dribbling: 94,
        shortPass: 88,
        longPass: 84,
        crossing: 84,
        shooting: 94,
        heading: 82,
        longShots: 90,
        tackling: 40,
        marking: 40,
        interceptions: 42,
        positioning: 94,
        composure: 93,
        reactions: 94,
      },
    },
  },

  // 2. FC BARCELONA #16 — RODI (Rodri) (91 OVR) — 30yo Anchor CDM, Spain
  {
    id: 'unique_rodi',
    teamId: 'esp_barcelona',
    shirtNumber: 16,
    matchRole: 'barcelona_cdm',
    name: 'Rodi',
    nationality: { code: 'ESP', iso: 'es', name: 'Spain' },
    position: 'MID',
    subPosition: 'CDM',
    playStyle: 'Anchor',
    ovr: 91,
    potentialOvr: 92,
    heightCm: 191,
    weightKg: 82,
    statsOverride: {
      pro: 88,
      def: 91,
      cre: 91,
      men: 93,
      goa: 20,
      phy: 90,
      detailed: {
        pace: 78,
        stamina: 92,
        strength: 89,
        ballControl: 91,
        retention: 92,
        dribbling: 86,
        shortPass: 93,
        longPass: 92,
        crossing: 82,
        shooting: 86,
        heading: 86,
        longShots: 91,
        tackling: 91,
        marking: 90,
        interceptions: 91,
        positioning: 91,
        composure: 94,
        reactions: 92,
      },
    },
  },

  // 3. FC BARCELONA #19 — YAMIN LEMAL (Lamine Yamal) (91 OVR) — 19yo Inverted RW, Spain
  {
    id: 'unique_yamin_lemal',
    teamId: 'esp_barcelona',
    shirtNumber: 19,
    matchRole: 'barcelona_rw',
    name: 'Yamin Lemal',
    nationality: { code: 'ESP', iso: 'es', name: 'Spain' },
    position: 'ATT',
    subPosition: 'RW',
    playStyle: 'Inverted',
    ovr: 91,
    potentialOvr: 95,
    heightCm: 178,
    weightKg: 66,
    statsOverride: {
      pro: 90,
      def: 45,
      cre: 93,
      men: 91,
      goa: 20,
      phy: 80,
      detailed: {
        pace: 93,
        stamina: 87,
        strength: 72,
        ballControl: 94,
        retention: 93,
        dribbling: 95,
        shortPass: 91,
        longPass: 89,
        crossing: 92,
        shooting: 88,
        heading: 68,
        longShots: 90,
        tackling: 45,
        marking: 42,
        interceptions: 48,
        positioning: 91,
        composure: 92,
        reactions: 93,
      },
    },
  },

  // 4. REAL MADRID #5 — JUDAH BELLMAN (Jude Bellingham) (89 OVR) — 23yo Engine CAM, England
  {
    id: 'unique_judah_bellman',
    teamId: 'esp_realmadrid',
    shirtNumber: 5,
    matchRole: 'realmadrid_cam',
    name: 'Judah Bellman',
    nationality: { code: 'ENG', iso: 'gb-eng', name: 'England' },
    position: 'MID',
    subPosition: 'CAM',
    playStyle: 'Engine',
    ovr: 89,
    potentialOvr: 93,
    heightCm: 186,
    weightKg: 77,
    statsOverride: {
      pro: 89,
      def: 80,
      cre: 90,
      men: 92,
      goa: 20,
      phy: 89,
      detailed: {
        pace: 84,
        stamina: 94,
        strength: 87,
        ballControl: 90,
        retention: 91,
        dribbling: 89,
        shortPass: 90,
        longPass: 88,
        crossing: 80,
        shooting: 88,
        heading: 86,
        longShots: 88,
        tackling: 82,
        marking: 80,
        interceptions: 84,
        positioning: 91,
        composure: 92,
        reactions: 91,
      },
    },
  },

  // 5. REAL MADRID #7 — VININHO JUNIOR (Vinícius Júnior) (89 OVR) — 26yo Prolific LW, Brazil
  {
    id: 'unique_vininho_junior',
    teamId: 'esp_realmadrid',
    shirtNumber: 7,
    matchRole: 'realmadrid_lw',
    name: 'Vininho Junior',
    nationality: { code: 'BRA', iso: 'br', name: 'Brazil' },
    position: 'ATT',
    subPosition: 'LW',
    playStyle: 'Prolific',
    ovr: 89,
    potentialOvr: 92,
    heightCm: 176,
    weightKg: 73,
    statsOverride: {
      pro: 90,
      def: 38,
      cre: 88,
      men: 89,
      goa: 20,
      phy: 82,
      detailed: {
        pace: 96,
        stamina: 88,
        strength: 74,
        ballControl: 92,
        retention: 91,
        dribbling: 94,
        shortPass: 86,
        longPass: 78,
        crossing: 85,
        shooting: 89,
        heading: 70,
        longShots: 87,
        tackling: 36,
        marking: 34,
        interceptions: 40,
        positioning: 91,
        composure: 90,
        reactions: 92,
      },
    },
  },

  // 6. FC BARCELONA #11 — RAPAO (Raphinha) (86 OVR) — 29yo Pressing LW, Brazil
  {
    id: 'unique_rapao',
    teamId: 'esp_barcelona',
    shirtNumber: 11,
    matchRole: 'barcelona_lw',
    name: 'Rapao',
    nationality: { code: 'BRA', iso: 'br', name: 'Brazil' },
    position: 'ATT',
    subPosition: 'LW',
    playStyle: 'Pressing',
    ovr: 86,
    potentialOvr: 87,
    heightCm: 176,
    weightKg: 68,
    statsOverride: {
      pro: 87,
      def: 58,
      cre: 88,
      men: 88,
      goa: 20,
      phy: 82,
      detailed: {
        pace: 89,
        stamina: 93,
        strength: 76,
        ballControl: 88,
        retention: 87,
        dribbling: 88,
        shortPass: 87,
        longPass: 85,
        crossing: 88,
        shooting: 86,
        heading: 72,
        longShots: 88,
        tackling: 60,
        marking: 56,
        interceptions: 62,
        positioning: 88,
        composure: 87,
        reactions: 88,
      },
    },
  },

  // 7. FC BARCELONA #2 — PABLO CUBATA (Pau Cubarsí) (86 OVR) — 19yo Distributor CB, Spain
  {
    id: 'unique_pablo_cubata',
    teamId: 'esp_barcelona',
    shirtNumber: 2,
    matchRole: 'barcelona_cb',
    name: 'Pablo Cubata',
    nationality: { code: 'ESP', iso: 'es', name: 'Spain' },
    position: 'DEF',
    subPosition: 'CB',
    playStyle: 'Distributor',
    ovr: 86,
    potentialOvr: 92,
    heightCm: 184,
    weightKg: 75,
    statsOverride: {
      pro: 80,
      def: 88,
      cre: 88,
      men: 89,
      goa: 20,
      phy: 84,
      detailed: {
        pace: 78,
        stamina: 85,
        strength: 82,
        ballControl: 87,
        retention: 88,
        dribbling: 81,
        shortPass: 91,
        longPass: 92,
        crossing: 74,
        shooting: 60,
        heading: 85,
        longShots: 65,
        tackling: 88,
        marking: 87,
        interceptions: 89,
        positioning: 88,
        composure: 91,
        reactions: 88,
      },
    },
  },

  // 8. REAL SOCIEDAD #10 — MICHEL OYECHAVAL (Mikel Oyarzabal) (86 OVR) — 29yo Complete Striker, Spain
  {
    id: 'unique_michel_oyechaval',
    teamId: 'esp_realsociedad',
    shirtNumber: 10,
    matchRole: 'sociedad_st',
    name: 'Michel Oyechaval',
    nationality: { code: 'ESP', iso: 'es', name: 'Spain' },
    position: 'ATT',
    subPosition: 'ST',
    playStyle: 'Complete',
    ovr: 86,
    potentialOvr: 86,
    heightCm: 181,
    weightKg: 78,
    statsOverride: {
      pro: 88,
      def: 52,
      cre: 86,
      men: 88,
      goa: 20,
      phy: 84,
      detailed: {
        pace: 82,
        stamina: 89,
        strength: 82,
        ballControl: 87,
        retention: 87,
        dribbling: 85,
        shortPass: 86,
        longPass: 83,
        crossing: 85,
        shooting: 88,
        heading: 84,
        longShots: 86,
        tackling: 50,
        marking: 48,
        interceptions: 54,
        positioning: 89,
        composure: 89,
        reactions: 88,
      },
    },
  },

  // 9. REAL MADRID #8 — PAJARITO LAVERDE (Federico Valverde) (85 OVR) — 28yo Box-to-Box CM, Uruguay
  {
    id: 'unique_pajarito_laverde',
    teamId: 'esp_realmadrid',
    shirtNumber: 8,
    matchRole: 'realmadrid_cm',
    name: 'Pajarito Laverde',
    nationality: { code: 'URU', iso: 'uy', name: 'Uruguay' },
    position: 'MID',
    subPosition: 'CM',
    playStyle: 'Box-to-Box',
    ovr: 85,
    potentialOvr: 87,
    heightCm: 182,
    weightKg: 78,
    statsOverride: {
      pro: 86,
      def: 84,
      cre: 87,
      men: 88,
      goa: 20,
      phy: 89,
      detailed: {
        pace: 89,
        stamina: 95,
        strength: 85,
        ballControl: 86,
        retention: 87,
        dribbling: 84,
        shortPass: 88,
        longPass: 89,
        crossing: 83,
        shooting: 86,
        heading: 78,
        longShots: 92,
        tackling: 84,
        marking: 82,
        interceptions: 85,
        positioning: 87,
        composure: 88,
        reactions: 88,
      },
    },
  },

  // 10. FC BARCELONA #1 — JUAN GARCEO (Joan García) (85 OVR) — 25yo Balanced GK, Spain
  {
    id: 'unique_juan_garceo',
    teamId: 'esp_barcelona',
    shirtNumber: 1,
    matchRole: 'barcelona_gk',
    name: 'Juan Garceo',
    nationality: { code: 'ESP', iso: 'es', name: 'Spain' },
    position: 'GK',
    subPosition: 'GK',
    playStyle: 'Balanced',
    ovr: 85,
    potentialOvr: 89,
    heightCm: 191,
    weightKg: 82,
    statsOverride: {
      pro: 85,
      def: 85,
      cre: 78,
      men: 87,
      goa: 85,
      phy: 84,
      detailed: {
        pace: 56,
        stamina: 80,
        strength: 84,
        ballControl: 78,
        retention: 76,
        dribbling: 62,
        shortPass: 84,
        longPass: 86,
        crossing: 32,
        shooting: 28,
        heading: 42,
        longShots: 28,
        tackling: 38,
        marking: 32,
        interceptions: 48,
        positioning: 87,
        composure: 86,
        reactions: 88,
      },
    },
  },

  // 11. REAL MADRID #1 — TIBO CORTERNOS (Thibaut Courtois) (85 OVR) — 34yo Balanced GK, Belgium
  {
    id: 'unique_tibo_corternos',
    teamId: 'esp_realmadrid',
    shirtNumber: 1,
    matchRole: 'realmadrid_gk',
    name: 'Tibo Corternos',
    nationality: { code: 'BEL', iso: 'be', name: 'Belgium' },
    position: 'GK',
    subPosition: 'GK',
    playStyle: 'Balanced',
    ovr: 85,
    potentialOvr: 85,
    heightCm: 200,
    weightKg: 96,
    statsOverride: {
      pro: 85,
      def: 85,
      cre: 75,
      men: 88,
      goa: 85,
      phy: 86,
      detailed: {
        pace: 50,
        stamina: 78,
        strength: 90,
        ballControl: 75,
        retention: 74,
        dribbling: 55,
        shortPass: 80,
        longPass: 82,
        crossing: 30,
        shooting: 25,
        heading: 48,
        longShots: 25,
        tackling: 35,
        marking: 30,
        interceptions: 45,
        positioning: 89,
        composure: 88,
        reactions: 88,
      },
    },
  },

  // 12. ATLÉTICO MADRID #19 — JULY ALVEZ (Julián Álvarez) (85 OVR) — 26yo Decoy Striker, Argentina
  {
    id: 'unique_july_alvez',
    teamId: 'esp_atletico',
    shirtNumber: 19,
    matchRole: 'atletico_st',
    name: 'July Alvez',
    nationality: { code: 'ARG', iso: 'ar', name: 'Argentina' },
    position: 'ATT',
    subPosition: 'ST',
    playStyle: 'Decoy',
    ovr: 85,
    potentialOvr: 88,
    heightCm: 170,
    weightKg: 71,
    statsOverride: {
      pro: 87,
      def: 52,
      cre: 84,
      men: 88,
      goa: 20,
      phy: 84,
      detailed: {
        pace: 86,
        stamina: 92,
        strength: 80,
        ballControl: 86,
        retention: 86,
        dribbling: 86,
        shortPass: 85,
        longPass: 80,
        crossing: 78,
        shooting: 88,
        heading: 78,
        longShots: 86,
        tackling: 52,
        marking: 48,
        interceptions: 54,
        positioning: 89,
        composure: 87,
        reactions: 88,
      },
    },
  },

  // 13. ATHLETIC BILBAO #14 — AYMERIC LA PORTE (Aymeric Laporte) (85 OVR) — 32yo Stopper CB, Spain
  {
    id: 'unique_aymeric_laporte',
    teamId: 'esp_athletic',
    shirtNumber: 14,
    matchRole: 'athletic_cb',
    name: 'Aymeric La Porte',
    nationality: { code: 'ESP', iso: 'es', name: 'Spain' },
    position: 'DEF',
    subPosition: 'CB',
    playStyle: 'Stopper',
    ovr: 85,
    potentialOvr: 85,
    heightCm: 191,
    weightKg: 85,
    statsOverride: {
      pro: 76,
      def: 87,
      cre: 82,
      men: 87,
      goa: 20,
      phy: 87,
      detailed: {
        pace: 76,
        stamina: 84,
        strength: 88,
        ballControl: 82,
        retention: 82,
        dribbling: 74,
        shortPass: 86,
        longPass: 88,
        crossing: 65,
        shooting: 55,
        heading: 88,
        longShots: 62,
        tackling: 87,
        marking: 86,
        interceptions: 87,
        positioning: 86,
        composure: 88,
        reactions: 86,
      },
    },
  },

  // 14. REAL MADRID #20 — BERNARD SILVAO (Bernardo Silva) (84 OVR) — 32yo Creator CAM, Portugal
  {
    id: 'unique_bernard_silvao',
    teamId: 'esp_realmadrid',
    shirtNumber: 20,
    matchRole: 'realmadrid_cam2',
    name: 'Bernard Silvao',
    nationality: { code: 'POR', iso: 'pt', name: 'Portugal' },
    position: 'MID',
    subPosition: 'CAM',
    playStyle: 'Creator',
    ovr: 84,
    potentialOvr: 84,
    heightCm: 173,
    weightKg: 64,
    statsOverride: {
      pro: 84,
      def: 62,
      cre: 91,
      men: 89,
      goa: 20,
      phy: 78,
      detailed: {
        pace: 78,
        stamina: 92,
        strength: 68,
        ballControl: 92,
        retention: 93,
        dribbling: 92,
        shortPass: 91,
        longPass: 88,
        crossing: 86,
        shooting: 82,
        heading: 62,
        longShots: 84,
        tackling: 62,
        marking: 60,
        interceptions: 64,
        positioning: 87,
        composure: 91,
        reactions: 89,
      },
    },
  },

  // 15. FC BARCELONA #21 — FRANCIS DE ROON (Frenkie de Jong) (84 OVR) — 29yo Maestro CM, Netherlands
  {
    id: 'unique_francis_deroon',
    teamId: 'esp_barcelona',
    shirtNumber: 21,
    matchRole: 'barcelona_cm',
    name: 'Francis De Roon',
    nationality: { code: 'NED', iso: 'nl', name: 'Netherlands' },
    position: 'MID',
    subPosition: 'CM',
    playStyle: 'Maestro',
    ovr: 84,
    potentialOvr: 85,
    heightCm: 180,
    weightKg: 74,
    statsOverride: {
      pro: 82,
      def: 78,
      cre: 90,
      men: 88,
      goa: 20,
      phy: 82,
      detailed: {
        pace: 80,
        stamina: 88,
        strength: 78,
        ballControl: 91,
        retention: 92,
        dribbling: 89,
        shortPass: 91,
        longPass: 89,
        crossing: 78,
        shooting: 78,
        heading: 72,
        longShots: 80,
        tackling: 78,
        marking: 76,
        interceptions: 80,
        positioning: 86,
        composure: 91,
        reactions: 88,
      },
    },
  },

  // 16. FC BARCELONA #16 — FERMIN LOPEZ (Fermín López) (84 OVR) — 23yo Engine CAM, Spain
  {
    id: 'unique_fermin_lopez',
    teamId: 'esp_barcelona',
    shirtNumber: 16,
    matchRole: 'barcelona_cam',
    name: 'Fermin Lopez',
    nationality: { code: 'ESP', iso: 'es', name: 'Spain' },
    position: 'MID',
    subPosition: 'CAM',
    playStyle: 'Engine',
    ovr: 84,
    potentialOvr: 88,
    heightCm: 174,
    weightKg: 68,
    statsOverride: {
      pro: 86,
      def: 62,
      cre: 85,
      men: 86,
      goa: 20,
      phy: 82,
      detailed: {
        pace: 84,
        stamina: 90,
        strength: 78,
        ballControl: 86,
        retention: 85,
        dribbling: 85,
        shortPass: 85,
        longPass: 80,
        crossing: 76,
        shooting: 86,
        heading: 74,
        longShots: 87,
        tackling: 62,
        marking: 58,
        interceptions: 64,
        positioning: 87,
        composure: 85,
        reactions: 86,
      },
    },
  },

  // 17. REAL BETIS #22 — ISCO ALARCON (Isco) (84 OVR) — 34yo Creator CAM, Spain
  {
    id: 'unique_isco_alarcon',
    teamId: 'esp_realbetis',
    shirtNumber: 22,
    matchRole: 'betis_cam',
    name: 'Isco Alarcon',
    nationality: { code: 'ESP', iso: 'es', name: 'Spain' },
    position: 'MID',
    subPosition: 'CAM',
    playStyle: 'Creator',
    ovr: 84,
    potentialOvr: 84,
    heightCm: 176,
    weightKg: 79,
    statsOverride: {
      pro: 84,
      def: 55,
      cre: 90,
      men: 87,
      goa: 20,
      phy: 76,
      detailed: {
        pace: 72,
        stamina: 80,
        strength: 72,
        ballControl: 92,
        retention: 92,
        dribbling: 91,
        shortPass: 90,
        longPass: 89,
        crossing: 86,
        shooting: 82,
        heading: 64,
        longShots: 85,
        tackling: 55,
        marking: 52,
        interceptions: 56,
        positioning: 86,
        composure: 90,
        reactions: 87,
      },
    },
  },

  // 18. REAL MADRID #21 — IBRAHIM DIEZ (Brahim Díaz) (84 OVR) — 27yo Creator CAM, Morocco
  {
    id: 'unique_ibrahim_diez',
    teamId: 'esp_realmadrid',
    shirtNumber: 21,
    matchRole: 'realmadrid_cam3',
    name: 'Ibrahim Diez',
    nationality: { code: 'MAR', iso: 'ma', name: 'Morocco' },
    position: 'MID',
    subPosition: 'CAM',
    playStyle: 'Creator',
    ovr: 84,
    potentialOvr: 86,
    heightCm: 171,
    weightKg: 68,
    statsOverride: {
      pro: 84,
      def: 48,
      cre: 87,
      men: 85,
      goa: 20,
      phy: 76,
      detailed: {
        pace: 85,
        stamina: 82,
        strength: 68,
        ballControl: 89,
        retention: 88,
        dribbling: 90,
        shortPass: 86,
        longPass: 82,
        crossing: 83,
        shooting: 82,
        heading: 58,
        longShots: 84,
        tackling: 48,
        marking: 45,
        interceptions: 50,
        positioning: 84,
        composure: 85,
        reactions: 86,
      },
    },
  },

  // 19. FC BARCELONA #17 — ANTONIO FLACON (Anthony Gordon) (83 OVR) — 25yo Pressing LW, England
  {
    id: 'unique_antonio_flacon',
    teamId: 'esp_barcelona',
    shirtNumber: 17,
    matchRole: 'barcelona_lw2',
    name: 'Antonio Flacon',
    nationality: { code: 'ENG', iso: 'gb-eng', name: 'England' },
    position: 'ATT',
    subPosition: 'LW',
    playStyle: 'Pressing',
    ovr: 83,
    potentialOvr: 86,
    heightCm: 183,
    weightKg: 73,
    statsOverride: {
      pro: 84,
      def: 55,
      cre: 84,
      men: 85,
      goa: 20,
      phy: 82,
      detailed: {
        pace: 92,
        stamina: 90,
        strength: 76,
        ballControl: 84,
        retention: 83,
        dribbling: 85,
        shortPass: 82,
        longPass: 78,
        crossing: 84,
        shooting: 83,
        heading: 68,
        longShots: 82,
        tackling: 58,
        marking: 54,
        interceptions: 60,
        positioning: 84,
        composure: 83,
        reactions: 86,
      },
    },
  },

  // 20. REAL MADRID #24 — IAN DIOMEDES (Yan Diomandé) (83 OVR) — 19yo Prolific RW, Ivory Coast
  {
    id: 'unique_ian_diomedes',
    teamId: 'esp_realmadrid',
    shirtNumber: 24,
    matchRole: 'realmadrid_rw2',
    name: 'Ian Diomedes',
    nationality: { code: 'CIV', iso: 'ci', name: 'Ivory Coast' },
    position: 'ATT',
    subPosition: 'RW',
    playStyle: 'Prolific',
    ovr: 83,
    potentialOvr: 90,
    heightCm: 179,
    weightKg: 72,
    statsOverride: {
      pro: 84,
      def: 42,
      cre: 83,
      men: 83,
      goa: 20,
      phy: 80,
      detailed: {
        pace: 93,
        stamina: 84,
        strength: 76,
        ballControl: 86,
        retention: 85,
        dribbling: 88,
        shortPass: 82,
        longPass: 78,
        crossing: 82,
        shooting: 83,
        heading: 68,
        longShots: 84,
        tackling: 42,
        marking: 40,
        interceptions: 45,
        positioning: 84,
        composure: 82,
        reactions: 85,
      },
    },
  },

  // 21. REAL MADRID #11 — RONINHO GOIS (Rodrygo) (83 OVR) — 25yo Prolific RW, Brazil
  {
    id: 'unique_roninho_gois',
    teamId: 'esp_realmadrid',
    shirtNumber: 11,
    matchRole: 'realmadrid_rw',
    name: 'Roninho Gois',
    nationality: { code: 'BRA', iso: 'br', name: 'Brazil' },
    position: 'ATT',
    subPosition: 'RW',
    playStyle: 'Prolific',
    ovr: 83,
    potentialOvr: 86,
    heightCm: 174,
    weightKg: 64,
    statsOverride: {
      pro: 85,
      def: 44,
      cre: 84,
      men: 85,
      goa: 20,
      phy: 78,
      detailed: {
        pace: 88,
        stamina: 84,
        strength: 72,
        ballControl: 88,
        retention: 87,
        dribbling: 88,
        shortPass: 84,
        longPass: 79,
        crossing: 83,
        shooting: 84,
        heading: 70,
        longShots: 83,
        tackling: 44,
        marking: 42,
        interceptions: 46,
        positioning: 85,
        composure: 85,
        reactions: 86,
      },
    },
  },

  // 22. FC BARCELONA #8 — PITI (Pedri) (83 OVR) — 23yo Runner CM, Spain
  {
    id: 'unique_piti',
    teamId: 'esp_barcelona',
    shirtNumber: 8,
    matchRole: 'barcelona_cm2',
    name: 'Piti',
    nationality: { code: 'ESP', iso: 'es', name: 'Spain' },
    position: 'MID',
    subPosition: 'CM',
    playStyle: 'Runner',
    ovr: 83,
    potentialOvr: 89,
    heightCm: 174,
    weightKg: 60,
    statsOverride: {
      pro: 82,
      def: 70,
      cre: 89,
      men: 87,
      goa: 20,
      phy: 76,
      detailed: {
        pace: 80,
        stamina: 89,
        strength: 70,
        ballControl: 90,
        retention: 91,
        dribbling: 89,
        shortPass: 90,
        longPass: 87,
        crossing: 82,
        shooting: 78,
        heading: 62,
        longShots: 80,
        tackling: 70,
        marking: 68,
        interceptions: 72,
        positioning: 86,
        composure: 88,
        reactions: 87,
      },
    },
  },

  // 23. ATHLETIC BILBAO #1 — UNAN SIMONI (Unai Simón) (83 OVR) — 29yo Balanced GK, Spain
  {
    id: 'unique_unan_simoni',
    teamId: 'esp_athletic',
    shirtNumber: 1,
    matchRole: 'athletic_gk',
    name: 'Unan Simoni',
    nationality: { code: 'ESP', iso: 'es', name: 'Spain' },
    position: 'GK',
    subPosition: 'GK',
    playStyle: 'Balanced',
    ovr: 83,
    potentialOvr: 84,
    heightCm: 190,
    weightKg: 89,
    statsOverride: {
      pro: 83,
      def: 83,
      cre: 74,
      men: 85,
      goa: 83,
      phy: 84,
      detailed: {
        pace: 52,
        stamina: 78,
        strength: 86,
        ballControl: 74,
        retention: 72,
        dribbling: 58,
        shortPass: 80,
        longPass: 82,
        crossing: 30,
        shooting: 25,
        heading: 42,
        longShots: 25,
        tackling: 36,
        marking: 30,
        interceptions: 45,
        positioning: 85,
        composure: 84,
        reactions: 86,
      },
    },
  },

  // 24. CA OSASUNA #17 — ANTY BUDEMAR (Ante Budimir) (83 OVR) — 35yo Target Striker, Croatia
  {
    id: 'unique_anty_budemar',
    teamId: 'esp_osasuna',
    shirtNumber: 17,
    matchRole: 'osasuna_st',
    name: 'Anty Budemar',
    nationality: { code: 'CRO', iso: 'hr', name: 'Croatia' },
    position: 'ATT',
    subPosition: 'ST',
    playStyle: 'Target',
    ovr: 83,
    potentialOvr: 83,
    heightCm: 190,
    weightKg: 84,
    statsOverride: {
      pro: 85,
      def: 42,
      cre: 76,
      men: 85,
      goa: 20,
      phy: 88,
      detailed: {
        pace: 75,
        stamina: 84,
        strength: 90,
        ballControl: 82,
        retention: 84,
        dribbling: 78,
        shortPass: 78,
        longPass: 70,
        crossing: 68,
        shooting: 87,
        heading: 92,
        longShots: 82,
        tackling: 42,
        marking: 40,
        interceptions: 45,
        positioning: 88,
        composure: 86,
        reactions: 85,
      },
    },
  },

  // 25. CELTA VIGO #10 — SANTIAGO HELICES (Iago Aspas) (83 OVR) — 39yo Poacher Striker, Spain
  {
    id: 'unique_santiago_helices',
    teamId: 'esp_celta',
    shirtNumber: 10,
    matchRole: 'celta_st',
    name: 'Santiago Helices',
    nationality: { code: 'ESP', iso: 'es', name: 'Spain' },
    position: 'ATT',
    subPosition: 'ST',
    playStyle: 'Poacher',
    ovr: 83,
    potentialOvr: 83,
    heightCm: 176,
    weightKg: 67,
    statsOverride: {
      pro: 87,
      def: 42,
      cre: 86,
      men: 88,
      goa: 20,
      phy: 74,
      detailed: {
        pace: 76,
        stamina: 80,
        strength: 70,
        ballControl: 88,
        retention: 87,
        dribbling: 86,
        shortPass: 86,
        longPass: 82,
        crossing: 82,
        shooting: 88,
        heading: 72,
        longShots: 86,
        tackling: 42,
        marking: 38,
        interceptions: 45,
        positioning: 90,
        composure: 90,
        reactions: 88,
      },
    },
  },

  // 26. REAL MADRID #3 — ED MILITINHO (Éder Militão) (82 OVR) — 28yo Stopper CB, Brazil
  {
    id: 'unique_ed_militinho',
    teamId: 'esp_realmadrid',
    shirtNumber: 3,
    matchRole: 'realmadrid_cb',
    name: 'Ed Militinho',
    nationality: { code: 'BRA', iso: 'br', name: 'Brazil' },
    position: 'DEF',
    subPosition: 'CB',
    playStyle: 'Stopper',
    ovr: 82,
    potentialOvr: 84,
    heightCm: 186,
    weightKg: 78,
    statsOverride: {
      pro: 72,
      def: 85,
      cre: 76,
      men: 84,
      goa: 20,
      phy: 86,
      detailed: {
        pace: 83,
        stamina: 82,
        strength: 87,
        ballControl: 80,
        retention: 80,
        dribbling: 74,
        shortPass: 80,
        longPass: 80,
        crossing: 68,
        shooting: 54,
        heading: 86,
        longShots: 60,
        tackling: 85,
        marking: 83,
        interceptions: 84,
        positioning: 82,
        composure: 82,
        reactions: 84,
      },
    },
  },

  // 27. FC BARCELONA #23 — JULIO KANDE (Jules Koundé) (82 OVR) — 27yo Balanced RB, France
  {
    id: 'unique_julio_kande',
    teamId: 'esp_barcelona',
    shirtNumber: 23,
    matchRole: 'barcelona_rb',
    name: 'Julio Kande',
    nationality: { code: 'FRA', iso: 'fr', name: 'France' },
    position: 'DEF',
    subPosition: 'RB',
    playStyle: 'Balanced',
    ovr: 82,
    potentialOvr: 84,
    heightCm: 180,
    weightKg: 75,
    statsOverride: {
      pro: 76,
      def: 84,
      cre: 82,
      men: 84,
      goa: 20,
      phy: 84,
      detailed: {
        pace: 84,
        stamina: 86,
        strength: 82,
        ballControl: 82,
        retention: 82,
        dribbling: 80,
        shortPass: 84,
        longPass: 82,
        crossing: 80,
        shooting: 58,
        heading: 83,
        longShots: 62,
        tackling: 84,
        marking: 83,
        interceptions: 83,
        positioning: 82,
        composure: 83,
        reactions: 84,
      },
    },
  },

  // 28. ATHLETIC BILBAO #10 — NICK MARTINS (Nico Williams) (82 OVR) — 24yo Traditional LW, Spain
  {
    id: 'unique_nick_martins',
    teamId: 'esp_athletic',
    shirtNumber: 10,
    matchRole: 'athletic_lw',
    name: 'Nick Martins',
    nationality: { code: 'ESP', iso: 'es', name: 'Spain' },
    position: 'ATT',
    subPosition: 'LW',
    playStyle: 'Traditional',
    ovr: 82,
    potentialOvr: 87,
    heightCm: 181,
    weightKg: 77,
    statsOverride: {
      pro: 82,
      def: 45,
      cre: 82,
      men: 82,
      goa: 20,
      phy: 80,
      detailed: {
        pace: 94,
        stamina: 84,
        strength: 76,
        ballControl: 84,
        retention: 83,
        dribbling: 87,
        shortPass: 80,
        longPass: 74,
        crossing: 85,
        shooting: 81,
        heading: 66,
        longShots: 80,
        tackling: 45,
        marking: 42,
        interceptions: 48,
        positioning: 83,
        composure: 82,
        reactions: 84,
      },
    },
  },

  // 29. REAL MADRID #14 — ARELIAN CHOMENINGA (Aurélien Tchouaméni) (82 OVR) — 26yo Anchor CDM, France
  {
    id: 'unique_arelian_chomeninga',
    teamId: 'esp_realmadrid',
    shirtNumber: 14,
    matchRole: 'realmadrid_cdm',
    name: 'Arelian Chomeninga',
    nationality: { code: 'FRA', iso: 'fr', name: 'France' },
    position: 'MID',
    subPosition: 'CDM',
    playStyle: 'Anchor',
    ovr: 82,
    potentialOvr: 85,
    heightCm: 187,
    weightKg: 81,
    statsOverride: {
      pro: 78,
      def: 85,
      cre: 83,
      men: 85,
      goa: 20,
      phy: 87,
      detailed: {
        pace: 78,
        stamina: 88,
        strength: 88,
        ballControl: 83,
        retention: 84,
        dribbling: 80,
        shortPass: 85,
        longPass: 85,
        crossing: 74,
        shooting: 78,
        heading: 84,
        longShots: 83,
        tackling: 85,
        marking: 83,
        interceptions: 85,
        positioning: 83,
        composure: 85,
        reactions: 84,
      },
    },
  },

  // 30. FC BARCELONA #2 — JUANINHO CANCEL (João Cancelo) (82 OVR) — 32yo Attacker RB, Portugal
  {
    id: 'unique_juaninho_cancel',
    teamId: 'esp_barcelona',
    shirtNumber: 2,
    matchRole: 'barcelona_rb2',
    name: 'Juaninho Cancel',
    nationality: { code: 'POR', iso: 'pt', name: 'Portugal' },
    position: 'DEF',
    subPosition: 'RB',
    playStyle: 'Attacker',
    ovr: 82,
    potentialOvr: 82,
    heightCm: 182,
    weightKg: 74,
    statsOverride: {
      pro: 78,
      def: 79,
      cre: 86,
      men: 83,
      goa: 20,
      phy: 80,
      detailed: {
        pace: 84,
        stamina: 84,
        strength: 74,
        ballControl: 86,
        retention: 85,
        dribbling: 86,
        shortPass: 85,
        longPass: 85,
        crossing: 87,
        shooting: 76,
        heading: 70,
        longShots: 80,
        tackling: 78,
        marking: 76,
        interceptions: 78,
        positioning: 83,
        composure: 83,
        reactions: 84,
      },
    },
  },

  // 31. ATLÉTICO MADRID #13 — JANUS OBLAK (Jan Oblak) (81 OVR) — 33yo Wall GK, Slovenia
  {
    id: 'unique_janus_oblak',
    teamId: 'esp_atletico',
    shirtNumber: 13,
    matchRole: 'atletico_gk',
    name: 'Janus Oblak',
    nationality: { code: 'SVN', iso: 'si', name: 'Slovenia' },
    position: 'GK',
    subPosition: 'GK',
    playStyle: 'Wall',
    ovr: 81,
    potentialOvr: 81,
    heightCm: 188,
    weightKg: 87,
    statsOverride: {
      pro: 81,
      def: 81,
      cre: 70,
      men: 85,
      goa: 81,
      phy: 84,
      detailed: {
        pace: 50,
        stamina: 75,
        strength: 86,
        ballControl: 72,
        retention: 70,
        dribbling: 52,
        shortPass: 75,
        longPass: 75,
        crossing: 28,
        shooting: 22,
        heading: 40,
        longShots: 22,
        tackling: 34,
        marking: 28,
        interceptions: 44,
        positioning: 85,
        composure: 86,
        reactions: 85,
      },
    },
  },

  // 32. REAL MADRID #22 — ANTONY DIRUGER (Antonio Rüdiger) (81 OVR) — 33yo Destroyer CB, Germany
  {
    id: 'unique_antony_diruger',
    teamId: 'esp_realmadrid',
    shirtNumber: 22,
    matchRole: 'realmadrid_cb2',
    name: 'Antony Diruger',
    nationality: { code: 'GER', iso: 'de', name: 'Germany' },
    position: 'DEF',
    subPosition: 'CB',
    playStyle: 'Destroyer',
    ovr: 81,
    potentialOvr: 81,
    heightCm: 190,
    weightKg: 85,
    statsOverride: {
      pro: 70,
      def: 84,
      cre: 74,
      men: 84,
      goa: 20,
      phy: 88,
      detailed: {
        pace: 82,
        stamina: 84,
        strength: 90,
        ballControl: 78,
        retention: 78,
        dribbling: 72,
        shortPass: 78,
        longPass: 78,
        crossing: 60,
        shooting: 54,
        heading: 84,
        longShots: 62,
        tackling: 84,
        marking: 82,
        interceptions: 83,
        positioning: 81,
        composure: 84,
        reactions: 84,
      },
    },
  },

  // 33. ATLÉTICO MADRID #11 — ADY WATCHMAN (Ademola Lookman) (81 OVR) — 28yo Prolific LW, Nigeria
  {
    id: 'unique_ady_watchman',
    teamId: 'esp_atletico',
    shirtNumber: 11,
    matchRole: 'atletico_lw',
    name: 'Ady Watchman',
    nationality: { code: 'NGA', iso: 'ng', name: 'Nigeria' },
    position: 'ATT',
    subPosition: 'LW',
    playStyle: 'Prolific',
    ovr: 81,
    potentialOvr: 82,
    heightCm: 174,
    weightKg: 71,
    statsOverride: {
      pro: 83,
      def: 44,
      cre: 81,
      men: 82,
      goa: 20,
      phy: 78,
      detailed: {
        pace: 88,
        stamina: 82,
        strength: 74,
        ballControl: 85,
        retention: 84,
        dribbling: 86,
        shortPass: 80,
        longPass: 76,
        crossing: 81,
        shooting: 83,
        heading: 65,
        longShots: 82,
        tackling: 44,
        marking: 40,
        interceptions: 46,
        positioning: 83,
        composure: 82,
        reactions: 83,
      },
    },
  },

  // 34. ATLÉTICO MADRID #20 — GIGI SIMON (Giuliano Simeone) (80 OVR) — 23yo Pressing RW, Argentina
  {
    id: 'unique_gigi_simon',
    teamId: 'esp_atletico',
    shirtNumber: 20,
    matchRole: 'atletico_rw',
    name: 'Gigi Simon',
    nationality: { code: 'ARG', iso: 'ar', name: 'Argentina' },
    position: 'ATT',
    subPosition: 'RW',
    playStyle: 'Pressing',
    ovr: 80,
    potentialOvr: 85,
    heightCm: 173,
    weightKg: 68,
    statsOverride: {
      pro: 80,
      def: 56,
      cre: 79,
      men: 83,
      goa: 20,
      phy: 82,
      detailed: {
        pace: 86,
        stamina: 90,
        strength: 78,
        ballControl: 80,
        retention: 80,
        dribbling: 81,
        shortPass: 78,
        longPass: 74,
        crossing: 79,
        shooting: 80,
        heading: 72,
        longShots: 78,
        tackling: 58,
        marking: 54,
        interceptions: 60,
        positioning: 82,
        composure: 80,
        reactions: 82,
      },
    },
  },

  // ==========================================
  // ENGLISH PREMIER LEAGUE STAR PLAYERS (38 STARS)
  // ==========================================

  // 2. ARSENAL #22 — DAVIE MARCA (David Raya) (89 OVR) — 30yo Wall GK, Spain
  {
    id: 'unique_davie_marca',
    teamId: 'eng_arsenal',
    shirtNumber: 22,
    matchRole: 'arsenal_gk',
    name: 'Davie Marca',
    nationality: { code: 'ESP', iso: 'es', name: 'Spain' },
    position: 'GK',
    subPosition: 'GK',
    playStyle: 'Wall',
    ovr: 89,
    potentialOvr: 89,
    heightCm: 183,
    weightKg: 80,
    statsOverride: {
      pro: 25,
      def: 89,
      cre: 82,
      men: 89,
      goa: 89,
      phy: 86,
      detailed: {
        pace: 65,
        stamina: 82,
        strength: 84,
        ballControl: 84,
        retention: 82,
        dribbling: 70,
        shortPass: 86,
        longPass: 88,
        crossing: 40,
        shooting: 25,
        heading: 60,
        longShots: 25,
        tackling: 45,
        marking: 40,
        interceptions: 88,
        positioning: 90,
        composure: 89,
        reactions: 90,
      },
    },
  },

  // 3. ARSENAL #7 — SUKAYA BAKO (Bukayo Saka) (87 OVR) — 24yo Prolific RW, England
  {
    id: 'unique_sukaya_bako',
    teamId: 'eng_arsenal',
    shirtNumber: 7,
    matchRole: 'arsenal_rw',
    name: 'Sukaya Bako',
    nationality: { code: 'ENG', iso: 'gb-eng', name: 'England' },
    position: 'ATT',
    subPosition: 'RW',
    playStyle: 'Prolific',
    ovr: 87,
    potentialOvr: 89,
    heightCm: 178,
    weightKg: 72,
    statsOverride: {
      pro: 88,
      def: 55,
      cre: 87,
      men: 88,
      goa: 20,
      phy: 84,
      detailed: {
        pace: 89,
        stamina: 88,
        strength: 82,
        ballControl: 89,
        retention: 88,
        dribbling: 90,
        shortPass: 86,
        longPass: 82,
        crossing: 88,
        shooting: 87,
        heading: 68,
        longShots: 85,
        tackling: 55,
        marking: 50,
        interceptions: 58,
        positioning: 88,
        composure: 89,
        reactions: 88,
      },
    },
  },

  // 4. MANCHESTER CITY #3 — ROMAN DAYS (Rúben Dias) (88 OVR) — 29yo Creator CB, Portugal
  {
    id: 'unique_roman_days',
    teamId: 'eng_mancity',
    shirtNumber: 3,
    matchRole: 'mancity_cb',
    name: 'Roman Days',
    nationality: { code: 'POR', iso: 'pt', name: 'Portugal' },
    position: 'DEF',
    subPosition: 'CB',
    playStyle: 'Creator',
    ovr: 88,
    potentialOvr: 88,
    heightCm: 187,
    weightKg: 83,
    statsOverride: {
      pro: 62,
      def: 89,
      cre: 82,
      men: 89,
      goa: 20,
      phy: 88,
      detailed: {
        pace: 75,
        stamina: 86,
        strength: 89,
        ballControl: 83,
        retention: 84,
        dribbling: 76,
        shortPass: 86,
        longPass: 85,
        crossing: 65,
        shooting: 55,
        heading: 88,
        longShots: 60,
        tackling: 90,
        marking: 90,
        interceptions: 89,
        positioning: 89,
        composure: 89,
        reactions: 88,
      },
    },
  },

  // 5. ARSENAL #41 — DECLAN BREAD (Declan Rice) (88 OVR) — 27yo Enforcer CDM, England
  {
    id: 'unique_declan_bread',
    teamId: 'eng_arsenal',
    shirtNumber: 41,
    matchRole: 'arsenal_cdm',
    name: 'Declan Bread',
    nationality: { code: 'ENG', iso: 'gb-eng', name: 'England' },
    position: 'MID',
    subPosition: 'CDM',
    playStyle: 'Enforcer',
    ovr: 88,
    potentialOvr: 88,
    heightCm: 188,
    weightKg: 80,
    statsOverride: {
      pro: 84,
      def: 88,
      cre: 83,
      men: 88,
      goa: 20,
      phy: 88,
      detailed: {
        pace: 80,
        stamina: 92,
        strength: 88,
        ballControl: 85,
        retention: 86,
        dribbling: 82,
        shortPass: 88,
        longPass: 86,
        crossing: 78,
        shooting: 78,
        heading: 84,
        longShots: 82,
        tackling: 90,
        marking: 88,
        interceptions: 89,
        positioning: 86,
        composure: 88,
        reactions: 88,
      },
    },
  },

  // 6. ARSENAL #8 — MARTY OVERGRAD (Martin Ødegaard) (87 OVR) — 27yo Creator CAM, Norway
  {
    id: 'unique_marty_overgrad',
    teamId: 'eng_arsenal',
    shirtNumber: 8,
    matchRole: 'arsenal_cam',
    name: 'Marty Overgrad',
    nationality: { code: 'NOR', iso: 'no', name: 'Norway' },
    position: 'MID',
    subPosition: 'CAM',
    playStyle: 'Creator',
    ovr: 87,
    potentialOvr: 88,
    heightCm: 178,
    weightKg: 68,
    statsOverride: {
      pro: 84,
      def: 62,
      cre: 90,
      men: 88,
      goa: 20,
      phy: 78,
      detailed: {
        pace: 80,
        stamina: 86,
        strength: 72,
        ballControl: 91,
        retention: 90,
        dribbling: 89,
        shortPass: 92,
        longPass: 89,
        crossing: 86,
        shooting: 84,
        heading: 60,
        longShots: 86,
        tackling: 62,
        marking: 58,
        interceptions: 66,
        positioning: 88,
        composure: 90,
        reactions: 88,
      },
    },
  },

  // 7. TOTTENHAM HOTSPUR #8 — SAN TONY (Sandro Tonali) (86 OVR) — 26yo Anchor CDM, Italy
  {
    id: 'unique_san_tony',
    teamId: 'eng_tottenham',
    shirtNumber: 8,
    matchRole: 'tottenham_cdm',
    name: 'San Tony',
    nationality: { code: 'ITA', iso: 'it', name: 'Italy' },
    position: 'MID',
    subPosition: 'CDM',
    playStyle: 'Anchor',
    ovr: 86,
    potentialOvr: 87,
    heightCm: 181,
    weightKg: 79,
    statsOverride: {
      pro: 79,
      def: 86,
      cre: 85,
      men: 86,
      goa: 20,
      phy: 86,
      detailed: {
        pace: 82,
        stamina: 90,
        strength: 84,
        ballControl: 86,
        retention: 86,
        dribbling: 83,
        shortPass: 87,
        longPass: 87,
        crossing: 80,
        shooting: 78,
        heading: 76,
        longShots: 83,
        tackling: 87,
        marking: 85,
        interceptions: 86,
        positioning: 85,
        composure: 86,
        reactions: 86,
      },
    },
  },

  // 8. EVERTON #1 — PICKGLOVES (Jordan Pickford) (87 OVR) — 37yo Wall GK, England
  {
    id: 'unique_pickgloves',
    teamId: 'eng_everton',
    shirtNumber: 1,
    matchRole: 'everton_gk',
    name: 'Pickgloves',
    nationality: { code: 'ENG', iso: 'gb-eng', name: 'England' },
    position: 'GK',
    subPosition: 'GK',
    playStyle: 'Wall',
    ovr: 87,
    potentialOvr: 87,
    heightCm: 185,
    weightKg: 77,
    statsOverride: {
      pro: 24,
      def: 87,
      cre: 80,
      men: 88,
      goa: 87,
      phy: 83,
      detailed: {
        pace: 68,
        stamina: 80,
        strength: 81,
        ballControl: 82,
        retention: 80,
        dribbling: 65,
        shortPass: 82,
        longPass: 87,
        crossing: 35,
        shooting: 24,
        heading: 62,
        longShots: 25,
        tackling: 42,
        marking: 38,
        interceptions: 86,
        positioning: 88,
        composure: 88,
        reactions: 89,
      },
    },
  },

  // 9. ARSENAL #2 — WILLY SALIVE (William Saliba) (86 OVR) — 25yo Stopper CB, France
  {
    id: 'unique_willy_salive',
    teamId: 'eng_arsenal',
    shirtNumber: 2,
    matchRole: 'arsenal_cb',
    name: 'Willy Salive',
    nationality: { code: 'FRA', iso: 'fr', name: 'France' },
    position: 'DEF',
    subPosition: 'CB',
    playStyle: 'Stopper',
    ovr: 86,
    potentialOvr: 88,
    heightCm: 192,
    weightKg: 85,
    statsOverride: {
      pro: 58,
      def: 88,
      cre: 78,
      men: 86,
      goa: 20,
      phy: 86,
      detailed: {
        pace: 84,
        stamina: 85,
        strength: 87,
        ballControl: 81,
        retention: 82,
        dribbling: 76,
        shortPass: 84,
        longPass: 80,
        crossing: 60,
        shooting: 50,
        heading: 86,
        longShots: 52,
        tackling: 89,
        marking: 88,
        interceptions: 87,
        positioning: 87,
        composure: 87,
        reactions: 87,
      },
    },
  },

  // 10. MANCHESTER UNITED #8 — BRUNAO FERNANDINHO (Bruno Fernandes) (86 OVR) — 31yo Shadow CAM, Portugal
  {
    id: 'unique_brunao_fernandinho',
    teamId: 'eng_manutd',
    shirtNumber: 8,
    matchRole: 'manutd_cam',
    name: 'Brunao Fernandinho',
    nationality: { code: 'POR', iso: 'pt', name: 'Portugal' },
    position: 'MID',
    subPosition: 'CAM',
    playStyle: 'Shadow',
    ovr: 86,
    potentialOvr: 86,
    heightCm: 179,
    weightKg: 69,
    statsOverride: {
      pro: 86,
      def: 68,
      cre: 89,
      men: 87,
      goa: 20,
      phy: 80,
      detailed: {
        pace: 78,
        stamina: 90,
        strength: 74,
        ballControl: 88,
        retention: 86,
        dribbling: 85,
        shortPass: 89,
        longPass: 90,
        crossing: 88,
        shooting: 87,
        heading: 68,
        longShots: 89,
        tackling: 68,
        marking: 64,
        interceptions: 72,
        positioning: 88,
        composure: 87,
        reactions: 87,
      },
    },
  },

  // 11. MANCHESTER CITY #47 — PHILLY FODINS (Phil Foden) (85 OVR) — 26yo Engine CAM, England
  {
    id: 'unique_philly_fodins',
    teamId: 'eng_mancity',
    shirtNumber: 47,
    matchRole: 'mancity_cam',
    name: 'Philly Fodins',
    nationality: { code: 'ENG', iso: 'gb-eng', name: 'England' },
    position: 'MID',
    subPosition: 'CAM',
    playStyle: 'Engine',
    ovr: 85,
    potentialOvr: 87,
    heightCm: 171,
    weightKg: 70,
    statsOverride: {
      pro: 86,
      def: 58,
      cre: 87,
      men: 85,
      goa: 20,
      phy: 79,
      detailed: {
        pace: 86,
        stamina: 87,
        strength: 72,
        ballControl: 90,
        retention: 89,
        dribbling: 90,
        shortPass: 87,
        longPass: 83,
        crossing: 84,
        shooting: 86,
        heading: 62,
        longShots: 86,
        tackling: 58,
        marking: 54,
        interceptions: 60,
        positioning: 87,
        composure: 86,
        reactions: 86,
      },
    },
  },

  // 12. ARSENAL #39 — BRUNAO GUIMARINHO (Bruno Guimarães) (85 OVR) — 28yo Box-to-Box CM, Brazil
  {
    id: 'unique_brunao_guimarinho',
    teamId: 'eng_arsenal',
    shirtNumber: 39,
    matchRole: 'arsenal_cm',
    name: 'Brunao Guimarinho',
    nationality: { code: 'BRA', iso: 'br', name: 'Brazil' },
    position: 'MID',
    subPosition: 'CM',
    playStyle: 'Box-to-Box',
    ovr: 85,
    potentialOvr: 86,
    heightCm: 182,
    weightKg: 76,
    statsOverride: {
      pro: 80,
      def: 84,
      cre: 85,
      men: 86,
      goa: 20,
      phy: 85,
      detailed: {
        pace: 79,
        stamina: 89,
        strength: 84,
        ballControl: 87,
        retention: 87,
        dribbling: 84,
        shortPass: 88,
        longPass: 86,
        crossing: 78,
        shooting: 78,
        heading: 75,
        longShots: 82,
        tackling: 86,
        marking: 83,
        interceptions: 85,
        positioning: 84,
        composure: 86,
        reactions: 86,
      },
    },
  },

  // 13. LIVERPOOL FC #8 — DOMICO SZOSABOSZLI (Dominik Szoboszlai) (85 OVR) — 25yo Runner CM, Hungary
  {
    id: 'unique_domico_szosaboszli',
    teamId: 'eng_liverpool',
    shirtNumber: 8,
    matchRole: 'liverpool_cm',
    name: 'Domico Szosaboszli',
    nationality: { code: 'HUN', iso: 'hu', name: 'Hungary' },
    position: 'MID',
    subPosition: 'CM',
    playStyle: 'Runner',
    ovr: 85,
    potentialOvr: 87,
    heightCm: 186,
    weightKg: 74,
    statsOverride: {
      pro: 84,
      def: 72,
      cre: 86,
      men: 85,
      goa: 20,
      phy: 84,
      detailed: {
        pace: 86,
        stamina: 90,
        strength: 80,
        ballControl: 87,
        retention: 86,
        dribbling: 85,
        shortPass: 87,
        longPass: 88,
        crossing: 86,
        shooting: 85,
        heading: 70,
        longShots: 90,
        tackling: 72,
        marking: 68,
        interceptions: 74,
        positioning: 85,
        composure: 85,
        reactions: 85,
      },
    },
  },

  // 14. CRYSTAL PALACE #12 — DANNY MUÑIZ (Daniel Muñoz) (85 OVR) — 29yo Attacker RB, Colombia
  {
    id: 'unique_danny_muniz',
    teamId: 'eng_palace',
    shirtNumber: 12,
    matchRole: 'palace_rb',
    name: 'Danny Muñiz',
    nationality: { code: 'COL', iso: 'co', name: 'Colombia' },
    position: 'DEF',
    subPosition: 'RB',
    playStyle: 'Attacker',
    ovr: 85,
    potentialOvr: 85,
    heightCm: 180,
    weightKg: 74,
    statsOverride: {
      pro: 78,
      def: 83,
      cre: 80,
      men: 85,
      goa: 20,
      phy: 87,
      detailed: {
        pace: 88,
        stamina: 92,
        strength: 84,
        ballControl: 82,
        retention: 82,
        dribbling: 81,
        shortPass: 82,
        longPass: 78,
        crossing: 84,
        shooting: 75,
        heading: 80,
        longShots: 76,
        tackling: 84,
        marking: 82,
        interceptions: 84,
        positioning: 84,
        composure: 84,
        reactions: 86,
      },
    },
  },

  // 15. MANCHESTER CITY #24 — JOSKO GVARDIOLO (Joško Gvardiol) (86 OVR) — 24yo Playmaker CB, Croatia
  {
    id: 'unique_josko_gvardiolo',
    teamId: 'eng_mancity',
    shirtNumber: 24,
    matchRole: 'mancity_cb2',
    name: 'Josko Gvardiolo',
    nationality: { code: 'CRO', iso: 'hr', name: 'Croatia' },
    position: 'DEF',
    subPosition: 'CB',
    playStyle: 'Playmaker',
    ovr: 86,
    potentialOvr: 88,
    heightCm: 185,
    weightKg: 80,
    statsOverride: {
      pro: 72,
      def: 87,
      cre: 83,
      men: 86,
      goa: 20,
      phy: 87,
      detailed: {
        pace: 84,
        stamina: 87,
        strength: 88,
        ballControl: 85,
        retention: 84,
        dribbling: 83,
        shortPass: 87,
        longPass: 85,
        crossing: 78,
        shooting: 70,
        heading: 85,
        longShots: 75,
        tackling: 88,
        marking: 86,
        interceptions: 87,
        positioning: 85,
        composure: 87,
        reactions: 87,
      },
    },
  },

  // 16. ARSENAL #6 — GABY MAGALINHO (Gabriel Magalhães) (89 OVR) — 28yo Destroyer CB, Brazil
  {
    id: 'unique_gaby_magalinho',
    teamId: 'eng_arsenal',
    shirtNumber: 6,
    matchRole: 'arsenal_cb2',
    name: 'Gaby Magalinho',
    nationality: { code: 'BRA', iso: 'br', name: 'Brazil' },
    position: 'DEF',
    subPosition: 'CB',
    playStyle: 'Destroyer',
    ovr: 89,
    potentialOvr: 89,
    heightCm: 190,
    weightKg: 87,
    statsOverride: {
      pro: 64,
      def: 90,
      cre: 75,
      men: 90,
      goa: 20,
      phy: 90,
      detailed: {
        pace: 82,
        stamina: 87,
        strength: 92,
        ballControl: 80,
        retention: 81,
        dribbling: 74,
        shortPass: 82,
        longPass: 78,
        crossing: 55,
        shooting: 58,
        heading: 91,
        longShots: 55,
        tackling: 91,
        marking: 90,
        interceptions: 90,
        positioning: 88,
        composure: 89,
        reactions: 90,
      },
    },
  },

  // 17. CHELSEA #20 — COLLIN PALMO (Cole Palmer) (84 OVR) — 24yo Creator CAM, England
  {
    id: 'unique_collin_palmo',
    teamId: 'eng_chelsea',
    shirtNumber: 20,
    matchRole: 'chelsea_cam',
    name: 'Collin Palmo',
    nationality: { code: 'ENG', iso: 'gb-eng', name: 'England' },
    position: 'MID',
    subPosition: 'CAM',
    playStyle: 'Creator',
    ovr: 84,
    potentialOvr: 87,
    heightCm: 189,
    weightKg: 74,
    statsOverride: {
      pro: 85,
      def: 52,
      cre: 86,
      men: 85,
      goa: 20,
      phy: 76,
      detailed: {
        pace: 82,
        stamina: 82,
        strength: 74,
        ballControl: 88,
        retention: 87,
        dribbling: 88,
        shortPass: 87,
        longPass: 84,
        crossing: 83,
        shooting: 86,
        heading: 65,
        longShots: 86,
        tackling: 52,
        marking: 48,
        interceptions: 56,
        positioning: 86,
        composure: 89,
        reactions: 85,
      },
    },
  },

  // 18. CHELSEA #10 — RAY CHERINS (Rayan Cherki) (84 OVR) — 24yo Creator CAM, France
  {
    id: 'unique_ray_cherins',
    teamId: 'eng_chelsea',
    shirtNumber: 10,
    matchRole: 'chelsea_cam2',
    name: 'Ray Cherins',
    nationality: { code: 'FRA', iso: 'fr', name: 'France' },
    position: 'MID',
    subPosition: 'CAM',
    playStyle: 'Creator',
    ovr: 84,
    potentialOvr: 87,
    heightCm: 176,
    weightKg: 71,
    statsOverride: {
      pro: 82,
      def: 48,
      cre: 87,
      men: 83,
      goa: 20,
      phy: 77,
      detailed: {
        pace: 83,
        stamina: 80,
        strength: 75,
        ballControl: 91,
        retention: 90,
        dribbling: 91,
        shortPass: 87,
        longPass: 85,
        crossing: 84,
        shooting: 82,
        heading: 58,
        longShots: 84,
        tackling: 46,
        marking: 42,
        interceptions: 50,
        positioning: 83,
        composure: 85,
        reactions: 84,
      },
    },
  },

  // 19. BRIGHTON #1 — BARTO DE VERRUGGEN (Bart Verbruggen) (84 OVR) — 24yo Sweeper GK, Netherlands
  {
    id: 'unique_barto_de_verruggen',
    teamId: 'eng_brighton',
    shirtNumber: 1,
    matchRole: 'brighton_gk',
    name: 'Barto De Verruggen',
    nationality: { code: 'NED', iso: 'nl', name: 'Netherlands' },
    position: 'GK',
    subPosition: 'GK',
    playStyle: 'Sweeper',
    ovr: 84,
    potentialOvr: 86,
    heightCm: 193,
    weightKg: 89,
    statsOverride: {
      pro: 25,
      def: 84,
      cre: 78,
      men: 84,
      goa: 84,
      phy: 80,
      detailed: {
        pace: 62,
        stamina: 78,
        strength: 82,
        ballControl: 80,
        retention: 78,
        dribbling: 60,
        shortPass: 83,
        longPass: 82,
        crossing: 32,
        shooting: 22,
        heading: 64,
        longShots: 22,
        tackling: 40,
        marking: 35,
        interceptions: 84,
        positioning: 85,
        composure: 85,
        reactions: 86,
      },
    },
  },

  // 20. MANCHESTER CITY #25 — ABDODIR ZHUKANOV (Abdukodir Khusanov) (84 OVR) — 22yo Stopper CB, Uzbekistan
  {
    id: 'unique_abdodir_zhukanov',
    teamId: 'eng_mancity',
    shirtNumber: 25,
    matchRole: 'mancity_cb3',
    name: 'Abdodir Zhukanov',
    nationality: { code: 'UZB', iso: 'uz', name: 'Uzbekistan' },
    position: 'DEF',
    subPosition: 'CB',
    playStyle: 'Stopper',
    ovr: 84,
    potentialOvr: 87,
    heightCm: 186,
    weightKg: 82,
    statsOverride: {
      pro: 55,
      def: 85,
      cre: 72,
      men: 84,
      goa: 20,
      phy: 87,
      detailed: {
        pace: 82,
        stamina: 84,
        strength: 90,
        ballControl: 78,
        retention: 78,
        dribbling: 72,
        shortPass: 80,
        longPass: 76,
        crossing: 50,
        shooting: 45,
        heading: 87,
        longShots: 48,
        tackling: 87,
        marking: 86,
        interceptions: 85,
        positioning: 84,
        composure: 84,
        reactions: 85,
      },
    },
  },

  // 21. NEWCASTLE UTD #14 — ALEXR SAKI (Alexander Isak) (82 OVR) — 26yo Poacher ST, Sweden
  {
    id: 'unique_alexr_saki',
    teamId: 'eng_newcastle',
    shirtNumber: 14,
    matchRole: 'newcastle_st',
    name: 'Alexr Saki',
    nationality: { code: 'SWE', iso: 'se', name: 'Sweden' },
    position: 'ATT',
    subPosition: 'ST',
    playStyle: 'Poacher',
    ovr: 82,
    potentialOvr: 84,
    heightCm: 192,
    weightKg: 77,
    statsOverride: {
      pro: 85,
      def: 40,
      cre: 78,
      men: 82,
      goa: 20,
      phy: 78,
      detailed: {
        pace: 88,
        stamina: 80,
        strength: 78,
        ballControl: 87,
        retention: 84,
        dribbling: 86,
        shortPass: 80,
        longPass: 72,
        crossing: 74,
        shooting: 86,
        heading: 78,
        longShots: 82,
        tackling: 40,
        marking: 36,
        interceptions: 44,
        positioning: 86,
        composure: 84,
        reactions: 84,
      },
    },
  },

  // 22. MANCHESTER CITY #16 — ELLY ANDERS (Elliot Anderson) (83 OVR) — 23yo Runner CM, Scotland
  {
    id: 'unique_elly_anders',
    teamId: 'eng_mancity',
    shirtNumber: 16,
    matchRole: 'mancity_cm',
    name: 'Elly Anders',
    nationality: { code: 'SCO', iso: 'gb-sct', name: 'Scotland' },
    position: 'MID',
    subPosition: 'CM',
    playStyle: 'Runner',
    ovr: 83,
    potentialOvr: 86,
    heightCm: 179,
    weightKg: 73,
    statsOverride: {
      pro: 81,
      def: 74,
      cre: 82,
      men: 83,
      goa: 20,
      phy: 84,
      detailed: {
        pace: 83,
        stamina: 88,
        strength: 82,
        ballControl: 84,
        retention: 83,
        dribbling: 83,
        shortPass: 84,
        longPass: 81,
        crossing: 78,
        shooting: 80,
        heading: 72,
        longShots: 82,
        tackling: 76,
        marking: 72,
        interceptions: 76,
        positioning: 83,
        composure: 83,
        reactions: 83,
      },
    },
  },

  // 23. TOTTENHAM HOTSPUR #14 — MATY FERNANDINHO (Mateus Fernandes) (83 OVR) — 22yo Runner CM, Portugal
  {
    id: 'unique_maty_fernandinho',
    teamId: 'eng_tottenham',
    shirtNumber: 14,
    matchRole: 'tottenham_cm',
    name: 'Maty Fernandinho',
    nationality: { code: 'POR', iso: 'pt', name: 'Portugal' },
    position: 'MID',
    subPosition: 'CM',
    playStyle: 'Runner',
    ovr: 83,
    potentialOvr: 86,
    heightCm: 178,
    weightKg: 71,
    statsOverride: {
      pro: 79,
      def: 75,
      cre: 83,
      men: 83,
      goa: 20,
      phy: 82,
      detailed: {
        pace: 84,
        stamina: 88,
        strength: 78,
        ballControl: 85,
        retention: 84,
        dribbling: 84,
        shortPass: 85,
        longPass: 82,
        crossing: 77,
        shooting: 77,
        heading: 70,
        longShots: 80,
        tackling: 77,
        marking: 74,
        interceptions: 77,
        positioning: 82,
        composure: 83,
        reactions: 83,
      },
    },
  },

  // 24. BOURNEMOUTH #24 — ANTONY EMENY (Antoine Semenyo) (83 OVR) — 26yo Prolific RW, Ghana
  {
    id: 'unique_antony_emeny',
    teamId: 'eng_bournemouth',
    shirtNumber: 24,
    matchRole: 'bournemouth_rw',
    name: 'Antony Emeny',
    nationality: { code: 'GHA', iso: 'gh', name: 'Ghana' },
    position: 'ATT',
    subPosition: 'RW',
    playStyle: 'Prolific',
    ovr: 83,
    potentialOvr: 84,
    heightCm: 185,
    weightKg: 79,
    statsOverride: {
      pro: 84,
      def: 46,
      cre: 80,
      men: 83,
      goa: 20,
      phy: 84,
      detailed: {
        pace: 88,
        stamina: 84,
        strength: 84,
        ballControl: 84,
        retention: 83,
        dribbling: 85,
        shortPass: 80,
        longPass: 74,
        crossing: 80,
        shooting: 84,
        heading: 78,
        longShots: 83,
        tackling: 48,
        marking: 42,
        interceptions: 50,
        positioning: 84,
        composure: 83,
        reactions: 84,
      },
    },
  },

  // 25. BRIGHTON #9 — JOHNNY PEDRINHO (João Pedro) (83 OVR) — 24yo Decoy ST, Brazil
  {
    id: 'unique_johnny_pedrinho',
    teamId: 'eng_brighton',
    shirtNumber: 9,
    matchRole: 'brighton_st',
    name: 'Johnny Pedrinho',
    nationality: { code: 'BRA', iso: 'br', name: 'Brazil' },
    position: 'ATT',
    subPosition: 'ST',
    playStyle: 'Decoy',
    ovr: 83,
    potentialOvr: 86,
    heightCm: 182,
    weightKg: 70,
    statsOverride: {
      pro: 84,
      def: 48,
      cre: 82,
      men: 83,
      goa: 20,
      phy: 80,
      detailed: {
        pace: 85,
        stamina: 82,
        strength: 78,
        ballControl: 86,
        retention: 85,
        dribbling: 86,
        shortPass: 83,
        longPass: 76,
        crossing: 78,
        shooting: 84,
        heading: 76,
        longShots: 81,
        tackling: 50,
        marking: 45,
        interceptions: 52,
        positioning: 85,
        composure: 84,
        reactions: 84,
      },
    },
  },

  // 26. NOTTINGHAM FOREST #10 — WIBBS-GREY (Morgan Gibbs-White) (83 OVR) — 26yo Creator CAM, England
  {
    id: 'unique_wibbs_grey',
    teamId: 'eng_nottingham',
    shirtNumber: 10,
    matchRole: 'nottingham_cam',
    name: 'Wibbs-Grey',
    nationality: { code: 'ENG', iso: 'gb-eng', name: 'England' },
    position: 'MID',
    subPosition: 'CAM',
    playStyle: 'Creator',
    ovr: 83,
    potentialOvr: 85,
    heightCm: 178,
    weightKg: 70,
    statsOverride: {
      pro: 81,
      def: 58,
      cre: 85,
      men: 83,
      goa: 20,
      phy: 80,
      detailed: {
        pace: 82,
        stamina: 84,
        strength: 76,
        ballControl: 86,
        retention: 85,
        dribbling: 85,
        shortPass: 86,
        longPass: 84,
        crossing: 85,
        shooting: 80,
        heading: 66,
        longShots: 82,
        tackling: 58,
        marking: 54,
        interceptions: 60,
        positioning: 83,
        composure: 84,
        reactions: 84,
      },
    },
  },

  // 27. CRYSTAL PALACE #1 — DEENY ANDERSON (Dean Henderson) (83 OVR) — 29yo Balanced GK, England
  {
    id: 'unique_deeny_anderson',
    teamId: 'eng_palace',
    shirtNumber: 1,
    matchRole: 'palace_gk',
    name: 'Deeny Anderson',
    nationality: { code: 'ENG', iso: 'gb-eng', name: 'England' },
    position: 'GK',
    subPosition: 'GK',
    playStyle: 'Balanced',
    ovr: 83,
    potentialOvr: 84,
    heightCm: 188,
    weightKg: 85,
    statsOverride: {
      pro: 22,
      def: 83,
      cre: 72,
      men: 83,
      goa: 83,
      phy: 81,
      detailed: {
        pace: 60,
        stamina: 78,
        strength: 82,
        ballControl: 76,
        retention: 74,
        dribbling: 55,
        shortPass: 78,
        longPass: 80,
        crossing: 30,
        shooting: 20,
        heading: 62,
        longShots: 20,
        tackling: 38,
        marking: 35,
        interceptions: 82,
        positioning: 84,
        composure: 83,
        reactions: 85,
      },
    },
  },

  // 28. ASTON VILLA #23 — EMI ALVAREZ (Emiliano Martínez) (83 OVR) — 33yo Wall GK, Argentina
  {
    id: 'unique_emi_alvarez',
    teamId: 'eng_astonvilla',
    shirtNumber: 23,
    matchRole: 'astonvilla_gk',
    name: 'Emi Alvarez',
    nationality: { code: 'ARG', iso: 'ar', name: 'Argentina' },
    position: 'GK',
    subPosition: 'GK',
    playStyle: 'Wall',
    ovr: 83,
    potentialOvr: 83,
    heightCm: 195,
    weightKg: 88,
    statsOverride: {
      pro: 22,
      def: 84,
      cre: 74,
      men: 86,
      goa: 83,
      phy: 84,
      detailed: {
        pace: 58,
        stamina: 80,
        strength: 86,
        ballControl: 78,
        retention: 76,
        dribbling: 56,
        shortPass: 80,
        longPass: 82,
        crossing: 32,
        shooting: 20,
        heading: 66,
        longShots: 20,
        tackling: 42,
        marking: 38,
        interceptions: 84,
        positioning: 85,
        composure: 87,
        reactions: 86,
      },
    },
  },

  // 29. ARSENAL #9 — VICKY GYOKERO (Viktor Gyökeres) (82 OVR) — 28yo Target ST, Sweden
  {
    id: 'unique_vicky_gyokero',
    teamId: 'eng_arsenal',
    shirtNumber: 9,
    matchRole: 'arsenal_st',
    name: 'Vicky Gyokero',
    nationality: { code: 'SWE', iso: 'se', name: 'Sweden' },
    position: 'ATT',
    subPosition: 'ST',
    playStyle: 'Target',
    ovr: 82,
    potentialOvr: 83,
    heightCm: 187,
    weightKg: 86,
    statsOverride: {
      pro: 84,
      def: 42,
      cre: 76,
      men: 83,
      goa: 20,
      phy: 86,
      detailed: {
        pace: 86,
        stamina: 86,
        strength: 90,
        ballControl: 84,
        retention: 85,
        dribbling: 82,
        shortPass: 80,
        longPass: 72,
        crossing: 74,
        shooting: 85,
        heading: 84,
        longShots: 83,
        tackling: 44,
        marking: 40,
        interceptions: 45,
        positioning: 85,
        composure: 83,
        reactions: 84,
      },
    },
  },

  // 30. ARSENAL #10 — EBEZI EZO (Eberechi Eze) (82 OVR) — 28yo Creator CAM, England
  {
    id: 'unique_ebezi_ezo',
    teamId: 'eng_arsenal',
    shirtNumber: 10,
    matchRole: 'arsenal_cam2',
    name: 'Ebezi Ezo',
    nationality: { code: 'ENG', iso: 'gb-eng', name: 'England' },
    position: 'MID',
    subPosition: 'CAM',
    playStyle: 'Creator',
    ovr: 82,
    potentialOvr: 83,
    heightCm: 178,
    weightKg: 71,
    statsOverride: {
      pro: 82,
      def: 50,
      cre: 84,
      men: 82,
      goa: 20,
      phy: 78,
      detailed: {
        pace: 84,
        stamina: 80,
        strength: 75,
        ballControl: 87,
        retention: 86,
        dribbling: 87,
        shortPass: 85,
        longPass: 82,
        crossing: 82,
        shooting: 82,
        heading: 62,
        longShots: 84,
        tackling: 52,
        marking: 48,
        interceptions: 54,
        positioning: 83,
        composure: 84,
        reactions: 83,
      },
    },
  },

  // 31. ARSENAL #5 — MARTY ZUBIMENDO (Martín Zubimendi) (82 OVR) — 27yo Anchor CDM, Spain
  {
    id: 'unique_marty_zubimendo',
    teamId: 'eng_arsenal',
    shirtNumber: 5,
    matchRole: 'arsenal_cdm2',
    name: 'Marty Zubimendo',
    nationality: { code: 'ESP', iso: 'es', name: 'Spain' },
    position: 'MID',
    subPosition: 'CDM',
    playStyle: 'Anchor',
    ovr: 82,
    potentialOvr: 84,
    heightCm: 181,
    weightKg: 74,
    statsOverride: {
      pro: 76,
      def: 83,
      cre: 82,
      men: 83,
      goa: 20,
      phy: 81,
      detailed: {
        pace: 76,
        stamina: 86,
        strength: 80,
        ballControl: 84,
        retention: 84,
        dribbling: 80,
        shortPass: 86,
        longPass: 84,
        crossing: 72,
        shooting: 72,
        heading: 78,
        longShots: 76,
        tackling: 85,
        marking: 83,
        interceptions: 85,
        positioning: 84,
        composure: 84,
        reactions: 84,
      },
    },
  },

  // 32. WEST HAM UNITED #20 — HARROLD BOW (Jarrod Bowen) (82 OVR) — 29yo Prolific RW, England
  {
    id: 'unique_harrold_bow',
    teamId: 'eng_westham',
    shirtNumber: 20,
    matchRole: 'westham_rw',
    name: 'Harrold Bow',
    nationality: { code: 'ENG', iso: 'gb-eng', name: 'England' },
    position: 'ATT',
    subPosition: 'RW',
    playStyle: 'Prolific',
    ovr: 82,
    potentialOvr: 82,
    heightCm: 175,
    weightKg: 70,
    statsOverride: {
      pro: 83,
      def: 55,
      cre: 80,
      men: 83,
      goa: 20,
      phy: 82,
      detailed: {
        pace: 85,
        stamina: 88,
        strength: 78,
        ballControl: 84,
        retention: 83,
        dribbling: 84,
        shortPass: 82,
        longPass: 76,
        crossing: 83,
        shooting: 84,
        heading: 72,
        longShots: 83,
        tackling: 56,
        marking: 52,
        interceptions: 58,
        positioning: 84,
        composure: 83,
        reactions: 84,
      },
    },
  },

  // 33. ASTON VILLA #11 — OLL WHATINS (Ollie Watkins) (81 OVR) — 30yo Finisher ST, England
  {
    id: 'unique_oll_whatins',
    teamId: 'eng_astonvilla',
    shirtNumber: 11,
    matchRole: 'astonvilla_st',
    name: 'Oll Whatins',
    nationality: { code: 'ENG', iso: 'gb-eng', name: 'England' },
    position: 'ATT',
    subPosition: 'ST',
    playStyle: 'Finisher',
    ovr: 81,
    potentialOvr: 81,
    heightCm: 180,
    weightKg: 70,
    statsOverride: {
      pro: 83,
      def: 45,
      cre: 76,
      men: 82,
      goa: 20,
      phy: 82,
      detailed: {
        pace: 86,
        stamina: 87,
        strength: 80,
        ballControl: 82,
        retention: 81,
        dribbling: 82,
        shortPass: 78,
        longPass: 70,
        crossing: 74,
        shooting: 84,
        heading: 80,
        longShots: 80,
        tackling: 46,
        marking: 42,
        interceptions: 48,
        positioning: 85,
        composure: 82,
        reactions: 83,
      },
    },
  },

  // 34. BOURNEMOUTH #19 — EL JUNIOR ROUKI (Eli Junior Kroupi) (81 OVR) — 20yo Poacher ST, France
  {
    id: 'unique_el_junior_rouki',
    teamId: 'eng_bournemouth',
    shirtNumber: 19,
    matchRole: 'bournemouth_st',
    name: 'EL Junior Rouki',
    nationality: { code: 'FRA', iso: 'fr', name: 'France' },
    position: 'ATT',
    subPosition: 'ST',
    playStyle: 'Poacher',
    ovr: 81,
    potentialOvr: 88,
    heightCm: 179,
    weightKg: 73,
    statsOverride: {
      pro: 83,
      def: 38,
      cre: 77,
      men: 80,
      goa: 20,
      phy: 77,
      detailed: {
        pace: 87,
        stamina: 80,
        strength: 74,
        ballControl: 83,
        retention: 81,
        dribbling: 84,
        shortPass: 78,
        longPass: 70,
        crossing: 72,
        shooting: 83,
        heading: 74,
        longShots: 80,
        tackling: 38,
        marking: 34,
        interceptions: 40,
        positioning: 83,
        composure: 81,
        reactions: 82,
      },
    },
  },

  // 35. BRENTFORD #1 — CAOM ZELLEHER (Caoimhín Kelleher) (81 OVR) — 27yo Balanced GK, Ireland
  {
    id: 'unique_caom_zelleher',
    teamId: 'eng_brentford',
    shirtNumber: 1,
    matchRole: 'brentford_gk',
    name: 'Caom Zelleher',
    nationality: { code: 'IRL', iso: 'ie', name: 'Ireland' },
    position: 'GK',
    subPosition: 'GK',
    playStyle: 'Balanced',
    ovr: 81,
    potentialOvr: 83,
    heightCm: 188,
    weightKg: 77,
    statsOverride: {
      pro: 20,
      def: 81,
      cre: 74,
      men: 82,
      goa: 81,
      phy: 78,
      detailed: {
        pace: 60,
        stamina: 76,
        strength: 78,
        ballControl: 78,
        retention: 76,
        dribbling: 56,
        shortPass: 80,
        longPass: 80,
        crossing: 30,
        shooting: 20,
        heading: 60,
        longShots: 20,
        tackling: 36,
        marking: 32,
        interceptions: 81,
        positioning: 82,
        composure: 83,
        reactions: 83,
      },
    },
  },

  // 36. ARSENAL #15 — PEDRO STAMPFOOT (Piero Hincapié) (81 OVR) — 24yo Stopper CB, Ecuador
  {
    id: 'unique_pedro_stampfoot',
    teamId: 'eng_arsenal',
    shirtNumber: 15,
    matchRole: 'arsenal_cb3',
    name: 'Pedro Stampfoot',
    nationality: { code: 'ECU', iso: 'ec', name: 'Ecuador' },
    position: 'DEF',
    subPosition: 'CB',
    playStyle: 'Stopper',
    ovr: 81,
    potentialOvr: 85,
    heightCm: 184,
    weightKg: 76,
    statsOverride: {
      pro: 55,
      def: 82,
      cre: 74,
      men: 82,
      goa: 20,
      phy: 82,
      detailed: {
        pace: 82,
        stamina: 84,
        strength: 83,
        ballControl: 78,
        retention: 78,
        dribbling: 74,
        shortPass: 80,
        longPass: 76,
        crossing: 68,
        shooting: 48,
        heading: 82,
        longShots: 52,
        tackling: 84,
        marking: 82,
        interceptions: 83,
        positioning: 81,
        composure: 82,
        reactions: 82,
      },
    },
  },

  // 37. BRENTFORD #9 — ELTON THAGAO (Igor Thiago) (80 OVR) — 25yo Target ST, Brazil
  {
    id: 'unique_elton_thagao',
    teamId: 'eng_brentford',
    shirtNumber: 9,
    matchRole: 'brentford_st',
    name: 'Elton Thagao',
    nationality: { code: 'BRA', iso: 'br', name: 'Brazil' },
    position: 'ATT',
    subPosition: 'ST',
    playStyle: 'Target',
    ovr: 80,
    potentialOvr: 82,
    heightCm: 191,
    weightKg: 88,
    statsOverride: {
      pro: 81,
      def: 38,
      cre: 72,
      men: 80,
      goa: 20,
      phy: 85,
      detailed: {
        pace: 80,
        stamina: 82,
        strength: 88,
        ballControl: 80,
        retention: 82,
        dribbling: 76,
        shortPass: 76,
        longPass: 68,
        crossing: 65,
        shooting: 82,
        heading: 84,
        longShots: 78,
        tackling: 40,
        marking: 36,
        interceptions: 40,
        positioning: 82,
        composure: 80,
        reactions: 81,
      },
    },
  },

  // 38. ARSENAL #11 — NON EMENIKE (Noni Madueke) (80 OVR) — 24yo Inverted RW, England
  {
    id: 'unique_non_emenike',
    teamId: 'eng_arsenal',
    shirtNumber: 11,
    matchRole: 'arsenal_rw2',
    name: 'Non Emenike',
    nationality: { code: 'ENG', iso: 'gb-eng', name: 'England' },
    position: 'ATT',
    subPosition: 'RW',
    playStyle: 'Inverted',
    ovr: 80,
    potentialOvr: 84,
    heightCm: 182,
    weightKg: 75,
    statsOverride: {
      pro: 81,
      def: 42,
      cre: 79,
      men: 80,
      goa: 20,
      phy: 78,
      detailed: {
        pace: 88,
        stamina: 80,
        strength: 76,
        ballControl: 84,
        retention: 83,
        dribbling: 86,
        shortPass: 80,
        longPass: 72,
        crossing: 78,
        shooting: 80,
        heading: 68,
        longShots: 80,
        tackling: 42,
        marking: 38,
        interceptions: 44,
        positioning: 81,
        composure: 80,
        reactions: 81,
      },
    },
  },

  // 6. CORINTHIANS #94 — EMPHIES DETAY (84 OVR) — #1 Best Player in South America
  {
    id: 'unique_emphies_detay',
    teamId: 'bra_corinthians',
    shirtNumber: 94,
    matchRole: 'corinthians_st',
    name: 'Emphies Detay',
    nationality: { code: 'NED', iso: 'nl', name: 'Netherlands' },
    position: 'ATT',
    subPosition: 'ST',
    playStyle: 'Complete',
    ovr: 84,
    potentialOvr: 84,
    heightCm: 176,
    weightKg: 78,
    statsOverride: {
      pro: 86,
      def: 38,
      cre: 83,
      men: 84,
      goa: 20,
      phy: 82,
      detailed: {
        pace: 83,
        stamina: 82,
        strength: 84,
        ballControl: 86,
        retention: 85,
        dribbling: 86,
        shortPass: 82,
        longPass: 80,
        crossing: 82,
        shooting: 85,
        heading: 78,
        longShots: 84,
        tackling: 38,
        marking: 36,
        interceptions: 40,
        positioning: 85,
        composure: 84,
        reactions: 84,
      },
    },
  },

  // 7. AL-NASSR #7 — ROMUALDO (92 OVR) — Portuguese 40yo ST, Complete Forward playstyle, Cristiano Ronaldo equivalent contract (€200M/year)
  {
    id: 'unique_romualdo',
    teamId: 'sau_alnassr',
    shirtNumber: 7,
    matchRole: 'alnassr_st',
    name: 'Romualdo',
    nationality: { code: 'POR', iso: 'pt', name: 'Portugal' },
    position: 'ATT',
    subPosition: 'ST',
    playStyle: 'Complete',
    ovr: 92,
    potentialOvr: 92,
    heightCm: 187,
    weightKg: 83,
    statsOverride: {
      pro: 93,
      def: 38,
      cre: 84,
      men: 94,
      goa: 20,
      phy: 90,
      detailed: {
        pace: 85,
        stamina: 88,
        strength: 89,
        ballControl: 90,
        retention: 88,
        dribbling: 87,
        shortPass: 83,
        longPass: 77,
        crossing: 80,
        shooting: 95,
        heading: 94,
        longShots: 93,
        tackling: 36,
        marking: 35,
        interceptions: 38,
        positioning: 95,
        composure: 95,
        reactions: 93,
      },
    },
  },

  // 8. AL-HILAL #29 — SALEM AL-DAWSARI (81 OVR) — Saudi Standout Star #1 (80+ local)
  {
    id: 'unique_salem_aldawsari',
    teamId: 'sau_alhilal',
    shirtNumber: 29,
    matchRole: 'alhilal_lw',
    name: 'Salem Al-Dawsari',
    nationality: { code: 'KSA', iso: 'sa', name: 'Saudi Arabia' },
    position: 'ATT',
    subPosition: 'LW',
    playStyle: 'Creative',
    ovr: 81,
    potentialOvr: 81,
    heightCm: 174,
    weightKg: 68,
    statsOverride: {
      pro: 82,
      def: 45,
      cre: 82,
      men: 81,
      goa: 20,
      phy: 78,
      detailed: {
        pace: 84,
        stamina: 82,
        strength: 72,
        ballControl: 83,
        retention: 82,
        dribbling: 84,
        shortPass: 81,
        longPass: 78,
        crossing: 80,
        shooting: 81,
        heading: 68,
        longShots: 82,
        tackling: 42,
        marking: 40,
        interceptions: 44,
        positioning: 81,
        composure: 81,
        reactions: 82,
      },
    },
  },

  // 9. AL-SHABAB #8 — FAHAD AL-SHEHRI (80 OVR) — Saudi Standout Star #2 (80+ local)
  {
    id: 'unique_fahad_alshehri',
    teamId: 'sau_alshabab',
    shirtNumber: 8,
    matchRole: 'alshabab_rw',
    name: 'Fahad Al-Shehri',
    nationality: { code: 'KSA', iso: 'sa', name: 'Saudi Arabia' },
    position: 'ATT',
    subPosition: 'RW',
    playStyle: 'Speed',
    ovr: 80,
    potentialOvr: 80,
    heightCm: 172,
    weightKg: 66,
    statsOverride: {
      pro: 81,
      def: 42,
      cre: 79,
      men: 79,
      goa: 20,
      phy: 76,
      detailed: {
        pace: 88,
        stamina: 80,
        strength: 70,
        ballControl: 80,
        retention: 78,
        dribbling: 82,
        shortPass: 78,
        longPass: 74,
        crossing: 77,
        shooting: 79,
        heading: 65,
        longShots: 78,
        tackling: 38,
        marking: 36,
        interceptions: 40,
        positioning: 80,
        composure: 79,
        reactions: 81,
      },
    },
  },

  // 10. INTER MILAN #23 — NICO (88 OVR) — 28yo MC Maestro, Italian
  {
    id: 'unique_nico',
    teamId: 'ita_inter',
    shirtNumber: 23,
    matchRole: 'inter_cm',
    name: 'Nico',
    nationality: { code: 'ITA', iso: 'it', name: 'Italy' },
    position: 'MID',
    subPosition: 'CM',
    playStyle: 'Maestro',
    ovr: 88,
    potentialOvr: 88,
    heightCm: 175,
    weightKg: 68,
    statsOverride: {
      pro: 88,
      def: 84,
      cre: 89,
      men: 90,
      goa: 20,
      phy: 88,
      detailed: {
        pace: 84,
        stamina: 94,
        strength: 82,
        ballControl: 89,
        retention: 90,
        dribbling: 88,
        shortPass: 90,
        longPass: 89,
        crossing: 82,
        shooting: 84,
        heading: 75,
        longShots: 86,
        tackling: 84,
        marking: 82,
        interceptions: 85,
        positioning: 88,
        composure: 90,
        reactions: 90,
      },
    },
  },

  // 11. INTER MILAN #10 — LAUCHA TORITO (88 OVR) — 27yo Finisher Striker, Argentinean
  {
    id: 'unique_laucha_torito',
    teamId: 'ita_inter',
    shirtNumber: 10,
    matchRole: 'inter_st',
    name: 'Laucha Torito',
    nationality: { code: 'ARG', iso: 'ar', name: 'Argentina' },
    position: 'ATT',
    subPosition: 'ST',
    playStyle: 'Finisher',
    ovr: 88,
    potentialOvr: 89,
    heightCm: 174,
    weightKg: 72,
    statsOverride: {
      pro: 89,
      def: 52,
      cre: 82,
      men: 90,
      goa: 20,
      phy: 88,
      detailed: {
        pace: 86,
        stamina: 88,
        strength: 88,
        ballControl: 88,
        retention: 89,
        dribbling: 87,
        shortPass: 82,
        longPass: 76,
        crossing: 75,
        shooting: 92,
        heading: 88,
        longShots: 87,
        tackling: 50,
        marking: 48,
        interceptions: 52,
        positioning: 92,
        composure: 90,
        reactions: 90,
      },
    },
  },

  // 12. INTER MILAN #95 — BORDONI (87 OVR) — 26yo Distributor Centerback, Italian
  {
    id: 'unique_bordoni',
    teamId: 'ita_inter',
    shirtNumber: 95,
    matchRole: 'inter_cb',
    name: 'Bordoni',
    nationality: { code: 'ITA', iso: 'it', name: 'Italy' },
    position: 'DEF',
    subPosition: 'CB',
    playStyle: 'Distributor',
    ovr: 87,
    potentialOvr: 89,
    heightCm: 190,
    weightKg: 78,
    statsOverride: {
      pro: 82,
      def: 88,
      cre: 85,
      men: 87,
      goa: 20,
      phy: 86,
      detailed: {
        pace: 80,
        stamina: 86,
        strength: 87,
        ballControl: 84,
        retention: 86,
        dribbling: 80,
        shortPass: 88,
        longPass: 90,
        crossing: 82,
        shooting: 65,
        heading: 87,
        longShots: 72,
        tackling: 89,
        marking: 88,
        interceptions: 88,
        positioning: 87,
        composure: 89,
        reactions: 88,
      },
    },
  },

  // 13. AC MILAN #16 — MAGNIFICAN (86 OVR) — 29yo Balanced Goalkeeper, French (Best French GK starting for national team)
  {
    id: 'unique_magnifican',
    teamId: 'ita_milan',
    shirtNumber: 16,
    matchRole: 'milan_gk',
    name: 'Magnifican',
    nationality: { code: 'FRA', iso: 'fr', name: 'France' },
    position: 'GK',
    subPosition: 'GK',
    playStyle: 'Balanced',
    ovr: 86,
    potentialOvr: 87,
    heightCm: 191,
    weightKg: 89,
    statsOverride: {
      pro: 86,
      def: 86,
      cre: 78,
      men: 88,
      goa: 86,
      phy: 86,
      detailed: {
        pace: 60,
        stamina: 82,
        strength: 86,
        ballControl: 78,
        retention: 75,
        dribbling: 65,
        shortPass: 82,
        longPass: 85,
        crossing: 40,
        shooting: 30,
        heading: 40,
        longShots: 30,
        tackling: 40,
        marking: 30,
        interceptions: 50,
        positioning: 88,
        composure: 89,
        reactions: 88,
      },
    },
  },

  // 14. NAPOLI #17 — KEITH DE ROOY (87 OVR) — 34yo Creator CAM, Belgian (Great Long Pass and Long Shot)
  {
    id: 'unique_keith_de_rooy',
    teamId: 'ita_napoli',
    shirtNumber: 17,
    matchRole: 'napoli_cam',
    name: 'Keith De Rooy',
    nationality: { code: 'BEL', iso: 'be', name: 'Belgium' },
    position: 'MID',
    subPosition: 'CAM',
    playStyle: 'Creator',
    ovr: 87,
    potentialOvr: 87,
    heightCm: 181,
    weightKg: 75,
    statsOverride: {
      pro: 88,
      def: 64,
      cre: 92,
      men: 89,
      goa: 20,
      phy: 82,
      detailed: {
        pace: 78,
        stamina: 84,
        strength: 80,
        ballControl: 91,
        retention: 90,
        dribbling: 88,
        shortPass: 92,
        longPass: 94,
        crossing: 92,
        shooting: 88,
        heading: 74,
        longShots: 93,
        tackling: 62,
        marking: 60,
        interceptions: 65,
        positioning: 89,
        composure: 92,
        reactions: 89,
      },
    },
  },

  // 15. NAPOLI #8 — SIR MCTIMOTHAY (87 OVR) — 28yo Box-to-Box CM, Scottish (Great Long Shot)
  {
    id: 'unique_sir_mctimothay',
    teamId: 'ita_napoli',
    shirtNumber: 8,
    matchRole: 'napoli_cm',
    name: 'Sir McTimothay',
    nationality: { code: 'SCO', iso: 'gb-sct', name: 'Scotland' },
    position: 'MID',
    subPosition: 'CM',
    playStyle: 'Box-to-Box',
    ovr: 87,
    potentialOvr: 88,
    heightCm: 193,
    weightKg: 88,
    statsOverride: {
      pro: 86,
      def: 84,
      cre: 83,
      men: 88,
      goa: 20,
      phy: 90,
      detailed: {
        pace: 82,
        stamina: 92,
        strength: 91,
        ballControl: 85,
        retention: 86,
        dribbling: 82,
        shortPass: 86,
        longPass: 85,
        crossing: 78,
        shooting: 88,
        heading: 88,
        longShots: 91,
        tackling: 85,
        marking: 84,
        interceptions: 85,
        positioning: 88,
        composure: 87,
        reactions: 88,
      },
    },
  },

  // 16. AC MILAN #14 — LUKIC MODAR (86 OVR) — 39yo MC Maestro, Croatian (Great Dribbling, Passing, Long Passing)
  {
    id: 'unique_lukic_modar',
    teamId: 'ita_milan',
    shirtNumber: 14,
    matchRole: 'milan_cm',
    name: 'Lukic Modar',
    nationality: { code: 'CRO', iso: 'hr', name: 'Croatia' },
    position: 'MID',
    subPosition: 'CM',
    playStyle: 'Maestro',
    ovr: 86,
    potentialOvr: 86,
    heightCm: 172,
    weightKg: 66,
    statsOverride: {
      pro: 84,
      def: 74,
      cre: 91,
      men: 90,
      goa: 20,
      phy: 78,
      detailed: {
        pace: 74,
        stamina: 82,
        strength: 72,
        ballControl: 92,
        retention: 93,
        dribbling: 91,
        shortPass: 92,
        longPass: 92,
        crossing: 86,
        shooting: 82,
        heading: 68,
        longShots: 88,
        tackling: 74,
        marking: 72,
        interceptions: 76,
        positioning: 88,
        composure: 93,
        reactions: 90,
      },
    },
  },

  // 17. AC MILAN #11 — POULSIC (85 OVR) — 26yo Prolific Winger, USA
  {
    id: 'unique_poulsic',
    teamId: 'ita_milan',
    shirtNumber: 11,
    matchRole: 'milan_winger',
    name: 'Poulsic',
    nationality: { code: 'USA', iso: 'us', name: 'United States' },
    position: 'ATT',
    subPosition: 'LW',
    playStyle: 'Prolific',
    ovr: 85,
    potentialOvr: 86,
    heightCm: 178,
    weightKg: 73,
    statsOverride: {
      pro: 86,
      def: 48,
      cre: 84,
      men: 84,
      goa: 20,
      phy: 80,
      detailed: {
        pace: 90,
        stamina: 84,
        strength: 74,
        ballControl: 87,
        retention: 86,
        dribbling: 89,
        shortPass: 83,
        longPass: 78,
        crossing: 84,
        shooting: 85,
        heading: 72,
        longShots: 84,
        tackling: 44,
        marking: 42,
        interceptions: 46,
        positioning: 86,
        composure: 85,
        reactions: 87,
      },
    },
  },

  // ==========================================
  // GERMAN FIRST DIVISION (BUNDESLIGA) STARS
  // ==========================================

  // 18. BAYERN MUNICH #9 — HURRIKANE (91 OVR) — 31yo Complete Striker, England
  {
    id: 'unique_hurrikane',
    teamId: 'ger_bayern',
    shirtNumber: 9,
    matchRole: 'bayern_st',
    name: 'Hurrikane',
    nationality: { code: 'ENG', iso: 'gb-eng', name: 'England' },
    position: 'ATT',
    subPosition: 'ST',
    playStyle: 'Complete',
    ovr: 91,
    potentialOvr: 91,
    heightCm: 188,
    weightKg: 86,
    statsOverride: {
      pro: 92,
      def: 48,
      cre: 88,
      men: 91,
      goa: 20,
      phy: 86,
      detailed: {
        pace: 80,
        stamina: 86,
        strength: 87,
        ballControl: 89,
        retention: 90,
        dribbling: 84,
        shortPass: 88,
        longPass: 89,
        crossing: 84,
        shooting: 95,
        heading: 90,
        longShots: 91,
        tackling: 45,
        marking: 42,
        interceptions: 50,
        positioning: 94,
        composure: 93,
        reactions: 92,
      },
    },
  },

  // 19. BAYERN MUNICH #17 — MICHEL (89 OVR) — 24yo Inverted Winger, France
  {
    id: 'unique_michel',
    teamId: 'ger_bayern',
    shirtNumber: 17,
    matchRole: 'bayern_rw',
    name: 'Michel',
    nationality: { code: 'FRA', iso: 'fr', name: 'France' },
    position: 'ATT',
    subPosition: 'RW',
    playStyle: 'Inverted',
    ovr: 89,
    potentialOvr: 92,
    heightCm: 184,
    weightKg: 73,
    statsOverride: {
      pro: 89,
      def: 52,
      cre: 90,
      men: 87,
      goa: 20,
      phy: 82,
      detailed: {
        pace: 89,
        stamina: 84,
        strength: 78,
        ballControl: 91,
        retention: 90,
        dribbling: 92,
        shortPass: 89,
        longPass: 88,
        crossing: 91,
        shooting: 87,
        heading: 70,
        longShots: 89,
        tackling: 48,
        marking: 44,
        interceptions: 52,
        positioning: 89,
        composure: 88,
        reactions: 88,
      },
    },
  },

  // 20. LIVERPOOL FC #10 — FLORIAN WIRTZNER (88 OVR) — 23yo Creator CAM, Germany (Transferred from Bayer Leverkusen)
  {
    id: 'unique_florian_wirtzner',
    teamId: 'eng_liverpool',
    shirtNumber: 10,
    matchRole: 'liverpool_cam',
    name: 'Florian Wirtzner',
    nationality: { code: 'GER', iso: 'de', name: 'Germany' },
    position: 'MID',
    subPosition: 'CAM',
    playStyle: 'Creator',
    ovr: 88,
    potentialOvr: 93,
    heightCm: 177,
    weightKg: 70,
    statsOverride: {
      pro: 87,
      def: 58,
      cre: 92,
      men: 88,
      goa: 20,
      phy: 80,
      detailed: {
        pace: 85,
        stamina: 86,
        strength: 74,
        ballControl: 93,
        retention: 92,
        dribbling: 91,
        shortPass: 92,
        longPass: 90,
        crossing: 88,
        shooting: 86,
        heading: 68,
        longShots: 86,
        tackling: 55,
        marking: 52,
        interceptions: 60,
        positioning: 90,
        composure: 91,
        reactions: 90,
      },
    },
  },

  // 21. BAYERN MUNICH #6 — JOSH KIMMLIN (88 OVR) — 31yo Anchor CDM, Germany
  {
    id: 'unique_josh_kimmlin',
    teamId: 'ger_bayern',
    shirtNumber: 6,
    matchRole: 'bayern_cdm',
    name: 'Josh Kimmlin',
    nationality: { code: 'GER', iso: 'de', name: 'Germany' },
    position: 'MID',
    subPosition: 'CDM',
    playStyle: 'Anchor',
    ovr: 88,
    potentialOvr: 88,
    heightCm: 177,
    weightKg: 75,
    statsOverride: {
      pro: 86,
      def: 86,
      cre: 90,
      men: 91,
      goa: 20,
      phy: 85,
      detailed: {
        pace: 78,
        stamina: 94,
        strength: 82,
        ballControl: 89,
        retention: 91,
        dribbling: 85,
        shortPass: 92,
        longPass: 92,
        crossing: 91,
        shooting: 80,
        heading: 75,
        longShots: 84,
        tackling: 87,
        marking: 85,
        interceptions: 88,
        positioning: 89,
        composure: 92,
        reactions: 91,
      },
    },
  },

  // 22. BAYERN MUNICH #7 — LUCHITO SEMANA (87 OVR) — 29yo Pressing LW, Colombia
  {
    id: 'unique_luchito_semana',
    teamId: 'ger_bayern',
    shirtNumber: 7,
    matchRole: 'bayern_lw',
    name: 'Luchito Semana',
    nationality: { code: 'COL', iso: 'co', name: 'Colombia' },
    position: 'ATT',
    subPosition: 'LW',
    playStyle: 'Pressing',
    ovr: 87,
    potentialOvr: 87,
    heightCm: 178,
    weightKg: 65,
    statsOverride: {
      pro: 88,
      def: 55,
      cre: 85,
      men: 88,
      goa: 20,
      phy: 84,
      detailed: {
        pace: 92,
        stamina: 91,
        strength: 78,
        ballControl: 89,
        retention: 88,
        dribbling: 90,
        shortPass: 84,
        longPass: 80,
        crossing: 85,
        shooting: 86,
        heading: 76,
        longShots: 85,
        tackling: 52,
        marking: 50,
        interceptions: 56,
        positioning: 88,
        composure: 87,
        reactions: 89,
      },
    },
  },

  // 23. BAYER LEVERKUSEN #20 — ALEJANDRO GRIMALDI (86 OVR) — 30yo Inverted LB, Spain
  {
    id: 'unique_alejandro_grimaldi',
    teamId: 'ger_leverkusen',
    shirtNumber: 20,
    matchRole: 'leverkusen_lb',
    name: 'Alejandro Grimaldi',
    nationality: { code: 'ESP', iso: 'es', name: 'Spain' },
    position: 'DEF',
    subPosition: 'LB',
    playStyle: 'Inverted',
    ovr: 86,
    potentialOvr: 86,
    heightCm: 171,
    weightKg: 69,
    statsOverride: {
      pro: 84,
      def: 82,
      cre: 89,
      men: 86,
      goa: 20,
      phy: 80,
      detailed: {
        pace: 84,
        stamina: 88,
        strength: 72,
        ballControl: 88,
        retention: 87,
        dribbling: 85,
        shortPass: 89,
        longPass: 89,
        crossing: 92,
        shooting: 84,
        heading: 68,
        longShots: 88,
        tackling: 82,
        marking: 80,
        interceptions: 83,
        positioning: 86,
        composure: 87,
        reactions: 86,
      },
    },
  },

  // 24. BORUSSIA DORTMUND #1 — GOTTFRIED KOFEL (86 OVR) — 28yo Balanced GK, Switzerland
  {
    id: 'unique_gottfried_kofel',
    teamId: 'ger_dortmund',
    shirtNumber: 1,
    matchRole: 'dortmund_gk',
    name: 'Gottfried Kofel',
    nationality: { code: 'SUI', iso: 'ch', name: 'Switzerland' },
    position: 'GK',
    subPosition: 'GK',
    playStyle: 'Balanced',
    ovr: 86,
    potentialOvr: 88,
    heightCm: 195,
    weightKg: 88,
    statsOverride: {
      pro: 86,
      def: 86,
      cre: 78,
      men: 88,
      goa: 86,
      phy: 86,
      detailed: {
        pace: 56,
        stamina: 80,
        strength: 88,
        ballControl: 75,
        retention: 76,
        dribbling: 60,
        shortPass: 80,
        longPass: 84,
        crossing: 35,
        shooting: 30,
        heading: 45,
        longShots: 30,
        tackling: 40,
        marking: 32,
        interceptions: 52,
        positioning: 89,
        composure: 88,
        reactions: 89,
      },
    },
  },

  // 25. BORUSSIA DORTMUND #9 — SERGIO GURAH (84 OVR) — 30yo Target Striker, Guinea
  {
    id: 'unique_sergio_gurah',
    teamId: 'ger_dortmund',
    shirtNumber: 9,
    matchRole: 'dortmund_st',
    name: 'Sergio Gurah',
    nationality: { code: 'GIN', iso: 'gn', name: 'Guinea' },
    position: 'ATT',
    subPosition: 'ST',
    playStyle: 'Target',
    ovr: 84,
    potentialOvr: 84,
    heightCm: 187,
    weightKg: 82,
    statsOverride: {
      pro: 86,
      def: 42,
      cre: 78,
      men: 84,
      goa: 20,
      phy: 86,
      detailed: {
        pace: 82,
        stamina: 84,
        strength: 88,
        ballControl: 85,
        retention: 86,
        dribbling: 82,
        shortPass: 80,
        longPass: 72,
        crossing: 70,
        shooting: 89,
        heading: 88,
        longShots: 83,
        tackling: 42,
        marking: 40,
        interceptions: 45,
        positioning: 88,
        composure: 86,
        reactions: 85,
      },
    },
  },

  // 26. BORUSSIA DORTMUND #8 — FILIP MTAH (84 OVR) — 25yo Enforcer CDM, Germany
  {
    id: 'unique_filip_mtah',
    teamId: 'ger_dortmund',
    shirtNumber: 8,
    matchRole: 'dortmund_cdm',
    name: 'Filip Mtah',
    nationality: { code: 'GER', iso: 'de', name: 'Germany' },
    position: 'MID',
    subPosition: 'CDM',
    playStyle: 'Enforcer',
    ovr: 84,
    potentialOvr: 87,
    heightCm: 188,
    weightKg: 80,
    statsOverride: {
      pro: 82,
      def: 84,
      cre: 82,
      men: 85,
      goa: 20,
      phy: 87,
      detailed: {
        pace: 84,
        stamina: 88,
        strength: 87,
        ballControl: 84,
        retention: 85,
        dribbling: 83,
        shortPass: 85,
        longPass: 83,
        crossing: 76,
        shooting: 80,
        heading: 82,
        longShots: 84,
        tackling: 85,
        marking: 84,
        interceptions: 85,
        positioning: 84,
        composure: 85,
        reactions: 85,
      },
    },
  },

  // 27. BAYERN MUNICH #4 — JONAS DACH (84 OVR) — 30yo Stopper CB, Germany
  {
    id: 'unique_jonas_dach',
    teamId: 'ger_bayern',
    shirtNumber: 4,
    matchRole: 'bayern_cb',
    name: 'Jonas Dach',
    nationality: { code: 'GER', iso: 'de', name: 'Germany' },
    position: 'DEF',
    subPosition: 'CB',
    playStyle: 'Stopper',
    ovr: 84,
    potentialOvr: 85,
    heightCm: 195,
    weightKg: 94,
    statsOverride: {
      pro: 76,
      def: 87,
      cre: 75,
      men: 86,
      goa: 20,
      phy: 88,
      detailed: {
        pace: 82,
        stamina: 84,
        strength: 92,
        ballControl: 78,
        retention: 80,
        dribbling: 72,
        shortPass: 84,
        longPass: 81,
        crossing: 62,
        shooting: 55,
        heading: 89,
        longShots: 58,
        tackling: 88,
        marking: 87,
        interceptions: 86,
        positioning: 85,
        composure: 86,
        reactions: 85,
      },
    },
  },

  // 28. BAYERN MUNICH #1 — MARKUS NEUNER (84 OVR) — 40yo Sweeper GK, Germany
  {
    id: 'unique_markus_neuner',
    teamId: 'ger_bayern',
    shirtNumber: 1,
    matchRole: 'bayern_gk',
    name: 'Markus Neuner',
    nationality: { code: 'GER', iso: 'de', name: 'Germany' },
    position: 'GK',
    subPosition: 'GK',
    playStyle: 'Sweeper',
    ovr: 84,
    potentialOvr: 84,
    heightCm: 193,
    weightKg: 93,
    statsOverride: {
      pro: 84,
      def: 84,
      cre: 82,
      men: 90,
      goa: 84,
      phy: 82,
      detailed: {
        pace: 60,
        stamina: 78,
        strength: 84,
        ballControl: 85,
        retention: 82,
        dribbling: 70,
        shortPass: 88,
        longPass: 92,
        crossing: 40,
        shooting: 35,
        heading: 45,
        longShots: 35,
        tackling: 48,
        marking: 35,
        interceptions: 60,
        positioning: 90,
        composure: 92,
        reactions: 88,
      },
    },
  },

  // 29. BORUSSIA DORTMUND #26 — JULIAN RYRSON (84 OVR) — 28yo Attacker RB, Norway
  {
    id: 'unique_julian_ryrson',
    teamId: 'ger_dortmund',
    shirtNumber: 26,
    matchRole: 'dortmund_rb',
    name: 'Julian Ryrson',
    nationality: { code: 'NOR', iso: 'no', name: 'Norway' },
    position: 'DEF',
    subPosition: 'RB',
    playStyle: 'Attacker',
    ovr: 84,
    potentialOvr: 85,
    heightCm: 183,
    weightKg: 79,
    statsOverride: {
      pro: 81,
      def: 83,
      cre: 82,
      men: 86,
      goa: 20,
      phy: 86,
      detailed: {
        pace: 86,
        stamina: 92,
        strength: 84,
        ballControl: 82,
        retention: 83,
        dribbling: 82,
        shortPass: 83,
        longPass: 80,
        crossing: 84,
        shooting: 75,
        heading: 78,
        longShots: 78,
        tackling: 84,
        marking: 82,
        interceptions: 83,
        positioning: 84,
        composure: 85,
        reactions: 86,
      },
    },
  },

  // 30. RB LEIPZIG #22 — DAVID RAUMGARD (84 OVR) — 28yo Attacker LB, Germany
  {
    id: 'unique_david_raumgard',
    teamId: 'ger_leipzig',
    shirtNumber: 22,
    matchRole: 'leipzig_lb',
    name: 'David Raumgard',
    nationality: { code: 'GER', iso: 'de', name: 'Germany' },
    position: 'DEF',
    subPosition: 'LB',
    playStyle: 'Attacker',
    ovr: 84,
    potentialOvr: 85,
    heightCm: 180,
    weightKg: 75,
    statsOverride: {
      pro: 82,
      def: 82,
      cre: 86,
      men: 85,
      goa: 20,
      phy: 85,
      detailed: {
        pace: 88,
        stamina: 91,
        strength: 82,
        ballControl: 84,
        retention: 84,
        dribbling: 83,
        shortPass: 84,
        longPass: 85,
        crossing: 91,
        shooting: 76,
        heading: 76,
        longShots: 80,
        tackling: 82,
        marking: 81,
        interceptions: 82,
        positioning: 85,
        composure: 84,
        reactions: 85,
      },
    },
  },

  // 31. BORUSSIA DORTMUND #4 — NICOLAS SCHLOTTER (84 OVR) — 26yo Destroyer CB, Germany
  {
    id: 'unique_nicolas_schlotter',
    teamId: 'ger_dortmund',
    shirtNumber: 4,
    matchRole: 'dortmund_cb',
    name: 'Nicolas Schlotter',
    nationality: { code: 'GER', iso: 'de', name: 'Germany' },
    position: 'DEF',
    subPosition: 'CB',
    playStyle: 'Destroyer',
    ovr: 84,
    potentialOvr: 87,
    heightCm: 191,
    weightKg: 86,
    statsOverride: {
      pro: 78,
      def: 87,
      cre: 80,
      men: 87,
      goa: 20,
      phy: 87,
      detailed: {
        pace: 81,
        stamina: 86,
        strength: 89,
        ballControl: 82,
        retention: 83,
        dribbling: 76,
        shortPass: 86,
        longPass: 87,
        crossing: 70,
        shooting: 64,
        heading: 88,
        longShots: 68,
        tackling: 88,
        marking: 86,
        interceptions: 88,
        positioning: 85,
        composure: 87,
        reactions: 87,
      },
    },
  },

  // 32. VFB STUTTGART #26 — DENNEV UNDIZ (83 OVR) — 28yo Prolific Striker, Germany
  {
    id: 'unique_dennev_undiz',
    teamId: 'ger_stuttgart',
    shirtNumber: 26,
    matchRole: 'stuttgart_st',
    name: 'Dennev Undiz',
    nationality: { code: 'GER', iso: 'de', name: 'Germany' },
    position: 'ATT',
    subPosition: 'ST',
    playStyle: 'Prolific',
    ovr: 83,
    potentialOvr: 84,
    heightCm: 179,
    weightKg: 86,
    statsOverride: {
      pro: 85,
      def: 48,
      cre: 82,
      men: 84,
      goa: 20,
      phy: 84,
      detailed: {
        pace: 80,
        stamina: 84,
        strength: 86,
        ballControl: 85,
        retention: 86,
        dribbling: 83,
        shortPass: 84,
        longPass: 76,
        crossing: 74,
        shooting: 88,
        heading: 84,
        longShots: 84,
        tackling: 48,
        marking: 45,
        interceptions: 50,
        positioning: 88,
        composure: 86,
        reactions: 85,
      },
    },
  },

  // 33. RB LEIPZIG #14 — CHRISTOPH BAUM (83 OVR) — 27yo Shadow CAM, Austria
  {
    id: 'unique_christoph_baum',
    teamId: 'ger_leipzig',
    shirtNumber: 14,
    matchRole: 'leipzig_cam',
    name: 'Christoph Baum',
    nationality: { code: 'AUT', iso: 'at', name: 'Austria' },
    position: 'MID',
    subPosition: 'CAM',
    playStyle: 'Shadow',
    ovr: 83,
    potentialOvr: 84,
    heightCm: 180,
    weightKg: 73,
    statsOverride: {
      pro: 83,
      def: 64,
      cre: 84,
      men: 85,
      goa: 20,
      phy: 83,
      detailed: {
        pace: 82,
        stamina: 87,
        strength: 80,
        ballControl: 85,
        retention: 84,
        dribbling: 84,
        shortPass: 85,
        longPass: 81,
        crossing: 78,
        shooting: 84,
        heading: 80,
        longShots: 83,
        tackling: 62,
        marking: 60,
        interceptions: 66,
        positioning: 87,
        composure: 85,
        reactions: 86,
      },
    },
  },

  // 34. BAYERN MUNICH #3 — MIN-JAE KIMSON (83 OVR) — 29yo Stopper CB, South Korea
  {
    id: 'unique_minjae_kimson',
    teamId: 'ger_bayern',
    shirtNumber: 3,
    matchRole: 'bayern_cb2',
    name: 'Min-Jae Kimson',
    nationality: { code: 'KOR', iso: 'kr', name: 'South Korea' },
    position: 'DEF',
    subPosition: 'CB',
    playStyle: 'Stopper',
    ovr: 83,
    potentialOvr: 84,
    heightCm: 190,
    weightKg: 86,
    statsOverride: {
      pro: 74,
      def: 86,
      cre: 72,
      men: 85,
      goa: 20,
      phy: 87,
      detailed: {
        pace: 82,
        stamina: 84,
        strength: 90,
        ballControl: 76,
        retention: 78,
        dribbling: 70,
        shortPass: 82,
        longPass: 80,
        crossing: 55,
        shooting: 48,
        heading: 88,
        longShots: 52,
        tackling: 87,
        marking: 85,
        interceptions: 86,
        positioning: 84,
        composure: 85,
        reactions: 86,
      },
    },
  },

  // 35. BAYERN MUNICH #8 — LEON GORETZ (83 OVR) — 31yo Box-to-Box CM, Germany
  {
    id: 'unique_leon_goretz',
    teamId: 'ger_bayern',
    shirtNumber: 8,
    matchRole: 'bayern_cm',
    name: 'Leon Goretz',
    nationality: { code: 'GER', iso: 'de', name: 'Germany' },
    position: 'MID',
    subPosition: 'CM',
    playStyle: 'Box-to-Box',
    ovr: 83,
    potentialOvr: 83,
    heightCm: 189,
    weightKg: 82,
    statsOverride: {
      pro: 83,
      def: 80,
      cre: 82,
      men: 86,
      goa: 20,
      phy: 86,
      detailed: {
        pace: 81,
        stamina: 88,
        strength: 87,
        ballControl: 84,
        retention: 85,
        dribbling: 81,
        shortPass: 85,
        longPass: 84,
        crossing: 78,
        shooting: 84,
        heading: 85,
        longShots: 86,
        tackling: 80,
        marking: 79,
        interceptions: 81,
        positioning: 86,
        composure: 86,
        reactions: 86,
      },
    },
  },

  // 36. RB LEIPZIG #1 — PÉTER GULÁCSI (82 OVR) — 36yo Wall GK, Hungary
  {
    id: 'unique_peter_gulacsi',
    teamId: 'ger_leipzig',
    shirtNumber: 1,
    matchRole: 'leipzig_gk',
    name: 'Péter Gulácsi',
    nationality: { code: 'HUN', iso: 'hu', name: 'Hungary' },
    position: 'GK',
    subPosition: 'GK',
    playStyle: 'Wall',
    ovr: 82,
    potentialOvr: 82,
    heightCm: 191,
    weightKg: 86,
    statsOverride: {
      pro: 82,
      def: 82,
      cre: 74,
      men: 84,
      goa: 82,
      phy: 82,
      detailed: {
        pace: 52,
        stamina: 75,
        strength: 82,
        ballControl: 72,
        retention: 74,
        dribbling: 55,
        shortPass: 78,
        longPass: 80,
        crossing: 30,
        shooting: 25,
        heading: 40,
        longShots: 25,
        tackling: 36,
        marking: 30,
        interceptions: 45,
        positioning: 85,
        composure: 85,
        reactions: 84,
      },
    },
  },

  // ==========================================================================
  // PORTUGAL — LIGA PORTUGAL STAR PLAYERS
  // ==========================================================================
  // 1. FC PORTO #99 — DIEGO COSTA (Diogo Costa) (86 OVR)
  {
    id: 'unique_diego_costa',
    teamId: 'por_porto',
    shirtNumber: 99,
    matchRole: 'porto_gk',
    name: 'Diego Costa',
    nationality: { code: 'POR', iso: 'pt', name: 'Portugal' },
    position: 'GK',
    subPosition: 'GK',
    playStyle: 'Balanced',
    ovr: 86,
    potentialOvr: 89,
    heightCm: 186,
    weightKg: 84,
    statsOverride: {
      pro: 86,
      def: 86,
      cre: 80,
      men: 86,
      goa: 86,
      phy: 84,
      detailed: {
        pace: 58,
        stamina: 82,
        strength: 84,
        ballControl: 80,
        retention: 78,
        dribbling: 65,
        shortPass: 84,
        longPass: 86,
        crossing: 30,
        shooting: 25,
        heading: 40,
        longShots: 25,
        tackling: 40,
        marking: 30,
        interceptions: 50,
        positioning: 87,
        composure: 88,
        reactions: 89,
      },
    },
  },

  // 2. SPORTING CP #42 — MORTEN HJULMAN (Morten Hjulmand) (85 OVR)
  {
    id: 'unique_morten_hjulman',
    teamId: 'por_sporting',
    shirtNumber: 42,
    matchRole: 'sporting_cdm',
    name: 'Morten Hjulman',
    nationality: { code: 'DEN', iso: 'dk', name: 'Denmark' },
    position: 'MID',
    subPosition: 'CDM',
    playStyle: 'Anchor',
    ovr: 85,
    potentialOvr: 87,
    heightCm: 185,
    weightKg: 77,
    statsOverride: {
      pro: 76,
      def: 86,
      cre: 83,
      men: 87,
      goa: 25,
      phy: 85,
      detailed: {
        pace: 75,
        stamina: 90,
        strength: 86,
        ballControl: 84,
        retention: 85,
        dribbling: 78,
        shortPass: 86,
        longPass: 84,
        crossing: 70,
        shooting: 74,
        heading: 80,
        longShots: 78,
        tackling: 87,
        marking: 85,
        interceptions: 88,
        positioning: 86,
        composure: 88,
        reactions: 86,
      },
    },
  },

  // 3. SPORTING CP #8 — PEDRO GONCALVES (Pedro Gonçalves) (85 OVR)
  {
    id: 'unique_pedro_goncalves',
    teamId: 'por_sporting',
    shirtNumber: 8,
    matchRole: 'sporting_cam',
    name: 'Pedro Goncalves',
    nationality: { code: 'POR', iso: 'pt', name: 'Portugal' },
    position: 'MID',
    subPosition: 'CAM',
    playStyle: 'Creator',
    ovr: 85,
    potentialOvr: 86,
    heightCm: 173,
    weightKg: 68,
    statsOverride: {
      pro: 84,
      def: 62,
      cre: 86,
      men: 84,
      goa: 25,
      phy: 78,
      detailed: {
        pace: 80,
        stamina: 84,
        strength: 72,
        ballControl: 87,
        retention: 85,
        dribbling: 86,
        shortPass: 86,
        longPass: 84,
        crossing: 82,
        shooting: 85,
        heading: 68,
        longShots: 86,
        tackling: 62,
        marking: 58,
        interceptions: 64,
        positioning: 86,
        composure: 85,
        reactions: 84,
      },
    },
  },

  // 4. SL BENFICA #14 — VANGELIS PAVLI (Vangelis Pavlidis) (84 OVR)
  {
    id: 'unique_vangelis_pavli',
    teamId: 'por_benfica',
    shirtNumber: 14,
    matchRole: 'benfica_st',
    name: 'Vangelis Pavli',
    nationality: { code: 'GRE', iso: 'gr', name: 'Greece' },
    position: 'ATT',
    subPosition: 'ST',
    playStyle: 'Poacher',
    ovr: 84,
    potentialOvr: 85,
    heightCm: 186,
    weightKg: 82,
    statsOverride: {
      pro: 85,
      def: 42,
      cre: 78,
      men: 84,
      goa: 25,
      phy: 84,
      detailed: {
        pace: 82,
        stamina: 83,
        strength: 86,
        ballControl: 84,
        retention: 82,
        dribbling: 81,
        shortPass: 78,
        longPass: 72,
        crossing: 68,
        shooting: 86,
        heading: 84,
        longShots: 80,
        tackling: 40,
        marking: 38,
        interceptions: 45,
        positioning: 87,
        composure: 84,
        reactions: 85,
      },
    },
  },

  // 5. SL BENFICA #1 — ANATOLIY TRUB (Anatoliy Trubin) (83 OVR)
  {
    id: 'unique_anatoliy_trub',
    teamId: 'por_benfica',
    shirtNumber: 1,
    matchRole: 'benfica_gk',
    name: 'Anatoliy Trub',
    nationality: { code: 'UKR', iso: 'ua', name: 'Ukraine' },
    position: 'GK',
    subPosition: 'GK',
    playStyle: 'Wall',
    ovr: 83,
    potentialOvr: 88,
    heightCm: 199,
    weightKg: 88,
    statsOverride: {
      pro: 83,
      def: 83,
      cre: 75,
      men: 84,
      goa: 83,
      phy: 85,
      detailed: {
        pace: 52,
        stamina: 78,
        strength: 88,
        ballControl: 74,
        retention: 72,
        dribbling: 60,
        shortPass: 78,
        longPass: 80,
        crossing: 30,
        shooting: 25,
        heading: 45,
        longShots: 25,
        tackling: 38,
        marking: 30,
        interceptions: 48,
        positioning: 85,
        composure: 85,
        reactions: 86,
      },
    },
  },

  // 6. SL BENFICA #9 — JHONNY BLANDON (Jhon Durán) (82 OVR)
  {
    id: 'unique_jhonny_blandon',
    teamId: 'por_benfica',
    shirtNumber: 9,
    matchRole: 'benfica_st2',
    name: 'Jhonny Blandon',
    nationality: { code: 'COL', iso: 'co', name: 'Colombia' },
    position: 'ATT',
    subPosition: 'ST',
    playStyle: 'Finisher',
    ovr: 82,
    potentialOvr: 88,
    heightCm: 185,
    weightKg: 80,
    statsOverride: {
      pro: 83,
      def: 40,
      cre: 74,
      men: 81,
      goa: 25,
      phy: 84,
      detailed: {
        pace: 86,
        stamina: 82,
        strength: 86,
        ballControl: 82,
        retention: 80,
        dribbling: 81,
        shortPass: 75,
        longPass: 68,
        crossing: 65,
        shooting: 84,
        heading: 82,
        longShots: 83,
        tackling: 38,
        marking: 35,
        interceptions: 40,
        positioning: 83,
        composure: 80,
        reactions: 82,
      },
    },
  },

  // 7. SPORTING CP #17 — FRANCISCO TRINC (Francisco Trincão) (81 OVR)
  {
    id: 'unique_francisco_trinc',
    teamId: 'por_sporting',
    shirtNumber: 17,
    matchRole: 'sporting_rw',
    name: 'Francisco Trinc',
    nationality: { code: 'POR', iso: 'pt', name: 'Portugal' },
    position: 'ATT',
    subPosition: 'RW',
    playStyle: 'Inverted',
    ovr: 81,
    potentialOvr: 84,
    heightCm: 184,
    weightKg: 76,
    statsOverride: {
      pro: 81,
      def: 48,
      cre: 82,
      men: 80,
      goa: 25,
      phy: 78,
      detailed: {
        pace: 84,
        stamina: 80,
        strength: 74,
        ballControl: 85,
        retention: 84,
        dribbling: 86,
        shortPass: 81,
        longPass: 76,
        crossing: 80,
        shooting: 80,
        heading: 68,
        longShots: 82,
        tackling: 46,
        marking: 42,
        interceptions: 50,
        positioning: 82,
        composure: 81,
        reactions: 80,
      },
    },
  },

  // 8. SPORTING CP #25 — GONCALO INACIO (Gonçalo Inácio) (81 OVR)
  {
    id: 'unique_goncalo_inacio',
    teamId: 'por_sporting',
    shirtNumber: 25,
    matchRole: 'sporting_cb',
    name: 'Goncalo Inacio',
    nationality: { code: 'POR', iso: 'pt', name: 'Portugal' },
    position: 'DEF',
    subPosition: 'CB',
    playStyle: 'Playmaker',
    ovr: 81,
    potentialOvr: 86,
    heightCm: 185,
    weightKg: 78,
    statsOverride: {
      pro: 60,
      def: 82,
      cre: 79,
      men: 82,
      goa: 25,
      phy: 80,
      detailed: {
        pace: 78,
        stamina: 82,
        strength: 82,
        ballControl: 80,
        retention: 78,
        dribbling: 72,
        shortPass: 83,
        longPass: 84,
        crossing: 65,
        shooting: 55,
        heading: 82,
        longShots: 60,
        tackling: 83,
        marking: 82,
        interceptions: 83,
        positioning: 82,
        composure: 83,
        reactions: 82,
      },
    },
  },

  // 9. FC PORTO #15 — JAKUB KIWIOR (Jakub Kiwior) (80 OVR)
  {
    id: 'unique_jakub_kiwior',
    teamId: 'por_porto',
    shirtNumber: 15,
    matchRole: 'porto_cb',
    name: 'Jakub Kiwior',
    nationality: { code: 'POL', iso: 'pl', name: 'Poland' },
    position: 'DEF',
    subPosition: 'CB',
    playStyle: 'Stopper',
    ovr: 80,
    potentialOvr: 84,
    heightCm: 189,
    weightKg: 75,
    statsOverride: {
      pro: 55,
      def: 81,
      cre: 76,
      men: 80,
      goa: 25,
      phy: 80,
      detailed: {
        pace: 76,
        stamina: 80,
        strength: 82,
        ballControl: 77,
        retention: 76,
        dribbling: 68,
        shortPass: 80,
        longPass: 79,
        crossing: 66,
        shooting: 50,
        heading: 81,
        longShots: 55,
        tackling: 82,
        marking: 81,
        interceptions: 81,
        positioning: 80,
        composure: 80,
        reactions: 80,
      },
    },
  },

  // 10. SL BENFICA #10 — YURI SUDAKOV (Georgiy Sudakov) (80 OVR)
  {
    id: 'unique_yuri_sudakov',
    teamId: 'por_benfica',
    shirtNumber: 10,
    matchRole: 'benfica_cam',
    name: 'Yuri Sudakov',
    nationality: { code: 'UKR', iso: 'ua', name: 'Ukraine' },
    position: 'MID',
    subPosition: 'CAM',
    playStyle: 'Creator',
    ovr: 80,
    potentialOvr: 87,
    heightCm: 177,
    weightKg: 70,
    statsOverride: {
      pro: 78,
      def: 55,
      cre: 82,
      men: 80,
      goa: 25,
      phy: 76,
      detailed: {
        pace: 80,
        stamina: 82,
        strength: 70,
        ballControl: 84,
        retention: 82,
        dribbling: 83,
        shortPass: 83,
        longPass: 80,
        crossing: 78,
        shooting: 78,
        heading: 60,
        longShots: 80,
        tackling: 55,
        marking: 52,
        interceptions: 58,
        positioning: 80,
        composure: 81,
        reactions: 80,
      },
    },
  },

  // 11. FC PORTO #22 — ALAN VAREL (Alan Varela) (79 OVR)
  {
    id: 'unique_alan_varel',
    teamId: 'por_porto',
    shirtNumber: 22,
    matchRole: 'porto_cdm',
    name: 'Alan Varel',
    nationality: { code: 'ARG', iso: 'ar', name: 'Argentina' },
    position: 'MID',
    subPosition: 'CDM',
    playStyle: 'Enforcer',
    ovr: 79,
    potentialOvr: 84,
    heightCm: 177,
    weightKg: 73,
    statsOverride: {
      pro: 65,
      def: 81,
      cre: 78,
      men: 82,
      goa: 25,
      phy: 80,
      detailed: {
        pace: 74,
        stamina: 86,
        strength: 80,
        ballControl: 80,
        retention: 80,
        dribbling: 75,
        shortPass: 82,
        longPass: 80,
        crossing: 65,
        shooting: 66,
        heading: 75,
        longShots: 72,
        tackling: 82,
        marking: 80,
        interceptions: 82,
        positioning: 81,
        composure: 82,
        reactions: 81,
      },
    },
  },

  // 12. SL BENFICA #8 — FREDRIK AURSNE (Fredrik Aursnes) (79 OVR)
  {
    id: 'unique_fredrik_aursne',
    teamId: 'por_benfica',
    shirtNumber: 8,
    matchRole: 'benfica_cm',
    name: 'Fredrik Aursne',
    nationality: { code: 'NOR', iso: 'no', name: 'Norway' },
    position: 'MID',
    subPosition: 'CM',
    playStyle: 'Box-to-Box',
    ovr: 79,
    potentialOvr: 80,
    heightCm: 179,
    weightKg: 71,
    statsOverride: {
      pro: 74,
      def: 78,
      cre: 80,
      men: 82,
      goa: 25,
      phy: 80,
      detailed: {
        pace: 75,
        stamina: 88,
        strength: 78,
        ballControl: 81,
        retention: 80,
        dribbling: 77,
        shortPass: 82,
        longPass: 80,
        crossing: 76,
        shooting: 72,
        heading: 74,
        longShots: 75,
        tackling: 78,
        marking: 76,
        interceptions: 79,
        positioning: 81,
        composure: 83,
        reactions: 82,
      },
    },
  },

  // 13. SPORTING CP #21 — GENY CATAM (Geny Catamo) (78 OVR)
  {
    id: 'unique_geny_catam',
    teamId: 'por_sporting',
    shirtNumber: 21,
    matchRole: 'sporting_rw2',
    name: 'Geny Catam',
    nationality: { code: 'MOZ', iso: 'mz', name: 'Mozambique' },
    position: 'ATT',
    subPosition: 'RW',
    playStyle: 'Traditional',
    ovr: 78,
    potentialOvr: 82,
    heightCm: 173,
    weightKg: 67,
    statsOverride: {
      pro: 78,
      def: 58,
      cre: 78,
      men: 77,
      goa: 25,
      phy: 78,
      detailed: {
        pace: 88,
        stamina: 82,
        strength: 68,
        ballControl: 81,
        retention: 80,
        dribbling: 84,
        shortPass: 76,
        longPass: 72,
        crossing: 80,
        shooting: 76,
        heading: 62,
        longShots: 77,
        tackling: 56,
        marking: 54,
        interceptions: 60,
        positioning: 78,
        composure: 76,
        reactions: 78,
      },
    },
  },

  // 14. SC BRAGA #21 — RICARDO HORTE (Ricardo Horta) (78 OVR)
  {
    id: 'unique_ricardo_horte',
    teamId: 'por_braga',
    shirtNumber: 21,
    matchRole: 'braga_lw',
    name: 'Ricardo Horte',
    nationality: { code: 'POR', iso: 'pt', name: 'Portugal' },
    position: 'ATT',
    subPosition: 'LW',
    playStyle: 'Prolific',
    ovr: 78,
    potentialOvr: 78,
    heightCm: 173,
    weightKg: 66,
    statsOverride: {
      pro: 79,
      def: 45,
      cre: 78,
      men: 80,
      goa: 25,
      phy: 76,
      detailed: {
        pace: 80,
        stamina: 80,
        strength: 68,
        ballControl: 80,
        retention: 78,
        dribbling: 81,
        shortPass: 78,
        longPass: 74,
        crossing: 79,
        shooting: 80,
        heading: 65,
        longShots: 80,
        tackling: 44,
        marking: 40,
        interceptions: 48,
        positioning: 81,
        composure: 80,
        reactions: 80,
      },
    },
  },
];

/**
 * Checks if a given player object corresponds to a registered Unique Elite Player.
 */
export function getUniqueElitePlayerDef(player: Partial<PlayerCardData> | null | undefined): UniqueElitePlayerDef | undefined {
  if (!player) return undefined;

  if (player.id) {
    const foundById = UNIQUE_ELITE_PLAYERS_REGISTRY.find((u) => u.id === player.id);
    if (foundById) return foundById;
  }

  if (player.name) {
    const normName = player.name.toLowerCase().trim();
    const foundByName = UNIQUE_ELITE_PLAYERS_REGISTRY.find(
      (u) =>
        u.name.toLowerCase() === normName ||
        (u.id === 'unique_haal_norway' && (normName.includes('haal') || normName.includes('haaland'))) ||
        (u.id === 'unique_kiki_mobutu' && (normName.includes('kiki') || normName.includes('mobutu') || normName.includes('mbappe') || normName.includes('mbappé'))) ||
        (u.id === 'unique_oussie_levoler' && (normName.includes('oussie') || normName.includes('levoler') || normName.includes('dembele'))) ||
        (u.id === 'unique_rodi' && (normName.includes('rodi') || normName.includes('rodri'))) ||
        (u.id === 'unique_yamin_lemal' && (normName.includes('yamin') || normName.includes('lemal') || normName.includes('lamine') || normName.includes('yamal'))) ||
        (u.id === 'unique_judah_bellman' && (normName.includes('judah') || normName.includes('bellman') || normName.includes('bellingham') || normName.includes('jude'))) ||
        (u.id === 'unique_vininho_junior' && (normName.includes('vininho') || normName.includes('vinicius') || normName.includes('vinícius'))) ||
        (u.id === 'unique_rapao' && (normName.includes('rapao') || normName.includes('raphinha'))) ||
        (u.id === 'unique_pablo_cubata' && (normName.includes('cubata') || normName.includes('cubarsi') || normName.includes('cubarsí'))) ||
        (u.id === 'unique_michel_oyechaval' && (normName.includes('oyechaval') || normName.includes('oyarzabal') || normName.includes('mikel'))) ||
        (u.id === 'unique_pajarito_laverde' && (normName.includes('pajarito') || normName.includes('laverde') || normName.includes('valverde'))) ||
        (u.id === 'unique_juan_garceo' && (normName.includes('garceo') || normName.includes('joan garcia') || normName.includes('joan garcía') || normName.includes('garcia'))) ||
        (u.id === 'unique_tibo_corternos' && (normName.includes('tibo') || normName.includes('corternos') || normName.includes('courtois'))) ||
        (u.id === 'unique_july_alvez' && (normName.includes('july alvez') || normName.includes('julian alvarez') || normName.includes('julián álvarez') || normName.includes('alvarez'))) ||
        (u.id === 'unique_aymeric_laporte' && (normName.includes('laporte') || normName.includes('la porte') || normName.includes('aymeric'))) ||
        (u.id === 'unique_bernard_silvao' && (normName.includes('silvao') || normName.includes('bernardo silva'))) ||
        (u.id === 'unique_francis_deroon' && (normName.includes('francis de roon') || normName.includes('de jong') || normName.includes('frenkie'))) ||
        (u.id === 'unique_fermin_lopez' && (normName.includes('fermin') || normName.includes('fermín'))) ||
        (u.id === 'unique_isco_alarcon' && (normName.includes('isco') || normName.includes('alarcon') || normName.includes('alarcón'))) ||
        (u.id === 'unique_ibrahim_diez' && (normName.includes('ibrahim diez') || normName.includes('brahim') || normName.includes('diaz') || normName.includes('díaz'))) ||
        (u.id === 'unique_antonio_flacon' && (normName.includes('flacon') || normName.includes('anthony gordon') || normName.includes('gordon'))) ||
        (u.id === 'unique_ian_diomedes' && (normName.includes('diomedes') || normName.includes('diomande') || normName.includes('diomandé'))) ||
        (u.id === 'unique_roninho_gois' && (normName.includes('roninho') || normName.includes('rodrygo') || normName.includes('gois') || normName.includes('góis'))) ||
        (u.id === 'unique_piti' && (normName === 'piti' || normName.includes('pedri'))) ||
        (u.id === 'unique_unan_simoni' && (normName.includes('unan') || normName.includes('simoni') || normName.includes('unai simon') || normName.includes('unai simón'))) ||
        (u.id === 'unique_anty_budemar' && (normName.includes('budemar') || normName.includes('budimir') || normName.includes('ante budimir'))) ||
        (u.id === 'unique_santiago_helices' && (normName.includes('helices') || normName.includes('aspas') || normName.includes('iago aspas'))) ||
        (u.id === 'unique_ed_militinho' && (normName.includes('militinho') || normName.includes('militao') || normName.includes('militão'))) ||
        (u.id === 'unique_julio_kande' && (normName.includes('kande') || normName.includes('kounde') || normName.includes('koundé'))) ||
        (u.id === 'unique_nick_martins' && (normName.includes('nick martins') || normName.includes('nico williams') || normName.includes('williams'))) ||
        (u.id === 'unique_arelian_chomeninga' && (normName.includes('chomeninga') || normName.includes('tchouameni') || normName.includes('tchouaméni'))) ||
        (u.id === 'unique_juaninho_cancel' && (normName.includes('juaninho cancel') || normName.includes('cancelo') || normName.includes('joao cancelo') || normName.includes('joão cancelo'))) ||
        (u.id === 'unique_janus_oblak' && (normName.includes('oblak') || normName.includes('janus'))) ||
        (u.id === 'unique_antony_diruger' && (normName.includes('diruger') || normName.includes('rudiger') || normName.includes('rüdiger'))) ||
        (u.id === 'unique_ady_watchman' && (normName.includes('watchman') || normName.includes('lookman'))) ||
        (u.id === 'unique_gigi_simon' && (normName.includes('gigi simon') || normName.includes('giuliano simeone') || normName.includes('giuliano'))) ||
        (u.id === 'unique_declan_bread' && (normName.includes('declan') || normName.includes('bread') || normName.includes('rice'))) ||
        (u.id === 'unique_emphies_detay' && (normName.includes('emphies') || normName.includes('detay') || normName.includes('depay'))) ||
        (u.id === 'unique_romualdo' && (normName.includes('romualdo') || normName.includes('ronaldo') || normName === 'cr7')) ||
        (u.id === 'unique_salem_aldawsari' && (normName.includes('salem') || normName.includes('dawsari') || normName.includes('dosari'))) ||
        (u.id === 'unique_fahad_alshehri' && (normName.includes('fahad') || normName.includes('shehri') || normName.includes('muwallad'))) ||
        (u.id === 'unique_nico' && (normName === 'nico' || normName.includes('nico') || normName.includes('barella'))) ||
        (u.id === 'unique_laucha_torito' && (normName.includes('laucha') || normName.includes('torito') || normName.includes('martinez'))) ||
        (u.id === 'unique_bordoni' && (normName.includes('bordoni') || normName.includes('bastoni'))) ||
        (u.id === 'unique_magnifican' && (normName.includes('magnifican') || normName.includes('maignan'))) ||
        (u.id === 'unique_keith_de_rooy' && (normName.includes('keith') || normName.includes('de rooy') || normName.includes('de bruyne') || normName.includes('koopmeiners'))) ||
        (u.id === 'unique_sir_mctimothay' && (normName.includes('mctimothay') || normName.includes('mctominay'))) ||
        (u.id === 'unique_lukic_modar' && (normName.includes('lukic') || normName.includes('modar') || normName.includes('modric'))) ||
        (u.id === 'unique_poulsic' && (normName.includes('poulsic') || normName.includes('pulisic'))) ||
        (u.id === 'unique_hurrikane' && (normName.includes('hurrikane') || normName.includes('kane'))) ||
        (u.id === 'unique_michel' && (normName.includes('michel') || normName.includes('olise'))) ||
        (u.id === 'unique_florian_wirtzner' && (normName.includes('wirtzner') || normName.includes('wirtz'))) ||
        (u.id === 'unique_josh_kimmlin' && (normName.includes('kimmlin') || normName.includes('kimmich'))) ||
        (u.id === 'unique_luchito_semana' && (normName.includes('luchito') || normName.includes('diaz') || normName.includes('semana'))) ||
        (u.id === 'unique_alejandro_grimaldi' && (normName.includes('grimaldi') || normName.includes('grimaldo'))) ||
        (u.id === 'unique_gottfried_kofel' && (normName.includes('kofel') || normName.includes('kobel'))) ||
        (u.id === 'unique_sergio_gurah' && (normName.includes('gurah') || normName.includes('guirassy'))) ||
        (u.id === 'unique_filip_mtah' && (normName.includes('mtah') || normName.includes('nmecha'))) ||
        (u.id === 'unique_jonas_dach' && (normName.includes('dach') || normName.includes('tah'))) ||
        (u.id === 'unique_markus_neuner' && (normName.includes('neuner') || normName.includes('neuer'))) ||
        (u.id === 'unique_julian_ryrson' && (normName.includes('ryrson') || normName.includes('ryerson'))) ||
        (u.id === 'unique_david_raumgard' && (normName.includes('raumgard') || normName.includes('raum'))) ||
        (u.id === 'unique_nicolas_schlotter' && (normName.includes('schlotter') || normName.includes('schlotterbeck'))) ||
        (u.id === 'unique_dennev_undiz' && (normName.includes('undiz') || normName.includes('undav'))) ||
        (u.id === 'unique_christoph_baum' && (normName.includes('baum') || normName.includes('baumgartner'))) ||
        (u.id === 'unique_minjae_kimson' && (normName.includes('kimson') || normName.includes('min-jae') || normName.includes('minjae'))) ||
        (u.id === 'unique_leon_goretz' && (normName.includes('goretz') || normName.includes('goretzka'))) ||
        (u.id === 'unique_peter_gulacsi' && (normName.includes('gulacsi') || normName.includes('gulácsi'))) ||
        (u.id === 'unique_diego_costa' && (normName.includes('diego costa') || normName.includes('diogo costa'))) ||
        (u.id === 'unique_morten_hjulman' && (normName.includes('hjulman') || normName.includes('hjulmand'))) ||
        (u.id === 'unique_pedro_goncalves' && (normName.includes('goncalves') || normName.includes('gonçalves') || normName.includes('pote'))) ||
        (u.id === 'unique_vangelis_pavli' && (normName.includes('pavli') || normName.includes('pavlidis'))) ||
        (u.id === 'unique_anatoliy_trub' && (normName.includes('trub') || normName.includes('trubin'))) ||
        (u.id === 'unique_jhonny_blandon' && (normName.includes('blandon') || normName.includes('jhon duran') || normName.includes('durán'))) ||
        (u.id === 'unique_francisco_trinc' && (normName.includes('trinc') || normName.includes('trincão') || normName.includes('trincao'))) ||
        (u.id === 'unique_goncalo_inacio' && (normName.includes('inacio') || normName.includes('inácio'))) ||
        (u.id === 'unique_jakub_kiwior' && (normName.includes('kiwior') || normName.includes('jakub kiwior'))) ||
        (u.id === 'unique_yuri_sudakov' && (normName.includes('sudakov') || normName.includes('yuri sudakov'))) ||
        (u.id === 'unique_alan_varel' && (normName.includes('varel') || normName.includes('varela'))) ||
        (u.id === 'unique_fredrik_aursne' && (normName.includes('aursne') || normName.includes('aursnes'))) ||
        (u.id === 'unique_geny_catam' && (normName.includes('catam') || normName.includes('catamo'))) ||
        (u.id === 'unique_ricardo_horte' && (normName.includes('horte') || normName.includes('horta'))) ||
        (u.id === 'unique_davie_marca' && (normName.includes('davie') || normName.includes('marca') || normName.includes('raya') || normName.includes('david raya'))) ||
        (u.id === 'unique_sukaya_bako' && (normName.includes('sukaya') || normName.includes('bako') || normName.includes('saka') || normName.includes('bukayo'))) ||
        (u.id === 'unique_roman_days' && (normName.includes('roman days') || normName.includes('ruben dias') || normName.includes('rúben dias') || normName.includes('dias'))) ||
        (u.id === 'unique_marty_overgrad' && (normName.includes('overgrad') || normName.includes('odegaard') || normName.includes('ødegaard') || normName.includes('martin odegaard'))) ||
        (u.id === 'unique_san_tony' && (normName.includes('san tony') || normName.includes('tonali') || normName.includes('sandro tonali'))) ||
        (u.id === 'unique_pickgloves' && (normName.includes('pickgloves') || normName.includes('pickford') || normName.includes('jordan pickford'))) ||
        (u.id === 'unique_willy_salive' && (normName.includes('salive') || normName.includes('saliba') || normName.includes('william saliba'))) ||
        (u.id === 'unique_brunao_fernandinho' && (normName.includes('brunao fernandinho') || normName.includes('bruno fernandes') || normName.includes('fernandes'))) ||
        (u.id === 'unique_philly_fodins' && (normName.includes('fodins') || normName.includes('foden') || normName.includes('phil foden'))) ||
        (u.id === 'unique_brunao_guimarinho' && (normName.includes('guimarinho') || normName.includes('guimaraes') || normName.includes('guimarães') || normName.includes('bruno guimarães') || normName.includes('bruno guimaraes'))) ||
        (u.id === 'unique_domico_szosaboszli' && (normName.includes('szosaboszli') || normName.includes('szoboszlai') || normName.includes('dominik szoboszlai') || normName.includes('domico'))) ||
        (u.id === 'unique_danny_muniz' && (normName.includes('danny muniz') || normName.includes('danny muñiz') || normName.includes('munoz') || normName.includes('muñoz') || normName.includes('daniel munoz') || normName.includes('daniel muñoz'))) ||
        (u.id === 'unique_josko_gvardiolo' && (normName.includes('gvardiolo') || normName.includes('gvardiol') || normName.includes('josko') || normName.includes('joško'))) ||
        (u.id === 'unique_gaby_magalinho' && (normName.includes('magalinho') || normName.includes('magalhaes') || normName.includes('magalhães') || normName.includes('gabriel magalhaes') || normName.includes('gabriel magalhães'))) ||
        (u.id === 'unique_collin_palmo' && (normName.includes('collin palmo') || normName.includes('palmo') || normName.includes('cole palmer') || normName.includes('palmer'))) ||
        (u.id === 'unique_ray_cherins' && (normName.includes('cherins') || normName.includes('cherki') || normName.includes('rayan cherki'))) ||
        (u.id === 'unique_barto_de_verruggen' && (normName.includes('verruggen') || normName.includes('verbruggen') || normName.includes('bart verbruggen'))) ||
        (u.id === 'unique_abdodir_zhukanov' && (normName.includes('zhukanov') || normName.includes('khusanov') || normName.includes('abdukodir'))) ||
        (u.id === 'unique_alexr_saki' && (normName.includes('saki') || normName.includes('isak') || normName.includes('alexander isak'))) ||
        (u.id === 'unique_elly_anders' && (normName.includes('elly anders') || normName.includes('elliot anderson') || normName.includes('anderson'))) ||
        (u.id === 'unique_maty_fernandinho' && (normName.includes('maty fernandinho') || normName.includes('mateus fernandes'))) ||
        (u.id === 'unique_antony_emeny' && (normName.includes('emeny') || normName.includes('semenyo') || normName.includes('antoine semenyo'))) ||
        (u.id === 'unique_johnny_pedrinho' && (normName.includes('pedrinho') || normName.includes('joao pedro') || normName.includes('joão pedro'))) ||
        (u.id === 'unique_wibbs_grey' && (normName.includes('wibbs') || normName.includes('gibbs-white') || normName.includes('gibbs white') || normName.includes('morgan gibbs-white'))) ||
        (u.id === 'unique_deeny_anderson' && (normName.includes('deeny') || normName.includes('dean henderson') || normName.includes('henderson'))) ||
        (u.id === 'unique_emi_alvarez' && (normName.includes('emi alvarez') || normName.includes('emiliano martinez') || normName.includes('emiliano martínez') || normName.includes('dibu'))) ||
        (u.id === 'unique_vicky_gyokero' && (normName.includes('gyokero') || normName.includes('gyokeres') || normName.includes('gyökeres') || normName.includes('viktor gyokeres'))) ||
        (u.id === 'unique_ebezi_ezo' && (normName.includes('ebezi') || normName.includes('ezo') || normName.includes('eze') || normName.includes('eberechi'))) ||
        (u.id === 'unique_marty_zubimendo' && (normName.includes('zubimendo') || normName.includes('zubimendi') || normName.includes('martin zubimendi') || normName.includes('martín zubimendi'))) ||
        (u.id === 'unique_harrold_bow' && (normName.includes('harrold bow') || normName.includes('bowen') || normName.includes('jarrod bowen'))) ||
        (u.id === 'unique_oll_whatins' && (normName.includes('whatins') || normName.includes('watkins') || normName.includes('ollie watkins'))) ||
        (u.id === 'unique_el_junior_rouki' && (normName.includes('rouki') || normName.includes('kroupi') || normName.includes('eli junior') || normName.includes('junior rouki'))) ||
        (u.id === 'unique_caom_zelleher' && (normName.includes('zelleher') || normName.includes('kelleher') || normName.includes('caoimhin') || normName.includes('caoimhín'))) ||
        (u.id === 'unique_pedro_stampfoot' && (normName.includes('stampfoot') || normName.includes('hincapie') || normName.includes('hincapié') || normName.includes('piero hincapie'))) ||
        (u.id === 'unique_elton_thagao' && (normName.includes('thagao') || normName.includes('igor thiago') || normName.includes('thiago'))) ||
        (u.id === 'unique_non_emenike' && (normName.includes('non emenike') || normName.includes('emenike') || normName.includes('madueke') || normName.includes('noni madueke')))
    );
    if (foundByName) return foundByName;
  }

  return undefined;
}

export function isUniqueElitePlayer(player: Partial<PlayerCardData> | null | undefined): boolean {
  return getUniqueElitePlayerDef(player) !== undefined;
}

/**
 * Builds a complete PlayerCardData object for a Unique Elite Player.
 */
export function buildUniquePlayerCard(
  def: UniqueElitePlayerDef,
  existingPlayer?: Partial<PlayerCardData> | null
): PlayerCardData {
  let baseClub = 'Club';
  let baseCountry = 'ENG';
  let defaultAge = 26;

  if (def.teamId === 'eng_mancity') {
    baseClub = 'Manchester City';
    baseCountry = 'ENG';
    defaultAge = def.id === 'unique_roman_days' ? 29 : def.id === 'unique_haal_norway' || def.id === 'unique_philly_fodins' ? 26 : def.id === 'unique_josko_gvardiolo' ? 24 : def.id === 'unique_elly_anders' ? 23 : 22;
  } else if (def.teamId === 'eng_arsenal') {
    baseClub = 'Arsenal FC';
    baseCountry = 'ENG';
    defaultAge = def.id === 'unique_davie_marca' ? 30 : def.id === 'unique_gaby_magalinho' || def.id === 'unique_brunao_guimarinho' || def.id === 'unique_vicky_gyokero' || def.id === 'unique_ebezi_ezo' ? 28 : def.id === 'unique_declan_bread' || def.id === 'unique_marty_overgrad' || def.id === 'unique_marty_zubimendo' ? 27 : def.id === 'unique_willy_salive' ? 25 : 24;
  } else if (def.teamId === 'eng_liverpool') {
    baseClub = 'Liverpool FC';
    baseCountry = 'ENG';
    defaultAge = 25;
  } else if (def.teamId === 'eng_tottenham') {
    baseClub = 'Tottenham Hotspur';
    baseCountry = 'ENG';
    defaultAge = def.id === 'unique_san_tony' ? 26 : 22;
  } else if (def.teamId === 'eng_everton') {
    baseClub = 'Everton FC';
    baseCountry = 'ENG';
    defaultAge = 37;
  } else if (def.teamId === 'eng_manutd') {
    baseClub = 'Manchester United';
    baseCountry = 'ENG';
    defaultAge = 31;
  } else if (def.teamId === 'eng_chelsea') {
    baseClub = 'Chelsea FC';
    baseCountry = 'ENG';
    defaultAge = 24;
  } else if (def.teamId === 'eng_brighton') {
    baseClub = 'Brighton & Hove Albion';
    baseCountry = 'ENG';
    defaultAge = 24;
  } else if (def.teamId === 'eng_newcastle') {
    baseClub = 'Newcastle United';
    baseCountry = 'ENG';
    defaultAge = 26;
  } else if (def.teamId === 'eng_bournemouth') {
    baseClub = 'AFC Bournemouth';
    baseCountry = 'ENG';
    defaultAge = def.id === 'unique_el_junior_rouki' ? 20 : 26;
  } else if (def.teamId === 'eng_nottingham') {
    baseClub = 'Nottingham Forest';
    baseCountry = 'ENG';
    defaultAge = 26;
  } else if (def.teamId === 'eng_palace') {
    baseClub = 'Crystal Palace';
    baseCountry = 'ENG';
    defaultAge = 29;
  } else if (def.teamId === 'eng_astonvilla') {
    baseClub = 'Aston Villa';
    baseCountry = 'ENG';
    defaultAge = def.id === 'unique_emi_alvarez' ? 33 : 30;
  } else if (def.teamId === 'eng_westham') {
    baseClub = 'West Ham United';
    baseCountry = 'ENG';
    defaultAge = 29;
  } else if (def.teamId === 'eng_brentford') {
    baseClub = 'Brentford FC';
    baseCountry = 'ENG';
    defaultAge = def.id === 'unique_caom_zelleher' ? 27 : 25;
  } else if (def.teamId === 'esp_realmadrid') {
    baseClub = 'Real Madrid';
    baseCountry = 'ESP';
    defaultAge = def.id === 'unique_tibo_corternos' ? 34 : def.id === 'unique_antony_diruger' ? 33 : def.id === 'unique_bernard_silvao' ? 32 : def.id === 'unique_pajarito_laverde' || def.id === 'unique_ed_militinho' ? 28 : def.id === 'unique_kiki_mobutu' || def.id === 'unique_ibrahim_diez' ? 27 : def.id === 'unique_vininho_junior' || def.id === 'unique_arelian_chomeninga' ? 26 : def.id === 'unique_roninho_gois' ? 25 : def.id === 'unique_judah_bellman' ? 23 : 19;
  } else if (def.teamId === 'esp_barcelona') {
    baseClub = 'FC Barcelona';
    baseCountry = 'ESP';
    defaultAge = def.id === 'unique_juaninho_cancel' ? 32 : def.id === 'unique_rodi' ? 30 : def.id === 'unique_rapao' || def.id === 'unique_francis_deroon' ? 29 : def.id === 'unique_julio_kande' ? 27 : def.id === 'unique_juan_garceo' || def.id === 'unique_antonio_flacon' ? 25 : def.id === 'unique_fermin_lopez' || def.id === 'unique_piti' ? 23 : 19;
  } else if (def.teamId === 'esp_atletico') {
    baseClub = 'Atlético Madrid';
    baseCountry = 'ESP';
    defaultAge = def.id === 'unique_janus_oblak' ? 33 : def.id === 'unique_ady_watchman' ? 28 : def.id === 'unique_july_alvez' ? 26 : 23;
  } else if (def.teamId === 'esp_realsociedad') {
    baseClub = 'Real Sociedad';
    baseCountry = 'ESP';
    defaultAge = 29;
  } else if (def.teamId === 'esp_athletic') {
    baseClub = 'Athletic Bilbao';
    baseCountry = 'ESP';
    defaultAge = def.id === 'unique_aymeric_laporte' ? 32 : def.id === 'unique_unan_simoni' ? 29 : 24;
  } else if (def.teamId === 'esp_realbetis') {
    baseClub = 'Real Betis';
    baseCountry = 'ESP';
    defaultAge = 34;
  } else if (def.teamId === 'esp_osasuna') {
    baseClub = 'CA Osasuna';
    baseCountry = 'ESP';
    defaultAge = 35;
  } else if (def.teamId === 'esp_celta') {
    baseClub = 'Celta Vigo';
    baseCountry = 'ESP';
    defaultAge = 39;
  } else if (def.teamId === 'fra_psg') {
    baseClub = 'PSG';
    baseCountry = 'FR';
  } else if (def.teamId === 'bra_corinthians') {
    baseClub = 'SC Corinthians Paulista';
    baseCountry = 'BRA';
  } else if (def.teamId === 'sau_alnassr') {
    baseClub = 'Al-Nassr FC';
    baseCountry = 'KSA';
    defaultAge = 40;
  } else if (def.teamId === 'sau_alhilal') {
    baseClub = 'Al-Hilal SFC';
    baseCountry = 'KSA';
    defaultAge = 33;
  } else if (def.teamId === 'sau_alshabab') {
    baseClub = 'Al-Shabab FC';
    baseCountry = 'KSA';
    defaultAge = 30;
  } else if (def.teamId === 'ita_inter') {
    baseClub = 'Inter Milan';
    baseCountry = 'ITA';
    defaultAge = def.id === 'unique_nico' ? 28 : def.id === 'unique_laucha_torito' ? 27 : 26;
  } else if (def.teamId === 'ita_milan') {
    baseClub = 'AC Milan';
    baseCountry = 'ITA';
    defaultAge = def.id === 'unique_magnifican' ? 29 : def.id === 'unique_lukic_modar' ? 39 : 26;
  } else if (def.teamId === 'ita_napoli') {
    baseClub = 'SSC Napoli';
    baseCountry = 'ITA';
    defaultAge = def.id === 'unique_keith_de_rooy' ? 34 : 28;
  } else if (def.teamId === 'ger_bayern') {
    baseClub = 'FC Bayern München';
    baseCountry = 'GER';
    defaultAge = def.id === 'unique_markus_neuner' ? 40 : def.id === 'unique_hurrikane' || def.id === 'unique_josh_kimmlin' || def.id === 'unique_leon_goretz' ? 31 : def.id === 'unique_jonas_dach' ? 30 : def.id === 'unique_luchito_semana' || def.id === 'unique_minjae_kimson' ? 29 : 24;
  } else if (def.teamId === 'ger_leverkusen') {
    baseClub = 'Bayer 04 Leverkusen';
    baseCountry = 'GER';
    defaultAge = def.id === 'unique_alejandro_grimaldi' ? 30 : 23;
  } else if (def.teamId === 'ger_dortmund') {
    baseClub = 'Borussia Dortmund';
    baseCountry = 'GER';
    defaultAge = def.id === 'unique_sergio_gurah' ? 30 : def.id === 'unique_gottfried_kofel' || def.id === 'unique_julian_ryrson' ? 28 : def.id === 'unique_nicolas_schlotter' ? 26 : 25;
  } else if (def.teamId === 'ger_leipzig') {
    baseClub = 'RB Leipzig';
    baseCountry = 'GER';
    defaultAge = def.id === 'unique_peter_gulacsi' ? 36 : def.id === 'unique_david_raumgard' ? 28 : 27;
  } else if (def.teamId === 'ger_stuttgart') {
    baseClub = 'VfB Stuttgart';
    baseCountry = 'GER';
    defaultAge = 28;
  } else if (def.teamId === 'por_porto') {
    baseClub = 'FC Porto';
    baseCountry = 'POR';
    defaultAge = def.id === 'unique_diego_costa' ? 26 : def.id === 'unique_jakub_kiwior' ? 26 : 25;
  } else if (def.teamId === 'por_sporting') {
    baseClub = 'Sporting CP';
    baseCountry = 'POR';
    defaultAge = def.id === 'unique_morten_hjulman' ? 27 : def.id === 'unique_pedro_goncalves' ? 28 : def.id === 'unique_francisco_trinc' ? 26 : def.id === 'unique_goncalo_inacio' ? 25 : 25;
  } else if (def.teamId === 'por_benfica') {
    baseClub = 'SL Benfica';
    baseCountry = 'POR';
    defaultAge = def.id === 'unique_fredrik_aursne' ? 30 : def.id === 'unique_vangelis_pavli' ? 27 : def.id === 'unique_anatoliy_trub' ? 25 : def.id === 'unique_yuri_sudakov' ? 23 : 22;
  } else if (def.teamId === 'por_braga') {
    baseClub = 'SC Braga';
    baseCountry = 'POR';
    defaultAge = 31;
  }

  return {
    ...(existingPlayer || {}),
    id: def.id,
    name: def.name,
    number: def.shirtNumber,
    shirtNumber: def.shirtNumber,
    ovr: def.ovr,
    potentialOvr: def.potentialOvr,
    age: def.id === 'unique_romualdo' ? 40 : existingPlayer?.age || defaultAge,
    club: existingPlayer?.club || baseClub,
    clubCountry: existingPlayer?.clubCountry || baseCountry,
    nationality: def.nationality,
    position: def.position,
    subPosition: def.subPosition,
    playStyle: def.playStyle,
    preferredFoot: def.id === 'unique_haal_norway' ? 'Left' : 'Right',
    weakFootStars: def.id === 'unique_kiki_mobutu' || def.id === 'unique_oussie_levoler' || def.id === 'unique_romualdo' ? 5 : 4,
    heightCm: def.heightCm,
    weightKg: def.weightKg,
    stats: {
      pro: def.statsOverride.pro,
      def: def.statsOverride.def,
      cre: def.statsOverride.cre,
      men: def.statsOverride.men,
      goa: def.statsOverride.goa,
      phy: def.statsOverride.phy,
      detailed: {
        ...(existingPlayer?.stats?.detailed || {}),
        ...def.statsOverride.detailed,
      },
    },
    biometrics: {
      skinColor:
        def.id === 'unique_haal_norway' || def.id === 'unique_rodi' || def.id === 'unique_declan_bread'
          ? '#f5d0b1'
          : def.id === 'unique_romualdo'
          ? '#e0ac69'
          : def.id === 'unique_salem_aldawsari' || def.id === 'unique_fahad_alshehri'
          ? '#c68642'
          : def.id === 'unique_emphies_detay'
          ? '#c68642'
          : '#78350f',
      hairStyle: def.id === 'unique_haal_norway' ? 'straight' : 'short',
      hairLength: def.id === 'unique_haal_norway' ? 'medium' : 'short',
      hairRoot: def.id === 'unique_haal_norway' ? '#eab308' : '#1c1917',
      hairDye: 'none',
      ...(existingPlayer?.biometrics || {}),
      strength: def.statsOverride.detailed.strength || (def.id === 'unique_haal_norway' ? 94 : 85),
    },
    accessories: {
      accessory: def.id === 'unique_emphies_detay' ? 'headband' : 'none',
      headbandColor: '#ffffff',
      ...(existingPlayer?.accessories || {}),
    },
    contract: def.id === 'unique_romualdo' ? {
      weeklyWage: 3846154,
      yearlySalary: 200000000,
      contractYears: 2,
      signingBonus: 25000000,
    } : undefined,
    isUniqueElite: true,
  } as PlayerCardData;
}

/**
 * Enforces the Global OVR Rule:
 * - Registered Unique Elite Players: 80–94 OVR
 * - Prime Legends (Iconic Parent cards): 95+ OVR
 * - South American non-unique players: Strictly capped <= 82 OVR (below Emphies Detay @ 84)
 * - Saudi Arabian local non-unique players: Strictly capped <= 78 OVR (except registered 80+ stars)
 * - European/Global non-unique players: Strictly capped <= 87 OVR
 */
export function applyGlobalOvrCap(player: PlayerCardData): PlayerCardData {
  if (!player) return player;

  const uniqueDef = getUniqueElitePlayerDef(player);
  if (uniqueDef) {
    return buildUniquePlayerCard(uniqueDef, player);
  }

  // Determine regional ceiling
  const isSouthAmerican =
    player.clubCountry === 'BRA' ||
    player.clubCountry === 'ARG' ||
    (player as any).leagueId?.includes('brazil') ||
    (player as any).leagueId?.includes('argentina') ||
    (player as any).leagueId?.includes('paulista') ||
    (player as any).leagueId?.includes('carioca');

  const isGermanyD2 = (player as any).leagueId === 'germany_d2' || ((player as any).leagueId?.includes('germany') && (player as any).leagueId?.includes('d2'));
  const isGermanyD1 = (player as any).leagueId === 'germany_d1' || (player.clubCountry === 'GER' && !isGermanyD2);

  const isPortugalD2 = (player as any).leagueId === 'portugal_d2' || ((player as any).leagueId?.includes('portugal') && (player as any).leagueId?.includes('d2'));
  const isPortugalD1 = (player as any).leagueId === 'portugal_d1' || (player.clubCountry === 'POR' && !isPortugalD2);

  const maxCap = isSouthAmerican ? 82 : isGermanyD2 ? 77 : isGermanyD1 ? 80 : isPortugalD2 ? 74 : isPortugalD1 ? 81 : 87;
  const currentOvr = player.ovr || 50;

  if (currentOvr <= maxCap && (player.potentialOvr || currentOvr) <= maxCap) {
    return player;
  }

  const cappedOvr = Math.min(maxCap, currentOvr);
  const cappedPotential = Math.min(maxCap, player.potentialOvr || cappedOvr);

  let updatedStats = player.stats;
  if (updatedStats && currentOvr > maxCap) {
    const factor = cappedOvr / currentOvr;
    updatedStats = {
      ...updatedStats,
      pro: Math.min(maxCap, Math.round(updatedStats.pro * factor)),
      def: Math.min(maxCap, Math.round(updatedStats.def * factor)),
      cre: Math.min(maxCap, Math.round(updatedStats.cre * factor)),
      men: Math.min(maxCap, Math.round(updatedStats.men * factor)),
      goa: Math.min(maxCap, Math.round(updatedStats.goa * factor)),
      phy: Math.min(maxCap, Math.round(updatedStats.phy * factor)),
    };
    if (updatedStats.detailed) {
      const newDetailed: Record<string, number> = {};
      Object.entries(updatedStats.detailed).forEach(([k, v]) => {
        if (typeof v === 'number') {
          newDetailed[k] = Math.min(maxCap, Math.round(v * factor));
        }
      });
      updatedStats.detailed = newDetailed as any;
    }
  }

  return {
    ...player,
    ovr: cappedOvr,
    potentialOvr: cappedPotential,
    stats: updatedStats,
  };
}

/**
 * Determines whether a unique elite player definition belongs strictly to a team,
 * preventing cross-country or cross-league contamination (e.g. Argentine Arsenal vs English Arsenal,
 * Ecuadorian Barcelona SC vs Spanish FC Barcelona, Brazilian Inter vs Italian Inter).
 */
export function isTeamMatchForUniqueDef(team: EditorTeamData, defTeamId: string): boolean {
  if (!team || !defTeamId) return false;
  const defTid = defTeamId.toLowerCase();
  const teamIdNorm = (team.id || '').toLowerCase();
  const teamNameNorm = (team.name || '').toLowerCase().trim();
  const country = (team.countryCode || '').toUpperCase().trim();
  const leagueId = (team.leagueId || '').toLowerCase().trim();

  // 1. Direct ID match
  if (teamIdNorm === defTid) return true;

  // 2. Strict country code and league guards
  if (defTid.startsWith('eng_')) {
    if (country !== 'ENG' && country !== 'GB' && country !== 'UK' && !leagueId.includes('england')) return false;
    if (defTid === 'eng_arsenal') {
      if (teamIdNorm === 'arg_arsenal' || teamNameNorm.includes('sarand') || country === 'ARG') return false;
      return teamNameNorm === 'arsenal' || teamNameNorm === 'arsenal fc' || teamNameNorm.includes('arsenal f');
    }
    if (defTid === 'eng_mancity') {
      return teamNameNorm.includes('manchester city') || teamNameNorm === 'man city' || teamNameNorm === 'manchester city fc';
    }
    if (defTid === 'eng_manutd') {
      return teamNameNorm.includes('manchester united') || teamNameNorm === 'man utd' || teamNameNorm === 'man united';
    }
    if (defTid === 'eng_liverpool') return teamNameNorm.includes('liverpool');
    if (defTid === 'eng_tottenham') return teamNameNorm.includes('tottenham') || teamNameNorm.includes('spurs');
    if (defTid === 'eng_chelsea') return teamNameNorm.includes('chelsea');
    if (defTid === 'eng_newcastle') return teamNameNorm.includes('newcastle');
    if (defTid === 'eng_astonvilla') return teamNameNorm.includes('aston villa') || teamNameNorm === 'villa';
    if (defTid === 'eng_westham') return teamNameNorm.includes('west ham') || teamNameNorm.includes('hammers');
    if (defTid === 'eng_brighton') return teamNameNorm.includes('brighton') || teamNameNorm.includes('albion');
    if (defTid === 'eng_everton') return teamNameNorm.includes('everton');
    if (defTid === 'eng_bournemouth') return teamNameNorm.includes('bournemouth') || teamNameNorm.includes('cherries');
    if (defTid === 'eng_nottingham') return teamNameNorm.includes('nottingham') || teamNameNorm.includes('forest');
    if (defTid === 'eng_palace') return teamNameNorm.includes('crystal palace') || teamNameNorm === 'palace';
    if (defTid === 'eng_brentford') return teamNameNorm.includes('brentford') || teamNameNorm.includes('bees');
  }

  if (defTid.startsWith('esp_')) {
    if (country !== 'ESP' && !leagueId.includes('spain')) return false;
    if (defTid === 'esp_barcelona') {
      if (teamIdNorm.includes('conmebol') || teamIdNorm.includes('ecu') || country === 'ECU' || teamNameNorm.includes('guayaquil') || teamNameNorm.includes('sc')) return false;
      return teamNameNorm === 'fc barcelona' || teamNameNorm === 'barcelona' || teamNameNorm === 'barça' || teamNameNorm === 'barca';
    }
    if (defTid === 'esp_realmadrid') {
      if (teamNameNorm.includes('sociedad') || teamNameNorm.includes('betis') || teamNameNorm.includes('valladolid')) return false;
      return teamNameNorm.includes('real madrid');
    }
    if (defTid === 'esp_atletico') return teamNameNorm.includes('atlético madrid') || teamNameNorm.includes('atletico madrid') || teamNameNorm === 'atlético de madrid' || teamNameNorm === 'atletico de madrid';
    if (defTid === 'esp_realsociedad') return teamNameNorm.includes('sociedad') || teamNameNorm.includes('la real');
    if (defTid === 'esp_athletic') return teamNameNorm.includes('athletic') || teamNameNorm.includes('bilbao');
    if (defTid === 'esp_realbetis') return teamNameNorm.includes('betis') || teamNameNorm.includes('balompié');
    if (defTid === 'esp_osasuna') return teamNameNorm.includes('osasuna') || teamNameNorm.includes('pamplona');
    if (defTid === 'esp_celta') return teamNameNorm.includes('celta') || teamNameNorm.includes('vigo');
  }

  if (defTid.startsWith('ita_')) {
    if (country !== 'ITA' && !leagueId.includes('italy')) return false;
    if (defTid === 'ita_inter') {
      if (teamIdNorm.includes('bra_') || country === 'BRA' || country === 'USA' || teamNameNorm.includes('porto alegre') || teamNameNorm.includes('miami')) return false;
      return teamNameNorm === 'inter' || teamNameNorm === 'internazionale' || teamNameNorm.includes('inter milan') || teamNameNorm.includes('fc internazionale');
    }
    if (defTid === 'ita_milan') {
      if (teamNameNorm.includes('inter')) return false;
      return teamNameNorm === 'ac milan' || teamNameNorm === 'milan' || teamNameNorm.includes('ac milan');
    }
    if (defTid === 'ita_napoli') return teamNameNorm.includes('napoli');
  }

  if (defTid.startsWith('ger_')) {
    if (country !== 'GER' && country !== 'DEU' && !leagueId.includes('germany')) return false;
    if (defTid === 'ger_bayern') return teamNameNorm.includes('bayern') || teamNameNorm.includes('münchen') || teamNameNorm.includes('munich');
    if (defTid === 'ger_leverkusen') return teamNameNorm.includes('leverkusen') || teamNameNorm.includes('bayer');
    if (defTid === 'ger_dortmund') return teamNameNorm.includes('dortmund') || teamNameNorm.includes('bvb');
    if (defTid === 'ger_leipzig') return teamNameNorm.includes('leipzig') || teamNameNorm.includes('rb');
    if (defTid === 'ger_stuttgart') return teamNameNorm.includes('stuttgart') || teamNameNorm.includes('vfb');
  }

  if (defTid.startsWith('por_')) {
    if (country !== 'POR' && country !== 'PRT' && !leagueId.includes('portugal')) return false;
    if (defTid === 'por_porto') return teamNameNorm.includes('porto') && !teamNameNorm.includes('sporting');
    if (defTid === 'por_sporting') return teamNameNorm.includes('sporting cp') || teamNameNorm === 'sporting' || teamNameNorm.includes('sporting clube');
    if (defTid === 'por_benfica') return teamNameNorm.includes('benfica') || teamNameNorm.includes('sl benfica');
    if (defTid === 'por_braga') return teamNameNorm.includes('braga') || teamNameNorm.includes('sc braga');
  }

  if (defTid.startsWith('sau_')) {
    if (country !== 'SAU' && country !== 'KSA' && !leagueId.includes('saudi')) return false;
    if (defTid === 'sau_alnassr') return teamNameNorm.includes('al-nassr') || teamNameNorm.includes('alnassr') || teamNameNorm.includes('nassr');
    if (defTid === 'sau_alhilal') return teamNameNorm.includes('al-hilal') || teamNameNorm.includes('alhilal') || teamNameNorm.includes('hilal');
    if (defTid === 'sau_alshabab') return teamNameNorm.includes('al-shabab') || teamNameNorm.includes('alshabab') || teamNameNorm.includes('shabab');
  }

  if (defTid.startsWith('bra_')) {
    if (country !== 'BRA' && !leagueId.includes('brazil')) return false;
    if (defTid === 'bra_corinthians') return teamNameNorm.includes('corinthians');
  }

  return false;
}

/**
 * Enforces registered Unique Elite Players directly on the target team squad
 * without creating duplicate players, purges any foreign unique players,
 * and caps all non-unique players.
 */
export function enforceUniqueElitePlayersForTeam(team: EditorTeamData): EditorTeamData {
  if (!team || !team.squadSaveFile) return team;

  // Find all unique players that genuinely belong to this specific team
  const teamUniqueDefs = UNIQUE_ELITE_PLAYERS_REGISTRY.filter((u) => isTeamMatchForUniqueDef(team, u.teamId));

  const saveFile = { ...team.squadSaveFile };
  const groupKeys: (keyof TeamSquadSaveFile)[] = ['squad', 'reserves', 'u20', 'u17'];

  // 1. Purge any foreign unique elite players that do NOT belong to this team across all groups
  groupKeys.forEach((gk) => {
    if (Array.isArray(saveFile[gk])) {
      saveFile[gk] = saveFile[gk].map((slot) => {
        if (!slot || !slot.player) return slot;
        const uDef = getUniqueElitePlayerDef(slot.player);
        if (uDef) {
          const belongs = teamUniqueDefs.some((d) => d.id === uDef.id);
          if (!belongs) {
            // Replace foreign player with authentic standard player for this club
            const baseOvr = team.overallRating ? Math.min(team.overallRating, 74) : 70;
            return {
              ...slot,
              player: {
                ...slot.player,
                id: `player_${team.id || 'team'}_${gk}_slot${slot.slotNumber}_auth_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                name: `${team.shortName || team.name || 'Club'} Player #${slot.slotNumber}`,
                number: slot.slotNumber,
                subPosition: slot.player.subPosition || 'CM',
                position: slot.player.position || 'MID',
                ovr: baseOvr,
                potentialOvr: baseOvr + 4,
                isUniqueElite: false,
              },
            };
          }
        }
        return slot;
      });
    }
  });

  // 2. Process main squad slots to place/update genuine unique players without duplicating
  if (teamUniqueDefs.length > 0 && Array.isArray(saveFile.squad)) {
    const squadSlots = [...saveFile.squad];

    teamUniqueDefs.forEach((def) => {
      // Check if player already exists in squad
      let existingIndex = squadSlots.findIndex((s) => s.player && getUniqueElitePlayerDef(s.player)?.id === def.id);

      if (existingIndex === -1) {
        // Match by shirt number or position
        existingIndex = squadSlots.findIndex(
          (s) => s.player && (s.player.number === def.shirtNumber || s.slotNumber === def.shirtNumber)
        );
      }

      if (existingIndex === -1) {
        // Match by subPosition
        existingIndex = squadSlots.findIndex(
          (s) => s.player && s.player.subPosition === def.subPosition
        );
      }

      if (existingIndex === -1) {
        // Fallback to first available non-unique slot
        existingIndex = squadSlots.findIndex((s) => s.player && !isUniqueElitePlayer(s.player));
      }

      if (existingIndex !== -1 && squadSlots[existingIndex]) {
        const existingPlayer = squadSlots[existingIndex].player;
        squadSlots[existingIndex] = {
          ...squadSlots[existingIndex],
          player: buildUniquePlayerCard(def, existingPlayer),
        };
      }
    });

    // Remove any duplicate unique players in other slots
    const seenUniqueIds = new Set<string>();
    squadSlots.forEach((s, idx) => {
      if (s.player) {
        const uDef = getUniqueElitePlayerDef(s.player);
        if (uDef) {
          if (seenUniqueIds.has(uDef.id)) {
            // Duplicate found! Replace with standard authentic player
            const baseOvr = team.overallRating ? Math.min(team.overallRating, 74) : 70;
            squadSlots[idx] = {
              ...s,
              player: {
                ...s.player,
                id: `player_${team.id || 'team'}_squad_slot${s.slotNumber}_auth_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                name: `${team.shortName || team.name || 'Club'} Player #${s.slotNumber}`,
                number: s.slotNumber,
                subPosition: s.player.subPosition || 'CM',
                position: s.player.position || 'MID',
                ovr: baseOvr,
                potentialOvr: baseOvr + 4,
                isUniqueElite: false,
              },
            };
          } else {
            seenUniqueIds.add(uDef.id);
          }
        }
      }
    });

    saveFile.squad = squadSlots;
  }

  // 3. Cap all non-unique players across all groups to regional ceilings
  groupKeys.forEach((gk) => {
    if (Array.isArray(saveFile[gk])) {
      saveFile[gk] = saveFile[gk].map((slot) => {
        if (!slot || !slot.player) return slot;
        return {
          ...slot,
          player: applyGlobalOvrCap(slot.player),
        };
      });
    }
  });

  return {
    ...team,
    squadSaveFile: saveFile,
  };
}
