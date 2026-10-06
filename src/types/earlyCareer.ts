export type EarlyCareerChoiceType =
  | 'travel_big_club'
  | 'join_local'
  | 'play_streets'
  | 'tryout_pro'
  | 'speak_agent'
  | 'look_agent';

export interface EarlyCareerOption {
  id: EarlyCareerChoiceType;
  title: string;
  subtitle: string;
  description: string;
  benefits: string[];
  drawbacks: string[];
  badgeText: string;
  badgeColor: string;
  iconName: string;
  warningNote?: string;
}

export interface YouthLeagueTeamChoice {
  id: string;
  name: string;
  ovrRating: number;
  isTopHalf: boolean;
  city: string;
  country?: string;
  divisionName: string;
}
