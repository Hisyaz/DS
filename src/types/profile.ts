export type ProfileAvatarColor = 'red' | 'blue' | 'yellow' | 'white' | 'black';

export interface ProfileColorConfig {
  id: ProfileAvatarColor;
  label: string;
  bgHex: string;
  borderHex: string;
  textHex: string;
  glowHex: string;
}

export const PROFILE_COLORS: Record<ProfileAvatarColor, ProfileColorConfig> = {
  red: {
    id: 'red',
    label: 'Red',
    bgHex: '#ef4444',
    borderHex: '#fca5a5',
    textHex: '#ffffff',
    glowHex: 'rgba(239, 68, 68, 0.5)',
  },
  blue: {
    id: 'blue',
    label: 'Blue',
    bgHex: '#3b82f6',
    borderHex: '#93c5fd',
    textHex: '#ffffff',
    glowHex: 'rgba(59, 130, 246, 0.5)',
  },
  yellow: {
    id: 'yellow',
    label: 'Yellow',
    bgHex: '#eab308',
    borderHex: '#fef08a',
    textHex: '#0f172a',
    glowHex: 'rgba(234, 179, 8, 0.5)',
  },
  white: {
    id: 'white',
    label: 'White',
    bgHex: '#f8fafc',
    borderHex: '#cbd5e1',
    textHex: '#0f172a',
    glowHex: 'rgba(255, 255, 255, 0.6)',
  },
  black: {
    id: 'black',
    label: 'Black',
    bgHex: '#090d16',
    borderHex: '#facc15',
    textHex: '#facc15',
    glowHex: 'rgba(250, 204, 21, 0.35)',
  },
};

export interface UserProfileSettings {
  fontSize?: string;
  colorblindMode?: string;
  quality?: string;
}

export interface UserProfileTutorials {
  tutorialEnabled: boolean;
  seenTutorials: string[];
  storeTutorialCompleted?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  avatarColor: ProfileAvatarColor;
  createdAt: string;
  updatedAt: string;
  selectedLanguage: string; // e.g. 'en-GB' | 'es-AR'
  settings?: UserProfileSettings;
  tutorials?: UserProfileTutorials;
  credits?: number;
  cardCollection?: Record<string, number>;
  newCardQueues?: Record<string, string[]>;
  purchasedOneTimePacks?: string[];
  optionFile?: any;
  saveFiles?: Record<string, any>;
}

export interface ProfileExportData {
  formatVersion: '1.0';
  app: 'DrawStar Career Simulation';
  exportedAt: string;
  profile: UserProfile;
}
