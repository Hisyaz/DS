import { PlayerCardData } from '../types';
import { CustomCard, CustomCardCategory, CustomCardTier } from '../types';
import { LeagueData, EditorTeamData, ManagerData, ManagerTacticConfig } from './leagueEditor';
import { CompetitionData } from './competitionEditor';

export interface OptionFileManagerProfile {
  id: string; // Permanent unique ManagerID
  name: string;
  nationality: string;
  age?: number;
  currentTeamId?: string;
  preferredFormation: string;
  tacticalStyle: string;
  reputation: number; // 0-100
  experience: number; // years
  primaryTactic?: ManagerTacticConfig;
  secondaryTactic?: ManagerTacticConfig;
  agentTier?: 'bronze' | 'silver' | 'gold' | 'legendary' | 'iconic';
}

export interface OptionFileMetadata {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  schemaVersion: number;
  createdAt: string;
  lastUpdated: string;
  gameVersion: string;
}

/**
 * The Option File is the single source of truth for all editable game content.
 * It contains every piece of game data that can be created, edited, saved, imported, exported, or used by the game.
 */
export interface OptionFile {
  metadata: OptionFileMetadata;
  players: Record<string, PlayerCardData>; // PlayerID -> PlayerCardData
  teams: Record<string, EditorTeamData>;    // TeamID -> EditorTeamData
  competitions: Record<string, CompetitionData>; // CompetitionID -> CompetitionData
  leagues: Record<string, LeagueData>;     // LeagueID -> LeagueData
  cards: Record<string, CustomCard>;       // CardID -> CustomCard
  managers: Record<string, OptionFileManagerProfile>; // ManagerID -> OptionFileManagerProfile
}

export interface OptionFileValidationIssue {
  type: 'error' | 'warning';
  entityType: 'player' | 'team' | 'competition' | 'league' | 'card' | 'manager' | 'metadata';
  entityId: string;
  message: string;
}

export interface OptionFileValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  issues: OptionFileValidationIssue[];
  stats: {
    totalPlayers: number;
    totalTeams: number;
    totalCompetitions: number;
    totalLeagues: number;
    totalCards: number;
    totalManagers: number;
    cardsByCategory: Record<string, number>;
  };
}
